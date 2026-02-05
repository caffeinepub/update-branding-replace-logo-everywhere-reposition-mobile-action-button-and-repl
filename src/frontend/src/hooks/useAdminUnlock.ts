import { useState, useEffect } from 'react';

const ADMIN_UNLOCK_KEY = 'admin_unlocked_session';

export function useAdminUnlock() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem(ADMIN_UNLOCK_KEY) === 'true';
  });

  const unlock = () => {
    sessionStorage.setItem(ADMIN_UNLOCK_KEY, 'true');
    setIsUnlocked(true);
  };

  const lock = () => {
    sessionStorage.removeItem(ADMIN_UNLOCK_KEY);
    setIsUnlocked(false);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setIsUnlocked(sessionStorage.getItem(ADMIN_UNLOCK_KEY) === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { isUnlocked, unlock, lock };
}
