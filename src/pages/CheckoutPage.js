import React, { useState, useEffect, useContext } from 'react';
import { doc, collection, addDoc, getDoc, writeBatch, serverTimestamp, setDoc } from 'firebase/firestore'; // Added setDoc

// Assume contexts, db, appId, helpers, and components are imported
// e.g., import { CartContext } from '../contexts/CartContext';
// e.g., import { AuthContext } from '../contexts/AuthContext';
// e.g., import { NavigationContext } from '../contexts/NavigationContext';
// e.g., import { ProductContext } from '../contexts/ProductContext';
// e.g., import { db, appId } from '../firebase'; // Or your firebase config file
// e.g., import { formatPrice, generateOrderNumber } from '../utils/helpers';
// e.g., import CustomAlert from '../components/CustomAlert';
// e.g., import { ORDER_STATUSES } from '../constants';

// For this isolated example, we'll use direct context imports and define some helpers/constants
// In a real app, these would be properly imported.
import { CartContext } from './CartContext';
import { AuthContext } from './AuthContext';
import { NavigationContext } from './NavigationContext';
import { ProductContext } from './ProductContext';
import CustomAlert from './CustomAlert'; // Assuming CustomAlert.js
import { db, appId } from './firebase'; // Assuming firebase.js exports db and appId
import { formatPrice, generateOrderNumber } from './helpers'; // Assuming helpers.js
import { ORDER_STATUSES } from './constants'; // Assuming constants.js

function CheckoutPage() {
    const { cartItems, cartTotal, clearCart } = useContext(CartContext);
    const { userId, currentUser } = useContext(AuthContext);
    const { navigateTo } = useContext(NavigationContext);
    const { updateStockAfterOrder } = useContext(ProductContext);

    // formData for user input, email is removed
    const [formData, setFormData] = useState({ name: '', address: '', phoneNumber: '' });
    const [formErrors, setFormErrors] = useState({});
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [alertInfo, setAlertInfo] = useState({ message: '', type: '' });

    // Effect to pre-fill form with user profile data
    useEffect(() => {
        if (currentUser && !currentUser.isAnonymous && userId) {
            const profilePath = `artifacts/${appId}/users/${userId}/profileData/profile`;
            const profileDocRef = doc(db, profilePath);
            getDoc(profileDocRef).then(docSnap => {
                if (docSnap.exists()) {
                    const fetchedProfile = docSnap.data();
                    setFormData(prev => ({
                        ...prev,
                        name: fetchedProfile.name || prev.name || currentUser.displayName || '',
                        address: fetchedProfile.address || prev.address,
                        phoneNumber: fetchedProfile.phoneNumber || prev.phoneNumber,
                    }));
                } else {
                    // If no profile, prefill name from auth if available
                    setFormData(prev => ({ ...prev, name: currentUser.displayName || '' }));
                }
            }).catch(error => {
                console.error("Error fetching user profile for checkout:", error);
                // Optionally set an alert for the user if fetching profile fails
            });
        }
    }, [currentUser, userId, appId]); // Dependencies for fetching profile

    // Effect to handle empty cart or anonymous user trying to checkout
    useEffect(() => {
        if ((cartItems.length === 0 && !isPlacingOrder && !alertInfo.message) || // Added !alertInfo.message to prevent redirect if success/error alert is showing
            (currentUser && currentUser.isAnonymous)) {
            if (currentUser && currentUser.isAnonymous) {
                setAlertInfo({ message: "Please log in or sign up to complete your order.", type: "info" });
                setTimeout(() => {
                    setAlertInfo({message: '', type: ''}); // Clear alert before navigating
                    navigateTo('login');
                }, 3000);
            } else if (cartItems.length === 0 && !isPlacingOrder && !alertInfo.message) {
                navigateTo('products');
            }
        }
    }, [cartItems, navigateTo, isPlacingOrder, currentUser, alertInfo.message]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = "Name is required.";
        if (!formData.address.trim()) errors.address = "Address is required.";
        if (!formData.phoneNumber.trim()) {
            errors.phoneNumber = "Phone number is required.";
        } else if (!/^\+?[0-9\s-()]{7,20}$/.test(formData.phoneNumber)) {
            errors.phoneNumber = "Invalid phone number format.";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) {
            setAlertInfo({ message: 'Please correct the errors in the form.', type: 'error' });
            return;
        }
        if (!userId || (currentUser && currentUser.isAnonymous)) {
            setAlertInfo({ message: 'You must be logged in to place an order.', type: 'error' });
            return;
        }

        setIsPlacingOrder(true);
        setAlertInfo({ message: '', type: '' }); // Clear previous alerts

        const orderId = doc(collection(db, `artifacts/${appId}/users/${userId}/orders`)).id; // Generate ID for the order
        const newOrderNumber = generateOrderNumber();

        const orderData = {
            orderId: orderId,
            orderNumber: newOrderNumber,
            customerInfo: { // Email is removed from customerInfo
                name: formData.name,
                address: formData.address,
                phoneNumber: formData.phoneNumber
            },
            items: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                imageUrl: item.imageUrl,
            })),
            totalAmount: cartTotal,
            paymentMethod: "Cash on Delivery",
            status: ORDER_STATUSES[0], // "Order Placed"
            orderDate: serverTimestamp(),
            lastUpdated: serverTimestamp(),
            userId: userId,
            trackingNumber: "" // Initialize tracking number
        };

        try {
            const batch = writeBatch(db);
            
            // Save to user's private orders collection (using the generated orderId)
            const userOrderRef = doc(db, `artifacts/${appId}/users/${userId}/orders`, orderId);
            batch.set(userOrderRef, orderData);

            // Save to public allOrders collection for admin (using the same orderId)
            const adminOrderRef = doc(db, `artifacts/${appId}/public/data/allOrders`, orderId);
            batch.set(adminOrderRef, orderData);
            
            await batch.commit();
            await updateStockAfterOrder(cartItems); // Update product stock

            clearCart();
            setAlertInfo({ message: `Order ${newOrderNumber} placed successfully! Thank you.`, type: 'success' });
            setTimeout(() => {
                setAlertInfo({message: '', type: ''}); // Clear alert before navigating
                navigateTo('my-orders'); 
            }, 4000);
        } catch (error) {
            console.error("Error placing order:", error);
            setAlertInfo({ message: `Failed to place order: ${error.message}. Please try again.`, type: 'error' });
        } finally {
            setIsPlacingOrder(false);
        }
    };

    // Show loading or empty cart message if cart is empty and no other alert is showing
    if (cartItems.length === 0 && !isPlacingOrder && !alertInfo.message) {
        return (
            <div className="text-center py-16 container mx-auto px-4">
                <h2 className="text-3xl font-semibold text-gray-700">Your cart is empty.</h2>
                <button onClick={() => navigateTo('products')} className="mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all">
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {alertInfo.message && <CustomAlert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo({ message: '', type: ''})} duration={alertInfo.type === 'success' || alertInfo.type === 'info' ? 4000 : 3000} />}
            
            <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Checkout</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Delivery Information Form */}
                <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-xl">
                    <h3 className="text-2xl font-medium text-gray-700 mb-6">Delivery Information</h3>
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:border-transparent ${formErrors.name ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-green-500'}`} />
                            {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Full Address (Street, Barangay, City, Province, ZIP)</label>
                            <textarea name="address" id="address" rows="3" value={formData.address} onChange={handleInputChange} className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:border-transparent ${formErrors.address ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-green-500'}`}></textarea>
                            {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                        </div>
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input type="tel" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:border-transparent ${formErrors.phoneNumber ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-green-500'}`} />
                            {formErrors.phoneNumber && <p className="text-red-500 text-xs mt-1">{formErrors.phoneNumber}</p>}
                        </div>
                        {/* Email field has been removed from the form */}
                    </form>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1 bg-gray-50 p-8 rounded-xl shadow-xl">
                    <h3 className="text-2xl font-medium text-gray-700 mb-6">Order Summary</h3>
                    {cartItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                            <div>
                                <p className="text-gray-800 font-medium">{item.name} <span className="text-xs text-gray-500">x{item.quantity}</span></p>
                                <p className="text-xs text-gray-500">{formatPrice(item.price)} each</p>
                            </div>
                            <p className="text-gray-800 font-semibold">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                    ))}
                    <div className="mt-6 pt-4 border-t-2 border-gray-300">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-lg text-gray-700">Subtotal:</p>
                            <p className="text-lg font-semibold text-gray-800">{formatPrice(cartTotal)}</p>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-lg text-gray-700">Shipping:</p>
                            <p className="text-lg font-semibold text-gray-800">FREE</p>
                        </div>
                         <div className="flex justify-between items-center mb-4">
                            <p className="text-lg text-gray-700">Payment Method:</p>
                            <p className="text-lg font-semibold text-green-600">Cash on Delivery</p>
                        </div>
                        <div className="flex justify-between items-center text-2xl font-bold text-green-600 mb-6">
                            <p>Total:</p>
                            <p>{formatPrice(cartTotal)}</p>
                        </div>
                        <button
                            onClick={handlePlaceOrder}
                            disabled={isPlacingOrder || cartItems.length === 0}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isPlacingOrder ? (
                                <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                                </>
                            ) : (
                                "Place Order (Cash on Delivery)"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;