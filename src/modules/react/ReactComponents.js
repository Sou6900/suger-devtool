// src/modules/react/ReactComponents.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.ReactComponents = (function() {
    let container = null;
    let treeContainer = null;
    let propsContainer = null;
    let shadowRoot = null;
    
    let flatNodes = [];
    let expandedMap = new Map(); 
    let forceExpandFibers = new Set();
    let selectedFiber = null;
    let selectedPseudoNode = null;
    let filterText = "";
    let hideHostNodes = false; 

    function init(tabContainer, root) {
        container = tabContainer;
        shadowRoot = root;
        treeContainer = shadowRoot.querySelector('#react-tree-container');
        propsContainer = shadowRoot.querySelector('#react-props-container');

        if (window.MyDevTool.SuggestionBox) {
            window.MyDevTool.SuggestionBox.init(shadowRoot);
        }

        const SVGs = window.MyDevTool.SVGs || {}; 
        const toolbar = shadowRoot.querySelector('.react-toolbar');
        
        if (toolbar && !shadowRoot.querySelector('#react-filter-host')) {
            const label = document.createElement('label');
            label.style.cssText = 'font-size: 11px; color: var(--dt-text-primary); display: flex; align-items: center; gap: 4px; cursor: pointer; padding: 0 5px; border-right: 1px solid var(--dt-border-color);';
            label.innerHTML = `<input type="checkbox" id="react-filter-host" checked style="margin:0;"> Hide HTML tags`;
            toolbar.insertBefore(label, shadowRoot.querySelector('#react-search-input'));
            
            label.querySelector('input').onchange = (e) => { 
                hideHostNodes = e.target.checked; 
                refresh(); 
            };
        }

        const searchInput = shadowRoot.querySelector('#react-search-input');
        if (searchInput) {
            searchInput.oninput = (e) => { 
                filterText = e.target.value.trim(); 
                refresh(); 
            };
        }

        const inspectBtn = shadowRoot.querySelector('#react-toolbar-inspect');
        if (inspectBtn) {
            inspectBtn.onclick = (e) => {
                e.stopPropagation(); 
                if (window.MyDevTool.ReactHighlighter) {
                    window.MyDevTool.ReactHighlighter.toggle(inspectBtn);
                } else {
                    console.warn("ReactHighlighter module is missing or not loaded yet!");
                }
            };
        }

        refresh();
    }

    function getComponentName(fiber) {
        if (!fiber) return 'Unknown';
        const { type, tag } = fiber;

        if (typeof type === 'string') return type; 
        if (typeof type === 'function') return type.displayName || type.name || 'Anonymous';
        
        if (tag === 3) return 'Root';
        if (tag === 7) return 'Fragment';
        if (tag === 8) return 'StrictMode';
        if (tag === 10) return 'Provider';
        if (tag === 9) return 'Consumer';
        if (tag === 13) return 'Suspense';
        
        if (type && typeof type === 'object') {
            if (type.displayName) return type.displayName;
            if (tag === 11) return (type.render?.displayName || type.render?.name || 'ForwardRef');
            if (tag === 15) return (type.type?.displayName || type.type?.name || 'Memo');
        }

        return 'Component';
    }

    function getBadges(fiber) {
        let badges = [];
        if (fiber.tag === 11) badges.push('ForwardRef');
        if (fiber.tag === 15) badges.push('Memo');
        if (fiber.tag === 13) badges.push('Suspense');
        if (fiber.tag === 10) badges.push('Provider');
        if (fiber.tag === 9) badges.push('Consumer');
        
        if (fiber.type && fiber.type.$$typeof) {
            const typeStr = String(fiber.type.$$typeof);
            if (typeStr.includes('memo') && !badges.includes('Memo')) badges.push('Memo');
        }
        return badges;
    }

    function toggleNode(pseudoNode) {
        const path = pseudoNode._path;
        if (path) {
            const currentState = expandedMap.get(path) !== false;
            expandedMap.set(path, !currentState);
        } else {
            const fiber = pseudoNode._fiber;
            const currentState = expandedMap.get(fiber) !== false;
            expandedMap.set(fiber, !currentState);
            if (fiber.alternate) expandedMap.set(fiber.alternate, !currentState);
        }
        refresh(); 
    }

    function updateInspector() {
        if (window.MyDevTool.ReactInspector) {
            window.MyDevTool.ReactInspector.render(selectedFiber, propsContainer, updateInspector);
        }
    }

    function selectNode(pseudoNode) {
        selectedFiber = pseudoNode._fiber;
        selectedPseudoNode = pseudoNode; 
        refresh(); 
        updateInspector(); 
    }

    function selectNodeByFiber(targetFiber) {
        if (!targetFiber) return;

        let fiberToSelect = targetFiber;
        if (hideHostNodes) {
            while (fiberToSelect && typeof fiberToSelect.type === 'string') {
                fiberToSelect = fiberToSelect.return;
            }
        }
        
        if (!fiberToSelect) return;

        forceExpandFibers.clear();
        let curr = fiberToSelect.return;
        while (curr) {
            forceExpandFibers.add(curr);
            if (curr.alternate) forceExpandFibers.add(curr.alternate);
            curr = curr.return;
        }

        selectedFiber = fiberToSelect;
        selectedPseudoNode = null; 
        refresh(); 
        updateInspector(); 

        setTimeout(() => {
            if (!treeContainer) return;
            const selectedEl = treeContainer.querySelector('#selected-fiber-row');
            if (selectedEl) {
                selectedEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const origBg = selectedEl.style.backgroundColor;
                selectedEl.style.backgroundColor = 'rgba(56, 189, 248, 0.4)';
                setTimeout(() => selectedEl.style.backgroundColor = origBg, 600);
            }
            forceExpandFibers.clear(); 
        }, 50);
    }

    function refresh() {
        if (!window.__suger_react_root) return;
        flatNodes = [];
        traverseFiber(window.__suger_react_root.current, 0, "root");

        if (filterText) {
            const isRegex = filterText.startsWith('/') && filterText.endsWith('/');
            let regex = null;
            try { if (isRegex && filterText.length > 2) regex = new RegExp(filterText.slice(1, -1), 'i'); } catch(e) {}
            flatNodes = flatNodes.filter(n => {
                const name = n.node.tagName.toLowerCase();
                return regex ? regex.test(name) : name.includes(filterText.toLowerCase());
            });
        }
        
        refreshUI();

        if (selectedFiber && propsContainer) {
            let matchedNode = flatNodes.find(n => 
                n.node._fiber === selectedFiber || 
                n.node._fiber === selectedFiber.alternate || 
                (selectedFiber.stateNode && n.node._fiber.stateNode === selectedFiber.stateNode)
            );
            
            if (!matchedNode && selectedPseudoNode && selectedPseudoNode._path) {
                 matchedNode = flatNodes.find(n => n.node._path === selectedPseudoNode._path);
            }

            if (matchedNode) {
                const isFiberChanged = selectedFiber !== matchedNode.node._fiber;
                selectedFiber = matchedNode.node._fiber;
                selectedPseudoNode = matchedNode.node;
                
                if (isFiberChanged) {
                    updateInspector();
                }
            }
        }
    }

    function safeStringify(obj) {
        const cache = new WeakSet();
        return JSON.stringify(obj, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (cache.has(value)) return '[Circular Reference]';
                cache.add(value);
                if (value.$$typeof && typeof value.$$typeof === 'symbol') return `<${typeof value.type === 'string' ? value.type : (value.type?.name || 'Component')} />`;
                if (value instanceof Node) return value.tagName ? `<${value.tagName.toLowerCase()}>` : `[Node ${value.nodeName}]`;
                if (key.startsWith('__reactFiber') || key.startsWith('__reactInternal')) return '[React Fiber]';
                if (value === window) return '[Window]';
            }
            if (typeof value === 'function') return `ƒ ${value.name || '()'}()`;
            if (typeof value === 'symbol') return value.toString();
            return value;
        }, 2) || '{}';
    }

    function showContextMenu(triggerEvent, nodeData) {
        if (!window.MyDevTool.ContextMenu) return;
        
        const fiber = nodeData.node._fiber;
        const name = nodeData.node.tagName;
        const path = nodeData.node._path;

        const copyToClipboard = (text) => {
            navigator.clipboard.writeText(text).catch(err => console.error("Copy failed", err));
        };

        const expandCollapseChildren = (basePath, isExpand) => {
            flatNodes.forEach(n => {
                if (n.node._path && n.node._path.startsWith(basePath)) {
                    expandedMap.set(n.node._path, isExpand);
                }
            });
            refresh();
        };

        const options = [
            {
                label: 'Log fiber to console ($r)',
                callback: () => {
                    console.log(`[Suger] <${name}>:`, fiber);
                    window.$r = fiber;
                    if (window.MyDevTool.TabManager) window.MyDevTool.TabManager.switchTab("console");
                }
            },
            {
                label: 'Scroll to element',
                callback: () => {
                    let elFiber = fiber;
                    while (elFiber && !(elFiber.stateNode instanceof Element)) elFiber = elFiber.child;
                    if (elFiber && elFiber.stateNode instanceof Element) {
                        elFiber.stateNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        const origBg = elFiber.stateNode.style.backgroundColor;
                        elFiber.stateNode.style.backgroundColor = 'rgba(56, 189, 248, 0.5)';
                        setTimeout(() => { elFiber.stateNode.style.backgroundColor = origBg; }, 1000);
                    } else {
                        console.warn("[Suger] No DOM element found for this component.");
                    }
                }
            },
            { type: 'separator' },
            {
                label: 'Copy data...',
                sub: [
                    { label: 'Component Name', callback: () => copyToClipboard(`<${name} />`) },
                    { label: 'Props (JSON)', callback: () => copyToClipboard(safeStringify(fiber.memoizedProps)) },
                    { label: 'State (JSON)', callback: () => copyToClipboard(safeStringify(fiber.memoizedState)) }
                ]
            },
            { type: 'separator' },
            { label: 'Expand all children', callback: () => expandCollapseChildren(path, true) },
            { label: 'Collapse all children', callback: () => expandCollapseChildren(path, false) }
        ];

        window.MyDevTool.ContextMenu.show(triggerEvent, options);
    }

    function refreshUI() {
        if (!treeContainer) return;
        treeContainer.innerHTML = '';
        const rowsContainer = document.createElement('div');
        rowsContainer.style.cssText = 'font-family: monospace; font-size: 12px; padding: 4px 0; min-width: 100%;';

        const SecureStorage = window.MyDevTool.SecureStorage || localStorage;
        const showIndentGuide = SecureStorage.getItem('dt_react_indent_guide') !== 'false';

        let activeScopeDepth = -1;
        let isInsideActiveScope = false;
        let activeScopeNode = null;

        flatNodes.forEach(data => {
            if (selectedFiber && (data.node._fiber === selectedFiber || data.node._fiber === selectedFiber.alternate)) {
                if (data.type === 'open' && data.isExpanded) {
                    isInsideActiveScope = true;
                    activeScopeDepth = data.depth;
                    activeScopeNode = data.node;
                }
            }

            if (isInsideActiveScope && data.type === 'close' && data.node === activeScopeNode) {
                isInsideActiveScope = false;
            }

            if (data.type === 'close') return;

            const row = document.createElement('div');
            row.style.cssText = `display:flex; align-items:stretch; padding: 0 10px; cursor:default; user-select:none;`;
            
            const isSelected = selectedFiber && (data.node._fiber === selectedFiber || data.node._fiber === selectedFiber.alternate);
            if (isSelected) {
                row.style.backgroundColor = 'var(--dt-bg-active, #0d2246)';
                row.id = 'selected-fiber-row'; 
            }
            
            row.onmouseover = () => { if (!isSelected) row.style.backgroundColor = 'var(--dt-bg-hover, #35363a)'; };
            row.onmouseout = () => { if (!isSelected) row.style.backgroundColor = 'transparent'; };

            const isDescendant = isInsideActiveScope && data.node !== activeScopeNode;

            for (let i = 0; i < data.depth; i++) {
                const spacer = document.createElement('div');
                spacer.style.cssText = `width: 14px; flex-shrink: 0; display: flex; justify-content: center; position: relative;`;
                
                if (showIndentGuide) {
                    const isActiveLine = isDescendant && (i === activeScopeDepth);
                    const color = isActiveLine ? 'var(--dt-text-accent, #38bdf8)' : 'var(--dt-border-color, #494c50)';
                    const opacity = isActiveLine ? '0.8' : '0.25';
                    const width = isActiveLine ? '2px' : '1px'; 
                    
                    const line = document.createElement('div');
                    line.style.cssText = `width: ${width}; height: 100%; background: ${color}; opacity: ${opacity}; transition: 0.2s;`;
                    spacer.appendChild(line);
                }
                row.appendChild(spacer);
            }

            const contentWrap = document.createElement('div');
            contentWrap.style.cssText = 'display:flex; align-items:center; padding: 3px 0; min-height: 20px;';

            const caret = document.createElement('span');
            caret.style.cssText = 'width:14px; display:inline-flex; align-items:center; justify-content:center; color:var(--dt-text-secondary); cursor:pointer;';
            if (data.type === 'open') {
                caret.textContent = data.isExpanded ? '▼' : '▶';
                caret.style.fontSize = '9px'; 
                caret.onclick = (e) => { e.stopPropagation(); toggleNode(data.node); };
            }
            contentWrap.appendChild(caret);

            const tagContainer = document.createElement('span');
            tagContainer.style.color = data.node._isHost ? 'var(--dt-syntax-tag-name, #da7dd2)' : '#42b983';
            if (!data.node._isHost) tagContainer.style.fontWeight = 'bold';
            
            tagContainer.innerHTML = `&lt;${data.node.tagName}${data.type === 'inline' || !data.isExpanded ? ' /&gt;' : '&gt;'}`;
            contentWrap.appendChild(tagContainer);

            const badges = getBadges(data.node._fiber);
            badges.forEach(b => {
                const bSpan = document.createElement('span');
                bSpan.textContent = b;
                bSpan.style.cssText = 'font-size:9px; background:var(--dt-bg-hover); color:var(--dt-text-secondary); padding:1px 5px; border-radius:10px; margin-left:8px; line-height:1; display:inline-flex; border: 1px solid var(--dt-border-color);';
                contentWrap.appendChild(bSpan);
            });

            row.appendChild(contentWrap);

            row.onclick = (e) => { e.stopPropagation(); selectNode(data.node); };

            row.oncontextmenu = (e) => {
                e.preventDefault();
                e.stopPropagation();
                selectNode(data.node); 
                showContextMenu(e, data);
            };

            let pressTimer;
            row.addEventListener('touchstart', (e) => {
                pressTimer = setTimeout(() => {
                    selectNode(data.node);
                    const touchE = {
                        clientX: e.touches[0].clientX,
                        clientY: e.touches[0].clientY,
                        preventDefault: () => e.preventDefault(),
                        stopPropagation: () => e.stopPropagation()
                    };
                    showContextMenu(touchE, data);
                }, 500); 
            }, {passive: true});
            row.addEventListener('touchend', () => clearTimeout(pressTimer));
            row.addEventListener('touchmove', () => clearTimeout(pressTimer));

            rowsContainer.appendChild(row);
        });

        treeContainer.appendChild(rowsContainer);
    }

    function traverseFiber(fiber, depth, path = "root") {
        if (!fiber || fiber.tag === 6) return;
        let isHost = typeof fiber.type === 'string';

        if (isHost && hideHostNodes) {
            let child = fiber.child;
            let idx = 0;
            while (child) { 
                traverseFiber(child, depth, path + '.h' + idx); 
                child = child.sibling; 
                idx++;
            }
            return; 
        }

        let name = getComponentName(fiber);
        let pseudoNode = { nodeType: 1, tagName: name, attributes: [], _fiber: fiber, _isHost: isHost };

        let hasChildren = false; let childCheck = fiber.child;
        while(childCheck) { if (childCheck.tag !== 6) { hasChildren = true; break; } childCheck = childCheck.sibling; }

        let currentPath = path + '/' + name;
        pseudoNode._path = currentPath; 

        if (forceExpandFibers.has(fiber) || (fiber.alternate && forceExpandFibers.has(fiber.alternate))) {
            expandedMap.set(currentPath, true);
        }

        let isExpanded = false;
        if (expandedMap.has(currentPath)) {
            isExpanded = expandedMap.get(currentPath);
        } else if (expandedMap.has(fiber)) {
            isExpanded = expandedMap.get(fiber);
            expandedMap.set(currentPath, isExpanded); 
        } else if (fiber.alternate && expandedMap.has(fiber.alternate)) {
            isExpanded = expandedMap.get(fiber.alternate);
            expandedMap.set(currentPath, isExpanded); 
        } else {
            isExpanded = depth < 3;
            expandedMap.set(currentPath, isExpanded);
        }

        if (!hasChildren) {
            flatNodes.push({ type: 'inline', node: pseudoNode, depth: depth });
        } else {
            flatNodes.push({ type: 'open', node: pseudoNode, depth: depth, isExpanded: isExpanded, hasChildren: true });
            if (isExpanded) {
                let child = fiber.child;
                let idx = 0;
                while (child) { 
                    traverseFiber(child, depth + 1, currentPath + '[' + idx + ']'); 
                    child = child.sibling; 
                    idx++;
                }
                flatNodes.push({ type: 'close', node: pseudoNode, depth: depth });
            }
        }
    }

    return { 
        init, 
        refresh, 
        selectNodeByFiber 
    };
})();