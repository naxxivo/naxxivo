import React from 'react';
import { generateAvatar } from '../../utils/helpers';

interface AvatarProps {
  avatarUrl: string | null | undefined;
  name: string | null | undefined;
  size?: number;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ avatarUrl, name, size = 128, className = '' }) => {
  const finalSize = `h-${size/4} w-${size/4}`; // e.g. h-32 w-32 for size 128
  const fallbackAvatar = generateAvatar(name || 'default-user');
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      e.currentTarget.src = fallbackAvatar;
  };

  return (
    <img
      src={avatarUrl || fallbackAvatar}
      alt={name || 'User Avatar'}
      onError={handleError}
      className={`rounded-full object-cover bg-gray-200 ${finalSize} ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};

export default Avatar;
