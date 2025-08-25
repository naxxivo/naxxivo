import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../integrations/supabase/client';
import type { ManualPayment } from '../../../types';

type PaymentWithDetails = ManualPayment & {
  profiles: { name: string | null } | null;
};

const fetchPendingPayments = async (): Promise<PaymentWithDetails[]> => {
  const { data, error } = await supabase
    .from('manual_payments')
    .select('*, profiles!user_id(name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as PaymentWithDetails[];
};

const AdminPaymentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);
  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['pendingPayments'],
    queryFn: fetchPendingPayments,
  });

  const approveMutation = useMutation({
    mutationFn: async (paymentId: number) => {
        const { error } = await supabase.rpc('approve_payment', { p_payment_id: paymentId });
        if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingPayments'] });
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] }); // Also refresh orders
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ paymentId, notes }: { paymentId: number, notes: string }) => {
        const { error } = await supabase.rpc('reject_payment', { p_payment_id: paymentId, p_admin_notes: notes });
        if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingPayments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });

  const handleReject = (paymentId: number) => {
    const notes = prompt("Please provide a reason for rejecting this payment:");
    if (notes) {
      rejectMutation.mutate({ paymentId, notes });
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Verify Payments</h1>
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        {isLoading && <p>Loading pending payments...</p>}
        {error && <p className="text-red-500">{error.message}</p>}
        {payments && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map(p => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{p.profiles?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">${p.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{p.payment_method}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.sender_details}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => setViewingScreenshot(p.screenshot_url)} className="text-blue-600 hover:underline">View Screenshot</button>
                      <button onClick={() => approveMutation.mutate(p.id)} className="text-green-600 hover:underline" disabled={approveMutation.isPending}>Approve</button>
                      <button onClick={() => handleReject(p.id)} className="text-red-600 hover:underline" disabled={rejectMutation.isPending}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewingScreenshot && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={() => setViewingScreenshot(null)}>
              <img src={viewingScreenshot} alt="Payment Screenshot" className="max-h-[90vh] max-w-[90vw] rounded-lg"/>
          </div>
      )}
    </div>
  );
};

export default AdminPaymentsPage;