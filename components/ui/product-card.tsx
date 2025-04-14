'use client';

import React from 'react';
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
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  storeid, 
  currentPage = 1, 
  itemsPerPage = 5 
}) => {
    const supabase = createClient();
    const [products, setProducts] = React.useState<Product[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [page, setPage] = React.useState(currentPage);
    const [totalPages, setTotalPages] = React.useState(1);
    const [storeName, setStoreName] = React.useState('Store');
    const [isOpen, setIsOpen] = React.useState(true);

    // Fetch products from Supabase
    const fetchProducts = async () => {
    try {
        setLoading(true);
        
        console.log('Fetching store with ID:', storeid);
        // Get products for the selected store
        const { data: storeProducts, error: productError } = await supabase
            .from('product')
            .select('productid, store, productstatus(productstatusid), contributor, brand, name, isarchived')
            .eq('store', storeid)

        console.log('Store Products:', storeProducts);
        console.log('Product Error:', productError);    

        } catch (error) {
            console.log('Error fetching products:', error);
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

  React.useEffect(() => {
    fetchProducts();
  }, [storeid, page, itemsPerPage]);


  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="cursor-pointer" style={{ borderRadius: '9px', overflow: 'hidden' }}>
        <div className="bg-emerald-700 text-white p-4">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stores-container cursor-pointer" style={{ borderRadius: '9px', overflow: 'hidden' }}>
        <div className="bg-emerald-700 text-white p-4">
          <p className="text-center text-red-300">{error}</p>
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
    <div className="mb-8">
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
        ))) 
        : 
        (
        <div className="text-center text-gray-500 py-4">
            No products found
        </div>
        )}
        </div>
    </div>

    {/* Navigation */}  
    <div className="flex justify-between text-gray-500">
        <button 
        className="flex items-center" 
        onClick={handlePrevPage}
        disabled={page === 1}
        >
            <span className="mr-2">◄</span> Prev
        </button>
        <button 
        className="flex items-center"
        onClick={handleNextPage}
        disabled={page === totalPages}
        >
        Next 
            <span className="ml-2">►</span>
        </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;