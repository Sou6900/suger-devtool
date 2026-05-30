// src/modules/application/ApplicationGrid.js

window.MyDevTool = window.MyDevTool || {};
window.MyDevTool.ApplicationGrid = (function () {
    
    const ICONS = {
        refresh: `<svg width="16" height="16" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>`,
        clear: `<svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/></svg>`,
        delete: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
        check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`,
        checkSmall: `<svg width="12" height="12" viewBox="0 0 24 24" fill="var(--dt-text-secondary)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`
    };

    function formatJson(val) {
        try {
            const obj = JSON.parse(val);
            return JSON.stringify(obj, null, 2);
        } catch (e) { return val; }
    }

    function escapeHtml(text) {
        if (text === undefined || text === null) return '';
        return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function render(containerEl, data, callbacks, columns = null) {
        const i18n = window.MyDevTool.LanguageManager;
        const currentOrigin = window.location.origin;
        const safeData = Array.isArray(data) ? data : [];

        const defaultCols = [
            { id: 'key', name: i18n.t('common.key'), width: 150 },
            { id: 'value', name: i18n.t('common.value'), width: 300 }
        ];
        
        const cols = columns || defaultCols;
        const isCookieTable = !!columns;

        containerEl.innerHTML = `
            <div class="app-top-header">
                <div class="app-header-info">
                    <span class="app-header-label" style="color:var(--dt-text-secondary); margin-right:5px;">${i18n.t('common.origin')}:</span>
                    <span class="app-header-value" style="color:var(--dt-text-primary);">${currentOrigin}</span>
                </div>
            </div>
            <div class="app-toolbar">
                <input type="text" class="app-filter-input" placeholder="${i18n.t('common.filter')}">
                <div class="app-toolbar-sep"></div>
                <button class="app-toolbar-btn" id="grid-refresh" title="${i18n.t('common.refresh')}">${ICONS.refresh}</button>
                <button class="app-toolbar-btn" id="grid-clear" title="${i18n.t('common.clear')}">${ICONS.clear}</button>
                <div class="app-toolbar-sep"></div>
                
                <button class="app-toolbar-btn delete-btn" id="grid-delete-selected" title="${i18n.t('common.delete')}">
                    <span class="btn-icon">${ICONS.delete}</span>
                </button>
            </div>
            
            <div class="app-content-area">
                <div class="app-table-panel" id="app-table-panel">
                    <div class="app-datagrid-container">
                        <table class="app-table ${isCookieTable ? 'cookie-table' : ''}" id="app-grid-table">
                            <thead>
                                <tr>
                                    ${cols.map((c, i) => `
                                        <th style="width: ${c.width}px" data-col-index="${i}">
                                            <span class="th-content">${c.name}</span>
                                            <div class="col-resizer"></div>
                                        </th>
                                    `).join('')}
                                </tr>
                            </thead>
                            <tbody id="grid-tbody">
                                ${safeData.map(item => `
                                    <tr data-key="${escapeHtml(item.key)}">
                                        ${cols.map(c => {
                                            let content = item[c.id];
                                            if ((c.id === 'secure' || c.id === 'httpOnly') && content === true) {
                                                content = `<div style="text-align:center">${ICONS.checkSmall}</div>`;
                                            } else {
                                                content = escapeHtml(String(content || ''));
                                            }
                                            return `<td class="editable-cell" data-col="${c.id}">${content}</td>`;
                                        }).join('')}
                                    </tr>
                                `).join('')}
                                ${!isCookieTable ? `<tr class="add-new-row"><td class="new-key-cell" data-col="key" contenteditable="true" placeholder="${i18n.t('common.key')}"></td><td class="new-val-cell" data-col="value" contenteditable="true" placeholder="${i18n.t('common.value')}"></td></tr>` : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="app-horizontal-splitter" id="app-h-splitter"></div>
                <div class="app-preview-panel hidden" id="app-preview-panel"></div>
            </div>
        `;

        const tablePanel = containerEl.querySelector('#app-table-panel');
        const table = containerEl.querySelector('#app-grid-table');
        const tbody = containerEl.querySelector('#grid-tbody');
        const previewPanel = containerEl.querySelector('#app-preview-panel');
        let selectedRow = null;

        enableColumnResizing(table, tablePanel);

        containerEl.querySelector('#grid-refresh').onclick = callbacks.onRefresh;
        containerEl.querySelector('#grid-clear').onclick = callbacks.onClear;
        
        const deleteBtn = containerEl.querySelector('#grid-delete-selected');
        let deleteState = 'idle'; // idle | confirming

        deleteBtn.onclick = (e) => {
            e.stopPropagation(); 
            if (!selectedRow) return;

            if (deleteState === 'idle') {
                // Warning State
                deleteState = 'confirming';
                deleteBtn.classList.add('btn-warning');
            } else if (deleteState === 'confirming') {
                // Action State
                const key = selectedRow.dataset.key;
                if (key) {
                    deleteBtn.classList.remove('btn-warning');
                    deleteBtn.classList.add('btn-success');
                    deleteBtn.innerHTML = `<span class="btn-icon">${ICONS.check}</span>`;
                    
                    callbacks.onDelete(key);
                    selectedRow = null;
                    previewPanel.classList.add('hidden');
                    
                    setTimeout(() => {
                        resetDeleteButton();
                    }, 800);
                }
            }
        };

        function resetDeleteButton() {
            deleteState = 'idle';
            deleteBtn.classList.remove('btn-warning', 'btn-success');
            deleteBtn.innerHTML = `<span class="btn-icon">${ICONS.delete}</span>`;
        }

        document.addEventListener('click', (e) => {
            if (deleteState === 'confirming' && !deleteBtn.contains(e.target)) {
                resetDeleteButton();
            }
            if (!e.target.closest('th') && !e.target.classList.contains('col-resizer')) {
                table.querySelectorAll('th').forEach(h => h.classList.remove('header-focused'));
                tablePanel.classList.remove('scroll-locked');
            }
        });

        // --- Filter ---
        containerEl.querySelector('.app-filter-input').oninput = (e) => {
            const term = e.target.value.toLowerCase();
            tbody.querySelectorAll('tr:not(.add-new-row)').forEach(row => {
                row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'table-row';
            });
        };

        // --- Row Selection ---
        tbody.addEventListener('click', (e) => {
            const row = e.target.closest('tr:not(.add-new-row)');
            if (row) {
                if (selectedRow) selectedRow.classList.remove('selected');
                selectedRow = row;
                selectedRow.classList.add('selected');
                
                resetDeleteButton();

                const valueCell = row.querySelector('[data-col="value"]');
                const val = valueCell ? valueCell.innerText : '';
                
                if (window.JSONFormatter) {
                    try {
                        const json = JSON.parse(val);
                        const formatter = new window.JSONFormatter(json, 1, {theme: 'dark'});
                        previewPanel.innerHTML = '';
                        previewPanel.appendChild(formatter.render());
                    } catch(e) { previewPanel.innerText = val; }
                } else { previewPanel.innerText = formatJson(val); }
                previewPanel.classList.remove('hidden');
            }
        });
        
        // edit
        tbody.addEventListener('dblclick', (e) => {
            const cell = e.target.closest('.editable-cell');
            const row = e.target.closest('tr');
            
            if (!cell || !row || row.classList.contains('add-new-row')) return;

            const colId = cell.dataset.col;
            if (colId !== 'key' && colId !== 'value') return;
            if (cell.isContentEditable) return;

            const originalContent = cell.innerText;
            cell.contentEditable = 'true';
            cell.focus();
            
            document.execCommand('selectAll', false, null);
            cell.classList.add('is-editing');

            const finishEdit = () => {
                cell.contentEditable = 'false';
                cell.classList.remove('is-editing');
                const newContent = cell.innerText;

                if (newContent !== originalContent) {
                    const oldKey = row.dataset.key;
                    let newKey = oldKey;
                    let newVal = row.querySelector('[data-col="value"]').innerText;

                    if (colId === 'key') {
                        newKey = newContent;
                    } else if (colId === 'value') {
                        newVal = newContent;
                    }

                    if (callbacks.onEdit) {
                        callbacks.onEdit(oldKey, newKey, newVal, colId === 'key');
                    }
                }
            };

            cell.addEventListener('blur', finishEdit, { once: true });
            cell.addEventListener('keydown', (ev) => {
                if (ev.key === 'Enter') {
                    ev.preventDefault();
                    cell.blur();
                }
            });
        });

        // add new row
        const newRow = tbody.querySelector('.add-new-row');
        if (newRow) {
            newRow.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const keyCell = newRow.querySelector('.new-key-cell');
                    const valCell = newRow.querySelector('.new-val-cell');
                    
                    const key = keyCell.innerText.trim();
                    const val = valCell.innerText.trim();

                    if (key) {
                        if (callbacks.onAdd) {
                            callbacks.onAdd(key, val);
                        }
                        keyCell.innerText = '';
                        valCell.innerText = '';
                        keyCell.focus();
                    }
                }
            });
        }

        // --- Header Click ---
        table.querySelectorAll('th').forEach(th => {
            th.addEventListener('click', (e) => {
                if (e.target.classList.contains('col-resizer')) return;
                table.querySelectorAll('th').forEach(h => h.classList.remove('header-focused'));
                th.classList.add('header-focused');
                tablePanel.classList.add('scroll-locked');
            });
        });

        // --- Resize Logic ---
        attachHorizontalSplitter(containerEl);
    }

    function enableColumnResizing(table, container) {
        let currentResizer, startX, startWidth, col;

        table.querySelectorAll('.col-resizer').forEach(resizer => {
            resizer.addEventListener('mousedown', onMouseDown);
            resizer.addEventListener('touchstart', onMouseDown, {passive: false});
        });

        function onMouseDown(e) {
            e.preventDefault();
            currentResizer = e.target;
            col = currentResizer.parentElement;
            startX = e.touches ? e.touches[0].clientX : e.clientX;
            startWidth = col.offsetWidth;

            currentResizer.classList.add('resizing');
            document.body.style.cursor = 'col-resize';
            container.classList.add('scroll-locked');

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
            window.addEventListener('touchmove', onMouseMove, {passive: false});
            window.addEventListener('touchend', onMouseUp);
        }

        function onMouseMove(e) {
            if (!currentResizer) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const dx = clientX - startX;
            let newWidth = Math.max(startWidth + dx, 30);
            col.style.width = `${newWidth}px`;
        }

        function onMouseUp() {
            if (currentResizer) {
                currentResizer.classList.remove('resizing');
                currentResizer = null;
                document.body.style.cursor = '';
                if (!table.querySelector('.header-focused')) {
                    container.classList.remove('scroll-locked');
                }
            }
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onMouseMove);
            window.removeEventListener('touchend', onMouseUp);
        }
    }
    
    // Splitter
    function attachHorizontalSplitter(containerEl) {
        const splitter = containerEl.querySelector('#app-h-splitter');
        const previewPanel = containerEl.querySelector('.app-preview-panel');
        const contentArea = containerEl.querySelector('.app-content-area');
        
        let isDragging = false;
        let startY, startHeight;
        
        splitter.addEventListener('pointerdown', (e) => {
            isDragging = true;
            startY = e.clientY;
            startHeight = previewPanel.offsetHeight;
            splitter.classList.add('is-dragging');
            document.body.style.cursor = 'row-resize';
            splitter.setPointerCapture(e.pointerId);
            e.preventDefault();
        });
        
        splitter.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const deltaY = startY - e.clientY;
            let newHeight = startHeight + deltaY;
            const totalHeight = contentArea.clientHeight;
            if (newHeight < 30) newHeight = 30;
            if (newHeight > totalHeight - 50) newHeight = totalHeight - 50;
            requestAnimationFrame(() => {
                previewPanel.style.height = `${newHeight}px`;
            });
        });
        
        splitter.addEventListener('pointerup', (e) => {
            isDragging = false;
            splitter.classList.remove('is-dragging');
            document.body.style.cursor = '';
            splitter.releasePointerCapture(e.pointerId);
        });
    }

    return { render };
})();