// ConsoleNetwork.js

window.MyDevTool = window.MyDevTool || {};
window.MyDevTool.ConsoleNetwork = (function () {

  let logCallback = null; // ConsoleLog.addMessage
  let settingsCallback = null;

  let originalXHROpen = null;
  let originalFetch = null;

  function init(logCb, settingsCb) {
    logCallback = logCb;
    settingsCallback = settingsCb;
  }
  
  function getSettings() {
    return settingsCallback ? settingsCallback() : {};
  }

  function enableNetworkLogging() {
    if (originalXHROpen) return; 

    // patch XHR
    const XHR = window.XMLHttpRequest;
    originalXHROpen = XHR.prototype.open;
    XHR.prototype.open = function (method, url) {
      this._devtool_method = method;
      this._devtool_url = url;
      return originalXHROpen.apply(this, arguments);
    };
    const originalXHRSend = XHR.prototype.send;
    XHR.prototype.send = function (body) {
      const start = Date.now();
      const onloadend = () => {
        try {
          const status = this.status;
          const dur = Date.now() - start;
          const msg = `${this._devtool_method} ${this._devtool_url} → ${status} (${dur}ms)`;
          logCallback(msg, status >= 400 ? 'console-warn-line' : 'console-log-line', { network: true, status });
        } catch (e) { /* ignore */ }
      };
      this.addEventListener('loadend', onloadend);
      return originalXHRSend.apply(this, arguments);
    };

    // patch fetch
    if (window.fetch) {
      originalFetch = window.fetch;
      window.fetch = function () {
        const args = Array.from(arguments);
        const url = args[0];
        const start = Date.now();
        return originalFetch.apply(this, args).then(res => {
          const dur = Date.now() - start;
          const msg = `FETCH ${url} → ${res.status} (${dur}ms)`;
          logCallback(msg, res.status >= 400 ? 'console-warn-line' : 'console-log-line', { network: true, status: res.status });
          return res;
        }).catch(err => {
          logCallback(`FETCH ${url} failed: ${err && err.message}`, 'console-error-line', { network: true });
          throw err;
        });
      };
    }
  }

  function disableNetworkLogging() {
    if (!originalXHROpen) return;
    try {
      window.XMLHttpRequest.prototype.open = originalXHROpen;
    } catch (e) { /* ignore */ }
    if (originalFetch) {
      window.fetch = originalFetch;
      originalFetch = null;
    }
    originalXHROpen = null;
  }

  return {
    init,
    enableNetworkLogging,
    disableNetworkLogging
  };
})();