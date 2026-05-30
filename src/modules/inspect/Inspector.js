// src/modules/inspect/Inspector.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.Inspector = (function() {

  let isInspecting = false;
  let devToolHost = null;
  let shadowRoot = null;
  let toggleButton = null;
  let lastHighlightedTarget = null; 

  let highlighterMargin, highlighterBorder, highlighterPadding, highlighterContent, tooltipEl;
  
  let settings = {
      enableTooltip: true,
      showHierarchy: true,
      showDimensions: true,
      showColor: true,    
      showBoxModelInfo: false,
      showExtraDetails: true,
      
      overlayMargin: true,
      overlayPadding: true,
      overlayBorder: true,
      overlayContent: true
  };

  let currentHighlightMode = null;
  let hideOnInspect = localStorage.getItem('devtool-hide-on-inspect') === 'true';

  // SVG Icons
  const ICON_BAN = `<svg style="vertical-align:text-bottom; color:#757575;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>`;
  const ICON_CHECK = `<svg style="vertical-align:text-bottom; color:#188038;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

  const TOOLTIP_STYLES = `
    #devtool-tooltip {
      position: fixed !important;
      z-index: 2147483647 !important;
      background: rgba(255, 255, 255, 0.98);
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      color: #333;
      padding: 0;
      pointer-events: none; 
      display: none;
      width: max-content;
      max-width: 320px;
      border: 1px solid #ccc;
      backdrop-filter: blur(2px);
      top: 0; left: 0;
      line-height: 1.6;
    }
    #devtool-tooltip .tt-header { padding: 6px 10px; display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; background: #f8f9fa; border-radius: 4px 4px 0 0; }
    #devtool-tooltip .tt-header.only-header { border-radius: 4px; border-bottom: none; }
    #devtool-tooltip .tt-title { color: #881280; font-weight: bold; font-size: 12px; word-break: break-all; flex: 1; }
    #devtool-tooltip .tt-dims { color: #757575; font-size: 11px; white-space: nowrap; margin-left: 8px; }
    #devtool-tooltip .tt-body { padding: 6px 10px; border-top: 1px solid #eee; }
    #devtool-tooltip .tt-row { display: flex; justify-content: space-between; gap: 15px; }
    #devtool-tooltip .tt-lbl { color: #5f6368; }
    #devtool-tooltip .tt-val { color: #202124; font-family: Consolas, monospace; }
    #devtool-tooltip .tt-separator { border-top: 1px solid #eee; margin: 4px 0; padding: 0; }
    #devtool-tooltip .tt-a11y-header { color: #5f6368; font-size: 10px; text-transform: uppercase; margin-bottom: 2px; font-weight: 600; letter-spacing: 0.5px; margin-top: 2px;}
    .color-preview { display: inline-block; width: 10px; height: 10px; border: 1px solid #ccc; margin-right: 5px; vertical-align: middle; }
    .contrast-badge { display:inline-block; padding:0 4px; border-radius:4px; font-size:10px; font-weight:bold; margin-left:4px; color:#fff;}
  `;

  function init(root, host, button) {
    shadowRoot = root;
    devToolHost = host;
    toggleButton = button;
    loadSettings();
    createHighlighters();
    createTooltip(); 
    const inspectBtn = shadowRoot.querySelector('#inspect-btn');
    if (inspectBtn) inspectBtn.onclick = () => toggleInspectMode();
    window.addEventListener('pointermove', handleInspectMove, { passive: false });
    window.addEventListener('touchmove', handleInspectMove, { passive: false });
    window.addEventListener('click', handleInspectClick, true);
    window.addEventListener('touchend', handleInspectClick, true);
    window.addEventListener('scroll', handleUpdatePosition, true); 
    window.addEventListener('resize', handleUpdatePosition);
  }

  function loadSettings() {
      const get = (k, def) => localStorage.getItem(k) === null ? def : localStorage.getItem(k) === 'true';
      settings.enableTooltip = get('dt_insp_tooltip', true);
      settings.showHierarchy = get('dt_insp_hierarchy', true);
      settings.showDimensions = get('dt_insp_dims', true);
      settings.showColor = get('dt_insp_color', true);
      settings.showBoxModelInfo = get('dt_insp_box_text', false);
      settings.showExtraDetails = get('dt_insp_extra', true);
      
      settings.overlayMargin = get('dt_insp_ov_margin', true);
      settings.overlayPadding = get('dt_insp_ov_padding', true);
      settings.overlayBorder = get('dt_insp_ov_border', true);
      settings.overlayContent = get('dt_insp_ov_content', true);
  }

  function updateSetting(key, value) {
      if (key === 'hideOnInspect') {
          hideOnInspect = value;
          localStorage.setItem('devtool-hide-on-inspect', value);
      } else {
          settings[key] = value;
          const map = {
              enableTooltip: 'dt_insp_tooltip',
              showHierarchy: 'dt_insp_hierarchy',
              showDimensions: 'dt_insp_dims',
              showColor: 'dt_insp_color',
              showBoxModelInfo: 'dt_insp_box_text',
              showExtraDetails: 'dt_insp_extra',
              overlayMargin: 'dt_insp_ov_margin',
              overlayPadding: 'dt_insp_ov_padding',
              overlayBorder: 'dt_insp_ov_border',
              overlayContent: 'dt_insp_ov_content'
          };
          if(map[key]) localStorage.setItem(map[key], value);
      }
  }

  function setHighlightMode(mode) { currentHighlightMode = mode; }
  function getHighlightMode() { return currentHighlightMode; }

  function handleUpdatePosition() {
      if (lastHighlightedTarget && isHighlighterVisible()) refreshHighlight(lastHighlightedTarget);
  }

  function isHighlighterVisible() {
      return (highlighterContent && highlighterContent.style.display === 'block') ||
             (highlighterPadding && highlighterPadding.style.display === 'block') ||
             (highlighterBorder && highlighterBorder.style.display === 'block') ||
             (highlighterMargin && highlighterMargin.style.display === 'block');
  }

  function toggleInspectMode() {
    isInspecting = !isInspecting; 
    const inspectBtn = shadowRoot.querySelector('#inspect-btn');
    if (inspectBtn) inspectBtn.style.color = isInspecting ? '#007bff' : ''; 
    if (isInspecting) {
      document.body.style.cursor = 'default';
      document.body.style.touchAction = 'none';
      if (hideOnInspect && devToolHost) devToolHost.style.display = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.touchAction = '';
      if (devToolHost) devToolHost.style.display = 'block';
      hideHighlighters();
    }
  }

  function getDeepElement(x, y) {
      let el = document.elementFromPoint(x, y);
      while (el && el.shadowRoot) {
          const internalEl = el.shadowRoot.elementFromPoint ? el.shadowRoot.elementFromPoint(x, y) : null;
          if (!internalEl || internalEl === el) break;
          el = internalEl;
      }
      return el;
  }

  function isInternalElement(element) {
      if (!element) return false;
      if (element === toggleButton || (toggleButton && toggleButton.contains(element))) return true;
      const root = element.getRootNode();
      if (root === shadowRoot) return true;
      if (devToolHost && devToolHost.contains(element)) return true;
      if (element.closest) {
          if (element.closest('#dt-emulation-area')) return true; 
          if (element.closest('#dt-device-toolbar')) return true; 
          if (element.closest('#dt-device-dimensions')) return true; 
          if (element.closest('#devtool-tooltip')) return true; 
          if (element.closest('.context-menu')) return true; 
          if (element.closest('[id^="my-devtool-highlighter-"]')) return true; 
      }
      return false;
  }

  function handleInspectMove(event) {
    if (!isInspecting) return;
    if (event.cancelable) event.preventDefault();
    let clientX = event.type === 'touchmove' ? event.touches[0].clientX : event.clientX;
    let clientY = event.type === 'touchmove' ? event.touches[0].clientY : event.clientY;
    const target = getDeepElement(clientX, clientY);
    
    if (!target || isInternalElement(target)) {
      hideHighlighters(); 
      return;
    }
    
    highlightElement(target, { show: 'all' });
  }

  function handleInspectClick(e) {
    if (!isInspecting) return;
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    let clientX = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
    let clientY = e.type === 'touchend' ? e.changedTouches[0].clientY : e.clientY;
    const target = getDeepElement(clientX, clientY);
    
    if (!target || isInternalElement(target)) return;
    window.MyDevTool.TabManager.switchTab("elements");
    handleSelectTarget(target);
  }

  function handleSelectTarget(target) {
    isInspecting = false;
    const inspectBtn = shadowRoot.querySelector('#inspect-btn');
    if(inspectBtn) inspectBtn.style.color = '';
    document.body.style.cursor = '';
    document.body.style.touchAction = ''; 
    if (devToolHost) devToolHost.style.display = 'block';
    if (window.MyDevTool.DomTree) window.MyDevTool.DomTree.selectElement(target);
    hideHighlighters();
  }

  function createHighlighters() {
    const baseStyle = `position: fixed; display: none; box-sizing: border-box; pointer-events: none;`;
    
    highlighterMargin = createDiv(`${baseStyle} z-index: 2147483643; border-style: solid; border-color: rgba(246, 178, 107, 0.6);`, 'my-devtool-highlighter-margin');
    highlighterBorder = createDiv(`${baseStyle} z-index: 2147483644; border-style: solid; border-color: rgba(255, 229, 153, 0.6);`, 'my-devtool-highlighter-border');
    highlighterPadding = createDiv(`${baseStyle} z-index: 2147483645; border-style: solid; border-color: rgba(182, 215, 168, 0.6);`, 'my-devtool-highlighter-padding');
    highlighterContent = createDiv(`${baseStyle} z-index: 2147483646; background-color: rgba(164, 194, 244, 0.6);`, 'my-devtool-highlighter-content');
  }

  function createDiv(css, id) {
      const div = document.createElement('div');
      if(id) div.id = id;
      div.style.cssText = css;
      document.documentElement.appendChild(div);
      return div;
  }

  function createTooltip() {
      if (!document.getElementById('devtool-tooltip-styles')) {
          const style = document.createElement('style');
          style.id = 'devtool-tooltip-styles';
          style.textContent = TOOLTIP_STYLES;
          document.head.appendChild(style);
      }
      if (document.getElementById('devtool-tooltip')) { tooltipEl = document.getElementById('devtool-tooltip'); return; }
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'devtool-tooltip';
      document.body.appendChild(tooltipEl);
  }

  function highlightElement(target, options = {}) {
    lastHighlightedTarget = target;
    const show = options.show || currentHighlightMode || 'all'; 
    hideHighlighters(false); 
    if (!target.isConnected) return; 

    const rect = target.getBoundingClientRect();
    const styles = window.getComputedStyle(target);
    
    const mTop = parseFloat(styles.marginTop)||0, mBot = parseFloat(styles.marginBottom)||0, mLeft = parseFloat(styles.marginLeft)||0, mRight = parseFloat(styles.marginRight)||0;
    const pTop = parseFloat(styles.paddingTop)||0, pBot = parseFloat(styles.paddingBottom)||0, pLeft = parseFloat(styles.paddingLeft)||0, pRight = parseFloat(styles.paddingRight)||0;
    const bTop = parseFloat(styles.borderTopWidth)||0, bBot = parseFloat(styles.borderBottomWidth)||0, bLeft = parseFloat(styles.borderLeftWidth)||0, bRight = parseFloat(styles.borderRightWidth)||0;
    
    const scale = options.scale || 1;
    const offX = options.iframeOffset ? options.iframeOffset.x : 0;
    const offY = options.iframeOffset ? options.iframeOffset.y : 0;
    const screenRect = { 
        top: (rect.top * scale) + offY, 
        left: (rect.left * scale) + offX, 
        width: rect.width * scale, 
        height: rect.height * scale 
    };

    const sMTop = mTop*scale, sMBot = mBot*scale, sMLeft = mLeft*scale, sMRight = mRight*scale;
    const sPTop = pTop*scale, sPBot = pBot*scale, sPLeft = pLeft*scale, sPRight = pRight*scale;
    const sBTop = bTop*scale, sBBot = bBot*scale, sBLeft = bLeft*scale, sBRight = bRight*scale;

    // Pass Borders as Offsets (t,b,l,r) and Paddings as Dimensions (bt,bb...) for Padding Highlighter
    if ((show === 'all' || show === 'margin') && settings.overlayMargin) 
        setHighlightStyle(highlighterMargin, screenRect, sMTop, sMBot, sMLeft, sMRight, true);
    
    if ((show === 'all' || show === 'border') && settings.overlayBorder) 
        setHighlightStyle(highlighterBorder, screenRect, 0,0,0,0, true, sBTop, sBBot, sBLeft, sBRight);
    
    if ((show === 'all' || show === 'padding') && settings.overlayPadding) 
        setHighlightStyle(highlighterPadding, screenRect, sBTop, sBBot, sBLeft, sBRight, true, sPTop, sPBot, sPLeft, sPRight, true);
    
    if ((show === 'all' || show === 'content') && settings.overlayContent) 
        setHighlightStyle(highlighterContent, screenRect, 0,0,0,0, false, sBTop+sPTop, sBBot+sPBot, sBLeft+sPLeft, sBRight+sPRight);

    if ((settings.enableTooltip && show === 'all') || options.showTooltip) {
        updateTooltip(target, screenRect, styles, options.showTooltip);
    }
  }

  function setHighlightStyle(el, rect, t, b, l, r, isBorderMode, bt=0, bb=0, bl=0, br=0, isPadding=false) {
      el.style.display = 'block';
      let top = rect.top, left = rect.left, w = rect.width, h = rect.height;
      
      if(el === highlighterMargin) {
          top -= t; left -= l; w += l+r; h += t+b;
          el.style.borderWidth = `${t}px ${r}px ${b}px ${l}px`;
      } 
      else if (el === highlighterBorder) {
          // Border stays at 0 offset (Element Rect), and width is Border Width
          el.style.borderWidth = `${bt}px ${br}px ${bb}px ${bl}px`;
      } 
      else if (el === highlighterPadding) {
          top += t; left += l; w -= (l+r); h -= (t+b);
          // Width is Padding Width
          el.style.borderWidth = `${bt}px ${br}px ${bb}px ${bl}px`;
      } 
      else if (el === highlighterContent) {
           // Content starts INSIDE Padding + Border
           top += bt; left += bl; w -= (bl+br); h -= (bt+bb);
      }
      el.style.top = `${top}px`; el.style.left = `${left}px`; el.style.width = `${w}px`; el.style.height = `${h}px`;
  }

  function getSelectorPath(element) {
      if (!settings.showHierarchy) {
          let name = element.tagName.toLowerCase();
          if (element.id) name += `#${element.id}`;
          else if (element.className && typeof element.className === 'string' && element.className.trim() !== '') {
               name += `.${element.className.split(' ')[0]}`;
          }
          return name;
      }
      let path = [];
      let current = element;
      while (current && current.tagName !== 'HTML' && path.length < 3) {
          let name = current.tagName.toLowerCase();
          if (current.id) name += `#${current.id}`;
          else if (current.className && typeof current.className === 'string' && current.className.trim() !== '') {
               name += `.${current.className.split(' ')[0]}`;
          }
          path.unshift(name);
          current = current.parentElement;
      }
      return path.join(' > ');
  }

  function truncateStart(str, max) {
      if (str.length <= max) return str;
      return '...' + str.substring(str.length - (max - 3));
  }

  function getLuminance(r, g, b) {
      const a = [r, g, b].map(function (v) {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function parseColor(colorStr) {
      if(!colorStr) return null;
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.fillStyle = colorStr;
      const computed = ctx.fillStyle; 
      if(computed.startsWith('#')) {
          const r = parseInt(computed.slice(1, 3), 16), g = parseInt(computed.slice(3, 5), 16), b = parseInt(computed.slice(5, 7), 16);
          return {r, g, b};
      }
      return null;
  }

  function getContrastInfo(styles) {
      const fg = parseColor(styles.color);
      let bg = parseColor(styles.backgroundColor);
      if (styles.backgroundColor === 'rgba(0, 0, 0, 0)' || styles.backgroundColor === 'transparent') {
          bg = {r: 255, g: 255, b: 255}; 
      }
      if (!fg || !bg) return null;
      const lum1 = getLuminance(fg.r, fg.g, fg.b);
      const lum2 = getLuminance(bg.r, bg.g, bg.b);
      const brightest = Math.max(lum1, lum2);
      const darkest = Math.min(lum1, lum2);
      const ratio = (brightest + 0.05) / (darkest + 0.05);
      let rating = '';
      let color = '#d93025'; 
      if (ratio >= 4.5) { rating = 'AA'; color = '#188038'; }
      if (ratio >= 7.0) { rating = 'AAA'; color = '#188038'; }
      return { ratio: ratio.toFixed(2), rating, color };
  }

  function getA11yInfo(el) {
      const role = el.getAttribute('role') || 'generic';
      const name = el.getAttribute('aria-label') || el.getAttribute('name') || (el.innerText ? el.innerText.substring(0, 20) : '');
      const focusable = el.tabIndex >= 0 && !el.disabled;
      return { role, name, focusable };
  }

  function updateTooltip(element, rect, styles, force = false) {
      if ((!settings.enableTooltip && !force) || !tooltipEl) return;
      if (!styles) styles = window.getComputedStyle(element);
      
      const box = element.getBoundingClientRect();
      const dims = settings.showDimensions ? `<span class="tt-dims">${box.width.toFixed(2)} × ${box.height.toFixed(2)}</span>` : '';
      
      let fullSelector = getSelectorPath(element);
      if (fullSelector.length > 150) fullSelector = truncateStart(fullSelector, 150);

      let html = `
        <div class="tt-header ${!settings.showColor && !settings.showBoxModelInfo && !settings.showExtraDetails ? 'only-header' : ''}">
            <span class="tt-title">${fullSelector}</span>${dims}
        </div>`;

      let bodyHtml = '';
      let hasBody = false;

      if (settings.showColor) {
          hasBody = true;
          bodyHtml += `
            <div class="tt-row"><span class="tt-lbl">Color</span><span class="tt-val"><span class="color-preview" style="background:${styles.color}"></span>${styles.color}</span></div>
            <div class="tt-row"><span class="tt-lbl">Font</span><span class="tt-val">${styles.fontSize} ${styles.fontFamily.split(',')[0]}</span></div>
            <div class="tt-row"><span class="tt-lbl">Background</span><span class="tt-val"><span class="color-preview" style="background:${styles.backgroundColor}"></span>${styles.backgroundColor}</span></div>
          `;
      }

      if (settings.showBoxModelInfo) {
          hasBody = true;
          if (styles.margin !== '0px') bodyHtml += `<div class="tt-row"><span class="tt-lbl" style="color:#f6b26b">Margin</span><span class="tt-val">${styles.margin}</span></div>`;
          if (styles.padding !== '0px') bodyHtml += `<div class="tt-row"><span class="tt-lbl" style="color:#93c47d">Padding</span><span class="tt-val">${styles.padding}</span></div>`;
      }

      if (settings.showExtraDetails) {
          if (hasBody) { bodyHtml += `<div class="tt-separator"></div>`; }
          hasBody = true; 
          
          const a11y = getA11yInfo(element);
          const contrast = getContrastInfo(styles);
          
          bodyHtml += `<div class="tt-a11y-header">Accessibility & Contrast</div>`;
          
          if(a11y.name) bodyHtml += `<div class="tt-row"><span class="tt-lbl">Name</span><span class="tt-val">${a11y.name}</span></div>`;
          bodyHtml += `<div class="tt-row"><span class="tt-lbl">Role</span><span class="tt-val">${a11y.role}</span></div>`;
          
          bodyHtml += `<div class="tt-row"><span class="tt-lbl">Keyboard</span><span class="tt-val" style="display:flex;align-items:center;gap:4px;">
              ${a11y.focusable ? ICON_CHECK : ICON_BAN}
          </span></div>`;
          
          if (contrast) {
              bodyHtml += `<div class="tt-row"><span class="tt-lbl">Contrast</span><span class="tt-val">
                  ${contrast.ratio} <span class="contrast-badge" style="background:${contrast.color}">${contrast.rating}</span>
              </span></div>`;
          }
      }

      if (hasBody) { html += `<div class="tt-body">${bodyHtml}</div>`; }

      tooltipEl.innerHTML = html;
      tooltipEl.style.setProperty('display', 'block', 'important');
      
      const tooltipRect = tooltipEl.getBoundingClientRect();
      let top = rect.top + rect.height + 10; 
      let left = rect.left;
      if (top + tooltipRect.height > window.innerHeight) top = rect.top - tooltipRect.height - 10;
      if (left + tooltipRect.width > window.innerWidth) left = window.innerWidth - tooltipRect.width - 10;
      if (top < 0) top = 10;
      if (left < 0) left = 10;
      tooltipEl.style.top = `${top}px`;
      tooltipEl.style.left = `${left}px`;
  }

  function hideHighlighters(clearTarget = true) {
    if (highlighterMargin) highlighterMargin.style.display = 'none';
    if (highlighterBorder) highlighterBorder.style.display = 'none';
    if (highlighterPadding) highlighterPadding.style.display = 'none';
    if (highlighterContent) highlighterContent.style.display = 'none';
    if (tooltipEl) tooltipEl.style.setProperty('display', 'none', 'important');
    if (clearTarget) lastHighlightedTarget = null;
  }
  
  function refreshHighlight(target) {
    if (isHighlighterVisible()) highlightElement(target);
  }
  
  function handleIframeMove(target, scale, offset) {
      if (!isInspecting) return;
      const finalScale = scale || 1;
      const finalOffset = offset || { x: 0, y: 0 };
      highlightElement(target, { show: 'all', scale: finalScale, iframeOffset: finalOffset });
  }

  function handleIframeClick(target) {
      if (!isInspecting) return;
      handleSelectTarget(target);
  }
  
  return {
    init, highlightElement, hideHighlighters, refreshHighlight, updateSetting,
    isInspecting: () => isInspecting,
    setHighlightMode, getHighlightMode,
    handleIframeMove, handleIframeClick 
  };

})();