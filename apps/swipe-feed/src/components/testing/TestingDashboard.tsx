import React, { useState, useEffect } from 'react';
import { Zap, Activity, AlertTriangle, CheckCircle, Clock, Calendar, TrendingUp, BarChart3, Shield, FileText, Download, Filter, Compass, Ruler, Video } from 'lucide-react';
import { useAuthContext } from '../auth/AuthProvider';
import toast from 'react-hot-toast';
import { CollaborationHub } from '../collaboration/CollaborationHub';

interface TestResult {
  id: number;
  equipment_id: number;
  equipment_name: string;
  equipment_code: string;
  test_type: 'insulation' | 'continuity' | 'load' | 'performance' | 'safety' | 'diagnostic';
  test_name: string;
  test_date: string;
  performed_by: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  measurements: Measurement[];
  parameters: TestParameter[];
  notes?: string;
  next_test_due?: string;
  report_url?: string;
  created_at: string;
  company_id: number;
}

interface Measurement {
  parameter: string;
  value: number;
  unit: string;
  min_acceptable?: number;
  max_acceptable?: number;
  status: 'normal' | 'warning' | 'critical';
}

interface TestParameter {
  name: string;
  value: string | number;
  expected?: string | number;
}

interface TestSchedule {
  id: number;
  equipment_id: number;
  equipment_name: string;
  test_type: string;
  scheduled_date: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  last_performed?: string;
  assigned_to?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const TEST_TYPES = [
  { value: 'insulation', label: 'Insulation Resistance', icon: Shield, color: 'text-blue-400' },
  { value: 'continuity', label: 'Continuity Test', icon: Zap, color: 'text-yellow-400' },
  { value: 'load', label: 'Load Test', icon: Activity, color: 'text-green-400' },
  { value: 'performance', label: 'Performance Test', icon: TrendingUp, color: 'text-purple-400' },
  { value: 'safety', label: 'Safety Systems', icon: AlertTriangle, color: 'text-red-400' },
  { value: 'diagnostic', label: 'Diagnostic Scan', icon: BarChart3, color: 'text-cyan-400' }
];

export const TestingDashboard: React.FC = () => {
  const { session } = useAuthContext();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [upcomingTests, setUpcomingTests] = useState<TestSchedule[]>([]);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);
  const [showTestForm, setShowTestForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pass' | 'fail' | 'warning'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [formData, setFormData] = useState({
    equipment_id: 0,
    test_type: 'insulation',
    test_name: '',
    measurements: [{ parameter: '', value: 0, unit: '', min_acceptable: 0, max_acceptable: 0 }],
    notes: ''
  });

  useEffect(() => {
    fetchTestData();
  }, [dateRange, selectedType]);

  const fetchTestData = async () => {
    try {
      const [resultsRes, scheduleRes] = await Promise.all([
        fetch(`/api/testing?range=${dateRange}${selectedType !== 'all' ? `&type=${selectedType}` : ''}`, {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        }),
        fetch('/api/testing/schedule', {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        })
      ]);

      if (!resultsRes.ok || !scheduleRes.ok) {
        throw new Error('Failed to fetch test data');
      }

      const results = await resultsRes.json();
      const schedule = await scheduleRes.json();

      // Parse and enhance test results
      const enhancedResults = results.map((result: any) => ({
        ...result,
        measurements: result.measurements || generateMockMeasurements(result.test_type),
        parameters: result.parameters || []
      }));

      setTestResults(enhancedResults);
      setUpcomingTests(schedule);
    } catch (error) {
      console.error('Error fetching test data:', error);
      toast.error('Failed to load testing data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockMeasurements = (testType: string): Measurement[] => {
    const measurements: { [key: string]: Measurement[] } = {
      insulation: [
        { parameter: 'Phase A-Ground', value: 1200, unit: 'MΩ', min_acceptable: 1000, status: 'normal' },
        { parameter: 'Phase B-Ground', value: 1150, unit: 'MΩ', min_acceptable: 1000, status: 'normal' },
        { parameter: 'Phase C-Ground', value: 950, unit: 'MΩ', min_acceptable: 1000, status: 'warning' }
      ],
      continuity: [
        { parameter: 'Circuit 1', value: 0.05, unit: 'Ω', min_acceptable: 0, max_acceptable: 0.1, status: 'normal' },
        { parameter: 'Circuit 2', value: 0.12, unit: 'Ω', min_acceptable: 0, max_acceptable: 0.1, status: 'warning' },
        { parameter: 'Ground', value: 0.02, unit: 'Ω', min_acceptable: 0, max_acceptable: 0.05, status: 'normal' }
      ],
      load: [
        { parameter: 'Max Load', value: 85, unit: '%', min_acceptable: 0, max_acceptable: 90, status: 'normal' },
        { parameter: 'Voltage Drop', value: 2.5, unit: '%', min_acceptable: 0, max_acceptable: 3, status: 'normal' },
        { parameter: 'Temperature Rise', value: 45, unit: '°C', min_acceptable: 0, max_acceptable: 50, status: 'normal' }
      ]
    };

    return measurements[testType] || [];
  };

  const handleSubmitTest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/testing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          test_date: new Date().toISOString(),
          measurements: formData.measurements.filter(m => m.parameter)
        })
      });

      if (!response.ok) throw new Error('Failed to save test result');

      toast.success('Test result saved successfully');
      fetchTestData();
      resetForm();
    } catch (error) {
      console.error('Error saving test result:', error);
      toast.error('Failed to save test result');
    }
  };

  const resetForm = () => {
    setShowTestForm(false);
    setFormData({
      equipment_id: 0,
      test_type: 'insulation',
      test_name: '',
      measurements: [{ parameter: '', value: 0, unit: '', min_acceptable: 0, max_acceptable: 0 }],
      notes: ''
    });
  };

  const addMeasurement = () => {
    setFormData({
      ...formData,
      measurements: [...formData.measurements, { parameter: '', value: 0, unit: '', min_acceptable: 0, max_acceptable: 0 }]
    });
  };

  const updateMeasurement = (index: number, field: keyof Measurement, value: any) => {
    const newMeasurements = [...formData.measurements];
    newMeasurements[index] = { ...newMeasurements[index], [field]: value };
    setFormData({ ...formData, measurements: newMeasurements });
  };

  const removeMeasurement = (index: number) => {
    setFormData({
      ...formData,
      measurements: formData.measurements.filter((_, i) => i !== index)
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pass: 'text-green-400 bg-green-900/50',
      fail: 'text-red-400 bg-red-900/50',
      warning: 'text-yellow-400 bg-yellow-900/50',
      pending: 'text-gray-400 bg-gray-900/50',
      normal: 'text-green-400',
      critical: 'text-red-400'
    };
    return colors[status as keyof typeof colors] || 'text-gray-400';
  };

  const calculateTestStats = () => {
    const total = testResults.length;
    const passed = testResults.filter(t => t.status === 'pass').length;
    const failed = testResults.filter(t => t.status === 'fail').length;
    const warnings = testResults.filter(t => t.status === 'warning').length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    return { total, passed, failed, warnings, passRate };
  };

  const getFilteredResults = () => {
    return testResults.filter(result => {
      if (filter === 'all') return true;
      return result.status === filter;
    });
  };

  const stats = calculateTestStats();
  const filteredResults = getFilteredResults();

  if (loading) {
    return (
      <div className="p-[34px] flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner-davinci mb-[21px]"></div>
          <p className="text-blue-400/60 ">Loading test diagnostics...</p>
        </div>
      </div>
    );
  }

  // Full-screen collaboration mode
  if (showCollaboration) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
        {/* Context Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6" />
            <div>
              <h2 className="font-semibold">Testing Review Call</h2>
              <p className="text-sm text-blue-100">Test verification • Results analysis • Diagnostic discussions • Compliance reviews</p>
            </div>
          </div>
          <button
            onClick={() => setShowCollaboration(false)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            Back to Testing
          </button>
        </div>

        {/* Collaboration Hub */}
        <div className="flex-1 overflow-hidden">
          <CollaborationHub />
        </div>
      </div>
    );
  }

  return (
    <div className=" p-[34px]">
      {/* Renaissance Decorations */}
      <div className="" />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-[34px] gap-[21px]">
          <div>
            <h1 className="text-2xl font-bold text-white mb-[8px]  flex items-center gap-[13px]">
              <Zap className="w-8 h-8 text-blue-400" />
              Testing Dashboard
            </h1>
            <p className="text-base text-blue-400/60 " >Equipment testing and diagnostics center</p>
          </div>
          
          <div className="flex items-center gap-[13px]">
            <button
              onClick={() => setShowCollaboration(!showCollaboration)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg px-[21px] py-[13px] flex items-center gap-[8px] transition-all"
            >
              <Video className="w-5 h-5" />
              <span className="hidden sm:inline">Review Call</span>
            </button>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 rounded-[8px] px-[21px] py-[13px] text-white "
            >
              <option value="all">All Tests</option>
              {TEST_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 rounded-[8px] px-[21px] py-[13px] text-white "
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>

            <button
              onClick={() => setShowTestForm(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all px-[21px] py-[13px] flex items-center gap-[8px] "
            >
              <Zap className="w-5 h-5" />
              <span className="">New Test</span>
            </button>
          </div>
        </div>

        {/* Stats Cards - Golden Ratio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-[21px] mb-[34px] ">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-[21px] rounded-[13px] border border-gray-700  ">
            <div className="flex items-center justify-between mb-[8px]">
              <span className="text-sm text-blue-400/60 " >Total Tests</span>
              <Activity className="w-[21px] h-[21px] text-cyan-400" />
            </div>
            <div className="text-xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-blue-400/40 mt-[8px]">This period</div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-[21px] rounded-[13px] border border-gray-700  " style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-[8px]">
              <span className="text-sm text-blue-400/60 " >Pass Rate</span>
              <TrendingUp className="w-[21px] h-[21px] text-green-400" />
            </div>
            <div className="text-xl font-bold text-green-400">{stats.passRate}%</div>
            <div className="text-sm text-green-400/60 mt-[8px]">
              {stats.passed} passed
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-[21px] rounded-[13px] border border-gray-700  " style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-[8px]">
              <span className="text-sm text-blue-400/60 " >Failed</span>
              <AlertTriangle className="w-[21px] h-[21px] text-red-400" />
            </div>
            <div className="text-xl font-bold text-red-400">{stats.failed}</div>
            <div className="text-sm text-red-400/60 mt-[8px]">Need attention</div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-[21px] rounded-[13px] border border-gray-700  " style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-[8px]">
              <span className="text-sm text-blue-400/60 " >Warnings</span>
              <AlertTriangle className="w-[21px] h-[21px] text-blue-400" />
            </div>
            <div className="text-xl font-bold text-blue-400">{stats.warnings}</div>
            <div className="text-sm text-blue-400/60 mt-[8px]">Monitor closely</div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-[21px] rounded-[13px] border border-gray-700  " style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-[8px]">
              <span className="text-sm text-blue-400/60 " >Scheduled</span>
              <Calendar className="w-[21px] h-[21px] text-purple-400" />
            </div>
            <div className="text-xl font-bold text-white">{upcomingTests.length}</div>
            <div className="text-sm text-blue-400/40 mt-[8px]">Upcoming tests</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[21px]">
          {/* Test Results */}
          <div className="lg:col-span-2 bg-gray-800/50 border border-gray-700 rounded-lg rounded-[21px] border border-gray-700  ">
            <div className="p-[21px] border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white ">Test Results</h2>
                <div className="flex gap-[8px]">
                  {(['all', 'pass', 'fail', 'warning'] as const).map((filterType) => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType)}
                      className={`px-[13px] py-[8px] rounded-[8px] text-sm transition  ${
                        filter === filterType
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all'
                          : 'bg-slate-800/50 border border-gray-700 text-blue-400/60 hover:bg-slate-700/50'
                      }`}
                    >
                      {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="divide-y divide-amber-500/10 max-h-[600px] overflow-y-auto">
              {filteredResults.length === 0 ? (
                <div className="p-[55px] text-center">
                  <div className=" mx-auto mb-[21px]">
                    <Zap className="w-[55px] h-[55px] text-blue-400/40" />
                  </div>
                  <p className="text-blue-400/60 ">No test results found</p>
                </div>
              ) : (
                filteredResults.map((result) => {
                  const testType = TEST_TYPES.find(t => t.value === result.test_type);
                  const Icon = testType?.icon || Zap;
                  
                  return (
                    <div
                      key={result.id}
                      className="p-6 hover:bg-slate-700/30 cursor-pointer transition"
                      onClick={() => setSelectedTest(result)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Icon className={`w-6 h-6 ${testType?.color || 'text-cyan-400'}`} />
                          <div>
                            <h3 className="font-semibold text-white">{result.test_name}</h3>
                            <p className="text-sm text-slate-400">{result.equipment_name} • {result.equipment_code}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                          {result.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                        <div className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(result.test_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3" />
                          {new Date(result.test_date).toLocaleTimeString()}
                        </div>
                        <div className="text-slate-400">
                          By: {result.performed_by}
                        </div>
                        {result.report_url && (
                          <a 
                            href={result.report_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FileText className="w-3 h-3" />
                            Report
                          </a>
                        )}
                      </div>

                      {/* Measurement Preview */}
                      {result.measurements.length > 0 && (
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            {result.measurements.slice(0, 3).map((measurement, idx) => (
                              <div key={idx}>
                                <p className="text-slate-500">{measurement.parameter}</p>
                                <p className={`font-medium ${getStatusColor(measurement.status)}`}>
                                  {measurement.value} {measurement.unit}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming Tests */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Scheduled Tests</h2>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {upcomingTests.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                  <p>No tests scheduled</p>
                </div>
              ) : (
                upcomingTests.map((test) => {
                  const daysUntil = Math.ceil((new Date(test.scheduled_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const isOverdue = daysUntil < 0;
                  
                  return (
                    <div key={test.id} className="bg-slate-700/30 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-white text-sm">{test.equipment_name}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${
                          test.priority === 'critical' ? 'bg-red-900/50 text-red-400' :
                          test.priority === 'high' ? 'bg-orange-900/50 text-orange-400' :
                          test.priority === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                          'bg-gray-900/50 text-gray-400'
                        }`}>
                          {test.priority}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-400 mb-2">{test.test_type}</p>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className={isOverdue ? 'text-red-400' : 'text-slate-400'}>
                          {isOverdue ? `${Math.abs(daysUntil)} days overdue` : `In ${daysUntil} days`}
                        </span>
                        <span className="text-slate-400">
                          {new Date(test.scheduled_date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {test.assigned_to && (
                        <p className="text-xs text-slate-500 mt-2">Assigned: {test.assigned_to}</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Test Details Modal */}
        {selectedTest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedTest.test_name}</h2>
                  <p className="text-slate-400">{selectedTest.equipment_name} • {selectedTest.equipment_code}</p>
                </div>
                <button
                  onClick={() => setSelectedTest(null)}
                  className="text-slate-400 hover:text-white transition"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Test Date</p>
                  <p className="text-white">{new Date(selectedTest.test_date).toLocaleString()}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Performed By</p>
                  <p className="text-white">{selectedTest.performed_by}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTest.status)}`}>
                    {selectedTest.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Measurements */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Test Measurements</h3>
                <div className="bg-slate-800/50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Parameter</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Value</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Range</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {selectedTest.measurements.map((measurement, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-white">{measurement.parameter}</td>
                          <td className="px-4 py-3 text-white">
                            {measurement.value} {measurement.unit}
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            {measurement.min_acceptable !== null && measurement.max_acceptable !== null
                              ? `${measurement.min_acceptable} - ${measurement.max_acceptable} ${measurement.unit}`
                              : measurement.min_acceptable !== null
                              ? `≥ ${measurement.min_acceptable} ${measurement.unit}`
                              : measurement.max_acceptable !== null
                              ? `≤ ${measurement.max_acceptable} ${measurement.unit}`
                              : 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(measurement.status)}`}>
                              {measurement.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedTest.notes && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Notes</h3>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-slate-300">{selectedTest.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                {selectedTest.report_url && (
                  <a
                    href={selectedTest.report_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download Report
                  </a>
                )}
                <button
                  onClick={() => setSelectedTest(null)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Test Form Modal */}
        {showTestForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-4">Record Test Results</h2>
              
              <form onSubmit={handleSubmitTest} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Test Type</label>
                    <select
                      value={formData.test_type}
                      onChange={(e) => setFormData({...formData, test_type: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    >
                      {TEST_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Test Name</label>
                    <input
                      type="text"
                      value={formData.test_name}
                      onChange={(e) => setFormData({...formData, test_name: e.target.value})}
                      placeholder="e.g., Monthly Insulation Test"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-400">Measurements</label>
                    <button
                      type="button"
                      onClick={addMeasurement}
                      className="text-cyan-400 hover:text-cyan-300 text-sm"
                    >
                      + Add Measurement
                    </button>
                  </div>
                  
                  {formData.measurements.map((measurement, index) => (
                    <div key={index} className="bg-slate-800/30 rounded-lg p-4 mb-3">
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            value={measurement.parameter}
                            onChange={(e) => updateMeasurement(index, 'parameter', e.target.value)}
                            placeholder="Parameter"
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={measurement.value}
                            onChange={(e) => updateMeasurement(index, 'value', Number(e.target.value))}
                            placeholder="Value"
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={measurement.unit}
                            onChange={(e) => updateMeasurement(index, 'unit', e.target.value)}
                            placeholder="Unit"
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={measurement.min_acceptable || ''}
                            onChange={(e) => updateMeasurement(index, 'min_acceptable', Number(e.target.value))}
                            placeholder="Min"
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={measurement.max_acceptable || ''}
                            onChange={(e) => updateMeasurement(index, 'max_acceptable', Number(e.target.value))}
                            placeholder="Max"
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                      </div>
                      {formData.measurements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMeasurement(index)}
                          className="text-red-400 hover:text-red-300 text-sm mt-2"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    placeholder="Any additional observations..."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-slate-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition"
                  >
                    Save Test Results
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};