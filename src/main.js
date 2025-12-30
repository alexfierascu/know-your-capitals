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
import { initAnalytics, setAnalyticsConsent, hasAnalyticsConsent } from './utils/analytics.js';
import { startOnboarding, shouldShowOnboarding } from './ui/onboarding.js';

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

    // Start Screen - handle form submit
    document.getElementById('quiz-settings').addEventListener('submit', (e) => {
        e.preventDefault();
        initQuiz();
    });
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

        // Form submission is handled naturally by the submit button, no need for manual Enter handling
    });

    // Legal Modals
    setupLegalModals();
}

/**
 * Setup legal modal open/close handlers
 */
function setupLegalModals() {
    const privacyBtn = document.getElementById('privacy-policy-btn');
    const termsBtn = document.getElementById('terms-of-service-btn');
    const privacyModal = document.getElementById('privacy-modal');
    const termsModal = document.getElementById('terms-modal');

    // Open modals
    privacyBtn?.addEventListener('click', () => privacyModal.hidden = false);
    termsBtn?.addEventListener('click', () => termsModal.hidden = false);

    // Close modals
    [privacyModal, termsModal].forEach(modal => {
        if (!modal) return;

        // Close button
        modal.querySelector('.legal-modal-close')?.addEventListener('click', () => {
            modal.hidden = true;
        });

        // Overlay click
        modal.querySelector('.legal-modal-overlay')?.addEventListener('click', () => {
            modal.hidden = true;
        });

        // Escape key
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') modal.hidden = true;
        });
    });

    // Cookie consent
    setupCookieConsent(privacyModal);

    // Offline indicator
    setupOfflineIndicator();
}

/**
 * Setup offline indicator
 */
function setupOfflineIndicator() {
    const indicator = document.getElementById('offline-indicator');
    if (!indicator) return;

    const updateOnlineStatus = () => {
        indicator.hidden = navigator.onLine;
    };

    // Initial check
    updateOnlineStatus();

    // Listen for changes
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
}

/**
 * Setup cookie consent banner
 */
function setupCookieConsent(privacyModal) {
    const COOKIE_CONSENT_KEY = 'cookie-consent-accepted';
    const cookieBanner = document.getElementById('cookie-consent');
    const acceptAllBtn = document.getElementById('cookie-accept');
    const acceptEssentialBtn = document.getElementById('cookie-essential');
    const privacyBtn = document.getElementById('cookie-privacy');

    if (!cookieBanner) return;

    // Check if already accepted
    if (localStorage.getItem(COOKIE_CONSENT_KEY)) {
        // Initialize analytics if previously consented
        if (hasAnalyticsConsent()) {
            initAnalytics();
        }
        return; // Don't show banner
    }

    // Show banner
    cookieBanner.hidden = false;

    // Accept all (including analytics)
    acceptAllBtn?.addEventListener('click', () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
        setAnalyticsConsent(true);
        cookieBanner.hidden = true;
    });

    // Accept essential only (no analytics)
    acceptEssentialBtn?.addEventListener('click', () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
        setAnalyticsConsent(false);
        cookieBanner.hidden = true;
    });

    // Privacy policy link
    privacyBtn?.addEventListener('click', () => {
        if (privacyModal) privacyModal.hidden = false;
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

    // Hide loading screen first for faster perceived load
    hideLoadingScreen();

    // Start onboarding tutorial for first-time users (after a short delay)
    if (shouldShowOnboarding()) {
        setTimeout(startOnboarding, 500);
    }

    // Defer Firebase initialization to after initial render
    // This allows the page to be interactive before loading Firebase (~500KB)
    const initFirebase = async () => {
        await initAuth();
        markInitialized();
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => initFirebase(), { timeout: 2000 });
    } else {
        setTimeout(initFirebase, 100);
    }
}

// Start the app
initApp();
