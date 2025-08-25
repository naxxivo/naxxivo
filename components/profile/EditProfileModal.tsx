import React, { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import type { Database } from '../../integrations/supabase/types';
import Avatar from '../common/Avatar';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

interface EditProfileModalProps {
    user: User;
    profile: Profile;
    onClose: () => void;
    onSave: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, profile, onClose, onSave }) => {
    const [name, setName] = useState(profile.name || '');
    const [bio, setBio] = useState(profile.bio || '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.photo_url);
    const [coverPreview, setCoverPreview] = useState<string | null>(profile.cover_url);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
        const file = e.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            if (type === 'avatar') {
                setAvatarFile(file);
                setAvatarPreview(previewUrl);
            } else {
                setCoverFile(file);
                setCoverPreview(previewUrl);
            }
        }
    };
    
    const uploadFile = async (file: File, bucket: 'avatars' | 'covers'): Promise<string | null> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: true });

        if (uploadError) {
            throw new Error(`Failed to upload ${bucket.slice(0, -1)}: ${uploadError.message}`);
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
        return data.publicUrl;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        
        try {
            let photo_url = profile.photo_url;
            if (avatarFile) {
                photo_url = await uploadFile(avatarFile, 'avatars');
            }

            let cover_url = profile.cover_url;
            if (coverFile) {
                cover_url = await uploadFile(coverFile, 'covers');
            }
            
            const updateData: ProfileUpdate = {
                name: name,
                bio,
                photo_url,
                cover_url
            };

            const { error: profileError } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', user.id);
            
            if (profileError) throw profileError;
            
            onSave();

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-bold">Edit Profile</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
                        
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">Cover Photo</label>
                             <div className="h-40 bg-gray-200 rounded-lg flex justify-center items-center overflow-hidden">
                                <img src={coverPreview || 'https://picsum.photos/seed/cover/1200/400'} alt="Cover preview" className="w-full h-full object-cover"/>
                            </div>
                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} className="mt-2 text-sm" />
                        </div>
                        
                        <div className="flex items-center gap-4">
                           <Avatar avatarUrl={avatarPreview} name={name} size={80} />
                           <div>
                                <label className="text-sm font-medium text-gray-700 block mb-2">Profile Picture</label>
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} className="text-sm" />
                           </div>
                        </div>

                        <div>
                            <label htmlFor="name" className="text-sm font-medium text-gray-700 block mb-2">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 transition"
                                placeholder="Your full name"
                            />
                        </div>

                        <div>
                            <label htmlFor="bio" className="text-sm font-medium text-gray-700 block mb-2">Bio</label>
                            <textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 transition"
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg text-sm font-semibold bg-gray-200 hover:bg-gray-300 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="py-2 px-4 rounded-lg text-sm font-semibold text-black bg-yellow-400 hover:bg-yellow-500 transition disabled:opacity-50 flex items-center">
                            {isLoading && <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;