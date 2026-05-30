// src/modules/styles/StyleEditorUtils.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.StyleEditorUtils = (function() {

    const CSS_GLOBAL_VALUES = ['initial', 'inherit', 'unset', 'revert', 'revert-layer'];
    
    const COLOR_PROPERTIES = new Set([
        'color', 'background', 'background-color', 'background-image', 
        'border', 'border-color', 'border-top', 'border-right', 'border-bottom', 'border-left',
        'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
        'outline', 'outline-color', 'box-shadow', 'text-shadow', 
        'fill', 'stroke', 'text-decoration-color', 'column-rule-color', 'caret-color'
    ]);
    
    const colorRegex = /^(#(?:[0-9a-f]{3,8})|rgb[a]?\(.*\)|hsl[a]?\(.*\)|[a-z]+)$/i;

    function getSettings() {
        return {
            showSuggestions: localStorage.getItem('dt_style_show_suggestions') !== 'false', 
            maxSuggestions: parseInt(localStorage.getItem('dt_style_max_suggestions') || '50', 10),
            editSingleClick: localStorage.getItem('dt_style_edit_single_click') === 'true',
            focusMode: localStorage.getItem('dt_style_focus_mode') === 'true',
            focusShowSelector: localStorage.getItem('dt_style_focus_show_selector') !== 'false'
        };
    }

    function isRealStyleDecl(decl) {
        return decl && typeof decl.setProperty === 'function' && typeof decl.getPropertyValue === 'function';
    }

    function fuzzyMatch(query, target) {
        query = query.toLowerCase();
        target = target.toLowerCase();
        if (query.length > target.length) return false;
        let qIdx = 0;
        for (let tIdx = 0; tIdx < target.length; tIdx++) {
            if (target[tIdx] === query[qIdx]) { qIdx++; if (qIdx === query.length) return true; }
        }
        return false;
    }

    function getAllCSSVariables(element) {
        const vars = new Set();
        if (element && element.style) {
            for (let i = 0; i < element.style.length; i++) {
                const prop = element.style[i];
                if (prop.startsWith('--') && !prop.startsWith('--dt-')) vars.add(prop);
            }
        }
        try {
            Array.from(document.styleSheets).forEach(sheet => {
                try {
                    Array.from(sheet.cssRules).forEach(rule => {
                        if (rule.style) {
                            for (let i = 0; i < rule.style.length; i++) {
                                const prop = rule.style[i];
                                if (prop.startsWith('--') && !prop.startsWith('--dt-')) vars.add(prop);
                            }
                        }
                    });
                } catch (e) { }
            });
        } catch(e) {}
        return Array.from(vars);
    }

    function getShadowSelection(el) {
        const root = el.getRootNode();
        if (root instanceof ShadowRoot && root.getSelection) return root.getSelection();
        return window.getSelection();
    }

    function getGlobalCursorPosition(element) {
        const selection = getShadowSelection(element);
        if (selection.rangeCount === 0) return 0;
        const range = selection.getRangeAt(0);
        if (!element.contains(range.startContainer)) return 0;
        const targetNode = range.startContainer;
        const targetOffset = range.startOffset;
        let pos = 0;
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            if (node === targetNode) return pos + targetOffset;
            pos += node.length;
        }
        if (targetNode === element) {
            let p = 0; for(let i=0; i<targetOffset; i++) p += element.childNodes[i].textContent.length;
            return p;
        }
        return pos;
    }

    function setGlobalCursorPosition(element, offset) {
        const selection = getShadowSelection(element);
        const range = document.createRange();
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        let node, currentLen = 0, found = false;
        while (node = walker.nextNode()) {
            const nextLen = currentLen + node.length;
            if (offset <= nextLen) {
                range.setStart(node, offset - currentLen); range.collapse(true);
                selection.removeAllRanges(); selection.addRange(range);
                found = true; break;
            }
            currentLen = nextLen;
        }
        if (!found) { selection.selectAllChildren(element); selection.collapseToEnd(); }
    }

    function incrementValueWithCursor(value, cursorOffset, amount) {
        const regex = /(-?\d*\.?\d+)([a-z%]*)/gi; 
        let match, matches = [];
        while ((match = regex.exec(value)) !== null) {
            matches.push({ fullStr: match[0], numStr: match[1], unit: match[2] || '', start: match.index, end: match.index + match[0].length });
        }
        if (matches.length === 0) return null;
        let target = null;
        for (const m of matches) { if (cursorOffset >= m.start && cursorOffset <= m.end) { target = m; break; } }
        if (!target) {
            let minDist = Infinity;
            for (const m of matches) {
                const dist = Math.min(Math.abs(cursorOffset - m.start), Math.abs(cursorOffset - m.end));
                if (dist < minDist) { minDist = dist; target = m; }
            }
        }
        if (!target) return null;
        let num = parseFloat(target.numStr);
        const stepDecimals = (amount.toString().split('.')[1] || '').length;
        const currentDecimals = (target.numStr.split('.')[1] || '').length;
        const precision = Math.max(currentDecimals, stepDecimals);
        let newValNum = num + amount;
        let newValStr = newValNum.toFixed(precision);
        if (precision > 0 && newValNum % 1 === 0 && currentDecimals === 0) newValStr = newValNum.toString();
        const newValue = value.slice(0, target.start) + newValStr + target.unit + value.slice(target.end);
        const lenDiff = newValStr.length - target.numStr.length;
        let newCursor = cursorOffset > target.start ? cursorOffset + lenDiff : cursorOffset;
        return { newValue, newCursor };
    }

    function applySuggestionToInput(span, suggestionText, isValueField) {
        const currentText = span.textContent;
        if (!isValueField) { span.textContent = suggestionText; return; }
        const selection = window.getSelection();
        let textBeforeCursor = currentText, textAfterCursor = "";
        if (selection.rangeCount > 0 && selection.anchorNode && span.contains(selection.anchorNode)) {
            const range = selection.getRangeAt(0);
            const preRange = range.cloneRange();
            preRange.selectNodeContents(span);
            preRange.setEnd(range.endContainer, range.endOffset);
            textBeforeCursor = preRange.toString();
            textAfterCursor = currentText.substring(textBeforeCursor.length);
        }
        const match = textBeforeCursor.match(/([a-zA-Z0-9-_\(\)]+)$/);
        if (match) {
            const prefix = match[1]; 
            const newTextBefore = textBeforeCursor.substring(0, textBeforeCursor.length - prefix.length) + suggestionText;
            span.textContent = newTextBefore + textAfterCursor;
        } else {
            span.textContent = textBeforeCursor + suggestionText + textAfterCursor;
        }
    }

    return {
        CSS_GLOBAL_VALUES,
        COLOR_PROPERTIES,
        colorRegex,
        getSettings,
        updateSettings: getSettings,
        isRealStyleDecl,
        fuzzyMatch,
        getAllCSSVariables,
        getGlobalCursorPosition,
        setGlobalCursorPosition,
        incrementValueWithCursor,
        applySuggestionToInput
    };
})();