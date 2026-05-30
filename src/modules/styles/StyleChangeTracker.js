// src/modules/styles/StyleChangeTracker.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.StyleChangeTracker = (function() {
    
    // Map<CSSStyleDeclaration, Element>
    const changeMap = new Map();
    
    // WeakMap<Declaration, Set<PropName>>
    const changedPropertiesMap = new WeakMap();

    // WeakMap<Declaration, Map<PropName, OriginalValue>>
    const originalValuesMap = new WeakMap();

    function track(declaration, element, propName, forcedOriginalValue) {
        if (!declaration || !element || !propName) return;
        
        if (!originalValuesMap.has(declaration)) {
            originalValuesMap.set(declaration, new Map());
        }
        const originals = originalValuesMap.get(declaration);

        if (!originals.has(propName)) {
            let valToStore = (forcedOriginalValue !== undefined && forcedOriginalValue !== null) 
                             ? forcedOriginalValue 
                             : declaration.getPropertyValue(propName);
            originals.set(propName, valToStore.trim());
        }

        const originalValue = originals.get(propName);
        const currentValue = declaration.getPropertyValue(propName).trim();

        if (!changedPropertiesMap.has(declaration)) {
            changedPropertiesMap.set(declaration, new Set());
        }
        const changedProps = changedPropertiesMap.get(declaration);

        if (currentValue === originalValue) {
            changedProps.delete(propName);
        } else {
            changedProps.add(propName);
            changeMap.set(declaration, element);
        }

        if (changedProps.size === 0) {
            changeMap.delete(declaration);
        }
    }

    function getChanges() { return changeMap; }
    
    function isPropertyChanged(declaration, propName) {
        if (!declaration || !propName) return false;
        const props = changedPropertiesMap.get(declaration);
        return props ? props.has(propName) : false;
    }

    function clear() {
        changeMap.clear();
        const i18n = window.MyDevTool.LanguageManager;
        alert(i18n ? i18n.t('styles.changes_cleared') : 'All tracked changes cleared!');
    }

    function generateFullSelector(el) {
        if (!el) return 'unknown';
        if (el.nodeType !== Node.ELEMENT_NODE) return 'unknown';
        if (el.tagName.toLowerCase() === 'html') return 'html';
        if (el.tagName.toLowerCase() === 'body') return 'body';

        const path = [];
        while (el.nodeType === Node.ELEMENT_NODE) {
            let selector = el.tagName.toLowerCase();
            if (el.id) {
                selector += '#' + el.id;
                path.unshift(selector);
                break; 
            } else {
                let sibling = el;
                let nth = 1;
                while (sibling = sibling.previousElementSibling) {
                    if (sibling.tagName.toLowerCase() === selector) nth++;
                }
                if (nth > 1) selector += `:nth-of-type(${nth})`;
            }
            path.unshift(selector);
            el = el.parentNode;
        }
        return path.join(' > ');
    }

    // Copy ONLY changed properties
    function copyAll() {
        if (changeMap.size === 0) { alert('No changes tracked yet.'); return; }
        let output = '';
        changeMap.forEach((element, declaration) => {
            let selector = declaration.parentRule ? declaration.parentRule.selectorText : generateFullSelector(element);
            let rulesText = '';
            const trackedProps = changedPropertiesMap.get(declaration);
            if(trackedProps) {
                trackedProps.forEach(prop => {
                    const val = declaration.getPropertyValue(prop);
                    if (val) rulesText += `    ${prop}: ${val};\n`;
                });
            }
            if (rulesText.trim()) output += `${selector} {\n${rulesText}}\n\n`;
        });
        
        copyToClipboardHelper(output, 'Only changed properties copied!');
    }

    // copy FULL rule using cssText to prevent expansion of 'initial' values
    function copyFullRule() {
        if (changeMap.size === 0) { alert('No changes tracked yet.'); return; }
        let output = '';
        changeMap.forEach((element, declaration) => {
            let selector = declaration.parentRule ? declaration.parentRule.selectorText : generateFullSelector(element);
            
            // Use cssText directly. This gives the clean, browser-normalized CSS 
            // without expanding shorthands into 'initial' properties.
            let rulesText = declaration.cssText;
            
            // Format it slightly for readability if it comes back as a single line
            if (rulesText) {
                rulesText = rulesText.replace(/; /g, ';\n    '); // Simple formatting
                if (!rulesText.startsWith('    ')) rulesText = '    ' + rulesText;
                if (!rulesText.endsWith(';')) rulesText += ';';
            }
            
            output += `${selector} {\n${rulesText}\n}\n\n`;
        });
        
        copyToClipboardHelper(output, 'Full rules copied!');
    }
    
    function copyToClipboardHelper(text, successMsg) {
        if (text) {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert(successMsg);
        } else {
            alert('No effective changes found.');
        }
    }
    
    function getOriginalValue(declaration, propName) {
        if (!declaration || !originalValuesMap.has(declaration)) return null;
        return originalValuesMap.get(declaration).get(propName);
    }

    return {
        track,
        clear,
        copyAll, 
        copyFullRule,
        getChanges,
        generateFullSelector,
        isPropertyChanged,
        getOriginalValue
    };
})();