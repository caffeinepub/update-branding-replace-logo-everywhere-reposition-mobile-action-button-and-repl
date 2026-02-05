import { useState } from 'react';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';
import GlobalChatPage from '../pages/GlobalChatPage';
import UsersPage from '../pages/UsersPage';
import ProfilePage from '../pages/ProfilePage';
import AdminPanelPage from '../pages/AdminPanelPage';
import DirectMessagePage from '../pages/DirectMessagePage';
import UserProfileViewPage from '../pages/UserProfileViewPage';
import AdminRouteGuard from './AdminRouteGuard';
import { useAdminUnlock } from '../hooks/useAdminUnlock';

type View = 'global' | 'users' | 'profile' | 'admin' | 'dm' | 'userProfile';

interface ViewState {
  view: View;
  dmParticipantId?: string;
  viewingUserId?: string;
}

export default function AppLayout() {
  const [viewStack, setViewStack] = useState<ViewState[]>([{ view: 'global' }]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { unlock } = useAdminUnlock();

  const currentViewState = viewStack[viewStack.length - 1];

  const handleAdminUnlock = () => {
    unlock();
    pushView({ view: 'admin' });
  };

  const pushView = (newViewState: ViewState) => {
    setViewStack([...viewStack, newViewState]);
    setSidebarOpen(false);
  };

  const popView = () => {
    if (viewStack.length > 1) {
      setViewStack(viewStack.slice(0, -1));
    }
  };

  const navigateToView = (view: View) => {
    setViewStack([{ view }]);
    setSidebarOpen(false);
  };

  const openDM = (userId: string) => {
    pushView({ view: 'dm', dmParticipantId: userId });
  };

  const openUserProfile = (userId: string) => {
    pushView({ view: 'userProfile', viewingUserId: userId });
  };

  const renderView = () => {
    switch (currentViewState.view) {
      case 'global':
        return (
          <GlobalChatPage 
            onUserClick={openDM}
            onAvatarClick={openUserProfile}
          />
        );
      case 'users':
        return (
          <UsersPage 
            onSelectUser={openDM}
            onAvatarClick={openUserProfile}
          />
        );
      case 'profile':
        return <ProfilePage />;
      case 'admin':
        return (
          <AdminRouteGuard>
            <AdminPanelPage />
          </AdminRouteGuard>
        );
      case 'dm':
        return currentViewState.dmParticipantId ? (
          <DirectMessagePage
            participantId={currentViewState.dmParticipantId}
            onBack={popView}
            onAvatarClick={openUserProfile}
          />
        ) : (
          <GlobalChatPage 
            onUserClick={openDM}
            onAvatarClick={openUserProfile}
          />
        );
      case 'userProfile':
        return currentViewState.viewingUserId ? (
          <UserProfileViewPage
            userId={currentViewState.viewingUserId}
            onBack={popView}
          />
        ) : (
          <GlobalChatPage 
            onUserClick={openDM}
            onAvatarClick={openUserProfile}
          />
        );
      default:
        return (
          <GlobalChatPage 
            onUserClick={openDM}
            onAvatarClick={openUserProfile}
          />
        );
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <AppHeader 
        onProfileClick={() => navigateToView('profile')} 
        onAdminUnlock={handleAdminUnlock}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        showBackButton={viewStack.length > 1}
        onBack={popView}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={`
            fixed lg:relative inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <Sidebar
            currentView={currentViewState.view === 'dm' || currentViewState.view === 'userProfile' ? 'global' : currentViewState.view}
            onViewChange={navigateToView}
          />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          {renderView()}
        </div>
      </div>
    </div>
  );
}
