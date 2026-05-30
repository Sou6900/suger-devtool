// src/modules/console/ConsoleSnippets.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.ConsoleSnippets = (function() {

  const SNIPPETS = [
    // ============================================
    // 1. Console API & Debugging
    // ============================================
    { 
      label: 'log', 
      type: 'Snippet', 
      insert: 'console.log(${1:value})', 
      detail: 'Log Value' 
    },
    { 
      label: 'info', 
      type: 'Snippet', 
      insert: 'console.info("${1:Info Message}")', 
      detail: 'Log Info' 
    },
    { 
      label: 'warn', 
      type: 'Snippet', 
      insert: 'console.warn("${1:Warning Message}")', 
      detail: 'Log Warning' 
    },
    { 
      label: 'error', 
      type: 'Snippet', 
      insert: 'console.error("${1:Error Message}")', 
      detail: 'Log Error' 
    },
    { 
      label: 'table', 
      type: 'Snippet', 
      insert: 'console.table(${1:data})', 
      detail: 'Display Data as Table' 
    },
    { 
      label: 'dir', 
      type: 'Snippet', 
      insert: 'console.dir(${1:element})', 
      detail: 'Inspect Object/DOM properties' 
    },
    { 
      label: 'clear', 
      type: 'Snippet', 
      insert: 'console.clear()', 
      detail: 'Clear Console' 
    },
    { 
      label: 'count', 
      type: 'Snippet', 
      insert: 'console.count("${1:CounterLabel}")', 
      detail: 'Count executions' 
    },
    { 
      label: 'assert', 
      type: 'Snippet', 
      insert: 'console.assert(${1:condition}, "${2:Error Message}");', 
      detail: 'Log if condition is false' 
    },
    { 
      label: 'trace', 
      type: 'Snippet', 
      insert: 'console.trace("Stack Trace")', 
      detail: 'Print Call Stack' 
    },
    {
      label: 'debugger',
      type: 'Snippet',
      insert: 'debugger;',
      detail: 'Pause execution (Breakpoint)'
    },
    {
      label: 'profile',
      type: 'Snippet',
      insert: 'console.profile("${1:ProfileName}");\n${2}\nconsole.profileEnd("${1:ProfileName}");',
      detail: 'CPU Profile'
    },
    {
      label: 'timeStamp',
      type: 'Snippet',
      insert: 'console.timeStamp("${1:Label}");',
      detail: 'Add Timeline Marker'
    },

    // ============================================
    // 2. Grouping & Timing
    // ============================================
    { 
      label: 'group', 
      type: 'Snippet', 
      insert: 'console.group("${1:Label}");\n\t${2}\nconsole.groupEnd();', 
      detail: 'Simple Group' 
    },
    { 
      label: 'groupc', 
      type: 'Snippet', 
      insert: 'console.groupCollapsed("${1:Label}");\n\t${2}\nconsole.groupEnd();', 
      detail: 'Collapsed Group' 
    },
    { 
      label: 'time', 
      type: 'Snippet', 
      insert: 'console.time("${1:Timer}");\n${2}\nconsole.timeEnd("${1:Timer}");', 
      detail: 'Measure Time' 
    },

    // ============================================
    // 3. DOM Selection (Comprehensive)
    // ============================================
    { 
      label: 'qs', 
      type: 'Snippet', 
      insert: 'document.querySelector("${1:selector}")', 
      detail: 'querySelector' 
    },
    { 
      label: 'qsa', 
      type: 'Snippet', 
      insert: 'document.querySelectorAll("${1:selector}")', 
      detail: 'querySelectorAll' 
    },
    { 
      label: '$', 
      type: 'Snippet', 
      insert: 'document.querySelector("${1:selector}")', 
      detail: 'Alias for querySelector' 
    },
    { 
      label: '$$', 
      type: 'Snippet', 
      insert: 'Array.from(document.querySelectorAll("${1:selector}"))', 
      detail: 'Select All (as Array)' 
    },
    { 
      label: 'id', 
      type: 'Snippet', 
      insert: 'document.getElementById("${1:id}")', 
      detail: 'Select by ID' 
    },
    { 
      label: 'class', 
      type: 'Snippet', 
      insert: 'document.getElementsByClassName("${1:className}")', 
      detail: 'Select by Class' 
    },
    { 
      label: 'tag', 
      type: 'Snippet', 
      insert: 'document.getElementsByTagName("${1:tagName}")', 
      detail: 'Select by Tag' 
    },
    { 
      label: 'xpath', 
      type: 'Snippet', 
      insert: 'document.evaluate("${1:xpath}", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue', 
      detail: 'Select by XPath' 
    },

    // ============================================
    // 4. DOM Traversal
    // ============================================
    { 
      label: 'parent', 
      type: 'Snippet', 
      insert: '${1:el}.parentElement', 
      detail: 'Get Parent Element' 
    },
    { 
      label: 'children', 
      type: 'Snippet', 
      insert: 'Array.from(${1:el}.children)', 
      detail: 'Get Child Elements' 
    },
    { 
      label: 'next', 
      type: 'Snippet', 
      insert: '${1:el}.nextElementSibling', 
      detail: 'Next Sibling' 
    },
    { 
      label: 'prev', 
      type: 'Snippet', 
      insert: '${1:el}.previousElementSibling', 
      detail: 'Previous Sibling' 
    },
    { 
      label: 'closest', 
      type: 'Snippet', 
      insert: '${1:el}.closest("${2:selector}")', 
      detail: 'Find Closest Ancestor' 
    },
    { 
      label: 'matches', 
      type: 'Snippet', 
      insert: '${1:el}.matches("${2:selector}")', 
      detail: 'Check if matches selector' 
    },
    { 
      label: 'active', 
      type: 'Snippet', 
      insert: 'document.activeElement', 
      detail: 'Currently Focused Element' 
    },

    // ============================================
    // 5. DOM Manipulation (Content & Structure)
    // ============================================
    { 
      label: 'create', 
      type: 'Snippet', 
      insert: 'const ${1:el} = document.createElement("${2:div}");\n${1:el}.className = "${3:class}";\n${1:el}.textContent = "${4:content}";', 
      detail: 'Create New Element' 
    },
    { 
      label: 'append', 
      type: 'Snippet', 
      insert: '${1:parent}.appendChild(${2:child});', 
      detail: 'Append Child' 
    },
    { 
      label: 'prepend', 
      type: 'Snippet', 
      insert: '${1:parent}.prepend(${2:child});', 
      detail: 'Prepend Child' 
    },
    { 
      label: 'remove', 
      type: 'Snippet', 
      insert: '${1:el}.remove();', 
      detail: 'Remove Element' 
    },
    { 
      label: 'replace', 
      type: 'Snippet', 
      insert: '${1:parent}.replaceChild(${2:new}, ${3:old});', 
      detail: 'Replace Child' 
    },
    { 
      label: 'clone', 
      type: 'Snippet', 
      insert: '${1:el}.cloneNode(true)', 
      detail: 'Deep Clone Element' 
    },
    { 
      label: 'html', 
      type: 'Snippet', 
      insert: '${1:el}.innerHTML = "${2:content}";', 
      detail: 'Set innerHTML' 
    },
    { 
      label: 'text', 
      type: 'Snippet', 
      insert: '${1:el}.textContent = "${2:content}";', 
      detail: 'Set textContent' 
    },
    { 
      label: 'attrget', 
      type: 'Snippet', 
      insert: '${1:el}.getAttribute("${2:attr}")', 
      detail: 'Get Attribute' 
    },
    { 
      label: 'attrset', 
      type: 'Snippet', 
      insert: '${1:el}.setAttribute("${2:attr}", "${3:val}")', 
      detail: 'Set Attribute' 
    },
    { 
      label: 'attrrem', 
      type: 'Snippet', 
      insert: '${1:el}.removeAttribute("${2:attr}")', 
      detail: 'Remove Attribute' 
    },
    { 
      label: 'data', 
      type: 'Snippet', 
      insert: '${1:el}.dataset.${2:key} = "${3:val}";', 
      detail: 'Set Data Attribute' 
    },

    // ============================================
    // 6. DOM Classes & Styles
    // ============================================
    { 
      label: 'classadd', 
      type: 'Snippet', 
      insert: '${1:el}.classList.add("${2:class}");', 
      detail: 'Add Class' 
    },
    { 
      label: 'classrem', 
      type: 'Snippet', 
      insert: '${1:el}.classList.remove("${2:class}");', 
      detail: 'Remove Class' 
    },
    { 
      label: 'classtog', 
      type: 'Snippet', 
      insert: '${1:el}.classList.toggle("${2:class}");', 
      detail: 'Toggle Class' 
    },
    { 
      label: 'classhas', 
      type: 'Snippet', 
      insert: '${1:el}.classList.contains("${2:class}")', 
      detail: 'Check Class Exists' 
    },
    { 
      label: 'style', 
      type: 'Snippet', 
      insert: '${1:el}.style.${2:property} = "${3:value}";', 
      detail: 'Set Inline Style' 
    },
    { 
      label: 'cssvar', 
      type: 'Snippet', 
      insert: '${1:el}.style.setProperty("--${2:name}", "${3:val}");', 
      detail: 'Set CSS Variable' 
    },
    { 
      label: 'getstyle', 
      type: 'Snippet', 
      insert: 'window.getComputedStyle(${1:el}).getPropertyValue("${2:prop}")', 
      detail: 'Get Computed Style' 
    },
    { 
      label: 'hide', 
      type: 'Snippet', 
      insert: '${1:el}.style.display = "none";', 
      detail: 'Hide Element' 
    },
    { 
      label: 'show', 
      type: 'Snippet', 
      insert: '${1:el}.style.display = "block";', 
      detail: 'Show Element' 
    },
    { 
      label: 'debugcss', 
      type: 'Snippet', 
      insert: '[].forEach.call(document.querySelectorAll("*"),function(a){a.style.outline="1px solid #"+(~~(Math.random()*(1<<24))).toString(16)})', 
      detail: 'Visual CSS Debugger' 
    },

    // ============================================
    // 7. Events (Expanded)
    // ============================================
    { 
      label: 'on', 
      type: 'Snippet', 
      insert: '${1:el}.addEventListener("${2:click}", (e) => {\n\t${3}\n});', 
      detail: 'Add Event Listener' 
    },
    { 
      label: 'off', 
      type: 'Snippet', 
      insert: '${1:el}.removeEventListener("${2:click}", ${3:handler});', 
      detail: 'Remove Event Listener' 
    },
    { 
      label: 'onclick', 
      type: 'Snippet', 
      insert: '${1:el}.addEventListener("click", (e) => {\n\tconsole.log("Clicked", e.target);\n});', 
      detail: 'On Click' 
    },
    { 
      label: 'oninput', 
      type: 'Snippet', 
      insert: '${1:el}.addEventListener("input", (e) => {\n\tconsole.log("Input:", e.target.value);\n});', 
      detail: 'On Input Change' 
    },
    { 
      label: 'onsubmit', 
      type: 'Snippet', 
      insert: '${1:form}.addEventListener("submit", (e) => {\n\te.preventDefault();\n\tconsole.log("Submitted");\n});', 
      detail: 'On Form Submit' 
    },
    { 
      label: 'onkey', 
      type: 'Snippet', 
      insert: 'document.addEventListener("keydown", (e) => {\n\tif (e.key === "${1:Enter}") {\n\t\t${2}\n\t}\n});', 
      detail: 'On Key Down' 
    },
    { 
      label: 'onload', 
      type: 'Snippet', 
      insert: 'window.addEventListener("DOMContentLoaded", () => {\n\t${1}\n});', 
      detail: 'On DOM Ready' 
    },
    { 
      label: 'trigger', 
      type: 'Snippet', 
      insert: '${1:el}.dispatchEvent(new Event("${2:change}"));', 
      detail: 'Trigger/Dispatch Event' 
    },
    { 
      label: 'prevent', 
      type: 'Snippet', 
      insert: 'e.preventDefault();', 
      detail: 'Prevent Default' 
    },
    { 
      label: 'stop', 
      type: 'Snippet', 
      insert: 'e.stopPropagation();', 
      detail: 'Stop Propagation' 
    },

    // ============================================
    // 8. Dimensions & Scroll
    // ============================================
    { 
      label: 'rect', 
      type: 'Snippet', 
      insert: '${1:el}.getBoundingClientRect()', 
      detail: 'Get Element Rect' 
    },
    { 
      label: 'offset', 
      type: 'Snippet', 
      insert: '{ top: ${1:el}.offsetTop, left: ${1:el}.offsetLeft }', 
      detail: 'Get Offset Position' 
    },
    { 
      label: 'scrollto', 
      type: 'Snippet', 
      insert: 'window.scrollTo({ top: ${1:0}, behavior: "smooth" });', 
      detail: 'Scroll To Top' 
    },
    { 
      label: 'scrollinto', 
      type: 'Snippet', 
      insert: '${1:el}.scrollIntoView({ behavior: "smooth", block: "center" });', 
      detail: 'Scroll Into View' 
    },
    { 
      label: 'scrollbot', 
      type: 'Snippet', 
      insert: 'window.scrollTo(0, document.body.scrollHeight);', 
      detail: 'Scroll To Bottom' 
    },

    // ============================================
    // 9. Modern Web APIs
    // ============================================
    { 
      label: 'obs_inter', 
      type: 'Snippet', 
      insert: 'const observer = new IntersectionObserver((entries) => {\n\tentries.forEach(entry => {\n\t\tif (entry.isIntersecting) {\n\t\t\tconsole.log("Visible:", entry.target);\n\t\t}\n\t});\n});\nobserver.observe(${1:el});', 
      detail: 'Intersection Observer' 
    },
    { 
      label: 'obs_mut', 
      type: 'Snippet', 
      insert: 'const observer = new MutationObserver((mutations) => {\n\tconsole.log("DOM Changed", mutations);\n});\nobserver.observe(${1:el}, { attributes: true, childList: true, subtree: true });', 
      detail: 'Mutation Observer' 
    },
    { 
      label: 'obs_resize', 
      type: 'Snippet', 
      insert: 'const observer = new ResizeObserver((entries) => {\n\tconsole.log("Resized", entries[0].contentRect);\n});\nobserver.observe(${1:el});', 
      detail: 'Resize Observer' 
    },
    { 
      label: 'fetch_blob', 
      type: 'Snippet', 
      insert: 'fetch("${1:url}").then(r => r.blob()).then(blob => {\n\tconst url = URL.createObjectURL(blob);\n\tconsole.log(url);\n});', 
      detail: 'Fetch as Blob/Image' 
    },
    { 
      label: 'clipboard', 
      type: 'Snippet', 
      insert: 'navigator.clipboard.writeText("${1:text}").then(() => console.log("Copied"));', 
      detail: 'Copy to Clipboard' 
    },
    { 
      label: 'paste', 
      type: 'Snippet', 
      insert: 'navigator.clipboard.readText().then(text => console.log(text));', 
      detail: 'Read from Clipboard' 
    },
    { 
      label: 'geo', 
      type: 'Snippet', 
      insert: 'navigator.geolocation.getCurrentPosition(pos => console.log(pos.coords));', 
      detail: 'Get Geolocation' 
    },
    { 
      label: 'notify', 
      type: 'Snippet', 
      insert: 'new Notification("Title", { body: "Body text" });', 
      detail: 'Show Notification' 
    },

    // ============================================
    // 10. Control Flow & Logic
    // ============================================
    {
      label: 'for',
      type: 'Snippet',
      insert: 'for (let ${1:i} = 0; ${1:i} < ${2:limit}; ${1:i}++) {\n\t console.log(${3:i}); \n}',
      detail: 'Standard For Loop'
    },
    {
      label: 'forof',
      type: 'Snippet',
      insert: 'for (const ${1:item} of ${2:iterable}) {\n\tconsole.log(${1:item});\n}',
      detail: 'For...Of Loop'
    },
    {
      label: 'forin',
      type: 'Snippet',
      insert: 'for (const ${1:key} in ${2:object}) {\n\tif (${2:object}.hasOwnProperty(${1:key})) {\n\t\tconsole.log(${1:key}, ${2:object}[${1:key}]);\n\t}\n}',
      detail: 'For...In Loop'
    },
    {
      label: 'while',
      type: 'Snippet',
      insert: 'while (${1:condition}) {\n\t${2}\n}',
      detail: 'While Loop'
    },
    {
      label: 'if',
      type: 'Snippet',
      insert: 'if (${1:condition}) {\n\t${2}\n}',
      detail: 'If Statement'
    },
    {
      label: 'ifelse',
      type: 'Snippet',
      insert: 'if (${1:condition}) {\n\t${2}\n} else {\n\t${3}\n}',
      detail: 'If...Else'
    },
    {
      label: 'switch',
      type: 'Snippet',
      insert: 'switch (${1:key}) {\n\tcase ${2:value}:\n\t\tbreak;\n\tdefault:\n\t\tbreak;\n}',
      detail: 'Switch Statement'
    },
    {
      label: 'try',
      type: 'Snippet',
      insert: 'try {\n\t${1}\n} catch (error) {\n\tconsole.error(error);\n}',
      detail: 'Try Catch Block'
    },

    // ============================================
    // 11. Array & Object Helpers
    // ============================================
    { 
      label: 'map', 
      type: 'Snippet',
      insert: '${1:arr}.map(item => ${2:return item});', 
      detail: 'Array Map' 
    },
    { 
      label: 'filter', 
      type: 'Snippet',
      insert: '${1:arr}.filter(item => ${2:condition});', 
      detail: 'Array Filter' 
    },
    { 
      label: 'reduce', 
      type: 'Snippet',
      insert: '${1:arr}.reduce((acc, curr) => {\n\treturn acc + curr;\n}, ${2:0});', 
      detail: 'Array Reduce' 
    },
    { 
      label: 'foreach', 
      type: 'Snippet',
      insert: '${1:arr}.forEach(item => {\n\tconsole.log(item);\n});', 
      detail: 'Array ForEach' 
    },
    { 
      label: 'find', 
      type: 'Snippet',
      insert: '${1:arr}.find(item => item.id === ${2:value});', 
      detail: 'Array Find' 
    },
    { 
      label: 'sort', 
      type: 'Snippet',
      insert: '${1:arr}.sort((a, b) => a - b);', 
      detail: 'Array Sort (Num)' 
    },
    { 
      label: 'keys', 
      type: 'Snippet',
      insert: 'Object.keys(${1:obj})', 
      detail: 'Object Keys' 
    },
    { 
      label: 'values', 
      type: 'Snippet',
      insert: 'Object.values(${1:obj})', 
      detail: 'Object Values' 
    },
    { 
      label: 'entries', 
      type: 'Snippet',
      insert: 'Object.entries(${1:obj})', 
      detail: 'Object Entries' 
    },
    { 
      label: 'assign', 
      type: 'Snippet',
      insert: 'Object.assign({}, ${1:obj1}, ${2:obj2})', 
      detail: 'Merge Objects' 
    },
    { 
      label: 'jsonp', 
      type: 'Snippet', 
      insert: 'JSON.parse(${1:string})', 
      detail: 'JSON Parse' 
    },
    { 
      label: 'jsons', 
      type: 'Snippet', 
      insert: 'JSON.stringify(${1:obj}, null, 2)', 
      detail: 'JSON Stringify Pretty' 
    },

    // ============================================
    // 12. Functions & Async
    // ============================================
    { 
      label: 'fn', 
      type: 'Snippet', 
      insert: 'function ${1:name}(${2:args}) {\n\t${3}\n}', 
      detail: 'Function' 
    },
    { 
      label: 'afn', 
      type: 'Snippet', 
      insert: 'const ${1:name} = (${2:args}) => {\n\t${3}\n};', 
      detail: 'Arrow Function' 
    },
    { 
      label: 'async', 
      type: 'Snippet',
      insert: 'const ${1:load} = async () => {\n\ttry {\n\t\tconst res = await fetch("${2:url}");\n\t\tconst data = await res.json();\n\t\tconsole.log(data);\n\t} catch (e) {\n\t\tconsole.error(e);\n\t}\n}', 
      detail: 'Async/Await Pattern' 
    },
    { 
      label: 'iife', 
      type: 'Snippet',
      insert: '(async () => {\n\t${1}\n})();', 
      detail: 'Async IIFE' 
    },
    { 
      label: 'promise', 
      type: 'Snippet',
      insert: 'new Promise((resolve, reject) => {\n\tsetTimeout(() => resolve("Done"), 1000);\n});', 
      detail: 'New Promise' 
    },
    { 
      label: 'sleep', 
      type: 'Snippet',
      insert: 'await new Promise(r => setTimeout(r, ${1:1000}));', 
      detail: 'Delay/Sleep' 
    },

    // ============================================
    // 13. Network & Storage
    // ============================================
    { 
      label: 'fetch', 
      type: 'Snippet',
      insert: 'fetch("${1:url}")\n\t.then(res => res.json())\n\t.then(data => console.log(data));', 
      detail: 'GET Request' 
    },
    { 
      label: 'post', 
      type: 'Snippet',
      insert: 'fetch("${1:url}", {\n\tmethod: "POST",\n\theaders: { "Content-Type": "application/json" },\n\tbody: JSON.stringify({ key: "val" })\n})\n.then(res => res.json())\n.then(console.log);', 
      detail: 'POST Request' 
    },
    { 
      label: 'ls', 
      type: 'Snippet', 
      insert: 'localStorage.getItem("${1:key}")', 
      detail: 'Get LocalStorage' 
    },
    { 
      label: 'lss', 
      type: 'Snippet', 
      insert: 'localStorage.setItem("${1:key}", JSON.stringify(${2:val}))', 
      detail: 'Set LocalStorage' 
    },
    { 
      label: 'lsc', 
      type: 'Snippet', 
      insert: 'localStorage.clear()', 
      detail: 'Clear LocalStorage' 
    },
    { 
      label: 'cookie', 
      type: 'Snippet', 
      insert: 'document.cookie', 
      detail: 'Get Cookies' 
    },
    { 
      label: 'uuid', 
      type: 'Snippet', 
      insert: 'crypto.randomUUID()', 
      detail: 'Generate UUID' 
    },
    {
      label: 'reload',
      type: 'Snippet',
      insert: 'window.location.reload()',
      detail: 'Reload Page'
    },
    {
      label: 'href',
      type: 'Snippet',
      insert: 'window.location.href',
      detail: 'Current URL'
    },
    {
      label: 'redirect',
      type: 'Snippet',
      insert: 'window.location.href = "${1:url}";',
      detail: 'Redirect Page'
    }
  ];

  return {
    getSnippets: () => SNIPPETS
  };

})();