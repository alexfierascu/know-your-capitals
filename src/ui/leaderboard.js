/**
 * Leaderboard functionality
 */

import { state } from '../data/state.js';
import { elements } from './elements.js';
import { STORAGE_KEYS } from '../utils/constants.js';
import { saveToStorage } from '../data/storage.js';
import { escapeHtml } from '../utils/utils.js';
import { getRegionName } from './share.js';

export function saveToLeaderboard(name, score, total, difficulty, region) {
    const percentage = Math.round((score / total) * 100);

    const entry = {
        name,
        score,
        total,
        percentage,
        difficulty,
        region,
        date: new Date().toISOString()
    };

    state.leaderboard.push(entry);

    state.leaderboard.sort((a, b) => {
        if (b.percentage !== a.percentage) return b.percentage - a.percentage;
        if (b.total !== a.total) return b.total - a.total;
        return new Date(b.date) - new Date(a.date);
    });

    state.leaderboard = state.leaderboard.slice(0, 20);

    saveToStorage(STORAGE_KEYS.leaderboard, state.leaderboard);
}

export function renderLeaderboard() {
    const list = elements.leaderboardList;
    list.innerHTML = '';

    if (state.leaderboard.length === 0) {
        elements.leaderboardEmpty.hidden = false;
        return;
    }

    elements.leaderboardEmpty.hidden = true;

    state.leaderboard.slice(0, 10).forEach((entry, index) => {
        const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
        const date = new Date(entry.date).toLocaleDateString();

        const entryEl = document.createElement('div');
        entryEl.className = `leaderboard-entry ${rankClass}`;
        entryEl.innerHTML = `
            <span class="leaderboard-rank">${index + 1}</span>
            <div class="leaderboard-info">
                <span class="leaderboard-name">${escapeHtml(entry.name)}</span>
                <span class="leaderboard-details">${entry.difficulty} · ${getRegionName(entry.region)} · ${date}</span>
            </div>
            <span class="leaderboard-score">${entry.percentage}%</span>
        `;
        list.appendChild(entryEl);
    });
}
