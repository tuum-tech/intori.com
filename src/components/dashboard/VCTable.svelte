<script lang="ts">
  export let data: any[] = [];
  export let headers: string[] = [];
  export let keys: string[] = [];
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

  function calculateVCUSDValue(obj: any) {
    let vcValue = 0;
    const ageOfOrder = getNestedValue(obj, "ageOfOrder");
    const productValueRange = getNestedValue(obj, "productValueRange");
    if (ageOfOrder >= 0 && productValueRange >= 0) {
      if (productValueRange === 0) {
        vcValue = ageOfOrder > 1 ? 2 : ageOfOrder > 0 ? 2.5 : 3;
      } else if (productValueRange === 1) {
        vcValue = ageOfOrder > 1 ? 2.5 : ageOfOrder > 0 ? 3 : 3.5;
      } else if (productValueRange === 2) {
        vcValue = ageOfOrder > 1 ? 3 : ageOfOrder > 0 ? 4 : 5;
      }
    }
    return vcValue;
  }
</script>

<table class="vc-table">
  <thead>
    <tr>
      <th>#</th>
      <th>Value</th>
      {#each headers as header}
        <th>{header}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#if data.length > 0}
      {#each data.slice(0, itemsPerPage) as row, index (row.id || row.metadata.id)}
        <tr>
          <td>{index + 1}</td>
          <td>${calculateVCUSDValue(row)}</td>
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
