import React, { useState, useEffect } from 'react';
import { HardHat, Clock, Calendar, MapPin, Users, Thermometer, CloudRain, Wind, AlertTriangle, CheckCircle, Plus, Camera, FileText, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyReport {
  id: string;
  report_date: string;
  project_id: string;
  project_name: string;
  supervisor_id: string;
  supervisor_name: string;
  weather_conditions: {
    temperature: number;
    conditions: 'clear' | 'cloudy' | 'rain' | 'snow' | 'windy';
    wind_speed?: number;
    work_impact: 'none' | 'minor' | 'moderate' | 'severe';
  };
  work_summary: string;
  crew_count: number;
  crew_details: CrewMember[];
  activities_completed: Activity[];
  equipment_used: Equipment[];
  materials_used: Material[];
  safety_incidents: number;
  safety_notes: string;
  delays: Delay[];
  photos: Photo[];
  tomorrow_plan: string;
  additional_notes: string;
  status: 'draft' | 'submitted' | 'approved';
  created_at: string;
  updated_at: string;
}

interface CrewMember {
  id: string;
  name: string;
  role: string;
  hours_worked: number;
  overtime_hours: number;
}

interface Activity {
  id: string;
  description: string;
  location: string;
  completed_percentage: number;
  notes?: string;
}

interface Equipment {
  id: string;
  name: string;
  hours_used: number;
  issues?: string;
}

interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface Delay {
  id: string;
  reason: string;
  duration_hours: number;
  impact: 'low' | 'medium' | 'high';
}

interface Photo {
  id: string;
  caption: string;
  url: string;
  uploaded_at: string;
}

export const DailyOperations: React.FC = () => {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState<DailyReport | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary', 'crew', 'activities']));
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    weather_temperature: 70,
    weather_conditions: 'clear' as const,
    weather_wind_speed: 5,
    weather_work_impact: 'none' as const,
    work_summary: '',
    crew_count: 0,
    safety_incidents: 0,
    safety_notes: '',
    tomorrow_plan: '',
    additional_notes: ''
  });

  const [activities, setActivities] = useState<Activity[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [delays, setDelays] = useState<Delay[]>([]);

  useEffect(() => {
    fetchReports();
    const subscription = supabase
      .channel('daily_reports')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'daily_reports' },
        () => fetchReports()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedDate]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('report_date', selectedDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const addActivity = () => {
    setActivities([...activities, {
      id: crypto.randomUUID(),
      description: '',
      location: '',
      completed_percentage: 0
    }]);
  };

  const updateActivity = (id: string, field: keyof Activity, value: any) => {
    setActivities(activities.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ));
  };

  const removeActivity = (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const reportData = {
        report_date: selectedDate,
        project_id: 'current-project', // TODO: Get from context
        weather_conditions: {
          temperature: formData.weather_temperature,
          conditions: formData.weather_conditions,
          wind_speed: formData.weather_wind_speed,
          work_impact: formData.weather_work_impact
        },
        work_summary: formData.work_summary,
        crew_count: formData.crew_count,
        activities_completed: activities.filter(a => a.description),
        equipment_used: equipment,
        materials_used: materials,
        safety_incidents: formData.safety_incidents,
        safety_notes: formData.safety_notes,
        delays: delays,
        tomorrow_plan: formData.tomorrow_plan,
        additional_notes: formData.additional_notes,
        status: 'draft'
      };

      if (editingReport) {
        const { error } = await supabase
          .from('daily_reports')
          .update(reportData)
          .eq('id', editingReport.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('daily_reports')
          .insert([reportData]);
          
        if (error) throw error;
      }

      setShowForm(false);
      resetForm();
      fetchReports();
    } catch (error) {
      console.error('Error saving report:', error);
    }
  };

  const submitReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('daily_reports')
        .update({ status: 'submitted' })
        .eq('id', reportId);
        
      if (error) throw error;
      fetchReports();
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      weather_temperature: 70,
      weather_conditions: 'clear',
      weather_wind_speed: 5,
      weather_work_impact: 'none',
      work_summary: '',
      crew_count: 0,
      safety_incidents: 0,
      safety_notes: '',
      tomorrow_plan: '',
      additional_notes: ''
    });
    setActivities([]);
    setEquipment([]);
    setMaterials([]);
    setDelays([]);
    setEditingReport(null);
  };

  const getWeatherIcon = (conditions: string) => {
    switch (conditions) {
      case 'rain': return <CloudRain className="w-5 h-5" />;
      case 'windy': return <Wind className="w-5 h-5" />;
      case 'clear': return <Thermometer className="w-5 h-5" />;
      default: return <Thermometer className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'submitted': return 'bg-amber-500';
      case 'approved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const renderReportForm = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => setShowForm(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6 text-amber-500" />
          {editingReport ? 'Edit Daily Report' : 'New Daily Report'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Weather Section */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 
              className="font-medium text-white mb-3 flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('weather')}
            >
              <span className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-amber-500" />
                Weather Conditions
              </span>
              {expandedSections.has('weather') ? <ChevronUp /> : <ChevronDown />}
            </h3>
            
            {expandedSections.has('weather') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Temperature (°F)
                  </label>
                  <input
                    type="number"
                    value={formData.weather_temperature}
                    onChange={(e) => setFormData(prev => ({ ...prev, weather_temperature: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Conditions
                  </label>
                  <select
                    value={formData.weather_conditions}
                    onChange={(e) => setFormData(prev => ({ ...prev, weather_conditions: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="clear">Clear</option>
                    <option value="cloudy">Cloudy</option>
                    <option value="rain">Rain</option>
                    <option value="snow">Snow</option>
                    <option value="windy">Windy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Wind Speed (mph)
                  </label>
                  <input
                    type="number"
                    value={formData.weather_wind_speed}
                    onChange={(e) => setFormData(prev => ({ ...prev, weather_wind_speed: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Work Impact
                  </label>
                  <select
                    value={formData.weather_work_impact}
                    onChange={(e) => setFormData(prev => ({ ...prev, weather_work_impact: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="none">None</option>
                    <option value="minor">Minor</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Work Summary */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Work Summary *
            </label>
            <textarea
              value={formData.work_summary}
              onChange={(e) => setFormData(prev => ({ ...prev, work_summary: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={3}
              required
              placeholder="Summarize the day's work progress..."
            />
          </div>

          {/* Activities Section */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 
              className="font-medium text-white mb-3 flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('activities')}
            >
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-amber-500" />
                Activities Completed
              </span>
              {expandedSections.has('activities') ? <ChevronUp /> : <ChevronDown />}
            </h3>
            
            {expandedSections.has('activities') && (
              <>
                {activities.map((activity, index) => (
                  <div key={activity.id} className="mb-3 p-3 bg-slate-600 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={activity.description}
                        onChange={(e) => updateActivity(activity.id, 'description', e.target.value)}
                        className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Activity description"
                      />
                      <input
                        type="text"
                        value={activity.location}
                        onChange={(e) => updateActivity(activity.id, 'location', e.target.value)}
                        className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Location"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={activity.completed_percentage}
                          onChange={(e) => updateActivity(activity.id, 'completed_percentage', parseInt(e.target.value))}
                          className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="% Complete"
                          min="0"
                          max="100"
                        />
                        <button
                          type="button"
                          onClick={() => removeActivity(activity.id)}
                          className="px-3 py-2 text-red-500 hover:bg-slate-700 rounded transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addActivity}
                  className="w-full py-2 border-2 border-dashed border-slate-600 text-slate-400 rounded-lg hover:border-amber-500 hover:text-amber-500 transition-colors"
                >
                  + Add Activity
                </button>
              </>
            )}
          </div>

          {/* Crew & Safety */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Crew Count
              </label>
              <input
                type="number"
                value={formData.crew_count}
                onChange={(e) => setFormData(prev => ({ ...prev, crew_count: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Safety Incidents
              </label>
              <input
                type="number"
                value={formData.safety_incidents}
                onChange={(e) => setFormData(prev => ({ ...prev, safety_incidents: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                min="0"
              />
            </div>
          </div>

          {formData.safety_incidents > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Safety Notes *
              </label>
              <textarea
                value={formData.safety_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, safety_notes: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows={2}
                required
                placeholder="Describe the safety incidents..."
              />
            </div>
          )}

          {/* Tomorrow's Plan */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Tomorrow's Plan
            </label>
            <textarea
              value={formData.tomorrow_plan}
              onChange={(e) => setFormData(prev => ({ ...prev, tomorrow_plan: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={2}
              placeholder="What's planned for tomorrow..."
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Additional Notes
            </label>
            <textarea
              value={formData.additional_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, additional_notes: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={2}
              placeholder="Any other important information..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-black font-medium px-6 py-2 rounded-lg transition-colors"
            >
              {editingReport ? 'Update' : 'Create'} Report
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <HardHat className="w-8 h-8 text-amber-500" />
            Daily Operations
          </h1>
          <p className="text-slate-400">Manage field activities and daily reports</p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-amber-500 hover:bg-amber-600 text-black font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Report
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
            <HardHat className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No reports for {format(new Date(selectedDate), 'MMMM d, yyyy')}</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-amber-500 hover:text-amber-400 font-medium"
            >
              Create today's report
            </button>
          </div>
        ) : (
          reports.map(report => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{report.project_name || 'Daily Report'}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(report.report_date), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {report.crew_count} crew members
                    </span>
                    <span className="flex items-center gap-1">
                      {getWeatherIcon(report.weather_conditions.conditions)}
                      {report.weather_conditions.temperature}°F
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                  <button
                    onClick={() => {
                      setEditingReport(report);
                      setFormData({
                        weather_temperature: report.weather_conditions.temperature,
                        weather_conditions: report.weather_conditions.conditions,
                        weather_wind_speed: report.weather_conditions.wind_speed || 5,
                        weather_work_impact: report.weather_conditions.work_impact,
                        work_summary: report.work_summary,
                        crew_count: report.crew_count,
                        safety_incidents: report.safety_incidents,
                        safety_notes: report.safety_notes,
                        tomorrow_plan: report.tomorrow_plan,
                        additional_notes: report.additional_notes
                      });
                      setActivities(report.activities_completed || []);
                      setShowForm(true);
                    }}
                    className="p-2 text-amber-500 hover:bg-slate-700 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-slate-300 mb-4 line-clamp-2">{report.work_summary}</p>

              {report.safety_incidents > 0 && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">{report.safety_incidents} safety incident{report.safety_incidents > 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1 bg-slate-700 rounded text-slate-300">
                  {report.activities_completed?.length || 0} activities
                </span>
                <span className="px-3 py-1 bg-slate-700 rounded text-slate-300">
                  {report.equipment_used?.length || 0} equipment
                </span>
                <span className="px-3 py-1 bg-slate-700 rounded text-slate-300">
                  {report.materials_used?.length || 0} materials
                </span>
                {report.delays && report.delays.length > 0 && (
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded">
                    {report.delays.length} delays
                  </span>
                )}
              </div>

              {report.status === 'draft' && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => submitReport(report.id)}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-medium px-4 py-2 rounded transition-colors"
                  >
                    Submit Report
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Report Form Modal */}
      <AnimatePresence>
        {showForm && renderReportForm()}
      </AnimatePresence>
    </div>
  );
};
