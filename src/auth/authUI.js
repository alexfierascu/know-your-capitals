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
        userName: document.getElementById('user-name'),
        userDropdown: document.getElementById('user-dropdown'),
        userDropdownEmail: document.getElementById('user-dropdown-email'),
        logoutBtn: document.getElementById('logout-btn'),

        // Player name input (to sync with auth)
        playerNameInput: document.getElementById('player-name'),

        // Reset Progress
        resetProgressBtn: document.getElementById('reset-progress-btn'),
        resetConfirmModal: document.getElementById('reset-confirm-modal'),
        resetCancelBtn: document.getElementById('reset-cancel-btn'),
        resetConfirmBtn: document.getElementById('reset-confirm-btn'),

        // Edit Profile
        editProfileBtn: document.getElementById('edit-profile-btn'),
        profileModal: document.getElementById('profile-modal'),
        profileModalClose: document.getElementById('profile-modal-close'),
        profileForm: document.getElementById('profile-form'),
        profileFirstname: document.getElementById('profile-firstname'),
        profileLastname: document.getElementById('profile-lastname'),
        profileNickname: document.getElementById('profile-nickname'),
        profileLocation: document.getElementById('profile-location'),
        profileAge: document.getElementById('profile-age'),
        profileAvatarInput: document.getElementById('profile-avatar-input'),
        profileAvatarPreview: document.getElementById('profile-avatar-preview'),
        profileAvatarPlaceholder: document.getElementById('profile-avatar-placeholder'),
        profileError: document.getElementById('profile-error'),
        profileSuccess: document.getElementById('profile-success'),
        profileSaveBtn: document.getElementById('profile-save-btn'),

        // Delete Account
        deleteAccountBtn: document.getElementById('delete-account-btn'),
        deleteAccountModal: document.getElementById('delete-account-modal'),
        deleteAccountCancelBtn: document.getElementById('delete-account-cancel-btn'),
        deleteAccountConfirmBtn: document.getElementById('delete-account-confirm-btn'),

        // Modal overlays (for click-outside-to-close)
        profileModalOverlay: document.querySelector('#profile-modal .modal-overlay')
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

    // Reset Progress
    elements.resetProgressBtn.addEventListener('click', showResetConfirmModal);
    elements.resetCancelBtn.addEventListener('click', hideResetConfirmModal);
    elements.resetConfirmBtn.addEventListener('click', handleResetProgress);

    // Edit Profile
    elements.editProfileBtn.addEventListener('click', () => openProfileModal(false));
    elements.profileModalClose.addEventListener('click', closeProfileModal);
    elements.profileForm.addEventListener('submit', handleProfileSave);
    elements.profileAvatarInput.addEventListener('change', handleAvatarUpload);
    if (elements.profileModalOverlay) {
        elements.profileModalOverlay.addEventListener('click', closeProfileModal);
    }

    // Profile form validation on input change
    const profileInputs = [
        elements.profileFirstname,
        elements.profileLastname,
        elements.profileNickname,
        elements.profileLocation,
        elements.profileAge
    ];
    profileInputs.forEach(input => {
        input.addEventListener('input', validateProfileForm);
    });

    // Delete Account
    elements.deleteAccountBtn.addEventListener('click', showDeleteAccountModal);
    elements.deleteAccountCancelBtn.addEventListener('click', hideDeleteAccountModal);
    elements.deleteAccountConfirmBtn.addEventListener('click', handleDeleteAccount);

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
 * Handle Sign Up form submission
 */
async function handleSignUp(e) {
    e.preventDefault();

    const email = elements.signupEmail.value.trim();
    const password = elements.signupPassword.value;

    showError(elements.signupError, '');

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
    elements.resetConfirmModal.hidden = false;
}

/**
 * Hide reset confirmation modal
 */
function hideResetConfirmModal() {
    elements.resetConfirmModal.hidden = true;
}

/**
 * Handle reset progress confirmation
 */
async function handleResetProgress() {
    elements.resetConfirmBtn.disabled = true;
    elements.resetConfirmBtn.textContent = 'Resetting...';

    const success = await resetAllProgress();

    if (success) {
        hideResetConfirmModal();
        // Optionally show a success message or refresh the page
        window.location.reload();
    } else {
        elements.resetConfirmBtn.disabled = false;
        elements.resetConfirmBtn.innerHTML = '<span data-i18n="reset.confirm">Reset Everything</span>';
    }
}

/**
 * Show delete account confirmation modal
 */
function showDeleteAccountModal() {
    elements.userDropdown.hidden = true;
    elements.deleteAccountModal.hidden = false;
}

/**
 * Hide delete account confirmation modal
 */
function hideDeleteAccountModal() {
    elements.deleteAccountModal.hidden = true;
}

/**
 * Handle delete account confirmation
 */
async function handleDeleteAccount() {
    elements.deleteAccountConfirmBtn.disabled = true;
    elements.deleteAccountConfirmBtn.textContent = 'Deleting...';

    // First delete user data from Firestore
    await resetAllProgress();

    // Then delete the Firebase Auth account
    const result = await deleteAccount();

    if (result.success) {
        hideDeleteAccountModal();
        // User is automatically signed out, auth state listener will handle UI
    } else {
        elements.deleteAccountConfirmBtn.disabled = false;
        elements.deleteAccountConfirmBtn.innerHTML = '<span data-i18n="deleteAccount.confirm">Delete My Account</span>';

        // Show error in alert for now (could improve with inline error)
        alert(result.error);
    }
}

// Store pending avatar data and original profile for comparison
let pendingAvatarData = null;
let originalProfileData = null;
let isProfileSetupForced = false;

/**
 * Open profile modal and load current profile data
 * @param {boolean} forced - If true, user cannot close without setting nickname
 */
async function openProfileModal(forced = false) {
    elements.userDropdown.hidden = true;
    elements.profileModal.hidden = false;
    isProfileSetupForced = forced;

    // Update UI based on forced mode
    if (forced) {
        elements.profileModalClose.style.display = 'none';
        // Update title to indicate setup
        const titleEl = elements.profileModal.querySelector('h2');
        if (titleEl) {
            titleEl.textContent = 'Complete Your Profile';
            titleEl.setAttribute('data-i18n', 'profile.completeProfile');
        }
    } else {
        elements.profileModalClose.style.display = '';
        const titleEl = elements.profileModal.querySelector('h2');
        if (titleEl) {
            titleEl.textContent = 'Edit Profile';
            titleEl.setAttribute('data-i18n', 'profile.title');
        }
    }

    // Clear previous state
    elements.profileError.hidden = true;
    elements.profileSuccess.hidden = true;
    pendingAvatarData = null;

    // Load current profile
    const profile = await getUserProfile();

    if (profile) {
        elements.profileFirstname.value = profile.firstName || '';
        elements.profileLastname.value = profile.lastName || '';
        elements.profileNickname.value = profile.nickname || '';
        elements.profileLocation.value = profile.location || '';
        elements.profileAge.value = profile.age || '';

        if (profile.avatarUrl) {
            elements.profileAvatarPreview.src = profile.avatarUrl;
            elements.profileAvatarPreview.style.display = '';
            elements.profileAvatarPlaceholder.style.display = 'none';
        } else {
            elements.profileAvatarPreview.src = '';
            elements.profileAvatarPreview.style.display = 'none';
            elements.profileAvatarPlaceholder.style.display = '';
        }

        // Store original data for comparison
        originalProfileData = {
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            nickname: profile.nickname || '',
            location: profile.location || '',
            age: profile.age || '',
            avatarUrl: profile.avatarUrl || ''
        };
    } else {
        // Clear form
        elements.profileFirstname.value = '';
        elements.profileLastname.value = '';
        elements.profileNickname.value = '';
        elements.profileLocation.value = '';
        elements.profileAge.value = '';
        elements.profileAvatarPreview.src = '';
        elements.profileAvatarPreview.style.display = 'none';
        elements.profileAvatarPlaceholder.style.display = '';

        // No original data
        originalProfileData = {
            firstName: '',
            lastName: '',
            nickname: '',
            location: '',
            age: '',
            avatarUrl: ''
        };
    }

    // Initial validation
    validateProfileForm();
}

/**
 * Attempt to close profile modal (with confirmation if unsaved changes)
 */
function closeProfileModal() {
    // Don't allow closing in forced mode
    if (isProfileSetupForced) {
        return;
    }

    // Check for unsaved changes
    if (checkProfileChanges()) {
        const confirmClose = confirm('You have unsaved changes. Are you sure you want to close without saving?');
        if (!confirmClose) {
            return;
        }
    }

    forceCloseProfileModal();
}

/**
 * Force close profile modal without confirmation
 */
function forceCloseProfileModal() {
    elements.profileModal.hidden = true;
    pendingAvatarData = null;
    originalProfileData = null;
    isProfileSetupForced = false;

    // Clear any messages
    elements.profileError.hidden = true;
    elements.profileSuccess.hidden = true;
}

/**
 * Validate profile form - check nickname and changes
 */
function validateProfileForm() {
    const nickname = elements.profileNickname.value.trim();
    const hasNickname = nickname.length > 0;
    const hasChanges = checkProfileChanges();

    // In forced mode, only require nickname (it's a new profile)
    // In normal mode, require nickname AND changes
    if (isProfileSetupForced) {
        elements.profileSaveBtn.disabled = !hasNickname;
    } else {
        elements.profileSaveBtn.disabled = !hasNickname || !hasChanges;
    }
}

/**
 * Check if profile has changes compared to original
 */
function checkProfileChanges() {
    if (!originalProfileData) return true; // New profile, allow save

    const currentData = {
        firstName: elements.profileFirstname.value.trim(),
        lastName: elements.profileLastname.value.trim(),
        nickname: elements.profileNickname.value.trim(),
        location: elements.profileLocation.value.trim(),
        age: elements.profileAge.value || ''
    };

    // Check text fields
    if (currentData.firstName !== originalProfileData.firstName) return true;
    if (currentData.lastName !== originalProfileData.lastName) return true;
    if (currentData.nickname !== originalProfileData.nickname) return true;
    if (currentData.location !== originalProfileData.location) return true;
    if (String(currentData.age) !== String(originalProfileData.age)) return true;

    // Check avatar
    if (pendingAvatarData) return true;

    return false;
}

/**
 * Handle avatar file upload
 */
async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!isValidImageFile(file)) {
        showProfileError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
    }

    try {
        // Show loading state
        elements.profileAvatarPlaceholder.innerHTML = '<span style="font-size: 12px;">Compressing...</span>';
        elements.profileAvatarPlaceholder.style.display = '';
        elements.profileAvatarPreview.style.display = 'none';

        // Compress the image
        const compressedImage = await compressImage(file);

        // Store for later save
        pendingAvatarData = compressedImage;

        // Show preview
        elements.profileAvatarPreview.src = compressedImage;
        elements.profileAvatarPreview.style.display = '';
        elements.profileAvatarPlaceholder.style.display = 'none';

        // Reset placeholder content
        elements.profileAvatarPlaceholder.innerHTML = `
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>
        `;

        elements.profileError.hidden = true;
    } catch (error) {
        console.error('Error processing avatar:', error);
        showProfileError('Failed to process image. Please try another file.');

        // Reset placeholder content
        elements.profileAvatarPlaceholder.innerHTML = `
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>
        `;
        elements.profileAvatarPlaceholder.style.display = '';
    }

    // Clear the input so the same file can be selected again
    e.target.value = '';

    // Re-validate form after avatar change
    validateProfileForm();
}

/**
 * Handle profile form save
 */
async function handleProfileSave(e) {
    e.preventDefault();

    // Validate nickname is required
    const nickname = elements.profileNickname.value.trim();
    if (!nickname) {
        showProfileError('Nickname is required');
        return;
    }

    elements.profileSaveBtn.disabled = true;
    elements.profileSaveBtn.textContent = 'Saving...';
    elements.profileError.hidden = true;
    elements.profileSuccess.hidden = true;

    const profileData = {
        firstName: elements.profileFirstname.value.trim(),
        lastName: elements.profileLastname.value.trim(),
        nickname: nickname,
        location: elements.profileLocation.value.trim(),
        age: elements.profileAge.value ? parseInt(elements.profileAge.value, 10) : null
    };

    // If there's a pending avatar, include it
    if (pendingAvatarData) {
        profileData.avatarUrl = pendingAvatarData;
    } else if (elements.profileAvatarPreview.src && elements.profileAvatarPreview.style.display !== 'none') {
        // Keep existing avatar
        profileData.avatarUrl = elements.profileAvatarPreview.src;
    }

    try {
        const success = await saveUserProfile(profileData);

        if (success) {
            elements.profileSuccess.textContent = 'Profile saved successfully!';
            elements.profileSuccess.hidden = false;
            pendingAvatarData = null;

            // Update original data to reflect saved state (prevents false "unsaved changes" warning)
            originalProfileData = {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                nickname: profileData.nickname,
                location: profileData.location,
                age: profileData.age || '',
                avatarUrl: profileData.avatarUrl || ''
            };

            // Update the UI with new profile data
            updateUserProfileFromData(profileData);

            // Close modal after a short delay (force close even in forced mode)
            const wasForced = isProfileSetupForced;
            setTimeout(() => {
                // Reset forced mode before closing
                isProfileSetupForced = false;
                forceCloseProfileModal();

                // If this was forced setup, now show the start screen
                if (wasForced) {
                    showStartScreen();
                }
            }, 1500);
        } else {
            showProfileError('Failed to save profile. Please try again.');
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        showProfileError('An error occurred. Please try again.');
    }

    elements.profileSaveBtn.disabled = false;
    elements.profileSaveBtn.innerHTML = '<span data-i18n="profile.save">Save Changes</span>';
}

/**
 * Show profile error message
 */
function showProfileError(message) {
    elements.profileError.textContent = message;
    elements.profileError.hidden = false;
}

/**
 * Update user profile display from profile data
 */
function updateUserProfileFromData(profileData) {
    // Update avatar in header
    if (profileData.avatarUrl) {
        elements.userAvatar.src = profileData.avatarUrl;
        elements.userAvatar.style.display = '';
    }

    // Update display name
    const displayName = getDisplayNameFromProfile(profileData);
    if (displayName) {
        elements.userName.textContent = displayName;
        if (elements.playerNameInput) {
            elements.playerNameInput.value = displayName;
        }
    }
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

    // Determine avatar (custom > Google > none)
    const avatarUrl = profile?.avatarUrl || userInfo.photoURL;
    if (avatarUrl) {
        elements.userAvatar.src = avatarUrl;
        elements.userAvatar.alt = userInfo.displayName;
        elements.userAvatar.style.display = '';
    } else {
        elements.userAvatar.style.display = 'none';
    }

    // Determine display name (custom > Firebase > Guest)
    const customDisplayName = getDisplayNameFromProfile(profile);
    const displayName = customDisplayName || userInfo.displayName || 'Guest';
    elements.userName.textContent = displayName;

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
    if (elements.playerNameInput) {
        elements.playerNameInput.value = displayName;
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
