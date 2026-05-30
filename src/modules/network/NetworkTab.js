// src/modules/network/NetworkTab.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.NetworkTab = (function () {
  
  let SVGs = null;
  let NetworkLog = null;
  let NetworkDetails = null;
  let NetworkTiming = null;
  let NetworkOverview = null; 

  let container = null;
  let shadowRoot = null;
  let recordBtn = null;
  let clearBtn = null;
  let requestListPane = null; 
  let requestListBody = null; 
  let requestTbody = null;
  let detailsPane = null;
  let filterBar = null;
  let settingsPopup = null;
  
  let tooltipEl = null;
  let tooltipCanvas = null;
  let tooltipCtx = null;

  let filterInput = null;
  let invertCheckbox = null;
  let hideDataURLsCheckbox = null;
  
  let timelineHeader = null; 
  let heightResizeHandle = null;
  let overviewContainer = null; 

  let preserveLogCheckbox = null;
  let disableCacheCheckbox = null; 
  let largeRowsCheckbox = null;
  let showOverviewCheckbox = null;

  let settings = {
    preserveLog: false,
    disableCache: false, 
    useLargeRows: false,
    groupByFrame: false,
    showOverview: true, 
    captureScreenshots: false
  };

  let currentFilters = {
    text: '',
    type: 'all',
    invert: false,
    hideDataURLs: false,
    thirdParty: false,
    timeRange: null 
  };

  const COLORS = {
    blocked: '#b0b0b0',
    dns: '#009688',
    connect: '#FF9800',
    ssl: '#9C27B0',
    ttfb: '#00C853',
    download: '#4285F4'
  };

  function init(containerEl, shadowRootEl, logModule, detailsModule, timingModule, overviewModule) {
    SVGs = window.MyDevTool.SVGs;
    container = containerEl;
    shadowRoot = shadowRootEl;
    NetworkLog = logModule;
    NetworkDetails = detailsModule;
    NetworkTiming = timingModule;
    NetworkOverview = overviewModule; 

    buildUI();
    cacheDOMElements();
    attachListeners();
    subscribeToLogEvents();
    
    NetworkTiming.init(NetworkLog); 
    NetworkOverview.init(overviewContainer, NetworkLog); 
    
    NetworkOverview.subscribe('onTimeRangeSelected', handleTimeRangeFilter);

    updateRecordingState(NetworkLog.isRecording());
    updateRequestList(NetworkLog.getRequests());
  }

  function buildUI() {
    const i18n = window.MyDevTool.LanguageManager; 

    container.innerHTML = `
      <div class="network-toolbar">
        <button class="network-toolbar-btn record-btn" id="network-record-btn" title="${i18n.t('network.record_btn')}">●</button>
        <button class="network-toolbar-btn" id="network-clear-btn" title="${i18n.t('network.clear_btn')}">${SVGs.clearSVG}</button>
        <div class="network-toolbar-separator"></div>
        <button class="network-toolbar-btn" id="network-toggle-filter-bar" title="${i18n.t('network.toggle_filter')}">${SVGs.filterSVG}</button>
        
        <label><input type="checkbox" id="network-preserve-log"> ${i18n.t('network.preserve_log')}</label> 
        
        <label title="${i18n.t('network.disable_cache_hint')}"><input type="checkbox" id="network-disable-cache"> ${i18n.t('network.disable_cache')}</label>
        
        <input type="text" class="filter-input" id="network-filter-input" placeholder="${i18n.t('network.filter_placeholder')}">
        <div class="network-toolbar-separator"></div>
        
        <label title="${i18n.t('network.invert')}"><input type="checkbox" id="network-filter-invert"> ${i18n.t('network.invert')}</label>
        <label title="${i18n.t('network.hide_data_urls')}"><input type="checkbox" id="network-filter-hide-data-urls"> ${i18n.t('network.hide_data_urls')}</label>
        
        <label title="${i18n.t('network.show_waterfall')}"><input type="checkbox" id="network-toggle-waterfall" checked> ${i18n.t('network.show_waterfall')}</label>

        <button class="network-toolbar-btn" id="network-settings-btn" title="${i18n.t('network.settings')}">️${SVGs.settingsSVG}</button>
      </div>

      <div class="network-filter-bar" id="network-filter-bar">
        <button class="network-filter-btn active" data-filter="all">${i18n.t('network.filters.all')}</button>
        <button class="network-filter-btn" data-filter="xhr">${i18n.t('network.filters.xhr')}</button>
        <button class="network-filter-btn" data-filter="js">${i18n.t('network.filters.js')}</button>
        <button class="network-filter-btn" data-filter="css">${i18n.t('network.filters.css')}</button>
        <button class="network-filter-btn" data-filter="img">${i18n.t('network.filters.img')}</button>
        <button class="network-filter-btn" data-filter="media">${i18n.t('network.filters.media')}</button>
        <button class="network-filter-btn" data-filter="font">${i18n.t('network.filters.font')}</button>
        <button class="network-filter-btn" data-filter="doc">${i18n.t('network.filters.doc')}</button>
        <button class="network-filter-btn" data-filter="ws">${i18n.t('network.filters.ws')}</button>
        <button class="network-filter-btn" data-filter="other">${i18n.t('network.filters.other')}</button>
        <div class="network-toolbar-separator"></div>
        <label><input type="checkbox" id="network-filter-thirdParty"> ${i18n.t('network.filters.third_party')}</label>
      </div>
      
      <div class="network-overview-container" id="network-overview-container">
        </div>

      <div class="network-request-list-wrapper" id="network-request-list-wrapper">
        <div class="network-request-list" id="network-request-list">
          <div class="network-empty-message not-recording" id="network-msg-not-recording">
            <div>${i18n.t('network.empty_msg.not_recording')}</div>
          </div>
          <div class="network-empty-message recording" id="network-msg-recording">
            <div>${i18n.t('network.empty_msg.recording')}</div>
            <div>${i18n.t('network.empty_msg.recording_desc')}</div>
          </div>

          <table class="network-request-table">
            <thead>
              <tr>
                <th class="col-name">${i18n.t('network.columns.name')}<div class="col-resizer"></div></th>
                <th class="col-status">${i18n.t('network.columns.status')}<div class="col-resizer"></div></th>
                <th class="col-type">${i18n.t('network.columns.type')}<div class="col-resizer"></div></th>
                <th class="col-initiator">${i18n.t('network.columns.initiator')}<div class="col-resizer"></div></th>
                <th class="col-size">${i18n.t('network.columns.size')}<div class="col-resizer"></div></th>
                <th class="col-time">${i18n.t('network.columns.time')}<div class="col-resizer"></div></th>
                <th class="col-timeline" id="network-timeline-header">Waterfall</th>
              </tr>
            </thead>
            <tbody id="network-request-tbody"></tbody>
          </table>
        </div>
        <div class="network-list-resize-handle" id="network-list-resize-handle"></div>
        <div class="network-details-pane hidden" id="network-details-pane">
          <div class="network-details-tabs"></div>
          <div class="network-details-content-wrapper"></div>
        </div>
      </div>
      
      <div class="network-footer" id="network-footer">
        <span id="network-status-requests">0 requests</span>
        <span id="network-status-transferred">0 B transferred</span>
        <span id="network-status-time">Finish: N/A</span>
      </div>

      <div class="network-settings-popup" id="network-settings-popup">
        <div><label><input type="checkbox" name="useLargeRows"> ${i18n.t('network.settings_popup.large_rows')}</label></div>
        <div style="display:none;"><label><input type="checkbox" name="groupByFrame"> ${i18n.t('network.settings_popup.group_frame')}</label></div>
        <div><label><input type="checkbox" name="showOverview"> ${i18n.t('network.settings_popup.show_overview')}</label></div>
        <div style="display:none;"><label><input type="checkbox" name="captureScreenshots"> ${i18n.t('network.settings_popup.capture_screenshots')}</label></div>
      </div>

      <div class="network-tooltip" id="network-waterfall-tooltip">
         <div class="tooltip-header"></div>
         <div class="tooltip-body" style="position: relative;">
             <div class="tooltip-rows-container"></div>
             <canvas class="tooltip-canvas" id="tooltip-canvas"></canvas>
         </div>
      </div>
    `;
  }

  function cacheDOMElements() {
    recordBtn = container.querySelector('#network-record-btn');
    clearBtn = container.querySelector('#network-clear-btn');
    requestListPane = container.querySelector('#network-request-list-wrapper');
    requestListBody = container.querySelector('#network-request-list');
    requestTbody = container.querySelector('#network-request-tbody');
    detailsPane = container.querySelector('#network-details-pane');
    filterBar = container.querySelector('#network-filter-bar');
    
    filterInput = container.querySelector('#network-filter-input');
    invertCheckbox = container.querySelector('#network-filter-invert');
    hideDataURLsCheckbox = container.querySelector('#network-filter-hide-data-urls');
    
    settingsPopup = container.querySelector('#network-settings-popup');
    timelineHeader = container.querySelector('#network-timeline-header');
    heightResizeHandle = container.querySelector('#network-list-resize-handle');
    overviewContainer = container.querySelector('#network-overview-container');
    
    preserveLogCheckbox = container.querySelector('#network-preserve-log');
    disableCacheCheckbox = container.querySelector('#network-disable-cache');
    
    largeRowsCheckbox = settingsPopup.querySelector('input[name="useLargeRows"]');
    showOverviewCheckbox = settingsPopup.querySelector('input[name="showOverview"]');

    tooltipEl = container.querySelector('#network-waterfall-tooltip');
    tooltipCanvas = container.querySelector('#tooltip-canvas');
    tooltipCtx = tooltipCanvas.getContext('2d');
  }

  function attachListeners() {
    recordBtn.onclick = () => NetworkLog.toggleRecording();
    clearBtn.onclick = () => NetworkLog.clearRequests();
    
    preserveLogCheckbox.onchange = (e) => settings.preserveLog = e.target.checked;
    preserveLogCheckbox.checked = settings.preserveLog;

    disableCacheCheckbox.onchange = (e) => {
      settings.disableCache = e.target.checked;
      if (window.MyDevTool.NetworkInterceptor) {
        window.MyDevTool.NetworkInterceptor.setDisableCache(settings.disableCache);
      }
    };
    disableCacheCheckbox.checked = settings.disableCache;

    filterInput.oninput = () => {
      currentFilters.text = filterInput.value;
      forceListUpdate();
    };

    invertCheckbox.onchange = () => {
      currentFilters.invert = invertCheckbox.checked;
      forceListUpdate();
    };
    hideDataURLsCheckbox.onchange = () => {
      currentFilters.hideDataURLs = hideDataURLsCheckbox.checked;
      forceListUpdate();
    };

    container.querySelector('#network-toggle-waterfall').onchange = (e) => {
      container.classList.toggle('waterfall-hidden', !e.target.checked);
    };

    container.querySelector('#network-toggle-filter-bar').onclick = () => {
      filterBar.classList.toggle('hidden');
    };

    filterBar.onclick = (e) => {
      const target = e.target;
      if (target.classList.contains('network-filter-btn')) {
        const oldActive = filterBar.querySelector('.network-filter-btn.active');
        if (oldActive) oldActive.classList.remove('active');
        target.classList.add('active');
        currentFilters.type = target.dataset.filter;
        forceListUpdate();
      }
    };

    filterBar.addEventListener('change', (e) => {
        if (e.target.matches('input[type="checkbox"]')) {
            if (e.target.id === 'network-filter-thirdParty') {
                currentFilters.thirdParty = e.target.checked;
            } 
            forceListUpdate();
        }
    });

    container.querySelector('#network-settings-btn').onclick = (e) => {
      e.stopPropagation();
      settingsPopup.classList.toggle('show');
    };
    shadowRoot.addEventListener('click', () => settingsPopup.classList.remove('show'), true);

    settingsPopup.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      const name = checkbox.name;
      checkbox.checked = settings[name]; 
      if (name === 'useLargeRows') container.classList.toggle('large-rows', settings.useLargeRows);
      if (name === 'showOverview') overviewContainer.classList.toggle('hidden', !settings.showOverview);

      checkbox.onchange = (e) => {
        const isChecked = e.target.checked;
        settings[name] = isChecked;
        switch (name) {
          case 'useLargeRows':
            container.classList.toggle('large-rows', isChecked);
            break;
          case 'showOverview':
            overviewContainer.classList.toggle('hidden', !isChecked);
            break;
        }
      };
    });

    requestTbody.onclick = (e) => {
      const row = e.target.closest('.request-row');
      if (row && !e.target.classList.contains('col-resizer')) { 
        const reqId = row.dataset.reqId;
        const request = NetworkLog.getRequestById(reqId);
        if (request) {
          const oldSelected = requestTbody.querySelector('.selected');
          if (oldSelected) oldSelected.classList.remove('selected');
          row.classList.add('selected');
          
          NetworkDetails.showRequest(request);
          detailsPane.classList.remove('hidden');
          
          if (NetworkOverview && NetworkOverview.highlightRequest) {
             NetworkOverview.highlightRequest(request);
          }
        }
      }
    };

    requestTbody.addEventListener('mousemove', (e) => {
      const cell = e.target.closest('.col-timeline');
      const row = e.target.closest('.request-row');
      if (cell && row) {
        const reqId = row.dataset.reqId;
        const request = NetworkLog.getRequestById(reqId);
        if (request) showTooltip(request, e.clientX, e.clientY);
      } else {
        hideTooltip();
      }
    });

    requestTbody.addEventListener('mouseleave', () => hideTooltip());

    const startResize = (e) => {
      e.preventDefault();
      const startY = e.touches ? e.touches[0].clientY : e.clientY;
      const startHeight = requestListBody.offsetHeight;
      const minHeight = 50;
      const maxHeight = requestListPane.offsetHeight - 50; 

      const moveHandler = (moveEvent) => {
        const clientY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;
        let newHeight = startHeight + (clientY - startY);
        if (newHeight < minHeight) newHeight = minHeight;
        if (newHeight > maxHeight) newHeight = maxHeight;
        requestListBody.style.height = `${newHeight}px`;
        detailsPane.style.height = `calc(100% - ${newHeight}px - 6px)`; 
      };
      
      const stopHandler = () => {
        window.removeEventListener('pointermove', moveHandler);
        window.removeEventListener('pointerup', stopHandler);
        window.removeEventListener('touchmove', moveHandler);
        window.removeEventListener('touchend', stopHandler);
      };
      
      window.addEventListener('pointermove', moveHandler);
      window.addEventListener('pointerup', stopHandler);
      window.addEventListener('touchmove', moveHandler);
      window.addEventListener('touchend', stopHandler);
    };
    heightResizeHandle.addEventListener('pointerdown', startResize);
    heightResizeHandle.addEventListener('touchstart', startResize);
    
    attachColumnResizers();
  }
  
  function attachColumnResizers() {
    const table = container.querySelector('.network-request-table');
    container.querySelectorAll('.col-resizer').forEach(resizer => {
      const th = resizer.parentElement;
      let startX, startWidth;
      const onDragStart = (e) => {
        e.preventDefault(); e.stopPropagation();
        table.style.width = table.offsetWidth + 'px';
        startX = e.touches ? e.touches[0].clientX : e.clientX;
        startWidth = th.getBoundingClientRect().width;
        table.classList.add('is-resizing');
        window.addEventListener('pointermove', onDragMove); window.addEventListener('pointerup', onDragEnd);
        window.addEventListener('touchmove', onDragMove); window.addEventListener('touchend', onDragEnd);
      };
      const onDragMove = (e) => {
        window.requestAnimationFrame(() => {
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const delta = clientX - startX;
            const newWidth = Math.max(50, startWidth + delta);
            th.style.width = `${newWidth}px`;
            if (delta > 0) { table.style.width = 'fit-content'; }
        });
      };
      const onDragEnd = () => {
        table.classList.remove('is-resizing'); table.style.width = 'fit-content';
        window.removeEventListener('pointermove', onDragMove); window.removeEventListener('pointerup', onDragEnd);
        window.removeEventListener('touchmove', onDragMove); window.removeEventListener('touchend', onDragEnd);
      };
      resizer.addEventListener('pointerdown', onDragStart); resizer.addEventListener('touchstart', onDragStart);
    });
  }

  function subscribeToLogEvents() {
    NetworkLog.subscribe('onRecordingStateChanged', updateRecordingState);
    NetworkLog.subscribe('onRequestsUpdated', updateRequestList);
  }
  
  function handleTimeRangeFilter(range) {
    currentFilters.timeRange = range;
    forceListUpdate();
  }
  
  function forceListUpdate() {
    updateRequestList(NetworkLog.getRequests());
  }

  function updateRecordingState(isRecording) {
    const i18n = window.MyDevTool.LanguageManager;
    if (isRecording) {
      recordBtn.classList.add('active');
      recordBtn.title = i18n.t('network.stop_record_btn');
      requestListBody.classList.add('is-recording');
    } else {
      recordBtn.classList.remove('active');
      recordBtn.title = i18n.t('network.record_btn');
      requestListBody.classList.remove('is-recording');
    }
  }

  function hideTooltip() {
      tooltipEl.classList.remove('visible');
  }

  function showTooltip(request, mouseX, mouseY) {
    const t = request.timingData;
    if (!t) return;
    renderTooltipContent(request);
    tooltipEl.classList.add('visible');
    const tooltipRect = tooltipEl.getBoundingClientRect();
    const tooltipWidth = tooltipRect.width;
    const tooltipHeight = tooltipRect.height;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let left = mouseX + 15;
    let top = mouseY + 15;
    if (left + tooltipWidth > viewportWidth) { left = mouseX - tooltipWidth - 15; }
    if (top + tooltipHeight > viewportHeight) { top = mouseY - tooltipHeight - 15; }
    if (left < 5) left = 5; if (top < 5) top = 5;
    tooltipEl.style.left = `${left}px`; tooltipEl.style.top = `${top}px`;
  }

  function renderTooltipContent(request) {
    const t = request.timingData;
    const headerEl = tooltipEl.querySelector('.tooltip-header');
    headerEl.innerHTML = `<div>Started at: ${t.startTime.toFixed(2)} ms</div><div style="font-size: 10px; opacity: 0.7">Resource: ${request.url.split('/').pop()}</div>`;

    let bodyEl = tooltipEl.querySelector('.tooltip-body');
    if (!bodyEl) {
        bodyEl = document.createElement('div');
        bodyEl.className = 'tooltip-body';
        const rowsContainer = tooltipEl.querySelector('.tooltip-rows-container');
        const canvas = tooltipEl.querySelector('.tooltip-canvas');
        if (rowsContainer && canvas) { bodyEl.appendChild(rowsContainer); bodyEl.appendChild(canvas); tooltipEl.appendChild(bodyEl); }
    }
    
    const phases = [];
    const addPhase = (label, duration, color) => { if (duration > 0) phases.push({ label, duration, color }); };

    addPhase('Stalled', (t.domainLookupStart || t.connectStart || t.requestStart) - t.startTime, COLORS.blocked);
    addPhase('DNS Lookup', t.domainLookupEnd - t.domainLookupStart, COLORS.dns);
    addPhase('Initial connection', t.connectEnd - t.connectStart, COLORS.connect);
    if (t.secureConnectionStart > 0) addPhase('SSL', t.connectEnd - t.secureConnectionStart, COLORS.ssl);
    addPhase('Request sent', 0.1, COLORS.ttfb);
    addPhase('Waiting (TTFB)', t.responseStart - t.requestStart, COLORS.ttfb);
    addPhase('Content Download', t.responseEnd - t.responseStart, COLORS.download);

    const rowsContainer = tooltipEl.querySelector('.tooltip-rows-container');
    let html = '';
    phases.forEach(p => { html += `<div class="tooltip-row"><span class="tooltip-label">${p.label}</span><span class="tooltip-value">${p.duration.toFixed(2)} ms</span></div>`; });
    html += `<div class="tooltip-total-row"><span style="font-weight: bold;">Total</span><span style="font-weight: bold;">${t.duration.toFixed(2)} ms</span></div>`;
    rowsContainer.innerHTML = html;
    tooltipCanvas.style.top = '0px'; 
    drawTooltipBars(phases, t.duration);
  }

  function drawTooltipBars(phases, totalDuration) {
    const ROW_HEIGHT = 20; const BAR_HEIGHT = 12; const BAR_OFFSET = (ROW_HEIGHT - BAR_HEIGHT) / 2;
    const width = 140; const height = phases.length * ROW_HEIGHT;
    tooltipCanvas.width = width * (window.devicePixelRatio || 1);
    tooltipCanvas.height = height * (window.devicePixelRatio || 1);
    tooltipCanvas.style.width = `${width}px`; tooltipCanvas.style.height = `${height}px`;
    const scale = window.devicePixelRatio || 1;
    tooltipCtx.setTransform(scale, 0, 0, scale, 0, 0);
    tooltipCtx.clearRect(0, 0, width, height);
    let currentStartTime = 0;
    phases.forEach((p, index) => {
        const y = (index * ROW_HEIGHT) + BAR_OFFSET;
        const startX = (currentStartTime / totalDuration) * width;
        const barWidth = Math.max(2, (p.duration / totalDuration) * width);
        tooltipCtx.fillStyle = p.color;
        tooltipCtx.fillRect(startX, y, barWidth, BAR_HEIGHT);
        currentStartTime += p.duration;
    });
  }
  
  function updateRequestList(requests) {
    const filterText = currentFilters.text.toLowerCase();
    const timeRange = currentFilters.timeRange; 
    
    const filteredRequests = requests.filter(req => {
      const url = req.url.toLowerCase();
      let match = true;
      if (filterText && !url.includes(filterText)) { match = false; }
      if (match && currentFilters.type !== 'all') {
        let reqType = req.resourceType || req.type;
        if (currentFilters.type === 'xhr') {
          if (reqType !== 'xhr' && reqType !== 'fetch') { match = false; }
        } else if (reqType !== currentFilters.type) { match = false; }
      }
      if (match && currentFilters.hideDataURLs && url.startsWith('data:')) { match = false; }
      if (match && timeRange) {
        const startTime = req.timingData ? req.timingData.startTime : req.startTime;
        const endTime = (req.timingData ? req.timingData.responseEnd : (req.startTime + req.duration)) || startTime;
        if (endTime < timeRange.startTime || startTime > timeRange.endTime) { match = false; }
      }
      if (match && currentFilters.thirdParty && !req.isThirdParty) { match = false; }
      
      return currentFilters.invert ? !match : match;
    });
    
    let maxEndTime = 0;
    requests.forEach(req => { 
      const endTime = (req.timingData ? req.timingData.responseEnd : (req.startTime + req.duration)) || 0;
      if (endTime > maxEndTime) maxEndTime = endTime;
    });
    maxEndTime = maxEndTime === 0 ? 100 : Math.ceil(maxEndTime / 100) * 100 + 100;

    updateTimelineHeader(maxEndTime); 

    requestTbody.innerHTML = ''; 
    if (filteredRequests.length === 0) {
      requestListBody.classList.add('is-empty'); detailsPane.classList.add('hidden');
    } else {
      requestListBody.classList.remove('is-empty');
      filteredRequests.forEach(req => renderRequestRow(req, maxEndTime));
    }
    updateFooter(filteredRequests, requests); 
  }

  function renderRequestRow(request, maxEndTime) {
    const row = document.createElement('tr');
    row.className = 'request-row';
    row.dataset.reqId = request.id;

    const name = request.url.substring(request.url.lastIndexOf('/') + 1) || '/';
    const status = request.status || (request.error ? 'failed' : 'pending...');
    const statusClass = `col-status-${request.status || (request.error ? '500' : 'pending')}`;
    let type = request.resourceType || request.type || 'other';
    if (type === 'script') type = 'js'; if (type === 'link') type = 'css'; if (type === 'xmlhttprequest') type = 'xhr';
    const initiator = request.timingData ? (request.timingData.initiatorType || 'other') : (request.type || 'other');
    const size = request.size ? (request.size / 1024).toFixed(1) + ' KB' : '-';
    const time = request.duration ? request.duration.toFixed(0) + ' ms' : '...';

    let initiatorHtml = initiator;
    if (request.isThirdParty) {
        initiatorHtml += ` <span style="font-size:9px; color:#aaa; border:1px solid #aaa; padding:0 2px; border-radius:2px; white-space:nowrap;">3rd</span>`;
    }

    let waterfallHtml = '';
    if (request.timingData && maxEndTime > 0) {
      waterfallHtml = renderWaterfallSegments(request.timingData, maxEndTime);
    } else if (request.startTime && request.duration && maxEndTime > 0) {
      const left = (request.startTime / maxEndTime) * 100;
      const width = (request.duration / maxEndTime) * 100;
      waterfallHtml = `<div class="waterfall-bar-container" style="margin-left: ${left.toFixed(2)}%; width: ${width.toFixed(2)}%"><div class="waterfall-segment" style="width: 100%; background-color: ${COLORS.download};" title="Total: ${time}"></div></div>`;
    }

    // Name column plain again
    row.innerHTML = `<td class="col-name" title="${request.url}">${name}</td><td class="col-status ${statusClass}">${status}</td><td class="col-type">${type}</td><td class="col-initiator">${initiatorHtml}</td><td class="col-size">${size}</td><td class="col-time">${time}</td><td class="col-timeline">${waterfallHtml}</td>`;
    requestTbody.appendChild(row);
  }

  function updateFooter(filteredRequests, allRequests) {
    const i18n = window.MyDevTool.LanguageManager;
    const totalSize = allRequests.reduce((acc, req) => acc + (req.size || 0), 0);
    let totalTime = 0;
    if (allRequests.length > 0) {
         const lastRequest = allRequests[allRequests.length - 1];
         const firstRequest = allRequests[0];
         const endTime = lastRequest.timingData ? lastRequest.timingData.responseEnd : (lastRequest.endTime || 0);
         const startTime = firstRequest.timingData ? firstRequest.timingData.startTime : (firstRequest.startTime || 0);
         if (endTime > startTime) totalTime = (endTime - startTime) / 1000;
    }
    container.querySelector('#network-status-requests').textContent = i18n.t('network.footer.requests_filtered', {shown: filteredRequests.length, total: allRequests.length});
    container.querySelector('#network-status-transferred').textContent = i18n.t('network.footer.transferred', {size: (totalSize / 1024 / 1024).toFixed(2)});
    container.querySelector('#network-status-time').textContent = i18n.t('network.footer.finish', {time: totalTime.toFixed(2)});
  }

  function updateTimelineHeader(maxEndTime) {
    timelineHeader.textContent = 'Waterfall';
    timelineHeader.style.textAlign = 'left'; timelineHeader.style.paddingLeft = '8px';
  }

  function renderWaterfallSegments(timing, maxEndTime) {
    const startTime = timing.startTime;
    const duration = timing.duration;
    if (duration <= 0) return ''; 
    
    const offsetPercent = (startTime / maxEndTime) * 100;
    const totalWidthPercent = (duration / maxEndTime) * 100;
    
    let segments = [];
    const netStart = timing.domainLookupStart || timing.connectStart || timing.requestStart;
    
    if (netStart > startTime) segments.push({ start: startTime, end: netStart, color: COLORS.blocked });
    if (timing.domainLookupEnd > timing.domainLookupStart) segments.push({ start: timing.domainLookupStart, end: timing.domainLookupEnd, color: COLORS.dns });
    if (timing.connectEnd > timing.connectStart) {
        if (timing.secureConnectionStart > 0 && timing.secureConnectionStart >= timing.connectStart) {
             segments.push({ start: timing.connectStart, end: timing.secureConnectionStart, color: COLORS.connect });
             segments.push({ start: timing.secureConnectionStart, end: timing.connectEnd, color: COLORS.ssl });
        } else {
             segments.push({ start: timing.connectStart, end: timing.connectEnd, color: COLORS.connect });
        }
    }
    if (timing.responseStart > timing.requestStart) segments.push({ start: timing.requestStart, end: timing.responseStart, color: COLORS.ttfb });
    if (timing.responseEnd > timing.responseStart) segments.push({ start: timing.responseStart, end: timing.responseEnd, color: COLORS.download });

    if (segments.length === 0) {
        return `<div class="waterfall-bar-container" style="margin-left: ${offsetPercent.toFixed(2)}%; width: ${Math.max(0.1, totalWidthPercent).toFixed(2)}%;"><div class="waterfall-segment" style="width: 100%; background-color: ${COLORS.download};"></div></div>`;
    }

    const segmentsHtml = segments.map(seg => {
      const segStartRelative = seg.start - startTime;
      const segDuration = seg.end - seg.start;
      const left = (segStartRelative / duration) * 100;
      const width = (segDuration / duration) * 100;
      if (width < 0.1) return ''; 
      return `<div class="waterfall-segment" style="left: ${left.toFixed(2)}%; width: ${width.toFixed(2)}%; background-color: ${seg.color};"></div>`;
    }).join('');

    return `<div class="waterfall-bar-container" style="margin-left: ${offsetPercent.toFixed(2)}%; width: ${Math.max(0.1, totalWidthPercent).toFixed(2)}%;">${segmentsHtml}</div>`;
  }

  return { init };
})();