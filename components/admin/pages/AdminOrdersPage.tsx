import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../integrations/supabase/client';
import type { Order } from '../../../types';

type OrderWithProfile = Order & { profiles: { name: string | null } | null };

const fetchAdminOrders = async (): Promise<OrderWithProfile[]> => {
    const { data, error } = await supabase
        .from('orders')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data as OrderWithProfile[];
};

const AdminOrdersPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { data: orders, isLoading, error } = useQuery({
        queryKey: ['adminOrders'],
        queryFn: fetchAdminOrders
    });
    
    const updateStatusMutation = useMutation({
        mutationFn: async ({ orderId, status }: { orderId: string, status: string }) => {
            const { error } = await supabase.from('orders').update({ order_status: status }).eq('id', orderId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
        }
    });

    const handleStatusChange = (orderId: string, newStatus: string) => {
        updateStatusMutation.mutate({ orderId, status: newStatus });
    };

    const orderStatuses = ["pending_payment", "processing", "shipped", "delivered", "cancelled", "refunded"];

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                {isLoading && <p>Loading orders...</p>}
                {error && <p className="text-red-500">{error.message}</p>}
                {orders && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map(order => (
                                    <tr key={order.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{order.id.substring(0, 8)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{order.profiles?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">${order.total_amount.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <select
                                                value={order.order_status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                className="p-1 border rounded-md bg-gray-50 text-xs"
                                            >
                                                {orderStatuses.map(status => (
                                                    <option key={status} value={status}>{status.replace('_', ' ')}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrdersPage;