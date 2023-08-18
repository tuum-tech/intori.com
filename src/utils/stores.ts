import type { Writable } from "svelte/store";
import { writable } from "svelte/store";
import type { AccountInfo, VeramoState } from "../lib/veramo/interfaces";

export interface Order {
  [key: string]: string;
}

export const orders: Writable<Order[]> = writable([]);
export const selectedOrders: Writable<Order[]> = writable([]);

const initialState: VeramoState = {
  currentAccount: {} as AccountInfo,
  identityData: {},
};

function sanitizeStateForStorage(state: VeramoState): VeramoState {
  const sanitizedState = { ...state };
  for (const evmAddress in sanitizedState.identityData) {
    if (sanitizedState.identityData[evmAddress].localPrivateKeyStore) {
      delete sanitizedState.identityData[evmAddress].localPrivateKeyStore;
    }
  }
  return sanitizedState;
}

// Load initial state from localStorage or use default
const loadedState: VeramoState =
  JSON.parse(localStorage.getItem("veramoState") || "null") || initialState;

export const veramoState: Writable<VeramoState> =
  writable<VeramoState>(loadedState);

// Subscribe to changes in veramoState and save to localStorage
veramoState.subscribe((value) => {
  // const sanitizedValue = sanitizeStateForStorage(value);
  // localStorage.setItem("veramoState", JSON.stringify(sanitizedValue));
  localStorage.setItem("veramoState", JSON.stringify(value));
});
