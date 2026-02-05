import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';
import GlobalChatPage from '../pages/GlobalChatPage';
import UsersPage from '../pages/UsersPage';
import ProfilePage from '../pages/ProfilePage';
import AdminPanelPage from '../pages/AdminPanelPage';
import AdminRouteGuard from './AdminRouteGuard';
import { useAdminUnlock } from '../hooks/useAdminUnlock';

type View = 'global' | 'users' | 'profile' | 'admin';

export default function AppLayout() {
  const [currentView, setCurrentView] = useState<View>('global');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { unlock } = useAdminUnlock();

  const handleAdminUnlock = () => {
    unlock();
    setCurrentView('admin');
  };

  const renderView = () => {
    switch (currentView) {
      case 'global':
        return <GlobalChatPage />;
      case 'users':
        return <UsersPage onSelectUser={() => setCurrentView('global')} />;
      case 'profile':
        return <ProfilePage />;
      case 'admin':
        return (
          <AdminRouteGuard>
            <AdminPanelPage />
          </AdminRouteGuard>
        );
      default:
        return <GlobalChatPage />;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <AppHeader 
        onProfileClick={() => setCurrentView('profile')} 
        onAdminUnlock={handleAdminUnlock}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile sidebar toggle - repositioned to right side middle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed right-4 top-1/2 -translate-y-1/2 z-50 w-14 h-14 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Sidebar */}
        <div
          className={`
            fixed lg:relative inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <Sidebar
            currentView={currentView}
            onViewChange={(view) => {
              setCurrentView(view);
              setSidebarOpen(false);
            }}
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
