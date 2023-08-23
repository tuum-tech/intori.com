import { Magic } from "magic-sdk";

const magic = new Magic("pk_live_07F1F9740FB4BA3B");
magic.preload().then(() => console.log("Magic <iframe> loaded."));

export async function isLoggedIn(): Promise<boolean> {
  const token = localStorage.getItem("magicAuthToken");
  if (!token) return false;
  return true;
}

export async function loginWithEmail(email: string): Promise<void> {
  try {
    await magic.auth.loginWithEmailOTP({ email });
    const token = await magic.user.getIdToken();
    localStorage.setItem("magicAuthToken", token); // Store it in localStorage
  } catch (error) {
    console.log(`Error while logging in with Email: ${error}`);
    throw new Error(`Error while logging in with Email: ${error}`);
  }
}

export async function logout(): Promise<void> {
  try {
    await magic.user.logout();
    localStorage.removeItem("magicAuthToken"); // Remove the token from localStorage
  } catch (error) {
    console.log(`Error while logging out: ${error}`);
    throw new Error(`Error while logging out: ${error}`);
  }
}

export { magic };
