import React from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  title?: string;
}

export function UserAvatar({
  avatarUrl,
  size = 'md',
  className,
  onClick,
  title
}: UserAvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div
      onClick={onClick}
      title={title}
      className={cn(
        'relative rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200 bg-slate-100 transition-all',
        sizeClasses[size],
        onClick && 'cursor-pointer hover:ring-2 hover:ring-blue-400 hover:border-transparent',
        className
      )}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Profile Avatar"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
          <User className={iconSizes[size]} />
        </div>
      )}
    </div>
  );
}
