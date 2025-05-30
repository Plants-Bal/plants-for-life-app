import React, { useState, useEffect, useContext } from 'react';
import { doc, collection, query, orderBy, onSnapshot, writeBatch, serverTimestamp } from 'firebase/firestore';

// Assume contexts, db, appId, helpers, components, and constants are imported
// e.g., import { AuthContext } from '../contexts/AuthContext';
// e.g., import { db, appId } from '../firebase';
// e.g., import Modal from '../components/Modal';
// e.g., import CustomAlert from '../components/CustomAlert';
// e.g., import { ErrorIcon } from '../components/Icons';
// e.g., import { formatDate, formatPrice } from '../utils/helpers';
// e.g., import { ORDER_STATUSES } from '../constants';

import { AuthContext } from './AuthContext'; // Adjust path as needed
import Modal from './Modal'; // Adjust path as needed
import CustomAlert from './CustomAlert'; // Adjust path as needed
import { ErrorIcon } from './Icons'; // Adjust path as needed
import { db, appId } from './firebase'; // Assuming firebase.js exports db and appId
import { formatDate, formatPrice } from './helpers'; // Assuming helpers.js
import { ORDER_STATUSES } from './constants'; // Assuming constants.js

function AdminManageOrdersPage() {
    const { isAdmin, currentUser } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null); // Order object being edited
    const [newStatus, setNewStatus] = useState(''); // For the status dropdown in modal
    const [trackingNo, setTrackingNo] = useState(''); // For the tracking number input in modal
    const [alertInfo, setAlertInfo] = useState({ message: '', type: '' });

    useEffect(() => {
        if (!isAdmin || (currentUser && currentUser.isAnonymous)) {
            setIsLoading(false);
            setError("Access Denied. You must be a logged-in admin to view this page.");
            return;
        }

        // Path to the public collection of all orders
        const allOrdersPath = `artifacts/${appId}/public/data/allOrders`;
        const q = query(collection(db, allOrdersPath), orderBy("orderDate", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedOrders = snapshot.docs.map(doc => ({ 
                id: doc.id, // This is the orderId
                ...doc.data() 
            }));
            setOrders(fetchedOrders);
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching all orders:", err);
            setError("Failed to fetch orders. Please try again later.");
            setIsLoading(false);
        });

        return () => unsubscribe(); // Cleanup listener on component unmount
    }, [isAdmin, currentUser, appId]);

    const handleOpenEditModal = (order) => {
        setEditingOrder(order);
        setNewStatus(order.status); // Pre-fill with current status
        setTrackingNo(order.trackingNumber || ''); // Pre-fill with current tracking number
    };

    const handleUpdateOrderStatus = async () => {
        if (!editingOrder || !newStatus) {
            setAlertInfo({message: "No order selected or new status is empty.", type: 'error'});
            return;
        }
        
        // References to both the user's private order and the public admin copy
        const userOrderRef = doc(db, `artifacts/${appId}/users/${editingOrder.userId}/orders`, editingOrder.id);
        const adminOrderRef = doc(db, `artifacts/${appId}/public/data/allOrders`, editingOrder.id);
        
        const updateData = { 
            status: newStatus, 
            lastUpdated: serverTimestamp(),
            trackingNumber: trackingNo.trim() // Save trimmed tracking number
        };

        try {
            const batch = writeBatch(db);
            batch.update(userOrderRef, updateData);
            batch.update(adminOrderRef, updateData);
            await batch.commit();
            
            setAlertInfo({message: `Order ${editingOrder.orderNumber} status updated to ${newStatus}.`, type: 'success'});
            setEditingOrder(null); // Close modal
        } catch (err) {
            console.error("Error updating order status:", err);
            setAlertInfo({message: `Failed to update order: ${err.message}`, type: 'error'});
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-700 mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600">Loading orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <ErrorIcon /> {/* Ensure ErrorIcon is styled or wrapped for size */}
                <h2 className="text-2xl font-semibold text-gray-700 mb-3">Error</h2>
                <p className="text-gray-600">{error}</p>
            </div>
        );
    }
    
    // This check is redundant if useEffect already sets an error, but good for clarity
    if (!isAdmin || (currentUser && currentUser.isAnonymous)) {
         return (
            <div className="container mx-auto px-4 py-16 text-center">
                <ErrorIcon />
                <h2 className="text-2xl font-semibold text-gray-700 mb-3">Access Denied</h2>
                <p className="text-gray-600">You must be logged in with an admin account to view this page.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {alertInfo.message && <CustomAlert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo({ message: '', type: ''})} />}
            <h2 className="text-3xl font-semibold text-gray-800 mb-8">Manage All Orders</h2>
            
            {orders.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                    <p className="text-xl text-gray-600">No orders found.</p>
                </div>
            ) : (
                <div className="bg-white shadow-xl rounded-xl overflow-x-auto">
                    <table className="w-full min-w-full table-auto">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Order #</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Customer</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">User ID</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Tracking #</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{order.orderNumber}</td>
                                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.orderDate)}</td>
                                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{order.customerInfo?.name || 'N/A'}</td>
                                    <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-500" title={order.userId}>{order.userId ? order.userId.substring(0,10)+'...' : 'N/A'}</td>
                                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{formatPrice(order.totalAmount)}</td>
                                    <td className="px-5 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                                              order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                                              ON_DELIVERY_STATUSES.includes(order.status) ? 'bg-blue-100 text-blue-800' :
                                              'bg-yellow-100 text-yellow-800'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">{order.trackingNumber || 'N/A'}</td>
                                    <td className="px-5 py-4 whitespace-nowrap text-sm font-medium">
                                        <button 
                                            onClick={() => handleOpenEditModal(order)} 
                                            className="text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors"
                                        >
                                            Edit Status
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            <Modal 
                isOpen={!!editingOrder} 
                onClose={() => setEditingOrder(null)} 
                title={`Update Order: ${editingOrder?.orderNumber}`} 
                size="md"
            >
                {editingOrder && (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="orderStatus" className="block text-sm font-medium text-gray-700">Order Status</label>
                            <select 
                                id="orderStatus" 
                                value={newStatus} 
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                {ORDER_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="trackingNo" className="block text-sm font-medium text-gray-700">Tracking Number (Optional)</label>
                            <input 
                                type="text" 
                                id="trackingNo" 
                                value={trackingNo} 
                                onChange={(e) => setTrackingNo(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                placeholder="Enter tracking number"
                            />
                        </div>
                        <div className="flex justify-end space-x-3 pt-3">
                            <button type="button" onClick={() => setEditingOrder(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm">Cancel</button>
                            <button 
                                type="button" 
                                onClick={handleUpdateOrderStatus} 
                                className="px-5 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm"
                            >
                                Update Status
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default AdminManageOrdersPage;