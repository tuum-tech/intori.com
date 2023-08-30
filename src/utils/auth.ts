import { logEvent } from "firebase/analytics";
import { signInWithCustomToken, signOut } from "firebase/auth";
import { httpsCallable } from "firebase/functions";

import { Magic, type MagicUserMetadata } from "magic-sdk";
import { userLoggedIn } from "../main";
import { analytics, auth, functions } from "./firebase"; // Import the initialized services

interface CustomTokenResponse {
  customToken: string;
}

const magic = new Magic("pk_live_07F1F9740FB4BA3B");
magic.preload().then(() => console.log("Magic <iframe> loaded."));

export async function isLoggedIn(): Promise<boolean> {
  return userLoggedIn;
}

export async function loginWithEmail(email: string): Promise<void> {
  try {
    await magic.auth.loginWithEmailOTP({ email });
    const userInfo: MagicUserMetadata = await magic.user.getInfo();
    console.log("User Login: ", JSON.stringify(userInfo));

    // Call Firebase SDK to authenticate to Firebase as well
    const createCustomTokenFunction = httpsCallable(functions, "login");
    const magicIdToken = await magic.user.getIdToken();
    const functionResult = await createCustomTokenFunction({
      magicIdToken,
      userInfo,
    });
    // Extract the customToken from the functionResult
    const customToken = (functionResult.data as CustomTokenResponse)
      .customToken;

    // Authenticate with Firebase using the custom token
    await signInWithCustomToken(auth, customToken);

    // Log the event to firebase
    logEvent(analytics, "login", userInfo);

    localStorage.setItem("magicUserInfo", JSON.stringify(userInfo));
  } catch (error) {
    console.log(`Error while logging in with Email: ${error}`);
    throw new Error(`Error while logging in with Email: ${error}`);
  }
}

export async function logout(): Promise<void> {
  try {
    let userInfo: MagicUserMetadata | null = null;

    try {
      userInfo = await magic.user.getInfo();
    } catch (infoError) {
      console.warn("Unable to fetch user info:", infoError);
    }

    try {
      await magic.user.logout();
    } catch (logoutError) {
      // Check if logoutError is an object and has a property named 'code'
      if (
        typeof logoutError === "object" &&
        logoutError !== null &&
        "error_code" in logoutError
      ) {
        const errorObj = logoutError as { error_code?: string }; // Type assertion
        if (errorObj.error_code === "auth_relayer/UNABLE_TO_REFRESH_SESSION") {
          console.warn("Magic session refresh failed, proceeding with logout");
        } else {
          throw logoutError; // If it's another error, re-throw it
        }
      } else {
        throw logoutError; // If it's not an object or doesn't have a 'code' property, re-throw it
      }
    }

    // Logging out from Firebase
    await signOut(auth);

    if (userInfo) {
      // Log the event to firebase
      logEvent(analytics, "logout", userInfo);
    }

    localStorage.removeItem("magicUserInfo");
  } catch (error) {
    console.log(`Error while logging out: ${error}`);
    throw new Error(`Error while logging out: ${error}`);
  }
}

export { magic };
