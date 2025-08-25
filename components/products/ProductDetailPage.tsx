import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import type { ProductWithCategory, ReviewWithProfile } from '../../types';
import LoadingScreen from '../LoadingScreen';
import ProductCard from '../ProductCard';
import StarRating from '../common/StarRating';
import { useReviews } from '../../hooks/useReviews';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../common/Avatar';

interface ProductDetailPageProps {
  productId: string;
  onNavigateBack: () => void;
  onNavigateToCheckout: (productId: string) => void;
  onNavigateToDetail: (productId: string) => void;
}

const fetchProductDetails = async (productId: string) => {
  const productPromise = supabase.from('products').select('*, categories(name)').eq('id', productId).single();
  const reviewsPromise = supabase.from('reviews').select('id, rating').eq('product_id', productId);
  
  const [{ data: product, error: productError }, { data: reviews, error: reviewsError }] = await Promise.all([productPromise, reviewsPromise]);
  
  if (productError) throw new Error(`Product not found: ${productError.message}`);
  if (reviewsError) console.error("Could not fetch initial ratings:", reviewsError);

  return { product, reviews: reviews || [] };
};

const fetchRelatedProducts = async (categoryId: string | null, currentProductId: string) => {
    if (!categoryId) return [];
    const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('category_id', categoryId)
        .neq('id', currentProductId) // Exclude the current product
        .limit(4);
    if (error) throw new Error(`Failed to fetch related products: ${error.message}`);
    return data;
}

const ReviewForm: React.FC<{ productId: string }> = ({ productId }) => {
    const { addReviewMutation } = useReviews(productId);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Please select a rating.');
            return;
        }
        addReviewMutation.mutate({ rating, comment });
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-semibold mb-2">Write a Review</h4>
            <div className="mb-2">
                <StarRating rating={rating} interactive onRatingChange={setRating} />
            </div>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Share your thoughts..."
                className="w-full p-2 border rounded-md"
            />
            {addReviewMutation.isError && <p className="text-red-500 text-sm mt-2">{addReviewMutation.error.message}</p>}
            <button type="submit" disabled={addReviewMutation.isPending} className="mt-2 bg-yellow-400 text-black font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-yellow-500 transition-colors disabled:opacity-50">
                {addReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    )
}

const ReviewList: React.FC<{ reviews: ReviewWithProfile[] }> = ({ reviews }) => (
    <div className="space-y-4">
        {reviews.map(review => (
            <div key={review.id} className="flex gap-4 border-t pt-4">
                <Avatar avatarUrl={review.profiles?.photo_url} name={review.profiles?.name} size={40} className="flex-shrink-0 mt-1" />
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-semibold">{review.profiles?.name || 'Anonymous'}</p>
                        <StarRating rating={review.rating} />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{new Date(review.created_at).toLocaleDateString()}</p>
                    <p className="text-gray-700">{review.comment}</p>
                </div>
            </div>
        ))}
    </div>
)

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId, onNavigateBack, onNavigateToCheckout, onNavigateToDetail }) => {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProductDetails(productId),
  });

  const product = data?.product as ProductWithCategory | undefined;
  
  const { data: relatedProducts } = useQuery({
      queryKey: ['relatedProducts', product?.category_id, productId],
      queryFn: () => fetchRelatedProducts(product?.category_id || null, productId),
      enabled: !!product?.category_id,
  });

  const { reviews, isLoading: isLoadingReviews } = useReviews(productId);
  
  const totalReviews = reviews?.length || 0;
  const averageRating = totalReviews > 0 ? (reviews?.reduce((acc, r) => acc + r.rating, 0) || 0) / totalReviews : 0;

  if (isLoading) return <LoadingScreen />;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;
  if (!product) return <div className="p-8 text-center">Product not found.</div>;
  
  const fallbackImage = `https://picsum.photos/seed/${product.id}/600/600`;

  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.image_url || fallbackImage,
    description: product.description,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'NaxStore',
    },
    offers: {
      '@type': 'Offer',
      url: window.location.href,
      priceCurrency: 'USD',
      price: product.price.toFixed(2),
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: totalReviews > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount: totalReviews,
    } : undefined,
  };

  return (
    <div className="animate-fade-in">
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <button onClick={onNavigateBack} className="text-sm font-medium text-yellow-600 hover:text-yellow-800 mb-6">
                &larr; Back to Products
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <img
                        src={product.image_url || fallbackImage}
                        alt={product.name}
                        className="w-full rounded-2xl shadow-lg object-cover aspect-square"
                    />
                </div>
                <div className="flex flex-col">
                    <p className="text-sm font-medium text-yellow-600">{product.categories?.name || 'Uncategorized'}</p>
                    <h1 className="text-4xl font-bold mt-1">{product.name}</h1>
                    
                    <div className="flex items-center gap-2 mt-2">
                        <StarRating rating={averageRating} />
                        <span className="text-gray-500 text-sm">({totalReviews} reviews)</span>
                    </div>

                    <p className="text-4xl font-bold text-gray-900 my-4">${product.price.toFixed(2)}</p>
                    <p className="text-gray-600 leading-relaxed flex-grow">{product.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <button className="bg-gray-200 text-black font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-gray-300 transition-colors">Add to Cart</button>
                        <button onClick={() => onNavigateToCheckout(product.id)} className="bg-yellow-400 text-black font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-yellow-500 transition-colors">Buy Now</button>
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4">Reviews</h2>
                {user && <ReviewForm productId={productId} />}
                <div className="mt-6">
                    {isLoadingReviews ? <p>Loading reviews...</p> : 
                     reviews && reviews.length > 0 ? <ReviewList reviews={reviews} /> : <p className="text-gray-500">No reviews yet. Be the first to write one!</p>}
                </div>
            </div>

            {relatedProducts && relatedProducts.length > 0 && (
                 <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-4">Related Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {relatedProducts.map((p, index) => (
                            <ProductCard key={p.id} product={p as ProductWithCategory} index={index} onNavigateToCheckout={onNavigateToCheckout} onNavigateToDetail={onNavigateToDetail} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default ProductDetailPage;