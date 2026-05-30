// src/modules/source/SourcePageTree.js

window.MyDevTool = window.MyDevTool || {};
window.MyDevTool.SourcePageTree = (function () {

  let container = null;
  let SVGs = null;
  let observer = null;
  let currentCategory = 'page'; 

  // Stream Extensions
  const EXTENSIONS = {
      images: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp', 'avif'],
      videos: ['mp4', 'webm', 'ogg', 'mov', 'mkv', 'flv', 'm3u8', 'mpd', 'ts', 'm4s'],
      musics: ['mp3', 'wav', 'm4a', 'aac', 'flac'],
      docs: ['js', 'css', 'html', 'htm', 'json', 'txt', 'md', 'xml']
  };

  function init(containerEl) {
    container = containerEl;
    SVGs = window.MyDevTool.SVGs;
    if (!SVGs) return;
    
    loadResources();
    
    if (window.PerformanceObserver) {
      observer = new PerformanceObserver(() => { loadResources(); });
      observer.observe({ entryTypes: ['resource'] });
    }
  }

  function setCategory(category) {
      currentCategory = category;
      loadResources();
  }

  function loadResources() {
    if (!container) return;

    let rawResources = performance.getEntriesByType('resource').map(r => r.name);
    rawResources.unshift(window.location.href);

    const uniqueSet = new Set();
    let resources = rawResources.filter(url => {
        const cleanUrl = url.split('?')[0]; 
        if (uniqueSet.has(cleanUrl)) return false;
        uniqueSet.add(cleanUrl);
        return true;
    });

    // Filter by Category
    if (currentCategory !== 'page') {
        resources = resources.filter(url => {
            const cleanUrl = url.split('?')[0].split('#')[0];
            const ext = cleanUrl.split('.').pop().toLowerCase();
            
            if (currentCategory === 'others') {
                const allKnown = [...EXTENSIONS.images, ...EXTENSIONS.videos, ...EXTENSIONS.musics, ...EXTENSIONS.docs];
                return !allKnown.includes(ext);
            } else {
                return EXTENSIONS[currentCategory].includes(ext);
            }
        });
    }

    container.innerHTML = ''; 
    container.classList.add('source-file-tree');
    
    if (resources.length === 0) {
        container.innerHTML = `<div style="padding:10px; color:var(--dt-text-secondary); font-size:12px; text-align:center;">No ${currentCategory} found</div>`;
        return;
    }

    if (currentCategory === 'page') {
        const resourceTree = buildTreeFromResources(resources);
        renderTree(resourceTree, container);
    } else {
        renderFlatList(resources, container);
    }
    
    const prevUrl = container.getAttribute('data-prev-select');
    if (prevUrl) selectFile(prevUrl);
  }

  function renderFlatList(urls, parent) {
      const ul = document.createElement('ul');
      ul.style.paddingLeft = '5px'; 

      urls.forEach(url => {
          const fileName = url.split('/').pop().split('?')[0] || 'unknown';
          const li = document.createElement('li');
          
          const itemDiv = document.createElement('div');
          itemDiv.className = 'source-file-tree-item';
          itemDiv.dataset.url = url;
          itemDiv.dataset.type = 'file';

          const fileIcon = document.createElement('span');
          fileIcon.innerHTML = getFileIcon(fileName, SVGs);
          fileIcon.style.marginRight = '6px';
          
          const nameSpan = document.createElement('span');
          nameSpan.textContent = fileName;
          nameSpan.title = url;

          itemDiv.appendChild(fileIcon);
          itemDiv.appendChild(nameSpan);
          li.appendChild(itemDiv);
          ul.appendChild(li);
      });
      parent.appendChild(ul);
  }

  function buildTreeFromResources(resources) {
    const tree = { children: {} };
    resources.forEach(url => {
      try {
        const parsedUrl = new URL(url);
        const origin = parsedUrl.origin;
        const pathSegments = parsedUrl.pathname.split('/').filter(Boolean); 
        if (parsedUrl.pathname.includes('sc-dt.core.js') || parsedUrl.pathname.includes('devtool-sw.js')) return; 

        let currentLevel = tree.children;
        if (!currentLevel[origin]) {
          currentLevel[origin] = { name: origin, type: 'domain', children: {} };
        }
        currentLevel = currentLevel[origin].children;

        pathSegments.forEach((segment, index) => {
          if (index === pathSegments.length - 1) {
            currentLevel[segment] = { name: segment, type: 'file', url: url, children: {} };
          } else {
            if (!currentLevel[segment]) {
              currentLevel[segment] = { name: segment, type: 'folder', children: {} };
            }
            currentLevel = currentLevel[segment].children;
          }
        });
      } catch (e) {}
    });
    return tree;
  }

  function renderTree(node, parentElement) {
    const ul = document.createElement('ul');
    const sortedKeys = Object.keys(node.children).sort((a, b) => {
        const aNode = node.children[a];
        const bNode = node.children[b];
        if (aNode.type === 'folder' && bNode.type === 'file') return -1;
        if (aNode.type === 'file' && bNode.type === 'folder') return 1;
        return a.localeCompare(b);
    });

    for (const key of sortedKeys) {
      const childNode = node.children[key];
      const li = document.createElement('li');
      const itemDiv = document.createElement('div');
      itemDiv.className = 'source-file-tree-item';
      
      const isFolder = childNode.type === 'folder' || childNode.type === 'domain';
      const isFile = childNode.type === 'file';

      if (isFolder) {
        const toggleIcon = document.createElement('svg');
        toggleIcon.className = 'toggle';
        toggleIcon.setAttribute('viewBox', '0 0 24 24');
        toggleIcon.innerHTML = `<path d="M7 10l5 5 5-5z"></path>`;
        itemDiv.appendChild(toggleIcon);
      } else {
         const spacer = document.createElement('span');
         spacer.className = 'toggle-spacer';
         spacer.style.width = '16px'; 
         itemDiv.appendChild(spacer);
      }

      const fileIcon = document.createElement('span');
      fileIcon.innerHTML = isFolder ? SVGs.folderClosed : getFileIcon(childNode.name, SVGs);
      itemDiv.appendChild(fileIcon);
      
      const nameSpan = document.createElement('span');
      nameSpan.textContent = childNode.name;
      itemDiv.appendChild(nameSpan);

      li.appendChild(itemDiv);

      if (isFile) {
        itemDiv.dataset.url = childNode.url;
        itemDiv.dataset.type = 'file';
      }

      if (isFolder && Object.keys(childNode.children).length > 0) {
        itemDiv.classList.add('open'); 
        renderTree(childNode, li); 
      }
      ul.appendChild(li);
    }
    parentElement.appendChild(ul);
  }

  function getFileIcon(filename, SVGs) {
      const ext = filename.split('.').pop().toLowerCase();
      
      const svgBase = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" `;
      
      if (['png','jpg','jpeg','gif','svg', 'webp', 'ico', 'bmp', 'avif'].includes(ext)) {
          return SVGs.image || `${svgBase} stroke="#a074c4"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;
      }
      
      if (['mp4','webm','mkv','mov', 'ogg', 'flv'].includes(ext)) {
          return `${svgBase} stroke="#ff8585"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>`;
      }
      
      if (['m3u8','mpd'].includes(ext)) {
          return `${svgBase} stroke="#ff9d00"><path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle></svg>`;
      }
      
      if (['ts','m4s'].includes(ext)) {
          return `${svgBase} stroke="#d7ba7d"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`;
      }
      
      if (['mp3','wav','m4a', 'aac', 'flac'].includes(ext)) {
          return `${svgBase} stroke="#85b9ff"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`;
      }
      
      if (['js'].includes(ext)) {
          return SVGs.file || `${svgBase} stroke="#f1e05a"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
      }
      
      if (['css'].includes(ext)) {
          return `${svgBase} stroke="#519aba"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>`;
      }
      
      if (['html', 'htm'].includes(ext)) {
          return `${svgBase} stroke="#e34c26"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`;
      }

      if (['json'].includes(ext)) {
          return `${svgBase} stroke="#cbcb41"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M10 12a2 2 0 1 0 4 0 2 2 0 1 0-4 0"></path><path d="M10 16a2 2 0 1 0 4 0 2 2 0 1 0-4 0"></path></svg>`;
      }
      
      return SVGs.file || `${svgBase} stroke="#888888"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`;
  }
  
  function selectFile(url) {
    if (!container) return;
    container.setAttribute('data-prev-select', url);
    const prev = container.querySelector('.source-file-tree-item.selected');
    if (prev) prev.classList.remove('selected');
    const newItem = container.querySelector(`.source-file-tree-item[data-url="${url}"]`);
    if (newItem) {
        newItem.classList.add('selected');
        newItem.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  return { init, selectFile, setCategory };
})();