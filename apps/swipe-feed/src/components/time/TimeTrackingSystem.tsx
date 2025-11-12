import React, { useState } from 'react';
import {
  Clock,
  Play,
  Pause,
  Square,
  Calendar,
  User,
  Building2,
  DollarSign,
  BarChart3,
  Download,
  Filter,
  Plus,
  CheckCircle,
  AlertTriangle,
  Timer
} from 'lucide-react';

interface TimeEntry {
  id: string;
  employeeName: string;
  employeeId: string;
  date: string;
  project: string;
  workCode: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  overtimeHours: number;
  breakTime: number;
  description: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  rate: number;
  totalPay: number;
}

interface ActiveTimer {
  employeeId: string;
  employeeName: string;
  project: string;
  startTime: string;
  currentHours: number;
  isRunning: boolean;
}

const mockTimeEntries: TimeEntry[] = [
  {
    id: '1',
    employeeName: 'Mike Rodriguez',
    employeeId: 'EMP001',
    date: '2025-01-27',
    project: 'Alpha-7 Substation Upgrade',
    workCode: 'SUBST-INSTALL',
    startTime: '07:00',
    endTime: '15:30',
    totalHours: 8,
    overtimeHours: 0,
    breakTime: 0.5,
    description: 'Transformer installation and testing',
    status: 'approved',
    rate: 45.50,
    totalPay: 364.00
  },
  {
    id: '2',
    employeeName: 'Sarah Chen',
    employeeId: 'EMP002', 
    date: '2025-01-27',
    project: 'Alpha-7 Substation Upgrade',
    workCode: 'ELECT-WIRE',
    startTime: '07:00',
    endTime: '17:00',
    totalHours: 8,
    overtimeHours: 2,
    breakTime: 0.5,
    description: 'Control house electrical wiring',
    status: 'submitted',
    rate: 42.25,
    totalPay: 422.50
  }
];

const mockActiveTimers: ActiveTimer[] = [
  {
    employeeId: 'EMP003',
    employeeName: 'Tom Wilson',
    project: 'Alpha-7 Substation Upgrade',
    startTime: '07:00',
    currentHours: 6.5,
    isRunning: true
  }
];

const workCodes = [
  { code: 'SUBST-INSTALL', name: 'Substation Installation', rate: 45.50 },
  { code: 'ELECT-WIRE', name: 'Electrical Wiring', rate: 42.25 },
  { code: 'HV-TESTING', name: 'High Voltage Testing', rate: 48.00 },
  { code: 'MAINT-REPAIR', name: 'Maintenance & Repair', rate: 40.00 },
  { code: 'SAFETY-TRAIN', name: 'Safety Training', rate: 38.00 }
];

export const TimeTrackingSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'timers' | 'entries' | 'reports' | 'payroll'>('timers');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showNewEntry, setShowNewEntry] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'submitted': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'draft': return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Time Tracking System</h1>
        </div>
        <p className="text-slate-300">Track work hours, overtime, and payroll for electrical crews</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-slate-800/30 p-1 rounded-lg w-fit">
        {[
          { key: 'timers', label: 'Active Timers', icon: Timer },
          { key: 'entries', label: 'Time Entries', icon: Clock },
          { key: 'reports', label: 'Reports', icon: BarChart3 },
          { key: 'payroll', label: 'Payroll', icon: DollarSign }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Timers Tab */}
      {activeTab === 'timers' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Timer className="w-6 h-6 text-green-400" />
                <h3 className="font-semibold text-white">Active Timers</h3>
              </div>
              <div className="text-3xl font-bold text-green-400 mb-1">
                {mockActiveTimers.filter(t => t.isRunning).length}
              </div>
              <p className="text-sm text-slate-400">Currently tracking</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-6 h-6 text-blue-400" />
                <h3 className="font-semibold text-white">Hours Today</h3>
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {mockActiveTimers.reduce((acc, t) => acc + t.currentHours, 0).toFixed(1)}
              </div>
              <p className="text-sm text-slate-400">Across all active timers</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <User className="w-6 h-6 text-purple-400" />
                <h3 className="font-semibold text-white">Crew Online</h3>
              </div>
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {mockActiveTimers.length}
              </div>
              <p className="text-sm text-slate-400">Workers logged in</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="w-6 h-6 text-yellow-400" />
                <h3 className="font-semibold text-white">Labor Cost</h3>
              </div>
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                ${(mockActiveTimers.reduce((acc, t) => acc + (t.currentHours * 45), 0)).toLocaleString()}
              </div>
              <p className="text-sm text-slate-400">Today so far</p>
            </div>
          </div>

          {/* Active Timers List */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Currently Active</h3>
            {mockActiveTimers.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">No Active Timers</h4>
                <p className="text-slate-400">Start tracking time for crew members</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockActiveTimers.map((timer, index) => (
                  <div key={index} className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                          <span className="text-sm text-white font-bold">
                            {timer.employeeName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{timer.employeeName}</h4>
                          <p className="text-sm text-slate-400">{timer.project}</p>
                          <p className="text-xs text-slate-500">Started at {timer.startTime}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">
                            {formatTime(timer.currentHours)}
                          </div>
                          <p className="text-sm text-slate-400">Hours worked</p>
                        </div>
                        
                        <div className="flex gap-2">
                          {timer.isRunning ? (
                            <button className="p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-all">
                              <Pause className="w-5 h-5 text-red-400" />
                            </button>
                          ) : (
                            <button className="p-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-all">
                              <Play className="w-5 h-5 text-green-400" />
                            </button>
                          )}
                          <button className="p-3 bg-slate-600 hover:bg-slate-500 rounded-lg transition-all">
                            <Square className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {timer.isRunning && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-400">Currently tracking time</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Start Timer */}
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Start New Timer</h3>
            <div className="grid gap-4 lg:grid-cols-4">
              <select className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Employee</option>
                <option value="emp1">Mike Rodriguez</option>
                <option value="emp2">Sarah Chen</option>
                <option value="emp3">Tom Wilson</option>
              </select>
              <select className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Project</option>
                <option value="alpha7">Alpha-7 Substation Upgrade</option>
                <option value="windfarm">Wind Farm Collector System</option>
              </select>
              <select className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Work Code</option>
                {workCodes.map(code => (
                  <option key={code.code} value={code.code}>{code.name}</option>
                ))}
              </select>
              <button className="px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                Start Timer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Entries Tab */}
      {activeTab === 'entries' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="p-3 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors">
                <Filter className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <button 
              onClick={() => setShowNewEntry(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Entry
            </button>
          </div>

          {/* Time Entries Table */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Time Entries</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-slate-300">Employee</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-300">Project</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-300">Work Code</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-300">Hours</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-300">Pay</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTimeEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="p-4">
                        <div>
                          <div className="font-semibold text-white">{entry.employeeName}</div>
                          <div className="text-sm text-slate-400">{entry.date}</div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300">{entry.project}</td>
                      <td className="p-4">
                        <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-sm border border-blue-500/30">
                          {entry.workCode}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-white font-semibold">{entry.totalHours} hrs</div>
                        {entry.overtimeHours > 0 && (
                          <div className="text-sm text-orange-400">+{entry.overtimeHours} OT</div>
                        )}
                      </td>
                      <td className="p-4 text-green-400 font-semibold">
                        {formatCurrency(entry.totalPay)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(entry.status)}`}>
                          {entry.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Time Reports</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all">
              <Download className="w-5 h-5" />
              Export Report
            </button>
          </div>

          {/* Report Cards */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h4 className="font-bold text-white mb-4">Weekly Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Regular Hours:</span>
                  <span className="text-white font-semibold">320 hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Overtime Hours:</span>
                  <span className="text-orange-400 font-semibold">24 hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Labor Cost:</span>
                  <span className="text-green-400 font-semibold">$15,480</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h4 className="font-bold text-white mb-4">Project Breakdown</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Alpha-7 Substation:</span>
                  <span className="text-white font-semibold">280 hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Wind Farm Collector:</span>
                  <span className="text-white font-semibold">64 hrs</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h4 className="font-bold text-white mb-4">Compliance</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Approved Entries:</span>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Pending Review:</span>
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Tab */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Payroll Processing</h2>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Current Pay Period</h3>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-300">Period: Jan 20 - Jan 26, 2025</h4>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Regular Hours:</span>
                      <span className="text-white font-semibold">320 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Overtime Hours:</span>
                      <span className="text-orange-400 font-semibold">24 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Gross Labor Cost:</span>
                      <span className="text-green-400 font-semibold">$15,480.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Benefits & Taxes:</span>
                      <span className="text-red-400 font-semibold">$4,644.00</span>
                    </div>
                    <div className="pt-2 border-t border-slate-600">
                      <div className="flex justify-between">
                        <span className="text-white font-semibold">Total Payroll Cost:</span>
                        <span className="text-white font-bold text-lg">$20,124.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-slate-300">Actions</h4>
                <div className="space-y-3">
                  <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all">
                    Review Time Entries
                  </button>
                  <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all">
                    Process Payroll
                  </button>
                  <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all">
                    Export to ADP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Entry Modal */}
      {showNewEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Add Time Entry</h3>
            
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Employee</label>
                  <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Employee</option>
                    <option value="emp1">Mike Rodriguez</option>
                    <option value="emp2">Sarah Chen</option>
                    <option value="emp3">Tom Wilson</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Date</label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Start Time</label>
                  <input
                    type="time"
                    defaultValue="07:00"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">End Time</label>
                  <input
                    type="time"
                    defaultValue="15:30"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Break Time</label>
                  <input
                    type="number"
                    placeholder="0.5"
                    step="0.25"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Work Description</label>
                <textarea
                  placeholder="Describe the work performed..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewEntry(false)}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Save entry logic here
                    setShowNewEntry(false);
                  }}
                  className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
