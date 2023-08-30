<script lang="ts">
  import { navigate } from "svelte-routing";
  import { loginWithEmail } from "../utils/auth";
  import { authStore } from "../utils/authStore";

  let email = "";

  const handleLogin = async (e: any) => {
    e.preventDefault();
    if (email) {
      await loginWithEmail(email);
      if ($authStore.isLoggedIn) {
        navigate("/fileUpload"); // Navigate to the FileUpload page
      }
    }
  };
</script>

<h1>Please sign up or login</h1>
<form on:submit={handleLogin}>
  <input
    type="email"
    bind:value={email}
    required
    placeholder="Enter your email"
  />
  <button type="submit">Submit</button>
</form>
