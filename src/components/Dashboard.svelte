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
      {#each $vCreds as vc}
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
    </tbody>
  </table>
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
      {#each myVCsMetadata as vcMetadata}
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
    </tbody>
  </table>
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
      {#each otherVCsMetadata as vcMetadata}
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
    </tbody>
  </table>
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
</style>
