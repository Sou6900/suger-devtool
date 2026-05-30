// devtool-sw.js 

let instrumentationEnabled = false;
let instrumentedCache = new Map();
let pendingInstrumentation = new Map();

// --- Lifecycle ---
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// --- Message Handling ---
self.addEventListener('message', async (event) => {
  if (!event.data) return;
  const { type, enabled, url, code } = event.data;
  
  switch (type) {
    case 'SET_INSTRUMENTATION':
      instrumentationEnabled = enabled;
      if (!enabled) {
        instrumentedCache.clear();
        pendingInstrumentation.clear();
      }
      break;

    case 'CACHE_INSTRUMENTED':
      if (url && code) {
          instrumentedCache.set(url, code);
          if (pendingInstrumentation.has(url)) {
            const resolve = pendingInstrumentation.get(url);
            pendingInstrumentation.delete(url);
            resolve(code);
          }
      }
      break;
      
    case 'CLEAR_CACHE':
      instrumentedCache.clear();
      pendingInstrumentation.clear();
      break;
  }
});

// --- Fetch Interceptor ---
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const clientId = event.clientId;
  
  //  Safety Checks
  if (event.request.mode === 'navigate' || event.request.destination === 'document') return; 
  if (url.origin !== self.location.origin) return;
  if (event.request.headers.has('X-DevTool-Request')) return;
  
  if (url.pathname.includes('devtool-sw.js') || 
      url.pathname.includes('suger-dev') || 
      url.pathname.includes('socket') ||
      url.pathname.includes('inspector.js')) {
    return;
  }

  if (!instrumentationEnabled) return;

  // 1. JS Files
  if (url.pathname.endsWith('.js')) {
    event.respondWith(handleJSRequest(event.request, url, clientId));
    return;
  }
  
  // 2. Dynamic HTML
  const acceptHeader = event.request.headers.get('Accept') || '';
  if (acceptHeader.includes('text/html')) {
    event.respondWith(handleHTMLRequest(event.request, url, clientId));
    return;
  }
});

// --- Request Handlers (Now accepting clientId) ---

async function handleJSRequest(request, url, clientId) {
  try {
    if (instrumentedCache.has(url.href)) {
      return new Response(instrumentedCache.get(url.href), {
        headers: { 'Content-Type': 'application/javascript' }
      });
    }

    const response = await fetch(request);
    if (!response.ok) return response;

    const originalCode = await response.text();

    // Pass clientId down
    const instrumentedCode = await requestInstrumentation(url.href, originalCode, false, clientId);

    return new Response(instrumentedCode, {
      headers: { 'Content-Type': 'application/javascript' }
    });

  } catch (error) {
    return fetch(request);
  }
}

async function handleHTMLRequest(request, url, clientId) {
  try {
    if (instrumentedCache.has(url.href)) {
      return new Response(instrumentedCache.get(url.href), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    const response = await fetch(request);
    if (!response.ok) return response;

    const originalHtml = await response.text();

    // Pass clientId down
    const instrumentedHtml = await requestInstrumentation(url.href, originalHtml, true, clientId);

    return new Response(instrumentedHtml, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    return fetch(request);
  }
}

// --- Instrumentation Logic ---

async function requestInstrumentation(url, code, isHtml = false, clientId = null) {
  const instrumentationPromise = new Promise((resolve) => {
    pendingInstrumentation.set(url, resolve);
  });

  // Send to Main Thread with clientId
  const clientSent = await sendToMainThread({
    type: isHtml ? 'INSTRUMENT_HTML_REQUEST' : 'INSTRUMENT_REQUEST',
    data: { url, code }
  }, clientId);

  if (!clientSent) {
      pendingInstrumentation.delete(url);
      return code; // Fallback to original
  }

  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => {
      if (pendingInstrumentation.has(url)) {
          pendingInstrumentation.delete(url);
          resolve(code); 
      }
    }, 2000); // 2s Timeout
  });

  return Promise.race([instrumentationPromise, timeoutPromise]);
}

async function sendToMainThread(message, clientId) {
// Target Specific Client
  if (clientId) {
      try {
          const client = await self.clients.get(clientId);
          if (client) {
              client.postMessage(message);
              return true;
          }
      } catch(e) {
          // console.warn('[SW] Could not get client by ID', e);
      }
  }

  // Fallback
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  
  let targetClient = clients.find(c => c.visibilityState === 'visible') || clients[0];

  if (targetClient) {
    targetClient.postMessage(message);
    return true;
  }
  
  return false; // no clients found , devtool still not rrady 
}