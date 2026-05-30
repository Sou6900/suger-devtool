// src/modules/settings/SettingsExperiments.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.SettingsExperiments = (function() {

    function render(container) {
        const i18n = window.MyDevTool.LanguageManager;
        
        const SecureStorage = window.MyDevTool.SecureStorage || localStorage;
        
        // Load current experiment states
        const get = (k, def) => SecureStorage.getItem(k) === null ? def : SecureStorage.getItem(k) === 'true';
        
        const reactDevEnabled = get('dt_exp_react_dev', false);
        const showIndentGuide = get('dt_react_indent_guide', true);
        const suggestionLimit = SecureStorage.getItem('dt_react_suggestion_limit') || '30';

        container.innerHTML = `<div class="settings-page-title">${i18n ? i18n.t('settings.experiments') || 'Experiments' : 'Experiments'}</div>`;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'preferences-wrapper';
        
        // --- Experiment Sections ---
        wrapper.innerHTML = `
            <div class="pref-section">
                <div class="settings-section-head" style="color: #42b983;">️${window.MyDevTool.SVGs} React Development</div>
                <div class="settings-row">
                    <input type="checkbox" id="chk-exp-react" ${reactDevEnabled ? 'checked' : ''} style="cursor: pointer;"> 
                    <label for="chk-exp-react" style="cursor: pointer;">Enable React Developer Tools</label>
                </div>
                <div class="settings-hint" style="margin-top: 5px; opacity: 0.8;">
                    Adds "Components" and "Profiler" tabs to inspect React Fiber trees. <br>
                    <span style="color: var(--dt-console-warn-color, #f39c12);">⚠️ Requires a DevTool reload to apply.</span>
                </div>
            

                <div class="settings-group" style="flex-direction: row; align-items: center; justify-content: space-between; border-top: 1px solid var(--dt-border-color); padding-top: 15px; margin-top: 10px;">
                    <div class="flex-row" style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" id="chk-indent-guide" ${showIndentGuide ? 'checked' : ''} style="cursor: pointer;">
                        <label for="chk-indent-guide" class="settings-group-label" style="margin-bottom: 0; cursor: pointer;">Show Indentation Guide</label>
                    </div>
                </div>

                <div class="settings-group" style="margin-top: 15px;">
                    <div class="settings-group-label">Suggestion Limit:</div>
                    <select id="select-sug-limit" class="settings-select">
                        <option value="20" ${suggestionLimit === '20' ? 'selected' : ''}>20</option>
                        <option value="30" ${suggestionLimit === '30' ? 'selected' : ''}>30</option>
                        <option value="50" ${suggestionLimit === '50' ? 'selected' : ''}>50</option>
                        <option value="80" ${suggestionLimit === '80' ? 'selected' : ''}>80</option>
                        <option value="120" ${suggestionLimit === '120' ? 'selected' : ''}>120</option>
                        <option value="180" ${suggestionLimit === '180' ? 'selected' : ''}>180</option>
                    </select>
                    <div style="font-size:10px; color:var(--dt-text-secondary); margin-top:2px;">Maximum number of suggestions to display in React Editor</div>
                </div>
            </div>
        `;

        container.appendChild(wrapper);
        bindEvents(wrapper);
    }

    function bindEvents(wrapper) {
        const SecureStorage = window.MyDevTool.SecureStorage || localStorage;

        // React Enable Event
        const chkReact = wrapper.querySelector('#chk-exp-react');
        if (chkReact) {
            chkReact.addEventListener('change', (e) => {
                SecureStorage.setItem('dt_exp_react_dev', e.target.checked ? 'true' : 'false');
                e.target.closest('.settings-row').style.borderLeft = "3px solid #f39c12";
                e.target.closest('.settings-row').style.paddingLeft = "5px";
            });
        }

        // Indentation Guide Event
        const chkIndent = wrapper.querySelector('#chk-indent-guide');
        if (chkIndent) {
            chkIndent.addEventListener('change', (e) => {
                SecureStorage.setItem('dt_react_indent_guide', e.target.checked ? 'true' : 'false');
            });
        }

        // Suggestion Limit Event
        const selLimit = wrapper.querySelector('#select-sug-limit');
        if (selLimit) {
            selLimit.addEventListener('change', (e) => {
                SecureStorage.setItem('dt_react_suggestion_limit', e.target.value);
            });
        }
    }

    return { render };
})();