/**
 * Country progress tracking
 */

import { state } from '../data/state.js';
import { STORAGE_KEYS } from '../utils/constants.js';
import { saveToStorage } from '../data/storage.js';

export function updateCountryProgress(countryName, isCorrect) {
    if (!state.countryProgress[countryName]) {
        state.countryProgress[countryName] = { attempts: 0, correct: 0 };
    }

    state.countryProgress[countryName].attempts++;
    if (isCorrect) {
        state.countryProgress[countryName].correct++;
    }

    saveToStorage(STORAGE_KEYS.progress, state.countryProgress);
}

export function getCountryMasteryLevel(countryName) {
    const progress = state.countryProgress[countryName];
    if (!progress || progress.attempts === 0) return 'new';

    const rate = progress.correct / progress.attempts;
    if (rate >= 0.8 && progress.attempts >= 3) return 'mastered';
    if (rate >= 0.5) return 'learning';
    return 'weak';
}
