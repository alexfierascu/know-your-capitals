/**
 * European Capitals Quiz
 * A trivia game testing knowledge of European capital cities
 * Features: Timer, Hints, Question Review, Theme Toggle, Confetti, Share, Map Preview
 */

// ========================================
// State Management
// ========================================
const state = {
    countries: [],
    cities: {},
    funFacts: {},
    filteredCountries: [],
    questions: [],
    regions: [],
    currentQuestionIndex: 0,
    score: 0,
    selectedAnswer: null,
    answered: false,
    totalQuestions: 10,
    selectedRegion: 'all',
    playerName: '',
    difficulty: 'medium',
    // Timer
    timerEnabled: false,
    timerDuration: 15,
    timerRemaining: 15,
    timerInterval: null,
    // Hints
    hintsLetter: 2,
    hintsEliminate: 2,
    letterHintUsed: false,
    eliminatedOptions: [],
    // Review
    answeredQuestions: [],
    // Current question data
    currentOptions: [],
    currentCorrectIndex: -1,
    // Progress tracking
    countryProgress: {},
    // Leaderboard
    leaderboard: [],
    // Achievements
    achievements: {},
    // Session stats
    sessionStreak: 0,
    maxStreak: 0,
    // Game mode
    gameMode: 'classic',
    // Speed run
    speedRunTimer: null,
    speedRunTimeRemaining: 60,
    speedRunQuestionsAnswered: 0,
    hintsUsedThisQuiz: 0
};

// ========================================
// DOM Elements
// ========================================
const elements = {
    // Loading
    loadingScreen: document.getElementById('loading-screen'),

    // Theme
    themeToggle: document.getElementById('theme-toggle'),

    // Confetti
    confettiCanvas: document.getElementById('confetti-canvas'),

    // Screens
    startScreen: document.getElementById('start-screen'),
    quizScreen: document.getElementById('quiz-screen'),
    resultsScreen: document.getElementById('results-screen'),

    // Start Screen
    startBtn: document.getElementById('start-btn'),
    playerNameInput: document.getElementById('player-name'),
    difficultySelect: document.getElementById('difficulty-select'),
    difficultyHint: document.getElementById('difficulty-hint'),
    timerSelect: document.getElementById('timer-select'),
    regionSelect: document.getElementById('region-select'),
    questionCountSelect: document.getElementById('question-count'),
    availableQuestions: document.getElementById('available-questions'),
    totalQuestionCount: document.getElementById('total-question-count'),

    // Quiz Screen
    currentQuestion: document.getElementById('current-question'),
    totalQuestions: document.getElementById('total-questions'),
    currentScore: document.getElementById('current-score'),
    regionBadge: document.getElementById('region-badge'),
    streakDisplay: document.getElementById('streak-display'),
    streakCount: document.getElementById('streak-count'),
    progressFill: document.getElementById('progress-fill'),
    questionContainer: document.querySelector('.question-container'),
    questionFlag: document.getElementById('question-flag'),
    questionText: document.getElementById('question-text'),
    optionsContainer: document.getElementById('options-container'),
    nextBtn: document.getElementById('next-btn'),
    quitBtn: document.getElementById('quit-btn'),

    // Timer
    timerContainer: document.getElementById('timer-container'),
    timerCircle: document.getElementById('timer-circle'),
    timerText: document.getElementById('timer-text'),

    // Hints
    hintLetter: document.getElementById('hint-letter'),
    hintEliminate: document.getElementById('hint-eliminate'),
    hintLetterCount: document.getElementById('hint-letter-count'),
    hintEliminateCount: document.getElementById('hint-eliminate-count'),

    // Map
    mapContainer: document.getElementById('map-container'),
    mapImage: document.getElementById('map-image'),
    mapCaption: document.getElementById('map-caption'),
    europeMapContainer: document.getElementById('europe-map-container'),

    // Fun Fact
    funFact: document.getElementById('fun-fact'),
    funFactText: document.getElementById('fun-fact-text'),

    // Results Screen
    resultsTitle: document.getElementById('results-title'),
    resultsMessage: document.getElementById('results-message'),
    finalScoreValue: document.getElementById('final-score-value'),
    finalTotal: document.getElementById('final-total'),
    scorePercentage: document.getElementById('score-percentage'),
    correctCount: document.getElementById('correct-count'),
    incorrectCount: document.getElementById('incorrect-count'),
    restartBtn: document.getElementById('restart-btn'),
    shareBtn: document.getElementById('share-btn'),
    shareImageBtn: document.getElementById('share-image-btn'),
    toggleReview: document.getElementById('toggle-review'),
    reviewContainer: document.getElementById('review-container'),
    reviewList: document.getElementById('review-list'),

    // Toast
    shareToast: document.getElementById('share-toast'),
    achievementToast: document.getElementById('achievement-toast'),

    // Stats Modal
    statsBtn: document.getElementById('stats-btn'),
    statsModal: document.getElementById('stats-modal'),
    modalTabs: document.querySelectorAll('.modal-tab'),
    modalTabContents: {
        leaderboard: document.getElementById('tab-leaderboard'),
        achievements: document.getElementById('tab-achievements'),
        progress: document.getElementById('tab-progress')
    },
    leaderboardList: document.getElementById('leaderboard-list'),
    leaderboardEmpty: document.getElementById('leaderboard-empty'),
    statTotalQuizzes: document.getElementById('stat-total-quizzes'),
    statBestStreak: document.getElementById('stat-best-streak'),
    statAvgTime: document.getElementById('stat-avg-time'),
    statAccuracy: document.getElementById('stat-accuracy'),
    achievementsUnlocked: document.getElementById('achievements-unlocked'),
    achievementsTotal: document.getElementById('achievements-total'),
    achievementsGrid: document.getElementById('achievements-grid'),
    progressMastered: document.getElementById('progress-mastered'),
    progressLearning: document.getElementById('progress-learning'),
    progressNew: document.getElementById('progress-new'),
    progressList: document.getElementById('progress-list'),
    progressFilterBtns: document.querySelectorAll('.progress-filter-btn'),
    exportDataBtn: document.getElementById('export-data-btn'),
    importDataInput: document.getElementById('import-data-input')
};

// ========================================
// Difficulty Hints
// ========================================
const difficultyHints = {
    easy: 'All options are cities from the same country',
    medium: 'Cities from same country + one foreign city',
    hard: 'All options are capitals from different countries'
};

// ========================================
// Achievements Definitions
// ========================================
const ACHIEVEMENTS = {
    firstQuiz: {
        id: 'firstQuiz',
        name: 'First Steps',
        description: 'Complete your first quiz',
        icon: '🎯',
        check: (stats) => stats.totalQuizzes >= 1
    },
    perfectScore: {
        id: 'perfectScore',
        name: 'Perfect!',
        description: 'Get 100% on any quiz',
        icon: '⭐',
        check: (stats) => stats.perfectScores >= 1
    },
    fivePerfect: {
        id: 'fivePerfect',
        name: 'Perfectionist',
        description: 'Get 5 perfect scores',
        icon: '🌟',
        check: (stats) => stats.perfectScores >= 5
    },
    streak5: {
        id: 'streak5',
        name: 'On Fire',
        description: 'Get 5 correct answers in a row',
        icon: '🔥',
        check: (stats) => stats.maxStreak >= 5
    },
    streak10: {
        id: 'streak10',
        name: 'Unstoppable',
        description: 'Get 10 correct answers in a row',
        icon: '💥',
        check: (stats) => stats.maxStreak >= 10
    },
    tenQuizzes: {
        id: 'tenQuizzes',
        name: 'Dedicated',
        description: 'Complete 10 quizzes',
        icon: '📚',
        check: (stats) => stats.totalQuizzes >= 10
    },
    fiftyQuizzes: {
        id: 'fiftyQuizzes',
        name: 'Quiz Master',
        description: 'Complete 50 quizzes',
        icon: '🎓',
        check: (stats) => stats.totalQuizzes >= 50
    },
    masterFive: {
        id: 'masterFive',
        name: 'Getting There',
        description: 'Master 5 countries',
        icon: '🗺️',
        check: (stats) => stats.masteredCountries >= 5
    },
    masterTwenty: {
        id: 'masterTwenty',
        name: 'Geography Buff',
        description: 'Master 20 countries',
        icon: '🌍',
        check: (stats) => stats.masteredCountries >= 20
    },
    masterAll: {
        id: 'masterAll',
        name: 'European Expert',
        description: 'Master all 45 countries',
        icon: '👑',
        check: (stats) => stats.masteredCountries >= 45
    },
    hardMode: {
        id: 'hardMode',
        name: 'Challenge Accepted',
        description: 'Complete a quiz on Hard difficulty',
        icon: '💪',
        check: (stats) => stats.hardQuizzes >= 1
    },
    hardPerfect: {
        id: 'hardPerfect',
        name: 'Legendary',
        description: 'Get 100% on Hard difficulty',
        icon: '🏆',
        check: (stats) => stats.hardPerfectScores >= 1
    },
    speedDemon: {
        id: 'speedDemon',
        name: 'Speed Demon',
        description: 'Complete a 10-question quiz with timer in under 60 seconds total',
        icon: '⚡',
        check: (stats) => stats.speedRuns >= 1
    },
    noHints: {
        id: 'noHints',
        name: 'No Help Needed',
        description: 'Get 100% without using any hints',
        icon: '🧠',
        check: (stats) => stats.perfectNoHints >= 1
    },
    balkanExpert: {
        id: 'balkanExpert',
        name: 'Balkan Expert',
        description: 'Master all Balkan countries',
        icon: '🏔️',
        check: (stats) => stats.balkansMastered >= 8
    },
    nordicExpert: {
        id: 'nordicExpert',
        name: 'Nordic Explorer',
        description: 'Master all Northern European countries',
        icon: '❄️',
        check: (stats) => stats.nordicMastered >= 5
    }
};

// ========================================
// LocalStorage Functions
// ========================================
const STORAGE_KEYS = {
    progress: 'euroquiz_progress',
    leaderboard: 'euroquiz_leaderboard',
    achievements: 'euroquiz_achievements',
    stats: 'euroquiz_stats'
};

function loadFromStorage(key, defaultValue = {}) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('Error loading from storage:', e);
        return defaultValue;
    }
}

function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Error saving to storage:', e);
    }
}

function loadAllStoredData() {
    state.countryProgress = loadFromStorage(STORAGE_KEYS.progress, {});
    state.leaderboard = loadFromStorage(STORAGE_KEYS.leaderboard, []);
    state.achievements = loadFromStorage(STORAGE_KEYS.achievements, {});
}

function exportProgress() {
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

function importProgress(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);

            // Validate the data structure
            if (!data.progress && !data.leaderboard && !data.achievements && !data.stats) {
                alert('Invalid backup file format.');
                return;
            }

            // Confirm before overwriting
            if (!confirm('This will replace your current progress. Continue?')) {
                return;
            }

            // Import the data
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

            // Refresh the modal displays
            renderLifetimeStats();
            renderLeaderboard();
            renderAchievements();
            renderProgress();

            alert('Progress imported successfully!');
        } catch (err) {
            alert('Error reading backup file. Make sure it\'s a valid JSON file.');
            console.error('Import error:', err);
        }
    };
    reader.readAsText(file);
}

function getStats() {
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

function updateStats(updates) {
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

// ========================================
// Utility Functions
// ========================================

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Switch between screens with transition
 */
function showScreen(screenId) {
    const currentScreen = document.querySelector('.screen.active');
    const nextScreen = document.getElementById(screenId);

    if (currentScreen) {
        currentScreen.classList.add('fade-out');
        setTimeout(() => {
            currentScreen.classList.remove('active', 'fade-out');
            nextScreen.classList.add('active');
        }, 300);
    } else {
        nextScreen.classList.add('active');
    }
}

/**
 * Get letter for option index (A, B, C, D)
 */
function getOptionLetter(index) {
    return String.fromCharCode(65 + index);
}

/**
 * Update difficulty hint text
 */
function updateDifficultyHint() {
    const difficulty = elements.difficultySelect.value;
    elements.difficultyHint.textContent = difficultyHints[difficulty];
}

/**
 * Update streak display in quiz UI
 */
function updateStreakDisplay() {
    if (state.sessionStreak >= 2) {
        elements.streakCount.textContent = state.sessionStreak;
        elements.streakDisplay.hidden = false;
        // Re-trigger animation
        elements.streakDisplay.style.animation = 'none';
        elements.streakDisplay.offsetHeight; // Force reflow
        elements.streakDisplay.style.animation = '';
    } else {
        elements.streakDisplay.hidden = true;
    }
}

/**
 * Reset streak display
 */
function resetStreakDisplay() {
    elements.streakDisplay.hidden = true;
    elements.streakCount.textContent = '0';
}

// ========================================
// Theme Toggle
// ========================================

function initTheme() {
    const savedTheme = localStorage.getItem('quiz-theme');

    if (savedTheme) {
        // User has explicitly set a theme preference
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        // Follow system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only auto-switch if user hasn't set a manual preference
        if (!localStorage.getItem('quiz-theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('quiz-theme', newTheme);
}

// ========================================
// Loading Screen
// ========================================

function hideLoadingScreen() {
    elements.loadingScreen.classList.add('hidden');
}

// ========================================
// Timer Functions
// ========================================

function startTimer() {
    if (!state.timerEnabled) return;

    state.timerRemaining = state.timerDuration;
    elements.timerContainer.classList.add('active');
    updateTimerDisplay();

    const circumference = 2 * Math.PI * 45; // r=45
    elements.timerCircle.style.strokeDasharray = circumference;
    elements.timerCircle.style.strokeDashoffset = 0;

    state.timerInterval = setInterval(() => {
        state.timerRemaining--;
        updateTimerDisplay();

        // Update circle
        const offset = circumference * (1 - state.timerRemaining / state.timerDuration);
        elements.timerCircle.style.strokeDashoffset = offset;

        // Warning state at 5 seconds
        if (state.timerRemaining <= 5) {
            elements.timerCircle.classList.add('warning');
            elements.timerText.classList.add('warning');
        }

        if (state.timerRemaining <= 0) {
            stopTimer();
            timeUp();
        }
    }, 1000);
}

function stopTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
    elements.timerCircle.classList.remove('warning');
    elements.timerText.classList.remove('warning');
}

function updateTimerDisplay() {
    elements.timerText.textContent = state.timerRemaining;
}

function timeUp() {
    if (state.answered) return;

    // Mark as answered with wrong answer
    state.answered = true;
    state.selectedAnswer = -1; // No selection
    state.sessionStreak = 0; // Reset streak

    const country = state.questions[state.currentQuestionIndex];

    // Track as incorrect
    updateCountryProgress(country.name, false);

    // Show correct answer
    const allOptions = elements.optionsContainer.querySelectorAll('.option');
    allOptions.forEach((option, index) => {
        option.classList.add('disabled');
        const iconSpan = option.querySelector('.option-icon');

        if (index === state.currentCorrectIndex) {
            option.classList.add('correct');
            iconSpan.innerHTML = '✓';
        }
    });

    // Record answer
    recordAnswer(null);

    // Show map
    showMap();

    // Enable next button
    elements.nextBtn.disabled = false;

    // Announce for screen readers
    announceToScreenReader('Time is up! The correct answer was ' + state.currentOptions[state.currentCorrectIndex]);
}

// ========================================
// Speed Run Timer
// ========================================

function startSpeedRunTimer() {
    state.speedRunTimeRemaining = 60;
    elements.timerContainer.classList.add('active');
    updateSpeedRunTimerDisplay();

    const circumference = 2 * Math.PI * 45;
    elements.timerCircle.style.strokeDasharray = circumference;
    elements.timerCircle.style.strokeDashoffset = 0;

    state.speedRunTimer = setInterval(() => {
        state.speedRunTimeRemaining--;
        updateSpeedRunTimerDisplay();

        // Update circle
        const offset = circumference * (1 - state.speedRunTimeRemaining / 60);
        elements.timerCircle.style.strokeDashoffset = offset;

        // Update progress bar to show time remaining
        const progress = (state.speedRunTimeRemaining / 60) * 100;
        elements.progressFill.style.width = `${progress}%`;

        // Warning at 10 seconds
        if (state.speedRunTimeRemaining <= 10) {
            elements.timerCircle.classList.add('warning');
            elements.timerText.classList.add('warning');
        }

        if (state.speedRunTimeRemaining <= 0) {
            stopSpeedRunTimer();
            showResults();
        }
    }, 1000);
}

function stopSpeedRunTimer() {
    if (state.speedRunTimer) {
        clearInterval(state.speedRunTimer);
        state.speedRunTimer = null;
    }
    elements.timerCircle.classList.remove('warning');
    elements.timerText.classList.remove('warning');
}

function updateSpeedRunTimerDisplay() {
    elements.timerText.textContent = state.speedRunTimeRemaining;
}

// ========================================
// Accessibility
// ========================================

function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
}

// ========================================
// Hints Functions
// ========================================

function useLetterHint() {
    if (state.hintsLetter <= 0 || state.answered || state.letterHintUsed) return;

    state.hintsLetter--;
    state.letterHintUsed = true;
    state.hintsUsedThisQuiz = (state.hintsUsedThisQuiz || 0) + 1;
    elements.hintLetterCount.textContent = state.hintsLetter;

    if (state.hintsLetter <= 0) {
        elements.hintLetter.disabled = true;
    }

    // Show first letter hint
    const correctAnswer = state.currentOptions[state.currentCorrectIndex];
    const firstLetter = correctAnswer.charAt(0).toUpperCase();

    const hintElement = document.createElement('p');
    hintElement.className = 'question-hint';
    hintElement.textContent = `Hint: The capital starts with "${firstLetter}"`;
    hintElement.setAttribute('role', 'alert');

    const existingHint = document.querySelector('.question-hint');
    if (existingHint) existingHint.remove();

    elements.questionText.parentNode.appendChild(hintElement);
}

function useEliminateHint() {
    if (state.hintsEliminate <= 0 || state.answered) return;

    // Find a wrong option that hasn't been eliminated
    const wrongOptions = state.currentOptions
        .map((opt, idx) => ({ opt, idx }))
        .filter(({ idx }) => idx !== state.currentCorrectIndex && !state.eliminatedOptions.includes(idx));

    if (wrongOptions.length === 0) return;

    state.hintsEliminate--;
    state.hintsUsedThisQuiz = (state.hintsUsedThisQuiz || 0) + 1;
    elements.hintEliminateCount.textContent = state.hintsEliminate;

    if (state.hintsEliminate <= 0) {
        elements.hintEliminate.disabled = true;
    }

    // Eliminate a random wrong option
    const toEliminate = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
    state.eliminatedOptions.push(toEliminate.idx);

    const allOptions = elements.optionsContainer.querySelectorAll('.option');
    allOptions[toEliminate.idx].classList.add('eliminated');
    allOptions[toEliminate.idx].setAttribute('aria-disabled', 'true');
}

function updateHintButtons() {
    elements.hintLetterCount.textContent = state.hintsLetter;
    elements.hintEliminateCount.textContent = state.hintsEliminate;
    elements.hintLetter.disabled = state.hintsLetter <= 0;
    elements.hintEliminate.disabled = state.hintsEliminate <= 0;
}

// ========================================
// Map Preview
// ========================================

// Capital city coordinates for Google Maps
const CAPITAL_COORDINATES = {
    'France': { lat: 48.8566, lng: 2.3522, capital: 'Paris' },
    'Germany': { lat: 52.5200, lng: 13.4050, capital: 'Berlin' },
    'Spain': { lat: 40.4168, lng: -3.7038, capital: 'Madrid' },
    'Italy': { lat: 41.9028, lng: 12.4964, capital: 'Rome' },
    'Portugal': { lat: 38.7223, lng: -9.1393, capital: 'Lisbon' },
    'Poland': { lat: 52.2297, lng: 21.0122, capital: 'Warsaw' },
    'Netherlands': { lat: 52.3676, lng: 4.9041, capital: 'Amsterdam' },
    'Belgium': { lat: 50.8503, lng: 4.3517, capital: 'Brussels' },
    'Austria': { lat: 48.2082, lng: 16.3738, capital: 'Vienna' },
    'Switzerland': { lat: 46.9480, lng: 7.4474, capital: 'Bern' },
    'Sweden': { lat: 59.3293, lng: 18.0686, capital: 'Stockholm' },
    'Norway': { lat: 59.9139, lng: 10.7522, capital: 'Oslo' },
    'Denmark': { lat: 55.6761, lng: 12.5683, capital: 'Copenhagen' },
    'Finland': { lat: 60.1699, lng: 24.9384, capital: 'Helsinki' },
    'Greece': { lat: 37.9838, lng: 23.7275, capital: 'Athens' },
    'Czech Republic': { lat: 50.0755, lng: 14.4378, capital: 'Prague' },
    'Hungary': { lat: 47.4979, lng: 19.0402, capital: 'Budapest' },
    'Romania': { lat: 44.4268, lng: 26.1025, capital: 'Bucharest' },
    'Bulgaria': { lat: 42.6977, lng: 23.3219, capital: 'Sofia' },
    'Croatia': { lat: 45.8150, lng: 15.9819, capital: 'Zagreb' },
    'Slovenia': { lat: 46.0569, lng: 14.5058, capital: 'Ljubljana' },
    'Slovakia': { lat: 48.1486, lng: 17.1077, capital: 'Bratislava' },
    'Ireland': { lat: 53.3498, lng: -6.2603, capital: 'Dublin' },
    'Serbia': { lat: 44.7866, lng: 20.4489, capital: 'Belgrade' },
    'Ukraine': { lat: 50.4501, lng: 30.5234, capital: 'Kyiv' },
    'Estonia': { lat: 59.4370, lng: 24.7536, capital: 'Tallinn' },
    'Latvia': { lat: 56.9496, lng: 24.1052, capital: 'Riga' },
    'Lithuania': { lat: 54.6872, lng: 25.2797, capital: 'Vilnius' },
    'Albania': { lat: 41.3275, lng: 19.8187, capital: 'Tirana' },
    'North Macedonia': { lat: 41.9973, lng: 21.4280, capital: 'Skopje' },
    'Montenegro': { lat: 42.4304, lng: 19.2594, capital: 'Podgorica' },
    'Bosnia and Herzegovina': { lat: 43.8563, lng: 18.4131, capital: 'Sarajevo' },
    'Moldova': { lat: 47.0105, lng: 28.8638, capital: 'Chișinău' },
    'Belarus': { lat: 53.9006, lng: 27.5590, capital: 'Minsk' },
    'Iceland': { lat: 64.1466, lng: -21.9426, capital: 'Reykjavík' },
    'Luxembourg': { lat: 49.6116, lng: 6.1319, capital: 'Luxembourg City' },
    'Malta': { lat: 35.8989, lng: 14.5146, capital: 'Valletta' },
    'Cyprus': { lat: 35.1856, lng: 33.3823, capital: 'Nicosia' },
    'Monaco': { lat: 43.7384, lng: 7.4246, capital: 'Monaco' },
    'Andorra': { lat: 42.5063, lng: 1.5218, capital: 'Andorra la Vella' },
    'United Kingdom': { lat: 51.5074, lng: -0.1278, capital: 'London' },
    'Russia': { lat: 55.7558, lng: 37.6173, capital: 'Moscow' },
    'Liechtenstein': { lat: 47.1410, lng: 9.5209, capital: 'Vaduz' },
    'San Marino': { lat: 43.9424, lng: 12.4578, capital: 'San Marino' },
    'Kosovo': { lat: 42.6629, lng: 21.1655, capital: 'Pristina' }
};

function showMap() {
    const country = state.questions[state.currentQuestionIndex];
    const countryName = country.name;
    const countryCode = getCountryCode(countryName);
    const coords = CAPITAL_COORDINATES[countryName];

    if (coords) {
        // Create Google Maps iframe URL
        const mapUrl = `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=6&output=embed`;

        elements.europeMapContainer.innerHTML = `
            <iframe 
                class="google-map-iframe"
                src="${mapUrl}"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                title="Map showing ${countryName}">
            </iframe>
        `;
    } else {
        elements.europeMapContainer.innerHTML = `
            <div class="map-fallback">
                <span>📍</span>
                <p>${countryName}</p>
            </div>
        `;
    }

    // Use flagcdn.com for flag images
    const flagUrl = `https://flagcdn.com/w160/${countryCode}.png`;

    elements.mapImage.classList.add('loading');
    elements.mapImage.src = flagUrl;
    elements.mapImage.alt = `Flag of ${countryName}`;

    elements.mapImage.onload = () => {
        elements.mapImage.classList.remove('loading');
    };

    elements.mapImage.onerror = () => {
        elements.mapImage.classList.remove('loading');
        elements.mapImage.src = `https://flagsapi.com/${countryCode.toUpperCase()}/flat/64.png`;
    };

    // Set caption
    elements.mapCaption.innerHTML = `
        <strong>${country.capital}</strong> is the capital of <strong>${countryName}</strong>
    `;

    // Display fun fact
    const facts = state.funFacts[country.capital];
    if (facts && facts.length > 0) {
        const randomFact = facts[Math.floor(Math.random() * facts.length)];
        elements.funFactText.textContent = randomFact;
        elements.funFact.hidden = false;
    } else {
        elements.funFact.hidden = true;
    }

    // Show container with animation
    elements.mapContainer.style.display = 'block';
    elements.mapContainer.offsetHeight;
    elements.mapContainer.classList.add('visible');
}

function hideMap() {
    elements.mapContainer.classList.remove('visible');
    elements.funFact.hidden = true;
    setTimeout(() => {
        if (!elements.mapContainer.classList.contains('visible')) {
            elements.mapContainer.style.display = 'none';
            // Clear iframe to stop loading
            elements.europeMapContainer.innerHTML = '';
        }
    }, 300);
}

function getCountryCode(countryName) {
    const codes = {
        'France': 'fr', 'Germany': 'de', 'Spain': 'es', 'Italy': 'it', 'Portugal': 'pt',
        'Poland': 'pl', 'Netherlands': 'nl', 'Belgium': 'be', 'Austria': 'at', 'Switzerland': 'ch',
        'Sweden': 'se', 'Norway': 'no', 'Denmark': 'dk', 'Finland': 'fi', 'Greece': 'gr',
        'Czech Republic': 'cz', 'Hungary': 'hu', 'Romania': 'ro', 'Bulgaria': 'bg', 'Croatia': 'hr',
        'Slovenia': 'si', 'Slovakia': 'sk', 'Ireland': 'ie', 'Serbia': 'rs', 'Ukraine': 'ua',
        'Estonia': 'ee', 'Latvia': 'lv', 'Lithuania': 'lt', 'Albania': 'al', 'North Macedonia': 'mk',
        'Montenegro': 'me', 'Bosnia and Herzegovina': 'ba', 'Moldova': 'md', 'Belarus': 'by',
        'Iceland': 'is', 'Luxembourg': 'lu', 'Malta': 'mt', 'Cyprus': 'cy', 'Monaco': 'mc',
        'Andorra': 'ad', 'United Kingdom': 'gb', 'Russia': 'ru', 'Liechtenstein': 'li',
        'San Marino': 'sm', 'Kosovo': 'xk'
    };
    return codes[countryName] || 'eu';
}

// ========================================
// Question Review
// ========================================

function recordAnswer(selectedOption) {
    const country = state.questions[state.currentQuestionIndex];
    const correctAnswer = country.capital;

    state.answeredQuestions.push({
        question: `What is the capital of ${country.name}?`,
        userAnswer: selectedOption,
        correctAnswer: correctAnswer,
        isCorrect: selectedOption === correctAnswer
    });
}

function renderReview() {
    elements.reviewList.innerHTML = '';

    state.answeredQuestions.forEach((item, index) => {
        const reviewItem = document.createElement('div');
        reviewItem.className = `review-item ${item.isCorrect ? '' : 'wrong'}`;

        let answerHtml;
        if (item.userAnswer === null) {
            answerHtml = `<span class="wrong">No answer (time up)</span> → <span class="correct">${item.correctAnswer}</span>`;
        } else if (item.isCorrect) {
            answerHtml = `<span class="correct">${item.correctAnswer}</span>`;
        } else {
            answerHtml = `<span class="wrong">${item.userAnswer}</span> → <span class="correct">${item.correctAnswer}</span>`;
        }

        reviewItem.innerHTML = `
            <p class="review-question">${index + 1}. ${item.question}</p>
            <p class="review-answer">${answerHtml}</p>
        `;

        elements.reviewList.appendChild(reviewItem);
    });
}

function toggleReview() {
    const isHidden = elements.reviewContainer.hidden;
    elements.reviewContainer.hidden = !isHidden;
    elements.toggleReview.setAttribute('aria-expanded', isHidden);

    if (isHidden) {
        renderReview();
    }
}

// ========================================
// Share Results
// ========================================

function shareResults() {
    const questionsAnswered = state.gameMode === 'speedrun'
        ? state.speedRunQuestionsAnswered
        : state.totalQuestions;
    const percentage = questionsAnswered > 0
        ? Math.round((state.score / questionsAnswered) * 100)
        : 0;
    const difficultyText = state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1);

    let shareText;
    if (state.gameMode === 'speedrun') {
        shareText = `🌍 European Capitals Quiz - ⚡ Speed Run\n\n` +
            `📊 Score: ${state.score}/${questionsAnswered} (${percentage}%)\n` +
            `⏱️ Mode: 60-second challenge\n` +
            `🎯 Difficulty: ${difficultyText}\n` +
            `👤 Player: ${state.playerName}\n\n` +
            `Can you answer more questions in 60 seconds? 🏆`;
    } else {
        const regionName = getRegionName(state.selectedRegion);
        shareText = `🌍 European Capitals Quiz\n\n` +
            `📊 Score: ${state.score}/${questionsAnswered} (${percentage}%)\n` +
            `🎯 Difficulty: ${difficultyText}\n` +
            `🗺️ Region: ${regionName}\n` +
            `👤 Player: ${state.playerName}\n\n` +
            `Can you beat my score? 🏆`;
    }

    if (navigator.share) {
        navigator.share({
            title: 'European Capitals Quiz',
            text: shareText
        }).catch(() => {
            copyToClipboard(shareText);
        });
    } else {
        copyToClipboard(shareText);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast();
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast();
    });
}

/**
 * Generate and share/download results as an image
 */
function shareResultsAsImage() {
    const questionsAnswered = state.gameMode === 'speedrun'
        ? state.speedRunQuestionsAnswered
        : state.totalQuestions;
    const percentage = questionsAnswered > 0
        ? Math.round((state.score / questionsAnswered) * 100)
        : 0;

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = 600;
    canvas.height = 400;

    // Get theme colors
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const bgColor = isDark ? '#0f1729' : '#f8f6f1';
    const textColor = isDark ? '#f4f1e8' : '#1a1a2e';
    const accentColor = '#c9a227';
    const mutedColor = isDark ? '#8b8b8b' : '#666666';

    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw decorative border
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Draw inner border
    ctx.strokeStyle = isDark ? 'rgba(201, 162, 39, 0.3)' : 'rgba(201, 162, 39, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // Title
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 28px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('European Capitals Quiz', canvas.width / 2, 75);

    // Mode badge
    ctx.fillStyle = mutedColor;
    ctx.font = '14px "Source Sans 3", sans-serif';
    const modeText = state.gameMode === 'speedrun' ? '⚡ Speed Run Mode' : '🎯 Classic Mode';
    ctx.fillText(modeText, canvas.width / 2, 100);

    // Score circle
    const centerX = canvas.width / 2;
    const centerY = 190;
    const radius = 60;

    // Score circle background
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = isDark ? 'rgba(201, 162, 39, 0.1)' : 'rgba(201, 162, 39, 0.15)';
    ctx.fill();

    // Score circle border
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Score text
    ctx.fillStyle = textColor;
    ctx.font = 'bold 36px "Playfair Display", Georgia, serif';
    ctx.fillText(`${state.score}/${questionsAnswered}`, centerX, centerY + 5);

    // Percentage
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 20px "Source Sans 3", sans-serif';
    ctx.fillText(`${percentage}%`, centerX, centerY + 35);

    // Stats row
    const statsY = 290;
    ctx.fillStyle = textColor;
    ctx.font = '16px "Source Sans 3", sans-serif';

    const difficultyText = state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1);

    if (state.gameMode === 'speedrun') {
        ctx.fillText(`⏱️ 60 Seconds  •  🎯 ${difficultyText}  •  🔥 Best Streak: ${state.maxStreak}`, centerX, statsY);
    } else {
        const regionName = getRegionName(state.selectedRegion);
        ctx.fillText(`🗺️ ${regionName}  •  🎯 ${difficultyText}`, centerX, statsY);
    }

    // Player name
    ctx.fillStyle = mutedColor;
    ctx.font = '18px "Source Sans 3", sans-serif';
    ctx.fillText(`Player: ${state.playerName}`, centerX, 330);

    // Footer
    ctx.fillStyle = mutedColor;
    ctx.font = '12px "Source Sans 3", sans-serif';
    ctx.fillText('Can you beat my score? 🏆', centerX, 365);

    // Convert to image and download/share
    canvas.toBlob((blob) => {
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'quiz-results.png', { type: 'image/png' })] })) {
            // Share on mobile
            const file = new File([blob], 'quiz-results.png', { type: 'image/png' });
            navigator.share({
                title: 'European Capitals Quiz Results',
                text: `I scored ${state.score}/${questionsAnswered} (${percentage}%) on the European Capitals Quiz!`,
                files: [file]
            }).catch(() => {
                downloadImage(blob);
            });
        } else {
            // Download on desktop
            downloadImage(blob);
        }
    }, 'image/png');
}

function downloadImage(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `european-capitals-quiz-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Image downloaded!');
}

function showToast(message = 'Results copied to clipboard!') {
    elements.shareToast.textContent = message;
    elements.shareToast.hidden = false;
    elements.shareToast.classList.add('visible');

    setTimeout(() => {
        elements.shareToast.classList.remove('visible');
        setTimeout(() => {
            elements.shareToast.hidden = true;
        }, 300);
    }, 2500);
}

// ========================================
// Confetti
// ========================================

/**
 * Mini confetti burst for streak milestones
 */
function launchStreakConfetti() {
    const canvas = elements.confettiCanvas;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#ff6b35', '#f7c548', '#ff8c42', '#ffd166', '#ff9f1c'];

    // Fewer particles, burst from center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < 50; i++) {
        const angle = (Math.PI * 2 * i) / 50;
        const velocity = Math.random() * 8 + 4;
        particles.push({
            x: centerX,
            y: centerY,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedX: Math.cos(angle) * velocity,
            speedY: Math.sin(angle) * velocity,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5,
            alpha: 1
        });
    }

    let animationId;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let activeParticles = 0;

        particles.forEach(p => {
            if (p.alpha > 0) {
                activeParticles++;

                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                ctx.restore();

                p.x += p.speedX;
                p.y += p.speedY;
                p.speedY += 0.15; // Gravity
                p.rotation += p.rotationSpeed;
                p.alpha -= 0.02; // Fade out
            }
        });

        if (activeParticles > 0) {
            animationId = requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    animate();

    setTimeout(() => {
        cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 2000);
}

function launchConfetti() {
    const canvas = elements.confettiCanvas;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#c9a227', '#e8c547', '#2ecc71', '#3498db', '#e74c3c', '#9b59b6'];

    // Create particles
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 3 + 2,
            speedX: Math.random() * 2 - 1,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5
        });
    }

    let animationId;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let activeParticles = 0;

        particles.forEach(p => {
            if (p.y < canvas.height + 50) {
                activeParticles++;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                ctx.restore();

                p.y += p.speedY;
                p.x += p.speedX;
                p.rotation += p.rotationSpeed;
                p.speedY += 0.05; // Gravity
            }
        });

        if (activeParticles > 0) {
            animationId = requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    animate();

    // Stop after 5 seconds
    setTimeout(() => {
        cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 5000);
}

// ========================================
// Data Loading & Initialization
// ========================================

async function loadCountries() {
    try {
        const response = await fetch('countries.json');
        if (!response.ok) throw new Error('Failed to load countries');
        return await response.json();
    } catch (error) {
        console.error('Error loading countries:', error);
        return { countries: [], regions: [] };
    }
}

async function loadCities() {
    try {
        const response = await fetch('cities.json');
        if (!response.ok) throw new Error('Failed to load cities');
        return await response.json();
    } catch (error) {
        console.error('Error loading cities:', error);
        return {};
    }
}

async function loadFunFacts() {
    try {
        const response = await fetch('fun-facts.json');
        if (!response.ok) throw new Error('Failed to load fun facts');
        return await response.json();
    } catch (error) {
        console.error('Error loading fun facts:', error);
        return {};
    }
}

async function initApp() {
    // Initialize theme
    initTheme();

    // Load stored data
    loadAllStoredData();

    // Load data
    const [countriesData, citiesData, funFactsData] = await Promise.all([
        loadCountries(),
        loadCities(),
        loadFunFacts()
    ]);

    state.countries = countriesData.countries;
    state.regions = countriesData.regions;
    state.cities = citiesData;
    state.funFacts = funFactsData;

    // Update UI
    elements.totalQuestionCount.textContent = state.countries.length;
    populateRegionSelector();
    updateFilteredCountries();
    updateDifficultyHint();

    // Setup modal event listeners
    setupModalListeners();

    // Hide loading screen
    hideLoadingScreen();
}

function populateRegionSelector() {
    elements.regionSelect.innerHTML = '';

    state.regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region.id;
        option.textContent = region.name;
        elements.regionSelect.appendChild(option);
    });
}

function updateFilteredCountries() {
    const selectedRegion = elements.regionSelect.value;
    state.selectedRegion = selectedRegion;

    if (selectedRegion === 'all') {
        state.filteredCountries = [...state.countries];
    } else {
        state.filteredCountries = state.countries.filter(c => c.region === selectedRegion);
    }

    const availableCount = state.filteredCountries.length;
    elements.availableQuestions.textContent = availableCount;
    updateQuestionCountOptions(availableCount);
}

function updateQuestionCountOptions(availableCount) {
    const countSelect = elements.questionCountSelect;
    const previousValue = parseInt(countSelect.value) || 10;

    countSelect.innerHTML = '';

    const options = [];
    if (availableCount >= 5) options.push(5);
    if (availableCount >= 10) options.push(10);
    if (availableCount >= 15) options.push(15);
    if (availableCount >= 20) options.push(20);
    if (availableCount >= 25) options.push(25);
    if (availableCount >= 30) options.push(30);

    if (!options.includes(availableCount)) {
        options.push(availableCount);
    }

    if (options.length === 0) {
        options.push(availableCount);
    }

    options.forEach(count => {
        const option = document.createElement('option');
        option.value = count;
        option.textContent = count === availableCount ? `All ${count} Questions` : `${count} Questions`;
        countSelect.appendChild(option);
    });

    const validOptions = options.filter(o => o <= availableCount);
    if (validOptions.includes(previousValue)) {
        countSelect.value = previousValue;
    } else {
        const defaultOption = validOptions.find(o => o <= Math.ceil(availableCount / 2)) || availableCount;
        countSelect.value = defaultOption;
    }
}

function getRegionName(regionId) {
    const region = state.regions.find(r => r.id === regionId);
    return region ? region.name : 'All of Europe';
}

// ========================================
// Option Generation
// ========================================

function getCitiesForCountry(countryName) {
    return state.cities[countryName] || [];
}

function getRandomCapitals(count, exclude = []) {
    const availableCapitals = state.countries
        .map(c => c.capital)
        .filter(capital => !exclude.includes(capital));

    return shuffleArray(availableCapitals).slice(0, count);
}

function getRandomForeignCities(count, excludeCountry) {
    const foreignCities = Object.entries(state.cities)
        .filter(([country]) => country !== excludeCountry)
        .flatMap(([, cities]) => cities);

    return shuffleArray(foreignCities).slice(0, count);
}

function generateOptions(country, difficulty) {
    const correctAnswer = country.capital;
    let options = [correctAnswer];

    switch (difficulty) {
        case 'easy':
            const sameCities = shuffleArray(getCitiesForCountry(country.name)).slice(0, 3);
            options = options.concat(sameCities);
            break;
        case 'medium':
            const localCities = shuffleArray(getCitiesForCountry(country.name)).slice(0, 2);
            const foreignCity = getRandomForeignCities(1, country.name);
            options = options.concat(localCities, foreignCity);
            break;
        case 'hard':
            const otherCapitals = getRandomCapitals(3, [country.capital]);
            options = options.concat(otherCapitals);
            break;
    }

    return shuffleArray(options);
}

// ========================================
// Quiz Logic
// ========================================

function initQuiz() {
    if (state.filteredCountries.length === 0) {
        alert('No questions available for the selected region.');
        return;
    }

    // Get game mode
    const gameModeRadio = document.querySelector('input[name="game-mode"]:checked');
    state.gameMode = gameModeRadio ? gameModeRadio.value : 'classic';

    // Get settings
    state.playerName = elements.playerNameInput.value.trim() || 'Player';
    state.difficulty = elements.difficultySelect.value;

    if (state.gameMode === 'speedrun') {
        // Speed run: use ALL countries (ignore region selection), no per-question timer
        state.filteredCountries = [...state.countries];
        state.selectedRegion = 'all';
        state.totalQuestions = state.filteredCountries.length;
        state.timerEnabled = false;
        state.speedRunTimeRemaining = 60;
        state.speedRunQuestionsAnswered = 0;
    } else {
        state.totalQuestions = parseInt(elements.questionCountSelect.value);
        state.timerDuration = parseInt(elements.timerSelect.value);
        state.timerEnabled = state.timerDuration > 0;
    }

    // Reset hints
    state.hintsLetter = 2;
    state.hintsEliminate = 2;
    state.hintsUsedThisQuiz = 0;
    updateHintButtons();

    // Shuffle and select questions
    const shuffled = shuffleArray(state.filteredCountries);
    state.questions = shuffled.slice(0, state.totalQuestions);

    // Reset state
    state.currentQuestionIndex = 0;
    state.score = 0;
    state.selectedAnswer = null;
    state.answered = false;
    state.answeredQuestions = [];
    state.sessionStreak = 0;
    state.maxStreak = 0;
    state.quizStartTime = Date.now();

    // Update UI
    if (state.gameMode === 'speedrun') {
        elements.totalQuestions.textContent = '∞';
        elements.regionBadge.textContent = '⚡ Speed Run';
        elements.currentQuestion.textContent = '0';
        // Hide hints in speed run (auto-advance makes them impractical)
        document.querySelector('.hints-container').style.display = 'none';
        // Hide next button, show quit button (X at top)
        elements.nextBtn.style.display = 'none';
        elements.quitBtn.style.display = 'flex';
    } else {
        elements.totalQuestions.textContent = state.totalQuestions;
        elements.regionBadge.textContent = getRegionName(state.selectedRegion);
        document.querySelector('.hints-container').style.display = '';
        // Show next button, hide quit button
        elements.nextBtn.style.display = '';
        elements.quitBtn.style.display = 'none';
    }
    elements.currentScore.textContent = '0';
    elements.reviewContainer.hidden = true;
    elements.toggleReview.setAttribute('aria-expanded', 'false');
    resetStreakDisplay();

    // Show quiz screen
    showScreen('quiz-screen');
    loadQuestion();

    // Start speed run timer
    if (state.gameMode === 'speedrun') {
        startSpeedRunTimer();
    }
}

function loadQuestion() {
    const country = state.questions[state.currentQuestionIndex];

    // Reset state
    state.selectedAnswer = null;
    state.answered = false;
    state.letterHintUsed = false;
    state.eliminatedOptions = [];
    elements.nextBtn.disabled = true;

    // Remove any existing hint
    const existingHint = document.querySelector('.question-hint');
    if (existingHint) existingHint.remove();

    // Hide map immediately (no animation for reset)
    elements.mapContainer.classList.remove('visible');
    elements.mapContainer.style.display = 'none';

    // Update hints (re-enable if not used up)
    elements.hintLetter.disabled = state.hintsLetter <= 0;
    elements.hintEliminate.disabled = state.hintsEliminate <= 0;

    // Update progress
    if (state.gameMode === 'speedrun') {
        // In speed run, show questions answered so far
        elements.currentQuestion.textContent = state.speedRunQuestionsAnswered;
        // Progress bar fills based on time remaining instead
        const progress = (state.speedRunTimeRemaining / 60) * 100;
        elements.progressFill.style.width = `${progress}%`;
        elements.progressFill.parentElement.setAttribute('aria-valuenow', progress);
    } else {
        elements.currentQuestion.textContent = state.currentQuestionIndex + 1;
        const progress = ((state.currentQuestionIndex) / state.totalQuestions) * 100;
        elements.progressFill.style.width = `${progress}%`;
        elements.progressFill.parentElement.setAttribute('aria-valuenow', progress);
    }

    // Display question with flag
    const countryCode = getCountryCode(country.name);
    elements.questionFlag.src = `https://flagcdn.com/w80/${countryCode}.png`;
    elements.questionFlag.alt = `Flag of ${country.name}`;
    elements.questionText.textContent = `What is the capital of ${country.name}?`;

    // Generate options
    const options = generateOptions(country, state.difficulty);
    state.currentOptions = options;
    state.currentCorrectIndex = options.indexOf(country.capital);

    // Trigger question animation
    elements.questionContainer.classList.remove('fade-in');
    elements.questionContainer.offsetHeight; // Force reflow
    elements.questionContainer.classList.add('fade-in');

    // Clear and populate options with animation
    elements.optionsContainer.innerHTML = '';
    elements.optionsContainer.classList.remove('fade-in');
    elements.optionsContainer.offsetHeight; // Force reflow
    elements.optionsContainer.classList.add('fade-in');

    options.forEach((optionText, displayIndex) => {
        const optionElement = createOptionElement(optionText, displayIndex);
        elements.optionsContainer.appendChild(optionElement);
    });

    // Update next button text
    const nextBtnText = elements.nextBtn.querySelector('span');
    if (state.currentQuestionIndex === state.totalQuestions - 1) {
        nextBtnText.textContent = 'See Results';
    } else {
        nextBtnText.textContent = 'Next Question';
    }

    // Start timer
    stopTimer();
    startTimer();
}

function createOptionElement(optionText, displayIndex) {
    const div = document.createElement('div');
    div.className = 'option';
    div.dataset.index = displayIndex;
    div.setAttribute('role', 'button');
    div.setAttribute('tabindex', '0');
    div.setAttribute('aria-label', `Option ${getOptionLetter(displayIndex)}: ${optionText}`);

    div.innerHTML = `
        <span class="option-letter" aria-hidden="true">${getOptionLetter(displayIndex)}</span>
        <span class="option-text">${optionText}</span>
        <span class="option-icon" aria-hidden="true"></span>
    `;

    div.addEventListener('click', () => handleOptionClick(div, displayIndex));
    div.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOptionClick(div, displayIndex);
        }
    });

    return div;
}

function handleOptionClick(optionElement, selectedIndex) {
    if (state.answered || state.eliminatedOptions.includes(selectedIndex)) return;
    selectOption(optionElement, selectedIndex);
}

function selectOption(optionElement, selectedIndex) {
    state.answered = true;
    state.selectedAnswer = selectedIndex;

    // Stop timer
    stopTimer();

    const isCorrect = selectedIndex === state.currentCorrectIndex;
    const selectedText = state.currentOptions[selectedIndex];
    const country = state.questions[state.currentQuestionIndex];

    // Update score and streak
    if (isCorrect) {
        state.score++;
        state.sessionStreak++;
        state.maxStreak = Math.max(state.maxStreak, state.sessionStreak);
        elements.currentScore.textContent = state.score;

        // Celebrate streak milestones (every 5 correct)
        if (state.sessionStreak > 0 && state.sessionStreak % 5 === 0) {
            launchStreakConfetti();
        }
    } else {
        state.sessionStreak = 0;
    }

    // Update streak display
    updateStreakDisplay();

    // Track country progress
    updateCountryProgress(country.name, isCorrect);

    // Record answer
    recordAnswer(selectedText);

    // Mark options
    const allOptions = elements.optionsContainer.querySelectorAll('.option');
    allOptions.forEach((option, index) => {
        option.classList.add('disabled');
        option.setAttribute('aria-disabled', 'true');
        const iconSpan = option.querySelector('.option-icon');

        if (index === state.currentCorrectIndex) {
            option.classList.add('correct');
            iconSpan.innerHTML = '✓';
        } else if (index === selectedIndex) {
            option.classList.add('incorrect');
            iconSpan.innerHTML = '✗';
        }
    });

    // Speed run mode: auto-advance quickly
    if (state.gameMode === 'speedrun') {
        state.speedRunQuestionsAnswered++;
        // Update the displayed count immediately
        elements.currentQuestion.textContent = state.speedRunQuestionsAnswered;
        // Quick flash of result then advance
        setTimeout(() => {
            if (state.speedRunTimeRemaining > 0) {
                nextQuestion();
            }
        }, 300);
        return;
    }

    // Classic mode: show map and wait for next button
    showMap();

    // Enable next button
    elements.nextBtn.disabled = false;
    elements.nextBtn.focus();

    // Announce result
    if (isCorrect) {
        announceToScreenReader('Correct!');
    } else {
        announceToScreenReader(`Incorrect. The correct answer is ${state.currentOptions[state.currentCorrectIndex]}`);
    }
}

function nextQuestion() {
    state.currentQuestionIndex++;

    // Speed run: loop questions if needed
    if (state.gameMode === 'speedrun') {
        if (state.currentQuestionIndex >= state.questions.length) {
            // Reshuffle and continue
            state.questions = shuffleArray([...state.filteredCountries]);
            state.currentQuestionIndex = 0;
        }
        loadQuestion();
        return;
    }

    // Classic mode
    if (state.currentQuestionIndex >= state.totalQuestions) {
        showResults();
    } else {
        loadQuestion();
    }
}

function showResults() {
    showScreen('results-screen');

    stopTimer();
    stopSpeedRunTimer();
    elements.timerContainer.classList.remove('active');

    // Speed run uses questions answered, classic uses total questions
    const questionsAnswered = state.gameMode === 'speedrun'
        ? state.speedRunQuestionsAnswered
        : state.totalQuestions;
    const percentage = questionsAnswered > 0
        ? Math.round((state.score / questionsAnswered) * 100)
        : 0;
    const incorrect = questionsAnswered - state.score;
    const quizDuration = state.gameMode === 'speedrun' ? 60 : (Date.now() - state.quizStartTime) / 1000;

    // Update display
    elements.finalScoreValue.textContent = state.score;
    elements.finalTotal.textContent = questionsAnswered;
    elements.scorePercentage.textContent = `${percentage}%`;
    elements.correctCount.textContent = state.score;
    elements.incorrectCount.textContent = incorrect;

    // Set message
    let title, message;
    const name = state.playerName;

    if (state.gameMode === 'speedrun') {
        // Speed run specific messaging
        if (questionsAnswered >= 20) {
            title = `Speed Demon, ${name}!`;
            message = `Incredible! ${questionsAnswered} questions in 60 seconds with ${percentage}% accuracy!`;
            launchConfetti();
        } else if (questionsAnswered >= 15) {
            title = `Lightning Fast, ${name}!`;
            message = `Great speed! ${questionsAnswered} questions answered in just 60 seconds!`;
        } else if (questionsAnswered >= 10) {
            title = `Quick Thinker, ${name}!`;
            message = `Good pace! You answered ${questionsAnswered} questions in the time limit.`;
        } else {
            title = `Keep Practicing, ${name}!`;
            message = `${questionsAnswered} questions answered. Try again to beat your record!`;
        }
    } else {
        // Classic mode messaging
        const regionName = getRegionName(state.selectedRegion);
        if (percentage === 100) {
            title = `Perfect Score, ${name}!`;
            message = `Incredible! You're a true ${regionName} geography expert!`;
            launchConfetti();
        } else if (percentage >= 80) {
            title = `Excellent, ${name}!`;
            message = `You really know your ${regionName} capitals!`;
        } else if (percentage >= 60) {
            title = `Well Done, ${name}!`;
            message = `Good knowledge of ${regionName}, but there's room to explore more!`;
        } else if (percentage >= 40) {
            title = `Not Bad, ${name}!`;
            message = `You're on your way to mastering ${regionName} capitals!`;
        } else {
            title = `Keep Learning, ${name}!`;
            message = `${regionName} has so much to discover. Try again!`;
        }
    }

    elements.resultsTitle.textContent = title;
    elements.resultsMessage.textContent = message;
    elements.progressFill.style.width = '100%';

    // Save to leaderboard (use questionsAnswered for accurate percentage)
    saveToLeaderboard(
        state.playerName,
        state.score,
        questionsAnswered,
        state.difficulty,
        state.gameMode === 'speedrun' ? 'speedrun' : state.selectedRegion
    );

    // Update stats for achievements
    const isPerfect = percentage === 100;
    const storedStats = loadFromStorage(STORAGE_KEYS.stats, {
        totalQuizzes: 0,
        perfectScores: 0,
        maxStreak: 0,
        hardQuizzes: 0,
        hardPerfectScores: 0,
        speedRuns: 0,
        perfectNoHints: 0,
        totalQuestionsAnswered: 0,
        totalCorrectAnswers: 0,
        totalTimeSpent: 0,
        bestStreakEver: 0
    });

    // Build complete updated stats
    const updatedStats = {
        ...storedStats,
        totalQuizzes: storedStats.totalQuizzes + 1,
        maxStreak: Math.max(storedStats.maxStreak, state.maxStreak),
        totalQuestionsAnswered: (storedStats.totalQuestionsAnswered || 0) + state.totalQuestions,
        totalCorrectAnswers: (storedStats.totalCorrectAnswers || 0) + state.score,
        totalTimeSpent: (storedStats.totalTimeSpent || 0) + quizDuration,
        bestStreakEver: Math.max(storedStats.bestStreakEver || 0, state.maxStreak)
    };

    if (isPerfect) {
        updatedStats.perfectScores = storedStats.perfectScores + 1;
    }

    if (state.difficulty === 'hard') {
        updatedStats.hardQuizzes = storedStats.hardQuizzes + 1;

        if (isPerfect) {
            updatedStats.hardPerfectScores = storedStats.hardPerfectScores + 1;
        }
    }

    // Speed run achievement (10 questions under 60 seconds)
    if (state.totalQuestions >= 10 && state.timerEnabled && quizDuration < 60 && isPerfect) {
        updatedStats.speedRuns = storedStats.speedRuns + 1;
    }

    // Perfect without hints
    if (isPerfect && state.hintsUsedThisQuiz === 0) {
        updatedStats.perfectNoHints = storedStats.perfectNoHints + 1;
    }

    // Calculate mastery stats from country progress
    const balkanCountries = ['Croatia', 'Slovenia', 'Serbia', 'Bosnia and Herzegovina', 'North Macedonia', 'Montenegro', 'Albania', 'Kosovo'];
    const nordicCountries = ['Sweden', 'Norway', 'Denmark', 'Finland', 'Iceland'];
    let masteredCountries = 0;
    let balkansMastered = 0;
    let nordicMastered = 0;

    Object.keys(state.countryProgress).forEach(country => {
        const p = state.countryProgress[country];
        const rate = p.attempts > 0 ? p.correct / p.attempts : 0;
        if (rate >= 0.8 && p.attempts >= 3) {
            masteredCountries++;
            if (balkanCountries.includes(country)) balkansMastered++;
            if (nordicCountries.includes(country)) nordicMastered++;
        }
    });

    // Add mastery stats
    updatedStats.masteredCountries = masteredCountries;
    updatedStats.balkansMastered = balkansMastered;
    updatedStats.nordicMastered = nordicMastered;

    // Save stats to storage
    saveToStorage(STORAGE_KEYS.stats, updatedStats);

    // Check achievements with the freshly calculated stats (no delay needed)
    checkAchievements(updatedStats);
}

function resetQuiz() {
    showScreen('start-screen');
    elements.progressFill.style.width = '0%';
    elements.timerContainer.classList.remove('active');
    stopTimer();
    updateFilteredCountries();
}

// ========================================
// Event Listeners
// ========================================

// Theme
elements.themeToggle.addEventListener('click', toggleTheme);

// Start Screen
elements.startBtn.addEventListener('click', initQuiz);
elements.regionSelect.addEventListener('change', updateFilteredCountries);
elements.difficultySelect.addEventListener('change', updateDifficultyHint);

// Game mode toggle - show/hide relevant settings
document.querySelectorAll('input[name="game-mode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const isSpeedRun = e.target.value === 'speedrun';
        // Hide timer, question count, and region for speed run (uses all countries)
        elements.timerSelect.closest('.setting-group').style.display = isSpeedRun ? 'none' : '';
        elements.questionCountSelect.closest('.setting-group').style.display = isSpeedRun ? 'none' : '';
        elements.regionSelect.closest('.setting-group').style.display = isSpeedRun ? 'none' : '';
        // Also hide the available questions count for speed run
        document.querySelector('.available-count').style.display = isSpeedRun ? 'none' : '';
    });
});

// Quiz Screen
elements.nextBtn.addEventListener('click', nextQuestion);
elements.quitBtn.addEventListener('click', quitSpeedRun);
elements.hintLetter.addEventListener('click', useLetterHint);
elements.hintEliminate.addEventListener('click', useEliminateHint);

function quitSpeedRun() {
    if (state.gameMode === 'speedrun' && state.speedRunTimer) {
        stopSpeedRunTimer();
        showResults();
    }
}

// Results Screen
elements.restartBtn.addEventListener('click', resetQuiz);
elements.shareBtn.addEventListener('click', shareResults);
elements.shareImageBtn.addEventListener('click', shareResultsAsImage);
elements.toggleReview.addEventListener('click', toggleReview);

// Stats Modal
elements.statsBtn.addEventListener('click', openStatsModal);

// ========================================
// Progress Tracking
// ========================================

function updateCountryProgress(countryName, isCorrect) {
    if (!state.countryProgress[countryName]) {
        state.countryProgress[countryName] = { attempts: 0, correct: 0 };
    }

    state.countryProgress[countryName].attempts++;
    if (isCorrect) {
        state.countryProgress[countryName].correct++;
    }

    saveToStorage(STORAGE_KEYS.progress, state.countryProgress);
}

function getCountryMasteryLevel(countryName) {
    const progress = state.countryProgress[countryName];
    if (!progress || progress.attempts === 0) return 'new';

    const rate = progress.correct / progress.attempts;
    if (rate >= 0.8 && progress.attempts >= 3) return 'mastered';
    if (rate >= 0.5) return 'learning';
    return 'weak';
}

// ========================================
// Achievements System
// ========================================

function checkAchievements(providedStats = null) {
    // Use provided stats or load from storage
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
        // Show all unlocked achievements
        showAchievementToast(newlyUnlocked);
    }

    return newlyUnlocked;
}

function showAchievementToast(achievements) {
    // Create achievement list HTML
    const achievementsList = achievements.map(a =>
        `<span class="achievement-toast-item">${a.icon} ${a.name}</span>`
    ).join('');

    const title = achievements.length === 1
        ? 'Achievement Unlocked!'
        : `${achievements.length} Achievements Unlocked!`;

    elements.achievementToast.innerHTML = `
        <span class="achievement-toast-icon">🏆</span>
        <div class="achievement-toast-content">
            <span class="achievement-toast-title">${title}</span>
            <div class="achievement-toast-list">${achievementsList}</div>
        </div>
    `;

    // Force reflow to ensure transition works
    elements.achievementToast.offsetHeight;
    elements.achievementToast.classList.add('visible');

    // Longer display time for multiple achievements
    const displayTime = 3500 + (achievements.length * 500);

    setTimeout(() => {
        elements.achievementToast.classList.remove('visible');
    }, displayTime);
}

// ========================================
// Leaderboard
// ========================================

function saveToLeaderboard(name, score, total, difficulty, region) {
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

    // Sort by percentage (desc), then by total questions (desc), then by date (desc)
    state.leaderboard.sort((a, b) => {
        if (b.percentage !== a.percentage) return b.percentage - a.percentage;
        if (b.total !== a.total) return b.total - a.total;
        return new Date(b.date) - new Date(a.date);
    });

    // Keep only top 20
    state.leaderboard = state.leaderboard.slice(0, 20);

    saveToStorage(STORAGE_KEYS.leaderboard, state.leaderboard);
}

// ========================================
// Stats Modal
// ========================================

function setupModalListeners() {
    // Close modal on overlay click
    const overlay = elements.statsModal.querySelector('.modal-overlay');
    overlay.addEventListener('click', closeStatsModal);

    // Close modal on X button
    const closeBtn = elements.statsModal.querySelector('.modal-close');
    closeBtn.addEventListener('click', closeStatsModal);

    // Tab switching
    elements.modalTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Progress filter
    elements.progressFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.progressFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProgressList(btn.dataset.filter);
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !elements.statsModal.hidden) {
            closeStatsModal();
        }
    });

    // Export/Import data
    elements.exportDataBtn.addEventListener('click', exportProgress);
    elements.importDataInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importProgress(e.target.files[0]);
            e.target.value = ''; // Reset input
        }
    });
}

function openStatsModal() {
    elements.statsModal.hidden = false;
    renderLifetimeStats();
    renderLeaderboard();
    renderAchievements();
    renderProgress();
}

function closeStatsModal() {
    elements.statsModal.hidden = true;
}

function switchTab(tabName) {
    // Update tab buttons
    elements.modalTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
        tab.setAttribute('aria-selected', tab.dataset.tab === tabName);
    });

    // Update tab content
    Object.entries(elements.modalTabContents).forEach(([name, content]) => {
        content.hidden = name !== tabName;
    });
}

function renderLeaderboard() {
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

function renderLifetimeStats() {
    const stats = loadFromStorage(STORAGE_KEYS.stats, {
        totalQuizzes: 0,
        bestStreakEver: 0,
        totalQuestionsAnswered: 0,
        totalCorrectAnswers: 0,
        totalTimeSpent: 0
    });

    elements.statTotalQuizzes.textContent = stats.totalQuizzes || 0;
    elements.statBestStreak.textContent = stats.bestStreakEver || 0;

    // Average time per question
    if (stats.totalQuestionsAnswered > 0) {
        const avgTime = stats.totalTimeSpent / stats.totalQuestionsAnswered;
        elements.statAvgTime.textContent = avgTime.toFixed(1) + 's';
    } else {
        elements.statAvgTime.textContent = '-';
    }

    // Accuracy
    if (stats.totalQuestionsAnswered > 0) {
        const accuracy = (stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100;
        elements.statAccuracy.textContent = accuracy.toFixed(0) + '%';
    } else {
        elements.statAccuracy.textContent = '-';
    }

    // Render weekly summary
    renderWeeklySummary();
}

function renderWeeklySummary() {
    const weeklyContainer = document.getElementById('weekly-summary');
    if (!weeklyContainer) return;

    const leaderboard = state.leaderboard;
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filter entries from the last 7 days
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

    // Calculate weekly stats
    const totalQuizzes = weeklyEntries.length;
    const totalQuestions = weeklyEntries.reduce((sum, e) => sum + e.total, 0);
    const totalCorrect = weeklyEntries.reduce((sum, e) => sum + e.score, 0);
    const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const bestScore = Math.max(...weeklyEntries.map(e => e.percentage));
    const perfectGames = weeklyEntries.filter(e => e.percentage === 100).length;

    // Group by day for chart
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

    // Generate day labels
    const dayLabels = Object.keys(dailyData).map(key => {
        const date = new Date(key);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    // Generate activity bars
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

function renderAchievements() {
    const grid = elements.achievementsGrid;
    grid.innerHTML = '';

    const achievementList = Object.values(ACHIEVEMENTS);
    const unlockedCount = Object.keys(state.achievements).length;

    elements.achievementsUnlocked.textContent = unlockedCount;
    elements.achievementsTotal.textContent = achievementList.length;

    achievementList.forEach(achievement => {
        const isUnlocked = !!state.achievements[achievement.id];

        const badge = document.createElement('div');
        badge.className = `achievement-badge ${isUnlocked ? 'unlocked' : 'locked'}`;
        badge.innerHTML = `
            <span class="achievement-icon">${achievement.icon}</span>
            <span class="achievement-name">${achievement.name}</span>
            <span class="achievement-desc">${achievement.description}</span>
        `;
        grid.appendChild(badge);
    });
}

function renderProgress() {
    // Calculate stats
    let mastered = 0, learning = 0, notSeen = 0;

    state.countries.forEach(country => {
        const level = getCountryMasteryLevel(country.name);
        if (level === 'mastered') mastered++;
        else if (level === 'learning' || level === 'weak') learning++;
        else notSeen++;
    });

    elements.progressMastered.textContent = mastered;
    elements.progressLearning.textContent = learning;
    elements.progressNew.textContent = notSeen;

    // Render list with current filter
    const activeFilter = document.querySelector('.progress-filter-btn.active');
    renderProgressList(activeFilter ? activeFilter.dataset.filter : 'all');
}

function renderProgressList(filter = 'all') {
    const list = elements.progressList;
    list.innerHTML = '';

    const filteredCountries = state.countries.filter(country => {
        const level = getCountryMasteryLevel(country.name);
        if (filter === 'all') return true;
        if (filter === 'mastered') return level === 'mastered';
        if (filter === 'learning') return level === 'learning';
        if (filter === 'weak') return level === 'weak';
        return true;
    });

    // Sort by success rate
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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Keyboard navigation
elements.playerNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') elements.startBtn.click();
});

document.addEventListener('keydown', (e) => {
    if (elements.quizScreen.classList.contains('active')) {
        const keyMap = {
            '1': 0, '2': 1, '3': 2, '4': 3,
            'a': 0, 'b': 1, 'c': 2, 'd': 3,
            'A': 0, 'B': 1, 'C': 2, 'D': 3
        };

        if (keyMap.hasOwnProperty(e.key) && !state.answered) {
            const options = elements.optionsContainer.querySelectorAll('.option:not(.eliminated)');
            const targetIndex = keyMap[e.key];
            if (options[targetIndex] && !state.eliminatedOptions.includes(targetIndex)) {
                options[targetIndex].click();
            }
        }

        if ((e.key === 'Enter' || e.key === ' ') && !elements.nextBtn.disabled) {
            e.preventDefault();
            elements.nextBtn.click();
        }
    }

    if (elements.startScreen.classList.contains('active') &&
        e.key === 'Enter' &&
        document.activeElement !== elements.playerNameInput) {
        elements.startBtn.click();
    }
});

// ========================================
// Initialize
// ========================================
initApp();