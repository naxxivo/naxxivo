import React from 'react';
import { useWishlist } from '../../hooks/useWishlist';
import ProductCard from '../ProductCard';
import type { ProductWithCategory } from '../../types';

interface WishlistPageProps {
  onNavigateHome: () => void;
  onNavigateToCheckout: (productId: string) => void;
  onNavigateToDetail: (productId: string) => void;
}

const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigateHome, onNavigateToCheckout, onNavigateToDetail }) => {
  const { wishlist, isLoading, error } = useWishlist();

  const renderContent = () => {
    if (isLoading) return <p className="text-center py-12">Loading your wishlist...</p>;
    if (error) return <p className="text-center py-12 text-red-500">Error: {error.message}</p>;
    if (!wishlist || wishlist.length === 0) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save items you love by clicking the heart icon on a product.</p>
          <button onClick={onNavigateHome} className="bg-yellow-400 text-black font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-yellow-500 transition-colors">
            Discover Products
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {wishlist.map((item, index) => 
          item.products ? (
            <ProductCard 
              key={item.id} 
              product={item.products as ProductWithCategory} 
              index={index} 
              onNavigateToCheckout={onNavigateToCheckout}
              onNavigateToDetail={onNavigateToDetail}
            />
          ) : null
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <button onClick={onNavigateHome} className="text-sm font-medium text-yellow-600 hover:text-yellow-800">
          &larr; Back to Store
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

export default WishlistPage;