// src/modules/source/SourceDebugger.js

window.MyDevTool = window.MyDevTool || {};
window.MyDevTool.SourceDebugger = (function () {

  // --- Custom Error ---
  function DevToolPauseError(url, lineNumber, callStackString) {
    this.name = 'DevToolPauseError';
    this.message = `Debugger pause requested at ${url}:${lineNumber}`;
    this.stack = callStackString;
    this.url = url;
    this.lineNumber = lineNumber;
    this.callStackString = callStackString;
  }

  DevToolPauseError.prototype = Object.create(Error.prototype);
  DevToolPauseError.prototype.constructor = DevToolPauseError;

  // --- Module Test ---
  let BreakpointManager = null;
  let state = {
    isPaused: false,
    pauseReason: null,
    currentFile: null,
    currentLine: -1,
    currentStartCol: 0,
    currentEndCol: 0,
    callStack: [],
  };
  let executionState = 'running';
  let stepOutDepth = 0;
  let stepOverDepth = 0;
  let listeners = [];
  let resumeCallback = null;
  let stepOverStartLine = -1;
  let stepOverResumePoint = null;
  let currentScopeVars = [];
  let capturedScopeData = {};
  let isPausedInLocalScope = false;

  // Trafic Control & Auto Jump Variables
  let pauseWaiters = []; 
  let autoJumpPending = false; 
  let stepTimeout = null;
  
  // --- Init & Subscribe ---
  function init() {
    // ScopeManager = window.MyDevTool.ScopeManager;
  }

  function setBreakpointManager(manager) {
    BreakpointManager = manager;
  }

  // function notifyListeners() {
  //   listeners.forEach(cb => cb(state));
  // }
  

  function notifyListeners() {
    if (!listeners || listeners.length === 0) return; // Safety
    
    listeners.forEach(cb => {
        try {
            if (typeof cb === 'function') {
                cb(state);
            }
        } catch (e) {
            console.warn('[SourceDebugger] Listener callback failed:', e);
        }
    });
  }
  

  function subscribe(callback) {
    listeners.push(callback);
  }

  // --- Call Stack Parser ---
  function parseCallStack(stackString) {
    if (!stackString) return [];
    const functionFilter = [
      'globalEval',
      'Object.evaluate',
      'stepAsync',
      'stepSync',
      'pause',
      'resume',
      'HTMLButtonElement.<anonymous>' 
    ];
    const lines = stackString.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('Error'));
    
    const parsedFrames = lines.map(line => {
      line = line.replace(/^at\s+/, '');
      const evalMatch = line.match(/(.*?)\s+\(eval at globalEval .*?,\s*<anonymous>:(\d+):\d+\)/);
      if (evalMatch) {
        const funcName = evalMatch[1].trim();
        return {
          name: (funcName === 'eval' || !funcName) ? 'anonymous': funcName,
          file: '<anonymous>',
          line: evalMatch[2],
          raw: line
        };
      }
      const match = line.match(/(?:(.*?)\s+\()?(?:http|file|blob|webpack)[\s\S]*?(.*?):(\d+):\d+/);
      if (match && match[2] && match[3]) {
        const fileUrl = match[2];
        let funcName = match[1] || 'anonymous';
        if (funcName.startsWith('eval')) funcName = 'anonymous';
        return {
          name: funcName.trim(),
          file: fileUrl.substring(fileUrl.lastIndexOf('/') + 1) || fileUrl,
          url: fileUrl,
          line: match[3],
          raw: line
        };
      }
      return {
        name: line.split(' ')[0],
        file: 'unknown',
        line: '?',
        raw: line
      };
    });
    const filteredFrames = parsedFrames.filter(frame => {
      if (!frame.name) return false;
      if (functionFilter.some(name => frame.name.includes(name))) return false;
      if (frame.name === 'eval' || (frame.name === 'anonymous' && frame.file.includes('sc-dt.core.js'))) return false;
      if (frame.file === 'unknown') return false;
      return true;
    });
    return filteredFrames;
  }

  // Updated Pause Function: Accepts Scope Object
  async function pause(urlOrReason, lineNumber, callStackString, scopeObj = {}) {
    if (state.isPaused) return;

    if (stepTimeout) { clearTimeout(stepTimeout); stepTimeout = null; }

    // Capture Scope Immediately
    __captureScope(scopeObj);

    state.isPaused = true;
    state.callStack = parseCallStack(callStackString) || [];

    if (urlOrReason && urlOrReason.startsWith("Event: ")) {
        state.pauseReason = urlOrReason;
        state.currentFile = null; 
        state.currentLine = 0;
    } else {
        state.pauseReason = "Breakpoint"; 
        state.currentFile = urlOrReason;
        state.currentLine = lineNumber;
    }

    // console.log(`[Debugger] PAUSED at ${state.currentFile}:${state.currentLine}`);
    notifyListeners();
    if (window.MyDevTool.ScopeManager) window.MyDevTool.ScopeManager.update();

    await new Promise((resolve) => { resumeCallback = resolve; });
  }
  
  function releaseWaiters() {
    if (pauseWaiters.length > 0) {
        // console.log(`[Debugger] Releasing ${pauseWaiters.length} waiting scripts...`);
        const waitersToRelease = [...pauseWaiters];
        pauseWaiters = [];
        waitersToRelease.forEach(resolve => resolve());
    }
  }

  function resume() {
    if (!state.isPaused || !resumeCallback) return;
    
    if (window.MyDevTool.ScopeManager) window.MyDevTool.ScopeManager.clear();

    state.isPaused = false;
    state.pauseReason = null;
    isPausedInLocalScope = false;

    notifyListeners();
    
    const currentCallback = resumeCallback;
    resumeCallback = null;
    currentCallback();

    if (executionState === 'running') {
        releaseWaiters();
    } else {
        if (stepTimeout) clearTimeout(stepTimeout);
        stepTimeout = setTimeout(() => {
            executionState = 'running'; 
            releaseWaiters();
            stepTimeout = null;
        }, 50); 
    }
  }

  // --- Step Functions ---
  function stepSync(url, lineNumber, startCol, endCol, callStackString) {
    if (!BreakpointManager) return;

    const breakpoints = BreakpointManager.getBreakpointsByUrl(url);
    const bpData = breakpoints ? breakpoints[lineNumber] : null;
    const hasBreakpoint = bpData && bpData.enabled;

    if (hasBreakpoint) {
      executionState = 'paused';
      throw new DevToolPauseError(url, lineNumber, callStackString);
    }
  }
  
    // Updated StepAsync: Accepts Scope Object
  async function stepAsync(url, lineNumber, startCol = 0, endCol = 0, callStackString, scopeObj = {}) {
    if (!BreakpointManager) return;

    const isBusy = state.isPaused || (executionState !== 'running' && stepTimeout !== null);
    while (isBusy && state.currentFile && state.currentFile !== url) {
         await new Promise(resolve => pauseWaiters.push(resolve));
         if (!state.isPaused && executionState === 'running') break;
    }
    if (state.isPaused) return; 

    // Auto-Jump Logic
    if (state.currentFile && state.currentFile !== url) {
        stepOverDepth = 0; stepOutDepth = 0;
        if (executionState === 'stepping' || executionState === 'steppingOver') autoJumpPending = true;
    }
    
    if (autoJumpPending) {
        autoJumpPending = false;
        executionState = 'paused';
        await pause(url, lineNumber, callStackString, scopeObj);
        return;
    }

    state.currentFile = url;
    state.currentLine = lineNumber;
    state.currentStartCol = startCol;
    state.currentEndCol = endCol;

    const currentDepth = (callStackString.match(/\n/g) || []).length; 

    if (executionState === 'steppingOver') {
       if (currentDepth > stepOverDepth) return; 
       executionState = 'paused';
       await pause(url, lineNumber, callStackString, scopeObj);
       return;
    }
    
    if (executionState === 'steppingOut') {
        if (currentDepth < stepOutDepth) {
            executionState = 'paused';
            await pause(url, lineNumber, callStackString, scopeObj);
            return;
        }
        return;
    }

    const bpData = BreakpointManager.getBreakpointsByUrl(url)[lineNumber];
    if (executionState === 'stepping' || (bpData && bpData.enabled)) {
       executionState = 'paused';
       await pause(url, lineNumber, callStackString, scopeObj);
    }
  }

  function stepOver() {
    if (state.isPaused) {
      executionState = 'steppingOver';
      const stack = new Error().stack;
      stepOverDepth = (stack.match(/\n/g) || []).length;
      autoJumpPending = false;
      resume(); 
    }
  }

  function stepInto() {
    if (state.isPaused) {
      executionState = 'stepping'; 
      resume();
    } else {
      console.warn(`[Debugger] ⚠️ Cannot step into - not paused!`);
    }
  }

  function stepOut() {
    if (state.isPaused) {
      executionState = 'steppingOut';
      stepOutDepth = state.callStack.length;
      resume();
    } else {
      console.warn(`[Debugger] ⚠️ Cannot step out - not paused!`);
    }
  }

  function requestPause() {
    if (executionState === 'running') {
      executionState = 'stepping';
    }
  }

  function getState() { return state; }
  
  function __captureScope(scopeObj) {
    capturedScopeData = scopeObj || {};
    currentScopeVars = Object.keys(capturedScopeData);
    isPausedInLocalScope = true;

    if (state.isPaused && window.MyDevTool.ScopeManager) {
      window.MyDevTool.ScopeManager.update();
    }
    return scopeObj;
  }

  function getScopeVariables() { return currentScopeVars; }
  function isPaused() { return state.isPaused; }
  function getScopeData() { return capturedScopeData; }

  //handle 'this' correctly
  function evalInPausedScope(code) {
    if (!isPausedInLocalScope) {
      throw new Error('Not paused in a local scope');
    }

    // 1. 'this' And Others Variable Separation
    const scopeKeys = [];
    const scopeValues = [];
    let capturedThis = window; // If default window dosn't capture

    for (const [key, val] of Object.entries(capturedScopeData)) {
      if (key === 'this') {
        capturedThis = val; // 'this' separate
      } else {
        scopeKeys.push(key);
        scopeValues.push(val);
      }
    }

    try {
      // new Function where `this` is not as arg
      const evalFunc = new Function(...scopeKeys, `return eval(${JSON.stringify(code)})`);
      
      // 3. .apply() - this bind
      const result = evalFunc.apply(capturedThis, scopeValues);
      
      return result;
      
    } catch (e) {
      throw e;
    }
  }

  // --- Public API ---

  return {
    init,
    setBreakpointManager,
    subscribe,
    pause,
    resume,
    stepAsync,
    stepSync,
    stepOver,
    stepInto,
    stepOut,
    requestPause,
    getState,
    DevToolPauseError,
    __captureScope,
    getScopeData,
    isPaused,
    evalInPausedScope,
    getScopeVariables
  };

})();