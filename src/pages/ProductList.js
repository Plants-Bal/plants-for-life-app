import React, { useState, useEffect, useContext, useMemo } from 'react';

// Assume ProductContext and ProductCard are defined in their own files and imported
// e.g., import { ProductContext } from '../contexts/ProductContext';
// e.g., import ProductCard from '../components/ProductCard';
// For this example, we'll use the existing direct context imports for ProductContext
// and assume ProductCard is also imported.

import { ProductContext } from './ProductContext'; // Adjust path as needed
import ProductCard from './ProductCard';           // Adjust path as needed

function ProductList() {
  const { products, isLoadingProducts } = useContext(ProductContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('name_asc'); // name_asc, name_desc, price_asc, price_desc
  const [filterCategory, setFilterCategory] = useState('all'); // all, seeds, plants

  const filteredAndSortedProducts = useMemo(() => {
    let tempProducts = [...products];

    // Filter by category
    if (filterCategory !== 'all') {
      tempProducts = tempProducts.filter(p => p.category === filterCategory);
    }

    // Filter by search term
    if (searchTerm) {
      tempProducts = tempProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    switch (sortOption) {
      case 'name_asc':
        tempProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        tempProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price_asc':
        tempProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        tempProducts.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }
    return tempProducts;
  }, [products, searchTerm, sortOption, filterCategory]);

  if (isLoadingProducts) {
    return (
        <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading products...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 p-6 bg-white rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 items-end">
          <input
            type="text"
            placeholder="Search products..."
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent col-span-1 md:col-span-1 transition-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search products"
          />
          <select
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow bg-white"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            aria-label="Sort products by"
          >
            <option value="name_asc">Sort: Name (A-Z)</option>
            <option value="name_desc">Sort: Name (Z-A)</option>
            <option value="price_asc">Sort: Price (Low-High)</option>
            <option value="price_desc">Sort: Price (High-Low)</option>
          </select>
          <select
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow bg-white"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            aria-label="Filter products by category"
          >
            <option value="all">Category: All</option>
            <option value="seeds">Category: Seeds</option>
            <option value="plants">Category: Plants</option>
          </select>
        </div>
      </div>

      {filteredAndSortedProducts.length === 0 ? (
         <div className="text-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10l4.545-4.545" />
            </svg>
            <p className="text-2xl text-gray-700 font-semibold">No products found.</p>
            <p className="text-md text-gray-500 mt-2">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredAndSortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductList;