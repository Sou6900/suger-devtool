// src/modules/source/WatchManager.js

window.MyDevTool = window.MyDevTool || {};
window.MyDevTool.WatchManager = (function () {

  let container = null;
  let SourceDebugger = null;
  let SVGs = null;
  let expressions = []; 

  function init(containerEl, _engine, sourceDebugger, svgs) {
    container = containerEl;
    SourceDebugger = sourceDebugger;
    SVGs = svgs;
    loadExpressions();
    renderList();
  }

  function loadExpressions() {
    try {
      const saved = localStorage.getItem('devtool-watch-expressions');
      if (saved) expressions = JSON.parse(saved);
    } catch (e) { expressions = []; }
  }

  function saveExpressions() {
    localStorage.setItem('devtool-watch-expressions', JSON.stringify(expressions));
  }

  // Input UI (i18n)
  function showInput() {
    const i18n = window.MyDevTool.LanguageManager; // ✅
    if (!container) return;
    const existing = container.querySelector('.watch-input-row');
    if (existing) { existing.querySelector('input').focus(); return; }

    const wrapper = document.createElement('div');
    wrapper.className = 'watch-input-row';
    
    const input = document.createElement('input');
    input.className = 'watch-input-field';
    input.placeholder = i18n ? i18n.t('source.add_expression') : 'Add expression...';
    input.type = 'text';
    
    const closeBtn = document.createElement('span');
    closeBtn.className = 'watch-input-close';
    closeBtn.innerHTML = '×';
    
    wrapper.appendChild(input);
    wrapper.appendChild(closeBtn);
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const val = input.value.trim();
            if (val) { addExpression(val); wrapper.remove(); }
        } else if (e.key === 'Escape') { wrapper.remove(); }
    });
    closeBtn.addEventListener('click', () => wrapper.remove());
    container.insertBefore(wrapper, container.firstChild);
    input.focus();
  }

  function addExpression(expr) {
    if (!expressions.includes(expr)) {
        expressions.push(expr);
        saveExpressions();
        update();
    }
  }

  function removeExpression(index) {
    expressions.splice(index, 1);
    saveExpressions();
    renderList(); 
  }
  
  function refresh() { update(); }

  function update() {
    if (!container || !SourceDebugger) return;
    const isPaused = SourceDebugger.isPaused();
    
    const results = expressions.map(expr => {
      if (!isPaused) return { expr, value: undefined, available: false };
      try {
        const res = SourceDebugger.evalInPausedScope(expr);
        return { expr, value: res, available: true };
      } catch (e) {
        return { expr, value: e, error: true, available: true };
      }
    });
    renderList(results);
  }

  function renderList(results = null) {
    const i18n = window.MyDevTool.LanguageManager;
    const inputRow = container.querySelector('.watch-input-row');
    container.innerHTML = '';
    if (inputRow) container.appendChild(inputRow);

    const dataToShow = results || expressions.map(e => ({ expr: e, available: false }));

    if (dataToShow.length === 0 && !inputRow) {
        const noWatchMsg = i18n ? i18n.t('source.no_watch_expr') : 'No watch expressions';
        container.innerHTML += `<div class="placeholder">${noWatchMsg}</div>`;
    }

    dataToShow.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'watch-expression-row';
      
      const content = document.createElement('div');
      content.className = 'watch-content';
      
      const nameSpan = document.createElement('span');
      nameSpan.className = 'watch-name';
      nameSpan.textContent = item.expr + ": ";
      
      const valSpan = document.createElement('span');
      valSpan.className = 'watch-value';
      
  
      if (!item.available) {
         valSpan.textContent = i18n ? i18n.t('source.not_available') : "(not available)";
         valSpan.style.color = "#aaa";
      } else if (item.error) {
         valSpan.textContent = i18n ? i18n.t('source.not_defined') : "<not defined>"; 
         valSpan.className = "watch-error";
         valSpan.title = item.value;
      } else {
         const value = item.value;

        if (value === undefined) {
            valSpan.textContent = i18n ? i18n.t('source.undefined') : "undefined"; 
            valSpan.style.color = "#888";
         } else if (value === null) {
            valSpan.textContent = i18n ? i18n.t('source.null') : "null"; 
            valSpan.style.color = "#888";
         } else if (typeof value === 'number') {
            valSpan.textContent = String(value); valSpan.style.color = "#098658";
         } else if (typeof value === 'boolean') {
            valSpan.textContent = String(value); valSpan.style.color = "#0000ff";
         } else if (typeof value === 'string') {
            valSpan.textContent = `"${value}"`; valSpan.style.color = "#a31515";
         } 
         // (Object/Node)
         else {
             try {
                 const engine = window.MyDevTool.ConsoleEngine;
                 let formatted;

                 if (engine && typeof engine.formatOutput === 'function') {
                     formatted = engine.formatOutput(value);
                 } else {
                     formatted = String(value);
                 }

                 if (formatted instanceof Node) {
                    if (value instanceof Node && formatted === value) {
                        const span = document.createElement('span');
                        span.className = 'console-dom-node';
                        span.style.color = '#881280';
                        span.textContent = `<${value.tagName.toLowerCase()}>`;
                        valSpan.appendChild(span);
                    } else {
                        valSpan.appendChild(formatted);
                    }
                 } else {
                    valSpan.innerHTML = formatted;
                 }

             } catch (e) {
                 valSpan.textContent = String(value); 
             }
         }
      }
      
      content.appendChild(nameSpan);
      content.appendChild(valSpan);
      
      const delBtn = document.createElement('span');
      delBtn.className = 'watch-delete';
      delBtn.innerHTML = '×';
      delBtn.onclick = () => removeExpression(index);
      
      row.appendChild(content);
      row.appendChild(delBtn);
      container.appendChild(row);
    });
  }

  return { init, showInput, refresh, update, addExpression };
})();