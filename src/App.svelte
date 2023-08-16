<script lang="ts">
  import DisplayOrders from "./lib/DisplayOrders.svelte";
  import FileUpload from "./lib/FileUpload.svelte";
  import FilteredOrders from "./lib/FilteredOrders.svelte";

  let page = "upload";

  function handleFileUploaded() {
    page = "display";
  }

  function handleViewSelected() {
    page = "filtered";
  }
</script>

<main class="container">
  {#if page === "upload"}
    <h1>Upload Amazon Purchase History</h1>
    <FileUpload on:fileUploaded={handleFileUploaded} />
  {:else if page === "display"}
    <h2>Your Orders</h2>
    <DisplayOrders on:viewSelected={handleViewSelected} />
  {:else if page === "filtered"}
    <h1>Selected Orders</h1>
    <FilteredOrders />
    <div class="button-container">
      <button on:click={() => (page = "display")}>Back to Display Orders</button
      >
      <button on:click={() => (page = "upload")}>Back to Upload</button>
    </div>
  {/if}
</main>

<style>
  .button-container {
    margin-top: 2rem;
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .container {
    max-width: 1200px; /* Increase the max-width */
    margin: 2rem auto;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
</style>
