window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.PrefStyles = (function() {

    function render() {
        const t = window.MyDevTool.LanguageManager.t;
        const get = (k, def) => localStorage.getItem(k) === null ? def : localStorage.getItem(k) === 'true';
        const getNumber = (k, def) => {
            const val = localStorage.getItem(k);
            return val === null ? def : parseInt(val, 10);
        };

        const editOnSingleClick = get('dt_style_edit_single_click', false);
        const focusMode = get('dt_style_focus_mode', false);
        const showSelectorInFocus = get('dt_style_focus_show_selector', true); 
        
        const showUserAgent = get('dt_style_show_user_agent', true);
        const showSuggestions = get('dt_style_show_suggestions', true);
        const maxSuggestions = getNumber('dt_style_max_suggestions', 50);

        // ... Suggestion Options Loop ...
        const suggestionOptions = [25, 50, 100, 150, 200, 250, 300, 500];
        let suggestionOptionsHtml = '';
        suggestionOptions.forEach(count => {
            suggestionOptionsHtml += `<option value="${count}" ${maxSuggestions === count ? 'selected' : ''}>${count}</option>`;
        });

        return `
            <div class="settings-section-head">${t('settings.pref_styles.title') || 'Styles'}</div>
            
            <div style="margin-bottom:10px; border:1px solid var(--dt-border-light); border-radius:4px; padding:10px;">
                <strong style="display:block; margin-bottom:8px; font-size:12px; color:#5f6368;">${t('settings.pref_styles.editing_behavior') || 'Editing Behavior'}</strong>
                
                <div class="settings-row">
                    <input type="checkbox" id="chk-style-single-click" ${editOnSingleClick ? 'checked' : ''}> 
                    <label for="chk-style-single-click">${t('settings.pref_styles.edit_single_click') || 'Edit on single click'}</label>
                </div>

                <div class="settings-row" style="margin-top: 8px;">
                    <input type="checkbox" id="chk-style-focus-mode" ${focusMode ? 'checked' : ''}> 
                    <label for="chk-style-focus-mode">Focus Mode</label>
                </div>
                
                <div class="settings-row" style="margin-left: 24px; opacity: ${focusMode ? '1' : '0.5'};">
                    <input type="checkbox" id="chk-style-focus-selector" ${showSelectorInFocus ? 'checked' : ''} ${!focusMode ? 'disabled' : ''}> 
                    <label for="chk-style-focus-selector">Show selector context</label>
                </div>
                
                <div style="font-size:10px; color:var(--dt-text-secondary); margin-top:2px; margin-left:24px; margin-bottom: 8px;">
                    If disabled, only the property being edited will be shown with a solid background.
                </div>
            </div>

            <div style="margin-bottom:10px; border:1px solid var(--dt-border-light); border-radius:4px; padding:10px;">
                <strong style="display:block; margin-bottom:8px; font-size:12px; color:#5f6368;">${t('settings.pref_styles.display_options') || 'Display Options'}</strong>
                <div class="settings-row">
                    <input type="checkbox" id="chk-style-user-agent" ${showUserAgent ? 'checked' : ''}> 
                    <label for="chk-style-user-agent">${t('settings.pref_styles.show_user_agent') || 'Show user agent styles'}</label>
                </div>
            </div>
            
            <div style="margin-bottom:10px; border:1px solid var(--dt-border-light); border-radius:4px; padding:10px;">
                <strong style="display:block; margin-bottom:8px; font-size:12px; color:#5f6368;">${t('settings.pref_styles.autocomplete') || 'Autocomplete'}</strong>
                <div class="settings-row">
                    <input type="checkbox" id="chk-style-suggestions" ${showSuggestions ? 'checked' : ''}> 
                    <label for="chk-style-suggestions">${t('settings.pref_styles.show_suggestions') || 'Show suggestions'}</label>
                </div>
                <div class="settings-group" style="margin-top:8px; margin-left:20px;">
                    <div class="settings-group-label" style="width:140px;">${t('settings.pref_styles.max_suggestions') || 'Max suggestions'}:</div>
                    <select id="style-max-suggestions-select" class="settings-select" ${!showSuggestions ? 'disabled' : ''}>
                        ${suggestionOptionsHtml}
                    </select>
                </div>
            </div>
        `;
    }

    function bindEvents(container) {
        const StylePropertyEditor = window.MyDevTool.StylePropertyEditor;
        const updateSetting = (key, val) => {
            localStorage.setItem(key, val);
            if (StylePropertyEditor && StylePropertyEditor.updateSettings) StylePropertyEditor.updateSettings();
        };

        const singleClickChk = container.querySelector('#chk-style-single-click');
        if(singleClickChk) singleClickChk.onchange = (e) => updateSetting('dt_style_edit_single_click', e.target.checked);

        const focusModeChk = container.querySelector('#chk-style-focus-mode');
        const focusSelectorChk = container.querySelector('#chk-style-focus-selector');

        if (focusModeChk) {
            focusModeChk.onchange = (e) => {
                const isEnabled = e.target.checked;
                updateSetting('dt_style_focus_mode', isEnabled);
                if (focusSelectorChk) {
                    focusSelectorChk.disabled = !isEnabled;
                    focusSelectorChk.parentElement.style.opacity = isEnabled ? '1' : '0.5';
                }
            };
        }

        if (focusSelectorChk) {
            focusSelectorChk.onchange = (e) => updateSetting('dt_style_focus_show_selector', e.target.checked);
        }

        const userAgentChk = container.querySelector('#chk-style-user-agent');
        if (userAgentChk) {
            userAgentChk.onchange = (e) => {
                updateSetting('dt_style_show_user_agent', e.target.checked);
                if (window.MyDevTool.StylesTab && window.MyDevTool.StylesTab.refresh) window.MyDevTool.StylesTab.refresh();
            };
        }
        const suggestionsChk = container.querySelector('#chk-style-suggestions');
        const maxSuggestionsSelect = container.querySelector('#style-max-suggestions-select');
        if (suggestionsChk) {
            suggestionsChk.onchange = (e) => {
                const enabled = e.target.checked;
                updateSetting('dt_style_show_suggestions', enabled);
                if (maxSuggestionsSelect) maxSuggestionsSelect.disabled = !enabled;
            };
        }
        if (maxSuggestionsSelect) {
            maxSuggestionsSelect.onchange = (e) => updateSetting('dt_style_max_suggestions', e.target.value);
        }
    }

    return { render, bindEvents };
})();