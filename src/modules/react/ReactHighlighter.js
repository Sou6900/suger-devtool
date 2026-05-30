// src/modules/react/ReactHighlighter.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.ReactHighlighter = (function() {
    let isInspecting = false;
    let overlay = null;
    let tooltip = null;
    let activeBtn = null;
    let isInitialized = false;

    function init() {
        if (isInitialized) return;
        
        overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed; z-index:2147483646; pointer-events:none; background:var(--dt-highlight-bg, rgba(56, 189, 248, 0.3)); border:1px solid var(--dt-highlight-border, #38bdf8); display:none; transition:all 0.05s linear;';
        
        tooltip = document.createElement('div');
        tooltip.style.cssText = 'position:fixed; z-index:2147483647; pointer-events:none; background:var(--dt-bg-tooltip, #0f172a); color:var(--dt-text-accent, #38bdf8); font-family:monospace; font-size:11px; padding:4px 8px; border-radius:4px; display:none; white-space:nowrap; box-shadow:0 2px 4px var(--dt-shadow, rgba(0,0,0,0.3)); font-weight:bold; border:1px solid var(--dt-border-color, #334155);';
        
        document.documentElement.appendChild(overlay);
        document.documentElement.appendChild(tooltip);
        isInitialized = true;
    }

    function toggle(btn) {
        init();
        activeBtn = btn;
        if (isInspecting) {
            disable();
        } else {
            setTimeout(enable, 50); 
        }
    }

    function enable() {
        isInspecting = true;
        if (activeBtn) activeBtn.style.color = 'var(--dt-text-accent, #38bdf8)';
        
        document.addEventListener('mousemove', handlePointerMove, true);
        document.addEventListener('click', handleClick, true);
        
        document.addEventListener('touchmove', handlePointerMove, { capture: true, passive: false });
        document.addEventListener('touchend', handleClick, { capture: true, passive: false });
        
        document.addEventListener('keydown', handleKeyDown, true);
        document.body.style.cursor = 'crosshair';
    }

    function disable() {
        isInspecting = false;
        if (activeBtn) activeBtn.style.color = 'var(--dt-text-secondary, #888)';
        
        document.removeEventListener('mousemove', handlePointerMove, true);
        document.removeEventListener('click', handleClick, true);
        
        document.removeEventListener('touchmove', handlePointerMove, { capture: true });
        document.removeEventListener('touchend', handleClick, { capture: true });
        
        document.removeEventListener('keydown', handleKeyDown, true);
        
        if (overlay) overlay.style.display = 'none';
        if (tooltip) tooltip.style.display = 'none';
        document.body.style.cursor = '';
    }

    function getFiber(element) {
        if (!element) return null;
        const key = Object.keys(element).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
        return key ? element[key] : null;
    }

    function getComponentName(f) { 
        if (!f) return 'Unknown';
        if (typeof f.type === 'string') return f.type;
        return f.type?.displayName || f.type?.name || f.type?.render?.name || 'Component';
    }

    function handlePointerMove(e) {
        if (!isInspecting) return;
        
        let target;
        if (e.touches && e.touches.length > 0) {
            e.preventDefault(); 
            const touch = e.touches[0];
            target = document.elementFromPoint(touch.clientX, touch.clientY);
        } else {
            target = e.composedPath()[0];
        }
        
        if (!target || target.closest('.devtool-container') || target.closest('#my-devtool-host')) {
            overlay.style.display = 'none';
            tooltip.style.display = 'none';
            return;
        }

        const rect = target.getBoundingClientRect();
        overlay.style.width = rect.width + 'px';
        overlay.style.height = rect.height + 'px';
        overlay.style.left = rect.left + 'px';
        overlay.style.top = rect.top + 'px';
        overlay.style.display = 'block';

        const fiber = getFiber(target);
        let compName = 'DOM Element';
        
        if (fiber) {
            let curr = fiber;
            while (curr && typeof curr.type === 'string') curr = curr.return;
            compName = getComponentName(curr || fiber);
        }

        tooltip.textContent = `<${compName}> | ${Math.round(rect.width)} × ${Math.round(rect.height)}`;
        tooltip.style.display = 'block';
        
        let tTop = rect.top - 25;
        let tLeft = rect.left;
        if (tTop < 0) tTop = rect.bottom + 5;
        if (tLeft < 0) tLeft = 0;
        
        tooltip.style.top = tTop + 'px';
        tooltip.style.left = tLeft + 'px';
    }

    function handleClick(e) {
        if (!isInspecting) return;
        
        e.preventDefault();
        e.stopPropagation();

        let target;
        if (e.changedTouches && e.changedTouches.length > 0) {
            const touch = e.changedTouches[0];
            target = document.elementFromPoint(touch.clientX, touch.clientY);
        } else {
            target = e.composedPath()[0];
        }

        if (!target || target.closest('.devtool-container') || target.closest('#my-devtool-host')) return;

        const fiber = getFiber(target);
        disable();

        if (fiber && window.MyDevTool.ReactComponents) {
            window.MyDevTool.ReactComponents.selectNodeByFiber(fiber);
        } else {
            console.warn("[Suger] Element not in React Tree.");
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Escape' && isInspecting) {
            e.preventDefault();
            e.stopPropagation();
            disable();
        }
    }

    return { toggle, disable };
})();