import type { UserProfile } from '../backend';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface UserAvatarProps {
  profile?: UserProfile | null;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export default function UserAvatar({ profile, size = 'md', onClick, className = '' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };

  const avatarUrl = profile?.avatar?.getDirectURL();
  const fallbackUrl = '/assets/generated/default-avatar.dim_256x256.png';
  const initials = profile?.displayName?.slice(0, 2).toUpperCase() || '??';

  const avatarElement = (
    <Avatar className={`${sizeClasses[size]} border-2 border-purple-500/30 shadow-lg shadow-purple-500/10 ${className}`}>
      <AvatarImage src={avatarUrl || fallbackUrl} alt={profile?.displayName || 'User'} />
      <AvatarFallback className="bg-purple-900/50 text-purple-200 font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded-full"
        type="button"
      >
        {avatarElement}
      </button>
    );
  }

  return avatarElement;
}
