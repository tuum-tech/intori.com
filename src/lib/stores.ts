import type { Writable } from "svelte/store";
import { writable } from "svelte/store";

export interface Order {
  [key: string]: string;
}

export const orders: Writable<Order[]> = writable([]);
export const selectedOrders: Writable<Order[]> = writable([]);
