import React, { useState, useMemo } from 'react';
import type { ProductWithCategory } from '../types';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../contexts/AuthContext';
import StarRating from './common/StarRating';

interface ProductCardProps {
  product: ProductWithCategory;
  index: number;
  onNavigateToCheckout: (productId: string) => void;
  onNavigateToDetail: (productId: string) => void;
}

const HeartIcon: React.FC<{ isWishlisted: boolean }> = ({ isWishlisted }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`} fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
  </svg>
);

const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const ProductCard: React.FC<ProductCardProps> = ({ product, index, onNavigateToCheckout, onNavigateToDetail }) => {
  const fallbackImage = `https://picsum.photos/seed/${product.id}/400/400`;
  const { addToCartMutation, isItemInCart } = useCart();
  const { wishlist, addMutation, removeMutation } = useWishlist();
  const { session } = useAuth();
  const [justAdded, setJustAdded] = useState(false);

  const isWishlisted = wishlist?.some(item => item.product_id === product.id) ?? false;

  // Simulating rating info since it's not in the DB
  const { rating, reviewCount } = useMemo(() => {
    const seed = (product.id.charCodeAt(0) || 1) + (product.price || 1);
    const rating = 4.0 + (seed % 10) / 10;
    const reviewCount = Math.floor((seed * 3) % 100) + 5;
    return { rating, reviewCount };
  }, [product.id, product.price]);

  // Real discount calculation
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) return;
    if (isWishlisted) {
      removeMutation.mutate(product.id);
    } else {
      addMutation.mutate(product.id);
    }
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCartMutation.mutate(product.id, {
      onSuccess: () => {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
      }
    });
  };
  
  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigateToCheckout(product.id);
  }

  const alreadyInCart = isItemInCart(product.id);
  
  const renderButtonContent = () => {
    if (addToCartMutation.isPending) {
      return <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>;
    }
    if (justAdded) {
      return (
        <span className="flex items-center gap-2">
          <CheckIcon /> Added
        </span>
      );
    }
    if (alreadyInCart) {
      return "In Cart";
    }
    return "Add to Cart";
  };

  return (
    <div
      onClick={() => onNavigateToDetail(product.id)}
      className="bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer transform hover:-translate-y-1 transition-transform duration-300 animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative">
        <img
          src={product.image_url || fallbackImage}
          alt={product.name}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.currentTarget.src = fallbackImage; }}
        />
        <button
          onClick={handleToggleWishlist}
          disabled={addMutation.isPending || removeMutation.isPending}
          className="absolute top-3 right-3 bg-white/70 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors z-10"
          aria-label="Add to wishlist"
        >
          <HeartIcon isWishlisted={isWishlisted} />
        </button>
        {hasDiscount && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {discountPercentage}% OFF
            </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">{product.categories?.name || 'Uncategorized'}</p>
        <h3 className="text-md font-semibold text-gray-800 truncate" title={product.name}>{product.name}</h3>

        <div className="flex items-center mt-2">
          <StarRating rating={rating} />
          <span className="text-xs text-gray-500 ml-2">({reviewCount} reviews)</span>
        </div>

        <div className="flex items-baseline gap-2 mt-3">
            <p className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</p>
            {hasDiscount && (
                 <p className="text-sm text-gray-500 line-through">${product.original_price?.toFixed(2)}</p>
            )}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending || alreadyInCart}
            className={`w-full text-center py-2 px-2 border border-transparent rounded-lg text-sm font-semibold transition-all duration-300 flex justify-center items-center h-9
              ${alreadyInCart
                ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`
            }
          >
            {renderButtonContent()}
          </button>
          <button
            onClick={handleBuyNow}
            className="w-full text-center py-2 px-2 border border-transparent rounded-lg text-sm font-semibold text-black bg-yellow-400 hover:bg-yellow-500 transition-all duration-300 h-9"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
