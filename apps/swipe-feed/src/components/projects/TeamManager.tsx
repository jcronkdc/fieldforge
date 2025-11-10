import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, UserPlus, Mail, Shield, Users, Settings,
  MoreVertical, Trash2, Edit, ChevronDown, Send,
  CheckCircle, Clock, AlertCircle, UserCheck, X
} from 'lucide-react';
import { projectService, Project, ProjectTeamMember } from '../../lib/services/projectService';
import { EmptyState } from '../EmptyState';

interface TeamManagerProps {
  project: Project;
  userRole: string | null;
  onBack: () => void;
  onManageCrews: () => void;
}

export const TeamManager: React.FC<TeamManagerProps> = ({ 
  project, 
  userRole, 
  onBack, 
  onManageCrews 
}) => {
  const [teamMembers, setTeamMembers] = useState<ProjectTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ProjectTeamMember | null>(null);
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'worker',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const roles = [
    { value: 'owner', label: 'Owner', color: 'text-purple-400' },
    { value: 'project_manager', label: 'Project Manager', color: 'text-blue-400' },
    { value: 'superintendent', label: 'Superintendent', color: 'text-green-400' },
    { value: 'foreman', label: 'Foreman', color: 'text-yellow-400' },
    { value: 'crew_lead', label: 'Crew Lead', color: 'text-orange-400' },
    { value: 'worker', label: 'Worker', color: 'text-gray-400' },
    { value: 'safety_officer', label: 'Safety Officer', color: 'text-red-400' },
    { value: 'qc_inspector', label: 'QC Inspector', color: 'text-cyan-400' },
    { value: 'admin', label: 'Admin', color: 'text-pink-400' },
    { value: 'viewer', label: 'Viewer', color: 'text-gray-400' }
  ];

  const canManage = userRole && ['owner', 'project_manager', 'superintendent'].includes(userRole);
  const canManageCrews = userRole && ['owner', 'project_manager', 'superintendent', 'foreman'].includes(userRole);

  useEffect(() => {
    fetchTeamMembers();
  }, [project.id]);

  const fetchTeamMembers = async () => {
    setLoading(true);
    const members = await projectService.getProjectTeam(project.id);
    setTeamMembers(members);
    setLoading(false);
  };

  const handleInvite = async () => {
    if (!inviteData.email) return;
    
    setSending(true);
    const token = await projectService.inviteTeamMember(
      project.id,
      inviteData.email,
      inviteData.role,
      inviteData.message
    );

    if (token) {
      // In production, this would send an email
      alert(`Invitation sent to ${inviteData.email}. They will receive an email to join the project.`);
      setShowInviteModal(false);
      setInviteData({ email: '', role: 'worker', message: '' });
      fetchTeamMembers();
    }
    setSending(false);
  };

  const handleRemoveMember = async (member: ProjectTeamMember) => {
    if (!member.user_id) return;
    
    if (window.confirm(`Remove ${member.user?.first_name} ${member.user?.last_name} from the project?`)) {
      const success = await projectService.removeTeamMember(project.id, member.user_id);
      if (success) {
        fetchTeamMembers();
      }
    }
  };

  const handleUpdateRole = async (member: ProjectTeamMember, newRole: string) => {
    if (!member.user_id) return;
    
    const success = await projectService.updateTeamMemberRole(project.id, member.user_id, newRole);
    if (success) {
      fetchTeamMembers();
    }
  };

  const getRoleColor = (role: string) => {
    const roleConfig = roles.find(r => r.value === role);
    return roleConfig?.color || 'text-gray-400';
  };

  const getRoleLabel = (role: string) => {
    const roleConfig = roles.find(r => r.value === role);
    return roleConfig?.label || role;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'inactive':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
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
                aria-label="Back to projects"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                <p className="text-gray-400 text-sm">Team management • {project.project_number}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {canManageCrews && (
                <button
                  onClick={onManageCrews}
                  className="btn btn-secondary"
                >
                  <Users className="w-5 h-5" />
                  <span>Manage crews</span>
                </button>
              )}
              {canManage && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="btn btn-primary"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Invite member</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Team</p>
                <p className="text-2xl font-bold text-white">{teamMembers.length}</p>
              </div>
              <Users className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active</p>
                <p className="text-2xl font-bold text-white">
                  {teamMembers.filter(m => m.status === 'active').length}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-white">
                  {teamMembers.filter(m => m.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Your Role</p>
                <p className="text-lg font-bold text-white">
                  {userRole ? getRoleLabel(userRole) : 'N/A'}
                </p>
              </div>
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Team Members List */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Team Members</h2>
          </div>
          
          {loading ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="skeleton h-16 rounded-lg border border-gray-700/40 bg-gray-800/40" />
              ))}
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No team members yet"
                body="Invite teammates to share project updates and assignments."
                action={
                  canManage ? (
                    <button onClick={() => setShowInviteModal(true)} className="btn btn-primary">
                      <UserPlus className="mr-1.5 h-4 w-4" />
                      Invite member
                    </button>
                  ) : null
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {teamMembers.map((member) => (
                <div key={member.id} className="p-4 hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {member.user ? 
                            `${member.user.first_name?.charAt(0) ?? ''}${member.user.last_name?.charAt(0) ?? ''}` || 'FF' : 
                            (member.invited_email ? member.invited_email.charAt(0).toUpperCase() : 'FF')
                          }
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-white">
                            {member.user ? 
                              `${member.user.first_name} ${member.user.last_name}` : 
                              member.invited_email
                            }
                          </p>
                          {getStatusIcon(member.status)}
                        </div>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className={`text-sm ${getRoleColor(member.role)}`}>
                            {getRoleLabel(member.role)}
                          </span>
                          {member.user?.job_title && (
                            <span className="text-sm text-gray-400">
                              • {member.user.job_title}
                            </span>
                          )}
                          {member.status === 'pending' && (
                            <span className="text-xs text-yellow-400">
                              • Invitation Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {canManage && member.role !== 'owner' && (
                      <div className="flex items-center space-x-2">
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member, e.target.value)}
                          className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-1 text-sm text-white focus:border-amber-500 focus:outline-none"
                          disabled={!member.user_id}
                        >
                          {roles.filter(r => r.value !== 'owner').map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleRemoveMember(member)}
                          className="btn btn-ghost px-2 py-2"
                          disabled={!member.user_id}
                          aria-label={`Remove ${member.user?.first_name ?? ''}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="worker@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Role
                </label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  {roles.filter(r => r.value !== 'owner').map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={inviteData.message}
                  onChange={(e) => setInviteData({ ...inviteData, message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="Welcome to the team. Looking forward to working with you"
                />
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                <p className="text-sm text-blue-400">
                  An email invitation will be sent to join this project. They'll need to create an account or sign in to accept.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-gray-700 rounded-xl font-medium text-white hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={!inviteData.email || sending}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending invitation</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Invitation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
