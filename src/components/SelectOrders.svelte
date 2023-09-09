<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import { orders, selectedOrders, type Order } from "../utils/stores";
  import "./SelectOrders.css";

  onMount(() => {
    if ($orders.length === 0) {
      navigate("/fileUpload");
    }
  });

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

  // Initialize the selectedMap based on the selectedOrders store
  $: {
    $selectedOrders.forEach((order) => {
      selectedMap.set(order, true);
      selectedOrdersArray.push(order);
    });
  }

  $: paginatedOrders.forEach((order, index) => {
    if (!selectedMap.has(order)) {
      selectedMap.set(order, false);
    }
    isChecked[index] = selectedMap.get(order);
  });

  function toggleOrder(order: Order, index: number) {
    const isSelected = selectedMap.get(order);
    if (isSelected) {
      const index = selectedOrdersArray.findIndex(
        (o) => JSON.stringify(o) === JSON.stringify(order),
      );
      if (index > -1) {
        selectedOrdersArray.splice(index, 1);
      }
    } else {
      if (
        !selectedOrdersArray.some(
          (o) => JSON.stringify(o) === JSON.stringify(order),
        )
      ) {
        selectedOrdersArray.push(order);
      }
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

  function getProductDescription(asin: string) {
    // This is a mock function. In a real-world scenario, you'd use an API to fetch this data.
    return "Sample description for ASIN: " + asin;
  }

  function goToFilteredOrdersPage() {
    selectedOrders.set([...selectedOrdersArray]);
    navigate("/filteredOrders"); // Navigate to FilteredOrders page
  }
</script>

<div class="upload-default-1-desktop">
  <div class="side-menu-large3">
    <div class="side-menu-large-child1"></div>
    <div class="menu-items3">
      <div class="polygon-parent15">
        <img class="group-child54" alt="" src="/images/polygon-8.svg" />

        <div class="dashboard3">Dashboard</div>
        <div class="group-child55"></div>
        <img class="vector-icon16" alt="" src="/images/vector.svg" />
      </div>
      <div class="polygon-parent16">
        <img class="group-child54" alt="" src="./images/polygon-9.svg" />

        <b class="upload3">Upload</b>
        <div class="group-child57"></div>
        <img class="upload-icon3" alt="" src="/images/upload1.svg" />
      </div>
      <div class="polygon-parent17">
        <img class="group-child54" alt="" src="/images/polygon-8.svg" />

        <div class="dashboard3">Portfolio</div>
        <div class="group-child55"></div>
        <img class="graph-icon3" alt="" src="/images/graph1.svg" />
      </div>
      <div class="polygon-parent18">
        <img class="group-child60" alt="" src="/images/polygon-8.svg" />

        <div class="activity3">Activity</div>
        <div class="group-parent2">
          <img
            class="group-child61"
            alt=""
            src="/images/group-11712749293.svg"
          />

          <img class="group-child62" alt="" src="/images/ellipse-270.svg" />

          <b class="b9">2</b>
        </div>
      </div>
      <div class="polygon-parent19">
        <img class="group-child54" alt="" src="/images/polygon-8.svg" />

        <div class="dashboard3">Settings</div>
        <div class="group-child55"></div>
        <img class="vector-icon17" alt="" src="/images/vector1.svg" />
      </div>
    </div>
  </div>
  <div class="upload-default-1-desktop-child"></div>
  <div class="upload-default-1-desktop-item"></div>
  <div class="upload-default-1-desktop-inner"></div>
  <div class="upload-default-1-desktop-child1"></div>
  <div class="upload-default-1-desktop-child2"></div>
  <div class="upload-orders3">Upload orders</div>
  <div class="here-you-will9">
    Here you will find all your data you have uploaded but yet to convert to
    credentials. Don’t forget you need to convert data to credentials to use
    them.
  </div>
  <img
    class="upload-default-1-desktop-child3"
    alt=""
    src="/images/group-11712748991.svg"
  />

  <div class="upload-default-1-desktop-child4"></div>
  <img class="sort-icon6" alt="" src="/images/sort1.svg" />

  <img class="sort-icon7" alt="" src="/images/sort1.svg" />

  <img class="sort-icon8" alt="" src="/images/sort1.svg" />

  <div class="date2">DATE</div>
  <div class="amount2">AMOUNT</div>
  <div class="description2">DESCRIPTION</div>
  <div class="usd34">18.56 USD</div>
  <div class="usd35">18.56 USD</div>
  <div class="usd36">18.56 USD</div>
  <div class="usd37">18.56 USD</div>
  <div class="usd38">18.56 USD</div>
  <div class="usd39">18.56 USD</div>
  <div class="usd40">18.56 USD</div>
  <div class="usd41">18.56 USD</div>
  <div class="usd42">18.56 USD</div>
  <div class="usd43">18.56 USD</div>
  <div class="usd44">18.56 USD</div>
  <div class="usd45">1853.56 USD</div>
  <div class="usd46">1853.56 USD</div>
  <div class="usd47">1853.56 USD</div>
  <div class="usd48">1853.56 USD</div>
  <div class="usd49">1853.56 USD</div>
  <div class="usd50">1853.56 USD</div>
  <div class="classic-signature-122">
    Classic Signature 1 x Auto Extreme Black Matt Spray Paint 400ml,
    Professional Quality, Perfect Finish for Cars, Bikes,Vans, Metal, Wood
  </div>
  <div class="classic-signature-123">
    Classic Signature 1 x Auto Extreme Black Matt Spray Paint 400ml,
    Professional Quality, Perfect Finish for Cars, Bikes,Vans, Metal, Wood
  </div>
  <div class="classic-signature-124">
    Classic Signature 1 x Auto Extreme Black Matt Spray Paint 400ml,
    Professional Quality, Perfect Finish for Cars, Bikes,Vans, Metal, Wood
  </div>
  <div class="classic-signature-125">
    Classic Signature 1 x Auto Extreme Black Matt Spray Paint 400ml,
    Professional Quality, Perfect Finish for Cars, Bikes,Vans, Metal, Wood
  </div>
  <div class="classic-signature-126">
    Classic Signature 1 x Auto Extreme Black Matt Spray Paint 400ml,
    Professional Quality, Perfect Finish for Cars, Bikes,Vans, Metal, Wood
  </div>
  <div class="classic-signature-127">
    Classic Signature 1 x Auto Extreme Black Matt Spray Paint 400ml,
    Professional Quality, Perfect Finish for Cars, Bikes,Vans, Metal, Wood
  </div>
  <div class="classic-signature-128">
    Classic Signature 1 x Auto Extreme Black Matt Spray Paint 400ml,
    Professional Quality, Perfect Finish for Cars, Bikes,Vans, Metal, Wood
  </div>
  <div class="classic-signature-129">
    Classic Signature 1 x Auto Extreme Black Matt Spray Paint 400ml,
    Professional Quality, Perfect Finish for Cars, Bikes,Vans, Metal, Wood
  </div>
  <div class="classic-signature-130">
    Classic Signature 1 x Auto Extreme Black Matt Spray Paint 400ml,
    Professional Quality, Perfect Finish for Cars, Bikes,Vans, Metal, Wood
  </div>
  <div class="classic-signature-131">
    Classic Signature 1 x Auto Extreme Black Matt Spray Paint 400ml,
    Professional Quality, Perfect Finish for Cars, Bikes,Vans, Metal, Wood
  </div>
  <div class="classic-signature-132">
    Classic Signature 1 x Auto Extreme Black Matt Spray Paint 400ml,
    Professional Quality, Perfect Finish for Cars, Bikes,Vans, Metal, Wood
  </div>
  <img
    class="upload-default-1-desktop-child5"
    alt=""
    src="/images/line-188.svg"
  />

  <img
    class="upload-default-1-desktop-child6"
    alt=""
    src="/images/line-188.svg"
  />

  <img
    class="upload-default-1-desktop-child7"
    alt=""
    src="/images/line-188.svg"
  />

  <img
    class="upload-default-1-desktop-child8"
    alt=""
    src="/images/line-188.svg"
  />

  <img
    class="upload-default-1-desktop-child9"
    alt=""
    src="/images/line-188.svg"
  />

  <img
    class="upload-default-1-desktop-child10"
    alt=""
    src="/images/line-188.svg"
  />

  <div class="black-matt-spray12">Black Matt Spray Paint 400ml</div>
  <div class="black-matt-spray13">Black Matt Spray Paint 400ml</div>
  <div class="black-matt-spray14">Black Matt Spray Paint 400ml</div>
  <div class="black-matt-spray15">Black Matt Spray Paint 400ml</div>
  <div class="black-matt-spray16">Black Matt Spray Paint 400ml</div>
  <div class="black-matt-spray17">Black Matt Spray Paint 400ml</div>
  <div class="august-202322">22 August 2023</div>
  <div class="august-202323">22 August 2023</div>
  <div class="august-202324">22 August 2023</div>
  <div class="august-202325">22 August 2023</div>
  <div class="august-202326">22 August 2023</div>
  <div class="august-202327">22 August 2023</div>
  <img
    class="upload-default-1-desktop-child11"
    alt=""
    src="/images/line-188.svg"
  />

  <img
    class="upload-default-1-desktop-child12"
    alt=""
    src="/images/line-188.svg"
  />

  <img
    class="upload-default-1-desktop-child13"
    alt=""
    src="/images/line-188.svg"
  />

  <img
    class="upload-default-1-desktop-child14"
    alt=""
    src="/images/line-188.svg"
  />

  <img
    class="upload-default-1-desktop-child15"
    alt=""
    src="/images/line-188.svg"
  />

  <img
    class="upload-default-1-desktop-child16"
    alt=""
    src="/images/line-188.svg"
  />

  <img
    class="upload-default-1-desktop-child17"
    alt=""
    src="/images/line-188.svg"
  />

  <img
    class="upload-default-1-desktop-child18"
    alt=""
    src="/images/line-188.svg"
  />

  <img
    class="upload-default-1-desktop-child19"
    alt=""
    src="/images/line-188.svg"
  />

  <img
    class="upload-default-1-desktop-child20"
    alt=""
    src="/images/line-188.svg"
  />

  <img class="group-icon37" alt="" src="/images/group.svg" />

  <img class="group-icon38" alt="" src="/images/group.svg" />

  <img class="group-icon39" alt="" src="/images/group.svg" />

  <img class="group-icon40" alt="" src="/images/group.svg" />

  <img class="group-icon41" alt="" src="/images/group.svg" />

  <img class="group-icon42" alt="" src="/images/group.svg" />

  <div class="august-202328">22 August 2023</div>
  <div class="august-202329">22 August 2023</div>
  <div class="august-202330">22 August 2023</div>
  <div class="august-202331">22 August 2023</div>
  <div class="august-202332">22 August 2023</div>
  <div class="november-202312">22 November 2023</div>
  <div class="november-202313">22 November 2023</div>
  <div class="november-202314">22 November 2023</div>
  <div class="november-202315">22 November 2023</div>
  <div class="november-202316">22 November 2023</div>
  <div class="november-202317">22 November 2023</div>
  <img class="group-icon43" alt="" src="/images/group.svg" />

  <img class="group-icon44" alt="" src="/images/group.svg" />

  <img class="group-icon45" alt="" src="/images/group.svg" />

  <img class="group-icon46" alt="" src="/images/group.svg" />

  <img class="group-icon47" alt="" src="/images/group.svg" />

  <img class="group-icon48" alt="" src="/images/group.svg" />

  <img class="group-icon49" alt="" src="/images/group.svg" />

  <img class="group-icon50" alt="" src="/images/group.svg" />

  <img class="group-icon51" alt="" src="/images/group.svg" />

  <img class="group-icon52" alt="" src="/images/group.svg" />

  <img class="group-icon53" alt="" src="/images/group.svg" />

  <img class="group-icon54" alt="" src="/images/group.svg" />

  <div class="upload-button-blanked-out16">
    <div class="label23">1</div>
  </div>
  <div class="upload-button-blanked-out17">
    <div class="label23">2</div>
  </div>
  <div class="upload-button-blanked-out18">
    <div class="label23">3</div>
  </div>
  <div class="upload-button-blanked-out19">
    <div class="label23">4</div>
  </div>
  <div class="upload-button-blanked-out20">
    <div class="label23">5</div>
  </div>
  <div class="upload-button-blanked-out21">
    <div class="label23">26</div>
  </div>
  <div class="upload-button-blanked-out22">
    <img class="vector-icon18" alt="" src="/images/vector2.svg" />

    <div class="label23">Back</div>
  </div>
  <div class="upload-button-blanked-out23">
    <div class="label23">Next</div>
    <img class="vector-icon18" alt="" src="/images/vector3.svg" />
  </div>
  <div class="upload-default-1-desktop-child21"></div>
  <div class="upload-default-1-desktop-child22"></div>
  <div class="upload-default-1-desktop-child23"></div>
  <div class="search-parent2">
    <div class="search9">
      <div class="search-for-orders-wrapper1">
        <div class="search-for-orders3">Search for orders...</div>
      </div>
    </div>
    <div class="search-btn3">
      <img class="lisearch-icon3" alt="" src="/images/lisearch1.svg" />
    </div>
  </div>
  <div class="search-wrapper4">
    <div class="search10">
      <div class="search-inner5">
        <div class="last-30-days-wrapper1">
          <div class="search-for-orders3">Last 30 days</div>
        </div>
      </div>
      <img class="vector-icon20" alt="" src="/images/vector4.svg" />
    </div>
  </div>
  <div class="search-wrapper5">
    <div class="search11">
      <div class="search-inner6">
        <div class="last-30-days-wrapper1">
          <div class="search-for-orders3">Amazon Orders</div>
        </div>
      </div>
      <img class="vector-icon20" alt="" src="/images/vector4.svg" />
    </div>
  </div>
  <div class="upload-default-1-desktop-inner1">
    <div class="data-filter-wrapper1">
      <div class="search-for-orders3">Data filter:</div>
    </div>
  </div>
  <div class="upload-default-1-desktop-inner2">
    <div class="data-filter-wrapper1">
      <div class="search-for-orders3">Data type:</div>
    </div>
  </div>
  <div class="main-button7">
    <div class="label31">Confirm Selection</div>
  </div>
  <div class="main-button8">
    <div class="label31">+ Upload File</div>
  </div>
  <div class="rectangle-parent9">
    <div class="group-child65"></div>
    <img class="info-square-icon6" alt="" src="/images/info-square.svg" />

    <div class="group-child66"></div>
    <img class="group-child67" alt="" src="/images/group-1171274918.svg" />

    <div class="orders-selected3">Orders selected</div>
    <b class="b10">0/89</b>
  </div>
  <div class="polygon-parent20">
    <img class="group-child68" alt="" src="/images/polygon-7.svg" />

    <div class="welcome3">Welcome</div>
    <div class="donnietuumtech3">donnie@tuum.tech</div>
    <img class="user-bar-avatar3" alt="" src="/images/user-bar-avatar1.svg" />
  </div>
  <div class="rectangle-parent10">
    <div class="group-child69"></div>
    <img class="info-square-icon7" alt="" src="/images/info-square1.svg" />

    <div class="group-child66"></div>
    <div class="group-child67">
      <div class="group-child71"></div>
      <img class="path-33966-icon3" alt="" src="/images/path-33966.svg" />
    </div>
    <div class="estimated-data-value3">Estimated Data Value</div>
    <b class="b11">$0.00</b>
  </div>
  <div class="info-box-estimated-data-valu3">
    <div class="info-box-estimated-data-valu-child4"></div>
    <div class="here-you-will10">
      Here you will find all your data you have uploaded but yet to convert to
      credentials. Don’t forget you need to convert data to credentials to use
      them. Here you will find all your data you have uploaded but yet to
      convert to credentials.
    </div>
    <img
      class="info-box-estimated-data-valu-child5"
      alt=""
      src="/images/polygon-71.svg"
    />
  </div>
  <div class="info-box-orders-selected3">
    <div class="info-box-estimated-data-valu-child4"></div>
    <div class="here-you-will11">
      Here you will find all your data you have uploaded but yet to convert to
      credentials. Don’t forget you need to convert data to credentials to use
      them.
    </div>
    <img
      class="info-box-orders-selected-child5"
      alt=""
      src="/images/polygon-71.svg"
    />
  </div>
</div>

<!-- <h1>Your Orders</h1>
<div>
  <div class="search-container">
    <input
      class="search-box"
      type="text"
      bind:value={filter}
      placeholder="Filter by product name..."
    />
  </div>

  <div class="orders-table">
    <table>
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              checked={areAllSelected()}
              on:change={toggleAll}
            />
          </th>
          <th>Product Name</th>
          <th>Store</th>
          <th>Description</th>
          <th>Order Date</th>
          <th>Amount</th>
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
            <td>{order["Website"]}</td>
            <td>{getProductDescription(order["ASIN"])}</td>
            <td>{order["Order Date"]}</td>
            <td>{order["Total Owed"]} {order["Currency"]}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

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
    <button on:click={goToFilteredOrdersPage}>Submit</button>
  </div>
</div>
 -->
