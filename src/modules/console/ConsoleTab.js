// src/modules/console/ConsoleTab.js

window.MyDevTool = window.MyDevTool || {};
window.MyDevTool.ConsoleTab = (function () {

  // -----------------------
  // Internal state
  // -----------------------
  let SVGs = null;
  let container = null;
  let root = null; 
  let logArea = null;
  let settingsPopup = null;
  let currentFilter = 'all';

  // Module references
  let ConsoleEngine = null;
  let ConsoleLog = null;
  let ConsoleInput = null;
  let ConsoleNetwork = null;
  let SecureStorage = null; 

  // Settings Defaults
  const defaultSettings = {
    preserveLog: false,
    logXHR: false,
    eagerEvaluation: false,
    autocompleteFromHistory: true,
    treatEvalAsUserAction: false,
    selectedContextOnly: false,
    groupSimilar: true,
    showCORS: true
  };
  
  let settings = { ...defaultSettings };

  // -----------------------
  // Init
  // -----------------------
  function init(containerEl, shadowRoot) {
    container = containerEl;
    root = shadowRoot || document;
    
    window.MyDevTool.root = root;
    
    SVGs = window.MyDevTool.SVGs;
    SecureStorage = window.MyDevTool.SecureStorage; 
    
    settings = loadSettings();

    ConsoleEngine = window.MyDevTool.ConsoleEngine;
    ConsoleLog = window.MyDevTool.ConsoleLog;
    ConsoleInput = window.MyDevTool.ConsoleInput;
    ConsoleNetwork = window.MyDevTool.ConsoleNetwork;

    if (!ConsoleEngine || !ConsoleLog || !ConsoleInput || !ConsoleNetwork) {
      console.error('[console] not loaded modules');
      return;
    }

    buildUI();
    attachListeners();
    initSidebarResizer(); 
    
    ConsoleLog.init((node, scroll) => {
        printLine(node, scroll);
        updateSidebarCounts();
    }, getSettings);

    ConsoleEngine.init(ConsoleLog.addMessage);
    ConsoleInput.init(logArea, getSettings, ConsoleEngine, ConsoleLog, clearConsole);
    ConsoleNetwork.init(ConsoleLog.addMessage, getSettings);

    if (settings.preserveLog) {
      const stored = localStorage.getItem('mydevtool_console_log');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          ConsoleLog.restoreMessages(parsed);
        } catch (e) { /* ignore */ }
      }
    }
    
    if (ConsoleLog.getMessageCount() === 0) {
      ConsoleInput.createNewInputLine();
    }

    if (settings.logXHR) ConsoleNetwork.enableNetworkLogging();
    
    updateSidebarActive('sb-all');
    updateSidebarCounts();

    if (window.__dt_early_logs && window.__dt_early_logs.length > 0) {
        ConsoleEngine.ingestEarlyLogs(window.__dt_early_logs, ConsoleLog.addMessage);
        window.__dt_early_logs = []; 
        updateSidebarCounts(); 
    }
  }

  // -----------------------
  // UI builder
  // -----------------------
  function buildUI() {
    const i18n = window.MyDevTool.LanguageManager;
    
    container.innerHTML = `
      <div class="console-toolbar">
        <button class="console-toolbar-btn" id="console-sidebar-toggle" title="${i18n.t('console.toolbar.sidebar_toggle')}">${SVGs.sidebarSVG}</button>
        <div class="console-toolbar-separator"></div>
        <button class="console-toolbar-btn" id="console-clear-btn" title="${i18n.t('console.toolbar.clear_console')}">${SVGs.clearSVG}</button>
        <button class="console-toolbar-btn" id="console-eye-btn" title="${i18n.t('console.toolbar.toggle_expressions')}">${SVGs.eyeSVG}</button>
        <input type="text" class="console-filter-input" id="console-search" placeholder="${i18n.t('console.toolbar.filter_placeholder')}">
        <button class="console-toolbar-btn" id="console-settings-btn" title="${i18n.t('console.toolbar.settings')}">${SVGs.settingsSVG}</button>
      </div>

      <div class="expression-bar" id="expression-bar" style="display:none;">
        <input id="expression-input" placeholder="${i18n.t('console.expression.placeholder')}" />
        <button id="expression-close" title="${i18n.t('console.expression.close')}">${SVGs.close}</button>
        <div id="expression-preview" style="display:none;" class="expression-preview"></div>
      </div>
      

      <div class="console-body-wrapper">
        <div class="console-sidebar" id="console-sidebar">
           <div class="console-sidebar-item" id="sb-all">
             <span>${i18n.t('console.sidebar.all_messages') || 'All'}</span>
             <span class="console-sidebar-count">0</span>
           </div>
           <div class="console-sidebar-item" id="sb-user">
             <span>${i18n.t('console.sidebar.user_messages') || 'User'}</span>
             <span class="console-sidebar-count">0</span>
           </div>
           <div class="console-sidebar-item" id="sb-errors">
             <span>${i18n.t('console.sidebar.errors') || 'Errors'}</span>
             <span class="console-sidebar-count">0</span>
           </div>
           <div class="console-sidebar-item" id="sb-warnings">
             <span>Warnings</span>
             <span class="console-sidebar-count">0</span>
           </div>
           <div class="console-sidebar-item" id="sb-info">
             <span>Info</span>
             <span class="console-sidebar-count">0</span>
           </div>
           <div class="console-sidebar-item" id="sb-table">
             <span>Table</span>
             <span class="console-sidebar-count">0</span>
           </div>
           <div class="console-sidebar-resizer"></div>
        </div>

        <div class="console-log-area" id="console-log-area"></div>
      </div>

      <div class="console-settings-popup" id="console-settings-popup">
        <div><label><input type="checkbox" id="setting-preserve"> ${i18n.t('console.settings.preserve_log')}</label></div>
        <div><label><input type="checkbox" id="setting-logxhr"> ${i18n.t('console.settings.log_xhr')}</label></div>
        <div><label><input type="checkbox" id="setting-eager"> ${i18n.t('console.settings.eager_eval')}</label></div>
        <div><label><input type="checkbox" id="setting-autocomplete"> ${i18n.t('console.settings.autocomplete')}</label></div>
        <div><label><input type="checkbox" id="setting-treatuser"> ${i18n.t('console.settings.treat_eval_user')}</label></div>
        <div><label><input type="checkbox" id="setting-selected-context"> ${i18n.t('console.settings.selected_context')}</label></div>
        <div style="display:none;"><label><input type="checkbox" id="setting-group-similar"> ${i18n.t('console.settings.group_similar')}</label></div>
        <div style="display:none;"><label><input type="checkbox" id="setting-show-cors"> ${i18n.t('console.settings.show_cors')}</label></div>
      </div>
    `;

    logArea = root.querySelector('#console-log-area');
    settingsPopup = root.querySelector('#console-settings-popup');
    
    root.querySelector('#setting-preserve').checked = !!settings.preserveLog;
    root.querySelector('#setting-logxhr').checked = !!settings.logXHR;
    root.querySelector('#setting-eager').checked = !!settings.eagerEvaluation;
    root.querySelector('#setting-autocomplete').checked = !!settings.autocompleteFromHistory;
    root.querySelector('#setting-treatuser').checked = !!settings.treatEvalAsUserAction;
    root.querySelector('#setting-selected-context').checked = !!settings.selectedContextOnly;
    root.querySelector('#setting-group-similar').checked = !!settings.groupSimilar;
    root.querySelector('#setting-show-cors').checked = !!settings.showCORS;
  }

  // -----------------------
  // Event listeners
  // -----------------------
  
  function attachListeners() {
    
    const handleContextMenu = (e, clientX, clientY, isTouch = false) => {
      if (e.cancelable && e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();

      let targetEl = null;

      if (e.composedPath) {
          const path = e.composedPath();
          if (path && path.length > 0) {
              targetEl = path[0]; 
          }
      }

      if (!targetEl && root && root.elementFromPoint && clientX && clientY) {
          targetEl = root.elementFromPoint(clientX, clientY);
      }

      if (!targetEl && clientX && clientY) {
          targetEl = document.elementFromPoint(clientX, clientY);
      }
      
      if (!targetEl) targetEl = e.target;

      if (targetEl && targetEl.nodeType === 3) {
          targetEl = targetEl.parentElement;
      }

      if (isTouch && navigator.vibrate) {
          try { navigator.vibrate(50); } catch(e){}
      }

      const targetLine = targetEl.closest('.console-line') || 
                         targetEl.closest('.console-block-wrapper') || 
                         targetEl.closest('.console-input-line');
                         
      const isLogArea = targetEl.closest('.console-log-area');

      const selectionObj = window.getSelection(); 
      let selectedText = "";
      if (selectionObj && selectionObj.toString()) {
          selectedText = selectionObj.toString();
      } else if (root.getSelection) {
          const shadowSel = root.getSelection();
          if (shadowSel) selectedText = shadowSel.toString();
      }
      const hasSelection = selectedText && selectedText.length > 0;

      if (!targetLine && !hasSelection && !isLogArea) return;

      const menuOptions = [];

      // Filter Top-Level Objects Only (Prevents Duplicate Children in JSON Copy)
      const allObjNodes = targetLine ? Array.from(targetLine.querySelectorAll('[data-copy-obj]')) : [];
      const objNodes = allObjNodes.filter(node => {
          let p = node.parentElement;
          while (p && p !== targetLine) {
              if (p.hasAttribute('data-copy-obj')) return false; // Ignore if it's inside another object
              p = p.parentElement;
          }
          return true;
      });
      const hasObject = objNodes.length > 0;

      if (hasSelection) {
          menuOptions.push({ label: 'Copy Selected Text', callback: () => copyToClipboard(selectedText) });
          
          if (window.acode || isTouch) { 
              menuOptions.push({ type: 'separator' });
              
              if (targetLine) {
                  menuOptions.push({
                      label: 'Copy This Session',
                      sub: [
                        { label: 'Copy Input + Outputs', callback: () => copySmartSession(targetLine, true) },
                        { label: 'Copy Outputs Only', callback: () => copySmartSession(targetLine, false) },
                        { label: 'Copy This Element', callback: () => copySingleElement(targetLine) }
                      ]
                  });
              }
              
              menuOptions.push({ label: 'Copy This', callback: () => copySingleElement(targetLine)});
              
              if (hasObject) menuOptions.push({ label: 'Copy Object (JSON)', callback: () => { const texts = objNodes.map(n => n.getAttribute('data-copy-obj')).filter(Boolean); copyToClipboard(texts.join('\\n\\n')); } });
            
              menuOptions.push({ type: 'separator' });
              
              menuOptions.push({ label: 'Copy All Logs', callback: () => copyAllLogs(true) });
              menuOptions.push({ label: 'Clear All', callback: () => clearConsole() });
          } else {
              menuOptions.push({ type: 'separator' });
              menuOptions.push({ label: 'Clear All', callback: () => clearConsole() });
          }
      } 
      else {
          if (hasObject) {
              menuOptions.push({ 
                  label: 'Copy Object (JSON)', 
                  callback: () => {
                      const texts = objNodes.map(n => n.getAttribute('data-copy-obj')).filter(Boolean);
                      copyToClipboard(texts.join('\\n\\n'));
                  }
              });
          }
        
          menuOptions.push(
            { label: 'Copy All Logs', callback: () => copyAllLogs(true) },
            { 
              label: 'Copy This Session', 
              sub: [
                { label: 'Copy This', callback: () => copySingleElement(targetLine) },
                { label: 'Copy Outputs Only', callback: () => copySmartSession(targetLine, false) },
                { label: 'Copy Input + Outputs', callback: () => copySmartSession(targetLine, true) },
              ]
            },
            { label: 'Copy All Outputs Only', callback: () => copyAllLogs(false) },
            { type: 'separator' },
            { label: 'Clear All', callback: () => clearConsole() }
          );
      }

      const evtMock = {
          clientX: clientX || 0,
          clientY: clientY || 0,
          target: targetEl,
          preventDefault: () => {},
          stopPropagation: () => {}
      };

      if (window.MyDevTool.ContextMenu) {
          window.MyDevTool.ContextMenu.show(evtMock, menuOptions);
      }
    };

    // --- MOUSE ---
    logArea.addEventListener('contextmenu', (e) => {
       handleContextMenu(e, e.clientX, e.clientY, false);
    });

    // --- TOUCH ---
    let touchTimer = null;
    let touchStartLocation = null;
    let isLongPress = false;

    logArea.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            touchStartLocation = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            isLongPress = false;
            touchTimer = setTimeout(() => {
                isLongPress = true;
                handleContextMenu(e, touchStartLocation.x, touchStartLocation.y, true);
                touchTimer = null; 
            }, 600); 
        }
    }, { passive: false });

    logArea.addEventListener('touchend', (e) => {
        if (touchTimer) { clearTimeout(touchTimer); touchTimer = null; }
        if (isLongPress) {
            if(e.cancelable) e.preventDefault();
            e.stopPropagation();
        }
    });

    logArea.addEventListener('touchmove', (e) => {
        if (touchStartLocation) {
            const moveX = Math.abs(e.touches[0].clientX - touchStartLocation.x);
            const moveY = Math.abs(e.touches[0].clientY - touchStartLocation.y);
            if (moveX > 10 || moveY > 10) {
                if (touchTimer) clearTimeout(touchTimer);
                touchTimer = null;
            }
        }
    });
    
    // UI Event Listeners
    root.querySelector('#console-sidebar-toggle').onclick = () => { root.querySelector('#console-sidebar').classList.toggle('open'); };
    root.querySelector('#console-clear-btn').onclick = clearConsole;
    root.querySelector('#console-eye-btn').onclick = () => {
      const expressionBar = root.querySelector('#expression-bar');
      const visible = expressionBar.style.display !== 'none';
      expressionBar.style.display = visible ? 'none' : 'flex';
      if (!visible) root.querySelector('#expression-input').focus();
    };
    root.querySelector('#expression-close').onclick = () => {
      root.querySelector('#expression-bar').style.display = 'none';
    };
    root.querySelector('#console-settings-btn').onclick = (e) => {
      settingsPopup.classList.toggle('show');
    };

    // Settings Listeners
    root.querySelector('#setting-preserve').addEventListener('change', (e) => {
      settings.preserveLog = e.target.checked;
      saveSettings();
      if (!settings.preserveLog) { localStorage.removeItem('mydevtool_console_log'); }
    });
    root.querySelector('#setting-logxhr').addEventListener('change', (e) => {
      settings.logXHR = e.target.checked;
      saveSettings();
      if (settings.logXHR) ConsoleNetwork.enableNetworkLogging(); else ConsoleNetwork.disableNetworkLogging();
    });
    root.querySelector('#setting-eager').addEventListener('change', (e) => { settings.eagerEvaluation = e.target.checked; saveSettings(); });
    root.querySelector('#setting-autocomplete').addEventListener('change', (e) => { settings.autocompleteFromHistory = e.target.checked; saveSettings(); });
    root.querySelector('#setting-treatuser').addEventListener('change', (e) => { settings.treatEvalAsUserAction = e.target.checked; saveSettings(); });
    root.querySelector('#setting-selected-context').addEventListener('change', (e) => { settings.selectedContextOnly = e.target.checked; saveSettings(); });
    root.querySelector('#setting-group-similar').addEventListener('change', (e) => { settings.groupSimilar = e.target.checked; saveSettings(); });
    root.querySelector('#setting-show-cors').addEventListener('change', (e) => { settings.showCORS = e.target.checked; saveSettings(); });
    
    // Filters - Search Input
    root.querySelector('#console-search').addEventListener('input', () => applyViewFilters());

    // Filters - Sidebar Click Handlers
    root.querySelector('#sb-all').addEventListener('click', () => setFilter('all'));
    root.querySelector('#sb-user').addEventListener('click', () => setFilter('user'));
    root.querySelector('#sb-errors').addEventListener('click', () => setFilter('error'));
    root.querySelector('#sb-warnings').addEventListener('click', () => setFilter('warn'));
    root.querySelector('#sb-info').addEventListener('click', () => setFilter('info'));
    root.querySelector('#sb-table').addEventListener('click', () => setFilter('table'));

    logArea.addEventListener('click', (e) => {
      if (e.target === logArea) { 
        ConsoleInput.focusActiveInput();
      }
    });

    container.addEventListener('keydown', handleConsoleKeyDown);
    
    root.querySelector('#expression-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const code = e.target.value;
            if (code.trim()) ConsoleEngine.evaluate(code);
        } else if (settings.eagerEvaluation) {
            ConsoleInput.scheduleEagerEvaluation(e.target.value, root.querySelector('#expression-preview'));
        }
    });
  }
  
  // -----------------------
  // UI Functions
  // -----------------------

  function printLine(nodeToAppend, shouldScroll = true) {
      if (!nodeToAppend.parentNode) {
          const currentInput = root.querySelector('.console-active-input-wrapper');
          if (currentInput) {
              logArea.insertBefore(nodeToAppend, currentInput);
          } else {
              logArea.appendChild(nodeToAppend);
          }
      }
      if (shouldScroll) scrollToBottom();
  }
  
  function clearConsole() {
    logArea.innerHTML = '';
    ConsoleLog.clearLogs();
    
    if (settings.preserveLog) {
      localStorage.setItem('mydevtool_console_log', JSON.stringify([]));
    } else {
      localStorage.removeItem('mydevtool_console_log');
    }
    
    ConsoleInput.createNewInputLine();
    
    // Prevent keyboard from popping up on mobile
    setTimeout(() => {
        const activeInput = root.querySelector('.console-active-input');
        if (activeInput) activeInput.blur();
        if (root.activeElement && root.activeElement.blur) root.activeElement.blur();
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    }, 10);

    updateSidebarCounts(); 
  }

  function setFilter(filter) {
      currentFilter = filter;
      let activeId = 'sb-' + filter;
      if (filter === 'warn') activeId = 'sb-warnings';
      
      updateSidebarActive(activeId);
      applyViewFilters();
  }

  function updateSidebarCounts() {
      const counts = ConsoleLog.getCounts(); 
      const sidebar = root.querySelector('#console-sidebar');
      if (!sidebar) return;
      
      const setVal = (id, val) => {
          const el = sidebar.querySelector(`#${id} .console-sidebar-count`);
          if (el) el.textContent = val;
      };

      setVal('sb-all', counts.all);
      setVal('sb-user', counts.user);
      setVal('sb-errors', counts.error);
      setVal('sb-warnings', counts.warn);
      setVal('sb-info', counts.info);
      setVal('sb-table', counts.table);
  }

  function applyViewFilters() {
    const searchInput = root.querySelector('#console-search');
    if (!searchInput) return;
    
    const search = (searchInput.value || '').toLowerCase().trim();
    const messages = ConsoleLog.getMessages();

    messages.forEach(msg => {
        const node = logArea.querySelector(`[data-msg-id="${msg.id}"]`);
        if (!node) return;

        const txt = (msg.sig || '').toLowerCase();
        const t = msg.type || '';
        
        let matchType = true;
        if (currentFilter !== 'all') {
            if (currentFilter === 'user') matchType = t.includes('console-input-line');
            else if (currentFilter === 'error') matchType = t.includes('error');
            else if (currentFilter === 'warn') matchType = t.includes('warn');
            else if (currentFilter === 'table') matchType = t === 'table';
            else if (currentFilter === 'info') {
                matchType = !t.includes('error') && !t.includes('warn') && !t.includes('input') && t !== 'table' && t !== 'group';
            }
        }
        
        // Text match logic
        const matchSearch = search === '' || txt.indexOf(search) !== -1;
        
        // Display update
        node.style.display = (matchType && matchSearch) ? '' : 'none';
    });
  }

  function initSidebarResizer() {
      const resizer = root.querySelector('.console-sidebar-resizer');
      const sidebar = root.querySelector('#console-sidebar');
      if (!resizer || !sidebar) return;

      let startX, startWidth;

      const onStart = (clientX) => {
          startX = clientX;
          startWidth = parseInt(window.getComputedStyle(sidebar).width, 10);
          document.body.style.cursor = 'col-resize';
          sidebar.classList.add('resizing');
      };

      const onMove = (clientX) => {
          const newWidth = startWidth + (clientX - startX);
          if (newWidth > 140 && newWidth < 400) {
              sidebar.style.width = `${newWidth}px`;
          }
      };

      const onEnd = () => {
          document.body.style.cursor = '';
          sidebar.classList.remove('resizing');
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          window.removeEventListener('touchmove', onTouchMove);
          window.removeEventListener('touchend', onTouchEnd);
      };

      const onMouseMove = (e) => onMove(e.clientX);
      const onMouseUp = () => onEnd();

      resizer.addEventListener('mousedown', (e) => {
          e.preventDefault();
          onStart(e.clientX);
          window.addEventListener('mousemove', onMouseMove);
          window.addEventListener('mouseup', onMouseUp);
      });

      const onTouchMove = (e) => onMove(e.touches[0].clientX);
      const onTouchEnd = () => onEnd();

      resizer.addEventListener('touchstart', (e) => {
          e.preventDefault();
          onStart(e.touches[0].clientX);
          window.addEventListener('touchmove', onTouchMove);
          window.addEventListener('touchend', onTouchEnd);
      });
  }

  function updateSidebarActive(activeId) {
    root.querySelectorAll('.console-sidebar-item').forEach(item => item.classList.remove('active'));
    root.querySelector('#' + activeId)?.classList.add('active');
  }

  function scrollToBottom() {
    if (!logArea) return;
    logArea.scrollTop = logArea.scrollHeight;
  }

  function loadSettings() {
    if (!SecureStorage) return { ...defaultSettings };
    const storedSettings = SecureStorage.getItem('console_settings');
    if (storedSettings) { return { ...defaultSettings, ...storedSettings }; }
    return { ...defaultSettings };
  }

  function saveSettings() {
    if (!SecureStorage) return;
    SecureStorage.setItem('console_settings', settings);
  }

  function handleConsoleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      clearConsole();
      return;
    }
  }
  
  function copySmartSession(targetLine, includeInput) {
    if (!targetLine) return;
    let startNode = targetLine;
    while (startNode && !startNode.classList.contains('console-input-line')) {
        startNode = startNode.previousElementSibling;
    }
    if (!startNode) startNode = targetLine;

    let textToCopy = "";
    let currentNode = startNode;

    while (currentNode) {
        if (currentNode.classList.contains('console-active-input-wrapper')) break;
        if (currentNode !== startNode && currentNode.classList.contains('console-input-line')) { break; }

        if (currentNode.classList.contains('console-input-line')) {
            if (includeInput) {
                const codeEl = currentNode.querySelector('.console-input-code');
                const code = codeEl ? codeEl.innerText : currentNode.textContent.replace('>', '');
                textToCopy += `> ${code.trim()}\n`;
            }
        } 
        else if (currentNode.classList.contains('console-line') || currentNode.classList.contains('console-block-wrapper')) {
            textToCopy += getCleanText(currentNode) + "\n";
        }
        currentNode = currentNode.nextElementSibling;
    }
    copyToClipboard(textToCopy.trim()); 
  }

  function copySingleElement(targetLine) {
      if (!targetLine) return;
      let textToCopy = "";
      if (targetLine.classList.contains('console-input-line')) {
          const codeEl = targetLine.querySelector('.console-input-code');
          textToCopy = (codeEl ? codeEl.innerText : targetLine.textContent.replace('>', '')).trim();
      } else {
          textToCopy = getCleanText(targetLine);
      }
      copyToClipboard(textToCopy);
  }

  function copyAllLogs(withInput) {
     const allNodes = Array.from(logArea.children);
     let fullText = "";
     allNodes.forEach(node => {
        if (node.classList.contains('console-active-input-wrapper')) return;
        if (node.classList.contains('console-input-line')) {
            if (withInput) {
                const codeEl = node.querySelector('.console-input-code');
                const code = codeEl ? codeEl.innerText : node.textContent.replace('>', '');
                fullText += `> ${code.trim()}\n`;
            }
        } 
        else if (node.classList.contains('console-line')) {
            fullText += getCleanText(node) + "\n";
        }
     });
     copyToClipboard(fullText.trim());
  }

  function getCleanText(node) {
     const clone = node.cloneNode(true);
     const source = clone.querySelector('.console-source-link');
     if (source) source.remove();
     const badge = clone.querySelector('.console-group-count');
     if (badge) badge.remove();
     let text = clone.innerText.trimEnd(); 
     if (!text.startsWith('<')) { text = "< " + text; }
     return text;
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(err => fallbackCopy(text));
    } else { fallbackCopy(text); }
  }

  function fallbackCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; textArea.style.left = "-9999px"; textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus(); textArea.select();
    try { document.execCommand('copy'); } catch (err) { }
    document.body.removeChild(textArea);
  }
  
  function getSettings() { return settings; }

  return { init, getSettings , clearConsole};
})();