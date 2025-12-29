/**
 * Authentication UI Module
 * Handles login screen, forms, and user profile display
 */

import {
    signInWithGoogle,
    signInWithEmail,
    createAccountWithEmail,
    signInAsGuest,
    logOut,
    getUserDisplayInfo,
    onAuthChange,
    isEmailVerified,
    resendVerificationEmail,
    reloadUser,
    resetPassword
} from './auth.js';

// DOM Elements
let elements = {};

/**
 * Initialize auth UI elements
 */
export function initAuthElements() {
    elements = {
        // Screens
        loginScreen: document.getElementById('login-screen'),
        startScreen: document.getElementById('start-screen'),

        // Sign In Form
        signinForm: document.getElementById('signin-form'),
        signinEmail: document.getElementById('signin-email'),
        signinPassword: document.getElementById('signin-password'),
        signinError: document.getElementById('signin-error'),

        // Sign Up Form
        signupForm: document.getElementById('signup-form'),
        signupName: document.getElementById('signup-name'),
        signupEmail: document.getElementById('signup-email'),
        signupPassword: document.getElementById('signup-password'),
        signupError: document.getElementById('signup-error'),

        // Auth Toggle
        authToggleText: document.getElementById('auth-toggle-text'),
        authToggleBtn: document.getElementById('auth-toggle-btn'),

        // Forgot Password Form
        forgotPasswordForm: document.getElementById('forgot-password-form'),
        forgotPasswordBtn: document.getElementById('forgot-password-btn'),
        resetEmail: document.getElementById('reset-email'),
        resetError: document.getElementById('reset-error'),
        resetSuccess: document.getElementById('reset-success'),
        backToSigninBtn: document.getElementById('back-to-signin-btn'),

        // Social/Guest Buttons
        googleSigninBtn: document.getElementById('google-signin-btn'),
        guestSigninBtn: document.getElementById('guest-signin-btn'),

        // Verification Pending
        verificationPending: document.getElementById('verification-pending'),
        verificationEmail: document.getElementById('verification-email'),
        resendVerificationBtn: document.getElementById('resend-verification-btn'),
        checkVerificationBtn: document.getElementById('check-verification-btn'),
        backToLoginBtn: document.getElementById('back-to-login-btn'),

        // Auth form container (to hide when showing verification)
        authFormContainer: document.getElementById('auth-form-container'),

        // User Profile
        userProfile: document.getElementById('user-profile'),
        userMenuToggle: document.getElementById('user-menu-toggle'),
        userAvatar: document.getElementById('user-avatar'),
        userName: document.getElementById('user-name'),
        userDropdown: document.getElementById('user-dropdown'),
        userDropdownEmail: document.getElementById('user-dropdown-email'),
        logoutBtn: document.getElementById('logout-btn'),

        // Player name input (to sync with auth)
        playerNameInput: document.getElementById('player-name')
    };
}

/**
 * Setup auth UI event listeners
 */
export function setupAuthUI() {
    // Sign In Form submission
    elements.signinForm.addEventListener('submit', handleSignIn);

    // Sign Up Form submission
    elements.signupForm.addEventListener('submit', handleSignUp);

    // Toggle between Sign In / Sign Up
    elements.authToggleBtn.addEventListener('click', toggleAuthMode);

    // Forgot Password
    elements.forgotPasswordBtn.addEventListener('click', showForgotPasswordForm);
    elements.forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    elements.backToSigninBtn.addEventListener('click', hideForgotPasswordForm);

    // Google Sign In
    elements.googleSigninBtn.addEventListener('click', handleGoogleSignIn);

    // Guest Sign In
    elements.guestSigninBtn.addEventListener('click', handleGuestSignIn);

    // Verification buttons
    elements.resendVerificationBtn.addEventListener('click', handleResendVerification);
    elements.checkVerificationBtn.addEventListener('click', handleCheckVerification);
    elements.backToLoginBtn.addEventListener('click', handleBackToLogin);

    // User menu toggle
    elements.userMenuToggle.addEventListener('click', toggleUserMenu);

    // Logout
    elements.logoutBtn.addEventListener('click', handleLogout);

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!elements.userProfile.contains(e.target)) {
            elements.userDropdown.hidden = true;
            elements.userMenuToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Listen for auth state changes
    onAuthChange(handleAuthStateChange);

    // Password visibility toggles
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const wrapper = btn.closest('.password-input-wrapper');
            const input = wrapper.querySelector('input');
            const isVisible = btn.dataset.visible === 'true';

            if (isVisible) {
                // Hide password
                input.type = 'password';
                btn.dataset.visible = 'false';
                btn.setAttribute('aria-label', 'Show password');
            } else {
                // Show password
                input.type = 'text';
                btn.dataset.visible = 'true';
                btn.setAttribute('aria-label', 'Hide password');
            }
        });
    });

    // Form validation - enable/disable submit buttons
    setupFormValidation();
}

/**
 * Setup form validation to enable/disable submit buttons
 */
function setupFormValidation() {
    // Sign In form
    const signinBtn = elements.signinForm.querySelector('button[type="submit"]');
    const signinInputs = [elements.signinEmail, elements.signinPassword];

    function validateSigninForm() {
        const isValid = signinInputs.every(input => input.value.trim() !== '');
        signinBtn.disabled = !isValid;
    }

    signinInputs.forEach(input => {
        input.addEventListener('input', validateSigninForm);
    });
    validateSigninForm(); // Initial check

    // Sign Up form
    const signupBtn = elements.signupForm.querySelector('button[type="submit"]');
    const signupInputs = [elements.signupName, elements.signupEmail, elements.signupPassword];

    function validateSignupForm() {
        const isValid = signupInputs.every(input => input.value.trim() !== '');
        signupBtn.disabled = !isValid;
    }

    signupInputs.forEach(input => {
        input.addEventListener('input', validateSignupForm);
    });
    validateSignupForm(); // Initial check

    // Forgot Password form
    const resetBtn = elements.forgotPasswordForm.querySelector('button[type="submit"]');

    function validateResetForm() {
        const isValid = elements.resetEmail.value.trim() !== '';
        resetBtn.disabled = !isValid;
    }

    elements.resetEmail.addEventListener('input', validateResetForm);
    validateResetForm(); // Initial check
}

/**
 * Handle Sign In form submission
 */
async function handleSignIn(e) {
    e.preventDefault();

    const email = elements.signinEmail.value.trim();
    const password = elements.signinPassword.value;

    showError(elements.signinError, '');

    const result = await signInWithEmail(email, password);

    if (!result.success) {
        showError(elements.signinError, result.error);
    }
}

/**
 * Handle Sign Up form submission
 */
async function handleSignUp(e) {
    e.preventDefault();

    const name = elements.signupName.value.trim();
    const email = elements.signupEmail.value.trim();
    const password = elements.signupPassword.value;

    showError(elements.signupError, '');

    const result = await createAccountWithEmail(email, password, name);

    if (result.success && result.verificationSent) {
        // Show verification pending screen
        showVerificationPending(email);
    } else if (!result.success) {
        showError(elements.signupError, result.error);
    }
}

/**
 * Handle Google Sign In
 */
async function handleGoogleSignIn() {
    const result = await signInWithGoogle();

    if (!result.success) {
        showError(elements.signinError, result.error);
    }
}

/**
 * Handle Guest Sign In
 */
async function handleGuestSignIn() {
    const result = await signInAsGuest();

    if (!result.success) {
        showError(elements.signinError, result.error);
    }
}

/**
 * Handle Logout
 */
async function handleLogout() {
    elements.userDropdown.hidden = true;
    await logOut();
}

/**
 * Handle Resend Verification Email
 */
async function handleResendVerification() {
    elements.resendVerificationBtn.disabled = true;
    elements.resendVerificationBtn.textContent = 'Sending...';

    const result = await resendVerificationEmail();

    if (result.success) {
        elements.resendVerificationBtn.textContent = 'Email Sent!';
        setTimeout(() => {
            elements.resendVerificationBtn.disabled = false;
            elements.resendVerificationBtn.innerHTML = '<span data-i18n="auth.resendEmail">Resend Email</span>';
        }, 3000);
    } else {
        elements.resendVerificationBtn.textContent = 'Failed';
        setTimeout(() => {
            elements.resendVerificationBtn.disabled = false;
            elements.resendVerificationBtn.innerHTML = '<span data-i18n="auth.resendEmail">Resend Email</span>';
        }, 2000);
    }
}

/**
 * Handle Check Verification button
 */
async function handleCheckVerification() {
    elements.checkVerificationBtn.disabled = true;
    elements.checkVerificationBtn.textContent = 'Checking...';

    await reloadUser();

    if (isEmailVerified()) {
        // Email is verified, proceed to start screen
        hideVerificationPending();
        showStartScreen();
        updateUserProfile();
    } else {
        elements.checkVerificationBtn.textContent = 'Not verified yet';
        setTimeout(() => {
            elements.checkVerificationBtn.disabled = false;
            elements.checkVerificationBtn.innerHTML = '<span data-i18n="auth.iVerified">I\'ve Verified</span>';
        }, 2000);
    }
}

/**
 * Handle Back to Login button
 */
async function handleBackToLogin() {
    await logOut();
    hideVerificationPending();
}

/**
 * Handle Forgot Password form submission
 */
async function handleForgotPassword(e) {
    e.preventDefault();

    const email = elements.resetEmail.value.trim();

    showError(elements.resetError, '');
    elements.resetSuccess.hidden = true;

    const result = await resetPassword(email);

    if (result.success) {
        elements.resetSuccess.hidden = false;
        elements.resetEmail.value = '';
    } else {
        showError(elements.resetError, result.error);
    }
}

/**
 * Show forgot password form
 */
function showForgotPasswordForm() {
    elements.signinForm.hidden = true;
    elements.signupForm.hidden = true;
    elements.forgotPasswordForm.hidden = false;
    elements.authToggleBtn.parentElement.style.display = 'none';

    // Clear any previous state
    elements.resetEmail.value = '';
    elements.resetError.hidden = true;
    elements.resetSuccess.hidden = true;
}

/**
 * Hide forgot password form
 */
function hideForgotPasswordForm() {
    elements.forgotPasswordForm.hidden = true;
    elements.signinForm.hidden = false;
    elements.authToggleBtn.parentElement.style.display = '';

    // Clear state
    elements.resetError.hidden = true;
    elements.resetSuccess.hidden = true;
}

/**
 * Toggle between Sign In and Sign Up modes
 */
function toggleAuthMode() {
    const isSignIn = !elements.signinForm.hidden;

    // Always hide forgot password form when toggling
    elements.forgotPasswordForm.hidden = true;

    if (isSignIn) {
        // Switch to Sign Up
        elements.signinForm.hidden = true;
        elements.signupForm.hidden = false;
        elements.authToggleText.textContent = 'Already have an account?';
        elements.authToggleText.setAttribute('data-i18n', 'auth.hasAccount');
        elements.authToggleBtn.textContent = 'Sign In';
        elements.authToggleBtn.setAttribute('data-i18n', 'auth.signIn');
    } else {
        // Switch to Sign In
        elements.signinForm.hidden = false;
        elements.signupForm.hidden = true;
        elements.authToggleText.textContent = "Don't have an account?";
        elements.authToggleText.setAttribute('data-i18n', 'auth.noAccount');
        elements.authToggleBtn.textContent = 'Sign Up';
        elements.authToggleBtn.setAttribute('data-i18n', 'auth.signUp');
    }

    // Clear errors
    showError(elements.signinError, '');
    showError(elements.signupError, '');
}

/**
 * Toggle user dropdown menu
 */
function toggleUserMenu() {
    const isExpanded = elements.userDropdown.hidden;
    elements.userDropdown.hidden = !isExpanded;
    elements.userMenuToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
}

/**
 * Handle auth state changes
 */
function handleAuthStateChange(user) {
    if (user) {
        // Check if email verification is required
        if (!isEmailVerified()) {
            // Show verification pending if user signed up with email
            showVerificationPending(user.email);
            return;
        }

        // User is signed in and verified
        hideVerificationPending();
        showStartScreen();
        updateUserProfile();
    } else {
        // User is signed out
        hideVerificationPending();
        showLoginScreen();
        hideUserProfile();
    }
}

/**
 * Show login screen
 */
function showLoginScreen() {
    elements.loginScreen.classList.add('active');
    elements.startScreen.classList.remove('active');
}

/**
 * Show start screen (after login)
 */
function showStartScreen() {
    elements.loginScreen.classList.remove('active');
    elements.startScreen.classList.add('active');
}

/**
 * Show verification pending screen
 */
function showVerificationPending(email) {
    // Hide auth forms
    elements.signinForm.hidden = true;
    elements.signupForm.hidden = true;
    elements.authToggleBtn.parentElement.style.display = 'none';
    document.querySelector('.auth-divider').style.display = 'none';
    document.querySelector('.auth-alternatives').style.display = 'none';

    // Show verification pending
    elements.verificationPending.hidden = false;
    elements.verificationEmail.textContent = email;

    // Make sure login screen is active
    elements.loginScreen.classList.add('active');
    elements.startScreen.classList.remove('active');
}

/**
 * Hide verification pending screen
 */
function hideVerificationPending() {
    elements.verificationPending.hidden = true;

    // Restore auth forms visibility
    elements.signinForm.hidden = false;
    elements.signupForm.hidden = true;
    elements.forgotPasswordForm.hidden = true;
    elements.authToggleBtn.parentElement.style.display = '';
    document.querySelector('.auth-divider').style.display = '';
    document.querySelector('.auth-alternatives').style.display = '';
}

/**
 * Update user profile display
 */
function updateUserProfile() {
    const userInfo = getUserDisplayInfo();

    if (!userInfo) return;

    // Update avatar
    if (userInfo.photoURL) {
        elements.userAvatar.src = userInfo.photoURL;
        elements.userAvatar.alt = userInfo.displayName;
        elements.userAvatar.style.display = '';
    } else {
        // Create placeholder with initials
        elements.userAvatar.style.display = 'none';
    }

    // Update name
    elements.userName.textContent = userInfo.displayName || 'Guest';

    // Update dropdown email
    if (userInfo.email) {
        elements.userDropdownEmail.textContent = userInfo.email;
        elements.userDropdown.querySelector('.user-dropdown-header').style.display = '';
    } else {
        elements.userDropdown.querySelector('.user-dropdown-header').style.display = 'none';
    }

    // Show user profile
    elements.userProfile.hidden = false;

    // Pre-fill player name input with display name
    if (userInfo.displayName && elements.playerNameInput) {
        elements.playerNameInput.value = userInfo.displayName;
    }
}

/**
 * Hide user profile
 */
function hideUserProfile() {
    elements.userProfile.hidden = true;
}

/**
 * Show error message
 */
function showError(element, message) {
    if (message) {
        element.textContent = message;
        element.hidden = false;
    } else {
        element.hidden = true;
    }
}

/**
 * Check if user is currently on login screen
 */
export function isOnLoginScreen() {
    return elements.loginScreen?.classList.contains('active');
}
