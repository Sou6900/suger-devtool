// src/modules/network/NetworkOverview.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.NetworkOverview = (function () {

  let container = null;
  let NetworkLog = null;
  let canvas = null;
  let ctx = null;
  let selectionOverlay = null;

  // config
  const GRAPH_TOP_PADDING = 20; 
  const MAX_BAR_HEIGHT = 20; 
  const BAR_GAP = 1;         
  const MIN_SEGMENT_WIDTH = 2; 

  const COLORS = {
    grid: '#e0e0e0',
    text: '#757575',
    blocked: '#b0b0b0',
    dns: '#009688',
    connect: '#FF9800',
    ssl: '#9C27B0',
    ttfb: '#00C853',
    download: '#4285F4',
    error: '#FF5252'
  };

  let state = {
    minStartTime: 0,
    totalDuration: 1000,
    isDragging: false,
    startX: 0,
    currentX: 0,
    selectedRequest: null 
  };

  let listeners = {
    onTimeRangeSelected: []
  };

  function init(containerEl, logModule) {
    const i18n = window.MyDevTool.LanguageManager;
    container = containerEl;
    NetworkLog = logModule;
    container.title = i18n ? i18n.t('network.overview_title') : 'Network Overview';

    canvas = document.createElement('canvas');
    canvas.className = 'network-overview-canvas';
    ctx = canvas.getContext('2d');
    container.appendChild(canvas);
    
    selectionOverlay = document.createElement('div');
    selectionOverlay.className = 'network-overview-selection';
    container.appendChild(selectionOverlay);

    container.addEventListener('click', (e) => {
        if (!state.isDragging) {
            resetSelection();
        }
    });

    NetworkLog.subscribe('onRequestsUpdated', () => renderChart(NetworkLog.getRequests()));
    container.addEventListener('pointerdown', onDragStart);
    
    const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => renderChart(NetworkLog.getRequests()));
    });
    resizeObserver.observe(container);

    renderChart(NetworkLog.getRequests());
  }

  function highlightRequest(request) {
    state.selectedRequest = request;
    renderChart(NetworkLog.getRequests());
  }
  
  function resetSelection() {
      state.selectedRequest = null;
      notify('onTimeRangeSelected', null);
      renderChart(NetworkLog.getRequests());
  }

  function subscribe(eventName, callback) {
    if (listeners[eventName]) listeners[eventName].push(callback);
  }

  function notify(eventName, data) {
    listeners[eventName].forEach(callback => callback(data));
  }

  function renderChart(requests) {
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    // --- টাইম ক্যালকুলেশন লজিক ---
    let minStartTime = 0;
    let maxEndTime = 100;

    // ১. যদি রিকোয়েস্ট সিলেক্ট করা থাকে (Zoom View)
    if (state.selectedRequest) {
        const req = state.selectedRequest;
        const start = req.startTime;
        const end = (req.timingData ? req.timingData.responseEnd : (req.startTime + req.duration)) || start;
        
        const duration = end - start || 10;
        const padding = Math.max(duration * 0.1, 10);

        minStartTime = Math.max(0, start - padding); 
        maxEndTime = end + padding * 2; 
    
    } else {
        let globalMin = Infinity;
        let globalMax = 0;

        requests.forEach(req => {
            const start = req.startTime;
            if (start === 0 && requests.length > 1) return; // 0 filtering

            const end = (req.timingData ? req.timingData.responseEnd : (req.startTime + req.duration)) || start;
            if (start < globalMin) globalMin = start;
            if (end > globalMax) globalMax = end;
        });

        if (globalMin === Infinity) globalMin = 0;
        if (globalMax === 0) globalMax = 100;
        
        minStartTime = globalMin;
        maxEndTime = globalMax * 1.05; 
    }

    let duration = maxEndTime - minStartTime;
    if (duration <= 0) duration = 100;

    state.minStartTime = minStartTime;
    state.totalDuration = duration;

    drawGrid(ctx, width, height, duration);
    drawWaterfall(ctx, requests, minStartTime, duration, width, height);

    if (state.selectedRequest) {
        drawGuidelines(ctx, state.selectedRequest, minStartTime, duration, width, height);
    }
  }

  function drawGrid(ctx, width, height, duration) {
    ctx.beginPath();
    ctx.strokeStyle = COLORS.grid;
    ctx.fillStyle = COLORS.text;
    ctx.lineWidth = 1;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';

    const step = duration / 4;

    for (let i = 1; i <= 4; i++) {
        const timeValue = i * step;
        const x = (timeValue / duration) * width;

        ctx.moveTo(Math.floor(x) + 0.5, 0); 
        ctx.lineTo(Math.floor(x) + 0.5, height);
        
        const label = formatTimeLabel(timeValue);
        let textX = x - 4; 
        ctx.fillText(label, textX, 4); 
    }
    ctx.stroke();
  }

  function formatTimeLabel(ms) {
      if (ms === 0) return '0';
      if (ms < 1000) return Math.round(ms) + ' ms';
      return (ms / 1000).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1') + ' s';
  }

  function drawWaterfall(ctx, requests, minStart, duration, width, height) {
    if (requests.length === 0) return;

    const totalRequests = requests.length;
    const availableHeight = height - GRAPH_TOP_PADDING;
    let barHeight = availableHeight / totalRequests;
    if (barHeight > MAX_BAR_HEIGHT) barHeight = MAX_BAR_HEIGHT;
    const barRenderHeight = Math.max(2, barHeight - BAR_GAP);

    requests.forEach((req, index) => {
      if (!req.timingData && !req.startTime) return;
      
      const y = GRAPH_TOP_PADDING + (index * barHeight);
      
      let alpha = 1.0;
      if (state.selectedRequest) {
         if (state.selectedRequest.id === req.id) alpha = 1.0;
         else alpha = 0.1; 
      } else {
         alpha = 0.6;
      }

      drawSingleRequestBar(ctx, req, minStart, duration, width, y, barRenderHeight, alpha);
    });
  }

function drawSingleRequestBar(ctx, req, minStart, duration, width, y, h, alpha) {
  const mapX = (time) => ((time - minStart) / duration) * width;

  if (req.error || req.status >= 400) {
     const startX = mapX(req.startTime);
     const w = ((req.duration || 10) / duration) * width;
     ctx.fillStyle = hexToRgba(COLORS.error, alpha);
     ctx.fillRect(startX, y, Math.max(MIN_SEGMENT_WIDTH, w), h);
     return;
  }

  const t = req.timingData;
  
  if (!t) {
     const startX = mapX(req.startTime);
     const w = ((req.duration || 10) / duration) * width;
     ctx.fillStyle = hexToRgba(COLORS.download, alpha);
     ctx.fillRect(startX, y, Math.max(MIN_SEGMENT_WIDTH, w), h);
     return;
  }

  // Check timing source
  const isRealTiming = (t.timingSource === 'real');
  const isCached = (t.timingSource === 'cached');
  const isEstimated = (t.timingSource === 'estimated');

  const segments = [];
  
  // cached  -> only show download 
  if (isCached) {
    const startX = mapX(t.startTime);
    const endX = mapX(t.responseEnd);
    const w = Math.max(MIN_SEGMENT_WIDTH, endX - startX);
    
    // Cached resources - different color
    ctx.fillStyle = hexToRgba('#64B5F6', alpha);
    ctx.fillRect(startX, y, w, h);
    return;
  }

  // Build segments (real or estimated)
  let currentVisualX = mapX(t.startTime);

  // Blocked/Stalled
  const firstNetworkActivity = t.domainLookupStart || t.connectStart || t.requestStart;
  if (firstNetworkActivity > t.startTime && firstNetworkActivity > 0) {
      segments.push({ start: t.startTime, end: firstNetworkActivity, color: COLORS.blocked });
  }
  
  // DNS Lookup
  if (t.domainLookupEnd > t.domainLookupStart && t.domainLookupStart > 0) {
      segments.push({ 
        start: t.domainLookupStart, 
        end: t.domainLookupEnd, 
        color: isEstimated ? '#FFD700' : COLORS.dns
      });
  }
  
  // TCP Connect
  if (t.connectEnd > t.connectStart && t.connectStart > 0) {
      if (t.secureConnectionStart > 0 && t.secureConnectionStart >= t.connectStart) {
          segments.push({ 
            start: t.connectStart, 
            end: t.secureConnectionStart, 
            color: isEstimated ? '#FFB347' : COLORS.connect 
          });
          segments.push({ 
            start: t.secureConnectionStart, 
            end: t.connectEnd, 
            color: isEstimated ? '#DA70D6' : COLORS.ssl 
          });
      } else {
          segments.push({ 
            start: t.connectStart, 
            end: t.connectEnd, 
            color: isEstimated ? '#FFB347' : COLORS.connect 
          });
      }
  }
  
  // Waiting (TTFB)
  if (t.responseStart > t.requestStart && t.requestStart > 0) {
      segments.push({ 
        start: t.requestStart, 
        end: t.responseStart, 
        color: isEstimated ? '#90EE90' : COLORS.ttfb 
      });
  }
  
  // Download
  if (t.responseEnd > t.responseStart && t.responseStart > 0) {
      segments.push({ 
        start: t.responseStart, 
        end: t.responseEnd, 
        color: COLORS.download 
      });
  }

  // Fallback
  if (segments.length === 0) {
      const startX = mapX(t.startTime);
      const endX = mapX(t.responseEnd || (t.startTime + t.duration));
      const w = Math.max(MIN_SEGMENT_WIDTH, endX - startX);
      ctx.fillStyle = hexToRgba(COLORS.download, alpha);
      ctx.fillRect(startX, y, w, h);
      return;
  }

  // Draw segments
  segments.forEach(seg => {
      let startX = mapX(seg.start);
      let endX = mapX(seg.end);
      let segWidth = endX - startX;

      if (startX < currentVisualX) startX = currentVisualX;
      if (segWidth < MIN_SEGMENT_WIDTH) segWidth = MIN_SEGMENT_WIDTH;

      ctx.fillStyle = hexToRgba(seg.color, alpha);
      ctx.fillRect(startX, y, segWidth, h);

      currentVisualX = startX + segWidth;
  });
  
  // ⚠ if estimated -> dotted border
  if (isEstimated) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.strokeRect(mapX(t.startTime), y, mapX(t.responseEnd) - mapX(t.startTime), h);
    ctx.setLineDash([]);
  }
}

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function drawGuidelines(ctx, req, minStart, duration, width, height) {
      const t = req.timingData;
      if (!t) return;

      const mapX = (time) => ((time - minStart) / duration) * width;
      const startX = mapX(t.startTime);
      const endX = mapX(t.responseEnd);
      const y = GRAPH_TOP_PADDING;

      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.strokeStyle = COLORS.ttfb; 
      ctx.setLineDash([2, 2]);
      ctx.moveTo(startX, y);
      ctx.lineTo(startX, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = COLORS.download;
      ctx.moveTo(endX, y);
      ctx.lineTo(endX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(startX, y, Math.max(1, endX - startX), height - y);
  }

  // --- Drag Logic ---
  function onDragStart(e) {
    e.preventDefault();
    state.isDragging = true;
    const rect = container.getBoundingClientRect();
    state.startX = e.clientX - rect.left;
    selectionOverlay.style.left = `${state.startX}px`;
    selectionOverlay.style.width = '0px';
    selectionOverlay.style.display = 'block';
    window.addEventListener('pointermove', onDragMove);
    window.addEventListener('pointerup', onDragEnd);
  }

  function onDragMove(e) {
    e.preventDefault();
    if (!state.isDragging) return;
    const rect = container.getBoundingClientRect();
    state.currentX = e.clientX - rect.left;
    if (state.currentX < 0) state.currentX = 0;
    if (state.currentX > rect.width) state.currentX = rect.width;
    const left = Math.min(state.startX, state.currentX);
    const width = Math.abs(state.startX - state.currentX);
    selectionOverlay.style.left = `${left}px`;
    selectionOverlay.style.width = `${width}px`;
  }

  function onDragEnd(e) {
    state.isDragging = false;
    window.removeEventListener('pointermove', onDragMove);
    window.removeEventListener('pointerup', onDragEnd);
    const rect = container.getBoundingClientRect();
    const finalLeft = parseFloat(selectionOverlay.style.left) || 0;
    const finalWidth = parseFloat(selectionOverlay.style.width) || 0;
    
    if (finalWidth < 5) {
      selectionOverlay.style.display = 'none';
      return;
    }
    
    const startRatio = finalLeft / rect.width;
    const endRatio = (finalLeft + finalWidth) / rect.width;
    const startTime = state.minStartTime + (startRatio * state.totalDuration);
    const endTime = state.minStartTime + (endRatio * state.totalDuration);
    notify('onTimeRangeSelected', { startTime, endTime });
  }

  return {
    init,
    subscribe,
    highlightRequest
  };

})();