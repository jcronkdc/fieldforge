import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  FileText,
  Settings,
  MoreVertical,
  Archive,
  Star,
  MessageSquare
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Project {
  id: string;
  name: string;
  projectNumber: string;
  type: 'transmission' | 'distribution' | 'substation' | 'mixed';
  voltageClass: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  startDate: string;
  endDate: string;
  progress: number;
  budget: number;
  spent: number;
  teamSize: number;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastActivity: string;
}

// Demo projects for electrical contractors
const demoProjects: Project[] = [
  {
    id: '1',
    name: 'Alpha-7 Substation Upgrade',
    projectNumber: 'SUB-2025-001',
    type: 'substation',
    voltageClass: '138kV/25kV',
    status: 'active',
    startDate: '2025-01-15',
    endDate: '2025-06-30',
    progress: 25,
    budget: 2500000,
    spent: 625000,
    teamSize: 12,
    location: 'Brainerd, MN',
    priority: 'high',
    lastActivity: '2 hours ago'
  },
  {
    id: '2',
    name: 'Wind Farm Collector System',
    projectNumber: 'WFS-2025-002', 
    type: 'transmission',
    voltageClass: '345kV',
    status: 'planning',
    startDate: '2025-03-01',
    endDate: '2025-09-15',
    progress: 5,
    budget: 4200000,
    spent: 210000,
    teamSize: 18,
    location: 'Pine County, MN',
    priority: 'medium',
    lastActivity: '1 day ago'
  }
];

export const ProjectDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(demoProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.projectNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'active': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'on_hold': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'completed': return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-slate-400';
      default: return 'text-slate-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-400" />
            Electrical Projects
          </h1>
          <p className="text-slate-300 mt-1">
            Manage substations, transmission lines, and distribution projects
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/projects/create')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredProjects.map((project) => (
          <div 
            key={project.id}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02]"
          >
            {/* Project Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">{project.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-slate-400">{project.projectNumber}</span>
                    <span className="text-sm text-yellow-400 font-mono">{project.voltageClass}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Star className={`w-4 h-4 ${project.priority === 'high' || project.priority === 'critical' ? 'text-yellow-400 fill-current' : 'text-slate-500'}`} />
                <button className="p-1 hover:bg-slate-700 rounded transition-colors">
                  <MoreVertical className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Status and Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                  {project.status.toUpperCase()}
                </span>
                <span className={`text-sm font-semibold ${getPriorityColor(project.priority)}`}>
                  {project.priority.toUpperCase()} PRIORITY
                </span>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-white font-semibold">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Budget</span>
                <span className="text-white font-semibold">{formatCurrency(project.budget)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Spent</span>
                <span className="text-green-400 font-semibold">{formatCurrency(project.spent)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Team Size</span>
                <span className="text-blue-400 font-semibold">{project.teamSize} members</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Location</span>
                <span className="text-slate-300">{project.location}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{project.startDate}</span>
                <span>{project.endDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-300">Last activity: {project.lastActivity}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={() => navigate(`/projects/${project.id}`)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                View Project
              </button>
              <button 
                onClick={() => navigate(`/messages?project=${project.id}`)}
                className="flex items-center justify-center w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Projects Found</h3>
          <p className="text-slate-400 mb-6">
            {searchQuery ? 'Try adjusting your search or filters' : 'Create your first electrical construction project'}
          </p>
          <button
            onClick={() => navigate('/projects/create')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create First Project
          </button>
        </div>
      )}
    </div>
  );
};
