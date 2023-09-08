<script lang="ts">
  import { logEvent } from "firebase/analytics";
  import { httpsCallable } from "firebase/functions";
  import type { MagicUserMetadata } from "magic-sdk";
  import Papa from "papaparse";
  import { navigate } from "svelte-routing";
  import { analytics, auth, functions } from "../utils/firebase";
  import { orders, type Order } from "../utils/stores";
  import "./FileUpload.css";

  let showToast = false;
  let toastMessage = "";

  const hideToast = () => {
    showToast = false;
  };

  type Response = {
    success: boolean;
  };

  let selectedFileName = "";
  let isFileSelected = false;

  let fileInput: HTMLInputElement;

  const processFile = async (file: File) => {
    selectedFileName = file.name;
    isFileSelected = false;

    Papa.parse(file, {
      complete: async function (results) {
        console.log("Numer of items in file:", results.data.length);
        if (results.errors.length) {
          console.error("Errors while parsing:", results.errors);
          // Filter out rows with missing fields
          results.data = results.data.filter(
            (row: any) => !row.hasOwnProperty("__parsed_extra"),
          );
        }
        // Directly use the parsed data without remapping
        const parsedData = results.data.slice(0) as Order[];
        if (parsedData.length === 0 || !parsedData[0]["Order ID"]) {
          showToast = true;
          toastMessage = "Invalid file format or no valid items found.";
          setTimeout(hideToast, 5000);
          return;
        } else {
          isFileSelected = true;
        }
        orders.set(parsedData);

        // After parsing, call the Firebase function
        const userInfo: MagicUserMetadata = JSON.parse(
          localStorage.getItem("magicUserInfo") || "{}",
        ) as MagicUserMetadata;
        const uploadFileFunction = httpsCallable(functions, "uploadFile");
        try {
          const token = await auth.currentUser?.getIdToken(true);
          const response = await uploadFileFunction({ authToken: token });
          const success = (response.data as Response).success;
          if (success) {
            console.log("File uploaded successfully");
            // Log the event to firebase
            logEvent(analytics, `fileUpload: successful for user ${userInfo}`);
          }
        } catch (error) {
          console.error("Error uploading file:", error);
          // Log the event to firebase
          logEvent(
            analytics,
            `fileUpload: failure for user ${userInfo}: ${error}`,
          );
          showToast = true;
          toastMessage = `Error uploading file: ${error}`;
          setTimeout(hideToast, 5000);
          return;
        }
      },
      header: true,
      skipEmptyLines: true,
    });
  };

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      processFile(input.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (isFileSelected) {
      navigate("/selectOrders");
    }
  };

  const handleUploadKeydown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      handleUploadClick();
    }
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      fileInput.click();
    }
  };

  let isDragging = false;

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer!.dropEffect = "copy";
  };

  const handleDragEnter = (event: DragEvent) => {
    isDragging = true;
  };

  const handleDragLeave = (event: DragEvent) => {
    isDragging = false;
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    isDragging = false;

    if (event.dataTransfer && event.dataTransfer.files.length) {
      processFile(event.dataTransfer.files[0]);
    }
  };

  const handleSkipClick = () => {
    navigate("/dashboard");
  };

  const handleSkipKeydown = (event: KeyboardEvent) => {
    // Check if the "Enter" key was pressed
    if (event.key === "Enter") {
      handleSkipClick();
    }
  };
</script>

{#if showToast}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="toast" on:click={hideToast}>{toastMessage}</div>
{/if}
<div class="request-your-amazon-order-hist3">
  <img
    class="profile-stylized-26"
    alt=""
    src="/images/profile-stylized-2.svg"
  />

  <div class="request-your-amazon-order-hist-child16"></div>
  <div class="intori-all-rights">© 2023 Intori. All rights reserved.</div>
  <div class="request-your-amazon3">Request Your Amazon Order History</div>

  <div class="go-to-your-container3">
    <p class="go-to-your3">Go to your account page.</p>
    <p class="go-to-your3">&nbsp;</p>
    <p class="go-to-your3">
      Under your data and privacy section click on ‘Request Your Information’.
    </p>
    <p class="go-to-your3">&nbsp;</p>
    <p class="go-to-your3">
      In the dropdown, click on ‘Your Orders’ and submit your request.
    </p>
  </div>
  <div class="request-your-amazon-order-hist-child17"></div>
  <div class="request-your-amazon-order-hist-child18"></div>
  <div class="request-your-amazon-order-hist-child19"></div>
  <div class="request-your-amazon-order-hist-child20"></div>
  <div class="amazon-will-send3">
    Amazon will send you a confirmation link which may take a couple of hours.
    Download your data, upload here, and we’ll do the work.
  </div>
  <div class="need-more-help3">Need more help?</div>
  <div class="watch-video3">Video coming soon</div>

  <div
    class="main-button16"
    on:click={handleUploadClick}
    on:keydown={handleUploadKeydown}
    tabindex="0"
    role="button"
    aria-label="Upload file"
    style={isFileSelected
      ? "opacity: 1; cursor: pointer;"
      : "opacity: 0.5; pointer-events: none;"}
  >
    <div class="label42">Upload</div>
  </div>

  <div
    class="main-button17"
    on:click={handleSkipClick}
    on:keydown={handleSkipKeydown}
    tabindex="0"
    role="button"
    aria-label="Skip for now"
  >
    <div class="label42">Skip for now</div>
  </div>

  <div class="upload-file-background3"></div>

  <div class="drag-drop-files4">
    <!-- Hidden file input -->
    <input
      type="file"
      bind:this={fileInput}
      on:change={handleFileChange}
      class="hidden"
    />
    <div
      class="drag-drop-container4 {isDragging ? 'dragging' : ''}"
      on:click={() => fileInput.click()}
      on:keydown={handleKeydown}
      on:dragover={handleDragOver}
      on:dragenter={handleDragEnter}
      on:dragleave={handleDragLeave}
      on:drop={handleDrop}
      tabindex="0"
      role="button"
      aria-label="Select a file"
    >
      {#if selectedFileName}
        {selectedFileName}
      {:else}
        <span class="drag-drop4">Drag & drop your file or</span>
        <span class="span5"> </span>
        <span class="browse4">Browse</span>
      {/if}
    </div>
  </div>

  <div class="supported-formates-csv4">Supported formates: .csv</div>
  <img
    class="request-your-amazon-order-hist-child21"
    alt=""
    src="/images/group-1171274899.svg"
  />

  <img class="upload-icon9" alt="" src="/images/upload-icon1.svg" />
</div>

<style>
  .toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: #fff;
    padding: 10px 20px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    opacity: 0.9;
    transition: opacity 0.3s;
    z-index: 1000;
  }
</style>
