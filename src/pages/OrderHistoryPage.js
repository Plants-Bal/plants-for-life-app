import React, { useState, useEffect, useContext, useMemo } from 'react';
import { doc, collection, query, orderBy, onSnapshot, writeBatch, serverTimestamp } from 'firebase/firestore';

// Assume contexts, db, appId, helpers, and components are imported
// e.g., import { AuthContext } from '../contexts/AuthContext';
// e.g., import { NavigationContext } from '../contexts/NavigationContext';
// e.g., import { db, appId } from '../firebase';
// e.g., import { formatDate, formatPrice } from '../utils/helpers';
// e.g., import Modal from '../components/Modal';
// e.g., import CustomAlert from '../components/CustomAlert';
// e.g., import { InfoIcon } from '../components/Icons';
// e.g., import { ORDER_STATUSES, ON_DELIVERY_STATUSES, RECEIVED_STATUSES, CANCELLED_STATUSES } from '../constants';

import { AuthContext } from './AuthContext'; // Adjust path as needed
import { NavigationContext } from './NavigationContext'; // Adjust path as needed
import Modal from './Modal'; // Adjust path as needed
import CustomAlert from './CustomAlert'; // Adjust path as needed
import { db, appId } from './firebase'; // Assuming firebase.js exports db and appId
import { formatDate, formatPrice } from './helpers'; // Assuming helpers.js
import { InfoIcon } from './Icons'; // Assuming Icons.js for InfoIcon for empty/login states
import { ORDER_STATUSES, ON_DELIVERY_STATUSES, RECEIVED_STATUSES, CANCELLED_STATUSES } from './constants'; // Assuming constants.js

function OrderHistoryPage() {
    const { userId, currentUser } = useContext(AuthContext);
    const { navigateTo } = useContext(NavigationContext); 
    const [orders, setOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null); // For viewing order details in a modal
    const [orderToCancel, setOrderToCancel] = useState(null); // For cancel confirmation modal
    const [alertInfo, setAlertInfo] = useState({ message: '', type: '' });
    const [activeTab, setActiveTab] = useState('onDelivery'); // 'onDelivery', 'received', 'cancelled'

    useEffect(() => {
        if (!userId || (currentUser && currentUser.isAnonymous)) {
            setIsLoadingOrders(false);
            if (!currentUser || currentUser.isAnonymous) { // Ensure redirect only if truly not logged in
                navigateTo('login');
            }
            return;
        }

        const ordersPath = `artifacts/${appId}/users/${userId}/orders`;
        const q = query(collection(db, ordersPath), orderBy("orderDate", "desc"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOrders(fetchedOrders);
            setIsLoadingOrders(false);
        }, (error) => {
            console.error("Error fetching orders:", error);
            setAlertInfo({message: `Error fetching orders: ${error.message}`, type: 'error'});
            setIsLoadingOrders(false);
        });

        return () => unsubscribe();
    }, [userId, currentUser, navigateTo, appId]);

    const handleCancelOrder = async () => {
        if (!orderToCancel || !userId) {
            setAlertInfo({message: 'Could not cancel order. Order or User ID missing.', type: 'error'});
            setOrderToCancel(null);
            return;
        }
        
        const userOrderRef = doc(db, `artifacts/${appId}/users/${userId}/orders`, orderToCancel.id);
        const adminOrderRef = doc(db, `artifacts/${appId}/public/data/allOrders`, orderToCancel.id);
        
        const updateData = { 
            status: "Cancelled", 
            lastUpdated: serverTimestamp()
        };

        try {
            const batch = writeBatch(db);
            batch.update(userOrderRef, updateData);
            batch.update(adminOrderRef, updateData); // Also update the public record
            await batch.commit();
            
            setAlertInfo({message: `Order ${orderToCancel.orderNumber} has been cancelled.`, type: 'success'});
        } catch (err) {
            console.error("Error cancelling order:", err);
            setAlertInfo({message: `Failed to cancel order: ${err.message}`, type: 'error'});
        } finally {
            setOrderToCancel(null); // Close modal
        }
    };

    const getStatusColor = (status) => {
        if (status === "Delivered") return "text-green-600 bg-green-100";
        if (status === "Shipped" || status === "Out for Delivery") return "text-blue-600 bg-blue-100";
        if (status === "Processing") return "text-yellow-600 bg-yellow-100";
        if (status === "Cancelled") return "text-red-600 bg-red-100";
        return "text-gray-600 bg-gray-100"; // Default for "Order Placed"
    };
    
    const StatusTracker = ({ currentStatus }) => {
        const currentStatusIndex = ORDER_STATUSES.indexOf(currentStatus);
        // If status is "Cancelled", it's a final state, don't show other steps as active.
        const isCancelled = currentStatus === "Cancelled";

        return (
            <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2">
                {ORDER_STATUSES.map((status, index) => {
                    if (status === "Cancelled" && !isCancelled) return null; // Don't show cancel step unless it is cancelled
                    if (isCancelled && status !== "Cancelled") return null; // If cancelled, only show the cancelled step

                    const isActive = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    
                    let colorClass = "bg-gray-300"; // Default for future steps
                    if (isCancelled) {
                        colorClass = "bg-red-500";
                    } else if (isActive) {
                        colorClass = "bg-green-500"; // Active/completed steps
                    }

                    return (
                        <div key={status} className="flex flex-col items-center min-w-[70px] sm:min-w-[90px]">
                            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${colorClass} mb-1 transition-colors`}></div>
                            <p className={`text-xs text-center ${
                                isCancelled ? 'font-semibold text-red-700' : 
                                (isCurrent || isActive) ? 'font-semibold text-gray-700' : 'text-gray-500'
                            }`}>
                                {status}
                            </p>
                        </div>
                    );
                })}
            </div>
        );
    };

    const filteredOrders = useMemo(() => {
        if (activeTab === 'onDelivery') return orders.filter(order => ON_DELIVERY_STATUSES.includes(order.status));
        if (activeTab === 'received') return orders.filter(order => RECEIVED_STATUSES.includes(order.status));
        if (activeTab === 'cancelled') return orders.filter(order => CANCELLED_STATUSES.includes(order.status));
        return orders; // Should not happen if a tab is always active
    }, [orders, activeTab]);

    const TabButton = ({ tabName, currentTab, children }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-t-md focus:outline-none whitespace-nowrap
                        ${currentTab === tabName 
                            ? 'border-b-2 border-green-500 text-green-600 bg-white shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
            {children}
        </button>
    );

    if (isLoadingOrders) { 
        return <div className="text-center py-20"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto"></div><p className="mt-4 text-lg text-gray-600">Loading your orders...</p></div>; 
    }

    if (!currentUser || currentUser.isAnonymous) { 
        return ( <div className="container mx-auto px-4 py-16 text-center"> <InfoIcon className="h-16 w-16 text-blue-400 mx-auto mb-4"/> <h2 className="text-2xl font-semibold text-gray-700 mb-3">Please Log In</h2> <p className="text-gray-600 mb-6">Log in to view your order history.</p> <button onClick={() => navigateTo('login')} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md"> Go to Login </button> </div> ); 
    }
    
    return ( 
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {alertInfo.message && <CustomAlert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo({ message: '', type: ''})} />}
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">My Orders</h2> 
        
        <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-2 sm:space-x-4" aria-label="Tabs">
                <TabButton tabName="onDelivery" currentTab={activeTab}>On Delivery</TabButton>
                <TabButton tabName="received" currentTab={activeTab}>Received</TabButton>
                <TabButton tabName="cancelled" currentTab={activeTab}>Cancelled</TabButton>
            </nav>
        </div>

        {filteredOrders.length === 0 ? (
             <div className="text-center py-10 bg-white rounded-xl shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                <p className="text-xl text-gray-600">No orders in this category yet.</p>
                {orders.length === 0 && ( // Show this only if there are truly no orders at all
                     <button onClick={() => navigateTo('products')} className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm">
                        Start Shopping
                    </button>
                )}
            </div>
        ) : (
            <div className="space-y-6"> 
                {filteredOrders.map(order => {
                    const canCancel = (order.status === "Order Placed" || order.status === "Processing");
                    return (
                    <div key={order.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"> 
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3"> 
                            <div> <p className="text-sm text-gray-500">Order ID: <span className="font-medium text-gray-700">{order.orderNumber}</span></p> <p className="text-sm text-gray-500">Date: <span className="font-medium text-gray-700">{formatDate(order.orderDate)}</span></p> </div> 
                            <p className={`text-sm font-semibold px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>{order.status}</p> 
                        </div> 
                        {order.status !== "Cancelled" && <div className="mb-4"> <h4 className="text-sm font-medium text-gray-600 mb-1">Delivery Progress:</h4> <StatusTracker currentStatus={order.status} /> </div> }
                        <div className="mb-3"> <p className="text-lg font-semibold text-green-600">Total: {formatPrice(order.totalAmount)}</p> </div> 
                        <div className="flex flex-wrap gap-2 items-center"> <button onClick={() => setSelectedOrder(order)} className="text-sm text-green-600 hover:text-green-700 font-medium py-1 px-3 rounded-md hover:bg-green-50 transition-colors"> View Details </button> {canCancel && activeTab === 'onDelivery' && ( <button onClick={() => setOrderToCancel(order)} className="text-sm text-red-600 hover:text-red-700 font-medium py-1 px-3 rounded-md hover:bg-red-50 transition-colors" > Cancel Order </button> )} </div> 
                        {order.trackingNumber && (order.status === "Shipped" || order.status === "Out for Delivery") && ( <p className="text-xs text-gray-500 mt-2">Tracking #: <span className="font-medium">{order.trackingNumber}</span></p> )} 
                    </div>
                )})} 
            </div> 
        )}
        <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order Details: ${selectedOrder?.orderNumber}`} size="lg"> {selectedOrder && ( <div className="space-y-4"> <p><strong>Status:</strong> <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span></p> <p><strong>Date:</strong> {formatDate(selectedOrder.orderDate)}</p> <p><strong>Last Updated:</strong> {formatDate(selectedOrder.lastUpdated)}</p> <p><strong>Total Amount:</strong> {formatPrice(selectedOrder.totalAmount)}</p> <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p> <div className="mt-3 pt-3 border-t"> <h4 className="font-semibold mb-2 text-gray-700">Items:</h4> {selectedOrder.items.map(item => ( <div key={item.id} className="flex justify-between items-center py-1 text-sm"> <span>{item.name} (x{item.quantity})</span> <span>{formatPrice(item.price * item.quantity)}</span> </div> ))} </div> <div className="mt-3 pt-3 border-t"> <h4 className="font-semibold mb-1 text-gray-700">Shipping Address:</h4> <p className="text-sm text-gray-600">{selectedOrder.customerInfo.name}</p> <p className="text-sm text-gray-600">{selectedOrder.customerInfo.address}</p> <p className="text-sm text-gray-600">{selectedOrder.customerInfo.phoneNumber}</p> </div> {selectedOrder.trackingNumber && ( <p className="text-sm mt-2"><strong>Tracking Number:</strong> {selectedOrder.trackingNumber}</p> )} </div> )} </Modal> 
        <Modal isOpen={!!orderToCancel} onClose={() => setOrderToCancel(null)} title="Confirm Cancel Order" size="md"> {orderToCancel && ( <div> <p className="text-gray-700 mb-2">Are you sure you want to cancel order <strong className="font-medium">{orderToCancel.orderNumber}</strong>?</p> <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p> <div className="flex justify-end space-x-3"> <button onClick={() => setOrderToCancel(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg shadow-sm">Keep Order</button> <button onClick={handleCancelOrder} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm">Yes, Cancel Order</button> </div> </div> )} </Modal> 
    </div> 
    );
}

export default OrderHistoryPage;

// Helper function for getStatusColor and StatusTracker logic in case they are defined outside
// For now, they are defined within OrderHistoryPage as they are specific to its rendering needs.