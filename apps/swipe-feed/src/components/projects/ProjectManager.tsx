import React, { useState, useEffect } from 'react';
import {
  Folder, FolderPlus, Archive, Users, Settings, ChevronRight,
  Calendar, Zap, Shield, Search, Filter, Plus, MoreVertical,
  Building2, UserPlus, Mail, Clock, CheckCircle, AlertCircle, MessageSquare
} from 'lucide-react';
import { projectService, Project } from '../../lib/services/projectService';
import { ProjectCreator } from './ProjectCreator';
import { TeamManager } from './TeamManager';
import { CrewManager } from './CrewManager';
import { CollaborationHub } from '../collaboration/CollaborationHub';
import { EmptyState } from '../EmptyState';

export const ProjectManager: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [view, setView] = useState<'list' | 'create' | 'team' | 'crews' | 'collaboration'>('list');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [showArchived]);

  useEffect(() => {
    if (selectedProject) {
      fetchUserRole(selectedProject.id);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    setLoading(true);
    const data = await projectService.getUserProjects(showArchived);
    setProjects(data);
    setLoading(false);
  };

  const fetchUserRole = async (projectId: string) => {
    const role = await projectService.getUserProjectRole(projectId);
    setUserRole(role);
  };

  const handleArchiveProject = async (project: Project) => {
    const success = await projectService.archiveProject(project.id, !project.is_archived);
    if (success) {
      fetchProjects();
    }
  };

  const handleCreateProject = () => {
    setView('create');
    setSelectedProject(null);
  };

  const handleProjectCreated = (project: Project) => {
    fetchProjects();
    setSelectedProject(project);
    setView('team');
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.project_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'text-blue-400 bg-blue-400/10';
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'on_hold': return 'text-yellow-400 bg-yellow-400/10';
      case 'completed': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getVoltageColor = (voltage: string) => {
    if (!voltage) return 'text-gray-400';
    const kv = parseInt(voltage);
    if (kv >= 500) return 'text-red-400';
    if (kv >= 230) return 'text-orange-400';
    if (kv >= 115) return 'text-yellow-400';
    return 'text-green-400';
  };

  if (view === 'create') {
    return (
      <ProjectCreator
        onBack={() => setView('list')}
        onProjectCreated={handleProjectCreated}
      />
    );
  }

  if (view === 'team' && selectedProject) {
    return (
      <TeamManager
        project={selectedProject}
        userRole={userRole}
        onBack={() => setView('list')}
        onManageCrews={() => setView('crews')}
        onOpenCollaboration={() => setView('collaboration')}
      />
    );
  }

  if (view === 'crews' && selectedProject) {
    return (
      <CrewManager
        project={selectedProject}
        userRole={userRole}
        onBack={() => setView('team')}
      />
    );
  }

  if (view === 'collaboration' && selectedProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header with Back Button */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setView('team')}
                  className="btn btn-ghost px-2 py-2"
                  type="button"
                  aria-label="Back to team"
                >
                  <ChevronRight className="w-5 h-5 text-gray-400 rotate-180" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">{selectedProject.name}</h1>
                  <p className="text-gray-400 text-sm">Team Collaboration • {selectedProject.project_number}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Collaboration Hub */}
          <CollaborationHub 
            projectId={selectedProject.id} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Project management</h1>
                <p className="text-gray-400 text-sm">Manage construction projects and teams</p>
              </div>
            </div>
            <button
              onClick={handleCreateProject}
              className="btn btn-primary"
            >
              <FolderPlus className="w-5 h-5" />
              <span>Create project</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-600 bg-gray-700/50 pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`btn btn-secondary ${showArchived ? '!bg-gray-600 !text-white' : ''}`}
            >
              <Archive className="w-5 h-5" />
              <span>{showArchived ? 'Hide archived' : 'Show archived'}</span>
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="skeleton h-48 rounded-2xl border border-gray-700/40 bg-gray-800/40" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            body={searchTerm ? 'Adjust your filters to find a project.' : 'Create a project to start coordinating crews.'}
            action={
              !searchTerm ? (
                <button onClick={handleCreateProject} className="btn btn-primary">
                  <FolderPlus className="mr-1.5 h-4 w-4" />
                  Create project
                </button>
              ) : null
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-gray-700 transition-all duration-200 group cursor-pointer"
                onClick={() => {
                  setSelectedProject(project);
                  setView('team');
                }}
              >
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-400">#{project.project_number}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle menu
                      }}
                      className="btn btn-ghost px-2 py-2"
                      aria-label="Project actions"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Type</span>
                    <span className="text-white capitalize">{project.project_type.replace('_', ' ')}</span>
                  </div>
                  {project.voltage_class && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Voltage</span>
                      <span className={getVoltageColor(project.voltage_class)}>
                        {project.voltage_class}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProjectStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Project Footer */}
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>

                {/* Archived Badge */}
                {project.is_archived && (
                  <div className="absolute top-4 right-4 px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                    Archived
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Projects</p>
                <p className="text-2xl font-bold text-white">
                  {projects.filter(p => p.status === 'active' && !p.is_archived).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Planning</p>
                <p className="text-2xl font-bold text-white">
                  {projects.filter(p => p.status === 'planning' && !p.is_archived).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">On Hold</p>
                <p className="text-2xl font-bold text-white">
                  {projects.filter(p => p.status === 'on_hold' && !p.is_archived).length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Archived</p>
                <p className="text-2xl font-bold text-white">
                  {projects.filter(p => p.is_archived).length}
                </p>
              </div>
              <Archive className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
