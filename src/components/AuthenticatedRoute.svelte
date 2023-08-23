<script lang="ts">
  import { navigate } from "svelte-routing";
  import { authStore } from "../utils/authStore";

  export let component: any;

  $: if (!$authStore.loading) {
    if (!$authStore.isLoggedIn) {
      navigate("/");
    }
  }
</script>

{#if $authStore.loading}
  <!-- You can show a loader here if needed -->
  Loading...
{:else if $authStore.isLoggedIn}
  <svelte:component this={component} />
{:else}
  <!-- This should not be reached, but you can handle unexpected states here if needed -->
{/if}
