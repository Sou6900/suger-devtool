// src/modules/network/NetworkInterceptor.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.NetworkInterceptor = (function () {

  let ConsoleLog = null; 
  let listeners = {
    onRequestStarted: [],
    onRequestFinished: []
  };

  let isCacheDisabled = false;
  let xhrBreakpoints = []; 

  const originalFetch = window.fetch;
  const originalXHROpen = window.XMLHttpRequest.prototype.open;
  const originalXHRSend = window.XMLHttpRequest.prototype.send;
  const originalXHRSetRequestHeader = window.XMLHttpRequest.prototype.setRequestHeader;

  function init(consoleLogModule) {
    ConsoleLog = consoleLogModule;
    loadXHRBreakpoints(); 
    processEarlyRequests();
    patchFetch();
    patchXHR();
  }

  function checkIsThirdParty(url) {
      try {
        if (!url) return false;
        if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('file:')) return false;
        
        if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) return false;
        
        if (!url.startsWith('http')) return false; 

        const requestHostname = new URL(url).hostname;
        const currentHostname = window.location.hostname;

        if (!currentHostname) return true;

        return requestHostname !== currentHostname;
      } catch (e) {
        return false;
      }
  }

  function processEarlyRequests() {
      if (!window.__dt_early_network || window.__dt_early_network.length === 0) return;
      
      window.__dt_early_network.forEach(item => {
          if (item.stage === 'start') {
              notify('onRequestStarted', {
                  id: item.id,
                  url: item.url,
                  method: item.method,
                  type: item.type,
                  status: 'pending',
                  startTime: item.startTime,
                  requestHeaders: item.requestHeaders || getSafeRealHeaders(),
                  requestBody: null,
                  isThirdParty: checkIsThirdParty(item.url) 
              });
          } 
          else if (item.stage === 'end') {
              const contentType = item.responseHeaders ? item.responseHeaders['content-type'] : '';
              notify('onRequestFinished', {
                  id: item.id,
                  status: item.status,
                  statusText: item.statusText,
                  endTime: item.endTime,
                  size: item.size || 0,
                  responseHeaders: item.responseHeaders || {},
                  responseType: item.responseType || '',
                  responseUrl: item.url, 
                  resourceType: getResourceType(null, contentType) || 'other', 
                  isThirdParty: false 
              });
          }
          else if (item.stage === 'error') {
               notify('onRequestFinished', {
                  id: item.id,
                  status: 'failed',
                  statusText: 'Failed',
                  endTime: item.endTime,
                  error: item.error,
                  resourceType: 'other',
                  isThirdParty: false
              });
          }
      });
      window.__dt_early_network = [];
  }

  function loadXHRBreakpoints() {
    try {
      const saved = localStorage.getItem('devtool-xhr-breakpoints');
      if (saved) xhrBreakpoints = JSON.parse(saved);
    } catch (e) { xhrBreakpoints = []; }
  }

  function saveXHRBreakpoints() {
    localStorage.setItem('devtool-xhr-breakpoints', JSON.stringify(xhrBreakpoints));
  }

  function addXHRBreakpoint(urlPattern) {
    if (!xhrBreakpoints.find(bp => bp.pattern === urlPattern)) {
      xhrBreakpoints.push({ pattern: urlPattern, enabled: true });
      saveXHRBreakpoints();
    }
  }

  function removeXHRBreakpoint(urlPattern) {
    xhrBreakpoints = xhrBreakpoints.filter(bp => bp.pattern !== urlPattern);
    saveXHRBreakpoints();
  }

  function toggleXHRBreakpoint(urlPattern, enabled) {
    const bp = xhrBreakpoints.find(bp => bp.pattern === urlPattern);
    if (bp) {
      bp.enabled = enabled;
      saveXHRBreakpoints();
    }
  }

  function getXHRBreakpoints() { return xhrBreakpoints; }

  function shouldPauseOnNetwork(url) {
    return xhrBreakpoints.some(bp => bp.enabled && url.includes(bp.pattern));
  }

  function setDisableCache(disable) { isCacheDisabled = disable; }

  function appendCacheBuster(url) {
    if (!isCacheDisabled) return url;
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;
    if (url.includes('_no_cache=')) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_no_cache=${Date.now()}`;
  }

  function subscribe(eventName, callback) {
    if (listeners[eventName]) listeners[eventName].push(callback);
  }

  function notify(eventName, data) {
    listeners[eventName].forEach(callback => callback(data));
  }
  
  function getResourceType(url, contentType) {
    if (contentType) {
      if (contentType.startsWith('text/css')) return 'css';
      if (contentType.startsWith('application/javascript') || contentType.startsWith('text/javascript')) return 'js';
      if (contentType.startsWith('image/')) return 'img';
      if (contentType.startsWith('font/')) return 'font';
      if (contentType.startsWith('text/html')) return 'doc';
      if (contentType.startsWith('application/json')) return 'xhr'; 
    }
    if(url) {
        const ext = url.split('?')[0].split('.').pop();
        if (!ext) return 'other';
        switch (ext.toLowerCase()) {
        case 'js': return 'js';
        case 'css': return 'css';
        case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg': case 'webp': case 'ico': return 'img';
        case 'woff': case 'woff2': case 'ttf': case 'eot': return 'font';
        case 'html': case 'htm': return 'doc';
        default: return 'other';
        }
    }
    return 'other';
  }

  function parseResponseHeaders(headerStr) {
    const headers = {};
    if (!headerStr) return headers;
    const headerPairs = headerStr.trim().split(/[\r\n]+/);
    headerPairs.forEach(line => {
      const parts = line.split(': ');
      const key = parts.shift();
      const value = parts.join(': ');
      if (key) headers[key.toLowerCase()] = value;
    });
    return headers;
  }

  function getSafeRealHeaders() {
      const headers = {};
      if (navigator.userAgent) headers['user-agent'] = navigator.userAgent;
      if (document.cookie) headers['cookie'] = document.cookie;
      try {
        headers['referer'] = window.location.href;
        headers['origin'] = window.location.origin;
      } catch(e) {}
      return headers;
  }

  function patchFetch() {
    window.fetch = async function (...args) {
      const i18n = window.MyDevTool.LanguageManager;
      let input = args[0];
      let init = args[1] || {};
      let originalUrl = (input instanceof Request) ? input.url : input;
      const finalUrl = appendCacheBuster(originalUrl.toString());

      const SourceDebugger = window.MyDevTool.SourceDebugger;
      if (SourceDebugger && shouldPauseOnNetwork(originalUrl.toString())) {
         try { await SourceDebugger.pause(originalUrl.toString(), 0, new Error().stack); } catch (e) {}
      }

      const id = `fetch-${Math.random().toString(36).slice(2, 9)}`;
      const startTime = performance.now();
      
      let requestForLog = new Request(originalUrl, init); 
      let requestBody = null;
      if (['POST', 'PUT', 'PATCH'].includes(requestForLog.method)) {
          try {
              const requestClone = requestForLog.clone();
              requestBody = await requestClone.text(); 
          } catch (e) { requestBody = "[Could not read body]"; }
      }

      const explicitHeaders = Object.fromEntries(requestForLog.headers);
      const realHeaders = getSafeRealHeaders();
      const finalRequestHeaders = { ...realHeaders, ...explicitHeaders };

      notify('onRequestStarted', {
        id: id,
        url: originalUrl,
        method: requestForLog.method,
        type: 'fetch',
        status: 'pending',
        startTime: startTime,
        requestHeaders: finalRequestHeaders,
        requestBody: requestBody,
        isThirdParty: checkIsThirdParty(originalUrl) 
      });

      try {
        const response = await originalFetch(finalUrl, init);
        const endTime = performance.now();
        const detailsClone = response.clone();
        
        let size = 0;
        try { const blob = await response.clone().blob(); size = blob.size; } catch (e) {}
        
        const contentType = response.headers.get('content-type');

        notify('onRequestFinished', {
          id: id,
          status: response.status,
          statusText: response.statusText,
          endTime: endTime,
          size: size,
          responseHeaders: Object.fromEntries(response.headers),
          responseType: response.type,
          responseUrl: response.url,
          resourceType: getResourceType(originalUrl, contentType),
          clonedResponse: detailsClone,
          isThirdParty: checkIsThirdParty(originalUrl)
        });
        return response;

      } catch (error) {
        notify('onRequestFinished', {
          id: id,
          status: 'failed',
          statusText: error.message,
          endTime: performance.now(),
          error: error.message,
          resourceType: getResourceType(originalUrl, null),
          isThirdParty: checkIsThirdParty(originalUrl)
        });
        throw error;
      }
    };
  }

  function patchXHR() {
    window.XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      const finalUrl = appendCacheBuster(url);
      this._devtool_xhr_data = {
        id: `xhr-${Math.random().toString(36).slice(2, 9)}`,
        method: method,
        url: url,
        requestHeaders: getSafeRealHeaders() 
      };
      return originalXHROpen.apply(this, [method, finalUrl, ...rest]);
    };

    window.XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
        if (this._devtool_xhr_data) {
            this._devtool_xhr_data.requestHeaders[header.toLowerCase()] = value;
        }
        return originalXHRSetRequestHeader.apply(this, arguments);
    };

    window.XMLHttpRequest.prototype.send = function (body) {
      const data = this._devtool_xhr_data;
      const SourceDebugger = window.MyDevTool.SourceDebugger;

      if (SourceDebugger && shouldPauseOnNetwork(data.url)) {
         try { SourceDebugger.pause(data.url, 0, new Error().stack); } catch (e) {}
      }
      
      data.startTime = performance.now();
      data.requestBody = body; 

      notify('onRequestStarted', {
        id: data.id,
        url: data.url,
        method: data.method,
        type: 'xhr',
        status: 'pending',
        startTime: data.startTime,
        requestHeaders: data.requestHeaders,
        requestBody: data.requestBody,
        isThirdParty: checkIsThirdParty(data.url) 
      });

      const onReadyStateChange = (e) => {
        if (this.readyState === 4) { 
          const endTime = performance.now();
          let size = 0;
          try {
            if (!this.responseType || this.responseType === 'text') size = this.responseText ? this.responseText.length : 0;
            else if (this.response) size = this.response.byteLength || this.response.size || 0;
          } catch(e) {}
          
          const contentType = this.getResponseHeader('content-type');
          const responseHeaders = parseResponseHeaders(this.getAllResponseHeaders());

          let safeResponseText = null;
          if (!this.responseType || this.responseType === 'text') {
              try { safeResponseText = this.responseText; } catch (e) {}
          } else {
              safeResponseText = `[Binary Data: ${this.responseType}]`;
          }

          notify('onRequestFinished', {
            id: data.id,
            status: this.status,
            statusText: this.statusText,
            endTime: endTime,
            size: size,
            responseType: this.responseType,
            resourceType: getResourceType(data.url, contentType),
            responseText: safeResponseText, 
            responseHeaders: responseHeaders,
            isThirdParty: checkIsThirdParty(data.url)
          });
        }
      };
      
      const onError = (e) => {
        notify('onRequestFinished', {
          id: data.id,
          status: 'failed',
          statusText: 'XHR Error',
          endTime: performance.now(),
          error: 'Request Failed',
          resourceType: getResourceType(data.url, null),
          isThirdParty: checkIsThirdParty(data.url)
        });
      };

      this.addEventListener('readystatechange', onReadyStateChange);
      this.addEventListener('error', onError);
      this.addEventListener('timeout', onError);
      
      return originalXHRSend.apply(this, arguments);
    };
  }
  
  return {
    init,
    subscribe,
    setDisableCache,
    addXHRBreakpoint,
    removeXHRBreakpoint,
    toggleXHRBreakpoint,
    getXHRBreakpoints
  };

})();