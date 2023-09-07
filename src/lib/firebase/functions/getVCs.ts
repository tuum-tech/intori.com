import { logEvent } from "firebase/analytics";
import { httpsCallable } from "firebase/functions";
import type { MagicUserMetadata } from "magic-sdk";
import { analytics, auth, functions } from "../../../utils/firebase";

export enum ProductValueRange {
  LessThanFifty,
  BetweenFiftyAndHundred,
  GreaterThanHundred,
}

export enum AgeOfOrder {
  LessThanSixMonths,
  BetweenSixAndTwelveMonths,
  GreaterThanOneYear,
}

export type VCMetadata = {
  productValueRange: ProductValueRange;
  ageOfOrder: AgeOfOrder;
  vcData: {
    order: {
      store: string;
      category: string;
    };
    credentialType: string | string[] | undefined;
    issuedTo: string | undefined;
    issuedBy: string;
    issuedDate: string;
    expiryDate: string | undefined;
  };
  vcMetadata: {
    id: string;
    store: string | string[] | undefined;
  };
};

export type Response = {
  success: boolean;
  vcs: VCMetadata[];
};

export async function getVCs(
  self: boolean = true,
  startAfterDoc?: string,
): Promise<VCMetadata[]> {
  // After parsing, call the Firebase function
  const userInfo: MagicUserMetadata = JSON.parse(
    localStorage.getItem("magicUserInfo") || "{}",
  ) as MagicUserMetadata;
  const getVCsFunction = httpsCallable(functions, "getVCs");
  try {
    const token = await auth.currentUser?.getIdToken(true);
    const params = {
      authToken: token,
      uid: "",
      startAfterDoc: startAfterDoc || null,
    };
    if (self) {
      params.uid = auth.currentUser?.uid as string;
    }
    const response = await getVCsFunction(params);
    const result = response.data as Response;
    if (result.success) {
      console.log("Retrieved my VCs successfully");
      // Log the event to firebase
      logEvent(analytics, `getVCs: successful for user ${userInfo}`);
    }
    return result.vcs;
  } catch (error) {
    console.error(`Error retrieving my VCs: ${error}`);
    // Log the event to firebase
    logEvent(analytics, `getMyVCs: failure for user ${userInfo}: ${error}`);
    return [];
  }
}
