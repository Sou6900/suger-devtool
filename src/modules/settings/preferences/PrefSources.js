// src/modules/settings/preferences/PrefSources.js
// Section: Sources & Editor

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.PrefSources = (function() {

    function render() {
        const i18n = window.MyDevTool.LanguageManager;
        const currentEditorTheme = window.MyDevTool.SecureStorage.getItem('editor_theme') || 'auto';

        return `
            <div class="settings-section-head">${i18n.t('settings.sources_section')}</div>
            <div class="settings-group">
                <div class="settings-group-label">${i18n.t('settings.editorTheme')}:</div>
                <select id="editor-theme-select" class="settings-select">
                    <option value="auto" ${currentEditorTheme === 'auto' ? 'selected' : ''}>${i18n.t('settings.editorThemes.auto')}</option>
                    <option disabled>--- Light ---</option>
                    <option value="default" ${currentEditorTheme === 'default' ? 'selected' : ''}>${i18n.t('settings.editorThemes.default')}</option>
                    <option value="eclipse" ${currentEditorTheme === 'eclipse' ? 'selected' : ''}>${i18n.t('settings.editorThemes.eclipse')}</option>
                    <option value="neo" ${currentEditorTheme === 'neo' ? 'selected' : ''}>${i18n.t('settings.editorThemes.neo')}</option>
                    <option disabled>--- Dark ---</option>
                    <option value="monokai" ${currentEditorTheme === 'monokai' ? 'selected' : ''}>${i18n.t('settings.editorThemes.monokai')}</option>
                    <option value="dracula" ${currentEditorTheme === 'dracula' ? 'selected' : ''}>${i18n.t('settings.editorThemes.dracula')}</option>
                    <option value="material" ${currentEditorTheme === 'material' ? 'selected' : ''}>${i18n.t('settings.editorThemes.material')}</option>
                </select>
            </div>
            <div class="settings-row"><input type="checkbox" checked> <label>${i18n.t('settings.source_maps')}</label></div>
            <div class="settings-row"><input type="checkbox" checked> <label>${i18n.t('settings.indentation')}</label></div>
        `;
    }

    function bindEvents(container) {
        container.querySelector('#editor-theme-select').onchange = (e) => {
            const val = e.target.value;
            window.MyDevTool.SecureStorage.setItem('editor_theme', val);
            if (window.MyDevTool.SourceEditor) window.MyDevTool.SourceEditor.setTheme(val);
        };
    }

    return { render, bindEvents };
})();