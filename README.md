<div align="center">
  <img src="https://i.postimg.cc/G3536HzL/suger-dt.png" width="80" alt="Suger DevTool Logo" />

# Suger DevTool – Mobile DevTools

**On-device Mobile DevTools with Live HTML, CSS Editing & Advanced JavaScript Debugging**

![Type](https://img.shields.io/badge/Type-On--device%20Mobile%20DevTools-red?style=flat-square)
![Platform](https://img.shields.io/badge/Platform-Mobile%20%7C%20Browser%20%7C%20WebView-lightgrey?style=flat-square)
![Live Editing](https://img.shields.io/badge/Live-HTML%20%7C%20CSS%20Editing-blue?style=flat-square)
![Debugger](https://img.shields.io/badge/Debugger-Advanced%20JS%20Debugging-purple?style=flat-square)
![Dependency](https://img.shields.io/badge/Dependency-No%20Desktop%20Required-darkblue?style=flat-square)

</div>

<div style="width:100%;max-width:1200px;">
  <img src="https://i.postimg.cc/JhYVRxLj/Picsart-25-11-23-11-08-42-726.png" style="width:100%;max-width:1200px;" />
</div>

---

## What is Suger DevTool?

**Suger DevTool** is a standalone, high-performance **mobile-first DevTools** designed to bring a **desktop-like debugging experience directly to mobile devices**.

It focuses on **deep inspection and live editing**, not just console logging.

Suger DevTool works entirely **on-device**, without requiring a desktop computer, USB connection, or remote DevTools setup.

It is optimized for:
- Mobile Browsers
- Acode
- WebView-based applications

---

## Why Suger DevTool?

Most mobile debugging tools focus on basic logging and network inspection.

**Suger DevTool is built for developers who need real control and visibility on mobile devices.**

- Live HTML tree editing with instant visual feedback
- Full CSS rule editing with integrated color picker
- Computed style inspection and box model view
- Advanced JavaScript debugging with async/await stepping
- Pause JavaScript execution and DOM updates to inspect state
- No desktop, no USB, no remote debugging required

---

## Who is Suger DevTool for?

- Mobile-first web developers
- WebView / Hybrid app developers
- Acode users
- QA testers debugging on real devices
- Developers without reliable access to desktop DevTools

---

## Key Features

### Pro Source Debugger

A fully interactive JavaScript debugger designed for mobile environments.

- **Async Support** — Step through asynchronous code, Promises, event listeners, and timers
- **Breakpoints** — Set breakpoints in inline scripts and external JavaScript files
- **Scope Analysis** — Inspect local, closure, block, and global variables in real time
- **Watch Expressions** — Track expressions and variables as execution progresses
- **Execution Control** — Pause and resume JavaScript execution safely

---

### Elements Inspector

Inspect and modify the DOM directly on your mobile device.

- **DOM Tree** — Fully interactive DOM tree with expand/collapse
- **Live Edit** — Edit tags, attributes, and text content in real time
- **Computed Styles** — Inspect resolved CSS values and box model
- **Layout Tools** — Grid and Flexbox visualization overlays

---

### Network Inspector

Analyze network activity directly on-device.

- **Waterfall Chart** — Visual request timing (DNS, SSL, TTFB, Download)
- **Interception** — Inspect request headers, payloads, and responses
- **XHR Breakpoints** — Pause execution on specific network requests

---

### Application Manager

Inspect application-level storage and resources.

- **Storage** — LocalStorage, SessionStorage, and Cookies viewer
- **Deep Inspect** — IndexedDB and Cache Storage explorer
- **Service Workers** — Inspect and unregister service workers

---

## Comparison with Other Mobile DevTools

Different tools are built for different needs.

| Feature | Suger DevTool | Eruda | vConsole |
|------|------|------|------|
| Tablet/Mobile Support | ✅ | ✅| ✅|
| Chrome Bookmarklet Support | ✅ | ✅| ✅|
| Console logs | ✅ | ✅ | ✅ |
| Inspect Html | ✅ | ✅ | ❌
| Box model preview | ✅ | ✅ | ❌ |
| Live HTML editing | ✅ | ❌ | ❌ |
| CSS rule editing | ✅ | ❌ | ❌ |
| Color picker | ✅ | ❌ | ❌ |
| Devices Preview | ✅ | ❌ | ❌ |
| Advanced JS debugging | ✅ | ❌ | ❌ |
| Network waterfall (DNS, SSL, TTFB) | ✅ | ❌ | ❌ |
| Computed styles depth | ✅ **Detailed** | Basic | ❌ |
| UI language support | ✅ **Structured/Extensible** | Limited | Limited |
| Extension? | Upcoming | ✅ | Limited |
| Desktop required | No | No | No |
| Min Size | ~3.2MB | ~480KB | ~280KB |
| Lag? | No | No | No |
| Target use case | Deep inspection | Lightweight debug | Logging & network |

---

## Installation (Standalone)

You can use **Suger DevTool** in any HTML/JavaScript project.

---

### Service Worker  
**Required for advanced debugging features** such as network interception and source debugging.

- **File name:** `devtool-sw.js`
- **Location:** Project root (same directory as `index.html`)

> ⚠️ Make sure the service worker file is accessible from the root scope.

---

### Inject Engine

Download or serve the engine locally:

- **File:** `suger-dev.js`

Add before `</body>`:

```html
<script src="dt/suger-dev.js"></script>
````
```cdn
<script src="https://suger-pb43t0o1d-sourav0chand-5264s-projects.vercel.app/suger-dev.js"></script>
````

**File structure:**

```
Your_Project/
├── dt/
│   └── suger-dev.js
├── devtool-sw.js
└── index.html
```

---

### Inject via Chrome Bookmarklet

Serve `suger-dev.js` from localhost and save this as a bookmark URL:

```js
javascript:(function(){
  var script = document.createElement('script');
  script.src = 'http://localhost:8080/dt/suger-dev.js';
  document.body.appendChild(script);
})();
```

Open any website and run the saved bookmark.

---

## Licensing

> **Note:** Suger DevTool is premium software.

* License is bound to a single device for fair usage
* Offline usage supported After using product key 
* Designed for debugging and development purposes

### Access Options

* **Free Trial:** free trial
* **Lifetime License:** One-time purchase at a minimal price

---

## Limitations

* Native browser rendering and layout pipeline cannot be paused
* Media playback and some CSS animations may continue while paused
* Not intended for production runtime usage

---

## Support

* **Website:** [https://suger-devtool.vercel.app](https://suger-devtool.vercel.app)
* **Telegram:** @cosmodec
