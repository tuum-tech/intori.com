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

<main>
  {#if page === "upload"}
    <h1>Upload Amazon Purchase History</h1>
    <FileUpload on:fileUploaded={handleFileUploaded} />
  {:else if page === "display"}
    <h2>Your Orders</h2>
    <DisplayOrders on:viewSelected={handleViewSelected} />
  {:else if page === "filtered"}
    <h1>Selected Orders</h1>
    <FilteredOrders />
    <button on:click={() => (page = "upload")}>Back to Upload</button>
  {/if}
</main>

<style>
  /* Add any global styles here */
</style>
