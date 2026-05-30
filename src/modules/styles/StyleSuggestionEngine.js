// src/modules/styles/StyleSuggestionEngine.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.StyleSuggestionEngine = (function() {

    const Utils = window.MyDevTool.StyleEditorUtils;

    function getSuggestions(params) {
        const { type, fullText, propName, element, maxSuggestions } = params;
        const CSSData = window.MyDevTool.CSSData;
        const ColorData = window.MyDevTool.ColorData;

        let filter = fullText.replace(/\u00A0/g, ' ');
        let suggestions = [];
        let currentTokenPrefix = "";

        const varMatch = filter.match(/var\(([^)]*)$/);
        const isVarContext = !!varMatch;

        if (type === 'value') {
            if (isVarContext) {
                currentTokenPrefix = filter.substring(0, varMatch.index + 4);
                filter = varMatch[1].trim(); 
            } else {
                const lastSpaceIndex = filter.lastIndexOf(' ');
                if (lastSpaceIndex !== -1) {
                    currentTokenPrefix = filter.substring(0, lastSpaceIndex + 1);
                    filter = filter.substring(lastSpaceIndex + 1);
                }
                filter = filter.trim();
            }
        } else {
            filter = filter.trim();
        }

        if (type === 'property') {
            if (!CSSData || !CSSData.properties) return { suggestions: [], currentTokenPrefix };
            const allProps = Object.keys(CSSData.properties);
            let matchedProps = filter ? allProps.filter(p => Utils.fuzzyMatch(filter, p)) : allProps;

            if (filter && matchedProps.length > 0) {
                matchedProps.sort((a, b) => {
                    const aStarts = a.toLowerCase().startsWith(filter.toLowerCase());
                    const bStarts = b.toLowerCase().startsWith(filter.toLowerCase());
                    if (aStarts && !bStarts) return -1;
                    if (!aStarts && bStarts) return 1;
                    return a.length - b.length; 
                });
            }

            matchedProps = matchedProps.slice(0, maxSuggestions);
            suggestions = [...matchedProps];

            if (filter.length >= 2 && suggestions.length < maxSuggestions) {
                for (const pName of matchedProps) {
                    if (suggestions.length >= maxSuggestions) break;
                    const propData = CSSData.properties[pName];
                    if (propData && propData.values) {
                        for (const val of propData.values) {
                            if (suggestions.length >= maxSuggestions) break;
                            suggestions.push(`${pName}: ${val}`);
                        }
                    }
                }
            }
        } 
        else if (type === 'value') {
            if (isVarContext) {
                const availableVars = Utils.getAllCSSVariables(element); 
                const computed = element ? window.getComputedStyle(element) : null;
                let matchedVars = filter ? availableVars.filter(v => Utils.fuzzyMatch(filter, v)) : availableVars;
                
                suggestions = matchedVars.map(v => {
                    let val = '', isColor = false;
                    if (computed) {
                        val = computed.getPropertyValue(v).trim();
                        if (val && Utils.colorRegex.test(val)) isColor = true;
                    }
                    return { text: v, value: val, isColor: isColor };
                });
            } else {
                const pName = (propName || '').trim().toLowerCase();
                if (CSSData && CSSData.properties) {
                    const propData = CSSData.properties[pName];
                    let availableValues = propData && propData.values ? [...propData.values] : [];
                    availableValues = [...availableValues, ...Utils.CSS_GLOBAL_VALUES];

                    if (Utils.COLOR_PROPERTIES.has(pName)) {
                        const colorData = CSSData.properties['color'];
                        if (colorData && colorData.values) availableValues = [...availableValues, ...colorData.values];
                        if (ColorData && ColorData.names) availableValues = [...availableValues, ...ColorData.names];
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
            }
        }
        
        if (suggestions.length > 0 && typeof suggestions[0] === 'string') {
             suggestions = [...new Set(suggestions)].slice(0, maxSuggestions);
        } else {
             suggestions = suggestions.slice(0, maxSuggestions);
        }

        return { suggestions, currentTokenPrefix };
    }

    return { getSuggestions };
})();