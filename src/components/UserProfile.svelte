<script lang="ts">
  import { onMount } from "svelte";
  import { loadOrCreateWallet } from "../lib/thirdweb/wallet";
  import type { AccountInfo } from "../lib/veramo/interfaces";
  import { loadVeramoState } from "../lib/veramo/loadVeramoState";
  import { veramoState } from "../utils/stores";

  let userProfile = {} as AccountInfo;

  onMount(async () => {
    userProfile = await getUserProfile();
  });

  async function getUserProfile() {
    const wallet = await loadOrCreateWallet();
    $veramoState = await loadVeramoState($veramoState, wallet);
    return $veramoState.currentAccount as AccountInfo;
  }

  let showToast = false;

  function copyToClipboard(value: string) {
    navigator.clipboard.writeText(value);
    showToast = true;
    setTimeout(() => {
      showToast = false;
    }, 2000); // Toast will disappear after 2 seconds
  }
</script>

<div class="profile-info">
  <h2>User Profile</h2>
  <p>
    <strong>Wallet Address:</strong>
    {userProfile.evmAddress}
    <span
      class="copy-icon"
      role="button"
      tabindex="0"
      on:click={() => copyToClipboard(userProfile.evmAddress)}
      on:keydown={(e) =>
        e.key === "Enter" && copyToClipboard(userProfile.evmAddress)}>📋</span
    >
  </p>
  <p>
    <strong>DID:</strong>
    {userProfile.did}
    <span
      class="copy-icon"
      role="button"
      tabindex="0"
      on:click={() => copyToClipboard(userProfile.did)}
      on:keydown={(e) => e.key === "Enter" && copyToClipboard(userProfile.did)}
      >📋</span
    >
  </p>
  {#if showToast}
    <div class="toast">Copied to clipboard</div>
  {/if}
</div>

<style>
  .profile-info {
    background-color: var(--background-color);
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
    text-align: center;
  }

  .profile-info h2 {
    margin: 0;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  .copy-icon {
    cursor: pointer;
    margin-left: 8px;
  }

  .toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: #fff;
    padding: 10px 20px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    opacity: 0.9;
    transition: opacity 0.3s;
    z-index: 1000;
  }
</style>
