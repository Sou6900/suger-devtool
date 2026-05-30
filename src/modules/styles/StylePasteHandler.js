// src/modules/styles/StylePasteHandler.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.StylePasteHandler = (function() {

    const Utils = window.MyDevTool.StyleEditorUtils;

    function parseSmartPaste(text) {
        const rules = [];
        text = text.trim();
        const lines = text.split(/[;\n]+/).map(l => l.trim()).filter(Boolean);
        
        for (const line of lines) {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const property = line.substring(0, colonIndex).trim();
                const value = line.substring(colonIndex + 1).trim();
                if (property && /^[a-zA-Z-_][a-zA-Z0-9-_]*$/.test(property)) {
                    rules.push({ property, value: value || '' });
                }
            }
        }
        return rules;
    }

    function applyMultipleRules(rules, currentLi, styleDeclaration, onAddNewRow, onChange) {
        if (!rules || rules.length === 0) return;
        
        let lastLi = currentLi;
        let cssUpdates = [];
        
        rules.forEach((rule) => {
            const ul = lastLi.parentElement;
            if (!ul) return;
            
            cssUpdates.push(`${rule.property}: ${rule.value}`);
            
            const newLi = document.createElement('li');
            newLi.className = 'style-property';
            newLi.dataset.realProp = rule.property;
            newLi.dataset.propName = rule.property;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox'; checkbox.className = 'prop-toggle'; checkbox.checked = true;
            newLi.appendChild(checkbox);
            
            const propSpan = document.createElement('span');
            propSpan.className = 'prop-name'; propSpan.textContent = rule.property;
            newLi.appendChild(propSpan);
            
            const colon = document.createElement('span');
            colon.textContent = ': ';
            newLi.appendChild(colon);
            
            const valueSpan = document.createElement('span');
            valueSpan.className = 'prop-value'; valueSpan.textContent = rule.value;
            newLi.appendChild(valueSpan);
            
            const semi = document.createElement('span');
            semi.textContent = ';';
            newLi.appendChild(semi);
            
            lastLi.after(newLi);
            lastLi = newLi;
            
            const StylePropertyEditor = window.MyDevTool.StylePropertyEditor;
            if (StylePropertyEditor) {
                const onAddNewRowCallback = () => { if (onAddNewRow) onAddNewRow(); };
                const onChangeCallback = (decl, pName, oldVal) => { if (onChange) onChange(decl, pName, oldVal); };
                
                propSpan.addEventListener('dblclick', () => StylePropertyEditor.makeEditable(propSpan, 'property', false, valueSpan, styleDeclaration, onAddNewRowCallback, onChangeCallback));
                valueSpan.addEventListener('dblclick', () => StylePropertyEditor.makeEditable(valueSpan, 'value', false, propSpan, styleDeclaration, onAddNewRowCallback, onChangeCallback));
            }
            
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    newLi.classList.remove('disabled-prop');
                    if (Utils.isRealStyleDecl(styleDeclaration) && rule.property) {
                        let rVal = rule.value;
                        let rPrio = '';
                        if (rVal.toLowerCase().includes('!important')) {
                            rVal = rVal.replace(/!important/gi, '').trim();
                            rPrio = 'important';
                        }
                        styleDeclaration.setProperty(rule.property, rVal, rPrio);
                    }
                } else {
                    newLi.classList.add('disabled-prop');
                    if (Utils.isRealStyleDecl(styleDeclaration) && rule.property) styleDeclaration.removeProperty(rule.property);
                }
            });
        });
        
        if (Utils.isRealStyleDecl(styleDeclaration) && cssUpdates.length > 0) {
            try {
                const existingCss = styleDeclaration.cssText;
                const newCssText = existingCss + (existingCss ? '; ' : '') + cssUpdates.join('; ');
                styleDeclaration.cssText = newCssText;
            } catch(e) {
                rules.forEach(rule => {
                    try { 
                        // Fallback Loop Set Property
                        let rVal = rule.value;
                        let rPrio = '';
                        if (rVal.toLowerCase().includes('!important')) {
                            rVal = rVal.replace(/!important/gi, '').trim();
                            rPrio = 'important';
                        }
                        styleDeclaration.setProperty(rule.property, rVal, rPrio); 
                    } catch(err) {}
                });
            }
        }
        
        setTimeout(() => { if (onAddNewRow) onAddNewRow(); }, 0);
    }

    return {
        parseSmartPaste,
        applyMultipleRules
    };
})();