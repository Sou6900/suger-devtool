// src/modules/console/ConsoleEngine.js

window.MyDevTool = window.MyDevTool || {};
window.MyDevTool.ConsoleEngine = (function () {

    const DevToolPauseError = window.MyDevTool.SourceDebugger?.DevToolPauseError;
    let printCallback = null;
    let isSilentEval = false;
    let commandHistory = [];
    let historyIndex = 0;
    let sandboxFrame = null;
    let sandboxWindow = null;
    let userVariables = new Set();
    const vmScripts = new Map();

    const originalConsole = {
        log: console.log.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
        info: console.info.bind(console),
        table: console.table ? console.table.bind(console) : null,
        clear: console.clear ? console.clear.bind(console) : null
    };

    function getHistoryUp() { if (historyIndex > 0) { historyIndex--; return commandHistory[historyIndex]; } return commandHistory[0] || ''; }
    function getHistoryDown() { if (historyIndex < commandHistory.length) { historyIndex++; if (historyIndex === commandHistory.length) return ''; return commandHistory[historyIndex]; } return ''; }
    function resetHistoryIndex() { historyIndex = commandHistory.length; }

    function safeStringify(obj) {
        const cache = new Set();
        try {
            return JSON.stringify(obj, (key, value) => {
                if (typeof value === 'object' && value !== null) {
                    if (cache.has(value)) return '[Circular]';
                    cache.add(value);
                }
                if (typeof value === 'function') return `[Function: ${value.name || 'anonymous'}]`;
                if (typeof value === 'symbol') return value.toString();
                if (value instanceof Error) return { name: value.name, message: value.message };
                if (value instanceof HTMLElement) return `<${value.tagName.toLowerCase()}>`;
                if (value instanceof Window) return '[Window]';
                return value;
            }, 2);
        } catch (e) { return "{}"; }
    }

    function formatPreviewSafe(val) {
        if (typeof val === 'string') return `"${val}"`;
        if (typeof val === 'function') return `ƒ`;
        if (typeof val === 'symbol') return val.toString();
        if (typeof val === 'object' && val !== null) {
            if (Array.isArray(val)) return `Array(${val.length})`;
            if (val instanceof Error) return val.name;
            if (val instanceof HTMLElement) return `<${val.tagName.toLowerCase()}>`;
            return '{…}';
        }
        return String(val);
    }

    function getObjectPreview(obj) {
        if (typeof obj !== 'object' || obj === null) return String(obj);
        if (Array.isArray(obj)) {
            let items = [];
            for (let i = 0; i < Math.min(obj.length, 3); i++) {
                try { items.push(formatPreviewSafe(obj[i])); } catch (e) { items.push('(...)'); }
            }
            if (obj.length > 3) items.push('…');
            return `Array(${obj.length}) [${items.join(', ')}]`;
        }
        let prefixName = obj.constructor && obj.constructor.name !== 'Object' ? obj.constructor.name : 'Object';
        let preview = `${prefixName} {`;
        let items = [];
        try {
            let keys = Object.keys(obj);
            for (let i = 0; i < Math.min(keys.length, 5); i++) {
                items.push(`${keys[i]}: ${formatPreviewSafe(obj[keys[i]])}`);
            }
            if (keys.length > 5) items.push('…');
        } catch (e) {
            items.push('…');
        }
        return preview + items.join(', ') + '}';
    }

    // function Signature Parser
    function getFunctionDetails(fn) {
        try {
            const str = fn.toString().trim();
            const name = fn.name ? ` ${fn.name}` : '';

            // Native code Check
            if (str.includes('[native code]')) return { type: 'function', text: `${name}()`, prefix: 'ƒ' };
            // Class Check
            if (str.startsWith('class')) return { type: 'class', text: `class ${fn.name || 'Anonymous'}`, prefix: '' };

            // Arrow function parsing ($ => {...} or (a,b) => {...})
            const arrowMatch = str.match(/^(async\s+)?(\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>\s*([\s\S]*)/);
            if (arrowMatch) {
                const asyncPart = arrowMatch[1] || '';
                const paramsPart = arrowMatch[2].replace(/[\r\n\s]+/g, ' ').trim();
                let bodyPart = arrowMatch[3] || '';

                if (bodyPart.startsWith('{')) {
                    bodyPart = '{…}';
                } else {
                    let firstLine = bodyPart.split('\n')[0].trim();
                    bodyPart = firstLine.length > 50 ? firstLine.substring(0, 50) + '…' : firstLine;
                }

                return { type: 'arrow', text: `${asyncPart}${paramsPart} => ${bodyPart}`, prefix: '' };
            }

            // Normal function / Method parsing
            const start = str.indexOf('(');
            let params = '';
            if (start !== -1) {
                let depth = 0;
                for (let i = start; i < str.length; i++) {
                    if (str[i] === '(') depth++;
                    else if (str[i] === ')') {
                        depth--;
                        if (depth === 0) {
                            params = str.substring(start + 1, i).replace(/[\r\n\s]+/g, ' ').trim();
                            if (params.length > 50) params = params.substring(0, 50) + '…';
                            break;
                        }
                    }
                }
            }
            return { type: 'function', text: `${name}(${params})`, prefix: 'ƒ' };
        } catch (e) {
            return { type: 'function', text: `${fn.name ? ' ' + fn.name : ''}()`, prefix: 'ƒ' };
        }
    }

    // UNIVERSAL OBJECT INSPECTOR
    function renderObject(obj, customLabel = null, keyName = null) {
        const container = document.createElement('div');
        container.className = 'json-formatter-row';
        container.setAttribute('data-copy-obj', safeStringify(obj));

        const header = document.createElement('div');
        header.style.cursor = 'pointer';
        header.style.display = 'flex';
        header.style.alignItems = 'flex-start';
        header.style.fontFamily = 'monospace';
        header.style.fontSize = '12px';
        header.style.lineHeight = '1.4';

        const arrow = document.createElement('span');
        arrow.textContent = '▶';
        arrow.style.fontSize = '10px';
        arrow.style.marginRight = '5px';
        arrow.style.marginTop = '2px';
        arrow.style.transition = 'transform 0.1s';
        arrow.className = 'token-punct';

        header.appendChild(arrow);

        if (keyName) {
            const kSpan = document.createElement('span');
            kSpan.className = 'token-key';
            kSpan.textContent = keyName + ": ";
            kSpan.style.marginRight = '5px';
            header.appendChild(kSpan);
        }

        const title = document.createElement('span');
        let isError = obj instanceof Error;
        let isFunc = typeof obj === 'function';

        if (customLabel) {
            title.textContent = customLabel;
            title.style.fontStyle = 'italic';
            title.className = isFunc ? 'token-keyword' : 'token-tag';
        } else if (isError) {
            title.textContent = `${obj.name}: ${obj.message}`;
            title.className = 'token-error';
            title.style.fontWeight = 'bold';
        } else if (isFunc) {
            title.innerHTML = '';
            const details = getFunctionDetails(obj);

            if (details.prefix) {
                const fSpan = document.createElement('span');
                fSpan.textContent = details.prefix;
                fSpan.className = 'token-keyword';
                fSpan.style.fontStyle = 'italic';
                fSpan.style.marginRight = '2px';
                title.appendChild(fSpan);
            }

            const nameSpan = document.createElement('span');
            nameSpan.textContent = details.text;
            nameSpan.style.color = 'var(--dt-text-primary)';
            nameSpan.style.fontStyle = 'normal';
            title.appendChild(nameSpan);
        } else {
            title.textContent = getObjectPreview(obj);
            title.style.fontStyle = 'italic';
            title.style.color = 'var(--dt-text-secondary)';
        }

        header.appendChild(title);
        container.appendChild(header);

        const content = document.createElement('div');
        content.style.display = 'none';
        content.style.marginLeft = '12px'; // Chrome standard indent
        content.style.borderLeft = '1px solid var(--dt-border-light)';
        content.style.paddingLeft = '6px';
        container.appendChild(content);

        let isExpanded = false;
        let isLoaded = false;
        let allKeys = [];
        let allDescriptors = new Map();
        let currentCount = 0;
        const BATCH_SIZE = 50;

        header.onclick = (e) => {
            e.stopPropagation();
            isExpanded = !isExpanded;
            content.style.display = isExpanded ? 'block' : 'none';
            arrow.style.transform = isExpanded ? 'rotate(90deg)' : 'rotate(0deg)';

            if (isExpanded && !isLoaded) {
                isLoaded = true;
                loadKeys();
                renderBatch();
            }
        };

        function loadKeys() {
            allDescriptors.clear();
            allKeys = [];
            try {
                const descriptors = Object.getOwnPropertyDescriptors(obj);

                for (let key of Reflect.ownKeys(descriptors)) {
                    if (obj === window && key === 'MyDevTool') continue;

                    if ((obj === window.MyDevTool || (window.suger && obj === window.suger.modules)) &&
                        (key === 'LicenseManager' || key === 'SecureStorage' || key === 'ActivationUI')) {
                        continue;
                    }

                    allDescriptors.set(key, descriptors[key]);
                    allKeys.push(key);
                }

                allKeys.sort((a, b) => {
                    if (isError) {
                        if (a === 'message' && b !== 'message') return -1;
                        if (b === 'message' && a !== 'message') return 1;
                        if (a === 'stack' && b !== 'stack') return -1;
                        if (b === 'stack' && a !== 'stack') return 1;
                    }
                    const aStr = String(a);
                    const bStr = String(b);
                    const numA = parseInt(aStr, 10);
                    const numB = parseInt(bStr, 10);
                    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                    if (!isNaN(numA)) return -1;
                    if (!isNaN(numB)) return 1;
                    return aStr.localeCompare(bStr);
                });

                allKeys.push('[[Prototype]]');
            } catch (e) {
                allKeys = ["<Error accessing properties>"];
            }
        }

        function renderBatch() {
            const frag = document.createDocumentFragment();
            const end = Math.min(currentCount + BATCH_SIZE, allKeys.length);

            for (let i = currentCount; i < end; i++) {
                const key = allKeys[i];

                if (key === '[[Prototype]]') {
                    const proto = Object.getPrototypeOf(obj);
                    if (proto) {
                        const protoNode = renderObject(proto, "[[Prototype]]");
                        protoNode.style.marginTop = '2px';
                        frag.appendChild(protoNode);
                    } else {
                        const row = document.createElement('div');
                        row.style.fontFamily = 'monospace';
                        row.style.fontSize = '12px';
                        row.style.marginTop = '2px';
                        row.style.display = 'flex';

                        const kSpan = document.createElement('span');
                        kSpan.textContent = "[[Prototype]]: ";
                        kSpan.style.color = 'var(--dt-syntax-comment)';
                        const vSpan = document.createElement('span');
                        vSpan.textContent = "null";
                        vSpan.className = 'token-null';
                        vSpan.style.marginLeft = '5px';

                        row.appendChild(kSpan);
                        row.appendChild(vSpan);
                        frag.appendChild(row);
                    }
                    continue;
                }

                let keyDisplay = typeof key === 'symbol' ? key.toString() : String(key);
                const descriptor = allDescriptors.get(key);

                const createKeySpan = (prefix = '') => {
                    const span = document.createElement('span');
                    span.className = 'token-key';
                    span.textContent = prefix + keyDisplay + ": ";
                    if (typeof key === 'symbol') {
                        span.style.opacity = '0.6';
                        span.style.color = 'var(--dt-text-secondary)';
                    }
                    return span;
                };

                if (descriptor && (descriptor.get || descriptor.set)) {
                    const row = document.createElement('div');
                    row.style.fontFamily = 'monospace';
                    row.style.fontSize = '12px';
                    row.style.marginTop = '2px';
                    row.style.display = 'flex';
                    row.style.alignItems = 'flex-start';

                    let prefix = '';
                    if (descriptor.get && descriptor.set) prefix = 'get/set ';
                    else if (descriptor.get) prefix = 'get ';
                    else if (descriptor.set) prefix = 'set ';

                    const keySpan = createKeySpan(prefix);
                    if (typeof key !== 'symbol') keySpan.style.color = 'var(--dt-syntax-attr-name)';

                    let valSpan = document.createElement('span');
                    valSpan.style.marginLeft = '5px';
                    valSpan.textContent = "(...)";
                    valSpan.className = 'token-punct';
                    valSpan.style.cursor = 'pointer';
                    valSpan.style.fontWeight = 'bold';

                    valSpan.onclick = (e) => {
                        e.stopPropagation();
                        try {
                            const actualValue = obj[key];
                            const formatted = formatOutput(actualValue, true, prefix + keyDisplay);
                            if (formatted instanceof Node && formatted.classList && formatted.classList.contains('json-formatter-row')) {
                                formatted.style.marginTop = '2px';
                                row.parentNode.replaceChild(formatted, row);
                            } else {
                                valSpan.innerHTML = '';
                                if (formatted instanceof Node) valSpan.appendChild(formatted);
                                else valSpan.appendChild(document.createTextNode(String(formatted)));
                                valSpan.onclick = null;
                                valSpan.style.cursor = 'default';
                            }
                        } catch (err) {
                            valSpan.textContent = "<Exception>";
                            valSpan.className = 'token-error';
                        }
                    };
                    row.appendChild(keySpan);
                    row.appendChild(valSpan);
                    frag.appendChild(row);

                } else {
                    try {
                        const val = obj[key];
                        const formatted = formatOutput(val, true, keyDisplay);

                        if (formatted instanceof Node && formatted.classList && formatted.classList.contains('json-formatter-row')) {
                            formatted.style.marginTop = '2px';
                            frag.appendChild(formatted);
                        } else {
                            const row = document.createElement('div');
                            row.style.fontFamily = 'monospace';
                            row.style.fontSize = '12px';
                            row.style.marginTop = '2px';
                            row.style.display = 'flex';
                            row.style.alignItems = 'flex-start';

                            const keySpan = createKeySpan();
                            let valSpan = document.createElement('span');
                            valSpan.style.marginLeft = '5px';

                            if (formatted instanceof Node) valSpan.appendChild(formatted);
                            else valSpan.textContent = String(formatted);

                            row.appendChild(keySpan);
                            row.appendChild(valSpan);
                            frag.appendChild(row);
                        }
                    } catch (e) {
                        const row = document.createElement('div');
                        row.style.fontFamily = 'monospace';
                        row.style.fontSize = '12px';
                        row.style.marginTop = '2px';
                        row.style.display = 'flex';
                        row.style.alignItems = 'flex-start';

                        const keySpan = createKeySpan();
                        let valSpan = document.createElement('span');
                        valSpan.style.marginLeft = '5px';
                        valSpan.textContent = "(Restricted)";
                        valSpan.className = 'token-null';

                        row.appendChild(keySpan);
                        row.appendChild(valSpan);
                        frag.appendChild(row);
                    }
                }
            }

            const oldBtn = content.querySelector('.load-more-btn');
            if (oldBtn) oldBtn.remove();

            content.appendChild(frag);
            currentCount = end;

            if (currentCount < allKeys.length) {
                const remaining = allKeys.length - currentCount;
                const btn = document.createElement('div');
                btn.className = 'load-more-btn';
                btn.textContent = `Show more (${remaining})...`;
                btn.style.cursor = 'pointer';
                btn.style.color = 'var(--dt-text-accent)';
                btn.style.fontStyle = 'italic';
                btn.style.padding = '4px 0';
                btn.onclick = (e) => { e.stopPropagation(); renderBatch(); };
                content.appendChild(btn);
            }
        }

        return container;
    }

    // SPECIALIZED TOP-LEVEL ERROR RENDERER
    function renderError(error) {
        const container = document.createElement('div');
        container.className = 'json-formatter-row';
        container.setAttribute('data-copy-obj', safeStringify(error));

        const header = document.createElement('div');
        header.style.cursor = 'pointer';
        header.style.display = 'flex';
        header.style.alignItems = 'flex-start';

        const arrow = document.createElement('span');
        arrow.textContent = '▶';
        arrow.className = 'token-punct';
        arrow.style.fontSize = '10px';
        arrow.style.marginRight = '6px';
        arrow.style.marginTop = '3px';
        arrow.style.transition = 'transform 0.1s';

        const title = document.createElement('span');
        title.className = 'token-error';
        title.style.fontWeight = 'bold';
        title.style.whiteSpace = 'pre-wrap';
        title.textContent = `${error.name}: ${error.message}`;

        header.appendChild(arrow);
        header.appendChild(title);
        container.appendChild(header);

        const stackTrace = document.createElement('div');
        stackTrace.style.display = 'none';
        stackTrace.style.marginLeft = '14px';
        stackTrace.style.marginTop = '4px';
        stackTrace.style.paddingLeft = '0px';

        const stackString = error.stack || '';
        const lines = stackString.split('\n');

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;
            if (trimmed.startsWith(error.name) && trimmed.includes(error.message)) return;

            const frameDiv = document.createElement('div');
            frameDiv.style.fontFamily = 'monospace';
            frameDiv.style.fontSize = '11px';
            frameDiv.style.marginBottom = '2px';
            frameDiv.style.color = 'var(--dt-text-secondary)';
            frameDiv.style.whiteSpace = 'nowrap';

            const match = trimmed.match(/^at\s+(?:(.+?)\s+\()?(.*?):(\d+):(\d+)\)?$/);

            if (match) {
                const fn = match[1] ? match[1] + ' ' : '';
                const url = match[2];
                const ln = match[3];
                const col = match[4];
                const fileName = url.split('/').pop() || url;

                const prefix = document.createElement('span');
                prefix.textContent = 'at ' + fn;

                const link = document.createElement('span');
                link.textContent = (match[1] ? `(${fileName}:${ln}:${col})` : `${fileName}:${ln}:${col}`);
                link.style.textDecoration = 'underline';
                link.style.cursor = 'pointer';
                link.style.color = 'var(--dt-console-link-color)';
                link.title = url;

                link.onclick = (e) => {
                    e.stopPropagation();
                    if (window.MyDevTool.DevTool && window.MyDevTool.DevTool.switchTab) {
                        window.MyDevTool.DevTool.switchTab('source');
                        if (window.MyDevTool.SourceTab && window.MyDevTool.SourceTab.openFile) {
                            window.MyDevTool.SourceTab.openFile(url, parseInt(ln));
                        }
                    }
                };

                frameDiv.appendChild(prefix);
                frameDiv.appendChild(link);
            } else {
                frameDiv.textContent = trimmed;
            }
            stackTrace.appendChild(frameDiv);
        });

        const objInspector = renderObject(error, "Properties");
        objInspector.style.marginTop = '8px';
        objInspector.style.paddingTop = '4px';
        objInspector.style.borderTop = '1px dashed var(--dt-border-light)';
        stackTrace.appendChild(objInspector);

        container.appendChild(stackTrace);

        let isExpanded = false;
        header.onclick = (e) => {
            e.stopPropagation();
            isExpanded = !isExpanded;
            stackTrace.style.display = isExpanded ? 'block' : 'none';
            arrow.style.transform = isExpanded ? 'rotate(90deg)' : 'rotate(0deg)';
        };

        return container;
    }

    function formatOutput(arg, isReturnValue = false, keyName = null) {
        if (arg === window || arg instanceof Window) return renderObject(arg, 'Window', keyName);
        if (arg instanceof HTMLDocument) return renderObject(arg, '#document', keyName);

        if (arg instanceof Error && !isReturnValue) {
            return renderError(arg);
        }

        if (arg && typeof arg === 'object' && arg.nodeType === 1) {
            if (window.MyDevTool.DomTreeRenderer && window.MyDevTool.DomTreeRenderer.renderForConsole) {
                return window.MyDevTool.DomTreeRenderer.renderForConsole(arg);
            }
            const span = document.createElement('span');
            span.className = 'console-dom-node token-tag';
            span.style.cursor = 'pointer';
            span.title = 'Inspect Element';
            let desc = `<${arg.tagName.toLowerCase()}`;
            if (arg.id) desc += ` id="${arg.id}"`;
            if (arg.className) desc += ` class="${arg.className.split(/\s+/).join('.')}"`;
            desc += '>';
            span.textContent = desc;
            span.onclick = () => {
                if (window.MyDevTool.Elements && window.MyDevTool.Elements.selectElement) {
                    window.MyDevTool.DevTool.switchTab('elements');
                    window.MyDevTool.Elements.selectElement(arg);
                }
            };
            return span;
        }
        if (typeof arg === 'string') {
            const span = document.createElement('span');
            span.style.whiteSpace = 'pre-wrap';
            if (isReturnValue) {
                span.className = 'token-string';
                span.textContent = `"${arg}"`;
            } else {
                span.textContent = arg;
            }
            return span;
        }
        if (typeof arg === 'number') {
            const span = document.createElement('span');
            span.className = 'token-number';
            span.textContent = String(arg);
            return span;
        }
        if (typeof arg === 'boolean') {
            const span = document.createElement('span');
            span.className = 'token-boolean';
            span.textContent = String(arg);
            return span;
        }
        if (typeof arg === 'symbol') {
            const span = document.createElement('span');
            span.className = 'token-string';
            span.textContent = arg.toString();
            return span;
        }
        if (arg === undefined) {
            const span = document.createElement('span');
            span.className = 'token-null';
            span.textContent = 'undefined';
            return span;
        }
        if (arg === null) {
            const span = document.createElement('span');
            span.className = 'token-null';
            span.textContent = 'null';
            return span;
        }

        if (typeof arg === 'object' || typeof arg === 'function') {
            return renderObject(arg, null, keyName);
        }

        return document.createTextNode(String(arg));
    }

    function formatArgs(args) {
        const frag = document.createDocumentFragment();
        if (!args || args.length === 0) return frag;

        const first = args[0];

        if (typeof first === 'string' && (first.includes('%c') || first.includes('%s') || first.includes('%d') || first.includes('%i') || first.includes('%f') || first.includes('%o') || first.includes('%O'))) {
            let formatStr = first; let argIndex = 1; let currentStyle = '';
            const tokens = formatStr.split(/(%[csdifoO])/g);
            tokens.forEach(token => {
                if (token === '') return;
                if (token === '%c') { currentStyle = (argIndex < args.length) ? String(args[argIndex++]) : ''; }
                else if (token === '%s' || token === '%d' || token === '%i' || token === '%f') {
                    let val = (argIndex < args.length) ? args[argIndex++] : token;
                    const span = document.createElement('span'); span.textContent = String(val); if (currentStyle) span.style.cssText = currentStyle; frag.appendChild(span);
                }
                else if (token === '%o' || token === '%O') {
                    let val = (argIndex < args.length) ? args[argIndex++] : token;
                    const node = formatOutput(val, false);
                    if (currentStyle) { const wrapper = document.createElement('span'); wrapper.style.cssText = currentStyle; wrapper.appendChild(node); frag.appendChild(wrapper); }
                    else { frag.appendChild(node); }
                }
                else { const span = document.createElement('span'); span.textContent = token; if (currentStyle) span.style.cssText = currentStyle; frag.appendChild(span); }
            });
            while (argIndex < args.length) { frag.appendChild(document.createTextNode(' ')); frag.appendChild(formatOutput(args[argIndex++], false)); }
            return frag;
        }

        for (let i = 0; i < args.length; i++) {
            const formatted = formatOutput(args[i], false);
            frag.appendChild(formatted);
            if (i < args.length - 1) frag.appendChild(document.createTextNode(' '));
        }
        return frag;
    }

    function ensureSandbox() { if (sandboxWindow) return sandboxWindow; sandboxFrame = document.createElement('iframe'); sandboxFrame.style.display = 'none'; (document.body || document.documentElement).appendChild(sandboxFrame); sandboxWindow = sandboxFrame.contentWindow; sandboxWindow.MyDevTool = window.MyDevTool; return sandboxWindow; }
    function rewriteToGlobal(code) { if (!window.acorn) return code; const trimmedCode = code.trim(); let ast; try { ast = window.acorn.parse(trimmedCode, { ecmaVersion: 2022 }); } catch (e) { return code; } if (ast.body.length === 1 && ast.body[0].type === 'VariableDeclaration') { const node = ast.body[0]; let newCodeParts = []; for (const decl of node.declarations) { if (decl.id.type === 'Identifier') { const name = decl.id.name; let value = decl.init ? trimmedCode.slice(decl.init.start, decl.init.end) : 'undefined'; newCodeParts.push(`globalThis.${name} = ${value}`); } } return newCodeParts.join('; '); } if (ast.body.length === 1 && ast.body[0].type === 'ExpressionStatement') { let exprCode = trimmedCode.endsWith(';') ? trimmedCode.slice(0, -1) : trimmedCode; return `__last_result__ = (${exprCode})`; } return code; }
    function globalEval(code, target = 'page') { let evalContext = (target === 'page') ? window : ensureSandbox(); try { return evalContext.eval(code); } catch (e) { if (e.message && e.message.includes('is not defined')) { try { return evalContext.eval(`globalThis.${code}`); } catch (e2) { throw e; } } throw e; } }

    function parseEarlyStack(stackString) {
        if (!stackString) return null;
        const lines = stackString.split('\n'); let callerLine = lines[2] || lines[1]; if (!callerLine) return null;
        const regex = /((?:https?|file|ftp|chrome-extension):\/[^:)]+|[^:(\s]+):(\d+):\d+/; const match = callerLine.match(regex);
        if (match) { const fullUrl = match[1]; const line = match[2]; const fileName = fullUrl.split('/').pop() || fullUrl; return { text: `${fileName}:${line}`, url: fullUrl, line: parseInt(line, 10) }; }
        return null;
    }

    function ingestEarlyLogs(logs, addMessageFn) {
        if (!logs || !Array.isArray(logs)) return;
        logs.forEach(log => {
            const args = log.args; const type = log.type; const stack = log.stack;
            const source = parseEarlyStack(stack); const meta = { source: source };
            let className = 'console-log-line';
            if (type === 'error') className = 'console-error-line'; else if (type === 'warn') className = 'console-warn-line'; else if (type === 'info') className = 'console-info-line';
            const content = formatArgs(args); addMessageFn(content, className, meta);
        });
    }

    function findPauseError(e) { if (!e) return null; if (e.name === 'DevToolPauseError' && e.url) return e; if (e.reason && e.reason.name === 'DevToolPauseError') return e.reason; if (e.message && typeof e.message === 'string' && e.message.includes('DevToolPauseError')) { const regex = /at\s+(.*?):(\d+)/; const match = e.message.match(regex); if (match) return { url: match[1], lineNumber: parseInt(match[2], 10), callStackString: e.stack || '', message: e.message }; } return null; }

    async function evaluate(code, target = 'page') {
        const i18n = window.MyDevTool.LanguageManager;
        if (typeof code !== 'string') code = String(code || ''); if (code.trim() === '') return;

        commandHistory.push(code); historyIndex = commandHistory.length;

        if (code.trim().startsWith('return ')) {
            const msg = i18n ? i18n.t('console.messages.illegal_return') : 'Uncaught SyntaxError: Illegal return statement';
            if (printCallback) printCallback(msg, 'console-error-line'); return;
        }

        const SourceDebugger = window.MyDevTool.SourceDebugger; const BreakpointManager = window.MyDevTool.SourceBreakpointManager;

        if (SourceDebugger && SourceDebugger.isPaused()) {
            try { const result = SourceDebugger.evalInPausedScope(code); if (printCallback) printCallback(formatOutput(result, true), 'console-output-line', { preventGroup: true }); return; } catch (e) { }
        }

        const vmId = Math.floor(Math.random() * 10000); const vmName = `VM${vmId}`; vmScripts.set(vmName, code);
        let finalCodeToRun = rewriteToGlobal(code);
        if (window.MyDevTool.SourceInstrumenter) { try { finalCodeToRun = window.MyDevTool.SourceInstrumenter.instrument(finalCodeToRun, vmName, 0, false); } catch (e) { } }

        const wrappedCode = `(async () => { if(typeof __last_result__ !== 'undefined') __last_result__ = undefined; ${finalCodeToRun} return (typeof __last_result__ !== 'undefined') ? __last_result__ : undefined; })()`;

        let result; let hasError = false; let didPause = false;
        try { result = await globalEval(wrappedCode, target); } catch (e) {
            const pauseError = findPauseError(e);
            if (SourceDebugger && pauseError) { await SourceDebugger.pause(pauseError.url, pauseError.lineNumber, pauseError.callStackString || e.stack); result = undefined; hasError = false; didPause = true; }
            else if (SourceDebugger && BreakpointManager && BreakpointManager.shouldPauseOnUncaught()) { let line = 0; if (e.stack) { const match = e.stack.match(/:(\d+):\d+/); if (match) line = parseInt(match[1], 10) - 1; if (line < 0) line = 0; } await SourceDebugger.pause(vmName, line, e.stack); hasError = true; result = e; }
            else { hasError = true; result = e; }
        }

        if (hasError) { if (printCallback) printCallback(formatOutput(result, false), 'console-error-line'); }
        else if (!didPause) { if (printCallback) printCallback(formatOutput(result, true), 'console-output-line', { preventGroup: true }); }
    }

    function listSandboxGlobals() {
        const ctx = window;
        const commonBuiltins = ['console', 'document', 'window', 'Math', 'JSON', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Date', 'Promise', 'fetch', 'suger'];
        const keys = Object.getOwnPropertyNames(ctx);

        const builtinSet = new Set(['window', 'self', 'document', 'location', 'history', 'frames', 'navigator', 'console', 'MyDevTool']);

        const userKeys = keys.filter(k => !builtinSet.has(k) && !/^[A-Za-z_]\w{0,2}$/.test(k));
        const plausible = keys.filter(k => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) && !builtinSet.has(k));

        return Array.from(new Set([...commonBuiltins, ...plausible, ...userKeys])).sort();
    }

    function readSandboxProperty(prop) { try { return { name: prop, value: formatOutput(window[prop], false) }; } catch (e) { return { name: prop, error: String(e) }; } }

    function getCallerSource() {
        try {
            const err = new Error(); const stack = err.stack.split('\n'); let callerLine = stack[3] || stack[2]; if (!callerLine) return null;
            const regex = /((?:https?|file|ftp|chrome-extension):\/[^:)]+|[^:(\s]+):(\d+):\d+/; const match = callerLine.match(regex);
            if (match) { const fullUrl = match[1]; const line = match[2]; const fileName = fullUrl.split('/').pop() || fullUrl; if (fileName === 'ConsoleEngine.js' || fileName === '<anonymous>') return null; return { text: `${fileName}:${line}`, url: fullUrl, line: parseInt(line, 10) }; }
            return null;
        } catch (e) { return null; }
    }

    function overrideParentConsole() {
        if (window.__mydevtool_console_overridden) return;
        window.__mydevtool_console_overridden = true;
        ['log', 'warn', 'error', 'info'].forEach(method => {
            console[method] = function (...args) {
                if (originalConsole[method]) originalConsole[method](...args);
                if (printCallback && !isSilentEval) { const source = getCallerSource(); const meta = { source: source }; const className = method === 'error' ? 'console-error-line' : method === 'warn' ? 'console-warn-line' : 'console-log-line'; printCallback(formatArgs(args), className, meta); }
            };
        });
        console.group = function (...args) { if (originalConsole.group) originalConsole.group(...args); if (printCallback && !isSilentEval) { const label = args.length > 0 ? formatArgs(args) : 'console.group'; printCallback(label, 'console-group-label', { type: 'group', collapsed: false }); } };
        console.groupCollapsed = function (...args) { if (originalConsole.groupCollapsed) originalConsole.groupCollapsed(...args); if (printCallback && !isSilentEval) { const label = args.length > 0 ? formatArgs(args) : 'console.group'; printCallback(label, 'console-group-label', { type: 'group', collapsed: true }); } };
        console.groupEnd = function () { if (originalConsole.groupEnd) originalConsole.groupEnd(); if (printCallback && !isSilentEval) { printCallback('', '', { type: 'groupEnd' }); } };
        console.table = function (data, columns) { if (originalConsole.table) originalConsole.table(data, columns); if (printCallback && !isSilentEval) { const source = getCallerSource(); const meta = { source: source, type: 'table' }; printCallback(data, 'table', meta); } };
        console.clear = function () { if (originalConsole.clear) originalConsole.clear(); if (printCallback && !isSilentEval) { printCallback("Console was cleared", 'console-info-line', { preventGroup: true }); } };
    }

    function captureGlobalErrors() {
        const i18n = window.MyDevTool.LanguageManager;
        window.addEventListener('error', (event) => {
            let message = ''; let isErrorObject = false; let errorObj = null;
            if (event.error) { errorObj = event.error; isErrorObject = true; message = `${event.error.name}: ${event.error.message}\n${event.error.stack || ''}`; }
            else { const target = event.target || event.srcElement; const unknownRes = i18n ? i18n.t('console.messages.unknown_resource') : 'unknown resource'; const failedRes = i18n ? i18n.t('console.messages.failed_resource', { url: target && (target.src || target.href) || unknownRes }) : `Failed to load resource: ${target && (target.src || target.href) || unknownRes}`; message = failedRes; }
            if (printCallback) { const content = isErrorObject ? formatOutput(errorObj, false) : message; printCallback(content, 'console-error-line'); } else { originalConsole.error("[DevTool-Preload] " + message); }
        }, true);
        window.addEventListener('unhandledrejection', (event) => {
            const prefix = i18n ? i18n.t('console.messages.unhandled_rejection') : 'Unhandled promise rejection: '; const reason = event.reason; let content;
            if (reason instanceof Error) { const errorNode = formatOutput(reason, false); const frag = document.createDocumentFragment(); frag.appendChild(document.createTextNode(prefix)); frag.appendChild(errorNode); content = frag; }
            else if (typeof reason === 'object' && reason !== null) { try { content = prefix + JSON.stringify(reason, null, 2); } catch (e) { content = prefix + String(reason); } }
            else { content = prefix + String(reason); }
            if (printCallback) { printCallback(content, 'console-error-line'); } else { originalConsole.error("[DevTool-Preload] " + String(reason)); }
        });
    }

    function setSilentEval(isSilent) { isSilentEval = isSilent; }
    function init(callback) { printCallback = callback; overrideParentConsole(); captureGlobalErrors(); ensureSandbox(); }
    function getVMContent(name) { return vmScripts.get(name) || ''; }

    return { init, evaluate, globalEval, setSilentEval, getHistoryUp, getHistoryDown, resetHistoryIndex, listSandboxGlobals, readSandboxProperty, getUserVariables: () => Array.from(userVariables), clearUserVariables: () => userVariables.clear(), get sandboxWindow() { return window; }, getVMContent, formatOutput, ingestEarlyLogs };
})();