import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronRight, Clock, Users, AlertCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Task {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  progress: number;
  dependencies?: number[];
  assigned_to?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  project_id: number;
  color?: string;
}

interface Project {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  progress: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export const ProjectSchedule: React.FC = () => {
  const { session } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assigned_to: '',
    priority: 'medium' as Task['priority'],
    dependencies: [] as number[]
  });

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/scheduling/tasks', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      
      // Assign colors to tasks
      const tasksWithColors = data.map((task: Task, index: number) => ({
        ...task,
        color: COLORS[index % COLORS.length]
      }));
      
      setTasks(tasksWithColors);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = selectedTask ? 'PUT' : 'POST';
      const url = selectedTask 
        ? `/api/scheduling/tasks/${selectedTask.id}`
        : '/api/scheduling/tasks';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          project_id: selectedProject
        })
      });

      if (!response.ok) throw new Error('Failed to save task');

      toast.success(selectedTask ? 'Task updated' : 'Task created successfully');
      fetchTasks();
      resetForm();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const response = await fetch(`/api/scheduling/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete task');
      
      toast.success('Task deleted');
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const resetForm = () => {
    setShowTaskForm(false);
    setSelectedTask(null);
    setFormData({
      name: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assigned_to: '',
      priority: 'medium',
      dependencies: []
    });
  };

  const editTask = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      name: task.name,
      start_date: task.start_date.split('T')[0],
      end_date: task.end_date.split('T')[0],
      assigned_to: task.assigned_to || '',
      priority: task.priority,
      dependencies: task.dependencies || []
    });
    setShowTaskForm(true);
  };

  // Calculate date range for Gantt chart
  const getDateRange = () => {
    if (tasks.length === 0) {
      const start = new Date();
      const end = new Date();
      end.setMonth(end.getMonth() + 3);
      return { start, end };
    }

    const dates = tasks.flatMap(task => [new Date(task.start_date), new Date(task.end_date)]);
    const start = new Date(Math.min(...dates.map(d => d.getTime())));
    const end = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Add padding
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 7);
    
    return { start, end };
  };

  const { start: rangeStart, end: rangeEnd } = getDateRange();
  const totalDays = Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24));

  // Generate timeline headers
  const generateTimelineHeaders = () => {
    const headers = [];
    const current = new Date(rangeStart);
    
    while (current <= rangeEnd) {
      if (viewMode === 'day') {
        headers.push({
          label: current.toLocaleDateString('en', { day: 'numeric', month: 'short' }),
          date: new Date(current),
          width: 50
        });
        current.setDate(current.getDate() + 1);
      } else if (viewMode === 'week') {
        const weekEnd = new Date(current);
        weekEnd.setDate(weekEnd.getDate() + 6);
        headers.push({
          label: `Week ${Math.ceil(current.getDate() / 7)}`,
          date: new Date(current),
          width: 100
        });
        current.setDate(current.getDate() + 7);
      } else {
        headers.push({
          label: current.toLocaleDateString('en', { month: 'short', year: 'numeric' }),
          date: new Date(current),
          width: 150
        });
        current.setMonth(current.getMonth() + 1);
      }
    }
    
    return headers;
  };

  const calculateTaskPosition = (task: Task) => {
    const start = new Date(task.start_date);
    const end = new Date(task.end_date);
    
    const startOffset = Math.max(0, (start.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const pixelsPerDay = viewMode === 'day' ? 50 : viewMode === 'week' ? 100 / 7 : 150 / 30;
    
    return {
      left: startOffset * pixelsPerDay,
      width: duration * pixelsPerDay
    };
  };

  const timelineHeaders = generateTimelineHeaders();
  const totalWidth = timelineHeaders.reduce((sum, header) => sum + header.width, 0);

  // Filter tasks by selected project
  const filteredTasks = selectedProject 
    ? tasks.filter(task => task.project_id === selectedProject)
    : tasks;

  return (
    <div className="p-6">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">📅 Project Schedule</h1>
            <p className="text-slate-400">Gantt chart view of project timeline</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(Number(e.target.value))}
              className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
            
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as typeof viewMode)}
              className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
            
            <button
              onClick={() => setShowTaskForm(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Plus className="w-5 h-5" />
              Add Task
            </button>
          </div>
        </div>

        {/* Project Stats */}
        {selectedProject && projects.find(p => p.id === selectedProject) && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Total Tasks</span>
                <Calendar className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-white">{filteredTasks.length}</div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">In Progress</span>
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-white">
                {filteredTasks.filter(t => t.status === 'in_progress').length}
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Delayed</span>
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-white">
                {filteredTasks.filter(t => t.status === 'delayed').length}
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Progress</span>
                <ChevronRight className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-white">
                {projects.find(p => p.id === selectedProject)?.progress || 0}%
              </div>
            </div>
          </div>
        )}

        {/* Gantt Chart */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
          <div className="flex">
            {/* Task List */}
            <div className="w-80 border-r border-slate-700 flex-shrink-0">
              <div className="h-12 bg-slate-900 border-b border-slate-700 px-4 flex items-center">
                <h3 className="text-white font-medium">Tasks</h3>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-slate-400">Loading...</div>
                ) : filteredTasks.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                    <p>No tasks scheduled yet</p>
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="h-16 border-b border-slate-700 px-4 flex items-center justify-between hover:bg-slate-700/30 group"
                    >
                      <div className="flex-1">
                        <div className="text-white font-medium">{task.name}</div>
                        <div className="text-sm text-slate-400 flex items-center gap-2">
                          {task.assigned_to && (
                            <>
                              <Users className="w-3 h-3" />
                              <span>{task.assigned_to}</span>
                            </>
                          )}
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            task.priority === 'high' ? 'bg-red-900/50 text-red-300' :
                            task.priority === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
                            'bg-green-900/50 text-green-300'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => editTask(task)}
                          className="p-1 hover:bg-slate-600 rounded transition"
                        >
                          <Edit className="w-4 h-4 text-slate-400" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 hover:bg-red-600 rounded transition"
                        >
                          <Trash2 className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-hidden">
              <div className="h-12 bg-slate-900 border-b border-slate-700 overflow-x-auto" ref={scrollContainerRef}>
                <div className="flex h-full" style={{ width: `${totalWidth}px` }}>
                  {timelineHeaders.map((header, index) => (
                    <div
                      key={index}
                      className="border-r border-slate-700 px-2 flex items-center justify-center text-xs text-slate-400"
                      style={{ width: `${header.width}px`, flexShrink: 0 }}
                    >
                      {header.label}
                    </div>
                  ))}
                </div>
              </div>
              
              <div 
                className="max-h-[600px] overflow-y-auto overflow-x-auto"
                onScroll={(e) => {
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollLeft = (e.target as HTMLDivElement).scrollLeft;
                  }
                }}
              >
                <div style={{ width: `${totalWidth}px`, position: 'relative' }}>
                  {filteredTasks.map((task, index) => {
                    const position = calculateTaskPosition(task);
                    return (
                      <div
                        key={task.id}
                        className="h-16 border-b border-slate-700 relative"
                      >
                        <div
                          className="absolute top-2 h-12 rounded-lg flex items-center px-3 text-white text-sm font-medium cursor-pointer hover:opacity-90 transition"
                          style={{
                            left: `${position.left}px`,
                            width: `${position.width}px`,
                            backgroundColor: task.color,
                            minWidth: '80px'
                          }}
                          onClick={() => editTask(task)}
                        >
                          <span className="truncate">{task.name}</span>
                          <span className="ml-auto text-xs opacity-75">{task.progress}%</span>
                        </div>
                        
                        {/* Progress bar */}
                        <div
                          className="absolute top-14 h-1 bg-black/30 rounded-full"
                          style={{
                            left: `${position.left}px`,
                            width: `${position.width * (task.progress / 100)}px`
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Task Form Modal */}
        {showTaskForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">
                {selectedTask ? 'Edit Task' : 'New Task'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Task Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    required
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Assigned To
                    </label>
                    <input
                      type="text"
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                      placeholder="Team member name"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value as Task['priority']})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Dependencies
                  </label>
                  <select
                    multiple
                    value={formData.dependencies.map(String)}
                    onChange={(e) => setFormData({
                      ...formData, 
                      dependencies: Array.from(e.target.selectedOptions).map(opt => Number(opt.value))
                    })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white h-24"
                  >
                    {filteredTasks
                      .filter(t => !selectedTask || t.id !== selectedTask.id)
                      .map(task => (
                        <option key={task.id} value={task.id}>{task.name}</option>
                      ))
                    }
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
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
                    className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    {selectedTask ? 'Update' : 'Create'} Task
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