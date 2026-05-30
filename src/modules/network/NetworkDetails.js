// src/modules/network/NetworkDetails.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.NetworkDetails = (function () {

  let shadowRoot = null;
  let detailsPane = null;
  let tabsWrapper = null;
  let contentWrapper = null;
  let JSONFormatter = null;

  const TEXT_CHUNK_SIZE = 5000;

  function init(shadowRootEl, formatter) {
    shadowRoot = shadowRootEl;
    JSONFormatter = window.JSONFormatter; 
  }

  function showRequest(request) {
    if (!detailsPane) {
      detailsPane = shadowRoot.querySelector('#network-details-pane');
      tabsWrapper = detailsPane.querySelector('.network-details-tabs');
      contentWrapper = detailsPane.querySelector('.network-details-content-wrapper');
    }

    detailsPane.classList.remove('hidden');
    renderTabs(request);
    
    contentWrapper.innerHTML = '';
    
    // Headers Tab
    const headersContent = document.createElement('div');
    headersContent.className = 'network-details-content active';
    headersContent.dataset.tabContent = 'headers';
    headersContent.innerHTML = renderHeadersContent(request); 
    contentWrapper.appendChild(headersContent);

    // Other Tabs
    ['preview', 'response', 'timing'].forEach(tabName => {
        const div = document.createElement('div');
        div.className = 'network-details-content';
        div.dataset.tabContent = tabName;
        if (tabName === 'timing') div.innerHTML = renderTimingContent(request);
        contentWrapper.appendChild(div);
    });

    attachTabListeners(request);
  }
  
  function renderTabs(request) {
    const i18n = window.MyDevTool.LanguageManager;
    // i18n for Tab Names
    tabsWrapper.innerHTML = `
      <button class="network-details-tab-btn active" data-tab="headers">${i18n.t('network_details.tabs.headers')}</button>
      <button class="network-details-tab-btn" data-tab="preview">${i18n.t('network_details.tabs.preview')}</button>
      <button class="network-details-tab-btn" data-tab="response">${i18n.t('network_details.tabs.response')}</button>
      <button class="network-details-tab-btn" data-tab="timing">${i18n.t('network_details.tabs.timing')}</button>
    `;
  }

  function attachTabListeners(request) {
    tabsWrapper.querySelectorAll('.network-details-tab-btn').forEach(btn => {
      btn.onclick = (e) => {
        const tabName = e.target.dataset.tab;
        
        tabsWrapper.querySelectorAll('.network-details-tab-btn').forEach(b => b.classList.remove('active'));
        contentWrapper.querySelectorAll('.network-details-content').forEach(c => c.classList.remove('active'));
        
        e.target.classList.add('active');
        const activeContentPane = contentWrapper.querySelector(`[data-tab-content="${tabName}"]`);
        activeContentPane.classList.add('active');
        
        if (tabName === 'response' || tabName === 'preview') {
           loadBodyForTab(request, tabName, activeContentPane);
        }
      };
    });
  }
  
  async function loadBodyForTab(request, tabName, contentPane) {
    const i18n = window.MyDevTool.LanguageManager;
    
    if (request.cachedBodyText) {
       contentPane.innerHTML = ''; 
       renderBodyWithStrategy(contentPane, request.cachedBodyText, tabName, request);
       return;
    }

    if (request.isLoadingBody) return;
    request.isLoadingBody = true;
    contentPane.innerHTML = `<div class="loading-msg">${i18n.t('network_details.messages.loading')}</div>`;

    let bodyText = null;

    try {
      if (request.clonedResponse) {
        bodyText = await request.clonedResponse.text();
      } else if (request.responseText !== undefined) {
        bodyText = request.responseText;
      } else {
        contentPane.innerHTML = `<div class="info-msg">${i18n.t('network_details.messages.no_content')}</div>`;
        request.isLoadingBody = false;
        return;
      }
      
      request.cachedBodyText = bodyText || ''; 

      contentPane.innerHTML = ''; 
      renderBodyWithStrategy(contentPane, request.cachedBodyText, tabName, request);
      
    } catch (e) {
      contentPane.innerHTML = `<div class="error-msg">${i18n.t('network_details.messages.failed_load', {error: e.message})}</div>`;
    } finally {
      request.isLoadingBody = false;
    }
  }

  function renderBodyWithStrategy(container, text, tabName, request) {
      const i18n = window.MyDevTool.LanguageManager;
      
      if (!text) {
          container.innerHTML = `<div class="info-msg">${i18n.t('network_details.messages.empty')}</div>`;
          return;
      }

      const contentType = (request.responseHeaders && request.responseHeaders['content-type']) || '';
      const isJsonType = contentType.includes('json');
      const looksLikeJson = (text.startsWith('{') || text.startsWith('[')) && (text.endsWith('}') || text.endsWith(']'));

      if (tabName === 'preview' && (isJsonType || looksLikeJson)) {
          try {
              const json = JSON.parse(text);
              
              if (JSONFormatter) {
                  const formatter = new JSONFormatter(json, 0, { 
                      hoverPreviewEnabled: true,
                      animateOpen: true, 
                      theme: 'dark'
                  });
                  const el = formatter.render();
                  el.style.fontSize = '12px';
                  el.style.fontFamily = 'monospace';
                  container.appendChild(el);
              } else {
                  container.innerHTML = `<pre>${escapeHtml(JSON.stringify(json, null, 2))}</pre>`;
              }
              return;

          } catch (e) {
              console.warn("JSON Parse Error in Preview:", e);
          }
      }

      createLazyTextViewer(container, text);
  }

  function createLazyTextViewer(container, fullText) {
      const i18n = window.MyDevTool.LanguageManager;
      
      const wrapper = document.createElement('pre');
      wrapper.className = 'text-viewer-container';
      wrapper.style.whiteSpace = 'pre-wrap';
      wrapper.style.wordBreak = 'break-all';
      wrapper.style.fontFamily = 'monospace';
      wrapper.style.margin = '0';
      wrapper.style.padding = '10px';
      
      const totalLen = fullText.length;
      let currentPos = 0;

      const renderChunk = () => {
          const btn = wrapper.querySelector('.text-load-more-btn');
          if (btn) btn.remove();

          const end = Math.min(currentPos + TEXT_CHUNK_SIZE, totalLen);
          const chunk = fullText.slice(currentPos, end);
          
          const span = document.createElement('span');
          span.textContent = chunk;
          wrapper.appendChild(span);

          currentPos = end;

          if (currentPos < totalLen) {
              const remaining = totalLen - currentPos;
              const moreBtn = document.createElement('button');
              moreBtn.className = 'text-load-more-btn';
              moreBtn.textContent = i18n.t('network_details.messages.show_more', {remaining: (remaining/1024).toFixed(1)});
              moreBtn.style.cssText = `
                  display: block;
                  margin: 10px 0;
                  padding: 5px 10px;
                  cursor: pointer;
                  background: var(--dt-bg-active);
                  border: 1px solid var(--dt-border-color);
                  color: var(--dt-text-primary);
                  border-radius: 4px;
              `;
              moreBtn.onclick = () => {
                  renderChunk();
              };
              wrapper.appendChild(moreBtn);
          }
      };

      renderChunk();
      container.appendChild(wrapper);
  }

  // --- Headers Section ---
  
  function renderHeadersContent(request) {
    const i18n = window.MyDevTool.LanguageManager;
    let html = '';
    
    html += renderGeneralSection(request);

    const resHeaders = request.responseHeaders || {};
    html += renderHeaderSection(i18n.t('network_details.sections.response_headers'), resHeaders);

    const reqHeaders = request.requestHeaders || {};
    html += renderHeaderSection(i18n.t('network_details.sections.request_headers'), reqHeaders);

    if (request.requestBody) {
         html += renderPayloadSection(request.requestBody);
    }
    return html;
  }

  function renderGeneralSection(request) {
    const i18n = window.MyDevTool.LanguageManager;
    
    let statusColor = 'status-green';
    if (request.status >= 400) statusColor = 'status-red';
    else if (request.status >= 300) statusColor = 'status-yellow';
    
    const statusText = request.statusText ? ` ${request.statusText}` : '';
    const statusHtml = `<span class="status-circle ${statusColor}"></span>${request.status}${statusText}`;
    
    const generalData = {
        [i18n.t('network_details.general.request_url')]: request.url,
        [i18n.t('network_details.general.request_method')]: request.method,
        [i18n.t('network_details.general.status_code')]: statusHtml,
        [i18n.t('network_details.general.referrer_policy')]: "strict-origin-when-cross-origin"
    };

    return `
      <div class="header-section">
        <details open>
          <summary>${i18n.t('network_details.sections.general')}</summary>
          ${Object.entries(generalData).map(([key, val]) => `
            <div class="header-row">
              <div class="header-key">${key}:</div>
              <div class="header-val">${val}</div>
            </div>
          `).join('')}
        </details>
      </div>
    `;
  }

  function renderHeaderSection(title, headers) {
    const i18n = window.MyDevTool.LanguageManager;
    const keys = headers ? Object.keys(headers) : [];
    const count = keys.length;
    const sortedKeys = keys.sort((a, b) => a.localeCompare(b));

    let content = '';
    if (count === 0) {
        content = `<div class="header-empty">(${i18n.t('network_details.messages.no_headers')})</div>`;
    } else {
        content = sortedKeys.map(key => `
            <div class="header-row">
              <div class="header-key">${key}:</div>
              <div class="header-val">${headers[key]}</div>
            </div>
        `).join('');
    }

    return `
      <div class="header-section">
        <details open>
          <summary>${title} (${count})</summary>
          ${content}
        </details>
      </div>
    `;
  }
  
  function renderPayloadSection(body) {
      const i18n = window.MyDevTool.LanguageManager;
      let content = '';
      if (typeof body === 'string') {
          content = `<div class="header-val" style="white-space: pre-wrap; font-family: monospace;">${escapeHtml(body)}</div>`;
      } else {
          content = `<div class="header-val">[${i18n.t('network_details.messages.binary_data')}]</div>`;
      }

      return `
      <div class="header-section">
        <details>
          <summary>${i18n.t('network_details.sections.request_payload')}</summary>
          <div style="padding: 10px 25px;">${content}</div>
        </details>
      </div>
      `;
  }

  function renderTimingContent(request) {
    const i18n = window.MyDevTool.LanguageManager;
    
    if (!request.timingData) {
        return `<pre style="padding:10px;">${i18n.t('network_details.messages.timing_unavailable')}</pre>`;
    }
    const timing = request.timingData;
    const startTime = timing.startTime;
    const dur = (start, end) => (end > start ? (end - start).toFixed(2) + ' ms' : '0 ms');

    const timingData = {
          [i18n.t('network_details.timing.start_time')]: `${startTime.toFixed(2)} ms`,
          [i18n.t('network_details.timing.dns_lookup')]: dur(timing.domainLookupStart, timing.domainLookupEnd),
          [i18n.t('network_details.timing.tcp_connect')]: dur(timing.connectStart, timing.connectEnd),
          [i18n.t('network_details.timing.ssl')]: timing.secureConnectionStart > 0 ? dur(timing.secureConnectionStart, timing.connectEnd) : 'N/A',
          [i18n.t('network_details.timing.ttfb')]: dur(timing.requestStart, timing.responseStart),
          [i18n.t('network_details.timing.content_download')]: dur(timing.responseStart, timing.responseEnd),
          [i18n.t('network_details.timing.total')]: `${timing.duration.toFixed(2)} ms`
    };

    return `
      <div class="header-section">
        <details open>
            <summary>${i18n.t('network_details.tabs.timing')}</summary>
            ${Object.entries(timingData).map(([key, val]) => `
                <div class="header-row">
                <div class="header-key">${key}:</div>
                <div class="header-val">${val}</div>
                </div>
            `).join('')}
        </details>
      </div>
    `;
  }
  
  function escapeHtml(text) {
    if (text === null || text === undefined) return 'N/A';
    return text.toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }

  return {
    init,
    showRequest
  };

})();