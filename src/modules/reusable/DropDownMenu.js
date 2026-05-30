// src/modules/reusable/DropDownMenu.js
window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.DropDownMenu = (function() {

    function create(container, options) {
        const items = options.items || []; // [{label, value, separator?}]
        const onSelect = options.onSelect || (() => {});
        let selectedValue = options.initialValue;

        // Wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'dt-dropdown';

        // Trigger Button
        const trigger = document.createElement('div');
        trigger.className = 'dt-dropdown-trigger';
        
        const updateTriggerText = () => {
            const selectedItem = items.find(i => i.value == selectedValue) || items[0];
            trigger.innerHTML = `<span>${selectedItem ? selectedItem.label : 'Select'}</span> <span class="arrow">▼</span>`;
        };
        updateTriggerText();

        // Menu List
        const menu = document.createElement('div');
        menu.className = 'dt-dropdown-menu';

        // Render Items
        items.forEach(item => {
            if (item.separator) {
                const sep = document.createElement('div');
                sep.className = 'dt-dropdown-separator';
                menu.appendChild(sep);
                return;
            }

            const el = document.createElement('div');
            el.className = 'dt-dropdown-item';
            if (item.value == selectedValue) el.classList.add('selected');
            el.textContent = item.label;
            
            el.onclick = (e) => {
                e.stopPropagation();
                selectedValue = item.value;
                updateTriggerText();
                menu.classList.remove('visible');
                
                // Update selection classes
                Array.from(menu.children).forEach(child => child.classList.remove('selected'));
                el.classList.add('selected');
                
                onSelect(item.value);
            };
            menu.appendChild(el);
        });

        // Toggle Logic
        trigger.onclick = (e) => {
            e.stopPropagation();
            // Close others first
            document.querySelectorAll('.dt-dropdown-menu.visible').forEach(m => {
                if(m !== menu) m.classList.remove('visible');
            });
            menu.classList.toggle('visible');
        };

        // Close on Outside Click
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                menu.classList.remove('visible');
            }
        });

        wrapper.appendChild(trigger);
        wrapper.appendChild(menu);
        container.appendChild(wrapper);

        return {
            setValue: (val) => {
                selectedValue = val;
                updateTriggerText();
                // Update styles in list
                Array.from(menu.children).forEach(child => {
                    child.classList.toggle('selected', child.textContent === items.find(i=>i.value == val)?.label);
                });
            }
        };
    }

    return { create };
})();