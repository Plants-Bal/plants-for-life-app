import React, { useState, useContext } from 'react';

// Assume contexts and components are imported from their respective files
// e.g., import { CartContext } from '../contexts/CartContext';
// e.g., import { NavigationContext } from '../contexts/NavigationContext';
// e.g., import { AuthContext } from '../contexts/AuthContext';
// e.g., import Modal from '../components/Modal';
// e.g., import CustomAlert from '../components/CustomAlert';
// e.g., import { formatPrice } from '../utils/helpers'; // Or wherever formatPrice is

import { CartContext } from './CartContext'; // Adjust path as needed
import { NavigationContext } from './NavigationContext'; // Adjust path as needed
import { AuthContext } from './AuthContext'; // Adjust path as needed
import Modal from './Modal'; // Adjust path as needed
import CustomAlert from './CustomAlert'; // Adjust path as needed
import { formatPrice } from './helpers'; // Assuming helpers.js contains formatPrice

// Placeholder for an empty cart icon, if you have one as a component
const EmptyCartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-green-400 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

// Placeholder for a remove item icon
const RemoveItemIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);


function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useContext(CartContext);
  const { navigateTo } = useContext(NavigationContext);
  const { currentUser } = useContext(AuthContext); // To check if user is anonymous
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ message: '', type: '' });


  if (cartItems.length === 0 && !alertInfo.message) { // Avoid showing empty cart if an alert is active
    return (
        <div className="text-center py-16 container mx-auto px-4">
            <EmptyCartIcon />
            <h2 className="text-3xl font-semibold text-gray-700">Your Cart is Empty</h2>
            <p className="text-gray-500 mt-2">Explore our products and add some green to your life!</p>
            <button 
                onClick={() => navigateTo('products')} 
                className="mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
                Shop Now
            </button>
        </div>
    );
  }

  const handleProceedToCheckout = () => {
    if (currentUser && currentUser.isAnonymous) {
        setAlertInfo({message: "Please log in or sign up to proceed to checkout.", type: "info"});
        // Optionally, navigate to login page after a delay or provide a button in the alert
        setTimeout(() => {
            setAlertInfo({ message: '', type: '' }); // Clear alert before navigating
            navigateTo('login');
        }, 3000);
        return;
    }
    navigateTo('checkout');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {alertInfo.message && <CustomAlert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo({ message: '', type: ''})} />}
      
      {cartItems.length > 0 && (
        <>
          <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center sm:text-left">Your Shopping Cart</h2>
          <div className="bg-white shadow-xl rounded-xl p-6 sm:p-8">
            {cartItems.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between py-5 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center mb-4 sm:mb-0 w-full sm:w-auto">
                  <img 
                    src={item.imageUrl || `https://placehold.co/96x96/a2e6a2/333333?text=${encodeURIComponent(item.name)}`} 
                    alt={item.name} 
                    className="w-24 h-24 object-cover rounded-lg mr-5 shadow-sm" 
                    onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/96x96/cccccc/333333?text=Img`; }}
                  />
                  <div className="flex-grow">
                    <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500">{formatPrice(item.price)} each</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <input
                    type="number"
                    min="1"
                    max={item.stock} 
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                    className="w-20 p-2 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    aria-label={`Quantity for ${item.name}`}
                  />
                  <p className="text-md font-semibold text-gray-700 w-24 text-right">{formatPrice(item.price * item.quantity)}</p>
                  <button 
                    onClick={() => removeFromCart(item.id)} 
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors" 
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <RemoveItemIcon />
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Subtotal:</h3>
                <p className="text-2xl font-bold text-green-600">{formatPrice(cartTotal)}</p>
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <button 
                    onClick={() => setShowClearConfirm(true)} 
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                    Clear Cart
                </button>
                <button 
                    onClick={handleProceedToCheckout}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                    Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <Modal isOpen={showClearConfirm} onClose={() => setShowClearConfirm(false)} title="Confirm Clear Cart" size="sm">
          <p className="text-gray-600 mb-6">Are you sure you want to remove all items from your cart?</p>
          <div className="flex justify-end space-x-3">
              <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg shadow-sm transition-colors">Cancel</button>
              <button 
                onClick={() => { 
                    clearCart(); 
                    setShowClearConfirm(false); 
                    setAlertInfo({message: 'Cart cleared!', type: 'info'});
                }} 
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-sm transition-colors"
              >
                Clear Cart
              </button>
          </div>
      </Modal>
    </div>
  );
}

export default CartPage;