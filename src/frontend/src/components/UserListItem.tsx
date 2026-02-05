import type { UserProfile } from '../backend';
import UserAvatar from './UserAvatar';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserListItemProps {
  profile: UserProfile;
  onSelect: () => void;
}

export default function UserListItem({ profile, onSelect }: UserListItemProps) {
  const getPresenceLabel = () => {
    if (profile.isOnline) {
      return <span className="text-green-400 text-xs">● Online</span>;
    }
    
    const lastSeenDate = new Date(Number(profile.lastSeen) / 1000000);
    const timeAgo = formatDistanceToNow(lastSeenDate, { addSuffix: true });
    return <span className="text-purple-400/60 text-xs">Last seen {timeAgo}</span>;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-black/40 border border-purple-500/20 rounded-xl hover:bg-purple-900/20 transition-colors">
      <UserAvatar profile={profile} size="md" />

      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold truncate">{profile.displayName}</h3>
        <p className="text-sm text-purple-300/60 truncate">@{profile.username}</p>
        {getPresenceLabel()}
      </div>

      <Button
        onClick={onSelect}
        size="sm"
        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/20"
      >
        <MessageSquare className="w-4 h-4" />
      </Button>
    </div>
  );
}
