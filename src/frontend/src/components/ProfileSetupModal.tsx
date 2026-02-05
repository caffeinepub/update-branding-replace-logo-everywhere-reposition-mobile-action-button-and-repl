import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSaveCallerUserProfile } from '../hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { UserProfile } from '../backend';

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !displayName.trim()) {
      return;
    }

    if (!identity) return;

    const profile: UserProfile = {
      userId: identity.getPrincipal(),
      username: username.trim(),
      displayName: displayName.trim(),
      bio: bio.trim(),
      avatar: undefined,
      createdAt: BigInt(Date.now() * 1000000),
      lastSeen: BigInt(Date.now() * 1000000),
      isOnline: true,
    };

    saveProfile.mutate(profile);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Your Profile</h1>
          <p className="text-purple-300">Tell us a bit about yourself</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 shadow-2xl shadow-purple-900/20 space-y-6">
          <div>
            <Label htmlFor="username" className="text-purple-200">Username *</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              required
              className="mt-2 bg-black/50 border-purple-500/30 text-white placeholder:text-purple-300/40 focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <Label htmlFor="displayName" className="text-purple-200">Display Name *</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="John Doe"
              required
              className="mt-2 bg-black/50 border-purple-500/30 text-white placeholder:text-purple-300/40 focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <Label htmlFor="bio" className="text-purple-200">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className="mt-2 bg-black/50 border-purple-500/30 text-white placeholder:text-purple-300/40 focus:border-purple-500 focus:ring-purple-500/20 resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={saveProfile.isPending || !username.trim() || !displayName.trim()}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30"
          >
            {saveProfile.isPending ? 'Creating Profile...' : 'Create Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
}
