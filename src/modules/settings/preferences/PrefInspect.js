// src/modules/settings/preferences/PrefInspect.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.PrefInspect = (function() {

    function render() {
        const t = window.MyDevTool.LanguageManager.t;
        const get = (k, def) => localStorage.getItem(k) === null ? def : localStorage.getItem(k) === 'true';

        const hideInspect = get('devtool-hide-on-inspect', false);
        const tooltipEnabled = get('dt_insp_tooltip', true);
        const showHierarchy = get('dt_insp_hierarchy', true);
        const showDims = get('dt_insp_dims', true);
        const showColor = get('dt_insp_color', true);
        const showBoxInfo = get('dt_insp_box_text', false);
        const showExtra = get('dt_insp_extra', true); 
        
        const ovMargin = get('dt_insp_ov_margin', true);
        const ovPadding = get('dt_insp_ov_padding', true);
        const ovBorder = get('dt_insp_ov_border', true);

        return `
            <div class="settings-section-head">${t('settings.inspect_section')}</div>
            
            <div class="settings-row">
                <input type="checkbox" id="chk-hide-inspect" ${hideInspect ? 'checked' : ''}> 
                <label for="chk-hide-inspect">${t('settings.hide_while_inspecting')}</label>
            </div>

            <div style="margin-top:10px; border:1px solid var(--dt-border-light); border-radius:4px; padding:10px;">
                <strong style="display:block; margin-bottom:5px; font-size:12px;">
                    ${t('settings.pref_inspect.tooltip_title')}
                </strong>
                
                <div class="settings-row">
                    <input type="checkbox" id="chk-tooltip-enable" ${tooltipEnabled ? 'checked' : ''}> 
                    <label for="chk-tooltip-enable">${t('settings.pref_inspect.enable_tooltip')}</label>
                </div>
                
                <div id="tooltip-options" style="margin-left: 20px; opacity: ${tooltipEnabled ? 1 : 0.5}; pointer-events: ${tooltipEnabled ? 'auto' : 'none'};">
                    <div class="settings-row">
                        <input type="checkbox" id="chk-tt-hierarchy" ${showHierarchy ? 'checked' : ''}> 
                        <label for="chk-tt-hierarchy">${t('settings.pref_inspect.show_hierarchy')}</label>
                    </div>
                    <div class="settings-row">
                        <input type="checkbox" id="chk-tt-dims" ${showDims ? 'checked' : ''}> 
                        <label for="chk-tt-dims">${t('settings.pref_inspect.show_dims')}</label>
                    </div>
                    <div class="settings-row">
                        <input type="checkbox" id="chk-tt-color" ${showColor ? 'checked' : ''}> 
                        <label for="chk-tt-color">${t('settings.pref_inspect.show_color')}</label>
                    </div>
                    <div class="settings-row">
                        <input type="checkbox" id="chk-tt-box" ${showBoxInfo ? 'checked' : ''}> 
                        <label for="chk-tt-box">${t('settings.pref_inspect.show_box_model')}</label>
                    </div>
                     <div class="settings-row">
                        <input type="checkbox" id="chk-tt-extra" ${showExtra ? 'checked' : ''}> 
                        <label for="chk-tt-extra">${t('settings.pref_inspect.show_extra')}</label>
                    </div>
                </div>
            </div>

            <div style="margin-top:10px; border:1px solid var(--dt-border-light); border-radius:4px; padding:10px;">
                <strong style="display:block; margin-bottom:5px; font-size:12px;">
                    ${t('settings.pref_inspect.overlay_title')}
                </strong>
                <div class="settings-row">
                    <input type="checkbox" id="chk-ov-margin" ${ovMargin ? 'checked' : ''}> 
                    <label for="chk-ov-margin">${t('settings.pref_inspect.show_margin')}</label>
                </div>
                <div class="settings-row">
                    <input type="checkbox" id="chk-ov-padding" ${ovPadding ? 'checked' : ''}> 
                    <label for="chk-ov-padding">${t('settings.pref_inspect.show_padding')}</label>
                </div>
                <div class="settings-row">
                    <input type="checkbox" id="chk-ov-border" ${ovBorder ? 'checked' : ''}> 
                    <label for="chk-ov-border">${t('settings.pref_inspect.show_border')}</label>
                </div>
            </div>
        `;
    }

    function bindEvents(container) {
        const Inspector = window.MyDevTool.Inspector;
        
        const update = (id, key, settingName) => {
            const el = container.querySelector(id);
            if (el) {
                el.onchange = (e) => {
                    const val = e.target.checked;
                    if (Inspector) Inspector.updateSetting(settingName, val);
                    
                    if (id === '#chk-tooltip-enable') {
                        const opts = container.querySelector('#tooltip-options');
                        if (opts) {
                            opts.style.opacity = val ? 1 : 0.5;
                            opts.style.pointerEvents = val ? 'auto' : 'none';
                        }
                    }
                };
            }
        };

        update('#chk-hide-inspect', 'devtool-hide-on-inspect', 'hideOnInspect');
        update('#chk-tooltip-enable', 'dt_insp_tooltip', 'enableTooltip');
        update('#chk-tt-hierarchy', 'dt_insp_hierarchy', 'showHierarchy');
        update('#chk-tt-dims', 'dt_insp_dims', 'showDimensions');
        update('#chk-tt-color', 'dt_insp_color', 'showColor');
        update('#chk-tt-box', 'dt_insp_box_text', 'showBoxModelInfo');
        update('#chk-tt-extra', 'dt_insp_extra', 'showExtraDetails'); 

        update('#chk-ov-margin', 'dt_insp_ov_margin', 'overlayMargin');
        update('#chk-ov-padding', 'dt_insp_ov_padding', 'overlayPadding');
        update('#chk-ov-border', 'dt_insp_ov_border', 'overlayBorder');
    }

    return { render, bindEvents };
})();