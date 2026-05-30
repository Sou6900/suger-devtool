// src/modules/settings/preferences/PrefGeneral.js
// Section: General & Appearance

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.PrefGeneral = (function() {
    
    function render() {
        const i18n = window.MyDevTool.LanguageManager;
        const SecureStorage = window.MyDevTool.SecureStorage || localStorage;
        
        const currentTheme = SecureStorage.getItem('theme') || 'light';
        const currentCollapseMode = SecureStorage.getItem('collapse_mode') || 'float';
        const alwaysMinimize = SecureStorage.getItem('dt_always_minimize') === 'true';

        return `
            <div class="settings-section-head">${i18n.t('settings.appearance')} & General</div>
            
            <div class="settings-group">
                <div class="settings-group-label">${i18n.t('settings.language')}:</div>
                <select id="lang-select" class="settings-select">
                    ${i18n.getSupportedLanguages().map(l => `<option value="${l.code}" ${i18n.getLanguage() === l.code ? 'selected' : ''}>${l.name}</option>`).join('')}
                </select>
                <div style="font-size:10px; color:var(--dt-text-secondary); margin-top:2px;">${i18n.t('settings.reload_hint')}</div>
            </div>

            <div class="settings-group">
                <div class="settings-group-label">${i18n.t('settings.theme')}:</div>
                <select id="theme-select" class="settings-select">
                    <option value="light" ${currentTheme === 'light' ? 'selected' : ''}>${i18n.t('settings.themes.light') || 'Light'}</option>
                    <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>${i18n.t('settings.themes.dark') || 'Dark'}</option>
                    <option value="darkamoled" ${currentTheme === 'darkamoled' ? 'selected' : ''}>Dark (AMOLED)</option>
                </select>
            </div>
            
            <div class="settings-group">
                <div class="settings-group-label">${i18n.t('settings.collapse_mode')}:</div>
                <select id="collapse-mode-select" class="settings-select">
                    <option value="float" ${currentCollapseMode === 'float' ? 'selected' : ''}>${i18n.t('settings.collapse_modes.float')}</option>
                    <option value="minimize" ${currentCollapseMode === 'minimize' ? 'selected' : ''}>${i18n.t('settings.collapse_modes.minimize')}</option>
                </select>
            </div>

            <div class="settings-group" style="flex-direction: row; align-items: center; justify-content: space-between;">
              <div class="flex-row">
                <input type="checkbox" id="always-minimize-check" ${alwaysMinimize ? 'checked' : ''} style="cursor: pointer;">
                <div class="settings-group-label" style="margin-bottom: 0;">Always Open with Minimize:</div>
              </div>
            </div>
        `;
    }

    function bindEvents(container) {
        const SecureStorage = window.MyDevTool.SecureStorage || localStorage;
        const DevTool = window.MyDevTool.DevTool;

        container.querySelector('#lang-select').onchange = (e) => {
            window.MyDevTool.LanguageManager.setLanguage(e.target.value);
        };

        container.querySelector('#theme-select').onchange = (e) => {
            if (window.MyDevTool.SettingsTab) window.MyDevTool.SettingsTab.applyTheme(e.target.value);
        };

        container.querySelector('#collapse-mode-select').onchange = (e) => {
            const mode = e.target.value;
            SecureStorage.setItem('collapse_mode', mode);
            if (DevTool) DevTool.setCollapseMode(mode);
        };

        const minimizeCheck = container.querySelector('#always-minimize-check');
        if (minimizeCheck) {
            minimizeCheck.onchange = (e) => {
                const val = e.target.checked ? 'true' : 'false';
                SecureStorage.setItem('dt_always_minimize', val);
            };
        }
    }

    return { render, bindEvents };
})();