# Intori.com

The Svelte application is designed to allow users to upload their Amazon purchase history and select specific orders. After selecting, the app converts them into Verifiable Credentials(VCs) using the user's DIDs.

## Installation & Running Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/tuum-tech/intori.com
   ```

2. Navigate to the project directory:

   ```bash
   cd intori.com
   ```

3. Install the dependencies:

   ```bash
   yarn install
   ```

4. Run the application:

   ```bash
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:5173`.

## Components Overview

- **App.svelte**: The main application component. It handles routing and displays either the login component or the main app components based on the user's authentication status.

- **AuthenticatedRoute.svelte**: A wrapper component that ensures routes are only accessible to authenticated users.

- **UserProfile.svelte**: Displays the user's profile information, including their wallet address and DID.

- **Login.svelte**: Allows users to log in using their email.

- **FileUpload.svelte**: Lets users upload their Amazon purchase history in CSV format.

- **SelectOrders.svelte**: Displays the uploaded orders and allows users to select specific orders.

- **FilteredOrders.svelte**: Shows the selected orders along with their associated VC metadata.

## Utilities Overview

- **auth.ts**: Contains authentication functions using the Magic SDK.

- **authStore.ts**: A Svelte store that keeps track of the user's authentication status.

- **stores.ts**: Contains Svelte stores for orders and selected orders. It also manages the Veramo state.

## How the App Works

1. Users are first prompted to log in using their email.
2. Once authenticated, users can upload their Amazon purchase history in CSV format.
3. The uploaded orders are displayed, and users can select specific orders.
4. The selected orders can be viewed in the `FilteredOrders` component, where each order's associated VC metadata is also displayed.
