// src/modules/element/Elements.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.Elements = (function() {
  let shadowRoot = null;
  let currentSelectedElement = null; // Real DOM Element
  let currentSelectedUiTag = null; // UI <span.selectable-tag>
  let currentOptionsBtn = null; // UI <span.dom-options-btn>
  let currentDetailsNode = null; // UI <details>

  // Module Reference
  const DomActions = window.MyDevTool.DomActions;

  // UI Builders
  function buildAttributesUI(node, attrWrapper, detailsNode) {
    attrWrapper.innerHTML = ''; 
    for (const attr of node.attributes) {
      const attrSpan = document.createElement('span');
      attrSpan.className = 'attribute';
      attrSpan.textContent = ` ${attr.name}="${attr.value}"`;
      attrSpan.dataset.attrName = attr.name; 
      
      attrSpan.ondblclick = (e) => {
        e.stopPropagation();
        if (DomActions) {
           DomActions.makeDomEditable(e.target, 'full-attribute', node, detailsNode);
        }
      };
      attrWrapper.appendChild(attrSpan);
    }
  }

  function buildDomTree(node, isOpen = false) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === '') {
      return null;
    }
    
    if (node.nodeType === Node.TEXT_NODE) {
      const textEl = document.createElement('div');
      textEl.className = 'dom-text';
      textEl.textContent = `"${node.textContent.trim()}"`;
      return textEl;
    }

    const details = document.createElement('details');
    details.open = isOpen;
    details._realNodeRef = node;

    const summary = document.createElement('summary');
    
    // Options Button (...)
    const optionsBtn = document.createElement('span');
    optionsBtn.className = 'dom-options-btn';
    optionsBtn.textContent = '…';
    optionsBtn.style.display = 'none'; 
    summary.appendChild(optionsBtn);

    const hideToggle = document.createElement('i');
    hideToggle.className = 'dom-hide-toggle';
    hideToggle.onclick = (e) => {
      e.stopPropagation(); e.preventDefault();
      const isHidden = details.classList.toggle('is-hidden');
      if (isHidden) {
          node.style.setProperty('display', 'none', 'important');
          hideToggle.classList.add('is-hidden');
      } else {
          node.style.removeProperty('display');
          hideToggle.classList.remove('is-hidden');
      }
    };
    summary.appendChild(hideToggle);

    // Main Tag UI
    const summaryContent = document.createElement('span');
    summaryContent.className = 'selectable-tag';
    
    const puncOpen = document.createElement('span');
    puncOpen.className = 'tag-punctuation';
    puncOpen.textContent = '<';
    summaryContent.appendChild(puncOpen);

    const tagNameSpan = document.createElement('span');
    tagNameSpan.className = 'tag-name';
    tagNameSpan.textContent = node.tagName.toLowerCase();
    
    tagNameSpan.ondblclick = (e) => {
      e.stopPropagation(); 
      if (DomActions) {
          DomActions.makeDomEditable(e.target, 'tag', node, details);
      }
    };
    summaryContent.appendChild(tagNameSpan);

    const attrWrapper = document.createElement('span');
    attrWrapper.className = 'attributes-wrapper';
    buildAttributesUI(node, attrWrapper, details); 
    summaryContent.appendChild(attrWrapper);

    const puncClose = document.createElement('span');
    puncClose.className = 'tag-punctuation';
    puncClose.textContent = '>';
    summaryContent.appendChild(puncClose);

    // Selection Handler
    summaryContent.onclick = (e) => {
      e.stopPropagation(); e.preventDefault();
      selectElement(node, summaryContent, optionsBtn, details); 
    };

    summary.appendChild(summaryContent);
    details.appendChild(summary);

    // Children
    node.childNodes.forEach(child => {
      const childTree = buildDomTree(child, false); 
      if (childTree) {
        details.appendChild(childTree);
      }
    });

    const closingTag = document.createElement('div');
    closingTag.className = 'closing-tag';
    closingTag.innerHTML = `&lt;/<span class="tag-name">${node.tagName.toLowerCase()}</span>&gt;`;
    details.appendChild(closingTag);

    return details;
  }

  // Selection & Menu Logic
  function selectElement(element, uiTag, optionsBtn, detailsNode) {
    if (!element) return; 
    
    currentSelectedElement = element;
    
    if (!shadowRoot) {
      shadowRoot = document.querySelector('#my-devtool-host').shadowRoot;
    }

    const treeContainer = shadowRoot.querySelector('#elements-tree');
    if (!treeContainer) return;

    // 1. Remove previous highlights
    if (currentSelectedUiTag && currentSelectedUiTag !== uiTag) {
      currentSelectedUiTag.classList.remove('selected');
    }
    if (currentOptionsBtn && currentOptionsBtn !== optionsBtn) {
      currentOptionsBtn.style.display = 'none';
      currentOptionsBtn.onclick = null;
    }

    // 2. Find UI tag if selected via Inspector
    if (!uiTag) {
      const allDetailsNodes = treeContainer.querySelectorAll('details');
      for (const details of allDetailsNodes) {
        if (details._realNodeRef === element) {
          detailsNode = details;
          uiTag = details.querySelector('summary > .selectable-tag');
          optionsBtn = details.querySelector('summary > .dom-options-btn');
          break;
        }
      }
    }

    // 3. Highlight & Setup Menu
    if (uiTag) {
      currentSelectedUiTag = uiTag;
      currentOptionsBtn = optionsBtn;
      currentDetailsNode = detailsNode; 

      uiTag.classList.add('selected');

      if (optionsBtn) {
        optionsBtn.style.display = 'inline-block';
        
        optionsBtn.onclick = (e) => {
          e.stopPropagation(); e.preventDefault();
          
          // DELEGATION: Get menu options from DomActions
          if (window.MyDevTool.DomActions) {
              const menuOptions = window.MyDevTool.DomActions.buildContextMenuOptions(element, detailsNode, uiTag);
              window.MyDevTool.ContextMenu.show(e, menuOptions);
          } else {
              console.warn("DomActions module not loaded");
          }
        };
      }

      // 4. Expand parents
      let parent = uiTag.parentElement; 
      while (parent && parent !== treeContainer) {
        if (parent.tagName === 'DETAILS') {
          parent.open = true;
        }
        parent = parent.parentElement;
      }
      
      if (!uiTag.onclick) {
        uiTag.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    // 5. Update other all tabs (Styles, Computed, Layout ...)
    const inspectorPane = shadowRoot.querySelector('#style-inspector-pane');
    if(inspectorPane) inspectorPane.style.display = 'flex'; 
    const inspectorResizeHandle = shadowRoot.querySelector('.inspector-resize-handle');
    if(inspectorResizeHandle) inspectorResizeHandle.style.display = 'block';

    const stylesContainer = shadowRoot.querySelector('#styles-sub-content');
    const computedContainer = shadowRoot.querySelector('#computed-sub-content');
    const layoutContainer = shadowRoot.querySelector('#layout-sub-content'); 

    if (window.MyDevTool.StylesTab) {
      window.MyDevTool.StylesTab.init(stylesContainer, element, shadowRoot);
    }
    if (window.MyDevTool.ComputedTab) {
      window.MyDevTool.ComputedTab.init(computedContainer, element, shadowRoot);
    }
    if (window.MyDevTool.LayoutTab) {
      window.MyDevTool.LayoutTab.init(layoutContainer, element);
    }
  }

  // Initialization
  function init(containerElement, root) {
    shadowRoot = root;
    const domTree = buildDomTree(document.body, true); 
    const treeContainer = document.createElement('div');
    treeContainer.id = 'elements-tree';
    treeContainer.appendChild(domTree);
    containerElement.appendChild(treeContainer);
  }

  return {
    init: init,
    selectElement: selectElement
  };

})();