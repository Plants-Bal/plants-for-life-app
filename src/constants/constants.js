// constants.js

// Application Name
export const APP_NAME = "Plants for Life";

// Admin User ID Placeholder (User needs to replace this with their actual Firebase Admin UID)
// It's a "constant" in the sense that its value is set during setup for a deployment,
// though in a real production build, this might also come from an environment variable.
export const ADMIN_UID_PLACEHOLDER = "REPLACE_WITH_YOUR_ADMIN_FIREBASE_UID";

// Order Statuses
export const ORDER_STATUSES = [
    "Order Placed", 
    "Processing", 
    "Shipped", 
    "Out for Delivery", 
    "Delivered", 
    "Cancelled"
];

// Status Groups for Filtering in Order History
export const ON_DELIVERY_STATUSES = [
    "Order Placed", 
    "Processing", 
    "Shipped", 
    "Out for Delivery"
];
export const RECEIVED_STATUSES = ["Delivered"];
export const CANCELLED_STATUSES = ["Cancelled"];

// Initial Product Data for Seeding the Database (if empty)
// In a larger application, this might be in its own initialData.js file or fetched.
export const initialProductsData = [
  { 
    name: "Sunflower Seeds", 
    description: "Giant sunflower seeds, easy to grow.", 
    price: 150.00, 
    category: "seeds", 
    imageUrl: "https://placehold.co/300x300/f4e285/333333?text=Sunflower+Seeds", 
    stock: 100 
  },
  { 
    name: "Tomato Plant", 
    description: "Young cherry tomato plant, ready to pot.", 
    price: 275.00, 
    category: "plants", 
    imageUrl: "https://placehold.co/300x300/e6a2a2/333333?text=Tomato+Plant", 
    stock: 50 
  },
  { 
    name: "Basil Seeds", 
    description: "Sweet basil seeds for your herb garden.", 
    price: 100.00, 
    category: "seeds", 
    imageUrl: "https://placehold.co/300x300/a2e6a2/333333?text=Basil+Seeds", 
    stock: 75 
  },
  { 
    name: "Succulent Plant", 
    description: "Assorted small succulent, low maintenance.", 
    price: 350.00, 
    category: "plants", 
    imageUrl: "https://placehold.co/300x300/b2d8d8/333333?text=Succulent", 
    stock: 30 
  },
  { 
    name: "Lavender Plant", 
    description: "Fragrant lavender plant, attracts pollinators.", 
    price: 325.00, 
    category: "plants", 
    imageUrl: "https://placehold.co/300x300/c9a2e6/333333?text=Lavender+Plant", 
    stock: 40 
  },
];

// You could also put other constants here, like Firestore collection names if you want them centralized,
// though we've been constructing paths directly using 'appId'.
// export const PRODUCTS_COLLECTION = `artifacts/${appId}/public/data/products`; (would require appId here)