import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import type { ReviewWithProfile } from '../types';

const fetchReviews = async (productId: string): Promise<ReviewWithProfile[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles ( id, name, photo_url )
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as ReviewWithProfile[];
};

export const useReviews = (productId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['reviews', productId];

  const { data: reviews, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => fetchReviews(productId),
  });

  const addReviewMutation = useMutation({
    mutationFn: async ({ rating, comment }: { rating: number; comment: string }) => {
      if (!user) throw new Error('You must be logged in to post a review.');
      
      const { error } = await supabase
        .from('reviews')
        .insert([{
          user_id: user.id,
          product_id: productId,
          rating,
          comment,
        }]);

      if (error) {
        if (error.code === '23505') { // Postgres unique violation
          throw new Error('You have already reviewed this product.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['product', productId] }); // Invalidate product data to update average rating
    },
  });

  return {
    reviews,
    isLoading,
    error,
    addReviewMutation,
  };
};
