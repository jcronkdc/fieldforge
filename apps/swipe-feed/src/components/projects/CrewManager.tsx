import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Plus, Users, UserPlus, HardHat, Wrench,
  Trash2, Edit, MoreVertical, Shield, X, CheckCircle,
  AlertCircle, Calendar, Clock, Zap
} from 'lucide-react';
import { projectService, Project, Crew, ProjectTeamMember } from '../../lib/services/projectService';
import { EmptyState } from '../EmptyState';

interface CrewManagerProps {
  project: Project;
  userRole: string | null;
  onBack: () => void;
}

export const CrewManager: React.FC<CrewManagerProps> = ({ project, userRole, onBack }) => {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [teamMembers, setTeamMembers] = useState<ProjectTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [crewData, setCrewData] = useState({
    crew_name: '',
    crew_type: 'general' as 'electrical' | 'civil' | 'mechanical' | 'general' | 'specialized',
    description: ''
  });

  const crewTypes = [
    { value: 'electrical', label: 'Electrical', icon: Zap, color: 'text-yellow-400' },
    { value: 'civil', label: 'Civil', icon: HardHat, color: 'text-gray-400' },
    { value: 'mechanical', label: 'Mechanical', icon: Wrench, color: 'text-blue-400' },
    { value: 'general', label: 'General', icon: Users, color: 'text-green-400' },
    { value: 'specialized', label: 'Specialized', icon: Shield, color: 'text-purple-400' }
  ];

  const canManageCrews = userRole && ['owner', 'project_manager', 'superintendent', 'foreman'].includes(userRole);

  useEffect(() => {
    fetchCrews();
    fetchTeamMembers();
  }, [project.id]);

  const fetchCrews = async () => {
    setLoading(true);
    const data = await projectService.getProjectCrews(project.id);
    setCrews(data);
    setLoading(false);
  };

  const fetchTeamMembers = async () => {
    const members = await projectService.getProjectTeam(project.id);
    setTeamMembers(members.filter(m => m.status === 'active'));
  };

  const handleCreateCrew = async () => {
    if (!crewData.crew_name) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const crew = await projectService.createCrew({
      project_id: project.id,
      crew_lead_id: user.id,
      crew_name: crewData.crew_name,
      crew_type: crewData.crew_type,
      description: crewData.description,
      is_active: true
    });

    if (crew) {
      setShowCreateModal(false);
      setCrewData({ crew_name: '', crew_type: 'general', description: '' });
      fetchCrews();
    }
  };

  const handleAddMember = async (userId: string, role: 'lead' | 'member' | 'apprentice') => {
    if (!selectedCrew) return;

    const success = await projectService.addCrewMember(selectedCrew.id, userId, role);
    if (success) {
      setShowAddMemberModal(false);
      setSelectedCrew(null);
      fetchCrews();
    }
  };

  const handleRemoveMember = async (crewId: string, userId: string) => {
    if (window.confirm('Remove this member from the crew?')) {
      const success = await projectService.removeCrewMember(crewId, userId);
      if (success) {
        fetchCrews();
      }
    }
  };

  const getCrewTypeConfig = (type: string) => {
    return crewTypes.find(t => t.value === type) || crewTypes[3];
  };

  const getAvailableMembers = (crew: Crew) => {
    const crewMemberIds = crew.members?.map(m => m.user_id) || [];
    return teamMembers.filter(m => 
      m.user_id && 
      !crewMemberIds.includes(m.user_id) &&
      m.user_id !== crew.crew_lead_id
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="btn btn-ghost px-2 py-2"
                type="button"
                aria-label="Back to project"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Crew management</h1>
                <p className="text-gray-400 text-sm">{project.name} • {project.project_number}</p>
              </div>
            </div>
            {canManageCrews && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                <Plus className="w-5 h-5" />
                <span>Create crew</span>
              </button>
            )}
          </div>
        </div>

        {/* Crew Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Crews</p>
                <p className="text-2xl font-bold text-white">{crews.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Crews</p>
                <p className="text-2xl font-bold text-white">
                  {crews.filter(c => c.is_active).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Workers</p>
                <p className="text-2xl font-bold text-white">
                  {crews.reduce((acc, crew) => acc + (crew.members?.length || 0), 0)}
                </p>
              </div>
              <HardHat className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg. Crew Size</p>
                <p className="text-2xl font-bold text-white">
                  {crews.length > 0 
                    ? Math.round(crews.reduce((acc, crew) => acc + (crew.members?.length || 0), 0) / crews.length)
                    : 0
                  }
                </p>
              </div>
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Crews List */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="skeleton h-56 rounded-2xl border border-gray-700/40 bg-gray-800/40" />
            ))}
          </div>
        ) : crews.length === 0 ? (
          <EmptyState
            title="No crews yet"
            body="Create a crew to start assigning leaders and members."
            action={
              canManageCrews ? (
                <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Create crew
                </button>
              ) : null
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {crews.map((crew) => {
              const typeConfig = getCrewTypeConfig(crew.crew_type || 'general');
              const Icon = typeConfig.icon;
              
              return (
                <div
                  key={crew.id}
                  className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-gray-700 transition-all duration-200"
                >
                  {/* Crew Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center ${typeConfig.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                      <h3 className="text-lg font-semibold text-white">{crew.crew_name}</h3>
                      <p className="text-sm text-gray-400">{typeConfig.label} crew</p>
                      </div>
                    </div>
                    {crew.is_active ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium">
                        Inactive
                      </span>
                    )}
                  </div>

                  {/* Crew Lead */}
                  {crew.lead && (
                    <div className="mb-4 p-3 bg-gray-700/30 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Crew Lead</p>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {crew.lead.first_name[0]}{crew.lead.last_name[0]}
                          </span>
                        </div>
                        <span className="text-white font-medium">
                          {crew.lead.first_name} {crew.lead.last_name}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Crew Description */}
                  {crew.description && (
                    <p className="text-sm text-gray-400 mb-4">{crew.description}</p>
                  )}

                  {/* Crew Members */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-300">
                        Members ({crew.members?.length || 0})
                      </p>
                      {canManageCrews && (
                        <button
                          onClick={() => {
                            setSelectedCrew(crew);
                            setShowAddMemberModal(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {crew.members && crew.members.length > 0 ? (
                      <div className="space-y-2">
                        {crew.members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">
                                  {member.user?.first_name[0]}{member.user?.last_name[0]}
                                </span>
                              </div>
                              <span className="text-sm text-white">
                                {member.user?.first_name} {member.user?.last_name}
                              </span>
                              <span className="text-xs text-gray-400">
                                • {member.role}
                              </span>
                            </div>
                            {canManageCrews && (
                              <button
                                onClick={() => handleRemoveMember(crew.id, member.user_id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No members assigned</p>
                    )}
                  </div>

                  {/* Crew Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(crew.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create crew modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Create new crew</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="crew-name">
                  Crew name
                </label>
                <input
                  id="crew-name"
                  type="text"
                  value={crewData.crew_name}
                  onChange={(e) => setCrewData({ ...crewData, crew_name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="Alpha Crew"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="crew-type">
                  Crew type
                </label>
                <select
                  id="crew-type"
                  value={crewData.crew_type}
                  onChange={(e) => setCrewData({ ...crewData, crew_type: e.target.value as any })}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  {crewTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="crew-description">
                  Description (optional)
                </label>
                <textarea
                  id="crew-description"
                  value={crewData.description}
                  onChange={(e) => setCrewData({ ...crewData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="Primary installation crew for high voltage equipment"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCrew}
                  disabled={!crewData.crew_name}
                  className="btn btn-primary disabled:opacity-50"
                >
                  Create crew
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && selectedCrew && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Add to {selectedCrew.crew_name}</h3>
              <button
                onClick={() => {
                  setShowAddMemberModal(false);
                  setSelectedCrew(null);
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-400">Select team members to add to this crew:</p>
              
              {getAvailableMembers(selectedCrew).length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {getAvailableMembers(selectedCrew).map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleAddMember(member.user_id!, 'member')}
                      className="w-full flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">
                            {member.user?.first_name[0]}{member.user?.last_name[0]}
                          </span>
                        </div>
                        <div className="text-left">
                          <p className="text-white font-medium">
                            {member.user?.first_name} {member.user?.last_name}
                          </p>
                          <p className="text-xs text-gray-400">{member.user?.job_title || member.role}</p>
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-blue-400" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No available team members to add
                </p>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setSelectedCrew(null);
                  }}
                  className="px-4 py-2 bg-gray-700 rounded-xl font-medium text-white hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Import supabase
import { supabase } from '../../lib/supabase';
