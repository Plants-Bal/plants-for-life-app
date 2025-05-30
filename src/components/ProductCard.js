import React, { useState, useContext } from 'react';

// Assume CartContext, CustomAlert, and formatPrice are imported
// e.g., import { CartContext } from '../contexts/CartContext';
// e.g., import CustomAlert from './CustomAlert'; // If in the same components folder
// e.g., import { formatPrice } from '../utils/helpers';

import { CartContext } from './CartContext'; // Adjust path as needed
import CustomAlert from './CustomAlert';   // Adjust path as needed
import { formatPrice } from './helpers';   // Adjust path as needed

function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  const [alertInfo, setAlertInfo] = useState({ message: '', type: '' });

  const handleAddToCart = () => {
    if (product.stock <= 0) {
        setAlertInfo({ message: `${product.name} is out of stock.`, type: 'warning' });
        // Auto-hide alert after a few seconds
        setTimeout(() => setAlertInfo({ message: '', type: '' }), 3000);
        return;
    }
    addToCart(product); // Adds 1 unit by default
    setAlertInfo({ message: `${product.name} added to cart!`, type: 'success' });
    // Auto-hide alert after a few seconds
    setTimeout(() => setAlertInfo({ message: '', type: '' }), 2000);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col">
      <img 
        src={product.imageUrl || `https://placehold.co/300x200/a2e6a2/333333?text=${encodeURIComponent(product.name)}`} 
        alt={product.name} 
        className="w-full h-52 object-cover" // Standardized image height
        onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/300x200/cccccc/333333?text=Img+Error`; }}
      />
      <div className="p-5 flex flex-col flex-grow"> {/* Standardized padding */}
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-3 h-12 overflow-hidden line-clamp-2">{product.description}</p> {/* Ensures consistent description height */}
        <div className="text-xs text-gray-500 mb-1">
            Category: <span className="font-medium text-gray-700">{product.category}</span>
        </div>
        <div className="text-xs text-gray-500 mb-3">
            Stock: {product.stock > 0 ? 
                    <span className="font-medium text-green-600">{product.stock} available</span> : 
                    <span className="font-medium text-red-500">Out of stock</span>
                  }
        </div>
        <div className="mt-auto flex justify-between items-center"> {/* Pushes this block to the bottom */}
          <p className="text-xl font-bold text-green-600">{formatPrice(product.price)}</p>
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Add to Cart
          </button>
        </div>
      </div>
      {/* CustomAlert will be rendered by the main App component or a higher-level layout if needed globally,
          or if specific to card, it can be here. For item-specific feedback, keeping it here is fine. */}
      {alertInfo.message && (
        <CustomAlert 
            message={alertInfo.message} 
            type={alertInfo.type} 
            onClose={() => setAlertInfo({ message: '', type: ''})} 
            duration={alertInfo.type === 'success' ? 2000 : 3000}
        />
      )}
    </div>
  );
}

export default ProductCard;