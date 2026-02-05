import { useGetUserProfile } from '../hooks/useProfile';
import UserAvatar from '../components/UserAvatar';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface UserProfileViewPageProps {
  userId: string;
  onBack: () => void;
}

export default function UserProfileViewPage({ userId, onBack }: UserProfileViewPageProps) {
  const { data: profile, isLoading } = useGetUserProfile(userId);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
          <p className="text-purple-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-purple-300">Profile not found</p>
        </div>
      </div>
    );
  }

  const getPresenceLabel = () => {
    if (profile.isOnline) {
      return <span className="text-green-400 text-sm">● Online</span>;
    }
    
    const lastSeenDate = new Date(Number(profile.lastSeen) / 1000000);
    const timeAgo = formatDistanceToNow(lastSeenDate, { addSuffix: true });
    return <span className="text-purple-400/60 text-sm">Last seen {timeAgo}</span>;
  };

  return (
    <div className="h-full flex flex-col bg-black/20">
      <div className="p-4 border-b border-purple-500/20 bg-black/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="text-purple-300 hover:text-white hover:bg-purple-900/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-bold text-white">User Profile</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-8 space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <UserAvatar profile={profile} size="lg" />
              
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  {profile.displayName}
                </h1>
                <p className="text-purple-300 mb-2">@{profile.username}</p>
                {getPresenceLabel()}
              </div>
            </div>

            {profile.bio && (
              <div className="pt-6 border-t border-purple-500/20">
                <h3 className="text-sm font-semibold text-purple-300 mb-2">Bio</h3>
                <p className="text-white whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            <div className="pt-6 border-t border-purple-500/20">
              <h3 className="text-sm font-semibold text-purple-300 mb-2">Member Since</h3>
              <p className="text-white">
                {new Date(Number(profile.createdAt) / 1000000).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
