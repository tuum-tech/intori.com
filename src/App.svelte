<script lang="ts">
  import { Route, Router, navigate } from "svelte-routing";
  import Dashboard from "./components/Dashboard.svelte";
  import FileUpload from "./components/FileUpload.svelte";
  import FilteredOrders from "./components/FilteredOrders.svelte";
  import Login from "./components/Login.svelte";
  import DisplayOrders from "./components/SelectOrders.svelte";
  import VCsMetadata from "./components/dashboard/VCsMetadata.svelte";
  import AuthenticatedRoute from "./components/login/AuthenticatedRoute.svelte";
  import { logout } from "./utils/auth";
  import { authStore } from "./utils/authStore";
  import { selectedOrders } from "./utils/stores";

  let isLoggingOut = false;

  async function handleUpload() {
    $selectedOrders = [];
    navigate("/fileUpload");
  }

  async function handleLogout() {
    isLoggingOut = true; // Set isLoggingOut to true when logout starts
    await logout();
    isLoggingOut = false; // Set isLoggingOut to false after logout completes
    window.location.href = "/"; // Redirect to home page after logout
  }

  // Reactive statement to handle navigation after login status check
  $: if (
    !$authStore.loading &&
    $authStore.isLoggedIn &&
    window.location.pathname === "/"
  ) {
    navigate("/fileUpload");
  }
</script>

<main class="container">
  {#if $authStore.loading || isLoggingOut}
    <div>Loading...</div>
  {:else if $authStore.isLoggedIn}
    <!-- Profile Information -->
    <!-- No need to show to the user as the user doesn't need to know about their local crypto wallet 
      <UserProfile /> 
    -->
    <div class="button-container">
      <button on:click={() => navigate("/dashboard")} class="dashboard-button"
        >Dashboard</button
      >
      <button on:click={handleUpload} class="upload-button">Upload</button>
      <button on:click={handleLogout} class="logout-button">Logout</button>
    </div>

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
      <Route path="/dashboard">
        <AuthenticatedRoute component={Dashboard} />
      </Route>
      <Route path="/dashboard/vcsMetadata">
        <VCsMetadata />
      </Route>
      <Route path="*">
        <AuthenticatedRoute component={Dashboard} />
      </Route>
    </Router>
  {:else}
    <Login />
  {/if}
</main>

<style>
  .button-container {
    position: fixed; /* Fix the position of the container */
    top: 10px; /* 10px from the top */
    right: 10px; /* 10px from the right */
    display: flex; /* Use Flexbox for layout */
    gap: 10px; /* Add a gap between the buttons */
  }

  .dashboard-button,
  .upload-button,
  .logout-button {
    margin-right: 10px; /* Add some spacing between the buttons */
    padding: 8px 12px;
    font-size: 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .upload-button {
    background-color: #007bff; /* A blue color for the upload button */
    color: #fff;
  }

  .upload-button:hover {
    background-color: #0056b3; /* A darker blue on hover */
  }

  .logout-button {
    background-color: #dc3545; /* A red color for the logout button */
    color: #fff;
  }

  .logout-button:hover {
    background-color: #c82333; /* A darker red on hover */
  }
</style>
