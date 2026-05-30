// src/modules/element/DomBadges.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.DomBadges = (function() {

  let settingsContainer = null;
  let activeHighlights = new Map();
  let resizeObserver = null;
  let scrollListenerAttached = false;
  let rootEl = null;

  // Distinct Colors
  const COLOR_PALETTE = [
    '#6c3ed8', '#12a34e', '#af6f1b', '#2979ff',
    '#d500f9', '#ff1744', '#00e5ff', '#ffd600'
  ];
  let colorIndex = 0;

  function getNextColor() {
    const color = COLOR_PALETTE[colorIndex % COLOR_PALETTE.length];
    colorIndex++;
    return color;
  }

  const BADGE_TYPES = [{
    id: 'grid', label: 'grid', check: (s) => s.display.includes('grid')
  },
    {
      id: 'subgrid', label: 'subgrid', check: (s) => s.gridTemplateColumns.includes('subgrid') || s.gridTemplateRows.includes('subgrid')
    },
    {
      id: 'flex', label: 'flex', check: (s) => s.display.includes('flex')
    },
    {
      id: 'ad', label: 'ad', check: (s, n) => n.classList.contains('ad') || n.id.includes('ad-')
    },
    {
      id: 'scroll-snap', label: 'scroll-snap', check: (s) => s.scrollSnapType !== 'none'
    },
    {
      id: 'container', label: 'container', check: (s) => s.containerType !== 'normal' && s.containerType !== ''
    },
    {
      id: 'slot', label: 'slot', check: (s, n) => n.tagName === 'SLOT'
    },
    {
      id: 'top-layer', label: 'top-layer', check: (s, n) => n.classList.contains(':modal') || n.tagName === 'DIALOG'
    },
    {
      id: 'reveal', label: 'reveal', check: (s, n) => n.hasAttribute('reveal')
    }];

  function hexToRgba(hex, alpha) {
    if (!hex.startsWith('#')) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const HATCH_PATTERN = (color) => {
    let rgba = color.startsWith('#') ? hexToRgba(color, 0.55): color;
    return `repeating-linear-gradient(45deg, transparent, transparent 3px, ${rgba} 3px, ${rgba} 4px)`;
  };

  let enabledBadges = [];

  function loadConfig() {
    try {
      enabledBadges = JSON.parse(localStorage.getItem('dt-enabled-badges')) || ['grid',
        'flex',
        'scroll-snap',
        'container'];
    } catch(e) {
      enabledBadges = ['grid',
        'flex'];
    }
  }

  function init(rootContainer) {
    rootEl = rootContainer;
    loadConfig();

    if (settingsContainer) {
      updateSettingsBarUI();
      return;
    }
    createSettingsBar(rootContainer);

    if (!scrollListenerAttached) {
      window.addEventListener('scroll', updateAllOverlays, true);
      window.addEventListener('resize', updateAllOverlays);
      scrollListenerAttached = true;
    }

    resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateAllOverlays);
    });
  }

  function syncSettings() {
    loadConfig();
    updateSettingsBarUI();
  }

  function createSettingsBar(root) {
    settingsContainer = document.createElement('div');
    settingsContainer.className = 'badge-settings-bar';
    settingsContainer.style.display = 'none';

    const header = document.createElement('div');
    header.className = 'badge-settings-header';
    const closeBtn = document.createElement('span');
    closeBtn.className = 'badge-settings-close';
    closeBtn.innerHTML = window.MyDevTool.SVGs && window.MyDevTool.SVGs.close ? window.MyDevTool.SVGs.close: '✕';
    closeBtn.onclick = () => {
      settingsContainer.style.display = 'none';
    };
    header.appendChild(closeBtn);

    const optionsWrapper = document.createElement('div');
    optionsWrapper.className = 'badge-options-wrapper';

    BADGE_TYPES.forEach(type => {
      const label = document.createElement('label');
      label.className = 'badge-option';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.dataset.id = type.id;
      checkbox.checked = enabledBadges.includes(type.id);
      checkbox.onchange = (e) => toggleBadgeSetting(type.id, e.target.checked);
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(` ${type.label}`));
      optionsWrapper.appendChild(label);
    });

    settingsContainer.appendChild(optionsWrapper);
    settingsContainer.appendChild(header);
    root.appendChild(settingsContainer);
  }

  function updateSettingsBarUI() {
    if (!settingsContainer) return;
    const checkboxes = settingsContainer.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(chk => {
      chk.checked = enabledBadges.includes(chk.dataset.id);
    });
  }

  function toggleBadgeSetting(id, isChecked) {
    if (isChecked) {
      if (!enabledBadges.includes(id)) enabledBadges.push(id);
    } else {
      enabledBadges = enabledBadges.filter(b => b !== id);
    }
    localStorage.setItem('dt-enabled-badges', JSON.stringify(enabledBadges));
    if (window.MyDevTool.DomTree && window.MyDevTool.DomTree.refreshAttributes) {
      window.MyDevTool.DomTree.refreshAttributes();
    }
  }

  function toggleSettings() {
    if (settingsContainer) {
      const isHidden = settingsContainer.style.display === 'none';
      settingsContainer.style.display = isHidden ? 'flex': 'none';
    }
  }

  // Render & Highlight Logic

  function render(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE || !(node instanceof Element)) return null;

    const styles = window.getComputedStyle(node);
    const container = document.createElement('span');
    container.className = 'dom-badges-wrapper';

    BADGE_TYPES.forEach(badge => {
      if (enabledBadges.includes(badge.id)) {
        if (badge.check(styles, node)) {
          const badgeEl = document.createElement('span');
          badgeEl.className = 'dom-badge';
          badgeEl.textContent = badge.label;
          badgeEl.dataset.type = badge.id;

          if (activeHighlights.has(node)) {
            const data = activeHighlights.get(node);
            if (data.type === badge.id) {
              badgeEl.classList.add('active');
              badgeEl.style.backgroundColor = data.color;
              badgeEl.style.borderColor = data.color;
              badgeEl.style.color = '#fff';
            }
          }

          badgeEl.onclick = (e) => {
            e.stopPropagation();
            toggleHighlight(node, badge, badgeEl);
          };

          container.appendChild(badgeEl);
        }
      }
    });

    return container.children.length > 0 ? container: null;
  }

  function toggleHighlight(node,
    badgeObj,
    badgeEl) {
    const isActive = activeHighlights.has(node);
    const activeData = activeHighlights.get(node);

    if (isActive && activeData.type === badgeObj.id) {
      disableOverlay(node);
      if (badgeEl) {
        badgeEl.classList.remove('active');
        badgeEl.style.backgroundColor = '';
        badgeEl.style.borderColor = '';
        badgeEl.style.color = '';
      }
    } else {
      if (isActive) disableOverlay(node);

      if (badgeEl && badgeEl.parentElement) {
        badgeEl.parentElement.querySelectorAll('.dom-badge').forEach(b => {
          b.classList.remove('active');
          b.style.backgroundColor = '';
          b.style.borderColor = '';
          b.style.color = '';
        });
      }

      const color = getNextColor();
      enableOverlay(node, badgeObj.id, color);

      if (badgeEl) {
        badgeEl.classList.add('active');
        badgeEl.style.backgroundColor = color;
        badgeEl.style.borderColor = color;
        badgeEl.style.color = '#fff';
      }
    }
  }

  // API FOR EXTERNAL USE (LayoutTab)

  function enableOverlay(node, type, forcedColor) {
    if (!node || !node.isConnected) return;
    if (activeHighlights.has(node)) removeOverlay(node);

    const badgeObj = BADGE_TYPES.find(b => b.id === type) || {
      id: type,
      label: type
    };
    const color = forcedColor || getNextColor();

    createOverlay(node, badgeObj, color);
    resizeObserver.observe(node);

    const data = activeHighlights.get(node);
    if (data) data.color = color;
  }

  function disableOverlay(node) {
    removeOverlay(node);
    resizeObserver.unobserve(node);
  }

  function hasOverlay(node) {
    return activeHighlights.has(node);
  }

  function getUniqueId(node) {
    if (!node._dt_id) node._dt_id = Math.random().toString(36).substr(2, 9);
    return node._dt_id;
  }

  // Overlay Creation

  function createOverlay(node, badgeObj, color) {
    const overlay = document.createElement('div');
    overlay.id = 'dt-badge-overlay-' + getUniqueId(node);

    overlay.style.position = 'fixed';
    overlay.style.zIndex = '2147483640';
    overlay.style.pointerEvents = 'none';
    overlay.style.boxSizing = 'border-box';
    overlay.style.border = `2px dashed ${color}`;
    overlay.style.backgroundColor = 'transparent';

    const label = document.createElement('span');
    label.textContent = `${node.tagName.toLowerCase()} ${badgeObj.label}`;
    label.style.position = 'absolute';
    label.style.top = '-18px';
    label.style.left = '-2px';
    label.style.background = color;
    label.style.color = '#fff';
    label.style.fontSize = '10px';
    label.style.padding = '1px 4px';
    label.style.borderRadius = '2px';
    label.style.whiteSpace = 'nowrap';
    label.style.fontWeight = 'bold';
    overlay.appendChild(label);

    const separatorContainer = document.createElement('div');
    separatorContainer.className = 'dt-separator-container';
    separatorContainer.style.position = 'absolute';
    separatorContainer.style.top = '0';
    separatorContainer.style.left = '0';
    separatorContainer.style.width = '100%';
    separatorContainer.style.height = '100%';
    separatorContainer.style.zIndex = '0';
    overlay.appendChild(separatorContainer);

    document.body.appendChild(overlay);

    activeHighlights.set(node, {
      overlay, color, type: badgeObj.id
    });
    updateOverlayPosition(node, overlay, color);
  }

  function removeOverlay(node) {
    const data = activeHighlights.get(node);
    if (data && data.overlay) {
      data.overlay.remove();
      activeHighlights.delete(node);
    }
  }

  // Draw Logic (Grid/Flex)

  function getChildBounds(node) {
    const bounds = [];
    Array.from(node.children).forEach(c => {
      const s = window.getComputedStyle(c);
      if (s.display !== 'none' && s.position !== 'absolute' && s.position !== 'fixed') {
        bounds.push(c.getBoundingClientRect());
      }
    });
    node.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0) {
        const range = document.createRange();
        range.selectNodeContents(child);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) bounds.push(rect);
      }
    });
    return bounds;
  }

  function updateOverlayPosition(node,
    overlay,
    color) {
    if (!overlay) {
      const data = activeHighlights.get(node);
      if (!data) return;
      overlay = data.overlay;
      color = data.color;
    }

    const rect = node.getBoundingClientRect();
    const styles = window.getComputedStyle(node);
    const badgeType = activeHighlights.get(node).type;

    let boxRect = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    };

    const pTop = parseFloat(styles.paddingTop) || 0;
    const pLeft = parseFloat(styles.paddingLeft) || 0;
    const pRight = parseFloat(styles.paddingRight) || 0;
    const pBottom = parseFloat(styles.paddingBottom) || 0;
    const bTop = parseFloat(styles.borderTopWidth) || 0;
    const bLeft = parseFloat(styles.borderLeftWidth) || 0;
    const bRight = parseFloat(styles.borderRightWidth) || 0;
    const bBottom = parseFloat(styles.borderBottomWidth) || 0;

    boxRect.top += (bTop + pTop);
    boxRect.left += (bLeft + pLeft);
    boxRect.width -= (bLeft + bRight + pLeft + pRight);
    boxRect.height -= (bTop + bBottom + pTop + pBottom);

    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;

    if (window.MyDevTool.DeviceMode && window.MyDevTool.DeviceMode.isActive()) {
      const iframe = window.MyDevTool.DeviceMode.getIframe();
      if (iframe && iframe.contentDocument && iframe.contentDocument.contains(node)) {
        const iframeRect = iframe.getBoundingClientRect();
        scale = window.MyDevTool.DeviceMode.getScale();
        offsetX = iframeRect.left;
        offsetY = iframeRect.top;
      }
    }

    overlay.style.width = `${Math.max(0, boxRect.width * scale)}px`;
    overlay.style.height = `${Math.max(0, boxRect.height * scale)}px`;
    overlay.style.top = `${(boxRect.top * scale) + offsetY}px`;
    overlay.style.left = `${(boxRect.left * scale) + offsetX}px`;

    const container = overlay.querySelector('.dt-separator-container');
    if (container) {
      container.innerHTML = '';
      const absoluteParentRect = {
        top: boxRect.top,
        left: boxRect.left,
        width: boxRect.width,
        height: boxRect.height,
        right: boxRect.left + boxRect.width,
        bottom: boxRect.top + boxRect.height
      };

      if (badgeType === 'grid' || badgeType === 'subgrid') {
        drawGridSeparators(node, container, scale, color, absoluteParentRect, styles);
      } else if (badgeType === 'flex') {
        drawFlexSeparators(node, container, scale, color, absoluteParentRect, styles);
      }
    }
  }

  function drawBox(container, x, y, w, h, bg, border) {
    if (w < 0.5 || h < 0.5) return;
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    div.style.width = `${w}px`;
    div.style.height = `${h}px`;
    if (bg) {
      div.style.background = bg;
      if (bg.includes('radial')) div.style.backgroundSize = '3px 3px';
    }
    if (border) div.style.border = border;
    container.appendChild(div);
  }

  function drawFlexSeparators(node, container, scale, color, parentRect, styles) {
    const children = Array.from(node.children).filter(c => {
      const cs = window.getComputedStyle(c);
      return cs.display !== 'none' && cs.position !== 'absolute' && cs.position !== 'fixed';
    });
    if (children.length < 1) return;

    const childRects = children.map(c => c.getBoundingClientRect());
    const rowGap = parseFloat(styles.rowGap) || 0;
    const columnGap = parseFloat(styles.columnGap) || 0;
    const gap = parseFloat(styles.gap) || 0;
    const effRowGap = rowGap || gap;
    const effColGap = columnGap || gap;
    const isRow = styles.flexDirection.startsWith('row');
    const isWrap = styles.flexWrap !== 'nowrap';
    const hatchStyle = HATCH_PATTERN(color);
    const dottedBorder = `2px dotted ${color}`;

    const drawRect = (x, y, w, h, type) => {
      if (type !== 'line' && (w < 0.5 || h < 0.5)) return;

      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.left = `${x}px`;
      div.style.top = `${y}px`;
      div.style.width = `${w}px`;
      div.style.height = `${h}px`;

      if (type === 'gap') {
        div.style.backgroundImage = hatchStyle;
        div.style.border = 'none';
      } else if (type === 'alignment') {
        div.style.backgroundColor = 'transparent';
        div.style.border = dottedBorder;
        div.style.opacity = '0.5';
        div.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      } else if (type === 'line') {
        div.style.backgroundColor = 'transparent';
        div.style.opacity = '0.8';

        if (h > w) {
          div.style.width = '0px';
          div.style.borderLeft = `2px dotted ${color}`;
        } else {
          div.style.height = '0px';
          div.style.borderTop = `2px dotted ${color}`;
        }
      }
      container.appendChild(div);
    };

    if (isWrap) {
      const drawnVertical = new Set();
      const drawnHorizontal = new Set();
      const isDuplicate = (set, pos) => set.has(Math.round(pos)) ? true: (set.add(Math.round(pos)) && false);

      const groupItems = (rects, isRowLayout) => {
        if (rects.length === 0) return [];
        const sorted = [...rects].sort((a, b) => isRowLayout
          ? (Math.abs(a.top - b.top) > 10 ? a.top - b.top: a.left - b.left): (Math.abs(a.left - b.left) > 10 ? a.left - b.left: a.top - b.top)
        );

        const lines = [];
        let currentLine = [sorted[0]];
        for (let i = 1; i < sorted.length; i++) {
          const curr = sorted[i];
          const prev = currentLine[currentLine.length - 1];
          let isSameLine = false;
          if (isRowLayout) {
            if (curr.top < prev.bottom - 5) isSameLine = true;
          } else {
            if (curr.left < prev.right - 5) isSameLine = true;
          }
          if (isSameLine) currentLine.push(curr); else {
            lines.push(currentLine); currentLine = [curr];
          }
        }
        lines.push(currentLine);
        return lines;
      };

      if (isRow) {
        const rows = groupItems(childRects, true);
        rows.forEach(rowItems => {
          if (rowItems.length === 0) return;
          rowItems.sort((a, b) => a.left - b.left);
          for (let i = 0; i < rowItems.length - 1; i++) {
            const curr = rowItems[i]; const next = rowItems[i+1]; const dist = next.left - curr.right;
            if (dist >= 1 && effColGap > 0) {
              const hatchSize = Math.min(dist, effColGap); const x = (curr.right - parentRect.left) * scale;
              if (!isDuplicate(drawnVertical, x)) drawRect(x, 0, hatchSize * scale, parentRect.height * scale, 'gap');
            }
          }
          const lastItem = rowItems[rowItems.length - 1];
          const endSpace = parentRect.width - (lastItem.right - parentRect.left);
          const rowTop = Math.min(...rowItems.map(r => r.top)); const rowBottom = Math.max(...rowItems.map(r => r.bottom));
          const rowH = (rowBottom - rowTop) * scale; const rowY = (rowTop - parentRect.top) * scale;
          const startSpace = rowItems[0].left - parentRect.left;
          if (startSpace >= 1) drawRect(0, rowY, startSpace * scale, rowH, 'alignment');
          if (endSpace >= 1) {
            const startX = (lastItem.right - parentRect.left) * scale; drawRect(startX, rowY, endSpace * scale, rowH, 'alignment');
          }
        });
        for (let i = 0; i < rows.length - 1; i++) {
          const currRow = rows[i]; const nextRow = rows[i+1];
          const maxBottom = Math.max(...currRow.map(r => r.bottom)); const minTop = Math.min(...nextRow.map(r => r.top)); const dist = minTop - maxBottom;
          if (dist >= 1 && effRowGap > 0) {
            const hatchSize = Math.min(dist, effRowGap); const y = (maxBottom - parentRect.top) * scale;
            if (!isDuplicate(drawnHorizontal, y)) drawRect(0, y, parentRect.width * scale, hatchSize * scale, 'gap');
          }
        }
      } else {
        const cols = groupItems(childRects, false);
        cols.forEach(colItems => {
          colItems.sort((a, b) => a.top - b.top);
          for (let i = 0; i < colItems.length - 1; i++) {
            const curr = colItems[i]; const next = colItems[i+1]; const dist = next.top - curr.bottom;
            if (dist >= 1 && effRowGap > 0) {
              const hatchSize = Math.min(dist, effRowGap); const y = (curr.bottom - parentRect.top) * scale;
              if (!isDuplicate(drawnHorizontal, y)) drawRect(0, y, parentRect.width * scale, hatchSize * scale, 'gap');
            }
          }
          const lastItem = colItems[colItems.length - 1]; const endSpace = parentRect.height - (lastItem.bottom - parentRect.top);
          const colLeft = Math.min(...colItems.map(c => c.left)); const colRight = Math.max(...colItems.map(c => c.right));
          const colW = (colRight - colLeft) * scale; const colX = (colLeft - parentRect.left) * scale;
          const startSpace = colItems[0].top - parentRect.top;
          if (startSpace >= 1) drawRect(colX, 0, colW, startSpace * scale, 'alignment');
          if (endSpace >= 1) {
            const startY = (lastItem.bottom - parentRect.top) * scale; drawRect(colX, startY, colW, endSpace * scale, 'alignment');
          }
        });
        for (let i = 0; i < cols.length - 1; i++) {
          const currCol = cols[i]; const nextCol = cols[i+1];
          const maxRight = Math.max(...currCol.map(r => r.right)); const minLeft = Math.min(...nextCol.map(r => r.left)); const dist = minLeft - maxRight;
          if (dist >= 1 && effColGap > 0) {
            const hatchSize = Math.min(dist, effColGap); const x = (maxRight - parentRect.left) * scale;
            if (!isDuplicate(drawnVertical, x)) drawRect(x, 0, hatchSize * scale, parentRect.height * scale, 'gap');
          }
        }
      }
    } else {
      const groupItems = (rects, isRowLayout) => {
        if (rects.length === 0) return [];
        const sorted = [...rects].sort((a, b) => isRowLayout ? a.left - b.left: a.top - b.top);
        const lines = []; let currentLine = [sorted[0]];
        for (let i = 1; i < sorted.length; i++) {
          const curr = sorted[i]; const prev = currentLine[currentLine.length - 1];
          let isSameLine = false;
          if (isRowLayout) {
            if (curr.top < prev.bottom - 2) isSameLine = true;
          } else {
            if (curr.left < prev.right - 2) isSameLine = true;
          }
          if (isSameLine) currentLine.push(curr); else {
            lines.push(currentLine); currentLine = [curr];
          }
        }
        lines.push(currentLine); return lines;
      };
      const lines = groupItems(childRects, isRow);
      lines.forEach(lineItems => {
        if (lineItems.length === 0) return;
        lineItems.sort((a, b) => isRow ? a.left - b.left: a.top - b.top);
        let lineStartCross,
        lineEndCross;
        if (isRow) {
          if (lines.length === 1) {
            lineStartCross = 0; lineEndCross = parentRect.height;
          } else {
            const minTop = Math.min(...lineItems.map(r => r.top)); const maxBottom = Math.max(...lineItems.map(r => r.bottom)); lineStartCross = minTop - parentRect.top; lineEndCross = (maxBottom - minTop);
          }
        } else {
          if (lines.length === 1) {
            lineStartCross = 0; lineEndCross = parentRect.width;
          } else {
            const minLeft = Math.min(...lineItems.map(r => r.left)); const maxRight = Math.max(...lineItems.map(r => r.right)); lineStartCross = minLeft - parentRect.left; lineEndCross = (maxRight - minLeft);
          }
        }
        for (let i = 0; i < lineItems.length - 1; i++) {
          const curr = lineItems[i]; const next = lineItems[i+1]; const dist = isRow ? (next.left - curr.right): (next.top - curr.bottom);
          if (dist >= 1) {
            const cssGap = isRow ? effColGap: effRowGap;
            const hatchSize = (cssGap > 0) ? Math.min(dist, cssGap): 0;
            const alignSize = dist - hatchSize;
            let startMain,
            startCross,
            sizeCross;
            if (isRow) {
              startMain = (curr.right - parentRect.left) * scale; startCross = lineStartCross * scale; sizeCross = lineEndCross * scale;
            } else {
              startMain = (curr.bottom - parentRect.top) * scale; startCross = lineStartCross * scale; sizeCross = lineEndCross * scale;
            }
            if (hatchSize > 0) {
              if (isRow) drawRect(startMain, startCross, hatchSize * scale, sizeCross, 'gap'); else drawRect(startCross, startMain, sizeCross, hatchSize * scale, 'gap');
            }
            if (alignSize > 0.5) {
              const offset = startMain + (hatchSize * scale); if (isRow) drawRect(offset, startCross, alignSize * scale, sizeCross, 'alignment'); else drawRect(startCross, offset, sizeCross, alignSize * scale, 'alignment');
            }
          } else {
            if (isRow) drawRect((curr.right - parentRect.left) * scale, lineStartCross * scale, 1, lineEndCross * scale, 'line');
            else drawRect(lineStartCross * scale, (curr.bottom - parentRect.top) * scale, lineEndCross * scale, 1, 'line');
          }
        }
      });
    }
  }

  function drawGridSeparators(node,
    container,
    scale,
    color,
    parentRect,
    styles) {
    const childRects = getChildBounds(node);
    if (childRects.length === 0) return;

    const rowGap = parseFloat(styles.rowGap) || parseFloat(styles.gap) || 0;
    const colGap = parseFloat(styles.columnGap) || parseFloat(styles.gap) || 0;
    const hatchStyle = HATCH_PATTERN(color);

    const rows = new Set();
    const cols = new Set();

    rows.add(0); rows.add(parentRect.height);
    cols.add(0); cols.add(parentRect.width);

    childRects.forEach(r => {
      rows.add(r.top - parentRect.top); rows.add(r.bottom - parentRect.top);
      cols.add(r.left - parentRect.left); cols.add(r.right - parentRect.left);
    });

    const sortedRows = Array.from(rows).sort((a, b) => a - b);
    for (let i = 0; i < sortedRows.length - 1; i++) {
      const top = sortedRows[i]; const bottom = sortedRows[i + 1]; const height = bottom - top;
      const isRowGap = rowGap > 0 && height > rowGap * 0.6 && height < rowGap * 1.4;
      if (isRowGap) drawBox(container, 0, top * scale, parentRect.width * scale, height * scale, hatchStyle, null);
    }

    const colCount = getGridTrackCount(styles.gridTemplateColumns);
    if (colCount > 1 && colGap > 0) {
      const totalGap = colGap * (colCount - 1); const usableWidth = parentRect.width - totalGap; const colWidth = usableWidth / colCount;
      let x = colWidth;
      for (let i = 0; i < colCount - 1; i++) {
        drawBox(container, x * scale, 0, colGap * scale, parentRect.height * scale, hatchStyle, null);
        x += colGap + colWidth;
      }
    }
    drawGridNumbers(container, scale, color, styles, parentRect);
  }

  function drawGridNumbers(container, scale, color, styles, parentRect) {
    const colCount = getGridTrackCount(styles.gridTemplateColumns);
    const rowCount = getGridTrackCount(styles.gridTemplateRows);
    const labelStyle = `position:absolute; background:${color}; color:#fff; font-size:9px; padding:1px 3px; border-radius:2px; font-weight:bold; pointer-events:none; transform:translate(-50%, -50%); z-index:10002; opacity:0.9;`;

    const colLineCount = colCount + 1; const colSize = parentRect.width / colCount;
    for (let i = 1; i <= colLineCount; i++) {
      const el = document.createElement('span'); el.textContent = i; el.style.cssText = labelStyle; el.style.left = `${(i - 1) * colSize * scale}px`; el.style.top = `6px`; container.appendChild(el);
    }
    for (let i = colLineCount; i >= 1; i--) {
      const el = document.createElement('span'); el.textContent = i - colLineCount - 1; el.style.cssText = labelStyle; el.style.left = `${(i - 1) * colSize * scale}px`; el.style.top = `${parentRect.height * scale - 6}px`; container.appendChild(el);
    }

    const rowLineCount = rowCount + 1; const rowSize = parentRect.height / rowCount;
    for (let i = 1; i <= rowLineCount; i++) {
      const el = document.createElement('span'); el.textContent = i; el.style.cssText = labelStyle; el.style.left = `6px`; el.style.top = `${(i - 1) * rowSize * scale}px`; container.appendChild(el);
    }
    for (let i = rowLineCount; i >= 1; i--) {
      const el = document.createElement('span'); el.textContent = i - rowLineCount - 1; el.style.cssText = labelStyle; el.style.left = `${parentRect.width * scale - 6}px`; el.style.top = `${(i - 1) * rowSize * scale}px`; container.appendChild(el);
    }
  }

  function getGridTrackCount(template) {
    if (!template || template === 'none') return 0;
    const expanded = template.replace(/repeat\((\d+),\s*([^)]+)\)/g, (_, count, value) => Array(+count).fill(value).join(' '));
    return expanded.trim().split(/\s+/).length;
  }

  function updateAllOverlays() {
    activeHighlights.forEach((data, node) => {
      if (!node.isConnected) removeOverlay(node);
      else updateOverlayPosition(node, data.overlay, data.color);
    });
  }

  return {
    init, render, toggleSettings, syncSettings, enableOverlay, disableOverlay, hasOverlay
  };
})();