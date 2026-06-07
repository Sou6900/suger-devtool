// src/modules/settings/SettingsAbout.js

import LOGO_URL from '../../../assets/suger-dt.png';

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.SettingsAbout = (function() {

  // SVG Icons
  const ICONS = window.MyDevTool.SVGs;
  const TEAM = [
    { name: "Dev. Sourav", role: "Lead Architect & Founder & Hosting", highlight: true },
    { name: "Bishal Coder", role: "Runtime Engine Core" },
    { name: "Shah21", role: "UI/UX & Accessibility" },
    { name: "Sunil Agarwal", role: "Network Protocol Analysis" },
    { name: "Michael Chen", role: "Security & Obfuscation" },
    { name: "The Honker", role: "Performance Optimization" }
  ];

  function render(container, appVersion) {
    const t = window.MyDevTool.LanguageManager.t;
    const SecureStorage = window.MyDevTool.SecureStorage || localStorage;

    // --- DATA ---
    const licenseKey = SecureStorage.getItem('license_key') || SecureStorage.getItem('devtool_license_key') || 'FREE-TRIAL-MODE';
    const userEmail = SecureStorage.getItem('user_email') || SecureStorage.getItem('email');

    const maskedKey = licenseKey.length > 8 ? `****-****-****-${licenseKey.slice(-4)}` : licenseKey;
    const isAcode = window.acode || window.navigator.userAgent.includes("Acode");

    // --- RENDER HTML ---
    container.innerHTML = `
    <div class="settings-page-title">${t('settings.about_section.title')}</div>

    <div class="about-container" style="max-width: 650px; margin: 0 auto; animation: fadeIn 0.4s ease;">

        <div style="text-align: center; padding: 25px 0; background: linear-gradient(180deg, var(--dt-bg-main) 0%, var(--dt-bg-alt) 100%); border-radius: 12px; border: 1px solid var(--dt-border-light); margin-bottom: 20px;">
            <img src="${LOGO_URL}" alt="Logo" style="width: 85px; height: 85px; margin-bottom: 12px; border-radius: 18px; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
            <h2 style="margin: 0; font-size: 24px; font-weight: 800; color: var(--dt-text-primary); letter-spacing: -0.5px;">
                ${t('settings.about_section.app_name')}
            </h2>
            <div style="margin-top: 5px;">
                <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--dt-text-accent); background: rgba(var(--dt-accent-rgb), 0.1); padding: 4px 8px; border-radius: 20px;">
                    ${t('settings.about_section.version', { version: window.SUGER_DEVTOOL_VERSION })}
                </span>
            </div>
            <p style="margin: 15px auto 0; font-size: 13px; color: var(--dt-text-secondary); max-width: 80%; line-height: 1.5;">
                ${t('settings.about_section.description')}
            </p>
        </div>

        <div style="display: flex; flex-wrap:wrap;justify-content:center; gap: 10px; margin-bottom: 20px;">
            <a href="https://github.com/Sou6900/suger-devtool" target="_blank" class="social-btn">
                ${ICONS.github} <span>GitHub</span>
            </a>
            <a href="https://t.me/cosmodec" target="_blank" class="social-btn">
                ${ICONS.telegram} <span>Telegram</span>
            </a>
            <a href="https://suger-devtool.vercel.app" target="_blank" class="social-btn">
                ${ICONS.web} <span>Website</span>
            </a>
        </div>

        <div class="about-card" style="margin-bottom: 20px;">
            <h3 class="card-title" style="color: var(--dt-text-accent);">✨ What's New in ${window.SUGER_DEVTOOL_VERSION}</h3>
            <div id="whats-new-container"></div>
        </div>

        <div class="about-card" style="margin-bottom: 20px;">
            <h3 class="card-title">Core Engineering Team</h3>
            <div class="team-grid">
                ${TEAM.map(member => `
                    <div class="team-member ${member.highlight ? 'highlight': ''}">
                        <div class="member-name">${member.name}</div>
                        <div class="member-role">${member.role}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="about-card">
            <h3 class="card-title">${t('settings.about_section.license_title')}</h3>

            <div class="info-row">
                <span>${t('settings.about_section.status_label')}</span>
                <span class="status-badge">${t('settings.about_section.status_active')}</span>
            </div>

            ${userEmail ? `
            <div class="info-row">
                <span>${t('settings.about_section.registered_to')}</span>
                <span style="font-family: monospace;">${userEmail}</span>
            </div>` : ''}

            <div class="info-row">
                <span>${t('settings.about_section.key_label')}</span>
                <code class="key-box">${maskedKey}</code>
            </div>

            <button id="btn-deactivate" style="display: ${isAcode ? 'none': 'flex'};" class="danger-btn">
                <span>✖</span> ${t('settings.about_section.btn_deactivate')}
            </button>
        </div>

        <div style="text-align: center; margin-top: 25px; color: var(--dt-text-secondary); font-size: 11px;">
            <p>${t('settings.about_section.copyright')}</p>
            <p style="opacity: 0.6; margin-top: 4px;">Designed in India • Engineered Globally</p>
        </div>
    </div>
    `;

    // --- MOUNT WHATS NEW ---
    // HTML render howar por WhatsNew module-ke call kora holo
    const whatsNewContainer = container.querySelector('#whats-new-container');
    if (window.MyDevTool.WhatsNew && whatsNewContainer) {
        window.MyDevTool.WhatsNew.render(whatsNewContainer);
    }

    // --- EVENTS ---
    const btnDeactivate = container.querySelector('#btn-deactivate');
    if (btnDeactivate) {
      btnDeactivate.onclick = async () => {
        if (confirm("Are you sure you want to deactivate and remove license from this device?")) {
          btnDeactivate.innerText = "Processing...";
          btnDeactivate.disabled = true;

          const LicenseManager = window.MyDevTool.LicenseManager;
          if (LicenseManager && LicenseManager.deactivate) {
            await LicenseManager.deactivate();
            window.location.reload();
          } else {
            alert("Error: License module not found.");
            btnDeactivate.disabled = false;
          }
        }
      };
    }
}

  return { render };
})();
