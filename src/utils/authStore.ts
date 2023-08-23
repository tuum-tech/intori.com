import { writable } from "svelte/store";
import { isLoggedIn } from "./auth";

const createAuthStore = () => {
  const { subscribe, set, update } = writable({
    isLoggedIn: false,
    loading: true,
  });

  return {
    subscribe,
    checkLoginStatus: async () => {
      const status = await isLoggedIn();
      console.log("checkLoginStatus: ", { isLoggedIn: status, loading: false });
      set({ isLoggedIn: status, loading: false });
    },
  };
};

export const authStore = createAuthStore();
