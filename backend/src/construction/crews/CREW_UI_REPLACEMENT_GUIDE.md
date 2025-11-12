# 🚀 CREW MANAGEMENT UI REPLACEMENT - KILL THE PLACEHOLDER!

## Current Problem: CrewManagement is a Placeholder

```typescript
// placeholders.tsx Line 26 - FAKE!
export const CrewManagement = () => <PlaceholderPage 
  title="Crew Management" 
  icon={Users} 
  description="Track crew assignments and productivity" 
/>;
```

## REPLACE WITH REAL CREW MANAGEMENT:

Create `apps/swipe-feed/src/components/crews/CrewManagement.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Award, Calendar, AlertTriangle, Plus, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Crew {
  id: string;
  name: string;
  crew_type: string;
  member_count: number;
  current_project_name?: string;
  certifications?: string;
  status: 'active' | 'inactive';
}

interface CrewMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  certifications: Array<{
    type: string;
    expiry_date: string;
    is_valid: boolean;
  }>;
  hours_today: number;
  hours_this_week: number;
}

export const CrewManagement: React.FC = () => {
  const { session } = useAuth();
  const [crews, setCrews] = useState<Crew[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [members, setMembers] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = window.innerWidth < 768;

  // FETCH REAL CREWS FROM API
  const fetchCrews = async () => {
    try {
      const response = await fetch('/api/crews', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch crews');
      
      const data = await response.json();
      setCrews(data.crews);
      
    } catch (error) {
      console.error('Error fetching crews:', error);
      toast.error('Failed to load crews');
    } finally {
      setLoading(false);
    }
  };

  // FETCH CREW MEMBERS WITH CERTIFICATIONS
  const fetchCrewMembers = async (crewId: string) => {
    try {
      const response = await fetch(`/api/crews/${crewId}/members`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      const data = await response.json();
      setMembers(data.members);
      
    } catch (error) {
      toast.error('Failed to load crew members');
    }
  };

  // CREATE NEW CREW
  const handleCreateCrew = async (formData: any) => {
    try {
      const response = await fetch('/api/crews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to create crew');
      
      const newCrew = await response.json();
      setCrews([...crews, newCrew]);
      setShowCreateForm(false);
      toast.success('Crew created successfully');
      
    } catch (error) {
      toast.error('Failed to create crew');
    }
  };

  // ADD MEMBER TO CREW
  const handleAddMember = async (userId: string) => {
    if (!selectedCrew) return;
    
    try {
      const response = await fetch(`/api/crews/${selectedCrew.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ user_id: userId })
      });
      
      if (!response.ok) throw new Error('Failed to add member');
      
      await fetchCrewMembers(selectedCrew.id);
      toast.success('Member added to crew');
      
    } catch (error) {
      toast.error('Failed to add member');
    }
  };

  // ASSIGN CREW TO PROJECT
  const handleAssignToProject = async (projectId: string, startDate: string) => {
    if (!selectedCrew) return;
    
    try {
      const response = await fetch(`/api/crews/${selectedCrew.id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          project_id: projectId,
          start_date: startDate
        })
      });
      
      if (!response.ok) throw new Error('Failed to assign crew');
      
      toast.success('Crew assigned to project');
      await fetchCrews(); // Refresh to show new assignment
      
    } catch (error) {
      toast.error('Failed to assign crew');
    }
  };

  useEffect(() => {
    if (session) {
      fetchCrews();
    }
  }, [session]);

  useEffect(() => {
    if (selectedCrew) {
      fetchCrewMembers(selectedCrew.id);
    }
  }, [selectedCrew]);

  // Certification status checker
  const getCertificationStatus = (member: CrewMember) => {
    const expiredCount = member.certifications.filter(c => !c.is_valid).length;
    const expiringCount = member.certifications.filter(c => {
      const expiryDate = new Date(c.expiry_date);
      const daysUntilExpiry = (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return c.is_valid && daysUntilExpiry < 30;
    }).length;

    if (expiredCount > 0) return { status: 'expired', color: 'text-red-500' };
    if (expiringCount > 0) return { status: 'expiring', color: 'text-yellow-500' };
    return { status: 'valid', color: 'text-green-500' };
  };

  return (
    <div className={isMobile ? 'p-4' : 'p-6'}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Crew Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-amber-500 text-black rounded-lg flex items-center gap-2 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          {!isMobile && 'New Crew'}
        </button>
      </div>

      {/* Crew List */}
      <div className={isMobile ? 'space-y-4' : 'grid grid-cols-3 gap-6'}>
        <div className={isMobile ? '' : 'col-span-1'}>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search crews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg text-white min-h-[44px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              {crews.filter(c => 
                c.name.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(crew => (
                <div
                  key={crew.id}
                  onClick={() => setSelectedCrew(crew)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedCrew?.id === crew.id 
                      ? 'bg-amber-500/20 border border-amber-500' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-white">{crew.name}</h3>
                      <p className="text-sm text-gray-400">{crew.crew_type}</p>
                      <p className="text-xs text-gray-500">
                        {crew.member_count} members
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      crew.status === 'active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {crew.status}
                    </span>
                  </div>
                  {crew.current_project_name && (
                    <p className="text-xs text-amber-400 mt-1">
                      📍 {crew.current_project_name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Crew Details */}
        {selectedCrew && (
          <div className={isMobile ? 'mt-4' : 'col-span-2'}>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">
                {selectedCrew.name} Details
              </h2>

              {/* Members List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Crew Members ({members.length})
                </h3>

                {members.map(member => {
                  const certStatus = getCertificationStatus(member);
                  return (
                    <div key={member.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-white">
                            {member.full_name}
                            {member.role === 'lead' && (
                              <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded">
                                Lead
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-400">{member.email}</p>
                          <div className="mt-2 flex gap-4 text-xs">
                            <span>Today: {member.hours_today}h</span>
                            <span>Week: {member.hours_this_week}h</span>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 ${certStatus.color}`}>
                          <Award className="w-4 h-4" />
                          <span className="text-sm">
                            {member.certifications.length} certs
                          </span>
                          {certStatus.status !== 'valid' && (
                            <AlertTriangle className="w-4 h-4" />
                          )}
                        </div>
                      </div>

                      {/* Certifications */}
                      {member.certifications.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {member.certifications.map((cert, idx) => (
                            <span
                              key={idx}
                              className={`text-xs px-2 py-1 rounded ${
                                !cert.is_valid
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-green-500/20 text-green-400'
                              }`}
                            >
                              {cert.type}
                              {cert.expiry_date && (
                                <span className="ml-1 opacity-75">
                                  (exp: {new Date(cert.expiry_date).toLocaleDateString()})
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button className="px-4 py-2 bg-amber-500 text-black rounded-lg min-h-[44px]">
                  Add Member
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg min-h-[44px]">
                  Assign to Project
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg min-h-[44px]">
                  View Schedule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

## Update the placeholder export:

In `placeholders.tsx`, replace:
```typescript
export const CrewManagement = () => <PlaceholderPage ... />;
```

With:
```typescript
export { CrewManagement } from './crews/CrewManagement';
```

## Mobile Responsive Checklist:
- [ ] Touch targets ≥ 44px
- [ ] Responsive grid → stack on mobile
- [ ] Search works on mobile keyboard
- [ ] Crew cards tappable
- [ ] Member details readable
- [ ] Actions accessible

## E2E Testing:
- [ ] Create crew saves to database
- [ ] Members display with real data
- [ ] Certifications show expiry status
- [ ] Hours tracked from time entries
- [ ] Assign to project works
- [ ] Search filters correctly
- [ ] Mobile layout works

## Success = ZERO placeholders!
