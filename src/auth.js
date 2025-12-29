/**
 * Authentication Module
 * Handles Google, Email/Password, and Guest sign-in
 */

import { auth } from './firebase.js';
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInAnonymously,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    updateProfile,
    sendEmailVerification,
    sendPasswordResetEmail
} from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

// Current user state
let currentUser = null;
let authStateListeners = [];

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return { success: true, user: result.user };
    } catch (error) {
        console.error('Google sign-in error:', error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email, password) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: result.user };
    } catch (error) {
        console.error('Email sign-in error:', error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

/**
 * Create account with Email and Password
 */
export async function createAccountWithEmail(email, password, displayName) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);

        // Set display name
        if (displayName) {
            await updateProfile(result.user, { displayName });
        }

        // Send verification email
        await sendEmailVerification(result.user);

        return { success: true, user: result.user, verificationSent: true };
    } catch (error) {
        console.error('Account creation error:', error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail() {
    try {
        if (currentUser && !currentUser.emailVerified) {
            await sendEmailVerification(currentUser);
            return { success: true };
        }
        return { success: false, error: 'No user to verify or already verified' };
    } catch (error) {
        console.error('Resend verification error:', error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

/**
 * Check if current user's email is verified
 */
export function isEmailVerified() {
    if (!currentUser) return false;
    // Google and anonymous users don't need email verification
    if (currentUser.isAnonymous) return true;
    if (currentUser.providerData.some(p => p.providerId === 'google.com')) return true;
    return currentUser.emailVerified;
}

/**
 * Reload user to check verification status
 */
export async function reloadUser() {
    if (currentUser) {
        await currentUser.reload();
        currentUser = auth.currentUser;
        return currentUser;
    }
    return null;
}

/**
 * Send password reset email
 */
export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

/**
 * Sign in as Guest (Anonymous)
 */
export async function signInAsGuest() {
    try {
        const result = await signInAnonymously(auth);
        return { success: true, user: result.user };
    } catch (error) {
        console.error('Guest sign-in error:', error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

/**
 * Sign out
 */
export async function logOut() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Sign-out error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get current user
 */
export function getCurrentUser() {
    return currentUser;
}

/**
 * Check if user is logged in
 */
export function isLoggedIn() {
    return currentUser !== null;
}

/**
 * Check if user is a guest (anonymous)
 */
export function isGuest() {
    return currentUser?.isAnonymous ?? false;
}

/**
 * Get user display info
 */
export function getUserDisplayInfo() {
    if (!currentUser) return null;

    return {
        uid: currentUser.uid,
        displayName: currentUser.displayName || 'Guest',
        email: currentUser.email,
        photoURL: currentUser.photoURL,
        isAnonymous: currentUser.isAnonymous
    };
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback) {
    authStateListeners.push(callback);

    // Return unsubscribe function
    return () => {
        authStateListeners = authStateListeners.filter(cb => cb !== callback);
    };
}

/**
 * Initialize auth state listener
 */
export function initAuth() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            currentUser = user;

            // Notify all listeners
            authStateListeners.forEach(callback => callback(user));

            resolve(user);
        });
    });
}

/**
 * Convert Firebase error codes to user-friendly messages
 */
function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/operation-not-allowed': 'This sign-in method is not enabled.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/popup-closed-by-user': 'Sign-in was cancelled.',
        'auth/popup-blocked': 'Pop-up was blocked. Please allow pop-ups for this site.',
        'auth/network-request-failed': 'Network error. Please check your connection.'
    };

    return errorMessages[errorCode] || 'An error occurred. Please try again.';
}
