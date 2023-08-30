<script lang="ts">
  import { navigate } from "svelte-routing";
  import { loginWithEmail } from "../utils/auth";
  import { authStore } from "../utils/authStore";

  let email = "";
  let isLoading = false; // Add this line

  const handleLogin = async (e: any) => {
    e.preventDefault();
    isLoading = true; // Set loading to true when login starts
    if (email) {
      const success = await loginWithEmail(email); // Adjusted to handle the new return value
      if (success && $authStore.isLoggedIn) {
        navigate("/fileUpload"); // Navigate to the FileUpload page
      } else {
        isLoading = false; // Set loading to false if login failed
      }
    }
  };
</script>

<h1>Please sign up or login</h1>
{#if isLoading}
  <div>Loading...</div>
{:else}
  <form on:submit={handleLogin}>
    <input
      type="email"
      bind:value={email}
      required
      placeholder="Enter your email"
    />
    <button type="submit">Submit</button>
  </form>
{/if}
