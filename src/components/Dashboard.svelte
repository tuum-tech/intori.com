<script lang="ts">
  import { logEvent } from "firebase/analytics";
  import { collection, doc, getDoc, getDocs } from "firebase/firestore";
  import { httpsCallable } from "firebase/functions";
  import type { MagicUserMetadata } from "magic-sdk";
  import { onMount } from "svelte";
  import { analytics, auth, firestore, functions } from "../utils/firebase";
  import { vCreds } from "../utils/stores";
  import VCTable from "./dashboard/VCTable.svelte";

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

  /* // Separate total pages for each table
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
  } */

  let currentPageMyVCs = 1;
  let currentPageMyVCsMetadata = 1;
  let currentPageOtherVCsMetadata = 1;

  function computePagination(totalItems: number, currentPage: number) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const tentativeStartPage = Math.max(
      1,
      currentPage - Math.floor(maxPageNumbersToShow / 2),
    );
    const endPage = Math.min(
      totalPages,
      tentativeStartPage + maxPageNumbersToShow - 1,
    );
    const startPage = Math.max(1, endPage - maxPageNumbersToShow + 1);
    return { totalPages, startPage, endPage };
  }

  $: myVCsPagination = computePagination($vCreds.length, currentPageMyVCs);
  $: myVCsMetadataPagination = computePagination(
    myVCsMetadata.length,
    currentPageMyVCsMetadata,
  );
  $: otherVCsMetadataPagination = computePagination(
    otherVCsMetadata.length,
    currentPageOtherVCsMetadata,
  );

  function nextPage(currentPage: number, totalPages: number) {
    return currentPage < totalPages ? currentPage + 1 : currentPage;
  }

  function prevPage(currentPage: number) {
    return currentPage > 1 ? currentPage - 1 : currentPage;
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

<!-- My Recent VCs Table -->
<div class="vc-table-container">
  <h2>My Recent VCs</h2>
  <VCTable
    data={$vCreds}
    headers={[
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
    ]}
    keys={[
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
    ]}
    currentPage={currentPageMyVCs}
    {itemsPerPage}
  />

  <!-- Pagination for My Recent VCs -->
  <div class="pagination">
    {#if currentPageMyVCs > 1}
      <button on:click={() => (currentPageMyVCs = prevPage(currentPageMyVCs))}
        >Prev</button
      >
    {/if}
    {#each Array(myVCsPagination.endPage - myVCsPagination.startPage + 1) as _, index}
      <button
        on:click={() => (currentPageMyVCs = myVCsPagination.startPage + index)}
        class:selected={currentPageMyVCs === myVCsPagination.startPage + index}
      >
        {myVCsPagination.startPage + index}
      </button>
    {/each}
    {#if currentPageMyVCs < myVCsPagination.totalPages}
      <button
        on:click={() =>
          (currentPageMyVCs = nextPage(
            currentPageMyVCs,
            myVCsPagination.totalPages,
          ))}>Next</button
      >
    {/if}
  </div>
</div>

<!-- My Past VCs Metadata Table -->
<div class="vc-table-container">
  <h2>My Past VCs Metadata</h2>
  <VCTable
    data={myVCsMetadata}
    headers={[
      "Store",
      "Category",
      "VC Type",
      "VC Issued By",
      "VC Issued Date",
      "VC Expiry Date",
    ]}
    keys={[
      "store",
      "category",
      "credentialType",
      "issuedBy",
      "issuedDate",
      "expiryDate",
    ]}
    currentPage={currentPageMyVCsMetadata}
    {itemsPerPage}
  />

  <!-- Pagination for My Past VCs Metadata -->
  <div class="pagination">
    {#if currentPageMyVCsMetadata > 1}
      <button
        on:click={() =>
          (currentPageMyVCsMetadata = prevPage(currentPageMyVCsMetadata))}
        >Prev</button
      >
    {/if}
    {#each Array(myVCsMetadataPagination.endPage - myVCsMetadataPagination.startPage + 1) as _, index}
      <button
        on:click={() =>
          (currentPageMyVCsMetadata =
            myVCsMetadataPagination.startPage + index)}
        class:selected={currentPageMyVCsMetadata ===
          myVCsMetadataPagination.startPage + index}
      >
        {myVCsMetadataPagination.startPage + index}
      </button>
    {/each}
    {#if currentPageMyVCsMetadata < myVCsMetadataPagination.totalPages}
      <button
        on:click={() =>
          (currentPageMyVCsMetadata = nextPage(
            currentPageMyVCsMetadata,
            myVCsMetadataPagination.totalPages,
          ))}>Next</button
      >
    {/if}
  </div>
</div>

<!-- Other Users VCs Metadata Table -->
<div class="vc-table-container">
  <h2>Other Users VCs Metadata</h2>
  <VCTable
    data={otherVCsMetadata}
    headers={[
      "User",
      "Store",
      "Category",
      "VC Type",
      "VC Issued By",
      "VC Issued Date",
      "VC Expiry Date",
    ]}
    keys={[
      "uid",
      "store",
      "category",
      "credentialType",
      "issuedBy",
      "issuedDate",
      "expiryDate",
    ]}
    currentPage={currentPageOtherVCsMetadata}
    {itemsPerPage}
  />
  <!-- Pagination for Other Users VCs Metadata -->
  <div class="pagination">
    {#if currentPageOtherVCsMetadata > 1}
      <button
        on:click={() =>
          (currentPageOtherVCsMetadata = prevPage(currentPageOtherVCsMetadata))}
        >Prev</button
      >
    {/if}
    {#each Array(otherVCsMetadataPagination.endPage - otherVCsMetadataPagination.startPage + 1) as _, index}
      <button
        on:click={() =>
          (currentPageOtherVCsMetadata =
            otherVCsMetadataPagination.startPage + index)}
        class:selected={currentPageOtherVCsMetadata ===
          otherVCsMetadataPagination.startPage + index}
      >
        {otherVCsMetadataPagination.startPage + index}
      </button>
    {/each}
    {#if currentPageOtherVCsMetadata < otherVCsMetadataPagination.totalPages}
      <button
        on:click={() =>
          (currentPageOtherVCsMetadata = nextPage(
            currentPageOtherVCsMetadata,
            otherVCsMetadataPagination.totalPages,
          ))}>Next</button
      >
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
