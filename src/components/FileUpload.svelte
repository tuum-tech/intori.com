<script lang="ts">
  import Papa from "papaparse";
  import { createEventDispatcher, onMount } from "svelte";
  import { loadOrCreateWallet, type Wallet } from "../lib/thirdweb/wallet";
  import { getCurrentState } from "../lib/veramo/getAccount";
  import { orders, veramoState, type Order } from "../utils/stores";

  const dispatch = createEventDispatcher();

  let userProfile = {
    did: "",
  };

  onMount(async () => {
    userProfile = await getUserProfile();
  });

  async function getUserProfile() {
    const wallet: Wallet = await loadOrCreateWallet();
    $veramoState = await getCurrentState($veramoState, wallet);
    console.log("state after: ", veramoState);
    return {
      did: $veramoState.currentAccount.did,
    };
    /*  $veramoState = await getCurrentState($veramoState, wallet);
    return {
      did: $veramoState.currentAccount.identifier.did,
    }; */
  }

  function handleFileChange(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: function (results) {
          console.log("Parsed results:", results.data);
          if (results.errors.length) {
            console.error("Errors while parsing:", results.errors);
            // Filter out rows with missing fields
            results.data = results.data.filter(
              (row: any) => !row.hasOwnProperty("__parsed_extra"),
            );
          }
          // Directly use the parsed data without remapping
          const parsedData = results.data.slice(1) as Order[];
          orders.set(parsedData);
          dispatch("fileUploaded"); // Notify App.svelte to change the page
        },
        header: true,
        skipEmptyLines: true,
      });
    }
  }
</script>

<!-- Profile Information -->
<div class="profile-info">
  <h2>User Profile</h2>
  <p><strong>DID:</strong> {userProfile.did}</p>
</div>

<!-- File Upload -->
<input type="file" on:change={handleFileChange} />

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
</style>
