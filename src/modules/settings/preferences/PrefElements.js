// src/modules/settings/preferences/PrefElements.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.PrefElements = (function() {

    const BADGE_TYPES = [
        { id: 'grid', label: 'grid' },
        { id: 'subgrid', label: 'subgrid' },
        { id: 'flex', label: 'flex' },
        { id: 'ad', label: 'ad' }, 
        { id: 'scroll-snap', label: 'scroll-snap' },
        { id: 'container', label: 'container' },
        { id: 'slot', label: 'slot' },
        { id: 'top-layer', label: 'top-layer' }, 
        { id: 'reveal', label: 'reveal' }
    ];

    function render() {
        const DevTool = window.MyDevTool.DevTool;
        const t = window.MyDevTool.LanguageManager.t;

        const get = (k, def) => localStorage.getItem(k) === null ? def : localStorage.getItem(k) === 'true';

        const subTabLayout = DevTool ? DevTool.getSubTabLayout() : 'vertical';
        const getLoc = (id) => DevTool ? DevTool.getTabLocation(id) : 'sub';
        const stylesMain = getLoc('styles') === 'main';
        const computedMain = getLoc('computed') === 'main';
        const layoutMain = getLoc('layout') === 'main';
        
        const consoleMain = getLoc('console') === 'main';
        
        const wordWrap = get('dt_dom_word_wrap', false);
        const showComments = get('dt_dom_show_comments', true);
        const showShadow = get('dt_dom_show_shadow', true);
        const flashUpdates = get('dt_dom_flash', true);
        const showRulers = get('dt_dom_rulers', false);

        // Computed Settings
        const boxHover = get('dt_computed_box_hover', true);
        const showZero = get('dt_computed_show_zero', true);
        const boxTooltip = get('dt_computed_box_tooltip', true);

        let enabledBadges = [];
        try {
            enabledBadges = JSON.parse(localStorage.getItem('dt-enabled-badges')) || ['grid', 'flex', 'scroll-snap', 'container'];
        } catch(e) { enabledBadges = ['grid', 'flex']; }

        let badgeChecksHtml = '';
        BADGE_TYPES.forEach(b => {
            const isChecked = enabledBadges.includes(b.id);
            badgeChecksHtml += `
                <div class="settings-sub-row" style="margin-left:24px; margin-bottom:4px;">
                    <input type="checkbox" id="chk-badge-${b.id}" class="badge-toggle" data-badge="${b.id}" ${isChecked ? 'checked' : ''}> 
                    <label for="chk-badge-${b.id}">${b.label}</label>
                </div>
            `;
        });

        return `
            <div class="settings-section-head">${t('settings.pref_elements.title')}</div>
            
            <div style="margin-bottom:15px; border:1px solid var(--dt-border-light); border-radius:4px; padding:10px;">
                <strong style="display:block; margin-bottom:8px; font-size:12px; color:#5f6368;">${t('settings.pref_elements.panel_layout')}</strong>
                
                <div class="settings-group" style="margin-bottom:8px;">
                    <div class="settings-group-label" style="width:100px;">${t('settings.pref_elements.sub_tab_layout')}:</div>
                    <select id="sub-tab-layout-select" class="settings-select">
                        <option value="vertical" ${subTabLayout === 'vertical' ? 'selected' : ''}>${t('settings.pref_elements.layout_vertical')}</option>
                        <option value="horizontal" ${subTabLayout === 'horizontal' ? 'selected' : ''}>${t('settings.pref_elements.layout_horizontal')}</option>
                    </select>
                </div>

                <div class="settings-row">
                    <input type="checkbox" id="chk-style-main" ${stylesMain ? 'checked' : ''}> 
                    <label for="chk-style-main">${t('settings.pref_elements.show_styles')}</label>
                </div>
                <div class="settings-row">
                    <input type="checkbox" id="chk-computed-main" ${computedMain ? 'checked' : ''}> 
                    <label for="chk-computed-main">${t('settings.pref_elements.show_computed')}</label>
                </div>
                <div class="settings-row">
                    <input type="checkbox" id="chk-layout-main" ${layoutMain ? 'checked' : ''}> 
                    <label for="chk-layout-main">${t('settings.pref_elements.show_layout')}</label>
                </div>
            </div>
            
        <div style="margin-bottom:10px; border:1px solid var(--dt-border-light); border-radius:4px; padding:10px;">
            <strong style="display:block; margin-bottom:5px; font-size:12px;">${t('settings.pref_elements.console_label')}</strong>
            <div class="settings-row">
                <input type="checkbox" id="chk-console-main" ${consoleMain ? 'checked' : ''}> 
                <label for="chk-console-main">${t('settings.pref_elements.show_main')}</label>
            </div>
        </div>

            <div style="margin-bottom:10px; border:1px solid var(--dt-border-light); border-radius:4px; padding:10px;">
                <strong style="display:block; margin-bottom:8px; font-size:12px; color:#5f6368;">${t('settings.pref_elements.dom_appearance')}</strong>
                
                <div class="settings-row" style="margin-bottom:2px;">
                    <input type="checkbox" id="chk-dom-word-wrap" ${wordWrap ? 'checked' : ''}> 
                    <label for="chk-dom-word-wrap">${t('settings.pref_elements.enable_word_wrap')}</label>
                </div>
                <div style="font-size:10px; color:var(--dt-text-secondary); margin-top:0px;">${t('settings.no_virtualization_warning')}</div>
                
                
                <div class="settings-row">
                    <input type="checkbox" id="chk-dom-comments" ${showComments ? 'checked' : ''}> 
                    <label for="chk-dom-comments">${t('settings.pref_elements.show_comments')}</label>
                </div>

                <div class="settings-row">
                    <input type="checkbox" id="chk-dom-shadow" ${showShadow ? 'checked' : ''}> 
                    <label for="chk-dom-shadow">${t('settings.pref_elements.show_shadow')}</label>
                </div>

                <div class="settings-row">
                    <input type="checkbox" id="chk-dom-rulers" ${showRulers ? 'checked' : ''}> 
                    <label for="chk-dom-rulers">${t('settings.pref_elements.show_rulers')}</label>
                </div>
                
                <div class="settings-row">
                    <input type="checkbox" id="chk-dom-flash" ${flashUpdates ? 'checked' : ''}> 
                    <label for="chk-dom-flash">${t('settings.pref_elements.highlight_updates')}</label>
                </div>
            </div>

            <div style="margin-bottom:10px; border:1px solid var(--dt-border-light); border-radius:4px; padding:10px;">
                <strong style="display:block; margin-bottom:8px; font-size:12px; color:#5f6368;">${t('settings.pref_elements.computed_box_model')}</strong>
                
                <div class="settings-row">
                    <input type="checkbox" id="chk-computed-hover" ${boxHover ? 'checked' : ''}> 
                    <label for="chk-computed-hover">${t('settings.pref_elements.highlight_hover')}</label>
                </div>
                
                <div class="settings-row">
                    <input type="checkbox" id="chk-computed-tooltip" ${boxTooltip ? 'checked' : ''}> 
                    <label for="chk-computed-tooltip">${t('settings.pref_elements.show_tooltip')}</label>
                </div>
                
                <div class="settings-row">
                    <input type="checkbox" id="chk-computed-zero" ${showZero ? 'checked' : ''}> 
                    <label for="chk-computed-zero">${t('settings.pref_elements.show_zero')}</label>
                </div>
            </div>

            <div style="margin-bottom:10px; border:1px solid var(--dt-border-light); border-radius:4px; padding:10px;">
                 <strong style="display:block; margin-bottom:8px; font-size:12px; color:#5f6368;">${t('settings.pref_elements.element_badges')}</strong>
                 <div style="display:grid; grid-template-columns: 1fr 1fr;">
                    ${badgeChecksHtml}
                 </div>
            </div>
        `;
    }

    function bindEvents(container) {
        const DevTool = window.MyDevTool.DevTool;
        const DomTree = window.MyDevTool.DomTree;
        const DomBadges = window.MyDevTool.DomBadges;
        const ComputedTab = window.MyDevTool.ComputedTab;

        const updateSetting = (key, val) => {
            localStorage.setItem(key, val);
            if (DomTree && DomTree.updateSetting) DomTree.updateSetting(key, val);
            if (ComputedTab && ComputedTab.updateSetting) ComputedTab.updateSetting(key, val);
        };

        // Layout Events
        container.querySelector('#sub-tab-layout-select').onchange = (e) => {
            if (DevTool) DevTool.setSubTabLayout(e.target.value);
        };

        const bindTabToggle = (id, tabName) => {
            const chk = container.querySelector(id);
            if (chk && DevTool) {
                chk.onchange = (e) => {
                    DevTool.setTabLocation(tabName, e.target.checked ? 'main' : 'sub');
                };
            }
        };

        bindTabToggle('#chk-style-main', 'styles');
        bindTabToggle('#chk-computed-main', 'computed');
        bindTabToggle('#chk-layout-main', 'layout');
        
        bindTabToggle('#chk-console-main', 'console');

        // General DOM Toggles
        const bindDomToggle = (id, key) => {
            const el = container.querySelector(id);
            if (el) el.onchange = (e) => updateSetting(key, e.target.checked);
        };
        
        bindDomToggle('#chk-dom-word-wrap', 'dt_dom_word_wrap');
        bindDomToggle('#chk-dom-comments', 'dt_dom_show_comments');
        bindDomToggle('#chk-dom-shadow', 'dt_dom_show_shadow');
        bindDomToggle('#chk-dom-flash', 'dt_dom_flash');
        bindDomToggle('#chk-dom-rulers', 'dt_dom_rulers');
        
        // Computed Settings
        bindDomToggle('#chk-computed-hover', 'dt_computed_box_hover');
        bindDomToggle('#chk-computed-zero', 'dt_computed_show_zero');
        bindDomToggle('#chk-computed-tooltip', 'dt_computed_box_tooltip'); 

        // Badge Toggles
        container.querySelectorAll('.badge-toggle').forEach(chk => {
            chk.onchange = (e) => {
                const badgeId = e.target.dataset.badge;
                const isChecked = e.target.checked;
                
                let list = [];
                try { list = JSON.parse(localStorage.getItem('dt-enabled-badges')) || []; } catch(e){}

                if (isChecked) {
                    if (!list.includes(badgeId)) list.push(badgeId);
                } else {
                    list = list.filter(b => b !== badgeId);
                }

                localStorage.setItem('dt-enabled-badges', JSON.stringify(list));

                if (DomBadges && DomBadges.syncSettings) {
                    DomBadges.syncSettings();
                }

                if (DomTree && DomTree.refreshAttributes) {
                    DomTree.refreshAttributes();
                }
            };
        });
    }

    return { render, bindEvents };
})();