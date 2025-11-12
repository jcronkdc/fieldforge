import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Phone,
  HardHat,
  Zap,
  Shield,
  Award,
  Star,
  CheckCircle,
  AlertTriangle,
  Activity,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';

interface CrewMember {
  id: string;
  name: string;
  role: 'foreman' | 'journeyman' | 'apprentice' | 'operator' | 'laborer';
  ibewLocal: string;
  certifications: string[];
  phone: string;
  emergencyContact: string;
  hoursToday: number;
  hoursWeek: number;
  status: 'active' | 'break' | 'offline' | 'emergency';
  location: string;
  voltageRating: string;
  safetyScore: number;
  avatar?: string;
}

interface Crew {
  id: string;
  name: string;
  foreman: string;
  members: CrewMember[];
  project: string;
  shift: 'day' | 'night';
  location: string;
  status: 'active' | 'standby' | 'emergency' | 'completed';
  startTime: string;
  endTime: string;
  voltageClass: string;
  specialtyWork: string[];
}

const mockCrewMembers: CrewMember[] = [
  {
    id: '1',
    name: 'Mike Rodriguez',
    role: 'foreman',
    ibewLocal: '160',
    certifications: ['Qualified Electrical Worker', 'Arc Flash', 'High Voltage', 'Crane Signal'],
    phone: '(612) 555-0101',
    emergencyContact: '(612) 555-0199',
    hoursToday: 8.5,
    hoursWeek: 42,
    status: 'active',
    location: 'Alpha-7 Substation',
    voltageRating: '138kV',
    safetyScore: 98
  },
  {
    id: '2',
    name: 'Sarah Chen',
    role: 'journeyman',
    ibewLocal: '160',
    certifications: ['Qualified Electrical Worker', 'Arc Flash', 'High Voltage'],
    phone: '(651) 555-0202',
    emergencyContact: '(651) 555-0299',
    hoursToday: 8.0,
    hoursWeek: 40,
    status: 'active',
    location: 'Alpha-7 Substation',
    voltageRating: '138kV',
    safetyScore: 96
  },
  {
    id: '3',
    name: 'Tom Wilson',
    role: 'journeyman',
    ibewLocal: '160',
    certifications: ['Qualified Electrical Worker', 'Arc Flash', 'Welding'],
    phone: '(763) 555-0303',
    emergencyContact: '(763) 555-0399',
    hoursToday: 8.0,
    hoursWeek: 40,
    status: 'break',
    location: 'Alpha-7 Substation',
    voltageRating: '25kV',
    safetyScore: 94
  }
];

const mockCrews: Crew[] = [
  {
    id: '1',
    name: 'Alpha Team',
    foreman: 'Mike Rodriguez',
    members: mockCrewMembers,
    project: 'Alpha-7 Substation Upgrade',
    shift: 'day',
    location: 'Brainerd, MN',
    status: 'active',
    startTime: '07:00',
    endTime: '15:30',
    voltageClass: '138kV/25kV',
    specialtyWork: ['Substation Construction', 'High Voltage', 'Transformer Installation']
  }
];

export const IBEWCrewManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'crews' | 'members' | 'schedule'>('overview');
  const [selectedCrew, setSelectedCrew] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'break': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'emergency': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'offline': return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'foreman': return <Award className="w-4 h-4 text-gold-400" />;
      case 'journeyman': return <Zap className="w-4 h-4 text-blue-400" />;
      case 'apprentice': return <HardHat className="w-4 h-4 text-purple-400" />;
      case 'operator': return <Activity className="w-4 h-4 text-orange-400" />;
      default: return <Users className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">IBEW Crew Manager</h1>
        </div>
        <p className="text-slate-300">Manage electrical construction crews and workforce</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-slate-800/30 p-1 rounded-lg w-fit">
        {[
          { key: 'overview', label: 'Overview', icon: Activity },
          { key: 'crews', label: 'Active Crews', icon: Users },
          { key: 'members', label: 'All Members', icon: HardHat },
          { key: 'schedule', label: 'Schedule', icon: Calendar }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-blue-400" />
                <h3 className="font-semibold text-white">Active Personnel</h3>
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {mockCrewMembers.filter(m => m.status === 'active').length}
              </div>
              <p className="text-sm text-slate-400">On duty now</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-6 h-6 text-green-400" />
                <h3 className="font-semibold text-white">Total Hours</h3>
              </div>
              <div className="text-3xl font-bold text-green-400 mb-1">
                {mockCrewMembers.reduce((acc, m) => acc + m.hoursToday, 0)}
              </div>
              <p className="text-sm text-slate-400">Today</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-green-400" />
                <h3 className="font-semibold text-white">Safety Score</h3>
              </div>
              <div className="text-3xl font-bold text-green-400 mb-1">
                {Math.round(mockCrewMembers.reduce((acc, m) => acc + m.safetyScore, 0) / mockCrewMembers.length)}%
              </div>
              <p className="text-sm text-slate-400">Average crew score</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-6 h-6 text-yellow-400" />
                <h3 className="font-semibold text-white">High Voltage</h3>
              </div>
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {mockCrewMembers.filter(m => m.voltageRating.includes('kV')).length}
              </div>
              <p className="text-sm text-slate-400">Qualified workers</p>
            </div>
          </div>

          {/* Active Crews Quick View */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Active Crews</h3>
            <div className="space-y-4">
              {mockCrews.map((crew) => (
                <div key={crew.id} className="bg-slate-700/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{crew.name}</h4>
                        <p className="text-sm text-slate-400">Foreman: {crew.foreman}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(crew.status)}`}>
                      {crew.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                    <div>
                      <span className="text-slate-400">Project:</span>
                      <span className="text-white font-semibold ml-2">{crew.project}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Location:</span>
                      <span className="text-white font-semibold ml-2">{crew.location}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Members:</span>
                      <span className="text-blue-400 font-semibold ml-2">{crew.members.length} workers</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Voltage:</span>
                      <span className="text-yellow-400 font-mono ml-2">{crew.voltageClass}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Crews Tab */}
      {activeTab === 'crews' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Active Crews</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
              <Plus className="w-5 h-5" />
              Create Crew
            </button>
          </div>

          <div className="space-y-6">
            {mockCrews.map((crew) => (
              <div key={crew.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{crew.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>Foreman: {crew.foreman}</span>
                        <span>•</span>
                        <span>{crew.shift.charAt(0).toUpperCase() + crew.shift.slice(1)} Shift</span>
                        <span>•</span>
                        <span>{crew.startTime} - {crew.endTime}</span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Crew Details */}
                <div className="grid gap-4 lg:grid-cols-3 mb-6">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-semibold text-slate-300">Project</span>
                    </div>
                    <p className="text-white font-semibold">{crew.project}</p>
                    <p className="text-slate-400 text-sm">{crew.location}</p>
                  </div>
                  
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-semibold text-slate-300">Voltage Class</span>
                    </div>
                    <p className="text-yellow-400 font-mono font-bold text-lg">{crew.voltageClass}</p>
                  </div>
                  
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <HardHat className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-semibold text-slate-300">Specialty Work</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {crew.specialtyWork.map((work, index) => (
                        <span key={index} className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded border border-orange-500/30">
                          {work}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Crew Members */}
                <div>
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    Crew Members ({crew.members.length})
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {crew.members.map((member) => (
                      <div key={member.id} className="bg-slate-700/30 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-sm text-white font-bold">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h5 className="font-bold text-white">{member.name}</h5>
                            <div className="flex items-center gap-2">
                              {getRoleIcon(member.role)}
                              <span className="text-sm text-slate-400 capitalize">{member.role}</span>
                            </div>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${
                            member.status === 'active' ? 'bg-green-400' :
                            member.status === 'break' ? 'bg-yellow-400' :
                            member.status === 'emergency' ? 'bg-red-400' :
                            'bg-slate-400'
                          } animate-pulse`}></div>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">IBEW Local:</span>
                            <span className="text-blue-400 font-semibold">{member.ibewLocal}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Hours Today:</span>
                            <span className="text-white font-semibold">{member.hoursToday}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Voltage Rating:</span>
                            <span className="text-yellow-400 font-mono">{member.voltageRating}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Safety Score:</span>
                            <span className="text-green-400 font-semibold">{member.safetyScore}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search crew members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Member
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {mockCrewMembers
              .filter(member => 
                member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.ibewLocal.includes(searchQuery)
              )
              .map((member) => (
                <div key={member.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center">
                        <span className="text-lg text-white font-bold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{member.name}</h3>
                        <div className="flex items-center gap-2 mb-1">
                          {getRoleIcon(member.role)}
                          <span className="text-slate-300 capitalize font-semibold">{member.role}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-400">IBEW Local {member.ibewLocal}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(member.status)}`}>
                            {member.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  {/* Member Details */}
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <span className="text-sm text-slate-400">Current Location</span>
                        <p className="text-white font-semibold">{member.location}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-400">Voltage Rating</span>
                        <p className="text-yellow-400 font-mono font-bold">{member.voltageRating}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-400">Hours Today</span>
                        <p className="text-green-400 font-semibold">{member.hoursToday} hours</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-400">Safety Score</span>
                        <div className="flex items-center gap-2">
                          <p className="text-green-400 font-semibold">{member.safetyScore}%</p>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < Math.floor(member.safetyScore / 20) ? 'text-yellow-400 fill-current' : 'text-slate-500'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Certifications */}
                    <div>
                      <span className="text-sm text-slate-400 mb-2 block">Certifications</span>
                      <div className="flex flex-wrap gap-2">
                        {member.certifications.map((cert, index) => (
                          <span key={index} className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full border border-green-500/30">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="pt-4 border-t border-slate-700">
                      <div className="grid gap-2 sm:grid-cols-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-400" />
                          <span className="text-slate-400">Phone:</span>
                          <span className="text-white">{member.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span className="text-slate-400">Emergency:</span>
                          <span className="text-white">{member.emergencyContact}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Crew Schedule</h2>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">This Week's Schedule</h3>
            <div className="space-y-4">
              {[
                { day: 'Monday', date: 'Jan 27', crews: ['Alpha Team', 'Beta Team'], hours: '07:00 - 15:30' },
                { day: 'Tuesday', date: 'Jan 28', crews: ['Alpha Team'], hours: '07:00 - 15:30' },
                { day: 'Wednesday', date: 'Jan 29', crews: ['Alpha Team', 'Gamma Team'], hours: '07:00 - 15:30' }
              ].map((schedule, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-white font-bold">{schedule.day}</div>
                      <div className="text-slate-400 text-sm">{schedule.date}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {schedule.crews.map((crew, i) => (
                        <span key={i} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm border border-blue-500/30">
                          {crew}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-slate-400 font-mono">{schedule.hours}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Add New Crew Member</h3>
            
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Role</label>
                  <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="journeyman">Journeyman Electrician</option>
                    <option value="apprentice">Apprentice</option>
                    <option value="foreman">Foreman</option>
                    <option value="operator">Equipment Operator</option>
                    <option value="laborer">Laborer</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">IBEW Local</label>
                  <input
                    type="text"
                    placeholder="160"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Voltage Rating</label>
                  <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="25kV">25kV and below</option>
                    <option value="138kV">138kV</option>
                    <option value="345kV">345kV</option>
                    <option value="500kV">500kV</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddMember(false)}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Add member logic here
                    setShowAddMember(false);
                  }}
                  className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
