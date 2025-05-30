import React, { useState, useEffect, useContext } from 'react';

// Assume contexts, components, helpers, and icons are imported
// e.g., import { ProductContext } from '../contexts/ProductContext';
// e.g., import { AuthContext } from '../contexts/AuthContext';
// e.g., import Modal from '../components/Modal';
// e.g., import CustomAlert from '../components/CustomAlert';
// e.g., import AdminProductForm from './AdminProductForm'; // Assuming it's in the same folder or components/
// e.g., import { ErrorIcon } from '../components/Icons';
// e.g., import { formatPrice } from '../utils/helpers';

import { ProductContext } from './ProductContext'; // Adjust path as needed
import { AuthContext } from './AuthContext';       // Adjust path as needed
import Modal from './Modal';                       // Adjust path as needed
import CustomAlert from './CustomAlert';           // Adjust path as needed
import AdminProductForm from './AdminProductForm'; // Adjust path as needed
import { ErrorIcon } from './Icons';               // Adjust path as needed
import { formatPrice } from './helpers';           // Adjust path as needed

function AdminPage() {
  const { products, addProduct, updateProduct, deleteProduct, isLoadingProducts } = useContext(ProductContext);
  const { isAdmin, isLoadingAuth, userId, currentUser } = useContext(AuthContext);
  
  const [editingProduct, setEditingProduct] = useState(null); // Holds the product object being edited, or null for adding
  const [showAddFormModal, setShowAddFormModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null); // Holds product object for delete confirmation
  const [alertInfo, setAlertInfo] = useState({ message: '', type: ''});

  const handleFormSubmit = async (productData) => {
    try {
        if (editingProduct) {
            await updateProduct(editingProduct.id, productData);
            setAlertInfo({ message: 'Product updated successfully!', type: 'success' });
        } else {
            await addProduct(productData);
            setAlertInfo({ message: 'Product added successfully!', type: 'success' });
        }
        setEditingProduct(null);
        setShowAddFormModal(false);
    } catch (error) {
        // Errors from addProduct/updateProduct are promise rejections with messages
        setAlertInfo({ message: error.toString(), type: 'error' });
    }
  };

  const handleEdit = (product) => { 
    setEditingProduct(product); 
    setShowAddFormModal(true); 
  };

  const handleAddNew = () => { 
    setEditingProduct(null); // Clear any editing state
    setShowAddFormModal(true);
  };

  const confirmDelete = (product) => { 
    setProductToDelete(product); 
  };

  const handleDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.id);
        setAlertInfo({ message: 'Product deleted successfully!', type: 'success' });
        setProductToDelete(null); // Close confirmation modal
      } catch(error) {
        setAlertInfo({ message: error.toString(), type: 'error' });
      }
    }
  };

  if (isLoadingAuth || isLoadingProducts) {
    return (
        <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-700 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading Admin Panel...</p>
        </div>
    );
  }

  // Ensure admin is logged in and not anonymous
  if (!isAdmin || (currentUser && currentUser.isAnonymous)) {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <ErrorIcon /> {/* Ensure ErrorIcon is correctly sized via its own classes or wrapped */}
            <h2 className="text-3xl font-semibold text-gray-800 mb-3">Access Denied</h2>
            <p className="text-gray-600 mb-2">You do not have permission to view this page. Please log in with an admin account.</p>
            <p className="text-sm text-gray-500">
                Your UID: <code className="bg-gray-200 p-1 rounded text-xs">{userId || "Not signed in"}</code>
                {currentUser && currentUser.isAnonymous && " (Anonymous)"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
                To enable admin access, ensure <code className="bg-gray-200 p-1 rounded text-xs">ADMIN_UID_PLACEHOLDER</code> in the code matches your logged-in User ID.
            </p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {alertInfo.message && <CustomAlert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo({ message: '', type: ''})} />}
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4 sm:mb-0">Admin - Manage Products</h2>
        <button
          onClick={handleAddNew}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          Add New Product
        </button>
      </div>

      <Modal 
        isOpen={showAddFormModal} 
        onClose={() => { setShowAddFormModal(false); setEditingProduct(null); }} 
        title={editingProduct ? 'Edit Product' : 'Add New Product'} 
        size="lg"
      >
        <AdminProductForm
            productToEdit={editingProduct}
            onFormSubmit={handleFormSubmit}
            onCancel={() => { setShowAddFormModal(false); setEditingProduct(null); }}
        />
      </Modal>

      <Modal 
        isOpen={!!productToDelete} 
        onClose={() => setProductToDelete(null)} 
        title="Confirm Delete Product" 
        size="sm"
      >
          <p className="text-gray-600 mb-2">Are you sure you want to delete: <strong className="font-medium">{productToDelete?.name}</strong>?</p>
          <p className="text-sm text-red-600 mb-6">This action cannot be undone.</p>
          <div className="flex justify-end space-x-3">
              <button onClick={() => setProductToDelete(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg shadow-sm transition-colors">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors">Delete Product</button>
          </div>
      </Modal>

      <div className="bg-white shadow-xl rounded-xl overflow-x-auto">
        <table className="w-full min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Image</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Category</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Price</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Stock</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length === 0 && !isLoadingProducts && (
                <tr><td colSpan="6" className="text-center py-10 text-gray-500 text-lg">No products available. Add some!</td></tr>
            )}
            {products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-5 py-4 whitespace-nowrap">
                  <img 
                    src={product.imageUrl || `https://placehold.co/56x56/a2e6a2/333333?text=${encodeURIComponent(product.name)}`} 
                    alt={product.name} 
                    className="w-14 h-14 object-cover rounded-lg shadow-sm" 
                    onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/56x56/cccccc/333333?text=Err`; }}
                  />
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">{product.description}</div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">{product.category}</td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">{formatPrice(product.price)}</td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">{product.stock}</td>
                <td className="px-5 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50 transition-colors">Edit</button>
                  <button onClick={() => confirmDelete(product)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPage;