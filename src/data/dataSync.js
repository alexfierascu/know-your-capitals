/**
 * Data Sync Module
 * Handles syncing user data between localStorage and Firestore
 */

import { onAuthChange, getCurrentUser } from '../auth/auth.js';
import {
    loadUserData,
    saveUserData,
    getLocalData,
    hasLocalData,
    hasCloudData,
    applyData,
    mergeData,
    clearLocalData,
    syncToCloud,
    isDataDifferent
} from './userStats.js';
import { state } from './state.js';
import { STORAGE_KEYS } from '../utils/constants.js';

// Migration modal elements
let migrationModal = null;
let cloudData = null;
let localData = null;
let migrationResolve = null;

/**
 * Initialize data sync
 */
export function initDataSync() {
    // Get modal elements
    migrationModal = document.getElementById('migration-modal');

    if (!migrationModal) {
        console.warn('[DataSync] Migration modal not found in DOM');
    }

    // Setup migration button handlers
    const cloudBtn = document.getElementById('migration-cloud');
    const localBtn = document.getElementById('migration-local');
    const mergeBtn = document.getElementById('migration-merge');

    if (cloudBtn) cloudBtn.addEventListener('click', () => handleMigrationChoice('cloud'));
    if (localBtn) localBtn.addEventListener('click', () => handleMigrationChoice('local'));
    if (mergeBtn) mergeBtn.addEventListener('click', () => handleMigrationChoice('merge'));

    console.log('[DataSync] Initialized, modal found:', !!migrationModal);

    // Listen for auth state changes
    onAuthChange(handleAuthChange);
}

/**
 * Handle auth state changes
 */
async function handleAuthChange(user) {
    if (user) {
        await handleUserLogin();
    } else {
        // User logged out - keep local data as is
        // Data will be loaded fresh on next login
    }
}

/**
 * Handle user login - check for data conflicts
 */
async function handleUserLogin() {
    const user = getCurrentUser();
    if (!user) return;

    try {
        // Load data from both sources
        cloudData = await loadUserData();
        localData = getLocalData();

        const hasLocal = hasLocalData();
        const hasCloud = hasCloudData(cloudData);

        console.log('[DataSync] Login check:', { hasLocal, hasCloud });

        if (hasLocal && hasCloud) {
            // Check if data is actually different
            const isDifferent = isDataDifferent(localData, cloudData);
            console.log('[DataSync] Data different:', isDifferent);

            if (isDifferent) {
                // Conflict - show migration modal
                await showMigrationModal();
            } else {
                // Data is the same - just use cloud data
                applyData(cloudData);
            }
        } else if (hasCloud && !hasLocal) {
            // Only cloud data exists - use it
            console.log('[DataSync] Using cloud data');
            applyData(cloudData);
        } else if (hasLocal && !hasCloud) {
            // Only local data exists - sync to cloud
            console.log('[DataSync] Syncing local to cloud');
            await syncToCloud();
        } else {
            console.log('[DataSync] No data found, starting fresh');
        }
    } catch (error) {
        console.error('[DataSync] Error during login:', error);
    }
}

/**
 * Show migration modal and wait for user choice
 */
function showMigrationModal() {
    return new Promise((resolve) => {
        migrationResolve = resolve;
        if (migrationModal) {
            migrationModal.hidden = false;
        }
    });
}

/**
 * Hide migration modal
 */
function hideMigrationModal() {
    if (migrationModal) {
        migrationModal.hidden = true;
    }
}

/**
 * Handle migration choice
 */
async function handleMigrationChoice(choice) {
    console.log('[DataSync] Migration choice:', choice);
    hideMigrationModal();

    try {
        switch (choice) {
            case 'cloud':
                // Use cloud data, discard local
                applyData(cloudData);
                break;

            case 'local':
                // Use local data, replace cloud
                applyData(localData);
                await syncToCloud();
                break;

            case 'merge':
                // Merge both datasets
                const merged = mergeData(localData, cloudData);
                applyData(merged);
                await syncToCloud();
                break;
        }
        console.log('[DataSync] Migration completed successfully');
    } catch (error) {
        console.error('[DataSync] Migration error:', error);
    }

    if (migrationResolve) {
        migrationResolve();
        migrationResolve = null;
    }
}

/**
 * Save current state to Firestore (call after any state change)
 */
export async function saveProgress() {
    const user = getCurrentUser();
    if (!user) return;

    // Save to localStorage first (always)
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(state.countryProgress || {}));
    localStorage.setItem(STORAGE_KEYS.leaderboard, JSON.stringify(state.leaderboard || []));
    localStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify(state.achievements || {}));

    // Then sync to cloud
    await syncToCloud();
}

/**
 * Debounced save to prevent too many writes
 */
let saveTimeout = null;
let isInitialized = false;

export function debouncedSave() {
    // Don't sync if not initialized or no user
    if (!isInitialized) return;

    const user = getCurrentUser();
    if (!user) return;

    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(() => {
        saveProgress();
    }, 2000); // Wait 2 seconds after last change
}

/**
 * Mark dataSync as initialized
 */
export function markInitialized() {
    isInitialized = true;
}
