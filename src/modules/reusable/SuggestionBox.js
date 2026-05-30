// src/modules/reusable/SuggestionBox.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.SuggestionBox = (function() {

  let boxElement = null;
  let currentAnchorSpan = null;
  let currentSuggestions = [];
  let currentOnSelectCallback = null;
  let selectedIndex = 0;
  let shadowRoot = null; 

  function init(root) {
    shadowRoot = root; 
    const container = shadowRoot.querySelector('.devtool-container');
    
    boxElement = document.createElement('div');
    boxElement.className = 'suggestion-box';
    boxElement.style.display = 'none'; 

    if (container) {
      container.appendChild(boxElement);
    } else {
      shadowRoot.appendChild(boxElement);
    }
  }

  // suggestions: Array of strings OR objects { text, value, isColor }
  function show(anchorSpan, suggestions, onSelectCallback) {
    if (!suggestions || suggestions.length === 0) {
      hide();
      return;
    }

    currentAnchorSpan = anchorSpan;
    currentSuggestions = suggestions;
    currentOnSelectCallback = onSelectCallback;
    selectedIndex = 0; 

    boxElement.innerHTML = '';

    suggestions.forEach((itemData, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'suggestion-item';
      
      // Handle both Object and String formats
      const text = typeof itemData === 'object' ? itemData.text : itemData;
      const rightLabel = (typeof itemData === 'object' && itemData.value) ? itemData.value : '';
      const isColor = (typeof itemData === 'object' && itemData.isColor);

      // Left Side: Text
      const textSpan = document.createElement('span');
      textSpan.className = 'suggestion-text';
      textSpan.textContent = text;
      itemDiv.appendChild(textSpan);

      // Right Side: Value & Color
      if (rightLabel || isColor) {
          const rightDiv = document.createElement('div');
          rightDiv.className = 'suggestion-right';
          
          const valSpan = document.createElement('span');
          valSpan.className = 'suggestion-value';
          valSpan.textContent = rightLabel;

          if (isColor) {
              const swatch = document.createElement('span');
              swatch.className = 'suggestion-swatch';
              swatch.style.backgroundColor = rightLabel; 
              rightDiv.appendChild(swatch);
          }
          itemDiv.appendChild(rightDiv);
          rightDiv.appendChild(valSpan);
      }
      
      let isScrolling = false;
      let startX = 0;
      let startY = 0;

      itemDiv.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          isScrolling = false;
          startX = e.clientX;
          startY = e.clientY;
      });

      // Touch Move: Detect Scroll
      itemDiv.addEventListener('pointermove', (e) => {
          if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
              isScrolling = true;
          }
      });

      // Touch End: Only Click if nt Scrolling
      itemDiv.addEventListener('pointerup', (e) => {
          if (!isScrolling) {
             e.preventDefault();
             e.stopPropagation();
             selectAndCallback(index);
          }
      });
      
      boxElement.appendChild(itemDiv);
    });

    positionBox(anchorSpan);
    updateHighlight();
    boxElement.style.display = 'block';
  }

  function positionBox(anchorSpan) {
    const rect = anchorSpan.getBoundingClientRect();
    let top = rect.bottom + window.scrollY;
    let left = rect.left + window.scrollX;

    if (boxElement.parentElement) {
        const parentRect = boxElement.parentElement.getBoundingClientRect();
        top = rect.bottom - parentRect.top;
        left = rect.left - parentRect.left;
    }

    boxElement.style.top = `${top}px`;
    boxElement.style.left = `${left}px`;
  }

  function hide() {
    if (boxElement) {
      boxElement.style.display = 'none';
    }
    currentAnchorSpan = null;
    currentSuggestions = [];
    currentOnSelectCallback = null;
    selectedIndex = -1;
  }


  function isVisible() {
      return boxElement && boxElement.style.display !== 'none';
  }

  function handleKeyDown(e) {
    if (!isVisible()) { 
      return false; 
    }

    if (currentSuggestions.length === 0) {
      if (e.key === 'Escape') {
        hide();
        return true;
      }
      return false; 
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % currentSuggestions.length;
        updateHighlight();
        return true; 

      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + currentSuggestions.length) % currentSuggestions.length;
        updateHighlight();
        return true; 

      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < currentSuggestions.length) {
          selectAndCallback(selectedIndex);
          return true; 
        }
        return false; 

      case 'Escape':
        hide();
        return true; 
    }

    return false; 
  }

  function selectAndCallback(index) {
    if (index >= 0 && index < currentSuggestions.length) {
      const itemData = currentSuggestions[index];
      const textValue = typeof itemData === 'object' ? itemData.text : itemData;
      
      if (currentOnSelectCallback) {
        currentOnSelectCallback(textValue, true); 
      }
      
      hide(); 
    }
  }

  function updateHighlight() {
    const items = boxElement.querySelectorAll('.suggestion-item');
    items.forEach((item, index) => {
      if (index === selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }
  
  
  return {
    init: init,
    show: show,
    hide: hide,
    handleKeyDown: handleKeyDown,
    isVisible: isVisible 
  };

})();