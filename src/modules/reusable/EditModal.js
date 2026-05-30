// src/modules/reusable/EditModal.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.EditModal = (function() {
  let SVGs = null;

  function show(options) {
    const { type, value, onSave, onCancel } = options;
    SVGs = window.MyDevTool.SVGs;
    
    // Shadow Root / Container Detection
    const host = document.getElementById('my-devtool-host');
    let parent = document.body;
    let devtoolContainer = null;

    if (host && host.shadowRoot) {
        devtoolContainer = host.shadowRoot.querySelector('.devtool-container');
        parent = devtoolContainer || host.shadowRoot;
    }

    // Remove existing
    const existingModal = parent.querySelector('#devtool-edit-modal-overlay');
    if (existingModal) existingModal.remove();

    const i18n = window.MyDevTool.LanguageManager;
    const t = (k, def) => i18n ? i18n.t(k) : def;

    let title = '', label = '', placeholder = '';

    if (type === 'tag') {
      title = t('modal.tag_title', 'Edit Modal Tag');
      label = t('modal.tag_label', 'Tag Name');
      placeholder = 'div';
    } 
    else if (type === 'text') {
      title = t('modal.text_title', 'Edit Modal Text');
      label = t('modal.text_label', 'Text Content');
      placeholder = 'Enter text...';
    } 
    else if (type === 'full-attribute') {
      title = t('modal.attr_title', 'Edit Modal Attribute');
      label = t('modal.attr_label', 'Attribute (name="value")');
      placeholder = 'class="container"';
    } 
    else if (type === 'html') {
      title = t('modal.html_title', 'Edit Modal HTML');
      label = t('modal.html_label', 'HTML Code');
      placeholder = '<div class="example">...</div>';
    }

    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'devtool-edit-modal-overlay';

    // Modal
    const modal = document.createElement('div');
    modal.className = 'devtool-edit-modal';

    // Theme Check
    if (devtoolContainer?.classList.contains('dark-theme')) {
      modal.classList.add('dark-theme');
    }

    // Header
    const header = document.createElement('div');
    header.className = 'devtool-edit-modal-header';
    header.innerHTML = `
      <div class="devtool-edit-modal-title">
        ${SVGs.edit}
        <span>${title}</span>
      </div>
    `;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'devtool-edit-modal-close';
    closeBtn.innerHTML = SVGs.close;
    closeBtn.onclick = () => {
      overlay.remove();
      if (window.MyDevTool.isEditing !== undefined) window.MyDevTool.isEditing = false;
      if (onCancel) onCancel();
    };
    header.appendChild(closeBtn);

    // Body
    const body = document.createElement('div');
    body.className = 'devtool-edit-modal-body';

    const labelEl = document.createElement('label');
    labelEl.className = 'devtool-edit-modal-label';
    labelEl.textContent = label;

    const textarea = document.createElement('textarea');
    textarea.className = 'devtool-edit-modal-textarea';
    textarea.value = value || ""; 
    textarea.placeholder = placeholder;
    textarea.spellcheck = false;

    body.appendChild(labelEl);
    body.appendChild(textarea);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'devtool-edit-modal-footer';

    const closeModal = () => {
        overlay.remove();
        if (window.MyDevTool.isEditing !== undefined) window.MyDevTool.isEditing = false;
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'devtool-edit-modal-btn devtool-edit-modal-btn-cancel';
    cancelBtn.textContent = t('modal.cancel', 'Cancel');
    cancelBtn.onclick = () => {
      closeModal();
      if (onCancel) onCancel();
    };

    const saveBtn = document.createElement('button');
    saveBtn.className = 'devtool-edit-modal-btn devtool-edit-modal-btn-save';
    saveBtn.textContent = t('modal.save', 'Save');
    saveBtn.onclick = () => {
      const newValue = textarea.value.trim();
      closeModal();
      if (onSave) onSave(newValue);
    };

    footer.appendChild(cancelBtn);
    footer.appendChild(saveBtn);

    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);
    overlay.appendChild(modal);
    
    // Append to Container (Shadow DOM)
    parent.appendChild(overlay);

    // Global Edit Flag Set
    if (window.MyDevTool.isEditing !== undefined) window.MyDevTool.isEditing = true;

    setTimeout(() => {
      textarea.focus();
      textarea.select();
    }, 100);

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
        if (onCancel) onCancel();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        const newValue = textarea.value.trim();
        closeModal();
        if (onSave) onSave(newValue);
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
        if (onCancel) onCancel();
      }
    });
  }

  return { show };

})();