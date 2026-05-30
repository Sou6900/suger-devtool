// src/modules/source/DOMBreakpointManager.js

window.MyDevTool = window.MyDevTool || {};
window.MyDevTool.DOMBreakpointManager = (function () {

  // Map tracking active bindings: Map<Element, MutationObserver>
  let activeObservers = new Map(); 

  /**
   * Attaches a DOM mutation breakpoint to a specified target element node.
   * Intercepts DOM structural modifications and dispatches pause events to the core debugger.
   * @param {Element} element - The target DOM element node to monitor.
   * @param {'attributes'|'subtree'|'node-removal'} type - The structural mutation event filter criteria.
   */
  function setBreakpoint(element, type) {
    if (!element) return;
    
    const SourceDebugger = window.MyDevTool.SourceDebugger;
    if (!SourceDebugger) return;

    // Reuse existing observer instance bound to this element if available, otherwise provision a new one
    let observer = activeObservers.get(element);
    if (!observer) {
       observer = new MutationObserver(async (mutations) => {
          // Interrupt implementation execution thread when a matching DOM modification is detected
          // console.log(`[DOMBreakpoint] 🛑 Paused on DOM Change (${type})`);
          await SourceDebugger.pause("DOM Mutation", 0, new Error().stack);
       });
       activeObservers.set(element, observer);
    }

    // Configure structural tracking parameters matching the requested mutation criteria
    const config = {
        attributes: type === 'attributes',
        childList: type === 'subtree' || type === 'node-removal',
        subtree: type === 'subtree'
    };
    
    // Begin active observation of the target node
    observer.observe(element, config);
    // console.log(`[DOMBreakpoint] Set on`, element, type);
  }

  /**
   * Clears active mutation observers bound to a specific element to tear down the breakpoint state.
   * @param {Element} element - The monitored DOM element node target for eviction.
   */
  function removeBreakpoint(element) {
    const observer = activeObservers.get(element);
    if (observer) {
      observer.disconnect();
      activeObservers.delete(element);
    }
  }
  
  /**
   * Global utility exposing DOM breakpoint capabilities directly to the devtools command console.
   * @global
   * @param {Element} element - Target DOM node element.
   * @param {'attributes'|'subtree'|'node-removal'} [type='subtree'] - Structural tracking scope.
   */
  window.debugDOM = function(element, type = 'subtree') {
      setBreakpoint(element, type);
      // console.log(`%c[Debugger] Watching ${element.tagName} for '${type}' changes.`, "color: green");
  };

  // Public Interface API Bindings
  return {
    setBreakpoint,
    removeBreakpoint
  };

})();
