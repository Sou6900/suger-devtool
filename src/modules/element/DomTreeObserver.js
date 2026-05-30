// src/modules/element/DomTreeObserver.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.DomTreeObserver = (function() {
    let observer = null;
    let mutationTimeout = null;
    let lastFlashMap = new WeakMap(); 
    const FLASH_COOLDOWN = 5000; 
    let _callbacks = null; 
    let _rowsContainer = null;
    
    let isFlashEnabled = localStorage.getItem('dt_dom_flash') !== 'false'; 

    function init(rowsContainer, callbacks) {
        _rowsContainer = rowsContainer;
        _callbacks = callbacks;
    }
    
    function setFlashEnabled(enabled) {
        isFlashEnabled = enabled;
    }

    function setup(targetNode) {
        if (observer) { observer.disconnect(); }
        const pendingAddFlashes = new Set(); 
        
        observer = new MutationObserver((mutations) => {
            let needsRebuild = false;
            const areAllInternal = mutations.every(m => {
                if (_callbacks.isInternal(m.target)) return true;
                if (m.type === 'childList') {
                    for (const node of m.addedNodes) { if (_callbacks.isInternal(node)) return true; }
                    for (const node of m.removedNodes) { if (_callbacks.isInternal(node)) return true; }
                }
                needsRebuild = true;
                
                if (isFlashEnabled) {
                    if (m.type === 'childList') {
                        if (m.removedNodes.length > 0) { flashNodeInTree(m.target, new Set(), 'remove'); } 
                        else if (m.addedNodes.length > 0) {
                            m.addedNodes.forEach(n => { if(n.nodeType === Node.ELEMENT_NODE) pendingAddFlashes.add(n); });
                        }
                    } else {
                        let target = m.target;
                        if (target.nodeType === Node.TEXT_NODE) target = target.parentElement;
                        flashNodeInTree(target, new Set(), 'modify');
                    }
                }
                return false;
            });

            if (areAllInternal || !needsRebuild) return;

            if (mutationTimeout) clearTimeout(mutationTimeout);
            mutationTimeout = setTimeout(() => {
                _callbacks.rebuild(); 
                if (isFlashEnabled && pendingAddFlashes.size > 0) {
                    requestAnimationFrame(() => {
                        const processed = new Set();
                        pendingAddFlashes.forEach(node => { flashNodeInTree(node, processed, 'flash'); });
                        pendingAddFlashes.clear();
                    });
                }
            }, 300);
        });

        if (targetNode) { 
            observer.observe(targetNode, { childList: true, subtree: true, attributes: true, characterData: true }); 
        }
    }

    function flashNodeInTree(node, processedSet, type) {
        if (!isFlashEnabled) return;
        if (!node || (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE)) return;
        if (node === document.body || node === document.documentElement) return;
        if (!_rowsContainer) return;

        const row = Array.from(_rowsContainer.children).find(r => r._nodeRef === node);
        const flashClass = (type === 'remove') ? 'flash-delete' : 'flash';

        if (row) {
            const now = Date.now();
            const lastFlash = lastFlashMap.get(node) || 0;
            if (now - lastFlash < FLASH_COOLDOWN) return; 

            if (!processedSet.has(node)) { 
                applyFlash(row, flashClass); 
                processedSet.add(node); 
                lastFlashMap.set(node, now); 
            }
        } else {
            let parent = node.parentElement || node.host; 
            if(type === 'remove') parent = node; 
            while (parent) {
                if (parent.id && parent.id.startsWith('dt-device-')) { parent = document.body; continue; }
                const parentRow = Array.from(_rowsContainer.children).find(r => r._nodeRef === parent);
                if (parentRow) {
                    const now = Date.now();
                    const lastFlash = lastFlashMap.get(parent) || 0;
                    if (now - lastFlash < FLASH_COOLDOWN) return;

                    if (!processedSet.has(parent)) { 
                        applyFlash(parentRow, flashClass); 
                        processedSet.add(parent); 
                        lastFlashMap.set(parent, now);
                    }
                    break; 
                }
                parent = parent.parentElement || parent.host;
            }
        }
    }

    function applyFlash(element, className) {
        element.classList.remove('flash');
        element.classList.remove('flash-delete');
        void element.offsetWidth; 
        element.classList.add(className);
        setTimeout(() => { element.classList.remove(className); }, 1000); 
    }

    return { 
        init, 
        setup, 
        setFlashEnabled,
        disconnect: () => { if (observer) observer.disconnect(); } 
    };
})();