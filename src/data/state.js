/**
 * Application state
 */

export const state = {
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

/**
 * Reset quiz-specific state
 */
export function resetQuizState() {
    state.currentQuestionIndex = 0;
    state.score = 0;
    state.selectedAnswer = null;
    state.answered = false;
    state.answeredQuestions = [];
    state.sessionStreak = 0;
    state.letterHintUsed = false;
    state.eliminatedOptions = [];
    state.hintsUsedThisQuiz = 0;
}

/**
 * Reset hints to default values based on difficulty
 */
export function resetHints() {
    state.hintsLetter = 2;
    state.hintsEliminate = 2;
    state.letterHintUsed = false;
    state.eliminatedOptions = [];
    state.hintsUsedThisQuiz = 0;
}
