import "./app.css";
import App from "./App.svelte";
import { auth } from "./utils/firebase";

export let userLoggedIn = false;

auth.onAuthStateChanged((user) => {
  if (user) {
    userLoggedIn = true;
  } else {
    userLoggedIn = false;
  }
});

// Initialize Svelte App
const app = new App({
  target: document.getElementById("app") as HTMLElement,
});

export default app;
