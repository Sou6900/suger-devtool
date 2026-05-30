// src/modules/reusable/ContextMenu.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.ContextMenu = (function() {

  let shadowRoot = null;

  function init(root) {
    shadowRoot = root;
  }

  function getAppendTarget() {
    return shadowRoot.querySelector('.devtool-container') || shadowRoot;
  }

  function show(event, options) {
    event.preventDefault();
    event.stopPropagation();
    
    close();

    const menu = document.createElement('div');
    menu.className = 'context-menu';

    populateMenu(menu, options);

    const x = event.clientX;
    const y = event.clientY;
    
    menu.style.visibility = 'hidden';
    
    const parent = getAppendTarget();
    parent.appendChild(menu);
    
    const rect = menu.getBoundingClientRect();
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    
    let top = y;
    let left = x;
    
    if (x + rect.width > winW) {
        left = x - rect.width;
    }
    if (y + rect.height > winH) {
        top = y - rect.height;
    }
    
    if (top < 0) top = 0;
    
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    menu.style.visibility = 'visible';

    shadowRoot.addEventListener('click', closeOnOutside, true);
  }

  function populateMenu(menuElement, options) {
    options.forEach(item => {
      if (item.type === 'separator') {
        menuElement.appendChild(document.createElement('hr'));
        return;
      }

      const menuItem = document.createElement('div');
      menuItem.className = 'menu-item';

      // Checkbox logic
      const checkSpan = document.createElement('span');
      checkSpan.className = 'menu-check';
      if (item.checked) checkSpan.innerHTML = '&#10003;'; // ✓
      menuItem.appendChild(checkSpan); 

      // Label
      const labelSpan = document.createElement('span');
      labelSpan.className = 'menu-label';
      labelSpan.textContent = item.label;
      menuItem.appendChild(labelSpan);

      if (item.sub && item.sub.length > 0) {
        const arrowSpan = document.createElement('span');
        arrowSpan.className = 'menu-arrow';
        arrowSpan.innerHTML = '&#9656;'; // ▶
        menuItem.appendChild(arrowSpan);
        
        menuItem.onclick = (e) => {
          e.stopPropagation();
          
          if (menuItem.classList.contains('expanded')) {
             closeSubMenu(menuItem);
             return;
          }

          const siblings = menuElement.querySelectorAll('.menu-item.expanded');
          siblings.forEach(sib => closeSubMenu(sib));

          menuItem.classList.add('expanded');
          
          const subMenu = document.createElement('div');
          subMenu.className = 'context-menu sub-menu';
          populateMenu(subMenu, item.sub);
          
          subMenu.style.visibility = 'hidden';
          const parent = getAppendTarget();
          parent.appendChild(subMenu);
          
          const itemRect = menuItem.getBoundingClientRect();
          const subRect = subMenu.getBoundingClientRect();
          const winW = window.innerWidth;
          const winH = window.innerHeight;
          
          let subLeft = itemRect.right - 2; 
          
          if (subLeft + subRect.width > winW) {
              subLeft = itemRect.left - subRect.width + 2;
          }
        
          let subTop = itemRect.top - 4; 
          
          if (subTop + subRect.height > winH) {
              subTop = winH - subRect.height - 5;
          }
          
          if (subLeft < 0) subLeft = 0; 
          if (subTop < 0) subTop = 0;

          subMenu.style.left = `${subLeft}px`;
          subMenu.style.top = `${subTop}px`;
          subMenu.style.visibility = 'visible';
          
          menuItem._subMenuEl = subMenu;
        };

      } else {
        menuItem.onclick = (e) => {
          e.stopPropagation();
          if (item.callback) item.callback();
          close();
        };
      }
      
      menuElement.appendChild(menuItem);
    });
  }

  function closeSubMenu(menuItem) {
      if (menuItem._subMenuEl) {
          menuItem._subMenuEl.remove();
          menuItem._subMenuEl = null;
      }
      menuItem.classList.remove('expanded');
  }

  function close() {
    shadowRoot.querySelectorAll('.context-menu').forEach(el => el.remove());
    shadowRoot.removeEventListener('click', closeOnOutside, true);
  }

  function closeOnOutside(event) {
    if (!event.target.closest('.context-menu')) {
      close();
    }
  }

  return { init, show };
})();