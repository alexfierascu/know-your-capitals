/**
 * Achievements system
 */

import { state } from './state.js';
import { elements } from './elements.js';
import { ACHIEVEMENTS, STORAGE_KEYS } from './constants.js';
import { saveToStorage, getStats } from './storage.js';
import { t } from './i18n.js';

export function checkAchievements(providedStats = null) {
    const stats = providedStats || getStats();
    const newlyUnlocked = [];

    Object.values(ACHIEVEMENTS).forEach(achievement => {
        if (!state.achievements[achievement.id] && achievement.check(stats)) {
            state.achievements[achievement.id] = {
                unlockedAt: new Date().toISOString()
            };
            newlyUnlocked.push(achievement);
        }
    });

    if (newlyUnlocked.length > 0) {
        saveToStorage(STORAGE_KEYS.achievements, state.achievements);
        showAchievementToast(newlyUnlocked);
    }

    return newlyUnlocked;
}

export function showAchievementToast(achievements) {
    const achievementsList = achievements.map(a =>
        `<span class="achievement-toast-item">${a.icon} ${t(a.nameKey)}</span>`
    ).join('');

    const title = achievements.length === 1
        ? t('achievements.unlocked')
        : `${achievements.length} ${t('achievements.unlockedPlural')}`;

    elements.achievementToast.innerHTML = `
        <span class="achievement-toast-icon">🏆</span>
        <div class="achievement-toast-content">
            <span class="achievement-toast-title">${title}</span>
            <div class="achievement-toast-list">${achievementsList}</div>
        </div>
    `;

    elements.achievementToast.offsetHeight;
    elements.achievementToast.classList.add('visible');

    const displayTime = 3500 + (achievements.length * 500);

    setTimeout(() => {
        elements.achievementToast.classList.remove('visible');
    }, displayTime);
}
