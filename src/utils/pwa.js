/**
 * PWA Install Prompt Handler
 * Captures beforeinstallprompt and provides install functionality
 */

import { t } from './i18n.js';

let deferredPrompt = null;
let installButton = null;
let installBanner = null;
let isIOS = false;
let isIOSSafari = false;

/**
 * Detect iOS device
 */
function detectIOS() {
    const ua = window.navigator.userAgent;
    isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    isIOSSafari = isIOS && /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
    return isIOS;
}

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
    return deferredPrompt !== null || isIOSSafari;
}

/**
 * Initialize PWA install prompt handling
 */
export function initPWAInstall() {
    // Detect iOS first
    detectIOS();

    // Don't show if already installed
    if (isAppInstalled()) {
        console.log('App is already installed');
        return;
    }

    // Create the install banner element
    createInstallBanner();

    // For iOS Safari, show instructions after a short delay
    if (isIOSSafari) {
        setTimeout(() => showInstallUI(), 2000);
        return;
    }

    // For non-iOS, capture the install prompt
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
}

/**
 * Create the install banner element
 */
function createInstallBanner() {
    installBanner = document.createElement('div');
    installBanner.id = 'pwa-install-banner';
    installBanner.className = 'pwa-install-banner';
    installBanner.hidden = true;

    if (isIOSSafari) {
        // iOS Safari specific banner with instructions
        installBanner.classList.add('pwa-install-banner--ios');
        installBanner.innerHTML = `
            <div class="pwa-install-content">
                <div class="pwa-install-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
                        <polyline points="16 6 12 2 8 6"/>
                        <line x1="12" y1="2" x2="12" y2="15"/>
                    </svg>
                </div>
                <div class="pwa-install-text">
                    <span class="pwa-install-title" data-i18n="pwa.installTitle">Install App</span>
                    <span class="pwa-install-desc pwa-install-desc--ios" data-i18n="pwa.iosInstallDesc">Tap the share button and select "Add to Home Screen"</span>
                </div>
            </div>
            <div class="pwa-install-actions">
                <button class="pwa-install-btn pwa-install-btn--dismiss" data-i18n="pwa.gotIt">Got it</button>
            </div>
            <div class="pwa-ios-steps">
                <div class="pwa-ios-step">
                    <span class="pwa-ios-step-num">1</span>
                    <span class="pwa-ios-step-text" data-i18n="pwa.iosStep1">Tap the share button</span>
                    <svg class="pwa-ios-share-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
                        <polyline points="16 6 12 2 8 6"/>
                        <line x1="12" y1="2" x2="12" y2="15"/>
                    </svg>
                </div>
                <div class="pwa-ios-step">
                    <span class="pwa-ios-step-num">2</span>
                    <span class="pwa-ios-step-text" data-i18n="pwa.iosStep2">Select "Add to Home Screen"</span>
                    <svg class="pwa-ios-add-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                </div>
            </div>
        `;
    } else {
        // Standard banner for Android/Desktop
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
    }

    document.body.appendChild(installBanner);

    // Add event listeners
    const installBtn = installBanner.querySelector('.pwa-install-btn--install');
    if (installBtn) {
        installBtn.addEventListener('click', promptInstall);
    }
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
