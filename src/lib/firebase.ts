import {
    initializeApp,
    getApps,
    getApp,
    type FirebaseApp,
    type FirebaseOptions,
} from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

// Web app config — copy these from the Firebase console:
//   Project settings → General → Your apps → SDK setup and configuration → Config
// These NEXT_PUBLIC_* values are client-side and safe to expose; access is
// controlled by Firestore Security Rules (see firestore.rules), NOT by hiding them.
const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Reuse the existing app during Fast Refresh / repeated imports instead of
// re-initialising (which throws "Firebase App named '[DEFAULT]' already exists").
function firebaseApp(): FirebaseApp {
    return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

// Auth and Firestore are initialised lazily on first use. All access happens
// from client effects and event handlers, so the SDK is never evaluated during
// SSR / static prerendering — keeping the build green regardless of config.
let _db: Firestore | null = null;
let _auth: Auth | null = null;

export function getDb(): Firestore {
    if (!_db) _db = getFirestore(firebaseApp());
    return _db;
}

export function getFirebaseAuth(): Auth {
    if (!_auth) _auth = getAuth(firebaseApp());
    return _auth;
}
