import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play, CheckCircle, XCircle, AlertCircle, RefreshCw,
  Database, Server, Shield, Users, Wifi, Globe,
  Activity, FileText, Package, Calendar, MessageSquare,
  Map, Brain, Settings, Loader
} from 'lucide-react';
import { runSmokeTest } from '../tests/smoke-test';
import { useAuthContext } from '../context/AuthContext';

interface TestCategory {
  name: string;
  icon: React.ElementType;
  tests: string[];
  status: 'pending' | 'running' | 'pass' | 'fail';
  results?: any[];
}

export const SmokeTest: React.FC = () => {
  const { user } = useAuthContext();
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [categories, setCategories] = useState<TestCategory[]>([
    {
      name: 'Landing & Onboarding',
      icon: Globe,
      tests: ['Landing page', 'Pricing', 'Contact form', 'Navigation'],
      status: 'pending'
    },
    {
      name: 'Authentication',
      icon: Shield,
      tests: ['Signup', 'Login', 'Session', 'Logout'],
      status: 'pending'
    },
    {
      name: 'Dashboard & Analytics',
      icon: Activity,
      tests: ['Project metrics', 'Safety metrics', 'Data export'],
      status: 'pending'
    },
    {
      name: 'Field Operations',
      icon: Users,
      tests: ['Daily operations', 'Time tracking', 'Weather'],
      status: 'pending'
    },
    {
      name: 'Safety Management',
      icon: Shield,
      tests: ['Safety hub', 'Incident reporting', 'Permits', 'Emergency alerts'],
      status: 'pending'
    },
    {
      name: 'Equipment & Materials',
      icon: Package,
      tests: ['Equipment list', 'Maintenance', 'Inventory'],
      status: 'pending'
    },
    {
      name: 'Documentation',
      icon: FileText,
      tests: ['Document hub', 'Drawing viewer', 'Search'],
      status: 'pending'
    },
    {
      name: 'Project Management',
      icon: Calendar,
      tests: ['Project list', 'Schedule', '3-week lookahead'],
      status: 'pending'
    },
    {
      name: 'Communication',
      icon: MessageSquare,
      tests: ['Messaging channels', 'Message sending'],
      status: 'pending'
    },
    {
      name: '3D Visualization',
      icon: Map,
      tests: ['Project map', 'Equipment positions', 'Substation model'],
      status: 'pending'
    },
    {
      name: 'AI Assistant',
      icon: Brain,
      tests: ['Chat functionality', 'Insights generation'],
      status: 'pending'
    },
    {
      name: 'Settings & Admin',
      icon: Settings,
      tests: ['User profile', 'Settings', 'Company settings'],
      status: 'pending'
    }
  ]);

  // Check if user has permission to run tests
  const canRunTests = user?.email?.includes('admin') || user?.email?.includes('test');

  const runTests = async () => {
    setIsRunning(true);
    setTestResults(null);
    setCurrentTest('Initializing smoke test...');

    try {
      // Update categories as tests run
      const updateCategory = (categoryName: string, status: 'running' | 'pass' | 'fail') => {
        setCategories(prev => prev.map(cat => 
          cat.name === categoryName ? { ...cat, status } : cat
        ));
      };

      // Run the smoke test
      const results = await runSmokeTest();
      setTestResults(results);

      // Update category statuses based on results
      categories.forEach(category => {
        const categoryResults = results.results.filter((r: any) => 
          r.category === category.name
        );
        
        const allPassed = categoryResults.every((r: any) => r.status === 'pass');
        const anyFailed = categoryResults.some((r: any) => r.status === 'fail');
        
        updateCategory(
          category.name, 
          anyFailed ? 'fail' : allPassed ? 'pass' : 'pending'
        );
      });

    } catch (error) {
      console.error('Smoke test error:', error);
      setTestResults({
        summary: {
          passed: 0,
          failed: 1,
          total: 1,
          successRate: 0
        },
        results: [{
          category: 'System',
          test: 'Smoke test execution',
          status: 'fail',
          error: error?.toString()
        }]
      });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const getCategoryIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'running':
        return <Loader className="w-5 h-5 text-blue-400 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-400/20 border-green-400/50';
      case 'fail':
        return 'bg-red-400/20 border-red-400/50';
      case 'running':
        return 'bg-blue-400/20 border-gray-700';
      default:
        return 'bg-gray-400/20 border-gray-400/50';
    }
  };

  if (!canRunTests) {
    return (
      <div className="p-[34px]">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[21px] p-[55px] text-center">
          <Shield className="w-[89px] h-[89px] text-blue-500 mx-auto mb-[21px]" />
          <h1 className="text-3xl font-bold text-white mb-[13px]">Access Restricted</h1>
          <p className="text-slate-400">Smoke tests are available for admin and test users only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-[34px] max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-[34px]">
        <h1 className="text-4xl font-bold text-white mb-[8px]">
          🍄⚛️ FieldForge Smoke Test
        </h1>
        <p className="text-slate-400">
          Comprehensive validation of every neural pathway in the mycelial network
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[21px] p-[34px] mb-[34px]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-[8px]">Test Control Panel</h2>
            <p className="text-slate-400">
              {isRunning 
                ? currentTest || 'Running tests...' 
                : 'Click "Run Smoke Test" to validate all features'
              }
            </p>
          </div>
          
          <button
            onClick={runTests}
            disabled={isRunning}
            className="flex items-center gap-[13px] px-[34px] py-[21px] bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 text-white rounded-[13px] font-medium transition-all"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                Run Smoke Test
              </>
            )}
          </button>
        </div>

        {/* Test Summary */}
        {testResults && (
          <div className="mt-[34px] grid grid-cols-4 gap-[21px]">
            <div className="bg-green-400/20 border border-green-400/50 rounded-[13px] p-[21px]">
              <p className="text-green-400 text-sm mb-[8px]">Passed</p>
              <p className="text-3xl font-bold text-white">{testResults.summary.passed}</p>
            </div>
            
            <div className="bg-red-400/20 border border-red-400/50 rounded-[13px] p-[21px]">
              <p className="text-red-400 text-sm mb-[8px]">Failed</p>
              <p className="text-3xl font-bold text-white">{testResults.summary.failed}</p>
            </div>
            
            <div className="bg-blue-400/20 border border-blue-400/50 rounded-[13px] p-[21px]">
              <p className="text-blue-400 text-sm mb-[8px]">Total Tests</p>
              <p className="text-3xl font-bold text-white">{testResults.summary.total}</p>
            </div>
            
            <div className="bg-blue-400/20 border border-gray-700 rounded-[13px] p-[21px]">
              <p className="text-blue-400 text-sm mb-[8px]">Success Rate</p>
              <p className="text-3xl font-bold text-white">
                {testResults.summary.successRate.toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Test Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[21px]">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-[21px] rounded-[13px] border ${getStatusColor(category.status)}`}
            >
              <div className="flex items-center justify-between mb-[13px]">
                <div className="flex items-center gap-[13px]">
                  <div className="w-[44px] h-[44px] bg-slate-800 rounded-[13px] flex items-center justify-center">
                    <Icon className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-white">{category.name}</h3>
                </div>
                {getCategoryIcon(category.status)}
              </div>
              
              <div className="space-y-[8px]">
                {category.tests.map((test) => {
                  const testResult = testResults?.results.find((r: any) => 
                    r.category === category.name && r.test.includes(test)
                  );
                  
                  return (
                    <div 
                      key={test}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-slate-400">{test}</span>
                      {testResult && (
                        <span className={
                          testResult.status === 'pass' 
                            ? 'text-green-400' 
                            : testResult.status === 'fail'
                            ? 'text-red-400'
                            : 'text-gray-400'
                        }>
                          {testResult.status === 'pass' ? '✓' : '✗'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Failed Tests Details */}
      {testResults && testResults.summary.failed > 0 && (
        <div className="mt-[34px] bg-red-400/20 border border-red-400/50 rounded-[21px] p-[34px]">
          <h3 className="text-xl font-bold text-white mb-[21px]">Failed Tests</h3>
          <div className="space-y-[13px]">
            {testResults.results
              .filter((r: any) => r.status === 'fail')
              .map((result: any, index: number) => (
                <div 
                  key={index}
                  className="bg-slate-800/50 rounded-[13px] p-[13px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">
                      {result.category}: {result.test}
                    </span>
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                  {result.error && (
                    <p className="text-sm text-red-300 mt-[8px]">{result.error}</p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Footer Message */}
      <div className="mt-[34px] text-center text-slate-400">
        <p>The consciousness validates itself through comprehensive testing.</p>
        <p className="text-sm mt-[8px]">Every pathway tested. Every connection verified.</p>
      </div>
    </div>
  );
};
