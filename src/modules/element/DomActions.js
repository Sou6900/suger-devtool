// src/modules/element/DomActions.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.DomActions = (function() {

  let focusTimeout = null;
  const isAcodeEnv = (typeof acode !== "undefined") || (window.appName === "Acode");

  let internalClipboard = null;
  let clipboardTimer = null;

  const voidElements = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);

  // 1. DOM Editable Logic (Browser + Acode)
  function makeDomEditable(span, type, node, detailsNode, selectionHint = null) {
    let spanToEdit = span; 
    let oldInnerHtml = spanToEdit.innerHTML;
    let oldTextForEditing;

    if (type === 'full-attribute') {
        oldTextForEditing = span.textContent.trim(); 
    } else if (type === 'text') {
        oldTextForEditing = span.textContent.replace(/^"|"$/g, '');
    } else if (type === 'comment') {
        oldTextForEditing = node.nodeValue.trim();
    } else { 
        oldTextForEditing = span.textContent;
    }

    let isDeviceMode = false;
    if (window.MyDevTool.DeviceMode && typeof window.MyDevTool.DeviceMode.isActive === 'function') {
        isDeviceMode = window.MyDevTool.DeviceMode.isActive();
    }

    if ((isAcodeEnv || isDeviceMode) && window.MyDevTool.EditModal) {
      window.MyDevTool.EditModal.show({
        type: type,
        value: oldTextForEditing,
        onSave: (newText) => {
          applyEdit(spanToEdit, type, node, detailsNode, oldInnerHtml, oldTextForEditing, newText);
        }
      });
      return;
    }

    spanToEdit.contentEditable = true;
    spanToEdit.focus();
    spanToEdit.style.outline = '1px solid var(--dt-text-accent, #4af)';
    spanToEdit.style.minWidth = '10px';
    spanToEdit.style.display = 'inline-block';

    if (type === 'full-attribute') {
        document.execCommand('selectAll', false, null);
        spanToEdit.textContent = oldTextForEditing;
    } else {
         document.execCommand('selectAll', false, null); 
    }

    const cleanUpStyles = () => {
        spanToEdit.contentEditable = false;
        spanToEdit.style.outline = '';
        spanToEdit.style.minWidth = '';
        spanToEdit.style.display = '';
    };

    const apply = () => {
      cleanUpStyles();
      let newText = spanToEdit.textContent.trim();
      applyEdit(spanToEdit, type, node, detailsNode, oldInnerHtml, oldTextForEditing, newText);
    };

    const cancel = () => {
        cleanUpStyles();
        if (type === 'full-attribute') {
            spanToEdit.innerHTML = oldInnerHtml; 
            if (oldTextForEditing.includes('new-attr') && !node.hasAttribute('new-attr')) {
                spanToEdit.remove();
            }
        } else {
            spanToEdit.textContent = (type === 'text') ? `"${oldTextForEditing}"` : oldTextForEditing;
            if(type === 'comment') spanToEdit.textContent = ``;
        }
    };

    spanToEdit.onblur = apply;
    spanToEdit.onkeydown = (e) => {
      if (e.key === 'Enter') { e.preventDefault(); apply(); }
      if (e.key === 'Escape') { e.preventDefault(); cancel(); }
    };
  }

  function applyEdit(spanToEdit, type, node, detailsNode, oldInnerHtml, oldTextForEditing, newText) {
    if (type === 'tag') {
      if (!newText) { node.remove(); return; } 
      try {
          const newElement = document.createElement(newText);
          for (const attr of node.attributes) { newElement.setAttribute(attr.name, attr.value); }
          while (node.firstChild) { newElement.appendChild(node.firstChild); }
          node.parentElement.replaceChild(newElement, node);
      } catch(e) { console.error(e); spanToEdit.textContent = oldTextForEditing; }
    }
    else if (type === 'text') {
      newText = newText.replace(/^"|"$/g, ''); 
      node.textContent = newText; 
      spanToEdit.textContent = `"${newText}"`; 
    }
    else if (type === 'comment') {
        node.nodeValue = newText;
        spanToEdit.textContent = ``;
    }
    else if (type === 'full-attribute') {
      const oldAttrName = oldTextForEditing.split('=')[0].trim();
      if (newText === '' || newText === '=' || !newText.includes('=')) {
          if(oldAttrName && node.hasAttribute(oldAttrName)) node.removeAttribute(oldAttrName);
          spanToEdit.remove(); 
          return;
      }
      try {
          let eqIndex = newText.indexOf('=');
          let newName = newText.substring(0, eqIndex).trim();
          let newValue = newText.substring(eqIndex + 1).trim().replace(/^"|"$/g, ''); 
          if (oldAttrName && oldAttrName !== newName) { node.removeAttribute(oldAttrName); }
          node.setAttribute(newName, newValue);
          spanToEdit.innerHTML = ' ' + `<span class="attr-name">${newName}</span>` + `<span class="tag-punctuation">=</span>` + `<span class="attr-value">"${newValue}"</span>`;
      } catch (e) {
          spanToEdit.innerHTML = oldInnerHtml; 
      }
    }
  }
  
  // 2. Action Helpers
  function addAttribute(element, uiTag, detailsNode) {
    const newAttrSpan = document.createElement('span');
    newAttrSpan.className = 'attribute';
    const defaultName = 'new-attr';
    const defaultValue = 'value';
    
    newAttrSpan.appendChild(document.createTextNode(' ')); 
    const nameSpan = document.createElement('span');
    nameSpan.className = 'attr-name'; nameSpan.textContent = defaultName; newAttrSpan.appendChild(nameSpan);
    const eqSpan = document.createElement('span'); eqSpan.className = 'tag-punctuation'; eqSpan.textContent = '='; newAttrSpan.appendChild(eqSpan);
    const valueSpan = document.createElement('span'); valueSpan.className = 'attr-value'; valueSpan.textContent = `"${defaultValue}"`; newAttrSpan.appendChild(valueSpan);

    if (uiTag.classList.contains('v-row')) {
        const existingAttrs = uiTag.querySelectorAll('.attribute');
        if (existingAttrs.length > 0) {
            existingAttrs[existingAttrs.length - 1].after(newAttrSpan);
        } else {
            const tagName = uiTag.querySelector('.tag-name');
            if (tagName) tagName.after(newAttrSpan);
            else uiTag.appendChild(newAttrSpan); 
        }
    } else {
        const attrWrapper = uiTag.querySelector('.attributes-wrapper');
        if (attrWrapper) attrWrapper.appendChild(newAttrSpan);
        else return;
    }
    makeDomEditable(newAttrSpan, 'full-attribute', element, detailsNode, 'attr-name');
  }

  function editAsHTML(element, detailsNode) {
    if (window.MyDevTool.EditModal) {
      window.MyDevTool.EditModal.show({
        type: 'html',
        value: element.outerHTML,
        onSave: (newHTML) => {
          try {
            const temp = document.createElement('div');
            temp.innerHTML = newHTML;
            const newElement = temp.firstElementChild;
            if (newElement) {
              element.parentElement.replaceChild(newElement, element);
            }
          } catch(e) { console.error('Invalid HTML:', e); }
        }
      });
    } else { alert("Edit Modal module not found."); }
  }

  function duplicateElement(element, detailsNode) {
    const clone = element.cloneNode(true);
    element.insertAdjacentElement('afterend', clone);
  }

  function toggleHideElement(element, detailsNode) {
    const isHidden = element.style.display === 'none';
    if (isHidden) element.style.removeProperty('display');
    else element.style.setProperty('display', 'none', 'important');
  }

  // Clipboard Functions 
  function setInternalClipboard(node) {
      // Create a deep clone to store in memory
      internalClipboard = node.cloneNode(true);
      
      // Clear existing timer if any
      if (clipboardTimer) clearTimeout(clipboardTimer);
      
      // Reset clipboard after 20 seconds
      clipboardTimer = setTimeout(() => {
          internalClipboard = null;
          console.log('DOM Clipboard expired');
      }, 20000);
  }

  function copyElement(element) {
    copyToClipboard(element.outerHTML);
    setInternalClipboard(element); // Store for internal paste
  }

  function cutElement(element, detailsNode) {
    copyToClipboard(element.outerHTML);
    setInternalClipboard(element); // Store first
    element.remove();
  }
  
  function pasteElement(target, position) {
      if (!internalClipboard) return;
      
      // Clone again so we can paste multiple times within 20s
      const newEl = internalClipboard.cloneNode(true);
      
      if (position === 'inside') {
          target.appendChild(newEl);
      } else if (position === 'after') {
          if (target.parentNode) {
              target.parentNode.insertBefore(newEl, target.nextSibling);
          }
      }
  }

  function deleteElement(element, detailsNode) {
    element.remove();
  }

  function deleteChildren(element) {
      element.innerHTML = '';
  }

  function deleteAttributes(element) {
      while (element.attributes.length > 0) {
          element.removeAttribute(element.attributes[0].name);
      }
  }

  function focusElement(element) {
    if (element.nodeType !== Node.ELEMENT_NODE) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    if (window.MyDevTool.Inspector) {
      if (focusTimeout) { clearTimeout(focusTimeout); }
      window.MyDevTool.Inspector.highlightElement(element);
      focusTimeout = setTimeout(() => { window.MyDevTool.Inspector.hideHighlighters(); focusTimeout = null; }, 2000); 
    }
  }

  // 3. Menu Builder (Localized + Badge + Paste)
  function buildContextMenuOptions(element, detailsNode, uiTag) {
     const isHidden = (element.style && element.style.display === 'none');
     const i18n = window.MyDevTool.LanguageManager;
     const t = (k, def) => i18n ? i18n.t(k) : def;
     const tagName = element.tagName.toLowerCase();

     // Validation for Paste Logic
     const canPasteInside = internalClipboard && !voidElements.has(tagName);
     const canPasteAfter = internalClipboard && tagName !== 'html' && tagName !== 'body' && tagName !== 'head';

     const options = [
      { label: t('dom_action.add_attr', 'Add attribute'), callback: () => addAttribute(element, uiTag, detailsNode) },
      { label: t('dom_action.edit_html', 'Edit as HTML'), callback: () => editAsHTML(element, detailsNode) },
      { label: t('dom_action.duplicate', 'Duplicate element'), callback: () => duplicateElement(element, detailsNode) },
      { type: 'separator' },
      { label: t('dom_action.cut', 'Cut'), callback: () => cutElement(element, detailsNode) },
      {
        label: t('dom_action.copy', 'Copy'), 
        sub: [
          { label: t('dom_action.copy_ele', 'Copy element'), callback: () => copyElement(element) },
          { label: t('dom_action.copy_html', 'Copy outerHTML'), callback: () => copyElement(element) },
        ]
      }
    ];

    // PASTE OPTION (Only if clipboard has data)
    if (internalClipboard) {
        const pasteSubMenu = [];
        if (canPasteInside) {
            pasteSubMenu.push({ 
                label: 'Inside (Append)', 
                callback: () => pasteElement(element, 'inside') 
            });
        }
        if (canPasteAfter) {
            pasteSubMenu.push({ 
                label: 'Below (Sibling)', 
                callback: () => pasteElement(element, 'after') 
            });
        }

        if (pasteSubMenu.length > 0) {
            options.push({
                label: 'Paste',
                sub: pasteSubMenu
            });
        }
    }

    // Continue with other options
    options.push(
      { 
        label: t('dom_action.delete', 'Delete'), 
        sub: [
            { label: t('dom_action.del_ele', 'Delete element'), callback: () => deleteElement(element, detailsNode) },
            { label: t('dom_action.del_child', 'Delete children'), callback: () => deleteChildren(element) },
            { label: t('dom_action.del_attr', 'Delete attributes'), callback: () => deleteAttributes(element) }
        ]
      },
      { type: 'separator' },
      { 
        label: isHidden ? t('dom_action.show', 'Show element') : t('dom_action.hide', 'Hide element'),
        checked: isHidden,
        callback: () => toggleHideElement(element, detailsNode) 
      },
      { type: 'separator' },
      { label: t('dom_action.focus', 'Focus'), callback: () => focusElement(element) }
    );

    // ADD BADGE SETTINGS
    if (window.MyDevTool.DomBadges) {
        options.push({ type: 'separator' });
        options.push({
            label: t('dom_action.badge_settings', 'Badge settings...'), 
            callback: () => window.MyDevTool.DomBadges.toggleSettings()
        });
    }

    return options;
  }

  // 4. Clipboard Fallback
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(err => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus(); textArea.select();
    try { document.execCommand('copy'); } catch (err) {}
    document.body.removeChild(textArea);
  }

  return {
    makeDomEditable: makeDomEditable,
    buildContextMenuOptions: buildContextMenuOptions
  };

})();