import React, { useState, createContext, useContext, useMemo } from 'react';

// No direct Firebase imports are needed here as the cart is client-side.
// If alerts for stock were to use CustomAlert, it would be imported here.

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        // Ensure quantity does not exceed stock
        if (product.stock < newQuantity) {
            // Using browser alert as per the existing full code logic
            alert(`Cannot add more ${product.name}. Only ${product.stock - existingItem.quantity} more available.`);
            // Optionally, set to max available stock instead of doing nothing or only adding what's left
            return prevItems.map(item =>
              item.id === product.id ? { ...item, quantity: product.stock } : item
            );
        }
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      }
      // Ensure quantity does not exceed stock for new item
      if (product.stock < quantity) {
        alert(`Cannot add ${product.name}. Only ${product.stock} available.`);
        // Add up to available stock
        return [...prevItems, { ...product, quantity: product.stock > 0 ? product.stock : 0 }];
      }
      return [...prevItems, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    const productInCart = cartItems.find(item => item.id === productId);
    if (!productInCart) return;

    const quantity = parseInt(newQuantity, 10); // Ensure it's a number

    if (isNaN(quantity) || quantity <= 0) {
      removeFromCart(productId);
    } else if (productInCart.stock < quantity) {
        // Alert user and set to max available stock
        alert(`Only ${productInCart.stock} of ${productInCart.name} available.`);
        setCartItems(prevItems =>
            prevItems.map(item =>
              item.id === productId ? { ...item, quantity: productInCart.stock } : item
            )
        );
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const cartItemCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const contextValue = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartItemCount
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// Optional: Custom hook to use the cart context
export const useCart = () => {
  return useContext(CartContext);
};