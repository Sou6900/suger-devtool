// // src/modules/react/ReactInspector.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.ReactInspector = (function() {
    let inspectorSearchQuery = ""; 
    window.__suger_highlight_updates = window.__suger_highlight_updates || false;

    function parseHooksState(s, tag) {
        if (!s) return null;
        if (tag === 1 || tag === 3) return s; 
        let hooks = []; let h = s;
        while(h) { hooks.push(h.memoizedState); h = h.next; }
        return hooks.length > 0 ? Object.assign({}, hooks) : null; 
    }

    function parseContextState(fiber) {
        if (!fiber.dependencies || !fiber.dependencies.firstContext) return null;
        let contexts = {};
        let ctx = fiber.dependencies.firstContext;
        let count = 0;
        const seenValues = new Set(); 

        while (ctx) {
            if (!seenValues.has(ctx.memoizedValue)) {
                seenValues.add(ctx.memoizedValue);
                contexts[`Context ${count}`] = ctx.memoizedValue;
                count++;
            }
            ctx = ctx.next;
        }
        return count > 0 ? contexts : null;
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

    function safeStringify(obj) {
        const cache = new WeakSet();
        return JSON.stringify(obj, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (cache.has(value)) return '[Circular Reference]';
                cache.add(value);
                
                if (value.$$typeof && typeof value.$$typeof === 'symbol') {
                    return `<${typeof value.type === 'string' ? value.type : (value.type?.name || 'Component')} />`;
                }
                
                if (value instanceof Node) {
                    return value.tagName ? `<${value.tagName.toLowerCase()}>` : `[Node ${value.nodeName}]`;
                }

                if (key.startsWith('__reactFiber') || key.startsWith('__reactInternal')) {
                    return '[React Fiber]';
                }

                if (value === window) return '[Window]';
            }
            if (typeof value === 'function') return `ƒ ${value.name || '()'}()`;
            if (typeof value === 'symbol') return value.toString();
            return value;
        }, 2);
    }

    function createSection(title, container, dataToCopy = null) {
        const sec = document.createElement('div');
        sec.style.cssText = 'padding:10px; border-bottom:1px solid var(--dt-border-color);';

        const header = document.createElement('div');
        header.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;';

        const titleSpan = document.createElement('div');
        titleSpan.style.cssText = 'font-weight:bold; font-size:11px; text-transform:uppercase; color:var(--dt-text-secondary);';
        titleSpan.textContent = title;
        header.appendChild(titleSpan);

        if (dataToCopy) {
            const SVGs = window.MyDevTool.SVGs || {};
            const copyBtn = document.createElement('button');
            copyBtn.innerHTML = SVGs.copySVG || '📋';
            copyBtn.title = `Copy ${title} to clipboard`;
            copyBtn.style.cssText = 'background:none; border:none; color:var(--dt-text-secondary); cursor:pointer; padding:0; display:flex; align-items:center; width:14px; height:14px; opacity:0.6; transition:0.2s;';
            
            copyBtn.onmouseover = () => copyBtn.style.opacity = '1';
            copyBtn.onmouseout = () => copyBtn.style.opacity = '0.6';
            copyBtn.onclick = () => {
                try {
                    navigator.clipboard.writeText(safeStringify(dataToCopy));
                    const oldIcon = copyBtn.innerHTML;
                    copyBtn.innerHTML = '✅';
                    setTimeout(() => copyBtn.innerHTML = oldIcon, 1000);
                } catch(e) { console.error("Copy failed", e); }
            };
            header.appendChild(copyBtn);
        }

        sec.appendChild(header);
        container.appendChild(sec);
        return sec;
    }

    function renderScrollContent(selectedFiber, scrollContent, onUpdate) {
        scrollContent.innerHTML = '';
        const Editor = window.MyDevTool.ReactEditor;

        const propsSec = createSection('Props', scrollContent, selectedFiber.memoizedProps);
        if (selectedFiber.memoizedProps && Object.keys(selectedFiber.memoizedProps).length > 0) {
            Editor.renderEditableTree(selectedFiber.memoizedProps, propsSec, 'Props', (action, path, val) => Editor.handleEditorUpdate(selectedFiber, 'props', action, path, val, onUpdate), inspectorSearchQuery);
        } else {
            propsSec.innerHTML += `<div style="color:var(--dt-text-disabled); font-style:italic; font-size:11px;">No props</div>`;
        }

        const stateData = parseHooksState(selectedFiber.memoizedState, selectedFiber.tag);
        if (stateData && Object.keys(stateData).length > 0) {
            const stateSec = createSection(selectedFiber.tag === 0 ? 'Hooks' : 'State', scrollContent, stateData);
            Editor.renderEditableTree(stateData, stateSec, 'State', (action, path, val) => Editor.handleEditorUpdate(selectedFiber, 'state', action, path, val, onUpdate), inspectorSearchQuery);
        }

        const contextData = parseContextState(selectedFiber);
        if (contextData) {
            const ctxSec = createSection('Context', scrollContent, contextData);
            Editor.renderEditableTree(contextData, ctxSec, 'Context', (action, path, val) => Editor.handleEditorUpdate(selectedFiber, 'context', action, path, val, onUpdate), inspectorSearchQuery);
        }

        if (selectedFiber._debugSource) {
            const srcSec = createSection('Source', scrollContent);
            const fileName = selectedFiber._debugSource.fileName.split('/').pop();
            srcSec.innerHTML += `<div style="font-family:monospace; font-size:11px; color:var(--dt-syntax-string); display:flex; align-items:center; gap:4px;"><span style="width:12px;height:12px;">${window.MyDevTool.SVGs.fileSVG}</span> ${fileName} : ${selectedFiber._debugSource.lineNumber}</div>`;
        }

        const renderSec = createSection('Rendered By', scrollContent);
        renderSec.style.borderBottom = 'none';
        let ancestryHtml = '';
        let curr = selectedFiber.return;
        let indent = 0;
        while(curr) {
            if (curr.tag !== 5 && curr.tag !== 6) {
                ancestryHtml += `<div style="padding-left:${indent * 8}px; color:var(--dt-syntax-tag-name); font-family:monospace; font-size:11px; margin-bottom:2px;">↳ ${getComponentName(curr)}</div>`;
                indent++;
            }
            curr = curr.return;
        }
        const version = window.__suger_react_renderer ? window.__suger_react_renderer.version : 'Unknown';
        ancestryHtml += `<div style="padding-left:${indent * 8}px; color:var(--dt-text-disabled); font-family:monospace; font-size:11px; margin-top:4px;">↳ react-dom@${version}</div>`;
        renderSec.innerHTML += ancestryHtml;
    }

    function render(selectedFiber, container, onUpdate) {
        if (!container) return;
        if (!selectedFiber) {
            container.innerHTML = '<div class="react-inspector-empty" style="padding:10px;text-align:center; color:var(--dt-text-disabled);">Select a component to inspect.</div>';
            return;
        }

        const SVGs = window.MyDevTool.SVGs || {};
        const isSameFiber = container._lastFiber === selectedFiber;
        container._lastFiber = selectedFiber;

        let scrollContent = container.querySelector('.react-inspector-scroll');
        let searchInput = container.querySelector('#inspector-search');

        if (!scrollContent || !isSameFiber) {
            container.innerHTML = '';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';

            const header = document.createElement('div');
            header.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:8px 10px; border-bottom:1px solid var(--dt-border-color); background: var(--dt-bg-header); flex-shrink:0;position:sticky;top:0;z-index:99;';
            header.innerHTML = `
                <div style="font-weight:bold; color:var(--dt-text-accent); font-size:14px;">&lt;${getComponentName(selectedFiber)}&gt;</div>
                <div style="display:flex; gap:8px;">
                    <button id="btn-highlight" title="Highlight Updates" style="background:none; border:none; cursor:pointer; color:${window.__suger_highlight_updates ? 'var(--dt-text-accent)' : 'var(--dt-text-secondary)'}; display:flex; align-items:center;">${SVGs.highlightSVG || '✨'}</button>
                    <button id="btn-scroll" title="Scroll to view element" style="background:none; border:none; color:var(--dt-text-secondary); cursor:pointer; display:flex; align-items:center;">${SVGs.eyeSVG || '👁️'}</button>
                    <button id="btn-log" title="Log fiber to console" style="background:none; border:none; color:var(--dt-text-secondary); cursor:pointer; display:flex; align-items:center;">${SVGs.bugSVG || '🐞'}</button>
                </div>
            `;
            container.appendChild(header);

            header.querySelector('#btn-highlight').onclick = () => {
                window.__suger_highlight_updates = !window.__suger_highlight_updates;
                onUpdate(); 
            };
            header.querySelector('#btn-scroll').onclick = () => {
                let elFiber = selectedFiber;
                while (elFiber && !(elFiber.stateNode instanceof Element)) elFiber = elFiber.child;
                if (elFiber && elFiber.stateNode instanceof Element) {
                    elFiber.stateNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const origBg = elFiber.stateNode.style.backgroundColor;
                    elFiber.stateNode.style.backgroundColor = 'rgba(66, 185, 131, 0.5)';
                    setTimeout(() => { elFiber.stateNode.style.backgroundColor = origBg; }, 1000);
                }
            };
            header.querySelector('#btn-log').onclick = () => {
                if(window.MyDevTool.TabManager) window.MyDevTool.TabManager.switchTab("console");
                console.log(`[Suger] <${getComponentName(selectedFiber)}>:`, selectedFiber);
            }

            const searchContainer = document.createElement('div');
            searchContainer.className = 'react-inspector-search';
            searchContainer.style.cssText = 'display:flex; align-items:center; padding:6px 10px; border-bottom:1px solid var(--dt-border-color); background:var(--dt-bg-main); flex-shrink:0;';
            searchContainer.innerHTML = `
                <span style="color:var(--dt-text-secondary); display:flex; align-items:center; margin-right:6px; width:14px; height:14px;">${SVGs.searchSVG || '🔍'}</span>
                <input type="text" id="inspector-search" placeholder="Filter props, state, context..." style="flex-grow:1; background:transparent; border:none; color:var(--dt-text-primary); font-size:12px; outline:none;">
            `;
            container.appendChild(searchContainer);

            scrollContent = document.createElement('div');
            scrollContent.className = 'react-inspector-scroll';
            scrollContent.style.cssText = 'flex-grow:1;';
            container.appendChild(scrollContent);

            searchInput = searchContainer.querySelector('input');
            searchInput.value = inspectorSearchQuery;
            
            searchInput.oninput = (e) => {
                inspectorSearchQuery = e.target.value;
                renderScrollContent(selectedFiber, scrollContent, onUpdate);
            };
        }

        renderScrollContent(selectedFiber, scrollContent, onUpdate);
    }

    return { render };
})();