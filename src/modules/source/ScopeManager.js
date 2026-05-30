window.MyDevTool = window.MyDevTool || {};
window.MyDevTool.ScopeManager = (function () {
  
  let container = null;
  let ConsoleEngine = null;
  let JSONFormatter = null;
  let SVGs = null;
  
  function init(containerEl, engine, formatter, svg_icons) {
    // console.log("[ScopeManager] Initializing...");
    
    if (!containerEl) {
      console.error("[ScopeManager] ERROR: containerEl is null!");
      return;
    }
    if (!engine) {
      console.error("[ScopeManager] ERROR: ConsoleEngine is null!");
      return;
    }
    
    container = containerEl;
    ConsoleEngine = engine;
    JSONFormatter = formatter;
    SVGs = svg_icons;
    clear(); 
  }

  function clear() {
    if (container) {
      container.innerHTML = '<div class="placeholder">Not paused</div>';
    }
  }

  function update() {
    // console.log("[ScopeManager] Updating scope view...");
    
    if (!container || !ConsoleEngine) {
      console.error("[ScopeManager] ERROR: Not initialized properly.");
      if (container) {
        container.innerHTML = '<div class="placeholder">Scope unavailable.</div>';
      }
      return;
    }

    clear();
    
    const sandbox = ConsoleEngine.sandboxWindow;
    
    if (!sandbox) {
      console.error("[ScopeManager] ERROR: Sandbox is null!");
      container.innerHTML = '<div class="placeholder">Sandbox unavailable.</div>';
      return;
    }

    renderLocalScope(sandbox);
    renderGlobalScope();
  }
  
  // ========== GLOBAL SCOPE ==========
  function renderGlobalScope() {
    const sandbox = ConsoleEngine.sandboxWindow;
    if (!sandbox) return; 

    const section = document.createElement('div');
    section.className = 'collapsible-section';
    
    const header = document.createElement('div');
    header.className = 'collapsible-header'; 
    
    const toggleSVG = SVGs?.collapse || '<svg class="toggle" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"></path></svg>';
    header.innerHTML = `
      ${toggleSVG.replace('<svg', '<svg class="toggle" style="transform: rotate(-90deg);"')}
      <span>Global</span>
      <span class="scope-global-name">Window</span>
    `;
    
    const contentEl = document.createElement('div');
    contentEl.className = 'collapsible-content hidden'; 
    
    let isExpanded = false;
    let isLoaded = false;
    let currentCount = 0;
    let nextBatchAdd = 10;
    let totalProps = [];
    
    function renderMore() {
      const btn = contentEl.querySelector('.load-more-btn');
      if (btn) btn.remove();

      const end = Math.min(currentCount + nextBatchAdd, totalProps.length);

      for (let i = currentCount; i < end; i++) {
        const name = totalProps[i];
        let val;
        try {
          val = sandbox[name];
        } catch {
          continue;
        }

        const row = document.createElement('div');
        row.className = 'json-formatter-prop';

        const keyEl = document.createElement('span');
        keyEl.textContent = name + ': ';
        keyEl.className = 'json-formatter-prop-key';
        row.appendChild(keyEl);

        try {
          const formattedValue = ConsoleEngine.formatOutput(val);
          if (formattedValue instanceof Node) {
            row.appendChild(formattedValue);
          } else {
            const valEl = document.createElement('span');
            valEl.innerHTML = formattedValue; 
            
            if (val === null || val === undefined) valEl.className = 'json-formatter-null';
            else if (typeof val === 'number') valEl.className = 'json-formatter-number';
            else if (typeof val === 'boolean') valEl.className = 'json-formatter-boolean';
            else if (typeof val === 'string') valEl.className = 'json-formatter-string';
            
            row.appendChild(valEl);
          }
        } catch(e) {
          const valEl = document.createElement('span');
          valEl.textContent = `<render error>`;
          valEl.style.color = '#888';
          row.appendChild(valEl);
        }
        
        contentEl.appendChild(row);
      }

      currentCount = end;
      nextBatchAdd += 10;

      if (currentCount < totalProps.length) {
        const moreBtn = document.createElement('div');
        moreBtn.className = 'load-more-btn';
        moreBtn.textContent = `... (${totalProps.length - currentCount} more properties)`;
        moreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          renderMore();
        });
        contentEl.appendChild(moreBtn);
      }
    }

    header.addEventListener('click', () => {
      isExpanded = !isExpanded;
      contentEl.classList.toggle('hidden', !isExpanded);
      header.classList.toggle('open', isExpanded);
      
      const toggle = header.querySelector('.toggle');
      if (toggle) {
        toggle.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)';
      }

      if (isExpanded && !isLoaded) {
        isLoaded = true;
        
        const importantProps = [
          'innerWidth', 'innerHeight', 'location', 'document', 'navigator', 'screen',
          'localStorage', 'sessionStorage', 'history',
          'console', 'performance', 'crypto'
        ];
        const allProps = [];
        try {
          for (let key in sandbox) {
            if (!importantProps.includes(key) &&
                typeof sandbox[key] !== 'function' &&
                !key.startsWith('_')) {
              allProps.push(key);
            }
          }
        } catch (e) {}

        totalProps = [...importantProps.sort(), ...allProps.sort()];
        renderMore();
      }
    });

    section.appendChild(header);
    section.appendChild(contentEl);
    container.appendChild(section);
  }
  
  // ========== LOCAL SCOPE ==========

  function renderLocalScope(sandbox) {
    // console.log('[ScopeManager DEBUG] 1. renderLocalScope() called');
    
    const section = document.createElement('div');
    section.className = 'collapsible-section';
    
    const header = document.createElement('div');
    header.className = 'collapsible-header open';
    
    const toggleSVG = SVGs?.collapse || '<svg class="toggle" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"></path></svg>';
    header.innerHTML = `${toggleSVG}<span>Local</span>`;
    
    const content = document.createElement('div');
    content.className = 'collapsible-content';
    
    const SourceDebugger = window.MyDevTool.SourceDebugger;
    const scopeData = SourceDebugger ? SourceDebugger.getScopeData() : {};
    
    let allVarNames = Object.keys(scopeData);
    
    // Sort: 'this' first
    allVarNames.sort((a, b) => {
      if (a === 'this') return -1;
      if (b === 'this') return 1;
      return a.localeCompare(b);
    });
    
    if (allVarNames.length === 0) {
      content.innerHTML = '<div class="placeholder">(no variables in scope)</div>';
    } else {
      const INITIAL_LOAD = 20;
      let currentlyShowing = Math.min(INITIAL_LOAD, allVarNames.length);
      
      const renderVariables = (startIndex, endIndex) => {
        for (let i = startIndex; i < endIndex; i++) {
          const varName = allVarNames[i];
          const value = scopeData[varName];
          
          if (varName === 'this') {
            renderThisVariable(content, value);
          } else if (value === undefined) {
            renderVariableUnavailable(content, varName);
          } else {
            renderVariable(content, varName, value);
          }
        }
      };
      
      renderVariables(0, currentlyShowing);
      
      if (allVarNames.length > INITIAL_LOAD) {
        const loadMoreBtn = document.createElement('div');
        loadMoreBtn.className = 'scope-load-more';
        loadMoreBtn.innerHTML = `<span>...</span>`;
        loadMoreBtn.style.cssText = `padding: 4px 8px; cursor: pointer; color: #5f6368; font-style: italic; user-select: none;`;
        
        loadMoreBtn.addEventListener('click', () => {
          const remaining = allVarNames.length - currentlyShowing;
          const toLoad = Math.min(20, remaining);
          loadMoreBtn.remove();
          renderVariables(currentlyShowing, currentlyShowing + toLoad);
          currentlyShowing += toLoad;
          
          if (currentlyShowing < allVarNames.length) {
            content.appendChild(loadMoreBtn);
            loadMoreBtn.querySelector('span').textContent = `... (${allVarNames.length - currentlyShowing} more)`;
          }
        });
        
        content.appendChild(loadMoreBtn);
      }
    }
    
    header.addEventListener('click', () => {
      header.classList.toggle('open');
      content.classList.toggle('hidden');
      const toggle = header.querySelector('.toggle');
      if (toggle) {
        toggle.style.transform = header.classList.contains('open') ? 'rotate(0deg)' : 'rotate(-90deg)';
      }
    });
    
    section.appendChild(header);
    section.appendChild(content);
    container.appendChild(section);
  }

  function renderVariable(parentEl, varName, value) {
    const row = document.createElement('div');
    row.className = 'json-formatter-row';
    
    const keyEl = document.createElement('span');
    keyEl.className = 'json-formatter-key';
    keyEl.textContent = `${varName}: `;
    row.appendChild(keyEl);
    
    try {
      if (typeof value === 'function') {
          const valEl = document.createElement('span');
          valEl.className = 'json-formatter-function';
          valEl.style.fontStyle = 'italic';
          valEl.style.color = '#0b73b3'; 
          valEl.textContent = `ƒ ${value.name || '(anonymous)'}()`;
          row.appendChild(valEl);
          parentEl.appendChild(row);
          return;
      }

      const formatted = ConsoleEngine.formatOutput(value);
      
      if (typeof formatted === 'string') {
        const valEl = document.createElement('span');
        if (value === null || value === undefined) valEl.className = 'json-formatter-null';
        else if (typeof value === 'number') valEl.className = 'json-formatter-number';
        else if (typeof value === 'boolean') valEl.className = 'json-formatter-boolean';
        else valEl.className = 'json-formatter-string';
        
        valEl.textContent = formatted;
        row.appendChild(valEl);

      } else if (formatted instanceof Node) {
        if (value instanceof Node && formatted === value) {
            const valEl = document.createElement('span');
            valEl.className = 'console-dom-node';
            valEl.style.color = '#881280';
            valEl.style.cursor = 'pointer';
            let nodeDesc = value.nodeName.toLowerCase();
            if (value.id) nodeDesc += `#${value.id}`;
            if (value.className && typeof value.className === 'string') {
              nodeDesc += `.${value.className.split(' ').join('.')}`;
            }
            valEl.textContent = nodeDesc;
            row.appendChild(valEl);
        } else {
            row.appendChild(formatted);
        }
      }
    } catch (e) {
      const valEl = document.createElement('span');
      valEl.textContent = '<render error>';
      valEl.style.color = 'red';
      row.appendChild(valEl);
    }
    
    parentEl.appendChild(row);
  }

  // Dynamic 'this' Renderer
  function renderThisVariable(parentEl, value) {
    // console.log(`[renderVariable] Rendering 'this':`, value);

    const row = document.createElement('div');
    row.className = 'json-formatter-row';

    const headerRow = document.createElement('div');
    headerRow.className = 'json-formatter-header';

    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.textContent = '▶';
    headerRow.appendChild(arrow);

    const keyEl = document.createElement('span');
    keyEl.className = 'json-formatter-key';
    keyEl.textContent = 'this';
    headerRow.appendChild(keyEl);

    const colonEl = document.createElement('span');
    colonEl.className = 'json-formatter-colon';
    colonEl.textContent = ': ';
    headerRow.appendChild(colonEl);

    const typeEl = document.createElement('span');
    typeEl.className = 'json-formatter-type';
    
    let typeName = 'Object';
    try {
        typeName = value?.constructor?.name || 'Object';
    } catch (e) {}
    
    typeEl.textContent = typeName;
    headerRow.appendChild(typeEl);

    const contentEl = document.createElement('div');
    contentEl.className = 'json-formatter-content';

    let isExpanded = false;
    let currentCount = 0;     
    let nextBatchAdd = 10;    

    let importantProps = [];
    if (typeName === 'Window') {
        importantProps = [
            'innerWidth', 'innerHeight', 'outerWidth', 'outerHeight',
            'location', 'document', 'navigator', 'screen',
            'localStorage', 'sessionStorage', 'history',
            'console', 'performance', 'crypto'
        ];
    }

    const allProps = [];
    try {
      for (let key in value) {
        if (!importantProps.includes(key) &&
            typeof value[key] !== 'function' &&
            !key.startsWith('_')) {
          allProps.push(key);
        }
      }
    } catch (e) {}

    const totalProps = [...importantProps, ...allProps];

    function removeLoadMore() {
      const btn = contentEl.querySelector('.load-more-btn');
      if (btn) btn.remove();
    }

    function renderMore() {
      removeLoadMore();

      const end = Math.min(currentCount + nextBatchAdd, totalProps.length);

      for (let i = currentCount; i < end; i++) {
        const name = totalProps[i];
        let val;
        try {
          val = value[name];
        } catch {
          continue;
        }

        const row = document.createElement('div');
        row.className = 'json-formatter-prop';

        const keyEl = document.createElement('span');
        keyEl.textContent = name + ': ';
        keyEl.className = 'json-formatter-prop-key';
        row.appendChild(keyEl);

        const valEl = document.createElement('span');

        if (val === null) {
          valEl.textContent = 'null';
          valEl.className = 'json-null';
        } else if (val === undefined) {
          valEl.textContent = 'undefined';
          valEl.className = 'json-undefined';
        } else if (typeof val === 'string') {
          valEl.textContent = `"${val.length > 50 ? val.slice(0, 50) + '...' : val}"`;
          valEl.className = 'json-string';
        } else if (typeof val === 'number') {
          valEl.textContent = val;
          valEl.className = 'json-number';
        } else if (typeof val === 'boolean') {
          valEl.textContent = val;
          valEl.className = 'json-boolean';
        } else if (typeof val === 'object') {
          valEl.textContent = val.constructor?.name ?? 'Object';
          valEl.className = 'json-object-type';
        } else {
          valEl.textContent = typeof val;
        }

        row.appendChild(valEl);
        contentEl.appendChild(row);
      }

      currentCount = end;
      nextBatchAdd += 10; 

      if (currentCount < totalProps.length) {
        const moreBtn = document.createElement('div');
        moreBtn.className = 'load-more-btn';
        moreBtn.textContent = `... (${totalProps.length - currentCount} more properties)`;
        moreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          renderMore();
        });
        contentEl.appendChild(moreBtn);
      }
    }

    headerRow.addEventListener('click', () => {
      isExpanded = !isExpanded;
      contentEl.style.display = isExpanded ? 'block' : 'none';
      arrow.style.transform = isExpanded ? 'rotate(90deg)' : 'rotate(0deg)';

      if (isExpanded && currentCount === 0) {
        renderMore();
      }
    });

    row.appendChild(headerRow);
    row.appendChild(contentEl);
    parentEl.appendChild(row);
  }

  function renderVariableUnavailable(parentEl, varName) {
    const row = document.createElement('div');
    row.className = 'json-formatter-row';
    
    const keyEl = document.createElement('span');
    keyEl.className = 'json-formatter-key';
    keyEl.textContent = `${varName}: `;
    row.appendChild(keyEl);
    
    const valEl = document.createElement('span');
    valEl.className = 'json-formatter-string';
    valEl.textContent = '<value unavailable>';
    valEl.style.fontStyle = 'italic';
    valEl.style.color = '#888';
    row.appendChild(valEl);
    
    parentEl.appendChild(row);
  }
  
  return { init, update, clear };
})();