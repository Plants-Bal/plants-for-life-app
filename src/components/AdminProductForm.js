import React, { useState, useEffect } from 'react';

// This component does not directly use contexts, it receives data and callbacks via props.

function AdminProductForm({ productToEdit, onFormSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('seeds'); // Default category
  const [imageUrl, setImageUrl] = useState('');
  const [stock, setStock] = useState(0); // Default stock
  const [formError, setFormError] = useState('');

  // Effect to pre-fill form when 'productToEdit' prop changes (for editing)
  // or reset form when 'productToEdit' is null (for adding)
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setDescription(productToEdit.description || '');
      setPrice(productToEdit.price?.toString() || ''); // Ensure price is a string for input
      setCategory(productToEdit.category || 'seeds');
      setImageUrl(productToEdit.imageUrl || '');
      setStock(productToEdit.stock !== undefined ? productToEdit.stock : 0);
      setFormError(''); // Clear any previous errors when loading a product to edit
    } else {
      // Reset form for new product
      setName('');
      setDescription('');
      setPrice('');
      setCategory('seeds');
      setImageUrl('');
      setStock(0);
      setFormError('');
    }
  }, [productToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(''); // Clear previous errors

    // Basic Validation
    if (!name.trim() || !description.trim() || !price.trim() || !category.trim() || !imageUrl.trim()) {
        setFormError('All fields except stock (if allowing 0) are required.');
        return;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
        setFormError('Price must be a positive number.');
        return;
    }
    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
        setFormError('Stock must be a non-negative integer.');
        return;
    }

    // Call the onFormSubmit prop with the product data
    onFormSubmit({
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      category: category,
      imageUrl: imageUrl.trim(),
      stock: parsedStock
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-1"> {/* Reduced padding if used in modal */}
      {formError && (
        <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm mb-4">
            {formError}
        </div>
      )}
      <div>
        <label htmlFor="admin-product-name" className="block text-sm font-medium text-gray-700">Name</label>
        <input 
            type="text" 
            id="admin-product-name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
        />
      </div>
      <div>
        <label htmlFor="admin-product-description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea 
            id="admin-product-description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required 
            rows="3" 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
        ></textarea>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label htmlFor="admin-product-price" className="block text-sm font-medium text-gray-700">Price (₱)</label>
            <input 
                type="number" 
                id="admin-product-price" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                required 
                min="0.01" 
                step="0.01" 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
            />
        </div>
        <div>
            <label htmlFor="admin-product-stock" className="block text-sm font-medium text-gray-700">Stock</label>
            <input 
                type="number" 
                id="admin-product-stock" 
                value={stock} 
                onChange={(e) => setStock(e.target.value)} 
                required 
                min="0" 
                step="1" 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
            />
        </div>
      </div>
      <div>
        <label htmlFor="admin-product-category" className="block text-sm font-medium text-gray-700">Category</label>
        <select 
            id="admin-product-category" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
            required 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
        >
          <option value="seeds">Seeds</option>
          <option value="plants">Plants</option>
        </select>
      </div>
      <div>
        <label htmlFor="admin-product-imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
        <input 
            type="url" 
            id="admin-product-imageUrl" 
            value={imageUrl} 
            onChange={(e) => setImageUrl(e.target.value)} 
            required 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
        />
        {imageUrl && (
            <img 
                src={imageUrl} 
                alt="Preview" 
                className="mt-2 h-20 w-20 object-cover rounded-md border border-gray-200" 
                onError={(e) => e.target.style.display='none'} // Hide if image fails to load
                onLoad={(e) => e.target.style.display='block'}  // Show if image loads successfully
            />
        )}
      </div>
      <div className="flex justify-end space-x-3 pt-3">
        {onCancel && (
            <button 
                type="button" 
                onClick={onCancel} 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm transition-colors"
            >
                Cancel
            </button>
        )}
        <button 
            type="submit" 
            className="px-5 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          {productToEdit ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  );
}

export default AdminProductForm;