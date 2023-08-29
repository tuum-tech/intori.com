import { getAnalytics, type Analytics } from "firebase/analytics";
import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  ReCaptchaEnterpriseProvider,
  initializeAppCheck,
  type AppCheck,
} from "firebase/app-check";

import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  setPersistence,
  type Auth,
} from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from "firebase/firestore"; // <-- Import Firestore modules
import {
  connectFunctionsEmulator,
  getFunctions,
  type Functions,
} from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyA9vTwLe-uynMqViNjiDDGCqijzpKQb0qY",
  authDomain: "intori-b7e63.firebaseapp.com",
  projectId: "intori-b7e63",
  storageBucket: "intori-b7e63.appspot.com",
  messagingSenderId: "1038341954432",
  appId: "1:1038341954432:web:32795b7bb52f689beaff65",
  measurementId: "G-17PY53K9E6",
};

// Initialize Firebase
const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);

// Create a ReCaptchaEnterpriseProvider instance using reCAPTCHA Enterprise
// site key and passing it to initializeAppCheck().
const appCheck: AppCheck = initializeAppCheck(firebaseApp, {
  provider: new ReCaptchaEnterpriseProvider(
    "6LchUdUnAAAAAJjn5rl4-xp4hjLdpRg9mkcExLwI",
  ),
  isTokenAutoRefreshEnabled: true, // Set to true to allow auto-refresh.
});
const analytics: Analytics = getAnalytics(firebaseApp); // Initialize analytics

const auth: Auth = getAuth(firebaseApp); // Initialize Auth
// User will remain logged in even after closing and reopening the app
setPersistence(auth, browserLocalPersistence);

const functions: Functions = getFunctions(firebaseApp); // Initialize Functions
const firestore: Firestore = getFirestore(firebaseApp); // <-- Initialize Firestore

// When working locally, we can just use the firestore emulator for testing purposes
if (import.meta.env.VITE_PRODUCTION !== "true") {
  connectAuthEmulator(auth, "http://127.0.0.1:10001");
  connectFunctionsEmulator(functions, "127.0.0.1", 10002);
  connectFirestoreEmulator(firestore, "127.0.0.1", 10003);
}

export { analytics, appCheck, auth, firestore, functions };
