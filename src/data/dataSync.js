/**
 * Data Sync Module
 * Handles syncing user data between localStorage and Firestore
 */

import { onAuthChange, getCurrentUser, isGuest } from '../auth/auth.js';
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

// Key for storing guest user ID
const GUEST_UID_KEY = 'quiz-guest-uid';

// Migration modal and data
let migrationModal = null;
let cloudData = null;
let localData = null;
let migrationResolve = null;

/**
 * Initialize data sync
 */
export function initDataSync() {
    // Get modal Web Component
    migrationModal = document.getElementById('migration-modal');

    if (!migrationModal) {
        console.warn('[DataSync] Migration modal not found in DOM');
    } else {
        // Listen for migration choice from Web Component
        migrationModal.addEventListener('migration-choice', (e) => {
            handleMigrationChoice(e.detail.choice);
        });
    }

    console.log('[DataSync] Initialized, modal found:', !!migrationModal);

    // Listen for auth state changes
    onAuthChange(handleAuthChange);
}

/**
 * Handle auth state changes
 */
async function handleAuthChange(user) {
    if (user) {
        // Check if this is a guest user with a different UID (new session)
        if (user.isAnonymous) {
            const storedGuestUid = localStorage.getItem(GUEST_UID_KEY);

            if (storedGuestUid && storedGuestUid !== user.uid) {
                // Different guest user - clear all local data for fresh start
                console.log('[DataSync] New guest session detected, clearing local data');
                clearLocalData();
                // Reset state
                state.countryProgress = {};
                state.leaderboard = [];
                state.achievements = {};
            }

            // Store current guest UID
            localStorage.setItem(GUEST_UID_KEY, user.uid);
        } else {
            // Non-guest user - clear guest UID if exists
            localStorage.removeItem(GUEST_UID_KEY);
        }

        await handleUserLogin();
    } else {
        // User logged out - clear guest UID
        localStorage.removeItem(GUEST_UID_KEY);
    }
}

/**
 * Handle user login - check for data conflicts
 */
async function handleUserLogin() {
    const user = getCurrentUser();
    if (!user) return;

    // Guest users only use localStorage - no cloud sync
    if (user.isAnonymous) {
        console.log('[DataSync] Guest user - using localStorage only');
        localData = getLocalData();
        applyData(localData);
        return;
    }

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
            migrationModal.show();
        }
    });
}

/**
 * Handle migration choice
 */
async function handleMigrationChoice(choice) {
    console.log('[DataSync] Migration choice:', choice);
    // Modal closes itself after dispatching the event

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

    // Guest users only use localStorage - no cloud sync
    if (user.isAnonymous) return;

    // Then sync to cloud for registered users
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
