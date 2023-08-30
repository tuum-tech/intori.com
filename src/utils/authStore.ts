import { writable } from "svelte/store";
import { auth } from "./firebase";

const initialState = {
  loading: true,
  isLoggedIn: false,
};

const authStore = writable(initialState);

auth.onAuthStateChanged((user) => {
  if (user) {
    authStore.set({ loading: false, isLoggedIn: true });
  } else {
    authStore.set({ loading: false, isLoggedIn: false });
  }
});

export { authStore };
