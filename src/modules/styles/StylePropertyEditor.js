// src/modules/styles/StylePropertyEditor.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.StylePropertyEditor = (function() {

    const Utils = window.MyDevTool.StyleEditorUtils;
    const PasteHandler = window.MyDevTool.StylePasteHandler;
    const SuggestionEngine = window.MyDevTool.StyleSuggestionEngine;

    let focusModeCleanupTimer = null;
    let lastEditedLi = null;

    function makeEditable(span, type, isNew = false, otherSpan, styleDeclaration, onAddNewRow, onChange) {
        const li = span.parentElement;
        const SuggestionBox = window.MyDevTool.SuggestionBox;
        const ruleBlock = li.closest('.css-rule-block'); 
        
        const settings = Utils.getSettings();
        if (window.MyDevTool.StylesTab && settings.focusMode && ruleBlock) {
            if (focusModeCleanupTimer) {
                clearTimeout(focusModeCleanupTimer);
                focusModeCleanupTimer = null;
                if (lastEditedLi && lastEditedLi !== li) lastEditedLi.classList.remove('editing-row');
            }
            lastEditedLi = li;
            li.classList.add('editing-row'); 
            window.MyDevTool.StylesTab.toggleFocusMode(ruleBlock, true, settings.focusShowSelector);
        }
        
        let oldHTML = span.innerHTML;
        let oldText = span.textContent;
        let currentRealProp = li.dataset.realProp || (type === 'property' ? oldText : otherSpan.textContent);
        let isNavigating = false;
        let currentTokenPrefix = ""; 

        if (type === 'value') span.textContent = oldText; 

        const cleanupListeners = () => {
            span.contentEditable = false; 
            span.onblur = null; span.onkeydown = null; span.oninput = null; span.onpaste = null;
            otherSpan.removeEventListener('click', onOtherSpanClick);
            SuggestionBox.hide();
            
            if (window.MyDevTool.StylesTab && settings.focusMode && ruleBlock) {
                focusModeCleanupTimer = setTimeout(() => {
                    if (li) li.classList.remove('editing-row'); 
                    window.MyDevTool.StylesTab.toggleFocusMode(ruleBlock, false);
                    focusModeCleanupTimer = null; lastEditedLi = null;
                }, 100); 
            }
        };

        const applyChanges = () => {
            if (isNavigating) return; 
            cleanupListeners();
            
            const propText = (type === 'property') ? span.textContent.trim() : otherSpan.textContent.trim();
            let valText = (type === 'value') ? span.textContent.trim() : otherSpan.textContent.trim();
            
            if (!propText || (!propText && !valText)) { li.remove(); return; }
            const oldValueToPass = (type === 'value') ? oldText : undefined;

            // Extract !important
            let priority = '';
            if (valText.toLowerCase().includes('!important')) {
                valText = valText.replace(/!important/gi, '').trim();
                priority = 'important';
            }

            if (Utils.isRealStyleDecl(styleDeclaration)) {
                try {
                    if (type === 'value') {
                        styleDeclaration.setProperty(currentRealProp, valText, priority);
                        if (onChange) onChange(styleDeclaration, currentRealProp, oldValueToPass);
                    } else {
                        const isRenaming = !isNew && currentRealProp !== propText;
                        if (isRenaming) styleDeclaration.removeProperty(currentRealProp); 

                        const propExists = styleDeclaration.getPropertyValue(propText) !== '';
                        if ((isNew || isRenaming) && propExists) {
                            const previousValue = styleDeclaration.getPropertyValue(propText);
                            const previousPriority = styleDeclaration.getPropertyPriority(propText);
                            styleDeclaration.removeProperty(propText);
                            const dupKey = `--duplicate-${propText}`;
                            styleDeclaration.setProperty(dupKey, previousValue, previousPriority);
                            styleDeclaration.setProperty(propText, valText, priority);

                            const ul = li.parentElement;
                            if (ul) {
                                const allLis = Array.from(ul.children);
                                const oldLi = allLis.find(item => item !== li && item.dataset.propName === propText && !item.dataset.realProp?.startsWith('--duplicate-'));
                                if (oldLi) {
                                    oldLi.dataset.realProp = dupKey;
                                    oldLi.classList.add('overridden');
                                    const chk = oldLi.querySelector('input[type="checkbox"]');
                                    if (chk) chk.checked = true;
                                }
                            }
                            li.dataset.realProp = propText;
                        } else {
                            styleDeclaration.setProperty(propText, valText, priority);
                            li.dataset.realProp = propText;
                        }
                        if (onChange) onChange(styleDeclaration, propText, oldValueToPass);
                    }
                } catch(e) { console.error("Style update error:", e); }
            }
            
            li.dataset.propName = propText;
            li.querySelector('.prop-name').textContent = propText;
            
            const currentBlock = li.closest('.css-rule-block');
            const currentElement = currentBlock ? currentBlock._currentElement : null;

            if (type === 'value') {
                const displayVal = priority === 'important' ? `${valText} !important` : valText;
                if (window.MyDevTool.StylesTab) window.MyDevTool.StylesTab.updateValueSpan(span, displayVal, styleDeclaration, currentElement);
            } else {
                li.querySelector('.prop-value').textContent = priority === 'important' ? `${valText} !important` : valText;
            }
            
            if (window.MyDevTool.StylesTab) window.MyDevTool.StylesTab.refreshOverriddenStatus();
        };

        const cancelEdit = () => {
            cleanupListeners();
            if (isNew) { li.remove(); } 
            else {
                if (type === 'value') span.innerHTML = oldHTML; else span.textContent = oldText;
                let oldVal = (type === 'value') ? oldText : otherSpan.textContent;
                
                let prio = '';
                if (oldVal.toLowerCase().includes('!important')) {
                    oldVal = oldVal.replace(/!important/gi, '').trim();
                    prio = 'important';
                }
                
                if(Utils.isRealStyleDecl(styleDeclaration)) styleDeclaration.setProperty(currentRealProp, oldVal, prio);
            }
        };

        const onSuggestionSelect = (selectedValue) => {
            SuggestionBox.hide();
            if (selectedValue.includes && selectedValue.includes(': ') && !selectedValue.startsWith('var(')) {
                const parts = selectedValue.split(': ');
                const newProp = parts[0]; 
                let newVal = parts[1];
                let priority = '';

                if (newVal.toLowerCase().includes('!important')) {
                    newVal = newVal.replace(/!important/gi, '').trim();
                    priority = 'important';
                }

                span.textContent = newProp; otherSpan.textContent = priority === 'important' ? `${newVal} !important` : newVal;
                
                if (Utils.isRealStyleDecl(styleDeclaration)) {
                    try {
                        styleDeclaration.removeProperty(currentRealProp);
                        styleDeclaration.setProperty(newProp, newVal, priority);
                        li.dataset.realProp = newProp; 
                        if (onChange) onChange(styleDeclaration, newProp);
                    } catch(e) { console.error(e); }
                }
                
                const currentBlock = li.closest('.css-rule-block');
                const currentElement = currentBlock ? currentBlock._currentElement : null;
                
                if (window.MyDevTool.StylesTab) window.MyDevTool.StylesTab.updateValueSpan(otherSpan, priority === 'important' ? `${newVal} !important` : newVal, styleDeclaration, currentElement);
                applyChanges(); isNavigating = true; 
                if (window.MyDevTool.StylesTab) window.MyDevTool.StylesTab.refreshOverriddenStatus();
                if (onAddNewRow) onAddNewRow(); 
                
                isNavigating = true; cleanupListeners(); 
                setTimeout(() => makeEditable(otherSpan, 'value', isNew, span, styleDeclaration, onAddNewRow, onChange), 10);
                return;
            }
            
            if (type === 'value' && selectedValue.startsWith('--') && currentTokenPrefix.endsWith('var(')) {
                span.textContent = currentTokenPrefix + selectedValue + ')';
            } else if (type === 'value' && selectedValue.startsWith('--')) {
                 span.textContent = `var(${selectedValue})`;
            } else if (type === 'value' && currentTokenPrefix) {
                span.textContent = currentTokenPrefix + selectedValue;
            } else {
                span.textContent = selectedValue;
            }

            liveUpdateProperty(); 
            const oldValueToPass = (type === 'value') ? oldText : undefined;

            if (onChange && Utils.isRealStyleDecl(styleDeclaration)) {
                try { onChange(styleDeclaration, currentRealProp, oldValueToPass); } catch(e) {}
            }
            
            if (type === 'property') {
                isNavigating = true; cleanupListeners();
                makeEditable(otherSpan, 'value', isNew, span, styleDeclaration, onAddNewRow, onChange); 
            } else {
                if (window.MyDevTool.StylesTab) window.MyDevTool.StylesTab.refreshOverriddenStatus();
                Utils.setGlobalCursorPosition(span, span.textContent.length);
            }
        };
        
        const showCurrentSuggestions = () => {
            if (!settings.showSuggestions) { SuggestionBox.hide(); return; }
            
            const currentBlock = li.closest('.css-rule-block');
            const element = currentBlock ? currentBlock._currentElement : null;

            const res = SuggestionEngine.getSuggestions({
                type,
                fullText: span.textContent,
                propName: type === 'value' ? otherSpan.textContent : null,
                element,
                maxSuggestions: settings.maxSuggestions
            });

            currentTokenPrefix = res.currentTokenPrefix;
            SuggestionBox.show(span, res.suggestions, onSuggestionSelect);
        };
        
        const onOtherSpanClick = (e) => {
            e.stopPropagation(); applyChanges(); 
            const newType = (type === 'property') ? 'value' : 'property';
            if (type === 'property') otherSpan.focus();
            makeEditable(otherSpan, newType, isNew, span, styleDeclaration, onAddNewRow, onChange);
        };

        function liveUpdateProperty() {
            let valText = span.textContent.trim();
            let priority = '';

            if (valText.toLowerCase().includes('!important')) {
                valText = valText.replace(/!important/gi, '').trim();
                priority = 'important';
            }

            if (currentRealProp && Utils.isRealStyleDecl(styleDeclaration) && !currentRealProp.includes(':')) {
                try { styleDeclaration.setProperty(currentRealProp, valText, priority); } catch(e) {}
            }
        }

        otherSpan.addEventListener('click', onOtherSpanClick);
        span.onblur = applyChanges;
        span.oninput = () => { liveUpdateProperty(); showCurrentSuggestions(); }; 
        
        span.onpaste = (e) => {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const rules = PasteHandler.parseSmartPaste(pastedText);
            
            if (rules.length === 0) {
                document.execCommand('insertText', false, pastedText);
                return;
            }
            
            if (rules.length === 1) {
                const rule = rules[0];
                if (type === 'property') {
                    if (rule.property && rule.value) {
                        const oldValue = (Utils.isRealStyleDecl(styleDeclaration)) ? styleDeclaration.getPropertyValue(rule.property) : '';
                        span.textContent = rule.property;
                        setTimeout(() => {
                            cleanupListeners(); otherSpan.textContent = rule.value;
                            if (Utils.isRealStyleDecl(styleDeclaration)) {
                                try {
                                    let pVal = rule.value;
                                    let pPrio = '';
                                    if (pVal.toLowerCase().includes('!important')) {
                                        pVal = pVal.replace(/!important/gi, '').trim();
                                        pPrio = 'important';
                                    }
                                    styleDeclaration.setProperty(rule.property, pVal, pPrio);
                                    
                                    li.dataset.realProp = rule.property; li.dataset.propName = rule.property;
                                    if (onChange) onChange(styleDeclaration, rule.property, oldValue || undefined);
                                } catch(e) {}
                            }
                            if (onAddNewRow) onAddNewRow();
                        }, 0);
                    } else document.execCommand('insertText', false, rule.property);
                } else if (type === 'value') {
                    if (rule.property && rule.value) {
                        const oldValue = (Utils.isRealStyleDecl(styleDeclaration)) ? styleDeclaration.getPropertyValue(rule.property) : '';
                        otherSpan.textContent = rule.property; span.textContent = rule.value;
                        currentRealProp = rule.property; li.dataset.realProp = rule.property; li.dataset.propName = rule.property;
                        if (Utils.isRealStyleDecl(styleDeclaration)) {
                            try {
                                let pVal = rule.value;
                                let pPrio = '';
                                if (pVal.toLowerCase().includes('!important')) {
                                    pVal = pVal.replace(/!important/gi, '').trim();
                                    pPrio = 'important';
                                }
                                styleDeclaration.setProperty(rule.property, pVal, pPrio);

                                if (onChange) onChange(styleDeclaration, rule.property, oldValue || undefined);
                            } catch(e) {}
                        }
                        setTimeout(() => { cleanupListeners(); if (onAddNewRow) onAddNewRow(); }, 0);
                    } else document.execCommand('insertText', false, rule.value || pastedText);
                }
                return;
            }
            
            if (rules.length > 1) {
                const firstRule = rules[0];
                const oldValue = (Utils.isRealStyleDecl(styleDeclaration)) ? styleDeclaration.getPropertyValue(firstRule.property) : '';
                
                if (type === 'property') { span.textContent = firstRule.property; otherSpan.textContent = firstRule.value; } 
                else { otherSpan.textContent = firstRule.property; span.textContent = firstRule.value; }
                
                currentRealProp = firstRule.property; li.dataset.realProp = firstRule.property; li.dataset.propName = firstRule.property;
                
                if (Utils.isRealStyleDecl(styleDeclaration)) {
                    try {
                        let fVal = firstRule.value;
                        let fPrio = '';
                        if (fVal.toLowerCase().includes('!important')) {
                            fVal = fVal.replace(/!important/gi, '').trim();
                            fPrio = 'important';
                        }
                        styleDeclaration.setProperty(firstRule.property, fVal, fPrio);

                        if (onChange) onChange(styleDeclaration, firstRule.property, oldValue || undefined);
                    } catch(e) {}
                }
                
                cleanupListeners();
                setTimeout(() => PasteHandler.applyMultipleRules(rules.slice(1), li, styleDeclaration, onAddNewRow, onChange), 0);
            }
        };
        
        span.onkeydown = (e) => {
            if (SuggestionBox.isVisible && SuggestionBox.isVisible()) {
                 if (SuggestionBox.handleKeyDown(e)) { e.preventDefault(); e.stopPropagation(); return; }
            }
            if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault(); 
                const currentText = span.textContent.trim();
                const propText = (type === 'property') ? currentText : otherSpan.textContent.trim();
                if (currentText === '' || (type === 'value' && !propText)) { applyChanges(); return; }
                
                isNavigating = true; liveUpdateProperty(); cleanupListeners(); 
                
                if (!e.shiftKey) { 
                    if (type === 'property') makeEditable(otherSpan, 'value', isNew, span, styleDeclaration, onAddNewRow, onChange);
                    else {
                        const nextLi = li.nextElementSibling;
                        if (nextLi && nextLi.querySelector) {
                            const nProp = nextLi.querySelector('.prop-name'), nVal = nextLi.querySelector('.prop-value');
                            if (nProp && nVal) makeEditable(nProp, 'property', false, nVal, styleDeclaration, onAddNewRow, onChange);
                            else if (onAddNewRow) onAddNewRow();
                        } else if (onAddNewRow) onAddNewRow();
                    }
                } else { 
                    if (type === 'value') makeEditable(otherSpan, 'property', isNew, span, styleDeclaration, onAddNewRow, onChange);
                    else {
                        const prevLi = li.previousElementSibling;
                        if (prevLi) {
                            const pVal = prevLi.querySelector('.prop-value'), pProp = prevLi.querySelector('.prop-name');
                            if (pVal && pProp) makeEditable(pVal, 'value', false, pProp, styleDeclaration, onAddNewRow, onChange);
                        }
                    }
                }
                return;
            }
            if (type === 'value' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                e.preventDefault();
                let amount = e.shiftKey ? 10 : (e.altKey ? 0.1 : 1);
                if (e.key === 'ArrowDown') amount *= -1;
                const result = Utils.incrementValueWithCursor(span.textContent, Utils.getGlobalCursorPosition(span), amount);
                if (result) {
                    span.textContent = result.newValue; liveUpdateProperty(); 
                    if (onChange) onChange(styleDeclaration, currentRealProp, oldText);
                    Utils.setGlobalCursorPosition(span, result.newCursor);
                }
                return; 
            }
            if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cancelEdit(); }
        };

        span.contentEditable = true;
        span.focus(); document.execCommand('selectAll', false, null); 
        setTimeout(() => { if (span.textContent.trim() === '') showCurrentSuggestions(); }, 10);
    }

    return { 
        makeEditable,
        getSettings: Utils.getSettings,
        updateSettings: Utils.updateSettings
    };
})();