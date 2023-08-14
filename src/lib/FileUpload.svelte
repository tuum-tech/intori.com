<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { orders } from "./stores";

  const dispatch = createEventDispatcher();

  function parseCSV(data: string) {
    const trimmedData = data.trim();
    const rows = trimmedData.split("\n");
    const headers = rows[0].split(",");
    const result = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].split(",");
      const obj: Record<string, string> = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j];
      }
      result.push(obj);
    }

    return result;
  }

  function handleFileChange(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const target = e.target as FileReader;
        const content = target?.result as string;
        if (content) {
          console.log("csv content: ", content); // Log the original content
          const parsedData = parseCSV(content);
          console.log("Parsed csv content:", parsedData); // Log the parsed data
          orders.set(parsedData);
          dispatch("fileUploaded"); // Notify App.svelte to change the page
        }
      };
      reader.readAsText(file);
    }
  }
</script>

<input type="file" on:change={handleFileChange} />
