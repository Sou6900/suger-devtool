// src/modules/element/DomTreeRenderer.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.DomTreeRenderer = (function() {
    let SVGs = null;
    let callbacks = null; // { onToggle, onSelect }
    const voidElements = new Set([
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
        'link', 'meta', 'param', 'source', 'track', 'wbr'
    ]);

    function init(svgs, actionCallbacks) {
        SVGs = svgs;
        callbacks = actionCallbacks;
    }

    function render(rowsContainer, flatNodes, startIdx, endIdx, ROW_HEIGHT, selectedNode) {
        rowsContainer.innerHTML = '';
        rowsContainer.style.transform = `translateY(${startIdx * ROW_HEIGHT}px)`;

        for (let i = startIdx; i < endIdx; i++) {
            if (flatNodes[i]) {
                rowsContainer.appendChild(createRow(flatNodes[i], selectedNode));
            }
        }
    }

    function createRow(data, selectedNode) {
        const row = document.createElement('div');
        row.className = 'v-row';
        row.style.paddingLeft = `${(data.depth * 14) + 20}px`; // INDENT=14, GUTTER=20
        row.style.setProperty('--depth', data.depth);
        row._nodeRef = data.node; 

        if (data.node === selectedNode && data.type !== 'close') { 
            row.classList.add('selected'); 
        }

        // Options Button (...)
        if (data.type !== 'close' && data.node.nodeType === Node.ELEMENT_NODE) {
            const optionsBtn = document.createElement('span'); 
            optionsBtn.className = 'dom-options-btn';
            optionsBtn.innerHTML = SVGs.moreSVG || '...';
            optionsBtn.onclick = (e) => { 
                e.stopPropagation(); 
                const DomActions = window.MyDevTool.DomActions;
                if (DomActions) { 
                    const menuOptions = DomActions.buildContextMenuOptions(data.node, row, row); 
                    window.MyDevTool.ContextMenu.show(e, menuOptions); 
                } 
            };
            row.appendChild(optionsBtn);
        }

        // Toggle Icon
        const icon = document.createElement('span'); 
        icon.className = 'dom-toggle-icon';
        if (data.type === 'open' && data.hasChildren) {
            icon.innerHTML = data.isExpanded ? (SVGs.toggleDownSVG || '▼') : (SVGs.toggleRightSVG || '▶');
            icon.onclick = (e) => { 
                e.stopPropagation(); 
                if(callbacks.onToggle) callbacks.onToggle(data.node); 
            };
        } else { 
            icon.classList.add('empty'); 
        }
        row.appendChild(icon);

        // Content Rendering Logic
        if (data.node.nodeType === Node.COMMENT_NODE) {
            const span = document.createElement('span'); 
            span.className = 'dom-comment'; 
            span.textContent = `<!-- ${data.node.nodeValue} -->`; 
            row.appendChild(span);
        }
        else if (data.node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
            const span = document.createElement('span'); 
            span.className = 'dom-shadow-root'; 
            span.style.color = '#7f8c8d'; 
            span.style.fontStyle = 'italic';
            const mode = data.node.mode || 'open';
            span.textContent = `#shadow-root (${mode})`; 
            row.appendChild(span);
        } 
        else if (data.node.nodeType === Node.TEXT_NODE) {
            const span = document.createElement('span'); 
            span.className = 'dom-text'; 
            span.textContent = `"${data.node.textContent.trim()}"`; 
            row.appendChild(span);
        } 
        else if (data.node.nodeType === Node.ELEMENT_NODE) {
            if (data.type === 'inline') {
                renderInlineElement(row, data.node);
            }
            else if (data.type === 'open') {
                renderOpenTag(row, data.node, data.hasChildren, data.isExpanded);
            }
            else {
                renderCloseTag(row, data.node);
            }
        }
        
        row.oncontextmenu = (e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            if(callbacks.onSelect) callbacks.onSelect(data.node); 
            if(data.node.nodeType === Node.ELEMENT_NODE) { 
                const DomActions = window.MyDevTool.DomActions; 
                if (DomActions) { 
                    const menuOptions = DomActions.buildContextMenuOptions(data.node, row, row); 
                    
                    if (window.MyDevTool.DomBadges) {
                        menuOptions.push({ type: 'separator' });
                        menuOptions.push({
                            label: 'Badge settings...',
                            callback: () => window.MyDevTool.DomBadges.toggleSettings()
                        });
                    }

                    // window.MyDevTool.ContextMenu.show(e, menuOptions); 
                } 
            } 
        };
        return row;
    }

    function renderInlineElement(row, node) {
        // Reuse renderOpenTag to include badges logic automatically
        renderOpenTag(row, node, false, false); 
        
        const textSpan = document.createElement('span');
        textSpan.className = 'dom-text';
        textSpan.textContent = node.textContent; 
        row.appendChild(textSpan);
        
        const tagName = node.tagName.toLowerCase();
        const closeSpan = document.createElement('span');
        closeSpan.innerHTML = `<span class="tag-punctuation">&lt;/</span><span class="tag-name">${tagName}</span><span class="tag-punctuation">&gt;</span>`;
        row.appendChild(closeSpan);
    }

    function renderOpenTag(row, node, hasChildren, isExpanded) {
        const tagName = node.tagName.toLowerCase();
        const p1 = document.createElement('span'); p1.className = 'tag-punctuation'; p1.textContent = '<'; row.appendChild(p1);
        const tag = document.createElement('span'); tag.className = 'tag-name'; tag.textContent = tagName; row.appendChild(tag);

        Array.from(node.attributes).forEach(attr => {
            const attrSpan = document.createElement('span'); attrSpan.className = 'attribute';
            const nameSpan = document.createElement('span'); nameSpan.className = 'attr-name'; nameSpan.textContent = attr.name;
            const eqSpan = document.createElement('span'); eqSpan.className = 'tag-punctuation'; eqSpan.textContent = '=';
            const valSpan = document.createElement('span'); valSpan.className = 'attr-value'; valSpan.textContent = `"${attr.value}"`;
            attrSpan.append(document.createTextNode(' '), nameSpan, eqSpan, valSpan);
            row.appendChild(attrSpan);
        });


        if (window.MyDevTool.DomBadges && node instanceof Element) {
            const badges = window.MyDevTool.DomBadges.render(node);
            if (badges) {
                row.appendChild(badges);
            }
        }

        const p2 = document.createElement('span'); p2.className = 'tag-punctuation';
        if (hasChildren && !isExpanded) {
            p2.textContent = '>'; row.appendChild(p2);
            const ellipsis = document.createElement('span'); ellipsis.className = 'dom-collapsed-ellipsis'; ellipsis.innerHTML = SVGs.ellipsisSVG || '...';
            ellipsis.onclick = (e) => { 
                e.stopPropagation(); 
                if(callbacks.onToggle) callbacks.onToggle(node); 
            }; 
            row.appendChild(ellipsis);
            const closeCompact = document.createElement('span'); closeCompact.innerHTML = `<span class="tag-punctuation">&lt;/</span><span class="tag-name">${tagName}</span><span class="tag-punctuation">&gt;</span>`; row.appendChild(closeCompact);
        } else { 
            p2.textContent = '>'; row.appendChild(p2); 
        }
    }

    function renderCloseTag(row, node) { 
        const tagName = node.tagName.toLowerCase(); 
        row.innerHTML += `<span class="tag-punctuation">&lt;/</span><span class="tag-name">${tagName}</span><span class="tag-punctuation">&gt;</span>`; 
    }

  function renderForConsole(node, depth = 0) {
    if (!SVGs) SVGs = window.MyDevTool.SVGs || {};

    const wrapper = document.createElement('div');
    wrapper.className = 'dom-console-tree';
    wrapper.style.display = 'inline-block';
    wrapper.style.verticalAlign = 'top';
    wrapper.style.fontFamily = 'monospace';
    wrapper.style.fontSize = '12px';

    const tagName = node.tagName.toLowerCase();
    const isVoid = voidElements.has(tagName);

    // Calculate content length for inline decision
    let contentLength = tagName.length * 2 + 5;
    Array.from(node.attributes).forEach(attr => {
      contentLength += attr.name.length + attr.value.length + 4;
    });

    if (!isVoid && node.childNodes.length > 0) {
      node.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          contentLength += child.textContent.trim().length;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          contentLength += 20;
        }
      });
    }

    // INLINE RENDER (< 150 chars)
    if (contentLength < 150 && node.childNodes.length <= 1) {
      const inlineRow = document.createElement('div');
      inlineRow.style.display = 'inline'; // Natural flow

      // Opening tag
      const p1 = document.createElement('span');
      p1.className = 'tag-punctuation';
      p1.textContent = '<';
      inlineRow.appendChild(p1);

      const tName = document.createElement('span');
      tName.className = 'tag-name';
      tName.textContent = tagName;
      inlineRow.appendChild(tName);

      // Attributes
      Array.from(node.attributes).forEach(attr => {
        const space = document.createTextNode(' ');
        const n = document.createElement('span');
        n.className = 'attr-name';
        n.textContent = attr.name;
        const eq = document.createElement('span');
        eq.className = 'tag-punctuation';
        eq.textContent = '=';
        const v = document.createElement('span');
        v.className = 'attr-value';
        v.textContent = `"${attr.value}"`;
        inlineRow.append(space, n, eq, v);
      });

      const p2 = document.createElement('span');
      p2.className = 'tag-punctuation';
      p2.textContent = isVoid ? ' />': '>';
      inlineRow.appendChild(p2);

      // Text content
      if (!isVoid && node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE) {
        const textSpan = document.createElement('span');
        textSpan.className = 'dom-text';
        textSpan.textContent = node.childNodes[0].textContent.trim();
        inlineRow.appendChild(textSpan);
      }

      // Close tag
      if (!isVoid) {
        const closeP1 = document.createElement('span');
        closeP1.className = 'tag-punctuation';
        closeP1.textContent = '</';
        const closeName = document.createElement('span');
        closeName.className = 'tag-name';
        closeName.textContent = tagName;
        const closeP2 = document.createElement('span');
        closeP2.className = 'tag-punctuation';
        closeP2.textContent = '>';
        inlineRow.append(closeP1, closeName, closeP2);
      }

      wrapper.appendChild(inlineRow);
      return wrapper;
    }

    // COLLAPSIBLE RENDER
    let isExpanded = false;

    function renderTree() {
      wrapper.innerHTML = '';

      const row = document.createElement('div');
      row.style.cursor = 'pointer';
      row.style.lineHeight = '1.4';
      row.style.whiteSpace = 'normal';

      // Toggle icon
      const icon = document.createElement('span');
      icon.style.marginRight = '4px';
      icon.style.fontSize = '10px';
      icon.style.color = 'var(--dt-text-secondary, #999)';
      icon.style.display = 'inline-block';
      icon.style.width = '12px';
      icon.style.userSelect = 'none';
      icon.style.verticalAlign = 'text-top';
      icon.textContent = isExpanded ? '▼': '▶';
      icon.onclick = (e) => {
        e.stopPropagation();
        isExpanded = !isExpanded;
        renderTree();
      };
      row.appendChild(icon);

      // Tag content Wrapper
      const tagSpan = document.createElement('span');
      tagSpan.className = 'dom-console-tag';

      const p1 = document.createElement('span');
      p1.className = 'tag-punctuation';
      p1.textContent = '<';
      tagSpan.appendChild(p1);

      const tName = document.createElement('span');
      tName.className = 'tag-name';
      tName.textContent = tagName;
      tagSpan.appendChild(tName);

      // Attributes
      Array.from(node.attributes).forEach(attr => {
        const space = document.createTextNode(' ');
        const n = document.createElement('span');
        n.className = 'attr-name';
        n.textContent = attr.name;
        const eq = document.createElement('span');
        eq.className = 'tag-punctuation';
        eq.textContent = '=';
        const v = document.createElement('span');
        v.className = 'attr-value';
        v.textContent = `"${attr.value}"`;
        tagSpan.append(space, n, eq, v);
      });

      const p2 = document.createElement('span');
      p2.className = 'tag-punctuation';
      p2.textContent = '>';
      tagSpan.appendChild(p2);

      row.appendChild(tagSpan);

      // Ellipsis & Close Tag (Same Line)
      if (!isExpanded && !isVoid) {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'dom-collapsed-ellipsis';
        ellipsis.style.top = '2px';
        ellipsis.innerHTML = SVGs.ellipsisSVG || '…';
        ellipsis.style.margin = '0 2px';
        ellipsis.style.color = 'var(--dt-text-secondary, #999)';
        row.appendChild(ellipsis);

        // Close tag (inline)
        const closeSpan = document.createElement('span');
        const closeP1 = document.createElement('span');
        closeP1.className = 'tag-punctuation';
        closeP1.textContent = '</';
        const closeName = document.createElement('span');
        closeName.className = 'tag-name';
        closeName.textContent = tagName;
        const closeP2 = document.createElement('span');
        closeP2.className = 'tag-punctuation';
        closeP2.textContent = '>';
        closeSpan.append(closeP1, closeName, closeP2);
        row.appendChild(closeSpan);
      }

      wrapper.appendChild(row);

      // Expanded children
      if (isExpanded && !isVoid) {
        const childrenContainer = document.createElement('div');
        childrenContainer.style.paddingLeft = '14px';

        Array.from(node.childNodes).forEach(child => {
          if (child.nodeType === Node.TEXT_NODE && !child.textContent.trim()) return;

          const childDiv = document.createElement('div');

          if (child.nodeType === Node.ELEMENT_NODE) {
            childDiv.appendChild(renderForConsole(child, depth + 1));
          } else if (child.nodeType === Node.TEXT_NODE) {
            const textSpan = document.createElement('span');
            textSpan.className = 'dom-text';
            textSpan.textContent = `"${child.textContent.trim()}"`;
            childDiv.appendChild(textSpan);
          } else if (child.nodeType === Node.COMMENT_NODE) {
            const commentSpan = document.createElement('span');
            commentSpan.className = 'dom-comment';
            commentSpan.textContent = ``;
            childDiv.appendChild(commentSpan);
          }

          childrenContainer.appendChild(childDiv);
        });

        wrapper.appendChild(childrenContainer);

        // Close tag (separate line when expanded)
        const closeLine = document.createElement('div');
        const closeP1 = document.createElement('span');
        closeP1.className = 'tag-punctuation';
        closeP1.textContent = '</';
        const closeName = document.createElement('span');
        closeName.className = 'tag-name';
        closeName.textContent = tagName;
        const closeP2 = document.createElement('span');
        closeP2.className = 'tag-punctuation';
        closeP2.textContent = '>';
        closeLine.append(closeP1,
          closeName,
          closeP2);
        wrapper.appendChild(closeLine);
      }
    }

    renderTree();
    return wrapper;
  }

    return { init, render, renderForConsole };
})();