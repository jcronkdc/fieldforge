import React, { useState, useEffect } from 'react';
import { Users, HardHat, Plus, UserPlus, TrendingUp, Shield, Phone, Award, ChevronRight, Search, Filter, Star, Clock, AlertCircle, CheckCircle, Loader2, MapPin, Compass, Ruler } from 'lucide-react';
import { format } from 'date-fns';

interface Crew {
  id: string;
  name: string;
  code: string;
  type: string;
  status: 'active' | 'inactive' | 'on_break';
  base_location?: string;
  max_members: number;
  lead_name?: string;
  lead_email?: string;
  current_project_name?: string;
  active_members: number;
  total_members: number;
  members: CrewMember[];
}

interface CrewMember {
  id: string;
  name: string;
  role: string;
  skill_level: 'apprentice' | 'journeyman' | 'master' | 'specialist';
}

interface Skill {
  id: string;
  name: string;
  category: string;
  certification_required: boolean;
}

export const CrewManagement: React.FC = () => {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [newCrew, setNewCrew] = useState({
    name: '',
    code: '',
    type: 'Electrical',
    base_location: '',
    max_members: 10
  });

  const [newMember, setNewMember] = useState({
    user_email: '',
    role: 'Journeyman',
    skill_level: 'journeyman' as const,
    hourly_rate: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });

  useEffect(() => {
    fetchCrews();
    fetchSkills();
  }, []);

  const fetchCrews = async () => {
    try {
      const response = await fetch('/api/crews/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'x-company-id': localStorage.getItem('company_id') || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCrews(data);
      }
    } catch (error) {
      console.error('Failed to fetch crews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/crews/skills/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSkills(data);
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    }
  };

  const createCrew = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/crews/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'x-company-id': localStorage.getItem('company_id') || ''
        },
        body: JSON.stringify(newCrew)
      });

      if (response.ok) {
        setShowCreateForm(false);
        setNewCrew({
          name: '',
          code: '',
          type: 'Electrical',
          base_location: '',
          max_members: 10
        });
        fetchCrews();
        alert('Crew created successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to create crew: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating crew:', error);
      alert('Failed to create crew');
    }
  };

  const addMemberToCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCrew) return;

    try {
      // First, get user ID from email (in real app, use user search endpoint)
      const userId = 'mock-user-id'; // This would come from a user search

      const response = await fetch(`/api/crews/${selectedCrew.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          ...newMember,
          user_id: userId
        })
      });

      if (response.ok) {
        setShowAddMemberForm(false);
        setNewMember({
          user_email: '',
          role: 'Journeyman',
          skill_level: 'journeyman',
          hourly_rate: '',
          emergency_contact_name: '',
          emergency_contact_phone: ''
        });
        fetchCrews();
        alert('Member added successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to add member: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add member');
    }
  };

  const assignCrewToProject = async (crewId: string, projectId: string) => {
    try {
      const response = await fetch(`/api/crews/${crewId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          project_id: projectId,
          start_date: format(new Date(), 'yyyy-MM-dd'),
          assignment_type: 'Primary',
          work_scope: 'General electrical work'
        })
      });

      if (response.ok) {
        fetchCrews();
        alert('Crew assigned to project successfully!');
      }
    } catch (error) {
      console.error('Error assigning crew:', error);
      alert('Failed to assign crew');
    }
  };

  const getSkillLevelBadge = (level: string) => {
    switch (level) {
      case 'apprentice':
        return 'bg-blue-100 text-blue-700';
      case 'journeyman':
        return 'bg-green-100 text-green-700';
      case 'master':
        return 'bg-purple-100 text-purple-700';
      case 'specialist':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'on_break':
        return 'bg-yellow-500';
      case 'inactive':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredCrews = crews.filter(crew => {
    const matchesFilter = filterType === 'all' || crew.type === filterType;
    const matchesSearch = crew.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crew.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const crewTypes = ['Electrical', 'Mechanical', 'Civil', 'Structural', 'HVAC', 'Plumbing'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className=" p-[34px] max-w-7xl mx-auto space-y-[34px]">
      {/* Renaissance Decorations */}
      <div className="" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[21px]">
        <div>
          <h1 className="text-2xl font-bold text-white  flex items-center gap-[13px]">
            <Users className="w-8 h-8 text-blue-400" />
            Crew Management
          </h1>
          <p className="text-base text-blue-400/60 mt-[8px] " >Manage construction crews and assignments</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all px-[21px] py-[13px] flex items-center gap-[8px] "
        >
          <Plus className="w-5 h-5" />
          <span className="">New Crew</span>
        </button>
      </div>

      {/* Stats Cards - Golden Ratio Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[21px] ">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-[21px] rounded-[13px] border border-gray-700  ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-400/60 " >Total Crews</p>
              <p className="text-xl font-bold text-white mt-[8px]">{crews.length}</p>
            </div>
            <div className="">
              <Users className="w-[34px] h-[34px] text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-[21px] rounded-[13px] border border-gray-700  " style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-400/60 " >Active Workers</p>
              <p className="text-xl font-bold text-green-400 mt-[8px]">
                {crews.reduce((sum, crew) => sum + crew.active_members, 0)}
              </p>
            </div>
            <div className="">
              <HardHat className="w-[34px] h-[34px] text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-[21px] rounded-[13px] border border-gray-700  " style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-400/60 " >Available Crews</p>
              <p className="text-xl font-bold text-blue-400 mt-[8px]">
                {crews.filter(c => !c.current_project_name).length}
              </p>
            </div>
            <div className="">
              <CheckCircle className="w-[34px] h-[34px] text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-[21px] rounded-[13px] border border-gray-700  " style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-400/60 " >Avg Crew Size</p>
              <p className="text-xl font-bold text-purple-400 mt-[8px]">
                {crews.length > 0 
                  ? Math.round(crews.reduce((sum, crew) => sum + crew.active_members, 0) / crews.length)
                  : 0}
              </p>
            </div>
            <div className="">
              <TrendingUp className="w-[34px] h-[34px] text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search crews..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[44px]"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[44px]"
          >
            <option value="all">All Types</option>
            {crewTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Crews List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCrews.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600">No crews found</p>
            <p className="text-sm text-gray-500 mt-2">Create a new crew to get started</p>
          </div>
        ) : (
          filteredCrews.map(crew => (
            <div key={crew.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{crew.name}</h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-mono">
                        {crew.code}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{crew.type} Crew</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(crew.status)}`} />
                </div>

                {/* Crew Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-2xl font-bold text-gray-900">{crew.active_members}</p>
                    <p className="text-xs text-gray-600">Active Members</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-2xl font-bold text-gray-900">{crew.max_members}</p>
                    <p className="text-xs text-gray-600">Max Capacity</p>
                  </div>
                </div>

                {/* Crew Details */}
                <div className="space-y-2 text-sm">
                  {crew.lead_name && (
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Lead:</span>
                      <span className="font-medium text-gray-900">{crew.lead_name}</span>
                    </div>
                  )}
                  
                  {crew.current_project_name ? (
                    <div className="flex items-center gap-2">
                      <HardHat className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600">Assigned to:</span>
                      <span className="font-medium text-blue-700">{crew.current_project_name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-green-700">Available for Assignment</span>
                    </div>
                  )}
                  
                  {crew.base_location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{crew.base_location}</span>
                    </div>
                  )}
                </div>

                {/* Members Preview */}
                <div className="mt-4">
                  <p className="text-xs text-gray-600 mb-2">Members:</p>
                  <div className="flex flex-wrap gap-1">
                    {crew.members.slice(0, 3).map((member, idx) => (
                      <span 
                        key={idx} 
                        className={`px-2 py-1 text-xs rounded ${getSkillLevelBadge(member.skill_level)}`}
                      >
                        {member.name?.split(' ')[0] || 'Member'}
                      </span>
                    ))}
                    {crew.members.length > 3 && (
                      <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                        +{crew.members.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-2">
                  <button
                    onClick={() => setSelectedCrew(crew)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium min-h-[44px]"
                  >
                    View Details
                  </button>
                  {!crew.current_project_name && (
                    <button
                      onClick={() => assignCrewToProject(crew.id, 'mock-project-id')}
                      className="flex-1 px-4 py-2 border border-gray-700 text-blue-600 rounded hover:bg-blue-50 transition-colors text-sm font-medium min-h-[44px]"
                    >
                      Assign to Project
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Crew Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Crew</h2>
            <form onSubmit={createCrew} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crew Name
                </label>
                <input
                  type="text"
                  required
                  value={newCrew.name}
                  onChange={(e) => setNewCrew({...newCrew, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  placeholder="e.g., Alpha Electrical Team"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crew Code
                </label>
                <input
                  type="text"
                  required
                  value={newCrew.code}
                  onChange={(e) => setNewCrew({...newCrew, code: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono min-h-[44px]"
                  placeholder="e.g., ELEC-01"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crew Type
                </label>
                <select
                  value={newCrew.type}
                  onChange={(e) => setNewCrew({...newCrew, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                >
                  {crewTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Location
                </label>
                <input
                  type="text"
                  value={newCrew.base_location}
                  onChange={(e) => setNewCrew({...newCrew, base_location: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  placeholder="e.g., Main Office, Field Site A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Members
                </label>
                <input
                  type="number"
                  value={newCrew.max_members}
                  onChange={(e) => setNewCrew({...newCrew, max_members: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  min={1}
                  max={50}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 min-h-[44px]"
                >
                  Create Crew
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
