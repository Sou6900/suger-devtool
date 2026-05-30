// src/modules/settings/SettingsTab.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.SettingsTab = (function() {
  const SecureStorage = window.MyDevTool.SecureStorage; 
  let shadowRoot = null;
  let contentArea = null;
  const Version = 'v1.0.18 (beta 1)';

  function init(container, root) {
    shadowRoot = root;
    container.innerHTML = ''; 
    renderLayout(container);
    bindSidebarEvents(container);
    
    // Default to Preferences
    if (window.MyDevTool.SettingsPreferences) {
        window.MyDevTool.SettingsPreferences.render(contentArea);
    }
    
    const savedTheme = SecureStorage.getItem('theme') || 'light';
    setTimeout(() => { applyTheme(savedTheme); }, 0);
  }

  function renderLayout(container) {
      const i18n = window.MyDevTool.LanguageManager;
      const wrapper = document.createElement('div');
      wrapper.className = 'settings-tab-container';
      wrapper.innerHTML = `
        <div class="settings-sidebar">
            <div class="settings-nav-item active" data-tab="preferences">${i18n ? i18n.t('settings.preferences') : 'Preferences'}</div>
            <div class="settings-nav-item" data-tab="shortcuts">${i18n ? i18n.t('settings.shortcuts') : 'Shortcuts'}</div>
            <div class="settings-nav-item" data-tab="experiments">${i18n ? i18n.t('settings.experiments') : 'Experiments'}</div>
            <div class="settings-nav-item" data-tab="about">${i18n ? i18n.t('settings.about') : 'About'}</div>
        </div>
        <div class="settings-content" id="settings-content-area"></div>
      `;
      container.appendChild(wrapper);
      contentArea = container.querySelector('#settings-content-area');
  }

  function bindSidebarEvents(container) {
      const i18n = window.MyDevTool.LanguageManager;
      const navItems = container.querySelectorAll('.settings-nav-item');
      
      navItems.forEach(item => {
          item.onclick = () => {
              navItems.forEach(i => i.classList.remove('active'));
              item.classList.add('active');
              
              const tab = item.dataset.tab;
              contentArea.innerHTML = ''; // Clear content

              // Dynamic Routing to Modules
              if (tab === 'preferences' && window.MyDevTool.SettingsPreferences) {
                  window.MyDevTool.SettingsPreferences.render(contentArea);
              } 
              else if (tab === 'shortcuts' && window.MyDevTool.SettingsShortcuts) {
                  window.MyDevTool.SettingsShortcuts.render(contentArea);
              }
              else if (tab === 'experiments' && window.MyDevTool.SettingsExperiments) {
                  window.MyDevTool.SettingsExperiments.render(contentArea);
              }
              else if (tab === 'about' && window.MyDevTool.SettingsAbout) {
                  window.MyDevTool.SettingsAbout.render(contentArea, Version);
              } else {
                  contentArea.innerHTML = `
                    <div class="settings-page-title">${item.textContent}</div>
                    <p>${i18n ? i18n.t('settings.coming_soon') : 'Coming soon...'}</p>
                  `;
              }
          };
      });
  }

  function applyTheme(themeName) {
      if (!shadowRoot) return;
      const container = shadowRoot.querySelector('.devtool-container');
      if (!container) return;

      // Remove all existing theme classes
      container.classList.remove('dark-theme', 'darkamoled-theme');

      //  Add appropriate class based on selection
      if (themeName === 'dark') {
          container.classList.add('dark-theme');
      } else if (themeName === 'darkamoled') {
          container.classList.add('darkamoled-theme');
      }
      
      //  Save 
      SecureStorage.setItem('theme', themeName); 
      
      // Refresh Editor theme 
      if (window.MyDevTool.SourceEditor && window.MyDevTool.SourceEditor.refreshTheme) {
          window.MyDevTool.SourceEditor.refreshTheme();
      }
  }

  return { init, applyTheme , Version };

})();