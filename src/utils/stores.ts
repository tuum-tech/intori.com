import type { Writable } from "svelte/store";
import { writable } from "svelte/store";
import type { AccountInfo, VeramoState } from "../lib/veramo/interfaces";
import type { CreateVCResponseResult } from "../lib/veramo/types/params";

export interface Order {
  [key: string]: string;
}

export const orders: Writable<Order[]> = writable([]);
export const selectedOrders: Writable<Order[]> = writable([]);
export const vCreds: Writable<CreateVCResponseResult[]> = writable([]);

const initialState: VeramoState = {
  currentAccount: {} as AccountInfo,
  identityData: {},
};
export const veramoState: Writable<VeramoState> =
  writable<VeramoState>(initialState);
