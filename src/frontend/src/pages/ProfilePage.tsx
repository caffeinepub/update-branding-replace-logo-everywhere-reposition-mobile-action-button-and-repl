import { useState } from 'react';
import { useGetCallerUserProfile, useUpdateDisplayName, useUpdateBio } from '../hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import AvatarPicker from '../components/AvatarPicker';
import UserAvatar from '../components/UserAvatar';

export default function ProfilePage() {
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const updateDisplayName = useUpdateDisplayName();
  const updateBio = useUpdateBio();

  const handleEdit = () => {
    if (profile) {
      setDisplayName(profile.displayName);
      setBio(profile.bio);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (displayName.trim() !== profile?.displayName) {
      await updateDisplayName.mutateAsync(displayName.trim());
    }
    if (bio.trim() !== profile?.bio) {
      await updateBio.mutateAsync(bio.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDisplayName('');
    setBio('');
  };

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
        <p className="text-purple-300">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-black/20">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 shadow-2xl shadow-purple-900/20">
          <h2 className="text-2xl font-bold text-white mb-6">Your Profile</h2>

          <div className="flex flex-col items-center mb-6">
            <UserAvatar profile={profile} size="lg" />
            <AvatarPicker />
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-purple-200">Username</Label>
              <Input
                value={profile.username}
                disabled
                className="mt-2 bg-black/50 border-purple-500/30 text-purple-300/60"
              />
            </div>

            <div>
              <Label className="text-purple-200">Display Name</Label>
              {isEditing ? (
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-2 bg-black/50 border-purple-500/30 text-white focus:border-purple-500 focus:ring-purple-500/20"
                />
              ) : (
                <Input
                  value={profile.displayName}
                  disabled
                  className="mt-2 bg-black/50 border-purple-500/30 text-white"
                />
              )}
            </div>

            <div>
              <Label className="text-purple-200">Bio</Label>
              {isEditing ? (
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="mt-2 bg-black/50 border-purple-500/30 text-white focus:border-purple-500 focus:ring-purple-500/20 resize-none"
                />
              ) : (
                <Textarea
                  value={profile.bio || 'No bio yet'}
                  disabled
                  rows={3}
                  className="mt-2 bg-black/50 border-purple-500/30 text-white resize-none"
                />
              )}
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={updateDisplayName.isPending || updateBio.isPending}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/30"
                  >
                    {updateDisplayName.isPending || updateBio.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1 border-purple-500/30 text-purple-300 hover:bg-purple-900/30"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleEdit}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/30"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
