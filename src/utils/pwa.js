/**
 * PWA Install Prompt Handler
 * Captures beforeinstallprompt and provides install functionality
 */

import { t } from './i18n.js';

let deferredPrompt = null;
let installButton = null;
let installBanner = null;

/**
 * Check if app is already installed
 */
function isAppInstalled() {
    // Check if running in standalone mode (installed PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
    }
    // iOS Safari
    if (window.navigator.standalone === true) {
        return true;
    }
    return false;
}

/**
 * Check if install is supported
 */
export function isInstallSupported() {
    return deferredPrompt !== null;
}

/**
 * Initialize PWA install prompt handling
 */
export function initPWAInstall() {
    // Don't show if already installed
    if (isAppInstalled()) {
        console.log('App is already installed');
        return;
    }

    // Capture the install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67+ from automatically showing the prompt
        e.preventDefault();
        // Store the event for later use
        deferredPrompt = e;
        // Show the install button/banner
        showInstallUI();
        console.log('Install prompt captured');
    });

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
        console.log('App was installed');
        hideInstallUI();
        deferredPrompt = null;
    });

    // Create the install banner element
    createInstallBanner();
}

/**
 * Create the install banner element
 */
function createInstallBanner() {
    installBanner = document.createElement('div');
    installBanner.id = 'pwa-install-banner';
    installBanner.className = 'pwa-install-banner';
    installBanner.hidden = true;
    installBanner.innerHTML = `
        <div class="pwa-install-content">
            <div class="pwa-install-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
            </div>
            <div class="pwa-install-text">
                <span class="pwa-install-title" data-i18n="pwa.installTitle">Install App</span>
                <span class="pwa-install-desc" data-i18n="pwa.installDesc">Add to home screen for quick access</span>
            </div>
        </div>
        <div class="pwa-install-actions">
            <button class="pwa-install-btn pwa-install-btn--dismiss" data-i18n="pwa.later">Later</button>
            <button class="pwa-install-btn pwa-install-btn--install" data-i18n="pwa.install">Install</button>
        </div>
    `;

    document.body.appendChild(installBanner);

    // Add event listeners
    installBanner.querySelector('.pwa-install-btn--install').addEventListener('click', promptInstall);
    installBanner.querySelector('.pwa-install-btn--dismiss').addEventListener('click', dismissInstallBanner);
}

/**
 * Show the install UI
 */
function showInstallUI() {
    if (installBanner) {
        // Check if user dismissed recently (within 7 days)
        const dismissedAt = localStorage.getItem('pwa-install-dismissed');
        if (dismissedAt) {
            const dismissedTime = parseInt(dismissedAt, 10);
            const sevenDays = 7 * 24 * 60 * 60 * 1000;
            if (Date.now() - dismissedTime < sevenDays) {
                return; // Don't show if dismissed within 7 days
            }
        }

        installBanner.hidden = false;
        // Trigger animation
        requestAnimationFrame(() => {
            installBanner.classList.add('pwa-install-banner--visible');
        });
    }
}

/**
 * Hide the install UI
 */
function hideInstallUI() {
    if (installBanner) {
        installBanner.classList.remove('pwa-install-banner--visible');
        setTimeout(() => {
            installBanner.hidden = true;
        }, 300);
    }
}

/**
 * Dismiss the install banner (user clicked "Later")
 */
function dismissInstallBanner() {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    hideInstallUI();
}

/**
 * Prompt the user to install the app
 */
export async function promptInstall() {
    if (!deferredPrompt) {
        console.log('No install prompt available');
        return false;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);

    // Clear the deferred prompt
    deferredPrompt = null;
    hideInstallUI();

    return outcome === 'accepted';
}

/**
 * Get the current install state
 */
export function getInstallState() {
    if (isAppInstalled()) {
        return 'installed';
    }
    if (deferredPrompt) {
        return 'available';
    }
    return 'unavailable';
}
