import React, { useState } from 'react';
import { 
  HardHat, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Calendar,
  ThermometerSun,
  Wind,
  CloudRain,
  Zap,
  Building2,
  FileText,
  Camera
} from 'lucide-react';

interface DailyReport {
  id: string;
  date: string;
  shift: 'day' | 'night';
  foreman: string;
  crewCount: number;
  hoursWorked: number;
  overtimeHours: number;
  weatherConditions: {
    temperature: number;
    windSpeed: number;
    conditions: string;
  };
  workCompleted: string[];
  safetyIssues: number;
  equipmentUsed: string[];
  notes: string;
}

const currentReport: DailyReport = {
  id: '1',
  date: new Date().toISOString().split('T')[0],
  shift: 'day',
  foreman: 'Mike Rodriguez',
  crewCount: 8,
  hoursWorked: 64,
  overtimeHours: 4,
  weatherConditions: {
    temperature: 72,
    windSpeed: 8,
    conditions: 'Clear'
  },
  workCompleted: [
    'Transformer pad foundation pour',
    'Control house electrical rough-in',
    '138kV bus assembly prep work'
  ],
  safetyIssues: 0,
  equipmentUsed: [
    'Crane - 50 ton',
    'Excavator',
    'Concrete truck',
    'High voltage test equipment'
  ],
  notes: 'Weather conditions excellent for outdoor work. All safety protocols followed.'
};

export const DailyOperationsCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'reports' | 'planning'>('today');
  const [showNewReport, setShowNewReport] = useState(false);

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <HardHat className="w-8 h-8 text-orange-400" />
          <h1 className="text-3xl font-bold text-white">Daily Operations Center</h1>
        </div>
        <p className="text-slate-300">Manage daily field activities and crew reports</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-slate-800/30 p-1 rounded-lg w-fit">
        {[
          { key: 'today', label: 'Today\'s Activity', icon: Clock },
          { key: 'reports', label: 'Daily Reports', icon: FileText },
          { key: 'planning', label: 'Tomorrow\'s Plan', icon: Calendar }
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

      {/* Today's Activity Tab */}
      {activeTab === 'today' && (
        <div className="space-y-6">
          {/* Current Status Cards */}
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-blue-400" />
                <h3 className="font-semibold text-white">Active Crews</h3>
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-1">{currentReport.crewCount}</div>
              <p className="text-sm text-slate-400">Field personnel on-site</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-6 h-6 text-green-400" />
                <h3 className="font-semibold text-white">Hours Today</h3>
              </div>
              <div className="text-3xl font-bold text-green-400 mb-1">{currentReport.hoursWorked}</div>
              <p className="text-sm text-slate-400">Including {currentReport.overtimeHours}h overtime</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h3 className="font-semibold text-white">Safety Status</h3>
              </div>
              <div className="text-3xl font-bold text-green-400 mb-1">{currentReport.safetyIssues}</div>
              <p className="text-sm text-slate-400">Incidents today</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <ThermometerSun className="w-6 h-6 text-orange-400" />
                <h3 className="font-semibold text-white">Weather</h3>
              </div>
              <div className="text-3xl font-bold text-orange-400 mb-1">{currentReport.weatherConditions.temperature}°F</div>
              <p className="text-sm text-slate-400">{currentReport.weatherConditions.conditions}, {currentReport.weatherConditions.windSpeed} mph winds</p>
            </div>
          </div>

          {/* Today's Work Completed */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Work Completed Today
            </h3>
            <div className="space-y-3">
              {currentReport.workCompleted.map((task, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">{task}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment in Use */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Equipment Currently in Use
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {currentReport.equipmentUsed.map((equipment, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white">{equipment}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Daily Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Daily Reports</h2>
            <button
              onClick={() => setShowNewReport(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              New Report
            </button>
          </div>

          {/* Recent Reports */}
          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{currentReport.date} - Day Shift</h4>
                    <p className="text-sm text-slate-400">Foreman: {currentReport.foreman}</p>
                  </div>
                </div>
                <span className="text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
                  Complete
                </span>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                <div>
                  <span className="text-slate-400">Crew Size:</span>
                  <span className="text-white font-semibold ml-2">{currentReport.crewCount} workers</span>
                </div>
                <div>
                  <span className="text-slate-400">Total Hours:</span>
                  <span className="text-white font-semibold ml-2">{currentReport.hoursWorked} hours</span>
                </div>
                <div>
                  <span className="text-slate-400">Safety:</span>
                  <span className="text-green-400 font-semibold ml-2">No incidents</span>
                </div>
                <div>
                  <span className="text-slate-400">Weather:</span>
                  <span className="text-white font-semibold ml-2">{currentReport.weatherConditions.conditions}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-slate-300 text-sm leading-relaxed">{currentReport.notes}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tomorrow's Planning Tab */}
      {activeTab === 'planning' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Tomorrow's Work Plan</h2>
          
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Planned Activities */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Scheduled Activities
              </h3>
              <div className="space-y-3">
                {[
                  { time: '07:00', task: 'Safety briefing and JSA review', priority: 'high' },
                  { time: '07:30', task: 'Transformer installation prep', priority: 'high' },
                  { time: '09:00', task: '138kV bus assembly', priority: 'medium' },
                  { time: '13:00', task: 'Control house wiring', priority: 'medium' },
                  { time: '15:00', task: 'Daily cleanup and tool check', priority: 'low' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                    <div className="text-blue-400 font-mono text-sm font-bold">{activity.time}</div>
                    <div className="flex-1 text-white">{activity.task}</div>
                    <div className={`w-3 h-3 rounded-full ${
                      activity.priority === 'high' ? 'bg-red-400' :
                      activity.priority === 'medium' ? 'bg-yellow-400' :
                      'bg-green-400'
                    }`}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Requirements */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Required Resources
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-2">Personnel</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="text-white">• 2 Journeyman Electricians (IBEW)</li>
                    <li className="text-white">• 4 Apprentices</li>
                    <li className="text-white">• 1 Crane operator</li>
                    <li className="text-white">• 1 Safety observer</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-2">Equipment</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="text-white">• 50-ton mobile crane</li>
                    <li className="text-white">• High voltage test set</li>
                    <li className="text-white">• Welding equipment</li>
                    <li className="text-white">• Insulated tools and PPE</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Weather Forecast */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-cyan-400" />
              Tomorrow's Weather Forecast
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <ThermometerSun className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">68°F</div>
                <div className="text-sm text-slate-400">High Temperature</div>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <Wind className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">12 mph</div>
                <div className="text-sm text-slate-400">Wind Speed</div>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <CloudRain className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">10%</div>
                <div className="text-sm text-slate-400">Rain Chance</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <p className="text-green-300 text-sm">
                ✅ <strong>Good conditions for electrical work.</strong> Low wind speeds suitable for crane operations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* New Report Modal */}
      {showNewReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Create Daily Report</h3>
            
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Date</label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Shift</label>
                  <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="day">Day Shift</option>
                    <option value="night">Night Shift</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Work Completed</label>
                <textarea
                  placeholder="Describe the work completed today..."
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewReport(false)}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Save report logic here
                    setShowNewReport(false);
                  }}
                  className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
                >
                  Save Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
