import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, AlertCircle, RefreshCw, Clock } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
}

export const TestExecutionPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([
    { name: 'Database Connection', status: 'pending' },
    { name: 'Authentication Service', status: 'pending' },
    { name: 'Project Management', status: 'pending' },
    { name: 'Receipt Scanner', status: 'pending' },
    { name: 'Social Feed', status: 'pending' },
    { name: 'Real-time Analytics', status: 'pending' },
    { name: 'Voice Commands', status: 'pending' },
    { name: 'Gesture Controls', status: 'pending' }
  ]);

  const runTests = async () => {
    setIsRunning(true);
    const newResults = [...results];
    
    for (let i = 0; i < newResults.length; i++) {
      newResults[i] = { ...newResults[i], status: 'running' };
      setResults([...newResults]);
      
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      const passed = Math.random() > 0.1; // 90% pass rate
      newResults[i] = {
        ...newResults[i],
        status: passed ? 'passed' : 'failed',
        duration: 500 + Math.random() * 2000,
        error: passed ? undefined : 'Test failed with error: Connection timeout'
      };
      setResults([...newResults]);
    }
    
    setIsRunning(false);
  };

  const resetTests = () => {
    setResults(results.map(r => ({ ...r, status: 'pending', duration: undefined, error: undefined })));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-500/10 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 border-red-500/20';
      case 'running':
        return 'bg-blue-500/10 border-blue-500/20';
      default:
        return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  const totalTests = results.length;
  const passedTests = results.filter(r => r.status === 'passed').length;
  const failedTests = results.filter(r => r.status === 'failed').length;
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={runTests}
            disabled={isRunning}
            className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              isRunning 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <Play className="w-4 h-4" />
            {isRunning ? 'Running tests' : 'Run All Tests'}
          </button>
          <button
            onClick={resetTests}
            disabled={isRunning}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>
        
        {/* Summary Stats */}
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-gray-400">Total:</span>
            <span className="ml-2 font-bold text-white">{totalTests}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-400">Passed:</span>
            <span className="ml-2 font-bold text-green-500">{passedTests}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-400">Failed:</span>
            <span className="ml-2 font-bold text-red-500">{failedTests}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-400">Pass Rate:</span>
            <span className={`ml-2 font-bold ${passRate >= 80 ? 'text-green-500' : passRate >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
              {passRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
          style={{ width: `${(passedTests + failedTests) / totalTests * 100}%` }}
        />
      </div>

      {/* Test Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((result, index) => (
          <div 
            key={result.name}
            className={`p-4 rounded-lg border transition-all ${getStatusColor(result.status)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getStatusIcon(result.status)}
                <div>
                  <h4 className="font-medium text-white">{result.name}</h4>
                  {result.error && (
                    <p className="text-xs text-red-400 mt-1">{result.error}</p>
                  )}
                  {result.duration && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {(result.duration / 1000).toFixed(2)}s
                    </p>
                  )}
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                result.status === 'passed' ? 'bg-green-500/20 text-green-400' :
                result.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                result.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {result.status.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-400 pt-4 border-t border-gray-700">
        Last run: {new Date().toLocaleString()}
      </div>
    </div>
  );
};
