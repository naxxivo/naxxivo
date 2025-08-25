import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import type { OrderWithItems } from '../../types';
import LoadingScreen from '../LoadingScreen';

interface OrderDetailPageProps {
  orderId: string;
  onNavigateBack: () => void;
}

const fetchOrderDetails = async (orderId: string): Promise<OrderWithItems> => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products ( id, name, image_url )
      )
    `)
    .eq('id', orderId)
    .single();

  if (error) throw new Error(`Failed to fetch order details: ${error.message}`);
  return data as OrderWithItems;
};

const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ orderId, onNavigateBack }) => {
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderDetails(orderId),
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <p className="text-center py-12 text-red-500">Error: {error.message}</p>;
  if (!order) return <p className="text-center py-12">Order not found.</p>;

  const fallbackImage = (id: string) => `https://picsum.photos/seed/${id}/100`;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <button onClick={onNavigateBack} className="text-sm font-medium text-yellow-600 hover:text-yellow-800">
          &larr; Back to All Orders
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex flex-wrap justify-between items-start gap-4 border-b pb-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">Order Details</h1>
            <p className="text-sm text-gray-500">Order #{order.id}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
            <p className="font-bold text-lg">${order.total_amount.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Order Status</h3>
            <p className="capitalize px-3 py-1 text-sm inline-block rounded-full bg-yellow-100 text-yellow-800">
              {order.order_status.replace(/_/g, ' ')}
            </p>
          </div>
           <div>
            <h3 className="font-semibold mb-2">Payment Status</h3>
            <p className="capitalize px-3 py-1 text-sm inline-block rounded-full bg-blue-100 text-blue-800">
              {order.payment_status}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Items in this order ({order.order_items.length})</h3>
          <ul className="space-y-4">
            {order.order_items.map(item => (
              <li key={item.id} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                <img
                  src={item.products?.image_url || fallbackImage(item.product_id)}
                  alt={item.products?.name || 'Product Image'}
                  className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                />
                <div className="flex-grow">
                  <p className="font-semibold">{item.products?.name}</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">(${(item.price).toFixed(2)} each)</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
