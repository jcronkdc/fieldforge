import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, Calendar, MapPin, Cloud, Users, DollarSign, Compass, Ruler } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { format, differenceInMinutes, startOfWeek, endOfWeek } from 'date-fns';

interface TimeEntry {
  id: string;
  user_id: string;
  project_id: string;
  crew_id?: string;
  start_time: string;
  end_time?: string;
  break_duration: number;
  task_description: string;
  location?: { lat: number; lng: number };
  weather_conditions?: {
    temp: number;
    conditions: string;
    wind_speed: number;
  };
  created_at: string;
  project?: {
    name: string;
    project_number: string;
  };
}

export const TimeTracking: React.FC = () => {
  const { session } = useAuth();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [weeklyHours, setWeeklyHours] = useState(0);
  const [todayHours, setTodayHours] = useState(0);

  // Real-time subscription
  useEffect(() => {
    if (!session?.user?.id) return;

    fetchEntries();
    fetchProjects();
    
    // Subscribe to real-time changes
    const subscription = supabase
      .channel('time_entries')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'time_entries',
        filter: `user_id=eq.${session.user.id}`
      }, () => {
        fetchEntries();
      })
      .subscribe();
      
    return () => { 
      subscription.unsubscribe(); 
    };
  }, [session?.user?.id]);

  const fetchEntries = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const weekStart = startOfWeek(new Date()).toISOString();
    const weekEnd = endOfWeek(new Date()).toISOString();

    // Fetch entries with project details
    const { data, error } = await supabase
      .from('time_entries')
      .select(`
        *,
        project:projects(name, project_number)
      `)
      .eq('user_id', session.user.id)
      .gte('start_time', weekStart)
      .lte('start_time', weekEnd)
      .order('start_time', { ascending: false });

    if (!error && data) {
      setEntries(data);
      
      // Find active entry
      const active = data.find(e => !e.end_time);
      setActiveEntry(active || null);
      
      // Calculate hours
      calculateHours(data, today);
    }
    setLoading(false);
  };

  const fetchProjects = async () => {
    if (!session?.user?.id) return;

    const { data } = await supabase
      .from('projects')
      .select(`
        *,
        project_team!inner(user_id)
      `)
      .eq('project_team.user_id', session.user.id)
      .eq('project_team.status', 'active');

    if (data) {
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0].id);
      }
    }
  };

  const calculateHours = (entries: TimeEntry[], today: string) => {
    let todayMinutes = 0;
    let weekMinutes = 0;

    entries.forEach(entry => {
      if (entry.end_time) {
        const duration = differenceInMinutes(
          new Date(entry.end_time),
          new Date(entry.start_time)
        ) - entry.break_duration;
        
        weekMinutes += duration;
        
        if (entry.start_time.startsWith(today)) {
          todayMinutes += duration;
        }
      } else if (activeEntry?.id === entry.id) {
        // Add current session time
        const currentDuration = differenceInMinutes(
          new Date(),
          new Date(entry.start_time)
        );
        weekMinutes += currentDuration;
        
        if (entry.start_time.startsWith(today)) {
          todayMinutes += currentDuration;
        }
      }
    });

    setTodayHours(todayMinutes / 60);
    setWeeklyHours(weekMinutes / 60);
  };

  const startTimer = async () => {
    if (!session?.user?.id || !selectedProject || !currentTask.trim()) return;

    setLoading(true);
    
    // Get current location
    let location = null;
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      } catch (err) {
        console.log('Location not available');
      }
    }

    // Get weather data (mock for now)
    const weather = {
      temp: 72,
      conditions: 'Partly Cloudy',
      wind_speed: 10
    };

    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        user_id: session.user.id,
        project_id: selectedProject,
        start_time: new Date().toISOString(),
        task_description: currentTask,
        location,
        weather_conditions: weather,
        break_duration: 0
      })
      .select()
      .single();

    if (!error && data) {
      setCurrentTask('');
      await fetchEntries();
    }
    setLoading(false);
  };

  const stopTimer = async () => {
    if (!activeEntry) return;

    setLoading(true);
    const { error } = await supabase
      .from('time_entries')
      .update({ 
        end_time: new Date().toISOString() 
      })
      .eq('id', activeEntry.id);

    if (!error) {
      await fetchEntries();
    }
    setLoading(false);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getCurrentDuration = () => {
    if (!activeEntry) return '0h 0m';
    const minutes = differenceInMinutes(new Date(), new Date(activeEntry.start_time));
    return formatDuration(minutes);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-8 py-12">
      
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-gray-800 pb-8">
        <div className="space-y-3">
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Time Management</p>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Time Tracking
          </h1>
          <p className="max-w-3xl text-base text-gray-400">Track your work hours and manage timesheets.</p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Today</p>
              <p className="text-2xl font-bold text-white">{todayHours.toFixed(1)}h</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">This Week</p>
              <p className="text-2xl font-bold text-white">{weeklyHours.toFixed(1)}h</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Earnings (est.)</p>
              <p className="text-2xl font-bold text-white">${(weeklyHours * 45).toFixed(0)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Timer Control */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        {activeEntry ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">Timer Running</h3>
                <p className="text-sm text-gray-400 mt-1">{activeEntry.task_description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {activeEntry.project?.name} • Started {format(new Date(activeEntry.start_time), 'h:mm a')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-mono font-bold text-blue-500">{getCurrentDuration()}</p>
                <button
                  onClick={stopTimer}
                  disabled={loading}
                  className="mt-2 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  Stop Timer
                </button>
              </div>
            </div>

            {/* Location and Weather Info */}
            <div className="flex items-center gap-4 text-sm text-gray-400">
              {activeEntry.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Location tracked</span>
                </div>
              )}
              {activeEntry.weather_conditions && (
                <div className="flex items-center gap-1">
                  <Cloud className="w-4 h-4" />
                  <span>{activeEntry.weather_conditions.temp}°F, {activeEntry.weather_conditions.conditions}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-gray-700 focus:outline-none"
                disabled={projects.length === 0}
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.project_number})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">What are you working on?</label>
              <input
                type="text"
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
                placeholder="e.g., Installing conduit in Building A"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-gray-700 focus:outline-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !loading && selectedProject && currentTask.trim()) {
                    startTimer();
                  }
                }}
              />
            </div>

            <button
              onClick={startTimer}
              disabled={loading || !selectedProject || !currentTask.trim()}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Play className="w-5 h-5" />
              Start Timer
            </button>
          </div>
        )}
      </div>

      {/* Recent Entries */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-4">Today's Entries</h3>
        
        {loading && entries.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Loading entries...</div>
        ) : entries.filter(e => e.start_time.startsWith(new Date().toISOString().split('T')[0])).length === 0 ? (
          <div className="text-center py-8 text-gray-400">No entries for today yet</div>
        ) : (
          <div className="space-y-3">
            {entries
              .filter(e => e.start_time.startsWith(new Date().toISOString().split('T')[0]))
              .map(entry => {
                const duration = entry.end_time 
                  ? differenceInMinutes(new Date(entry.end_time), new Date(entry.start_time)) - entry.break_duration
                  : differenceInMinutes(new Date(), new Date(entry.start_time));
                
                return (
                  <div 
                    key={entry.id}
                    className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">{entry.task_description}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {entry.project?.name} • {format(new Date(entry.start_time), 'h:mm a')} - {
                          entry.end_time ? format(new Date(entry.end_time), 'h:mm a') : 'In Progress'
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium text-white">{formatDuration(duration)}</p>
                      {!entry.end_time && (
                        <p className="text-xs text-blue-500 animate-pulse">Active</p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};



