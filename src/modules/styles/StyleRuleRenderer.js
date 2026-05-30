// src/modules/styles/StyleRuleRenderer.js

import {cssColorNames} from './color_names.js' ;

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.StyleRuleRenderer = (function() {

    const StyleData = window.MyDevTool.StyleData;
    const StylePropertyEditor = window.MyDevTool.StylePropertyEditor;
    const StyleChangeTracker = window.MyDevTool.StyleChangeTracker;
    const UserAgentStyles = window.MyDevTool.UserAgentStyles;
    
    let shadowRoot = null;
    let pickerInstance = null;
    let SVGs = null;

    const INHERITABLE_PROPERTIES = new Set([
        "color", "cursor", "direction", "font", "font-family", "font-size", "font-style", 
        "font-variant", "font-weight", "letter-spacing", "line-height", "list-style", 
        "text-align", "text-indent", "text-transform", "text-shadow", "visibility", 
        "white-space", "word-spacing", "overflow-wrap", "border-collapse", "border-spacing",
        "quotes", "list-style-type", "list-style-image", "list-style-position"
    ]);
    const SHORTHAND_MAP = {
        'margin': ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
        'padding': ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
        'background': ['background-color', 'background-image', 'background-position', 'background-size', 'background-repeat'],
        'border': ['border-top', 'border-right', 'border-bottom', 'border-left', 'border-width', 'border-style', 'border-color'],
        'border-radius': ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'],
        'font': ['font-style', 'font-variant', 'font-weight', 'font-size', 'line-height', 'font-family'],
        'flex': ['flex-grow', 'flex-shrink', 'flex-basis'],
        'grid-gap': ['row-gap', 'column-gap'],
        'overflow': ['overflow-x', 'overflow-y']
    };
    
    const colorRegex = new RegExp(`(#(?:[0-9a-f]{3,8})|rgb[a]?\\([^)]+\\)|hsl[a]?\\([^)]+\\)|\\b(?:${cssColorNames})\\b)`, "i");
    const varRegex = /var\((--[a-zA-Z0-9-_]+)(?:,\s*(.*))?\)/i;

    let activePropValueSpan = null;
    let activeStyleDeclaration = null;
    let activeDetectedColor = null;
    let activeSwatch = null;

    function init(root, svgs) {
        shadowRoot = root;
        SVGs = svgs;
        if (window.CodeMirrorColorPicker && !pickerInstance) {
            const ColorPicker = window.CodeMirrorColorPicker.ColorPicker;
            pickerInstance = new ColorPicker({ 
                onChange: (newColor) => { 
                    if (activePropValueSpan && activeStyleDeclaration && activeDetectedColor) {
                      const oldPropValue = activePropValueSpan.textContent;
                      const newPropValue = oldPropValue.replace(activeDetectedColor, newColor);
                      const li = activePropValueSpan.parentElement;
                      const propName = li.dataset.realProp || li.querySelector('.prop-name').textContent.trim();
                      const currentBlock = li.closest('.css-rule-block');
                      const currentElement = currentBlock ? currentBlock._currentElement : null;

                      if (currentElement) {
                          StyleChangeTracker.track(activeStyleDeclaration, currentElement, propName, oldPropValue);
                      }

                      activeStyleDeclaration.setProperty(propName, newPropValue, activeStyleDeclaration.getPropertyPriority(propName));
                      updateValueSpan(activePropValueSpan, newPropValue, activeStyleDeclaration, currentElement);
                      refreshOverriddenStatus(li.closest('.style-rules-container'));
                      
                      activeDetectedColor = newColor;
                      if(activeSwatch) activeSwatch.style.backgroundColor = newColor;
                    }
                } 
            });
        }
    }

    // Parses CSS including commented declarations
    function parseRawCss(cssText) {
        if (!cssText) return [];
        const items = [];
        
        const commentRegex = /\/\*([\s\S]*?)\*\//g;
        let lastIndex = 0;
        let match;
        
        while ((match = commentRegex.exec(cssText)) !== null) {
            const before = cssText.substring(lastIndex, match.index);
            if (before.trim()) parseNormalDeclarations(before, items);
            
            const commentContent = match[1].trim();
            const declMatch = commentContent.match(/^([a-zA-Z0-9-_]+)\s*:\s*([\s\S]+?);?$/);
            
            if (declMatch) {
                items.push({ 
                    name: declMatch[1].trim(), 
                    value: declMatch[2].trim(),
                    disabled: true 
                });
            }
            lastIndex = commentRegex.lastIndex;
        }
        
        const remaining = cssText.substring(lastIndex);
        if (remaining.trim()) parseNormalDeclarations(remaining, items);

        return items;
    }

    function parseNormalDeclarations(text, items) {
        let buffer = '';
        let inQuote = false; 
        let quoteChar = null;
        let inParen = 0;
        
        for (let i = 0; i < text.length; i++) {
            const c = text[i];
            if (c === '"' || c === "'") {
                if (!inQuote) { inQuote = true; quoteChar = c; }
                else if (c === quoteChar) { inQuote = false; }
            }
            if (c === '(') inParen++;
            if (c === ')') inParen--;
            if (c === ';' && !inQuote && inParen === 0) {
                processProp(buffer);
                buffer = '';
            } else {
                buffer += c;
            }
        }
        processProp(buffer); 
        
        function processProp(str) {
            str = str.trim();
            if (!str) return;
            const firstColon = str.indexOf(':');
            if (firstColon > -1) {
                const name = str.substring(0, firstColon).trim();
                const value = str.substring(firstColon + 1).trim();
                if (name && value) {
                    items.push({ name, value, disabled: false });
                }
            }
        }
    }

    function buildRuleBlock(container, selectorText, ruleOrStyle, sourceText, currentElement, insertAtTop = false, mode = 'normal', isInherited = false) {
        const i18n = window.MyDevTool.LanguageManager; 
        const section = document.createElement('section'); 
        section.className = 'css-rule-block'; 
        section._currentElement = currentElement;
        
        // Mark blocks for Diffing
        section.dataset.selector = selectorText;
        section.dataset.source = sourceText;
        section.dataset.mode = mode;
        
        if (isInherited) section.classList.add('inherited-block');
        
        const showUserAgent = localStorage.getItem('dt_style_show_user_agent') !== 'false';
        const isUserAgentStyle = sourceText === 'user agent stylesheet';
        
        if (isUserAgentStyle) {
            section.classList.add('user-agent-block');
            if (!showUserAgent) section.style.display = 'none';
        }

        const header = document.createElement('header');
        let sourceHTML = '', displaySourceText = sourceText;
        let displaySelector = selectorText; 
        let isEditableSelector = true;
        
        if (selectorText === 'element.style' && mode === 'changes') {
            displaySelector = StyleChangeTracker.generateFullSelector(currentElement);
            isEditableSelector = false;
        } else if (selectorText === 'element.style') {
            displaySelector = i18n.t('styles.element_style'); 
            isEditableSelector = false;
        }
        
        const normalizedSelector = selectorText.toLowerCase().trim();
        if (normalizedSelector === 'html' || normalizedSelector === ':root' || sourceText === 'user agent stylesheet') {
            isEditableSelector = false;
        }
        
        if (sourceText === 'user agent stylesheet') { 
            displaySourceText = i18n.t('styles.user_agent_stylesheet'); sourceHTML = `<span class="rule-source" data-source="user-agent">${displaySourceText}</span>`; 
        } else if (sourceText !== 'element.style') { 
            const dataSourceAttr = (sourceText === 'inspector-stylesheet') ? 'inspector': sourceText; 
            if (sourceText === 'inspector-stylesheet') displaySourceText = i18n.t('styles.inspector_stylesheet'); 
            sourceHTML = `<span class="rule-source" data-source="${dataSourceAttr}">${escapeHTML(displaySourceText)}</span>`; 
        }
        
        const selectorSpan = document.createElement('span');
        selectorSpan.className = 'selector-text';
        if (isEditableSelector) {
            selectorSpan.classList.add('editable-selector');
            selectorSpan.dataset.originalSelector = selectorText; 
            selectorSpan.dataset.ruleSource = sourceText;
        }
        selectorSpan.textContent = displaySelector + ' {';
        
        header.appendChild(selectorSpan);
        if (sourceHTML) {
            const sourceSpanWrapper = document.createElement('span');
            sourceSpanWrapper.innerHTML = sourceHTML;
            header.appendChild(sourceSpanWrapper.firstChild);
        }
        
        section.appendChild(header);
        
        if (isEditableSelector) {
            addSlowDoubleTapForSelector(selectorSpan, ruleOrStyle, section);
        }

        const openBrace = document.createElement('div'); openBrace.className = 'brace open-brace'; section.appendChild(openBrace);

        const ul = document.createElement('ul'); 
        section.appendChild(ul);
        
        updateRuleProperties(ul, ruleOrStyle, currentElement, mode, isInherited);
        
        let actualStyleDeclaration;
        if (ruleOrStyle instanceof CSSStyleDeclaration) { actualStyleDeclaration = ruleOrStyle; } 
        else if (ruleOrStyle && ruleOrStyle.style) { actualStyleDeclaration = ruleOrStyle.style; } 
        else { actualStyleDeclaration = ruleOrStyle; }

        const actionBtn = document.createElement('button'); 
        actionBtn.className = 'add-prop-btn'; 
        if (mode === 'changes') {
            actionBtn.innerHTML = SVGs.inspect || '⌖'; 
            actionBtn.title = "Inspect Element";
            actionBtn.onclick = (e) => { e.stopPropagation(); handleInspectClick(currentElement, ruleOrStyle); };
        } else {
            actionBtn.textContent = '+'; 
            actionBtn.title = i18n && i18n.t ? i18n.t('styles.new_rule') || "New Style Rule" : "New Style Rule"; 
            
            actionBtn.onclick = (e) => { 
                e.stopPropagation(); 
                
                let sheet = ruleOrStyle.parentStyleSheet;
                
                if (!sheet || sourceText === 'user agent stylesheet' || selectorText === 'element.style') {
                    const StyleData = window.MyDevTool.StyleData;
                    sheet = StyleData.getOrCreateDevToolStylesheet(currentElement);
                }
                
                if (sheet) {
                    let selector = selectorText; 
                    
                    // Smart selector for inline & global block
                    if (selector === 'element.style' || sourceText === 'user agent stylesheet') {
                         selector = currentElement.tagName.toLowerCase();
                         if (currentElement.id) selector += '#' + currentElement.id;
                         else if (currentElement.className && typeof currentElement.className === 'string') {
                             const cls = currentElement.className.trim().split(/\s+/)[0];
                             if (cls) selector += '.' + cls;
                         }
                    }
                    
                    let newIndex = sheet.cssRules ? sheet.cssRules.length : 0;
                    
                    // 3. Find the index of the current rule inside the stylesheet and insert right before it
                    // (Because our engine displays later rules higher up in the UI based on Priority. 
                    // Injecting it before ensures it appears directly beneath the current block in the UI!)
                    if (sheet.cssRules && ruleOrStyle.parentStyleSheet === sheet) {
                        for (let i = 0; i < sheet.cssRules.length; i++) {
                            if (sheet.cssRules[i] === ruleOrStyle) {
                                newIndex = i; // Insert BEFORE so it appears BELOW in UI
                                break;
                            }
                        }
                    }
                    
                    try {
                        // New Rule Inject
                        sheet.insertRule(`${selector} {}`, newIndex);
                        
                        if (window.MyDevTool.StylesTab && window.MyDevTool.StylesTab.refresh) {
                            window.MyDevTool.StylesTab.refresh();
                        }
                    } catch (err) {
                        console.warn('Failed to add new rule (Might be a CORS restricted stylesheet):', err);
                    }
                }
            };      
            
            
            
            
        }
        
        
        
        
        
        section.appendChild(actionBtn);

        const closeBrace = document.createElement('div'); closeBrace.className = 'brace close-brace'; closeBrace.textContent = '}'; section.appendChild(closeBrace);

        if (mode === 'normal') {
            section.onclick = (e) => { 
                if (e.target === openBrace || e.target === ul) { addNewPropertyRow(ul, actualStyleDeclaration, currentElement, { prepend: true }); } 
                else if (e.target === section || e.target === closeBrace) { addNewPropertyRow(ul, actualStyleDeclaration, currentElement, {}); } 
            };
        }

        if (container) {
            if (insertAtTop) { container.prepend(section); section.scrollIntoView({ behavior: 'smooth', block: 'center' }); } else { container.appendChild(section); }
        }
        
        return section;
    }

    // Update existing DOM block without Destroying it
    function updateRuleBlock(blockElement, ruleOrStyle, currentElement, mode = 'normal', isInherited = false) {
        if (!blockElement || !blockElement.isConnected) return false;
        
        const ul = blockElement.querySelector('ul');
        if (!ul) return false;
        
        // 1. Update Selector Text (Only if changed externally)
        if (ruleOrStyle.selectorText && mode !== 'changes') {
            const selSpan = blockElement.querySelector('.selector-text');
            if (selSpan && selSpan.dataset.originalSelector !== ruleOrStyle.selectorText) {
                // If user is currently editing, DON'T update
                if (selSpan.isContentEditable) return; 
                selSpan.textContent = ruleOrStyle.selectorText + ' {';
                selSpan.dataset.originalSelector = ruleOrStyle.selectorText;
            }
        }

        // 2. Diff Properties
        updateRuleProperties(ul, ruleOrStyle, currentElement, mode, isInherited);
        return true;
    }

    // Property Diffing
    function updateRuleProperties(ul, ruleOrStyle, currentElement, mode, isInherited) {
        let properties = [];
        let styleDeclaration;
        
        if (ruleOrStyle instanceof CSSStyleDeclaration) { styleDeclaration = ruleOrStyle; } 
        else if (ruleOrStyle.style) { styleDeclaration = ruleOrStyle.style; } 
        else { styleDeclaration = ruleOrStyle; }

        // Data Collection
        if (mode === 'normal' && !ruleOrStyle.selectorText && !ruleOrStyle.cssText && currentElement) {
             // element.style
             const rawCss = currentElement.getAttribute('style') || ""; 
             properties = parseRawCss(rawCss);
        } else if (ruleOrStyle.cssText) {
            // CSS Rule with text
            let text = ruleOrStyle.cssText;
            if (text.includes('{')) text = text.split('{')[1].split('}')[0];
            properties = parseRawCss(text); 
        } else {
             // Fallback
             for (let i = 0; i < styleDeclaration.length; i++) { 
                const propName = styleDeclaration[i]; 
                properties.push({ name: propName, value: styleDeclaration.getPropertyValue(propName), disabled: false }); 
            }
        }

        const existingLis = Array.from(ul.children);
        
        // Diffing Loop
        properties.forEach((prop, index) => {
            const rawPropName = prop.name; 
            let isDisabled = prop.disabled;
            let displayPropName = rawPropName;
            
            if (!isDisabled && rawPropName.startsWith('--disabled-')) { 
                isDisabled = true; 
                displayPropName = rawPropName.replace('--disabled-', ''); 
            }
            
            // Try to match with existing LI at this index
            const existingLi = existingLis[index];
            
            if (existingLi) {
                // Check if update is needed
                const oldName = existingLi.dataset.propName;
                const oldRawName = existingLi.dataset.realProp;
                const oldValue = existingLi.querySelector('.prop-value').textContent;
                const oldDisabled = existingLi.classList.contains('disabled');
                
                const needsUpdate = (oldName !== displayPropName) || 
                                    (oldRawName !== rawPropName) ||
                                    (oldValue !== prop.value) || 
                                    (oldDisabled !== isDisabled);
                
                if (needsUpdate) {
                    // Update Content
                    const newLi = createPropertyRow(displayPropName, prop.value, styleDeclaration, false, isDisabled, rawPropName, currentElement, (mode === 'changes'), isInherited);
                    if (mode === 'changes' && StyleChangeTracker.isPropertyChanged(styleDeclaration, rawPropName)) {
                        newLi.classList.add('changed-property');
                    }
                    ul.replaceChild(newLi, existingLi);
                } else {
                    // Even if content same, check overridden status later
                }
            } else {
                // Add New
                const newLi = createPropertyRow(displayPropName, prop.value, styleDeclaration, false, isDisabled, rawPropName, currentElement, (mode === 'changes'), isInherited);
                if (mode === 'changes' && StyleChangeTracker.isPropertyChanged(styleDeclaration, rawPropName)) {
                    newLi.classList.add('changed-property');
                }
                ul.appendChild(newLi);
            }
        });
        
        // Remove extra LIs
        while (ul.children.length > properties.length) {
            ul.removeChild(ul.lastChild);
        }
    }

    function handleInspectClick(element, declaration) {
        if (window.MyDevTool.StylesTab && window.MyDevTool.StylesTab.exitChangesMode) {
            window.MyDevTool.StylesTab.exitChangesMode(element);
        }
    }

    function createPropertyRow(propName, propValue, styleDeclaration, isOverridden, isDisabled, rawPropName, currentElement, hideCheckbox = false, isInherited = false) {
        const li = document.createElement('li'); 
        
        let isDuplicate = false;
        let displayPropName = propName;
        if (rawPropName && rawPropName.startsWith('--duplicate-')) {
            displayPropName = rawPropName.replace('--duplicate-', '');
            isDuplicate = true;
        }

        li.dataset.realProp = rawPropName || displayPropName; 
        li.dataset.propName = displayPropName; 
        
        if (isOverridden || isDuplicate) li.classList.add('overridden'); 
        if (isDisabled) li.classList.add('disabled');

        if (isInherited && !INHERITABLE_PROPERTIES.has(displayPropName) && !displayPropName.trim().startsWith('--')) {
            li.classList.add('not-inherited'); 
        }

        if (!hideCheckbox) {
            const checkbox = document.createElement('input'); 
            checkbox.type = 'checkbox'; 
            checkbox.checked = !isDisabled; 
            checkbox.onchange = () => { 
                const isChecked = checkbox.checked; 
                li.classList.toggle('disabled', !isChecked); 
                const currentRealProp = li.dataset.realProp; 
                const visibleProp = li.dataset.propName; 
                const currentValue = li.querySelector('.prop-value').textContent; 
                const priority = styleDeclaration.getPropertyPriority(currentRealProp); 
                const valueForTracker = currentValue;

                if (!isChecked) { 
                    styleDeclaration.removeProperty(currentRealProp); 
                    const newRealProp = `--disabled-${visibleProp}`; 
                    styleDeclaration.setProperty(newRealProp, currentValue, priority); 
                    li.dataset.realProp = newRealProp; 
                } else { 
                    styleDeclaration.removeProperty(currentRealProp); 
                    styleDeclaration.setProperty(visibleProp, currentValue, priority); 
                    li.dataset.realProp = visibleProp; 
                } 
                StyleChangeTracker.track(styleDeclaration, currentElement, currentRealProp, valueForTracker);
                refreshOverriddenStatus(li.closest('.style-rules-container')); 
            }; 
            li.appendChild(checkbox);
        } else {
            const spacer = document.createElement('span'); spacer.style.width = '14px'; spacer.style.display = 'inline-block'; li.appendChild(spacer);
        }
        
        const propSpan = document.createElement('span'); propSpan.className = 'prop-name'; propSpan.textContent = displayPropName; li.appendChild(propSpan); li.appendChild(document.createTextNode(': '));
        const valueSpan = document.createElement('span'); valueSpan.className = 'prop-value'; 
        
        updateValueSpan(valueSpan, propValue, styleDeclaration, currentElement); 
        
        li.appendChild(valueSpan); li.appendChild(document.createTextNode(';'));
        
        if (hideCheckbox && StyleChangeTracker.isPropertyChanged(styleDeclaration, li.dataset.realProp)) {
            const originalVal = StyleChangeTracker.getOriginalValue(styleDeclaration, li.dataset.realProp);
            if (originalVal !== undefined && originalVal !== null && originalVal !== propValue) {
                const ghostSpan = document.createElement('span');
                ghostSpan.className = 'original-value-ghost';
                ghostSpan.textContent = `  (prev: ${originalVal})`;
                li.appendChild(ghostSpan);
            }
        }
        
        const onAddNewRowCallback = () => { 
            const currentUl = li.parentElement; 
            if (currentUl) addNewPropertyRow(currentUl, styleDeclaration, currentElement, {}); 
            refreshOverriddenStatus(li.closest('.style-rules-container')); 
        };
        const onChangeCallback = (decl, pName, oldVal) => {
            StyleChangeTracker.track(decl, currentElement, pName, oldVal);
            refreshOverriddenStatus(li.closest('.style-rules-container'));
        };

        addDoubleTapListener(propSpan, () => StylePropertyEditor.makeEditable(propSpan, 'property', false, valueSpan, styleDeclaration, onAddNewRowCallback, onChangeCallback));
        addDoubleTapListener(valueSpan, () => StylePropertyEditor.makeEditable(valueSpan, 'value', false, propSpan, styleDeclaration, onAddNewRowCallback, onChangeCallback));
        
        li.onclick = (e) => { if (e.target.type !== 'checkbox') { shadowRoot.querySelectorAll('.selected-row').forEach(el => el.classList.remove('selected-row')); li.classList.add('selected-row'); } e.stopPropagation(); };
        li.oncontextmenu = (e) => { e.preventDefault(); e.stopPropagation(); const section = li.closest('.css-rule-block'); const selectorSpan = section.querySelector('.selector-text'); const selector = selectorSpan ? selectorSpan.textContent.replace(/ \{$/, '').trim(): 'element.style'; const currentPropName = propSpan.textContent; const currentValue = valueSpan.textContent; const options = buildPropertyContextMenu(currentPropName, currentValue, selector, styleDeclaration, li); if (window.MyDevTool.ContextMenu) window.MyDevTool.ContextMenu.show(e, options); };
        return li;
    }

    function addNewPropertyRow(ul, styleDeclaration, currentElement, options = {}) { 
        const li = createPropertyRow('', '', styleDeclaration, false, false, '', currentElement); 
        if (options.prepend) ul.prepend(li); else if (options.afterElement) options.afterElement.after(li); else ul.appendChild(li); 
        const propSpan = li.querySelector('.prop-name'); 
        const valueSpan = li.querySelector('.prop-value'); 
        const onAddNewRowCallback = () => { addNewPropertyRow(ul, styleDeclaration, currentElement, {}); refreshOverriddenStatus(ul.closest('.style-rules-container')); }; 
        const onChangeCallback = (decl, pName, oldVal) => {
            StyleChangeTracker.track(decl, currentElement, pName, oldVal);
            refreshOverriddenStatus(ul.closest('.style-rules-container'));
        };
        StylePropertyEditor.makeEditable(propSpan, 'property', true, valueSpan, styleDeclaration, onAddNewRowCallback, onChangeCallback); 
    }

    function updateValueSpan(valueSpan, propValue, styleDeclaration, element) {
        valueSpan.innerHTML = ''; 
        const propValueTrimmed = propValue.trim(); 
        
        let colorMatch = propValueTrimmed.match(colorRegex);
        let resolvedColorForSwatch = null;

        if (!colorMatch && element) {
            const varMatch = propValueTrimmed.match(varRegex);
            if (varMatch) {
                const varName = varMatch[1];
                try {
                    const computedStyle = window.getComputedStyle(element);
                    const resolvedValue = computedStyle.getPropertyValue(varName).trim();
                    if (resolvedValue && colorRegex.test(resolvedValue)) {
                        colorMatch = varMatch; 
                        resolvedColorForSwatch = resolvedValue; 
                    }
                } catch (e) { /* ignore computation errors */ }
            }
        }

        if (colorMatch && window.CodeMirrorColorPicker) {
          const detectedString = colorMatch[0]; 
          const swatchColor = resolvedColorForSwatch || detectedString;
          const index = propValue.indexOf(detectedString); 
          const beforeText = propValue.substring(0, index);
          
          if (beforeText) valueSpan.appendChild(document.createTextNode(beforeText));
          
          const swatch = document.createElement('span'); 
          swatch.className = 'color-swatch-inline'; 
          swatch.style.backgroundColor = swatchColor; 
          
          swatch.addEventListener('click', (e) => { 
              e.stopPropagation(); 
              e.preventDefault(); 
              const currentColor = resolvedColorForSwatch || detectedString;
              const rect = swatch.getBoundingClientRect(); 
              const pos = { left: Math.round(rect.left + window.scrollX), top: Math.round(rect.bottom + window.scrollY) }; 
              activePropValueSpan = valueSpan; 
              activeSwatch = swatch; 
              activeStyleDeclaration = styleDeclaration; 
              activeDetectedColor = detectedString; 
              if (pickerInstance) { pickerInstance.show(pos, currentColor); } 
          }); 
          
          valueSpan.appendChild(swatch); 
          valueSpan.appendChild(document.createTextNode(propValue.substring(index)));
        } else { 
            valueSpan.textContent = propValue; 
        }
    }
    
    function refreshOverriddenStatus(rulesContainer) {
        if (!rulesContainer) return;
        
        const blocks = Array.from(rulesContainer.querySelectorAll('.css-rule-block:not(.user-agent-block)')); 
        
        // 1. Old overridden class clean
        blocks.forEach(block => { 
            block.querySelectorAll('li').forEach(li => { 
                li.classList.remove('overridden', 'overridden-by-same-selector'); 
            }); 
        });
        
        const globalDefinedProps = new Set();
        
        // 2. Top-to-Bottom 
        for (let b = 0; b < blocks.length; b++) {
            const block = blocks[b];
            const lis = Array.from(block.querySelectorAll('li'));
            const blockDefinedProps = new Set();
            
            // Bottom to Top scan in block
            for (let i = lis.length - 1; i >= 0; i--) {
                const li = lis[i];
                const checkbox = li.querySelector('input[type="checkbox"]');
                
                if (checkbox && !checkbox.checked) { 
                    li.classList.remove('overridden'); 
                    continue; 
                }
                
                if (li.classList.contains('not-inherited')) { 
                    continue; 
                }
                
                const propName = li.dataset.propName; 
                if (!propName) continue;
                
                if (blockDefinedProps.has(propName)) { 
                    li.classList.add('overridden'); 
                    continue; 
                }
                
                if (globalDefinedProps.has(propName)) { 
                    li.classList.add('overridden'); 
                } else { 
                    li.classList.remove('overridden'); 
                    globalDefinedProps.add(propName); 
                    blockDefinedProps.add(propName); 
                    
                    if (SHORTHAND_MAP[propName]) { 
                        SHORTHAND_MAP[propName].forEach(p => { 
                            globalDefinedProps.add(p); 
                            blockDefinedProps.add(p); 
                        }); 
                    } 
                }
            }
        }
        
        // 3. User Agent Block 
        const uaBlock = rulesContainer.querySelector('.user-agent-block');
        if (uaBlock && UserAgentStyles) {
            const element = uaBlock._currentElement; 
            if (element) {
                uaBlock.querySelectorAll('li.user-agent-property').forEach(li => {
                    const propName = li.querySelector('.prop-name').textContent;
                    const propValue = li.querySelector('.prop-value').textContent;
                    
                    const isOverridden = UserAgentStyles.isPropertyOverridden(element, propName, propValue) || globalDefinedProps.has(propName);
                    
                    const nameSpan = li.querySelector('.prop-name');
                    const valSpan = li.querySelector('.prop-value');
                    const punctuation = li.querySelectorAll('.tag-punctuation');
                    
                    if (isOverridden) {
                        nameSpan.style.textDecoration = 'line-through'; nameSpan.style.opacity = '0.5';
                        valSpan.style.textDecoration = 'line-through'; valSpan.style.opacity = '0.5';
                        punctuation.forEach(p => { p.style.textDecoration = 'line-through'; p.style.opacity = '0.5'; });
                    } else {
                        nameSpan.style.textDecoration = 'none'; nameSpan.style.opacity = '1';
                        valSpan.style.textDecoration = 'none'; valSpan.style.opacity = '1'; valSpan.style.color = 'var(--dt-text-primary)';
                        punctuation.forEach(p => { p.style.textDecoration = 'none'; p.style.opacity = '1'; });
                    }
                });
            }
        }
    }

    function buildPropertyContextMenu(propName, propValue, selector, styleDeclaration, liElement) { 
        const i18n = window.MyDevTool.LanguageManager; 
        const toJsProperty = (cssProp) => cssProp.replace(/-([a-z])/g, (g) => g[1].toUpperCase()); 
        
        const isRowDisabled = liElement.classList.contains('disabled');
        const realPropName = isRowDisabled ? propName.replace('--disabled-', '') : propName;

        let declaration = `${realPropName}: ${propValue};`;
        if (isRowDisabled) declaration = `/* ${declaration} */`;

        let jsDeclaration = `element.style.${toJsProperty(realPropName)} = "${propValue}";`;
        if (isRowDisabled) jsDeclaration = `// ${jsDeclaration}`;

        const allLis = Array.from(liElement.parentElement.querySelectorAll('li'));
        
        const linesCSS = allLis.map(li => {
            const p = li.querySelector('.prop-name').textContent;
            const v = li.querySelector('.prop-value').textContent;
            const checkbox = li.querySelector('input[type="checkbox"]');
            const disabled = checkbox && !checkbox.checked;
            return disabled ? `  /* ${p}: ${v}; */` : `  ${p}: ${v};`;
        });
        const allDeclarationsText = linesCSS.join('\n');
        const ruleText = `${selector} {\n${allDeclarationsText}\n}`;

        const linesJS = allLis.map(li => {
            const p = li.querySelector('.prop-name').textContent;
            const v = li.querySelector('.prop-value').textContent;
            const checkbox = li.querySelector('input[type="checkbox"]');
            const disabled = checkbox && !checkbox.checked;
            const line = `element.style.${toJsProperty(p)} = "${v}";`;
            return disabled ? `// ${line}` : line;
        });
        const allDeclarationsJs = linesJS.join('\n');

        return [
            { label: i18n.t('styles.copy_selector'), callback: () => copyToClipboard(selector) }, 
            { label: i18n.t('styles.copy_declaration'), callback: () => copyToClipboard(declaration) }, 
            { label: i18n.t('styles.copy_property'), callback: () => copyToClipboard(realPropName) }, 
            { label: i18n.t('styles.copy_value'), callback: () => copyToClipboard(propValue) }, 
            { label: i18n.t('styles.copy_rule'), callback: () => copyToClipboard(ruleText) }, 
            { label: i18n.t('styles.copy_declaration_js'), callback: () => copyToClipboard(jsDeclaration) },
            { type: 'separator' }, 
            { label: i18n.t('styles.copy_all_declarations'), callback: () => copyToClipboard(allDeclarationsText) }, 
            { label: i18n.t('styles.copy_all_declarations_js'), callback: () => copyToClipboard(allDeclarationsJs) },
            { type: 'separator' }, 
            { 
                label: 'Changes', 
                sub: [
                    { label: 'Copy all changes (Properties)', callback: () => StyleChangeTracker.copyAll() }, 
                    { label: 'Copy full rule (Selector + All Props)', callback: () => StyleChangeTracker.copyFullRule() }, 
                    { label: 'Clear all changes', callback: () => StyleChangeTracker.clear() }
                ] 
            }
        ]; 
    }

    function escapeHTML(str) { return !str ? '' : str.replace(/[&<>"']/g, match => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[match])); }
    function copyToClipboard(text) { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).catch(err => fallbackCopy(text)); } else { fallbackCopy(text); } }
    function fallbackCopy(text) { const textArea = document.createElement("textarea"); textArea.value = text; textArea.style.position = "fixed"; textArea.style.left = "-9999px"; document.body.appendChild(textArea); textArea.focus(); textArea.select(); try { document.execCommand('copy'); } catch (err) {} document.body.removeChild(textArea); }
    function addDoubleTapListener(element, callback) { 
        let lastTap = 0; 
        
        element.addEventListener('click', (e) => { 
            const singleClickMode = localStorage.getItem('dt_style_edit_single_click') === 'true';
            
            if (singleClickMode) {
                e.preventDefault(); 
                e.stopPropagation(); 
                callback(e);
                return;
            }
            
            const currentTime = new Date().getTime(); 
            const tapLength = currentTime - lastTap; 
            if (tapLength < 500 && tapLength > 0) { 
                e.preventDefault(); 
                e.stopPropagation(); 
                callback(e); 
            } 
            lastTap = currentTime; 
        }); 
        
        element.addEventListener('dblclick', (e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            callback(e); 
        }); 
    }

    function addSlowDoubleTapForSelector(selectorSpan, ruleOrStyle, section) {
        let lastTap = 0;
        let tapTimer = null;
        
        const handleEdit = () => {
            makeSelectorEditable(selectorSpan, ruleOrStyle, section);
        };
        
        selectorSpan.addEventListener('click', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength > 300 && tapLength < 800) {
                e.preventDefault();
                e.stopPropagation();
                clearTimeout(tapTimer);
                handleEdit();
                lastTap = 0; 
                return;
            }
            
            lastTap = currentTime;
            clearTimeout(tapTimer);
        });
        
        selectorSpan.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleEdit();
        });
    }
    
    function makeSelectorEditable(selectorSpan, ruleOrStyle, section) {
        const oldFullText = selectorSpan.textContent;
        const cleanSelector = oldFullText.replace('{', '').trim();
        
        selectorSpan.textContent = cleanSelector;
        selectorSpan.contentEditable = true;
        selectorSpan.focus();
        document.execCommand('selectAll', false, null);

        const cleanup = () => {
            selectorSpan.contentEditable = false;
            selectorSpan.onblur = null;
            selectorSpan.onkeydown = null;
        };

        const applyChanges = () => {
            cleanup();
            const newSelector = selectorSpan.textContent.trim();
            
            if (!newSelector) {
                try {
                    const ruleBlock = section.closest('.css-rule-block');
                    if (ruleBlock) {
                        ruleBlock.style.opacity = '0';
                        setTimeout(() => ruleBlock.remove(), 200);
                    }
                    const parent = ruleOrStyle.parentRule || ruleOrStyle.parentStyleSheet;
                    if (parent && parent.cssRules) {
                        for (let i = 0; i < parent.cssRules.length; i++) {
                            if (parent.cssRules[i] === ruleOrStyle) {
                                parent.deleteRule(i);
                                break;
                            }
                        }
                    }
                } catch (e) { console.error(e); }
                return;
            }

            if (newSelector === cleanSelector) {
                selectorSpan.textContent = cleanSelector + ' {'; 
                return;
            }

            if (ruleOrStyle && ruleOrStyle.selectorText !== undefined) {
                try {
                    ruleOrStyle.selectorText = newSelector;
                    selectorSpan.dataset.originalSelector = newSelector;
                    selectorSpan.textContent = newSelector + ' {'; 
                    const container = section.closest('.style-rules-container');
                    if (container) {
                        refreshOverriddenStatus(container);
                    }
                } catch(e) {
                    console.warn('Could not update selector:', e);
                    selectorSpan.textContent = cleanSelector + ' {'; 
                }
            }
        };
        
        selectorSpan.onblur = applyChanges;
        
        selectorSpan.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyChanges();
            } 
            else if (e.key === 'Escape') {
                e.preventDefault();
                cleanup();
                selectorSpan.textContent = cleanSelector + ' {'; 
                selectorSpan.blur();
            }
        };
    }

    return { 
        init, 
        buildRuleBlock,
        updateRuleBlock,
        createPropertyRow,
        updateValueSpan,
        refreshOverriddenStatus,
        buildPropertyContextMenu
    };
})();