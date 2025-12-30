/**
 * Onboarding Tutorial
 * Shows first-time users how to use the app
 */

const ONBOARDING_KEY = 'onboarding-completed';

const STEPS = [
    {
        icon: '🧭',
        title: 'Welcome!',
        description: 'Test your knowledge of European capital cities. This quick tour will show you around!'
    },
    {
        icon: '⚙️',
        title: 'Customize Your Quiz',
        description: 'Choose your difficulty, select a region, and pick how many questions you want. Try Speed Run mode for a 60-second challenge!'
    },
    {
        icon: '💡',
        title: 'Use Hints Wisely',
        description: 'Stuck on a question? Use hints to reveal the first letter or eliminate a wrong answer. But use them sparingly!'
    },
    {
        icon: '📊',
        title: 'Track Your Progress',
        description: 'View your stats, unlock achievements, and see which countries you\'ve mastered. Aim for 100% completion!'
    },
    {
        icon: '🌍',
        title: 'Multiple Languages',
        description: 'The quiz is available in 10 languages. Switch anytime using the language selector in the header.'
    },
    {
        icon: '🚀',
        title: 'You\'re All Set!',
        description: 'Sign in to save your progress across devices, or play as a guest. Good luck and have fun!'
    }
];

let currentStep = 0;
let overlay = null;

/**
 * Check if onboarding should be shown
 */
export function shouldShowOnboarding() {
    return !localStorage.getItem(ONBOARDING_KEY);
}

/**
 * Mark onboarding as completed
 */
export function completeOnboarding() {
    localStorage.setItem(ONBOARDING_KEY, 'true');
}

/**
 * Reset onboarding (for testing)
 */
export function resetOnboarding() {
    localStorage.removeItem(ONBOARDING_KEY);
}

/**
 * Start the onboarding tutorial
 */
export function startOnboarding() {
    if (!shouldShowOnboarding()) return;

    currentStep = 0;
    createOverlay();
    showStep(currentStep);
}

/**
 * Create the overlay elements
 */
function createOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'onboarding-overlay';
    overlay.innerHTML = `
        <div class="onboarding-backdrop"></div>
        <div class="onboarding-tooltip">
            <div class="onboarding-icon"></div>
            <div class="onboarding-tooltip-content">
                <h3 class="onboarding-title"></h3>
                <p class="onboarding-description"></p>
            </div>
            <div class="onboarding-dots">
                ${STEPS.map((_, i) => `<div class="onboarding-dot" data-step="${i}"></div>`).join('')}
            </div>
            <div class="onboarding-footer">
                <button class="onboarding-btn onboarding-btn--skip">Skip</button>
                <button class="onboarding-btn onboarding-btn--next">Next</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Add event listeners
    overlay.querySelector('.onboarding-btn--skip').addEventListener('click', endOnboarding);
    overlay.querySelector('.onboarding-btn--next').addEventListener('click', nextStep);
    overlay.querySelector('.onboarding-backdrop').addEventListener('click', endOnboarding);

    // Close on escape
    document.addEventListener('keydown', handleKeydown);
}

/**
 * Handle keyboard navigation
 */
function handleKeydown(e) {
    if (!overlay) return;

    if (e.key === 'Escape') {
        endOnboarding();
    } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
        nextStep();
    } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        currentStep--;
        showStep(currentStep);
    }
}

/**
 * Show a specific step
 */
function showStep(stepIndex) {
    const step = STEPS[stepIndex];

    // Update content
    overlay.querySelector('.onboarding-icon').textContent = step.icon;
    overlay.querySelector('.onboarding-title').textContent = step.title;
    overlay.querySelector('.onboarding-description').textContent = step.description;

    // Update dots
    overlay.querySelectorAll('.onboarding-dot').forEach((dot, i) => {
        dot.classList.remove('onboarding-dot--active', 'onboarding-dot--completed');
        if (i === stepIndex) {
            dot.classList.add('onboarding-dot--active');
        } else if (i < stepIndex) {
            dot.classList.add('onboarding-dot--completed');
        }
    });

    // Update button text
    const nextBtn = overlay.querySelector('.onboarding-btn--next');
    nextBtn.textContent = stepIndex === STEPS.length - 1 ? 'Get Started' : 'Next';

    // Hide skip on last step
    const skipBtn = overlay.querySelector('.onboarding-btn--skip');
    skipBtn.style.display = stepIndex === STEPS.length - 1 ? 'none' : '';
}

/**
 * Go to next step
 */
function nextStep() {
    currentStep++;
    if (currentStep >= STEPS.length) {
        endOnboarding();
    } else {
        showStep(currentStep);
    }
}

/**
 * End the onboarding
 */
function endOnboarding() {
    if (!overlay) return;

    completeOnboarding();

    // Remove event listener
    document.removeEventListener('keydown', handleKeydown);

    // Animate out
    overlay.classList.add('onboarding-overlay--closing');

    setTimeout(() => {
        if (overlay && overlay.parentNode) {
            overlay.remove();
        }
        overlay = null;
    }, 300);
}
