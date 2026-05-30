// src/modules/application/StorageManager.js

window.MyDevTool = window.MyDevTool || {};
window.MyDevTool.StorageManager = (function () {

  const HIDDEN_KEYS = ['_sdt_session_v1'];

  // Local Storage Logic
  function getLocalStorage() { 
    try { 
        const data = []; 
        for (let i = 0; i < localStorage.length; i++) { 
            const key = localStorage.key(i); 
            if (!HIDDEN_KEYS.includes(key)) {
                data.push({ key, value: localStorage.getItem(key) }); 
            }
        } 
        return data; 
    } catch (e) { return []; } 
  }

  function setLocalItem(key, value) { localStorage.setItem(key, value); }
  function removeLocalItem(key) { localStorage.removeItem(key); }

  function clearLocalStorage() { 
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
          if (!HIDDEN_KEYS.includes(key)) {
              localStorage.removeItem(key);
          }
      });
  }

  // Session Storage Logic 
  function getSessionStorage() { try { const data = []; for (let i = 0; i < sessionStorage.length; i++) { const key = sessionStorage.key(i); data.push({ key, value: sessionStorage.getItem(key) }); } return data; } catch (e) { return []; } }
  function setSessionItem(key, value) { sessionStorage.setItem(key, value); }
  function removeSessionItem(key) { sessionStorage.removeItem(key); }
  function clearSessionStorage() { sessionStorage.clear(); }

  // Cookies Logic
  function getCookies() { try { if (!document.cookie) return []; return document.cookie.split(';').map(c => { const parts = c.trim().split('='); return { key: parts[0], value: parts.slice(1).join('=') }; }); } catch (e) { return []; } }
  function setCookie(key, value) { document.cookie = `${key}=${value}; path=/`; }
  function removeCookie(key) { document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`; }
  function clearAllCookies() { const cookies = document.cookie.split(";"); for (let i = 0; i < cookies.length; i++) { const cookie = cookies[i]; const eqPos = cookie.indexOf("="); const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie; document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"; } }
  
  // Service Worker & Manifest
  async function getServiceWorkers() { if ('serviceWorker' in navigator) { const regs = await navigator.serviceWorker.getRegistrations(); return regs.map(reg => ({ scope: reg.scope, scriptURL: reg.active ? reg.active.scriptURL : (reg.installing ? reg.installing.scriptURL : 'Unknown'), state: reg.active ? reg.active.state : (reg.installing ? reg.installing.state : 'stopped') })); } return []; }
  async function getManifest() { const link = document.querySelector('link[rel="manifest"]'); if (link && link.href) { try { const res = await fetch(link.href); return await res.json(); } catch (e) { return null; } } return null; }

  //  IndexedDB Logic 
  async function getIndexedDBDatabaseNames() {
    if (!window.indexedDB || !window.indexedDB.databases) return [];
    try { return await window.indexedDB.databases(); } catch(e) { return []; }
  }

  function getIndexedDBObjectStores(dbName) {
    return new Promise((resolve) => {
      const request = window.indexedDB.open(dbName);
      request.onsuccess = (event) => {
        const db = event.target.result;
        const storeNames = Array.from(db.objectStoreNames);
        db.close();
        resolve(storeNames);
      };
      request.onerror = () => resolve([]);
    });
  }

  function getIndexedDBData(dbName, storeName) {
    return new Promise((resolve) => {
      const request = window.indexedDB.open(dbName);
      request.onsuccess = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(storeName)) { db.close(); return resolve([]); }
        const transaction = db.transaction([storeName], "readonly");
        const objectStore = transaction.objectStore(storeName);
        const getAllRequest = objectStore.getAll();
        const getAllKeysRequest = objectStore.getAllKeys();
        let data = [], keys = [];
        getAllKeysRequest.onsuccess = (e) => { keys = e.target.result; };
        getAllRequest.onsuccess = (e) => { data = e.target.result; };
        transaction.oncomplete = () => {
          const result = data.map((item, index) => ({ key: keys[index], value: item }));
          db.close();
          resolve(result);
        };
        transaction.onerror = () => resolve([]);
      };
      request.onerror = () => resolve([]);
    });
  }
  
  function clearIndexedDBStore(dbName, storeName) {
      return new Promise((resolve) => {
          const request = window.indexedDB.open(dbName);
          request.onsuccess = (event) => {
              const db = event.target.result;
              const transaction = db.transaction([storeName], "readwrite");
              transaction.objectStore(storeName).clear();
              transaction.oncomplete = () => { db.close(); resolve(); };
          };
      });
  }

  function deleteIndexedDBItem(dbName, storeName, key) {
    return new Promise((resolve) => {
      const request = window.indexedDB.open(dbName);
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction([storeName], "readwrite");
        let finalKey = key;
        if (!isNaN(key)) finalKey = Number(key);
        transaction.objectStore(storeName).delete(finalKey);
        transaction.oncomplete = () => { db.close(); resolve(true); };
        transaction.onerror = () => resolve(false);
      };
    });
  }

  //  Cache Storage Logic 
  async function getCacheStorageList() {
      if (!window.caches) return [];
      try { return await window.caches.keys(); } catch(e) { return []; }
  }
  
  async function getCacheContent(cacheName) {
      if (!window.caches) return [];
      try {
          const cache = await window.caches.open(cacheName);
          const requests = await cache.keys();
          return requests.map(req => ({ key: req.url.split('/').pop() || req.url, value: req.url, type: 'cached-response' }));
      } catch(e) { return []; }
  }
  
  async function deleteCache(cacheName) {
      if(window.caches) await window.caches.delete(cacheName);
  }
  
  //  Quota & Clear Site Data 
  async function getStorageEstimate() {
    if (navigator.storage && navigator.storage.estimate) {
      try { return await navigator.storage.estimate(); } catch (e) { return { usage: 0, quota: 0 }; }
    }
    return { usage: 0, quota: 0 };
  }

  async function clearSiteData(options) {
    const promises = [];

    if (options.workers && 'serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        regs.forEach(reg => promises.push(reg.unregister()));
    }

    if (options.storage) {
      promises.push(new Promise(resolve => {
          clearLocalStorage();
          resolve();
      }));
      promises.push(Promise.resolve(sessionStorage.clear()));
    }

    if (options.indexedDb) {
      const dbs = await getIndexedDBDatabaseNames();
      dbs.forEach(db => {
        const req = window.indexedDB.deleteDatabase(db.name);
        promises.push(new Promise(r => { req.onsuccess = r; req.onerror = r; }));
      });
    }

    if (options.cookies) clearAllCookies();

    if (options.cache && window.caches) {
        const keys = await window.caches.keys();
        keys.forEach(key => promises.push(window.caches.delete(key)));
    }
    
    await Promise.all(promises);
    return true;
  }

  return {
    getLocalStorage, setLocalItem, removeLocalItem, clearLocalStorage,
    getSessionStorage, setSessionItem, removeSessionItem, clearSessionStorage,
    getCookies, setCookie, removeCookie, clearAllCookies,
    getServiceWorkers, getManifest,
    getIndexedDBDatabaseNames, getIndexedDBObjectStores, getIndexedDBData, clearIndexedDBStore, deleteIndexedDBItem,
    getCacheStorageList, getCacheContent, deleteCache,
    getStorageEstimate, clearSiteData
  };

})();