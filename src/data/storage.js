/**
 * LocalStorage functions
 */

import { STORAGE_KEYS } from '../utils/constants.js';
import { state } from './state.js';
import { t } from '../utils/i18n.js';
import { debouncedSave } from './dataSync.js';

export function loadFromStorage(key, defaultValue = {}) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('Error loading from storage:', e);
        return defaultValue;
    }
}

export function saveToStorage(key, data, syncToCloud = true) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        // Trigger cloud sync for user data keys
        if (syncToCloud && Object.values(STORAGE_KEYS).includes(key)) {
            debouncedSave();
        }
    } catch (e) {
        console.error('Error saving to storage:', e);
    }
}

export function loadAllStoredData() {
    state.countryProgress = loadFromStorage(STORAGE_KEYS.progress, {});
    state.leaderboard = loadFromStorage(STORAGE_KEYS.leaderboard, []);
    state.achievements = loadFromStorage(STORAGE_KEYS.achievements, {});
}

export function exportProgress() {
    const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        progress: loadFromStorage(STORAGE_KEYS.progress, {}),
        leaderboard: loadFromStorage(STORAGE_KEYS.leaderboard, []),
        achievements: loadFromStorage(STORAGE_KEYS.achievements, {}),
        stats: loadFromStorage(STORAGE_KEYS.stats, {})
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `euro-capitals-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function importProgress(file, callbacks = {}) {
    const { onSuccess, onError } = callbacks;
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);

            if (!data.progress && !data.leaderboard && !data.achievements && !data.stats) {
                alert(t('data.invalidFile'));
                return;
            }

            if (!confirm(t('data.confirmReplace'))) {
                return;
            }

            if (data.progress) {
                saveToStorage(STORAGE_KEYS.progress, data.progress);
                state.countryProgress = data.progress;
            }
            if (data.leaderboard) {
                saveToStorage(STORAGE_KEYS.leaderboard, data.leaderboard);
                state.leaderboard = data.leaderboard;
            }
            if (data.achievements) {
                saveToStorage(STORAGE_KEYS.achievements, data.achievements);
                state.achievements = data.achievements;
            }
            if (data.stats) {
                saveToStorage(STORAGE_KEYS.stats, data.stats);
            }

            if (onSuccess) onSuccess();
            alert(t('data.importSuccess'));
        } catch (err) {
            alert(t('data.importError'));
            console.error('Import error:', err);
            if (onError) onError(err);
        }
    };
    reader.readAsText(file);
}

export function getStats() {
    const progress = state.countryProgress;
    const countries = Object.keys(progress);

    let masteredCountries = 0;
    let balkansMastered = 0;
    let nordicMastered = 0;

    const balkanCountries = ['Croatia', 'Slovenia', 'Serbia', 'Bosnia and Herzegovina', 'North Macedonia', 'Montenegro', 'Albania', 'Kosovo'];
    const nordicCountries = ['Sweden', 'Norway', 'Denmark', 'Finland', 'Iceland'];

    countries.forEach(country => {
        const p = progress[country];
        const rate = p.attempts > 0 ? p.correct / p.attempts : 0;
        if (rate >= 0.8 && p.attempts >= 3) {
            masteredCountries++;
            if (balkanCountries.includes(country)) balkansMastered++;
            if (nordicCountries.includes(country)) nordicMastered++;
        }
    });

    const storedStats = loadFromStorage(STORAGE_KEYS.stats, {
        totalQuizzes: 0,
        perfectScores: 0,
        maxStreak: 0,
        hardQuizzes: 0,
        hardPerfectScores: 0,
        speedRuns: 0,
        perfectNoHints: 0
    });

    return {
        ...storedStats,
        masteredCountries,
        balkansMastered,
        nordicMastered
    };
}

export function updateStats(updates) {
    const stats = loadFromStorage(STORAGE_KEYS.stats, {
        totalQuizzes: 0,
        perfectScores: 0,
        maxStreak: 0,
        hardQuizzes: 0,
        hardPerfectScores: 0,
        speedRuns: 0,
        perfectNoHints: 0
    });

    Object.keys(updates).forEach(key => {
        if (typeof updates[key] === 'number') {
            stats[key] = Math.max(stats[key] || 0, updates[key]);
        }
    });

    saveToStorage(STORAGE_KEYS.stats, stats);
}
