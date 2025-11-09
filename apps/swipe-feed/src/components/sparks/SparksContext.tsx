import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { isSupremeAdmin, isAdmin as checkIsAdmin, getAdminPrivileges } from '../../lib/admin/adminConfig';

interface SparksContextType {
  balance: number | 'Infinity';
  isAdmin: boolean;
  isSupremeAdmin: boolean;
  hasUnlimitedSparks: boolean;
  hasUnlimitedAI: boolean;
  hasAdminDashboard: boolean;
  setBalance: (balance: number | 'Infinity') => void;
  addSparks: (amount: number) => void;
  deductSparks: (amount: number) => boolean; // returns success/fail
  refreshFromStorage: () => void;
}

const SparksContext = createContext<SparksContextType | undefined>(undefined);

const SPARK_KEY = 'mythatron_sparks';

export const SparksProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Get user info
  const userIdRaw = localStorage.getItem('mythatron_user_id') || '';
  const userEmail = localStorage.getItem('mythatron_user_email') || '';
  const userId = userIdRaw.toLowerCase();
  
  // Check admin privileges
  const privileges = getAdminPrivileges(userEmail, userId);
  const isAdmin = checkIsAdmin(userEmail, userId);
  const supremeAdmin = isSupremeAdmin(userEmail, userId);
  
  // Debug log
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log(`[SPARKS] User: ${userEmail || userId}`);
      console.log(`[SPARKS] Supreme Admin: ${supremeAdmin}, Admin: ${isAdmin}`);
      console.log(`[SPARKS] Privileges:`, privileges);
    }
  }, [userEmail, userId, isAdmin, supremeAdmin]);

  // Read initial balance
  function getInitial(): number | 'Infinity' {
    if (privileges.unlimitedSparks) return 'Infinity';
    const raw = localStorage.getItem(SPARK_KEY);
    if (!raw) return 200;
    if (raw === 'Infinity') return 'Infinity';
    return parseInt(raw, 10) || 0;
  }

  const [balance, setBalanceState] = useState<number | 'Infinity'>(getInitial());

  // Write-through to storage and update all listeners (including multi-tab)
  const setBalance = useCallback((b: number | 'Infinity') => {
    setBalanceState(b);
    if (privileges.unlimitedSparks) {
      localStorage.setItem(SPARK_KEY, 'Infinity');
    } else {
      localStorage.setItem(SPARK_KEY, b === 'Infinity' ? 'Infinity' : String(b));
    }
    window.dispatchEvent(new Event('mytha_sparks_update'));
  }, [privileges.unlimitedSparks]);

  const addSparks = useCallback((amt: number) => {
    if (privileges.unlimitedSparks) return; // Unlimited users don't need additions
    setBalanceState((prev) => {
      if (prev === 'Infinity') return prev;
      const next = Math.max(0, prev + amt);
      localStorage.setItem(SPARK_KEY, String(next));
      window.dispatchEvent(new Event('mytha_sparks_update'));
      return next;
    });
  }, [privileges.unlimitedSparks]);

  const deductSparks = useCallback((amt: number) => {
    if (privileges.unlimitedSparks) return true; // Unlimited users always succeed
    let success = false;
    setBalanceState((prev) => {
      if (prev === 'Infinity') return prev;
      if (prev < amt) return prev;
      const next = prev - amt;
      localStorage.setItem(SPARK_KEY, String(next));
      window.dispatchEvent(new Event('mytha_sparks_update'));
      success = true;
      return next;
    });
    return success;
  }, [privileges.unlimitedSparks]);

  const refreshFromStorage = useCallback(() => {
    setBalanceState(getInitial());
  }, [privileges.unlimitedSparks]);

  // Listen for manual/other-tab/localStorage changes
  useEffect(() => {
    const sync = () => setBalanceState(getInitial());
    window.addEventListener('storage', sync);
    window.addEventListener('mytha_sparks_update', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('mytha_sparks_update', sync);
    };
  }, [getInitial]);

  // Keep admin always at infinity
  useEffect(() => {
    if (isAdmin) setBalance('Infinity');
    // eslint-disable-next-line
  }, [isAdmin]);

  const value: SparksContextType = {
    balance, 
    isAdmin,
    isSupremeAdmin: supremeAdmin,
    hasUnlimitedSparks: privileges.unlimitedSparks,
    hasUnlimitedAI: privileges.unlimitedAI,
    hasAdminDashboard: privileges.adminDashboard,
    setBalance,
    addSparks,
    deductSparks,
    refreshFromStorage
  };

  return (
    <SparksContext.Provider value={value}>
      {children}
    </SparksContext.Provider>
  );
};

// Hook
export function useSparks() {
  const ctx = useContext(SparksContext);
  if (!ctx) throw new Error('useSparks must be used within <SparksProvider>');
  return ctx;
}
