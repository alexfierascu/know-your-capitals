/**
 * Lazy-loaded Firebase wrapper
 * Firebase SDK is only loaded when actually needed
 */

let firebasePromise = null;
let authModule = null;
let firestoreModule = null;

/**
 * Lazily initialize Firebase and return auth/db instances
 */
export async function getFirebase() {
    if (!firebasePromise) {
        firebasePromise = initializeFirebase();
    }
    return firebasePromise;
}

async function initializeFirebase() {
    // Dynamic imports - Firebase only loads when this function is called
    const [
        { initializeApp },
        { getAuth },
        { getFirestore }
    ] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth'),
        import('firebase/firestore')
    ]);

    const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    return { app, auth, db };
}

/**
 * Get Firebase Auth module (lazy loaded)
 */
export async function getAuthModule() {
    if (!authModule) {
        authModule = await import('firebase/auth');
    }
    return authModule;
}

/**
 * Get Firestore module (lazy loaded)
 */
export async function getFirestoreModule() {
    if (!firestoreModule) {
        firestoreModule = await import('firebase/firestore');
    }
    return firestoreModule;
}

/**
 * Check if Firebase has been initialized
 */
export function isFirebaseInitialized() {
    return firebasePromise !== null;
}
