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

{#if isLoading}
  <div>Loading...</div>
{:else}
  <div class="log-in-default">
    <div class="div">
      <div class="overlap">
        <p class="text-wrapper">© 2023 Intori. All rights reserved.</p>
        <p class="p">Your data is valuable, see how much it’s worth</p>
        <div class="text-wrapper-2">Back Home</div>
        <img
          class="arrow-left"
          src="https://c.animaapp.com/PjHil4TW/img/arrow---left@2x.png"
        />
        <div class="rectangle"></div>
        <p class="text-wrapper-3">
          Get paid for what you already do and earn from online activity with no
          data collected and linked to your identity.
        </p>
        <div class="text-wrapper-4">Privacy is Priority</div>
        <img
          class="group"
          src="https://c.animaapp.com/PjHil4TW/img/group-1171274886@2x.png"
        />
        <div class="group-2">
          <div class="overlap-group">
            <div class="profile"><div class="ellipse"></div></div>
            <div class="overlap-group-wrapper">
              <div class="overlap-group-2">
                <div class="ellipse-2"></div>
                <img
                  class="mask-group"
                  src="https://c.animaapp.com/PjHil4TW/img/mask-group-1@2x.png"
                />
                <div class="div-2"></div>
              </div>
            </div>
            <div class="mask-group">
              <div class="overlap-2">
                <img
                  class="donniemain"
                  src="https://c.animaapp.com/PjHil4TW/img/donniemain@2x.png"
                />
                <div class="div-2"></div>
              </div>
            </div>
          </div>
          <p class="text-wrapper-5">Join us - Beta testing stage</p>
        </div>
        <div class="intori-logo-both-wrapper">
          <div class="intori-logo-both">
            <div class="overlap-group-3">
              <img
                class="vector"
                src="https://c.animaapp.com/PjHil4TW/img/vector-4.svg"
              />
              <img
                class="intori-mark"
                src="https://c.animaapp.com/PjHil4TW/img/intori-mark-2.svg"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="text-wrapper-6">Email</div>
      <div class="text-field">
        <div class="text-wrapper-7">your@email.com</div>
      </div>
      <div class="text-wrapper-8">Log in</div>
      <img
        class="line"
        src="https://c.animaapp.com/PjHil4TW/img/line-170.svg"
      />
      <div class="main-button"><div class="label">Log in</div></div>
      <div class="overlap-3">
        <div class="text-wrapper-9">Don’t have an account?</div>
        <div class="text-wrapper-10">Sign up</div>
      </div>
    </div>
  </div>
  <!--   <form on:submit={handleLogin}>
    <input
      type="email"
      bind:value={email}
      required
      placeholder="Enter your email"
    />
    <button type="submit">Submit</button>
  </form> -->
{/if}
