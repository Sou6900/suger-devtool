// SourceBreakpointManager.js

window.MyDevTool = window.MyDevTool || {};
window.MyDevTool.SourceBreakpointManager = (function () {

  // State Schema: { "url": { 10: { enabled: true, content: "let a = 5;" } }, ... }
  let pauseOnUncaught = false;
  let pauseOnCaught = false;
  let breakpointsByUrl = {};
  let changeListeners = [];

  /**
   * Initializes the breakpoint manager by loading serialized states from local storage.
   */
  function init() {
    const savedBps = localStorage.getItem('myDevToolBreakpoints');
    if (savedBps) {
      try {
        breakpointsByUrl = JSON.parse(savedBps);
        // console.log('[BreakpointManager] init(): Loaded breakpoints from localStorage:', breakpointsByUrl);
      } catch (e) {
        console.error('MyDevTool: Failed to parse saved breakpoints:', e);
        breakpointsByUrl = {};
      }
    } else {
      // console.log('[BreakpointManager]  init(): No breakpoints in localStorage.');
      breakpointsByUrl = {};
    }
    changeListeners = [];
  }
  
  /**
   * Configures global exception interception criteria parameters.
   * @param {boolean} uncaught - Enable execution pause on unhandled exceptions.
   * @param {boolean} caught - Enable execution pause on handled exceptions.
   */
  function setExceptionBreakpoints(uncaught, caught) {
    pauseOnUncaught = uncaught;
    pauseOnCaught = caught;
    // console.log(`[BP Manager] Exceptions: Uncaught=${uncaught}, Caught=${caught}`);
  }

  function shouldPauseOnUncaught() { return pauseOnUncaught; }
  function shouldPauseOnCaught() { return pauseOnCaught; }

  /**
   * Commits current active breakpoint configurations to disk storage and fires lifecycle notification triggers.
   * @private
   */
  function notifyListeners() {
    try {
      localStorage.setItem('myDevToolBreakpoints', JSON.stringify(breakpointsByUrl));
    } catch (e) {
      console.error('MyDevTool: Failed to save breakpoints to localStorage:', e);
    }
    
    changeListeners.forEach(cb => cb(getAllBreakpoints()));
  }

  /**
   * Alternates or toggles breakpoint initialization states on specific targets.
   * @param {string} url - Target resource URL workspace path mapping descriptor.
   * @param {number|string} lineNumber - Targeted structural document coordinate row index.
   * @param {string|null} lineContent - Extracted natural code string payload matching the line target boundaries.
   * @returns {boolean} - True if the breakpoint state was established, false if it was purged.
   */
  function toggleBreakpoint(url, lineNumber, lineContent = null) {
    if (!url) return false;

    if (!breakpointsByUrl[url]) {
      breakpointsByUrl[url] = {};
    }

    let isSet = false;
    if (breakpointsByUrl[url][lineNumber]) {
      // Breakpoint exists: Evict row from mapping profiles
      delete breakpointsByUrl[url][lineNumber];
      isSet = false;
    } else {
      // Breakpoint is absent: Register entry state logs
      // Guard condition: If lineContent is null (during validation cycles), bypass allocation registries
      if (lineContent !== null) {
        breakpointsByUrl[url][lineNumber] = { 
          enabled: true, 
          content: lineContent // Cache contextually verified source rows
        };
        isSet = true;
      }
    }

    notifyListeners();
    return isSet;
  }

  /**
   * Switches or updates active execution authorization configurations on a specified breakpoint coordinate.
   * @param {string} url - Target resource location coordinate identifier.
   * @param {number|string} lineNumber - Targeted line boundary index.
   * @param {boolean} enabled - Execution matching criteria authorization flag state.
   */
  function setBreakpointEnabled(url, lineNumber, enabled) {
    if (breakpointsByUrl[url] && breakpointsByUrl[url][lineNumber]) {
      breakpointsByUrl[url][lineNumber].enabled = enabled;
      notifyListeners();
    }
  }

  /**
   * Accumulates and resolves complete registered maps assigned exclusively underneath a specific file structure.
   * @param {string} url - File path identification namespace address.
   * @returns {Object} Dictionary indexing active row locations map.
   */
  function getBreakpointsByUrl(url) {
    return breakpointsByUrl[url] || {};
  }

  /**
   * Flattens multi-dimensional nested indexing parameters into unified array structures for UI telemetry rendering.
   * @returns {Array<{url: string, lineNumber: number, name: string, enabled: boolean, content: string}>}
   */
  function getAllBreakpoints() {
    const all = [];
    for (const url in breakpointsByUrl) {
      for (const line in breakpointsByUrl[url]) {
        const bpData = breakpointsByUrl[url][line];
        all.push({
          url: url,
          lineNumber: parseInt(line, 10),
          name: url.substring(url.lastIndexOf('/') + 1),
          enabled: bpData.enabled,
          content: bpData.content // Return cached source string parameters
        });
      }
    }
    return all;
  }

  /**
   * Appends state tracking listeners to observe structural map updates.
   * @param {Function} callback - Telemetry callback executed during mutations.
   */
  function subscribe(callback) {
    changeListeners.push(callback);
  }

  // Public Interface API Bindings
  return {
    init,
    setExceptionBreakpoints,
    shouldPauseOnUncaught,
    shouldPauseOnCaught,
    toggleBreakpoint,
    setBreakpointEnabled,
    getBreakpointsByUrl,
    getAllBreakpoints,
    subscribe
  };

})();
