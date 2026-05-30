// src/modules/element/DomTree.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.DomTree = (function() {
  
  const Renderer = window.MyDevTool.DomTreeRenderer;
  const Observer = window.MyDevTool.DomTreeObserver;
  const DomBadges = window.MyDevTool.DomBadges;

  let container = null;
  let shadowRoot = null; 
  let rootNode = null;
  let flatNodes = []; 
  let expandedMap = new Map(); 
  let selectedNode = null; 
  let phantom = null; 
  let rowsContainer = null; 
  const ROW_HEIGHT = 17; 
  let scrollTop = 0;
  let containerHeight = 0;
  let currentObservedRoot = null; 
  let lastTapTime = 0;
  let showDevToolStyles = false; 

  // --- Drag & Drop Variables ---
  let dragTimer = null;
  let isDragging = false;
  let dragSourceNode = null;
  let dragGhost = null;
  let dropMarker = null;
  let dropTargetInfo = null; 
  let startX, startY;
  let currentPointerId = null; 
  let dragOverlay = null; 

  let settings = {
      wordWrap: false,
      showComments: true,
      showShadow: true,
      showRulers: false
  };

  function loadSettings() {
      const get = (k, def) => localStorage.getItem(k) === null ? def : localStorage.getItem(k) === 'true';
      settings.wordWrap = get('dt_dom_word_wrap', false);
      settings.showComments = get('dt_dom_show_comments', true);
      settings.showShadow = get('dt_dom_show_shadow', true);
      settings.showRulers = get('dt_dom_rulers', false);
  }

  function init(containerEl, root) {
    container = containerEl;
    shadowRoot = root; 
    rootNode = document.documentElement;
    currentObservedRoot = document.documentElement;

    loadSettings();

    container.innerHTML = '';
    container.style.overflowY = 'auto'; 
    container.style.overflowX = 'auto';
    container.style.position = 'relative'; 
    
    phantom = document.createElement('div');
    phantom.className = 'v-phantom';
    container.appendChild(phantom);

    rowsContainer = document.createElement('div');
    rowsContainer.className = 'v-rows';
    rowsContainer.style.position = 'absolute'; 
    rowsContainer.style.top = '0';
    rowsContainer.style.left = '0';
    rowsContainer.style.minWidth = '100%'; 
    rowsContainer.style.width = 'fit-content'; 
    
    container.appendChild(rowsContainer);
    
    const styleId = 'dt-dom-drag-styles';
    if (!shadowRoot.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .v-row { -webkit-user-select: none; user-select: none; }
        `;
        shadowRoot.appendChild(style);
    }

    dropMarker = document.createElement('div');
    dropMarker.style.position = 'absolute';
    dropMarker.style.left = '0';
    dropMarker.style.right = '0';
    dropMarker.style.height = '1px';
    dropMarker.style.backgroundColor = '#2196f3';
    dropMarker.style.zIndex = '99999'; 
    dropMarker.style.pointerEvents = 'none';
    dropMarker.style.display = 'none';
    dropMarker.dataset.dtInternal = 'true'; 
    
    const circle = document.createElement('div');
    circle.style.position = 'absolute';
    circle.style.left = '0';
    circle.style.top = '-3px';
    circle.style.width = '6px';
    circle.style.height = '6px';
    circle.style.backgroundColor = '#2196f3';
    circle.style.borderRadius = '50%';
    dropMarker.appendChild(circle);

    container.appendChild(dropMarker);

    applyContainerClasses();

    if (Renderer) Renderer.init(window.MyDevTool.SVGs, { onToggle: toggleNode, onSelect: selectElement });
    if (Observer) Observer.init(rowsContainer, { rebuild: rebuildFlatList, isInternal: isInternalNode });
    
    if (DomBadges) {
        DomBadges.init(container.parentElement || container);
    }

    rowsContainer.addEventListener('click', handleGlobalClick);
    
    container.addEventListener('contextmenu', (e) => {
        if (isDragging || dragTimer) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });

    // Keyboard Shortcuts (Alt + Up/Down)
    window.addEventListener('keydown', handleKeyboard);

    setupDragAndDrop(); 

    expandedMap.set(rootNode, true);
    if(document.body) expandedMap.set(document.body, true);

    rebuildFlatList();
    
    const ro = new ResizeObserver(entries => {
        const activeEl = shadowRoot ? shadowRoot.activeElement : document.activeElement;
        if (activeEl && rowsContainer.contains(activeEl)) return;
        containerHeight = entries[0].contentRect.height;
        render();
    });
    ro.observe(container);
    container.addEventListener('scroll', onScroll, { passive: true });
    
    setInterval(() => { checkAndSwitchContext(); }, 1000);
    if (Observer) Observer.setup(document.documentElement);
  }

  // Keyboard Handler Function
  function handleKeyboard(e) {
      if (!selectedNode) return;
      
      // Check for Alt + Up/Down
      if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
          e.preventDefault();
          e.stopPropagation();
          
          if (navigator.vibrate) navigator.vibrate(30);
          moveNode(selectedNode, e.key === 'ArrowUp' ? 'up' : 'down');
      }
  }

  // HYBRID DRAG / CONTEXT MENU LOGIC

  function setupDragAndDrop() {
      container.addEventListener('pointerdown', onDragStart, { passive: false });
      window.addEventListener('pointermove', onDragMove, { passive: false });
      window.addEventListener('pointerup', onDragEnd);
      window.addEventListener('pointercancel', onDragEnd);
      window.addEventListener('lostpointercapture', onDragEnd);
  }

  function isValidDragSource(node) {
      if (!node) return false;
      const tag = node.tagName ? node.tagName.toLowerCase() : '';
      if (tag === 'html' || tag === 'head' || tag === 'body') return false;
      if (node.nodeType === Node.DOCUMENT_TYPE_NODE) return false;
      return true;
  }

  function isValidDropTarget(source, target, position) {
      if (!source || !target || source === target) return false;
      if (source.contains(target)) return false; 

      const targetTag = target.tagName ? target.tagName.toLowerCase() : '';
      if (targetTag === 'html') return false; 
      if (targetTag === 'head' || targetTag === 'body') {
          if (position === 'before' || position === 'after') return false;
      }
      return true;
  }

  function onDragStart(e) {
      if (e.button !== 0) return; 
      
      const row = e.target.closest('.v-row');
      if (!row || !row._nodeRef) return;

      const node = row._nodeRef;
      if (!isValidDragSource(node)) return;

      startX = e.clientX;
      startY = e.clientY;
      dragSourceNode = node;
      currentPointerId = e.pointerId; 

      dragTimer = setTimeout(() => {
          dragTimer = null; 
          
          if (settings.wordWrap) {
              startDragMode(e, row);
          } else {
              if (navigator.vibrate) navigator.vibrate(50);
              showMoveMenu(e, node);
          }
      }, 500);
  }

  // Menu keeps open on action
  function showMoveMenu(e, node) {
      if (!window.MyDevTool.ContextMenu) return;

      try { if (currentPointerId) container.releasePointerCapture(currentPointerId); } catch(err) {}

      const options = [
          {
              label: 'Move Up ▲',
              keepOpen: true, // Menu won't close
              callback: () => moveNode(node, 'up')
          },
          {
              label: 'Move Down ▼',
              keepOpen: true,
              callback: () => moveNode(node, 'down')
          },
          { type: 'separator' },
          {
              label: 'Cancel', // No keepOpen, so it closes
              callback: () => {} 
          }
      ];

      window.MyDevTool.ContextMenu.show(e, options);
  }

  function moveNode(node, direction) {
      const parent = node.parentNode;
      if (!parent) return;

      try {
          if (navigator.vibrate) navigator.vibrate(20); // Feedback

          if (direction === 'up') {
              const prev = node.previousSibling;
              if (prev) {
                  parent.insertBefore(node, prev);
              }
          } else {
              const next = node.nextSibling;
              if (next) {
                  parent.insertBefore(node, next.nextSibling);
              }
          }
          
          // Re-select to keep highlighting
          rebuildFlatList();
          selectElement(node);
          
          // Scroll into view if needed
          if(node.scrollIntoViewIfNeeded) node.scrollIntoViewIfNeeded();
          else node.scrollIntoView({block: 'center', behavior: 'smooth'});

      } catch (err) {
          console.error('Move failed:', err);
      }
  }

  // STANDARD DRAG OVERLAY LOGIC (Only for Wrap Mode)
  function startDragMode(e, row) {
      if (navigator.vibrate) navigator.vibrate(50); 
      isDragging = true;
      if(e.cancelable) e.preventDefault(); 

      if (container) {
          container.style.overflow = 'hidden'; 
          container.style.touchAction = 'none';
      }

      dragOverlay = document.createElement('div');
      dragOverlay.id = 'dt-drag-overlay';
      dragOverlay.style.cssText = `
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          z-index: 2147483647; background: transparent; 
          touch-action: none; user-select: none; cursor: grabbing;
      `;
      
      dragOverlay.addEventListener('pointermove', onOverlayMove, { passive: false });
      dragOverlay.addEventListener('pointerup', onOverlayEnd);
      dragOverlay.addEventListener('pointercancel', onOverlayEnd);
      dragOverlay.addEventListener('contextmenu', (ev) => { ev.preventDefault(); return false; });

      document.body.appendChild(dragOverlay);

      try {
          dragOverlay.setPointerCapture(currentPointerId);
      } catch (err) { }

      createGhost(row, e);
  }

  function createGhost(row, e) {
      dragGhost = row.cloneNode(true);
      dragGhost.dataset.dtInternal = 'true'; 
      dragGhost.classList.add('dt-drag-ghost');

      dragGhost.style.cssText = `
          position: fixed; z-index: 2147483647; pointer-events: none;
          opacity: 0.9; background: #333; color: #fff;
          border: 1px solid #00aaff; border-radius: 4px; padding: 4px 8px;
          width: auto; max-width: 300px; white-space: nowrap; overflow: hidden;
          font-family: monospace; font-size: 12px;
      `;

      const optionsBtn = dragGhost.querySelector('.dom-options-btn');
      if(optionsBtn) optionsBtn.remove();
      const toggle = dragGhost.querySelector('.dom-toggle-icon');
      if(toggle) toggle.style.display = 'none';

      document.body.appendChild(dragGhost);
      
      const cx = e.clientX || startX;
      const cy = e.clientY || startY;
      updateGhostPosition(cx, cy);
  }

  function onDragMove(e) {
      if (!isDragging && dragTimer) {
          if (Math.abs(e.clientX - startX) > 10 || Math.abs(e.clientY - startY) > 10) {
              clearTimeout(dragTimer);
              dragTimer = null;
          }
      }
  }

  function onOverlayMove(e) {
      e.preventDefault(); 
      e.stopPropagation();

      updateGhostPosition(e.clientX, e.clientY);

      dropMarker.style.display = 'none';
      dropTargetInfo = null;

      const elementsUnder = shadowRoot.elementsFromPoint(e.clientX, e.clientY);
      const targetRow = elementsUnder.find(el => el.classList.contains('v-row'));

      if (targetRow && targetRow._nodeRef) {
          const targetNode = targetRow._nodeRef;
          const rowRect = targetRow.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const offsetY = e.clientY - rowRect.top;
          const position = offsetY < (rowRect.height / 2) ? 'before' : 'after';

          if (isValidDropTarget(dragSourceNode, targetNode, position)) {
              dropTargetInfo = { targetNode, position };
              
              dropMarker.style.display = 'block';
              dropMarker.style.width = `${Math.max(rowsContainer.offsetWidth, containerRect.width)}px`; 
              
              let markerTop = rowRect.top - containerRect.top + container.scrollTop;
              if (position === 'after') markerTop += rowRect.height;
              
              dropMarker.style.top = `${markerTop}px`;
          }
      }
  }

  function updateGhostPosition(x, y) {
      if (dragGhost) {
          dragGhost.style.left = `${x + 20}px`;
          dragGhost.style.top = `${y - 20}px`;
      }
  }

  function onOverlayEnd(e) {
      finishDrag();
  }

  function onDragEnd(e) {
      if (dragTimer) { clearTimeout(dragTimer); dragTimer = null; }
      if (!isDragging) return;
      finishDrag();
  }

  function finishDrag() {
      isDragging = false;
      removeOverlay(); 

      if (container) {
          container.style.overflow = 'auto'; 
          container.style.touchAction = 'auto';
      }

      if (dragGhost) { dragGhost.remove(); dragGhost = null; }
      dropMarker.style.display = 'none';

      if (dropTargetInfo) {
          performDragDrop(dragSourceNode, dropTargetInfo.targetNode, dropTargetInfo.position);
      }
      
      dragSourceNode = null;
      dropTargetInfo = null;
  }

  function removeOverlay() {
      if (dragOverlay) {
          try { if(currentPointerId) dragOverlay.releasePointerCapture(currentPointerId); } catch(e){}
          dragOverlay.remove();
          dragOverlay = null;
      }
  }

  function performDragDrop(source, target, position) {
      try {
          const parent = target.parentNode;
          if (!parent) return;

          if (position === 'before') {
              parent.insertBefore(source, target);
          } else {
              parent.insertBefore(source, target.nextSibling);
          }
          
          rebuildFlatList();
          selectElement(source);
      } catch (err) {
          console.error("Move failed:", err);
      }
  }

  function updateSetting(key, value) {
      if (key === 'dt_dom_word_wrap') settings.wordWrap = value;
      else if (key === 'dt_dom_show_comments') settings.showComments = value;
      else if (key === 'dt_dom_show_shadow') settings.showShadow = value;
      else if (key === 'dt_dom_rulers') settings.showRulers = value;
      else if (key === 'dt_dom_flash' && Observer) Observer.setFlashEnabled(value);

      applyContainerClasses();
      scrollTop = 0; 
      container.scrollTop = 0;
      rebuildFlatList(); 
  }

  function applyContainerClasses() {
      if (!rowsContainer) return;
      if (settings.wordWrap) {
          rowsContainer.classList.add('word-wrap');
          rowsContainer.style.touchAction = 'pan-y'; 
      } else {
          rowsContainer.classList.remove('word-wrap');
          rowsContainer.style.touchAction = 'auto';
      }
      if (settings.showRulers) rowsContainer.classList.add('show-rulers');
      else rowsContainer.classList.remove('show-rulers');
  }

  function checkAndSwitchContext() {
      let targetRoot = document.documentElement; 
      if (window.MyDevTool.DeviceMode && window.MyDevTool.DeviceMode.isActive()) {
          const iframe = window.MyDevTool.DeviceMode.getIframe();
          if (iframe && iframe.contentDocument) targetRoot = iframe.contentDocument.documentElement;
      }
      if (targetRoot !== currentObservedRoot) switchContextTo(targetRoot);
  }

  function switchContextTo(targetRoot) {
      currentObservedRoot = targetRoot;
      rootNode = targetRoot;
      const body = targetRoot.querySelector('body');
      if (body) expandedMap.set(body, true);
      if (Observer) Observer.setup(targetRoot);
      rebuildFlatList();
  }

  function isInternalNode(node) {
      if (!node) return false;
      if (node.dataset && node.dataset.dtInternal === 'true') return true;
      if (node.classList && node.classList.contains('dt-drag-ghost')) return true;
      if (shadowRoot && node.getRootNode() === shadowRoot) return true;
      if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE && node.host) return isInternalNode(node.host);

      const id = (node.id || '').toLowerCase();
      if (id === 'dt-drag-overlay') return true;
      const tagName = (node.tagName || '').toUpperCase();
      if (id === 'my-devtool-toggle') return true;
      if (id.startsWith('dt-device-') || id === 'dt-emulation-area') return true;
      if (id.startsWith('my-devtool-') || id === 'devtool-tooltip') return true;
      if (id.startsWith('dt-badge-overlay-')) return true; 
      if (node.classList && node.classList.contains('dt-res-input')) return true;
      if (node.closest && node.closest('#my-devtool-host')) return true;
      if (tagName === 'SCRIPT' && (id.includes('suger') || id.includes('devtool') || (node.src && node.src.includes('DevTool.js')))) return true;
      if (tagName === 'STYLE' && !showDevToolStyles && (id.includes('devtool') || id.includes('colorpicker'))) return true;
      return false;
  }

  function handleGlobalClick(e) {
      const target = e.target;
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTapTime;
      const DomActions = window.MyDevTool.DomActions;

      if (target.closest('.dom-options-btn') || target.closest('.dom-toggle-icon')) return;

      const row = target.closest('.v-row');
      if (!row || !row._nodeRef) return;
      const node = row._nodeRef;

      if (tapLength < 500 && tapLength > 0 && DomActions) {
          e.preventDefault(); e.stopPropagation();
          if (target.classList.contains('tag-name')) DomActions.makeDomEditable(target, 'tag', node, row);
          else if (target.classList.contains('attr-name')) DomActions.makeDomEditable(target.closest('.attribute'), 'full-attribute', node, row, 'attr-name');
          else if (target.classList.contains('attr-value')) DomActions.makeDomEditable(target.closest('.attribute'), 'full-attribute', node, row, 'attr-value');
          else if (target.classList.contains('dom-text')) DomActions.makeDomEditable(target, 'text', node, row);
          else if (target.classList.contains('dom-comment')) DomActions.makeDomEditable(target, 'comment', node, row);
          lastTapTime = 0; 
          return; 
      }
      lastTapTime = currentTime;
      selectElement(node);
  }

  function onScroll(e) { 
      if (settings.wordWrap) return; 
      scrollTop = e.target.scrollTop; 
      requestAnimationFrame(render); 
  }

  function rebuildFlatList() {
    flatNodes = [];
    if (currentObservedRoot) flattenNode(currentObservedRoot, 0);
    render(); 
  }
  
  function flattenNode(node, depth) {
    if (isInternalNode(node)) return null;
    if (node.nodeType === Node.COMMENT_NODE && !settings.showComments) return;
    if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE && !settings.showShadow) return;
    if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;

    const isElement = node.nodeType === Node.ELEMENT_NODE;
    const hasElementChildren = node.children && node.children.length > 0;
    const hasShadow = !!node.shadowRoot;
    const content = node.textContent || '';
    
    if (isElement && !hasElementChildren && !hasShadow && content.length < 250) {
        flatNodes.push({ type: 'inline', node: node, depth: depth });
        return;
    }

    const isExpanded = expandedMap.get(node);
    const hasChildren = hasVisibleChildren(node);
    
    flatNodes.push({ type: 'open', node: node, depth: depth, isExpanded: isExpanded, hasChildren: hasChildren });

    if (isExpanded && hasChildren) {
        if (node.shadowRoot && settings.showShadow) flattenNode(node.shadowRoot, depth + 1);
        node.childNodes.forEach(child => flattenNode(child, depth + 1));
        if (isElement) flatNodes.push({ type: 'close', node: node, depth: depth });
    }
  }

  function hasVisibleChildren(node) {
      if (node.shadowRoot && settings.showShadow) return true;
      if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) return node.childNodes.length > 0;
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      let visibleCount = 0;
      for (let i = 0; i < node.childNodes.length; i++) {
          const n = node.childNodes[i];
          if (isInternalNode(n)) continue;
          if (n.nodeType === Node.COMMENT_NODE && !settings.showComments) continue;
          if (n.nodeType === Node.ELEMENT_NODE || n.nodeType === Node.COMMENT_NODE) { visibleCount++; break; }
          if (n.nodeType === Node.TEXT_NODE && n.textContent.trim()) { visibleCount++; break; }
      }
      return visibleCount > 0;
  }

  function render() {
    if (!containerHeight) containerHeight = container.clientHeight;

    if (settings.wordWrap) {
        const prevScroll = container.scrollTop;
        phantom.style.display = 'none';
        if (Renderer) Renderer.render(rowsContainer, flatNodes, 0, flatNodes.length, ROW_HEIGHT, selectedNode);
        rowsContainer.style.position = 'static'; 
        rowsContainer.style.transform = 'none';
        container.scrollTop = prevScroll;
    } else {
        phantom.style.display = 'block';
        phantom.style.height = `${flatNodes.length * ROW_HEIGHT}px`;
        rowsContainer.style.position = 'absolute';
        const startIdx = Math.floor(scrollTop / ROW_HEIGHT);
        const count = Math.ceil(containerHeight / ROW_HEIGHT) + 5; 
        const endIdx = Math.min(startIdx + count, flatNodes.length);
        if (Renderer) Renderer.render(rowsContainer, flatNodes, startIdx, endIdx, ROW_HEIGHT, selectedNode);
    }
  }

  function toggleNode(node) {
      const currentState = expandedMap.get(node);
      expandedMap.set(node, !currentState);
      rebuildFlatList();
  }

  function selectElement(element) {
      if (!element) return;
      selectedNode = element; 
      const targetDoc = element.ownerDocument;
      const targetRoot = targetDoc ? targetDoc.documentElement : null;
      if (targetRoot && targetRoot !== currentObservedRoot) switchContextTo(targetRoot);

      const docRoot = currentObservedRoot;
      let curr = element;
      let needsRebuild = false;
      while(curr) {
          let parent = curr.parentNode;
          if (curr.nodeType === Node.DOCUMENT_FRAGMENT_NODE && curr.host) parent = curr.host;
          if (parent) {
              if (!expandedMap.get(parent)) { expandedMap.set(parent, true); needsRebuild = true; }
              if (parent === docRoot) break;
              curr = parent;
          } else break;
      }
      if (docRoot && !expandedMap.get(docRoot)) { expandedMap.set(docRoot, true); needsRebuild = true; }

      if (needsRebuild) rebuildFlatList(); else render();
      
      if (settings.wordWrap) {
          const targetRow = Array.from(rowsContainer.children).find(r => r._nodeRef === element);
          if (targetRow) {
              const elTop = targetRow.offsetTop;
              const elBottom = elTop + targetRow.offsetHeight;
              const viewTop = container.scrollTop;
              const viewBottom = viewTop + container.clientHeight;
              
              if (elTop < viewTop || elBottom > viewBottom) {
                  const topPos = elTop - (container.clientHeight / 2) + (targetRow.offsetHeight / 2);
                  container.scrollTo({ top: Math.max(0, topPos), behavior: 'smooth' });
              }
          }
      } else {
          const idx = flatNodes.findIndex(item => item.node === element);
          if (idx !== -1) {
              const topPos = idx * ROW_HEIGHT;
              if (topPos < scrollTop || topPos > scrollTop + containerHeight) {
                   if (container.scrollTo) container.scrollTo({ top: Math.max(0, topPos - (containerHeight / 2)), behavior: 'smooth' });
                   else container.scrollTop = Math.max(0, topPos - (containerHeight / 2));
              }
          }
      }

      if (shadowRoot) {
          if (window.MyDevTool.Inspector) window.MyDevTool.Inspector.hideHighlighters();
          const inspectorPane = shadowRoot.querySelector('#style-inspector-pane');
          if(inspectorPane) inspectorPane.style.display = 'flex'; 
          const inspectorResizeHandle = shadowRoot.querySelector('.inspector-resize-handle');
          if(inspectorResizeHandle) inspectorResizeHandle.style.display = 'block';

          if (window.MyDevTool.DevTool && window.MyDevTool.DevTool.getContainerFor) {
              const stylesCont = window.MyDevTool.DevTool.getContainerFor('styles');
              const computedCont = window.MyDevTool.DevTool.getContainerFor('computed');
              const layoutCont = window.MyDevTool.DevTool.getContainerFor('layout');
              
              let inspectTarget = element;
              if (element.nodeType !== Node.ELEMENT_NODE && element.parentElement) inspectTarget = element.parentElement;

              if (inspectTarget) {
                  if (window.MyDevTool.StylesTab && stylesCont) window.MyDevTool.StylesTab.init(stylesCont, inspectTarget, shadowRoot);
                  if (window.MyDevTool.ComputedTab && computedCont) window.MyDevTool.ComputedTab.init(computedCont, inspectTarget, shadowRoot);
                  if (window.MyDevTool.LayoutTab && layoutCont) window.MyDevTool.LayoutTab.init(layoutCont, inspectTarget);
              }
          }
          
          if (window.MyDevTool.TabManager && window.MyDevTool.TabManager.restoreActiveSubTabContent) {
              window.MyDevTool.TabManager.restoreActiveSubTabContent();
          }

          if (window.MyDevTool.BreadcrumbBar) {
              const crumbTarget = element.nodeType === Node.ELEMENT_NODE ? element : element.parentElement;
              if (crumbTarget) window.MyDevTool.BreadcrumbBar.update(crumbTarget);
          }
      }
  }
  
  function triggerSelection() { if (selectedNode) selectElement(selectedNode); }
  function refreshAttributes() { render(); }
  function setShowDevToolStyles(show) { showDevToolStyles = show; rebuildFlatList(); }

  function renderForConsole(node) {
      if (Renderer) return Renderer.renderForConsole(node);
      return document.createTextNode(String(node));
  }

  return {
    init,
    selectElement,
    refreshAttributes,
    setShowDevToolStyles,
    renderForConsole,
    triggerSelection,
    updateSetting
  };

})();