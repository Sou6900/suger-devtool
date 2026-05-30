// src/modules/console/ConsoleLog.js

window.MyDevTool = window.MyDevTool || {};
window.MyDevTool.ConsoleLog = (function () {

  let printLineCallback = null;
  let settingsCallback = null;
  let messages = [];
  let SVGs = null; 
  
  let groupStack = [];

  let counts = { all: 0, user: 0, error: 0, warn: 0, info: 0, table: 0 };

  function init(printCallback, settingsCb) {
    printLineCallback = printCallback;
    settingsCallback = settingsCb;
    SVGs = window.MyDevTool.SVGs || {}; 
  }

  function getSettings() { return settingsCallback ? settingsCallback(): {}; }
  function uid() { return 'm' + Math.random().toString(36).slice(2, 9); }
  function getCounts() { return counts; }

  function highlightSyntax(code) {
    if (!code) return '';
    const strings = [];
    code = code.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, (match) => { strings.push(match); return `__STRING_${strings.length - 1}__`; });
    const comments = [];
    code = code.replace(/(\/\/.*$)/gm, (match) => { comments.push(match); return `__COMMENT_${comments.length - 1}__`; });
    code = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    code = code.replace(/\b(const|let|var|function|return|if|else|for|while|switch|case|break|continue|new|class|this|async|await|try|catch|import|export|default|typeof|void|delete|in|instanceof|of)\b/g, '__TOK_KEY_S__$1__TOK_END__');
    code = code.replace(/\b(true|false|null|undefined|NaN|Infinity)\b/g, '__TOK_BOOL_S__$1__TOK_END__');
    code = code.replace(/\b(0x[0-9a-fA-F]+|0b[01]+|\d+\.?\d*)\b/g, '__TOK_NUM_S__$1__TOK_END__');
    code = code.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '__TOK_KEYNAME_S__$1__TOK_END__:');
    code = code.replace(/([{}()\[\]=;,.])/g, '__TOK_PUNC_S__$1__TOK_END__');
    code = code.replace(/__TOK_KEY_S__/g, '<span class="token-keyword">')
      .replace(/__TOK_BOOL_S__/g, '<span class="token-boolean">')
      .replace(/__TOK_NUM_S__/g, '<span class="token-number">')
      .replace(/__TOK_KEYNAME_S__/g, '<span class="token-key">')
      .replace(/__TOK_PUNC_S__/g, '<span class="token-punct">')
      .replace(/__TOK_END__/g, '</span>');
    strings.forEach((str, i) => { const escaped = str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); code = code.replace(`__STRING_${i}__`, `<span class="token-string">${escaped}</span>`); });
    comments.forEach((comment, i) => { const escaped = comment.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); code = code.replace(`__COMMENT_${i}__`, `<span class="token-comment">${escaped}</span>`); });
    return code;
  }

  function renderTable(data) {
    const table = document.createElement('table');
    table.className = 'console-table';
    let headers = [], rows = [];
    if (Array.isArray(data)) {
      if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
        headers = ['(index)', ...Object.keys(data[0])];
        rows = data.map((item, index) => [index, ...Object.values(item)]);
      } else {
        headers = ['(index)', 'Value'];
        rows = data.map((item, index) => [index, item]);
      }
    } else if (typeof data === 'object' && data !== null) {
      headers = ['(key)', 'Value'];
      rows = Object.entries(data);
    } else { return document.createTextNode(String(data)); }
    const thead = document.createElement('thead'); const trHead = document.createElement('tr');
    headers.forEach(h => { const th = document.createElement('th'); th.textContent = h; trHead.appendChild(th); });
    thead.appendChild(trHead); table.appendChild(thead); const tbody = document.createElement('tbody');
    rows.forEach(row => {
      const tr = document.createElement('tr');
      row.forEach(cell => {
        const td = document.createElement('td');
        if (typeof cell === 'string') td.innerHTML = `<span class="val-string">'${cell}'</span>`;
        else if (typeof cell === 'number') td.innerHTML = `<span class="val-number">${cell}</span>`;
        else if (typeof cell === 'boolean') td.innerHTML = `<span class="val-boolean">${cell}</span>`;
        else if (cell === null || cell === undefined) td.innerHTML = `<span class="val-null">${String(cell)}</span>`;
        else if (typeof cell === 'object') td.textContent = JSON.stringify(cell);
        else td.textContent = String(cell);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody); 
    const wrapper = document.createElement('div');
    wrapper.className = 'console-table-wrapper';
    wrapper.appendChild(table);
    return wrapper; 
  }

  function addMessage(content, className = 'console-output-line', meta = {}, dontPrint = false) {
    const id = uid();

    //  NESTED GROUP LOGIC
    if (meta && meta.type === 'group') {
        const groupWrapper = document.createElement('div');
        groupWrapper.className = 'console-group-wrapper';
        groupWrapper.dataset.msgId = id;

        const header = document.createElement('div');
        header.className = 'console-line console-group-header console-output-line';
        
        const arrow = document.createElement('span');
        arrow.textContent = '▶';
        arrow.className = 'token-punct group-arrow';
        
        const labelSpan = document.createElement('span');
        labelSpan.className = 'console-group-title';
        if (content instanceof Node) labelSpan.appendChild(content);
        else labelSpan.textContent = String(content);

        header.appendChild(arrow);
        header.appendChild(labelSpan);

        // Source Link for Group Header
        if (meta.source) {
            const sourceSpan = document.createElement('span');
            sourceSpan.className = 'console-source-link';
            let displayText = (typeof meta.source === 'object') ? meta.source.text : meta.source;
            if (typeof displayText === 'string') displayText = displayText.replace(/^https?:\/\//, '');
            sourceSpan.textContent = displayText;
            if (typeof meta.source === 'object' && meta.source.url) {
                sourceSpan.style.cursor = 'pointer';
                sourceSpan.title = meta.source.url;
                sourceSpan.onclick = (e) => {
                    e.stopPropagation();
                    if (window.MyDevTool.DevTool && window.MyDevTool.SourceTab) {
                        window.MyDevTool.DevTool.switchTab('source');
                        window.MyDevTool.SourceTab.openFile(meta.source.url, meta.source.line);
                    }
                };
            }
            header.appendChild(sourceSpan);
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'console-group-content';
        
        let isExpanded = !meta.collapsed;
        contentDiv.style.display = isExpanded ? 'block' : 'none';
        arrow.style.transform = isExpanded ? 'rotate(90deg)' : 'rotate(0deg)';

        header.onclick = (e) => {
            e.stopPropagation();
            isExpanded = !isExpanded;
            contentDiv.style.display = isExpanded ? 'block' : 'none';
            arrow.style.transform = isExpanded ? 'rotate(90deg)' : 'rotate(0deg)';
        };

        groupWrapper.appendChild(header);
        groupWrapper.appendChild(contentDiv);

        if (groupStack.length > 0) {
            groupStack[groupStack.length - 1].appendChild(groupWrapper);
            if (!dontPrint) printLineCallback(groupWrapper, true); // Update scroll
        } else {
            if (!dontPrint) printLineCallback(groupWrapper, true);
        }

        groupStack.push(contentDiv);
        messages.push({ id, type: 'group', sig: 'group', meta, count: 1 });
        return;
    }

    if (meta && meta.type === 'groupEnd') {
        if (groupStack.length > 0) groupStack.pop();
        return;
    }

    // NORMAL MESSAGE LOGIC
    const type = (meta && meta.type === 'table') ? 'table' : (className || 'console-output-line');
    counts.all++;
    if (type.includes('console-input-line')) counts.user++;
    else if (type.includes('console-error-line')) counts.error++;
    else if (type.includes('console-warn-line')) counts.warn++;
    else if (type === 'table') counts.table++;
    else counts.info++; 

    let textSignature = "";
    if (typeof content === 'string') textSignature = content;
    else if (content instanceof Node) textSignature = content.textContent || content.innerHTML || "";
    else if (content instanceof DocumentFragment) textSignature = content.textContent || "";
    else { try { textSignature = JSON.stringify(content); } catch(e) { textSignature = String(content); } }

    const settings = getSettings();
    const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
    const shouldGroup = settings.groupSimilar && (!meta || !meta.preventGroup) && type !== 'table';

    if (shouldGroup && lastMsg && lastMsg.sig === textSignature && lastMsg.type === type && lastMsg.type !== 'group') {
      lastMsg.count = (lastMsg.count || 1) + 1;
      const root = window.MyDevTool.root || document;
      const lineNode = root.querySelector(`[data-msg-id="${lastMsg.id}"]`);
      if (lineNode) {
        let badge = lineNode.querySelector('.devtool-counter-badge');
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'devtool-counter-badge';
          lineNode.appendChild(badge);
          lineNode.classList.add('has-badge');
        }
        badge.textContent = String(lastMsg.count);
        if (lastMsg.count > 1) badge.classList.add('active');
      }
      return;
    }

    const nodeToAppend = createNode(content, type, meta);
    nodeToAppend.dataset.msgId = id;

    // APPEND TO CURRENT GROUP OR ROOT
    if (groupStack.length > 0) {
        groupStack[groupStack.length - 1].appendChild(nodeToAppend);
        if (!dontPrint) printLineCallback(nodeToAppend, true); // Force scroll
    } else {
        if (!dontPrint) printLineCallback(nodeToAppend, true);
    }

    messages.push({ id, type, sig: textSignature, meta, count: 1 });
  }

  function createNode(content, className, meta) {
    const line = document.createElement('div');
    line.className = 'console-line console-block-wrapper ' + (className === 'table' ? 'console-output-line' : className);

    const messageWrapper = document.createElement('span');
    messageWrapper.className = 'console-message-wrapper';
    messageWrapper.style.display = 'flex'; 

    const iconSpan = document.createElement('span');
    iconSpan.className = 'console-icon';
    let hasIcon = false;

    if (className.includes('console-input-line')) {
      if (SVGs && SVGs.inputSVG) { iconSpan.innerHTML = SVGs.inputSVG; iconSpan.classList.add('icon-input'); hasIcon = true; }
    } else if (className.includes('console-output-line') || className === 'table') {
      if (SVGs && SVGs.outputSVG) { iconSpan.innerHTML = SVGs.outputSVG; iconSpan.classList.add('icon-output'); hasIcon = true; }
    }

    if (hasIcon) messageWrapper.appendChild(iconSpan);

    const contentWrapper = document.createElement('span');
    contentWrapper.className = 'console-content-text';

    if (className === 'table') {
      const tableNode = renderTable(content);
      contentWrapper.appendChild(tableNode);

      if (typeof content === 'object' && content !== null && window.MyDevTool.ConsoleEngine) {
         const objectNode = window.MyDevTool.ConsoleEngine.formatOutput(content, false);
         objectNode.style.marginTop = '8px';
         objectNode.style.paddingTop = '8px';
         objectNode.style.borderTop = '1px dashed var(--dt-border-light)';
         contentWrapper.appendChild(objectNode);
      }
    } else {
      if (className.includes('console-input-line') && typeof content === 'string') contentWrapper.innerHTML = highlightSyntax(content);
      else if (content instanceof Node) contentWrapper.appendChild(content);
      else if (typeof content === 'string') contentWrapper.textContent = content;
      else contentWrapper.textContent = String(content);
    }

    messageWrapper.appendChild(contentWrapper);
    line.appendChild(messageWrapper);

    const sourceSpan = document.createElement('span');
    sourceSpan.className = 'console-source-link';
    
    if (meta && meta.source) {
      let displayText = (typeof meta.source === 'object') ? meta.source.text : meta.source;
      if (typeof displayText === 'string') displayText = displayText.replace(/^https?:\/\//, '');
      sourceSpan.textContent = displayText;
      if (typeof meta.source === 'object' && meta.source.url) {
          sourceSpan.style.cursor = 'pointer';
          sourceSpan.style.textDecoration = 'underline'; 
          sourceSpan.title = meta.source.url; 
          sourceSpan.onclick = (e) => {
              e.stopPropagation();
              if (window.MyDevTool.DevTool && window.MyDevTool.SourceTab) {
                  window.MyDevTool.DevTool.switchTab('source');
                  window.MyDevTool.SourceTab.openFile(meta.source.url, meta.source.line);
              }
          };
      }
    } else { sourceSpan.textContent = ' '; }
    
    line.appendChild(sourceSpan);
    const badge = document.createElement('span');
    badge.className = 'console-group-count';
    badge.style.display = 'none';
    line.appendChild(badge);
    return line;
  }

  function clearLogs(clearBuffer = true) {
    if (clearBuffer) messages = [];
    counts = { all: 0, user: 0, error: 0, warn: 0, info: 0, table: 0 };
    groupStack = [];
  }

  function getMessages() { return messages; }
  function getGroupMap() { return null; }
  function getMessageCount() { return messages.length; }
  function restoreMessages(parsedMessages) {
    messages = []; parsedMessages.forEach(msg => { addMessage(msg.text, msg.type, msg.meta || {}); });
  }
  function collectHistorySuggestions(token) {
    const results = new Set(); for (let i = messages.length - 1; i >= 0 && results.size < 10; i--) {
      const m = messages[i]; if (m.type && m.type.indexOf('console-input-line') !== -1 && m.text) {
        if (m.text.toLowerCase().startsWith(token.toLowerCase())) results.add(m.text);
      }
    } return Array.from(results);
  }

  return { init, addMessage, createNode, clearLogs, getMessages, getGroupMap, getMessageCount, restoreMessages, collectHistorySuggestions, getCounts };
})();