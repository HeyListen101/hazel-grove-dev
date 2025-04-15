'use client';

import React, { useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";

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
  price: string; // Added price field for display
}

interface ProductCardProps {
  storeid: string;
  currentPage?: number;
  itemsPerPage?: number;
  onTotalPagesChange?: (totalPages: number) => void;
  showPagination?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  storeid, 
  currentPage = 1, 
  itemsPerPage = 5,
  onTotalPagesChange,
  showPagination = true
}) => {
    const supabase = createClient();
    const [products, setProducts] = React.useState<Product[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [totalPages, setTotalPages] = React.useState(1);

    // Fetch products from Supabase
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        console.log('Fetching store with ID:', storeid);
        
        // Get total count for pagination
        const { count } = await supabase
          .from('product')
          .select('*', { count: 'exact', head: true })
          .eq('store', storeid);
          
        if (count !== null) {
          const pages = Math.ceil(count / itemsPerPage);
          setTotalPages(pages);
          // Notify parent component about total pages
          if (onTotalPagesChange) {
            onTotalPagesChange(pages);
          }
        }
        
        // Calculate pagination range
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        
        // Get products for the selected store with pagination
        const { data: storeProducts, error: productError } = await supabase
          .from('product')
          .select('productid, store, productstatus(productstatusid), contributor, brand, name, isarchived, price')
          .eq('store', storeid)
          .range(from, to);

        // #TODO: Fix the product retrieval 
        if (storeProducts) {
          // More robust handling of product data
          const processedProducts = storeProducts.map(product => {
            // Handle nested productstatus object if it exists
            const processedProduct = {
              ...product,
              // Ensure price is a string and has a default value
              price: typeof product.price === 'string' ? product.price : 
                     typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : 'N/A',
              // Handle productstatus which might be an object
              productstatus: typeof product.productstatus === 'object' ? 
                            product.productstatus?.productstatusid || '' : 
                            product.productstatus || ''
            };
            return processedProduct;
          });
          setProducts(processedProducts);
        }
        
        if (productError) {
          console.error('Product Error:', productError);
          setError('Failed to load products');
        }

      } catch (error) {
        console.log('Error fetching products:', error);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (storeid) {
      fetchProducts();
    }
  }, [storeid, currentPage, itemsPerPage]);

  if (loading && products.length === 0) {
    return (
      <div className="cursor-pointer" style={{ borderRadius: '9px', overflow: 'hidden' }}>
        <div className="bg-white text-emerald-700 p-4">
          <p className="text-center">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cursor-pointer" style={{ borderRadius: '9px', overflow: 'hidden' }}>
        <div className="bg-white text-red-500 p-4">
          <p className="text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="cursor-pointer"
      style={{
        borderRadius: '9px',
        overflow: 'hidden',
      }}
    >
      {/* Products Section */}
      <div className="bg-white p-4">
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
              products.map((product) => (
                <div key={product.productid} className="flex justify-between">
                  <span className="text-gray-800 text-lg">{product.name}</span>
                  <span className="text-gray-800 text-lg">{product.price}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                No products found
              </div>
            )}
          </div>
        </div>

        {/* Only show pagination controls if showPagination is true */}
        {showPagination && (
          <div className="flex justify-between text-gray-500">
            <button 
              className="flex items-center" 
              onClick={() => currentPage > 1 && onTotalPagesChange && onTotalPagesChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <span className="mr-2">◄</span> Prev
            </button>
            <button 
              className="flex items-center"
              onClick={() => currentPage < totalPages && onTotalPagesChange && onTotalPagesChange(currentPage + 1)}
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