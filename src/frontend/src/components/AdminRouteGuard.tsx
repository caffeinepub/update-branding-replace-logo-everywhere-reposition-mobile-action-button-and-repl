import { useIsCallerAdmin } from '../hooks/useAdmin';
import { useAdminUnlock } from '../hooks/useAdminUnlock';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Lock } from 'lucide-react';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();
  const { isUnlocked } = useAdminUnlock();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-300">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Alert className="max-w-md bg-red-950/20 border-red-500/30">
          <ShieldAlert className="h-5 w-5 text-red-400" />
          <AlertTitle className="text-red-300">Access Denied</AlertTitle>
          <AlertDescription className="text-red-200/80">
            You do not have permission to access this area. Only administrators can view this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Alert className="max-w-md bg-purple-950/20 border-purple-500/30">
          <Lock className="h-5 w-5 text-purple-400" />
          <AlertTitle className="text-purple-300">Admin Panel Locked</AlertTitle>
          <AlertDescription className="text-purple-200/80">
            Please unlock the admin panel by clicking the logo in the header and entering the password.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
