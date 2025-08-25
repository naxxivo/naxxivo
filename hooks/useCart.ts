import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import type { CartItemWithProduct } from '../types';

// Fetch all items in the user's cart, joined with product details
const fetchCartItems = async (userId: string): Promise<CartItemWithProduct[]> => {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      products ( id, name, price, image_url )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data as CartItemWithProduct[];
};

// Hook to manage the shopping cart
export const useCart = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const cartQueryKey = ['cart', user?.id];

  const { data: cartItems, isLoading, error } = useQuery({
    queryKey: cartQueryKey,
    queryFn: () => fetchCartItems(user!.id),
    enabled: !!user, // Only run if the user is logged in
  });

  const isItemInCart = (productId: string): boolean => {
    return cartItems?.some(item => item.product_id === productId) ?? false;
  }

  // Mutation to add an item to the cart
  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('You must be logged in to add items to the cart.');
      
      const existingItem = cartItems?.find(item => item.product_id === productId);

      if (existingItem) {
        // If item exists, increment quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);
        if (error) throw error;
      } else {
        // If item doesn't exist, insert a new row
        const { error } = await supabase
          .from('cart_items')
          .insert([{ user_id: user.id, product_id: productId, quantity: 1 }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      // When mutation is successful, invalidate the cart query to refetch data
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
    },
    onError: (err: any) => {
      console.error('Error adding to cart:', err);
      // Here you could add a toast notification
    }
  });

  // Mutation to update the quantity of an item
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) => {
      if (quantity <= 0) {
         const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
         if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', cartItemId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
    },
  });

  // Mutation to remove an item from the cart
  const removeFromCartMutation = useMutation({
    mutationFn: async (cartItemId: string) => {
      const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
    },
  });

  return {
    cartItems,
    isLoading,
    error,
    isItemInCart,
    addToCartMutation,
    updateQuantityMutation,
    removeFromCartMutation,
  };
};