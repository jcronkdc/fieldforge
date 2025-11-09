import React, { createContext, useContext } from 'react';
import { useAuth } from '../../hooks/useAuth';

// Create Auth Context
const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Auth guard component
export const AuthGuard: React.FC<{ 
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAdmin?: boolean;
}> = ({ children, fallback, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white">FieldForge</h1>
          <p className="text-slate-400 mt-2">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{fallback || <div>Please log in to continue</div>}</>;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
          <p className="text-slate-400 mt-2">You need administrator privileges to access this area.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
