import { MessageSquare, Users, User, Shield } from 'lucide-react';
import { useIsCallerAdmin } from '../hooks/useAdmin';
import { useAdminUnlock } from '../hooks/useAdminUnlock';

type View = 'global' | 'users' | 'profile' | 'admin';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { data: isAdmin } = useIsCallerAdmin();
  const { isUnlocked } = useAdminUnlock();

  const navItems = [
    { id: 'global' as View, label: 'Global Chat', icon: MessageSquare },
    { id: 'users' as View, label: 'Users', icon: Users },
    { id: 'profile' as View, label: 'Profile', icon: User },
  ];

  // Add admin panel only if user is admin AND session is unlocked
  if (isAdmin && isUnlocked) {
    navItems.push({ id: 'admin' as View, label: 'Admin Panel', icon: Shield });
  }

  return (
    <div className="h-full bg-black/40 backdrop-blur-sm border-r border-purple-500/20 flex flex-col">
      <div className="p-4 border-b border-purple-500/20">
        <h2 className="text-lg font-semibold text-purple-200">Navigation</h2>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-purple-600/40 to-purple-700/40 text-white shadow-lg shadow-purple-500/20 border border-purple-500/30' 
                  : 'text-purple-300 hover:bg-purple-900/20 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-purple-500/20">
        <p className="text-xs text-purple-300/60 text-center">
          Ghost Chat 2026
        </p>
      </div>
    </div>
  );
}
