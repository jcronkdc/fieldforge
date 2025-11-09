import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

export default function AppDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<any>({
    appLoaded: true,
    timestamp: new Date().toISOString(),
    sessionCheck: 'pending',
    session: null,
    error: null,
    localStorage: {},
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'NOT SET',
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'
  });

  useEffect(() => {
    // Check localStorage
    const localStorageData: any = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('supabase')) {
        localStorageData[key] = 'EXISTS';
      }
    }
    
    setDiagnostics((prev: any) => ({
      ...prev,
      localStorage: localStorageData
    }));

    // Check Supabase session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        setDiagnostics((prev: any) => ({
          ...prev,
          sessionCheck: 'complete',
          session: session ? 'EXISTS' : 'NULL',
          error: error ? error.message : null
        }));
      })
      .catch((error) => {
        setDiagnostics((prev: any) => ({
          ...prev,
          sessionCheck: 'error',
          error: error.message
        }));
      });
  }, []);

  const clearEverything = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.reload();
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: 'white',
      padding: '2rem',
      fontFamily: 'monospace'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#fbbf24' }}>
        🔧 FieldForge Diagnostic Page
      </h1>
      
      <div style={{
        backgroundColor: '#1e293b',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <h2 style={{ color: '#60a5fa', marginBottom: '0.5rem' }}>System Status</h2>
        <pre>{JSON.stringify(diagnostics, null, 2)}</pre>
      </div>

      <div style={{
        backgroundColor: '#1e293b',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <h2 style={{ color: '#60a5fa', marginBottom: '0.5rem' }}>Quick Actions</h2>
        
        <button
          onClick={clearEverything}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          Clear All Storage & Reload
        </button>

        <button
          onClick={() => window.location.href = '/'}
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          Go to Landing Page
        </button>

        <button
          onClick={() => window.location.href = '/login'}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Go to Login
        </button>
      </div>

      <div style={{
        backgroundColor: '#1e293b',
        padding: '1rem',
        borderRadius: '8px'
      }}>
        <h2 style={{ color: '#60a5fa', marginBottom: '0.5rem' }}>Instructions</h2>
        <ol>
          <li>1. Click "Clear All Storage & Reload" to ensure clean state</li>
          <li>2. After reload, check if session is NULL</li>
          <li>3. Click "Go to Landing Page" to test routing</li>
          <li>4. If landing page doesn't show, come back here and share the diagnostics</li>
        </ol>
      </div>
    </div>
  );
}
