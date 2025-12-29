/**
 * Internationalization (i18n)
 */

import i18next from 'i18next';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './constants.js';
import { state } from './state.js';
import { elements } from './elements.js';

let translations = {};

export async function initI18n() {
    const savedLang = localStorage.getItem('quiz-language');
    const browserLang = navigator.language.split('-')[0];
    const initialLang = savedLang || (SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : DEFAULT_LANGUAGE);

    // Load translations for all supported languages
    await Promise.all(SUPPORTED_LANGUAGES.map(async (lang) => {
        try {
            const response = await fetch(`locales/${lang}.json`);
            translations[lang] = await response.json();
        } catch (e) {
            console.error(`Failed to load translations for ${lang}:`, e);
            translations[lang] = {};
        }
    }));

    // Initialize i18next
    await i18next.init({
        lng: initialLang,
        fallbackLng: DEFAULT_LANGUAGE,
        resources: Object.fromEntries(
            SUPPORTED_LANGUAGES.map(lang => [lang, { translation: translations[lang] }])
        ),
        interpolation: {
            escapeValue: false
        }
    });

    // Update UI
    updateLanguageUI(initialLang);
    translatePage();
}

export function t(key, options = {}) {
    return i18next.t(key, options);
}

export function translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');

        if (key.startsWith('[')) {
            const match = key.match(/\[(\w+)\](.+)/);
            if (match) {
                const attr = match[1];
                const translationKey = match[2];
                element.setAttribute(attr, t(translationKey));
            }
        } else {
            element.textContent = t(key);
        }
    });

    // Update HTML lang attribute
    document.documentElement.lang = i18next.language;
}

export function changeLanguage(lang, callbacks = {}) {
    const { onComplete } = callbacks;

    if (!SUPPORTED_LANGUAGES.includes(lang)) return;

    i18next.changeLanguage(lang).then(() => {
        localStorage.setItem('quiz-language', lang);
        updateLanguageUI(lang);
        translatePage();

        if (onComplete) onComplete();
    });
}

export function updateLanguageUI(lang) {
    const langCode = document.getElementById('current-lang-code');
    if (langCode) {
        langCode.textContent = lang.toUpperCase();
    }

    document.querySelectorAll('.language-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

export function setupLanguageSelector(callbacks = {}) {
    const { onLanguageChange } = callbacks;

    const toggle = document.getElementById('language-toggle');
    const dropdown = document.getElementById('language-dropdown');

    if (!toggle || !dropdown) return;

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.hidden = !dropdown.hidden;
    });

    document.querySelectorAll('.language-option').forEach(btn => {
        btn.addEventListener('click', () => {
            changeLanguage(btn.dataset.lang, {
                onComplete: onLanguageChange
            });
            dropdown.hidden = true;
        });
    });

    document.addEventListener('click', () => {
        dropdown.hidden = true;
    });
}

export async function loadFunFacts() {
    const lang = i18next.language;
    const fileName = `locales/fun-facts-${lang}.json`;

    try {
        const response = await fetch(fileName);
        if (response.ok) {
            state.funFacts = await response.json();
        } else {
            const fallback = await fetch('locales/fun-facts-en.json');
            state.funFacts = await fallback.json();
        }
    } catch (e) {
        console.error('Failed to load fun facts:', e);
    }
}

export function getCurrentLanguage() {
    return i18next.language;
}
