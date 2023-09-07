<script lang="ts">
  import { logEvent } from "firebase/analytics";
  import { httpsCallable } from "firebase/functions";
  import type { MagicUserMetadata } from "magic-sdk";
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import { createVC } from "../lib/veramo/createVC";
  import type {
    CreateVCRequestParams,
    CreateVCResponseResult,
  } from "../lib/veramo/types/params";
  import { analytics, auth, functions } from "../utils/firebase";
  import {
    selectedOrders,
    vCreds,
    veramoState,
    type Order,
  } from "../utils/stores";

  type Response = {
    success: boolean;
    docId: string;
  };

  type VCMetadata = {
    vcId: string;
    store: string;
    category: string;
    credentialType: string | string[] | undefined;
    issuedTo: string | undefined;
    issuedBy: string;
    issuedDate: string;
    expiryDate: string | undefined;
  };

  onMount(() => {
    if ($selectedOrders.length === 0) {
      navigate("/fileUpload");
    }
  });

  const typedSelectedOrders = $selectedOrders as Order[];

  function getProductDescription(asin: string) {
    // This is a mock function. In a real-world scenario, you'd use an API to fetch this data.
    return "Sample description for ASIN: " + asin;
  }

  let vcs: CreateVCResponseResult[] = Array(typedSelectedOrders.length).fill(
    null,
  );
  let vcMetadataArray: VCMetadata[] = [];

  $: {
    typedSelectedOrders.forEach(async (order, index) => {
      try {
        const vcRequestParams: CreateVCRequestParams = {
          vcKey: "Order",
          vcValue: {
            productName: order["Product Name"],
            store: order["Website"],
            category: "TODO",
            description: getProductDescription(order["ASIN"]),
            orderDate: order["Order Date"],
            amount: `${order["Total Owed"]} ${order["Currency"]}`,
          },
          credTypes: ["OrderCredential"],
        };
        const saved: CreateVCResponseResult = (await createVC(
          $veramoState,
          vcRequestParams,
        )) as CreateVCResponseResult;
        if (saved) {
          console.log("Created a VC: ", saved);
          vcs[index] = saved;
          vcMetadataArray.push({
            vcId: saved.metadata.id,
            store: saved.data.credentialSubject["Order"].store,
            category: saved.data.credentialSubject["Order"].category,
            credentialType: saved.data.type,
            issuedTo: saved.data.credentialSubject.id,
            issuedBy: saved.data.issuer.id,
            issuedDate: saved.data.issuanceDate,
            expiryDate: saved.data.expirationDate,
          });
        }
      } catch (error) {
        console.error(
          `Error while creating a VC for order: ${JSON.stringify(
            order,
          )}: ${error}`,
        );
      }
    });
  }

  function goBackToSelectOrdersPage() {
    navigate("/selectOrders"); // Navigate to SelectOrdersPage page
  }

  async function saveAndProceed() {
    // Save VCs to the svelte store
    $vCreds = [...$vCreds, ...vcs];

    // After creating a VC in the frontend, call the Firebase function
    const createVCFunction = httpsCallable(functions, "createVC");

    const userInfo: MagicUserMetadata = JSON.parse(
      localStorage.getItem("magicUserInfo") || "{}",
    ) as MagicUserMetadata;
    try {
      const token = await auth.currentUser?.getIdToken(true);
      const response = await createVCFunction({
        authToken: token,
        vcMetadataArray,
      });
      const data = response.data as Response;
      if (data.success) {
        console.log("Created VC successfully");
        // Log the event to firebase
        logEvent(
          analytics,
          `createVC: successful for user ${userInfo} with ID: ${data.docId}`,
        );
      }
    } catch (error) {
      console.error("Error creating VC in the backend:", error);
      logEvent(
        analytics,
        `createVC: failure for user ${userInfo} with error: ${error}`,
      );
      throw error; // If it's another error, re-throw it
    }

    $selectedOrders = [];
    navigate("/dashboard"); // Navigate to dashboard page
  }
</script>

<h1>Selected Orders</h1>
<div class="orders-grid">
  {#each typedSelectedOrders as order, index (index)}
    <div class="order-card">
      <div class="order-details">
        <h3>VC Data: Order #{index + 1}</h3>
        <p><strong>Product Name:</strong> {order["Product Name"]}</p>
        <p><strong>Store:</strong> {order["Website"]}</p>
        <p>
          <strong>Description:</strong>
          {getProductDescription(order["ASIN"])}
        </p>
        <p><strong>Order Date:</strong> {order["Order Date"]}</p>
        <p>
          <strong>Amount:</strong>
          {order["Total Owed"]}
          {order["Currency"]}
        </p>
      </div>
      <div class="vc-details">
        {#if vcs[index]}
          <h3>VC Metadata</h3>
          <p><strong>Store:</strong> {order["Website"]}</p>
          <p><strong>Category:</strong> TODO</p>
          <p>
            <strong>Issued to:</strong>
            {vcs[index].data.credentialSubject.id}
          </p>
          <p><strong>Issued by:</strong> {vcs[index].data.issuer.id}</p>
          <p><strong>Issued Date:</strong> {vcs[index].data.issuanceDate}</p>
          <p>
            <strong>Expiration Date:</strong>
            {vcs[index].data.expirationDate}
          </p>
          <p><strong>Credential Types:</strong> {vcs[index].data.type}</p>
        {/if}
      </div>
    </div>
  {/each}
</div>
<div class="submit-container">
  <button on:click={goBackToSelectOrdersPage}>Back to Display Orders</button>
  <button on:click={saveAndProceed}>Next</button>
</div>

<style>
  .orders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1rem;
  }

  .order-card {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .order-card:hover {
    transform: translateY(-5px);
  }

  .order-card h3 {
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
  }

  @media (max-width: 768px) {
    .order-card {
      flex: 1 1 calc(50% - 1rem);
    }
  }

  @media (max-width: 480px) {
    .order-card {
      flex: 1 1 100%;
    }
  }
  .order-details,
  .vc-details {
    flex: 1; /* This ensures both sections always take up equal height */
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
    overflow-wrap: break-word; /* This will break long words to the next line */
    word-wrap: break-word; /* For older browsers */
  }

  .vc-details {
    border-left: none;
  }
</style>
