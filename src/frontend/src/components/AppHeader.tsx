import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useProfile';
import { useGetSiteLogo } from '../hooks/useSiteLogo';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X, ArrowLeft } from 'lucide-react';
import UserAvatar from './UserAvatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AppHeaderProps {
  onProfileClick: () => void;
  onAdminUnlock?: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function AppHeader({ 
  onProfileClick, 
  onAdminUnlock, 
  sidebarOpen, 
  onToggleSidebar,
  showBackButton,
  onBack
}: AppHeaderProps) {
  const { clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: logoUrl } = useGetSiteLogo();
  const queryClient = useQueryClient();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleLogoClick = () => {
    setShowPasswordDialog(true);
    setPassword('');
  };

  const handlePasswordSubmit = () => {
    if (password === 'DexGod') {
      setShowPasswordDialog(false);
      setPassword('');
      toast.success('Admin access unlocked');
      onAdminUnlock?.();
    } else {
      toast.error('Incorrect password');
      setPassword('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit();
    }
  };

  return (
    <>
      <header className="h-16 bg-black/60 backdrop-blur-sm border-b border-purple-500/20 flex items-center justify-between px-4 lg:px-6 shadow-lg shadow-purple-900/10">
        <div className="flex items-center gap-3">
          {showBackButton && onBack ? (
            <Button
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="lg:hidden text-purple-300 hover:text-white hover:bg-purple-900/30"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          ) : null}
          
          <button
            onClick={handleLogoClick}
            className="focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded-lg"
          >
            {logoUrl ? (
              <img 
                src={logoUrl}
                alt="Site Logo" 
                className="w-10 h-10 rounded-lg shadow-lg shadow-purple-500/20 cursor-pointer hover:opacity-80 transition-opacity"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-purple-900/30 border border-purple-500/30 cursor-pointer hover:bg-purple-900/40 transition-colors" />
            )}
          </button>
          <h1 className="text-xl font-bold text-white">Ghost Chat</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onProfileClick}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-purple-900/30 transition-colors"
          >
            <UserAvatar profile={userProfile} size="sm" />
            <span className="hidden sm:inline text-purple-200 text-sm font-medium">
              {userProfile?.displayName || 'Profile'}
            </span>
          </button>

          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-purple-300 hover:text-white hover:bg-purple-900/30"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Logout</span>
          </Button>

          {/* Mobile menu toggle - top right */}
          <Button
            onClick={onToggleSidebar}
            variant="ghost"
            size="icon"
            className="lg:hidden text-purple-300 hover:text-white hover:bg-purple-900/30"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-black/95 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Admin Access</DialogTitle>
            <DialogDescription className="text-purple-300">
              Enter the admin password to unlock the admin panel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-purple-200">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter password"
                className="bg-black/60 border-purple-500/30 text-white placeholder:text-purple-400/50"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setPassword('');
              }}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-900/30"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              Unlock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
