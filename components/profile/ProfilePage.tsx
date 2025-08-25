import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { formatXp } from '../../utils/helpers';
import Avatar from '../common/Avatar';
import EditProfileModal from './EditProfileModal';
import LoadingScreen from '../LoadingScreen';
import type { Profile } from '../../contexts/AuthContext';


interface ProfilePageProps {
  onNavigateHome: () => void;
  onNavigateToOrders: () => void;
  onNavigateToWishlist: () => void;
}

const fetchProfileData = async (userId: string) => {
    const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    const followersPromise = supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId);
    const followingPromise = supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId);

    const [{ data: profile, error: profileError }, { count: followers, error: followersError }, { count: following, error: followingError }] = await Promise.all([profilePromise, followersPromise, followingPromise]);

    if (profileError) throw profileError;
    if (followersError) throw followersError;
    if (followingError) throw followingError;
    
    return {
        profile,
        followerCount: followers || 0,
        followingCount: following || 0,
    };
};


const ProfileHeader: React.FC<{ 
    profile: Profile,
    followerCount: number, 
    followingCount: number,
    onEdit: () => void
    onNavigateHome: () => void
    onNavigateToOrders: () => void
    onNavigateToWishlist: () => void;
}> = ({ profile, followerCount, followingCount, onEdit, onNavigateHome, onNavigateToOrders, onNavigateToWishlist }) => {
    const { user } = useAuth();
    return (
        <div className="bg-white shadow-sm rounded-2xl overflow-hidden">
            <div className="h-48 md:h-64 bg-gray-200 relative">
                <img 
                    src={profile.cover_url || 'https://picsum.photos/seed/cover/1200/400'} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                />
                <button onClick={onNavigateHome} className="absolute top-4 left-4 bg-white/70 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors z-10" aria-label="Go back home">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
            </div>
            <div className="p-4 md:p-6 -mt-16 md:-mt-20 flex flex-col items-center md:items-start md:flex-row gap-4 relative">
                <div className="border-4 border-white rounded-full shadow-md">
                     <Avatar avatarUrl={profile.photo_url} name={profile.name || user?.email} size={128} />
                </div>
                <div className="mt-16 md:mt-0 md:ml-4 flex-grow text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-bold">{profile.name || 'NaxStore User'}</h2>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                    <p className="text-gray-700 mt-2 max-w-lg">{profile.bio || 'No bio yet.'}</p>
                     <div className="flex justify-center md:justify-start gap-4 mt-3">
                        <p><span className="font-bold">{formatXp(followerCount)}</span> <span className="text-gray-500">Followers</span></p>
                        <p><span className="font-bold">{formatXp(followingCount)}</span> <span className="text-gray-500">Following</span></p>
                    </div>
                </div>
                 <div className="absolute top-20 right-4 md:static md:ml-auto flex flex-col md:flex-row gap-2 items-center">
                    <button onClick={onNavigateToWishlist} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-300 transition-colors">
                        My Wishlist
                    </button>
                     <button onClick={onNavigateToOrders} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-300 transition-colors">
                        My Orders
                    </button>
                     <button onClick={onEdit} className="bg-yellow-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-yellow-500 transition-colors">
                        Edit Profile
                    </button>
                </div>
            </div>
        </div>
    );
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigateHome, onNavigateToOrders, onNavigateToWishlist }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const { data, isLoading, error } = useQuery({
        queryKey: ['profile', user?.id],
        queryFn: () => fetchProfileData(user!.id),
        enabled: !!user, // Only run query if user exists
    });
    
    if (isLoading) return <LoadingScreen />;
    if (error) return <div className="p-4 text-center text-red-500">{error.message}</div>;
    if (!data?.profile) return <div className="p-4 text-center">Could not find your profile.</div>;
    
    const { profile, followerCount, followingCount } = data;

    const handleSave = () => {
        setIsEditModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['authProfile'] }); // Also invalidate the profile in the auth context
    };

    return (
        <div className="animate-fade-in max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            <ProfileHeader 
                profile={profile} 
                followerCount={followerCount} 
                followingCount={followingCount}
                onEdit={() => setIsEditModalOpen(true)}
                onNavigateHome={onNavigateHome}
                onNavigateToOrders={onNavigateToOrders}
                onNavigateToWishlist={onNavigateToWishlist}
            />
            
            <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">My Products</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-gray-200 aspect-square rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>

            {isEditModalOpen && user && (
                <EditProfileModal
                    user={user}
                    profile={profile}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default ProfilePage;