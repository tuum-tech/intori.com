<script lang="ts">
  import { logEvent } from "firebase/analytics";
  import { httpsCallable } from "firebase/functions";
  import type { MagicUserMetadata } from "magic-sdk";
  import Papa from "papaparse";
  import { navigate } from "svelte-routing";
  import { analytics, auth, functions } from "../utils/firebase";
  import { orders, type Order } from "../utils/stores";

  let showToast = false;
  let toastMessage = "";

  type Response = {
    success: boolean;
  };

  async function handleFileChange(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: async function (results) {
          console.log("Parsed results:", results.data);
          if (results.errors.length) {
            console.error("Errors while parsing:", results.errors);
            // Filter out rows with missing fields
            results.data = results.data.filter(
              (row: any) => !row.hasOwnProperty("__parsed_extra"),
            );
          }
          // Directly use the parsed data without remapping
          const parsedData = results.data.slice(1) as Order[];
          if (parsedData.length === 0 || !parsedData[0]["Order ID"]) {
            showToast = true;
            toastMessage = "Invalid file format or no valid items found.";
            return;
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
              logEvent(
                analytics,
                `fileUpload: successful for user ${userInfo}`,
              );
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
            return;
          }
          navigate("/selectOrders"); // Navigate to SelectOrders page
        },
        header: true,
        skipEmptyLines: true,
      });
    }
  }
</script>

<h1>Upload Amazon Purchase History</h1>
<!-- File Upload -->
<input type="file" on:change={handleFileChange} />
{#if showToast}
  <div class="toast">{toastMessage}</div>
{/if}

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
