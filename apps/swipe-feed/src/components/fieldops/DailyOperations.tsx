import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, CloudRain, Sun, Cloud, CheckCircle, AlertCircle, Activity, Camera, FileText, Truck, HardHat, Zap, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { CollaborationHub } from '../collaboration/CollaborationHub';

interface DailyReport {
  id: number;
  date: string;
  project_id: number;
  project_name?: string;
  weather_conditions: string;
  temperature_high: number;
  temperature_low: number;
  crew_count: number;
  work_hours: number;
  equipment_hours: number;
  activities_completed: string[];
  delays?: string[];
  safety_incidents: number;
  visitor_count: number;
  materials_delivered: string[];
  progress_notes: string;
  created_by: number;
  created_by_name?: string;
  photos?: string[];
  status: 'draft' | 'submitted' | 'approved';
  created_at: string;
}

interface Activity {
  id: string;
  time: string;
  type: 'crew_arrival' | 'work_start' | 'break' | 'incident' | 'inspection' | 'delivery' | 'completion' | 'crew_departure';
  description: string;
  location?: string;
  crew?: string;
  icon: React.ElementType;
  color: string;
}

const WEATHER_CONDITIONS = [
  { value: 'sunny', label: 'Sunny', icon: Sun },
  { value: 'partly_cloudy', label: 'Partly Cloudy', icon: Cloud },
  { value: 'cloudy', label: 'Cloudy', icon: Cloud },
  { value: 'rainy', label: 'Rainy', icon: CloudRain },
  { value: 'stormy', label: 'Stormy', icon: CloudRain }
];

const ACTIVITY_TYPES = {
  crew_arrival: { icon: Users, color: 'text-blue-500' },
  work_start: { icon: HardHat, color: 'text-green-500' },
  break: { icon: Clock, color: 'text-yellow-500' },
  incident: { icon: AlertCircle, color: 'text-red-500' },
  inspection: { icon: CheckCircle, color: 'text-purple-500' },
  delivery: { icon: Truck, color: 'text-orange-500' },
  completion: { icon: CheckCircle, color: 'text-emerald-500' },
  crew_departure: { icon: Users, color: 'text-slate-500' }
};

export const DailyOperations: React.FC = () => {
  const { session } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [todaysActivities, setTodaysActivities] = useState<Activity[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [editingReport, setEditingReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [formData, setFormData] = useState({
    project_id: 0,
    weather_conditions: 'sunny',
    temperature_high: 75,
    temperature_low: 60,
    crew_count: 0,
    work_hours: 8,
    equipment_hours: 0,
    activities_completed: [''] as string[],
    delays: [''] as string[],
    visitor_count: 0,
    materials_delivered: [''] as string[],
    progress_notes: ''
  });

  useEffect(() => {
    fetchDailyData();
    generateTodaysActivities();
  }, [selectedDate]);

  const fetchDailyData = async () => {
    try {
      const response = await fetch(`/api/field-ops/daily-reports?date=${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch daily reports');
      const data = await response.json();
      setDailyReports(data);
    } catch (error) {
      console.error('Error fetching daily reports:', error);
      toast.error('Failed to load daily operations');
    } finally {
      setLoading(false);
    }
  };

  const generateTodaysActivities = () => {
    // In production, these would come from real-time data
    const activities: Activity[] = [
      {
        id: '1',
        time: '06:00',
        type: 'crew_arrival',
        description: 'Electrical crew arrived on site',
        location: 'Substation A',
        crew: 'Team Alpha',
        ...ACTIVITY_TYPES.crew_arrival
      },
      {
        id: '2',
        time: '06:30',
        type: 'work_start',
        description: 'Commenced cable pulling operations',
        location: 'Section 3',
        crew: 'Team Alpha',
        ...ACTIVITY_TYPES.work_start
      },
      {
        id: '3',
        time: '08:15',
        type: 'delivery',
        description: 'Transformer delivery completed',
        location: 'Material Storage',
        ...ACTIVITY_TYPES.delivery
      },
      {
        id: '4',
        time: '10:00',
        type: 'inspection',
        description: 'Safety inspection completed',
        location: 'All areas',
        ...ACTIVITY_TYPES.inspection
      },
      {
        id: '5',
        time: '12:00',
        type: 'break',
        description: 'Lunch break',
        ...ACTIVITY_TYPES.break
      },
      {
        id: '6',
        time: '14:30',
        type: 'completion',
        description: 'Cable installation Phase 1 completed',
        location: 'Section 3',
        crew: 'Team Alpha',
        ...ACTIVITY_TYPES.completion
      }
    ];
    
    setTodaysActivities(activities);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = editingReport ? 'PUT' : 'POST';
      const url = editingReport 
        ? `/api/field-ops/daily-reports/${editingReport.id}`
        : '/api/field-ops/daily-reports';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          date: selectedDate,
          activities_completed: formData.activities_completed.filter(a => a.trim()),
          delays: formData.delays.filter(d => d.trim()),
          materials_delivered: formData.materials_delivered.filter(m => m.trim())
        })
      });

      if (!response.ok) throw new Error('Failed to save daily report');

      toast.success(editingReport ? 'Report updated' : 'Daily report created');
      fetchDailyData();
      resetForm();
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('Failed to save report');
    }
  };

  const resetForm = () => {
    setShowReportForm(false);
    setEditingReport(null);
    setFormData({
      project_id: 0,
      weather_conditions: 'sunny',
      temperature_high: 75,
      temperature_low: 60,
      crew_count: 0,
      work_hours: 8,
      equipment_hours: 0,
      activities_completed: [''],
      delays: [''],
      visitor_count: 0,
      materials_delivered: [''],
      progress_notes: ''
    });
  };

  const addArrayField = (field: 'activities_completed' | 'delays' | 'materials_delivered') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    });
  };

  const updateArrayField = (field: 'activities_completed' | 'delays' | 'materials_delivered', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const removeArrayField = (field: 'activities_completed' | 'delays' | 'materials_delivered', index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index)
    });
  };

  // Calculate daily stats
  const dailyStats = {
    totalCrews: dailyReports.reduce((sum, r) => sum + r.crew_count, 0),
    totalHours: dailyReports.reduce((sum, r) => sum + r.work_hours * r.crew_count, 0),
    equipmentHours: dailyReports.reduce((sum, r) => sum + r.equipment_hours, 0),
    incidents: dailyReports.reduce((sum, r) => sum + r.safety_incidents, 0)
  };

  const WeatherIcon = WEATHER_CONDITIONS.find(w => w.value === dailyReports[0]?.weather_conditions)?.icon || Sun;

  // Full-screen collaboration mode
  if (showCollaboration) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
        {/* Context Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6" />
            <div>
              <h2 className="font-semibold">Field Operations Call</h2>
              <p className="text-sm text-blue-100">Daily briefings • Activity coordination • Field reporting • Live updates</p>
            </div>
          </div>
          <button
            onClick={() => setShowCollaboration(false)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            Back to Operations
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
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">⚡ Daily Operations</h1>
            <p className="text-slate-400">Field activity tracking and reporting</p>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
            />
            
            <button
              onClick={() => setShowCollaboration(!showCollaboration)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Video className="w-5 h-5" />
              <span className="hidden sm:inline">Field Call</span>
            </button>
            
            <button
              onClick={() => setShowReportForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <FileText className="w-5 h-5" />
              Create Report
            </button>
          </div>
        </div>

        {/* Daily Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Active Crews</span>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-white">{dailyStats.totalCrews}</div>
            <div className="text-sm text-slate-400 mt-1">workers on site</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Work Hours</span>
              <Clock className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-white">{dailyStats.totalHours}</div>
            <div className="text-sm text-slate-400 mt-1">total manhours</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Equipment</span>
              <Truck className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-white">{dailyStats.equipmentHours}</div>
            <div className="text-sm text-slate-400 mt-1">hours utilized</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Weather</span>
              <WeatherIcon className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {dailyReports[0]?.temperature_high || '--'}°F
            </div>
            <div className="text-sm text-slate-400 mt-1">
              {dailyReports[0]?.weather_conditions || 'No data'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Timeline */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Today's Activity Timeline
            </h2>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {todaysActivities.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                  <p>No activities recorded yet</p>
                </div>
              ) : (
                todaysActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center ${activity.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {index < todaysActivities.length - 1 && (
                          <div className="w-px h-full bg-slate-700 mt-2"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 pb-6">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">{activity.time}</span>
                          {activity.location && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span className="text-sm text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {activity.location}
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-slate-300">{activity.description}</p>
                        {activity.crew && (
                          <p className="text-sm text-slate-400 mt-1">
                            <Users className="w-3 h-3 inline mr-1" />
                            {activity.crew}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="flex flex-wrap gap-2">
                <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition">
                  <Camera className="w-4 h-4" />
                  Add Photo
                </button>
                <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition">
                  <AlertCircle className="w-4 h-4" />
                  Report Incident
                </button>
                <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition">
                  <Zap className="w-4 h-4" />
                  Log Activity
                </button>
              </div>
            </div>
          </div>

          {/* Daily Reports */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Daily Reports</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700 mx-auto"></div>
              </div>
            ) : dailyReports.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p>No reports for this date</p>
                <button
                  onClick={() => setShowReportForm(true)}
                  className="mt-4 text-blue-500 hover:text-blue-400 text-sm"
                >
                  Create first report
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {dailyReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-slate-700/30 rounded-lg p-4 cursor-pointer hover:bg-slate-700/50 transition"
                    onClick={() => {
                      setEditingReport(report);
                      setFormData({
                        project_id: report.project_id,
                        weather_conditions: report.weather_conditions,
                        temperature_high: report.temperature_high,
                        temperature_low: report.temperature_low,
                        crew_count: report.crew_count,
                        work_hours: report.work_hours,
                        equipment_hours: report.equipment_hours,
                        activities_completed: report.activities_completed.length > 0 ? report.activities_completed : [''],
                        delays: report.delays?.length ? report.delays : [''],
                        visitor_count: report.visitor_count,
                        materials_delivered: report.materials_delivered.length > 0 ? report.materials_delivered : [''],
                        progress_notes: report.progress_notes
                      });
                      setShowReportForm(true);
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white">{report.project_name}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${
                        report.status === 'approved' ? 'bg-green-900/50 text-green-400' :
                        report.status === 'submitted' ? 'bg-blue-900/50 text-blue-400' :
                        'bg-gray-900/50 text-gray-400'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-slate-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        <span>{report.crew_count} workers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{report.work_hours} hours</span>
                      </div>
                      {report.safety_incidents > 0 && (
                        <div className="flex items-center gap-2 text-red-400">
                          <AlertCircle className="w-3 h-3" />
                          <span>{report.safety_incidents} incidents</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Report Form Modal */}
        {showReportForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-4">
                {editingReport ? 'Edit Daily Report' : 'Create Daily Report'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Weather Conditions
                    </label>
                    <select
                      value={formData.weather_conditions}
                      onChange={(e) => setFormData({...formData, weather_conditions: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    >
                      {WEATHER_CONDITIONS.map(weather => (
                        <option key={weather.value} value={weather.value}>{weather.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">
                        High Temp (°F)
                      </label>
                      <input
                        type="number"
                        value={formData.temperature_high}
                        onChange={(e) => setFormData({...formData, temperature_high: Number(e.target.value)})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">
                        Low Temp (°F)
                      </label>
                      <input
                        type="number"
                        value={formData.temperature_low}
                        onChange={(e) => setFormData({...formData, temperature_low: Number(e.target.value)})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Crew Count
                    </label>
                    <input
                      type="number"
                      value={formData.crew_count}
                      onChange={(e) => setFormData({...formData, crew_count: Number(e.target.value)})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Work Hours
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.work_hours}
                      onChange={(e) => setFormData({...formData, work_hours: Number(e.target.value)})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Equipment Hours
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.equipment_hours}
                      onChange={(e) => setFormData({...formData, equipment_hours: Number(e.target.value)})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Activities Completed
                  </label>
                  {formData.activities_completed.map((activity, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={activity}
                        onChange={(e) => updateArrayField('activities_completed', index, e.target.value)}
                        placeholder="Describe activity"
                        className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      />
                      {formData.activities_completed.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField('activities_completed', index)}
                          className="px-3 py-2 bg-red-900/50 hover:bg-red-900 rounded-lg transition"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('activities_completed')}
                    className="text-blue-500 hover:text-blue-400 text-sm"
                  >
                    + Add activity
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Progress Notes
                  </label>
                  <textarea
                    value={formData.progress_notes}
                    onChange={(e) => setFormData({...formData, progress_notes: e.target.value})}
                    rows={3}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    placeholder="Overall progress and key observations..."
                    required
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    {editingReport ? 'Update' : 'Create'} Report
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
