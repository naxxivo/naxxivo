import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../integrations/supabase/client';

const fetchDashboardStats = async () => {
    const totalUsersPromise = supabase.from('profiles').select('*', { count: 'exact', head: true });
    const totalOrdersPromise = supabase.from('orders').select('*', { count: 'exact', head: true });
    const totalRevenuePromise = supabase.from('orders').select('total_amount').eq('payment_status', 'paid');
    const pendingPaymentsPromise = supabase.from('manual_payments').select('*', { count: 'exact', head: true }).eq('status', 'pending');

    const [
        { count: totalUsers },
        { count: totalOrders },
        { data: revenueData },
        { count: pendingPayments }
    ] = await Promise.all([totalUsersPromise, totalOrdersPromise, totalRevenuePromise, pendingPaymentsPromise]);

    const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

    return { totalUsers, totalOrders, totalRevenue, pendingPayments };
};

const StatCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-3xl font-bold mt-1">{value}</p>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
    </div>
);


const DashboardPage: React.FC = () => {
    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: fetchDashboardStats
    });

    if (isLoading) return <p>Loading dashboard...</p>;
    if (error) return <p className="text-red-500">Error loading stats: {error.message}</p>

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Revenue" 
                    value={`$${stats?.totalRevenue.toFixed(2)}`} 
                    description="From all paid orders"
                />
                <StatCard 
                    title="Total Orders" 
                    value={stats?.totalOrders || 0}
                    description="Across all statuses"
                />
                 <StatCard 
                    title="Total Users" 
                    value={stats?.totalUsers || 0}
                    description="Registered on the platform"
                />
                 <StatCard 
                    title="Pending Payments" 
                    value={stats?.pendingPayments || 0}
                    description="Awaiting verification"
                />
            </div>
            {/* You can add charts or recent activity feeds here */}
        </div>
    );
};

export default DashboardPage;