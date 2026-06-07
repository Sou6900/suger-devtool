// src/modules/settings/WhatsNew.js

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.WhatsNew = (function() {

    function render(container) {
        container.innerHTML = `
            <ul class="whats-new-list">
                <li>
                    <strong>Developer API Exposed:</strong>
                    <div class="sub-text">
                        • Global <code>suger</code> object added. Use <code>suger.show()</code>, <code>suger.hide()</code>, <code>suger.inspect(el)</code> & <code>suger.clear()</code>.<br>
                    </div>
                </li>
                  <li>
                    <strong>Replay Early Logs:</strong>
                    <div class="sub-text">
                        • Resolved Early logs capture , no miss <br>
                    </div>
                </li>
                <li>
                    <strong>React DevTools (Experimental):</strong>
                    <div class="sub-text">
                        • Added native React Fiber inspection with <b>Components</b> & <b>Profiler</b> tabs.<br>
                        • Live-edit React Props, State, and Hooks directly from the panel.<br>
                        • Advanced Render Profiler with Flamegraphs & Ranked view.<br>
                        • Enable via the new <b>Experiments</b> tab in settings.
                    </div>
                </li>
                <li>
                    <strong>Styles & Elements Fixes:</strong>
                    <div class="sub-text">
                        • <b>Priority Fix:</b> on CSS rule Specificity logic.<br>
                        • <b>Contextual '+' Button:</b> New style rules are now injected below the targeted block.<br>
                        • Fixed DOM persistence (Ghost Style) bugs for injected rules.<br>
                        • Fixed CSS double <code>!important</code> bug during style editing.
                    </div>
                </li>
                <li>
                    <strong>Ultimate Console Upgrade:</strong>
                    <div class="sub-text">
                        • <b>Chrome-style Inspector:</b> Advanced function parameter parsing, Arrow-function support, and <code>[[Prototype]]</code> chain.<br>
                        • Upgraded Eager Evaluation : (Ghost) previews for Objects & Functions.<br>
                        • Fixed console search filter (now searches inside nested objects perfectly).<br>
                        • Fixed mobile keyboard auto-pop-up issue after clearing console.
                    </div>
                </li>
            </ul>
        `;
    }

    return { render };
})();



      