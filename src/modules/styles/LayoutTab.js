// src/modules/styles/LayoutTab.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.LayoutTab = (function() {

  let container = null;
  let gridListContainer = null;
  let flexListContainer = null;
  let SVGs = null;
  
  // Caching System
  let cachedWrapper = null;
  const elementToRowMap = new WeakMap(); // DOM Node Cache (Element -> Row Div)
  const elementColors = new WeakMap();   // Color Cache
  
  let scanTimeout = null;

  // Chrome-like colors
  const colors = [
    '#f47fbe', '#75e2e7', '#d7aefb', '#f6a623', '#b8e986', 
    '#bd10e0', '#50e3c2', '#4a90e2', '#f8e71c', '#7ed321'
  ];
  let gridColorIndex = 0;
  let flexColorIndex = 0;

  function init(containerEl) {
    container = containerEl;
    SVGs = window.MyDevTool.SVGs;
    
    // REUSE CACHE
    if (cachedWrapper) {
        if (!container.contains(cachedWrapper)) {
            container.appendChild(cachedWrapper);
        }
        setTimeout(() => scanAndRenderLists(true), 0);
        return;
    }

    renderUI();
    
    setTimeout(() => scanAndRenderLists(), 500);
    
    // Mutation Observer (Live Updates)
    const observer = new MutationObserver((mutations) => {
        const isInternal = mutations.some(m => isInternalElement(m.target));
        if (isInternal) return;

        if (scanTimeout) clearTimeout(scanTimeout);
        scanTimeout = setTimeout(() => {
            const host = document.getElementById('my-devtool-host');
            if (host && host.style.display === 'none') return;
            scanAndRenderLists(true); 
        }, 1000);
    });
    
    observer.observe(document.body, { 
        childList: true, 
        subtree: true, 
        attributes: true, 
        attributeFilter: ['style', 'class'] 
    });
  }

  function isInternalElement(el) {
      if (!el) return true;
      if (el.nodeType !== 1) return el.parentElement ? isInternalElement(el.parentElement) : true;
      const id = el.id || '';
      if (id === 'my-devtool-host' || id.startsWith('my-devtool-') || id.startsWith('devtool-')) return true;
      if (el.classList.contains('__devtool-overlay__')) return true;
      if (el.classList.contains('cm-colorpicker')) return true;
      if (el.closest('#my-devtool-host')) return true;
      if (el.classList.contains('tooltip-header')) return true;
      if (el.id && el.id.startsWith('dt-badge-overlay-')) return true; 
      return false;
  }

  function renderUI() {
    const i18n = window.MyDevTool.LanguageManager;
    
    const refreshSVG = SVGs.refreshSVG || '<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>';
    const editSVG = SVGs.editSVG || '<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';

    const wrapper = document.createElement('div');
    wrapper.className = 'layout-tab-wrapper';
    
    wrapper.innerHTML = `
        <div class="layout-section">
            <div class="layout-header">${i18n.t('layout.page') || 'PAGE'}</div>
            <div class="layout-element-list">
                <div class="layout-row" id="layout-refresh-btn" style="cursor: pointer;">
                    <span class="layout-color-swatch" style="background:none; border:none; margin:0 6px 0 0; display:flex; align-items:center;">${refreshSVG}</span>
                    <span class="layout-label" style="font-family: inherit;">${i18n.t('layout.refresh_page') || 'Refresh page'}</span>
                </div>
                <label class="layout-row" style="cursor: pointer;">
                    <span class="layout-color-swatch" style="background:none; border:none; margin:0 6px 0 0; display:flex; align-items:center;">${editSVG}</span>
                    <span class="layout-label" style="font-family: inherit; flex-grow:1;">${i18n.t('layout.design_mode') || 'Make page editable'}</span>
                    <input type="checkbox" class="layout-toggle-checkbox" id="layout-design-mode-toggle">
                </label>
            </div>
        </div>

        <div class="layout-section">
            <div class="layout-header">${i18n.t('layout.grid')}</div>
            <div class="layout-subsection">
                <div class="layout-sub-header">${i18n.t('layout.overlay_settings')}</div>
                <div class="layout-setting-row">
                    <select class="layout-select">
                        <option>${i18n.t('layout.show_line_numbers')}</option>
                        <option>Hide line numbers</option>
                    </select>
                </div>
                <label class="layout-checkbox-row"><input type="checkbox"> ${i18n.t('layout.show_track_sizes')}</label>
                <label class="layout-checkbox-row"><input type="checkbox"> ${i18n.t('layout.show_area_names')}</label>
                <label class="layout-checkbox-row"><input type="checkbox"> ${i18n.t('layout.extend_grid_lines')}</label>
            </div>
            <div class="layout-sub-header" style="margin-top:10px;">${i18n.t('layout.grid_overlays')}</div>
            <div id="layout-grid-list" class="layout-element-list"></div>
        </div>

        <div class="layout-section">
            <div class="layout-header">${i18n.t('layout.flexbox')}</div>
            <div class="layout-sub-header">${i18n.t('layout.flex_overlays')}</div>
            <div id="layout-flex-list" class="layout-element-list"></div>
        </div>
    `;

    container.appendChild(wrapper);
    cachedWrapper = wrapper;

    gridListContainer = wrapper.querySelector('#layout-grid-list');
    flexListContainer = wrapper.querySelector('#layout-flex-list');

    const refreshBtn = wrapper.querySelector('#layout-refresh-btn');
    refreshBtn.onclick = () => window.location.reload();

    const designToggle = wrapper.querySelector('#layout-design-mode-toggle');
    designToggle.checked = document.designMode === 'on';
    designToggle.onchange = (e) => { document.designMode = e.target.checked ? 'on' : 'off'; };
  }

  function scanAndRenderLists(keepState = false) {
    const i18n = window.MyDevTool.LanguageManager;
    
    const allElements = document.querySelectorAll('*');
    const gridElements = [];
    const flexElements = [];

    // Filter elements first
    allElements.forEach(el => {
        if (isInternalElement(el)) return;
        const style = window.getComputedStyle(el);
        const display = style.display;

        if (display === 'grid' || display === 'inline-grid') {
            gridElements.push(el);
        } else if (display === 'flex' || display === 'inline-flex') {
            flexElements.push(el);
        }
    });

    // Smart Reconciliation call
    reconcileList(gridListContainer, gridElements, 'grid', i18n.t('layout.no_grid'));
    reconcileList(flexListContainer, flexElements, 'flex', i18n.t('layout.no_flex'));
  }

  // Reconciliation Logic (Diffing)
  function reconcileList(listContainer, elements, type, emptyMsg) {
     const activeRowNodes = new Set();
     const fragment = document.createDocumentFragment();

     if (elements.length === 0) {
         listContainer.innerHTML = `<div class="layout-empty">${emptyMsg}</div>`;
         return;
     }

     // 1. Process elements (Create or Reuse Row)
     elements.forEach(el => {
         let row = elementToRowMap.get(el);
         let color = elementColors.get(el);

         // Color assignment logic
         if (!color) {
             if (type === 'grid') {
                 color = colors[gridColorIndex % colors.length];
                 gridColorIndex++;
             } else {
                 color = colors[flexColorIndex % colors.length];
                 flexColorIndex++;
             }
             elementColors.set(el, color);
         }

         if (!row) {
             // New Element: Create Row
             row = createRow(el, color, type);
             elementToRowMap.set(el, row);
         } else {
             // Existing Element: Update State (Checkbox & Label)
             updateRowState(row, el, color, type);
         }

         activeRowNodes.add(row);
         fragment.appendChild(row); // Moves existing node to new position without destroying
     });

     // 2. Remove obsolete rows from DOM
     const currentChildren = Array.from(listContainer.children);
     currentChildren.forEach(child => {
         if (!activeRowNodes.has(child)) {
             child.remove();
         }
     });
     
     // 3. Append reconciled list (Remove empty msg if exists)
     const emptyEl = listContainer.querySelector('.layout-empty');
     if (emptyEl) emptyEl.remove();
     
     listContainer.appendChild(fragment);
  }

  function createRow(element, color, type) {
      const row = document.createElement('div');
      row.className = 'layout-row';
      row._element = element;

      row.innerHTML = `
        <label class="layout-check-wrapper">
            <input type="checkbox" class="layout-toggle-checkbox">
            <span class="layout-label"></span>
        </label>
        <span class="layout-color-swatch"></span>
        <button class="layout-jump-btn" title="Scroll to element">➔</button>
      `;

      updateRowState(row, element, color, type);

      // Event Listeners (ONLY ONCE)
      const checkbox = row.querySelector('input');
      checkbox.onchange = (e) => {
          if (window.MyDevTool.DomBadges) {
              if (e.target.checked) {
                  window.MyDevTool.DomBadges.enableOverlay(element, type, color);
              } else {
                  window.MyDevTool.DomBadges.disableOverlay(element);
              }
          }
      };

      const jumpBtn = row.querySelector('.layout-jump-btn');
      jumpBtn.onclick = () => {
          if (window.MyDevTool.DomTree) window.MyDevTool.DomTree.selectElement(element);
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (window.MyDevTool.Inspector) {
              window.MyDevTool.Inspector.highlightElement(element);
              setTimeout(() => window.MyDevTool.Inspector.hideHighlighters(), 1500);
          }
      };

      return row;
  }

  function updateRowState(row, element, color, type) {
      const tagName = element.tagName.toLowerCase();
      const id = element.id ? '#' + element.id : '';
      const cls = element.classList.length > 0 ? '.' + element.classList[0] : '';
      const labelText = `${tagName}${id}${cls}`;
      
      // Sync with DomBadges (Latest Update)
      const isChecked = window.MyDevTool.DomBadges && window.MyDevTool.DomBadges.hasOverlay(element);
      
      const checkbox = row.querySelector('input');
      const label = row.querySelector('.layout-label');
      const swatch = row.querySelector('.layout-color-swatch');

      if (checkbox.checked !== isChecked) checkbox.checked = isChecked;
      if (label.textContent !== labelText) {
          label.textContent = labelText;
          label.title = labelText;
      }
      if (swatch.style.backgroundColor !== color) swatch.style.backgroundColor = color;
  }

  return { init };

})();