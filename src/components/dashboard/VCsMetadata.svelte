<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { getVCs } from "../../lib/firebase/functions/getVCs";
  import {
    myVCsMetadataParams,
    otherVCsMetadataParams,
    vCreds,
    vCredsParams,
    type VCMetadataParam,
  } from "../../utils/stores";
  import VCTable from "../dashboard/VCTable.svelte";

  let self: boolean;
  let isVCreds: boolean;
  let params: VCMetadataParam;

  let data: any[] = [];
  let lastDoc: string;

  let scrollListener: any;

  onMount(async () => {
    scrollListener = handleScroll;
    window.addEventListener("scroll", scrollListener);

    const queryParams = new URLSearchParams(window.location.search);
    self = queryParams.get("self") === "true";
    isVCreds = queryParams.get("isVCreds") === "true";

    if (self && isVCreds) {
      params = JSON.parse(JSON.stringify($vCredsParams));
      data = $vCreds;
    } else {
      if (self) {
        params = JSON.parse(JSON.stringify($myVCsMetadataParams));
      } else {
        params = JSON.parse(JSON.stringify($otherVCsMetadataParams));
      }
      const fetchedVCs = await getVCs(self, lastDoc);
      data = [...data, ...fetchedVCs];
      lastDoc = data[data.length - 1].id;
    }
  });

  // Cleanup the event listener when the component is destroyed
  onDestroy(() => {
    window.removeEventListener("scroll", scrollListener);
  });

  function handleScroll() {
    const scrolledToBottom =
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 50; // 50px before the bottom
    if (scrolledToBottom) {
      getMoreVCs();
    }
  }

  async function getMoreVCs() {
    if (!isVCreds) {
      const fetchedVCs = await getVCs(self, lastDoc);
      const uniqueVCs = fetchedVCs.filter(
        (fetchedVC) =>
          !data.some((existingVC) => existingVC.id === fetchedVC.id),
      );

      data = [...data, ...uniqueVCs];
      lastDoc = data[data.length - 1].id;
    }
  }
</script>

<div class="infinite-scroll-container">
  {#if data.length > 0}
    <VCTable
      {data}
      headers={params.headers}
      keys={params.keys}
      itemsPerPage={data.length}
    />
  {:else}
    <p>No VCs found.</p>
  {/if}
</div>

<style>
  .infinite-scroll-container {
    border: 1px solid #ddd;
    overflow-y: auto;
  }
</style>
