// src/modules/utils/SecureStorage.js
window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.SecureStorage = (function() {
    
    const STORAGE_KEY = '_sdt_session_v1';
    
    // Simple XOR Obfuscation (to hide from casual eyes)
    const SECRET = "suger_devtool_secret_salt";

    function encrypt(text) {
        const textToChars = text => text.split('').map(c => c.charCodeAt(0));
        const byteHex = n => ("0" + Number(n).toString(16)).substr(-2);
        const applySaltToChar = code => textToChars(SECRET).reduce((a, b) => a ^ b, code);

        return text
            .split('')
            .map(textToChars)
            .map(applySaltToChar)
            .map(byteHex)
            .join('');
    }

    function decrypt(encoded) {
        const textToChars = text => text.split('').map(c => c.charCodeAt(0));
        const applySaltToChar = code => textToChars(SECRET).reduce((a, b) => a ^ b, code);
        
        return encoded
            .match(/.{1,2}/g)
            .map(hex => parseInt(hex, 16))
            .map(applySaltToChar)
            .map(charCode => String.fromCharCode(charCode))
            .join('');
    }

    function loadData() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        try {
            const jsonStr = decrypt(raw);
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error("Storage corrupted");
            return {};
        }
    }

    function saveData(data) {
        try {
            const str = JSON.stringify(data);
            const encrypted = encrypt(str);
            localStorage.setItem(STORAGE_KEY, encrypted);
        } catch (e) {
            console.error("Storage save failed");
        }
    }

    // --- Public API ---

    function setItem(key, value) {
        const data = loadData();
        data[key] = value;
        saveData(data);
    }

    function getItem(key) {
        const data = loadData();
        return data[key] || null;
    }

    function removeItem(key) {
        const data = loadData();
        delete data[key];
        saveData(data);
    }

    function clear() {
        localStorage.removeItem(STORAGE_KEY);
    }

    return { setItem, getItem, removeItem, clear };

})();