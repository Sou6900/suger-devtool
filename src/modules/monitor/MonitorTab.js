// src/modules/monitor/MonitorTab.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.MonitorTab = (function() {
    let container = null;
    let graphListContainer = null;
    let timelineCanvas = null;
    let timelineCtx = null;
    let sidebar = null;
    let resizer = null; 
    
    let isRunning = false; // Tab active state
    let isPerformanceRunning = true; // Toggle State
    let animationFrameId = null;
    
    // Config
    const pollInterval = 1000; 
    let lastPollTime = 0;
    const PIXELS_PER_SEC = 10; 
    
    // Metrics Definition
    const metrics = {
        cpu: { 
            id: 'cpu', 
            labelKey: 'monitor.cpu_usage', 
            defaultLabel: 'CPU usage', 
            color: '#ff6b6b', suffix: '%', history: [], visible: true, current: 0, max: 100, canvas: null, ctx: null 
        },
        heap: { 
            id: 'heap', 
            labelKey: 'monitor.js_heap_size', 
            defaultLabel: 'JS heap size', 
            color: '#6b6bff', suffix: 'MB', history: [], visible: true, current: 0, max: 100, canvas: null, ctx: null 
        },
        nodes: { 
            id: 'nodes', 
            labelKey: 'monitor.dom_nodes', 
            defaultLabel: 'DOM Nodes', 
            color: '#2ecc71', suffix: '', history: [], visible: true, current: 0, max: 5000, canvas: null, ctx: null 
        },
        listeners: { 
            id: 'listeners', 
            labelKey: 'monitor.js_event_listeners', 
            defaultLabel: 'JS event listeners', 
            color: '#f39c12', suffix: '', history: [], visible: true, current: 0, max: 100, canvas: null, ctx: null 
        },
        fps: { 
            id: 'fps', 
            labelKey: 'monitor.frames_per_sec', 
            defaultLabel: 'Frames per sec', 
            color: '#54a0ff', suffix: '', history: [], visible: true, current: 60, max: 60, canvas: null, ctx: null 
        }
    };

    let frameCount = 0;

    function init(containerEl, shadowRoot) {
        container = containerEl;
        renderUI();
        bindEvents();
        setupResizeObserver();
    }

    function renderUI() {
        const i18n = window.MyDevTool.LanguageManager;

        container.innerHTML = `
            <div class="monitor-layout">
                <div class="monitor-main-area">
                    <div class="monitor-timeline-header">
                        <canvas id="monitor-timeline"></canvas>
                    </div>
                    <div class="monitor-graph-list"></div>
                </div>

                <div class="monitor-sidebar" style="width: 200px;">
                    <div class="monitor-metric-list"></div>
                </div>
                
                <div class="monitor-resizer" style="left: 200px;"></div>
            </div>
        `;
        
        timelineCanvas = container.querySelector('#monitor-timeline');
        timelineCtx = timelineCanvas.getContext('2d');
        graphListContainer = container.querySelector('.monitor-graph-list');
        sidebar = container.querySelector('.monitor-sidebar');
        resizer = container.querySelector('.monitor-resizer');

        renderSidebarItems();
        rebuildGraphs();
    }

    function renderSidebarItems() {
        const i18n = window.MyDevTool.LanguageManager;
        const list = container.querySelector('.monitor-metric-list');
        list.innerHTML = '';

        // Run performance Toggle Item
        const masterItem = document.createElement('div');
        masterItem.className = 'monitor-item';
        // Separator
        masterItem.style.borderBottom = '1px solid var(--dt-border-color)'; 
        masterItem.style.marginBottom = '6px';
        masterItem.style.paddingBottom = '6px';

        const tickSvg = `
        <svg width="100%" height="100%" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.5 12.5L10.167 17L19.5 8" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;

        const masterOpacity = isPerformanceRunning ? '1' : '0.5';
        const masterLabel = i18n ? (i18n.t('monitor.run_performance') || 'Run performance') : 'Run performance';

        masterItem.innerHTML = `
            <div class="monitor-checkbox" style="opacity: ${masterOpacity}; color: var(--dt-text-primary);">
                ${isPerformanceRunning ? tickSvg : ''}
            </div>
            <span class="monitor-label" style="opacity: ${isPerformanceRunning ? 1 : 0.7}; font-weight: 600;">${masterLabel}</span>
        `;
        
        masterItem.onclick = () => {
            isPerformanceRunning = !isPerformanceRunning;
            renderSidebarItems();
            // Note: Loop logic handles the pause automatically
        };
        list.appendChild(masterItem);


        // Regular Metrics
        Object.values(metrics).forEach(m => {
            const item = document.createElement('div');
            item.className = 'monitor-item';
            
            const labelText = i18n ? (i18n.t(m.labelKey) || m.defaultLabel) : m.defaultLabel;
            
            // Colored Tick for metrics
            const metricTickSvg = `
            <svg width="100%" height="100%" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.5 12.5L10.167 17L19.5 8" stroke="${m.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;

            const opacity = m.visible ? '1' : '0.5'; 

            item.innerHTML = `
                <div class="monitor-checkbox" style="opacity: ${opacity};">
                    ${m.visible ? metricTickSvg : ''}
                </div>
                <span class="monitor-label" style="opacity: ${m.visible ? 1 : 0.7}">${labelText}</span>
                <span class="monitor-value" style="color: ${m.visible ? m.color : 'var(--dt-text-disabled)'}">-</span>
            `;
            
            item.onclick = () => {
                m.visible = !m.visible;
                renderSidebarItems();
                rebuildGraphs();
            };
            list.appendChild(item);
        });
    }

    function rebuildGraphs() {
        if (!graphListContainer) return;
        graphListContainer.innerHTML = '';
        Object.values(metrics).forEach(m => {
            if (!m.visible) return;
            const row = document.createElement('div');
            row.className = 'monitor-graph-row';
            row.innerHTML = `<canvas class="metric-canvas"></canvas>`;
            const cvs = row.querySelector('canvas');
            m.canvas = cvs;
            m.ctx = cvs.getContext('2d');
            graphListContainer.appendChild(row);
        });
        resizeCanvases();
    }

    function sampleData(now) {
        const currentFPS = frameCount; frameCount = 0;
        metrics.fps.current = currentFPS;
        let cpuLoad = Math.max(0, 100 - (currentFPS / 60 * 100));
        metrics.cpu.current = cpuLoad.toFixed(1);
        if (performance.memory) metrics.heap.current = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
        metrics.nodes.current = document.getElementsByTagName('*').length;
        metrics.listeners.current = document.querySelectorAll('*[onclick]').length + 10; 

        Object.values(metrics).forEach(m => {
            m.history.push({ time: now, value: Number(m.current) });
            const cutoff = now - (120 * 1000); 
            if (m.history.length > 0 && m.history[0].time < cutoff) m.history.shift();
            const localMax = m.history.reduce((max, p) => Math.max(max, p.value), 0);
            if (localMax > m.max) m.max = localMax * 1.2;
            else if (localMax < m.max * 0.5 && m.max > 100) m.max = m.max * 0.95;
        });
        updateSidebarValues();
    }

    function updateSidebarValues() {
        const items = container.querySelectorAll('.monitor-item');
        Object.keys(metrics).forEach((key, index) => {
             const m = metrics[key];
             if (items[index + 1]) {
                 const valSpan = items[index + 1].querySelector('.monitor-value');
                 if (valSpan) valSpan.textContent = `${m.current}${m.suffix}`;
             }
        });
    }

    function draw(now) {
        const dpr = window.devicePixelRatio || 1;
        const width = timelineCanvas.width / dpr;
        const height = timelineCanvas.height / dpr;
        const visibleDuration = (width / PIXELS_PER_SEC) * 1000;
        const endTime = now;
        const startTime = now - visibleDuration;

        if (timelineCtx && timelineCanvas) {
            drawTimeline(timelineCtx, width, height, startTime, endTime, visibleDuration);
        }
        Object.values(metrics).forEach(m => {
            if (m.visible && m.ctx && m.canvas) {
                drawMetricGraph(m, startTime, endTime, visibleDuration);
            }
        });
    }

    function drawTimeline(ctx, w, h, startTime, endTime, duration) {
        ctx.clearRect(0, 0, w, h);
        const style = getComputedStyle(container);
        const textColor = style.getPropertyValue('--dt-text-secondary').trim() || '#aaa';
        const gridColor = style.getPropertyValue('--dt-border-color').trim() || '#444';
        ctx.fillStyle = textColor; ctx.font = '11px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; 
        const mainStepMs = 10000; 
        const firstMainTick = Math.ceil(startTime / mainStepMs) * mainStepMs;
        ctx.beginPath();
        for (let t = firstMainTick; t <= endTime; t += mainStepMs) {
            const x = ((t - startTime) / duration) * w;
            const date = new Date(t);
            const timeStr = date.toLocaleTimeString('en-GB', { hour12: false });
            ctx.fillText(timeStr, x, h / 2); 
            ctx.moveTo(x, h - 6); ctx.lineTo(x, h);
        }
        ctx.strokeStyle = gridColor; ctx.stroke();
    }

    function drawMetricGraph(metric, startTime, endTime, duration) {
        const ctx = metric.ctx;
        const dpr = window.devicePixelRatio || 1;
        const w = metric.canvas.width / dpr;
        const h = metric.canvas.height / dpr;
        ctx.clearRect(0, 0, metric.canvas.width, metric.canvas.height);

        const subStepMs = 1000; const firstSubTick = Math.ceil(startTime / subStepMs) * subStepMs;
        ctx.beginPath(); ctx.lineWidth = 1; 
        for (let t = firstSubTick; t <= endTime; t += subStepMs) {
            const x = ((t - startTime) / duration) * w;
            if (t % 10000 !== 0) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
        }
        ctx.strokeStyle = 'rgba(128, 128, 128, 0.08)'; ctx.stroke();

        const mainStepMs = 10000; const firstMainTick = Math.ceil(startTime / mainStepMs) * mainStepMs;
        ctx.beginPath(); for (let t = firstMainTick; t <= endTime; t += mainStepMs) {
            const x = ((t - startTime) / duration) * w; ctx.moveTo(x, 0); ctx.lineTo(x, h);
        }
        ctx.strokeStyle = 'rgba(128, 128, 128, 0.2)'; ctx.stroke();

        if (metric.history.length === 0) return;
        ctx.beginPath(); ctx.lineWidth = 1.5; ctx.strokeStyle = metric.color;
        ctx.fillStyle = hexToRgba(metric.color, 0.15); 
        let started = false;
        const visibleHistory = metric.history.filter(p => p.time >= startTime - 1000); 
        if (visibleHistory.length > 0) {
            const firstX = ((visibleHistory[0].time - startTime) / duration) * w;
            ctx.moveTo(firstX, h); 
            visibleHistory.forEach(p => {
                const x = ((p.time - startTime) / duration) * w;
                const y = h - ((p.value / metric.max) * h); 
                if (!started) { ctx.lineTo(x, y); started = true; } else { ctx.lineTo(x, y); }
            });
            const lastP = visibleHistory[visibleHistory.length - 1];
            const lastX = ((lastP.time - startTime) / duration) * w;
            ctx.lineTo(lastX, h); ctx.fill();
            ctx.beginPath(); started = false;
            visibleHistory.forEach(p => {
                const x = ((p.time - startTime) / duration) * w;
                const y = h - ((p.value / metric.max) * h);
                if (!started) { ctx.moveTo(x, y); started = true; } else { ctx.lineTo(x, y); }
            });
            ctx.stroke();
        }
    }

    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16); const g = parseInt(hex.slice(3, 5), 16); const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function startMonitoring() {
        if (isRunning) return;
        isRunning = true;
        function loop() {
            if (!isRunning) return; // Tab closed, stop loop completely
            
            if (isPerformanceRunning) {
                const now = Date.now(); 
                frameCount++;
                if (now - lastPollTime >= pollInterval) { 
                    sampleData(now); 
                    lastPollTime = now; 
                }
                draw(now); 
            }
            // Loop continues but does nothing if paused (no CPU heavy tasks)
            animationFrameId = requestAnimationFrame(loop);
        }
        loop();
    }
    
    function stopMonitoring() { isRunning = false; cancelAnimationFrame(animationFrameId); }
    function setupResizeObserver() { const observer = new ResizeObserver(() => { resizeCanvases(); }); observer.observe(container); }
    function resizeCanvases() {
        const dpr = window.devicePixelRatio || 1;
        if (timelineCanvas) {
            const rect = timelineCanvas.parentElement.getBoundingClientRect();
            timelineCanvas.width = rect.width * dpr; timelineCanvas.height = rect.height * dpr; timelineCtx.scale(dpr, dpr);
        }
        Object.values(metrics).forEach(m => {
            if (m.canvas && m.visible) {
                const rect = m.canvas.parentElement.getBoundingClientRect();
                m.canvas.width = rect.width * dpr; m.canvas.height = rect.height * dpr; m.ctx.scale(dpr, dpr);
            }
        });
    }

    function bindEvents() {
        const onDown = (e) => {
            e.preventDefault(); resizer.setPointerCapture(e.pointerId);
            resizer.addEventListener('pointermove', onMove); resizer.addEventListener('pointerup', onUp);
            document.body.style.cursor = 'col-resize';
        };
        const onMove = (e) => {
            e.preventDefault(); 
            const rect = container.getBoundingClientRect();
            const w = e.clientX - rect.left;
            if (w > 160 && w < rect.width - 50) {
                sidebar.style.width = `${w}px`;
                resizer.style.left = `${w}px`;
            }
        };
        const onUp = (e) => {
            resizer.releasePointerCapture(e.pointerId);
            resizer.removeEventListener('pointermove', onMove); resizer.removeEventListener('pointerup', onUp);
            document.body.style.cursor = '';
        };
        resizer.addEventListener('pointerdown', onDown);
    }

    return { init, start: startMonitoring, stop: stopMonitoring };
})();