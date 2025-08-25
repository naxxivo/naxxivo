import React from 'react';
import { useCart } from '../../hooks/useCart';
import type { CartItemWithProduct } from '../../types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';

interface CartPageProps {
  onNavigateHome: () => void;
  onNavigateToPayment: (orderId: string) => void;
}

const CartItemRow: React.FC<{ item: CartItemWithProduct }> = ({ item }) => {
    const { updateQuantityMutation, removeFromCartMutation } = useCart();
    const product = item.products;
    const fallbackImage = `https://picsum.photos/seed/${product?.id}/100`;

    if (!product) {
        // Handle case where product might have been deleted but is still in cart
        return (
             <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                    This product is no longer available. 
                    <button onClick={() => removeFromCartMutation.mutate(item.id)} className="ml-2 text-red-500 font-semibold">Remove</button>
                </td>
            </tr>
        )
    }

    const handleQuantityChange = (newQuantity: number) => {
        updateQuantityMutation.mutate({ cartItemId: item.id, quantity: newQuantity });
    };

    return (
        <tr className="border-b">
            <td className="py-4 px-2">
                <div className="flex items-center gap-4">
                    <img 
                        src={product.image_url || fallbackImage} 
                        alt={product.name} 
                        className="w-16 h-16 md:w-24 md:h-24 object-cover rounded-lg"
                        onError={(e) => { e.currentTarget.src = fallbackImage; }}
                    />
                    <div>
                        <p className="font-semibold text-gray-800">{product.name}</p>
                        <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                    </div>
                </div>
            </td>
            <td className="py-4 px-2 text-center">
                <div className="flex items-center justify-center">
                    <button onClick={() => handleQuantityChange(item.quantity - 1)} className="px-2 py-1 border rounded-l-md hover:bg-gray-100">-</button>
                    <span className="px-4 py-1 border-t border-b">{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item.quantity + 1)} className="px-2 py-1 border rounded-r-md hover:bg-gray-100">+</button>
                </div>
            </td>
            <td className="py-4 px-2 text-center hidden md:table-cell">${(product.price * item.quantity).toFixed(2)}</td>
            <td className="py-4 px-2 text-right">
                <button onClick={() => removeFromCartMutation.mutate(item.id)} className="text-red-500 hover:text-red-700 font-semibold">
                    Remove
                </button>
            </td>
        </tr>
    );
}

const CartPage: React.FC<CartPageProps> = ({ onNavigateHome, onNavigateToPayment }) => {
  const { cartItems, isLoading, error } = useCart();
  const queryClient = useQueryClient();
  
  const checkoutMutation = useMutation({
    mutationFn: async (): Promise<string> => {
      const { data, error } = await supabase.rpc('create_order_from_cart');
      if (error) throw new Error(`Checkout failed: ${error.message}`);
      return data; // RPC returns the new orderId
    },
    onSuccess: (orderId) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onNavigateToPayment(orderId);
    }
  });
  
  const handleCheckout = () => {
    checkoutMutation.mutate();
  }

  const subtotal = cartItems?.reduce((sum, item) => {
    return sum + (item.products?.price || 0) * item.quantity;
  }, 0) || 0;

  const renderContent = () => {
    if (isLoading) return <p className="text-center py-12">Loading your cart...</p>;
    if (error) return <p className="text-center py-12 text-red-500">Error: {error.message}</p>;
    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
                <button onClick={onNavigateHome} className="bg-yellow-400 text-black font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-yellow-500 transition-colors">
                    Continue Shopping
                </button>
            </div>
        )
    }

    return (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Shopping Cart ({cartItems.length})</h2>
                {checkoutMutation.isError && (
                  <p className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-lg">
                    {checkoutMutation.error.message}
                  </p>
                )}
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="font-semibold py-2 px-2">Product</th>
                            <th className="font-semibold py-2 px-2 text-center">Quantity</th>
                            <th className="font-semibold py-2 px-2 text-center hidden md:table-cell">Total</th>
                            <th className="py-2 px-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {cartItems.map(item => <CartItemRow key={item.id} item={item} />)}
                    </tbody>
                </table>
            </div>
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-24">
                    <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                    <div className="flex justify-between mb-2 text-gray-600">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between mb-4 text-gray-600">
                        <span>Shipping</span>
                        <span>Free</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between font-bold text-lg">
                         <span>Total</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={handleCheckout}
                        disabled={checkoutMutation.isPending}
                        className="w-full mt-6 bg-yellow-400 text-black font-semibold py-3 rounded-lg shadow-md hover:bg-yellow-500 transition-colors disabled:opacity-50 flex justify-center items-center"
                    >
                      {checkoutMutation.isPending ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        'Place Order'
                      )}
                    </button>
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <button onClick={onNavigateHome} className="text-sm font-medium text-yellow-600 hover:text-yellow-800">
            &larr; Back to Store
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

export default CartPage;