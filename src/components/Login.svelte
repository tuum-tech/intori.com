<script lang="ts">
  import { navigate } from "svelte-routing";
  import { loginWithEmail } from "../utils/auth";
  import { authStore } from "../utils/authStore";
  import "./Login.css";

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

<!--  <h1>Please sign up or login</h1>-->
{#if isLoading}
  <div>Loading...</div>
{:else}
  <div class="log-in-default-desktop">
    <img
      class="profile-stylized-2"
      alt=""
      src="/images/profile-stylized-2.svg"
    />

    <div class="log-in-default-desktop-child"></div>

    <b class="log-in">Log in</b>
    <div class="log-in-default-desktop-item"></div>

    <!-- Login Form -->
    <form on:submit={handleLogin}>
      <label for="email" class="email">Email</label>
      <input
        id="email"
        type="email"
        bind:value={email}
        required
        placeholder="your@email.com"
        class="text-field"
      />
      <button
        type="submit"
        class={email ? "main-button main-button-active" : "main-button"}
      >
        <div class="label">Log in</div>
      </button>
    </form>

    <div class="intori-all-rights">© 2023 Intori. All rights reserved.</div>
    <div class="your-data-is">
      Your data is valuable, see how much it’s worth
    </div>

    <div class="log-in-default-desktop-inner"></div>
    <div class="get-paid-for">
      Get paid for what you already do and earn from online activity with no
      data collected and linked to your identity.
    </div>
    <div class="privacy-is-priority">Privacy is Priority</div>
    <img class="group-icon" alt="" src="/images/group-1171274886.svg" />

    <div class="profile-3-parent">
      <img class="profile-3-icon" alt="" src="/images/profile-3@2x.png" />

      <img class="profile-2-icon" alt="" src="/images/profile-2@2x.png" />

      <div class="profile-1">
        <img class="donniemain-icon" alt="" src="/images/donniemain@2x.png" />

        <div class="profile-1-child"></div>
      </div>
      <div class="join-us-">Join us - Beta testing stage</div>
    </div>
    <img
      class="log-in-default-desktop-child1"
      alt=""
      src="/images/group-1171274899.svg"
    />
  </div>
{/if}
