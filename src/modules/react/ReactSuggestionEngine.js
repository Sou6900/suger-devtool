// src/modules/react/ReactSuggestionEngine.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.ReactSuggestionEngine = (function() {
    let cachedCamelProps = null;

    function toCamelCase(str) {
        return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    }

    function toKebabCase(str) {
        return str.replace(/([A-Z])/g, "-$1").toLowerCase();
    }
    function getCamelCaseData() {
        if (cachedCamelProps) return cachedCamelProps;
        const cssData = window.MyDevTool.CSSData;
        if (!cssData || !cssData.properties) return {};
        cachedCamelProps = {};
        for (const key in cssData.properties) {
            const camelKey = toCamelCase(key);
            cachedCamelProps[camelKey] = cssData.properties[key];
        }
        return cachedCamelProps;
    }

    function getSuggestions(params) {
        const { type, fullText, propName, maxSuggestions = 30 } = params;
        const Utils = window.MyDevTool.StyleEditorUtils;
        const CSSData = window.MyDevTool.CSSData;
        const ColorData = window.MyDevTool.ColorData;
        const data = getCamelCaseData();
        
        let filter = (fullText || "").trim();
        let suggestions = [];

        if (type === 'property') {
            const allProps = Object.keys(data);
            let matchedProps = filter ? allProps.filter(p => Utils.fuzzyMatch(filter, p)) : allProps;

            if (filter) {
                matchedProps.sort((a, b) => {
                    const aStarts = a.toLowerCase().startsWith(filter.toLowerCase());
                    const bStarts = b.toLowerCase().startsWith(filter.toLowerCase());
                    if (aStarts && !bStarts) return -1;
                    if (!aStarts && bStarts) return 1;
                    return a.length - b.length;
                });
            }
            suggestions = matchedProps.slice(0, maxSuggestions);

        } else if (type === 'value') {
            const cleanPropName = (propName || "").trim();
            const kebabPropName = toKebabCase(cleanPropName);
            
            let availableValues = [];

            // 1. Get standard values from CSSData
            if (cleanPropName && data[cleanPropName] && data[cleanPropName].values) {
                availableValues = [...data[cleanPropName].values];
            }
            
            // 2. Add Global CSS values (inherit, initial, unset, etc.)
            if (Utils && Utils.CSS_GLOBAL_VALUES) {
                availableValues = [...availableValues, ...Utils.CSS_GLOBAL_VALUES];
            }

            // 3. Add Colors if it's a color-related property! 
            if (Utils && Utils.COLOR_PROPERTIES && Utils.COLOR_PROPERTIES.has(kebabPropName)) {
                if (CSSData && CSSData.properties['color'] && CSSData.properties['color'].values) {
                    availableValues = [...availableValues, ...CSSData.properties['color'].values];
                }
                if (ColorData && ColorData.names) {
                    availableValues = [...availableValues, ...ColorData.names];
                }
            }
            
            if (filter) {
                for (const v of availableValues) {
                    if (Utils.fuzzyMatch(filter, v)) { 
                        suggestions.push(v); 
                        if (suggestions.length >= maxSuggestions) break; 
                    }
                }
            } else {
                suggestions = availableValues.slice(0, maxSuggestions);
            }
        }

        // Clean duplicates
        if (suggestions.length > 0 && typeof suggestions[0] === 'string') {
             suggestions = [...new Set(suggestions)].slice(0, maxSuggestions);
        }

        return { suggestions };
    }

    return { getSuggestions };
})();