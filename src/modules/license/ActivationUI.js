// src/modules/license/ActivationUI.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.ActivationUI = (function() {

const themeStyles = `
.suger-close,.suger-title,p{color:var(--suger-text-sub)}:root{--suger-bg:#ffffff;--suger-text:#333333;--suger-text-sub:#666666;--suger-border:#e5e5e5;--suger-input-bg:#ffffff;--suger-wave:#f3f4f6;--suger-accent:#0078d4;--suger-accent-hover:#0063b1;--suger-shadow:rgba(0,0,0,0.1);--suger-overlay:rgba(0, 0, 0, 0.5)}@media (prefers-color-scheme:dark){:root{--suger-bg:#1e1e1e;--suger-text:#e0e0e0;--suger-text-sub:#aaaaaa;--suger-border:#333333;--suger-input-bg:#252525;--suger-wave:#2a2a2a;--suger-accent:#4fafff;--suger-accent-hover:#2c9bf2;--suger-shadow:rgba(0,0,0,0.5);--suger-overlay:rgba(0, 0, 0, 0.7)}}.suger-hidden{display:none!important}#suger-activation-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;background:var(--suger-overlay);backdrop-filter:blur(2px);z-index:2147483647;display:flex;align-items:center;justify-content:center;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;opacity:0;transition:opacity .4s}#suger-activation-modal,.suger-header{background:var(--suger-bg);display:flex}#suger-activation-modal{width:520px;max-width:90vw;height:450px;max-height:90vh;color:var(--suger-text);border-radius:12px;box-shadow:0 25px 50px var(--suger-shadow);flex-direction:column;overflow:hidden;transform:scale(.95) translateY(10px);transition:transform .4s cubic-bezier(.16, 1, .3, 1),opacity .4s;position:relative;border:1px solid var(--suger-border)}.suger-bg-wave{position:absolute;bottom:0;left:0;width:100%;height:40%;z-index:0;pointer-events:none;fill:var(--suger-wave)}.suger-header{height:50px;border-bottom:1px solid var(--suger-border);align-items:center;justify-content:space-between;padding:0 20px;cursor:grab;user-select:none;z-index:10;flex-shrink:0}.suger-header:active{cursor:grabbing}.suger-title{font-size:14px;font-weight:600;display:flex;align-items:center;gap:8px;pointer-events:none}.suger-close{cursor:pointer;font-size:18px;padding:8px;transition:color .2s;z-index:20;position:relative}.custom-option,.custom-select__trigger,.suger-input,.suger-label,.suger-terms-box h3{color:var(--suger-text)}.suger-close:hover{color:#d32f2f}.suger-content{flex:1;padding:30px 40px;position:relative;z-index:1;display:flex;flex-direction:column;overflow-y:auto}.suger-step{display:none;animation:.4s forwards slideUp;height:100%;flex-direction:column;opacity:0}.suger-step.active{display:flex;opacity:1}@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}h2{margin:0 0 10px;font-size:26px;color:var(--suger-accent);font-weight:700;letter-spacing:-.5px}p{font-size:14px;line-height:1.5;margin-bottom:20px}.custom-select-wrapper{position:relative;user-select:none;width:100%}.custom-select{position:relative;display:flex;flex-direction:column}.custom-select__trigger{position:relative;display:flex;align-items:center;justify-content:space-between;padding:12px;font-size:14px;font-weight:500;border:1px solid var(--suger-border);border-radius:6px;background:var(--suger-input-bg);cursor:pointer;transition:.2s}.custom-options,.suger-input{border:1px solid var(--suger-border);background:var(--suger-input-bg)}.custom-select__trigger:hover{border-color:var(--suger-accent)}.custom-options{position:absolute;display:block;top:100%;left:0;right:0;border-radius:6px;box-shadow:0 10px 20px var(--suger-shadow);margin-top:5px;opacity:0;visibility:hidden;pointer-events:none;transform:translateY(-10px);transition:.3s;z-index:10;max-height:200px;overflow-y:auto}.custom-select.open .custom-options{opacity:1;visibility:visible;pointer-events:all;transform:translateY(0)}.custom-option{position:relative;display:block;padding:10px 15px;font-size:14px;cursor:pointer;transition:.2s}.custom-option:hover{background:var(--suger-accent);color:#fff}.custom-option.selected{background:var(--suger-wave);font-weight:600}.arrow{position:relative;height:10px;width:10px}.arrow::after{content:'';border-bottom:2px solid #999;border-right:2px solid #999;height:100%;width:100%;transform:rotate(45deg);position:absolute}.suger-input-group{margin-bottom:15px}.suger-label{display:block;font-size:12px;font-weight:600;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px}.suger-input{width:100%;padding:12px;font-family:monospace;letter-spacing:2px;border-radius:6px;font-size:16px;text-transform:uppercase;transition:.2s;outline:0;box-sizing:border-box;text-align:center}.suger-input:focus{border-color:var(--suger-accent);box-shadow:0 0 0 3px rgba(0,120,212,.15)}#user-email-input{font-family:sans-serif;letter-spacing:normal;text-transform:none}.suger-terms-box{flex:1;min-height:100px;border:1px solid var(--suger-border);background:var(--suger-wave);overflow-y:auto;padding:15px;font-size:12px;color:var(--suger-text-sub);margin-bottom:15px;border-radius:6px;line-height:1.6}.suger-terms-box h3{margin-top:0}.suger-footer{margin-top:auto;display:flex;justify-content:flex-end;gap:12px;padding-top:20px;border-top:1px solid var(--suger-border);flex-shrink:0}.suger-btn{padding:10px 28px;border-radius:6px;border:1px solid transparent;font-size:14px;cursor:pointer;transition:.2s;font-weight:600}.suger-btn-primary{background:var(--suger-accent);color:#fff;box-shadow:0 4px 10px rgba(0,120,212,.2)}.suger-btn-primary:hover{background:var(--suger-accent-hover);transform:translateY(-1px)}.suger-btn-secondary{background:0 0;border-color:var(--suger-border);color:var(--suger-text)}.suger-btn-secondary:hover{background:var(--suger-wave)}.suger-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}.suger-checkbox-label{cursor:pointer;user-select:none;display:flex;align-items:center;color:var(--suger-text);font-size:13px}.suger-checkbox-label input{margin-right:8px;accent-color:var(--suger-accent)}.suger-link{color:var(--suger-accent);text-decoration:none;font-weight:600;font-size:12px;transition:opacity .2s}.suger-link:hover{text-decoration:underline;opacity:.8}.suger-links-container{margin-top:10px;text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:4px}
  `;

  function injectStyles() {
    if (!document.getElementById('suger-premium-style')) {
      const styleSheet = document.createElement("style");
      styleSheet.id = 'suger-premium-style';
      styleSheet.innerText = themeStyles;
      document.head.appendChild(styleSheet);
    }
  }

  function show(onSuccess, prefilledKey = null) {
    const IS_BETA_MODE = true; 
    injectStyles();
    const i18n = window.MyDevTool.LanguageManager;
    const supportedLangs = i18n.getSupportedLanguages();
    let currentLang = i18n.getLanguage();

    const overlay = document.createElement('div');
    overlay.id = 'suger-activation-overlay';
    
    // HTML Structure
    overlay.innerHTML = `
      <div id="suger-activation-modal">
        <svg class="suger-bg-wave" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,202.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
        
        <div class="suger-header" id="suger-drag-handle">
           <div class="suger-title">
             <img height="25px" src="https://i.postimg.cc/0NPf46yp/Picsart-25-11-22-08-13-55-109.png" />
             Suger DevTool<sup>&nbsp;®</sup>
           </div>
           <div class="suger-close" id="suger-close-x">✕</div>
        </div>

        <div class="suger-content">
            <div class="suger-step active" id="step-0">
                <h2 id="txt-welcome">${i18n.t('welcome.title')}</h2>
                <p id="txt-subtitle">${i18n.t('welcome.subtitle')}</p>
                
                <div class="suger-input-group" style="margin-top: 20px;">
                    <label class="suger-label" id="txt-select-lang">${i18n.t('welcome.select_language')}</label>
                    <div class="custom-select-wrapper">
                        <div class="custom-select">
                            <div class="custom-select__trigger">
                                <span id="selected-lang-text">Select Language</span>
                                <div class="arrow"></div>
                            </div>
                            <div class="custom-options">
                                ${supportedLangs.map(l => 
                                    `<span class="custom-option ${l.code === currentLang ? 'selected' : ''}" data-value="${l.code}">${l.name}</span>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="suger-footer" style="justify-content: space-between;">
                    <button class="suger-btn suger-btn-secondary" id="btn-already-login">${i18n.t('welcome.already_logged_in')}</button>
                    <button class="suger-btn suger-btn-primary" id="btn-lang-next">${i18n.t('welcome.continue')}</button>
                </div>
            </div>

            <div class="suger-step" id="step-1">
                <h2 id="txt-enter-key">Enter Product Key</h2>
                <p id="txt-key-desc">Enter your email and beta key to continue.</p>
                <div class="suger-input-group">
                    <label class="suger-label">EMAIL</label>
                    <input type="email" class="suger-input" id="user-email-input" placeholder="name@example.com">
                </div>
                <div class="suger-input-group" id="group-product-key">
                    <label class="suger-label">BETA KEY</label>
                    <input type="text" class="suger-input" id="product-key-input" placeholder="XXXX-XXXX-XXXX-XXXX" maxlength="19" spellcheck="false">
                    <div class="suger-links-container">
                        <span style="font-size: 12px; color: var(--suger-text-sub);" id="txt-no-key-label">Don't have a key?</span>
                        <div style="display: flex; gap: 12px;">
                             <a class="suger-link" id="link-get-key" href="https://github.com/Sou6900/suger-devtool" target="_blank">Get key from website</a>
                             <a class="suger-link" id="link-contact-support" href="https://t.me/cosmodec" target="_blank">Contact Support</a>
                        </div>
                    </div>
                </div>
                <div class="suger-footer">
                    <button class="suger-btn suger-btn-secondary" id="btn-cancel-1">Cancel</button>
                    <button class="suger-btn suger-btn-primary" id="btn-next" disabled>Next</button>
                </div>
            </div>

            <div class="suger-step" id="step-2">
                <h2>License Agreement</h2>
                <div class="suger-terms-box" id="terms-content"></div>
                <div style="margin-bottom: 10px;">
                    <label class="suger-checkbox-label">
                        <input type="checkbox" id="chk-agree"> I accept the terms & conditions
                    </label>
                </div>
                <div class="suger-footer">
                    <button class="suger-btn suger-btn-secondary" id="btn-back">Back</button>
                    <button class="suger-btn suger-btn-primary" id="btn-activate" disabled>Activate</button>
                </div>
            </div>

            <div class="suger-step" id="step-3" style="justify-content:center; align-items:center; text-align:center;">
                <div id="loader-anim">
                    <svg width="60" height="60" viewBox="0 0 50 50" style="animation: spin 1s linear infinite;">
                        <circle cx="25" cy="25" r="20" fill="none" stroke="var(--suger-accent)" stroke-width="4" stroke-dasharray="80" stroke-dashoffset="0"></circle>
                    </svg>
                </div>
                <h3 id="status-text" style="margin-top:24px; color:var(--suger-text);">Verifying...</h3>
                <p id="status-sub" style="color:var(--suger-text-sub);">Connecting to server...</p>
            </div>
        </div>
      </div>
      <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        overlay.querySelector('#suger-activation-modal').style.transform = 'scale(1) translateY(0)';
    });

    // --- Step References ---
    const step0 = overlay.querySelector('#step-0');
    const step1 = overlay.querySelector('#step-1');
    const step2 = overlay.querySelector('#step-2');
    const step3 = overlay.querySelector('#step-3');
    const emailInput = overlay.querySelector('#user-email-input');
    const keyInput = overlay.querySelector('#product-key-input');
    const keyGroup = overlay.querySelector('#group-product-key');
    const btnLangNext = overlay.querySelector('#btn-lang-next');
    const btnAlreadyLogin = overlay.querySelector('#btn-already-login');
    const btnNext = overlay.querySelector('#btn-next');
    const btnBack = overlay.querySelector('#btn-back');
    const btnActivate = overlay.querySelector('#btn-activate');
    const chkAgree = overlay.querySelector('#chk-agree');
    
    // Custom Select Elements
    const customSelect = overlay.querySelector('.custom-select');
    const customTrigger = overlay.querySelector('.custom-select__trigger');
    const customOptions = overlay.querySelectorAll('.custom-option');
    const selectedText = overlay.querySelector('#selected-lang-text');
    
    const initialLangObj = supportedLangs.find(l => l.code === currentLang);
    if(initialLangObj) selectedText.textContent = initialLangObj.name;

    // --- Language Change Logic ---
    customTrigger.addEventListener('click', () => customSelect.classList.toggle('open'));
    
    customOptions.forEach(option => {
        option.addEventListener('click', function() {
            customSelect.classList.remove('open');
            const val = this.dataset.value;
            selectedText.textContent = this.textContent;
            i18n.setLanguage(val, false); 
            updateUITexts(); 
            customOptions.forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) customSelect.classList.remove('open');
    });

    function updateUITexts() {
        const i18n = window.MyDevTool.LanguageManager;
        overlay.querySelector('#txt-welcome').textContent = i18n.t('welcome.title');
        overlay.querySelector('#txt-subtitle').textContent = i18n.t('welcome.subtitle');
        overlay.querySelector('#txt-select-lang').textContent = i18n.t('welcome.select_language');
        
        btnLangNext.textContent = i18n.t('welcome.continue');
        btnAlreadyLogin.textContent = i18n.t('welcome.already_logged_in'); 
        
        // Base Texts
        if(overlay.querySelector('#txt-enter-key')) overlay.querySelector('#txt-enter-key').textContent = i18n.t('activation.title');
        
        // Handle premium text hide logic
        if(overlay.querySelector('#txt-key-desc')) {
            let descText = i18n.t('activation.subtitle');
            if(IS_BETA_MODE) descText = descText.replace(/premium features/i, "beta features");
            overlay.querySelector('#txt-key-desc').textContent = descText;
        }

        const labels = overlay.querySelectorAll('.suger-label');
        if(labels.length > 1) {
            labels[1].textContent = i18n.t('activation.label_email'); 
            labels[2].textContent = IS_BETA_MODE ? "BETA KEY" : i18n.t('activation.label_key');
        }
        overlay.querySelector('#user-email-input').placeholder = i18n.t('activation.placeholder_email');
        const noKeyLabel = overlay.querySelector('#txt-no-key-label');
        if(noKeyLabel) noKeyLabel.textContent = i18n.t('activation.no_key');

        const linkGetKey = overlay.querySelector('#link-get-key');
        if (linkGetKey) linkGetKey.textContent = i18n.t('activation.get_key_link');
        const linkSupport = overlay.querySelector('#link-contact-support');
        if (linkSupport) linkSupport.textContent = i18n.t('activation.contact_support');

        overlay.querySelector('#btn-cancel-1').textContent = i18n.t('activation.btn_cancel');
        
        btnNext.textContent = IS_BETA_MODE ? (i18n.t('activation.btn_activate') || "Activate") : i18n.t('activation.btn_next');
        
        const step2Header = step2.querySelector('h2'); 
        if(step2Header) step2Header.textContent = i18n.t('license.title');
        const termsBox = overlay.querySelector('#terms-content');
        termsBox.innerHTML = i18n.t('license.content');

        const checkboxLabelText = overlay.querySelector('.suger-checkbox-label');
        if(checkboxLabelText) {
             const textNode = Array.from(checkboxLabelText.childNodes).find(node => node.nodeType === 3);
             if(textNode) textNode.textContent = " " + i18n.t('license.agree_checkbox');
        }

        btnBack.textContent = i18n.t('activation.btn_back');
        btnActivate.textContent = i18n.t('activation.btn_activate');
        overlay.querySelector('#status-text').textContent = i18n.t('activation.verifying');
        overlay.querySelector('#status-sub').textContent = IS_BETA_MODE ? "Connecting to server..." : i18n.t('activation.connecting');

        if (prefilledKey) {
             overlay.querySelector('#txt-enter-key').textContent = "Verify Account";
             overlay.querySelector('#txt-key-desc').textContent = "Please confirm your email to activate Acode Plugin.";
        }
    }
    updateUITexts(); 

    if (prefilledKey) {
        keyInput.value = prefilledKey;
        if (keyGroup) keyGroup.style.display = 'none';
    }

    btnLangNext.onclick = () => { step0.classList.remove('active'); step1.classList.add('active'); };
    
    btnAlreadyLogin.onclick = () => { window.location.reload(); };
    
    function validateInputs() {
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
        let keyValid = true;

        if (!prefilledKey) {
            const rawKey = keyInput.value.replace(/[^A-Z0-9]/g, '');
            keyValid = rawKey.length === 16;
        }
        
        btnNext.disabled = !(emailValid && keyValid);
    }

    emailInput.addEventListener('input', validateInputs);

    keyInput.addEventListener('input', (e) => {
        let cursorPosition = e.target.selectionStart;
        let oldLength = e.target.value.length;
        
        let val = e.target.value.replace(/[^A-Z0-9]/ig, "").toUpperCase().slice(0, 16);
        let formatted = "";
        for(let i=0; i<val.length; i++) {
            if(i > 0 && i % 4 === 0) formatted += "-";
            formatted += val[i];
        }

        e.target.value = formatted;

        if (cursorPosition < oldLength) e.target.setSelectionRange(cursorPosition, cursorPosition);
        validateInputs();
        if(!btnNext.disabled) keyInput.classList.remove('error');
    });

    const executeActivation = async () => {
        if (IS_BETA_MODE) {
            step1.classList.remove('active');
        } else {
            step2.classList.remove('active');
        }
        step3.classList.add('active');
        
        const finalKey = prefilledKey || keyInput.value.trim();
        const email = emailInput.value.trim();

        setTimeout(async () => {
             const LicenseManager = window.MyDevTool.LicenseManager;
             if (!LicenseManager) return;

             try {
                 const res = await LicenseManager.activate(finalKey, email);
                 if (res.success) {
                     const loader = overlay.querySelector('#loader-anim');
                     loader.innerHTML = `<svg width="60" height="60" viewBox="0 0 24 24" fill="#2e7d32"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
                     overlay.querySelector('#status-text').textContent = "Activated Successfully!";
                     overlay.querySelector('#status-text').style.color = "#2e7d32";
                     overlay.querySelector('#status-sub').textContent = "Reloading...";
                     setTimeout(() => {
                         closeModal();
                         window.location.reload(); 
                     }, 1500);
                 } else {
                     handleError(res.message || "Invalid Key");
                 }
             } catch (e) {
                 handleError("Connection Error");
             }
        }, 1500);
        
        function handleError(msg) {
            step3.classList.remove('active');
            step1.classList.add('active');
            if(!prefilledKey) {
                keyInput.classList.add('error');
                keyInput.focus();
            }
            alert("Activation Failed: " + msg);
        }
    };

    btnNext.onclick = () => { 
        if (IS_BETA_MODE) {
            executeActivation();
        } else {
            step1.classList.remove('active'); 
            step2.classList.add('active'); 
        }
    };

    btnBack.onclick = () => { step2.classList.remove('active'); step1.classList.add('active'); };
    chkAgree.onchange = (e) => { btnActivate.disabled = !e.target.checked; };
    btnActivate.onclick = executeActivation;
    

    const modal = overlay.querySelector('#suger-activation-modal');
    const headerRef = overlay.querySelector('#suger-drag-handle');
    let isDragging = false, startX, startY, initialLeft, initialTop;

    const startDrag = (e) => {
        if (e.target.id === 'suger-close-x' || e.target.closest('#suger-close-x')) {
            return; 
        }
        
        e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    	
        isDragging = true;
        const rect = modal.getBoundingClientRect();
        
        modal.style.position = 'absolute';
        modal.style.margin = '0';
        modal.style.transform = 'none'; 
        
        modal.style.left = rect.left + 'px';
        modal.style.top = rect.top + 'px';
        
        initialLeft = rect.left;
        initialTop = rect.top;
        startX = clientX;
        startY = clientY;
    };

    const moveDrag = (e) => {
        if (!isDragging) return;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        e.preventDefault(); 
        
        modal.style.left = `${initialLeft + (clientX - startX)}px`;
        modal.style.top = `${initialTop + (clientY - startY)}px`;
    };

    const endDrag = () => { isDragging = false; };

    headerRef.addEventListener('mousedown', startDrag);
    headerRef.addEventListener('touchstart', startDrag, { passive: false }); 
    
    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('touchmove', moveDrag, { passive: false });
    
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);

    const closeModal = () => { 
        overlay.style.opacity = '0'; 
        setTimeout(() => overlay.remove(), 300); 
    };
    
    const closeBtn = overlay.querySelector('#suger-close-x');
    closeBtn.onclick = closeModal;
    closeBtn.addEventListener('touchstart', (e) => { e.stopPropagation(); closeModal(); });

    overlay.querySelector('#btn-cancel-1').onclick = closeModal;
  }

  return { show };

})();