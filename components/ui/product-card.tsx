'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "motion/react";


interface ProductCardProps {
  products: any[];
  totalProducts?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
  onAnimationComplete?: () => void; // Add this new prop
}

const ProductCard: React.FC<ProductCardProps> = ({
  products = [],
  currentPage = 1,
  onAnimationComplete, // Add this new prop
}) => {
  
  // Add state to track animation direction
  const [direction, setDirection] = useState(0);
  // Add state to track previous page for animation
  const [previousPage, setPreviousPage] = useState(currentPage);
  
  // Update direction when page changes
  useEffect(() => {
    if (currentPage > previousPage) {
      setDirection(1); // Next page (slide from right)
    } else if (currentPage < previousPage) {
      setDirection(-1); // Previous page (slide from left)
    }
    setPreviousPage(currentPage);
  }, [currentPage, previousPage]);

  useEffect(() => {
    // Clear any existing timers when products or page changes
    let animationTimer: NodeJS.Timeout;
    
    // Always use a fixed timer instead of relying on animation completion events
    if (onAnimationComplete) {
      animationTimer = setTimeout(() => {
        onAnimationComplete();
      }, 2000); // Match this with the store component's timer
    }
    
    return () => {
      // Clean up timer on unmount or when dependencies change
      if (animationTimer) clearTimeout(animationTimer);
    };
  }, [products, currentPage, onAnimationComplete]);
  
  // Format price for display
  const formatPrice = (price: string | number | any): string => {
    if (price === null || price === undefined) return 'N/A';
    // Since database only accepts whole numbers, we don't need decimal places
    if (typeof price === 'number') return `₱${price}`;
    // Default fallback
    return 'N/A';
  };

  // Animation variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
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
        <h2 className="text-emerald-700 text-[30px] font-bold mb-4 border-b border-gray-200 pb-2">Products</h2>
          
        {/* Product Table */}
        <div className="pt-2 pb-2">
          <div className="flex justify-between items-center h-12 px-4 mb-2 bg-white">
            <span className="text-emerald-700 text-[25px] font-bold">Name</span>
            <span className="text-emerald-700 text-[25px] font-bold">Price</span>
          </div>
            
          {/* Product Items with Animation */}
          <div className="relative overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentPage}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 150, damping: 20 },
                  opacity: { duration: 0.15 }
                }}
                onAnimationComplete={() => {
                  if (onAnimationComplete) {
                    onAnimationComplete();
                  }
                }}
              >
                {products.length > 0 ? (
                  products.map((product) => (
                    <div 
                      key={product.productid} 
                      className="flex justify-between items-center h-20 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      style={{ minHeight: '80px', maxHeight: '80px' }}
                    >
                      <div className="flex flex-col justify-center">
                        <span className="text-gray-800 text-[25px] font-medium truncate">{product.name}</span>
                      </div>
                      <span className="text-gray-800 text-lg font-semibold">{formatPrice(product.price)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>No products found</p>
                    <p className="text-sm mt-2">Products added to this store will appear here</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;