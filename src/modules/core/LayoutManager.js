// src/modules/core/LayoutManager.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.LayoutManager = (function () {

    let shadowRoot = null;
    let isCollapsed = false;
    let collapseMode = 'float';
    let isInspectorMinimized = false;
    let subTabLayout = 'vertical';
    let floatBtn = null;
    let isColorPicking = false;

    let lastInspectorSize = null;
    let TabManagerRef = null;

    function init(root, tabManager) {
        shadowRoot = root;
        TabManagerRef = tabManager;

        const SecureStorage = window.MyDevTool.SecureStorage || localStorage;

        if (SecureStorage) {
            collapseMode = SecureStorage.getItem('collapse_mode') || 'float';
            subTabLayout = SecureStorage.getItem('dt_sub_tab_layout') || 'vertical';

            const alwaysMinimize = SecureStorage.getItem('dt_always_minimize') === 'true';

            if (alwaysMinimize) {
                isCollapsed = true;
            } else {
                const savedCollapsed = SecureStorage.getItem('dt_is_collapsed');
                isCollapsed = (savedCollapsed === 'true' || savedCollapsed === true);
            }
        }

        floatBtn = shadowRoot.querySelector('#devtool-float-btn');
        setupGlobalResize();
        setupInspectorResize();
        setupFloatButton();

        setSubTabLayout(subTabLayout);
        toggleCollapse(isCollapsed);
    }

    function setupGlobalResize() {
        const resizeHandler = shadowRoot.querySelector('#dt-global-resize-handler');
        const mainHeader = shadowRoot.querySelector('.tabs');
        const container = shadowRoot.querySelector('.devtool-container');

        const startResize = (e) => {
            if (e.target.closest('button') || e.target.closest('.dropdown-item') || e.target.closest('input')) return;

            e.preventDefault(); e.stopPropagation();
            if (isCollapsed && collapseMode === 'minimize') toggleCollapse(false);

            const moveHandler = (moveEvent) => {
                requestAnimationFrame(() => {
                    const clientY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;
                    const newHeight = window.innerHeight - clientY;
                    if (newHeight > 30 && newHeight < window.innerHeight * 0.9) {
                        container.style.height = `${newHeight}px`;
                        const pauseOverlay = document.getElementById('my-devtool-pause-overlay');
                        if (pauseOverlay && pauseOverlay.style.display === 'block') pauseOverlay.style.bottom = `${newHeight}px`;
                    }
                });
            };
            const stopHandler = () => {
                window.removeEventListener('pointermove', moveHandler); window.removeEventListener('pointerup', stopHandler);
                window.removeEventListener('touchmove', moveHandler); window.removeEventListener('touchend', stopHandler);
                if (window.MyDevTool.SecureStorage) window.MyDevTool.SecureStorage.setItem('dt_panel_height', container.style.height);
            };
            window.addEventListener('pointermove', moveHandler); window.addEventListener('pointerup', stopHandler);
            window.addEventListener('touchmove', moveHandler); window.addEventListener('touchend', stopHandler);
        };

        if (resizeHandler) {
            resizeHandler.addEventListener('pointerdown', startResize);
            resizeHandler.addEventListener('touchstart', startResize);
        }

        if (mainHeader) {
            mainHeader.style.cursor = 'ns-resize';
            mainHeader.style.touchAction = 'none';
            mainHeader.addEventListener('pointerdown', startResize);
            mainHeader.addEventListener('touchstart', startResize);
        }
    }

    function setupFloatButton() {
        floatBtn.onclick = (e) => {
            if (floatBtn.dataset.dragging === 'true') return;
            if (isColorPicking) return;
            toggleCollapse(false);
        };
        makeDraggable(floatBtn);
    }

    function makeDraggable(el) {
        let isDragging = false; let startX, startY, initialLeft, initialTop;
        const onDown = (e) => { isDragging = false; el.dataset.dragging = 'false'; const clientX = e.touches ? e.touches[0].clientX : e.clientX; const clientY = e.touches ? e.touches[0].clientY : e.clientY; startX = clientX; startY = clientY; const rect = el.getBoundingClientRect(); initialLeft = rect.left; initialTop = rect.top; el.setPointerCapture(e.pointerId); el.addEventListener('pointermove', onMove); el.addEventListener('pointerup', onUp); };
        const onMove = (e) => { const clientX = e.touches ? e.touches[0].clientX : e.clientX; const clientY = e.touches ? e.touches[0].clientY : e.clientY; const dx = clientX - startX; const dy = clientY - startY; if (Math.abs(dx) > 5 || Math.abs(dy) > 5) { isDragging = true; el.dataset.dragging = 'true'; } if (isDragging) { e.preventDefault(); el.style.left = `${initialLeft + dx}px`; el.style.top = `${initialTop + dy}px`; el.style.bottom = 'auto'; el.style.right = 'auto'; } };
        const onUp = (e) => { el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerup', onUp); el.releasePointerCapture(e.pointerId); if (isDragging) { snapToEdge(el); } };
        el.addEventListener('pointerdown', onDown);
    }

    function snapToEdge(el) {
        const rect = el.getBoundingClientRect(); const winW = window.innerWidth; if (rect.left + rect.width / 2 < winW / 2) { el.style.left = '10px'; } else { el.style.left = (winW - rect.width - 10) + 'px'; } if (rect.top < 0) el.style.top = '10px'; if (rect.bottom > window.innerHeight) el.style.top = (window.innerHeight - rect.height - 10) + 'px';
    }

    function toggleCollapse(shouldCollapse) {
        isCollapsed = shouldCollapse;
        if (window.MyDevTool.SecureStorage) window.MyDevTool.SecureStorage.setItem('dt_is_collapsed', shouldCollapse);

        const container = shadowRoot.querySelector('.devtool-container');
        const collapseBtn = shadowRoot.querySelector('#collapse-btn');
        if (collapseBtn) {
            collapseBtn.style.transform = shouldCollapse ? 'rotate(180deg)' : 'rotate(0deg)';
            collapseBtn.style.transition = 'transform 0.3s ease';
        }

        if (shouldCollapse) {
            if (collapseMode === 'float') {
                container.style.display = 'none';
                if (floatBtn) floatBtn.style.display = 'flex';
            } else {
                container.classList.add('minimized');
            }
        } else {
            if (collapseMode === 'float') {
                container.style.display = 'flex';
                if (floatBtn) floatBtn.style.display = 'none';
            } else {
                container.classList.remove('minimized');
                container.classList.remove('active-touch');
            }
        }
    }

    function setSubTabLayout(layout) {
        subTabLayout = layout;
        lastInspectorSize = null;
        if (window.MyDevTool.SecureStorage) window.MyDevTool.SecureStorage.setItem('dt_sub_tab_layout', layout);

        const tabs = [
            { id: '#elements-content', paneId: '#style-inspector-pane', mainId: '#elements-main-panel', headerId: '.sub-tabs-header' },
            { id: '#components-content', paneId: '#react-inspector-pane', mainId: '#components-main-panel', headerId: '.react-toolbar' }
        ];

        tabs.forEach(tab => {
            const elContent = shadowRoot.querySelector(tab.id);
            if (elContent) {
                elContent.classList.remove('vertical', 'horizontal');
                elContent.classList.add(layout);
                const inspectorPane = elContent.querySelector(tab.paneId);
                const mainPanel = elContent.querySelector(tab.mainId);
                if (inspectorPane) inspectorPane.style = '';
                if (mainPanel) mainPanel.style = '';

                const header = elContent.querySelector(tab.headerId);
                if (header) {
                    header.style.cursor = layout === 'vertical' ? 'row-resize' : 'col-resize';
                    header.style.touchAction = 'none';
                }
            }
        });

        updateMinimizeIconRotation();
    }

    function setupInspectorResize() {
        function bindResizer(contentSelector, mainSelector, paneSelector, handleSelector, headerSelector) {
            const content = shadowRoot.querySelector(contentSelector);
            if (!content) return;
            const handle = content.querySelector(handleSelector);
            const header = content.querySelector(headerSelector);
            const mainPanel = content.querySelector(mainSelector);
            const pane = content.querySelector(paneSelector);

            if (!handle && !header) return;

            const startResize = (e) => {
                if (e.target.closest('button') || e.target.closest('.sub-tab-button') || e.target.closest('input')) return;

                if (contentSelector === '#elements-content') {
                    const hasVisibleTabs = Array.from(pane.querySelectorAll('.sub-tab-button'))
                        .some(btn => btn.style.display !== 'none');
                    if (!hasVisibleTabs) return;
                }

                e.preventDefault(); e.stopPropagation();

                const moveHandler = (moveEvent) => {
                    requestAnimationFrame(() => {
                        const contentRect = content.getBoundingClientRect();
                        if (subTabLayout === 'horizontal') {
                            const clientX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
                            const newRightWidth = contentRect.right - clientX;
                            const constrainedWidth = Math.min(Math.max(newRightWidth, 50), contentRect.width - 50);
                            const percent = (constrainedWidth / contentRect.width) * 100;
                            pane.style.width = `${percent}%`;
                            mainPanel.style.width = `${100 - percent}%`;
                        } else {
                            const clientY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;
                            const total = contentRect.height;
                            const newInspectorHeight = contentRect.bottom - clientY;
                            const inspectorH = Math.min(Math.max(newInspectorHeight, 30), total - 30);
                            pane.style.height = inspectorH + 'px';
                        }
                    });
                };

                const stopHandler = () => {
                    window.removeEventListener('pointermove', moveHandler); window.removeEventListener('pointerup', stopHandler);
                    window.removeEventListener('touchmove', moveHandler); window.removeEventListener('touchend', stopHandler);
                    if (contentSelector === '#elements-content') {
                        if (subTabLayout === 'horizontal') lastInspectorSize = pane.style.width;
                        else lastInspectorSize = pane.style.height;
                    }
                };

                window.addEventListener('pointermove', moveHandler); window.addEventListener('pointerup', stopHandler);
                window.addEventListener('touchmove', moveHandler); window.addEventListener('touchend', stopHandler);
            };

            if (handle) {
                handle.addEventListener('pointerdown', startResize);
                handle.addEventListener('touchstart', startResize);
            }
            if (header) {
                header.addEventListener('pointerdown', startResize);
                header.addEventListener('touchstart', startResize);
                header.style.cursor = subTabLayout === 'vertical' ? 'row-resize' : 'col-resize';
                header.style.touchAction = 'none';
            }
        }

        // Attach independently
        bindResizer('#elements-content', '#elements-main-panel', '#style-inspector-pane', '.inspector-resize-handle', '.sub-tabs-header');
        bindResizer('#components-content', '#components-main-panel', '#react-inspector-pane', '.inspector-resize-handle', '.react-toolbar');
    }

    function toggleInspectorCollapse(forceState = null) {
        const elContent = shadowRoot.querySelector('#elements-content');
        if (!elContent) return;

        const pane = elContent.querySelector('#style-inspector-pane');
        const resizeHandle = elContent.querySelector('.inspector-resize-handle');
        if (!pane) return;

        const nextState = forceState !== null ? forceState : !isInspectorMinimized;

        if (nextState) {
            if (subTabLayout === 'horizontal') {
                if (pane.style.width && !pane.classList.contains('minimized')) lastInspectorSize = pane.style.width;
            } else {
                if (pane.style.height && !pane.classList.contains('minimized')) lastInspectorSize = pane.style.height;
            }
        }

        isInspectorMinimized = nextState;

        if (isInspectorMinimized) {
            pane.classList.add('minimized');
            if (subTabLayout === 'horizontal') { pane.style.width = '30px'; pane.style.height = '100%'; }
            else { pane.style.height = '29px'; pane.style.width = '100%'; }

            shadowRoot.querySelectorAll('.sub-tab-content').forEach(el => el.style.display = 'none');
            if (resizeHandle) resizeHandle.style.setProperty('display', 'none', 'important');

        } else {
            pane.classList.remove('minimized');
            if (subTabLayout === 'horizontal') {
                pane.style.width = lastInspectorSize || '40%';
                pane.style.height = '100%';
            } else {
                pane.style.height = lastInspectorSize || '45%';
                pane.style.width = '100%';
            }
            shadowRoot.querySelectorAll('.sub-tab-content').forEach(el => el.style.removeProperty('display'));
            if (TabManagerRef) TabManagerRef.restoreActiveSubTabContent();
            if (resizeHandle) resizeHandle.style.setProperty('display', 'block', 'important');
        }
        updateMinimizeIconRotation();
    }

    function updateMinimizeIconRotation() {
        const btn = shadowRoot.querySelector('#sub-tab-minimize-btn');
        if (!btn) return;
        btn.style.transition = 'transform 0.3s ease';
        if (subTabLayout === 'vertical') {
            btn.style.transform = isInspectorMinimized ? 'rotate(90deg)' : 'rotate(-90deg)';
        } else {
            btn.style.transform = isInspectorMinimized ? 'rotate(0deg)' : 'rotate(180deg)';
        }
    }

    return {
        init,
        toggleCollapse,
        setSubTabLayout,
        toggleInspectorCollapse,
        getSubTabLayout: () => subTabLayout,
        getIsInspectorMinimized: () => isInspectorMinimized,
        setCollapseMode: (mode) => { collapseMode = mode; },
        getIsCollapsed: () => isCollapsed,
        setColorPicking: (isPicking) => { isColorPicking = isPicking; }
    };
})();