// src/modules/element/SyntaxHighlighter.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.SyntaxHighlighter = (function() {

    // Settings - can be toggled
    function getSettings() {
        return {
            formatCSS: localStorage.getItem('dt_dom_format_css') === 'true',  // default false
            formatJS: localStorage.getItem('dt_dom_format_js') === 'true'     // default false
        };
    }

    /**
     * Highlight CSS code
     * @param {string} code - Raw CSS code
     * @returns {string} - HTML with syntax highlighting
     */
    function highlightCSS(code) {
        if (!code || !code.trim()) return code;
        
        let html = '';
        
        // Parse CSS - detect selectors, properties, values
        // Simple regex-based approach
        
        // Remove comments first and store them
        const comments = [];
        code = code.replace(/\/\*[\s\S]*?\*\//g, (match) => {
            const index = comments.length;
            comments.push(match);
            return `__COMMENT_${index}__`;
        });
        
        // Split by rules (selector { ... })
        const ruleRegex = /([^{]+)\{([^}]*)\}/g;
        let match;
        let lastIndex = 0;
        
        while ((match = ruleRegex.exec(code)) !== null) {
            // Add any text before this rule
            if (match.index > lastIndex) {
                html += escapeHTML(code.substring(lastIndex, match.index));
            }
            
            const selector = match[1].trim();
            const declarations = match[2];
            
            // Highlight selector
            html += `<span class="css-selector">${escapeHTML(selector)}</span> {\n`;
            
            // Parse declarations
            const props = declarations.split(';').filter(p => p.trim());
            props.forEach((prop, idx) => {
                const colonIndex = prop.indexOf(':');
                if (colonIndex > 0) {
                    const propName = prop.substring(0, colonIndex).trim();
                    const propValue = prop.substring(colonIndex + 1).trim();
                    
                    html += `  <span class="css-property">${escapeHTML(propName)}</span>: `;
                    html += `<span class="css-value">${escapeHTML(propValue)}</span>;`;
                    if (idx < props.length - 1) html += '\n';
                }
            });
            
            html += '\n}';
            lastIndex = ruleRegex.lastIndex;
        }
        
        // Add remaining text
        if (lastIndex < code.length) {
            html += escapeHTML(code.substring(lastIndex));
        }
        
        // Restore comments
        html = html.replace(/__COMMENT_(\d+)__/g, (_, index) => {
            return `<span class="css-comment">${escapeHTML(comments[index])}</span>`;
        });
        
        return html;
    }

    /**
     * Highlight JavaScript code
     * @param {string} code - Raw JS code
     * @returns {string} - HTML with syntax highlighting
     */
    function highlightJS(code) {
        if (!code || !code.trim()) return code;
        
        // Keywords
        const keywords = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|new|class|extends|import|export|from|default|async|await|yield|typeof|instanceof|in|of|delete|void|this|super)\b/g;
        
        // Strings
        const strings = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g;
        
        // Numbers
        const numbers = /\b(\d+\.?\d*)\b/g;
        
        // Comments
        const comments = /(\/\/.*|\/\*[\s\S]*?\*\/)/g;
        
        // Functions (simple detection)
        const functions = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
        
        let html = code;
        
        // Order matters! Comments first, then strings, then others
        html = html.replace(comments, '<span class="js-comment">$1</span>');
        html = html.replace(strings, '<span class="js-string">$1</span>');
        html = html.replace(keywords, '<span class="js-keyword">$1</span>');
        html = html.replace(functions, '<span class="js-function">$1</span>(');
        html = html.replace(numbers, '<span class="js-number">$1</span>');
        
        return html;
    }

    /**
     * Format CSS code (prettify)
     * @param {string} code - Minified or unformatted CSS
     * @returns {string} - Formatted CSS
     */
    function formatCSS(code) {
        if (!code) return code;
        
        // Simple formatting - add newlines and indentation
        let formatted = code;
        
        // Add newline after {
        formatted = formatted.replace(/\{/g, ' {\n  ');
        
        // Add newline after ;
        formatted = formatted.replace(/;/g, ';\n  ');
        
        // Add newline before }
        formatted = formatted.replace(/\}/g, '\n}');
        
        // Remove extra spaces
        formatted = formatted.replace(/\s+/g, ' ');
        
        // Clean up
        formatted = formatted.trim();
        
        return formatted;
    }

    /**
     * Format JavaScript code (prettify)
     * @param {string} code - Minified or unformatted JS
     * @returns {string} - Formatted JS
     */
    function formatJS(code) {
        if (!code) return code;
        
        // Simple formatting - add newlines and indentation
        let formatted = code;
        
        // Add newline after {
        formatted = formatted.replace(/\{/g, ' {\n  ');
        
        // Add newline after ;
        formatted = formatted.replace(/;/g, ';\n  ');
        
        // Add newline before }
        formatted = formatted.replace(/\}/g, '\n}');
        
        // Remove extra spaces
        formatted = formatted.replace(/\s+/g, ' ');
        
        // Clean up
        formatted = formatted.trim();
        
        return formatted;
    }

    /**
     * Process text content - detect if CSS/JS and highlight
     * @param {Node} node - Text node
     * @param {Element} parentElement - Parent element
     * @returns {string} - Plain text or highlighted HTML
     */
    function processTextContent(node, parentElement) {
        if (!node || !parentElement) return '';
        
        const settings = getSettings();
        const content = node.textContent || '';
        const parentTag = parentElement.tagName ? parentElement.tagName.toLowerCase() : '';
        
        // Check if parent is <style> or <script>
        const isStyle = parentTag === 'style';
        const isScript = parentTag === 'script';
        
        if (!isStyle && !isScript) {
            // Regular text node - return as is
            return escapeHTML(content.trim());
        }
        
        // CSS content
        if (isStyle) {
            let processed = content;
            
            // Format if enabled
            if (settings.formatCSS) {
                processed = formatCSS(processed);
            }
            
            // Always highlight
            return highlightCSS(processed);
        }
        
        // JavaScript content
        if (isScript) {
            let processed = content;
            
            // Format if enabled
            if (settings.formatJS) {
                processed = formatJS(processed);
            }
            
            // Always highlight
            return highlightJS(processed);
        }
        
        return escapeHTML(content.trim());
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    return {
        highlightCSS,
        highlightJS,
        formatCSS,
        formatJS,
        processTextContent,
        getSettings
    };
})();