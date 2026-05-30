// src/modules/settings/SettingsShortcuts.js
window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.SettingsShortcuts = (function() {

    function render(container) {
        const i18n = window.MyDevTool.LanguageManager;
        container.innerHTML = `
            <div class="settings-page-title">${i18n.t('settings.shortcuts')}</div>
            <div style="font-size:13px; line-height:1.6; color:var(--dt-text-primary);">
                <p><strong>${i18n.t('settings.general')}</strong></p>
                <ul style="padding-left:20px; margin-top:5px;">
                    <li><strong>...</strong> (shortcuts coming soon)</li>
                </ul>
            </div>
        `;
    }

    return { render };
})();