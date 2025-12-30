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
    resetPassword,
    deleteAccount
} from './auth.js';
import { resetAllProgress, getUserProfile, saveUserProfile, getDisplayNameFromProfile } from '../data/userStats.js';
import { compressImage, isValidImageFile } from '../utils/imageUtils.js';

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
        userAvatarFallback: document.getElementById('user-avatar-fallback'),
        userName: document.getElementById('user-name'),
        userGuestBadge: document.getElementById('user-guest-badge'),
        userDropdown: document.getElementById('user-dropdown'),
        userDropdownEmail: document.getElementById('user-dropdown-email'),
        logoutBtn: document.getElementById('logout-btn'),

        // Reset Progress
        resetProgressBtn: document.getElementById('reset-progress-btn'),

        // Edit Profile
        editProfileBtn: document.getElementById('edit-profile-btn'),

        // Delete Account
        deleteAccountBtn: document.getElementById('delete-account-btn'),

        // Modal Web Components (accessed from main elements)
        resetConfirmModal: document.getElementById('reset-confirm-modal'),
        profileModal: document.getElementById('profile-modal'),
        deleteAccountModal: document.getElementById('delete-account-modal'),

        // Stats Button (shown only when logged in)
        statsBtn: document.getElementById('stats-btn')
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

    // Reset Progress - using Web Component events
    elements.resetProgressBtn.addEventListener('click', showResetConfirmModal);
    elements.resetConfirmModal.addEventListener('reset-confirm', handleResetProgress);
    elements.resetConfirmModal.addEventListener('reset-cancel', () => {});

    // Edit Profile - using Web Component events
    elements.editProfileBtn.addEventListener('click', () => openProfileModal(false));
    elements.profileModal.addEventListener('profile-submit', handleProfileSave);
    elements.profileModal.addEventListener('avatar-selected', handleAvatarUpload);
    elements.profileModal.addEventListener('modal-close', handleProfileModalClose);

    // Delete Account - using Web Component events
    elements.deleteAccountBtn.addEventListener('click', showDeleteAccountModal);
    elements.deleteAccountModal.addEventListener('delete-confirm', handleDeleteAccount);
    elements.deleteAccountModal.addEventListener('delete-cancel', () => {});

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!elements.userProfile.contains(e.target)) {
            elements.userDropdown.hidden = true;
            elements.userMenuToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Keyboard navigation for user dropdown
    elements.userProfile.addEventListener('keydown', handleDropdownKeyboard);

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
    const signupInputs = [elements.signupEmail, elements.signupPassword];

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
 * Validate password strength
 * Requirements: 8+ chars, 1 uppercase, 1 lowercase, 1 special character
 */
function validatePassword(password) {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (password.length < minLength) {
        return { valid: false, error: 'Password must be at least 8 characters long.' };
    }
    if (!hasUppercase) {
        return { valid: false, error: 'Password must contain at least one uppercase letter.' };
    }
    if (!hasLowercase) {
        return { valid: false, error: 'Password must contain at least one lowercase letter.' };
    }
    if (!hasSpecial) {
        return { valid: false, error: 'Password must contain at least one special character.' };
    }

    return { valid: true };
}

/**
 * Handle Sign Up form submission
 */
async function handleSignUp(e) {
    e.preventDefault();

    const email = elements.signupEmail.value.trim();
    const password = elements.signupPassword.value;

    showError(elements.signupError, '');

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        showError(elements.signupError, passwordValidation.error);
        return;
    }

    const result = await createAccountWithEmail(email, password);

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
 * Show reset confirmation modal
 */
function showResetConfirmModal() {
    elements.userDropdown.hidden = true;
    elements.resetConfirmModal.show();
}

/**
 * Handle reset progress confirmation
 */
async function handleResetProgress() {
    const success = await resetAllProgress();

    if (success) {
        // Optionally show a success message or refresh the page
        window.location.reload();
    }
}

/**
 * Show delete account confirmation modal
 */
function showDeleteAccountModal() {
    elements.userDropdown.hidden = true;
    elements.deleteAccountModal.show();
}

/**
 * Handle delete account confirmation
 */
async function handleDeleteAccount() {
    // First delete user data from Firestore
    await resetAllProgress();

    // Then delete the Firebase Auth account
    const result = await deleteAccount();

    if (!result.success) {
        // Show error in alert for now (could improve with inline error)
        alert(result.error);
    }
    // User is automatically signed out, auth state listener will handle UI
}

// Store original profile for comparison
let originalProfileData = null;
let isProfileSetupForced = false;

/**
 * Open profile modal and load current profile data
 * @param {boolean} forced - If true, user cannot close without setting nickname
 */
async function openProfileModal(forced = false) {
    const modal = elements.profileModal;
    elements.userDropdown.hidden = true;
    isProfileSetupForced = forced;

    // Clear previous state
    modal.hideMessages();

    // Load current profile
    const profile = await getUserProfile();

    if (profile) {
        modal.setFormData({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            nickname: profile.nickname || '',
            location: profile.location || '',
            avatarUrl: profile.avatarUrl || ''
        });

        // Store original data for comparison
        originalProfileData = {
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            nickname: profile.nickname || '',
            location: profile.location || '',
            avatarUrl: profile.avatarUrl || ''
        };
    } else {
        // Clear form
        modal.setFormData({
            firstName: '',
            lastName: '',
            nickname: '',
            location: '',
            avatarUrl: ''
        });

        // No original data
        originalProfileData = {
            firstName: '',
            lastName: '',
            nickname: '',
            location: '',
            avatarUrl: ''
        };
    }

    modal.show();
}

/**
 * Handle profile modal close event
 */
function handleProfileModalClose() {
    // Don't allow closing in forced mode
    if (isProfileSetupForced) {
        // Reopen the modal since it auto-closed
        elements.profileModal.show();
        return;
    }

    originalProfileData = null;
    isProfileSetupForced = false;
}

/**
 * Handle avatar file upload
 */
async function handleAvatarUpload(e) {
    const modal = elements.profileModal;
    const file = e.detail.file;
    if (!file) return;

    // Validate file type
    if (!isValidImageFile(file)) {
        modal.showError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
    }

    try {
        // Compress the image
        const compressedImage = await compressImage(file);

        // Store in component and show preview
        modal.setAvatarData(compressedImage);
        modal.setAvatar(compressedImage);
        modal.hideMessages();
    } catch (error) {
        console.error('Error processing avatar:', error);
        modal.showError('Failed to process image. Please try another file.');
    }
}

/**
 * Handle profile form save
 */
async function handleProfileSave(e) {
    const modal = elements.profileModal;
    const formData = e.detail;

    // Validate nickname is required
    if (!formData.nickname) {
        modal.showError('Nickname is required');
        return;
    }

    modal.setSaving(true);
    modal.hideMessages();

    const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        nickname: formData.nickname,
        location: formData.location
    };

    // If there's avatar data from the form
    if (formData.avatarData) {
        profileData.avatarUrl = formData.avatarData;
    } else if (modal.avatarPreview.src && modal.avatarPreview.style.display !== 'none') {
        // Keep existing avatar
        profileData.avatarUrl = modal.avatarPreview.src;
    }

    try {
        const success = await saveUserProfile(profileData);

        if (success) {
            modal.showSuccess('Profile saved successfully!');

            // Update original data
            originalProfileData = {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                nickname: profileData.nickname,
                location: profileData.location,
                avatarUrl: profileData.avatarUrl || ''
            };

            // Update the UI with new profile data
            updateUserProfileFromData(profileData);

            // Close modal after a short delay
            const wasForced = isProfileSetupForced;
            setTimeout(() => {
                isProfileSetupForced = false;
                modal.close();

                // If this was forced setup, now show the start screen
                if (wasForced) {
                    showStartScreen();
                }
            }, 1500);
        } else {
            modal.showError('Failed to save profile. Please try again.');
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        modal.showError('An error occurred. Please try again.');
    }

    modal.setSaving(false);
}

/**
 * Update user profile display from profile data
 */
function updateUserProfileFromData(profileData) {
    // Update display name
    const displayName = getDisplayNameFromProfile(profileData);
    if (displayName) {
        elements.userName.textContent = displayName;
    }

    // Update avatar using the new function
    updateAvatarDisplay(profileData.avatarUrl, displayName);
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
        // Email is verified, proceed
        hideVerificationPending();

        // Check if user has completed profile setup (has nickname)
        const profile = await getUserProfile();
        const hasNickname = profile?.nickname && profile.nickname.trim().length > 0;

        showStartScreen();
        updateUserProfile();

        if (!hasNickname) {
            // New user - force profile setup
            openProfileModal(true);
        }
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
    // Close language dropdown if open
    const langDropdown = document.getElementById('language-dropdown');
    if (langDropdown) {
        langDropdown.hidden = true;
    }

    const isExpanded = elements.userDropdown.hidden;
    elements.userDropdown.hidden = !isExpanded;
    elements.userMenuToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');

    // Focus first item when opening
    if (isExpanded) {
        const firstItem = elements.userDropdown.querySelector('.user-dropdown-item');
        if (firstItem) {
            firstItem.focus();
        }
    }
}

/**
 * Handle keyboard navigation in dropdown
 */
function handleDropdownKeyboard(e) {
    const isOpen = !elements.userDropdown.hidden;

    // Escape closes the dropdown
    if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        elements.userDropdown.hidden = true;
        elements.userMenuToggle.setAttribute('aria-expanded', 'false');
        elements.userMenuToggle.focus();
        return;
    }

    // Arrow navigation only when open
    if (!isOpen) return;

    const items = Array.from(elements.userDropdown.querySelectorAll('.user-dropdown-item'));
    const currentIndex = items.indexOf(document.activeElement);

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items[nextIndex].focus();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items[prevIndex].focus();
    } else if (e.key === 'Tab') {
        // Close on tab out
        elements.userDropdown.hidden = true;
        elements.userMenuToggle.setAttribute('aria-expanded', 'false');
    }
}

/**
 * Get initials from a display name
 */
function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Update avatar display (image or fallback initials)
 */
function updateAvatarDisplay(avatarUrl, displayName) {
    if (avatarUrl) {
        elements.userAvatar.src = avatarUrl;
        elements.userAvatar.style.display = '';
        elements.userAvatarFallback.hidden = true;
    } else {
        elements.userAvatar.style.display = 'none';
        elements.userAvatarFallback.textContent = getInitials(displayName);
        elements.userAvatarFallback.hidden = false;
    }
}

/**
 * Generate a random guest name
 */
function generateGuestName() {
    const adjectives = ['Swift', 'Clever', 'Brave', 'Curious', 'Lucky', 'Wise', 'Bold', 'Quick', 'Sharp', 'Keen'];
    const nouns = ['Explorer', 'Traveler', 'Voyager', 'Navigator', 'Pioneer', 'Wanderer', 'Scout', 'Seeker', 'Adventurer', 'Nomad'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 100);
    return `${adj}${noun}${num}`;
}

/**
 * Handle auth state changes
 */
async function handleAuthStateChange(user) {
    if (user) {
        // Check if email verification is required
        if (!isEmailVerified()) {
            // Show verification pending if user signed up with email
            showVerificationPending(user.email);
            return;
        }

        // User is signed in and verified
        hideVerificationPending();

        // Check if user is a guest (anonymous)
        if (user.isAnonymous) {
            // Guest users get a random name and go straight to the game
            showStartScreen();
            const guestName = generateGuestName();
            elements.userName.textContent = guestName;
            updateAvatarDisplay(null, guestName); // Show initials fallback
            elements.userGuestBadge.hidden = false; // Show guest badge
            elements.userProfile.hidden = false;
            elements.userDropdown.querySelector('.user-dropdown-header').style.display = 'none';
            if (elements.statsBtn) {
                elements.statsBtn.hidden = false;
            }
            return;
        }

        // Check if user has completed profile setup (has nickname)
        const profile = await getUserProfile();
        const hasNickname = profile?.nickname && profile.nickname.trim().length > 0;

        if (!hasNickname) {
            // New user - force profile setup
            showStartScreen(); // Show start screen in background
            updateUserProfile();
            openProfileModal(true); // Open in forced mode
        } else {
            // Existing user with profile
            showStartScreen();
            updateUserProfile();
        }
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
async function updateUserProfile() {
    const userInfo = getUserDisplayInfo();

    if (!userInfo) return;

    // Load custom profile from Firestore
    const profile = await getUserProfile();

    // Determine display name (nickname > Firebase displayName > email prefix > 'Player')
    const customDisplayName = getDisplayNameFromProfile(profile);
    const displayName = customDisplayName || userInfo.displayName || (userInfo.email ? userInfo.email.split('@')[0] : 'Player');
    elements.userName.textContent = displayName;

    // Determine avatar (custom > Google > none) and update display
    const avatarUrl = profile?.avatarUrl || userInfo.photoURL;
    updateAvatarDisplay(avatarUrl, displayName);

    // Hide guest badge for regular users
    elements.userGuestBadge.hidden = true;

    // Update dropdown email
    if (userInfo.email) {
        elements.userDropdownEmail.textContent = userInfo.email;
        elements.userDropdown.querySelector('.user-dropdown-header').style.display = '';
    } else {
        elements.userDropdown.querySelector('.user-dropdown-header').style.display = 'none';
    }

    // Show user profile and stats button
    elements.userProfile.hidden = false;
    if (elements.statsBtn) {
        elements.statsBtn.hidden = false;
    }
}

/**
 * Hide user profile and stats button
 */
function hideUserProfile() {
    elements.userProfile.hidden = true;
    if (elements.statsBtn) {
        elements.statsBtn.hidden = true;
    }
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
