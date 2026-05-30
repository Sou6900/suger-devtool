// SourceEditor.js

window.MyDevTool = window.MyDevTool || {};
window.MyDevTool.SourceEditor = (function () {

  let container = null, editorView = null, placeholder = null;
  let BreakpointManager = null;
  let currentFileUrl = null, currentFileContent = null, currentHighlight = null;
  let currentTokenMark = null;
  let unboundMarkers = new Set();
  
  let userPrefTheme = 'auto'; 

  function init(containerEl, placeholderEl, breakpointManagerModule) {
    // console.log('[Editor] init()');
    container = containerEl;
    placeholder = placeholderEl;
    BreakpointManager = breakpointManagerModule; 

    if (!window.CodeMirror) {
      console.error('Suger dev tool : Code editor not loaded!');
      return;
    }
    
    // Load saved preference
    userPrefTheme = localStorage.getItem('devtool-editor-theme') || 'auto';
    
    const safeKeyMap = (window.CodeMirror.keyMap.sublime) ? "sublime" : "default";

    editorView = window.CodeMirror(container, {
      value: "", 
      lineNumbers: true,
      readOnly: true,
      lineWrapping: true,
      keyMap: safeKeyMap,
      gutters: ["CodeMirror-linenumbers", "breakpoints"],
      theme: "default"
    });
    
   
    setTimeout(() => applyTheme(userPrefTheme), 100);
    
    editorView.on("gutterClick", handleGutterClick);
    
    editorView.getWrapperElement().style.display = 'none';
    placeholder.style.display = 'flex';
  }
  
  function setTheme(themeName) {
      userPrefTheme = themeName;
      localStorage.setItem('devtool-editor-theme', themeName);
      applyTheme(themeName);
  }
  
  function applyTheme(themeName) {
      if (!editorView) return;
      
      let targetTheme = themeName;
      
      if (themeName === 'auto') {
          let isGlobalDark = false;
          
          const parentDevTool = container ? container.closest('.devtool-container') : null;
          if (parentDevTool && parentDevTool.classList.contains('dark-theme')) {
              isGlobalDark = true;
          } 
          else if (document.querySelector('.devtool-container.dark-theme')) {
              isGlobalDark = true;
          }

          targetTheme = isGlobalDark ? 'monokai' : 'default';
      }
      
      // console.log(`[Editor] Applying Theme: ${targetTheme} (Pref: ${themeName})`);
      editorView.setOption("theme", targetTheme);
  }
  
  function refreshTheme() {
      applyTheme(userPrefTheme);
  }

  function handleGutterClick(cm, lineNumber, gutterId) {
    const isValidGutter = (gutterId === 'breakpoints' || gutterId === 'CodeMirror-linenumbers');
    if (!isValidGutter || !currentFileUrl) return;
    const lineContent = editorView.getLine(lineNumber).trim();
    BreakpointManager.toggleBreakpoint(currentFileUrl, lineNumber, lineContent);
    unboundMarkers.delete(lineNumber);
    updateGutterMarkers();
  }

  function verifyAndSyncBreakpoints(url, content) {
    unboundMarkers.clear();
    const lines = content.split('\n');
    const breakpointsMap = BreakpointManager.getBreakpointsByUrl(url);

    for (const lineStr in breakpointsMap) {
      const line = parseInt(lineStr, 10);
      const bpData = breakpointsMap[line];
      const currentLineContent = (lines[line] || "").trim();

      if (bpData.content !== currentLineContent) {
        unboundMarkers.add(line);
      }
    }
  }

  async function showFileContent(url) {
    if (!editorView) return;
    
    if (url === currentFileUrl && editorView.getValue().length > 0) {
       editorView.getWrapperElement().style.display = 'block';
       if(placeholder) placeholder.style.display = 'none';
       editorView.refresh();
       return; 
    }

    try {
      clearHighlight(); 
      let content;

      if (url.startsWith('VM')) {
         const ConsoleEngine = window.MyDevTool.ConsoleEngine;
         if (ConsoleEngine && ConsoleEngine.getVMContent) {
            content = ConsoleEngine.getVMContent(url);
         } else {
            content = `// Content not found for ${url}`;
         }
      } 
      else {
          const response = await fetch(url, {
            headers: { 'X-DevTool-Request': 'true' } 
          });
          
          if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
          content = await response.text();
      }
      
      currentFileUrl = url; 
      currentFileContent = content;
      
      editorView.setValue(content);
      
      let mode = "javascript";
      if (!url.startsWith('VM')) {
         if (url.endsWith('.css')) mode = "css";
         else if (url.endsWith('.html') || url.endsWith('.htm')) mode = "xml";
      }
      editorView.setOption("mode", mode);
      
      if(placeholder) placeholder.style.display = 'none';
      editorView.getWrapperElement().style.display = 'block';
      editorView.getWrapperElement().style.height = '100%';
      editorView.refresh();

      if (!url.startsWith('VM')) {
         verifyAndSyncBreakpoints(url, content);
         updateGutterMarkers(); 
         if (window.MyDevTool.SourcePageTree && window.MyDevTool.SourcePageTree.selectFile) {
            window.MyDevTool.SourcePageTree.selectFile(url);
         }
      } else {
         editorView.clearGutter("breakpoints");
      }

    } catch (error) {
      // console.error(`[Editor] ফাইল লোড ফেইল ${url}:`, error);
      console.error(error);
      editorView.setValue(`// Error loading file: ${error.message}`);
      editorView.getWrapperElement().style.display = 'block';
      if(placeholder) placeholder.style.display = 'none';
    }
  }

  function updateGutterMarkers() {
    if (!currentFileUrl || !editorView) return;
    editorView.clearGutter("breakpoints");
    const breakpointsMap = BreakpointManager.getBreakpointsByUrl(currentFileUrl);
    
    for (const lineNumber in breakpointsMap) {
      const bpData = breakpointsMap[lineNumber];
      const marker = document.createElement('div');
      marker.className = bpData.enabled ? 'breakpoint-marker' : 'breakpoint-marker breakpoint-marker-disabled';
      editorView.setGutterMarker(parseInt(lineNumber, 10), "breakpoints", marker);
    }
    
    unboundMarkers.forEach(lineNumber => {
      if (breakpointsMap[lineNumber]) return; 
      const marker = document.createElement('div');
      marker.className = 'breakpoint-marker breakpoint-marker-unbound';
      editorView.setGutterMarker(lineNumber, "breakpoints", marker);
    });
  }

  function flashLine(lineNumber) {
    if (!editorView) return;
    const line = editorView.addLineClass(lineNumber, 'wrap', 'line-flash');
    setTimeout(() => {
      editorView.removeLineClass(line, 'wrap', 'line-flash');
    }, 550);
  }
  
  function highlightLine(lineNumber) {
    if (!editorView) return;
    clearHighlight(); 
    currentHighlight = editorView.addLineClass(lineNumber, 'wrap', 'line-highlight');
    const SourceDebugger = window.MyDevTool.SourceDebugger;
    if (SourceDebugger) {
      const state = SourceDebugger.getState();
      if (state.currentStartCol !== undefined && state.currentEndCol !== undefined) {
        highlightToken(lineNumber, state.currentStartCol, state.currentEndCol);
      }
    }
    setTimeout(() => {
        editorView.scrollIntoView({line: lineNumber, ch: 0}, 50);
    }, 10);
  }

  function highlightToken(line, startCol, endCol) {
    if (!editorView) return;
    if (currentTokenMark) {
      currentTokenMark.clear();
      currentTokenMark = null;
    }
    if (startCol >= 0 && endCol > startCol) {
      currentTokenMark = editorView.markText(
        { line: line, ch: startCol },
        { line: line, ch: endCol },
        { className: 'cm-token-highlight' }
      );
    }
  }

  function clearHighlight() {
    if (!editorView) return;
    if (currentHighlight !== null) {
      editorView.removeLineClass(currentHighlight, 'wrap', 'line-highlight');
      currentHighlight = null;
    }
    if (currentTokenMark) {
      currentTokenMark.clear();
      currentTokenMark = null;
    }
  }

  return {
    init,
    showFileContent,
    highlightLine,
    clearHighlight,
    flashLine,
    updateGutterMarkers,
    setTheme,
    refreshTheme,
    getCurrentContent: function() {
      return { url: currentFileUrl, content: currentFileContent };
    }
  };
})();