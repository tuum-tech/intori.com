<script lang="ts">
  import type { Order } from "./stores";
  import { selectedOrders } from "./stores";

  const typedSelectedOrders = $selectedOrders as Order[];
</script>

<div class="orders-container">
  {#each typedSelectedOrders as order, index (index)}
    <div class="order-card">
      <h3>Order #{index + 1}</h3>
      <p><strong>Product:</strong> {order["Product Name"]}</p>
      <p><strong>Date:</strong> {order["Order Date"]}</p>
    </div>
  {/each}
</div>

<style>
  .orders-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }

  .order-card {
    background-color: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    width: 250px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
  }

  .order-card:hover {
    transform: translateY(-5px);
  }

  .order-card h3 {
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
  }
</style>
