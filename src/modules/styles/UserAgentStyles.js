// src/modules/styles/UserAgentStyles.js
// User Agent Stylesheet Data (Chrome/Blink Default Styles)

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.UserAgentStyles = (function() {
    
    // Parsed User Agent Stylesheet
    // Source: https://chromium.googlesource.com/chromium/blink/+/master/Source/core/css/html.css
    const UA_STYLES = {
        'html': {
            'display': 'block'
        },
        'head': {
            'display': 'none'
        },
        'meta': {
            'display': 'none'
        },
        'title': {
            'display': 'none'
        },
        'link': {
            'display': 'none'
        },
        'style': {
            'display': 'none'
        },
        'script': {
            'display': 'none'
        },
        'body': {
            'display': 'block',
            'margin': '8px'
        },
        'p': {
            'display': 'block',
            '-webkit-margin-before': '1em',
            '-webkit-margin-after': '1em',
            '-webkit-margin-start': '0',
            '-webkit-margin-end': '0'
        },
        'div': {
            'display': 'block'
        },
        'article': { 'display': 'block' },
        'aside': { 'display': 'block' },
        'footer': { 'display': 'block' },
        'header': { 'display': 'block' },
        'hgroup': { 'display': 'block' },
        'main': { 'display': 'block' },
        'nav': { 'display': 'block' },
        'section': { 'display': 'block' },
        'address': {
            'display': 'block'
        },
        'blockquote': {
            'display': 'block',
            '-webkit-margin-before': '1em',
            '-webkit-margin-after': '1em',
            '-webkit-margin-start': '40px',
            '-webkit-margin-end': '40px'
        },
        'h1': {
            'display': 'block',
            'font-size': '2em',
            '-webkit-margin-before': '0.67em',
            '-webkit-margin-after': '0.67em',
            '-webkit-margin-start': '0',
            '-webkit-margin-end': '0',
            'font-weight': 'bold'
        },
        'h2': {
            'display': 'block',
            'font-size': '1.5em',
            '-webkit-margin-before': '0.83em',
            '-webkit-margin-after': '0.83em',
            '-webkit-margin-start': '0',
            '-webkit-margin-end': '0',
            'font-weight': 'bold'
        },
        'h3': {
            'display': 'block',
            'font-size': '1.17em',
            '-webkit-margin-before': '1em',
            '-webkit-margin-after': '1em',
            '-webkit-margin-start': '0',
            '-webkit-margin-end': '0',
            'font-weight': 'bold'
        },
        'h4': {
            'display': 'block',
            '-webkit-margin-before': '1.33em',
            '-webkit-margin-after': '1.33em',
            '-webkit-margin-start': '0',
            '-webkit-margin-end': '0',
            'font-weight': 'bold'
        },
        'h5': {
            'display': 'block',
            'font-size': '.83em',
            '-webkit-margin-before': '1.67em',
            '-webkit-margin-after': '1.67em',
            '-webkit-margin-start': '0',
            '-webkit-margin-end': '0',
            'font-weight': 'bold'
        },
        'h6': {
            'display': 'block',
            'font-size': '.67em',
            '-webkit-margin-before': '2.33em',
            '-webkit-margin-after': '2.33em',
            '-webkit-margin-start': '0',
            '-webkit-margin-end': '0',
            'font-weight': 'bold'
        },
        'ul': {
            'display': 'block',
            'list-style-type': 'disc',
            '-webkit-margin-before': '1em',
            '-webkit-margin-after': '1em',
            '-webkit-margin-start': '0',
            '-webkit-margin-end': '0',
            '-webkit-padding-start': '40px'
        },
        'ol': {
            'display': 'block',
            'list-style-type': 'decimal',
            '-webkit-margin-before': '1em',
            '-webkit-margin-after': '1em',
            '-webkit-margin-start': '0',
            '-webkit-margin-end': '0',
            '-webkit-padding-start': '40px'
        },
        'li': {
            'display': 'list-item',
            'text-align': '-webkit-match-parent'
        },
        'dl': {
            'display': 'block',
            '-webkit-margin-before': '1em',
            '-webkit-margin-after': '1em',
            '-webkit-margin-start': '0',
            '-webkit-margin-end': '0'
        },
        'dt': {
            'display': 'block'
        },
        'dd': {
            'display': 'block',
            '-webkit-margin-start': '40px'
        },
        'table': {
            'display': 'table',
            'border-collapse': 'separate',
            'border-spacing': '2px',
            'border-color': 'gray'
        },
        'thead': {
            'display': 'table-header-group',
            'vertical-align': 'middle',
            'border-color': 'inherit'
        },
        'tbody': {
            'display': 'table-row-group',
            'vertical-align': 'middle',
            'border-color': 'inherit'
        },
        'tfoot': {
            'display': 'table-footer-group',
            'vertical-align': 'middle',
            'border-color': 'inherit'
        },
        'tr': {
            'display': 'table-row',
            'vertical-align': 'inherit',
            'border-color': 'inherit'
        },
        'td': {
            'display': 'table-cell',
            'vertical-align': 'inherit'
        },
        'th': {
            'display': 'table-cell',
            'vertical-align': 'inherit',
            'font-weight': 'bold'
        },
        'caption': {
            'display': 'table-caption',
            'text-align': '-webkit-center'
        },
        'form': {
            'display': 'block',
            'margin-top': '0em'
        },
        'label': {
            'cursor': 'default'
        },
        'fieldset': {
            'display': 'block',
            '-webkit-margin-start': '2px',
            '-webkit-margin-end': '2px',
            '-webkit-padding-before': '0.35em',
            '-webkit-padding-start': '0.75em',
            '-webkit-padding-end': '0.75em',
            '-webkit-padding-after': '0.625em',
            'border': '2px groove ThreeDFace',
            'min-width': '-webkit-min-content'
        },
        'legend': {
            'display': 'block',
            '-webkit-padding-start': '2px',
            '-webkit-padding-end': '2px',
            'border': 'none'
        },
        'input': {
            '-webkit-appearance': 'textfield',
            'padding': '1px',
            'background-color': 'white',
            'border': '2px inset',
            '-webkit-rtl-ordering': 'logical',
            '-webkit-user-select': 'text',
            'cursor': 'auto',
            'margin': '0em',
            'font': '-webkit-small-control',
            'text-rendering': 'auto',
            'color': 'initial',
            'letter-spacing': 'normal',
            'word-spacing': 'normal',
            'line-height': 'normal',
            'text-transform': 'none',
            'text-indent': '0',
            'text-shadow': 'none',
            'display': 'inline-block',
            'text-align': 'start'
        },
        'textarea': {
            'margin': '0em',
            'font': '-webkit-small-control',
            'text-rendering': 'auto',
            'color': 'initial',
            'letter-spacing': 'normal',
            'word-spacing': 'normal',
            'line-height': 'normal',
            'text-transform': 'none',
            'text-indent': '0',
            'text-shadow': 'none',
            'display': 'inline-block',
            'text-align': 'start',
            '-webkit-appearance': 'textarea',
            'background-color': 'white',
            'border': '1px solid',
            '-webkit-rtl-ordering': 'logical',
            '-webkit-user-select': 'text',
            'flex-direction': 'column',
            'resize': 'auto',
            'cursor': 'auto',
            'white-space': 'pre-wrap',
            'word-wrap': 'break-word'
        },
        'select': {
            '-webkit-appearance': 'menulist',
            'box-sizing': 'border-box',
            'align-items': 'center',
            'border': '1px solid',
            'white-space': 'pre',
            '-webkit-rtl-ordering': 'logical',
            'color': 'black',
            'background-color': 'white',
            'cursor': 'default',
            'margin': '0em',
            'font': '-webkit-small-control',
            'text-rendering': 'auto',
            'letter-spacing': 'normal',
            'word-spacing': 'normal',
            'line-height': 'normal',
            'text-transform': 'none',
            'text-indent': '0',
            'text-shadow': 'none',
            'display': 'inline-block',
            'text-align': 'start'
        },
        'button': {
            '-webkit-appearance': 'button',
            'margin': '0em',
            'font': '-webkit-small-control',
            'text-rendering': 'auto',
            'color': 'initial',
            'letter-spacing': 'normal',
            'word-spacing': 'normal',
            'line-height': 'normal',
            'text-transform': 'none',
            'text-indent': '0',
            'text-shadow': 'none',
            'display': 'inline-block',
            'text-align': 'start'
        },
        'a': {
            'color': '-webkit-link',
            'text-decoration': 'underline',
            'cursor': 'auto'
        },
        'hr': {
            'display': 'block',
            '-webkit-margin-before': '0.5em',
            '-webkit-margin-after': '0.5em',
            '-webkit-margin-start': 'auto',
            '-webkit-margin-end': 'auto',
            'border-style': 'inset',
            'border-width': '1px'
        },
        'pre': {
            'display': 'block',
            'font-family': 'monospace',
            'white-space': 'pre',
            'margin': '1em 0'
        },
        'code': {
            'font-family': 'monospace'
        },
        'kbd': {
            'font-family': 'monospace'
        },
        'samp': {
            'font-family': 'monospace'
        },
        'tt': {
            'font-family': 'monospace'
        },
        'strong': {
            'font-weight': 'bold'
        },
        'b': {
            'font-weight': 'bold'
        },
        'i': {
            'font-style': 'italic'
        },
        'em': {
            'font-style': 'italic'
        },
        'cite': {
            'font-style': 'italic'
        },
        'var': {
            'font-style': 'italic'
        },
        'dfn': {
            'font-style': 'italic'
        },
        'u': {
            'text-decoration': 'underline'
        },
        'ins': {
            'text-decoration': 'underline'
        },
        's': {
            'text-decoration': 'line-through'
        },
        'strike': {
            'text-decoration': 'line-through'
        },
        'del': {
            'text-decoration': 'line-through'
        },
        'small': {
            'font-size': 'smaller'
        },
        'big': {
            'font-size': 'larger'
        },
        'sub': {
            'vertical-align': 'sub',
            'font-size': 'smaller'
        },
        'sup': {
            'vertical-align': 'super',
            'font-size': 'smaller'
        },
        'mark': {
            'background-color': 'yellow',
            'color': 'black'
        }
    };

    /**
     * Get user agent styles for a given element
     * @param {HTMLElement} element - The DOM element
     * @returns {Object|null} - User agent styles object or null if not found
     */
    function getStyles(element) {
        if (!element || !element.tagName) return null;
        
        const tagName = element.tagName.toLowerCase();
        return UA_STYLES[tagName] || null;
    }

    /**
     * Check if a property in user agent styles is overridden by element's author styles
     * @param {HTMLElement} element - The DOM element
     * @param {string} propName - CSS property name
     * @param {string} uaValue - User agent style value
     * @returns {boolean} - True if overridden by author/user styles
     */
    function isPropertyOverridden(element, propName, uaValue) {
        // Strategy: Check if any author stylesheet or inline style sets this property
        
        // 1. Check inline styles first
        if (element.style && element.style.getPropertyValue(propName)) {
            return true; // Definitely overridden
        }
        
        // 2. Check all stylesheets for matching rules
        try {
            const sheets = document.styleSheets;
            for (let sheet of sheets) {
                // Skip user agent stylesheets (they don't have ownerNode or have specific href)
                if (!sheet.ownerNode) continue;
                
                try {
                    const rules = sheet.cssRules || sheet.rules;
                    if (!rules) continue;
                    
                    for (let rule of rules) {
                        if (rule.type === CSSRule.STYLE_RULE) {
                            // Check if this rule matches the element
                            try {
                                if (element.matches(rule.selectorText)) {
                                    // Check if this rule sets our property
                                    if (rule.style && rule.style.getPropertyValue(propName)) {
                                        return true; // Found an author style setting this property
                                    }
                                }
                            } catch (e) {
                                // Invalid selector, skip
                            }
                        }
                    }
                } catch (e) {
                    // CORS or security error, skip this sheet
                }
            }
        } catch (e) {
            // Fallback: compare computed value with UA value
            const computed = window.getComputedStyle(element);
            const computedValue = computed.getPropertyValue(propName);
            
            const normalizedUA = normalizeValue(uaValue);
            const normalizedComputed = normalizeValue(computedValue);
            
            return normalizedUA !== normalizedComputed;
        }
        
        return false; // No author styles found for this property
    }

    /**
     * Normalize CSS values for comparison
     * @param {string} value - CSS value
     * @returns {string} - Normalized value
     */
    function normalizeValue(value) {
        if (!value) return '';
        return value.trim().toLowerCase().replace(/\s+/g, ' ');
    }

    return {
        getStyles,
        isPropertyOverridden
    };
})();