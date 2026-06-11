// main.js
import pkg from "./package.json";
// ─── Verification Gate ────────────────────────────────────────────────────────
// Set to `true` to require license activation before the devtool opens.
// Set to `false` to skip all checks and open immediately (no popup, no toast).
const REQUIRE_VERIFICATION = false;
// Version
window.SUGER_DEVTOOL_VERSION = `v${pkg.version}`;

// ─────────────────────────────────────────────────────────────────────────────

// EARLY CAPTURE SYSTEM (Must be at the very top)
(function() {
    // Storage Reader for Early Capture
    function getEarlySecureItem(key) {
        if (window.MyDevTool && window.MyDevTool.SecureStorage) {
            return window.MyDevTool.SecureStorage.getItem(key);
        }
        try {
            const raw = localStorage.getItem('_sdt_session_v1');
            if (!raw) return null;
            const SECRET = "suger_devtool_secret_salt";
            const textToChars = text => text.split('').map(c => c.charCodeAt(0));
            const applySaltToChar = code => textToChars(SECRET).reduce((a, b) => a ^ b, code);
            
            const decryptedStr = raw.match(/.{1,2}/g)
                .map(hex => parseInt(hex, 16))
                .map(applySaltToChar)
                .map(charCode => String.fromCharCode(charCode))
                .join('');
                
            const data = JSON.parse(decryptedStr);
            return data[key] !== undefined ? String(data[key]) : null;
        } catch(e) {
            return null;
        }
    }

    const isReactExpEnabled = getEarlySecureItem('dt_exp_react_dev') === 'true';

    // React DevTools Global Hook Injection
    if (isReactExpEnabled && !window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
            supportsFiber: true,
            renderers: new Map(),
            inject: function(renderer) {
                this.renderers.set(this.renderers.size + 1, renderer);
                window.__suger_react_renderer = renderer; 
                console.log("[Suger] React Renderer Attached!");
            },
            onCommitFiberRoot: function(rendererID, root, priorityLevel) {
                window.__suger_react_root = root;
                if (window.MyDevTool && window.MyDevTool.ReactComponents) {
                    window.MyDevTool.ReactComponents.refresh();
                }
            },
            onCommitFiberUnmount: function() {},
            onPostCommitFiberRoot: function() {},
            checkDCE: function() {} // React checks this to see if it's production
        };
    }
    
    // 1. Console & Error Capture (EARLY)
    if (window.__dt_early_logs) return;
    window.__dt_early_logs = [];

    // Save true original console methods so we can:
    //  (a) forward logs during early capture
    //  (b) suppress real-console output during log replay (no noise)
    const _earlyConsole = {
        log:   console.log,
        warn:  console.warn,
        error: console.error,
        info:  console.info,
        table: console.table,
    };
    // Expose originals globally so DevTool can silence them during replay
    window.__dt_orig_console = _earlyConsole;

    const captureLog = (type, args) => {
        // Skip re-capturing during controlled replay — DevTool sets this flag
        if (window.__dt_replaying_early) return;
        let stack = '';
        try { throw new Error(); } catch(e) { stack = e.stack; }
        window.__dt_early_logs.push({ type, args, stack, ts: Date.now() });
    };

    ['log', 'warn', 'error', 'info', 'table'].forEach(method => {
        console[method] = function(...args) {
            captureLog(method, args);
            _earlyConsole[method].apply(console, args);
        };
    });

    // Catch early native errors (Syntax, Reference, Runtime)
    window.addEventListener('error', function(event) {
        if (window.__dt_replaying_early) return;
        const errObj = event.error || event.message;
        const stack = event.error ? event.error.stack : '';
        window.__dt_early_logs.push({ type: 'error', args: [errObj], stack: stack, ts: Date.now() });
    });

    // Catch early unhandled promises
    window.addEventListener('unhandledrejection', function(event) {
        if (window.__dt_replaying_early) return;
        window.__dt_early_logs.push({ type: 'error', args: ['Unhandled promise rejection:', event.reason], stack: event.reason && event.reason.stack ? event.reason.stack : '', ts: Date.now() });
    });

    // 2. Early Network Capture
    window.__dt_early_network = [];
    
    // --> Patch Fetch
    const _origFetch = window.fetch;
    window.fetch = async function(...args) {
        const id = 'early-fetch-' + Math.random().toString(36).slice(2);
        const startTime = performance.now();
        const url = (args[0] instanceof Request) ? args[0].url : args[0];
        const method = (args[0] instanceof Request) ? args[0].method : (args[1]?.method || 'GET');
        
        window.__dt_early_network.push({
            id, type: 'fetch', stage: 'start', url, method, startTime, 
            args: args 
        });

        try {
            const response = await _origFetch.apply(this, args);
            
            const endTime = performance.now();
            const clone = response.clone();
            const headers = {};
            clone.headers.forEach((v, k) => headers[k] = v);

            window.__dt_early_network.push({
                id, type: 'fetch', stage: 'end', status: response.status, 
                statusText: response.statusText, endTime, 
                responseHeaders: headers,
                responseType: response.type
            });
            return response;
        } catch(err) {
            window.__dt_early_network.push({
                id, type: 'fetch', stage: 'error', error: err.message, endTime: performance.now()
            });
            throw err;
        }
    };

    // --> Patch XHR
    const _origOpen = XMLHttpRequest.prototype.open;
    const _origSend = XMLHttpRequest.prototype.send;
    const _origSetHeader = XMLHttpRequest.prototype.setRequestHeader;

    XMLHttpRequest.prototype.open = function(method, url) {
        this._early_id = 'early-xhr-' + Math.random().toString(36).slice(2);
        this._early_data = { method, url, startTime: performance.now(), reqHeaders: {} };
        
        window.__dt_early_network.push({
            id: this._early_id, type: 'xhr', stage: 'start', url, method, startTime: this._early_data.startTime
        });
        return _origOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.setRequestHeader = function(key, val) {
        if(this._early_data) this._early_data.reqHeaders[key] = val;
        return _origSetHeader.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function() {
        if(this._early_id) {
             const item = window.__dt_early_network.find(i => i.id === this._early_id && i.stage === 'start');
             if(item && this._early_data) item.requestHeaders = this._early_data.reqHeaders;
        }

        this.addEventListener('load', () => {
            if(!this._early_id) return;
            const headers = {};
            try {
                const headerStr = this.getAllResponseHeaders();
                headerStr.trim().split(/[\r\n]+/).forEach(line => {
                    const parts = line.split(': ');
                    const k = parts.shift();
                    const v = parts.join(': ');
                    if(k) headers[k.toLowerCase()] = v;
                });
            } catch(e){}

            window.__dt_early_network.push({
                id: this._early_id, type: 'xhr', stage: 'end', 
                status: this.status, statusText: this.statusText,
                endTime: performance.now(),
                responseHeaders: headers,
                responseType: this.responseType,
                size: (this.response ? (this.response.length || this.response.byteLength) : 0)
            });
        });

        this.addEventListener('error', () => {
             if(this._early_id) {
                window.__dt_early_network.push({
                    id: this._early_id, type: 'xhr', stage: 'error', error: 'XHR Failed', endTime: performance.now()
                });
             }
        });

        return _origSend.apply(this, arguments);
    };

})();


import "./src/modules/license/ActivationUI.js"; 
import "./src/modules/license/LicenseManager.js"; 
import logoImage from './src/assets/suger-dt.png';

import "acorn";
import "acorn-walk";
import * as acorn from 'acorn';
import * as acornWalk from 'acorn-walk';
window.acorn = acorn;
window.acorn.walk = acornWalk;

import "@babel/parser";
import "@babel/traverse";
import "@babel/generator";
import "@babel/types";

import JSONFormatter from 'json-formatter-js';
window.JSONFormatter = JSONFormatter;

import CodeMirror from 'codemirror';
window.CodeMirror = CodeMirror;
 
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/css/css.js';
import 'codemirror/mode/xml/xml.js';
import 'codemirror/keymap/sublime.js';

import * as CodeMirrorColorPicker from 'codemirror-colorpicker';
window.CodeMirrorColorPicker = CodeMirrorColorPicker;

import "./src/svg.js";
import "./src/modules/utils/SecureStorage.js";
import "./src/modules/i18n/LanguageManager.js"; 
import "./src/modules/data/CSSData.js";
import "./src/modules/data/colors.js";

import "./src/modules/reusable/ContextMenu.js";
import "./src/modules/reusable/SuggestionBox.js";
import "./src/modules/reusable/EditModal.js"; 
import "./src/modules/reusable/DropDownMenu.js";

import "./src/modules/settings/preferences/PrefElements.js" ;
import "./src/modules/settings/preferences/PrefStyles.js" ;
import "./src/modules/settings/preferences/PrefGeneral.js" ;
import "./src/modules/settings/preferences/PrefInspect.js" ;
import "./src/modules/settings/preferences/PrefSources.js";
import "./src/modules/settings/preferences/SettingsAbout.js";
import "./src/modules/settings/SettingsPreferences.js";
import "./src/modules/settings/SettingsExperiments.js";
   
import "./src/modules/settings/SettingsShortcuts.js";
import "./src/modules/settings/WhatsNew.js";
import "./src/modules/settings/SettingsTab.js";

import "./src/modules/styles/StyleData.js";
import "./src/modules/styles/UserAgentStyles.js";
import "./src/modules/styles/StyleEditorUtils.js";
import "./src/modules/styles/StylePasteHandler.js";
import "./src/modules/styles/StyleSuggestionEngine.js";
import "./src/modules/styles/StylePropertyEditor.js";
import "./src/modules/styles/StyleChangeTracker.js";
import "./src/modules/styles/StyleRuleRenderer.js";
import "./src/modules/styles/StylesTab.js";

import "./src/modules/computed/ComputedTab.js";

import "./src/modules/styles/LayoutTab.js";

import "./src/modules/device/DeviceMode.js";

import "./src/modules/console/ConsoleEngine.js"; 
import "./src/modules/console/ConsoleSnippets.js"; 
import "./src/modules/console/ConsoleLog.js";
import "./src/modules/console/ConsoleInput.js";
import "./src/modules/console/ConsoleNetwork.js";
import "./src/modules/console/ConsoleTab.js";

import "./src/modules/application/ApplicationGrid.js"; 
import "./src/modules/application/ApplicationTab.js"; 
import "./src/modules/application/StorageManager.js"; 

import "./src/modules/source/ServiceWorkerManager.js";
import "./src/modules/source/WatchManager.js";
import "./src/modules/source/SourceInstrumenter.js"; 
import "./src/modules/source/SourceDebugger.js"; 
import "./src/modules/source/SourceEditor.js"; 
import "./src/modules/source/SourceBreakpointManager.js";
import "./src/modules/source/EventListenerManager.js"; 
import "./src/modules/source/DOMBreakpointManager.js";
import "./src/modules/source/SourcePageTree.js"; 
import "./src/modules/source/SourceTab.js"; 
import "./src/modules/source/ScopeManager.js"; 

import "./src/modules/network/NetworkLog.js";
import "./src/modules/network/NetworkTiming.js";
import "./src/modules/network/NetworkOverview.js";
import "./src/modules/network/NetworkDetails.js";
import "./src/modules/network/NetworkInterceptor.js";
import "./src/modules/network/NetworkTab.js";

import "./src/modules/monitor/MonitorTab.js";

import "./src/modules/element/DomActions.js";
import "./src/modules/element/DomBadges.js"; 
import "./src/modules/element/DomTreeObserver.js"; 
import "./src/modules/element/DomTreeRenderer.js";
import "./src/modules/element/DomTree.js";

import "./src/modules/breadcrumb/BreadcrumbBar.js";

import "./src/modules/inspect/Inspector.js";

import "./src/modules/react/ReactComponents.js";
import "./src/modules/react/ReactEditor.js";
import "./src/modules/react/ReactInspector.js";
import "./src/modules/react/ReactHighlighter.js";
import "./src/modules/react/ReactSuggestionEngine.js";
import "./src/modules/react/ReactProfiler.js";

import "./src/modules/core/UIManager.js";
import "./src/modules/core/LayoutManager.js";
import "./src/modules/core/TabManager.js";

import "./DevTool.js";

// load
if (window.__suger_devtool_loaded) {
    if (window.MyDevTool && window.MyDevTool.DevTool) {
        window.MyDevTool.DevTool.show();
    }
} else {
    window.__suger_devtool_loaded = true;
}

if (window.MyDevTool.SourceBreakpointManager) window.MyDevTool.SourceBreakpointManager.init();
if (window.MyDevTool.SourceDebugger) window.MyDevTool.SourceDebugger.init();
if (window.MyDevTool.SourceDebugger && window.MyDevTool.SourceBreakpointManager) {
   window.MyDevTool.SourceDebugger.setBreakpointManager(window.MyDevTool.SourceBreakpointManager);
}
if (window.MyDevTool.ServiceWorkerManager) {
  try { window.MyDevTool.ServiceWorkerManager.init(); } catch (e) {
    console.warn("SW Init failed:", e); 
  }
}
if (window.MyDevTool.LanguageManager) window.MyDevTool.LanguageManager.init();

const ToastLoader = (function() {
    let loaderEl = null;
    let textEl = null;

    function create(initialText = "Initializing...") {
        if (document.getElementById('suger-toast-loader')) return;

        const SecureStorage = window.MyDevTool.SecureStorage;
        const savedTheme = SecureStorage ? SecureStorage.getItem('theme') : 'light';
        const isDark = savedTheme === 'dark';

        const bg = isDark ? '#202124' : '#ffffff';
        const text = isDark ? '#e8eaed' : '#333333';
        const border = isDark ? '#3c4043' : '#e0e0e0';
        const accent = isDark ? '#8ab4f8' : '#0078d4';
        const shadow = isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)';

        const style = document.createElement('style');
        style.innerHTML = `
            #suger-toast-loader {
                position: fixed;
                top: 20px;
                right: -350px;
                background: ${bg};
                color: ${text};
                border: 1px solid ${border};
                border-left: 4px solid ${accent};
                padding: 8px 12px;
                border-radius: 4px;
                box-shadow: 0 4px 15px ${shadow};
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 2147483647;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                font-size: 13px;
                font-weight: 500;
                transition: right 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                max-width: 300px;
                pointer-events: none;
            }
            .st-logo {
                width: 22px; 
                height: 22px;
                border-radius: 4px;
                animation: st-spin-logo 2s linear infinite;
                flex-shrink: 0;
                object-fit: contain;
            }
            @keyframes st-spin-logo { 
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); } 
            }
            #suger-toast-text {
                transition: opacity 0.2s ease;
                opacity: 1;
                white-space: nowrap;
            }
        `;
        document.head.appendChild(style);

        loaderEl = document.createElement('div');
        loaderEl.id = 'suger-toast-loader';
        loaderEl.innerHTML = `<img src="${logoImage}" class="st-logo" /><span id="suger-toast-text">${initialText}</span>`;
        document.body.appendChild(loaderEl);
        textEl = loaderEl.querySelector('#suger-toast-text');

        requestAnimationFrame(() => {
            loaderEl.style.right = '20px';
        });
    }

    function update(msg) {
        if (!textEl) return;
        textEl.style.opacity = '0';
        setTimeout(() => {
            textEl.textContent = msg;
            textEl.style.opacity = '1';
        }, 200);
    }

    function remove() {
        if (!loaderEl) return;
        loaderEl.style.right = '-350px';
        setTimeout(() => {
            if (loaderEl) loaderEl.remove();
            loaderEl = null;
        }, 400);
    }

    return { create, update, remove };
})();

// Listen for Auth Key (from Playground or Acode)
let acodeKeyPromise = new Promise(resolve => {
    const keyHandler = (event) => {
        if (event.data && event.data.type === 'SUGER_AUTH_KEY') {
            window.removeEventListener('message', keyHandler);
            resolve(event.data.key);
        }
    };
    window.addEventListener('message', keyHandler);
    
    // Wait slightly longer for playground to inject key
    setTimeout(() => resolve(null), 2500); 

    setTimeout(() => {
        window.postMessage({ type: 'SUGER_DEVTOOL_READY' }, '*');
    }, 100);
});

const init = async () => {
    // ── Bypass all verification checks when REQUIRE_VERIFICATION is false ──────
    if (!REQUIRE_VERIFICATION) {
        startDevTool();
        return;
    }
    // ─────────────────────────────────────────────────────────────────────────

    ToastLoader.create("Initializing Suger Engine..."); 
    
    const LicenseManager = window.MyDevTool.LicenseManager;

    try {
        const urlParams = new URLSearchParams(window.location.search);
        let urlKey = urlParams.get('key');
        
        if (!urlKey) {
            const scriptTags = document.querySelectorAll('script');
            for (let tag of scriptTags) {
                if (tag.src && tag.src.includes('key=')) {
                    try {
                        const scriptUrl = new URL(tag.src, window.location.origin);
                        urlKey = scriptUrl.searchParams.get('key');
                        if (urlKey) break;
                    } catch(e) {}
                }
            }
        }

        let keyFromAcode = urlKey || await acodeKeyPromise;
        
        ToastLoader.update("Checking status...");

        let isSessionValid = await LicenseManager.init();

        if (isSessionValid) {
            ToastLoader.update("System Ready!");
            if (window.location.search.includes('key=')) {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
            setTimeout(() => {
                ToastLoader.remove();
                startDevTool(); 
            }, 500);
            return;
        }

        if (keyFromAcode) {
            if (keyFromAcode.startsWith("DEMO-KEY-")) {
                const demoRes = LicenseManager.activateDemo(keyFromAcode);
                
                if (demoRes.success) {
                    if (window.location.search.includes('key=')) window.history.replaceState({}, document.title, window.location.pathname);
                    setTimeout(() => {
                        ToastLoader.remove();
                        startDevTool();
                    }, 500);
                    return;
                }
            }

            //"Checking License" - "Validating Access"
            ToastLoader.update("Validating access...");
            
            const res = await LicenseManager.activate(keyFromAcode, null); 
            
            if (res.success) {
                ToastLoader.update("Engine Ready!");
                if (window.location.search.includes('key=')) window.history.replaceState({}, document.title, window.location.pathname);
                setTimeout(() => {
                    ToastLoader.remove();
                    startDevTool(); 
                }, 500);
                return;
            } else {
                if (res.message && (res.message.includes("Email required") || res.message.includes("Email"))) {
                    ToastLoader.remove();
                    showActivationPopup(keyFromAcode); 
                    return;
                }
            }
        }

        ToastLoader.remove();
        showActivationPopup();

    } catch (e) {
        console.error("[Auth Debug] Catch Block Error:", e);
        ToastLoader.remove();
        showActivationPopup();
    }
};


function showActivationPopup(prefilledKey = null) {
    if (window.MyDevTool.ActivationUI) {
        window.MyDevTool.ActivationUI.show(() => {
            startDevTool();
        }, prefilledKey);
    }
}

function startDevTool() {
  if (window.MyDevTool.EventListenerManager) {
      window.MyDevTool.EventListenerManager.init();
  }
  if (window.MyDevTool && window.MyDevTool.DevTool) {
    window.MyDevTool.DevTool.init(); 
  }
}
