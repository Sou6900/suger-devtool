import enUS from './locales/en-US.js';
import bnBD from './locales/bn-IN.js'; // বাংলা
import esES from './locales/es-ES.js'; // Spanish
import ptBR from './locales/pt-BR.js'; // Portuguese
import hiIN from './locales/hi-IN.js'; // Hindi
import idID from './locales/id-ID.js'; // Indonesian
import jaJP from './locales/ja-JP.js'; // Japanese
import zhCN from './locales/zh-CN.js'; // Chinese
import ruRU from './locales/ru-RU.js'; // Russian
import aR from './locales/ar.js';      // Arabic

window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.LanguageManager = (function() {

    const SecureStorage = window.MyDevTool.SecureStorage;
    
    let currentLang = 'en-US';
    
    const translations = {
        'en-US': enUS,
        'bn-BD': bnBD,
        'es-ES': esES,
        'pt-BR': ptBR,
        'hi-IN': hiIN,
        'id-ID': idID,
        'ja-JP': jaJP,
        'zh-CN': zhCN,
        'ru-RU': ruRU,
        'aR': aR,
    };

    const supportedLanguages = [
        { code: 'en-US', name: 'English (US)' },
        { code: 'bn-BD', name: 'বাংলা (Bengali)' },
        { code: 'es-ES', name: 'Español (Spanish)' },
        { code: 'pt-BR', name: 'Português (Brazil)' },
        { code: 'id-ID', name: 'Bahasa Indonesia' },
        { code: 'hi-IN', name: 'हिन्दी (Hindi)' },
        { code: 'ja-JP', name: '日本語' },
        { code: "zh-CN", name: "中文（简体）" },
        { code: "ru-RU", name: "Русский" },
        { code: "aR", name: "العربية" },
    ];

    function init() {
        if (SecureStorage) {
            currentLang = SecureStorage.getItem('lang') || 'en-US';
        } else {
            // Fallback
            currentLang = localStorage.getItem('devtool-lang') || 'en-US';
        }
        updateDirection(currentLang);
    }

    function t(key, params = {}) {
        const keys = key.split('.');
        
        let obj = translations[currentLang] || translations['en-US']; 
        let fallbackObj = translations['en-US']; 

        let val = getKey(obj, keys);
        
        if (!val) {
            val = getKey(fallbackObj, keys);
        }
        
        if (!val) return key;

        if (typeof val === 'string' && Object.keys(params).length > 0) {
            for (const [pKey, pVal] of Object.entries(params)) {
                val = val.replace(`{${pKey}}`, pVal);
            }
        }
        
        return val;
    }

    function getKey(obj, keys) {
        let current = obj;
        for (let k of keys) {
            if (current && current[k]) {
                current = current[k];
            } else {
                return null;
            }
        }
        return current;
    }

    function setLanguage(langCode, shouldReload = true) {
        if (translations[langCode]) {
            currentLang = langCode;
            
            if (SecureStorage) {
                SecureStorage.setItem('lang', langCode);
            } else {
                localStorage.setItem('devtool-lang', langCode);
            }

            updateDirection(langCode);

            if (shouldReload) location.reload();
        }
    }

    function updateDirection(lang) {
        const dir = lang === 'aR' ? 'rtl' : 'ltr';
        document.documentElement.setAttribute('dir', dir);
    }

    function getLanguage() {
        return currentLang;
    }

    function getSupportedLanguages() {
        return supportedLanguages;
    }

    return {
        init,
        t,
        setLanguage,
        getLanguage,
        getSupportedLanguages
    };
})();