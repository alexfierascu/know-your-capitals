/**
 * User Stats Module
 * Handles reading/writing user stats to Firestore
 * Uses lazy-loaded Firebase for better initial page load
 */

import { getFirebase, getFirestoreModule } from '../auth/firebaseLazy.js';
import { getCurrentUser } from '../auth/auth.js';
import { STORAGE_KEYS } from '../utils/constants.js';
import { state } from './state.js';

/**
 * Get the user's stats document reference (lazy loaded)
 */
async function getUserDocRef(userId) {
    const { db } = await getFirebase();
    const { doc } = await getFirestoreModule();
    return doc(db, 'users', userId);
}

/**
 * Get current user's ID
 */
function getCurrentUserId() {
    const user = getCurrentUser();
    return user?.uid || null;
}

/**
 * Load user data from Firestore
 */
export async function loadUserData() {
    const userId = getCurrentUserId();
    if (!userId) return null;

    try {
        const { getDoc } = await getFirestoreModule();
        const docRef = await getUserDocRef(userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        console.error('Error loading user data from Firestore:', error);
        return null;
    }
}

/**
 * Save user data to Firestore
 */
export async function saveUserData(data) {
    const userId = getCurrentUserId();
    if (!userId) return false;

    try {
        const { setDoc } = await getFirestoreModule();
        const docRef = await getUserDocRef(userId);
        const user = getCurrentUser();

        const dataToSave = {
            ...data,
            updatedAt: new Date().toISOString(),
            email: user?.email || null
        };

        // Only set displayName if user has one from provider (e.g., Google)
        if (user?.displayName) {
            dataToSave.displayName = user.displayName;
        }

        await setDoc(docRef, dataToSave, { merge: true });
        return true;
    } catch (error) {
        console.error('Error saving user data to Firestore:', error);
        return false;
    }
}

/**
 * Get all user stats for saving
 */
export function getCurrentStatsForSave() {
    return {
        progress: state.countryProgress || {},
        leaderboard: state.leaderboard || [],
        achievements: state.achievements || {},
        stats: getLocalStats()
    };
}

/**
 * Get stats from localStorage
 */
function getLocalStats() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.stats);
        return data ? JSON.parse(data) : getDefaultStats();
    } catch (e) {
        return getDefaultStats();
    }
}

/**
 * Get default stats object
 */
function getDefaultStats() {
    return {
        totalQuizzes: 0,
        perfectScores: 0,
        maxStreak: 0,
        hardQuizzes: 0,
        hardPerfectScores: 0,
        speedRuns: 0,
        perfectNoHints: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        totalTimeSpent: 0
    };
}

/**
 * Get local data from localStorage
 */
export function getLocalData() {
    try {
        return {
            progress: JSON.parse(localStorage.getItem(STORAGE_KEYS.progress) || '{}'),
            leaderboard: JSON.parse(localStorage.getItem(STORAGE_KEYS.leaderboard) || '[]'),
            achievements: JSON.parse(localStorage.getItem(STORAGE_KEYS.achievements) || '{}'),
            stats: getLocalStats()
        };
    } catch (e) {
        console.error('Error reading local data:', e);
        return {
            progress: {},
            leaderboard: [],
            achievements: {},
            stats: getDefaultStats()
        };
    }
}

/**
 * Check if local data exists
 */
export function hasLocalData() {
    const local = getLocalData();
    return (
        Object.keys(local.progress).length > 0 ||
        local.leaderboard.length > 0 ||
        Object.keys(local.achievements).length > 0 ||
        local.stats.totalQuizzes > 0
    );
}

/**
 * Check if cloud data exists
 */
export function hasCloudData(cloudData) {
    if (!cloudData) return false;
    return (
        Object.keys(cloudData.progress || {}).length > 0 ||
        (cloudData.leaderboard || []).length > 0 ||
        Object.keys(cloudData.achievements || {}).length > 0 ||
        (cloudData.stats?.totalQuizzes || 0) > 0
    );
}

/**
 * Apply data to state and localStorage
 */
export function applyData(data) {
    if (!data) return;

    // Update state
    state.countryProgress = data.progress || {};
    state.leaderboard = data.leaderboard || [];
    state.achievements = data.achievements || {};

    // Update localStorage
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(data.progress || {}));
    localStorage.setItem(STORAGE_KEYS.leaderboard, JSON.stringify(data.leaderboard || []));
    localStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify(data.achievements || {}));
    localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(data.stats || getDefaultStats()));
}

/**
 * Merge local and cloud data
 */
export function mergeData(localData, cloudData) {
    // Merge progress - keep highest values
    const mergedProgress = { ...cloudData.progress };
    Object.keys(localData.progress || {}).forEach(country => {
        const local = localData.progress[country];
        const cloud = mergedProgress[country] || { correct: 0, attempts: 0 };
        mergedProgress[country] = {
            correct: Math.max(local.correct || 0, cloud.correct || 0),
            attempts: Math.max(local.attempts || 0, cloud.attempts || 0)
        };
    });

    // Merge leaderboard - combine and sort, keep top 10
    const allScores = [...(localData.leaderboard || []), ...(cloudData.leaderboard || [])];
    const mergedLeaderboard = allScores
        .sort((a, b) => b.percentage - a.percentage || b.score - a.score)
        .slice(0, 10);

    // Merge achievements - keep all unlocked
    const mergedAchievements = {
        ...(cloudData.achievements || {}),
        ...(localData.achievements || {})
    };

    // Merge stats - keep highest values
    const localStats = localData.stats || getDefaultStats();
    const cloudStats = cloudData.stats || getDefaultStats();
    const mergedStats = {};
    const allStatKeys = new Set([...Object.keys(localStats), ...Object.keys(cloudStats)]);
    allStatKeys.forEach(key => {
        mergedStats[key] = Math.max(localStats[key] || 0, cloudStats[key] || 0);
    });

    return {
        progress: mergedProgress,
        leaderboard: mergedLeaderboard,
        achievements: mergedAchievements,
        stats: mergedStats
    };
}

/**
 * Clear local data
 */
export function clearLocalData() {
    localStorage.removeItem(STORAGE_KEYS.progress);
    localStorage.removeItem(STORAGE_KEYS.leaderboard);
    localStorage.removeItem(STORAGE_KEYS.achievements);
    localStorage.removeItem(STORAGE_KEYS.stats);
}

/**
 * Check if local and cloud data are different
 */
export function isDataDifferent(localData, cloudData) {
    // If either is missing, not a conflict (handled elsewhere)
    if (!localData || !cloudData) return false;

    // Compare progress - sort keys for consistent comparison
    const localProgressKeys = Object.keys(localData.progress || {}).sort();
    const cloudProgressKeys = Object.keys(cloudData.progress || {}).sort();

    if (localProgressKeys.length !== cloudProgressKeys.length) {
        console.log('[DataSync] Progress length differs:', localProgressKeys.length, cloudProgressKeys.length);
        return true;
    }

    // Compare stats - only compare meaningful fields
    const localStats = localData.stats || {};
    const cloudStats = cloudData.stats || {};

    const localQuizzes = localStats.totalQuizzes || 0;
    const cloudQuizzes = cloudStats.totalQuizzes || 0;

    if (localQuizzes !== cloudQuizzes) {
        console.log('[DataSync] Quiz count differs:', localQuizzes, cloudQuizzes);
        return true;
    }

    // Compare achievements count
    const localAchCount = Object.keys(localData.achievements || {}).length;
    const cloudAchCount = Object.keys(cloudData.achievements || {}).length;

    if (localAchCount !== cloudAchCount) {
        console.log('[DataSync] Achievement count differs:', localAchCount, cloudAchCount);
        return true;
    }

    // Data is essentially the same
    console.log('[DataSync] Data is the same');
    return false;
}

/**
 * Sync current state to Firestore
 */
export async function syncToCloud() {
    const data = getCurrentStatsForSave();
    return await saveUserData(data);
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile() {
    const userId = getCurrentUserId();
    if (!userId) return null;

    try {
        const { getDoc } = await getFirestoreModule();
        const docRef = await getUserDocRef(userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                nickname: data.nickname || '',
                location: data.location || '',
                avatarUrl: data.avatarUrl || null
            };
        }
        return null;
    } catch (error) {
        console.error('Error loading user profile:', error);
        return null;
    }
}

/**
 * Save user profile to Firestore
 */
export async function saveUserProfile(profileData) {
    const userId = getCurrentUserId();
    if (!userId) return false;

    try {
        const { setDoc } = await getFirestoreModule();
        const docRef = await getUserDocRef(userId);

        const dataToSave = {
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            nickname: profileData.nickname || '',
            location: profileData.location || '',
            avatarUrl: profileData.avatarUrl || null,
            profileUpdatedAt: new Date().toISOString()
        };

        await setDoc(docRef, dataToSave, { merge: true });
        console.log('[UserStats] Profile saved');
        return true;
    } catch (error) {
        console.error('Error saving user profile:', error);
        return false;
    }
}

/**
 * Get display name from profile
 */
export function getDisplayNameFromProfile(profile) {
    if (!profile) return null;

    // Priority: nickname > firstName + lastName > firstName
    if (profile.nickname) return profile.nickname;
    if (profile.firstName && profile.lastName) {
        return `${profile.firstName} ${profile.lastName}`;
    }
    if (profile.firstName) return profile.firstName;

    return null;
}

/**
 * Reset all user progress (local and cloud)
 */
export async function resetAllProgress() {
    const userId = getCurrentUserId();

    // Clear local storage
    clearLocalData();

    // Reset state
    state.countryProgress = {};
    state.leaderboard = [];
    state.achievements = {};

    // Delete from Firestore if user is logged in
    if (userId) {
        try {
            const { deleteDoc } = await getFirestoreModule();
            const docRef = await getUserDocRef(userId);
            await deleteDoc(docRef);
            console.log('[UserStats] Cloud data deleted');
        } catch (error) {
            console.error('Error deleting user data from Firestore:', error);
            return false;
        }
    }

    console.log('[UserStats] All progress reset');
    return true;
}
