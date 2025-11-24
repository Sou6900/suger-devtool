<div align="center">
<img src="https://i.postimg.cc/kMf1dhFP/icon.png" width="80" alt="Suger DevTool Logo">

# **Suger DevTool**
**Advanced JavaScript Debugger & DOM Inspector for Mobile WebViews**

[![License](https://img.shields.io/badge/License-Premium-blue?style=flat-square)](https://suger-devtool-7so18425t-sourav0chand-5264s-projects.vercel.app)
![V8 Parity](https://img.shields.io/badge/V8_Parity-90%25-success?style=flat-square)
![Platform](https://img.shields.io/badge/Platform-Mobile%20%7C%20Web-lightgrey?style=flat-square)
</div>

<div style="width:100%;max-width:1200px;border-radius:0;">
                <img src="https://i.postimg.cc/JhYVRxLj/Picsart-25-11-23-11-08-42-726.png" class="main-app-img" style="width:100%;max-width:1200px;border-radius:0;" >
            </div>

Suger DevTool is a standalone, high-performance debugging engine designed to provide a desktop-class development experience on mobile devices.

Built with a custom Babel-based instrumenter, it supports advanced features like **Async/Await stepping**, **Closure Scope capture**, and **Real-time Network interception**.

It is specifically optimized for **Acode**, **Termux**, and **WebView-based** projects where native Chrome DevTools are unavailable.

---

## **Key Features**

### **Pro Source Debugger**
Unlike simple loggers, this is a fully interactive debugger.

- `Async Support` — Step through asynchronous code, Promises, and Event Listeners without freezing the UI.  
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

### **Step 1: Service Worker (Required)**

Essential for **Network Interception** and **Source Debugging**.  
Must be placed in your project **root directory**.

**File Name:** `devtool-sw.js`  
**Download:** *Get devtool-sw.js*  

> **Important:** Place this file next to your `index.html`.

---

### **Step 2: Inject Engine**

Download or serve locally:

**Download:** *Get suger-dev.js*

Add this before `</body>`:

```html
<script src="js/suger-dev_1.0.0v.js"></script>
````

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
