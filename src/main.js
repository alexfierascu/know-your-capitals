/**
 * European Capitals Quiz
 * Main entry point
 */

import { state } from './data/state.js';
import { initElements, elements } from './ui/elements.js';
import { initTheme, toggleTheme } from './utils/theme.js';
import { initI18n, setupLanguageSelector, loadFunFacts, translatePage } from './utils/i18n.js';
import { loadAllStoredData } from './data/storage.js';
import {
    initQuiz,
    nextQuestion,
    resetQuiz,
    quitSpeedRun,
    updateFilteredCountries,
    updateDifficultyHint,
    populateRegionSelect,
    hideLoadingScreen
} from './quiz/quiz.js';
import { useLetterHint, useEliminateHint } from './quiz/hints.js';
import { toggleReview } from './quiz/review.js';
import { shareResults, shareResultsAsImage } from './ui/share.js';
import { openStatsModal, setupModalListeners } from './ui/stats.js';
import { initAuth } from './auth/auth.js';
import { initAuthElements, setupAuthUI } from './auth/authUI.js';
import { initDataSync, markInitialized } from './data/dataSync.js';

// Import Web Components (auto-registers custom elements)
import './ui/components/index.js';

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

function setupEventListeners() {
    // Theme
    elements.themeToggle.addEventListener('click', toggleTheme);

    // Start Screen
    elements.startBtn.addEventListener('click', initQuiz);
    elements.regionSelect.addEventListener('change', updateFilteredCountries);
    elements.difficultySelect.addEventListener('change', updateDifficultyHint);

    // Game mode toggle
    document.querySelectorAll('input[name="game-mode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const isSpeedRun = e.target.value === 'speedrun';
            elements.timerSelect.closest('.setting-group').style.display = isSpeedRun ? 'none' : '';
            elements.questionCountSelect.closest('.setting-group').style.display = isSpeedRun ? 'none' : '';
            elements.regionSelect.closest('.setting-group').style.display = isSpeedRun ? 'none' : '';
            document.querySelector('.available-count').style.display = isSpeedRun ? 'none' : '';
        });
    });

    // Quiz Screen
    elements.nextBtn.addEventListener('click', nextQuestion);
    elements.quitBtn.addEventListener('click', quitSpeedRun);
    elements.hintLetter.addEventListener('click', useLetterHint);
    elements.hintEliminate.addEventListener('click', useEliminateHint);

    // Results Screen
    elements.restartBtn.addEventListener('click', resetQuiz);
    elements.shareBtn.addEventListener('click', shareResults);
    elements.shareImageBtn.addEventListener('click', shareResultsAsImage);
    elements.toggleReview.addEventListener('click', toggleReview);

    // Stats Modal
    elements.statsBtn.addEventListener('click', openStatsModal);

    // Keyboard navigation
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

        if (elements.startScreen.classList.contains('active') && e.key === 'Enter') {
            elements.startBtn.click();
        }
    });
}

async function initApp() {
    // Initialize DOM elements
    initElements();

    // Initialize auth elements
    initAuthElements();

    // Initialize theme
    initTheme();

    // Initialize i18n
    await initI18n();

    // Setup language selector with reload callbacks
    setupLanguageSelector({
        onLanguageChange: () => {
            loadFunFacts();
            populateRegionSelect();
            updateFilteredCountries(); // This also updates question count options
        }
    });

    // Load stored data
    loadAllStoredData();

    // Load data
    const [countriesData, citiesData] = await Promise.all([
        loadCountries(),
        loadCities()
    ]);

    state.countries = countriesData.countries;
    state.regions = countriesData.regions;
    state.cities = citiesData;

    // Load fun facts
    await loadFunFacts();

    // Update UI
    elements.totalQuestionCount.textContent = state.countries.length;
    populateRegionSelect();
    updateFilteredCountries();
    updateDifficultyHint();

    // Setup event listeners
    setupEventListeners();

    // Setup modal listeners
    setupModalListeners();

    // Setup auth UI
    setupAuthUI();

    // Initialize data sync
    initDataSync();

    // Initialize auth (this will trigger auth state change and show appropriate screen)
    await initAuth();

    // Mark data sync as initialized (after auth is ready)
    markInitialized();

    // Hide loading screen
    hideLoadingScreen();
}

// Start the app
initApp();
