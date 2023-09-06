<script lang="ts">
  import { logEvent } from "firebase/analytics";
  import { collection, doc, getDoc, getDocs } from "firebase/firestore";
  import { httpsCallable } from "firebase/functions";
  import type { MagicUserMetadata } from "magic-sdk";
  import { onMount } from "svelte";
  import { analytics, auth, firestore, functions } from "../utils/firebase";
  import { vCreds } from "../utils/stores";

  type UserData = {
    loginCount: number;
    uid: string;
    walletAddress: string;
    did: string;
    email: string;
    filesUploaded: number;
    totalVCs: number;
  };

  type AppStat = {
    totalUsers: 0;
    totalUploadedFiles: 0;
    totalVCsCreated: 0;
  };

  type VCMetadata = {
    uid: string;
    vcId: string;
    store: string;
    category: string;
    credentialType: string | string[] | undefined;
    issuedTo: string | undefined;
    issuedBy: string;
    issuedDate: string;
    expiryDate: string | undefined;
  };

  type Response = {
    success: boolean;
    vcs: VCMetadata[];
  };

  let showToast = false;
  let toastMessage = "";

  let userData: UserData = {} as UserData;
  let appStat: AppStat = {} as AppStat;

  let myVCsMetadata: VCMetadata[] = [];
  let otherVCsMetadata: VCMetadata[] = [];

  async function getTotalUsers(): Promise<AppStat> {
    const usersCollection = collection(firestore, "users");
    const userSnapshot = await getDocs(usersCollection);
    let totalUploadedFiles = 0;
    let totalVCsCreated = 0;
    userSnapshot.forEach((doc) => {
      const data = doc.data() as UserData;
      totalUploadedFiles += data.filesUploaded;
      totalVCsCreated += data.totalVCs;
    });
    return {
      totalUsers: userSnapshot.size,
      totalUploadedFiles,
      totalVCsCreated,
    } as AppStat;
  }

  async function getVCs(self: boolean = true): Promise<VCMetadata[]> {
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
      showToast = true;
      toastMessage = `Error retrieving my VCs: ${error}`;
      return [];
    }
  }

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

      myVCsMetadata = await getVCs();
      otherVCsMetadata = await getVCs(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      // Log the event to firebase
      logEvent(analytics, `fileUpload: failure for user ${userInfo}: ${error}`);
      showToast = true;
      toastMessage = `Error uploading file: ${error}`;
    }
  });

  let itemsPerPage = 5;
  const maxPageNumbersToShow = 5;

  // Separate total pages for each table
  let totalPagesMyVCs: number;
  let totalPagesMyVCsMetadata: number;
  let totalPagesOtherVCsMetadata: number;

  // Separate computed values for start and end pages for pagination for each table
  let startPageMyVCs: number;
  let endPageMyVCs: number;
  let startPageMyVCsMetadata: number;
  let endPageMyVCsMetadata: number;
  let startPageOtherVCsMetadata: number;
  let endPageOtherVCsMetadata: number;

  // Separate reactive statements for each table's pagination
  $: {
    totalPagesMyVCs = Math.ceil($vCreds.length / itemsPerPage);
    let tentativeStartPage = Math.max(
      1,
      currentPageMyVCs - Math.floor(maxPageNumbersToShow / 2),
    );
    endPageMyVCs = Math.min(
      totalPagesMyVCs,
      tentativeStartPage + maxPageNumbersToShow - 1,
    );
    startPageMyVCs = Math.max(1, endPageMyVCs - maxPageNumbersToShow + 1);
  }

  $: {
    totalPagesMyVCsMetadata = Math.ceil(myVCsMetadata.length / itemsPerPage);
    let tentativeStartPage = Math.max(
      1,
      currentPageMyVCsMetadata - Math.floor(maxPageNumbersToShow / 2),
    );
    endPageMyVCsMetadata = Math.min(
      totalPagesMyVCsMetadata,
      tentativeStartPage + maxPageNumbersToShow - 1,
    );
    startPageMyVCsMetadata = Math.max(
      1,
      endPageMyVCsMetadata - maxPageNumbersToShow + 1,
    );
  }

  $: {
    totalPagesOtherVCsMetadata = Math.ceil(
      otherVCsMetadata.length / itemsPerPage,
    );
    let tentativeStartPage = Math.max(
      1,
      currentPageOtherVCsMetadata - Math.floor(maxPageNumbersToShow / 2),
    );
    endPageOtherVCsMetadata = Math.min(
      totalPagesOtherVCsMetadata,
      tentativeStartPage + maxPageNumbersToShow - 1,
    );
    startPageOtherVCsMetadata = Math.max(
      1,
      endPageOtherVCsMetadata - maxPageNumbersToShow + 1,
    );
  }

  let currentPageMyVCs = 1;
  let currentPageMyVCsMetadata = 1;
  let currentPageOtherVCsMetadata = 1;

  function nextPageMyVCs() {
    if (currentPageMyVCs < totalPagesMyVCs) {
      currentPageMyVCs++;
    }
  }

  function prevPageMyVCs() {
    if (currentPageMyVCs > 1) {
      currentPageMyVCs--;
    }
  }

  function nextPageMyVCsMetadata() {
    if (currentPageMyVCsMetadata < totalPagesMyVCsMetadata) {
      currentPageMyVCsMetadata++;
    }
  }

  function prevPageMyVCsMetadata() {
    if (currentPageMyVCsMetadata > 1) {
      currentPageMyVCsMetadata--;
    }
  }

  function nextPageOtherVCsMetadata() {
    if (currentPageOtherVCsMetadata < totalPagesOtherVCsMetadata) {
      currentPageOtherVCsMetadata++;
    }
  }

  function prevPageOtherVCsMetadata() {
    if (currentPageOtherVCsMetadata > 1) {
      currentPageOtherVCsMetadata--;
    }
  }
</script>

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

<div class="items-per-page">
  <label for="itemsPerPage">VCs per page:</label>
  <select bind:value={itemsPerPage} id="itemsPerPage">
    <option value={5}>5</option>
    <option value={10}>10</option>
    <option value={25}>25</option>
    <option value={50}>50</option>
    <option value={100}>100</option>
    <option value={500}>500</option>
    <option value={1000}>1000</option>
  </select>
</div>

<div class="vc-table-container">
  <h2>My Recent VCs</h2>
  <table class="vc-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Description</th>
        <th>Store</th>
        <th>Category</th>
        <th>Order Date</th>
        <th>Amount</th>
        <th>VC Type</th>
        <th>VC Issued By</th>
        <th>VC Issued Date</th>
        <th>VC Expiry Date</th>
        <!-- Add more columns as needed -->
      </tr>
    </thead>
    <tbody>
      {#if $vCreds && $vCreds.length}
        {#each $vCreds.slice((currentPageMyVCs - 1) * itemsPerPage, currentPageMyVCs * itemsPerPage) as vc}
          <tr>
            <td>{vc.data.credentialSubject["Order"].productName}</td>
            <td>{vc.data.credentialSubject["Order"].description}</td>
            <td>{vc.data.credentialSubject["Order"].store}</td>
            <td>{vc.data.credentialSubject["Order"].category}</td>
            <td>{vc.data.credentialSubject["Order"].orderDate}</td>
            <td>{vc.data.credentialSubject["Order"].amount}</td>
            <td>{vc.data.type}</td>
            <td>{vc.data.issuer.id.split(":")[4]}</td>
            <td>{vc.data.issuanceDate}</td>
            <td>{vc.data.expirationDate}</td>
            <!-- Add more data as needed -->
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
  <div class="pagination">
    {#if currentPageMyVCs > 1}
      <button on:click={prevPageMyVCs}>Prev</button>
    {/if}
    {#each Array(endPageMyVCs - startPageMyVCs + 1) as _, index}
      <button
        on:click={() => (currentPageMyVCs = startPageMyVCs + index)}
        class:selected={currentPageMyVCs === startPageMyVCs + index}
      >
        {startPageMyVCs + index}
      </button>
    {/each}
    {#if currentPageMyVCs < totalPagesMyVCs}
      <button on:click={nextPageMyVCs}>Next</button>
    {/if}
  </div>
</div>

<div class="vc-table-container">
  <h2>My Past VCs Metadata</h2>
  <table class="vc-table">
    <thead>
      <tr>
        <th>Store</th>
        <th>Category</th>
        <th>VC Type</th>
        <th>VC Issued By</th>
        <th>VC Issued Date</th>
        <th>VC Expiry Date</th>
        <!-- Add more columns as needed -->
      </tr>
    </thead>
    <tbody>
      {#if myVCsMetadata && myVCsMetadata.length}
        {#each myVCsMetadata.slice((currentPageMyVCsMetadata - 1) * itemsPerPage, currentPageMyVCsMetadata * itemsPerPage) as vcMetadata}
          <tr>
            <td>{vcMetadata.store}</td>
            <td>{vcMetadata.category}</td>
            <td>{vcMetadata.credentialType}</td>
            <td>{vcMetadata.issuedBy}</td>
            <td>{vcMetadata.issuedDate}</td>
            <td>{vcMetadata.expiryDate}</td>
            <!-- Add more data as needed -->
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
  <div class="pagination">
    {#if currentPageMyVCsMetadata > 1}
      <button on:click={prevPageMyVCsMetadata}>Prev</button>
    {/if}
    {#each Array(endPageMyVCsMetadata - startPageMyVCsMetadata + 1) as _, index}
      <button
        on:click={() =>
          (currentPageMyVCsMetadata = startPageMyVCsMetadata + index)}
        class:selected={currentPageMyVCsMetadata ===
          startPageMyVCsMetadata + index}
      >
        {startPageMyVCsMetadata + index}
      </button>
    {/each}
    {#if currentPageMyVCsMetadata < totalPagesMyVCsMetadata}
      <button on:click={nextPageMyVCsMetadata}>Next</button>
    {/if}
  </div>
</div>

<div class="vc-table-container">
  <h2>Other Users VCs Metadata</h2>
  <table class="vc-table">
    <thead>
      <tr>
        <th>User</th>
        <th>Store</th>
        <th>Category</th>
        <th>VC Type</th>
        <th>VC Issued By</th>
        <th>VC Issued Date</th>
        <th>VC Expiry Date</th>
        <!-- Add more columns as needed -->
      </tr>
    </thead>
    <tbody>
      {#if otherVCsMetadata && otherVCsMetadata.length}
        {#each otherVCsMetadata.slice((currentPageOtherVCsMetadata - 1) * itemsPerPage, currentPageOtherVCsMetadata * itemsPerPage) as vcMetadata}
          <tr>
            <td>{vcMetadata.uid}</td>
            <td>{vcMetadata.store}</td>
            <td>{vcMetadata.category}</td>
            <td>{vcMetadata.credentialType}</td>
            <td>{vcMetadata.issuedBy}</td>
            <td>{vcMetadata.issuedDate}</td>
            <td>{vcMetadata.expiryDate}</td>
            <!-- Add more data as needed -->
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
  <div class="pagination">
    {#if currentPageOtherVCsMetadata > 1}
      <button on:click={prevPageOtherVCsMetadata}>Prev</button>
    {/if}
    {#each Array(endPageOtherVCsMetadata - startPageOtherVCsMetadata + 1) as _, index}
      <button
        on:click={() =>
          (currentPageOtherVCsMetadata = startPageOtherVCsMetadata + index)}
        class:selected={currentPageOtherVCsMetadata ===
          startPageOtherVCsMetadata + index}
      >
        {startPageOtherVCsMetadata + index}
      </button>
    {/each}
    {#if currentPageOtherVCsMetadata < totalPagesOtherVCsMetadata}
      <button on:click={nextPageOtherVCsMetadata}>Next</button>
    {/if}
  </div>
</div>

<style>
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

  .vc-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 2rem;
    min-width: 1000px;
    font-size: 0.9rem;
  }

  .vc-table th,
  .vc-table td {
    padding: 0.5rem;
    border: 1px solid #ddd;
  }

  .vc-table th {
    background-color: #f2f2f2;
  }

  @media (max-width: 768px) {
    .vc-table {
      font-size: 0.8rem;
    }
  }

  .items-per-page {
    margin: 1rem 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .items-per-page select {
    margin-left: 0.5rem;
  }

  .pagination {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
    justify-content: center; /* Center the pagination */
  }
  .pagination button {
    padding: 0.5rem 1rem;
  }
  .pagination button.selected {
    background-color: black;
    color: white;
  }
</style>
