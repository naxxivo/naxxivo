import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import type { WishlistItemWithProduct } from '../types';

// Fetch all items in the user's wishlist, joined with product details
const fetchWishlistItems = async (userId: string): Promise<WishlistItemWithProduct[]> => {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select(`
      *,
      products ( * )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as WishlistItemWithProduct[];
};

// Hook to manage the wishlist
export const useWishlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const wishlistQueryKey = ['wishlist', user?.id];

  const { data: wishlist, isLoading, error } = useQuery({
    queryKey: wishlistQueryKey,
    queryFn: () => fetchWishlistItems(user!.id),
    enabled: !!user, // Only run if the user is logged in
  });

  // Mutation to add a product to the wishlist
  const addMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('You must be logged in to add items to your wishlist.');
      
      const { error } = await supabase
        .from('wishlist_items')
        .insert([{ user_id: user.id, product_id: productId }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistQueryKey });
    },
  });

  // Mutation to remove a product from the wishlist
  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('You must be logged in to remove items from your wishlist.');
      
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistQueryKey });
    },
  });

  return {
    wishlist,
    isLoading,
    error,
    addMutation,
    removeMutation,
  };
};