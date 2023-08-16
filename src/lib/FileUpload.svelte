<script lang="ts">
  import Papa from "papaparse";
  import { createEventDispatcher } from "svelte";
  import { orders } from "./stores";

  const dispatch = createEventDispatcher();

  function handleFileChange(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: function (results) {
          console.log("Parsed results:", results.data);
          if (results.errors.length) {
            console.error("Errors while parsing:", results.errors);
            // Filter out rows with missing fields
            results.data = results.data.filter(
              (row) => !row.hasOwnProperty("__parsed_extra"),
            );
          }
          // Directly use the parsed data without remapping
          const parsedData = results.data.slice(1);
          console.log("parsedData:", parsedData);
          orders.set(parsedData);
          dispatch("fileUploaded"); // Notify App.svelte to change the page
        },
        header: true,
        skipEmptyLines: true,
      });
    }
  }
</script>

<input type="file" on:change={handleFileChange} />
