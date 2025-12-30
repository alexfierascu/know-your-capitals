/**
 * DOM element references
 * Initialized after DOM is ready
 */

export let elements = {};

export function initElements() {
    elements = {
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

        // Stats Button
        statsBtn: document.getElementById('stats-btn'),

        // Modal Web Components
        statsModal: document.getElementById('stats-modal'),
        migrationModal: document.getElementById('migration-modal'),
        resetConfirmModal: document.getElementById('reset-confirm-modal'),
        deleteAccountModal: document.getElementById('delete-account-modal'),
        profileModal: document.getElementById('profile-modal')
    };
}
