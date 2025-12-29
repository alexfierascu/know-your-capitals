/**
 * Firebase Configuration and Initialization
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBUnzXZ5NauzVkxG0yuMYJ8JieI-WXLIEw",
    authDomain: "know-your-capitals.firebaseapp.com",
    projectId: "know-your-capitals",
    storageBucket: "know-your-capitals.firebasestorage.app",
    messagingSenderId: "236492511128",
    appId: "1:236492511128:web:7a3e2d6beb07b484cfbded",
    measurementId: "G-3R4BRGE2ES"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
