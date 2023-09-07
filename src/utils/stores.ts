import type { Writable } from "svelte/store";
import { writable } from "svelte/store";
import type { AccountInfo, VeramoState } from "../lib/veramo/interfaces";
import type { CreateVCResponseResult } from "../lib/veramo/types/params";

export interface Order {
  [key: string]: string;
}

export const orders: Writable<Order[]> = writable([]);
export const selectedOrders: Writable<Order[]> = writable([]);

function persistentStore<T>(key: string, startValue: T): Writable<T> {
  const storedValue = localStorage.getItem(key);
  const initialValue = storedValue ? JSON.parse(storedValue) : startValue;

  const store = writable<T>(initialValue);
  let initialized = false;

  store.subscribe((value) => {
    if (initialized) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      initialized = true;
    }
  });

  return store;
}

export const vCreds: Writable<CreateVCResponseResult[]> = persistentStore<
  CreateVCResponseResult[]
>("vCreds", []);

const initialState: VeramoState = {
  currentAccount: {} as AccountInfo,
  identityData: {},
};
export const veramoState: Writable<VeramoState> =
  writable<VeramoState>(initialState);

export interface VCMetadataParam {
  headers: string[];
  keys: string[];
}
export const myVCsMetadataParams: Writable<VCMetadataParam> = writable({
  headers: [
    "Store",
    "Category",
    "VC Type",
    "VC Issued By",
    "VC Issued Date",
    "VC Expiry Date",
  ],
  keys: [
    "store",
    "category",
    "credentialType",
    "issuedBy",
    "issuedDate",
    "expiryDate",
  ],
} as VCMetadataParam);
export const otherVCsMetadataParams: Writable<VCMetadataParam> = writable({
  headers: [
    "User",
    "Store",
    "Category",
    "VC Type",
    "VC Issued By",
    "VC Issued Date",
    "VC Expiry Date",
  ],
  keys: [
    "uid",
    "store",
    "category",
    "credentialType",
    "issuedBy",
    "issuedDate",
    "expiryDate",
  ],
} as VCMetadataParam);
export const vCredsParams: Writable<VCMetadataParam> = writable({
  headers: [
    "Name",
    "Description",
    "Store",
    "Category",
    "Order Date",
    "Amount",
    "VC Type",
    "VC Issued By",
    "VC Issued Date",
    "VC Expiry Date",
  ],
  keys: [
    "data.credentialSubject.Order.productName",
    "data.credentialSubject.Order.description",
    "data.credentialSubject.Order.store",
    "data.credentialSubject.Order.category",
    "data.credentialSubject.Order.orderDate",
    "data.credentialSubject.Order.amount",
    "data.type",
    "data.issuer.id",
    "data.issuanceDate",
    "data.expirationDate",
  ],
} as VCMetadataParam);
