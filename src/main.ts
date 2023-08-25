import "./app.css";
import App from "./App.svelte";

// Initialize Svelte App
const app = new App({
  target: document.getElementById("app") as HTMLElement,
});

export default app;
