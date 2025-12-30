/**
 * Global Leaderboard Module
 * Handles reading/writing global leaderboard to Firestore
 */

import { getFirebase, getFirestoreModule } from '../auth/firebaseLazy.js';
import { getCurrentUser, isGuest } from '../auth/auth.js';
import { getUserProfile, getDisplayNameFromProfile } from './userStats.js';

// Cache for global leaderboard
let cachedLeaderboard = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60000; // 1 minute cache

/**
 * Get the global leaderboard collection reference
 */
async function getLeaderboardCollection() {
    const { db } = await getFirebase();
    const { collection } = await getFirestoreModule();
    return collection(db, 'globalLeaderboard');
}

/**
 * Submit a score to the global leaderboard
 * Only for registered (non-guest) users
 */
export async function submitToGlobalLeaderboard(scoreData) {
    const user = getCurrentUser();
    if (!user || user.isAnonymous) {
        console.log('[GlobalLeaderboard] Guest users cannot submit to global leaderboard');
        return false;
    }

    try {
        const { addDoc, serverTimestamp } = await getFirestoreModule();
        const collectionRef = await getLeaderboardCollection();

        // Get user profile for display name and avatar
        const profile = await getUserProfile();
        const displayName = getDisplayNameFromProfile(profile) ||
                           user.displayName ||
                           user.email?.split('@')[0] ||
                           'Anonymous';

        const entry = {
            userId: user.uid,
            displayName: displayName,
            avatarUrl: profile?.avatarUrl || user.photoURL || null,
            score: scoreData.score,
            total: scoreData.total,
            percentage: Math.round((scoreData.score / scoreData.total) * 100),
            difficulty: scoreData.difficulty,
            region: scoreData.region,
            gameMode: scoreData.gameMode || 'classic',
            timestamp: serverTimestamp()
        };

        await addDoc(collectionRef, entry);
        console.log('[GlobalLeaderboard] Score submitted successfully');

        // Invalidate cache
        cachedLeaderboard = null;
        cacheTimestamp = 0;

        return true;
    } catch (error) {
        console.error('[GlobalLeaderboard] Error submitting score:', error);
        return false;
    }
}

/**
 * Get timestamp for time range filtering
 */
function getTimeRangeTimestamp(timeRange) {
    if (!timeRange || timeRange === 'all') return null;

    const now = new Date();
    if (timeRange === 'week') {
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === 'month') {
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    return null;
}

/**
 * Fetch global leaderboard entries
 * @param {Object} filters - Optional filters { difficulty, region, gameMode, timeRange }
 * @param {number} limit - Max entries to fetch (default 50)
 */
export async function fetchGlobalLeaderboard(filters = {}, limit = 50) {
    // Check cache
    const cacheKey = JSON.stringify(filters);
    if (cachedLeaderboard &&
        cachedLeaderboard.key === cacheKey &&
        Date.now() - cacheTimestamp < CACHE_DURATION) {
        return cachedLeaderboard.data;
    }

    try {
        const { query, orderBy, limit: limitFn, getDocs, where, Timestamp } = await getFirestoreModule();
        const collectionRef = await getLeaderboardCollection();

        // Build query with filters
        let constraints = [];

        if (filters.difficulty && filters.difficulty !== 'all') {
            constraints.push(where('difficulty', '==', filters.difficulty));
        }
        if (filters.region && filters.region !== 'all') {
            constraints.push(where('region', '==', filters.region));
        }
        if (filters.gameMode && filters.gameMode !== 'all') {
            constraints.push(where('gameMode', '==', filters.gameMode));
        }

        // Time range filter
        const timeRangeDate = getTimeRangeTimestamp(filters.timeRange);
        if (timeRangeDate) {
            constraints.push(where('timestamp', '>=', Timestamp.fromDate(timeRangeDate)));
        }

        // Always order by percentage descending, then by timestamp
        constraints.push(orderBy('percentage', 'desc'));
        constraints.push(limitFn(limit));

        const q = query(collectionRef, ...constraints);
        const querySnapshot = await getDocs(q);

        const entries = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            entries.push({
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toDate?.() || new Date()
            });
        });

        // Cache the result
        cachedLeaderboard = { key: cacheKey, data: entries };
        cacheTimestamp = Date.now();

        return entries;
    } catch (error) {
        console.error('[GlobalLeaderboard] Error fetching leaderboard:', error);
        return [];
    }
}

/**
 * Get current user's rank in global leaderboard
 */
export async function getUserGlobalRank(filters = {}) {
    const user = getCurrentUser();
    if (!user || user.isAnonymous) return null;

    const entries = await fetchGlobalLeaderboard(filters, 100);
    const userEntry = entries.find(e => e.userId === user.uid);

    if (!userEntry) return null;

    const rank = entries.indexOf(userEntry) + 1;
    return { rank, entry: userEntry };
}

/**
 * Clear the leaderboard cache
 */
export function clearLeaderboardCache() {
    cachedLeaderboard = null;
    cacheTimestamp = 0;
}
