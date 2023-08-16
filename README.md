# Intori.com

The app is designed to allow users to upload their Amazon purchase history in CSV format, display the orders, and then let the user select specific orders from the list. After selecting, the app converts them into Verifiable Credentials(VCs) using the user's DIDs.

## Overview of the code

Here's a brief overview of what each part does:

- `src/main.ts`: This is the entry point of our Svelte application. It initializes the main App.svelte component and attaches it to the DOM.
- `src/App.svelte`: This is the main layout of our application. It conditionally renders either the FileUpload, DisplayOrders, or FilteredOrders components based on the value of the page variable. It also handles events emitted from the child components to navigate between pages.
- `src/lib/stores.ts`: This module defines the Svelte stores that hold the state of our application. We have two stores: orders (for all orders) and selectedOrders (for orders selected by the user).
- `src/lib/FileUpload.svelte`: This component allows users to upload a CSV file. It then parses the file using papaparse and updates the orders store with the parsed data. Once the file is parsed, it emits a fileUploaded event to notify App.svelte to change the page.
- `src/lib/DisplayOrders.svelte`: This component displays a list of orders with checkboxes. Users can select orders by checking the checkboxes. Once they're done selecting, they can click the "Next" button to view the selected orders. This component updates the selectedOrders store with the orders selected by the user and emits a viewSelected event to notify App.svelte to change the page.
- `src/lib/FilteredOrders.svelte`: This component displays a list of orders that the user selected. It reads from the selectedOrders store to get the list of selected orders.
