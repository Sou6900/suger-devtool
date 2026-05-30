// src/modules/settings/SettingsPreferences.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.SettingsPreferences = (function() {

    // Register preference sections
    function getSections() {
        return [
            window.MyDevTool.PrefGeneral,   // Language, Theme
            window.MyDevTool.PrefInspect,   // Inspect Behavior
            window.MyDevTool.PrefElements,  // Layout, Computed, Styles
            window.MyDevTool.PrefStyles,
            
            window.MyDevTool.PrefConsole,   // Console Settings (Placeholder)
            window.MyDevTool.PrefSources,   // Editor, formatting
            window.MyDevTool.PrefNetwork    // Cache, throttling
        ];
    }

    function render(container) {
        const i18n = window.MyDevTool.LanguageManager;
        container.innerHTML = `<div class="settings-page-title">${i18n ? i18n.t('settings.preferences') : 'Preferences'}</div>`;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'preferences-wrapper';
        
        const sections = getSections();

        sections.forEach(section => {
            if (section && section.render) {
                const sectionEl = document.createElement('div');
                sectionEl.className = 'pref-section';
                
                // Render HTML
                sectionEl.innerHTML = section.render();
                wrapper.appendChild(sectionEl);
                
                // Bind Events
                if (section.bindEvents) {
                    section.bindEvents(sectionEl);
                }
            }
        });
        
        container.appendChild(wrapper);
    }

    return { render };
})();