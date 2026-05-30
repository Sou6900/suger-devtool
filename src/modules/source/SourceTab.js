// src/modules/source/SourceTab.js

window.MyDevTool = window.MyDevTool || {};
window.MyDevTool.SourceTab = (function () {

  let container = null;
  let shadowRoot = null;
  let SVGs = null;
  let showSelfCallback = null; 

  // Modules
  let SourcePageTree = window.MyDevTool.SourcePageTree;
  let SourceEditor = window.MyDevTool.SourceEditor;
  let BreakpointManager = window.MyDevTool.SourceBreakpointManager;
  let SourceDebugger = window.MyDevTool.SourceDebugger; 
  let SWManager = window.MyDevTool.ServiceWorkerManager;
  let EventListenerManager = window.MyDevTool.EventListenerManager; 

  // UI Cache
  let filePanel, editorPanel, editorPlaceholder, mainContent;
  let mediaPreviewPanel, mediaContentEl, mediaInfoEl;
  let debugDrawer, debugNavPanel, debugWatchPanel, debugContent;
  let scopePanel = null;
  let breakpointPanelContent = null;
  let runScriptBtn, toggleInstrumentBtn, pauseResumeBtn, stepOverBtn, stepIntoBtn, stepOutBtn;
  let pageTreeContainer, fileTabsBar;
  let tabBar; 
  let openFiles = []; 
  let activeFileUrl = null;

  function init(containerEl, shadowRootEl, showTabCallback) {
    container = containerEl;
    shadowRoot = shadowRootEl;
    SVGs = window.MyDevTool.SVGs;
    showSelfCallback = showTabCallback; 

    SourcePageTree = window.MyDevTool.SourcePageTree;
    SourceEditor = window.MyDevTool.SourceEditor;
    BreakpointManager = window.MyDevTool.SourceBreakpointManager;
    SourceDebugger = window.MyDevTool.SourceDebugger;
    SWManager = window.MyDevTool.ServiceWorkerManager;

    if (!SVGs || !SourcePageTree || !SourceEditor || !BreakpointManager || !SourceDebugger || !SWManager) {
      console.warn("SourceTab: Required modules not loaded.");
      return;
    }
    
    buildUI();
    cacheDOMElements();
    
    SourcePageTree.init(pageTreeContainer); 
    SourceEditor.init(editorPanel.querySelector('#source-editor-code-container'), editorPlaceholder, BreakpointManager); 
    
    const ScopeManager = window.MyDevTool.ScopeManager;
    const ConsoleEngine = window.MyDevTool.ConsoleEngine;
    const JSONFormatter = window.JSONFormatter;

    if (ScopeManager && ConsoleEngine && JSONFormatter && scopePanel) {
      ScopeManager.init(scopePanel, ConsoleEngine, JSONFormatter, SVGs);
    }
    
    if (window.MyDevTool.WatchManager) {
       window.MyDevTool.WatchManager.init(container.querySelector('#watch-tab-watch'), ConsoleEngine, SourceDebugger, SVGs);
    }
    
    attachListeners();
    updateInstrumentationToggleUI(SWManager.isEnabled());
    
    BreakpointManager.subscribe(updateBreakpointPanel);
    SourceDebugger.subscribe(updateDebuggerUI); 
    updateBreakpointPanel(BreakpointManager.getAllBreakpoints()); 
    updateDebuggerUI(SourceDebugger.getState()); 
    renderXHRBreakpoints();
  }

  function buildUI() {
    const i18n = window.MyDevTool.LanguageManager;
    const recordIcon = SVGs.record || '●';
    
    const xhrTitle = i18n ? i18n.t('source.xhr_breakpoints') : 'XHR/fetch Breakpoints';
    const noBpText = i18n ? i18n.t('source.no_breakpoints') : 'No breakpoints';
    const xhrHeader = createCollapsible(xhrTitle, `<div id="xhr-breakpoints-list" class="bp-list-group"><div class="placeholder">${noBpText}</div></div>`, SVGs.add);

    const evManager = window.MyDevTool.EventListenerManager;
    let eventHtml = '<div class="bp-list-group" id="event-breakpoints-root">';
    if (evManager && evManager.getCategories) {
        const categories = evManager.getCategories();
        for (const [category, events] of Object.entries(categories)) {
            eventHtml += `
              <div class="bp-group-wrapper" data-category="${category}">
                <div class="bp-file-header">
                   <svg class="toggle" viewBox="0 0 24 24" style="transform: rotate(-90deg); width:12px; margin-right:5px; fill:var(--dt-text-secondary);"><path d="M7 10l5 5 5-5z"></path></svg>
                   <input type="checkbox" class="evt-cat-toggle" data-category="${category}" style="margin:0 6px 0 0;">
                   <span style="font-weight:500; color:var(--dt-text-primary); font-size:12px;">${category}</span>
                </div>
                <div class="bp-file-entries" style="display:none; padding-left: 22px;">
                   ${events.map(evt => `
                      <div class="bp-entry" data-event-name="${evt}" style="padding: 2px 4px; font-size:12px;">
                         <label style="display:flex; align-items:center; cursor:pointer; width:100%;">
                            <input type="checkbox" class="evt-bp-toggle" data-event="${evt}" style="margin:0;">
                            <span class="bp-line-content" style="margin-left:6px; color:var(--dt-text-primary);">${evt}</span>
                         </label>
                      </div>
                   `).join('')}
                </div>
              </div>`;
        }
    } else {
        eventHtml += '<div class="placeholder" style="padding:5px;">Event Manager not loaded</div>';
    }
    eventHtml += '</div>';
    const eventListenerHeader = createCollapsible(i18n ? i18n.t('source.event_listener_breakpoints') : 'Event Listener Breakpoints', eventHtml);

    container.innerHTML = `
      <div class="source-main-content" id="source-main-content">
        <div class="source-file-panel" id="source-file-panel">
          <div class="source-top-bar" id="source-file-tabs">
            <div class="source-tabs-wrapper">
              <button class="source-top-btn active" data-cat="page">Page</button>
              <button class="source-top-btn" data-cat="images">Images</button>
              <button class="source-top-btn" data-cat="videos">Videos</button>
              <button class="source-top-btn" data-cat="musics">Musics</button>
              <button class="source-top-btn" data-cat="docs">Docs</button>
              <button class="source-top-btn" data-cat="others">Others</button>
            </div>
          </div>
          <div class="source-file-panel-content" id="source-page-tree-container"></div>
        </div>
        
        <div class="source-v-splitter" id="source-main-v-splitter"></div>
        
        <div class="source-editor-wrapper">
          <div class="source-editor-tab-bar" id="source-editor-tab-bar"></div>
          <div class="source-editor-panel" id="source-editor-panel">
            <div id="source-editor-code-container" style="height:100%;"></div> 
            <div class="source-editor-placeholder" id="source-editor-placeholder">
              <p>${i18n ? i18n.t('source.select_file') : 'Select a file to view'}</p>
            </div>
            <div id="source-media-preview">
                <div id="source-media-content"></div>
                <div class="media-preview-info" id="source-media-info"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="source-debug-drawer" id="source-debug-drawer">
        <div class="source-debug-header" id="source-debug-header">
          <button style="display:none;" class="source-debug-btn" id="run-script-btn" title="${i18n ? i18n.t('source.run_script') : 'Run Script'}">${SVGs.resume}</button> 
          <button class="source-debug-btn" id="pause-resume-btn" title="${i18n ? i18n.t('source.pause_resume') : 'Pause/Resume'}">${SVGs.pause}</button>
          <button class="source-debug-btn" id="toggle-instrument-btn" title="${i18n ? i18n.t('source.instrumentation_enable') : 'Instrumentation'}">${recordIcon}</button>
          <div style="width:1px; height:16px; background:var(--dt-border-color); margin:0 8px;"></div>
          <button class="source-debug-btn" id="step-over-btn" title="${i18n ? i18n.t('source.step_over') : 'Step Over'}">${SVGs.stepOver}</button>
          <button class="source-debug-btn" id="step-into-btn" title="${i18n ? i18n.t('source.step_into') : 'Step Into'}">${SVGs.stepInto}</button>
          <button class="source-debug-btn" id="step-out-btn" title="${i18n ? i18n.t('source.step_out') : 'Step Out'}">${SVGs.stepOut}</button>
        </div>

        <div class="source-debug-content" id="source-debug-content">
          <div class="source-debug-nav" id="source-debug-nav-panel">
            <div class="collapsible-section">
              <div class="collapsible-header open">
                <svg class="toggle" viewBox="0 0 24 24" fill="var(--dt-text-secondary)"><path d="M7 10l5 5 5-5z"></path></svg>
                <span>Breakpoints</span>
              </div>
              <div class="collapsible-content" id="breakpoint-panel-content"></div>
            </div>
            ${createCollapsible(i18n ? i18n.t('source.call_stack') : "Call Stack", `<div class="placeholder" id="content-CallStack">${i18n ? i18n.t('source.not_paused') : 'Not paused'}</div>`)}
            ${xhrHeader}
            ${eventListenerHeader}
            ${createCollapsible(i18n ? i18n.t('source.dom_breakpoints') : "DOM Breakpoints", `<div class="placeholder">${noBpText}</div>`)}
          </div>
          <div class="source-v-splitter" id="source-drawer-v-splitter"></div>
          <div class="source-debug-watch" id="source-debug-watch-panel">
            <div class="source-watch-tabs">
                <button class="source-watch-tab active" data-tab="scope">${i18n ? i18n.t('source.scope') : 'Scope'}</button>
                <button class="source-watch-tab" data-tab="watch">${i18n ? i18n.t('source.watch') : 'Watch'}</button>
            </div>
            <div class="source-watch-toolbar" style="display: none;">
                <button class="watch-tool-btn" id="watch-add-btn" title="${i18n ? i18n.t('source.add') : 'Add'}">${SVGs.add}</button>
                <button class="watch-tool-btn" id="watch-refresh-btn" title="${i18n ? i18n.t('source.refresh') : 'Refresh'}">${SVGs.refresh}</button>
            </div>
            <div class="source-watch-content">
                <div class="source-watch-page active" id="watch-tab-scope">
                   ${createCollapsible(i18n ? i18n.t('source.scope_local') : "Local", `<div class="placeholder">${i18n ? i18n.t('source.empty') : '(empty)'}</div>`, null, "content-Local")}
                </div>
                <div class="source-watch-page" id="watch-tab-watch">
                   <div class="placeholder">${i18n ? i18n.t('source.no_watch_expr') : 'No watch expressions'}</div>
                </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function createCollapsible(title, content, actionIcon = null, customId = null) {
    const iconHtml = actionIcon ? `<div class="actions header-action-btn">${actionIcon}</div>` : '';
    const safeTitle = title.replace(/[\/\s\(\)]/g, '');
    const id = customId || `content-${safeTitle}`; 
    return `
      <div class="collapsible-section">
        <div class="collapsible-header open" data-target-id="${id}"> 
          ${SVGs.collapse ? `<svg class="toggle" viewBox="0 0 24 24" fill="var(--dt-text-secondary)" style="transform: rotate(0deg);"><path d="M7 10l5 5 5-5z"></path></svg>` : ''}
          <span>${title}</span>
          ${iconHtml}
        </div>
        <div class="collapsible-content" id="${id}"> ${content} </div>
      </div>
    `;
  }

  function cacheDOMElements() {
    mainContent = container.querySelector('#source-main-content');
    filePanel = container.querySelector('#source-file-panel');
    editorPanel = container.querySelector('#source-editor-panel');
    editorPlaceholder = container.querySelector('#source-editor-placeholder');
    mediaPreviewPanel = container.querySelector('#source-media-preview');
    mediaContentEl = container.querySelector('#source-media-content');
    mediaInfoEl = container.querySelector('#source-media-info');
    tabBar = container.querySelector('#source-editor-tab-bar');
    pageTreeContainer = container.querySelector('#source-page-tree-container');
    fileTabsBar = container.querySelector('#source-file-tabs');
    debugDrawer = container.querySelector('#source-debug-drawer');
    debugContent = container.querySelector('#source-debug-content');
    debugNavPanel = container.querySelector('#source-debug-nav-panel');
    debugWatchPanel = container.querySelector('#source-debug-watch-panel');
    scopePanel = container.querySelector('#watch-tab-scope');
    breakpointPanelContent = container.querySelector('#breakpoint-panel-content');
    runScriptBtn = container.querySelector('#run-script-btn');
    toggleInstrumentBtn = container.querySelector('#toggle-instrument-btn'); 
    pauseResumeBtn = container.querySelector('#pause-resume-btn');
    stepOverBtn = container.querySelector('#step-over-btn');
    stepIntoBtn = container.querySelector('#step-into-btn'); 
    stepOutBtn = container.querySelector('#step-out-btn');
  }
  
  function openFile(url, lineNumber = null) {
    if (!url) return;
    const exists = openFiles.find(f => f.url === url);
    if (!exists) {
      const name = url.substring(url.lastIndexOf('/') + 1) || 'unknown';
      openFiles.push({ url, name });
      renderTabs(); 
    }
    setActiveFile(url, lineNumber);
  }

  // Passes lineNumber to showCodeEditor
  function setActiveFile(url, lineNumber = null) {
    activeFileUrl = url;
    
    const tabs = tabBar.querySelectorAll('.editor-tab');
    tabs.forEach(tab => {
      if (tab.dataset.url === url) tab.classList.add('active');
      else tab.classList.remove('active');
    });

    const type = getFileType(url);
    if (['image', 'video', 'audio', 'stream', 'chunk'].includes(type)) {
        showMediaPreview(url, type);
    } else {
        showCodeEditor(url, lineNumber);
    }
    
    SourcePageTree.selectFile(url);
  }
  
  function getFileType(url) {
      const ext = url.split('.').pop().split('?')[0].toLowerCase();
      if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext)) return 'image';
      if (['mp4', 'webm', 'ogg', 'mov', 'mkv'].includes(ext)) return 'video';
      if (['mp3', 'wav', 'm4a'].includes(ext)) return 'audio';
      if (['m3u8', 'mpd'].includes(ext)) return 'stream';
      if (['ts', 'm4s'].includes(ext)) return 'chunk';
      return 'code';
  }

  async function showMediaPreview(url, type) {
      editorPanel.querySelector('#source-editor-code-container').style.display = 'none';
      editorPlaceholder.style.display = 'none';
      
      mediaPreviewPanel.classList.add('active');
      mediaContentEl.innerHTML = '';
      mediaInfoEl.innerHTML = ''; 

      const fileName = url.substring(url.lastIndexOf('/') + 1).split('?')[0];

      if (type === 'video') {
          const video = document.createElement('video');
          video.src = url;
          video.controls = true;
          video.className = 'media-preview-content';
          mediaContentEl.appendChild(video);
          
          mediaInfoEl.innerHTML = `
            <strong>${fileName}</strong>
            <button class="source-debug-btn active" id="media-download-btn" style="margin-top:5px; padding: 4px 8px; border:1px solid var(--dt-border-color); background:var(--dt-bg-secondary); cursor:pointer;">
               ${SVGs.download || '⬇'} Download
            </button>
            <div style="font-size:11px; color:var(--dt-text-secondary); margin-top:2px;">${url}</div>
          `;
          
          const dlBtn = container.querySelector('#media-download-btn');
          if (dlBtn) dlBtn.onclick = () => downloadFile(url, fileName);
          attachContextMenu(video, url, type);
      } 
      else if (type === 'stream') {
          let details = 'Loading info...';
          try {
              const res = await fetch(url);
              const text = await res.text();
              const variants = (text.match(/#EXT-X-STREAM-INF/g) || []).length;
              const segments = (text.match(/#EXTINF/g) || []).length;
              const isMaster = variants > 0;
              
              details = `
                <div class="playlist-inspector" style="padding:10px; border:1px solid var(--dt-border-color); border-radius:4px; margin-top:10px; background:var(--dt-bg-secondary);">
                    <div class="pi-row"><strong>Type:</strong> ${isMaster ? 'Master Playlist (Adaptive)' : 'Media Playlist'}</div>
                    <div class="pi-row"><strong>Quality Variants:</strong> ${variants}</div>
                    <div class="pi-row"><strong>Segments:</strong> ${segments}</div>
                    <div class="pi-row" style="margin-top:10px; display:flex; gap:5px;">
                        <input type="text" value="${url}" readonly class="pi-url-input" style="flex:1; padding:4px; border:1px solid var(--dt-border-color); border-radius:3px; background:var(--dt-bg-primary); color:var(--dt-text-primary);" />
                        <button class="pi-copy-btn" style="padding:4px 8px; cursor:pointer;">Copy</button>
                    </div>
                    <div class="pi-hint" style="margin-top:10px; color:orange; font-size:12px;">
                        ⚠️ Streamed media detected (HLS/DASH). <br>
                        Direct download not available. Use an external downloader (e.g. 1DM).
                    </div>
                </div>
              `;
          } catch(e) {
              details = '<div style="color:red; margin-top:10px;">Failed to load manifest info. (CORS or Network Error)</div>';
          }

          mediaContentEl.innerHTML = `<div style="font-size:50px; text-align:center; padding:20px;">📡</div>`; 
          mediaInfoEl.innerHTML = `<strong>${fileName}</strong>${details}`;
          
          const copyBtn = mediaInfoEl.querySelector('.pi-copy-btn');
          if(copyBtn) {
              copyBtn.onclick = () => {
                  navigator.clipboard.writeText(url);
                  copyBtn.textContent = 'Copied!';
                  setTimeout(()=> copyBtn.textContent='Copy', 1500);
              };
          }
      }
      else if (type === 'chunk') {
          mediaContentEl.innerHTML = `<div style="font-size:50px; text-align:center; padding:20px;">📦</div>`;
          mediaInfoEl.innerHTML = `
            <strong>${fileName}</strong>
            <div style="color:var(--dt-text-secondary); margin-top:5px; font-size:12px;">
                Stream Segment (Chunk). <br>
                Merging requires external tools.
            </div>
            <button class="source-debug-btn" id="chunk-download-btn" style="margin-top:10px; padding:4px 8px; cursor:pointer;">Download Chunk</button>
          `;
          const dlBtn = container.querySelector('#chunk-download-btn');
          if (dlBtn) dlBtn.onclick = () => downloadFile(url, fileName);
      }
      else if (type === 'image') {
          const img = document.createElement('img');
          img.src = url;
          img.className = 'media-preview-content';
          mediaContentEl.appendChild(img);
          mediaInfoEl.innerHTML = `<strong>${fileName}</strong><div style="font-size:11px; color:var(--dt-text-secondary);">${url}</div>`;
          attachContextMenu(img, url, type);
      }
      else if (type === 'audio') {
          const audio = document.createElement('audio');
          audio.src = url;
          audio.controls = true;
          audio.style.marginTop = '20px';
          mediaContentEl.appendChild(audio);
          mediaInfoEl.innerHTML = `<strong>${fileName}</strong><div style="font-size:11px; color:var(--dt-text-secondary);">${url}</div>`;
          attachContextMenu(audio, url, type);
      }
  }

  // Handles Await & Highlight
  async function showCodeEditor(url, lineNumber = null) {
      mediaPreviewPanel.classList.remove('active');
      editorPanel.querySelector('#source-editor-code-container').style.display = 'block';
      
      await SourceEditor.showFileContent(url);
      
      // Highlight Line if provided
      if (lineNumber !== null) {
          // CodeMirror uses 0-indexed lines, Stack trace usually 1-indexed
          SourceEditor.highlightLine(lineNumber - 1);
          SourceEditor.flashLine(lineNumber - 1);
      }
  }
  
  function closeFile(url, event) {
    if (event) event.stopPropagation();
    const index = openFiles.findIndex(f => f.url === url);
    if (index === -1) return;
    openFiles.splice(index, 1);
    if (activeFileUrl === url) {
      if (openFiles.length > 0) {
        const nextFile = openFiles[Math.max(0, index - 1)];
        setActiveFile(nextFile.url);
      } else {
        activeFileUrl = null;
        editorPanel.querySelector('.CodeMirror').parentElement.style.display = 'none'; 
        editorPlaceholder.style.display = 'flex';
        mediaPreviewPanel.classList.remove('active');
      }
    }
    renderTabs(); 
  }
  
  function renderTabs() {
    tabBar.innerHTML = '';
    openFiles.forEach(file => {
      const tab = document.createElement('div');
      tab.className = `editor-tab ${file.url === activeFileUrl ? 'active' : ''}`;
      tab.dataset.url = file.url;
      const nameSpan = document.createElement('span');
      nameSpan.className = 'editor-tab-name';
      nameSpan.textContent = file.name;
      nameSpan.title = file.url; 
      const closeBtn = document.createElement('div');
      closeBtn.className = 'editor-tab-close';
      closeBtn.innerHTML = '×'; 
      closeBtn.title = 'Close';
      tab.onclick = () => setActiveFile(file.url);
      closeBtn.onclick = (e) => closeFile(file.url, e);
      tab.appendChild(nameSpan);
      tab.appendChild(closeBtn);
      tabBar.appendChild(tab);
    });
  }

  function attachListeners() {
    fileTabsBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.source-top-btn');
        if (!btn) return;
        fileTabsBar.querySelectorAll('.source-top-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        if (window.MyDevTool.SourcePageTree.setCategory) {
            window.MyDevTool.SourcePageTree.setCategory(cat);
        }
    });

    pageTreeContainer.addEventListener('click', (e) => {
        const item = e.target.closest('.source-file-tree-item');
        if (!item) return;
        if (item.nextElementSibling && item.nextElementSibling.tagName === 'UL') {
             item.classList.toggle('open');
             item.nextElementSibling.style.display = item.classList.contains('open') ? 'block' : 'none';
             return;
        }
        const url = item.dataset.url;
        if (url) openFile(url); 
    });
    
    pageTreeContainer.addEventListener('contextmenu', (e) => handleTreeContextMenu(e));
    
    let timer;
    pageTreeContainer.addEventListener('touchstart', (e) => {
        const item = e.target.closest('.source-file-tree-item');
        if (!item || !item.dataset.url) return;
        timer = setTimeout(() => handleTreeContextMenu(e), 600);
    }, {passive: true});
    pageTreeContainer.addEventListener('touchend', () => clearTimeout(timer));
    pageTreeContainer.addEventListener('touchmove', () => clearTimeout(timer));

    container.querySelector('.source-watch-tabs').addEventListener('click', (e) => {
        const tabButton = e.target.closest('.source-watch-tab');
        if (!tabButton) return;
        const tabName = tabButton.dataset.tab;
        container.querySelectorAll('.source-watch-tab').forEach(btn => btn.classList.remove('active'));
        tabButton.classList.add('active');
        container.querySelectorAll('.source-watch-page').forEach(page => page.classList.remove('active'));
        container.querySelector(`#watch-tab-${tabName}`).classList.add('active');
        const toolbar = container.querySelector('.source-watch-toolbar');
        toolbar.style.display = (tabName === 'watch') ? 'flex' : 'none';
    });

    const watchAddBtn = container.querySelector('#watch-add-btn');
    const watchRefreshBtn = container.querySelector('#watch-refresh-btn');
    if (watchAddBtn) watchAddBtn.addEventListener('click', () => { if (window.MyDevTool.WatchManager) window.MyDevTool.WatchManager.showInput(); });
    if (watchRefreshBtn) watchRefreshBtn.addEventListener('click', () => { if (window.MyDevTool.WatchManager) window.MyDevTool.WatchManager.refresh(); });
    
    const xhrHeader = container.querySelector('[data-target-id^="content-XHRfetch"]');
    if (xhrHeader) {
        const addBtn = xhrHeader.querySelector('.header-action-btn');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                if (!xhrHeader.classList.contains('open')) xhrHeader.click(); 
                showXHRInput();
            });
        }
    }

    attachSplitterLogic();
    attachDebugControls();
    attachBreakpointPanelLogic();
  }
  
  function attachContextMenu(element, url, type) {
      const handler = (e) => {
          if(e.cancelable) e.preventDefault(); 
          e.stopPropagation();
          showSaveMenu(e, url);
      };
      element.addEventListener('contextmenu', handler);
      
      let timer;
      element.addEventListener('touchstart', (e) => {
          timer = setTimeout(() => handler(e), 600);
      }, {passive: true});
      element.addEventListener('touchend', () => clearTimeout(timer));
  }

  function handleTreeContextMenu(e) {
      const item = e.target.closest('.source-file-tree-item');
      if (!item || !item.dataset.url) return;
      if(e.cancelable) e.preventDefault();
      showSaveMenu(e, item.dataset.url);
  }

  function showSaveMenu(e, url) {
      const i18n = window.MyDevTool.LanguageManager;
      const fileName = url.substring(url.lastIndexOf('/') + 1) || 'file';
      
      const options = [
          {
              label: i18n ? i18n.t('source.save') : 'Save (Force Download)',
              callback: () => downloadFile(url, fileName) 
          },
          { type: 'separator' },
          {
              label: i18n ? i18n.t('source.open_tab') : 'Open in New Tab',
              callback: () => window.open(url, '_blank')
          },
          {
              label: i18n ? i18n.t('source.copy_link') : 'Copy Link Address',
              callback: () => navigator.clipboard.writeText(url)
          }
      ];
      
      const evt = (e.touches && e.touches[0]) ? e.touches[0] : e;
      if (window.MyDevTool.ContextMenu) {
          window.MyDevTool.ContextMenu.show({ 
              clientX: evt.clientX, 
              clientY: evt.clientY, 
              preventDefault: () => {},
              stopPropagation: () => {} 
          }, options);
      }
  }
  
  async function downloadFile(url, fileName) {
      try {
          const response = await fetch(url);
          if (!response.ok) throw new Error('Download failed');
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      } catch (error) {
          window.open(url, '_blank');
      }
  }

  function attachSplitterLogic() {
    const mainVSplitter = container.querySelector('#source-main-v-splitter');
    attachDragHandler(mainVSplitter, (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const containerRect = mainContent.getBoundingClientRect();
      const newFilePanelWidth = clientX - containerRect.left;
      if (newFilePanelWidth > 100 && newFilePanelWidth < (containerRect.width - 100)) {
        filePanel.style.width = `${newFilePanelWidth}px`;
        mainVSplitter.style.left = `${newFilePanelWidth}px`;
      }
    });
    const drawerVSplitter = container.querySelector('#source-drawer-v-splitter');
    attachDragHandler(drawerVSplitter, (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const containerRect = debugContent.getBoundingClientRect();
      const newNavWidth = clientX - containerRect.left;
      if (newNavWidth > 100 && newNavWidth < (containerRect.width - 100)) {
        debugNavPanel.style.width = `${newNavWidth}px`;
        drawerVSplitter.style.left = `${newNavWidth}px`;
      }
    });
    attachDragHandler(container.querySelector('#source-debug-header'), (e) => {
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const containerRect = container.getBoundingClientRect();
      const newDrawerHeight = containerRect.bottom - clientY;
      if (newDrawerHeight > 100 && newDrawerHeight < (containerRect.height - 100)) {
        debugDrawer.style.height = `${newDrawerHeight}px`;
      }
    });
  }

  function attachDebugControls() {
    container.addEventListener('click', (e) => {
      const header = e.target.closest('.collapsible-header');
      if (!header || header.closest('#watch-tab-scope') || e.target.closest('.header-action-btn')) return;
      if (header.classList.contains('evt-category-header')) return;

      const content = header.nextElementSibling;
      if (content) {
        header.classList.toggle('open');
        content.classList.toggle('hidden');
        const toggleIcon = header.querySelector('.toggle');
        if (toggleIcon) toggleIcon.style.transform = header.classList.contains('open') ? 'rotate(0deg)' : 'rotate(-90deg)';
      }
    });
    
    pauseResumeBtn.addEventListener('click', () => {
      const state = SourceDebugger.getState();
      if (state.isPaused) SourceDebugger.resume();
      else SourceDebugger.requestPause();
    });
    if (stepOverBtn) stepOverBtn.addEventListener('click', () => SourceDebugger.stepOver());
    if (stepIntoBtn) stepIntoBtn.addEventListener('click', () => SourceDebugger.stepInto());
    if (stepOutBtn) stepOutBtn.addEventListener('click', () => SourceDebugger.stepOut());
    
    runScriptBtn.addEventListener('click', async () => {
      const i18n = window.MyDevTool.LanguageManager;
      const { url } = SourceEditor.getCurrentContent(); 
      if (!url) { alert(i18n ? i18n.t('source.no_file_open') : "No file opened."); return; }
      if (!url.endsWith('.js')) { alert(i18n ? i18n.t('source.only_js') : "Only .js files can be run."); return; }
      let originalCode;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed`);
        originalCode = await response.text();
      } catch (e) { alert(`${i18n ? i18n.t('source.failed_fetch') : 'Failed to fetch'}: ${e.message}`); return; }
      const instrumenter = window.MyDevTool.SourceInstrumenter;
      let codeToRun = originalCode;
      if (instrumenter) codeToRun = instrumenter.instrument(originalCode, url); 
      const engine = window.MyDevTool.ConsoleEngine;
      if (engine) engine.evaluate(codeToRun, 'page'); 
      if (showSelfCallback) showSelfCallback('console');
    });

    toggleInstrumentBtn.addEventListener('click', async () => {
      const i18n = window.MyDevTool.LanguageManager;
      if (!SWManager) { alert(i18n ? i18n.t('source.sw_manager_missing') : 'SWManager not loaded!'); return; }
      const currentlyEnabled = SWManager.isEnabled();
      const newState = !currentlyEnabled;
      await SWManager.setEnabled(newState);
      localStorage.setItem('devtool-instrumentation-enabled', newState.toString());
      updateInstrumentationToggleUI(newState);
      if (newState) {
        SWManager.syncBreakpoints(BreakpointManager.getAllBreakpoints());
        setTimeout(() => window.location.reload(true), 3000);
        alert(i18n ? i18n.t('source.enabled_reload') : "✅ Enabled! Reloading in 3s...");
      } else {
        localStorage.setItem('devtool-instrumentation-enabled', 'false');
        setTimeout(() => window.location.reload(true), 1000);
        alert(i18n ? i18n.t('source.disabled_reload') : "❌ Disabled. Reloading in 1s...");
      }
    });
  }

  function attachBreakpointPanelLogic() {
    breakpointPanelContent.addEventListener('click', (e) => {
      const header = e.target.closest('.bp-file-header');
      const entry = e.target.closest('.bp-entry');
      const removeBtn = e.target.closest('.bp-remove');
      if (removeBtn) {
        e.stopPropagation(); 
        const bpEntry = removeBtn.closest('.bp-entry');
        const url = bpEntry.dataset.url;
        const line = parseInt(bpEntry.dataset.line, 10);
        BreakpointManager.toggleBreakpoint(url, line); 
      } else if (header) {
        header.classList.toggle('open');
        const entries = header.nextElementSibling;
        const toggleIcon = header.querySelector('.toggle');
        if (entries) entries.style.display = header.classList.contains('open') ? 'block' : 'none';
        if (toggleIcon) toggleIcon.style.transform = header.classList.contains('open') ? 'rotate(0deg)' : 'rotate(-90deg)';
      } else if (entry) {
        if (e.target.tagName === 'INPUT') return;
        const url = entry.dataset.url;
        const line = parseInt(entry.dataset.line);
        openFile(url); 
        setTimeout(() => { SourceEditor.highlightLine(line); SourceEditor.flashLine(line); }, 200);
      }
    });

    breakpointPanelContent.addEventListener('change', (e) => {
      const target = e.target;
      const manager = window.MyDevTool.SourceBreakpointManager;
      if (!manager) return;

      const bpToggle = target.closest('.bp-toggle');
      if (bpToggle) {
          const entry = bpToggle.closest('.bp-entry');
          const url = entry.dataset.url;
          const line = parseInt(entry.dataset.line, 10);
          manager.setBreakpointEnabled(url, line, target.checked);
          return;
      }
      if (target.classList.contains('bp-exc-uncaught')) {
          const caught = breakpointPanelContent.querySelector('.bp-exc-caught').checked;
          manager.setExceptionBreakpoints(target.checked, caught);
          return;
      }
      if (target.classList.contains('bp-exc-caught')) {
          const uncaught = breakpointPanelContent.querySelector('.bp-exc-uncaught').checked;
          manager.setExceptionBreakpoints(uncaught, target.checked);
          return;
      }
    });
  }

  function updateBreakpointPanel(allBreakpoints) {
    const i18n = window.MyDevTool.LanguageManager;
    if (!breakpointPanelContent) return;

    const manager = window.MyDevTool.SourceBreakpointManager;
    const isUncaught = manager ? manager.shouldPauseOnUncaught() : false;
    const isCaught = manager ? manager.shouldPauseOnCaught() : false;

    const groups = {};
    allBreakpoints.forEach(bp => {
      if (!groups[bp.url]) { groups[bp.url] = { name: bp.name, breakpoints: [] }; }
      groups[bp.url].breakpoints.push(bp);
    });
    
    const uncaughtLabel = i18n ? i18n.t('source.uncaught_ex') : 'Pause on uncaught exceptions';
    const caughtLabel = i18n ? i18n.t('source.caught_ex') : 'Pause on caught exceptions';
    const noBpLabel = i18n ? i18n.t('source.no_breakpoints') : 'No breakpoints';
    let html = `
      <div class="bp-exceptions">
        <label>
            <input type="checkbox" class="bp-exc-uncaught" ${isUncaught ? 'checked' : ''}> ${uncaughtLabel}
        </label>
        <label>
            <input type="checkbox" class="bp-exc-caught" ${isCaught ? 'checked' : ''}> ${caughtLabel}
        </label>
      </div>`;
      
    if (Object.keys(groups).length === 0) {
      breakpointPanelContent.innerHTML = html + `<div class="placeholder">${noBpLabel}</div>`;
      return;
    }

    for (const url in groups) {
      const group = groups[url];
      html += `<hr class="bp-hr">`;
      html += `<div class="bp-list-group">`;
      html += `
        <div class="bp-file-header open" data-url="${url}">
          <svg class="toggle" viewBox="0 0 24 24" style="transform: rotate(0deg);"><path d="M7 10l5 5 5-5z"></path></svg>
          <span class="bp-file-icon">${SVGs.file}</span>
          <span class="bp-file-name">${group.name}</span>
        </div>`;
      html += `<div class="bp-file-entries">`;
      group.breakpoints.sort((a, b) => a.lineNumber - b.lineNumber);
      group.breakpoints.forEach(bp => {
        const lineText = bp.content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        html += `
          <div class="bp-entry ${bp.enabled ? '' : 'disabled'}" data-url="${bp.url}" data-line="${bp.lineNumber}">
            <input type="checkbox" class="bp-toggle" ${bp.enabled ? 'checked' : ''}>
            <span class="bp-line-content" title="${lineText}">${lineText}</span>
            <span class="line-number">${bp.lineNumber + 1}</span>
            <span class="bp-remove" title="Remove">✕</span>
          </div>`;
      });
      html += `</div></div>`;
    }
    breakpointPanelContent.innerHTML = html;
    const currentEditorFile = SourceEditor.getCurrentContent().url;
    if (groups[currentEditorFile]) { SourceEditor.updateGutterMarkers(); }
  }

  async function updateDebuggerUI(state) {
    const i18n = window.MyDevTool.LanguageManager;
    const callStackPanel = container.querySelector('#content-CallStack');
    if (!pauseResumeBtn) return; 

    if (state.isPaused) {
      if (showSelfCallback) showSelfCallback();
      pauseResumeBtn.innerHTML = SVGs.resume;
      pauseResumeBtn.title = i18n ? i18n.t('source.resume') : "Resume script execution (F8)";
      if (SWManager.isEnabled()) SWManager.syncBreakpoints(BreakpointManager.getAllBreakpoints());
      if (window.MyDevTool.WatchManager) window.MyDevTool.WatchManager.update();
      
      openFile(state.currentFile);
      if (getFileType(state.currentFile) === 'code') {
          setTimeout(() => { SourceEditor.highlightLine(state.currentLine); }, 200);
      }
      
      if (callStackPanel) {
        if (state.callStack.length > 0) {
          callStackPanel.innerHTML = '';
          state.callStack.forEach(frame => {
            const frameEl = document.createElement('div');
            frameEl.className = 'callstack-entry';
            frameEl.innerHTML = `<span class="function-name">${frame.name}</span><span class="file-location">${frame.file}:${frame.line}</span>`;
            callStackPanel.appendChild(frameEl);
          });
        } else {
          callStackPanel.innerHTML = `<div class="placeholder">${i18n ? i18n.t('source.empty') : '(empty stack)'}</div>`;
        }
      }
    } else {
      pauseResumeBtn.innerHTML = SVGs.pause;
      pauseResumeBtn.title = i18n ? i18n.t('source.pause_resume') : "Pause script execution";
      SourceEditor.clearHighlight();
      if (callStackPanel) callStackPanel.innerHTML = `<div class="placeholder">${i18n ? i18n.t('source.not_paused') : 'Not paused'}</div>`;
    }
  }

  function updateInstrumentationToggleUI(isEnabled) {
    const i18n = window.MyDevTool.LanguageManager;
    if (!toggleInstrumentBtn) return;
    const recordIcon = SVGs.record || '●';
    const stopIcon = SVGs.stop || '■';
    if (isEnabled) {
      toggleInstrumentBtn.classList.add('active'); 
      toggleInstrumentBtn.innerHTML = stopIcon; 
      toggleInstrumentBtn.title = "Instrumentation Enabled. Click to disable (Reload required).";
    } else {
      toggleInstrumentBtn.classList.remove('active');
      toggleInstrumentBtn.innerHTML = recordIcon; 
      toggleInstrumentBtn.title = "Instrumentation Disabled. Click to enable (Reload required).";
    }
  }

  function showXHRInput() {
    const i18n = window.MyDevTool.LanguageManager;
    const list = container.querySelector('#xhr-breakpoints-list');
    if (!list) return;
    if (list.querySelector('.xhr-input-row')) { list.querySelector('input').focus(); return; }
    const row = document.createElement('div');
    row.className = 'xhr-input-row';
    row.innerHTML = `<input type="text" placeholder="${i18n ? i18n.t('source.url_contains') : 'URL contains...'}" class="bp-input"/>`;
    const input = row.querySelector('input');
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const val = input.value.trim();
            if (val && window.MyDevTool.NetworkInterceptor) {
                window.MyDevTool.NetworkInterceptor.addXHRBreakpoint(val);
                renderXHRBreakpoints();
            }
            row.remove();
        } else if (e.key === 'Escape') { row.remove(); }
    });
    list.insertBefore(row, list.firstChild);
    input.focus();
  }

  function renderXHRBreakpoints() {
    const list = container.querySelector('#xhr-breakpoints-list');
    if (!list) return;
    let bps = [];
    if (window.MyDevTool.NetworkInterceptor) bps = window.MyDevTool.NetworkInterceptor.getXHRBreakpoints();
    list.innerHTML = '';
    if (bps.length === 0) { list.innerHTML = `<div class="placeholder">No breakpoints</div>`; return; }
    bps.forEach(bp => {
        const row = document.createElement('div');
        row.className = 'bp-entry'; 
        row.innerHTML = `
           <label style="display:flex; align-items:center; flex-grow:1;">
             <input type="checkbox" class="xhr-toggle" ${bp.enabled ? 'checked' : ''}>
             <span class="bp-line-content" style="margin-left:5px">URL contains "${bp.pattern}"</span>
           </label>
           <span class="bp-remove" style="cursor:pointer;">×</span>`;
        row.querySelector('.xhr-toggle').addEventListener('change', (e) => {
            window.MyDevTool.NetworkInterceptor.toggleXHRBreakpoint(bp.pattern, e.target.checked);
        });
        row.querySelector('.bp-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            window.MyDevTool.NetworkInterceptor.removeXHRBreakpoint(bp.pattern);
            renderXHRBreakpoints();
        });
        list.appendChild(row);
    });
  }
  
  function attachDragHandler(element, onDrag) {
    const onMove = (e) => { e.preventDefault(); e.stopPropagation(); onDrag(e); };
    const onStop = () => { 
        window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onStop); 
        window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onStop); 
        document.body.style.cursor = ''; 
    };
    const onStart = (e) => {
      if (e.target.closest('button, .source-debug-btn')) return;
      e.preventDefault(); e.stopPropagation();
      document.body.style.cursor = window.getComputedStyle(element).cursor;
      window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onStop);
      window.addEventListener('touchmove', onMove, { passive: false }); window.addEventListener('touchend', onStop);
    };
    element.addEventListener('pointerdown', onStart);
    element.addEventListener('touchstart', onStart, { passive: false });
  }

  return { init: init, openFile: openFile };
})();