/**
 * Stats modal functionality
 * Works with StatsModal Web Component
 */

import { state } from '../data/state.js';
import { elements } from './elements.js';
import { ACHIEVEMENTS, STORAGE_KEYS } from '../utils/constants.js';
import { loadFromStorage, exportProgress, importProgress } from '../data/storage.js';
import { t } from '../utils/i18n.js';
import { renderLeaderboard } from './leaderboard.js';
import { getCountryMasteryLevel } from './progress.js';

export function setupModalListeners(callbacks = {}) {
    const { onImportSuccess } = callbacks;
    const modal = elements.statsModal;

    // Listen for tab changes
    modal.addEventListener('tab-change', (e) => {
        // Tab switching is handled by the component
    });

    // Listen for filter changes
    modal.addEventListener('filter-change', (e) => {
        renderProgressList(e.detail.filter);
    });

    // Listen for export
    modal.addEventListener('export-data', () => {
        exportProgress();
    });

    // Listen for import
    modal.addEventListener('import-data', (e) => {
        importProgress(e.detail.file, {
            onSuccess: () => {
                renderLifetimeStats();
                renderLeaderboard();
                renderAchievements();
                renderProgress();
                if (onImportSuccess) onImportSuccess();
            }
        });
    });
}

export function openStatsModal() {
    const modal = elements.statsModal;
    modal.show();
    modal.translate(t);
    renderLifetimeStats();
    renderLeaderboard();
    renderAchievements();
    renderProgress();
}

export function closeStatsModal() {
    elements.statsModal.close();
}

export function switchTab(tabName) {
    elements.statsModal.switchTab(tabName);
}

export function renderLifetimeStats() {
    const modal = elements.statsModal;
    const stats = loadFromStorage(STORAGE_KEYS.stats, {
        totalQuizzes: 0,
        bestStreakEver: 0,
        totalQuestionsAnswered: 0,
        totalCorrectAnswers: 0,
        totalTimeSpent: 0
    });

    modal.statTotalQuizzes.textContent = stats.totalQuizzes || 0;
    modal.statBestStreak.textContent = stats.bestStreakEver || 0;

    if (stats.totalQuestionsAnswered > 0) {
        const avgTime = stats.totalTimeSpent / stats.totalQuestionsAnswered;
        modal.statAvgTime.textContent = avgTime.toFixed(1) + 's';
    } else {
        modal.statAvgTime.textContent = '-';
    }

    if (stats.totalQuestionsAnswered > 0) {
        const accuracy = (stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100;
        modal.statAccuracy.textContent = accuracy.toFixed(0) + '%';
    } else {
        modal.statAccuracy.textContent = '-';
    }

    renderWeeklySummary();
}

export function renderWeeklySummary() {
    const modal = elements.statsModal;
    const weeklyContainer = modal.weeklySummary;
    if (!weeklyContainer) return;

    const leaderboard = state.leaderboard;
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyEntries = leaderboard.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= oneWeekAgo;
    });

    if (weeklyEntries.length === 0) {
        weeklyContainer.innerHTML = `
            <p class="weekly-empty">No quizzes played this week yet. Start playing to track your weekly progress!</p>
        `;
        return;
    }

    const totalQuizzes = weeklyEntries.length;
    const totalQuestions = weeklyEntries.reduce((sum, e) => sum + e.total, 0);
    const totalCorrect = weeklyEntries.reduce((sum, e) => sum + e.score, 0);
    const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const bestScore = Math.max(...weeklyEntries.map(e => e.percentage));
    const perfectGames = weeklyEntries.filter(e => e.percentage === 100).length;

    const dailyData = {};
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = date.toISOString().split('T')[0];
        dailyData[key] = { quizzes: 0, correct: 0, total: 0 };
    }

    weeklyEntries.forEach(entry => {
        const key = entry.date.split('T')[0];
        if (dailyData[key]) {
            dailyData[key].quizzes++;
            dailyData[key].correct += entry.score;
            dailyData[key].total += entry.total;
        }
    });

    const maxQuizzes = Math.max(...Object.values(dailyData).map(d => d.quizzes), 1);
    const activityBars = Object.entries(dailyData).map(([key, data]) => {
        const height = Math.max((data.quizzes / maxQuizzes) * 100, data.quizzes > 0 ? 10 : 0);
        const accuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
        const date = new Date(key);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        return `
            <div class="weekly-bar-container" title="${data.quizzes} quiz${data.quizzes !== 1 ? 'zes' : ''}${data.total > 0 ? `, ${accuracy}% accuracy` : ''}">
                <div class="weekly-bar" style="height: ${height}%"></div>
                <span class="weekly-bar-label">${dayName}</span>
            </div>
        `;
    }).join('');

    weeklyContainer.innerHTML = `
        <div class="weekly-stats-grid">
            <div class="weekly-stat">
                <span class="weekly-stat-value">${totalQuizzes}</span>
                <span class="weekly-stat-label">Quizzes</span>
            </div>
            <div class="weekly-stat">
                <span class="weekly-stat-value">${avgAccuracy}%</span>
                <span class="weekly-stat-label">Avg Accuracy</span>
            </div>
            <div class="weekly-stat">
                <span class="weekly-stat-value">${bestScore}%</span>
                <span class="weekly-stat-label">Best Score</span>
            </div>
            <div class="weekly-stat">
                <span class="weekly-stat-value">${perfectGames}</span>
                <span class="weekly-stat-label">Perfect Games</span>
            </div>
        </div>
        <div class="weekly-chart">
            <p class="weekly-chart-title">Activity this week</p>
            <div class="weekly-bars">
                ${activityBars}
            </div>
        </div>
    `;
}

export function renderAchievements() {
    const modal = elements.statsModal;
    const grid = modal.achievementsGrid;
    grid.innerHTML = '';

    const achievementList = Object.values(ACHIEVEMENTS);
    const unlockedCount = Object.keys(state.achievements).length;

    modal.achievementsUnlocked.textContent = unlockedCount;
    modal.achievementsTotal.textContent = achievementList.length;

    achievementList.forEach(achievement => {
        const isUnlocked = !!state.achievements[achievement.id];

        const badge = document.createElement('div');
        badge.className = `achievement-badge ${isUnlocked ? 'unlocked' : 'locked'}`;
        badge.innerHTML = `
            <span class="achievement-icon">${achievement.icon}</span>
            <span class="achievement-name">${t(achievement.nameKey)}</span>
            <span class="achievement-desc">${t(achievement.descKey)}</span>
        `;
        grid.appendChild(badge);
    });
}

export function renderProgress() {
    const modal = elements.statsModal;
    let mastered = 0, learning = 0, notSeen = 0;

    state.countries.forEach(country => {
        const level = getCountryMasteryLevel(country.name);
        if (level === 'mastered') mastered++;
        else if (level === 'learning' || level === 'weak') learning++;
        else notSeen++;
    });

    modal.progressMastered.textContent = mastered;
    modal.progressLearning.textContent = learning;
    modal.progressNew.textContent = notSeen;

    renderProgressList('all');
}

export function renderProgressList(filter = 'all') {
    const modal = elements.statsModal;
    const list = modal.progressList;
    list.innerHTML = '';

    const filteredCountries = state.countries.filter(country => {
        const level = getCountryMasteryLevel(country.name);
        if (filter === 'all') return true;
        if (filter === 'mastered') return level === 'mastered';
        if (filter === 'learning') return level === 'learning';
        if (filter === 'weak') return level === 'weak';
        return true;
    });

    filteredCountries.sort((a, b) => {
        const progA = state.countryProgress[a.name];
        const progB = state.countryProgress[b.name];
        const rateA = progA && progA.attempts > 0 ? progA.correct / progA.attempts : -1;
        const rateB = progB && progB.attempts > 0 ? progB.correct / progB.attempts : -1;
        return rateB - rateA;
    });

    filteredCountries.forEach(country => {
        const progress = state.countryProgress[country.name];
        const level = getCountryMasteryLevel(country.name);
        const rate = progress && progress.attempts > 0
            ? Math.round((progress.correct / progress.attempts) * 100)
            : 0;
        const attempts = progress ? progress.attempts : 0;

        const item = document.createElement('div');
        item.className = `progress-item ${level}`;
        item.innerHTML = `
            <div class="progress-item-info">
                <span class="progress-item-country">${country.name}</span>
                <span class="progress-item-capital">${country.capital}</span>
            </div>
            <div class="progress-item-stats">
                <span class="progress-item-rate">${attempts > 0 ? rate + '%' : '—'}</span>
                <span class="progress-item-attempts">${attempts} attempts</span>
            </div>
        `;
        list.appendChild(item);
    });
}
