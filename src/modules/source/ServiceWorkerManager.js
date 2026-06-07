// ServiceWorkerManager.js

window.MyDevTool = window.MyDevTool || {};
window.MyDevTool.ServiceWorkerManager = (function () {

  let isRegistered = false;
  let isEnabled = false;
  let registration = null;

  // Immediate listener setup for service worker messaging channel
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', handleMessage);
  }

  /**
   * Initializes the manager by registering the service worker and restoring 
   * the persistent instrumentation status from local storage.
   */
  function init() {
    register().then(() => {
      const storedState = localStorage.getItem('devtool-instrumentation-enabled');
      if (storedState === 'true') {
        // console.log('[SW Manager] Restoring Instrumentation State: ON');
        setEnabled(true, false);
      }
    });
  }

  /**
   * Registers the background interceptor service worker script.
   * @returns {Promise<boolean>} Resolves to true if registration succeeds, false otherwise.
   */
  async function register() {
    if (!('serviceWorker' in navigator)) return false;
    if (isRegistered) return true;
    try {
      registration = await navigator.serviceWorker.register('/devtool-sw.js', { scope: '/' });
      isRegistered = true;
      await navigator.serviceWorker.ready;
      return true;
    } catch (error) {
      // console.error('[SW Manager] Registration failed:', error);
      return false;
    }
  }

  /**
   * Toggles the activation state of the code code instrumentation processor.
   * Dispatches configuration parameters to active workers to handle dynamic intercepts.
   * @param {boolean} enabled - Targeted activation state.
   * @param {boolean} [saveToStorage=true] - Commits the configuration state to disk cache.
   */
  async function setEnabled(enabled, saveToStorage = true) {
    if (!isRegistered) await register();
    isEnabled = enabled;
    if (saveToStorage) localStorage.setItem('devtool-instrumentation-enabled', enabled);
    const controller = navigator.serviceWorker.controller;
    if (controller) {
      controller.postMessage({ type: 'SET_INSTRUMENTATION', enabled: enabled });
    } else {
      navigator.serviceWorker.ready.then((reg) => {
        if (reg.active) reg.active.postMessage({ type: 'SET_INSTRUMENTATION', enabled: enabled });
      });
    }
  }

  /**
   * Routes cross-process messages intercepting source transformations.
   * @param {MessageEvent} event - Incoming data transmission boundary container.
   */
  function handleMessage(event) {
    if (!event.data || !event.data.type) return;
    const { type, data } = event.data;
    switch (type) {
      case 'INSTRUMENT_REQUEST':
        handleInstrumentRequest(data.url, data.code);
        break;
      case 'INSTRUMENT_HTML_REQUEST':
        handleInstrumentHTMLRequest(data.url, data.code);
        break;
      case 'ERROR':
        console.error('[SW Manager] Error from SW:', data.message);
        break;
    }
  }

  /**
   * Transforms standalone JavaScript files by passing them to the compiler tool.
   * @param {string} url - Location coordinate path of source file.
   * @param {string} code - Absolute string text content of target module.
   */
  function handleInstrumentRequest(url, code) {
    const Instrumenter = window.MyDevTool.SourceInstrumenter;
    if (!Instrumenter) {
      sendInstrumentedToSW(url, code);
      return;
    }
    try {
      // JavaScript standalone files always evaluate starting from absolute line index 0
      const instrumentedCode = Instrumenter.instrument(code, url, 0); 
      sendInstrumentedToSW(url, instrumentedCode);
    } catch (error) {
      console.error(`[SW Manager] JS Instrument failed:`, error);
      sendInstrumentedToSW(url, code);
    }
  }
  
  /**
   * Locates inline script segments residing in HTML payloads to calculate 
   * document line boundary offsets and execute granular instrumentation.
   * @param {string} url - Target application HTML view address context.
   * @param {string} htmlCode - Unprocessed target document buffer string.
   */
  function handleInstrumentHTMLRequest(url, htmlCode) {
    const Instrumenter = window.MyDevTool.SourceInstrumenter;

    if (!Instrumenter) {
      sendInstrumentedToSW(url, htmlCode);
      return;
    }

    try {
      const instrumentedHtml = htmlCode.replace(
        /<script\b([^>]*)>([\s\S]*?)<\/script>/gmi,
        (match, attrs, inlineCode, offset) => {
          
          // Skip remote structural script declarations missing explicit internal text payloads
          if (attrs.match(/\bsrc\s*=\s*['"]/) || !inlineCode.trim()) {
            return match;
          }

          try {
            // 1. Calculate the precise position where the inline block content begins
            const scriptContentStart = offset + match.indexOf(inlineCode);
            
            // 2. Count line boundaries up to the starting index to compute the layout row offset
            const codeUpToScript = htmlCode.substring(0, scriptContentStart);
            const lineOffset = codeUpToScript.split('\n').length - 1;
            
            // console.log(`[SW Manager] Inline script found at line ${lineOffset + 1} in ${url}`);

            // 3. Pass the calculated offset down into the instrumenter engine to map accurate coordinates
            const instrumentedCode = Instrumenter.instrument(inlineCode, url, lineOffset);
            
            return `<script${attrs}>${instrumentedCode}</script>`;
          } catch (e) {
            console.error(`[SW Manager] Inline script instrumentation failed:`, e);
            return match;
          }
        }
      );
      
      // console.log('[SW Manager] Instrumented HTML file:', url);
      sendInstrumentedToSW(url, instrumentedHtml);
      
    } catch (error) {
      console.error(`[SW Manager] HTML Instrumentation failed for ${url}:`, error);
      sendInstrumentedToSW(url, htmlCode);
    }
  }
  
  /**
   * Returns transformed logic buffers to service worker caches.
   * @param {string} url - Destination asset path.
   * @param {string} code - Processed string text output.
   */
  function sendInstrumentedToSW(url, code) {
    const controller = navigator.serviceWorker.controller;
    if (controller) {
      controller.postMessage({ type: 'CACHE_INSTRUMENTED', url, code });
    }
  }
  
  /**
   * Synchronizes breakpoint states to background interceptors to manage runtime breakpoints.
   * @param {Array} breakpoints - Normalized lists containing target breakpoint arrays.
   */
  function syncBreakpoints(breakpoints) {
    const controller = navigator.serviceWorker.controller;
    if (controller && isEnabled) {
      controller.postMessage({ type: 'SYNC_BREAKPOINTS', breakpoints });
    }
  }

  // Public Interface API Bindings
  return {
    init, 
    register,
    setEnabled,
    syncBreakpoints,
    isEnabled: () => isEnabled,
    isRegistered: () => isRegistered
  };

})();
