import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export const AuthDiagnostic: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [testEmail] = useState('demo@fieldforge.com');
  const [testPassword] = useState('FieldForge2025!Demo');
  const [running, setRunning] = useState(false);

  const runDiagnostics = async () => {
    setRunning(true);
    const results: DiagnosticResult[] = [];

    // Test 1: Environment Variables
    results.push({
      name: '1. Environment Variables',
      status: 'pending',
      message: 'Checking Supabase configuration...'
    });
    setDiagnostics([...results]);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      results[results.length - 1] = {
        name: '1. Environment Variables',
        status: 'success',
        message: 'Supabase credentials found',
        details: { url: supabaseUrl.substring(0, 30) + '...', keyLength: supabaseKey.length }
      };
    } else {
      results[results.length - 1] = {
        name: '1. Environment Variables',
        status: 'error',
        message: 'Missing Supabase credentials',
        details: { hasUrl: !!supabaseUrl, hasKey: !!supabaseKey }
      };
    }
    setDiagnostics([...results]);

    // Test 2: Supabase Connection
    results.push({
      name: '2. Supabase Connection',
      status: 'pending',
      message: 'Testing connection to Supabase...'
    });
    setDiagnostics([...results]);

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      results[results.length - 1] = {
        name: '2. Supabase Connection',
        status: 'success',
        message: 'Connected to Supabase successfully',
        details: { hasSession: !!data.session }
      };
    } catch (error: any) {
      results[results.length - 1] = {
        name: '2. Supabase Connection',
        status: 'error',
        message: `Connection failed: ${error.message}`,
        details: error
      };
    }
    setDiagnostics([...results]);

    // Test 3: Demo Account Login
    results.push({
      name: '3. Demo Account Login',
      status: 'pending',
      message: 'Attempting demo account login...'
    });
    setDiagnostics([...results]);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });
      
      if (error) throw error;
      
      results[results.length - 1] = {
        name: '3. Demo Account Login',
        status: 'success',
        message: 'Login successful!',
        details: { email: data.user?.email, hasSession: !!data.session }
      };
      
      // Sign out after test
      await supabase.auth.signOut();
    } catch (error: any) {
      results[results.length - 1] = {
        name: '3. Demo Account Login',
        status: 'error',
        message: `Login failed: ${error.message}`,
        details: { error: error.message, type: typeof error }
      };
    }
    setDiagnostics([...results]);

    // Test 4: User Profile Table
    results.push({
      name: '4. Database Access',
      status: 'pending',
      message: 'Testing database access...'
    });
    setDiagnostics([...results]);

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);
      
      if (error && error.code === '42P01') {
        results[results.length - 1] = {
          name: '4. Database Access',
          status: 'error',
          message: 'user_profiles table does not exist',
          details: error
        };
      } else if (error) {
        results[results.length - 1] = {
          name: '4. Database Access',
          status: 'error',
          message: `Database error: ${error.message}`,
          details: error
        };
      } else {
        results[results.length - 1] = {
          name: '4. Database Access',
          status: 'success',
          message: 'Database accessible',
          details: { hasAccess: true }
        };
      }
    } catch (error: any) {
      results[results.length - 1] = {
        name: '4. Database Access',
        status: 'error',
        message: `Exception: ${error.message}`,
        details: error
      };
    }
    setDiagnostics([...results]);

    setRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Authentication Diagnostic
              </h1>
              <p className="text-gray-400 mt-2">Testing sign-in functionality</p>
            </div>
            <button
              onClick={runDiagnostics}
              disabled={running}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25"
            >
              <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
              {running ? 'Running...' : 'Re-run Tests'}
            </button>
          </div>

          <div className="space-y-4">
            {diagnostics.map((result, index) => (
              <div
                key={index}
                className="bg-gray-900/50 border border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{result.name}</h3>
                    <p className={`text-sm mt-1 ${
                      result.status === 'error' ? 'text-red-400' :
                      result.status === 'success' ? 'text-green-400' :
                      'text-gray-400'
                    }`}>
                      {result.message}
                    </p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                          Show details
                        </summary>
                        <pre className="mt-2 p-2 bg-black/50 rounded text-xs text-gray-300 overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                <strong>Test Credentials:</strong>
                <br />
                Email: {testEmail}
                <br />
                Password: {testPassword}
                <br />
                <br />
                If all tests pass but login still fails, check browser console for additional errors.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

