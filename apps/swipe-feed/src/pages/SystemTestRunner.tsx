import React, { useState } from 'react';
import { runSystemTests } from '../tests/fullSystemTest';
import { CheckCircle, XCircle, AlertCircle, PlayCircle, RefreshCw } from 'lucide-react';

export const SystemTestRunner: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setSummary(null);

    try {
      const results = await runSystemTests();
      setTestResults(results);

      // Calculate summary
      let totalTests = 0;
      let passedTests = 0;
      let failedTests = 0;

      results.forEach(category => {
        category.tests.forEach((test: any) => {
          totalTests++;
          if (test.status === 'pass') passedTests++;
          if (test.status === 'fail') failedTests++;
        });
      });

      setSummary({
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        percentage: Math.round((passedTests / totalTests) * 100)
      });
    } catch (error) {
      console.error('Test runner error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getCategoryStatus = (category: any) => {
    const hasFailed = category.tests.some((t: any) => t.status === 'fail');
    return hasFailed ? 'fail' : 'pass';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-slate-700">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                🧪 FieldForge System Test Runner
              </h1>
              <p className="text-slate-400">
                Comprehensive testing based on OPUS QA Suite v1.0
              </p>
            </div>
            <button
              onClick={runTests}
              disabled={isRunning}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all
                ${isRunning
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-600 text-white hover:scale-105'
                }
              `}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Running system tests
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5" />
                  Run All Tests
                </>
              )}
            </button>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Test Summary</h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="text-3xl font-bold text-white">{summary.total}</div>
                <div className="text-sm text-slate-400">Total Tests</div>
              </div>
              <div className="bg-green-900/20 rounded-lg p-4 border border-green-700">
                <div className="text-3xl font-bold text-green-400">{summary.passed}</div>
                <div className="text-sm text-green-400">Passed</div>
              </div>
              <div className="bg-red-900/20 rounded-lg p-4 border border-red-700">
                <div className="text-3xl font-bold text-red-400">{summary.failed}</div>
                <div className="text-sm text-red-400">Failed</div>
              </div>
              <div className={`rounded-lg p-4 border ${
                summary.percentage === 100 
                  ? 'bg-green-900/20 border-green-700' 
                  : 'bg-amber-900/20 border-amber-700'
              }`}>
                <div className={`text-3xl font-bold ${
                  summary.percentage === 100 ? 'text-green-400' : 'text-amber-400'
                }`}>
                  {summary.percentage}%
                </div>
                <div className={`text-sm ${
                  summary.percentage === 100 ? 'text-green-400' : 'text-amber-400'
                }`}>
                  Success Rate
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-4">
            {testResults.map((category, idx) => (
              <div
                key={idx}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden"
              >
                <div className={`p-4 border-b border-slate-700 ${
                  getCategoryStatus(category) === 'pass' 
                    ? 'bg-green-900/10' 
                    : 'bg-red-900/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(getCategoryStatus(category))}
                      <h3 className="text-lg font-semibold text-white">
                        {category.name}
                      </h3>
                    </div>
                    <span className="text-sm text-slate-400">
                      {category.tests.filter((t: any) => t.status === 'pass').length}/{category.tests.length} passed
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    {category.tests.map((test: any, testIdx: number) => (
                      <div
                        key={testIdx}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-900/30"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(test.status)}
                          <span className="text-sm text-slate-300">{test.name}</span>
                        </div>
                        {test.message && (
                          <span className="text-xs text-slate-500">{test.message}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Initial State */}
        {!isRunning && testResults.length === 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 text-center border border-slate-700">
            <PlayCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Ready to Test</h2>
            <p className="text-slate-400 mb-6">
              Click "Run All Tests" to execute the complete test suite
            </p>
            <div className="text-sm text-slate-500">
              Tests will verify: Authentication, Landing Page, Dashboard, Projects,<br />
              Receipt Scanner, Social Feed, Analytics, Voice Commands, Gestures, and PWA features
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
