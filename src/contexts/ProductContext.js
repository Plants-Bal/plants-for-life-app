import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
    getFirestore, // Assuming 'db' instance is passed or imported
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    onSnapshot,
    query,
    serverTimestamp,
    writeBatch
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // To check admin privileges for write operations

// You would typically import 'db', 'appId', and 'auth' from your firebase.js setup file
// For example:
// import { db, auth } from './firebase';
// import { appId } from '../config'; // or from wherever appId is defined
// And AuthContext if needed for isLoadingAuth or currentUser directly
// import { AuthContext } from './AuthContext';

// For this example, let's assume 'db', 'appId', and 'auth' are accessible.
// This is a simplification. In a real multi-file setup, these would be imported.
const db = getFirestore(); // Assumes Firebase app is initialized elsewhere
const auth = getAuth();   // Assumes Firebase app is initialized elsewhere
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-plant-store'; // Example, should be consistent

// Initial data for seeding if the database is empty
const initialProductsData = [
  { name: "Sunflower Seeds", description: "Giant sunflower seeds, easy to grow.", price: 150.00, category: "seeds", imageUrl: "https://placehold.co/300x300/f4e285/333333?text=Sunflower+Seeds", stock: 100 },
  { name: "Tomato Plant", description: "Young cherry tomato plant, ready to pot.", price: 275.00, category: "plants", imageUrl: "https://placehold.co/300x300/e6a2a2/333333?text=Tomato+Plant", stock: 50 },
  { name: "Basil Seeds", description: "Sweet basil seeds for your herb garden.", price: 100.00, category: "seeds", imageUrl: "https://placehold.co/300x300/a2e6a2/333333?text=Basil+Seeds", stock: 75 },
  { name: "Succulent Plant", description: "Assorted small succulent, low maintenance.", price: 350.00, category: "plants", imageUrl: "https://placehold.co/300x300/b2d8d8/333333?text=Succulent", stock: 30 },
  { name: "Lavender Plant", description: "Fragrant lavender plant, attracts pollinators.", price: 325.00, category: "plants", imageUrl: "https://placehold.co/300x300/c9a2e6/333333?text=Lavender+Plant", stock: 40 },
];


export const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  // const { isLoadingAuth } = useContext(AuthContext); // If you need to wait for auth to load

  const productsCollectionPath = `artifacts/${appId}/public/data/products`;

  useEffect(() => {
    // If using AuthContext to wait for auth: if (isLoadingAuth) return; 

    const productsCol = collection(db, productsCollectionPath);
    
    const setupInitialData = async () => {
        const snapshot = await getDocs(productsCol);
        if (snapshot.empty) {
            console.log("No products found in Firestore, adding initial data...");
            const batch = writeBatch(db);
            initialProductsData.forEach(productData => {
                const newProductRef = doc(collection(db, productsCollectionPath)); // Auto-generate ID
                batch.set(newProductRef, { ...productData, createdAt: serverTimestamp() });
            });
            try {
                await batch.commit();
                console.log("Initial products added successfully.");
            } catch (error) {
                console.error("Error adding initial products with batch:", error);
            }
        }
    };
    setupInitialData();

    const unsubscribe = onSnapshot(query(productsCol), (snapshot) => {
      const productsData = snapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() }));
      setProducts(productsData);
      setIsLoadingProducts(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setIsLoadingProducts(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productsCollectionPath]); // Add isLoadingAuth to dependency array if used

  const addProduct = async (product) => {
    // Admin check should ideally use isAdmin from AuthContext
    if (!auth.currentUser || auth.currentUser.isAnonymous) {
        return Promise.reject("Admin action: User not authenticated or is anonymous.");
    }
    try {
      await addDoc(collection(db, productsCollectionPath), { ...product, createdAt: serverTimestamp() });
    } catch (error) {
      console.error("Error adding product:", error);
      return Promise.reject(`Error adding product: ${error.message}`);
    }
  };

  const updateProduct = async (id, updatedProduct) => {
     if (!auth.currentUser || auth.currentUser.isAnonymous) {
        return Promise.reject("Admin action: User not authenticated or is anonymous.");
    }
    try {
      const productDoc = doc(db, productsCollectionPath, id);
      await updateDoc(productDoc, updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      return Promise.reject(`Error updating product: ${error.message}`);
    }
  };

  const deleteProduct = async (id) => {
    if (!auth.currentUser || auth.currentUser.isAnonymous) {
        return Promise.reject("Admin action: User not authenticated or is anonymous.");
    }
    try {
      const productDoc = doc(db, productsCollectionPath, id);
      await deleteDoc(productDoc);
    } catch (error) {
      console.error("Error deleting product:", error);
      return Promise.reject(`Error deleting product: ${error.message}`);
    }
  };
  
  const updateStockAfterOrder = async (orderedItems) => {
    const batch = writeBatch(db);
    orderedItems.forEach(item => {
        const productRef = doc(db, productsCollectionPath, item.id);
        // Find the product in current state to get current stock
        // This assumes `products` state is up-to-date. For critical operations, re-fetching might be safer.
        const currentProduct = products.find(p => p.id === item.id); 
        if (currentProduct) {
            const newStock = currentProduct.stock - item.quantity;
            batch.update(productRef, { stock: newStock >= 0 ? newStock : 0 }); // Ensure stock doesn't go negative
        } else {
            console.warn(`Product with ID ${item.id} not found for stock update during order. This may lead to inconsistencies.`);
        }
    });
    try {
        await batch.commit();
        // console.log("Stock updated successfully after order.");
    } catch (error) {
        console.error("Error updating stock after order:", error);
    }
  };

  const contextValue = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    isLoadingProducts,
    updateStockAfterOrder
  };

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
}

// Optional: Custom hook to use the product context
export const useProducts = () => {
  return useContext(ProductContext);
};