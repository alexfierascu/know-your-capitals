/**
 * Utility functions
 */

import { COUNTRY_CODES } from './constants.js';

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Switch between screens with transition
 */
export function showScreen(screenId) {
    const currentScreen = document.querySelector('.screen.active');
    const nextScreen = document.getElementById(screenId);

    if (currentScreen) {
        currentScreen.classList.add('fade-out');
        setTimeout(() => {
            currentScreen.classList.remove('active', 'fade-out');
            nextScreen.classList.add('active');
        }, 300);
    } else {
        nextScreen.classList.add('active');
    }
}

/**
 * Get letter for option index (A, B, C, D)
 */
export function getOptionLetter(index) {
    return String.fromCharCode(65 + index);
}

/**
 * Get country code for flags
 */
export function getCountryCode(countryName) {
    return COUNTRY_CODES[countryName] || 'eu';
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
}
