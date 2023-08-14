<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Order } from "./stores";
  import { orders, selectedOrders } from "./stores";

  const dispatch = createEventDispatcher();

  let selectedOrdersSet = new Set<Order>();

  function toggleOrder(order: Order) {
    if (selectedOrdersSet.has(order)) {
      selectedOrdersSet.delete(order);
    } else {
      selectedOrdersSet.add(order);
    }
    selectedOrdersSet = new Set(selectedOrdersSet); // trigger reactivity
  }

  function orderSelected(order: Order): boolean {
    return selectedOrdersSet.has(order);
  }

  function viewSelectedOrders() {
    selectedOrders.set([...selectedOrdersSet]); // Update the selectedOrders store
    dispatch("viewSelected");
  }

  const typedOrders = $orders as unknown as Order[];
</script>

<ul>
  {#each typedOrders as order (order["Order ID"])}
    <li>
      <input
        type="checkbox"
        checked={orderSelected(order)}
        on:change={() => toggleOrder(order)}
      />
      {order["Product Name"]} - {order["Order Date"]}
    </li>
  {/each}
</ul>

<button on:click={viewSelectedOrders}>Next</button>
