<script lang="ts">
  export let data: any[] = [];
  export let headers: string[] = [];
  export let keys: string[] = [];
  export let currentPage = 1;
  export let itemsPerPage = 5;

  // Helper function to safely retrieve nested values
  function getNestedValue(obj: any, path: string) {
    const parts = path.split(/[\.\[\]]+/).filter(Boolean);
    const value = parts.reduce(
      (acc, part) => (acc ? acc[part] : undefined),
      obj,
    );
    return value;
  }
</script>

<table class="vc-table">
  <thead>
    <tr>
      {#each headers as header}
        <th>{header}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#if data && data.length}
      {#each data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) as row}
        <tr>
          {#each keys as key}
            <td>{getNestedValue(row, key)}</td>
          {/each}
        </tr>
      {/each}
    {/if}
  </tbody>
</table>

<style>
  .vc-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 2rem;
    min-width: 1000px;
    font-size: 0.9rem;
  }

  .vc-table th,
  .vc-table td {
    padding: 0.5rem;
    border: 1px solid #ddd;
  }

  .vc-table th {
    background-color: #f2f2f2;
  }

  @media (max-width: 768px) {
    .vc-table {
      font-size: 0.8rem;
    }
  }
</style>
