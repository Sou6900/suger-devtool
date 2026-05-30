// src/modules/TabManager.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.TabManager = (function() {
    
    let shadowRoot = null;
    let activeTabId = 'elements';
    let tabOrder = [];
    let pinnedTabId = null;
    let resizeDebounceTimer = null;

    function init(root, initialTab = 'elements') {
        shadowRoot = root;
        activeTabId = initialTab;
        
        // Setup Resize Observer
        const container = shadowRoot.querySelector('.tabs');
        if (container) {
            const observer = new ResizeObserver(() => {
                if (resizeDebounceTimer) clearTimeout(resizeDebounceTimer);
                resizeDebounceTimer = setTimeout(() => { renderTabs(); }, 200);
            });
            observer.observe(container);
        }

        bindEvents();
        refreshLayout();
    }

    function refreshLayout() {
        const SecureStorage = window.MyDevTool.SecureStorage;
        const i18n = window.MyDevTool.LanguageManager;
        
        let stylesInMain = false;
        if (SecureStorage) {
            const val = SecureStorage.getItem('dt_styles_main_tab');
            stylesInMain = (val === 'true');
        }

        // Reset Order
        tabOrder = ['elements', 'console', 'network', 'source', 'application'];

        // nject Styles if enabled
        if (stylesInMain) {
            tabOrder.splice(1, 0, 'styles');
        }

        // Check if active tab is still valid
        if (!stylesInMain && activeTabId === 'styles') {
            switchTab('elements');
        }

        // Hide/Show Sub-tabs in Elements
        updateElementsSubTabs(stylesInMain);

        // Render Tabs
        renderTabs();
        
        // Special Case: If styles is active and we just switched layout, ensure content is visible
        if (stylesInMain && activeTabId === 'styles') {
             const stylesContent = shadowRoot.querySelector('#styles-content');
             if(stylesContent) stylesContent.classList.add('active');
             
             // Trigger re-selection to fill content
             if(window.MyDevTool.DomTree && window.MyDevTool.DomTree.triggerSelection) {
                 window.MyDevTool.DomTree.triggerSelection();
             }
        }
    }

    function updateElementsSubTabs(stylesInMain) {
        if (!shadowRoot) return;
        const stylesSubBtn = shadowRoot.querySelector('.sub-tab-button[data-tab="styles"]');
        
        if (stylesSubBtn) {
            stylesSubBtn.style.display = stylesInMain ? 'none' : 'inline-block';
            
            // If styles moved to main but was active sub-tab, switch Elements to Computed
            if (stylesInMain && stylesSubBtn.classList.contains('active')) {
                const computedBtn = shadowRoot.querySelector('.sub-tab-button[data-tab="computed"]');
                if(computedBtn) computedBtn.click();
            }
        }
    }

    function renderTabs() {
        if (!shadowRoot) return;
        const container = shadowRoot.querySelector('.tabs');
        const visibleContainer = shadowRoot.querySelector('#visible-tabs-container');
        const moreBtn = shadowRoot.querySelector('#more-tabs-btn');
        const dropdown = shadowRoot.querySelector('#more-tabs-dropdown');
        const i18n = window.MyDevTool.LanguageManager;
        
        if (!visibleContainer) return;
        
        visibleContainer.innerHTML = ''; 
        dropdown.innerHTML = '';
        
        // Calculate available space
        const totalAvailableWidth = container.clientWidth - 150; 
        let tabWidths = [];
        
        // Measurement pass
        tabOrder.forEach(tabId => {
            const btn = document.createElement('button'); 
            btn.className = 'tab-button'; 
            btn.textContent = i18n ? (i18n.t(`tabs.${tabId}`) || capitalize(tabId)) : capitalize(tabId);
            btn.style.visibility = 'hidden'; btn.style.position = 'absolute'; 
            visibleContainer.appendChild(btn);
            tabWidths.push({ id: tabId, width: btn.getBoundingClientRect().width + 8 }); 
            visibleContainer.removeChild(btn);
        });
        
        let currentWidth = 0; let capacity = 0;
        const limit = totalAvailableWidth - 35;

        for (let t of tabWidths) { 
            if (currentWidth + t.width <= limit) { currentWidth += t.width; capacity++; } 
            else { break; } 
        }
        
        let visibleTabs = []; let hiddenTabs = [];
        if (capacity >= tabOrder.length) { 
            visibleTabs = tabOrder.map(id => ({ id })); 
        } else {
            const staticCount = Math.max(0, capacity - 1); 
            const staticTabs = tabOrder.slice(0, staticCount);
            let dynamicTabId = tabOrder[staticCount];
            if (!staticTabs.includes(activeTabId)) { dynamicTabId = activeTabId; pinnedTabId = activeTabId; } 
            else if (pinnedTabId && !staticTabs.includes(pinnedTabId)) { dynamicTabId = pinnedTabId; }
            visibleTabs = staticTabs.map(id => ({ id })); 
            if (dynamicTabId) visibleTabs.push({ id: dynamicTabId });
            
            const visibleIds = new Set(visibleTabs.map(t => t.id)); 
            hiddenTabs = tabOrder.filter(id => !visibleIds.has(id)).map(id => ({ id }));
        }
        
        // Render Visible
        visibleTabs.forEach(t => {
            const btn = document.createElement('button'); 
            btn.className = `tab-button ${t.id === activeTabId ? 'active': ''}`;
            btn.textContent = i18n ? (i18n.t(`tabs.${t.id}`) || capitalize(t.id)) : capitalize(t.id);
            btn.onclick = () => switchTab(t.id); 
            visibleContainer.appendChild(btn);
        });
        
        // Render Dropdown
        if (hiddenTabs.length > 0) {
            moreBtn.style.display = 'flex';
            hiddenTabs.forEach(t => {
                const item = document.createElement('div'); item.className = 'dropdown-item';
                item.textContent = i18n ? (i18n.t(`tabs.${t.id}`) || capitalize(t.id)) : capitalize(t.id);
                if (t.id === activeTabId) item.classList.add('active');
                item.onclick = () => { switchTab(t.id); dropdown.style.display = 'none'; }; 
                dropdown.appendChild(item);
            });
        } else { moreBtn.style.display = 'none'; }
    }

    function switchTab(tabName) {
        if (!shadowRoot) return;
        activeTabId = tabName;
        
        shadowRoot.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        if (tabName === 'styles') {
            const stylesContent = shadowRoot.querySelector('#styles-content');
            if (stylesContent) stylesContent.classList.add('active');
            
            // Force Refresh Styles for Main Tab
            if (window.MyDevTool.DomTree && window.MyDevTool.DomTree.triggerSelection) {
                window.MyDevTool.DomTree.triggerSelection();
            }
        } else {
            const content = shadowRoot.querySelector(`#${tabName}-content`); 
            if (content) content.classList.add('active');
        }

        renderTabs();
        
        if (window.MyDevTool.DevTool && window.MyDevTool.DevTool.handleTabSwitch) {
            window.MyDevTool.DevTool.handleTabSwitch(tabName);
        }
    }

    function bindEvents() {
        const moreBtn = shadowRoot.querySelector('#more-tabs-btn');
        const dropdown = shadowRoot.querySelector('#more-tabs-dropdown');
        if (moreBtn && dropdown) {
            moreBtn.onclick = (e) => { e.stopPropagation(); dropdown.style.display = dropdown.style.display === 'block' ? 'none': 'block'; };
            document.addEventListener('click', (e) => { if (!e.composedPath().includes(moreBtn)) dropdown.style.display = 'none'; });
        }
    }

    function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

    return { 
        init, 
        refreshLayout, 
        switchTab, 
        getActiveTab: () => activeTabId 
    };
})();