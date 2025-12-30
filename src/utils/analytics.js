/**
 * Google Analytics 4 Integration
 * Only loads after user consent
 */

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const CONSENT_KEY = 'analytics-consent';

let isInitialized = false;

/**
 * Check if user has given consent
 */
export function hasAnalyticsConsent() {
    return localStorage.getItem(CONSENT_KEY) === 'granted';
}

/**
 * Set analytics consent
 */
export function setAnalyticsConsent(granted) {
    localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');
    if (granted) {
        initAnalytics();
    }
}

/**
 * Initialize Google Analytics (only after consent)
 */
export function initAnalytics() {
    if (isInitialized || !GA_MEASUREMENT_ID || !hasAnalyticsConsent()) {
        return;
    }

    // Load gtag.js script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
        // Anonymize IP for privacy
        anonymize_ip: true,
        // Disable ads features we don't need
        allow_google_signals: false,
        allow_ad_personalization_signals: false
    });

    isInitialized = true;
    console.log('[Analytics] Initialized');
}

/**
 * Track a custom event
 */
export function trackEvent(eventName, params = {}) {
    if (!isInitialized || !window.gtag) return;
    window.gtag('event', eventName, params);
}

/**
 * Track quiz completion
 */
export function trackQuizComplete(score, total, percentage, difficulty, region, mode) {
    trackEvent('quiz_complete', {
        score,
        total,
        percentage,
        difficulty,
        region,
        mode
    });
}

/**
 * Track achievement unlock
 */
export function trackAchievement(achievementId) {
    trackEvent('achievement_unlocked', {
        achievement_id: achievementId
    });
}

/**
 * Track sign in method
 */
export function trackSignIn(method) {
    trackEvent('login', {
        method // 'google', 'email', 'guest'
    });
}
