import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { useAddresses } from '../../hooks/useAddresses';
import type { Product, UserAddress } from '../../types';

interface CheckoutPageProps {
  productId: string;
  onNavigateHome: () => void;
  onNavigateToPayment: (orderId: string) => void;
}

const fetchProduct = async (productId: string) => {
  const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
  if (error) throw new Error('Product not found');
  return data;
};

const CheckoutPage: React.FC<CheckoutPageProps> = ({ productId, onNavigateHome, onNavigateToPayment }) => {
  const { data: product, isLoading: isLoadingProduct } = useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: () => fetchProduct(productId),
  });

  const { addresses, isLoading: isLoadingAddresses, addAddressMutation } = useAddresses();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationFn: async (addressId: string) => {
      const { data, error } = await supabase.rpc('create_order_from_single_product', {
        p_product_id: productId,
        p_address_id: addressId,
      });
      if (error) throw error;
      return data; // This should be the new orderId
    },
    onSuccess: (orderId) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] }); // Invalidate orders list
      onNavigateToPayment(orderId);
    },
  });

  const handleAddressSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAddress = {
      full_name: formData.get('full_name') as string,
      address_line1: formData.get('address_line1') as string,
      city: formData.get('city') as string,
      postal_code: formData.get('postal_code') as string,
      country: formData.get('country') as string,
      phone_number: formData.get('phone_number') as string,
    };
    addAddressMutation.mutate(newAddress, {
      onSuccess: () => {
        setShowAddressForm(false);
      }
    });
  };

  const handleProceedToPayment = () => {
    if (selectedAddressId) {
      createOrderMutation.mutate(selectedAddressId);
    } else {
      alert('Please select a shipping address.');
    }
  };

  if (isLoadingProduct) return <div className="text-center p-8">Loading Product...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Address Selection */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">1. Shipping Address</h2>
          {isLoadingAddresses ? <p>Loading addresses...</p> : (
            <div className="space-y-3">
              {addresses?.map(address => (
                <div key={address.id} onClick={() => setSelectedAddressId(address.id)} className={`p-4 border rounded-lg cursor-pointer ${selectedAddressId === address.id ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-gray-200'}`}>
                  <p className="font-semibold">{address.full_name}</p>
                  <p className="text-sm text-gray-600">{address.address_line1}, {address.city}</p>
                  <p className="text-sm text-gray-600">{address.phone_number}</p>
                </div>
              ))}
            </div>
          )}

          {!showAddressForm && (
            <button onClick={() => setShowAddressForm(true)} className="mt-4 text-yellow-600 font-semibold text-sm">+ Add New Address</button>
          )}

          {showAddressForm && (
            <form onSubmit={handleAddressSubmit} className="mt-4 space-y-3 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold">New Address Details</h3>
              <input name="full_name" required placeholder="Full Name" className="w-full p-2 border rounded" />
              <input name="address_line1" required placeholder="Address Line 1" className="w-full p-2 border rounded" />
              <input name="city" required placeholder="City" className="w-full p-2 border rounded" />
              <input name="postal_code" required placeholder="Postal Code" className="w-full p-2 border rounded" />
              <input name="country" required placeholder="Country" className="w-full p-2 border rounded" />
              <input name="phone_number" required placeholder="Phone Number" className="w-full p-2 border rounded" />
              <div className="flex gap-2">
                <button type="submit" disabled={addAddressMutation.isPending} className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold disabled:opacity-50">
                  {addAddressMutation.isPending ? 'Saving...' : 'Save Address'}
                </button>
                <button type="button" onClick={() => setShowAddressForm(false)} className="bg-gray-200 px-4 py-2 rounded-lg font-semibold">Cancel</button>
              </div>
            </form>
          )}
        </div>

        {/* Right Side: Order Summary */}
        <div className="bg-white p-6 rounded-2xl shadow-lg h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          {product && (
            <div className="flex gap-4 border-b pb-4">
              <img src={product.image_url || `https://picsum.photos/seed/${product.id}/100`} alt={product.name} className="w-24 h-24 rounded-lg object-cover" />
              <div>
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-gray-600">Quantity: 1</p>
                <p className="text-lg font-bold mt-2">${product.price.toFixed(2)}</p>
              </div>
            </div>
          )}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between"><span>Subtotal</span><span>${product?.price.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>Free</span></div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span>${product?.price.toFixed(2)}</span></div>
          </div>
          <button
            onClick={handleProceedToPayment}
            disabled={!selectedAddressId || createOrderMutation.isPending}
            className="w-full mt-6 bg-yellow-400 text-black font-semibold py-3 rounded-lg shadow-md hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {createOrderMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Confirm Address & Proceed'
            )}
          </button>
          {createOrderMutation.isError && <p className="text-red-500 text-sm mt-2 text-center">{createOrderMutation.error.message}</p>}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;