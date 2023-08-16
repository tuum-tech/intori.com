<script lang="ts">
  import type { Order } from "./stores";
  import { selectedOrders } from "./stores";

  const typedSelectedOrders = $selectedOrders as Order[];

  function getProductDescription(asin) {
    // This is a mock function. In a real-world scenario, you'd use an API to fetch this data.
    return "Sample description for ASIN: " + asin;
  }
</script>

<div class="orders-grid">
  {#each typedSelectedOrders as order, index (index)}
    <div class="order-card">
      <h3>Order #{index + 1}</h3>
      <p><strong>Product Name:</strong> {order["Product Name"]}</p>
      <p><strong>Store:</strong> {order["Website"]}</p>
      <p>
        <strong>Description:</strong>
        {getProductDescription(order["ASIN"])}
      </p>
      <p><strong>Order Date:</strong> {order["Order Date"]}</p>
      <p><strong>Amount:</strong> {order["Total Owed"]} {order["Currency"]}</p>
    </div>
  {/each}
</div>

<style>
  .orders-grid {
    display: grid;
    grid-template-columns: repeat(
      auto-fill,
      minmax(240px, 1fr)
    ); /* Adjust the minmax values as needed */
    gap: 1rem;
  }

  .order-card {
    padding: 1rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .order-card:hover {
    transform: translateY(-5px);
  }

  .order-card h3 {
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
  }

  @media (max-width: 768px) {
    .order-card {
      flex: 1 1 calc(50% - 1rem); /* Two cards per row on smaller screens */
    }
  }

  @media (max-width: 480px) {
    .order-card {
      flex: 1 1 100%; /* One card per row on very small screens */
    }
  }
</style>
