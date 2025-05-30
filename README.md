# Plants for Life 🌿

Welcome to "Plants for Life," an e-commerce web application dedicated to selling a variety of plants and seeds sourced from local plant enthusiasts. This platform allows users to browse products, manage a shopping cart, place orders, track their delivery, and manage their profiles. Administrators have a dedicated panel to manage products and customer orders.

## Features

User Features:
* Browse Products: View a catalog of available plants and seeds with details.
* Search & Filter: Easily find products using search, and filter by category (seeds/plants).
* Sort Products: Sort items by name or price.
* Shopping Cart: Add/remove items, update quantities, and view cart totals.
* User Authentication: Secure signup and login functionality for personalized experiences.
* User Profile: Manage personal delivery information (name, address, phone number).
* Checkout: Simple checkout process with "Cash on Delivery" as the payment option. Profile information pre-fills delivery details.
* Order History: View past orders with current status and details.
* Delivery Tracking: Visual tracker for order progress ("Order Placed", "Processing", "Shipped", "Out for Delivery", "Delivered").
* Cancel Order: Option to cancel orders if they are in a cancellable state (e.g., "Order Placed", "Processing").
* Homepage: A welcoming landing page.

Admin Features:
* Product Management:
    * View all listed products.
    * Add new plants or seeds with details (name, description, price, category, image URL, stock).
    * Edit existing product details, including price and stock levels.
    * Delete products from the catalog.
* Order Management:
    * View all customer orders.
    * Update the status of any order (e.g., "Processing", "Shipped", "Delivered", "Cancelled").
    * Add/Update tracking numbers for orders.

## Tech Stack

*  Frontend:  React.js
*  State Management:  React Context API
*  Backend & Database:  Firebase (Firestore for database, Firebase Authentication for users)
*  Styling:  Tailwind CSS
*  Build Tool/Development Environment:  Vite (assumed based on `package.json` setup)
*  Drag and Drop (Boilerplate):  React DnD with HTML5 Backend (provider included in setup)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Node.js (which includes npm) installed on your system. Recommended LTS version.
* A Firebase project.

### Setup Instructions

1.   Clone the repository (or set up the project files): 
    If you have the project files, navigate to the root directory.

2.   Install NPM packages: 
    Open your terminal in the project root and run:
    ```bash
    npm install
    ```
    (Or `yarn install` if you prefer Yarn)

3.   Firebase Setup: 
    * Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project (or use an existing one).
    *  Authentication: 
        * In your Firebase project, go to "Authentication" (under Build).
        * Click the "Sign-in method" tab.
        * Enable "Email/Password" and "Anonymous" sign-in providers.
    *  Firestore Database: 
        * In your Firebase project, go to "Firestore Database" (under Build).
        * Click "Create database."
        * Start in  production mode  (you'll define security rules later) or  test mode  (allows open access for a limited time - be cautious).
        * Choose a Firestore location (e.g., an Asian region like `asia-southeast1` (Singapore) or `asia-northeast1` (Tokyo) might offer lower latency for users in the Philippines).
    *  Get Firebase Configuration: 
        * In your Firebase project settings (click the gear icon ⚙️ next to "Project Overview"), scroll down to "Your apps."
        * If you don't have a web app, click "Add app" and select the web icon (`</>`).
        * Register your app (give it a nickname). You don't need Firebase Hosting at this stage unless you plan to deploy there.
        * After registering, Firebase will provide you with a `firebaseConfig` object. Copy these values.

4.   Environment Variables: 
    * Create a `.env` file in the root of your project (this file should be listed in your `.gitignore`).
    * Add your Firebase configuration keys to this file, prefixed with `VITE_` (if using Vite as assumed by the `package.json` structure):
        ```env
        VITE_API_KEY="YOUR_FIREBASE_API_KEY"
        VITE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
        VITE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
        VITE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
        VITE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
        VITE_APP_ID_FIREBASE="YOUR_FIREBASE_APP_ID" 
        VITE_INTERNAL_APP_ID="default-plant-store" # Or your custom internal app identifier
        VITE_ADMIN_UID="YOUR_ADMIN_FIREBASE_USER_ID" # UID of the user you want as admin
        ```
    * Update your `src/firebase/firebase.js` file to use these environment variables:
        ```javascript
        // src/firebase/firebase.js (example snippet)
        const firebaseConfig = {
          apiKey: import.meta.env.VITE_API_KEY,
          authDomain: import.meta.env.VITE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_PROJECT_ID,
          // ... and so on for all keys
        };
        export const appId = import.meta.env.VITE_INTERNAL_APP_ID || 'default-plant-store';
        ```
    * Similarly, update your `AuthContext.js` (or wherever `ADMIN_UID_PLACEHOLDER` was) to use `import.meta.env.VITE_ADMIN_UID`.

5.   Admin User Setup: 
    * Run the application (see next step).
    * Sign up with the email you want to designate as an admin.
    * After signing up and logging in, open your browser's developer console to find your Firebase User ID (UID).
    * Set this UID as the value for `VITE_ADMIN_UID` in your `.env` file. (Alternatively, if you kept `ADMIN_UID_PLACEHOLDER` in `constants.js` or `AuthContext.js`, update it there).

6.   Run the Development Server: 
    ```bash
    npm run dev
    ```
    (Or `npm start` if you set up with Create React App and adapted the environment variables accordingly, e.g., using `REACT_APP_` prefix).

    The application should now be running, typically on `http://localhost:5173` (for Vite) or `http://localhost:3000` (for CRA).

### Firestore Security Rules (Important)

For the application to work correctly (especially user profiles, user-specific orders, and admin access to all orders), you'll need appropriate Firestore security rules. Here's a basic example to get you started (you should refine these for production security):

```firestore-rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Public product data - readable by anyone, writable only by authenticated admins (you'd need a robust admin check)
    match /artifacts/{appId}/public/data/products/{productId} {
      allow read: if true;
      // For write, implement a proper admin check, e.g., using custom claims or checking against a list of admin UIDs
      // This example uses a placeholder field 'adminUid' which you would have to manage.
      // A better way is to use custom claims set on the admin user's token.
      allow write: if request.auth != null && get(/databases/<span class="math-inline">\(database\)/documents/admins/</span>(request.auth.uid)).exists == true; // Example: check if user is in an 'admins' collection
    }

    // User-specific profile data
    match /artifacts/{appId}/users/{userId}/profileData/profile {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User-specific order data
    match /artifacts/{appId}/users/{userId}/orders/{orderId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public collection of all orders (for admin access)
    // Readable/Writable by admin.
    match /artifacts/{appId}/public/data/allOrders/{orderId} {
      // Example: check if user is in an 'admins' collection for read/write
      allow read, write: if request.auth != null && get(/databases/<span class="math-inline">\(database\)/documents/admins/</span>(request.auth.uid)).exists == true;
    }

    // Example 'admins' collection rule (admins can read their own doc in this collection)
    // You would manually add admin UIDs as document IDs into an 'admins' collection at the root.
    // e.g., /admins/{adminAuthUID} with some data like { role: "admin" }
    match /admins/{adminId} {
      allow read: if request.auth != null && request.auth.uid == adminId;
      // Writes to this collection should be highly restricted, e.g., only from server-side or Firebase console.
    }
  }
}