import { useState } from 'react';
import { useGetAllProfiles } from '../hooks/useProfile';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import UserListItem from '../components/UserListItem';

interface UsersPageProps {
  onSelectUser: (userId: string) => void;
  onAvatarClick: (userId: string) => void;
}

export default function UsersPage({ onSelectUser, onAvatarClick }: UsersPageProps) {
  const { data: profiles, isLoading } = useGetAllProfiles();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProfiles = profiles?.filter(profile => 
    profile.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
          <p className="text-purple-300">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black/20">
      <div className="p-4 border-b border-purple-500/20 bg-black/40 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-white mb-4">Users</h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="pl-10 bg-black/50 border-purple-500/30 text-white placeholder:text-purple-300/40 focus:border-purple-500 focus:ring-purple-500/20"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredProfiles && filteredProfiles.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-purple-300">No users found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredProfiles?.map((profile) => (
              <UserListItem
                key={profile.userId.toString()}
                profile={profile}
                onMessage={() => onSelectUser(profile.userId.toString())}
                onAvatarClick={() => onAvatarClick(profile.userId.toString())}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
