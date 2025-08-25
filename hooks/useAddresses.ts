import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import type { UserAddress } from '../types';
import type { Database } from '../integrations/supabase/types';

type AddressInsert = Database['public']['Tables']['user_addresses']['Insert'];

const fetchAddresses = async (userId: string): Promise<UserAddress[]> => {
  const { data, error } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const useAddresses = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['addresses', user?.id];

  const { data: addresses, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => fetchAddresses(user!.id),
    enabled: !!user,
  });

  const addAddressMutation = useMutation({
    mutationFn: async (newAddress: Omit<AddressInsert, 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase.from('user_addresses').insert([{ ...newAddress, user_id: user.id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    addresses,
    isLoading,
    error,
    addAddressMutation,
  };
};