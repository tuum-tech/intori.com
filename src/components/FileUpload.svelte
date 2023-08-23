<script lang="ts">
  import Papa from "papaparse";
  import { navigate } from "svelte-routing";
  import { orders, type Order } from "../utils/stores";

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
              (row: any) => !row.hasOwnProperty("__parsed_extra"),
            );
          }
          // Directly use the parsed data without remapping
          const parsedData = results.data.slice(1) as Order[];
          orders.set(parsedData);
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
