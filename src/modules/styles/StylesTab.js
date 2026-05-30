// src/modules/styles/StylesTab.js
window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.StylesTab = (function() {

  const StyleData = window.MyDevTool.StyleData;
  const StyleRuleRenderer = window.MyDevTool.StyleRuleRenderer;
  const StyleChangeTracker = window.MyDevTool.StyleChangeTracker;

  let SVGs = null;
  let masterClassList = new Set();
  let currentElement = null;
  let shadowRoot = null;
  
  // Cache System
  let containerRef = null;
  let cachedContentBody = null; 
  let lastRenderedElement = null;
  
  let statePanel = null;
  let classPanel = null;
  
  let isChangesMode = false;
  let changesBtn = null;
  let filterDebounceTimer = null;

  function init(container, element, root) {
      const i18n = window.MyDevTool.LanguageManager;
      SVGs = window.MyDevTool.SVGs;
      
      containerRef = container;
      shadowRoot = root;
      
      // Tab Switching
      if (element === lastRenderedElement && cachedContentBody) {
          if (!container.contains(cachedContentBody)) {
              container.innerHTML = '';
              container.style.flexDirection = 'column';
              container.style.height = '100%';
              container.appendChild(cachedContentBody);
          }
          currentElement = element;
          updateRules(); // Soft Update (Diffing)
          return;
      }

      // New Element: Full Render
      currentElement = element;
      lastRenderedElement = element;
      
      container.innerHTML = '';
      container.style.flexDirection = 'column';
      container.style.height = '100%';

      StyleRuleRenderer.init(shadowRoot, SVGs);

      const contentBody = document.createElement('div');
      contentBody.className = 'styles-body-wrapper';
      contentBody.style.cssText = 'display: flex; flex-direction: column; flex-grow: 1; overflow-y: auto; overflow-x: hidden;';
      container.appendChild(contentBody);
      
      cachedContentBody = contentBody; // Cache it

      masterClassList.clear();
      Array.from(currentElement.classList).forEach(c => {
        if (!c.startsWith('__devtool-state-')) masterClassList.add(c);
      });

      if (window.MyDevTool.SuggestionBox && window.MyDevTool.CSSData) {
        window.MyDevTool.SuggestionBox.init(shadowRoot);
      }

      renderToolbarAndRules(contentBody, i18n);
  }

  function renderToolbarAndRules(container, i18n) {
      const toolbar = document.createElement('div');
      toolbar.className = 'style-toolbar';
      
      toolbar.innerHTML = `
      <input type="text" placeholder="${i18n.t('styles.filter_placeholder') || 'Filter'}" class="style-filter">
      <div class="style-toggles">
        <button title=":hov" id="btn-hov">:hov</button>
        <button title=".cls" id="btn-cls">.cls</button>
        <button title="css" id="btn-css-changes">css</button> 
        <button title="New Rule" id="btn-new-rule">+</button>
      </div>`;
      container.appendChild(toolbar);

      statePanel = document.createElement('div');
      statePanel.className = 'style-toggle-panel state-panel';
      statePanel.innerHTML = `
      <strong>${i18n.t('styles.force_element_state') || 'Force state'}</strong>
      <div class="state-list">
      <label><input type="checkbox" data-state="active"> :active</label>
      <label><input type="checkbox" data-state="hover"> :hover</label>
      <label><input type="checkbox" data-state="focus"> :focus</label>
      <label><input type="checkbox" data-state="visited"> :visited</label>
      <label><input type="checkbox" data-state="focus-within"> :focus-within</label>
      <label><input type="checkbox" data-state="focus-visible"> :focus-visible</label>
      <label><input type="checkbox" data-state="target"> :target</label>
      </div>`;
      statePanel.style.display = 'none';
      container.appendChild(statePanel);

      classPanel = document.createElement('div');
      classPanel.className = 'style-toggle-panel class-panel';
      classPanel.innerHTML = `<input type="text" class="add-class-input" placeholder="${i18n.t('styles.add_new_class') || 'Add class'}"><div class="class-list-container"></div>`;
      classPanel.style.display = 'none';
      container.appendChild(classPanel);

      const filterInput = toolbar.querySelector('.style-filter');
      filterInput.oninput = (e) => {
        if (filterDebounceTimer) clearTimeout(filterDebounceTimer);
        const filterText = e.target.value.toLowerCase().trim();
        filterDebounceTimer = setTimeout(() => {
            const rulesContainer = container.querySelector('.style-rules-container');
            if (!rulesContainer) return;
            rulesContainer.querySelectorAll('.css-rule-block').forEach(block => {
              let blockHasMatch = false; 
              const selector = block.querySelector('.selector-text'); 
              if (selector && selector.textContent.toLowerCase().includes(filterText)) blockHasMatch = true; 
              const allProps = block.querySelectorAll('li'); 
              allProps.forEach(li => { 
                  const propName = (li.querySelector('.prop-name')?.textContent || '').toLowerCase(); 
                  const propValue = (li.querySelector('.prop-value')?.textContent || '').toLowerCase(); 
                  if (propName.includes(filterText) || propValue.includes(filterText)) { 
                      li.style.display = ''; 
                      blockHasMatch = true; 
                  } else { 
                      li.style.display = 'none'; 
                  } 
              }); 
              block.style.display = blockHasMatch ? '': 'none';
            });
        }, 300);
      };

      const btnHov = toolbar.querySelector('#btn-hov');
      const btnCls = toolbar.querySelector('#btn-cls');
      const btnNew = toolbar.querySelector('#btn-new-rule');
      changesBtn = toolbar.querySelector('#btn-css-changes'); 

      if (btnHov) {
          btnHov.onclick = () => {
            const show = statePanel.style.display === 'none';
            statePanel.style.display = show ? 'block': 'none';
            btnHov.classList.toggle('active', show);
            if (show) {
                classPanel.style.display = 'none';
                if(btnCls) btnCls.classList.remove('active'); 
                populateStatePanel();
            }
          };
      }

      if (btnCls) {
          btnCls.onclick = () => {
            const show = classPanel.style.display === 'none';
            classPanel.style.display = show ? 'block': 'none';
            btnCls.classList.toggle('active', show);
            if (show) {
                statePanel.style.display = 'none';
                if(btnHov) btnHov.classList.remove('active'); 
                populateClassPanel();
            }
          };
      }

      if (btnNew) {
          btnNew.onclick = addNewStyleRule;
      }

      if (changesBtn) {
          changesBtn.onclick = () => toggleChangesView(container);
      }

      statePanel.querySelectorAll('.state-list input').forEach(input => { input.onchange = (e) => handleStateChange(e.target.dataset.state, e.target.checked); });
      classPanel.querySelector('.add-class-input').onkeydown = (e) => { if (e.key === 'Enter' && e.target.value.trim()) { handleAddNewClass(e.target.value.trim()); e.target.value = ''; } };

      const rulesContainer = document.createElement('div');
      rulesContainer.className = 'style-rules-container';
      rulesContainer.style.flexGrow = '1'; 
      container.appendChild(rulesContainer);

      updateRules(); // Initial population
  }

  // Reconciliation Logic
  function updateRules() {
      if (!cachedContentBody || isChangesMode) return;
      const rulesContainer = cachedContentBody.querySelector('.style-rules-container');
      if (!rulesContainer) return;

      const newRulesList = collectAllRules();
      reconcileRules(rulesContainer, newRulesList);
      
      // Update Class List Panel if open
      if (classPanel && classPanel.style.display !== 'none') {
          populateClassPanel();
      }
  }

  function collectAllRules() {
      const rules = [];
      
      // 1. Element Style
      rules.push({
          type: 'rule',
          selector: 'element.style',
          ruleOrStyle: currentElement.style,
          source: 'element.style',
          element: currentElement,
          isInherited: false
      });

      // 2. User Agent (Explicit check)
      const showUserAgent = localStorage.getItem('dt_style_show_user_agent') !== 'false';
      if (showUserAgent && window.MyDevTool.UserAgentStyles) {
          const uaStyles = window.MyDevTool.UserAgentStyles.getStyles(currentElement);
          if (uaStyles) {
              rules.push({
                  type: 'ua-block',
                  element: currentElement,
                  styles: uaStyles
              });
          }
      }

      // 3. Matched Rules & Pseudo
      const pseudoRules = StyleData.getMatchedPseudoElementRules(currentElement);
      ['::after', '::before'].forEach(pseudo => {
          if (pseudoRules[pseudo].length > 0) {
            rules.push({ type: 'header', text: pseudo.replace('::', ''), isPseudo: true });
            pseudoRules[pseudo].forEach(rule => {
                rules.push({
                    type: 'rule',
                    selector: rule.selectorText,
                    ruleOrStyle: rule.rule || rule,
                    source: StyleData.getRuleSource(rule),
                    element: currentElement,
                    isInherited: false
                });
            });
          }
      });

      let el = currentElement;
      while (el && el.nodeType === 1) {
        const matchedRules = StyleData.getMatchedCSSRules(el, false);
        for (const rule of matchedRules) {
             rules.push({
                 type: 'rule',
                 selector: rule.selectorText,
                 ruleOrStyle: rule.rule || rule,
                 source: StyleData.getRuleSource(rule),
                 element: currentElement,
                 isInherited: false
             });
        }
        if (el === currentElement) break; 
        el = el.parentElement || el.parentNode; 
      }

      // 4. Inherited
      let parent = currentElement.parentElement || currentElement.parentNode;
      while (parent) {
        if (parent.nodeType === Node.ELEMENT_NODE) {
            const isHtmlElement = parent.tagName.toLowerCase() === 'html';
            const inheritedRules = StyleData.getMatchedCSSRules(parent, !isHtmlElement);
            
            if (inheritedRules.length > 0) {
                 rules.push({ type: 'header', text: 'Inherited from', element: parent, isInherited: true });
                 inheritedRules.forEach(ruleObj => {
                     rules.push({
                         type: 'rule',
                         selector: ruleObj.selectorText,
                         ruleOrStyle: ruleObj.rule ? ruleObj.rule.style : ruleObj,
                         source: StyleData.getRuleSource(ruleObj.rule || ruleObj),
                         element: currentElement,
                         isInherited: true
                     });
                 });
            }
        } else if (parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE && parent.host) {
            parent = parent.host; continue;
        }
        parent = parent.parentElement || parent.parentNode;
        if (parent && parent.nodeType === Node.DOCUMENT_NODE) break;
      }
      
      return rules;
  }

  function reconcileRules(container, newRulesList) {
      const existingChildren = Array.from(container.children);
      let domIndex = 0;
      
      for (let i = 0; i < newRulesList.length; i++) {
          const newItem = newRulesList[i];
          const existingNode = existingChildren[domIndex];
          
          let matched = false;
          
          if (newItem.type === 'rule') {
              // Try to reuse existing rule block
              if (existingNode && existingNode.classList.contains('css-rule-block') && !existingNode.classList.contains('user-agent-block')) {
                  const oldSelector = existingNode.dataset.selector;
                  const oldSource = existingNode.dataset.source;
                  
                  // Clean match
                  if (oldSelector === newItem.selector && oldSource === newItem.source) {
                      StyleRuleRenderer.updateRuleBlock(existingNode, newItem.ruleOrStyle, newItem.element, 'normal', newItem.isInherited);
                      matched = true;
                  }
              }
              
              if (!matched) {
                  const newBlock = StyleRuleRenderer.buildRuleBlock(null, newItem.selector, newItem.ruleOrStyle, newItem.source, newItem.element, false, 'normal', newItem.isInherited);
                  insertNodeAt(container, newBlock, domIndex);
                  // Since we inserted, existingNode is pushed down, so we don't increment domIndex for it, but we increment for next loop
              }
          } 
          else if (newItem.type === 'ua-block') {
               // UA Block handling (Usually reconstructed is safer as it's static)
               if (existingNode && existingNode.classList.contains('user-agent-block')) {
                   matched = true; // Assume static UA block doesn't change often, or rebuild internals if needed.
                   // For now, let's rebuild it to be safe or leave as is.
                   // Simple strategy: Replace it.
                   const tempCont = document.createElement('div');
                   buildUserAgentStyleBlock(tempCont, newItem.element, newItem.styles);
                   const newBlock = tempCont.firstElementChild;
                   container.replaceChild(newBlock, existingNode);
               } else {
                   const tempCont = document.createElement('div');
                   buildUserAgentStyleBlock(tempCont, newItem.element, newItem.styles);
                   const newBlock = tempCont.firstElementChild;
                   insertNodeAt(container, newBlock, domIndex);
               }
          }
          else if (newItem.type === 'header') {
              if (existingNode && (existingNode.className === 'inherited-header' || existingNode.className === 'pseudo-header')) {
                  // Simple check: is text content roughly same? 
                  if (existingNode.textContent.includes(newItem.text)) {
                      matched = true;
                  }
              }
              
              if (!matched) {
                  const tempCont = document.createElement('div');
                  if (newItem.isPseudo) buildPseudoHeader(tempCont, newItem.text);
                  else buildInheritedHeader(tempCont, newItem.element);
                  const newHeader = tempCont.firstElementChild;
                  insertNodeAt(container, newHeader, domIndex);
              }
          }
          
          domIndex++;
      }
      
      // Cleanup extra nodes at the end
      while (container.children.length > domIndex) {
          container.removeChild(container.lastChild);
      }
      
      StyleRuleRenderer.refreshOverriddenStatus(container);
  }

  function insertNodeAt(parent, newNode, index) {
      const children = parent.children;
      if (index >= children.length) {
          parent.appendChild(newNode);
      } else {
          parent.insertBefore(newNode, children[index]);
      }
  }

  function toggleChangesView(container) {
      const rulesContainer = container.querySelector('.style-rules-container');
      isChangesMode = !isChangesMode;
      if (changesBtn) changesBtn.classList.toggle('active', isChangesMode);
      
      if (isChangesMode) {
          rulesContainer.innerHTML = ''; 
          const changesMap = StyleChangeTracker.getChanges();
          if (changesMap.size === 0) {
              rulesContainer.innerHTML = `<div style="padding:15px; text-align:center; color:#888;">No changes made yet.</div>`;
              return;
          }
          changesMap.forEach((element, declaration) => {
              const source = 'inspector-stylesheet'; 
              let selector = 'element.style';
              if (declaration.parentRule && declaration.parentRule.selectorText) {
                  selector = declaration.parentRule.selectorText;
              }
              StyleRuleRenderer.buildRuleBlock(rulesContainer, selector, declaration, source, element, false, 'changes', false);
          });
      } else {
          updateRules(); // Restore normal view via reconciliation
      }
  }

  function exitChangesMode(element) {
      isChangesMode = false;
      if(changesBtn) changesBtn.classList.remove('active');
      if (window.MyDevTool.DomTree) {
          window.MyDevTool.DomTree.selectElement(element);
      }
      // Re-init handles caching logic
      init(containerRef, element, shadowRoot);
  }

  function populateStatePanel() { 
      if (!currentElement) return; 
      statePanel.querySelectorAll('.state-list input').forEach(input => { 
          const state = input.dataset.state; 
          input.checked = currentElement.classList.contains(`__devtool-state-${state}`); 
      }); 
  }

  function handleStateChange(state, isChecked) { 
      if (!currentElement) return; 
      const className = `__devtool-state-${state}`; 
      if (isChecked) currentElement.classList.add(className); 
      else currentElement.classList.remove(className); 
  }

  function populateClassPanel() { 
      const i18n = window.MyDevTool.LanguageManager; 
      if (!currentElement) return; 
      const listContainer = classPanel.querySelector('.class-list-container'); 
      listContainer.innerHTML = ''; 
      
      // Refresh master list from element
      Array.from(currentElement.classList).forEach(c => {
         if (!c.startsWith('__devtool-state-')) masterClassList.add(c);
      });
      
      const currentClasses = new Set(currentElement.classList); 
      if (masterClassList.size === 0) { 
          listContainer.innerHTML = ` <em>${i18n.t('styles.no_classes_found') || 'No classes found'}</em>`; 
          return; 
      } 
      masterClassList.forEach(className => { 
          const label = document.createElement('label'); 
          label.className = 'class-item'; 
          const checkbox = document.createElement('input'); 
          checkbox.type = 'checkbox'; 
          checkbox.checked = currentClasses.has(className); 
          checkbox.dataset.className = className; 
          checkbox.onchange = (e) => handleClassToggle(e.target.dataset.className, e.target.checked); 
          label.appendChild(checkbox); 
          label.appendChild(document.createTextNode(` .${className}`)); 
          listContainer.appendChild(label); 
      }); 
  }

  function handleClassToggle(className, isChecked) { 
      if (!currentElement) return; 
      if (isChecked) currentElement.classList.add(className); 
      else currentElement.classList.remove(className); 
      if (window.MyDevTool.DomTree) window.MyDevTool.DomTree.refreshAttributes(); 
      updateRules(); // Instant update
  }

  function handleAddNewClass(className) { 
      if (!currentElement) return; 
      className.split(' ').forEach(cls => { 
          if (cls) { 
              currentElement.classList.add(cls); 
              masterClassList.add(cls); 
          } 
      }); 
      if (window.MyDevTool.DomTree) window.MyDevTool.DomTree.refreshAttributes(); 
      populateClassPanel();
      updateRules(); // Instant update
  }
  
  function addNewStyleRule() {
      if (!currentElement) return; 
      const tagName = currentElement.tagName.toLowerCase(); 
      const id = currentElement.id;
      const classes = Array.from(currentElement.classList).filter(c => !c.startsWith('__devtool-state-')); 
      
      let selector = tagName; 
      if (id) { selector = `${tagName}#${id}`; } 
      else if (classes.length > 0) { selector = '.' + classes.join('.'); }
      
      const rule = `${selector} {\n}\n`; 
      try {
        const sheet = StyleData.getOrCreateDevToolStylesheet(currentElement); 
        const index = sheet.cssRules.length; 
        sheet.insertRule(rule, index); 
        
        // Instant Update via Reconciliation
        updateRules();
      } catch (e) { console.error("Failed to insert new style rule:", e); }
  }

  function buildInheritedHeader(container, parentElement) {
      const i18n = window.MyDevTool.LanguageManager;
      const header = document.createElement('div');
      header.className = 'inherited-header';
      const inheritedText = document.createElement('span');
      inheritedText.textContent = i18n.t('styles.inherited_from') || 'Inherited from';
      inheritedText.style.color = 'var(--dt-text-secondary)';
      header.appendChild(inheritedText);
      header.appendChild(document.createTextNode(' '));
      const selectorSpan = buildInheritedSelector(parentElement);
      header.appendChild(selectorSpan);
      container.appendChild(header);
  }
  
  function buildInheritedSelector(element) {
      const wrapper = document.createElement('span');
      const tagName = element.tagName.toLowerCase();
      const tagSpan = document.createElement('span');
      tagSpan.className = 'tag-name';
      tagSpan.textContent = tagName;
      tagSpan.style.color = 'var(--dt-syntax-tag-name)'; 
      wrapper.appendChild(tagSpan);
      const classes = Array.from(element.classList).filter(c => !c.startsWith('__devtool-'));
      if (classes.length > 0) {
          classes.forEach(className => {
              const classSpan = document.createElement('span');
              classSpan.className = 'selector-class';
              classSpan.textContent = '.' + className;
              classSpan.style.color = 'var(--dt-syntax-attr-name)';
              wrapper.appendChild(classSpan);
          });
      }
      if (element.id) {
          const idSpan = document.createElement('span');
          idSpan.className = 'selector-id';
          idSpan.textContent = '#' + element.id;
          idSpan.style.color = 'var(--dt-syntax-attr-name)';
          wrapper.appendChild(idSpan);
      }
      return wrapper;
  }

  function buildPseudoHeader(container, pseudoType) { 
      const i18n = window.MyDevTool.LanguageManager; 
      const header = document.createElement('div'); 
      header.className = 'pseudo-header'; 
      header.textContent = i18n.t('styles.pseudo_element', { type: pseudoType }) || `::${pseudoType}`; 
      container.appendChild(header); 
  }
  
  function buildUserAgentStyleBlock(container, element, uaStyles) {
      const block = document.createElement('div');
      block.className = 'css-rule-block user-agent-block';
      block.setAttribute('data-readonly', 'true');
      block._currentElement = element; 
      
      const selectorLine = document.createElement('div');
      selectorLine.className = 'selector-line';
      selectorLine.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; cursor: pointer;';
      
      const selectorText = document.createElement('span');
      selectorText.className = 'selector-text';
      const tagName = element.tagName.toLowerCase();
      const tagSpan = document.createElement('span');
      tagSpan.className = 'tag-name';
      tagSpan.style.color = 'var(--dt-syntax-tag-name)';
      tagSpan.textContent = tagName + ' ';
      selectorText.appendChild(tagSpan);
      
      const openBrace = document.createElement('span');
      openBrace.className = 'tag-punctuation';
      openBrace.textContent = '{';
      selectorText.appendChild(openBrace);
      selectorLine.appendChild(selectorText);
      
      const uaLabel = document.createElement('span');
      uaLabel.className = 'ua-label';
      uaLabel.textContent = 'user agent stylesheet';
      uaLabel.style.cssText = 'font-style: italic; font-size: 11px; color: var(--dt-text-secondary);';
      selectorLine.appendChild(uaLabel);
      
      block.appendChild(selectorLine);
      
      const propList = document.createElement('ul');
      propList.className = 'css-properties';
      propList.style.cssText = 'list-style: none; margin: 0; padding: 4px 8px 4px 20px;';
      
      Object.keys(uaStyles).forEach(propName => {
          const propValue = uaStyles[propName];
          const li = document.createElement('li');
          li.className = 'css-property user-agent-property';
          li.style.cssText = 'display: flex; align-items: center; padding: 2px 0;font-style:italic;';
          
          const isOverridden = window.MyDevTool.UserAgentStyles.isPropertyOverridden(element, propName, propValue);
          
          const nameSpan = document.createElement('span');
          nameSpan.className = 'prop-name';
          nameSpan.textContent = propName;
          if (isOverridden) {
              nameSpan.style.textDecoration = 'line-through';
              nameSpan.style.opacity = '0.5';
          }
          li.appendChild(nameSpan);
          
          const colon = document.createElement('span');
          colon.className = 'tag-punctuation';
          colon.textContent = ': ';
          if (isOverridden) {
              colon.style.textDecoration = 'line-through';
              colon.style.opacity = '0.5';
          }
          li.appendChild(colon);
          
          const valueSpan = document.createElement('span');
          valueSpan.className = 'prop-value';
          valueSpan.textContent = propValue;
          valueSpan.style.color = 'var(--dt-text-primary)';
          if (isOverridden) {
              valueSpan.style.textDecoration = 'line-through';
              valueSpan.style.opacity = '0.5';
          }
          li.appendChild(valueSpan);
          
          const semi = document.createElement('span');
          semi.className = 'tag-punctuation';
          semi.textContent = ';';
          if (isOverridden) {
              semi.style.textDecoration = 'line-through';
              semi.style.opacity = '0.5';
          }
          li.appendChild(semi);
          
          li.addEventListener('dblclick', (e) => {
              e.stopPropagation();
              e.preventDefault();
          });
          
          li.addEventListener('contextmenu', (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              const mockDeclaration = {
                  getPropertyValue: (p) => (p === propName ? propValue : ''),
                  getPropertyPriority: () => '',
                  length: 1
              };
              
              if (StyleRuleRenderer.buildPropertyContextMenu && window.MyDevTool.ContextMenu) {
                  const selector = tagName;
                  const menuOptions = StyleRuleRenderer.buildPropertyContextMenu(
                      propName, 
                      propValue, 
                      selector, 
                      mockDeclaration, 
                      li
                  );
                  const filteredOptions = menuOptions.filter(opt => opt.label !== 'Changes');
                  window.MyDevTool.ContextMenu.show(e, filteredOptions);
              }
          });
          
          propList.appendChild(li);
      });
      
      block.appendChild(propList);
      
      const closeBrace = document.createElement('div');
      closeBrace.className = 'closing-brace';
      closeBrace.textContent = '}';
      closeBrace.style.cssText = 'padding: 4px 8px; color: var(--dt-text-primary);';
      block.appendChild(closeBrace);
      
      container.appendChild(block);
  }
  
  function toggleFocusMode(activeRuleBlock, enable, showSelector = true) {
    const container = shadowRoot.querySelector('.devtool-container');
    if (!container) return;

    if (enable) {
        container.classList.add('focus-mode');
        if (!showSelector) {
            container.classList.add('focus-mode-no-selector');
        } else {
            container.classList.remove('focus-mode-no-selector');
        }
        
        container.querySelectorAll('.css-rule-block').forEach(el => el.classList.remove('focused-rule'));
        
        if (activeRuleBlock) {
            activeRuleBlock.classList.add('focused-rule');
        }
    } else {
        container.classList.remove('focus-mode');
        container.classList.remove('focus-mode-no-selector');
        if (activeRuleBlock) activeRuleBlock.classList.remove('focused-rule');
    }
  }

  return { 
      init: init,
      exitChangesMode: exitChangesMode,
      updateValueSpan: StyleRuleRenderer.updateValueSpan,
      refreshOverriddenStatus: (container) => StyleRuleRenderer.refreshOverriddenStatus(container || (cachedContentBody ? cachedContentBody.querySelector('.style-rules-container') : null)),
      toggleFocusMode: toggleFocusMode,
      refresh: () => {
          if (currentElement && containerRef) {
             updateRules(); // Soft Refresh
          }
      }
  };
})();