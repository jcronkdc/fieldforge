import React, { useState } from 'react';
import { CheckCircle, XCircle, Play, Loader2, AlertCircle } from 'lucide-react';
import { runIntegrationTests } from '../tests/integration.test';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export const TestRunner: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<{ passed: number; failed: number; total: number } | null>(null);

  const runTests = async () => {
    setRunning(true);
    setResults([]);
    setSummary(null);

    // Capture console.log output
    const originalLog = console.log;
    const logs: string[] = [];
    
    console.log = (...args: any[]) => {
      const message = args.join(' ');
      logs.push(message);
      
      // Parse test results from console output
      if (message.includes('✓ PASS') || message.includes('✗ FAIL')) {
        const passed = message.includes('✓ PASS');
        const name = message.replace(/.*?(✓ PASS|✗ FAIL)\s+/, '').replace(/\x1b\[[0-9;]*m/g, '');
        
        setResults(prev => [...prev, { name, passed }]);
      }
      
      // Parse summary
      if (message.includes('Passed:')) {
        const passedCount = parseInt(message.match(/\d+/)?.[0] || '0');
        setSummary(prev => ({ ...prev, passed: passedCount } as any));
      }
      if (message.includes('Failed:')) {
        const failedCount = parseInt(message.match(/\d+/)?.[0] || '0');
        setSummary(prev => ({ ...prev, failed: failedCount } as any));
      }
      if (message.includes('Total:')) {
        const totalCount = parseInt(message.match(/\d+/)?.[0] || '0');
        setSummary(prev => ({ ...prev, total: totalCount } as any));
      }
      
      originalLog(...args);
    };

    try {
      await runIntegrationTests();
    } catch (error) {
      console.error('Test runner error:', error);
    } finally {
      console.log = originalLog;
      setRunning(false);
    }
  };

  const getPassRate = () => {
    if (!summary || summary.total === 0) return 0;
    return (summary.passed / summary.total) * 100;
  };

  const passRate = getPassRate();

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">FieldForge Integration Tests</h1>
          <p className="text-gray-400">Run automated tests to verify all features are working correctly</p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Test Suite</h2>
              <p className="text-sm text-gray-400 mt-1">Tests authentication, database, and all major features</p>
            </div>
            <button
              onClick={runTests}
              disabled={running}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {running ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Running Tests...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Run Tests</span>
                </>
              )}
            </button>
          </div>

          {/* Test Results */}
          {results.length > 0 && (
            <div className="space-y-2 mb-6">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    result.passed ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {result.passed ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-white">{result.name}</span>
                  </div>
                  <span className={`text-sm font-semibold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {result.passed ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {summary && (
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Test Summary</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{summary.passed}</div>
                  <div className="text-sm text-gray-400">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{summary.failed}</div>
                  <div className="text-sm text-gray-400">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{summary.total}</div>
                  <div className="text-sm text-gray-400">Total</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${passRate === 100 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {passRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-400">Pass Rate</div>
                </div>
              </div>

              {summary.failed === 0 && (
                <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-semibold">All tests passed! FieldForge is ready!</span>
                  </div>
                </div>
              )}

              {summary.failed > 0 && (
                <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 font-semibold">Some tests failed. Please review and fix issues.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">What This Tests</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400">•</span>
              <span>Supabase connection and authentication</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400">•</span>
              <span>User sign up, sign in, and sign out</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400">•</span>
              <span>Demo account access</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400">•</span>
              <span>Project and team management</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400">•</span>
              <span>Social feed posting and retrieval</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400">•</span>
              <span>All database tables accessibility</span>
            </li>
          </ul>

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-300 font-semibold">Note</p>
                <p className="text-gray-400 text-sm mt-1">
                  Tests require a valid Supabase connection. Make sure your environment variables are set correctly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
