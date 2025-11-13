import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Calendar, AlertCircle, CheckCircle, XCircle, Clock, TrendingUp, FileText, Plus, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format, addDays, isPast, isToday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface EquipmentTest {
  id: string;
  equipment_id: string;
  equipment_name: string;
  equipment_type: string;
  test_type: 'routine' | 'certification' | 'safety' | 'performance' | 'compliance';
  test_name: string;
  scheduled_date: string;
  completed_date?: string;
  performed_by?: string;
  technician_name?: string;
  status: 'scheduled' | 'in_progress' | 'passed' | 'failed' | 'overdue';
  results: TestResult[];
  notes: string;
  next_due_date?: string;
  compliance_standard?: string;
  created_at: string;
  updated_at: string;
}

interface TestResult {
  id: string;
  parameter: string;
  expected_value: string;
  actual_value: string;
  unit: string;
  passed: boolean;
  notes?: string;
}

interface TestTemplate {
  id: string;
  name: string;
  equipment_type: string;
  test_type: string;
  frequency_days: number;
  parameters: TestParameter[];
  compliance_standard?: string;
}

interface TestParameter {
  name: string;
  expected_value: string;
  unit: string;
  tolerance?: number;
}

export const TestingDashboard: React.FC = () => {
  const [tests, setTests] = useState<EquipmentTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'upcoming' | 'history' | 'analytics'>('upcoming');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showTestForm, setShowTestForm] = useState(false);
  const [selectedTest, setSelectedTest] = useState<EquipmentTest | null>(null);
  const [templates, setTemplates] = useState<TestTemplate[]>([]);

  // Analytics data
  const [analytics, setAnalytics] = useState({
    totalTests: 0,
    passRate: 0,
    overdueCount: 0,
    upcomingCount: 0,
    complianceRate: 0,
    testsByType: [] as { type: string; count: number; passRate: number }[]
  });

  useEffect(() => {
    fetchTests();
    fetchTemplates();
    fetchAnalytics();

    const subscription = supabase
      .channel('equipment_tests')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'equipment_tests' },
        () => {
          fetchTests();
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [viewMode, filterType, filterStatus]);

  const fetchTests = async () => {
    try {
      let query = supabase
        .from('equipment_tests')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (viewMode === 'upcoming') {
        query = query.gte('scheduled_date', format(new Date(), 'yyyy-MM-dd'))
          .in('status', ['scheduled', 'overdue']);
      } else if (viewMode === 'history') {
        query = query.in('status', ['passed', 'failed']);
      }

      if (filterType !== 'all') {
        query = query.eq('test_type', filterType);
      }

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Update overdue status
      const updatedTests = (data || []).map(test => {
        if (test.status === 'scheduled' && isPast(new Date(test.scheduled_date))) {
          return { ...test, status: 'overdue' };
        }
        return test;
      });

      setTests(updatedTests);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('test_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data: allTests, error } = await supabase
        .from('equipment_tests')
        .select('*');

      if (error) throw error;

      const tests = allTests || [];
      const completedTests = tests.filter(t => ['passed', 'failed'].includes(t.status));
      const passedTests = tests.filter(t => t.status === 'passed');
      const overdueTests = tests.filter(t => t.status === 'overdue');
      const upcomingTests = tests.filter(t => t.status === 'scheduled');

      // Calculate test type analytics
      const typeGroups = tests.reduce((acc, test) => {
        if (!acc[test.test_type]) {
          acc[test.test_type] = { total: 0, passed: 0 };
        }
        acc[test.test_type].total++;
        if (test.status === 'passed') {
          acc[test.test_type].passed++;
        }
        return acc;
      }, {} as Record<string, { total: number; passed: number }>);

      const testsByType = Object.entries(typeGroups).map(([type, data]) => ({
        type,
        count: data.total,
        passRate: data.total > 0 ? (data.passed / data.total) * 100 : 0
      }));

      setAnalytics({
        totalTests: tests.length,
        passRate: completedTests.length > 0 
          ? (passedTests.length / completedTests.length) * 100 
          : 0,
        overdueCount: overdueTests.length,
        upcomingCount: upcomingTests.length,
        complianceRate: tests.filter(t => t.compliance_standard && t.status === 'passed').length / 
          tests.filter(t => t.compliance_standard).length * 100 || 0,
        testsByType
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleTestComplete = async (testId: string, passed: boolean, results: TestResult[]) => {
    try {
      const { error } = await supabase
        .from('equipment_tests')
        .update({
          status: passed ? 'passed' : 'failed',
          completed_date: format(new Date(), 'yyyy-MM-dd'),
          results: JSON.stringify(results),
          updated_at: new Date().toISOString()
        })
        .eq('id', testId);

      if (error) throw error;

      // Schedule next test if it passed and has a template
      if (passed) {
        const test = tests.find(t => t.id === testId);
        if (test) {
          const template = templates.find(t => 
            t.equipment_type === test.equipment_type && 
            t.test_type === test.test_type
          );
          
          if (template) {
            const nextDate = addDays(new Date(), template.frequency_days);
            await supabase
              .from('equipment_tests')
              .insert([{
                equipment_id: test.equipment_id,
                equipment_name: test.equipment_name,
                equipment_type: test.equipment_type,
                test_type: test.test_type,
                test_name: test.test_name,
                scheduled_date: format(nextDate, 'yyyy-MM-dd'),
                status: 'scheduled',
                compliance_standard: test.compliance_standard
              }]);
          }
        }
      }

      fetchTests();
      setSelectedTest(null);
    } catch (error) {
      console.error('Error completing test:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-500',
      in_progress: 'bg-yellow-500',
      passed: 'bg-green-500',
      failed: 'bg-red-500',
      overdue: 'bg-orange-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-5 h-5" />;
      case 'failed': return <XCircle className="w-5 h-5" />;
      case 'overdue': return <AlertCircle className="w-5 h-5" />;
      case 'scheduled': return <Calendar className="w-5 h-5" />;
      case 'in_progress': return <Clock className="w-5 h-5" />;
      default: return null;
    }
  };

  const renderTestCard = (test: EquipmentTest) => (
    <motion.div
      key={test.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors cursor-pointer"
      onClick={() => setSelectedTest(test)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-white">{test.equipment_name}</h3>
          <p className="text-sm text-slate-400">{test.test_name}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(test.status)} flex items-center gap-1`}>
          {getStatusIcon(test.status)}
          {test.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-slate-500">Type:</span>
          <span className="text-slate-300 ml-1">{test.test_type}</span>
        </div>
        <div>
          <span className="text-slate-500">Due:</span>
          <span className="text-slate-300 ml-1">
            {format(new Date(test.scheduled_date), 'MMM d')}
          </span>
        </div>
      </div>

      {test.compliance_standard && (
        <div className="mt-2 text-xs text-amber-500">
          <FileText className="w-3 h-3 inline mr-1" />
          {test.compliance_standard}
        </div>
      )}

      {test.status === 'overdue' && (
        <div className="mt-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded text-xs text-orange-400">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          Test is {Math.abs(Math.floor((new Date().getTime() - new Date(test.scheduled_date).getTime()) / (1000 * 60 * 60 * 24)))} days overdue
        </div>
      )}
    </motion.div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Pass Rate</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-white">{analytics.passRate.toFixed(1)}%</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Overdue</span>
            <AlertCircle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-white">{analytics.overdueCount}</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Upcoming</span>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-white">{analytics.upcomingCount}</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Compliance</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-white">{analytics.complianceRate.toFixed(1)}%</div>
        </div>
      </div>

      {/* Test Type Breakdown */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Tests by Type</h3>
        <div className="space-y-3">
          {analytics.testsByType.map(type => (
            <div key={type.type}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-slate-300 capitalize">{type.type}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">{type.count} tests</span>
                  <span className="text-sm text-green-400">{type.passRate.toFixed(0)}% pass</span>
                </div>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${type.passRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTestModal = () => (
    <AnimatePresence>
      {selectedTest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedTest(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              {selectedTest.status === 'scheduled' ? 'Perform Test' : 'Test Details'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400">Equipment</label>
                  <p className="text-white">{selectedTest.equipment_name}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Test Type</label>
                  <p className="text-white capitalize">{selectedTest.test_type}</p>
                </div>
              </div>

              {selectedTest.status === 'scheduled' ? (
                // Test execution form
                <div className="space-y-4">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <h3 className="font-medium text-white mb-3">Test Parameters</h3>
                    <div className="space-y-2">
                      {/* This would be populated from test template */}
                      <div className="flex items-center justify-between p-2 bg-slate-800 rounded">
                        <span className="text-slate-300">Voltage Test</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                            placeholder="Value"
                          />
                          <span className="text-slate-400 text-sm">V</span>
                          <button className="p-1 text-green-500 hover:bg-slate-700 rounded">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Test Notes
                    </label>
                    <textarea
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      rows={3}
                      placeholder="Any observations or issues..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => setSelectedTest(null)}
                      className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleTestComplete(selectedTest.id, false, [])}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      Fail Test
                    </button>
                    <button
                      onClick={() => handleTestComplete(selectedTest.id, true, [])}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                      Pass Test
                    </button>
                  </div>
                </div>
              ) : (
                // Test results view
                <div className="space-y-4">
                  {selectedTest.completed_date && (
                    <div>
                      <label className="text-sm text-slate-400">Completed Date</label>
                      <p className="text-white">
                        {format(new Date(selectedTest.completed_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}

                  {selectedTest.results && selectedTest.results.length > 0 && (
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <h3 className="font-medium text-white mb-3">Test Results</h3>
                      <div className="space-y-2">
                        {selectedTest.results.map((result, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                            <span className="text-slate-300">{result.parameter}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">
                                {result.actual_value} {result.unit}
                              </span>
                              {result.passed ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTest.notes && (
                    <div>
                      <label className="text-sm text-slate-400">Notes</label>
                      <p className="text-white">{selectedTest.notes}</p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={() => setSelectedTest(null)}
                      className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <ClipboardCheck className="w-8 h-8 text-amber-500" />
            Testing Dashboard
          </h1>
          <p className="text-slate-400">Equipment testing and compliance tracking</p>
        </div>
        <button
          onClick={() => setShowTestForm(true)}
          className="bg-amber-500 hover:bg-amber-600 text-black font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Schedule Test
        </button>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode('upcoming')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'upcoming'
              ? 'bg-amber-500 text-black'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Upcoming Tests
        </button>
        <button
          onClick={() => setViewMode('history')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'history'
              ? 'bg-amber-500 text-black'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Test History
        </button>
        <button
          onClick={() => setViewMode('analytics')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'analytics'
              ? 'bg-amber-500 text-black'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Filters */}
      {viewMode !== 'analytics' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-700 text-white border border-slate-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Types</option>
                <option value="routine">Routine</option>
                <option value="certification">Certification</option>
                <option value="safety">Safety</option>
                <option value="performance">Performance</option>
                <option value="compliance">Compliance</option>
              </select>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-700 text-white border border-slate-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="overdue">Overdue</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
        </div>
      ) : viewMode === 'analytics' ? (
        renderAnalytics()
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map(renderTestCard)}
          {tests.length === 0 && (
            <div className="col-span-full text-center py-12">
              <ClipboardCheck className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No tests found</p>
            </div>
          )}
        </div>
      )}

      {/* Test Execution Modal */}
      {renderTestModal()}
    </div>
  );
};
