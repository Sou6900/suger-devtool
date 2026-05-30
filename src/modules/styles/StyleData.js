window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.StyleData = (function() {

  /**
   * Parse raw CSS text properties
   */
  function parseCssProperties(rawCss) {
    if (!rawCss) return [];
    const properties = [];
    rawCss.split(';').forEach(prop => {
        if (prop.trim() === '') return;
        const parts = prop.split(':');
        if (parts.length >= 2) {
            const propName = parts[0].trim();
            const propValue = parts.slice(1).join(':').trim(); 
            properties.push({ name: propName, value: propValue });
        }
    });
    return properties;
  }

  /**
   * Determine rule source (Filename, User Agent, or Inspector)
   */
  function getRuleSource(rule) {
    if (!rule || !rule.parentStyleSheet) {
      if (rule && rule.rule && rule.rule.parentStyleSheet) {
        rule = rule.rule; 
      } else {
        return '<style>'; 
      }
    }
    
    // Check if it's our inspector stylesheet
    const ownerNode = rule.parentStyleSheet.ownerNode;
    if (ownerNode && (ownerNode.id === 'my-devtool-styles' || ownerNode.id === 'dt-shadow-inspector-styles')) {
        return 'inspector-stylesheet';
    }

    if (rule.parentStyleSheet.href) {
      try {
        const url = new URL(rule.parentStyleSheet.href);
        return url.pathname.split('/').pop() || 'stylesheet';
      } catch(e) {
        return rule.parentStyleSheet.href;
      }
    }
    
    if (ownerNode && ownerNode.tagName === 'STYLE') {
      return '<style>';
    }
    
    return 'user agent stylesheet';
  }
  
  /**
   * Get or Create Stylesheet based on Context (Light vs Shadow vs Iframe)
   */
  function getOrCreateDevToolStylesheet(element) {
    // 1. Identify the root (Document or ShadowRoot)
    const root = element ? element.getRootNode() : document;
    
    const doc = (element && element.ownerDocument) ? element.ownerDocument : document;

    // 2. Handle Shadow DOM Context
    if (root instanceof ShadowRoot) {
        let styleEl = root.getElementById('dt-shadow-inspector-styles');
        if (!styleEl) {
            styleEl = doc.createElement('style');
            styleEl.id = 'dt-shadow-inspector-styles';
            styleEl.appendChild(doc.createTextNode(' '));
            root.appendChild(styleEl);
        }
        return styleEl.sheet;
    } 
    
    // 3. Handle Normal Document/Iframe Context
    else {
        let styleEl = doc.getElementById('my-devtool-styles');
        if (!styleEl) {
            styleEl = doc.createElement('style');
            styleEl.id = 'my-devtool-styles';
            styleEl.appendChild(doc.createTextNode(' '));
            
            if (doc.head) doc.head.appendChild(styleEl);
            else doc.appendChild(styleEl);
        }
        return styleEl.sheet;
    }
  }
  
  
  // CSS Specificity Calculator (Chrome DevTools Logic)
  function calculateSpecificity(selectorText) {
      let maxSpec = 0;
      const selectors = selectorText.split(',');
      for (let s of selectors) {
          let a = (s.match(/#[a-zA-Z0-9_-]+/g) || []).length; // ID Selectors
          let b = (s.match(/\.[a-zA-Z0-9_-]+/g) || []).length + // Class Selectors
                  (s.match(/\[.*?\]/g) || []).length;         // Attribute Selectors
          let pseudos = s.match(/:[a-zA-Z0-9_-]+/g) || [];
          let pseudoElements = s.match(/::[a-zA-Z0-9_-]+/g) || [];
          b += Math.max(0, pseudos.length - (pseudoElements.length * 2));
          
          let c = s.replace(/#[a-zA-Z0-9_-]+/g, '')
                   .replace(/\.[a-zA-Z0-9_-]+/g, '')
                   .replace(/\[.*?\]/g, '')
                   .replace(/::?[a-zA-Z0-9_-]+/g, '')
                   .replace(/[>+~*\s]/g, ' ')
                   .split(' ')
                   .filter(t => t.trim().length > 0).length; // Tag Selectors
          c += pseudoElements.length;
          
          // Calculate final power score
          let spec = (a * 10000) + (b * 100) + c;
          if (spec > maxSpec) maxSpec = spec;
      }
      return maxSpec;
  }

  /**
   * Get Matched Rules with Specificity & Cascading Order Sorting
   */
  function getMatchedCSSRules(element, filterInherited = false) {
    const rules = [];
    let ruleIndex = 0; // Track original source order
    
    const root = element.getRootNode();
    const styleSheets = root.styleSheets || document.styleSheets;

    for (const sheet of styleSheets) {
      try {
        if (!sheet.cssRules) continue;

        for (const rule of sheet.cssRules) {
          let selector;
          try { selector = rule.selectorText; } catch (e) { continue; }
          if (!selector) continue;

          if (element.matches(selector)) {
            // Priority Check
            let spec = calculateSpecificity(selector);
            
            if (filterInherited) {
              const inheritedStyle = getInheritedProps(rule.style);
              if (inheritedStyle.length > 0) {
                 rules.push({ selectorText: selector, style: inheritedStyle, rule: rule, _spec: spec, _idx: ruleIndex++ });
              }
            } else {
              rules.push({ selectorText: selector, style: rule.style, rule: rule, _spec: spec, _idx: ruleIndex++ });
            }
          }
        }
      } catch (e) { /* Access Denied / CORS */ }
    }
    
    // SORT LOGIC: Highest Specificity FIRST -> Latest Source Order FIRST
    rules.sort((a, b) => {
        if (a._spec !== b._spec) return b._spec - a._spec; // 1. Specificity Power Check
        return b._idx - a._idx; // 2. Source Order Check (Ties e later rule wins)
    });
    
    return rules;
  }
  
  /**
   * Get Inherited Properties
   */
  function getInheritedProps(style) {
     const inheritedProperties = [
      'color', 'font-family', 'font-size', 'font-weight', 'font-style',
      'line-height', 'text-align', 'visibility', 'cursor', 'white-space',
      'letter-spacing', 'word-spacing', 'text-transform', 'text-indent'
     ];
     const filteredStyle = {};
     let length = 0;
     for(let i=0; i < style.length; i++) {
        const prop = style[i];
        if(inheritedProperties.includes(prop)) {
           filteredStyle[length++] = prop;
           filteredStyle[prop] = style.getPropertyValue(prop);
        }
     }
     filteredStyle.length = length;
     filteredStyle.getPropertyValue = (prop) => filteredStyle[prop];
     return filteredStyle;
  }
  
  /**
   * Get Pseudo Rules from Correct Scope
   */
  function getMatchedPseudoElementRules(element) {
    const pseudoRules = {
      '::before': [],
      '::after': []
    };
    const pseudos = ['::before', '::after'];
    
    // Determine which stylesheets to look at
    const root = element.getRootNode();
    const styleSheets = root.styleSheets || document.styleSheets;

    for (const sheet of styleSheets) {
      try {
        if (!sheet.cssRules) continue;

        for (const rule of sheet.cssRules) {
          let selector;
          try { selector = rule.selectorText; } catch (e) { continue; }
          if (!selector) continue;

          for (const pseudoType of pseudos) {
            if (selector.endsWith(pseudoType)) {
              const baseSelector = selector.substring(0, selector.length - pseudoType.length);
              // Matches check
              if (baseSelector && element.matches(baseSelector)) {
                pseudoRules[pseudoType].push(rule);
              }
            }
          }
        }
      } catch (e) { /* CORS */ }
    }
    return pseudoRules;
  }

  return {
    parseCssProperties: parseCssProperties,
    getRuleSource: getRuleSource,
    getOrCreateDevToolStylesheet: getOrCreateDevToolStylesheet,
    getMatchedCSSRules: getMatchedCSSRules,
    getInheritedProps: getInheritedProps,
    getMatchedPseudoElementRules: getMatchedPseudoElementRules
  };

})();