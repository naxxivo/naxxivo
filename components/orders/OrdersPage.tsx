import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import type { OrderWithItems } from '../../types';

interface OrdersPageProps {
  onNavigateHome: () => void;
  onNavigateToOrder: (orderId: string) => void;
}

const fetchOrders = async (userId: string): Promise<OrderWithItems[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products ( id, name, image_url )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch orders: ${error.message}`);
  return data as OrderWithItems[];
};

const OrderItem: React.FC<{ order: OrderWithItems, onClick: () => void }> = ({ order, onClick }) => {
    return (
        <div 
            className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all"
            onClick={onClick}
            role="link"
            tabIndex={0}
            onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
        >
            <div className="w-full text-left p-4">
                <div className="flex flex-wrap justify-between items-center gap-2">
                    <div>
                        <p className="font-semibold text-gray-800">Order #{order.id.substring(0, 8)}</p>
                        <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="text-center">
                        <span className="text-sm capitalize font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                            {order.order_status.replace('_', ' ')}
                        </span>
                    </div>
                    <div className="text-right">
                         <p className="font-bold text-gray-900">${order.total_amount.toFixed(2)}</p>
                         <p className="text-sm text-gray-500">{order.order_items.length} items</p>
                    </div>
                    <div className="text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    )
}

const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigateHome, onNavigateToOrder }) => {
  const { user } = useAuth();
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => fetchOrders(user!.id),
    enabled: !!user,
  });

  const renderContent = () => {
    if (isLoading) return <p className="text-center py-12">Loading your orders...</p>;
    if (error) return <p className="text-center py-12 text-red-500">Error: {error.message}</p>;
    if (!orders || orders.length === 0) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
                <p className="text-gray-500 mb-6">You haven't placed any orders. Let's change that!</p>
                <button onClick={onNavigateHome} className="bg-yellow-400 text-black font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-yellow-500 transition-colors">
                    Start Shopping
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {orders.map(order => <OrderItem key={order.id} order={order} onClick={() => onNavigateToOrder(order.id)} />)}
        </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <button onClick={onNavigateHome} className="text-sm font-medium text-yellow-600 hover:text-yellow-800">
            &larr; Back to Store
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

export default OrdersPage;