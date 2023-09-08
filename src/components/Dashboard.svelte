<script lang="ts">
  import { logEvent } from "firebase/analytics";
  import { doc, getDoc } from "firebase/firestore";
  import type { MagicUserMetadata } from "magic-sdk";
  import { onMount } from "svelte";
  import { Link } from "svelte-routing";
  import {
    getTotalUsers,
    type AppStat,
    type UserData,
  } from "../lib/firebase/functions/getTotalUsers";
  import { getVCs, type VCMetadata } from "../lib/firebase/functions/getVCs";
  import { analytics, auth, firestore } from "../utils/firebase";
  import {
    myVCsMetadataParams,
    otherVCsMetadataParams,
    vCreds,
    vCredsParams,
  } from "../utils/stores";
  import VCTable from "./dashboard/VCTable.svelte";

  let showToast = false;
  let toastMessage = "";

  let userData: UserData = {} as UserData;
  let appStat: AppStat = {} as AppStat;

  let myVCsMetadata: VCMetadata[] = [];
  let otherVCsMetadata: VCMetadata[] = [];

  onMount(async () => {
    const userInfo: MagicUserMetadata = JSON.parse(
      localStorage.getItem("magicUserInfo") || "{}",
    ) as MagicUserMetadata;
    try {
      const uid = auth.currentUser?.uid as string;
      const userRef = doc(firestore, "users", uid);
      // Check if user exists before updating
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists) {
        throw new Error("User does not exist.");
      }

      userData = userDoc.data() as UserData;
      appStat = await getTotalUsers();

      myVCsMetadata = await getVCs(true);
      otherVCsMetadata = await getVCs(false);

      // Extract the IDs from myVCsMetadata into a Set
      const validIds = new Set(myVCsMetadata.map((vc) => vc.vcMetadata.id));

      // Filter $vCreds to only include items with a corresponding ID in the Set
      let filteredVCreds = $vCreds.filter((cred) =>
        validIds.has(cred.metadata.id),
      );
      // Add ageOfOrder and productValueRange that are needed to calculate the value in USD
      filteredVCreds = filteredVCreds.map((cred) => {
        // Find the corresponding item in myVCsMetadata with a matching metadata.id
        const matchingMetadata = myVCsMetadata.find(
          (meta) => meta.vcMetadata.id === cred.metadata.id,
        );

        // If a matching item is found, extract the ageOfOrder value from it
        const ageOfOrder = matchingMetadata ? matchingMetadata.ageOfOrder : -1;
        const productValueRange = matchingMetadata
          ? matchingMetadata.productValueRange
          : -1;

        // Return a new object with all of the original properties of the vCreds item plus the new ageOfOrder and productValueRange property
        return {
          ...cred,
          ageOfOrder,
          productValueRange,
        };
      });

      // Update $vCreds with the filtered list
      vCreds.set(filteredVCreds);
    } catch (error) {
      console.error("Error uploading file:", error);
      // Log the event to firebase
      logEvent(analytics, `fileUpload: failure for user ${userInfo}: ${error}`);
      showToast = true;
      toastMessage = `Error uploading file: ${error}`;
    }
  });
</script>

{#if showToast}
  <div class="toast">{toastMessage}</div>
{/if}

<table class="dashboard-table">
  <thead>
    <tr>
      <th>App stats</th>
      <th>Count</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Total number of users</td>
      <td>{appStat.totalUsers}</td>
    </tr>
    <tr>
      <td>Total number of uploaded files</td>
      <td>{appStat.totalUploadedFiles}</td>
    </tr>
    <tr>
      <td>Total number of VCs created</td>
      <td>{appStat.totalVCsCreated}</td>
    </tr>
  </tbody>
</table>

<table class="dashboard-table">
  <thead>
    <tr>
      <th>My stats</th>
      <th>Count</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Logins</td>
      <td>{userData.loginCount}</td>
    </tr>

    <tr>
      <td>Uploaded files</td>
      <td>{userData.filesUploaded}</td>
    </tr>
    <tr>
      <td>VCs created</td>
      <td>{userData.totalVCs}</td>
    </tr>
  </tbody>
</table>

<!-- My VCs Table -->
<div class="vc-table-container">
  <div class="header-container">
    <h2 class="table-title">My VCs</h2>
    <Link to={"/dashboard/vcsMetadata?self=true&isVCreds=true"}>View all</Link>
  </div>

  {#if $vCreds.length > 0}
    <VCTable
      data={$vCreds}
      headers={$vCredsParams.headers}
      keys={$vCredsParams.keys}
      itemsPerPage={5}
    />
  {:else}
    <p>No VCs found.</p>
  {/if}
</div>

<!-- My VCs Metadata Table -->
<div class="vc-table-container">
  <div class="header-container">
    <h2 class="table-title">My VCs Metadata</h2>
    <Link to={"/dashboard/vcsMetadata?self=true"}>View all</Link>
  </div>

  {#if myVCsMetadata.length > 0}
    <VCTable
      data={myVCsMetadata}
      headers={$myVCsMetadataParams.headers}
      keys={$myVCsMetadataParams.keys}
      itemsPerPage={5}
    />
  {:else}
    <p>No VCs found.</p>
  {/if}
</div>

<!--All VCs Metadata Table -->
<div class="vc-table-container">
  <div class="header-container">
    <h2 class="table-title">All VCs Metadata</h2>
    <Link to={"/dashboard/vcsMetadata"}>View all</Link>
  </div>

  {#if otherVCsMetadata.length > 0}
    <VCTable
      data={otherVCsMetadata}
      headers={$otherVCsMetadataParams.headers}
      keys={$otherVCsMetadataParams.keys}
      itemsPerPage={5}
    />
  {:else}
    <p>No VCs found.</p>
  {/if}
</div>

<style>
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

  .dashboard-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 2rem;
    font-size: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .dashboard-table th,
  .dashboard-table td {
    padding: 1rem;
    border: 1px solid #ddd;
    text-align: center;
  }

  .dashboard-table th {
    background-color: #f2f2f2;
  }

  .vc-table-container {
    overflow-x: auto;
    max-width: 100%;
  }

  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .table-title {
    margin-bottom: 0.5rem; /* Adjust this value to your preference */
  }
</style>
