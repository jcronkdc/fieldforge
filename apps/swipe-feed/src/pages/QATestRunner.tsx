import React, { useState, useEffect } from 'react';
import FieldForgeQATestSuite from '../tests/completeQATests';
import CanonicalFieldForgeTestSuite from '../tests/canonicalTestSuite';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message?: string;
  time?: number;
}

export const QATestRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Override console.log to capture test output
  useEffect(() => {
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      originalLog(...args);
      setLogs(prev => [...prev, args.join(' ')]);
    };
    
    return () => {
      console.log = originalLog;
    };
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    setLogs([]);
    setResults(null);
    
    try {
      const suite = new FieldForgeQATestSuite();
      await suite.runAllTests();
      
      // Get results from window
      const qaResults = (window as any).__QA_RESULTS__;
      setResults(qaResults);
    } catch (error) {
      console.error('Test suite failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runCanonicalTests = async () => {
    setIsRunning(true);
    setLogs([]);
    setResults(null);
    
    try {
      setLogs(prev => [...prev, 'Starting canonical test suite']);
      const suite = new CanonicalFieldForgeTestSuite();
      await suite.runAllTests();
      
      // Get results from window
      const canonicalResults = (window as any).__CANONICAL_TEST_RESULTS__;
      if (canonicalResults) {
        // Convert to standard format
        const convertedResults = {
          summary: canonicalResults.summary,
          results: canonicalResults.testCases.map((tc: any) => ({
            test: `${tc.id}: ${tc.name}`,
            status: tc.status || 'PENDING',
            message: tc.message || tc.description,
            time: tc.duration
          })),
          timestamp: canonicalResults.timestamp
        };
        setResults(convertedResults);
      }
    } catch (error) {
      console.error('Canonical test suite failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-500 mb-2">
            FieldForge QA Test Runner
          </h1>
          <p className="text-slate-400">
            Complete test suite based on OPUS QA SUITE v1.0 methodology
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Test Controls</h2>
              <p className="text-sm text-slate-400">
                Run comprehensive tests for all FieldForge features
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={runTests}
                disabled={isRunning}
                className={`
                  px-6 py-3 rounded-lg font-semibold transition-all
                  ${isRunning 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 transform hover:scale-105'
                  }
                `}
              >
                {isRunning ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Running basic tests
                  </span>
                ) : (
                  '🚀 Run Basic Tests'
                )}
              </button>
              <button
                onClick={runCanonicalTests}
                disabled={isRunning}
                className={`
                  px-6 py-3 rounded-lg font-semibold transition-all
                  ${isRunning 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-105'
                  }
                `}
              >
                {isRunning ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Running canonical suite
                  </span>
                ) : (
                  '🎯 Run Canonical Suite'
                )}
              </button>
              <button
                onClick={clearResults}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-all"
              >
                🗑️ Clear Results
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {results && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Test Results Summary</h2>
            <div className="grid md:grid-cols-5 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {results.summary.total}
                </div>
                <div className="text-sm text-slate-400">Total Tests</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-400">
                  {results.summary.passed}
                </div>
                <div className="text-sm text-slate-400">Passed</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-400">
                  {results.summary.failed}
                </div>
                <div className="text-sm text-slate-400">Failed</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-yellow-400">
                  {results.summary.skipped}
                </div>
                <div className="text-sm text-slate-400">Skipped</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {results.summary.passRate}%
                </div>
                <div className="text-sm text-slate-400">Pass Rate</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-400">
              Completed in {results.summary.duration.toFixed(2)} seconds
            </div>
          </div>
        )}

        {/* Test Details */}
        {results && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Test Details</h2>
            <div className="space-y-2">
              {results.results.map((result: TestResult, index: number) => (
                <div
                  key={index}
                  className={`
                    flex items-center justify-between p-3 rounded-lg
                    ${result.status === 'PASS' ? 'bg-green-900/20 border border-green-700/30' : ''}
                    ${result.status === 'FAIL' ? 'bg-red-900/20 border border-red-700/30' : ''}
                    ${result.status === 'SKIP' ? 'bg-yellow-900/20 border border-yellow-700/30' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {result.status === 'PASS' && '✅'}
                      {result.status === 'FAIL' && '❌'}
                      {result.status === 'SKIP' && '⏩'}
                    </span>
                    <div>
                      <div className="font-semibold">{result.test}</div>
                      {result.message && (
                        <div className="text-sm text-slate-400">{result.message}</div>
                      )}
                    </div>
                  </div>
                  {result.time && (
                    <div className="text-sm text-slate-400">
                      {result.time}ms
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Console Output */}
        {logs.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Console Output</h2>
            <div className="bg-black/50 rounded-lg p-4 font-mono text-xs overflow-auto max-h-96">
              {logs.map((log, index) => (
                <div key={index} className="text-slate-300">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
