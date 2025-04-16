'use client';

import React from 'react';

// Define the Product interface
interface Product {
  productid: string;
  store: string;
  productstatus: string;
  contributor: string;
  brand: string;
  name: string;
  datecreated: string;
  isarchived: boolean;
  price: string | number;
  description?: string;
}

interface ProductCardProps {
  products: Product[];
  totalProducts: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  products,
  totalProducts,
  currentPage = 1, 
  totalPages = 1,
  onPageChange,
  showPagination = true
}) => {
  
  // Format price for display
  const formatPrice = (price: string | number | any): string => {
    // Handle null or undefined
    if (price === null || price === undefined) {
      return 'N/A';
    }
    
    // Handle number type
    if (typeof price === 'number') {
      return `$${price.toFixed(2)}`;
    } 
    
    // Handle string type
    if (typeof price === 'string') {
      // If it's already a string but doesn't have a $ prefix, add it
      if (price.trim() !== 'N/A' && !price.startsWith('$')) {
        const numPrice = parseFloat(price);
        return isNaN(numPrice) ? price : `$${numPrice.toFixed(2)}`;
      }
      return price;
    }
    
    // Handle object type (in case price is an object with a value property)
    if (typeof price === 'object') {
      // Try to access common properties that might contain the price value
      if ('value' in price && price.value !== null && price.value !== undefined) {
        return formatPrice(price.value);
      }
      if ('amount' in price && price.amount !== null && price.amount !== undefined) {
        return formatPrice(price.amount);
      }
      // If we can't find a specific property, try to stringify the object
      try {
        const priceStr = JSON.stringify(price);
        return priceStr !== '{}' ? priceStr : 'N/A';
      } catch (e) {
        return 'N/A';
      }
    }
    
    // Default fallback
    return 'N/A';
  };

  // Handle pagination
  const handlePrevPage = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div 
      className="w-full"
      style={{
        borderRadius: '9px',
        overflow: 'hidden',
      }}
    >
      {/* Products Section */}
      <div className="bg-white">
        <h2 className="text-emerald-700 text-2xl font-bold mb-4 border-b border-gray-200 pb-2">Products</h2>
          
        {/* Product Table */}
        <div className="mb-4">
          <div className="flex justify-between mb-4">
            <span className="text-emerald-700 text-xl font-bold">Name</span>
            <span className="text-emerald-700 text-xl font-bold">Price</span>
          </div>
            
            {/* Product Items */}
            <div className="space-y-3">
            {products.length > 0 ? (
              products.map((product) => {
                console.log(`Rendering product ${product.name}:`, product);
                const formattedPrice = formatPrice(product.price);
                console.log(`Formatted price for ${product.name}:`, formattedPrice);
                
                return (
                  <div 
                    key={product.productid} 
                    className="flex justify-between p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-gray-800 text-lg font-medium">{product.name}</span>
                      {product.description && (
                        <span className="text-gray-500 text-sm mt-1">{product.description}</span>
                      )}
                    </div>
                    <span className="text-gray-800 text-lg font-semibold">{formattedPrice}</span>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>No products found</p>
                <p className="text-sm mt-2">Products added to this store will appear here</p>
              </div>
            )}
            </div>
        </div>

        {/* Only show pagination controls if showPagination is true */}
        {showPagination && (
          <div className="flex justify-between text-gray-500 mt-4">
            <button 
              className={`flex items-center ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-emerald-700 hover:text-emerald-900'}`}
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <span className="mr-2">◄</span> Prev
            </button>
            <span className="text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              className={`flex items-center ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-emerald-700 hover:text-emerald-900'}`}
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next <span className="ml-2">►</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;