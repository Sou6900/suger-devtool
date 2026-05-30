window.MyDevTool = window.MyDevTool || {};

/**
 * NetworkLog (The "Brain" / State Manager)
 * Ei module-ti sob network request-er state dhore rakhe.
 * Eti NetworkInterceptor-theke data ney ebong NetworkTab (UI)-ke update pathay.
 */
window.MyDevTool.NetworkLog = (function () {

  let state = {
    isRecording: true,
    requests: [],
    requestMap: new Map() // ID diye request khuje ber korar jonno
  };

  // Event listeners (UI module-gulo ekhane subscribe korbe)
  let listeners = {
    onRecordingStateChanged: [],
    onRequestsUpdated: []
  };

  /**
   * @param {object} interceptorModule - NetworkInterceptor module
   */
  function init(interceptorModule) {
    // Interceptor-er event-gulo-te subscribe korun
    interceptorModule.subscribe('onRequestStarted', onRequestStarted);
    interceptorModule.subscribe('onRequestFinished', onRequestFinished);
  }

  // --- Public API ---

  function toggleRecording() {
    state.isRecording = !state.isRecording;
    notify('onRecordingStateChanged', state.isRecording);
  }

  function clearRequests() {
    state.requests = [];
    state.requestMap.clear();
    notify('onRequestsUpdated', state.requests);
  }

  function getRequests() {
    return state.requests;
  }
  
  function getRequestById(id) {
    return state.requestMap.get(id);
  }

  function isRecording() {
    return state.isRecording;
  }

  /**
   * UI module-guloke (NetworkTab) event-e subscribe korar onumoti dey
   * @param {string} eventName - 'onRecordingStateChanged' | 'onRequestsUpdated'
   * @param {function} callback
   */
  function subscribe(eventName, callback) {
    if (listeners[eventName]) {
      listeners[eventName].push(callback);
    }
  }

  // --- Private Functions ---

  /**
   * Interceptor theke 'onRequestStarted' event-e call kora hoy
   * @param {object} requestData
   */
  function onRequestStarted(requestData) {
    if (!state.isRecording) return; // Record na korle kichu korar dorkar nei

    const request = {
      ...requestData,
      id: requestData.id || `req-${Math.random()}`
    };
    
    state.requests.push(request);
    state.requestMap.set(request.id, request);
    
    notify('onRequestsUpdated', state.requests);
  }

  /**
   * Interceptor theke 'onRequestFinished' event-e call kora hoy
   * @param {object} updateData
   */
  function onRequestFinished(updateData) {
    if (!state.isRecording && !state.requestMap.has(updateData.id)) return;
    
    const request = state.requestMap.get(updateData.id);
    if (request) {
      // Request object-ti notun data diye update korun
      Object.assign(request, updateData);
      
      // Jodi timingData ekhono na ashe, tahole interceptor-er duration use korun
      if (!request.timingData) {
         request.duration = request.endTime - request.startTime;
      }
      
      notify('onRequestsUpdated', state.requests);
    }
  }

  /**
   * adds timing data from PerformanceObserver
   * @param {object} timingData - PerformanceResourceTiming's JSON object
   */

  function addTimingData(timingData) {
  // console.log('🔍 addTimingData called:', {
  //   url: timingData.name,
  //   timing: timingData
  // });
  
  const request = state.requests.slice().reverse().find(
    r => r.url === timingData.name && !r.timingData
  );

  if (request) {
    // console.log('Matched request:', request.id, request.url);
    request.timingData = timingData;
    request.duration = timingData.duration;
    
    if (timingData.initiatorType && timingData.initiatorType !== 'xmlhttprequest' && timingData.initiatorType !== 'fetch') {
       request.resourceType = timingData.initiatorType;
    }

    notify('onRequestsUpdated', state.requests);
  } else {
    // console.log('❌ No matching request found for:', timingData.name);
  }
}

  /**
   * Tells All subscribers (UI) updates
   * @param {string} eventName
   * @param {any} data
   */
  function notify(eventName, data) {
    listeners[eventName].forEach(callback => callback(data));
  }

  return {
    init,
    toggleRecording,
    clearRequests,
    getRequests,
    getRequestById,
    isRecording,
    subscribe,
    addTimingData
  };

})();