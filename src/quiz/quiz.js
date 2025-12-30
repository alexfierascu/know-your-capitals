/**
 * Core quiz logic
 */

import { state } from '../data/state.js';
import { elements } from '../ui/elements.js';
import { difficultyHintKeys, STORAGE_KEYS } from '../utils/constants.js';
import { shuffleArray, showScreen, getOptionLetter, getCountryCode, announceToScreenReader } from '../utils/utils.js';
import { t, translatePage } from '../utils/i18n.js';
import { loadFromStorage, saveToStorage } from '../data/storage.js';
import { startTimer, stopTimer, startSpeedRunTimer, stopSpeedRunTimer } from './timer.js';
import { updateHintButtons, resetHints } from './hints.js';
import { showMap, hideMap } from '../ui/map.js';
import { generateOptions } from './options.js';
import { updateCountryProgress } from '../ui/progress.js';
import { checkAchievements } from '../ui/achievements.js';
import { recordAnswer } from './review.js';
import { getRegionName } from '../ui/share.js';
import { saveToLeaderboard } from '../ui/leaderboard.js';
import { launchConfetti, launchStreakConfetti } from '../ui/confetti.js';

export function populateRegionSelect() {
    if (!elements.regionSelect) return;

    const currentValue = elements.regionSelect.value || 'all';
    elements.regionSelect.innerHTML = '';

    const regionKeys = {
        'all': 'regions.all',
        'western': 'regions.western',
        'northern': 'regions.northern',
        'southern': 'regions.southern',
        'eastern': 'regions.eastern',
        'baltic': 'regions.baltic',
        'balkans': 'regions.balkans'
    };

    state.regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region.id;
        const translationKey = regionKeys[region.id];
        option.textContent = translationKey ? t(translationKey) : region.name;
        elements.regionSelect.appendChild(option);
    });

    elements.regionSelect.value = currentValue;
}

export function updateFilteredCountries() {
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

export function updateQuestionCountOptions(availableCount) {
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
        if (count === availableCount) {
            option.textContent = t('settings.allQuestions', { count });
        } else {
            option.textContent = t('settings.nQuestions', { count });
        }
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

export function updateDifficultyHint() {
    const difficulty = elements.difficultySelect.value;
    const hintKey = difficultyHintKeys[difficulty];
    elements.difficultyHint.textContent = t(hintKey);
}

export function updateStreakDisplay() {
    if (state.sessionStreak >= 2) {
        elements.streakCount.textContent = state.sessionStreak;
        elements.streakDisplay.hidden = false;
        elements.streakDisplay.style.animation = 'none';
        elements.streakDisplay.offsetHeight;
        elements.streakDisplay.style.animation = '';
    } else {
        elements.streakDisplay.hidden = true;
    }
}

export function resetStreakDisplay() {
    elements.streakDisplay.hidden = true;
    elements.streakCount.textContent = '0';
}

export function initQuiz() {
    if (state.filteredCountries.length === 0) {
        alert('No questions available for the selected region.');
        return;
    }

    const gameModeRadio = document.querySelector('input[name="game-mode"]:checked');
    state.gameMode = gameModeRadio ? gameModeRadio.value : 'classic';

    // Get player name from user profile display
    const userNameElement = document.getElementById('user-name');
    state.playerName = userNameElement?.textContent?.trim() || 'Player';
    state.difficulty = elements.difficultySelect.value;

    if (state.gameMode === 'speedrun') {
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

    resetHints();

    const shuffled = shuffleArray(state.filteredCountries);
    state.questions = shuffled.slice(0, state.totalQuestions);

    state.currentQuestionIndex = 0;
    state.score = 0;
    state.selectedAnswer = null;
    state.answered = false;
    state.answeredQuestions = [];
    state.sessionStreak = 0;
    state.maxStreak = 0;
    state.quizStartTime = Date.now();

    if (state.gameMode === 'speedrun') {
        elements.totalQuestions.textContent = '∞';
        elements.regionBadge.textContent = '⚡ Speed Run';
        elements.currentQuestion.textContent = '0';
        document.querySelector('.hints-container').style.display = 'none';
        elements.nextBtn.style.display = 'none';
        elements.quitBtn.style.display = 'flex';
    } else {
        elements.totalQuestions.textContent = state.totalQuestions;
        elements.regionBadge.textContent = getRegionName(state.selectedRegion);
        document.querySelector('.hints-container').style.display = '';
        elements.nextBtn.style.display = '';
        elements.quitBtn.style.display = 'none';
    }
    elements.currentScore.textContent = '0';
    elements.reviewContainer.hidden = true;
    elements.toggleReview.setAttribute('aria-expanded', 'false');
    resetStreakDisplay();

    showScreen('quiz-screen');
    loadQuestion();

    if (state.gameMode === 'speedrun') {
        startSpeedRunTimer({ onTimeUp: showResults });
    }
}

export function loadQuestion() {
    const country = state.questions[state.currentQuestionIndex];

    state.selectedAnswer = null;
    state.answered = false;
    state.letterHintUsed = false;
    state.eliminatedOptions = [];
    elements.nextBtn.disabled = true;

    const existingHint = document.querySelector('.question-hint');
    if (existingHint) existingHint.remove();

    elements.mapContainer.classList.remove('visible');
    elements.mapContainer.style.display = 'none';

    elements.hintLetter.disabled = state.hintsLetter <= 0;
    elements.hintEliminate.disabled = state.hintsEliminate <= 0;

    if (state.gameMode === 'speedrun') {
        elements.currentQuestion.textContent = state.speedRunQuestionsAnswered;
        const progress = (state.speedRunTimeRemaining / 60) * 100;
        elements.progressFill.style.width = `${progress}%`;
        elements.progressFill.parentElement.setAttribute('aria-valuenow', progress);
    } else {
        elements.currentQuestion.textContent = state.currentQuestionIndex + 1;
        const progress = ((state.currentQuestionIndex) / state.totalQuestions) * 100;
        elements.progressFill.style.width = `${progress}%`;
        elements.progressFill.parentElement.setAttribute('aria-valuenow', progress);
    }

    const countryCode = getCountryCode(country.name);
    elements.questionFlag.src = `https://flagcdn.com/w80/${countryCode}.png`;
    elements.questionFlag.alt = `Flag of ${country.name}`;
    elements.questionText.textContent = `${t('quiz.questionPrefix')} ${country.name}?`;

    const options = generateOptions(country, state.difficulty);
    state.currentOptions = options;
    state.currentCorrectIndex = options.indexOf(country.capital);

    elements.questionContainer.classList.remove('fade-in');
    elements.questionContainer.offsetHeight;
    elements.questionContainer.classList.add('fade-in');

    elements.optionsContainer.innerHTML = '';
    elements.optionsContainer.classList.remove('fade-in');
    elements.optionsContainer.offsetHeight;
    elements.optionsContainer.classList.add('fade-in');

    options.forEach((optionText, displayIndex) => {
        const optionElement = createOptionElement(optionText, displayIndex);
        elements.optionsContainer.appendChild(optionElement);
    });

    const nextBtnText = elements.nextBtn.querySelector('span');
    if (state.currentQuestionIndex === state.totalQuestions - 1) {
        nextBtnText.textContent = 'See Results';
    } else {
        nextBtnText.textContent = 'Next Question';
    }

    stopTimer();
    startTimer({ onTimeUp: timeUp });
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

    stopTimer();

    const isCorrect = selectedIndex === state.currentCorrectIndex;
    const selectedText = state.currentOptions[selectedIndex];
    const country = state.questions[state.currentQuestionIndex];

    if (isCorrect) {
        state.score++;
        state.sessionStreak++;
        state.maxStreak = Math.max(state.maxStreak, state.sessionStreak);
        elements.currentScore.textContent = state.score;

        if (state.sessionStreak > 0 && state.sessionStreak % 5 === 0) {
            launchStreakConfetti();
        }
    } else {
        state.sessionStreak = 0;
    }

    updateStreakDisplay();
    updateCountryProgress(country.name, isCorrect);
    recordAnswer(selectedText);

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

    if (state.gameMode === 'speedrun') {
        state.speedRunQuestionsAnswered++;
        elements.currentQuestion.textContent = state.speedRunQuestionsAnswered;
        setTimeout(() => {
            if (state.speedRunTimeRemaining > 0) {
                nextQuestion();
            }
        }, 300);
        return;
    }

    showMap();

    elements.nextBtn.disabled = false;
    elements.nextBtn.focus();

    if (isCorrect) {
        announceToScreenReader('Correct!');
    } else {
        announceToScreenReader(`Incorrect. The correct answer is ${state.currentOptions[state.currentCorrectIndex]}`);
    }
}

function timeUp() {
    if (state.answered) return;

    state.answered = true;
    state.selectedAnswer = -1;
    state.sessionStreak = 0;

    const country = state.questions[state.currentQuestionIndex];

    updateCountryProgress(country.name, false);

    const allOptions = elements.optionsContainer.querySelectorAll('.option');
    allOptions.forEach((option, index) => {
        option.classList.add('disabled');
        const iconSpan = option.querySelector('.option-icon');

        if (index === state.currentCorrectIndex) {
            option.classList.add('correct');
            iconSpan.innerHTML = '✓';
        }
    });

    recordAnswer(null);
    showMap();
    elements.nextBtn.disabled = false;

    announceToScreenReader(t('quiz.timeUp') + ' ' + state.currentOptions[state.currentCorrectIndex]);
}

export function nextQuestion() {
    state.currentQuestionIndex++;

    if (state.gameMode === 'speedrun') {
        // If all questions have been answered, show results
        if (state.currentQuestionIndex >= state.questions.length) {
            showResults();
            return;
        }
        loadQuestion();
        return;
    }

    if (state.currentQuestionIndex >= state.totalQuestions) {
        showResults();
    } else {
        loadQuestion();
    }
}

export function showResults() {
    showScreen('results-screen');

    stopTimer();
    stopSpeedRunTimer();
    elements.timerContainer.classList.remove('active');

    const questionsAnswered = state.gameMode === 'speedrun'
        ? state.speedRunQuestionsAnswered
        : state.totalQuestions;
    const percentage = questionsAnswered > 0
        ? Math.round((state.score / questionsAnswered) * 100)
        : 0;
    const incorrect = questionsAnswered - state.score;
    const quizDuration = state.gameMode === 'speedrun' ? 60 : (Date.now() - state.quizStartTime) / 1000;

    elements.finalScoreValue.textContent = state.score;
    elements.finalTotal.textContent = questionsAnswered;
    elements.scorePercentage.textContent = `${percentage}%`;
    elements.correctCount.textContent = state.score;
    elements.incorrectCount.textContent = incorrect;

    let title, message;
    const name = state.playerName;

    if (state.gameMode === 'speedrun') {
        if (questionsAnswered >= 20) {
            title = t('results.speedDemon', { name });
            message = t('results.speedDemonMsg', { count: questionsAnswered, percent: percentage });
            launchConfetti();
        } else if (questionsAnswered >= 15) {
            title = t('results.lightningFast', { name });
            message = t('results.lightningFastMsg', { count: questionsAnswered });
        } else if (questionsAnswered >= 10) {
            title = t('results.quickThinker', { name });
            message = t('results.quickThinkerMsg', { count: questionsAnswered });
        } else {
            title = t('results.keepPracticing', { name });
            message = t('results.keepPracticingMsg', { count: questionsAnswered });
        }
    } else {
        const regionName = getRegionName(state.selectedRegion);
        if (percentage === 100) {
            title = t('results.perfectScore', { name });
            message = t('results.perfectScoreMsg', { region: regionName });
            launchConfetti();
        } else if (percentage >= 80) {
            title = t('results.excellent', { name });
            message = t('results.excellentMsg', { region: regionName });
        } else if (percentage >= 60) {
            title = t('results.wellDone', { name });
            message = t('results.wellDoneMsg', { region: regionName });
        } else if (percentage >= 40) {
            title = t('results.notBad', { name });
            message = t('results.notBadMsg', { region: regionName });
        } else {
            title = t('results.keepLearning', { name });
            message = t('results.keepLearningMsg', { region: regionName });
        }
    }

    elements.resultsTitle.textContent = title;
    elements.resultsMessage.textContent = message;
    elements.progressFill.style.width = '100%';

    saveToLeaderboard(
        state.playerName,
        state.score,
        questionsAnswered,
        state.difficulty,
        state.gameMode === 'speedrun' ? 'speedrun' : state.selectedRegion
    );

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

    if (state.totalQuestions >= 10 && state.timerEnabled && quizDuration < 60 && isPerfect) {
        updatedStats.speedRuns = storedStats.speedRuns + 1;
    }

    if (isPerfect && state.hintsUsedThisQuiz === 0) {
        updatedStats.perfectNoHints = storedStats.perfectNoHints + 1;
    }

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

    updatedStats.masteredCountries = masteredCountries;
    updatedStats.balkansMastered = balkansMastered;
    updatedStats.nordicMastered = nordicMastered;

    saveToStorage(STORAGE_KEYS.stats, updatedStats);
    checkAchievements(updatedStats);
}

export function resetQuiz() {
    showScreen('start-screen');
    elements.progressFill.style.width = '0%';
    elements.timerContainer.classList.remove('active');
    stopTimer();
    updateFilteredCountries();
}

export function quitSpeedRun() {
    if (state.gameMode === 'speedrun' && state.speedRunTimer) {
        stopSpeedRunTimer();
        showResults();
    }
}

export function hideLoadingScreen() {
    elements.loadingScreen.classList.add('hidden');
}
