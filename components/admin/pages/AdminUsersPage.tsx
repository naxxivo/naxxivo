import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../integrations/supabase/client';
import type { Profile } from '../../../contexts/AuthContext';
import { useAuth } from '../../../contexts/AuthContext';

const fetchAllUsers = async (): Promise<Profile[]> => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

const AdminUsersPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuth();
    const { data: users, isLoading, error } = useQuery({
        queryKey: ['allUsers'],
        queryFn: fetchAllUsers,
    });
    
    const updateAdminStatusMutation = useMutation({
        mutationFn: async ({ userId, isAdmin }: { userId: string, isAdmin: boolean }) => {
            const { error } = await supabase.from('profiles').update({ is_admin: isAdmin }).eq('id', userId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allUsers'] });
        },
    });

    return (
         <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                {isLoading && <p>Loading users...</p>}
                {error && <p className="text-red-500">{error.message}</p>}
                {users && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {currentUser?.id === user.id ? currentUser.email : '••••••••'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={!!user.is_admin}
                                                    onChange={(e) => updateAdminStatusMutation.mutate({ userId: user.id, isAdmin: e.target.checked })}
                                                    className="sr-only peer"
                                                    disabled={currentUser?.id === user.id}
                                                />
                                                <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-yellow-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400 ${currentUser?.id === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                                            </label>
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

export default AdminUsersPage;