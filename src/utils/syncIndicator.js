/**
 * Sync Indicator Module
 * Shows offline status and pending sync state to users
 */

import { t } from './i18n.js';

let syncIndicator = null;
let syncIndicatorText = null;
let isOffline = false;
let isSyncing = false;
let pendingSyncCount = 0;

/**
 * Initialize the sync indicator
 */
export function initSyncIndicator() {
    syncIndicator = document.getElementById('sync-indicator');
    syncIndicatorText = document.getElementById('sync-indicator-text');

    if (!syncIndicator) {
        console.warn('[SyncIndicator] Element not found');
        return;
    }

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    if (!navigator.onLine) {
        handleOffline();
    }

    console.log('[SyncIndicator] Initialized, online:', navigator.onLine);
}

/**
 * Handle going offline
 */
function handleOffline() {
    isOffline = true;
    updateIndicator();
}

/**
 * Handle coming back online
 */
function handleOnline() {
    isOffline = false;
    // If there were pending changes, show syncing state
    if (pendingSyncCount > 0) {
        showSyncing();
    } else {
        hideIndicator();
    }
}

/**
 * Update the indicator based on current state
 */
function updateIndicator() {
    if (!syncIndicator) return;

    if (isOffline) {
        syncIndicator.hidden = false;
        syncIndicator.classList.remove('syncing');
        syncIndicatorText.textContent = t('pwa.offline') || 'Offline';
        syncIndicatorText.setAttribute('data-i18n', 'pwa.offline');
    } else if (isSyncing) {
        syncIndicator.hidden = false;
        syncIndicator.classList.add('syncing');
        syncIndicatorText.textContent = t('pwa.syncing') || 'Syncing...';
        syncIndicatorText.setAttribute('data-i18n', 'pwa.syncing');
    } else {
        hideIndicator();
    }
}

/**
 * Show syncing state
 */
export function showSyncing() {
    isSyncing = true;
    updateIndicator();
}

/**
 * Hide syncing state
 */
export function hideSyncing() {
    isSyncing = false;
    pendingSyncCount = 0;
    updateIndicator();
}

/**
 * Hide the indicator completely
 */
function hideIndicator() {
    if (!syncIndicator) return;
    syncIndicator.hidden = true;
    syncIndicator.classList.remove('syncing');
}

/**
 * Mark that there's data pending to sync
 */
export function markPendingSync() {
    pendingSyncCount++;
    if (isOffline) {
        updateIndicator();
    }
}

/**
 * Check if currently offline
 */
export function isCurrentlyOffline() {
    return isOffline;
}

/**
 * Check if currently syncing
 */
export function isCurrentlySyncing() {
    return isSyncing;
}
