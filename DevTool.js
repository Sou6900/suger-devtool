// src/modules/DevTool.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.DevTool = (function() {
    
    let shadowRoot = null;
    let devToolHost = null;
    let colorPickerInterval = null;
    let pausePopup = null;
    let pauseOverlay = null;
    let SVGs = null;

    function init() {
        // Prevent recursive init within device mode iframe
        try { if (window.self !== window.top && window.frameElement && window.frameElement.id === 'dt-device-content') return; } catch(e) {}

        const UIManager = window.MyDevTool.UIManager;
        const LayoutManager = window.MyDevTool.LayoutManager;
        const TabManager = window.MyDevTool.TabManager;
        SVGs = window.MyDevTool.SVGs;

        // 1. Create Host & Render UI
        if (!document.getElementById('my-devtool-host')) {
            devToolHost = document.createElement('div');
            devToolHost.id = 'my-devtool-host';
            document.body.appendChild(devToolHost);
            shadowRoot = UIManager.render(devToolHost);
        } else {
            // HMR support
            devToolHost = document.getElementById('my-devtool-host');
            shadowRoot = devToolHost.shadowRoot;
        }

        // 2. Initialize Logic Modules
        TabManager.init(shadowRoot, LayoutManager);
        LayoutManager.init(shadowRoot, TabManager);

        // 3. Initialize ALL Features
        initModules();
        setupGlobalEvents();
        createPausePopup();
        setupDebugger(devToolHost);
        
        // 4. Initial Open State
        const SecureStorage = window.MyDevTool.SecureStorage;
        if(SecureStorage && SecureStorage.getItem('dt_panel_height')) {
            const container = shadowRoot.querySelector('.devtool-container');
            if(container) container.style.height = SecureStorage.getItem('dt_panel_height');
        }
        
        devToolHost.style.display = 'block';
    }

    function initModules() {
        const TabManager = window.MyDevTool.TabManager;
        
        // 1. Reusable
        if (window.MyDevTool.ContextMenu) window.MyDevTool.ContextMenu.init(shadowRoot);
        if (window.MyDevTool.BreadcrumbBar) window.MyDevTool.BreadcrumbBar.init(shadowRoot.querySelector('#breadcrumb-bar-container'), shadowRoot);
        
        // 2. Elements (Tree + Inspector)
        if (window.MyDevTool.DomTree) window.MyDevTool.DomTree.init(shadowRoot.querySelector('#elements-tree-container'), shadowRoot);
        if (window.MyDevTool.Inspector) window.MyDevTool.Inspector.init(shadowRoot, devToolHost, null);
        
        // 3. Console
        if (window.MyDevTool.ConsoleTab) window.MyDevTool.ConsoleTab.init(TabManager.getContainerFor('console'), shadowRoot);

        // 4. Source (Debugger)
        if (window.MyDevTool.SourceTab) {
            window.MyDevTool.SourceTab.init(shadowRoot.querySelector('#source-content'), shadowRoot, () => TabManager.switchTab('source'));
        }

        // 5. Network
        setupNetwork();

        // 6. Application
        if (window.MyDevTool.ApplicationTab) {
            window.MyDevTool.ApplicationTab.init(shadowRoot.querySelector('#application-content'));
        }
        
        // 7. Monitor       
        if (window.MyDevTool.MonitorTab) {
          const monitorContainer = shadowRoot.querySelector('#monitor-content'); 
          if(!monitorContainer) {
             const div = document.createElement('div');
             div.id = 'monitor-content';
             div.className = 'tab-content';
             shadowRoot.querySelector('.devtool-container').appendChild(div);
             window.MyDevTool.MonitorTab.init(div, shadowRoot);
          } else {
              window.MyDevTool.MonitorTab.init(monitorContainer, shadowRoot);
          }
      }

        // 7. Settings
        if (window.MyDevTool.SettingsTab) {
            window.MyDevTool.SettingsTab.init(shadowRoot.querySelector('#settings-content'), shadowRoot);
        }

        if (window.MyDevTool.DeviceMode) {
            window.MyDevTool.DeviceMode.init();
            const deviceBtn = shadowRoot.querySelector('#dt-device-mode-btn');
            
            if (deviceBtn) {
                deviceBtn.onclick = () => {
                    window.MyDevTool.DeviceMode.toggle();
                    deviceBtn.classList.toggle('active', window.MyDevTool.DeviceMode.isActive());
                };

                // Initial State
                if (window.MyDevTool.DeviceMode.isActive()) {
                    deviceBtn.classList.add('active');
                }
            }
        }
    }

    function setupNetwork() {
        const networkTabContainer = shadowRoot.querySelector('#network-content'); 
        const networkInterceptor = window.MyDevTool.NetworkInterceptor; 
        const networkLog = window.MyDevTool.NetworkLog; 
        const networkDetails = window.MyDevTool.NetworkDetails; 
        const networkTiming = window.MyDevTool.NetworkTiming; 
        const networkOverview = window.MyDevTool.NetworkOverview; 
        const networkTab = window.MyDevTool.NetworkTab;

        if (networkInterceptor && window.MyDevTool.ConsoleLog) { 
            networkInterceptor.init(window.MyDevTool.ConsoleLog); 
        } 
        if (networkLog && networkInterceptor) { 
            networkLog.init(networkInterceptor); 
        } 
        if (networkDetails) { 
            networkDetails.init(shadowRoot); 
        } 
        if (networkTiming && networkLog) { 
            networkTiming.init(networkLog); 
        } 
        if (networkTab && networkLog && networkDetails && networkTiming) { 
            networkTab.init(networkTabContainer, shadowRoot, networkLog, networkDetails, networkTiming, networkOverview); 
        }
    }

    function setupDebugger(host) {
        if (window.MyDevTool.SourceDebugger) { 
            const Debugger = window.MyDevTool.SourceDebugger; 
            Debugger.subscribe((state) => { 
                if (!pausePopup || !pauseOverlay || !host) return; 
                if (state.isPaused) { 
                    const devToolHeight = host.clientHeight; 
                    pauseOverlay.style.bottom = `${devToolHeight}px`; 
                    pausePopup.style.display = 'flex'; 
                    pauseOverlay.style.display = 'block'; 
                } else { 
                    pausePopup.style.display = 'none'; 
                    pauseOverlay.style.display = 'none'; 
                    pauseOverlay.style.bottom = '0px'; 
                } 
            }); 
            
            const currentState = Debugger.getState(); 
            if (currentState.isPaused) { 
                setTimeout(() => { 
                    if (pausePopup && pauseOverlay && host) { 
                        const devToolHeight = host.clientHeight; 
                        pauseOverlay.style.bottom = `${devToolHeight}px`; 
                        pausePopup.style.display = 'flex'; 
                        pauseOverlay.style.display = 'block'; 
                    } 
                }, 500); 
            } 
        }
    }

    function createPausePopup() {
         if (!document.getElementById('my-devtool-pause-overlay')) { 
             pauseOverlay = document.createElement('div'); 
             pauseOverlay.id = 'my-devtool-pause-overlay'; 
             document.body.appendChild(pauseOverlay); 
         } else { 
             pauseOverlay = document.getElementById('my-devtool-pause-overlay'); 
         }
         
         if (document.getElementById('my-devtool-pause-popup')) { 
             pausePopup = document.getElementById('my-devtool-pause-popup'); 
             return; 
         }

         const popupStyles = `#my-devtool-pause-overlay{ position: fixed; top: 0; left: 0; right: 0; bottom: 80vh; background: rgba(0, 0, 0, 0.3); z-index: -1; display: none; }#my-devtool-pause-popup {position: fixed;top: 0px;left:0px;right: 0px;background: rgb(255, 248, 225);border-bottom: 1px solid rgb(224, 224, 224);padding: 0px 10px;margin-top: 5px;z-index: 2147483647;display: none;align-items: center;font-family: Arial, sans-serif;align-self: center;font-size: 14px;color: rgb(51, 51, 51);justify-self: center;width: 250px;box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 5px;margin-left: auto;margin-right: auto;}#my-devtool-pause-popup span { margin-right: 2px; }#my-devtool-pause-popup button{background: none; border: none; cursor: pointer; padding: 4px; margin: 0 4px; opacity: 0.7; display: flex; }#my-devtool-pause-popup button:hover { opacity: 1; background: rgba(0,0,0,0.1); border-radius: 4px; } #my-devtool-pause-popup button svg { width: 20px; height: 20px; fill: #333; }`;
         
         const styleEl = document.createElement('style'); 
         styleEl.textContent = popupStyles; 
         document.head.appendChild(styleEl);
         
         pausePopup = document.createElement('div'); 
         pausePopup.id = 'my-devtool-pause-popup';
         const i18n = window.MyDevTool.LanguageManager;
         
         pausePopup.innerHTML = `<span>${i18n ? i18n.t('source.paused'): 'Paused in debugger'}</span><button id="devtool-popup-resume">${SVGs.resume}</button><button id="devtool-popup-step">${SVGs.stepOver}</button>`;
         document.body.appendChild(pausePopup);
         
         const debuggerModule = window.MyDevTool.SourceDebugger;
         if (debuggerModule) {
             pausePopup.querySelector('#devtool-popup-resume').addEventListener('click', () => debuggerModule.resume());
             pausePopup.querySelector('#devtool-popup-step').addEventListener('click', () => debuggerModule.stepOver());
         }
    }

    function setupGlobalEvents() {
        const LayoutManager = window.MyDevTool.LayoutManager;
        
        const collapseBtn = shadowRoot.querySelector('#collapse-btn');
        if(collapseBtn) {
            collapseBtn.onclick = (e) => { e.stopPropagation(); LayoutManager.toggleCollapse(!LayoutManager.getIsCollapsed()); };
        }
        
        const toggleBtn = document.createElement('span');
        toggleBtn.id = 'my-devtool-toggle';
        document.body.appendChild(toggleBtn);
        
        toggleBtn.onclick = () => {
             const container = shadowRoot.querySelector('.devtool-container');
             if(container.style.display === 'none') {
                 container.style.display = 'flex';
                 LayoutManager.toggleCollapse(false);
             } else {
                 container.style.display = 'none';
             }
        };
    }

    function startColorPickerWatcher() {
        if (colorPickerInterval) return;
        colorPickerInterval = setInterval(() => {
            const picker = document.querySelector('.codemirror-colorpicker') || document.querySelector('.cm-colorpicker');
            const container = shadowRoot ? shadowRoot.querySelector('.devtool-container'): null;
            if (!container) return;
            
            const isPickerVisible = picker && picker.style.display !== 'none' && picker.offsetParent !== null;
            if (isPickerVisible) { 
                container.style.setProperty('z-index', '0', 'important'); 
                if(window.MyDevTool.LayoutManager) window.MyDevTool.LayoutManager.setColorPicking(true);
            } else { 
                container.style.removeProperty('z-index'); 
                if(window.MyDevTool.LayoutManager) window.MyDevTool.LayoutManager.setColorPicking(false);
            }
        }, 1000);
    }
    
    function stopColorPickerWatcher() {
        if (colorPickerInterval) { clearInterval(colorPickerInterval); colorPickerInterval = null; }
        const container = shadowRoot ? shadowRoot.querySelector('.devtool-container'): null;
        if (container) container.style.removeProperty('z-index');
    }

    
    const DevToolAPI = {
        init,
        startColorPickerWatcher,
        stopColorPickerWatcher,
        show:(uncollapse = true) => {
            if (devToolHost) devToolHost.style.display = 'block';
            if(!uncollapse) return ;
            if (window.MyDevTool.LayoutManager && window.MyDevTool.LayoutManager.getIsCollapsed()) {
                window.MyDevTool.LayoutManager.toggleCollapse();
            }
        },
        hide: () => {
            if (devToolHost) devToolHost.style.display = 'none';
        },
        toggle: () => {
            if (devToolHost) devToolHost.style.display = 'block';
            if (window.MyDevTool.LayoutManager) window.MyDevTool.LayoutManager.toggleCollapse();
        },
        destroy: () => {
            if (devToolHost) {
                devToolHost.remove();
                devToolHost = null;
                shadowRoot = null;
            }
            stopColorPickerWatcher();
            delete window.suger;
            delete window.MyDevTool;
        },
        version: MyDevTool.SettingsTab.Version, 

        inspect: (element) => {
            if (element && element.nodeType === 1) {
                DevToolAPI.show(true); 
                if (window.MyDevTool.TabManager) window.MyDevTool.TabManager.switchTab('elements');
                if (window.MyDevTool.Elements && window.MyDevTool.Elements.selectElement) {
                    window.MyDevTool.Elements.selectElement(element);
                } else if (window.MyDevTool.DomTree && window.MyDevTool.DomTree.selectElement) {
                    window.MyDevTool.DomTree.selectElement(element);
                }
            } else {
                console.warn("[Suger] inspect() requires a valid DOM Element.");
            }
        },

        clear: () => {
            if (window.MyDevTool.ConsoleTab && typeof window.MyDevTool.ConsoleTab.clearConsole === 'function') {
                window.MyDevTool.ConsoleTab.clearConsole();
            } else if (window.MyDevTool.ConsoleLog && window.MyDevTool.ConsoleLog.clearLogs) {
                window.MyDevTool.ConsoleLog.clearLogs();
            }
            
            if (window.MyDevTool.NetworkLog && window.MyDevTool.NetworkLog.clearRequests) {
                window.MyDevTool.NetworkLog.clearRequests();
            }
            console.log("%c[Suger] Workspace cleared.", "color: #0078d4; font-weight: bold;");
        },

        setTheme: (themeName) => {
            const validThemes = ['light', 'dark', 'darkamoled'];
            if (validThemes.includes(themeName) && window.MyDevTool.SettingsTab && window.MyDevTool.SettingsTab.applyTheme) {
                window.MyDevTool.SettingsTab.applyTheme(themeName);
            } else {
                console.warn(`[Suger] Invalid theme. Use: ${validThemes.join(', ')}`);
            }
        },

        setLanguage: (langCode) => {
            if (window.MyDevTool.LanguageManager && window.MyDevTool.LanguageManager.setLanguage) {
                window.MyDevTool.LanguageManager.setLanguage(langCode);
            }
        },
        // Delegators
        switchTab: (id) => window.MyDevTool.TabManager.switchTab(id),
        getContainerFor: (id) => window.MyDevTool.TabManager.getContainerFor(id),
        setTabLocation: (id, loc) => window.MyDevTool.TabManager.setTabLocation(id, loc),
        setSubTabLayout: (l) => window.MyDevTool.LayoutManager.setSubTabLayout(l),
        getSubTabLayout: () => window.MyDevTool.LayoutManager.getSubTabLayout(),
        setCollapseMode: (m) => window.MyDevTool.LayoutManager.setCollapseMode(m),
        getTabLocation: (id) => window.MyDevTool.TabManager.getTabLocation(id)
    };

    window.suger = window.suger || DevToolAPI;
    
    Object.defineProperty(window.suger, 'modules', {
        value: window.MyDevTool,
        writable: false,
        enumerable: true,
        configurable: false
    });

    try {
        Object.defineProperty(window, 'MyDevTool', {
            enumerable: false,
            configurable: false
        });
    } catch (e) {}

    return DevToolAPI;
})();