// src/modules/console/ConsoleInput.js

window.MyDevTool = window.MyDevTool || {};
window.MyDevTool.ConsoleInput = (function () {

  let logArea = null;
  let settingsCallback = null;
  let ConsoleEngine = null;
  let ConsoleLog = null;
  let clearConsoleCallback = null;
  
  let activeInput = null; 
  let autocompleteTimer = null;
  let eagerEvalTimer = null;
  let activeEagerEvalTimer = null;
  let SVGs = null;

  // Static Keywords (Always available globally)
  const JS_KEYWORDS = [
      "async", "await", "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "export", "extends", "false", "finally", "for", "function", "if", "import", "in", "instanceof", "let", "new", "null", "return", "super", "switch", "this", "throw", "true", "try", "typeof", "var", "void", "while", "with", "yield", "undefined", "NaN", "Infinity"
  ];

  const ICONS = {
      snippet: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #d7ba7d;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
      variable: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #9cdcfe;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
      keyword: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #c586c0;"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
      method: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #dcdcaa;"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
      property: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #4fc1ff;"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`
  };

  function init(logAreaEl, settingsCb, engine, logModule, clearCb) {
    logArea = logAreaEl;
    settingsCallback = settingsCb;
    ConsoleEngine = engine;
    ConsoleLog = logModule;
    clearConsoleCallback = clearCb;
    SVGs = window.MyDevTool.SVGs || {};
    
    // Inject styles
    if (!document.getElementById('devtool-snippet-styles')) {
        const style = document.createElement('style');
        style.id = 'devtool-snippet-styles';
        style.textContent = `
            .console-tabstop { border-bottom: 1px dotted #888; cursor: text; display: inline-block; min-width: 10px; color: #d4d4d4; }
            .console-tabstop:focus { background: rgba(255, 255, 255, 0.05); outline: none !important; border-bottom: 1px dotted #aaa; box-shadow: none !important; }
            .console-suggestion-item { display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; cursor: pointer; font-family: monospace; font-size: 12px; }
            .console-suggestion-item.active { background-color: #04395e; color: white; }
            .suggestion-left { display: flex; align-items: center; gap: 8px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
            .suggestion-right { opacity: 0.5; font-size: 11px; margin-left: 10px; white-space: nowrap; }
            .suggestion-match { color: #569cd6; font-weight: bold; }
        `;
        document.head.appendChild(style);
    }
  }

  function highlightSyntax(code) {
    if (!code) return '';
    const strings = [];
    code = code.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, (match) => {
      strings.push(match); return `__STRING_${strings.length - 1}__`;
    });
    const comments = [];
    code = code.replace(/(\/\/.*$)/gm, (match) => {
      comments.push(match); return `__COMMENT_${comments.length - 1}__`;
    });
    code = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    code = code.replace(/\b(const|let|var|function|return|if|else|for|while|switch|case|break|continue|new|class|this|async|await|try|catch|import|export|default|typeof|void|delete|in|instanceof|of)\b/g, '__TOK_KEY_S__$1__TOK_END__');
    code = code.replace(/\b(true|false|null|undefined|NaN|Infinity)\b/g, '__TOK_BOOL_S__$1__TOK_END__');
    code = code.replace(/\b(0x[0-9a-fA-F]+|0b[01]+|\d+\.?\d*)\b/g, '__TOK_NUM_S__$1__TOK_END__');
    code = code.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '__TOK_KEYNAME_S__$1__TOK_END__:');
    code = code.replace(/([{}()\[\]=;,.])/g, '__TOK_PUNC_S__$1__TOK_END__');
    code = code.replace(/__TOK_KEY_S__/g, '<span class="token-keyword">')
      .replace(/__TOK_BOOL_S__/g, '<span class="token-boolean">')
      .replace(/__TOK_NUM_S__/g, '<span class="token-number">')
      .replace(/__TOK_KEYNAME_S__/g, '<span class="token-key">')
      .replace(/__TOK_PUNC_S__/g, '<span class="token-punct">')
      .replace(/__TOK_END__/g, '</span>');
    strings.forEach((str, i) => {
      const escaped = str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      code = code.replace(`__STRING_${i}__`, `<span class="token-string">${escaped}</span>`);
    });
    comments.forEach((comment, i) => {
      const escaped = comment.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      code = code.replace(`__COMMENT_${i}__`, `<span class="token-comment">${escaped}</span>`);
    });
    return code;
  }
  
  function getSettings() { return settingsCallback ? settingsCallback() : {}; }
  function uid() { return 'm' + Math.random().toString(36).slice(2, 9); }

  function createNewInputLine(prefill = '') {
    if (logArea.querySelector('.console-active-input-wrapper')) return;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'console-active-input-wrapper';
    wrapper.dataset.id = uid();
    wrapper.style.position = "relative";
    
    const inputRow = document.createElement('div');
    inputRow.className = 'console-input-row';

    const promptSpan = document.createElement('span');
    promptSpan.className = 'console-prompt';
    if (SVGs && SVGs.inputSVG) {
        promptSpan.innerHTML = SVGs.inputSVG;
        promptSpan.className += ' console-icon icon-input'; 
        promptSpan.style.display = 'inline-flex';
        promptSpan.style.alignItems = 'center';
        promptSpan.style.marginRight = '5px';
    } else {
        promptSpan.textContent = '>';
    }
    inputRow.appendChild(promptSpan);
    
    activeInput = document.createElement('div'); 
    activeInput.className = 'console-active-input';
    activeInput.contentEditable = 'true';
    activeInput.spellcheck = false;
    activeInput.setAttribute('role', 'textbox');
    activeInput.innerText = prefill || ''; 
    inputRow.appendChild(activeInput);
    wrapper.appendChild(inputRow);
    
    const popup = document.createElement('div');
    popup.className = 'console-autocomplete-popup';
    popup.style.display = 'none';
    activeInput._popup = popup; 
    wrapper.appendChild(popup);
    
    const eagerPreview = document.createElement('div');
    eagerPreview.className = 'console-eager-preview';
    eagerPreview.style.display = 'none';
    activeInput._eagerPreview = eagerPreview;
    wrapper.appendChild(eagerPreview);
    
    activeInput._snippetState = null;

    activeInput.addEventListener('keydown', async (e) => {
      const el = e.target;
      const popup = el._popup;
      const isPopupOpen = popup && popup.style.display === 'block' && popup.children.length > 0;

      if (e.key === 'Tab' && el._snippetState) {
          e.preventDefault();
          navigateSnippetTabstop(el, e.shiftKey ? -1 : 1);
          return;
      }

      if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
        ConsoleEngine.resetHistoryIndex();
        if(e.key === 'Backspace' || e.key === 'Delete') {
            hideAutocompletePopup(el);
            if(el._eagerPreview) el._eagerPreview.style.display = 'none';
        }
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        if (isPopupOpen) {
             e.preventDefault();
             e.stopPropagation(); 
             acceptAutocomplete(el);
             return;
        }
        e.preventDefault();
        const code = el.innerText; 
        
        if (el._snippetState) finishSnippetSession(el);

        const atEnd = isCaretAtEnd(el);
        if (atEnd) {
            hideAutocompletePopup(el);
            if(el._eagerPreview) el._eagerPreview.style.display = 'none';
            await processCommand(code, el); 
        } else {
            document.execCommand('insertText', false, '\n');
        }
      } else if (e.key === 'ArrowUp') {
        if (isPopupOpen) { 
            e.preventDefault(); 
            navigateAutocomplete(el, 'up'); 
        } 
        else if (getCaretRow(el) === 0 && isCaretAtStart(el)) {
          e.preventDefault(); 
          el.textContent = ConsoleEngine.getHistoryUp(); 
          moveCaretToEnd(el);
        }
      } else if (e.key === 'ArrowDown') {
        if (isPopupOpen) { 
            e.preventDefault(); 
            navigateAutocomplete(el, 'down'); 
        } 
        else if (getCaretRow(el) === getLineCount(el) - 1 && isCaretAtEnd(el)) {
          e.preventDefault(); 
          el.textContent = ConsoleEngine.getHistoryDown(); 
          moveCaretToEnd(el);
        }
      } else if (e.key === 'Tab') {
          if (isPopupOpen) { 
              e.preventDefault(); 
              e.stopPropagation(); 
              acceptAutocomplete(el); 
          }
          else { e.preventDefault(); document.execCommand('insertText', false, '  '); }
      } else if (e.key === 'Escape') {
          if (isPopupOpen) { e.preventDefault(); hideAutocompletePopup(el); }
          else if (el._snippetState) { finishSnippetSession(el); }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault(); clearConsoleCallback();
      }
    });
    
    activeInput.addEventListener('input', (e) => {
        const el = e.target;
        const settings = getSettings();
        if (settings.autocompleteFromHistory) scheduleAutocompletePopup(el);
        if (settings.eagerEvaluation) scheduleActiveInputEagerEval(el);
        if (el.innerText.trim() === '') {
             hideAutocompletePopup(el);
             if(el._eagerPreview) el._eagerPreview.style.display = 'none';
        }
    });

    logArea.appendChild(wrapper);
    activeInput.focus();
    moveCaretToEnd(activeInput);
    logArea.scrollTop = logArea.scrollHeight;
  }
  
  async function processCommand(code, inputEl) {
    const clean = code.trim(); 
    const currentInputWrapper = inputEl.closest('.console-active-input-wrapper');
    if (!currentInputWrapper) return; 

    const oldActiveInput = inputEl;
    oldActiveInput.innerHTML = highlightSyntax(code);
    
    if (oldActiveInput._popup) oldActiveInput._popup.remove();
    if (oldActiveInput._eagerPreview) oldActiveInput._eagerPreview.remove();
    
    currentInputWrapper.classList.remove('console-active-input-wrapper');
    currentInputWrapper.classList.add('console-input-line');
    oldActiveInput.contentEditable = 'false';
    oldActiveInput.classList.remove('console-active-input');
    oldActiveInput.classList.add('console-input-code');

    const meta = { userAction: getSettings().treatEvalAsUserAction, preventGroup: true };
    ConsoleLog.addMessage(code, 'console-input-line', meta, true); 
    
    activeInput = null; 
    if (clean !== '') await ConsoleEngine.evaluate(clean);
    createNewInputLine();
    if(logArea) logArea.scrollTop = logArea.scrollHeight;
  }
  
  function focusActiveInput() { if(activeInput) activeInput.focus(); }

  // Autocomplete UI & Logic
  function hideAutocompletePopup(el) { if (el && el._popup) { el._popup.style.display = 'none'; el._popup.innerHTML = ''; } }
  function scheduleAutocompletePopup(el) { if (autocompleteTimer) clearTimeout(autocompleteTimer); autocompleteTimer = setTimeout(() => showAutocompletePopup(el), 60); }
  
  function getTextBeforeCaret(el) {
      try {
        const selection = getShadowSelection(el);
        if (!selection || !selection.rangeCount) return "";
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(el);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        return preCaretRange.toString();
      } catch (e) {
          return el.innerText; 
      }
  }

  function showAutocompletePopup(el) {
    if (!el) return;
    const popup = el._popup; if (!popup) return; 
    
    const fullTextBefore = getTextBeforeCaret(el);

    const propMatch = fullTextBefore.match(/([a-zA-Z0-9_$]+(?:\.[a-zA-Z0-9_$]+)*)\.([a-zA-Z0-9_$]*)$/);
    
    const globalMatch = fullTextBefore.match(/([a-zA-Z0-9_$]+)$/);

    let suggestions = [];
    let token = "";
    let isPropertyAccess = false;

    if (propMatch) {
        //  CASE A: Property Access (e.g., document.qu)
        isPropertyAccess = true;
        const objectExpression = propMatch[1]; // e.g., "document"
        token = propMatch[2]; // e.g., "qu"

        try {
            // Evaluates the object (safe check needed usually, assuming ConsoleEngine is ready)
            // Use silent eval to get the object reference
            ConsoleEngine.setSilentEval(true);
            const obj = ConsoleEngine.globalEval(objectExpression);
            ConsoleEngine.setSilentEval(false);

            if (obj != null && (typeof obj === 'object' || typeof obj === 'function')) {
                const props = getAllProperties(obj); // Inspect the object
                const matchedProps = props.filter(p => p.toLowerCase().startsWith(token.toLowerCase()) && p !== token);
                
                suggestions = matchedProps.map(p => ({
                    label: p,
                    type: typeof obj[p] === 'function' ? 'Method' : 'Property',
                    category: typeof obj[p] === 'function' ? 'method' : 'property'
                }));
            }
        } catch (e) {
            ConsoleEngine.setSilentEval(false);
            // Ignore errors (e.g. object doesn't exist)
        }

    } else if (globalMatch) {
        // CASE B: Global Scope (e.g., docu)
        token = globalMatch[1];

        // 1. Keywords
        const matchedKeywords = JS_KEYWORDS.filter(k => k.toLowerCase().startsWith(token.toLowerCase()));
        suggestions.push(...matchedKeywords.map(k => ({ label: k, type: 'Keyword', category: 'keyword' })));

        // 2. Snippets
        if (window.MyDevTool.ConsoleSnippets) {
            const snippets = window.MyDevTool.ConsoleSnippets.getSnippets();
            const matchedSnips = snippets.filter(s => s.label.toLowerCase().startsWith(token.toLowerCase()));
            suggestions.push(...matchedSnips.map(s => ({ ...s, category: 'snippet' })));
        }

        // 3. Global Variables (window properties)
        if (ConsoleEngine && ConsoleEngine.listSandboxGlobals) { 
            const globals = ConsoleEngine.listSandboxGlobals();
            const matchedGlobals = globals.filter(s => s.toLowerCase().startsWith(token.toLowerCase()) && s !== token);
            suggestions.push(...matchedGlobals.map(g => ({ label: g, category: 'variable', type: 'Global' })));
        }
    }

    // Limit suggestions
    suggestions = suggestions.slice(0, 50);

    if (suggestions.length > 0 && token.length >= 0) {
        popup.innerHTML = '';
        suggestions.forEach((s, index) => {
            const item = document.createElement('div');
            item.className = 'console-suggestion-item';
            if (index === 0) item.classList.add('active');
            
            // Icon Selection
            let iconSvg = ICONS.variable;
            if (s.category === 'snippet') iconSvg = ICONS.snippet;
            else if (s.category === 'keyword') iconSvg = ICONS.keyword;
            else if (s.category === 'method') iconSvg = ICONS.method;
            else if (s.category === 'property') iconSvg = ICONS.property;

            const typeText = s.detail || s.type || 'Property';
            const label = s.label;
            const matchPart = label.substr(0, token.length);
            const restPart = label.substr(token.length);
            item.innerHTML = `
                <div class="suggestion-left">${iconSvg}<span><span class="suggestion-match">${matchPart}</span>${restPart}</span></div>
                <div class="suggestion-right">${typeText}</div>
            `;
            item.dataset.insert = s.insert || s.label;
            item.dataset.category = s.category;
            item.onmousedown = (e) => { e.preventDefault(); e.stopPropagation(); applySuggestion(el, s, token); };
            popup.appendChild(item);
        });
        popup.style.display = 'block';
    } else { 
        hideAutocompletePopup(el); 
    }
  }

  // Helper to get all properties (including prototype chain)
  function getAllProperties(obj) {
      let props = new Set();
      let current = obj;
      // Safety limit for prototype chain
      let depth = 0;
      while (current && depth < 5) {
          Object.getOwnPropertyNames(current).forEach(p => props.add(p));
          current = Object.getPrototypeOf(current);
          depth++;
      }
      return Array.from(props);
  }

  function navigateAutocomplete(el, direction) {
      const popup = el._popup; 
      if (!popup || popup.style.display !== 'block') return;
      const items = popup.querySelectorAll('.console-suggestion-item');
      if (items.length === 0) return;
      let activeIndex = -1; items.forEach((item, index) => { if (item.classList.contains('active')) activeIndex = index; });
      items[activeIndex]?.classList.remove('active');
      if (direction === 'up') { activeIndex = (activeIndex <= 0) ? items.length - 1 : activeIndex - 1; }
      else { activeIndex = (activeIndex >= items.length - 1) ? 0 : activeIndex + 1; }
      items[activeIndex].classList.add('active'); items[activeIndex].scrollIntoView({ block: 'nearest' });
  }

  function acceptAutocomplete(el) {
      const popup = el._popup; 
      if (!popup || popup.style.display !== 'block') return;
      const activeItem = popup.querySelector('.console-suggestion-item.active');
      if (!activeItem) return;
      
      const textBefore = getTextBeforeCaret(el);
      // Re-detect token to calculate replacement range
      let token = "";
      const propMatch = textBefore.match(/([a-zA-Z0-9_$]+(?:\.[a-zA-Z0-9_$]+)*)\.([a-zA-Z0-9_$]*)$/);
      const globalMatch = textBefore.match(/([a-zA-Z0-9_$]+)$/);
      
      if (propMatch) token = propMatch[2];
      else if (globalMatch) token = globalMatch[1];

      let data = { label: activeItem.innerText.split('\n')[0].trim(), insert: activeItem.dataset.insert, category: activeItem.dataset.category };
      
      applySuggestion(el, data, token);
  }

  function applySuggestion(el, itemData, token) {
      const insertText = itemData.insert || itemData.label;
      const selection = getShadowSelection(el);
      
      try {
          if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              if (range.endContainer.nodeType === Node.TEXT_NODE && range.endOffset >= token.length) {
                  range.setStart(range.endContainer, range.endOffset - token.length);
                  range.deleteContents();
                  if (itemData.category === 'snippet') {
                      insertSnippetWithPlaceholders(el, insertText);
                  } else {
                      document.execCommand('insertText', false, insertText);
                  }
              } else {
                 fallbackApply(el, itemData, token, range, insertText);
              }
          } else {
             fallbackApply(el, itemData, token, null, insertText);
          }
      } catch (e) {
          fallbackApply(el, itemData, token, null, insertText);
      }
      hideAutocompletePopup(el);
  }

  function fallbackApply(el, itemData, token, range, insertText) {
      const textBefore = getTextBeforeCaret(el);
      const newTextBefore = textBefore.slice(0, -token.length);
      el.innerText = newTextBefore; 
      moveCaretToEnd(el);
      if (itemData.category === 'snippet') insertSnippetWithPlaceholders(el, insertText);
      else document.execCommand('insertText', false, insertText);
  }

  function insertSnippetWithPlaceholders(el, snippetRaw) {
      const regex = /\$\{(\d+):?([^}]*)\}/g;
      let match, lastIndex = 0;
      const frag = document.createDocumentFragment();
      const tabstops = new Set();
      while ((match = regex.exec(snippetRaw)) !== null) {
          const plainText = snippetRaw.substring(lastIndex, match.index);
          if (plainText) frag.appendChild(document.createTextNode(plainText));
          const id = match[1];
          const defaultVal = match[2] || "";
          const span = document.createElement('span');
          span.className = 'console-tabstop';
          span.dataset.id = id;
          span.contentEditable = 'true';
          span.innerText = defaultVal;
          frag.appendChild(span);
          tabstops.add(parseInt(id));
          lastIndex = regex.lastIndex;
      }
      const remaining = snippetRaw.substring(lastIndex);
      if (remaining) frag.appendChild(document.createTextNode(remaining));
      const range = getShadowSelection(el).getRangeAt(0);
      range.insertNode(frag);
      range.collapse(false);
      const sortedIds = Array.from(tabstops).sort((a, b) => a - b);
      el._snippetState = { ids: sortedIds, currentIdIndex: 0 };
      setupLinkedEditingObserver(el);
      if (sortedIds.length > 0) selectTabstopGroup(el, sortedIds[0]);
  }

  function setupLinkedEditingObserver(el) {
      if (el._snippetObserver) el._snippetObserver.disconnect();
      const observer = new MutationObserver((mutations) => {
          mutations.forEach(mutation => {
              let targetTabstop = null;
              if (mutation.target.classList && mutation.target.classList.contains('console-tabstop')) targetTabstop = mutation.target;
              else if (mutation.target.parentElement && mutation.target.parentElement.classList.contains('console-tabstop')) targetTabstop = mutation.target.parentElement;
              if (targetTabstop) {
                  const id = targetTabstop.dataset.id;
                  const newValue = targetTabstop.innerText;
                  const allStops = el.querySelectorAll(`.console-tabstop[data-id="${id}"]`);
                  allStops.forEach(stop => {
                      if (stop !== targetTabstop && stop.innerText !== newValue) {
                          observer.disconnect(); stop.innerText = newValue;
                          observer.observe(el, { childList: true, subtree: true, characterData: true, characterDataOldValue: true });
                      }
                  });
              }
          });
      });
      observer.observe(el, { childList: true, subtree: true, characterData: true, characterDataOldValue: true });
      el._snippetObserver = observer;
  }

  function selectTabstopGroup(el, id) {
      const stops = el.querySelectorAll(`.console-tabstop[data-id="${id}"]`);
      if (stops.length === 0) return;
      const first = stops[0];
      first.focus();
      const range = document.createRange();
      const sel = getShadowSelection(el);
      range.selectNodeContents(first);
      sel.removeAllRanges();
      sel.addRange(range);
      first.scrollIntoView({block: 'nearest', inline: 'nearest'});
  }

  function navigateSnippetTabstop(el, direction) {
      const state = el._snippetState;
      if (!state) return;
      let nextIndex = state.currentIdIndex + direction;
      if (nextIndex >= 0 && nextIndex < state.ids.length) {
          state.currentIdIndex = nextIndex;
          selectTabstopGroup(el, state.ids[nextIndex]);
      } else {
          finishSnippetSession(el);
          moveCaretToEnd(el);
      }
  }

  function finishSnippetSession(el) {
      if (!el._snippetState) return;
      if (el._snippetObserver) { el._snippetObserver.disconnect(); el._snippetObserver = null; }
      const text = el.innerText; 
      el.innerText = text;
      el._snippetState = null;
      moveCaretToEnd(el);
  }

  function scheduleEagerEvaluation(code, previewElement) { if (eagerEvalTimer) clearTimeout(eagerEvalTimer); eagerEvalTimer = setTimeout(() => eagerEvaluate(code, previewElement), 220); }
  function eagerEvaluate(code, previewElement) {
    if (!previewElement) return;
    if (code.includes('debugger')) { previewElement.style.display = 'none'; return; }
    try {
      const val = (new Function('return (' + code + ')'))();
      previewElement.style.display = ''; previewElement.textContent = formatPreview(val);
    } catch (e) { previewElement.style.display = 'none'; }
  }
  
  function scheduleActiveInputEagerEval(el) { if (activeEagerEvalTimer) clearTimeout(activeEagerEvalTimer); const code = el.innerText; const previewElement = el._eagerPreview; activeEagerEvalTimer = setTimeout(() => activeInputEagerEvaluate(code, previewElement), 220); }
  
  function activeInputEagerEvaluate(code, previewElement) {
    if (!previewElement) return;
    const trimmed = code.trim();
    if (!trimmed) { previewElement.style.display = 'none'; return; }
    if (trimmed.includes('debugger')) {
        previewElement.style.display = 'none';
        return;
    }
    const logMatch = trimmed.match(/^console\.(log|warn|error|info)\((.*)\);?$/);
    if (logMatch && logMatch[2]) {
        try {
            ConsoleEngine.setSilentEval(true);
            const argsArray = ConsoleEngine.globalEval(`[${logMatch[2]}]`);
            ConsoleEngine.setSilentEval(false);
            if (Array.isArray(argsArray)) {
                const output = argsArray.map(arg => formatPreview(arg)).join(' ');
                previewElement.style.display = 'block';
                previewElement.textContent = output;
                previewElement.style.opacity = '0.8';
                return;
            }
        } catch (e) { }
    }
    try {
      ConsoleEngine.setSilentEval(true);
      let val;
      try { val = ConsoleEngine.globalEval(`(${trimmed})`); } catch (e) { val = ConsoleEngine.globalEval(trimmed); }
      ConsoleEngine.setSilentEval(false);
      previewElement.style.display = 'block';
      previewElement.textContent = formatPreview(val);
      previewElement.style.opacity = '0.5'; 
    } catch (e) { 
      ConsoleEngine.setSilentEval(false); 
      previewElement.style.display = 'none'; 
    }
  }
  
  // Eager Evaluation Preview for Objects & Functions
  function formatPreview(v) {
    try {
      if (typeof v === 'undefined') return 'undefined'; 
      if (v === null) return 'null';
      if (typeof v === 'string') return `"${v}"`;
      if (typeof v === 'number' || typeof v === 'boolean') return String(v);
      if (typeof v === 'symbol') return v.toString();

      if (typeof v === 'function') {
          const fnName = v.name ? ` ${v.name}` : '';
          return `ƒ${fnName}()`;
      }

      if (Array.isArray(v)) {
          let items = [];
          for (let i = 0; i < Math.min(v.length, 3); i++) {
              try {
                  let item = v[i];
                  if (typeof item === 'string') items.push(`"${item}"`);
                  else if (typeof item === 'function') items.push('ƒ');
                  else if (typeof item === 'object' && item !== null) items.push('{…}');
                  else items.push(String(item));
              } catch(e) { items.push('(...)'); }
          }
          if (v.length > 3) items.push('…');
          return `Array(${v.length}) [${items.join(', ')}]`;
      }

      if (typeof v === 'object') {
          if (v instanceof Error) return v.name;
          if (v instanceof HTMLElement) return `<${v.tagName.toLowerCase()}>`;
          if (v instanceof Window) return 'Window {…}';

          let prefixName = v.constructor && v.constructor.name !== 'Object' ? v.constructor.name : 'Object';
          let items = [];
          let keys = Object.keys(v);
          
          for (let i = 0; i < Math.min(keys.length, 5); i++) { 
              let k = keys[i];
              try {
                  let item = v[k];
                  if (typeof item === 'string') items.push(`${k}: "${item}"`);
                  else if (typeof item === 'function') items.push(`${k}: ƒ`);
                  else if (typeof item === 'object' && item !== null) items.push(`${k}: ${Array.isArray(item) ? 'Array' : '{…}'}`);
                  else items.push(`${k}: ${String(item)}`);
              } catch(e) {
                  items.push(`${k}: (...)`);
              }
          }
          if (keys.length > 5) items.push('…');
          return `${prefixName} {${items.join(', ')}}`;
      }

      return String(v);
    } catch (e) { 
      return String(v); 
    }
  }

  function moveCaretToEnd(el) { try { const range = document.createRange(); const sel = getShadowSelection(el); range.selectNodeContents(el); range.collapse(false); sel.removeAllRanges(); sel.addRange(range); el.focus(); } catch (e) {} }
  function getLineCount(el) { return el.innerText.split('\n').length; }
  
  function getShadowSelection(el) {
      const root = el.getRootNode();
      if (root instanceof ShadowRoot && root.getSelection) {
          return root.getSelection();
      }
      return window.getSelection();
  }

  function isCaretAtStart(el) {
    const selection = getShadowSelection(el);
    if (selection.rangeCount === 0) return true;
    const range = selection.getRangeAt(0);
    const pre = range.cloneRange();
    pre.selectNodeContents(el);
    pre.setEnd(range.startContainer, range.startOffset);
    return pre.toString().length === 0;
  }

  function isCaretAtEnd(el) {
    const selection = getShadowSelection(el);
    if (selection.rangeCount === 0) return true;
    const range = selection.getRangeAt(0);
    if (!range.collapsed) return false;
    const testRange = range.cloneRange();
    testRange.selectNodeContents(el);
    testRange.setStart(range.endContainer, range.endOffset);
    return testRange.toString() === ''; 
  }

  function getCaretRow(el) { 
    const selection = getShadowSelection(el); 
    if (!selection.rangeCount) return 0; 
    const range = selection.getRangeAt(0); 
    const pre = range.cloneRange(); 
    pre.selectNodeContents(el); 
    pre.setEnd(range.startContainer, range.startOffset); 
    const text = pre.toString(); 
    return text.split('\n').length - 1; 
  }

  return { init, createNewInputLine, focusActiveInput, scheduleEagerEvaluation };
})();