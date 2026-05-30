// src/modules/source/EventListenerManager.js

window.MyDevTool = window.MyDevTool || {};
window.MyDevTool.EventListenerManager = (function () {

  let activeBreakpoints = new Set(); 
  let allListeners = []; 
  
  const originalAdd = EventTarget.prototype.addEventListener;
  const originalRemove = EventTarget.prototype.removeEventListener;
  
  const originalSetTimeout = window.setTimeout;
  const originalSetInterval = window.setInterval;
  
  let isInitialized = false;

  // Event List
  const eventCategories = {
    'Ad Auction Worklet': ['protected-audience-bidding', 'protected-audience-scoring'],
    'Animation': ['animationcancel', 'animationend', 'animationiteration', 'animationstart', 'transitioncancel', 'transitionend', 'transitionrun', 'transitionstart'],
    'Canvas': ['contextlost', 'contextrestored', 'webglcontextcreationerror'],
    'Clipboard': ['copy', 'cut', 'paste', 'beforecopy', 'beforecut', 'beforepaste'],
    'Control': ['blur', 'change', 'focus', 'reset', 'resize', 'scroll', 'select', 'submit', 'zoom'],
    'Device': ['deviceorientation', 'devicemotion'],
    'DOM Mutation': ['DOMActivate', 'DOMCharacterDataModified', 'DOMContentLoaded', 'DOMNodeInserted', 'DOMNodeRemoved', 'DOMSubtreeModified'],
    'Drag / drop': ['drag', 'dragend', 'dragenter', 'dragleave', 'dragover', 'dragstart', 'drop'],
    'Keyboard': ['keydown', 'keypress', 'keyup', 'input'],
    'Load': ['abort', 'error', 'load', 'loadend', 'loadstart', 'progress', 'timeout', 'readystatechange'],
    'Media': ['play', 'pause', 'playing', 'seeking', 'seeked', 'volumechange', 'ratechange', 'ended', 'waiting', 'stalled', 'suspend'],
    'Mouse': ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'mousemove', 'mouseenter', 'mouseleave', 'contextmenu', 'wheel', 'auxclick'],
    'Pointer': ['pointerover', 'pointerenter', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'pointerout', 'pointerleave', 'gotpointercapture', 'lostpointercapture'],
    'Script': ['scriptfirststatement'],
    'Timer': ['timer-fired'],
    'Touch': ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
    'Window': ['close', 'resize', 'scroll', 'focus', 'blur', 'hashchange', 'popstate'],
    'XHR': ['readystatechange', 'load', 'loadstart', 'loadend', 'abort', 'error', 'progress', 'timeout']
  };

  function init() {
    if (isInitialized) return;
    isInitialized = true;
    overrideAddEventListener();
    overrideTimers();
  }

  // --- 1. Event Listeners Patch ---
  function overrideAddEventListener() {
    EventTarget.prototype.addEventListener = function (type, listener, options) {
      
      const wrappedListener = async function (e) {
        if (activeBreakpoints.has(type)) {
           const SourceDebugger = window.MyDevTool.SourceDebugger;
           if (SourceDebugger) {
             // console.log(`[EventListenerManager] Pausing on event: ${type}`);
             await SourceDebugger.pause("Event: " + type, 0, new Error().stack);
           }
        }
        
        if (typeof listener === 'function') {
            return listener.apply(this, arguments);
        } else if (listener && typeof listener.handleEvent === 'function') {
            return listener.handleEvent(e);
        }
      };

      wrappedListener._original = listener;
      
      allListeners.push({
        target: this,
        type: type,
        listener: wrappedListener,
        original: listener,
        useCapture: options === true || (options && options.capture)
      });

      return originalAdd.call(this, type, wrappedListener, options);
    };

    EventTarget.prototype.removeEventListener = function (type, listener, options) {
      const foundIndex = allListeners.findIndex(l => 
        l.target === this && 
        l.type === type && 
        (l.original === listener || l.listener === listener)
      );

      if (foundIndex !== -1) {
        const entry = allListeners[foundIndex];
        allListeners.splice(foundIndex, 1);
        return originalRemove.call(this, type, entry.listener, options);
      }
      return originalRemove.call(this, type, listener, options);
    };
  }

  // --- 2 Timers Patch 
  function overrideTimers() {
    
    // setTimeout Patch
    window.setTimeout = function (handler, timeout, ...args) {
      const wrappedHandler = async () => {
        if (activeBreakpoints.has('timer-fired')) {
           const SourceDebugger = window.MyDevTool.SourceDebugger;
           if (SourceDebugger) {
             // console.log(`[EventListenerManager] 🛑 Pausing on setTimeout`);

             await SourceDebugger.pause("Event: timer-fired", 0, new Error().stack);
           }
        }

        // Real handler Run
        if (typeof handler === 'function') {
          handler.apply(window, args);
        } else {
          // Legacy String Support (ex: setTimeout("alert(1)", 1000))
          try { window.eval(handler); } catch (e) {}
        }
      };
      
      return originalSetTimeout(wrappedHandler, timeout);
    };

    // setInterval Patch
    window.setInterval = function (handler, timeout, ...args) {
      const wrappedHandler = async () => {
        if (activeBreakpoints.has('timer-fired')) {
           const SourceDebugger = window.MyDevTool.SourceDebugger;
           if (SourceDebugger) {
             // console.log(`[EventListenerManager] Pausing on setInterval`);
             await SourceDebugger.pause("Event: timer-fired", 0, new Error().stack);
           }
        }

        if (typeof handler === 'function') {
          handler.apply(window, args);
        } else {
          try { window.eval(handler); } catch (e) {}
        }
      };
      
      return originalSetInterval(wrappedHandler, timeout);
    };
  }

  // --- API ---
  function setBreakpoint(eventName, enabled) {
    if (enabled) activeBreakpoints.add(eventName);
    else activeBreakpoints.delete(eventName);
    // console.log(`[EventListenerManager] Breakpoint ${enabled ? 'Set' : 'Removed'}: ${eventName}`);
  }
  
  function setCategoryBreakpoint(category, enabled) {
      const events = eventCategories[category];
      if (!events) return;
      events.forEach(evt => setBreakpoint(evt, enabled));
  }

  function getGlobalListeners() { return allListeners; }
  function getCategories() { return eventCategories; }

  return {
    init,
    setBreakpoint,
    setCategoryBreakpoint,
    getGlobalListeners,
    getCategories
  };

})();