<script lang="ts">
  import type { Order } from "./stores";
  import { selectedOrders } from "./stores";

  const typedSelectedOrders = $selectedOrders as unknown as Order[];
</script>

<ul>
  {#each typedSelectedOrders as order (order["Order ID"])}
    <li>
      {order["Product Name"]} - {order["Order Date"]}
    </li>
  {/each}
</ul>
