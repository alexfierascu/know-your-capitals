import { BaseModal } from './BaseModal.js';

/**
 * Stats Modal Web Component
 * Displays leaderboard, achievements, and progress tabs
 */
export class StatsModal extends BaseModal {
    constructor() {
        super();
        this._activeTab = 'leaderboard';
    }

    hasCloseButton() {
        return true;
    }

    getStyles() {
        return `
            ${super.getStyles()}

            .modal-content {
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
            }

            /* Tabs */
            .modal-tabs {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1.5rem;
                border-bottom: 1px solid var(--color-border, #2a3352);
                padding-bottom: 0.75rem;
                padding-right: 2.5rem;
            }

            .modal-tab {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                gap: 0.35rem;
                padding: 0.75rem 0.25rem;
                background: transparent;
                border: none;
                border-radius: var(--radius-sm, 8px);
                color: var(--color-text-muted, #8892b0);
                font-family: var(--font-body, 'Source Sans 3', sans-serif);
                font-size: 0.7rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                min-height: 60px;
            }

            .modal-tab .tab-icon {
                font-size: 1.35rem;
                line-height: 1;
                height: 1.35rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .modal-tab .tab-label {
                white-space: nowrap;
                text-align: center;
            }

            .modal-tab:hover {
                color: var(--color-text, #e8e6e3);
                background: var(--color-bg-card-light, #242b45);
            }

            .modal-tab.active {
                color: var(--color-primary, #c9a227);
                background: rgba(201, 162, 39, 0.1);
            }

            /* Tab Content */
            .modal-tab-content {
                animation: fadeIn 0.3s ease;
            }

            .modal-tab-content[hidden] {
                display: none;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .modal-tab-content h2 {
                font-family: var(--font-display, 'Playfair Display', serif);
                font-size: 1.25rem;
                margin-bottom: 1rem;
                color: var(--color-text, #e8e6e3);
            }

            /* Tab header with info tooltip */
            .tab-header-with-info {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                position: relative;
                overflow: visible;
            }

            .info-tooltip {
                position: relative;
                display: inline-flex;
            }

            .info-icon {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: var(--color-bg-card-light, #242b45);
                border: 1px solid var(--color-border, #2a3352);
                color: var(--color-text-muted, #8892b0);
                font-size: 0.75rem;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                font-family: var(--font-body, 'Source Sans 3', sans-serif);
            }

            .info-icon:hover {
                background: var(--color-primary, #c9a227);
                border-color: var(--color-primary, #c9a227);
                color: var(--color-bg-deep, #0f1729);
            }

            .info-tooltip-content {
                position: absolute;
                top: 50%;
                left: calc(100% + 10px);
                transform: translateY(-50%);
                background: var(--color-bg-card, #1a1f35);
                border: 1px solid var(--color-border, #2a3352);
                border-radius: var(--radius-md, 12px);
                padding: 1rem;
                width: 220px;
                font-size: 0.8rem;
                font-weight: 400;
                line-height: 1.5;
                color: var(--color-text, #e8e6e3);
                box-shadow: var(--shadow-soft, 0 4px 20px rgba(0, 0, 0, 0.3));
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.2s ease, visibility 0.2s ease;
                z-index: 1010;
            }

            .info-tooltip:hover .info-tooltip-content,
            .info-tooltip:focus-within .info-tooltip-content {
                opacity: 1;
                visibility: visible;
            }

            /* Weekly Summary */
            .weekly-summary {
                margin-bottom: 1.5rem;
            }

            .weekly-empty {
                text-align: center;
                color: var(--color-text-muted, #8892b0);
                font-style: italic;
                padding: 1rem;
                background: var(--color-bg-card-light, #242b45);
                border-radius: var(--radius-md, 12px);
            }

            .weekly-stats-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 0.5rem;
                margin-bottom: 1rem;
            }

            .weekly-stat {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 0.5rem;
                background: var(--color-bg-card-light, #242b45);
                border-radius: var(--radius-sm, 8px);
                border: 1px solid var(--color-border-light, #1f2640);
            }

            .weekly-stat-value {
                font-family: var(--font-display, 'Playfair Display', serif);
                font-size: 1.1rem;
                font-weight: 700;
                color: var(--color-primary, #c9a227);
            }

            .weekly-stat-label {
                font-size: 0.6rem;
                text-transform: uppercase;
                letter-spacing: 0.03em;
                color: var(--color-text-muted, #8892b0);
                text-align: center;
            }

            /* Lifetime Stats */
            .lifetime-stats {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 0.75rem;
                margin-bottom: 1.5rem;
            }

            .lifetime-stat {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 0.75rem;
                background: var(--color-bg-card-light, #242b45);
                border-radius: var(--radius-md, 12px);
                border: 1px solid var(--color-border, #2a3352);
            }

            .lifetime-stat-value {
                font-family: var(--font-display, 'Playfair Display', serif);
                font-size: 1.25rem;
                font-weight: 700;
                color: var(--color-primary, #c9a227);
            }

            .lifetime-stat-label {
                font-size: 0.7rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: var(--color-text-muted, #8892b0);
                text-align: center;
            }

            /* Leaderboard */
            .leaderboard-list {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .leaderboard-entry {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem 1rem;
                background: var(--color-bg-card-light, #242b45);
                border-radius: var(--radius-md, 12px);
                border: 1px solid var(--color-border-light, #1f2640);
            }

            .leaderboard-entry.gold {
                border-color: #ffd700;
                background: rgba(255, 215, 0, 0.1);
            }

            .leaderboard-entry.silver {
                border-color: #c0c0c0;
                background: rgba(192, 192, 192, 0.1);
            }

            .leaderboard-entry.bronze {
                border-color: #cd7f32;
                background: rgba(205, 127, 50, 0.1);
            }

            .leaderboard-rank {
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--color-bg-card, #1a1f35);
                border-radius: 50%;
                font-weight: 700;
                font-size: 0.85rem;
                color: var(--color-text-muted, #8892b0);
            }

            .leaderboard-entry.gold .leaderboard-rank { color: #ffd700; }
            .leaderboard-entry.silver .leaderboard-rank { color: #c0c0c0; }
            .leaderboard-entry.bronze .leaderboard-rank { color: #cd7f32; }

            .leaderboard-info {
                flex: 1;
            }

            .leaderboard-name {
                display: block;
                font-weight: 600;
                color: var(--color-text, #e8e6e3);
                font-size: 0.95rem;
            }

            .leaderboard-details {
                font-size: 0.75rem;
                color: var(--color-text-muted, #8892b0);
            }

            .leaderboard-score {
                font-family: var(--font-display, 'Playfair Display', serif);
                font-size: 1.1rem;
                font-weight: 600;
                color: var(--color-primary, #c9a227);
            }

            /* Weekly Chart */
            .weekly-chart {
                background: var(--color-bg-card-light, #242b45);
                border-radius: var(--radius-md, 12px);
                padding: 1rem;
            }

            .weekly-chart-title {
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: var(--color-text-muted, #8892b0);
                margin-bottom: 0.75rem;
                text-align: center;
            }

            .weekly-bars {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                height: 60px;
                gap: 0.25rem;
            }

            .weekly-bar-container {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                height: 100%;
            }

            .weekly-bar {
                width: 100%;
                max-width: 24px;
                background: var(--color-primary, #c9a227);
                border-radius: 4px 4px 0 0;
                margin-top: auto;
                min-height: 0;
            }

            .weekly-bar-label {
                font-size: 0.6rem;
                color: var(--color-text-muted, #8892b0);
                margin-top: 0.25rem;
            }

            .empty-state {
                text-align: center;
                color: var(--color-text-muted, #8892b0);
                padding: 2rem 1rem;
                font-style: italic;
            }

            /* Global Leaderboard */
            .global-subtitle {
                color: var(--color-text-muted, #8892b0);
                font-size: 0.85rem;
                margin-bottom: 1rem;
                text-align: center;
            }

            .global-filters {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1rem;
            }

            .global-filter-select {
                flex: 1;
                padding: 0.5rem 0.75rem;
                background: var(--color-bg-card-light, #242b45);
                border: 1px solid var(--color-border, #2a3352);
                border-radius: var(--radius-sm, 8px);
                color: var(--color-text, #e8e6e3);
                font-family: var(--font-body, 'Source Sans 3', sans-serif);
                font-size: 0.85rem;
                cursor: pointer;
            }

            .global-filter-select:focus {
                outline: none;
                border-color: var(--color-primary, #c9a227);
            }

            .global-leaderboard-list {
                max-height: 350px;
                overflow-y: auto;
            }

            .leaderboard-entry.current-user {
                border-color: var(--color-primary, #c9a227);
                background: rgba(201, 162, 39, 0.15);
            }

            .leaderboard-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                object-fit: cover;
                background: var(--color-bg-card, #1a1f35);
            }

            .leaderboard-avatar-placeholder {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: var(--color-bg-card, #1a1f35);
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--color-text-muted, #8892b0);
                font-size: 0.9rem;
                font-weight: 600;
            }

            .guest-notice {
                background: rgba(201, 162, 39, 0.1);
                border: 1px solid var(--color-primary, #c9a227);
                border-radius: var(--radius-md, 12px);
                color: var(--color-text, #e8e6e3);
                font-style: normal;
            }

            /* Achievements */
            .achievements-summary {
                text-align: center;
                margin-bottom: 1rem;
                color: var(--color-text-muted, #8892b0);
                font-size: 0.9rem;
            }

            .achievements-summary span:first-child {
                color: var(--color-primary, #c9a227);
                font-weight: 600;
            }

            .achievements-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                gap: 0.75rem;
            }

            .achievement-badge {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 1rem;
                background: var(--color-bg-card-light, #242b45);
                border-radius: var(--radius-md, 12px);
                border: 1px solid var(--color-border-light, #1f2640);
                text-align: center;
                transition: all 0.2s ease;
            }

            .achievement-badge.locked {
                opacity: 0.4;
                filter: grayscale(1);
            }

            .achievement-badge.unlocked {
                border-color: var(--color-primary, #c9a227);
                background: rgba(201, 162, 39, 0.1);
            }

            .achievement-badge:hover:not(.locked) {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(201, 162, 39, 0.2);
            }

            .achievement-icon {
                font-size: 2rem;
                margin-bottom: 0.5rem;
            }

            .achievement-name {
                font-size: 0.8rem;
                font-weight: 600;
                color: var(--color-text, #e8e6e3);
                margin-bottom: 0.25rem;
            }

            .achievement-desc {
                font-size: 0.7rem;
                color: var(--color-text-muted, #8892b0);
                line-height: 1.3;
            }

            /* Progress */
            .progress-summary {
                display: flex;
                justify-content: center;
                gap: 2rem;
                margin-bottom: 1rem;
                padding: 1rem;
                background: var(--color-bg-card-light, #242b45);
                border-radius: var(--radius-md, 12px);
            }

            .progress-stat {
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .progress-stat-value {
                font-family: var(--font-display, 'Playfair Display', serif);
                font-size: 1.5rem;
                font-weight: 600;
                color: var(--color-primary, #c9a227);
            }

            .progress-stat-label {
                font-size: 0.75rem;
                color: var(--color-text-muted, #8892b0);
                text-transform: uppercase;
            }

            .progress-filter {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1rem;
                flex-wrap: wrap;
            }

            .progress-filter-btn {
                padding: 0.5rem 1rem;
                background: var(--color-bg-card-light, #242b45);
                border: 1px solid var(--color-border-light, #1f2640);
                border-radius: 20px;
                color: var(--color-text-muted, #8892b0);
                font-size: 0.8rem;
                font-family: var(--font-body, 'Source Sans 3', sans-serif);
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .progress-filter-btn:hover {
                border-color: var(--color-border, #2a3352);
            }

            .progress-filter-btn.active {
                background: var(--color-primary, #c9a227);
                border-color: var(--color-primary, #c9a227);
                color: var(--color-bg-deep, #0f1729);
            }

            .progress-list {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                max-height: 300px;
                overflow-y: auto;
            }

            .progress-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem;
                background: var(--color-bg-card-light, #242b45);
                border-radius: var(--radius-sm, 8px);
                border-left: 4px solid var(--color-text-muted, #8892b0);
            }

            .progress-item.mastered {
                border-left-color: var(--color-correct, #4ade80);
            }

            .progress-item.learning {
                border-left-color: var(--color-primary, #c9a227);
            }

            .progress-item.weak {
                border-left-color: var(--color-incorrect, #f87171);
            }

            .progress-item-info {
                flex: 1;
            }

            .progress-item-country {
                display: block;
                font-weight: 600;
                font-size: 0.9rem;
                color: var(--color-text, #e8e6e3);
            }

            .progress-item-capital {
                font-size: 0.75rem;
                color: var(--color-text-muted, #8892b0);
            }

            .progress-item-stats {
                text-align: right;
            }

            .progress-item-rate {
                display: block;
                font-weight: 600;
                font-size: 0.9rem;
                color: var(--color-text, #e8e6e3);
            }

            .progress-item-attempts {
                font-size: 0.7rem;
                color: var(--color-text-muted, #8892b0);
            }

            /* Data Management */
            .data-management {
                margin-top: 1.5rem;
                padding-top: 1.5rem;
                border-top: 1px solid var(--color-border, #2a3352);
            }

            .data-management h3 {
                font-family: var(--font-display, 'Playfair Display', serif);
                font-size: 1rem;
                margin-bottom: 0.75rem;
                color: var(--color-text, #e8e6e3);
            }

            .data-management-buttons {
                display: flex;
                gap: 0.75rem;
            }

            .btn-small {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 0.875rem;
                font-size: 0.8rem;
                background: var(--color-bg-card-light, #242b45);
                border: 1px solid var(--color-border, #2a3352);
                border-radius: var(--radius-md, 12px);
                color: var(--color-text, #e8e6e3);
                font-family: var(--font-body, 'Source Sans 3', sans-serif);
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .btn-small:hover {
                border-color: var(--color-primary, #c9a227);
                background: rgba(201, 162, 39, 0.1);
            }

            .import-btn {
                cursor: pointer;
            }
        `;
    }

    getTemplate() {
        return `
            <div class="modal-overlay" part="overlay"></div>
            <div class="modal-content" part="content">
                <button class="modal-close" aria-label="Close modal" part="close">&times;</button>

                <!-- Modal Tabs -->
                <div class="modal-tabs" role="tablist">
                    <button class="modal-tab active" data-tab="leaderboard" role="tab" aria-selected="true">
                        <span class="tab-icon">🏆</span>
                        <span class="tab-label" data-i18n="modal.leaderboard">Leaderboard</span>
                    </button>
                    <button class="modal-tab" data-tab="global" role="tab" aria-selected="false">
                        <span class="tab-icon">🌍</span>
                        <span class="tab-label" data-i18n="modal.global">Global</span>
                    </button>
                    <button class="modal-tab" data-tab="achievements" role="tab" aria-selected="false">
                        <span class="tab-icon">🎖️</span>
                        <span class="tab-label" data-i18n="modal.achievements">Achievements</span>
                    </button>
                    <button class="modal-tab" data-tab="progress" role="tab" aria-selected="false">
                        <span class="tab-icon">📊</span>
                        <span class="tab-label" data-i18n="modal.progress">Progress</span>
                    </button>
                </div>

                <!-- Leaderboard Tab -->
                <div id="tab-leaderboard" class="modal-tab-content" role="tabpanel">
                    <h2 data-i18n="stats.thisWeek">This Week</h2>
                    <div id="weekly-summary" class="weekly-summary">
                        <!-- Weekly summary will be rendered here -->
                    </div>
                    <h2 data-i18n="stats.lifetimeStats">Lifetime Stats</h2>
                    <div class="lifetime-stats">
                        <div class="lifetime-stat">
                            <span class="lifetime-stat-value" id="stat-total-quizzes">0</span>
                            <span class="lifetime-stat-label" data-i18n="stats.quizzesPlayed">Quizzes Played</span>
                        </div>
                        <div class="lifetime-stat">
                            <span class="lifetime-stat-value" id="stat-best-streak">0</span>
                            <span class="lifetime-stat-label" data-i18n="stats.bestStreak">Best Streak</span>
                        </div>
                        <div class="lifetime-stat">
                            <span class="lifetime-stat-value" id="stat-avg-time">-</span>
                            <span class="lifetime-stat-label" data-i18n="stats.avgTime">Avg Time/Question</span>
                        </div>
                        <div class="lifetime-stat">
                            <span class="lifetime-stat-value" id="stat-accuracy">-</span>
                            <span class="lifetime-stat-label" data-i18n="stats.accuracy">Accuracy</span>
                        </div>
                    </div>
                    <h2 data-i18n="stats.topScores">Top Scores</h2>
                    <div id="leaderboard-list" class="leaderboard-list">
                        <!-- Leaderboard entries will be inserted here -->
                    </div>
                    <p id="leaderboard-empty" class="empty-state" hidden data-i18n="stats.noScores">No scores yet. Play a quiz to get on the leaderboard!</p>
                </div>

                <!-- Global Leaderboard Tab -->
                <div id="tab-global" class="modal-tab-content" role="tabpanel" hidden>
                    <h2 data-i18n="stats.globalLeaderboard">Global Leaderboard</h2>
                    <p class="global-subtitle" data-i18n="stats.globalSubtitle">Top scores from players worldwide</p>

                    <div class="global-filters">
                        <select id="global-filter-mode" class="global-filter-select">
                            <option value="all" data-i18n="stats.allModes">All Modes</option>
                            <option value="classic" data-i18n="settings.classic">Classic</option>
                            <option value="speedrun" data-i18n="settings.speedRun">Speed Run</option>
                        </select>
                        <select id="global-filter-difficulty" class="global-filter-select">
                            <option value="all" data-i18n="stats.allDifficulties">All Difficulties</option>
                            <option value="easy" data-i18n="difficulty.easy">Easy</option>
                            <option value="medium" data-i18n="difficulty.medium">Medium</option>
                            <option value="hard" data-i18n="difficulty.hard">Hard</option>
                        </select>
                    </div>

                    <div id="global-leaderboard-list" class="leaderboard-list global-leaderboard-list">
                        <!-- Global leaderboard entries will be inserted here -->
                    </div>
                    <p id="global-leaderboard-empty" class="empty-state" hidden data-i18n="stats.noGlobalScores">No global scores yet. Be the first!</p>
                    <p id="global-leaderboard-loading" class="empty-state" data-i18n="stats.loading">Loading...</p>
                    <p id="global-leaderboard-guest" class="empty-state guest-notice" hidden data-i18n="stats.guestNotice">Sign in to see your rank and submit scores to the global leaderboard!</p>
                </div>

                <!-- Achievements Tab -->
                <div id="tab-achievements" class="modal-tab-content" role="tabpanel" hidden>
                    <h2 class="tab-header-with-info">
                        <span data-i18n="modal.achievements">Achievements</span>
                        <span class="info-tooltip">
                            <button class="info-icon" aria-label="Achievement rules info">?</button>
                            <span class="info-tooltip-content">
                                <strong data-i18n="achievements.howToUnlock">How to unlock achievements:</strong><br><br>
                                <span data-i18n="achievements.howToUnlockDesc">Complete quizzes and hit milestones like perfect scores, answer streaks, or mastering countries.</span><br><br>
                                <strong data-i18n="achievements.masteringCountry">Mastering a country:</strong><br>
                                <span data-i18n="achievements.masteringCountryDesc">Answer questions about it 3+ times with 80%+ accuracy.</span>
                            </span>
                        </span>
                    </h2>
                    <div class="achievements-summary">
                        <span id="achievements-unlocked">0</span> / <span id="achievements-total">0</span> <span data-i18n="achievements.unlockedLabel">unlocked</span>
                    </div>
                    <div id="achievements-grid" class="achievements-grid">
                        <!-- Achievement badges will be inserted here -->
                    </div>
                </div>

                <!-- Progress Tab -->
                <div id="tab-progress" class="modal-tab-content" role="tabpanel" hidden>
                    <h2 class="tab-header-with-info">
                        <span data-i18n="progress.countryMastery">Country Mastery</span>
                        <span class="info-tooltip">
                            <button class="info-icon" aria-label="Mastery rules info">?</button>
                            <span class="info-tooltip-content">
                                <strong data-i18n="progress.masteryLevels">Mastery Levels:</strong><br><br>
                                <strong data-i18n="progress.mastered">Mastered:</strong> <span data-i18n="progress.masteredDesc">80%+ correct over 3+ attempts</span><br>
                                <strong data-i18n="progress.learning">Learning:</strong> <span data-i18n="progress.learningDesc">50–79% correct</span><br>
                                <strong data-i18n="progress.weak">Weak:</strong> <span data-i18n="progress.weakDesc">Below 50% correct</span><br>
                                <strong data-i18n="progress.notSeen">Not Seen:</strong> <span data-i18n="progress.notSeenDesc">No attempts yet</span>
                            </span>
                        </span>
                    </h2>
                    <div class="progress-summary">
                        <div class="progress-stat">
                            <span id="progress-mastered" class="progress-stat-value">0</span>
                            <span class="progress-stat-label" data-i18n="progress.mastered">Mastered</span>
                        </div>
                        <div class="progress-stat">
                            <span id="progress-learning" class="progress-stat-value">0</span>
                            <span class="progress-stat-label" data-i18n="progress.learning">Learning</span>
                        </div>
                        <div class="progress-stat">
                            <span id="progress-new" class="progress-stat-value">0</span>
                            <span class="progress-stat-label" data-i18n="progress.notSeen">Not Seen</span>
                        </div>
                    </div>
                    <div class="progress-filter">
                        <button class="progress-filter-btn active" data-filter="all" data-i18n="progress.all">All</button>
                        <button class="progress-filter-btn" data-filter="mastered" data-i18n="progress.mastered">Mastered</button>
                        <button class="progress-filter-btn" data-filter="learning" data-i18n="progress.learning">Learning</button>
                        <button class="progress-filter-btn" data-filter="weak" data-i18n="progress.weak">Weak</button>
                    </div>
                    <div id="progress-list" class="progress-list">
                        <!-- Progress items will be inserted here -->
                    </div>

                    <div class="data-management">
                        <h3 data-i18n="data.management">Data Management</h3>
                        <div class="data-management-buttons">
                            <button id="export-data-btn" class="btn-small">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="7 10 12 15 17 10"/>
                                    <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                                <span data-i18n="data.export">Export Progress</span>
                            </button>
                            <label class="btn-small import-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="17 8 12 3 7 8"/>
                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                </svg>
                                <span data-i18n="data.import">Import Progress</span>
                                <input type="file" id="import-data-input" accept=".json" hidden>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        super.setupEventListeners();

        // Tab switching
        this.shadowRoot.querySelectorAll('.modal-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });

        // Progress filter buttons
        this.shadowRoot.querySelectorAll('.progress-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.shadowRoot.querySelectorAll('.progress-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.dispatchEvent(new CustomEvent('filter-change', {
                    detail: { filter: btn.dataset.filter },
                    bubbles: true
                }));
            });
        });

        // Export button
        this.shadowRoot.getElementById('export-data-btn').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('export-data', { bubbles: true }));
        });

        // Import input
        this.shadowRoot.getElementById('import-data-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.dispatchEvent(new CustomEvent('import-data', {
                    detail: { file },
                    bubbles: true
                }));
                e.target.value = ''; // Reset for re-selection
            }
        });

        // Global leaderboard filters
        const globalModeFilter = this.shadowRoot.getElementById('global-filter-mode');
        const globalDifficultyFilter = this.shadowRoot.getElementById('global-filter-difficulty');

        const emitGlobalFilterChange = () => {
            this.dispatchEvent(new CustomEvent('global-filter-change', {
                detail: {
                    gameMode: globalModeFilter.value,
                    difficulty: globalDifficultyFilter.value
                },
                bubbles: true
            }));
        };

        globalModeFilter.addEventListener('change', emitGlobalFilterChange);
        globalDifficultyFilter.addEventListener('change', emitGlobalFilterChange);
    }

    /**
     * Switch to a specific tab
     */
    switchTab(tabName) {
        this._activeTab = tabName;

        // Update tab buttons
        this.shadowRoot.querySelectorAll('.modal-tab').forEach(tab => {
            const isActive = tab.dataset.tab === tabName;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive);
        });

        // Update tab content
        this.shadowRoot.querySelectorAll('.modal-tab-content').forEach(content => {
            const isActive = content.id === `tab-${tabName}`;
            content.hidden = !isActive;
        });

        this.dispatchEvent(new CustomEvent('tab-change', {
            detail: { tab: tabName },
            bubbles: true
        }));
    }

    // Getters for dynamic content areas
    get weeklySummary() {
        return this.shadowRoot.getElementById('weekly-summary');
    }

    get leaderboardList() {
        return this.shadowRoot.getElementById('leaderboard-list');
    }

    get leaderboardEmpty() {
        return this.shadowRoot.getElementById('leaderboard-empty');
    }

    get achievementsGrid() {
        return this.shadowRoot.getElementById('achievements-grid');
    }

    get achievementsUnlocked() {
        return this.shadowRoot.getElementById('achievements-unlocked');
    }

    get achievementsTotal() {
        return this.shadowRoot.getElementById('achievements-total');
    }

    get progressList() {
        return this.shadowRoot.getElementById('progress-list');
    }

    get progressMastered() {
        return this.shadowRoot.getElementById('progress-mastered');
    }

    get progressLearning() {
        return this.shadowRoot.getElementById('progress-learning');
    }

    get progressNew() {
        return this.shadowRoot.getElementById('progress-new');
    }

    get statTotalQuizzes() {
        return this.shadowRoot.getElementById('stat-total-quizzes');
    }

    get statBestStreak() {
        return this.shadowRoot.getElementById('stat-best-streak');
    }

    get statAvgTime() {
        return this.shadowRoot.getElementById('stat-avg-time');
    }

    get statAccuracy() {
        return this.shadowRoot.getElementById('stat-accuracy');
    }

    // Global leaderboard getters
    get globalLeaderboardList() {
        return this.shadowRoot.getElementById('global-leaderboard-list');
    }

    get globalLeaderboardEmpty() {
        return this.shadowRoot.getElementById('global-leaderboard-empty');
    }

    get globalLeaderboardLoading() {
        return this.shadowRoot.getElementById('global-leaderboard-loading');
    }

    get globalLeaderboardGuest() {
        return this.shadowRoot.getElementById('global-leaderboard-guest');
    }

    get globalFilterMode() {
        return this.shadowRoot.getElementById('global-filter-mode');
    }

    get globalFilterDifficulty() {
        return this.shadowRoot.getElementById('global-filter-difficulty');
    }

    /**
     * Translate the modal content
     */
    translate(translateFn) {
        this.shadowRoot.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const translated = translateFn(key);
            if (translated && translated !== key) {
                el.textContent = translated;
            }
        });
    }
}

customElements.define('stats-modal', StatsModal);
