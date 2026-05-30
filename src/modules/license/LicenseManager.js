// src/modules/license/LicenseManager.js

import FingerprintJS from '@fingerprintjs/fingerprintjs';

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.LicenseManager = (function() {
    
    const API_URL = "https://license-server-khaki.vercel.app/api"; 
    
    const OFFLINE_LIMIT_HOURS = 48; 
    const REVALIDATE_MINUTES = 35;
    const REVALIDATE_MS = REVALIDATE_MINUTES * 60 * 1000;
    
    const ALLOWED_DEMO_DOMAINS = [
        'suger-playground.vercel.app',
        'suger-play.vercel.app',
        'https://suger-play.vercel.app'
    ];
    const DEMO_KEY_PREFIX = "DEMO-KEY-";

    let deviceId = null;
    let licenseKey = null;
    let heartbeatInterval = null;
    let isDemoMode = false;

    // --- HELPER: Storage Access ---
    function getStorage() {
        if (window.MyDevTool.SecureStorage) return window.MyDevTool.SecureStorage;
        return localStorage; 
    }

    // --- HELPER: Toast Message ---
    function showToast(msg) {
        if (window.toast) window.toast(msg, 4000);
        else console.log("Toast:", msg);
    }

    // --- HELPER: Device Fingerprint ---
    async function getFingerprint() {
        if (deviceId) return deviceId;
        try {
            const fpPromise = await FingerprintJS.load();
            const result = await fpPromise.get();
            deviceId = result.visitorId;
            return deviceId;
        } catch (e) {
            let fallback = localStorage.getItem('dt_device_id_fallback');
            if (!fallback) {
                fallback = 'fallback-' + Math.random().toString(36).slice(2);
                localStorage.setItem('dt_device_id_fallback', fallback);
            }
            return fallback;
        }
    }

    // --- HELPER: API Call ---
    async function callApi(action, key, email, fp) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: action,      
                    productKey: key,
                    email: email, 
                    deviceId: fp 
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return await response.json();
        } catch (e) {
            return { success: false, valid: false, isNetworkError: true };
        }
    }

    // INIT 
    async function init() {
        const storage = getStorage();
        let savedKey = storage.getItem('license_key');
        let lastOnline = storage.getItem('last_online');
        const fp = await getFingerprint();

        if (savedKey && savedKey.startsWith(DEMO_KEY_PREFIX)) {
            if (isAllowedDemoDomain()) {
                licenseKey = savedKey;
                isDemoMode = true;
                console.log(
                    "%c🎮 Running in Playground Demo Mode", 
                    "background: #3e3fd8; color: #ffffff; padding: 2px 10px; border-radius: 1px; font-weight: bold; font-size: 12px; font-style: italic;"
                );
                return true; 
            } else {
                clearLocalData();
                return false;
            }
        }

        // A. Auto-Recovery (IP Based)
        if (!savedKey && navigator.onLine) {
            const recoveryRes = await callApi('recover', null, null, fp);
            if (recoveryRes.success && recoveryRes.key) {
                const activateRes = await activate(recoveryRes.key, null);
                if (activateRes.success) {
                    savedKey = recoveryRes.key;
                    return true;
                }
            }
        }

        // B. Main Validation
        if (savedKey) {
            licenseKey = savedKey;

            const now = Date.now();
            if (lastOnline) {
                const timeDiff = now - parseInt(lastOnline);
                
                if (timeDiff < REVALIDATE_MS) {
                    startHeartbeat();
                    return true; 
                }
            }

            if (navigator.onLine) {
                const res = await callApi('heartbeat', savedKey, null, fp);
                
                if (res.valid) {
                    storage.setItem('last_online', Date.now());
                    startHeartbeat();
                    return true; 
                } 
                else if (!res.isNetworkError) {
                    console.warn("⛔ Server rejected. Logging out.");
                    clearLocalData();
                    return false; 
                }
            } 
            
            // Offline Logic
            if (lastOnline) {
                const msPassed = Date.now() - parseInt(lastOnline);
                if ((msPassed / (1000 * 60 * 60)) < OFFLINE_LIMIT_HOURS) {
                    startHeartbeat();
                    return true;
                }
            }
            
            clearLocalData();
            return false;
        }
        
        return false; 
    }

    // ACTIVATE (Login)
    async function activate(key, email) {
        if (!key) return { success: false, message: "Key is required" };

        const fp = await getFingerprint();
        
        if (!navigator.onLine) {
            return { success: false, message: "Internet required for activation." };
        }

        const result = await callApi('activate', key, email, fp);

        if (result.success) {
            licenseKey = key;
            getStorage().setItem('license_key', key);
            getStorage().setItem('last_online', Date.now());
            startHeartbeat();
            return { success: true };
        } else {
            return { success: false, message: result.message || "Activation Failed" };
        }
    }

    // ACTIVATE DEMO (Playground Feature)
    function activateDemo(key) {
        if (!isAllowedDemoDomain()) {
            console.error("❌ Demo Key is NOT allowed on this domain.");
            return { success: false, message: "Unauthorized Domain for Demo" };
        }

        licenseKey = key;
        isDemoMode = true;
        getStorage().setItem('license_key', key);
        console.log(
            "%c Demo Mode Activated", 
            "background: #10b981; color: #ffffff; padding: 6px 10px; border-radius: 4px; font-weight: bold;"
        );
        return { success: true };
    }

    function isAllowedDemoDomain() {
        const currentDomain = window.location.hostname;
        return ALLOWED_DEMO_DOMAINS.some(d => currentDomain.includes(d));
    }

    // DEACTIVATE (Logout)
    async function deactivate() {
        if (!licenseKey) return { success: false };
        const fp = await getFingerprint();
        
        if (navigator.onLine && !isDemoMode) {
            await callApi('deactivate', licenseKey, null, fp);
        }
        
        clearLocalData();
        window.location.reload();
        return true;
    }

    // HEARTBEAT (Background Check)
    function startHeartbeat() {
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        if (isDemoMode) return; 

        heartbeatInterval = setInterval(async () => {
            if (!licenseKey) return;

            const storage = getStorage();
            const lastOnline = storage.getItem('last_online');
            
            if (lastOnline) {
                const timeDiff = Date.now() - parseInt(lastOnline);
                if (timeDiff < REVALIDATE_MS) {
                    return;
                }
            }

            if (navigator.onLine) {
                const fp = deviceId || await getFingerprint();
                const result = await callApi('heartbeat', licenseKey, null, fp);
                
                if (result.valid === true) {
                    storage.setItem('last_online', Date.now());
                } else if (result.valid === false && !result.isNetworkError) {
                    lockApp();
                }
            } else {
                if (lastOnline) {
                    const timeDiff = Date.now() - parseInt(lastOnline);
                    if (timeDiff > (OFFLINE_LIMIT_HOURS * 60 * 60 * 1000)) {
                        lockApp();
                    }
                }
            }
        }, 5 * 60 * 1000); // loop in 5min
    }

    // --- UTILS ---
    function clearLocalData() {
        const storage = getStorage();
        storage.removeItem('license_key');
        storage.removeItem('last_online');
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        licenseKey = null;
        isDemoMode = false;
    }

    function lockApp() {
        clearLocalData();
        if(window.MyDevTool && window.MyDevTool.ActivationUI) {
            window.MyDevTool.ActivationUI.show(() => {
                window.location.reload();
            });
        } else {
            document.body.innerHTML = `<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:#000;color:#f00;display:flex;justify-content:center;align-items:center;z-index:99999"><h1>Session Expired</h1></div>`;
            setTimeout(() => window.location.reload(), 2000);
        }
    }

    // EXPORT
    return {
        init,
        activate,
        activateDemo,
        deactivate,
        getFingerprint
    };

})();