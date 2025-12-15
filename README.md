<div align="center">
<img src="https://i.postimg.cc/G3536HzL/suger-dt.png" width="80" alt="Suger DevTool Logo">

# Suger DevTool – Mobile DevTools
**Advanced JavaScript Debugger & DOM Inspector for Mobile WebViews**

[![License](https://img.shields.io/badge/License-Premium-blue?style=flat-square)](https://suger-devtool-7so18425t-sourav0chand-5264s-projects.vercel.app)
![V8 Parity](https://img.shields.io/badge/V8_Parity-90%25-success?style=flat-square)
![Platform](https://img.shields.io/badge/Platform-Mobile%20%7C%20Web-lightgrey?style=flat-square)
</div>

<div style="width:100%;max-width:1200px;border-radius:0;">
                <img src="https://i.postimg.cc/JhYVRxLj/Picsart-25-11-23-11-08-42-726.png" class="main-app-img" style="width:100%;max-width:1200px;border-radius:0;" >
            </div>

## What is Suger DevTool?

Suger DevTool is a standalone, high-performance debugging engine designed to provide a desktop-class development experience on mobile devices.

Built with pure JS , It supports advanced features like **Async/Await stepping**, **Closure Scope capture**, and **Real-time Network interception**.

It is specifically optimized for **Browser** , **Acode**, and **WebView-based** projects where native Chrome DevTools are unavailable.

---

## **Key Features**

### **Pro Source Debugger**
Unlike simple loggers, this is a fully interactive debugger.

- `Async Support` — Step through asynchronous code, Promises, Event Listeners & Pause your Html page .
- `Breakpoints` — Set line breakpoints in inline scripts and external files.  
- `Scope Analysis` — Inspect Local, Closure, Block, and Global variables in real-time.  
- `Watch Expressions` — Monitor variables as execution progresses.

---

### **Elements Inspector**

- `DOM Tree` — Fully interactive DOM tree with expand/collapse.  
- `Live Edit` — Edit tags, attributes, and text content.  
- `Computed Styles` — View box model and computed CSS.  
- `Layout Tools` — Grid & Flexbox visualization overlays.

---

### **Network Inspector**

- `Waterfall Chart` — Visual request timing (DNS, SSL, TTFB, Download).  
- `Interception` — View headers, payloads, and responses.  
- `XHR Breakpoints` — Pause on specific network calls.

---

### **Application Manager**

- `Storage` — LocalStorage, SessionStorage, Cookies viewer.  
- `Deep Inspect` — IndexedDB & Cache Storage explorer.  
- `Service Workers` — Inspect and unregister SWs.

---

## **Installation (Standalone)**

You can use **Suger DevTool** in any HTML/JS project.

### **Service Worker (Optional Required for Debugging)**

Essential for **Network Interception** and **Source Debugging**.  
Must be placed in your project **root directory**.

**File Name:** `devtool-sw.js`  
**Download:** *Get devtool-sw.js*  

> **Important:** Place this file next to your `index.html`.

---

### **Inject Engine**

Download or serve locally:

**Download:** *Get suger-dev.js*

Add this before `</body>`:

```html
<script src="dt/suger-dev.js"></script>
````

**File Stucture:**

```
└── □ Your_Project_Folder/-
    ├── dt/-
    │   ├── suger-dev.js
    ├── devtool-sw.js
    ├── index.html <- your html file with suger <script>
```

---

### **Inject Engine in Chrome Bookmarklet**

**Serve suger-dev.js file** *on localhost*

**Save this into chrome bookmark url**

```js
javascript:(function(){
  var script = document.createElement('script');
  script.src = 'http://localhost:8080/dt/suger-dev.js'; 
  document.body.appendChild(script);
})();
````

**open any website & run saved bookmark**

---

## **Licensing**

> **Note:** Suger DevTool is premium software protected by device fingerprinting.

To use it, you need a **valid License Key**.

* **Purchase Key:** Visit the official website
* **Free Trial:** 2-day trial available (contact support)

**Activation:**

* Enter license key on first load
* Key binds to device
* Supports offline mode for **48 hours**

---

## **Support**

**Website:** [https://suger-devtool.vercel.app](https://suger-devtool.vercel.app)
**Telegram:** @cosmodec
