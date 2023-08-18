import type { AccountInfo, VeramoState } from "./interfaces";

export async function getAccountInfo(state: VeramoState): Promise<AccountInfo> {
  const account = state.currentAccount;

  const publicAccountInfo: AccountInfo = {
    evmAddress: account.evmAddress,
    did: account.did,
    didMethod: account.didMethod,
  };

  console.log(JSON.stringify(publicAccountInfo, null, 4));
  return publicAccountInfo;
}
