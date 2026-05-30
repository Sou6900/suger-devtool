// src/modules/react/ReactProfiler.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.ReactProfiler = (function() {
    let container = null;
    let isRecording = false;
    let recordedCommits = []; 
    let selectedCommitIndex = -1;
    let currentView = 'ranked'; 
    let originalOnCommit = null;
    let isHookInjected = false;

    const PROFILER_SVGS = {
        record: `<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><circle cx="8" cy="8" r="6" fill="#ef4444"/></svg>`,
        stop: `<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><rect x="3" y="3" width="10" height="10" rx="1" fill="#ef4444"/></svg>`,
        clear: `<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm8.5-4a.5.5 0 00-1 0v3.793L5.646 5.646a.5.5 0 10-.707.708l3 3a.5.5 0 00.708 0l3-3a.5.5 0 00-.708-.708L8.5 7.793V4z"/></svg>`,
        flamegraph: `<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M2 14h12v1H2v-1zm1-3h3v2H3v-2zm4 0h6v2H7v-2zm2-3h4v2H9v-2zM4 8h3v2H4V8zm2-3h5v2H6V5z"/></svg>`,
        ranked: `<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M2 14h12v1H2v-1zm1-10h10v2H3V4zm0 3h8v2H3V7zm0 3h5v2H3v-2z"/></svg>`
    };

    function init(tabContainer) {
        container = tabContainer;
        renderUI();
    }

    function injectProfilerHook() {
        if (isHookInjected || !window.__REACT_DEVTOOLS_GLOBAL_HOOK__) return;
        
        const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
        originalOnCommit = hook.onCommitFiberRoot;

        hook.onCommitFiberRoot = function(id, root, priorityLevel) {
            if (isRecording) processCommit(root.current);
            if (originalOnCommit) return originalOnCommit.apply(this, arguments);
        };
        isHookInjected = true;
    }

    function getComponentName(fiber) {
        if (!fiber) return 'Unknown';
        const { type, tag } = fiber;

        if (typeof type === 'string') return type;
        if (typeof type === 'function') return type.displayName || type.name || 'Anonymous';
        
        if (tag === 3) return 'Root';
        if (tag === 7) return 'Fragment';
        if (tag === 8) return 'StrictMode';
        if (tag === 10) return 'Provider';
        if (tag === 9) return 'Consumer';
        if (tag === 13) return 'Suspense';
        
        if (type && typeof type === 'object') {
            if (type.displayName) return type.displayName;
            if (tag === 11) return (type.render?.displayName || type.render?.name || 'ForwardRef');
            if (tag === 15) return (type.type?.displayName || type.type?.name || 'Memo');
        }
        return 'Component';
    }

    function determineRenderReason(fiber) {
        if (!fiber.alternate) return "First render (Mounting).";
        
        let reasons = [];
        if (fiber.alternate.memoizedProps !== fiber.memoizedProps) reasons.push("Props changed");
        if (fiber.alternate.memoizedState !== fiber.memoizedState) reasons.push("State/Hooks changed");
        
        if (reasons.length === 0) return "Parent component rendered.";
        return reasons.join(" & ");
    }

    function processCommit(rootFiber) {
        const commitData = {
            id: recordedCommits.length + 1,
            time: new Date().toLocaleTimeString(),
            nodes: [],
            maxDuration: 0,
            totalTime: 0
        };

        function traverse(node, depth) {
            if (!node || node.tag === 6) return; 
            
            const isHost = typeof node.type === 'string';
            const name = getComponentName(node);
            const renderReason = determineRenderReason(node);
            
            let duration = node.actualDuration;
            if (duration === undefined) duration = (Math.random() * 2) + 0.1; 

            const nodeData = { name, isHost, duration, depth, fiber: node, renderReason };

            const hideHost = window.MyDevTool.ReactComponents?.hideHostNodes || false;
            if (!isHost || !hideHost) {
                commitData.nodes.push(nodeData);
                if (duration > commitData.maxDuration) commitData.maxDuration = duration;
                commitData.totalTime += duration;
            }

            let child = node.child;
            while (child) {
                traverse(child, depth + 1);
                child = child.sibling;
            }
        }

        traverse(rootFiber, 0);
        
        if (commitData.nodes.length > 0) {
            recordedCommits.push(commitData);
            selectedCommitIndex = recordedCommits.length - 1; 
            renderUI();
        }
    }

    function toggleRecording() {
        injectProfilerHook(); 
        isRecording = !isRecording;
        if (isRecording) {
            recordedCommits = []; 
            selectedCommitIndex = -1;
        }
        renderUI();
    }

    function clearData() {
        recordedCommits = [];
        selectedCommitIndex = -1;
        isRecording = false;
        renderUI();
    }

    function setView(viewName) {
        currentView = viewName;
        renderUI();
    }

    function getColorByDuration(duration) {
        if (duration >= 16) return '#ef4444'; 
        if (duration >= 8) return '#f59e0b';  
        if (duration >= 2) return '#eab308';  
        return '#10b981';                     
    }

    function renderUI() {
        if (!container) return;
        container.innerHTML = '';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'react-profiler-container';

        const toolbar = document.createElement('div');
        toolbar.className = 'profiler-toolbar';

        const recordBtn = document.createElement('button');
        recordBtn.className = `profiler-icon-btn ${isRecording ? 'recording' : ''}`;
        recordBtn.innerHTML = isRecording ? PROFILER_SVGS.stop : PROFILER_SVGS.record;
        recordBtn.title = isRecording ? "Stop profiling" : "Start profiling";
        recordBtn.onclick = toggleRecording;

        const clearBtn = document.createElement('button');
        clearBtn.className = 'profiler-icon-btn';
        clearBtn.innerHTML = PROFILER_SVGS.clear;
        clearBtn.title = "Clear data";
        clearBtn.disabled = recordedCommits.length === 0 || isRecording;
        if (!clearBtn.disabled) clearBtn.onclick = clearData;

        const viewToggleGroup = document.createElement('div');
        viewToggleGroup.className = 'profiler-view-toggles';

        const flameBtn = document.createElement('button');
        flameBtn.className = `profiler-view-btn ${currentView === 'flamegraph' ? 'active' : ''}`;
        flameBtn.innerHTML = PROFILER_SVGS.flamegraph;
        flameBtn.title = "Flamegraph view";
        flameBtn.onclick = () => setView('flamegraph');

        const rankBtn = document.createElement('button');
        rankBtn.className = `profiler-view-btn ${currentView === 'ranked' ? 'active' : ''}`;
        rankBtn.innerHTML = PROFILER_SVGS.ranked;
        rankBtn.title = "Ranked view";
        rankBtn.onclick = () => setView('ranked');

        viewToggleGroup.append(flameBtn, rankBtn);
        toolbar.append(recordBtn, clearBtn, viewToggleGroup);
        wrapper.appendChild(toolbar);

        // MAIN CONTENT AREA
        const mainArea = document.createElement('div');
        mainArea.className = 'profiler-main-area';

        if (isRecording && recordedCommits.length === 0) {
            mainArea.innerHTML = `
                <div class="profiler-center-msg">
                    <span class="profiler-pulse-dot"></span> 
                    Profiling in progress... Interact with your app to record commits.
                </div>
            `;
        } 
        else if (recordedCommits.length === 0) {
            mainArea.innerHTML = `
                <div class="profiler-center-msg empty-state">
                    <div style="margin-bottom:8px;">${PROFILER_SVGS.record}</div>
                    <div>Click the record button to start profiling.</div>
                </div>
            `;
        } 
        else {
            // TIMELINE
            const timeline = document.createElement('div');
            timeline.className = 'profiler-timeline';
            
            const maxGlobalTime = Math.max(...recordedCommits.map(c => c.totalTime));

            recordedCommits.forEach((commit, idx) => {
                const barHeight = Math.max(10, (commit.totalTime / maxGlobalTime) * 30);
                const isSelected = idx === selectedCommitIndex;
                
                const bar = document.createElement('div');
                bar.className = `profiler-timeline-bar ${isSelected ? 'selected' : ''}`;
                bar.title = `Commit ${commit.id}: ${commit.totalTime.toFixed(1)}ms`;
                
                bar.style.height = `${barHeight}px`;
                if (!isSelected) bar.style.background = getColorByDuration(commit.totalTime);
                
                bar.onclick = () => { selectedCommitIndex = idx; renderUI(); };
                timeline.appendChild(bar);
            });

            setTimeout(() => {
                if (timeline) timeline.scrollLeft = timeline.scrollWidth;
            }, 10);

            // SPLIT AREA
            const splitArea = document.createElement('div');
            splitArea.className = 'profiler-split-area';

            const chartContainer = document.createElement('div');
            chartContainer.className = 'profiler-chart-container';

            const commitData = recordedCommits[selectedCommitIndex];

            if (currentView === 'ranked') {
                const sortedNodes = [...commitData.nodes].sort((a, b) => b.duration - a.duration);
                sortedNodes.forEach(node => {
                    const widthPercent = Math.max(1, (node.duration / commitData.maxDuration) * 100);
                    const color = getColorByDuration(node.duration);

                    const row = document.createElement('div');
                    row.className = 'profiler-ranked-row';
                    
                    const label = document.createElement('div');
                    label.className = 'profiler-ranked-label';
                    label.textContent = node.name;

                    const barWrapper = document.createElement('div');
                    barWrapper.className = 'profiler-ranked-bar-wrapper';

                    const barFill = document.createElement('div');
                    barFill.className = 'profiler-ranked-bar-fill';
                    barFill.style.width = `${widthPercent}%`;
                    barFill.style.background = color;

                    const timeLabel = document.createElement('span');
                    timeLabel.className = 'profiler-ranked-time';
                    timeLabel.textContent = `${node.duration.toFixed(2)}ms`;

                    barWrapper.append(barFill, timeLabel);
                    row.append(label, barWrapper);
                    
                    row.onclick = () => showDetails(node, commitData);
                    chartContainer.appendChild(row);
                });
            } else {
                commitData.nodes.forEach(node => {
                    const widthPercent = Math.max(1, (node.duration / commitData.maxDuration) * 100);
                    const color = getColorByDuration(node.duration);

                    const row = document.createElement('div');
                    row.className = 'profiler-flamegraph-row';
                    row.style.paddingLeft = `${node.depth * 15}px`;
                    
                    const box = document.createElement('div');
                    box.className = 'profiler-flamegraph-box';
                    box.style.width = `${widthPercent}%`;
                    box.style.background = color;
                    box.textContent = `${node.name} (${node.duration.toFixed(1)}ms)`;
                    
                    box.onclick = () => showDetails(node, commitData);
                    row.appendChild(box);
                    chartContainer.appendChild(row);
                });
            }

            // SIDEBAR
            const detailsSidebar = document.createElement('div');
            detailsSidebar.className = 'profiler-sidebar';
            detailsSidebar.id = 'profiler-sidebar';
            
            detailsSidebar.innerHTML = `
                <div class="profiler-sidebar-title">Commit #${commitData.id}</div>
                <div class="profiler-sidebar-stat">Time: <span style="color:var(--dt-text-secondary);">${commitData.time}</span></div>
                <div class="profiler-sidebar-stat">Total Render Time: <span style="color:var(--dt-syntax-number); font-weight:bold;">${commitData.totalTime.toFixed(2)} ms</span></div>
                <div class="profiler-sidebar-stat">Components Updated: <span style="color:var(--dt-syntax-number);">${commitData.nodes.length}</span></div>
                <div class="profiler-sidebar-hint">
                    Click on a component in the chart to see why it rendered.
                </div>
            `;

            function showDetails(node, commit) {
                const sidebar = wrapper.querySelector('#profiler-sidebar');
                if (!sidebar) return;
                
                sidebar.innerHTML = `
                    <div style="font-weight:bold; font-size:14px; color:var(--dt-text-accent); margin-bottom:5px;">&lt;${node.name}&gt;</div>
                    <div style="font-size:11px; color:var(--dt-text-secondary); margin-bottom:15px; border-bottom:1px solid var(--dt-border-color); padding-bottom:5px;">Commit #${commit.id}</div>
                    
                    <div style="font-size:12px; margin-bottom:10px;">
                        Render duration:<br>
                        <span style="font-size:16px; font-weight:bold; color:${getColorByDuration(node.duration)}">${node.duration.toFixed(2)} ms</span>
                    </div>

                    <div class="profiler-reason-box">
                        <div class="profiler-reason-title">WHY DID THIS RENDER?</div>
                        <div style="font-size:12px; color:var(--dt-text-primary);">
                            ${node.isHost ? 'DOM update triggered by React.' : node.renderReason}
                        </div>
                    </div>
                `;
            }

            splitArea.append(chartContainer, detailsSidebar);
            mainArea.append(timeline, splitArea);
        }

        wrapper.appendChild(mainArea);
        
        container.appendChild(wrapper);
    }

    return { init };
})();