// BreadcrumbBar.js
window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.BreadcrumbBar = (function() {

  let shadowRoot = null;
  let barContainer = null;
  let contentArea = null;
  let leftBtn = null;
  let rightBtn = null;
  let SVGs = null;
  
  function init(container, root) {
    shadowRoot = root;
    barContainer = container;
    SVGs = window.MyDevTool.SVGs;
    
    barContainer.className = 'breadcrumb-bar';
    
    barContainer.innerHTML = `
        <button class="breadcrumb-scroll left">${SVGs.rightArrowSVG || '❮'}</button>
        <div class="breadcrumb-content"></div>
        <button class="breadcrumb-scroll right">${SVGs.leftArrowSVG || '❯'}</button>
    `;
    
    contentArea = barContainer.querySelector('.breadcrumb-content');
    leftBtn = barContainer.querySelector('.left');
    rightBtn = barContainer.querySelector('.right');
    
    leftBtn.onclick = () => {
      contentArea.scrollLeft -= 75; 
    };
    rightBtn.onclick = () => {
      contentArea.scrollLeft += 75; 
    };
  }

  function getCrumbName(element) {
    const tagName = element.tagName.toLowerCase();
    const devtoolStateClass = (cls) => !cls.startsWith('__devtool-state-');
    
    const id = element.id ? `#${element.id}` : '';
    const classes = Array.from(element.classList)
                         .filter(devtoolStateClass)
                         .map(c => `.${c}`)
                         .join('');
                         
    return `<span class="crumb-tag">${tagName}</span><span class="crumb-id">${id}</span><span class="crumb-class">${classes}</span>`;
  }

  function update(element) {
    if (!contentArea || !element) return;
    
    contentArea.innerHTML = '';
    
    let path = [];
    let current = element;
    
    while (current && current.tagName) { 
        path.push(current);
        if (current.tagName === 'HTML') break;
        current = current.parentElement;
    }
    
    path.reverse(); 
    
    for (let i = 0; i < path.length; i++) {
      const node = path[i];

      const crumbSpan = document.createElement('span');
      crumbSpan.className = 'crumb-item'; 
      
      if (i === path.length - 1) {
        crumbSpan.classList.add('selected-crumb');
      }
      
      crumbSpan.innerHTML = getCrumbName(node);
      
      crumbSpan.onclick = () => {
        window.MyDevTool.DomTree.selectElement(node, null, null, null);
      };
      
      contentArea.appendChild(crumbSpan);

      if (i < path.length - 1) {
        const separator = document.createElement('span');
        separator.className = 'crumb-separator';
        separator.innerHTML = '&nbsp;'; 
        contentArea.appendChild(separator);
      }
    }
    contentArea.scrollLeft = contentArea.scrollWidth;
  }

  return {
    init: init,
    update: update
  };

})();