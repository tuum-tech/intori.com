<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Order } from "./stores";
  import { orders, selectedOrders } from "./stores";

  const dispatch = createEventDispatcher();

  let currentPage = 1;
  const itemsPerPage = 20;
  let paginatedOrders: Order[] = [];
  let selectedOrdersArray: Order[] = [];
  let filter = "";

  const typedOrders = ($orders as Order[]).filter(
    (order) => order["Order ID"] !== undefined && order["Order ID"] !== "",
  );

  $: filteredOrders = typedOrders.filter((order) =>
    order["Product Name"].toLowerCase().includes(filter.toLowerCase()),
  );

  $: paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  let selectedMap = new Map();
  let isChecked: boolean[] = [];

  $: paginatedOrders.forEach((order, index) => {
    if (!selectedMap.has(order)) {
      selectedMap.set(order, false);
    }
    isChecked[index] = selectedMap.get(order);
  });

  function toggleOrder(order: Order, index: number) {
    const isSelected = selectedMap.get(order);
    if (isSelected) {
      selectedOrdersArray = selectedOrdersArray.filter((o) => o !== order);
    } else {
      selectedOrdersArray.push(order);
    }
    selectedMap.set(order, !isSelected);
    isChecked[index] = !isSelected;
  }

  function areAllSelected() {
    return paginatedOrders.every((order) => selectedMap.get(order));
  }

  function toggleAll() {
    if (areAllSelected()) {
      paginatedOrders.forEach((order, index) => {
        selectedOrdersArray = selectedOrdersArray.filter((o) => o !== order);
        selectedMap.set(order, false);
        isChecked[index] = false;
      });
    } else {
      paginatedOrders.forEach((order, index) => {
        if (!selectedOrdersArray.includes(order)) {
          selectedOrdersArray.push(order);
        }
        selectedMap.set(order, true);
        isChecked[index] = true;
      });
    }
  }

  function viewSelectedOrders() {
    selectedOrders.set([...selectedOrdersArray]);
    dispatch("viewSelected");
  }

  // Pagination logic
  $: totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const maxPageNumbersToShow = 5;

  $: startPage = Math.max(
    1,
    currentPage - Math.floor(maxPageNumbersToShow / 2),
  );
  $: endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);

  function nextPage() {
    if (currentPage < totalPages) {
      currentPage++;
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      currentPage--;
    }
  }
</script>

<div>
  <div class="search-container">
    <input
      class="search-box"
      type="text"
      bind:value={filter}
      placeholder="Filter by product name..."
    />
  </div>

  <table>
    <thead>
      <tr>
        <th>
          <input
            type="checkbox"
            checked={areAllSelected()}
            on:change={toggleAll}
          />
          Select All/Deselect All
        </th>
        <th>Product Name</th>
        <th>Order Date</th>
      </tr>
    </thead>
    <tbody>
      {#each paginatedOrders as order, index (index)}
        <tr>
          <td>
            <input
              type="checkbox"
              bind:checked={isChecked[index]}
              on:change={() => toggleOrder(order, index)}
            />
          </td>
          <td>{order["Product Name"]}</td>
          <td>{order["Order Date"]}</td>
        </tr>
      {/each}
    </tbody>
  </table>

  <div class="pagination">
    <button on:click={prevPage} disabled={currentPage === 1}>Prev</button>
    {#each Array(endPage - startPage + 1) as _, index}
      <button
        on:click={() => (currentPage = startPage + index)}
        class:selected={currentPage === startPage + index}
      >
        {startPage + index}
      </button>
    {/each}
    <button on:click={nextPage} disabled={currentPage === totalPages}
      >Next</button
    >
  </div>

  <div class="submit-container">
    <button on:click={viewSelectedOrders}>Submit</button>
  </div>
</div>

<style>
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th,
  td {
    padding: 0.5rem;
    border: 1px solid var(--border-color);
  }
  th {
    background-color: var(--background-color);
  }
  .search-container {
    margin: 1rem 0;
    display: flex;
    justify-content: center;
  }

  .search-box {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border: 1px solid var(--border-color);
    border-radius: 25px; /* Rounded edges */
    width: 60%; /* Take up 60% of the container's width */
    transition:
      box-shadow 0.3s,
      transform 0.3s;
    outline: none;
  }

  .search-box:focus {
    box-shadow: 0 0 10px rgba(100, 108, 255, 0.5); /* Soft glow on focus */
    transform: scale(1.02); /* Slight scaling for a subtle pop effect */
  }

  .search-box::placeholder {
    color: rgba(0, 0, 0, 0.5);
  }
  .pagination {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
    justify-content: center; /* Center the pagination */
  }
  .pagination button {
    padding: 0.5rem 1rem;
  }
  .pagination button.selected {
    background-color: black;
    color: white;
  }

  .submit-container {
    margin-top: 2rem; /* Added spacing */
    display: flex;
    justify-content: center; /* Center the Submit button */
  }
</style>
