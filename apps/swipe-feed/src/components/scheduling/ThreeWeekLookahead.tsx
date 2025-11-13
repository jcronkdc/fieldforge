import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, AlertCircle, CheckCircle, Plus, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface Activity {
  id: number;
  activity_name: string;
  description?: string;
  start_date: string;
  end_date: string;
  crew_size: number;
  crew_type: string;
  location: string;
  predecessor_id?: number;
  status: 'planned' | 'ready' | 'in_progress' | 'completed' | 'delayed';
  constraints?: string[];
  resources_confirmed: boolean;
  safety_reviewed: boolean;
  permits_obtained: boolean;
  project_id: number;
  project_name?: string;
  created_by: number;
  company_id: number;
  created_at: string;
  updated_at: string;
}

interface Constraint {
  type: 'material' | 'equipment' | 'labor' | 'permit' | 'predecessor' | 'weather' | 'other';
  description: string;
  resolved: boolean;
}

const CONSTRAINT_TYPES = [
  { value: 'material', label: 'Material', icon: '📦', color: 'text-blue-400' },
  { value: 'equipment', label: 'Equipment', icon: '🔧', color: 'text-yellow-400' },
  { value: 'labor', label: 'Labor', icon: '👷', color: 'text-green-400' },
  { value: 'permit', label: 'Permit', icon: '📋', color: 'text-purple-400' },
  { value: 'predecessor', label: 'Predecessor', icon: '⏳', color: 'text-orange-400' },
  { value: 'weather', label: 'Weather', icon: '🌧️', color: 'text-cyan-400' },
  { value: 'other', label: 'Other', icon: '❓', color: 'text-gray-400' }
];

export const ThreeWeekLookahead: React.FC = () => {
  const { session } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(0); // 0 = current week, 1 = next week, etc.
  const [formData, setFormData] = useState({
    activity_name: '',
    description: '',
    start_date: '',
    end_date: '',
    crew_size: 1,
    crew_type: '',
    location: '',
    project_id: 0,
    constraints: [] as Constraint[]
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/scheduling/three-week', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch activities');
      const data = await response.json();
      
      // Parse constraints if they're stored as JSON strings
      const parsedData = data.map((activity: any) => ({
        ...activity,
        constraints: activity.constraints ? 
          (typeof activity.constraints === 'string' ? JSON.parse(activity.constraints) : activity.constraints) 
          : []
      }));
      
      setActivities(parsedData);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = selectedActivity ? 'PUT' : 'POST';
      const url = selectedActivity 
        ? `/api/scheduling/three-week/${selectedActivity.id}`
        : '/api/scheduling/three-week';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          constraints: JSON.stringify(formData.constraints)
        })
      });

      if (!response.ok) throw new Error('Failed to save activity');

      toast.success(selectedActivity ? 'Activity updated' : 'Activity created successfully');
      fetchActivities();
      resetForm();
    } catch (error) {
      console.error('Error saving activity:', error);
      toast.error('Failed to save activity');
    }
  };

  const updateActivityStatus = async (activityId: number, status: Activity['status']) => {
    try {
      const response = await fetch(`/api/scheduling/three-week/${activityId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast.success('Activity status updated');
      fetchActivities();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setSelectedActivity(null);
    setFormData({
      activity_name: '',
      description: '',
      start_date: '',
      end_date: '',
      crew_size: 1,
      crew_type: '',
      location: '',
      project_id: 0,
      constraints: []
    });
  };

  const editActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setFormData({
      activity_name: activity.activity_name,
      description: activity.description || '',
      start_date: activity.start_date.split('T')[0],
      end_date: activity.end_date.split('T')[0],
      crew_size: activity.crew_size,
      crew_type: activity.crew_type,
      location: activity.location,
      project_id: activity.project_id,
      constraints: activity.constraints || []
    });
    setShowForm(true);
  };

  const addConstraint = () => {
    setFormData({
      ...formData,
      constraints: [...formData.constraints, { type: 'material', description: '', resolved: false }]
    });
  };

  const updateConstraint = (index: number, field: keyof Constraint, value: any) => {
    const newConstraints = [...formData.constraints];
    newConstraints[index] = { ...newConstraints[index], [field]: value };
    setFormData({ ...formData, constraints: newConstraints });
  };

  const removeConstraint = (index: number) => {
    setFormData({
      ...formData,
      constraints: formData.constraints.filter((_, i) => i !== index)
    });
  };

  // Get week dates
  const getWeekDates = (weekOffset: number) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeek);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  // Filter activities for current week
  const weekActivities = activities.filter(activity => {
    const startDate = new Date(activity.start_date);
    const endDate = new Date(activity.end_date);
    return (startDate <= weekEnd && endDate >= weekStart);
  });

  // Group activities by date
  const activitiesByDate = weekDates.map(date => {
    const dateStr = date.toISOString().split('T')[0];
    return {
      date,
      activities: weekActivities.filter(activity => {
        const start = new Date(activity.start_date);
        const end = new Date(activity.end_date);
        return start <= date && end >= date;
      })
    };
  });

  const getStatusColor = (status: Activity['status']) => {
    const colors = {
      planned: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
      ready: 'bg-green-500/20 text-green-300 border-green-500/50',
      in_progress: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      completed: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
      delayed: 'bg-red-500/20 text-red-300 border-red-500/50'
    };
    return colors[status];
  };

  const getReadinessScore = (activity: Activity) => {
    let score = 0;
    if (activity.resources_confirmed) score += 33;
    if (activity.safety_reviewed) score += 33;
    if (activity.permits_obtained) score += 34;
    return score;
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">📅 Three Week Lookahead</h1>
            <p className="text-slate-400">Plan and track upcoming activities</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            Add Activity
          </button>
        </div>

        {/* Week Navigation */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentWeek(currentWeek - 1)}
              disabled={currentWeek <= -1}
              className="p-2 hover:bg-slate-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">
                {currentWeek === 0 ? 'Current Week' : 
                 currentWeek === 1 ? 'Next Week' : 
                 currentWeek === 2 ? 'Week After Next' :
                 `Week ${currentWeek > 0 ? '+' : ''}${currentWeek}`}
              </h2>
              <p className="text-slate-400">
                {weekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
              </p>
            </div>
            
            <button
              onClick={() => setCurrentWeek(currentWeek + 1)}
              disabled={currentWeek >= 2}
              className="p-2 hover:bg-slate-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Total Activities</span>
              <Calendar className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-white">{weekActivities.length}</div>
            <div className="text-sm text-slate-400">This week</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Ready to Start</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {weekActivities.filter(a => a.status === 'ready').length}
            </div>
            <div className="text-sm text-slate-400">Constraints cleared</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">In Progress</span>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {weekActivities.filter(a => a.status === 'in_progress').length}
            </div>
            <div className="text-sm text-slate-400">Active work</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Constraints</span>
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {weekActivities.reduce((sum, a) => sum + (a.constraints?.filter(c => !c.resolved).length || 0), 0)}
            </div>
            <div className="text-sm text-slate-400">To resolve</div>
          </div>
        </div>

        {/* Weekly Calendar View */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-700">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
              <div key={day} className="p-3 text-center border-r border-slate-700 last:border-r-0">
                <div className="text-sm font-medium text-slate-400">{day}</div>
                <div className="text-lg font-bold text-white">
                  {weekDates[index].getDate()}
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 min-h-[400px]">
            {activitiesByDate.map((day, dayIndex) => (
              <div key={dayIndex} className="border-r border-slate-700 last:border-r-0 p-3">
                <div className="space-y-2">
                  {day.activities.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center mt-4">No activities</p>
                  ) : (
                    day.activities.map((activity) => {
                      const readiness = getReadinessScore(activity);
                      return (
                        <div
                          key={activity.id}
                          onClick={() => editActivity(activity)}
                          className="bg-slate-700/50 border border-slate-600 rounded-lg p-2 cursor-pointer hover:border-slate-500 transition"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(activity.status)}`}>
                              {activity.status}
                            </span>
                            {readiness < 100 && (
                              <span className={`text-xs ${
                                readiness >= 66 ? 'text-yellow-400' :
                                readiness >= 33 ? 'text-orange-400' :
                                'text-red-400'
                              }`}>
                                {readiness}%
                              </span>
                            )}
                          </div>
                          
                          <h4 className="text-sm font-medium text-white truncate">
                            {activity.activity_name}
                          </h4>
                          
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                            <Users className="w-3 h-3" />
                            <span>{activity.crew_size} {activity.crew_type}</span>
                          </div>
                          
                          {activity.constraints && activity.constraints.filter(c => !c.resolved).length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-red-400 mt-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>{activity.constraints.filter(c => !c.resolved).length} constraints</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-4">
                {selectedActivity ? 'Edit Activity' : 'New Activity'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Activity Name
                  </label>
                  <input
                    type="text"
                    value={formData.activity_name}
                    onChange={(e) => setFormData({...formData, activity_name: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={2}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    placeholder="Activity details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      min={formData.start_date}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Crew Size
                    </label>
                    <input
                      type="number"
                      value={formData.crew_size}
                      onChange={(e) => setFormData({...formData, crew_size: Number(e.target.value)})}
                      min="1"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Crew Type
                    </label>
                    <input
                      type="text"
                      value={formData.crew_type}
                      onChange={(e) => setFormData({...formData, crew_type: e.target.value})}
                      placeholder="Electrical, Civil, etc"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Work area"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-400">
                      Constraints
                    </label>
                    <button
                      type="button"
                      onClick={addConstraint}
                      className="text-amber-500 hover:text-amber-400 text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Constraint
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {formData.constraints.map((constraint, index) => {
                      const constraintType = CONSTRAINT_TYPES.find(t => t.value === constraint.type);
                      return (
                        <div key={index} className="flex gap-2 items-center">
                          <select
                            value={constraint.type}
                            onChange={(e) => updateConstraint(index, 'type', e.target.value)}
                            className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
                          >
                            {CONSTRAINT_TYPES.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.icon} {type.label}
                              </option>
                            ))}
                          </select>
                          
                          <input
                            type="text"
                            value={constraint.description}
                            onChange={(e) => updateConstraint(index, 'description', e.target.value)}
                            placeholder="Constraint description"
                            className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
                          />
                          
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={constraint.resolved}
                              onChange={(e) => updateConstraint(index, 'resolved', e.target.checked)}
                              className="rounded bg-slate-700 border-slate-600"
                            />
                            <span className="text-slate-400">Resolved</span>
                          </label>
                          
                          <button
                            type="button"
                            onClick={() => removeConstraint(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <AlertCircle className="w-5 h-5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedActivity && (
                  <div>
                    <label className="text-sm font-medium text-slate-400">Quick Status Update</label>
                    <div className="flex gap-2 mt-2">
                      {(['planned', 'ready', 'in_progress', 'completed', 'delayed'] as const).map(status => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            updateActivityStatus(selectedActivity.id, status);
                            resetForm();
                          }}
                          className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(status)} hover:opacity-80 transition`}
                        >
                          {status.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
                    className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    {selectedActivity ? 'Update' : 'Create'} Activity
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