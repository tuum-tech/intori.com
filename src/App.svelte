<script lang="ts">
  import { onMount } from "svelte";
  import { Route, Router, navigate } from "svelte-routing";
  import AuthenticatedRoute from "./components/AuthenticatedRoute.svelte";
  import FileUpload from "./components/FileUpload.svelte";
  import FilteredOrders from "./components/FilteredOrders.svelte";
  import Login from "./components/Login.svelte";
  import DisplayOrders from "./components/SelectOrders.svelte";
  import UserProfile from "./components/UserProfile.svelte";
  import { logout } from "./utils/auth";
  import { authStore } from "./utils/authStore";

  onMount(() => {
    authStore.checkLoginStatus();
  });

  async function handleLogout() {
    await logout();
    authStore.checkLoginStatus(); // Update the login status after logout
    window.location.href = "/"; // Redirect to home page after logout
  }

  // Reactive statement to handle navigation after login status check
  $: if (!$authStore.loading) {
    if ($authStore.isLoggedIn && window.location.pathname === "/") {
      navigate("/fileUpload");
    }
  }
</script>

<main class="container">
  {#if $authStore.loading}
    <div>Loading...</div>
  {:else if $authStore.isLoggedIn}
    <!-- Profile Information -->
    <UserProfile />
    <button on:click={handleLogout} class="logout-button">Logout</button>
    <Router>
      <Route path="/" let:params let:location>
        {#if $authStore.isLoggedIn}
          <FileUpload />
        {:else}
          <Login />
        {/if}
      </Route>
      <Route path="/fileUpload">
        <AuthenticatedRoute component={FileUpload} />
      </Route>
      <Route path="/selectOrders">
        <AuthenticatedRoute component={DisplayOrders} />
      </Route>
      <Route path="/filteredOrders">
        <AuthenticatedRoute component={FilteredOrders} />
      </Route>
      <Route path="*">
        <AuthenticatedRoute component={FileUpload} />
      </Route>
    </Router>
  {:else}
    <Login />
  {/if}
</main>
