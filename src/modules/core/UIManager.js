// src/modules/core/UIManager.js

import logoImage from '../../assets/suger-dt.png';
import themeStyles from '../theme/Theme.css';
import settingsStyles from '../settings/Settings.css';
import mainStyles from '../../styles.css';
import inspectorStyles from '../inspect/Inspect.css';
import breadcrumbStyles from '../breadcrumb/BreadcrumbBar.css';
import elementsStyles from '../element/Elements.css';
import stylesTabStyles from '../styles/StylesTab.css';
import computedStyles from '../computed/Computed.css';
import layoutTabStyles from '../styles/LayoutTab.css';
import contextMenuStyles from '../reusable/ContextMenu.css';
import editModalStyles from '../reusable/EditModal.css';
import sourceStyles from '../source/Source.css';
import suggestionBoxStyles from '../reusable/SuggestionBox.css';
import consoleStyles from '../console/Console.css';
import networkStyles from '../network/Network.css';
import monitorStyles from '../monitor/Monitor.css';
import applicationStyles from '../application/Application.css';
import componentsStyles from '../react/Components.css';
import profilerStyles from '../react/Profiler.css';


import deviceStyles from '../device/Device.css';
import dropDownStyles from '../reusable/DropDown.css';
import colorPickerStyles from 'codemirror-colorpicker/dist/codemirror-colorpicker.css';
import codemirrorStyles from 'codemirror/lib/codemirror.css';
import monokaiTheme from 'codemirror/theme/monokai.css';
import draculaTheme from 'codemirror/theme/dracula.css';
import eclipseTheme from 'codemirror/theme/eclipse.css';
import neoTheme from 'codemirror/theme/neo.css';
import materialTheme from 'codemirror/theme/material.css';
import jsonFormatterStyles from '../reusable/JsonFormatter.css';


window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.UIManager = (function () {

    function render(host) {
        const shadowRoot = host.attachShadow({ mode: 'open' });
        const i18n = window.MyDevTool.LanguageManager;
        const SVGs = window.MyDevTool.SVGs;

        // 1. Inject Styles
        const styleEl = document.createElement('style');
        styleEl.textContent = jsonFormatterStyles + themeStyles + settingsStyles + mainStyles + inspectorStyles + breadcrumbStyles + elementsStyles + stylesTabStyles + computedStyles + layoutTabStyles + contextMenuStyles + editModalStyles + sourceStyles + suggestionBoxStyles + consoleStyles + networkStyles + monitorStyles + colorPickerStyles + applicationStyles + componentsStyles + profilerStyles + codemirrorStyles + dropDownStyles + monokaiTheme + draculaTheme + eclipseTheme + neoTheme + materialTheme;

        // Dynamic Layout CSS (Resizers & Layouts) - Updated for Components Tab reuse
        styleEl.textContent += `
            #elements-content, #components-content { display: none; flex-direction: column; height: 100%; overflow: hidden; }
            #elements-content.active, #components-content.active { display: flex; }
            
            #elements-main-panel, #components-main-panel { display: flex; flex-direction: column; flex-grow: 1; overflow: hidden; min-height: 0; min-width: 0; position: relative; }
            #elements-tree-container, #react-tree-container { flex-grow: 1; overflow: auto; }
            
            #breadcrumb-bar-container { flex-shrink: 0; border-top: 1px solid var(--dt-border-color); border-bottom: none; }
            
            #style-inspector-pane, #react-inspector-pane { display: none; flex-direction: column; background-color: var(--dt-bg-panel); flex-shrink: 0; position: relative; }
            #components-content #react-inspector-pane { display: flex; } /* Always show props pane for React */
            
            /* Resizer */
            .inspector-resize-handle { display: block !important; background-color: var(--dt-border-color) !important; z-index: 2147483640 !important; flex-shrink: 0; position: relative; user-select: none; touch-action: none; }
            .inspector-resize-handle:hover, .inspector-resize-handle:active { background-color: var(--dt-text-accent) !important; opacity: 0.8; }

            /* Horizontal Mode */
            #elements-content.horizontal, #components-content.horizontal { flex-direction: row !important; }
            #elements-content.horizontal #elements-main-panel, #components-content.horizontal #components-main-panel { flex-grow: 1; width: 60%; }
            #elements-content.horizontal .inspector-resize-handle, #components-content.horizontal .inspector-resize-handle { width: 4px !important; height: 100% !important; cursor: col-resize !important; border-left: 1px solid var(--dt-bg-main); border-right: 1px solid var(--dt-bg-main); }
            #elements-content.horizontal #style-inspector-pane, #components-content.horizontal #react-inspector-pane { width: 40%; height: 100% !important; border-left: none; }

            /* Vertical Mode */
            #elements-content.vertical .inspector-resize-handle, #components-content.vertical .inspector-resize-handle { width: 100% !important; height: 1px !important; cursor: row-resize !important; border-top: 1px solid var(--dt-bg-main); border-bottom: 1px solid var(--dt-bg-main); }
            #elements-content.vertical #style-inspector-pane, #components-content.vertical #react-inspector-pane { width: 100% !important; height: 45%; }
        `;
        shadowRoot.appendChild(styleEl);

        // 2. Inject HTML
        const devToolHTML = `
        <div class="devtool-container">
            <div id="dt-global-resize-handler" style="position: absolute; top: -10px; left: 0; width: 100%; height: 10px; z-index: 2147483647; cursor: ns-resize; background: transparent; touch-action: none;"></div>

            <div class="tabs">
                <div style="border-right: 1px solid var(--dt-border-color); margin-right: 5px; padding-left: 5px; background:none; display: flex; align-items: center;">
                    <button style="border:none;background:none;" id="inspect-btn" title="${i18n ? i18n.t('settings.appearance') : 'Inspect'}">${SVGs.inspectSVG}</button>
                    <button style="border:none;background:none; margin-left: 2px;" id="dt-device-mode-btn" title="Toggle Device Toolbar">${SVGs.device}</button>
                </div>
                <div id="visible-tabs-container"></div> 
                <button id="more-tabs-btn" title="More tabs">»</button>
                <div id="more-tabs-dropdown"></div>
                <div style="border-left: 1px solid var(--dt-border-color); margin-left: 0px;background:none; z-index: 2147483648;">
                    <button style="border:none;background:none; margin-right:1px; cursor:pointer;" id="collapse-btn" title="Collapse">${SVGs.collapseSVG}</button>
                    <button style="border:none;background:none;" id="settings-btn" title="${i18n ? i18n.t('settings.title') : 'Settings'}">${SVGs.settingsSVG}</button>
                </div>
            </div>

            <div id="elements-content" class="tab-content active vertical">
                <div id="elements-main-panel">
                    <div id="elements-tree-container"></div>
                    <div id="breadcrumb-bar-container"></div>
                </div>
                <div class="inspector-resize-handle"></div>
                <div id="style-inspector-pane" style="display: none;">
                    <div class="sub-tabs-header" style="display: flex; justify-content: space-between; align-items: center; background: var(--dt-bg-header); border-bottom: 1px solid var(--dt-border-color); padding-right: 5px; height: 28px; flex-shrink: 0;">
                        <div class="sub-tabs-list" style="display:flex; overflow-x: auto; height: 100%;">
                            <button class="sub-tab-button" data-tab="styles">${i18n ? i18n.t('elements.styles') : 'Styles'}</button>
                            <button class="sub-tab-button" data-tab="computed">${i18n ? i18n.t('elements.computed') : 'Computed'}</button>
                            <button class="sub-tab-button" data-tab="layout">${i18n ? i18n.t('elements.layout') : 'Layout'}</button>
                            <button class="sub-tab-button" data-tab="console">Console</button>
                        </div>
                        <div class="sub-tab-controls" style="display: flex; align-items: center; height: 100%;">
                            <button id="sub-tab-minimize-btn" title="Minimize/Restore" style="background:none; border:none; cursor:pointer; font-size:14px; color:var(--dt-text-primary); padding:2px 6px; display:flex; align-items:center;">${SVGs.sidebarSVG}</button>
                            <button id="sub-tab-menu-btn" title="Options" style="background:none; border:none; cursor:pointer; font-size:16px; color:var(--dt-text-primary); padding:2px 6px; display:flex; align-items:center;">⋮</button>
                        </div>
                    </div>
                    <div id="styles-sub-content" class="sub-tab-content"></div>
                    <div id="computed-sub-content" class="sub-tab-content"></div>
                    <div id="layout-sub-content" class="sub-tab-content"></div>
                    <div id="console-sub-content" class="sub-tab-content"></div>
                </div>
            </div>
            
<div id="components-content" class="tab-content vertical">
    <div id="components-main-panel">
        <div class="react-toolbar">
            <button id="react-toolbar-inspect" style="background:none; border:none; color:var(--dt-text-secondary); cursor:pointer;">${SVGs.inspectSVG}</button>
            <input id="react-search-input" type="text" placeholder="Filter by component (/regex/)">
            <button id="react-toolbar-settings" style="background:none; border:none; cursor:pointer; color:var(--dt-text-secondary);">${SVGs.settingsSVG}</button>
        </div>
        <div id="react-tree-container" style="flex-grow:1; overflow:auto;"></div>
    </div>
    
    <div class="inspector-resize-handle"></div>
    
    <div id="react-inspector-pane">
        <div id="react-props-container" style="flex-grow: 1;overflow-y:auto;"></div>
    </div>
</div>

            <div id="profiler-content" class="tab-content">
                <div style="padding: 20px; text-align: center; color: var(--dt-text-secondary); font-family: sans-serif;">
                    React Profiler Data will be recorded here...
                </div>
            </div>

            <div id="console-content" class="tab-content"></div>
            <div id="network-content" class="tab-content"></div>
            <div id="source-content" class="tab-content"></div>
            <div id="monitor-content" class="tab-content"></div>
            <div id="application-content" class="tab-content"></div>
            <div id="settings-content" class="tab-content"></div>
            <div id="styles-content" class="tab-content"></div>
            <div id="computed-content" class="tab-content"></div>
            <div id="layout-content" class="tab-content"></div>
        </div>
        <div id="devtool-float-btn" style="background: var(--dt-bg-header);">️<img width="20px" src="${logoImage}" /></div>
        `;

        shadowRoot.innerHTML += devToolHTML;

        injectGlobalDependencies(); // Color picker styles etc.

        return shadowRoot;
    }

    function injectGlobalDependencies() {
        if (!document.getElementById('devtool-global-styles')) {
            const style = document.createElement('style');
            style.id = 'devtool-global-styles';
            style.textContent = deviceStyles + dropDownStyles + themeStyles;
            document.head.appendChild(style);
        }
        if (!document.getElementById('my-devtool-colorpicker-styles')) {
            const s = document.createElement('style'); s.id = 'my-devtool-colorpicker-styles'; s.textContent = colorPickerStyles; document.head.appendChild(s);
        }
        if (!document.getElementById('my-devtool-colorpicker-override')) {
            const s = document.createElement('style'); s.id = 'my-devtool-colorpicker-override'; s.textContent = `.codemirror-colorpicker, .cm-colorpicker { z-index: 2147483647 !important; position: fixed !important; }`; document.head.appendChild(s);
        }
    }

    return { render };
})();