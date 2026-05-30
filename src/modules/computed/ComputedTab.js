// src/modules/computed/ComputedTab.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.ComputedTab = (function() {

  let currentElement = null;
  let shadowRoot = null;
  let computedStyles = null; 
  let listContainer = null;  
  
  let filterInput = null;
  let showAllInput = null;
  let groupInput = null;

  // Settings
  let settings = {
      hoverHighlight: true,
      showZeroValues: true,
      showTooltip: true
  };

  function loadSettings() {
      const get = (k, def) => localStorage.getItem(k) === null ? def : localStorage.getItem(k) === 'true';
      settings.hoverHighlight = get('dt_computed_box_hover', true);
      settings.showZeroValues = get('dt_computed_show_zero', true);
      settings.showTooltip = get('dt_computed_box_tooltip', true);
  }

  function init(container, element, root) {
    container.innerHTML = ''; 
    currentElement = element;
    shadowRoot = root;
    computedStyles = window.getComputedStyle(element); 
    
    loadSettings();

    buildBoxModel(container, element);

    const separator = document.createElement('hr');
    separator.className = 'inspector-separator';
    container.appendChild(separator);

    buildComputedHeader(container);
    
    listContainer = document.createElement('div');
    listContainer.className = 'computed-list-container';
    container.appendChild(listContainer);
    
    renderComputedList();
  }
  
  function updateSetting(key, val) {
      if (key === 'dt_computed_box_hover') settings.hoverHighlight = val;
      if (key === 'dt_computed_box_tooltip') settings.showTooltip = val;
      if (key === 'dt_computed_show_zero') {
          settings.showZeroValues = val;
          if (currentElement && listContainer && listContainer.parentElement) {
              init(listContainer.parentElement, currentElement, shadowRoot);
          }
      }
  }
  
  function buildComputedHeader(container) {
      const i18n = window.MyDevTool.LanguageManager;
      const header = document.createElement('div');
      header.className = 'computed-header';
      
      filterInput = document.createElement('input');
      filterInput.type = 'text';
      filterInput.placeholder = i18n ? i18n.t('elements.filter_placeholder') : 'Filter';
      filterInput.className = 'computed-filter';
      filterInput.oninput = renderComputedList;
      
      filterInput.addEventListener('click', (e) => e.stopPropagation(), true);
      filterInput.addEventListener('pointerdown', (e) => e.stopPropagation(), true);
      
      const toggleWrapper = document.createElement('div');
      toggleWrapper.className = 'computed-toggles';
      toggleWrapper.addEventListener('click', (e) => e.stopPropagation(), true);
      toggleWrapper.addEventListener('pointerdown', (e) => e.stopPropagation(), true);
      
      const showAllLabel = document.createElement('label');
      showAllInput = document.createElement('input');
      showAllInput.type = 'checkbox';
      showAllInput.onchange = renderComputedList;
      showAllLabel.appendChild(showAllInput);
      showAllLabel.appendChild(document.createTextNode(` ${i18n ? i18n.t('elements.show_all') : 'Show all'}`));
      
      const groupLabel = document.createElement('label');
      groupInput = document.createElement('input');
      groupInput.type = 'checkbox';
      groupInput.checked = true; 
      groupInput.onchange = renderComputedList;
      groupLabel.appendChild(groupInput);
      groupLabel.appendChild(document.createTextNode(` ${i18n ? i18n.t('elements.group') : 'Group'}`));
      
      toggleWrapper.appendChild(showAllLabel);
      toggleWrapper.appendChild(groupLabel);
      
      header.appendChild(filterInput);
      header.appendChild(toggleWrapper);
      container.appendChild(header);
  }

  function triggerHighlight(element, mode) {
      const Inspector = window.MyDevTool.Inspector;
      if (!Inspector) return;

      const options = { 
          show: mode,
          showTooltip: settings.showTooltip
      };
      if (window.MyDevTool.DeviceMode && window.MyDevTool.DeviceMode.isActive()) {
          const iframe = window.MyDevTool.DeviceMode.getIframe();
          if (iframe) {
               const rect = iframe.getBoundingClientRect();
               options.iframeOffset = { x: rect.left, y: rect.top };
               options.scale = window.MyDevTool.DeviceMode.getScale();
          }
      }
      Inspector.highlightElement(element, options);
  }

  function buildBoxModel(container, element) {
    const i18n = window.MyDevTool.LanguageManager;
    const styles = computedStyles; 
    const Inspector = window.MyDevTool.Inspector;
    
    const fmt = (val) => {
        const v = parseFloat(val) || 0;
        return (v === 0 && !settings.showZeroValues) ? '-' : v;
    };

    const mT = fmt(styles.marginTop), mR = fmt(styles.marginRight), mB = fmt(styles.marginBottom), mL = fmt(styles.marginLeft);
    const bT = fmt(styles.borderTopWidth), bR = fmt(styles.borderRightWidth), bB = fmt(styles.borderBottomWidth), bL = fmt(styles.borderLeftWidth);
    const pT = fmt(styles.paddingTop), pR = fmt(styles.paddingRight), pB = fmt(styles.paddingBottom), pL = fmt(styles.paddingLeft);
    const width = parseFloat(styles.width) || 0;
    const height = parseFloat(styles.height) || 0;

    const position = styles.position;
    const isPositioned = position !== 'static';
    
    const posTop = styles.top !== 'auto' ? parseFloat(styles.top) : '-';
    const posRight = styles.right !== 'auto' ? parseFloat(styles.right) : '-';
    const posBottom = styles.bottom !== 'auto' ? parseFloat(styles.bottom) : '-';
    const posLeft = styles.left !== 'auto' ? parseFloat(styles.left) : '-';
    const zIndex = styles.zIndex !== 'auto' ? styles.zIndex : '-';

    const visualizer = document.createElement('div');
    visualizer.className = 'box-model-visualizer';
    
    let innerHTML = `
      <div class="box margin-box" id="box-model-margin">
        <span class="label">${i18n ? i18n.t('elements.box_model.margin') : 'Margin'}</span>
        <span class="value top">${mT}</span><span class="value left">${mL}</span><span class="value right">${mR}</span><span class="value bottom">${mB}</span>
        <div class="box border-box" id="box-model-border">
          <span class="label">${i18n ? i18n.t('elements.box_model.border') : 'Border'}</span>
          <span class="value top">${bT}</span><span class="value left">${bL}</span><span class="value right">${bR}</span><span class="value bottom">${bB}</span>
          <div class="box padding-box" id="box-model-padding">
            <span class="label">${i18n ? i18n.t('elements.box_model.padding') : 'Padding'}</span>
            <span class="value top">${pT}</span><span class="value left">${pL}</span><span class="value right">${pR}</span><span class="value bottom">${pB}</span>
            <div class="box content-box" id="box-model-content">
              <span id="content-size">${width.toFixed(0)} x ${height.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    if (isPositioned) {
        innerHTML = `
        <div class="box position-box" id="box-model-position">
            <span class="label">Position</span>
            <span class="value top">${posTop}</span>
            <span class="value left">${posLeft}</span>
            <span class="value right">${posRight}</span>
            <span class="value bottom">${posBottom}</span>
            <span class="value z-index">z-index: ${zIndex}</span>
            ${innerHTML}
        </div>`;
    }

    visualizer.innerHTML = innerHTML;
    container.appendChild(visualizer);
    
    requestAnimationFrame(() => {
        const formatNode = (el) => {
            const txt = el.textContent;
            if (txt === '-') return;
            let num = parseFloat(txt);
            if (!isNaN(num)) el.textContent = Number(num.toFixed(2));
        };
        visualizer.querySelectorAll('.value:not(.z-index)').forEach(formatNode);

        const lr = visualizer.querySelectorAll('.value.left, .value.right');
        let maxLabel = 0;
        lr.forEach(el => { 
            el.style.whiteSpace = "nowrap"; el.style.maxWidth = "none"; el.style.width = "auto"; 
            const w = el.scrollWidth; 
            el.style.width = (w + 6) + "px"; 
            if (w > maxLabel) maxLabel = w; 
        });

        const MAX_EXPAND = 30, MIN_EXPAND = 24;
        let extra = Math.min(maxLabel + 8, MAX_EXPAND);
        extra = Math.max(extra, MIN_EXPAND);
        
        const boxes = visualizer.querySelectorAll('.box');
        boxes.forEach(box => { 
            box.style.paddingLeft = extra + "px"; 
            box.style.paddingRight = extra + "px"; 
        });
    });

    const marginBox = visualizer.querySelector('#box-model-margin');
    const borderBox = visualizer.querySelector('#box-model-border');
    const paddingBox = visualizer.querySelector('#box-model-padding');
    const contentBox = visualizer.querySelector('#box-model-content');
    const allBoxes = [marginBox, borderBox, paddingBox, contentBox];
    
    const setActiveBox = (activeBox) => { allBoxes.forEach(box => box && box.classList.toggle('inactive', box !== activeBox)); };
    const clearActiveBox = () => { allBoxes.forEach(box => box && box.classList.remove('inactive')); };
    
    if (Inspector) {
      const handleBoxClick = (e, mode, boxEl) => {
          e.stopPropagation();
          const currentMode = Inspector.getHighlightMode();
          if (currentMode === mode) {
              Inspector.setHighlightMode(null);
              Inspector.hideHighlighters();
              clearActiveBox();
          } else {
              Inspector.setHighlightMode(mode);
              setActiveBox(boxEl);
              triggerHighlight(element, mode);
          }
      };

      if(marginBox) marginBox.onclick = (e) => handleBoxClick(e, 'margin', marginBox);
      if(borderBox) borderBox.onclick = (e) => handleBoxClick(e, 'border', borderBox);
      if(paddingBox) paddingBox.onclick = (e) => handleBoxClick(e, 'padding', paddingBox);
      if(contentBox) contentBox.onclick = (e) => handleBoxClick(e, 'content', contentBox);
      
      if (settings.hoverHighlight) {
          const handleHover = (mode) => {
              if (Inspector.getHighlightMode()) return; 
              triggerHighlight(element, mode);
          };
          const handleLeave = () => {
              if (Inspector.getHighlightMode()) return; 
              Inspector.hideHighlighters();
          };

          if(marginBox) { marginBox.onmouseenter = (e) => { e.stopPropagation(); handleHover('margin'); }; marginBox.onmouseleave = handleLeave; }
          if(borderBox) { borderBox.onmouseenter = (e) => { e.stopPropagation(); handleHover('border'); }; borderBox.onmouseleave = handleLeave; }
          if(paddingBox) { paddingBox.onmouseenter = (e) => { e.stopPropagation(); handleHover('padding'); }; paddingBox.onmouseleave = handleLeave; }
          if(contentBox) { contentBox.onmouseenter = (e) => { e.stopPropagation(); handleHover('content'); }; contentBox.onmouseleave = handleLeave; }
      }

      const savedMode = Inspector.getHighlightMode();
      if (savedMode) {
          if (savedMode === 'margin' && marginBox) setActiveBox(marginBox);
          if (savedMode === 'border' && borderBox) setActiveBox(borderBox);
          if (savedMode === 'padding' && paddingBox) setActiveBox(paddingBox);
          if (savedMode === 'content' && contentBox) setActiveBox(contentBox);
          triggerHighlight(element, savedMode);
      }
      
      container.onclick = (e) => { 
          if (e.target === container || e.target === visualizer) { 
              Inspector.setHighlightMode(null); 
              Inspector.hideHighlighters(); 
              clearActiveBox(); 
          } 
      };
    }
  }

  function renderComputedList() {
      const i18n = window.MyDevTool.LanguageManager;
    if (!listContainer) return;
    
    const options = {
        filter: filterInput.value.toLowerCase().trim(),
        showAll: showAllInput.checked,
        group: groupInput.checked
    };
    
    listContainer.innerHTML = ''; 
    
    if (!window.MyDevTool.CSSData) {
        listContainer.innerHTML = `<p>${i18n ? i18n.t('elements.no_css_data') : 'CSSData module missing'}</p>`;
        return;
    }

    const groupedProperties = window.MyDevTool.CSSData.getGroupedProperties();
    let allPropsToShow = [];

    if (options.showAll) {
        allPropsToShow = Array.from(computedStyles);
    } else {
        const defaultElement = document.createElement(currentElement.tagName);
        shadowRoot.appendChild(defaultElement); 
        const defaultStyles = window.getComputedStyle(defaultElement);
        for (let i = 0; i < computedStyles.length; i++) {
            const propName = computedStyles[i];
            if (computedStyles[propName] !== defaultStyles[propName]) {
                allPropsToShow.push(propName);
            }
        }
        shadowRoot.removeChild(defaultElement);
    }

    if (options.filter) {
        allPropsToShow = allPropsToShow.filter(propName => 
            propName.toLowerCase().includes(options.filter)
        );
    }
    
    allPropsToShow.sort(); 

    if (options.group) {
        const groups = {};
        allPropsToShow.forEach(propName => {
            let foundGroup = false;
            for (const groupName in groupedProperties) {
                if (groupedProperties[groupName].includes(propName)) {
                    if (!groups[groupName]) groups[groupName] = [];
                    groups[groupName].push(propName);
                    foundGroup = true;
                    break;
                }
            }
            if (!foundGroup && options.showAll) { 
                const otherKey = i18n ? i18n.t('elements.groups.other') : 'Other';
                if (!groups[otherKey]) groups[otherKey] = [];
                groups[otherKey].push(propName);
            }
        });

        const sortedGroupNames = Object.keys(groups).sort((a, b) => {
            const otherKey = i18n ? i18n.t('elements.groups.other') : 'Other';
            if (a === otherKey) return 1; 
            if (b === otherKey) return -1;
            return a.localeCompare(b); 
        });

        sortedGroupNames.forEach(groupName => {
            const details = document.createElement('details');
            details.open = (options.filter) ? true : false; 
            details.className = 'prop-group'; 
            const summary = document.createElement('summary');
            summary.textContent = groupName; 
            details.appendChild(summary);
            
            const styleList = document.createElement('ul');
            styleList.className = 'prop-list';
            groups[groupName].forEach(propName => {
                appendProperty(styleList, propName);
            });
            
            details.appendChild(styleList);
            listContainer.appendChild(details);
        });
    } else {
        const styleList = document.createElement('ul');
        styleList.className = 'prop-list flat'; 
        allPropsToShow.forEach(propName => {
            appendProperty(styleList, propName);
        });
        listContainer.appendChild(styleList);
    }
  }

  function appendProperty(ul, propName) {
      const propValue = computedStyles[propName];
    if (propValue) {
      const li = document.createElement('li');
      li.innerHTML = `<span class="prop-name">${propName}</span>: <span class="prop-value">${propValue}</span>`;
      ul.appendChild(li);
    }
  }
  
  return {
    init: init,
    updateSetting
  };

})();