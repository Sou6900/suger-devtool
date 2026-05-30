// src/modules/react/ReactEditor.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.ReactEditor = (function() {
    const expandedPropsState = new Set();

    function safeStringify(obj) {
        const cache = new WeakSet();
        return JSON.stringify(obj, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (cache.has(value)) return '[Circular Reference]';
                cache.add(value);
                if (value.$$typeof && typeof value.$$typeof === 'symbol') return `<${typeof value.type === 'string' ? value.type : (value.type?.name || 'Component')} />`;
                if (value instanceof Node) return value.tagName ? `<${value.tagName.toLowerCase()}>` : `[Node]`;
                if (key.startsWith('__reactFiber') || key.startsWith('__reactInternal')) return '[React Fiber]';
                if (value === window) return '[Window]';
            }
            if (typeof value === 'function') return `ƒ ${value.name || '()'}()`;
            if (typeof value === 'symbol') return value.toString();
            return value;
        }, 2) || '{}';
    }

    function showContextMenu(triggerEvent, key, val, currentPath, isObj, onUpdate) {
        if (!window.MyDevTool.ContextMenu) return;

        const copyToClipboard = (text) => {
            navigator.clipboard.writeText(text).catch(err => console.error("Copy failed", err));
        };

        const options = [
            {
                label: 'Log value to console ($tmp)',
                callback: () => {
                    console.log(`[Suger] ${currentPath}:`, val);
                    window.$tmp = val; // Save to global variable for handy access
                    if (window.MyDevTool.TabManager) window.MyDevTool.TabManager.switchTab("console");
                }
            },
            { type: 'separator' },
            {
                label: 'Copy property path',
                callback: () => copyToClipboard(currentPath)
            },
            {
                label: isObj ? 'Copy object (JSON)' : 'Copy value',
                callback: () => copyToClipboard(isObj ? safeStringify(val) : String(val))
            }
        ];

        // Add Tree expand/collapse controls if it's an object/array
        if (isObj && val !== null) {
            options.push({ type: 'separator' });
            options.push({
                label: 'Expand recursively',
                callback: () => {
                    const expandAll = (obj, path) => {
                        if (obj && typeof obj === 'object') {
                            expandedPropsState.add(path);
                            Object.keys(obj).forEach(k => expandAll(obj[k], `${path}.${k}`));
                        }
                    };
                    expandAll(val, currentPath);
                    onUpdate('REFRESH_UI', currentPath, null);
                }
            });
            options.push({
                label: 'Collapse recursively',
                callback: () => {
                    expandedPropsState.delete(currentPath);
                    const pathsToDelete = [];
                    expandedPropsState.forEach(p => {
                        if (p.startsWith(currentPath + '.')) pathsToDelete.push(p);
                    });
                    pathsToDelete.forEach(p => expandedPropsState.delete(p));
                    onUpdate('REFRESH_UI', currentPath, null);
                    }
            });
        }

        window.MyDevTool.ContextMenu.show(triggerEvent, options);
    }

    function setNestedValue(obj, pathParts, newValue, action) {
        if (obj === null || obj === undefined) return obj;
        let clone = Array.isArray(obj) ? [...obj] : { ...obj };
        
        if (pathParts.length === 1) {
            if (action === 'RENAME_KEY') {
                if (newValue.trim() === '') delete clone[pathParts[0]];
                else { clone[newValue] = clone[pathParts[0]]; delete clone[pathParts[0]]; }
            } else clone[pathParts[0]] = newValue;
            return clone;
        }
        
        const currentKey = pathParts[0];
        if (!clone[currentKey]) clone[currentKey] = {};
        clone[currentKey] = setNestedValue(obj[currentKey], pathParts.slice(1), newValue, action);
        return clone;
    }

    function parseSmartValue(valStr) {
        let v = valStr.trim();
        if (v === 'true') return true;
        if (v === 'false') return false;
        if (v === 'null') return null;
        if (v === 'undefined') return undefined;
        if (v !== '' && !isNaN(v)) return Number(v);
        if ((v.startsWith('{') && v.endsWith('}')) || (v.startsWith('[') && v.endsWith(']'))) {
            try { return JSON.parse(v); } catch(e) { return valStr; } 
        }
        if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1);
        if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
        return valStr;
    }

    function makeEditable(span, oldVal, onCommit, options = {}) {
        const input = document.createElement('input');
        input.value = oldVal;
        input.style.cssText = 'background:var(--dt-bg-active, #0d2246); color:var(--dt-text-primary); border:1px solid var(--dt-text-accent); font-family:monospace; font-size:12px; outline:none; padding:1px 3px; border-radius:2px; min-width:60px; display:inline-block; vertical-align:middle;';
        
        span.replaceWith(input);
        input.focus();
        input.select();

        let committed = false;
        const commit = () => { 
            if (committed) return; 
            committed = true; 
            if (window.MyDevTool.SuggestionBox) window.MyDevTool.SuggestionBox.hide();
            
            const newVal = input.value;
            onCommit(newVal); 
            
            if (input.parentElement) {
                if (options.isKey) span.textContent = newVal + ': ';
                else if (options.isString) span.textContent = `"${newVal}"`;
                else span.textContent = newVal;
                input.replaceWith(span);
            }
        };

        input.oninput = () => {
            if (!window.MyDevTool.SuggestionBox || !window.MyDevTool.ReactSuggestionEngine) return;
            if (!options.isStyleContext) return; 

            const SecureStorage = window.MyDevTool.SecureStorage || localStorage;
            const userLimit = parseInt(SecureStorage.getItem('dt_react_suggestion_limit') || '30', 10);

            const res = window.MyDevTool.ReactSuggestionEngine.getSuggestions({
                type: options.isKey ? 'property' : 'value',
                fullText: input.value,
                propName: options.propName,
                maxSuggestions: userLimit
            });

            if (res.suggestions && res.suggestions.length > 0) {
                window.MyDevTool.SuggestionBox.show(input, res.suggestions, (selected) => {
                    input.value = selected;
                    commit();
                });
            } else {
                window.MyDevTool.SuggestionBox.hide();
            }
        };

        input.onblur = commit;
        
        input.onkeydown = (e) => { 
            const SuggestionBox = window.MyDevTool.SuggestionBox;
            if (SuggestionBox && typeof SuggestionBox.isVisible === 'function' && SuggestionBox.isVisible()) {
                let evtToPass = e;
                if (e.key === 'Tab') {
                    evtToPass = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true });
                }
                if (SuggestionBox.handleKeyDown(evtToPass)) {
                    e.preventDefault(); e.stopPropagation(); return;
                }
            }

            if(e.key === 'Enter' || e.key === 'Tab') { 
                e.preventDefault(); 
                commit(); 
            }
            if(e.key === 'Escape') { 
                e.preventDefault(); 
                committed = true; 
                if (SuggestionBox) SuggestionBox.hide();
                input.replaceWith(span); 
            }
        };
    }

    function handleEditorUpdate(selectedFiber, type, action, fullPath, val, onRefreshUI) {
        if (!selectedFiber) return;

        if (action === 'REFRESH_UI') {
            if (onRefreshUI) onRefreshUI();
            return;
        }

        const cleanPath = fullPath.replace(/^(Props|State|Context)\./, '');
        const pathArray = cleanPath.split('.');
        const renderer = window.__suger_react_renderer;

        if (type === 'props') {
            const newProps = setNestedValue(selectedFiber.memoizedProps, pathArray, val, action);

            if (selectedFiber.tag === 5 && selectedFiber.stateNode instanceof Element) {
                const domElement = selectedFiber.stateNode;
                if (pathArray[0] === 'style' && pathArray.length === 2) {
                    if (action === 'UPDATE_VALUE') domElement.style[pathArray[1]] = val;
                    else if (action === 'RENAME_KEY') { domElement.style[pathArray[1]] = ''; domElement.style[val] = newProps.style[val]; }
                } else if (pathArray.length === 1 && action === 'UPDATE_VALUE') {
                    if (pathArray[0] === 'className') domElement.className = val;
                    else if (pathArray[0] === 'children' && (typeof val === 'string' || typeof val === 'number')) domElement.textContent = val;
                    else domElement.setAttribute(pathArray[0], val);
                }
            }

            if (renderer && typeof renderer.overrideProps === 'function') {
                if (action === 'RENAME_KEY') renderer.overrideProps(selectedFiber, [], newProps);
                else renderer.overrideProps(selectedFiber, pathArray, val);
            }

            let curr = selectedFiber;
            while(curr) {
                if (curr.stateNode && typeof curr.stateNode.forceUpdate === 'function') { curr.stateNode.forceUpdate(); break; }
                curr = curr.return;
            }

            selectedFiber.memoizedProps = newProps;
            if (selectedFiber.alternate) selectedFiber.alternate.memoizedProps = newProps;
        } 
        else if (type === 'state') {
            const isClass = selectedFiber.tag === 1 || selectedFiber.tag === 3;
            if (isClass) {
                const newState = setNestedValue(selectedFiber.memoizedState, pathArray, val, action);
                if (selectedFiber.stateNode && typeof selectedFiber.stateNode.setState === 'function') selectedFiber.stateNode.setState(newState);
                selectedFiber.memoizedState = newState;
            } else {
                const hookIndex = parseInt(pathArray[0], 10);
                const subPath = pathArray.slice(1);
                let h = selectedFiber.memoizedState;
                for (let i = 0; i < hookIndex && h; i++) h = h.next;

                if (h && renderer && typeof renderer.overrideHookState === 'function') {
                    if (action === 'RENAME_KEY') {
                        const newVal = setNestedValue(h.memoizedState, subPath, val, action);
                        renderer.overrideHookState(selectedFiber, hookIndex, [], newVal);
                        h.memoizedState = newVal;
                    } else {
                        renderer.overrideHookState(selectedFiber, hookIndex, subPath, val);
                        h.memoizedState = setNestedValue(h.memoizedState, subPath, val, action);
                    }
                }
            }
        }
        else if (type === 'context') {
            console.warn("Context API is typically read-only.");
        }

        if (action === 'RENAME_KEY' && val.trim() !== '') {
            const newPath = fullPath.substring(0, fullPath.lastIndexOf(pathArray[pathArray.length - 1])) + val;
            if (expandedPropsState.has(fullPath)) { expandedPropsState.delete(fullPath); expandedPropsState.add(newPath); }
        }

        if (window.__suger_highlight_updates) {
            let elFiber = selectedFiber;
            while (elFiber && !(elFiber.stateNode instanceof Element)) elFiber = elFiber.child;
            if (elFiber && elFiber.stateNode instanceof Element) {
                const domEl = elFiber.stateNode;
                const origOutline = domEl.style.outline;
                domEl.style.outline = '2px solid var(--dt-text-accent, #38bdf8)';
                setTimeout(() => domEl.style.outline = origOutline, 400);
            }
        }

        if (onRefreshUI) {
            onRefreshUI(); 
            setTimeout(onRefreshUI, 50); 
        }
    }

    function renderEditableTree(data, parentContainer, pathStr, onUpdate, searchQuery = "") {
        const list = document.createElement('div');
        const isRootLevel = !pathStr.includes('.');
        const isArrayData = Array.isArray(data);
        const query = (searchQuery || "").toLowerCase().trim();

        const isStyleContext = pathStr && (pathStr === 'Props.style' || pathStr.includes('.style'));
        
        const isReadOnlyContext = pathStr && (
            pathStr.includes('.ref') || 
            pathStr.includes('.current') || 
            pathStr.includes('__react') || 
            pathStr.includes('stateNode') || 
            pathStr.includes('return') || 
            pathStr.includes('child') || 
            pathStr.includes('sibling') ||
            pathStr.includes('memoizedProps') ||
            pathStr.includes('memoizedState')
        );

        list.style.paddingLeft = isRootLevel ? '0px' : '15px';
        list.style.fontFamily = 'monospace';
        list.style.fontSize = '12px';

        Object.keys(data).forEach(key => {
            const val = data[key];
            const currentPath = pathStr ? `${pathStr}.${key}` : key;
            const isObj = val !== null && typeof val === 'object';
            const isFunction = typeof val === 'function'; 
            
            const isInternalKey = typeof key === 'string' && (
                key.startsWith('__react') || 
                ['stateNode', 'return', 'child', 'sibling', 'memoizedProps', 'memoizedState', 'pendingProps', 'updateQueue', 'dependencies', 'elementType', 'tag', 'flags', 'lanes', 'index', 'refCleanup'].includes(key)
            );
            
            const isReadOnlyProp = isReadOnlyContext || isInternalKey || currentPath.includes('.ref') || currentPath.includes('.current') || isFunction;
            
            let isMatch = true;
            let hasChildMatch = false;

            if (query) {
                const kStr = String(key).toLowerCase();
                const vStr = (!isObj && !isFunction && val !== undefined && val !== null) ? String(val).toLowerCase() : "";
                isMatch = kStr.includes(query) || vStr.includes(query);
                
                if (isObj && val !== null) {
                    try { hasChildMatch = JSON.stringify(val).toLowerCase().includes(query); } catch(e){}
                    if (hasChildMatch) expandedPropsState.add(currentPath);
                }
            }

            if (query && !isMatch && !hasChildMatch) return; 

            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'flex-start';
            row.style.marginBottom = '2px';
            
            row.oncontextmenu = (e) => {
                e.preventDefault();
                e.stopPropagation();
                showContextMenu(e, key, val, currentPath, isObj, onUpdate);
            };

            let pressTimer;
            row.addEventListener('touchstart', (e) => {
                pressTimer = setTimeout(() => {
                    const touchE = {
                        clientX: e.touches[0].clientX,
                        clientY: e.touches[0].clientY,
                        preventDefault: () => e.preventDefault(),
                        stopPropagation: () => e.stopPropagation()
                    };
                    showContextMenu(touchE, key, val, currentPath, isObj, onUpdate);
                }, 500); 
            }, {passive: true});
            row.addEventListener('touchend', () => clearTimeout(pressTimer));
            row.addEventListener('touchmove', () => clearTimeout(pressTimer));

            const caret = document.createElement('span');
            caret.style.cssText = 'width:20px; height:18px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; color:var(--dt-text-secondary); margin-left:-4px; margin-right:2px; font-size:10px; user-select:none; flex-shrink:0;';
            
            const keySpan = document.createElement('span');
            keySpan.textContent = `${key}: `;
            keySpan.style.color = isArrayData ? 'var(--dt-text-disabled, #888)' : 'var(--dt-syntax-prop-name, #9cdcfe)';
            keySpan.style.marginRight = '5px';
            keySpan.style.marginTop = '2px'; 

            if (isReadOnlyProp) {
                keySpan.style.opacity = '0.6';
                keySpan.style.cursor = 'default';
                keySpan.title = isFunction ? "Functions are read-only" : "Internal property (Read-only)";
            } else if (!isRootLevel && !isArrayData) {
                keySpan.style.cursor = 'text';
                keySpan.ondblclick = (e) => {
                    e.stopPropagation();
                    makeEditable(keySpan, key, (newKey) => {
                        if (newKey !== key) onUpdate('RENAME_KEY', currentPath, newKey);
                    }, { isKey: true, isStyleContext });
                };
            }
            
            const valSpan = document.createElement('span');
            valSpan.style.marginTop = '2px'; 
            
            if (isReadOnlyProp && !isFunction) {
                valSpan.style.opacity = '0.6';
            }

            if (isObj) {
                const isArray = Array.isArray(val);
                const isReactElement = val.$$typeof && typeof val.$$typeof === 'symbol';
                
                if (isReactElement) {
                    caret.textContent = '';
                    valSpan.textContent = `<${typeof val.type === 'string' ? val.type : (val.type?.name || 'Component')} />`;
                    valSpan.style.color = 'var(--dt-text-disabled)';
                } else {
                    const isExpanded = expandedPropsState.has(currentPath);
                    caret.textContent = isExpanded ? '▼' : '▶';
                    valSpan.textContent = isArray ? `Array(${val.length})` : '{...}';
                    valSpan.style.color = 'var(--dt-text-secondary)';
                    valSpan.style.cursor = 'pointer';
                    
                    const childrenContainer = document.createElement('div');
                    childrenContainer.style.display = isExpanded ? 'block' : 'none';
                    if (isExpanded) renderEditableTree(val, childrenContainer, currentPath, onUpdate, query);
                    
                    const toggleObj = (e) => {
                        if (e) { e.stopPropagation(); e.preventDefault(); }
                        if (childrenContainer.style.display === 'none') {
                            childrenContainer.style.display = 'block'; caret.textContent = '▼';
                            expandedPropsState.add(currentPath); childrenContainer.innerHTML = '';
                            renderEditableTree(val, childrenContainer, currentPath, onUpdate, query);
                        } else {
                            childrenContainer.style.display = 'none'; caret.textContent = '▶';
                            expandedPropsState.delete(currentPath);
                        }
                    };
                    
                    caret.onclick = toggleObj; valSpan.ondblclick = toggleObj; valSpan.onclick = toggleObj;
                    row.append(caret, keySpan, valSpan);
                    const wrapper = document.createElement('div'); wrapper.append(row, childrenContainer);
                    list.appendChild(wrapper);
                    return;
                }
            } else {
                caret.textContent = '';
                let isString = typeof val === 'string';
                let isBool = typeof val === 'boolean';
                
                if (isFunction) {
                    valSpan.textContent = `ƒ ${val.name || '()'}()`;
                    valSpan.style.color = 'var(--dt-syntax-function, #dcdcaa)'; 
                    valSpan.style.fontStyle = 'italic';
                    valSpan.style.cursor = 'default';
                    valSpan.title = 'Functions cannot be edited';
                } 
                else if (isBool) {
                    const chk = document.createElement('input');
                    chk.type = 'checkbox';
                    chk.checked = val;
                    chk.style.cssText = 'margin:0; vertical-align:middle; width:13px; height:13px; accent-color:var(--dt-text-accent);';
                    
                    if (isReadOnlyProp) {
                        chk.disabled = true;
                        chk.style.cursor = 'default';
                        valSpan.style.cursor = 'default';
                        valSpan.title = 'Internal property (Read-only)';
                    } else {
                        chk.style.cursor = 'pointer';
                        valSpan.style.cursor = 'pointer';
                        chk.onchange = (e) => onUpdate('UPDATE_VALUE', currentPath, e.target.checked);
                        valSpan.onclick = (e) => {
                            if (e.target !== chk) { chk.checked = !chk.checked; onUpdate('UPDATE_VALUE', currentPath, chk.checked); }
                        };
                    }
                    valSpan.appendChild(chk);
                    valSpan.style.display = 'inline-flex';
                    valSpan.style.alignItems = 'center';
                } else {
                    valSpan.textContent = isString ? `"${val}"` : String(val);
                    if (typeof val === 'number') valSpan.style.color = 'var(--dt-syntax-number, #b5cea8)';
                    else if (isString) valSpan.style.color = 'var(--dt-syntax-string, #ce9178)';

                    if (isReadOnlyProp) {
                        valSpan.style.cursor = 'default';
                        valSpan.title = 'Internal property (Read-only)';
                    } else {
                        valSpan.style.cursor = 'text';
                        valSpan.ondblclick = (e) => {
                            e.stopPropagation();
                            let visualText = valSpan.textContent;
                            if (visualText.startsWith('"') && visualText.endsWith('"')) visualText = visualText.slice(1, -1);
                            
                            makeEditable(valSpan, visualText, (newVal) => {
                                const parsedVal = parseSmartValue(newVal);
                                onUpdate('UPDATE_VALUE', currentPath, parsedVal);
                            }, { isString: isString, isStyleContext, propName: key });
                        };
                    }
                }
            }
            row.append(caret, keySpan, valSpan);
            list.appendChild(row);
        });

        if (!isArrayData && !query && !isReadOnlyContext) {
            const addRow = document.createElement('div');
            addRow.style.cssText = 'display:flex; align-items:center; margin-top:4px; opacity:0.8;';
            const caretSpace = document.createElement('span'); caretSpace.style.cssText = 'width:20px; display:inline-block; flex-shrink:0;';
            
            const keyInput = document.createElement('input');
            keyInput.placeholder = 'key';
            keyInput.style.cssText = 'background:transparent; color:var(--dt-syntax-prop-name, #9cdcfe); border:1px dashed var(--dt-border-color, #555); border-radius:2px; font-family:monospace; font-size:12px; outline:none; padding:2px 4px; width:70px;';
            
            const colon = document.createElement('span');
            colon.textContent = ':';
            colon.style.cssText = 'color:var(--dt-text-secondary); margin:0 6px; font-weight:bold;';
            
            const valInput = document.createElement('input');
            valInput.placeholder = 'value';
            valInput.style.cssText = 'background:transparent; color:var(--dt-text-primary); border:1px dashed var(--dt-border-color, #555); border-radius:2px; font-family:monospace; font-size:12px; outline:none; padding:2px 4px; width:90px;';
            
            keyInput.onfocus = () => keyInput.style.border = '1px solid var(--dt-text-accent, #38bdf8)';
            keyInput.onblur = () => {
                keyInput.style.border = '1px dashed var(--dt-border-color, #555)';
                if (window.MyDevTool.SuggestionBox) window.MyDevTool.SuggestionBox.hide();
            };
            valInput.onfocus = () => valInput.style.border = '1px solid var(--dt-text-accent, #38bdf8)';
            valInput.onblur = () => {
                valInput.style.border = '1px dashed var(--dt-border-color, #555)';
                if (window.MyDevTool.SuggestionBox) window.MyDevTool.SuggestionBox.hide();
            };

            const handleAdd = () => {
                if (window.MyDevTool.SuggestionBox) window.MyDevTool.SuggestionBox.hide();
                const k = keyInput.value.trim();
                let v = valInput.value.trim();
                if (k !== '') {
                    const parsedVal = parseSmartValue(v);
                    const newPath = pathStr ? `${pathStr}.${k}` : k;
                    onUpdate('UPDATE_VALUE', newPath, parsedVal);
                    keyInput.value = ''; valInput.value = ''; keyInput.focus();
                }
            };

            const triggerAddSuggestions = (inputElem, type, relatedProp) => {
                if (!window.MyDevTool.SuggestionBox || !window.MyDevTool.ReactSuggestionEngine) return;
                if (!isStyleContext) return; 

                const SecureStorage = window.MyDevTool.SecureStorage || localStorage;
                const userLimit = parseInt(SecureStorage.getItem('dt_react_suggestion_limit') || '30', 10);

                const res = window.MyDevTool.ReactSuggestionEngine.getSuggestions({
                    type,
                    fullText: inputElem.value,
                    propName: relatedProp,
                    maxSuggestions: userLimit
                });

                if (res.suggestions && res.suggestions.length > 0) {
                    window.MyDevTool.SuggestionBox.show(inputElem, res.suggestions, (selected) => {
                        inputElem.value = selected;
                        window.MyDevTool.SuggestionBox.hide();
                        inputElem.focus();
                        if (type === 'property') valInput.focus();
                        else handleAdd();
                    });
                } else {
                    window.MyDevTool.SuggestionBox.hide();
                }
            };

            keyInput.oninput = () => triggerAddSuggestions(keyInput, 'property', null);
            valInput.oninput = () => triggerAddSuggestions(valInput, 'value', keyInput.value.trim());

            const checkSuggestionKey = (e) => {
                const SuggestionBox = window.MyDevTool.SuggestionBox;
                if (SuggestionBox && typeof SuggestionBox.isVisible === 'function' && SuggestionBox.isVisible()) {
                    let evtToPass = e;
                    if (e.key === 'Tab') {
                        evtToPass = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true });
                    }
                    if (SuggestionBox.handleKeyDown(evtToPass)) {
                        e.preventDefault(); e.stopPropagation(); return true;
                    }
                }
                return false;
            };

            keyInput.onkeydown = (e) => { 
                if (checkSuggestionKey(e)) return;
                if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); valInput.focus(); } 
            };
            valInput.onkeydown = (e) => { 
                if (checkSuggestionKey(e)) return;
                if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); handleAdd(); } 
            };
            
            addRow.append(caretSpace, keyInput, colon, valInput);
            list.appendChild(addRow);
        }
        parentContainer.appendChild(list);
    }

    return { renderEditableTree, handleEditorUpdate };
})();