// src/modules/core/TabManager.js
window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.TabManager = (function() {
    
    let shadowRoot = null;
    let activeTabId = 'elements';
    let activeSubTabId = 'styles';
    
    let tabLocations = { styles: 'sub', computed: 'sub', layout: 'sub', console: 'main' };
    
    
    // Store Orders
    // **new**
    // Base tabs
    let mainTabOrder = ['elements', 'console', 'network', 'source', 'monitor', 'application'];
    let subTabOrder = ['styles', 'computed', 'layout', 'console']; 

    const SecureStorage = window.MyDevTool.SecureStorage || localStorage;
    const isReactExpEnabled = SecureStorage.getItem('dt_exp_react_dev') === 'true';
    
    if (isReactExpEnabled) {
        console.log('[Suger] React tabs (components, profiler) pushed');
        mainTabOrder.push('components', 'profiler');
    }

    let resizeDebounceTimer = null;
    let pinnedTabId = null;

    let LayoutManager = null;


    function init(root, layoutManager) {
        shadowRoot = root;
        LayoutManager = layoutManager;
        
        const SecureStorage = window.MyDevTool.SecureStorage;
        if (SecureStorage) {
            const savedLocs = SecureStorage.getItem('dt_tab_locations');
            if (savedLocs) try { tabLocations = { ...tabLocations, ...JSON.parse(savedLocs) }; } catch(e){} 
            
            const savedMainOrder = SecureStorage.getItem('dt_main_tab_order');
            if (savedMainOrder) try { mainTabOrder = JSON.parse(savedMainOrder); } catch(e){}

            const savedSubOrder = SecureStorage.getItem('dt_sub_tab_order');
            if (savedSubOrder) try { subTabOrder = JSON.parse(savedSubOrder); } catch(e){}
        }
        
        bindEvents(); 
        
        ['console', 'styles', 'computed', 'layout'].forEach(tabId => {
            if (getTabLocation(tabId) === 'main') {
                moveTabContent(tabId, 'main');
            }
        });

        const allMain = ['elements', 'console', 'network', 'source', 'monitor', 'application'];
        allMain.forEach(t => { if(!mainTabOrder.includes(t)) mainTabOrder.push(t); });
        
        const allSub = ['styles', 'computed', 'layout', 'console'];
        allSub.forEach(t => { if(!subTabOrder.includes(t)) subTabOrder.push(t); });

        mainTabOrder = [...new Set(mainTabOrder)];
        subTabOrder = [...new Set(subTabOrder)];

        if (mainTabOrder.length > 0) {
            activeTabId = mainTabOrder[0];

            // Remove active class from all tabs
            shadowRoot.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            
            // Add active class to the current first tab
            const initialContent = shadowRoot.querySelector(`#${activeTabId}-content`);
            if (initialContent) initialContent.classList.add('active');

            // Update Settings button state if needed
            const setBtn = shadowRoot.querySelector('#settings-btn');
            if (setBtn) {
                if(activeTabId === 'settings') setBtn.classList.add('active');
                else setBtn.classList.remove('active');
            }
        }

        renderSubTabs(); 
        initResponsiveObserver();
        
        document.querySelectorAll('.dt-drag-ghost').forEach(el => el.remove());
        
        // Only start color picker if 'elements' is the active tab
        if (window.MyDevTool.DevTool) {
            if (activeTabId === 'elements') {
                window.MyDevTool.DevTool.startColorPickerWatcher();
            }
        }
    }

    function setTabLocation(tabId, location) {
        if (tabId === 'elements' && location === 'sub') return;

        tabLocations[tabId] = location;
        if (window.MyDevTool.SecureStorage) window.MyDevTool.SecureStorage.setItem('dt_tab_locations', JSON.stringify(tabLocations));
        
        moveTabContent(tabId, location);
        
        if (location === 'main') {
            switchTab(tabId);
        } else {
            if (activeTabId === tabId) switchTab('elements');
            switchSubTab(tabId);
        }

        renderMainTabs(); 
        renderSubTabs();
        
        if(tabId === 'settings' && window.MyDevTool.SettingsTab) window.MyDevTool.SettingsTab.init(shadowRoot.querySelector('#settings-content'), shadowRoot);
    }

    function moveTabContent(tabId, toLocation) {
        const sub = shadowRoot.querySelector(`#${tabId}-sub-content`);
        const main = shadowRoot.querySelector(`#${tabId}-content`);
        if (!sub || !main) return;
        const target = toLocation === 'main' ? main : sub;
        const source = toLocation === 'main' ? sub : main;
        while (source.firstChild) target.appendChild(source.firstChild);
    }

    function saveOrder(type, newOrder) {
        const uniqueOrder = [...new Set(newOrder)];
        if (type === 'main') {
            mainTabOrder = uniqueOrder;
            if (window.MyDevTool.SecureStorage) window.MyDevTool.SecureStorage.setItem('dt_main_tab_order', JSON.stringify(mainTabOrder));
        } else {
            subTabOrder = uniqueOrder;
            if (window.MyDevTool.SecureStorage) window.MyDevTool.SecureStorage.setItem('dt_sub_tab_order', JSON.stringify(subTabOrder));
        }
    }

    function renderMainTabs() {
        const container = shadowRoot.querySelector('.tabs');
        const visibleContainer = shadowRoot.querySelector('#visible-tabs-container');
        const moreBtn = shadowRoot.querySelector('#more-tabs-btn');
        const dropdown = shadowRoot.querySelector('#more-tabs-dropdown');
        const i18n = window.MyDevTool.LanguageManager;

        if (!visibleContainer || !container) return;

        visibleContainer.innerHTML = ''; 
        dropdown.innerHTML = '';
        
    const isReactExpEnabled = SecureStorage.getItem('dt_exp_react_dev') === 'true';

    let displayList = mainTabOrder.filter(id => {
        if ((id === 'components' || id === 'profiler') && !isReactExpEnabled) {
            return false;
        }
        
        return getTabLocation(id) === 'main';
    });

        ['console', 'styles', 'computed', 'layout'].forEach(id => {
            if(getTabLocation(id) === 'main' && !displayList.includes(id)) {
                displayList.push(id);
            }
        });
        
        displayList = [...new Set(displayList)];

        const totalAvailableWidth = container.clientWidth - 110; 
        let tabWidths = [];

        displayList.forEach(tabId => {
            const btn = document.createElement('button'); 
            btn.className = 'tab-button'; 
            btn.textContent = i18n ? (i18n.t(`tabs.${tabId}`) || capitalize(tabId)) : capitalize(tabId);
            btn.style.visibility = 'hidden'; 
            btn.style.position = 'absolute'; 
            visibleContainer.appendChild(btn);
            tabWidths.push({ id: tabId, width: btn.getBoundingClientRect().width + 8 });
            visibleContainer.removeChild(btn);
        });

        let currentWidth = 0; 
        let capacity = 0;
        const limit = totalAvailableWidth - 35; 

        for (let t of tabWidths) { 
            if (currentWidth + t.width <= limit) { 
                currentWidth += t.width;
                capacity++; 
            } else { 
                break; 
            } 
        }

        let visibleTabs = [];
        let hiddenTabs = [];

        if (capacity >= displayList.length) { 
            visibleTabs = displayList.map(id => ({ id }));
        } else {
            const staticCount = Math.max(0, capacity - 1);
            const staticTabs = displayList.slice(0, staticCount);
            let lastSlotTabId = displayList[staticCount];

            if (!staticTabs.includes(activeTabId) && displayList.includes(activeTabId)) pinnedTabId = activeTabId;
            else pinnedTabId = null;

            if (pinnedTabId && !staticTabs.includes(pinnedTabId)) lastSlotTabId = pinnedTabId;

            visibleTabs = staticTabs.map(id => ({ id }));
            if (lastSlotTabId && !visibleTabs.some(v => v.id === lastSlotTabId)) visibleTabs.push({ id: lastSlotTabId });
            
            const visibleIds = new Set(visibleTabs.map(t => t.id));
            hiddenTabs = displayList.filter(id => !visibleIds.has(id)).map(id => ({ id }));
        }

        // Render Visible Tabs
        visibleTabs.forEach(t => {
            const btn = document.createElement('button');
            btn.className = `tab-button ${t.id === activeTabId ? 'active' : ''}`;
            btn.textContent = i18n ? (i18n.t(`tabs.${t.id}`) || capitalize(t.id)) : capitalize(t.id);
            btn.dataset.tabId = t.id;
            
            btn.style.userSelect = 'none';
            btn.style.webkitUserSelect = 'none';
            btn.setAttribute('draggable', 'false');

            btn.onclick = () => switchTab(t.id);
            
            setupLongPressDrag(btn, visibleContainer, 'main', (newIds) => {
                const mergedOrder = [...newIds, ...hiddenTabs.map(h => h.id), ...mainTabOrder];
                saveOrder('main', mergedOrder);
                renderMainTabs();
            });
            visibleContainer.appendChild(btn);
        });

        // Render Hidden Tabs
        if (hiddenTabs.length > 0) {
            moreBtn.style.display = 'flex';
            hiddenTabs.forEach(t => {
                const item = document.createElement('div'); 
                item.className = 'dropdown-item';
                item.dataset.tabId = t.id;
                item.textContent = i18n ? (i18n.t(`tabs.${t.id}`) || capitalize(t.id)) : capitalize(t.id);
                if (t.id === activeTabId) item.classList.add('active');
                item.style.userSelect = 'none'; 
                
                // CLICK HANDLER: Replace Rightmost Tab
                item.onclick = (e) => { 
                    if(item.dataset.isDragging === 'true') return;
                    e.stopPropagation();

                    //  Remove from current list
                    mainTabOrder = mainTabOrder.filter(id => id !== t.id);
                    
                    //  Find position of the LAST VISIBLE tab
                    const lastVisibleTab = visibleTabs[visibleTabs.length - 1];
                    const targetIndex = lastVisibleTab ? mainTabOrder.indexOf(lastVisibleTab.id) : -1;

                    // Insert AT that position (Taking its place, pushing it to overflow)
                    if (targetIndex >= 0) {
                        mainTabOrder.splice(targetIndex, 0, t.id);
                    } else {
                        mainTabOrder.push(t.id);
                    }

                    saveOrder('main', mainTabOrder);
                    
                    switchTab(t.id); 
                    dropdown.style.display = 'none'; 
                };
                
                setupLongPressDrag(item, dropdown, 'menu', (newIds) => {
                    const mergedOrder = [...visibleTabs.map(v => v.id), ...newIds, ...mainTabOrder];
                    saveOrder('main', mergedOrder);
                    renderMainTabs(); 
                });

                dropdown.appendChild(item);
            });
        } else { 
            moreBtn.style.display = 'none'; 
            dropdown.style.display = 'none';
        }
    }

    function setupLongPressDrag(element, container, type, onReorder) {
        let timer = null;
        let isDragging = false;
        let isPointerDown = false;
        let ghost = null;
        let startX, startY;
        let targetZoneElement = null;

        const cleanup = () => {
            if (timer) clearTimeout(timer);
            isPointerDown = false;
            
            if (ghost) ghost.remove();
            document.querySelectorAll('.dt-drag-ghost').forEach(el => el.remove());

            element.style.opacity = '1';
            element.dataset.isDragging = 'false';
            isDragging = false;
            ghost = null;
            if(targetZoneElement) targetZoneElement.style.border = 'none';
            targetZoneElement = null;

            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', cleanup);
            window.removeEventListener('blur', cleanup);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onUp);
            window.removeEventListener('touchcancel', cleanup);
        };

        const onDown = (e) => {
            if(e.button === 2 || (e.touches && e.touches.length > 1)) return;
            
            startX = e.touches ? e.touches[0].clientX : e.clientX;
            startY = e.touches ? e.touches[0].clientY : e.clientY;
            
            isPointerDown = true; 
            document.querySelectorAll('.dt-drag-ghost').forEach(el => el.remove());

            timer = setTimeout(() => {
                if (!isPointerDown) return;
                startDrag(e);
            }, 500);

            window.addEventListener('pointermove', checkCancel);
            window.addEventListener('touchmove', checkCancel);
            window.addEventListener('pointerup', onUpPreDrag);
            window.addEventListener('touchend', onUpPreDrag);
        };

        const checkCancel = (e) => {
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            if (Math.abs(cx - startX) > 10 || Math.abs(cy - startY) > 10) {
                clearTimeout(timer);
                cleanupPreDrag();
            }
        };

        const onUpPreDrag = () => {
            isPointerDown = false;
            clearTimeout(timer);
            cleanupPreDrag();
        };

        const cleanupPreDrag = () => {
            window.removeEventListener('pointermove', checkCancel);
            window.removeEventListener('touchmove', checkCancel);
            window.removeEventListener('pointerup', onUpPreDrag);
            window.removeEventListener('touchend', onUpPreDrag);
        };

        const startDrag = (e) => {
            cleanupPreDrag(); 
            if (!isPointerDown) return;

            isDragging = true;
            element.dataset.isDragging = 'true';

            if (navigator.vibrate) navigator.vibrate(50);

            const rect = element.getBoundingClientRect();
            
            ghost = element.cloneNode(true);
            ghost.className += ' dt-drag-ghost';
            ghost.style.position = 'fixed';
            ghost.style.zIndex = '2147483647'; 
            ghost.style.pointerEvents = 'none';
            ghost.style.opacity = '0.9';
            ghost.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
            ghost.style.transform = 'scale(1.05)';
            ghost.style.left = rect.left + 'px';
            ghost.style.top = rect.top + 'px';
            ghost.style.width = rect.width + 'px';
            ghost.style.height = rect.height + 'px';
            ghost.style.background = getComputedStyle(element).background;
            
            if(ghost.style.background === 'rgba(0, 0, 0, 0)' || !ghost.style.background) {
                ghost.style.backgroundColor = '#444'; 
            }

            document.body.appendChild(ghost);
            element.style.opacity = '0.2';
            
            if (type === 'main') {
                targetZoneElement = shadowRoot.querySelector('.sub-tabs-list');
            } else if (type === 'sub') {
                targetZoneElement = shadowRoot.querySelector('#visible-tabs-container');
            } else if (type === 'menu') {
                targetZoneElement = shadowRoot.querySelector('#visible-tabs-container');
            }

            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
            window.addEventListener('pointercancel', cleanup);
            window.addEventListener('blur', cleanup);
            
            window.addEventListener('touchmove', onMove, {passive: false});
            window.addEventListener('touchend', onUp);
            window.addEventListener('touchcancel', cleanup);
        };

        const onMove = (e) => {
            if (!isDragging) return;
            e.preventDefault(); 

            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;

            if(ghost) {
                ghost.style.left = (cx - (ghost.offsetWidth / 2)) + 'px';
                ghost.style.top = (cy - (ghost.offsetHeight / 2)) + 'px';
            }

            if (targetZoneElement) {
                const zoneRect = targetZoneElement.getBoundingClientRect();
                if (cx > zoneRect.left && cx < zoneRect.right && cy > zoneRect.top && cy < zoneRect.bottom) {
                    targetZoneElement.style.border = '2px dashed var(--dt-text-accent)';
                    return; 
                } else {
                    targetZoneElement.style.border = 'none';
                }
            }

            const siblings = Array.from(container.children).filter(c => c !== element && c !== ghost && c.style.display !== 'none');
            for (let sibling of siblings) {
                const sRect = sibling.getBoundingClientRect();
                if (cx > sRect.left && cx < sRect.right && cy > sRect.top && cy < sRect.bottom) {
                    const curIndex = Array.from(container.children).indexOf(element);
                    const sibIndex = Array.from(container.children).indexOf(sibling);
                    if (curIndex < sibIndex) {
                        container.insertBefore(element, sibling.nextSibling);
                    } else {
                        container.insertBefore(element, sibling);
                    }
                    break; 
                }
            }
        };

        const onUp = (e) => {
            if (!isDragging) return;

            let handledCrossDrop = false;
            if (targetZoneElement) {
                const cx = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
                const cy = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
                const zoneRect = targetZoneElement.getBoundingClientRect();

                if (cx > zoneRect.left && cx < zoneRect.right && cy > zoneRect.top && cy < zoneRect.bottom) {
                    const id = element.dataset.tabId;
                    if (id && id !== 'elements') { 
                        
                        // DRAG HANDLER: Replace Rightmost Tab (Menu -> Header)
                        if (type === 'menu') {
                            mainTabOrder = mainTabOrder.filter(t => t !== id);
                            
                            // Find the ID of the last visible tab currently in DOM
                            const visibleBtns = Array.from(targetZoneElement.children); // targetZoneElement is visible-tabs-container
                            const lastBtn = visibleBtns[visibleBtns.length - 1];
                            const lastVisibleId = lastBtn ? lastBtn.dataset.tabId : null;
                            const targetIndex = lastVisibleId ? mainTabOrder.indexOf(lastVisibleId) : -1;

                            if(targetIndex >= 0) mainTabOrder.splice(targetIndex, 0, id);
                            else mainTabOrder.push(id);
                            
                            saveOrder('main', mainTabOrder);
                            renderMainTabs();
                            handledCrossDrop = true;
                        } 
                        else {
                            const newLoc = type === 'main' ? 'sub' : 'main';
                            setTabLocation(id, newLoc);
                            handledCrossDrop = true;
                        }
                    }
                }
            }
            
            if (!handledCrossDrop) {
                const newOrderIds = Array.from(container.children)
                                         .map(el => el.dataset.tabId)
                                         .filter(id => id !== undefined && id !== null && id !== '');
                cleanup(); 
                onReorder(newOrderIds);
            } else {
                cleanup();
            }
        };

        element.addEventListener('pointerdown', onDown);
        element.addEventListener('touchstart', onDown, {passive: true});
        element.addEventListener('contextmenu', e => { if(isDragging) e.preventDefault(); });
    }

    function initResponsiveObserver() {
        const container = shadowRoot.querySelector('.tabs');
        const moreBtn = shadowRoot.querySelector('#more-tabs-btn');
        const dropdown = shadowRoot.querySelector('#more-tabs-dropdown');

        if (!container) return;
        renderMainTabs(); 
        const observer = new ResizeObserver(() => { 
            if (resizeDebounceTimer) clearTimeout(resizeDebounceTimer); 
            resizeDebounceTimer = setTimeout(() => { renderMainTabs(); }, 100); 
        });
        observer.observe(container); 

        if (moreBtn) {
            moreBtn.onclick = (e) => { 
                e.stopPropagation(); 
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block'; 
            };
        }
        if (shadowRoot) {
            shadowRoot.addEventListener('click', (e) => { 
                if (moreBtn && dropdown && !e.composedPath().includes(moreBtn) && !e.composedPath().includes(dropdown)) {
                    dropdown.style.display = 'none'; 
                }
            });
        }
    }

    function renderSubTabs() {
        const headerList = shadowRoot.querySelector('.sub-tabs-list');
        if(!headerList) return;

        const existingBtns = {};
        shadowRoot.querySelectorAll('.sub-tab-button').forEach(btn => {
            existingBtns[btn.dataset.tab] = btn;
            btn.remove(); 
        });

        let visibleCount = 0;
        
        subTabOrder.forEach(id => {
            const btn = existingBtns[id];
            if (btn) {
                if (getTabLocation(id) === 'main') {
                    btn.style.display = 'none';
                } else {
                    btn.style.display = 'inline-block';
                    visibleCount++;
                }
                
                btn.style.userSelect = 'none';
                btn.setAttribute('draggable', 'false');
                
                setupLongPressDrag(btn, headerList, 'sub', (newIds) => {
                     const finalOrder = [...new Set([...newIds, ...subTabOrder])];
                     saveOrder('sub', finalOrder);
                });
                
                btn.dataset.tabId = id; 
                headerList.appendChild(btn);
                delete existingBtns[id]; 
            }
        });

        Object.keys(existingBtns).forEach(id => {
             const btn = existingBtns[id];
             btn.dataset.tabId = id;
             btn.style.userSelect = 'none';
             headerList.appendChild(btn);
             if (getTabLocation(id) !== 'main') visibleCount++;
        });

        const resizeHandle = shadowRoot.querySelector('.inspector-resize-handle');
        const minBtn = shadowRoot.querySelector('#sub-tab-minimize-btn');
        
        if (visibleCount === 0) {
            LayoutManager.toggleInspectorCollapse(true);
            if(resizeHandle) resizeHandle.style.setProperty('display', 'none', 'important');
            if(minBtn) { minBtn.style.opacity = '0.3'; minBtn.style.pointerEvents = 'none'; }
        } else {
            if(resizeHandle && !LayoutManager.getIsInspectorMinimized()) resizeHandle.style.setProperty('display', 'block', 'important');
            if(minBtn) { minBtn.style.opacity = '1'; minBtn.style.pointerEvents = 'auto'; }
        }
    }

    function switchTab(id) {
        activeTabId = id;
        shadowRoot.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        const content = shadowRoot.querySelector(`#${id}-content`);
        if (content) {
            content.classList.add('active');
            
            if (id === 'components' && window.MyDevTool.ReactComponents) {
             window.MyDevTool.ReactComponents.init(content, shadowRoot);
           }
           
            if (id === 'profiler' && window.MyDevTool.ReactProfiler) {
             window.MyDevTool.ReactProfiler.init(content, shadowRoot);
           }
            
            if (id === 'layout' && window.MyDevTool.LayoutTab) {
                 window.MyDevTool.LayoutTab.init(content);
            }

            if (['styles', 'computed', 'layout'].includes(id) && window.MyDevTool.DomTree) {
                window.MyDevTool.DomTree.triggerSelection();
            }
        }
        
        const setBtn = shadowRoot.querySelector('#settings-btn');
        if (setBtn) {
            if(id === 'settings') { 
                setBtn.classList.add('active'); 
                if(window.MyDevTool.SettingsTab) window.MyDevTool.SettingsTab.init(shadowRoot.querySelector('#settings-content'), shadowRoot); 
            } else {
                setBtn.classList.remove('active');
            }
        }

        if (window.MyDevTool.MonitorTab) {
            if (id === 'monitor') window.MyDevTool.MonitorTab.start();
            else window.MyDevTool.MonitorTab.stop();
        }

        if (window.MyDevTool.DevTool) {
            if (id === 'elements' && !LayoutManager.getIsCollapsed()) window.MyDevTool.DevTool.startColorPickerWatcher();
            else window.MyDevTool.DevTool.stopColorPickerWatcher();
        }
        renderMainTabs();
    }

    function switchSubTab(id, suppressTrigger = false) {
        activeSubTabId = id;
        shadowRoot.querySelectorAll('.sub-tab-button').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
        shadowRoot.querySelectorAll('.sub-tab-content').forEach(c => c.classList.remove('active'));
        const content = shadowRoot.querySelector(`#${id}-sub-content`);
        if (content) content.classList.add('active');
        if (LayoutManager.getIsInspectorMinimized()) LayoutManager.toggleInspectorCollapse(false);
        
        if (!suppressTrigger && window.MyDevTool.DomTree && ['styles','computed','layout'].includes(id)) {
            window.MyDevTool.DomTree.triggerSelection();
        }
    }

    function bindEvents() {
        shadowRoot.querySelectorAll('.sub-tab-button').forEach(b => b.onclick = (e) => {
            if(b.dataset.isDragging === 'true') return;
            switchSubTab(e.target.dataset.tab);
        });
        
        const settingsBtn = shadowRoot.querySelector('#settings-btn');
        if (settingsBtn) settingsBtn.onclick = () => switchTab('settings');
        
        const minBtn = shadowRoot.querySelector('#sub-tab-minimize-btn');
        if (minBtn) {
            minBtn.onclick = (e) => {
                e.stopPropagation();
                LayoutManager.toggleInspectorCollapse();
            };
        }
        
        const menuBtn = shadowRoot.querySelector('#sub-tab-menu-btn');
        if (menuBtn) {
            menuBtn.onclick = (e) => {
                e.stopPropagation();
                const tabName = capitalize(activeSubTabId);
                const isMain = getTabLocation(activeSubTabId) === 'main';
                const options = [{
                    label: `Show ${tabName} in main tab`,
                    type: 'checkbox',
                    checked: isMain,
                    callback: () => setTabLocation(activeSubTabId, isMain ? 'sub' : 'main')
                }];
                if (window.MyDevTool.ContextMenu) window.MyDevTool.ContextMenu.show(e, options);
            };
        }
    }

    function getContainerFor(id) {
        return getTabLocation(id) === 'main' ? shadowRoot.querySelector(`#${id}-content`) : shadowRoot.querySelector(`#${id}-sub-content`);
    }
    
    function restoreActiveSubTabContent() {
        const subBtns = Array.from(shadowRoot.querySelectorAll('.sub-tab-button'));
        const visibleTabs = subBtns.filter(btn => btn.style.display !== 'none').map(btn => btn.dataset.tab);
        if (visibleTabs.length === 0) return;
        if (visibleTabs.includes(activeSubTabId)) {
            switchSubTab(activeSubTabId, true);
        } else {
            switchSubTab(visibleTabs[0], true);
        }
    }

    function getTabLocation(id) { return tabLocations[id] || 'main'; }
    function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    return { 
        init, 
        switchTab, 
        switchSubTab, 
        setTabLocation, 
        getTabLocation, 
        getContainerFor, 
        restoreActiveSubTabContent 
    };
})();