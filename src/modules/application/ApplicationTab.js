// src/modules/application/ApplicationTab.js

window.MyDevTool = window.MyDevTool || {};
window.MyDevTool.ApplicationTab = (function () {

    let container = null, sidebar = null, mainView = null;
    let currentViewType = null;
    let SVGs = null;


    function init(containerEl) {
        SVGs = window.MyDevTool.SVGs;
        container = containerEl;
        buildUI();
        renderSidebar().then(() => {
            attachSplitter();
            renderStorageDashboard();
            const firstItem = sidebar.querySelector('.app-sidebar-item');
            if (firstItem) firstItem.classList.add('selected');
        });
    }

    function buildUI() {
        container.innerHTML = `
      <div id="application-content">
        <div class="application-wrapper">
           <div class="app-sidebar" id="app-sidebar"></div>
           <div class="app-splitter" id="app-splitter"></div>
           <div class="app-main-view" id="app-main-view">
               </div>
        </div>
      </div>
    `;
        sidebar = container.querySelector('#app-sidebar');
        mainView = container.querySelector('#app-main-view');
    }

    async function renderSidebar() {
        const i18n = window.MyDevTool.LanguageManager;
        const origin = window.location.origin;
        const StorageMgr = window.MyDevTool.StorageManager;

        const idbDbs = await StorageMgr.getIndexedDBDatabaseNames();
        const cacheList = await StorageMgr.getCacheStorageList();

        const idbChildren = await Promise.all(idbDbs.map(async (db) => {
            const stores = await StorageMgr.getIndexedDBObjectStores(db.name);
            return {
                name: db.name, id: `idb-${db.name}`, icon: SVGs.database, isDb: true, value: db.name,
                hasChildren: stores.length > 0,
                children: stores.map(store => ({ name: store, id: `idb-${db.name}-${store}`, icon: SVGs.table, isStore: true, dbName: db.name, storeName: store, hasChildren: false }))
            };
        }));

        const treeData = [
            {
                title: i18n.t('tabs.application'),
                items: [
                    { name: i18n.t('application.dashboard'), icon: SVGs.dashboard, id: "storage-dashboard", hasChildren: false },
                    { name: i18n.t('application.manifest'), icon: SVGs.manifest, id: "manifest", hasChildren: false },
                    { name: i18n.t('application.service_workers'), icon: SVGs.file, id: "service-workers", hasChildren: false },
                ]
            },
            {
                title: i18n.t('application.storage_title'),
                items: [
                    { name: i18n.t('application.local_storage'), icon: SVGs.storage, id: "local-storage", hasChildren: true, children: [{ name: origin, id: "ls-origin", value: origin, icon: SVGs.file }] },
                    { name: i18n.t('application.session_storage'), icon: SVGs.storage, id: "session-storage", hasChildren: true, children: [{ name: origin, id: "ss-origin", value: origin, icon: SVGs.file }] },
                    { name: i18n.t('application.indexed_db'), icon: SVGs.database, id: "indexed-db", hasChildren: idbChildren.length > 0, children: idbChildren },
                    { name: i18n.t('application.cookies'), icon: SVGs.cookie, id: "cookies", hasChildren: true, children: [{ name: origin, id: "cookie-origin", value: origin, icon: SVGs.cookie }] }
                ]
            },
            {
                title: i18n.t('application.cache'),
                items: [
                    {
                        name: i18n.t('application.cache_storage'), icon: SVGs.storage, id: "cache-storage",
                        hasChildren: cacheList.length > 0,
                        children: cacheList.map(c => ({ name: c || window.location.origin, id: `cache-${c}`, value: c, icon: SVGs.file }))
                    }
                ]
            }
        ];

        sidebar.innerHTML = generateSidebarHTML(treeData);
        attachSidebarEvents();
    }

    function generateSidebarHTML(data) { let html = ''; data.forEach(s => { html += `<div class="app-sidebar-header">${s.title}</div>`; s.items.forEach(i => html += generateItemHTML(i, 0)); }); return html; }
    function generateItemHTML(item, level) { const hasChildren = item.hasChildren; const arrow = hasChildren ? SVGs.arrow : '<span style="width:15px;display:inline-block;"></span>'; const indent = level * 15; let html = `<div class="app-sidebar-item ${hasChildren ? 'parent' : ''}" style="padding-left:${12 + indent}px" data-id="${item.id}" data-value="${item.value || ''}" data-db="${item.dbName || ''}" data-store="${item.storeName || ''}">${arrow}<div class="icon">${item.icon}</div><span>${item.name}</span></div>`; if (hasChildren && item.children) { html += `<div class="app-sidebar-children-container" id="children-${item.id}" style="display:none;">`; item.children.forEach(child => { html += generateItemHTML(child, level + 1); }); html += `</div>`; } return html; }
    function attachSidebarEvents() { sidebar.addEventListener('click', (e) => { const item = e.target.closest('.app-sidebar-item'); if (!item) return; if (item.classList.contains('parent')) { if (e.target.closest('.arrow-icon') || e.detail === 2) { toggleItem(item); return; } if (!item.classList.contains('expanded')) toggleItem(item); } sidebar.querySelectorAll('.selected').forEach(el => el.classList.remove('selected')); item.classList.add('selected'); handleSelection(item.dataset.id, item.dataset.value, item.dataset.db, item.dataset.store); }); }
    function toggleItem(item) { item.classList.toggle('expanded'); const children = sidebar.querySelector(`#children-${item.dataset.id}`); const arrow = item.querySelector('.arrow-icon'); if (children) children.style.display = item.classList.contains('expanded') ? 'block' : 'none'; if (arrow) arrow.style.transform = item.classList.contains('expanded') ? 'rotate(90deg)' : 'rotate(0deg)'; }


    function handleSelection(id, value, dbName, storeName) {
        const i18n = window.MyDevTool.LanguageManager;
        if (id === 'storage-dashboard') { renderStorageDashboard(); }

        else if (id === 'ls-origin') { currentViewType = 'local-storage'; renderStorage(); }
        else if (id === 'ss-origin') { currentViewType = 'session-storage'; renderStorage(); }
        else if (id === 'cookie-origin') { currentViewType = 'cookies'; renderCookies(); }
        else if (storeName) { renderIndexedDBStore(dbName, storeName); }
        else if (id.startsWith('cache-')) { renderCacheStorage(value); }

        // Parents
        else if (['local-storage', 'session-storage', 'cookies'].includes(id)) { mainView.innerHTML = `<div class="app-empty-view">${i18n.t('application.empty_view')}</div>`; }
        else if (id === 'indexed-db') { renderSimpleList(i18n.t('application.indexed_db'), i18n.t('application.empty_idb'), () => window.MyDevTool.StorageManager.getIndexedDBDatabaseNames().then(list => list.map(d => d.name))); }
        else if (id === 'cache-storage') { renderSimpleList(i18n.t('application.cache_storage'), "No caches found.", () => window.MyDevTool.StorageManager.getCacheStorageList()); }
        else if (id.startsWith('idb-') && !storeName) { mainView.innerHTML = `<div class="app-empty-view">${i18n.t('application.empty_idb')}</div>`; }
        else if (id === 'service-workers') renderServiceWorkers();
        else if (id === 'manifest') renderManifest();
    }

    async function renderStorageDashboard() {
        const i18n = window.MyDevTool.LanguageManager;
        const StorageMgr = window.MyDevTool.StorageManager;
        const { usage, quota } = await StorageMgr.getStorageEstimate();

        // Convert to readable strings
        const usageMB = (usage / (1024 * 1024)).toFixed(1);
        const quotaMB = (quota / (1024 * 1024)).toFixed(0);
        const usagePercent = quota > 0 ? (usage / quota) * 100 : 0;

        const r = 40;
        const c = 2 * Math.PI * r;
        const offset = c - (usagePercent / 100) * c;

        mainView.innerHTML = `
        <div class="storage-dashboard-container">
            <div class="dashboard-header">
                <div class="dashboard-title">${i18n.t('application.storage_title')}</div>
                <div class="dashboard-url">${window.location.origin}/</div>
            </div>

            <div class="storage-section">
                <div class="section-title">${i18n.t('application.usage_title')}</div>
                <div class="usage-text">${i18n.t('application.usage_text', { used: usageMB, quota: quotaMB })}</div>
                
                <div class="usage-visuals">
                     <div class="donut-chart">
                        <svg width="120" height="120" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--dt-border-light)" stroke-width="15" />
                            <circle cx="50" cy="50" r="${r}" fill="none" stroke="#f4b400" stroke-width="15" 
                                    stroke-dasharray="${c}" stroke-dashoffset="${offset}" transform="rotate(-90 50 50)" />
                            <text x="50" y="55" text-anchor="middle" font-size="14" fill="var(--dt-text-primary)" font-weight="bold">${usageMB} MB</text>
                        </svg>
                    </div>
                    
                    <div class="usage-legend">
                        <div class="legend-item">
                            <span class="legend-color" style="background:#f4b400"></span>
                            <span>${i18n.t('application.total_usage')}</span>
                            <span class="legend-val">${usageMB} MB</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="storage-section">
                 <div class="clear-controls">
                    <button id="btn-clear-site-data" class="clear-btn">${i18n.t('application.clear_site_data')}</button>
                    <label class="checkbox-label" style="margin-left:10px; opacity:0.6; cursor:not-allowed;">
                        <input type="checkbox" disabled checked> ${i18n.t('application.inc_third_party')}
                    </label>
                 </div>

                 <div class="clear-options">
                    <div class="clear-category">${i18n.t('application.clear_options.app')}</div>
                    <label class="checkbox-label"><input type="checkbox" id="chk-sw" checked> ${i18n.t('application.clear_options.unregister_sw')}</label>

                    <div class="clear-category">${i18n.t('application.clear_options.storage')}</div>
                    <label class="checkbox-label"><input type="checkbox" id="chk-storage" checked> ${i18n.t('application.clear_options.ls_ss')}</label>
                    <label class="checkbox-label"><input type="checkbox" id="chk-idb" checked> ${i18n.t('application.clear_options.idb')}</label>
                    <label class="checkbox-label"><input type="checkbox" id="chk-websql" checked> ${i18n.t('application.clear_options.websql')}</label>
                    <label class="checkbox-label"><input type="checkbox" id="chk-cookies" checked> ${i18n.t('application.clear_options.cookies')}</label>

                    <div class="clear-category">${i18n.t('application.clear_options.cache')}</div>
                    <label class="checkbox-label"><input type="checkbox" id="chk-cache" checked> ${i18n.t('application.clear_options.cache_storage')}</label>
                 </div>
            </div>
        </div>
      `;

        // Attach Event
        const btnClear = mainView.querySelector('#btn-clear-site-data');
        btnClear.onclick = async () => {
            const options = {
                workers: mainView.querySelector('#chk-sw').checked,
                storage: mainView.querySelector('#chk-storage').checked,
                indexedDb: mainView.querySelector('#chk-idb').checked,
                cookies: mainView.querySelector('#chk-cookies').checked,
                cache: mainView.querySelector('#chk-cache').checked
            };

            btnClear.textContent = i18n.t('common.loading');
            await StorageMgr.clearSiteData(options);

            renderStorageDashboard();
            renderSidebar();
        };
    }

    function renderStorage() {
        const i18n = window.MyDevTool.LanguageManager;
        const StorageMgr = window.MyDevTool.StorageManager; const Grid = window.MyDevTool.ApplicationGrid; let data = currentViewType === 'local-storage' ? StorageMgr.getLocalStorage() : StorageMgr.getSessionStorage();
        Grid.render(mainView, data, {
            onRefresh: renderStorage,
            onClear: () => { if (confirm(i18n.t('application.clear_all_confirm'))) { currentViewType === 'local-storage' ? StorageMgr.clearLocalStorage() : StorageMgr.clearSessionStorage(); renderStorage(); } },
            onDelete: (key) => { currentViewType === 'local-storage' ? StorageMgr.removeLocalItem(key) : StorageMgr.removeSessionItem(key); renderStorage(); },
            onEdit: (o, n, v, r) => { if (currentViewType === 'local-storage') { if (r) StorageMgr.removeLocalItem(o); StorageMgr.setLocalItem(n, v); } else { if (r) StorageMgr.removeSessionItem(o); StorageMgr.setSessionItem(n, v); } },
            onAdd: (k, v) => { currentViewType === 'local-storage' ? StorageMgr.setLocalItem(k, v) : StorageMgr.setSessionItem(k, v); renderStorage(); }
        });
    }

    function renderCookies() {
        const i18n = window.MyDevTool.LanguageManager;
        const StorageMgr = window.MyDevTool.StorageManager; const Grid = window.MyDevTool.ApplicationGrid; const data = StorageMgr.getCookies().map(c => { const sizeBytes = new Blob([c.key + '=' + c.value]).size; return { key: c.key, value: c.value, domain: window.location.hostname, path: '/', expires: 'Session', size: sizeBytes, httpOnly: '', secure: '', sameSite: '', partitionKey: '', priority: 'Medium' }; });
        const cols = [
            { id: 'key', name: i18n.t('common.key'), width: 120 },
            { id: 'value', name: i18n.t('common.value'), width: 200 },
            { id: 'domain', name: i18n.t('common.domain'), width: 100 },
            { id: 'path', name: i18n.t('common.path'), width: 60 },
            { id: 'expires', name: i18n.t('common.expires'), width: 120 },
            { id: 'size', name: i18n.t('common.size'), width: 50 },
            { id: 'httpOnly', name: i18n.t('common.httpOnly'), width: 60 },
            { id: 'secure', name: i18n.t('common.secure'), width: 60 },
            { id: 'sameSite', name: i18n.t('common.sameSite'), width: 70 },
            { id: 'priority', name: i18n.t('common.priority'), width: 60 }
        ];
        Grid.render(mainView, data, {
            onRefresh: renderCookies,
            onClear: () => { if (confirm(i18n.t('application.clear_cookies_confirm'))) { StorageMgr.clearAllCookies(); renderCookies(); } },
            onDelete: (k) => { StorageMgr.removeCookie(k); renderCookies(); },
            onEdit: (o, n, v) => { StorageMgr.setCookie(n, v); if (o !== n) StorageMgr.removeCookie(o); },
            onAdd: () => { }
        }, cols);
    }

    async function renderIndexedDBStore(dbName, storeName) {
        const i18n = window.MyDevTool.LanguageManager;
        const StorageMgr = window.MyDevTool.StorageManager;
        const Grid = window.MyDevTool.ApplicationGrid;

        const data = await StorageMgr.getIndexedDBData(dbName, storeName);

        const formattedData = data.map(item => ({
            key: String(item.key),
            value: typeof item.value === 'object' ? JSON.stringify(item.value) : String(item.value)
        }));

        Grid.render(mainView, formattedData, {
            onRefresh: () => renderIndexedDBStore(dbName, storeName),
            onClear: async () => {
                if (confirm(i18n.t('application.clear_all_confirm'))) {
                    await StorageMgr.clearIndexedDBStore(dbName, storeName);
                    renderIndexedDBStore(dbName, storeName);
                }
            },
            onDelete: async (key) => {
                await StorageMgr.deleteIndexedDBItem(dbName, storeName, key);
                renderIndexedDBStore(dbName, storeName);
            },
            onEdit: () => { }, onAdd: () => { }
        });
    }

    async function renderCacheStorage(c) {
        const i18n = window.MyDevTool.LanguageManager;
        const M = window.MyDevTool.StorageManager; const G = window.MyDevTool.ApplicationGrid; const D = await M.getCacheContent(c); const S = D.map(r => { let n = r.key; if (!n) n = r.value; return { ...r, key: n }; });
        G.render(mainView, S, {
            onRefresh: () => renderCacheStorage(c),
            onClear: async () => { if (confirm(i18n.t('application.delete_cache_confirm'))) { await M.deleteCache(c); window.MyDevTool.ApplicationTab.init(container); } },
            onDelete: () => { }, onEdit: () => { }, onAdd: () => { }
        }, [{ id: 'key', name: i18n.t('common.key'), width: 150 }, { id: 'value', name: 'URL', width: 300 }]);
    }

    async function renderSimpleList(t, e, f) {
        mainView.innerHTML = `<div class="app-toolbar"><button class="app-toolbar-btn" id="refresh-list">${SVGs.refresh}</button></div><div class="sw-container"><h3>${t}</h3><div id="simple-list-content"></div></div>`;
        const contentDiv = mainView.querySelector('#simple-list-content');

        const update = async () => {
            const i = await f();
            contentDiv.innerHTML = i.length ? i.map(x => `<div class="info-card">${x}</div>`).join('') : `<div style="color:#888;">${e}</div>`;
        };
        update();
        mainView.querySelector('#refresh-list').onclick = update;
    }


    async function renderManifest() {
        const i18n = window.MyDevTool.LanguageManager;
        const m = await window.MyDevTool.StorageManager.getManifest();

        if (!m) {
            mainView.innerHTML = `
            <div class="app-empty-view">
                <div style="text-align:center">
                    <div style="font-size:14px; font-weight:bold; color:var(--dt-text-secondary); margin-bottom:5px;">${i18n.t('application.no_manifest')}</div>
                    <div style="font-size:12px; color:var(--dt-text-disabled);">${i18n.t('application.no_manifest_desc')}</div>
                </div>
            </div>`;
            return;
        }

        const colorBox = (c) => c ? `<span class="color-preview" style="background:${c}"></span> ${c}` : '-';

        mainView.innerHTML = `
        <div class="manifest-view-container">
            <div class="manifest-section">
                <div class="section-header">${i18n.t('application.identity')}</div>
                <div class="manifest-row"><span class="label">Name:</span> <span class="value">${m.name || '-'}</span></div>
                <div class="manifest-row"><span class="label">Short Name:</span> <span class="value">${m.short_name || '-'}</span></div>
                <div class="manifest-row"><span class="label">Description:</span> <span class="value">${m.description || '-'}</span></div>
                <div class="manifest-row"><span class="label">Start URL:</span> <span class="value clickable" title="${m.start_url}">${m.start_url || '-'}</span></div>
            </div>

            <div class="manifest-section">
                <div class="section-header">${i18n.t('application.presentation')}</div>
                <div class="manifest-row"><span class="label">Theme Color:</span> <span class="value">${colorBox(m.theme_color)}</span></div>
                <div class="manifest-row"><span class="label">Background Color:</span> <span class="value">${colorBox(m.background_color)}</span></div>
                <div class="manifest-row"><span class="label">Display:</span> <span class="value">${m.display || '-'}</span></div>
                <div class="manifest-row"><span class="label">Orientation:</span> <span class="value">${m.orientation || '-'}</span></div>
            </div>

            <div class="manifest-section">
                <div class="section-header">${i18n.t('application.icons')}</div>
                <div class="icons-grid">
                    ${(m.icons || []).map(icon => `
                        <div class="manifest-icon-card">
                            <img src="${icon.src}" alt="icon" onerror="this.style.display='none'">
                            <div class="icon-details">
                                <div class="icon-size">${icon.sizes || ''}</div>
                                <div class="icon-type">${icon.type || ''}</div>
                            </div>
                        </div>
                    `).join('')}
                    ${(!m.icons || m.icons.length === 0) ? `<div class="value">${i18n.t('application.no_icons')}</div>` : ''}
                </div>
            </div>
            
            <div class="manifest-section">
                 <details>
                    <summary style="cursor:pointer; color:var(--dt-text-accent); font-size:12px;">${i18n.t('application.view_raw')}</summary>
                    <pre style="background:var(--dt-bg-sidebar); color:var(--dt-text-primary); padding:10px; border-radius:4px; overflow:auto; margin-top:5px;">${JSON.stringify(m, null, 2)}</pre>
                 </details>
            </div>
        </div>
     `;
    }

    async function renderServiceWorkers() {
        const i18n = window.MyDevTool.LanguageManager;
        const list = await window.MyDevTool.StorageManager.getServiceWorkers();

        if (list.length === 0) {
            mainView.innerHTML = `<div class="app-empty-view">${i18n.t('application.no_sw')}</div>`;
            return;
        }

        const topBar = `
        <div class="sw-top-controls">
            <label class="checkbox-label"><input type="checkbox" id="sw-offline"> ${i18n.t('application.sw_offline')}</label>
            <label class="checkbox-label"><input type="checkbox" id="sw-update-reload"> ${i18n.t('application.sw_update_reload')}</label>
        </div>
     `;

        const workersHtml = list.map((sw) => {
            const isRunning = sw.state === 'activated';
            const statusColor = isRunning ? '#33b679' : '#ea4335';

            return `
        <div class="sw-registration-block">
            <div class="sw-reg-header">
                <div class="sw-scope-url">${sw.scope}</div>
                <div class="sw-header-actions">
                    <a href="#" onclick="window.MyDevTool.ApplicationTab.updateSW('${sw.scope}'); return false;">${i18n.t('application.update')}</a>
                    <a href="#" onclick="window.MyDevTool.ApplicationTab.unregisterSW('${sw.scope}'); return false;">${i18n.t('application.unregister')}</a>
                </div>
            </div>

            <div class="sw-info-grid">
                <div class="sw-grid-label">Source</div>
                <div class="sw-grid-value">
                    <span class="clickable" title="${sw.scriptURL}">${sw.scriptURL.split('/').pop()}</span>
                    <div class="sw-timestamp">Received ${new Date().toLocaleTimeString()} (approx)</div>
                </div>

                <div class="sw-grid-label">${i18n.t('application.sw_status')}</div>
                <div class="sw-grid-value sw-status-row">
                    <span class="status-dot" style="background-color: ${statusColor}"></span>
                    <span class="sw-status-text">
                        #1 ${sw.state} and is ${isRunning ? i18n.t('application.sw_running') : i18n.t('application.sw_stopped')}
                    </span>
                </div>

                <div class="sw-grid-label">${i18n.t('application.sw_clients')}</div>
                <div class="sw-grid-value">
                    <a href="#" class="sw-link">${i18n.t('application.sw_view_clients')}</a>
                </div>
            </div>
        </div>
        <hr class="sw-separator">
        `;
        }).join('');

        mainView.innerHTML = `
        <div class="sw-view-container">
            ${topBar}
            ${workersHtml}
        </div>
     `;

        const offlineCheck = mainView.querySelector('#sw-offline');
        if (offlineCheck) {
            offlineCheck.onchange = (e) => {
                // console.log('[DevTool] Offline simulated:', e.target.checked);
            };
        }
    }

    // Helper functions for SW actions
    function updateSW(scope) {
        alert(`Update requested for: ${scope}`);
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration(scope).then(reg => {
                if (reg) reg.update();
            });
        }
    }

    async function unregisterSW(scope) {
        const i18n = window.MyDevTool.LanguageManager;
        if (confirm(i18n ? i18n.t('application.unregister_sw_confirm') : 'Unregister?')) {
            if ('serviceWorker' in navigator) {
                const reg = await navigator.serviceWorker.getRegistration(scope);
                if (reg) {
                    await reg.unregister();
                    renderServiceWorkers();
                }
            }
        }
    }

    function attachSplitter() { 
      const s = container.querySelector('#app-splitter'); 
      const b = container.querySelector('#app-sidebar'); 
      const w = container.querySelector('.application-wrapper'); 
      let d = false, x, sw; const dn = (e) => { 
        d = true; 
        x = e.touches ? e.touches[0].clientX : e.clientX; 
        sw = b.getBoundingClientRect().width; 
        s.classList.add('is-dragging'); 
        document.body.style.cursor = 'col-resize'; 
        window.addEventListener('pointermove', mv); 
        window.addEventListener('pointerup', up); 
        window.addEventListener('touchmove', mv, { 
          passive: false }); 
          window.addEventListener('touchend', up); }; 
          const mv = (e) => { 
            if (!d) return; 
            const cx = e.touches ? e.touches[0].clientX : e.clientX; 
            let nw = sw + (cx - x); if (nw < 150) nw = 150; 
            if (nw > w.clientWidth - 200) nw = w.clientWidth - 200; b.style.width = nw + 'px'; 
          }; 
          const up = () => { d = false; 
          s.classList.remove('is-dragging'); 
          document.body.style.cursor = ''; 
          window.removeEventListener('pointermove', mv); 
          window.removeEventListener('pointerup', up); 
          window.removeEventListener('touchmove', mv); 
          window.removeEventListener('touchend', up); }; 
          s.addEventListener('pointerdown', dn); 
          s.addEventListener('touchstart', dn, { 
            passive: false 
          }); 
    }

    return { init, updateSW, unregisterSW };

})();