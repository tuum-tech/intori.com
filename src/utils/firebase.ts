import { getAnalytics, type Analytics } from "firebase/analytics";
import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  type AppCheck,
} from "firebase/app-check";

import { getAuth, type Auth } from "firebase/auth";
import { getFunctions, type Functions } from "firebase/functions";

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

const analytics: Analytics = getAnalytics(firebaseApp);
const auth: Auth = getAuth(firebaseApp); // Initialize Auth
const functions: Functions = getFunctions(firebaseApp); // Initialize Functions

export { analytics, appCheck, auth, firebaseApp, functions };
