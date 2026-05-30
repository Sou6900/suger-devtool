// src/modules/device/DeviceMode.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.DeviceMode = (function() {

  let isActive = false;
  let currentDeviceIndex = 1;
  let isLandscape = false;
  let zoomLevel = 'fit';
  let responsiveWidth = 400;
  let responsiveHeight = 600;

  let toolbar = null;
  let widthInput = null;
  let heightInput = null;
  let dimensionLabel = null;
  let rotateBtn = null;

  let emulationArea = null;
  let deviceScaler = null;
  let deviceFrame = null;
  let scrollArea = null;
  let contentIframe = null;
  let resizeHandle = null;

  let devToolResizeObserver = null;
  let devToolHost = null;
  let resizeDebounceTimer = null;

  // Observers
  let styleSyncObserver = null;
  let headObserver = null;
  let cssomSyncInterval = null;

  let isPinching = false;
  let isPanning = false;
  let isPanStarted = false;
  const PAN_THRESHOLD = 5;

  let startDistance = 0;
  let startScale = 1;
  let panStartX = 0;
  let panStartY = 0;
  let panStartTranslateX = 0;
  let panStartTranslateY = 0;
  let currentScale = 1;
  let currentX = 0;
  let currentY = 0;
  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;
  let lastTapTime = 0;
  let isTapGesture = false;
  let tapStartX = 0;
  let tapStartY = 0;

  const SVGs = {
    rotate: `<svg fill="currentColor" width="18" height="18" viewBox="0 0 24 24"><path d="M21.323 8.616l-4.94-4.94a1.251 1.251 0 0 0-1.767 0l-10.94 10.94a1.251 1.251 0 0 0 0 1.768l4.94 4.94a1.25 1.25 0 0 0 1.768 0l10.94-10.94a1.251 1.251 0 0 0 0-1.768zM14 5.707L19.293 11 11.5 18.793 6.207 13.5zm-4.323 14.91a.25.25 0 0 1-.354 0l-1.47-1.47.5-.5-2-2-.5.5-1.47-1.47a.25.25 0 0 1 0-.354L5.5 14.207l5.293 5.293zm10.94-10.94l-.617.616L14.707 5l.616-.616a.25.25 0 0 1 .354 0l4.94 4.94a.25.25 0 0 1 0 .353zm1.394 6.265V18a3.003 3.003 0 0 1-3 3h-3.292l1.635 1.634-.707.707-2.848-2.847 2.848-2.848.707.707L15.707 20h3.304a2.002 2.002 0 0 0 2-2v-2.058zM4 9H3V7a3.003 3.003 0 0 1 3-3h3.293L7.646 2.354l.707-.707 2.848 2.847L8.354 7.34l-.707-.707L9.28 5H6a2.002 2.002 0 0 0-2 2z"/><path fill="none" d="M0 0h24v24H0z"/></svg>`,
    close: `<svg fill="currentColor" width="18" height="18" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`
  };

  const devices = [{
    name: 'iPhone SE', width: 375, height: 667, value: 0
  },
    {
      name: 'iPhone XR/11', width: 414, height: 896, value: 1
    },
    {
      name: 'iPhone 12/13 Pro', width: 390, height: 844, value: 2
    },
    {
      name: 'iPhone 14 Pro Max', width: 430, height: 932, value: 3
    },
    {
      name: 'Pixel 7', width: 412, height: 915, value: 4
    },
    {
      name: 'Samsung S20/S21', width: 360, height: 800, value: 5
    },
    {
      name: 'Samsung Galaxy S8+', width: 360, height: 740, value: 8
    },
    {
      name: 'Galaxy Z Fold 5', width: 344, height: 882, value: 9
    },
    {
      name: 'Surface Duo', width: 540, height: 720, value: 10
    },
    {
      name: 'iPad Mini', width: 768, height: 1024, value: 6
    },
    {
      name: 'iPad Air', width: 820, height: 1180, value: 7
    },
    {
      name: 'iPad Pro 12.9', width: 1024, height: 1366, value: 11
    },
    {
      name: 'Surface Pro 7', width: 912, height: 1368, value: 12
    },
    {
      name: 'Nest Hub', width: 1024, height: 600, value: 13
    },
    {
      name: 'Laptop (1366x768)', width: 1366, height: 768, value: 16
    },
    {
      name: 'Desktop 1080p', width: 1920, height: 1080, value: 18
    },
    {
      separator: true
    },
    {
      name: 'Responsive', width: 400, height: 600, value: 99
    }];

  function init() {
    devToolHost = document.getElementById('my-devtool-host');
    loadSettings();
    window.addEventListener('resize', () => {
      if (isActive) applyView();
    });
  }

  function getCurrentThemeClass() {
    const SecureStorage = window.MyDevTool.SecureStorage;
    if (SecureStorage) return SecureStorage.getItem('theme') === 'dark' ? 'dark-theme': '';
    return '';
  }

  function loadSettings() {
    const SecureStorage = window.MyDevTool.SecureStorage;
    if (SecureStorage) {
      const saved = SecureStorage.getItem('device_mode_settings');
      if (saved) {
        currentDeviceIndex = saved.index || 1;
        isLandscape = saved.landscape || false;
        isActive = saved.active || false;
        zoomLevel = saved.zoom || 'fit';
        if (saved.resW) responsiveWidth = saved.resW;
        if (saved.resH) responsiveHeight = saved.resH;
        if (isActive) setTimeout(() => enableDeviceMode(), 100);
      }
    }
  }

  function saveSettings() {
    const SecureStorage = window.MyDevTool.SecureStorage;
    if (SecureStorage) {
      SecureStorage.setItem('device_mode_settings', {
        index: currentDeviceIndex,
        landscape: isLandscape,
        active: isActive,
        zoom: zoomLevel,
        resW: responsiveWidth,
        resH: responsiveHeight
      });
    }
  }

  function createToolbar() {
    if (document.getElementById('dt-device-toolbar')) return;
    const bar = document.createElement('div');
    bar.id = 'dt-device-toolbar';
    bar.className = `devtool-container ${getCurrentThemeClass()}`;
    bar.style.zIndex = '2147483647';
    const DropDownMenu = window.MyDevTool.DropDownMenu;
    const deviceOptions = devices.map(d => d.separator ? {
      separator: true
    }: {
      label: d.name, value: d.value
    });
    DropDownMenu.create(bar, {
      items: deviceOptions, initialValue: currentDeviceIndex,
      onSelect: (val) => {
        currentDeviceIndex = val; toggleResponsiveInputs(val === 99); applyView(); saveSettings();
      }
    });
    widthInput = document.createElement('input'); widthInput.type = 'number'; widthInput.className = 'dt-res-input'; widthInput.placeholder = 'W'; widthInput.value = responsiveWidth;
    heightInput = document.createElement('input'); heightInput.type = 'number'; heightInput.className = 'dt-res-input'; heightInput.placeholder = 'H'; heightInput.value = responsiveHeight;
    [widthInput,
      heightInput].forEach(inp => {
        inp.onchange = () => {
          responsiveWidth = parseInt(widthInput.value) || 400; responsiveHeight = parseInt(heightInput.value) || 600; applyView(); saveSettings();
        }; bar.appendChild(inp);
      });
    toggleResponsiveInputs(currentDeviceIndex === 99);
    const zoomOptions = [{
      label: 'Fit to Window',
      value: 'fit'
    },
      {
        separator: true
      },
      {
        label: '50%',
        value: 0.5
      },
      {
        label: '75%',
        value: 0.75
      },
      {
        label: '100%',
        value: 1.0
      },
      {
        label: '125%',
        value: 1.25
      },
      {
        label: '150%',
        value: 1.5
      }];
    DropDownMenu.create(bar, {
      items: zoomOptions, initialValue: zoomLevel, onSelect: (val) => {
        zoomLevel = val; applyView(); saveSettings();
      }
    });
    rotateBtn = document.createElement('button'); rotateBtn.innerHTML = SVGs.rotate; rotateBtn.title = 'Rotate'; rotateBtn.onclick = () => {
      isLandscape = !isLandscape; applyView(); saveSettings();
    }; bar.appendChild(rotateBtn);
    const closeBtn = document.createElement('button'); closeBtn.innerHTML = SVGs.close; closeBtn.title = 'Close'; closeBtn.style.color = '#ff5555'; closeBtn.style.marginLeft = 'auto'; closeBtn.onclick = () => toggle(false); bar.appendChild(closeBtn);
    document.body.appendChild(bar); toolbar = bar;
    toggleResponsiveInputs(currentDeviceIndex === 99);
  }

  function toggleResponsiveInputs(show) {
    if (widthInput && heightInput) {
      widthInput.style.display = show ? 'block': 'none'; heightInput.style.display = show ? 'block': 'none';
    }
    if (resizeHandle) resizeHandle.style.display = show ? 'block': 'none';
    if (rotateBtn) rotateBtn.style.display = show ? 'none': 'block';
  }

  function toggle(forceState = null) {
    if (forceState !== null) isActive = forceState; else isActive = !isActive;
    saveSettings();
    const host = document.getElementById('my-devtool-host');
    if (host && host.shadowRoot) {
      const btn = host.shadowRoot.querySelector('#dt-device-mode-btn'); if (btn) btn.classList.toggle('active', isActive);
    }
    if (isActive) enableDeviceMode(); else disableDeviceMode();
  }

  function enableDeviceMode() {
    if (document.getElementById('dt-emulation-area')) return;
    createToolbar(); toolbar.style.display = 'flex'; toolbar.className = `devtool-container ${getCurrentThemeClass()}`;
    emulationArea = document.createElement('div'); emulationArea.id = 'dt-emulation-area';
    deviceScaler = document.createElement('div'); deviceScaler.id = 'dt-device-scaler';
    deviceFrame = document.createElement('div'); deviceFrame.id = 'dt-device-frame';
    resizeHandle = document.createElement('div'); resizeHandle.id = 'dt-resize-handle';
    resizeHandle.style.display = currentDeviceIndex === 99 ? 'block': 'none';
    setupResizeHandle(resizeHandle);
    deviceFrame.appendChild(resizeHandle);
    scrollArea = document.createElement('div'); scrollArea.id = 'dt-device-scroll-area'; scrollArea.style.cssText = "width:100%; height:100%; overflow:hidden;";
    contentIframe = document.createElement('iframe'); contentIframe.id = 'dt-device-content'; contentIframe.style.cssText = "width:100%; height:100%; border:none; display:block; background:#fff;";
    scrollArea.appendChild(contentIframe); deviceFrame.appendChild(scrollArea); deviceScaler.appendChild(deviceFrame); emulationArea.appendChild(deviceScaler); document.body.appendChild(emulationArea);
    dimensionLabel = document.createElement('div'); dimensionLabel.id = 'dt-device-dimensions';
    dimensionLabel.style.cssText = `position: fixed; top: 40px; right: 15px; background: rgba(32, 33, 36, 0.9); color: #545792; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-family: monospace; z-index: 2147483647; pointer-events: none; font-style:italic;`;
    document.body.appendChild(dimensionLabel);

    setupIframeContent();
    setupResizeObserver();

    scrollArea.addEventListener('touchstart', handleTouchStart, {
      passive: false
    });
    scrollArea.addEventListener('touchmove', handleTouchMove, {
      passive: false
    });
    scrollArea.addEventListener('touchend', handleTouchEnd);
    scrollArea.addEventListener('touchcancel', handleTouchEnd);

    currentScale = 1; currentX = 0; currentY = 0;
    applyView();
  }

  function setupIframeContent() {
    const doc = contentIframe.contentDocument;
    doc.open(); doc.write('<!DOCTYPE html><html><head></head><body></body></html>'); doc.close();

    // COPY HTML ATTRIBUTES
    Array.from(document.documentElement.attributes).forEach(attr => {
      doc.documentElement.setAttribute(attr.name, attr.value);
    });

    const isDevToolScript = (node) => {
      if (node.tagName !== 'SCRIPT') return false;
      const src = (node.src || '').toLowerCase(); const id = (node.id || '').toLowerCase();
      return src.includes('devtool') || src.includes('suger-dev') || id.includes('devtool') || id.includes('suger');
    };

    //  HEAD COPY
    Array.from(document.head.children).forEach(child => {
      if (child.id !== 'devtool-global-styles' && !child.id.startsWith('my-devtool-')) {
        if (isDevToolScript(child)) return;
        cloneNodeToIframe(child, doc.head);
      }
    });

    // COPY BODY ATTRIBUTES
    Array.from(document.body.attributes).forEach(attr => {
      doc.body.setAttribute(attr.name, attr.value);
    });

    //  MOVE BODY CHILDREN
    const bodyChildren = Array.from(document.body.children);
    bodyChildren.forEach(node => {
      if (node.id === 'my-devtool-host' || node.id === 'dt-device-toolbar' || node.id === 'dt-emulation-area' || node.id === 'dt-device-dimensions') return;
      if (isDevToolScript(node)) {
        node.remove(); return;
      }

      if (node.tagName === 'SCRIPT') {
        const newScript = doc.createElement('script');
        Array.from(node.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        if (newScript.hasAttribute('src')) newScript.src = node.src;
        newScript.textContent = node.textContent; doc.body.appendChild(newScript); node.remove();
      } else {
        doc.body.appendChild(node);
      }
    });

    startStyleSync(doc);

    // BRIDGE Events with Scale Passing
    const win = contentIframe.contentWindow;
    const forwardEvent = (e,
      handler) => {
      const rect = contentIframe.getBoundingClientRect();
      const fakeEvent = {
        touches: Array.from(e.touches).map(t => ({
          clientX: t.clientX + rect.left, clientY: t.clientY + rect.top
        })), preventDefault: () => e.preventDefault(), length: e.touches.length
      };
      handler(fakeEvent);
    };
    win.addEventListener('touchstart',
      (e) => {
        forwardEvent(e, handleTouchStart);
      },
      {
        passive: false
      });
    win.addEventListener('touchmove',
      (e) => {
        forwardEvent(e, handleTouchMove);
      },
      {
        passive: false
      });
    win.addEventListener('touchend',
      (e) => {
        handleTouchEnd( {
          touches: e.touches
        });
      });

    win.addEventListener('pointermove',
      (e) => {
        const rect = contentIframe.getBoundingClientRect();

        // Calculate scale from scaler transform
        let scale = 1;
        if (deviceScaler) {
          const match = deviceScaler.style.transform.match(/scale\(([^)]+)\)/);
          if (match && match[1]) scale = parseFloat(match[1]);
        }

        if (window.MyDevTool.Inspector && window.MyDevTool.Inspector.isInspecting()) {
          window.MyDevTool.Inspector.handleIframeMove(e.target, scale, {
            x: rect.left, y: rect.top
          });
        }
      });

    win.addEventListener('click',
      (e) => {
        if (window.MyDevTool.Inspector && window.MyDevTool.Inspector.isInspecting()) {
          e.preventDefault(); e.stopPropagation(); window.MyDevTool.Inspector.handleIframeClick(e.target);
        }
      },
      true);
  }

  function cloneNodeToIframe(node,
    parent) {
    if (node.tagName === 'STYLE') {
      const newStyle = parent.ownerDocument.createElement('style');
      Array.from(node.attributes).forEach(attr => newStyle.setAttribute(attr.name, attr.value));

      let cssText = '';
      try {
        if (node.sheet && node.sheet.cssRules) {
          cssText = Array.from(node.sheet.cssRules).map(r => r.cssText).join('\n');
        }
      } catch(e) {}

      if (cssText) newStyle.textContent = cssText;
      else newStyle.textContent = node.textContent;

      newStyle._originalNode = node;
      parent.appendChild(newStyle);
    } else {
      const clone = node.cloneNode(true);
      if (clone.tagName === 'LINK' && clone.hasAttribute('href')) clone.href = node.href;
      if (clone.tagName === 'SCRIPT' && clone.hasAttribute('src')) clone.src = node.src;
      clone._originalNode = node;
      parent.appendChild(clone);
    }
  }

  function startStyleSync(iframeDoc) {
    if (styleSyncObserver) styleSyncObserver.disconnect();
    if (headObserver) headObserver.disconnect();
    if (cssomSyncInterval) clearInterval(cssomSyncInterval);

    styleSyncObserver = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        if (m.target === document.documentElement || m.target === document.body) {
          const targetIframeNode = (m.target === document.documentElement) ? iframeDoc.documentElement: iframeDoc.body;
          if (m.type === 'attributes') {
            const val = m.target.getAttribute(m.attributeName);
            if (val === null) targetIframeNode.removeAttribute(m.attributeName);
            else targetIframeNode.setAttribute(m.attributeName, val);
          }
        }
      });
    });
    styleSyncObserver.observe(document.documentElement, {
      attributes: true
    });
    styleSyncObserver.observe(document.body, {
      attributes: true
    });

    headObserver = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        if (m.type === 'childList') {
          m.addedNodes.forEach(node => {
            if (node.tagName === 'STYLE' || node.tagName === 'LINK') {
              if (node.id && node.id.startsWith('devtool')) return;
              cloneNodeToIframe(node, iframeDoc.head);
            }
          });
        }
      });
    });
    headObserver.observe(document.head, {
      childList: true
    });

    cssomSyncInterval = setInterval(() => {
      const originalStyles = Array.from(document.head.querySelectorAll('style'));
      const iframeStyles = Array.from(iframeDoc.head.querySelectorAll('style'));

      originalStyles.forEach((orig,
        idx) => {
        if (orig.id && orig.id.startsWith('devtool')) return;
        let currentCSSText = '';
        try {
          if (orig.sheet && orig.sheet.cssRules) {
            currentCSSText = Array.from(orig.sheet.cssRules).map(r => r.cssText).join('\n');
          }
        } catch(e) {}

        if (!currentCSSText) currentCSSText = orig.textContent;
        let mirror = iframeStyles[idx];
        if (orig.id) {
          mirror = iframeDoc.getElementById(orig.id);
        }
        if (mirror && mirror.textContent !== currentCSSText) {
          mirror.textContent = currentCSSText;
        }
      });
    }, 500);
  }

  function setupResizeHandle(handle) {
    let startX, startY, startW, startH;
    const onDown = (e) => {
      e.preventDefault(); e.stopPropagation(); startX = e.clientX; startY = e.clientY; startW = responsiveWidth; startH = responsiveHeight; window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
    };
    const onMove = (e) => {
      let outerScale = 1;
      const match = deviceScaler.style.transform.match(/scale\(([^)]+)\)/);
      if (match && match[1]) outerScale = parseFloat(match[1]);
      const dx = (e.clientX - startX) / outerScale; const dy = (e.clientY - startY) / outerScale;
      responsiveWidth = Math.max(300, Math.round(startW + dx)); responsiveHeight = Math.max(300, Math.round(startH + dy));
      if (widthInput) widthInput.value = responsiveWidth; if (heightInput) heightInput.value = responsiveHeight;
      requestAnimationFrame(applyView);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); saveSettings();
    };
    handle.addEventListener('pointerdown', onDown);
  }

  function disableDeviceMode() {
    if (!emulationArea || !contentIframe) return;
    isActive = false;
    if (styleSyncObserver) {
      styleSyncObserver.disconnect(); styleSyncObserver = null;
    }
    if (headObserver) {
      headObserver.disconnect(); headObserver = null;
    }
    if (cssomSyncInterval) {
      clearInterval(cssomSyncInterval); cssomSyncInterval = null;
    }

    const doc = contentIframe.contentDocument;
    if (doc && doc.body) {
      const fragment = document.createDocumentFragment();
      while (doc.body.firstChild) {
        fragment.appendChild(doc.body.firstChild);
      }
      document.body.appendChild(fragment);
    }
    emulationArea.remove(); toolbar.style.display = 'none';
    if (dimensionLabel) {
      dimensionLabel.remove(); dimensionLabel = null;
    }
    emulationArea = null; deviceFrame = null; scrollArea = null; contentIframe = null; deviceScaler = null; resizeHandle = null;
    if (devToolResizeObserver) devToolResizeObserver.disconnect();
  }

  function setupResizeObserver() {
    if (!devToolHost) devToolHost = document.getElementById('my-devtool-host');
    const container = devToolHost.shadowRoot ? devToolHost.shadowRoot.querySelector('.devtool-container'): null;
    if (container) {
      devToolResizeObserver = new ResizeObserver(() => {
        if (resizeDebounceTimer) clearTimeout(resizeDebounceTimer); resizeDebounceTimer = setTimeout(() => {
          requestAnimationFrame(applyView);
        }, 60);
      }); devToolResizeObserver.observe(container);
    }
  }

  function applyView() {
    if (!isActive || !deviceFrame || !deviceScaler) return;
    const device = devices.find(d => d.value == currentDeviceIndex) || devices[0];
    let dw = currentDeviceIndex === 99 ? responsiveWidth: device.width;
    let dh = currentDeviceIndex === 99 ? responsiveHeight: device.height;
    if (isLandscape && currentDeviceIndex !== 99) {
      const temp = dw; dw = dh; dh = temp;
    }
    deviceFrame.style.setProperty('--dt-frame-w', dw + 'px'); deviceFrame.style.setProperty('--dt-frame-h', dh + 'px');
    if (dimensionLabel) dimensionLabel.textContent = `${dw}px × ${dh}px`;
    let devToolHeight = 0;
    if (devToolHost && devToolHost.shadowRoot) {
      const container = devToolHost.shadowRoot.querySelector('.devtool-container'); if (container && container.style.display !== 'none' && !container.classList.contains('minimized')) {
        devToolHeight = container.offsetHeight;
      }
    }
    const availableW = window.innerWidth; const availableH = window.innerHeight - 40 - devToolHeight - 40;
    let scale = 1;
    if (zoomLevel === 'fit') {
      const scaleW = availableW / (dw + 40); const scaleH = availableH / dh; scale = Math.min(scaleW, scaleH, 1);
    } else {
      scale = parseFloat(zoomLevel);
    }
    deviceScaler.style.transform = `scale(${scale})`;
    if (contentIframe && contentIframe.contentDocument) {
      const doc = contentIframe.contentDocument;
      if (currentScale > 1.01) {
        const bodyH = doc.body.scrollHeight; const htmlH = doc.documentElement.scrollHeight; const fullHeight = Math.max(bodyH, htmlH, dh);
        contentIframe.style.height = `${fullHeight}px`; contentIframe.style.width = `${dw}px`; contentIframe.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`; contentIframe.style.transformOrigin = '0 0'; contentIframe.style.pointerEvents = 'auto';
      } else {
        contentIframe.style.height = '100%'; contentIframe.style.width = '100%'; contentIframe.style.transform = `translate(0px, 0px) scale(1)`;
      }
    }
  }

  function clampTranslation(x, y, scale) {
    if (!contentIframe || !contentIframe.contentDocument) return {
      x,
      y
    };
    const device = devices.find(d => d.value == currentDeviceIndex) || devices[0];
    let dw = currentDeviceIndex === 99 ? responsiveWidth: device.width;
    let dh = currentDeviceIndex === 99 ? responsiveHeight: device.height;
    if (isLandscape && currentDeviceIndex !== 99) {
      const t = dw; dw = dh; dh = t;
    }
    const docEl = contentIframe.contentDocument.documentElement;
    const contentH = parseInt(contentIframe.style.height) || docEl.scrollHeight;
    const scaledW = dw * scale; const scaledH = contentH * scale;
    const viewportW = dw; const viewportH = dh;
    const minX = viewportW - scaledW; const minY = viewportH - scaledH;
    return {
      x: Math.min(Math.max(x, minX), 0),
      y: Math.min(Math.max(y, minY), 0)
    };
  }

  function getDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX; const dy = touches[0].clientY - touches[1].clientY; return Math.sqrt(dx * dx + dy * dy);
  }
  function getFocalPoint(touches) {
    const screenX = (touches[0].clientX + touches[1].clientX) / 2; const screenY = (touches[0].clientY + touches[1].clientY) / 2; const rect = scrollArea.getBoundingClientRect(); return {
      x: screenX - rect.left,
      y: screenY - rect.top
    };
  }

  function handleTouchStart(e) {
    const currentTime = new Date().getTime();
    if (e.touches.length === 2) {
      isTapGesture = false; isPanning = false; isPinching = true; e.preventDefault();
      if (currentScale <= 1.01 && contentIframe.contentWindow) {
        const win = contentIframe.contentWindow; currentX = -win.scrollX; currentY = -win.scrollY;
      }
      startDistance = getDistance(e.touches); startScale = currentScale; startX = currentX; startY = currentY;
    } else if (e.touches.length === 1) {
      isTapGesture = true; tapStartX = e.touches[0].clientX; tapStartY = e.touches[0].clientY; const tapLength = currentTime - lastTapTime;
      if (tapLength < 300 && tapLength > 0 && lastTapTime !== 0) {
        e.preventDefault(); handleDoubleTap(e); lastTapTime = 0; isTapGesture = false; return;
      }
      if (currentScale > 1.01) {
        isPinching = false; isPanning = true; isPanStarted = false; panStartX = e.touches[0].clientX; panStartY = e.touches[0].clientY; panStartTranslateX = currentX; panStartTranslateY = currentY;
      }
    }
  }

  function handleDoubleTap(e) {
    if (currentScale > 1.1) {
      currentScale = 1; currentX = 0; currentY = 0;
    } else {
      if (contentIframe.contentWindow) {
        const win = contentIframe.contentWindow; const scrollTop = win.scrollY; const scrollLeft = win.scrollX;
        const tapX = e.touches[0].clientX; const tapY = e.touches[0].clientY; const rect = scrollArea.getBoundingClientRect();
        const viewX = tapX - rect.left; const viewY = tapY - rect.top;
        const contentX = viewX + scrollLeft; const contentY = viewY + scrollTop;
        const targetScale = 2.5; let newX = viewX - (contentX * targetScale); let newY = viewY - (contentY * targetScale);
        currentScale = targetScale; currentX = newX; currentY = newY;
      }
    } applyView(); if (currentScale > 1.1) {
      requestAnimationFrame(() => {
        const clamped = clampTranslation(currentX, currentY, currentScale); if (clamped.x !== currentX || clamped.y !== currentY) {
          currentX = clamped.x; currentY = clamped.y; applyView();
        }
      });
    }
  }

  function handleTouchMove(e) {
    if (e.touches.length === 1 && isTapGesture) {
      const moveX = Math.abs(e.touches[0].clientX - tapStartX); const moveY = Math.abs(e.touches[0].clientY - tapStartY); if (moveX > 10 || moveY > 10) {
        isTapGesture = false;
      }
    }
    if (isPinching && e.touches.length === 2) {
      e.preventDefault(); isTapGesture = false; const currentDistance = getDistance(e.touches); const scaleRatio = currentDistance / startDistance;
      let newScale = startScale * scaleRatio; newScale = Math.max(1.0, Math.min(newScale, 5.0)); const ratio = newScale / startScale;
      let newX = originX - (originX - startX) * ratio; let newY = originY - (originY - startY) * ratio;
      if (newScale <= 1.01) {
        newX = 0; newY = 0; newScale = 1.0;
      } else {
        const clamped = clampTranslation(newX, newY, newScale); newX = clamped.x; newY = clamped.y;
      }
      currentScale = newScale; currentX = newX; currentY = newY; applyView();
    } else if (isPanning && e.touches.length === 1 && currentScale > 1.01) {
      const dx = e.touches[0].clientX - panStartX; const dy = e.touches[0].clientY - panStartY;
      if (!isPanStarted) {
        if (Math.abs(dx) > PAN_THRESHOLD || Math.abs(dy) > PAN_THRESHOLD) {
          isPanStarted = true;
        }
      }
      if (isPanStarted) {
        e.preventDefault(); let newX = panStartTranslateX + dx; let newY = panStartTranslateY + dy; const clamped = clampTranslation(newX, newY, currentScale); currentX = clamped.x; currentY = clamped.y; applyView();
      }
    }
  }

  function handleTouchEnd(e) {
    const currentTime = new Date().getTime();
    if (e.touches.length === 0) {
      if (isTapGesture) {
        lastTapTime = currentTime;
      } else {
        lastTapTime = 0;
      }
      isPinching = false; isPanning = false; isTapGesture = false;
      if (currentScale > 1) {
        const clamped = clampTranslation(currentX, currentY, currentScale); currentX = clamped.x; currentY = clamped.y; requestAnimationFrame(applyView);
      }
    } else if (isPinching && e.touches.length < 2) {
      isPinching = false;
    }
  }

  return {
    init,
    toggle,
    isActive: () => isActive,
    getIframe: () => contentIframe,
    getScale: () => {
      if (!deviceScaler) return 1; const match = deviceScaler.style.transform.match(/scale\(([^)]+)\)/); return match && match[1] ? parseFloat(match[1]): 1;
    }
  };
})();