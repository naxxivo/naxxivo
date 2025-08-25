import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import type { Order } from '../../types';

interface PaymentPageProps {
  orderId: string;
  onNavigateToOrders: () => void;
}

const fetchOrderForPayment = async (orderId: string): Promise<Order> => {
  const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single();
  if (error) throw new Error('Order not found or you do not have permission to view it.');
  return data;
};

const PaymentPage: React.FC<PaymentPageProps> = ({ orderId, onNavigateToOrders }) => {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [senderDetails, setSenderDetails] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const { data: order, isLoading: isLoadingOrder, error: orderError } = useQuery({
    queryKey: ['orderForPayment', orderId],
    queryFn: () => fetchOrderForPayment(orderId),
  });
  
  const submitPaymentMutation = useMutation({
    mutationFn: async () => {
        if (!user || !order || !screenshotFile || !paymentMethod || !senderDetails) {
            throw new Error('Please fill all fields and upload a screenshot.');
        }

        // 1. Upload screenshot
        const fileExt = screenshotFile.name.split('.').pop();
        const filePath = `${user.id}/${order.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('payment_screenshots').upload(filePath, screenshotFile);
        if (uploadError) throw new Error(`Screenshot upload failed: ${uploadError.message}`);

        // 2. Get public URL
        const { data: { publicUrl } } = supabase.storage.from('payment_screenshots').getPublicUrl(filePath);

        // 3. Insert payment record
        const { error: paymentError } = await supabase.from('manual_payments').insert([{
            order_id: order.id,
            user_id: user.id,
            amount: order.total_amount,
            payment_method: paymentMethod,
            sender_details: senderDetails,
            screenshot_url: publicUrl,
            status: 'pending',
        }]);
        if (paymentError) throw new Error(`Failed to record payment: ${paymentError.message}`);
        
        // 4. Update order status
        const { error: orderUpdateError } = await supabase.from('orders').update({ order_status: 'processing' }).eq('id', order.id);
        if (orderUpdateError) console.error("Failed to update order status, but payment was recorded:", orderUpdateError); // Non-critical error
    },
    onSuccess: () => {
        setIsSubmitted(true);
        queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });


  if (isLoadingOrder) return <div className="p-8 text-center">Loading order details...</div>;
  if (orderError) return <div className="p-8 text-center text-red-500">{orderError.message}</div>;
  if (!order) return <div className="p-8 text-center">Order not found.</div>

  if (isSubmitted) {
    return (
        <div className="max-w-2xl mx-auto p-8 text-center">
            <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Submitted!</h1>
            <p className="text-gray-700 mb-6">Thank you. Your payment proof has been received and is now under review. You will be notified once it's confirmed.</p>
            <button onClick={onNavigateToOrders} className="bg-yellow-400 text-black font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-yellow-500 transition-colors">
                View My Orders
            </button>
        </div>
    );
  }

  const paymentInstructions = {
    'bKash': 'Send payment to 01xxxxxxxxx (bKash Personal). Use your Order ID as reference.',
    'Nagad': 'Send payment to 01xxxxxxxxx (Nagad Personal). Use your Order ID as reference.',
    'Rocket': 'Send payment to 01xxxxxxxxx (Rocket). Use your Order ID as reference.',
    'Binance': 'Pay to Binance Pay ID: 12345678. Include your Order ID in the notes.',
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-center mb-2">Complete Your Payment</h1>
        <p className="text-center text-gray-600 mb-6">Your order has been placed. Please complete the payment to proceed.</p>

        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 text-center">
            <p className="text-lg text-gray-500">Order ID: <span className="font-mono text-gray-800">{order.id}</span></p>
            <p className="text-4xl font-bold mt-2">${order.total_amount.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">1. Choose Payment Method</h2>
            <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
            >
                <option value="" disabled>Select a method</option>
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
                <option value="Binance">Binance Pay</option>
            </select>

            {paymentMethod && (
                <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg">
                    <h3 className="font-semibold">Instructions for {paymentMethod}</h3>
                    <p>{paymentInstructions[paymentMethod as keyof typeof paymentInstructions]}</p>
                </div>
            )}
            
            <h2 className="text-xl font-bold mb-4 mt-6">2. Submit Payment Proof</h2>
            <form onSubmit={(e) => { e.preventDefault(); submitPaymentMutation.mutate(); }} className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Sender Details</label>
                    <input 
                        type="text"
                        value={senderDetails}
                        onChange={(e) => setSenderDetails(e.target.value)}
                        placeholder="e.g., your bKash number, Binance Pay ID, or TxID"
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                </div>
                 <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Payment Screenshot</label>
                    <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => setScreenshotFile(e.target.files ? e.target.files[0] : null)}
                        required
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                    />
                </div>
                {submitPaymentMutation.isError && (
                    <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">{submitPaymentMutation.error.message}</p>
                )}
                <button
                    type="submit"
                    disabled={submitPaymentMutation.isPending}
                    className="w-full mt-2 bg-yellow-400 text-black font-semibold py-3 rounded-lg shadow-md hover:bg-yellow-500 transition-colors disabled:opacity-50 flex justify-center items-center"
                >
                    {submitPaymentMutation.isPending ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        'Submit Payment Proof'
                    )}
                </button>
            </form>
        </div>
    </div>
  );
};

export default PaymentPage;