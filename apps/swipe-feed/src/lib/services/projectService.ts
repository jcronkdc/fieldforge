import { supabase } from '../supabase';

export interface Project {
  id: string;
  company_id: string;
  project_number: string;
  name: string;
  description?: string;
  project_type: 'transmission' | 'distribution' | 'substation' | 'mixed';
  voltage_class?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectTeamMember {
  id: string;
  project_id: string;
  user_id?: string;
  role: string;
  status: 'pending' | 'active' | 'inactive' | 'archived';
  invited_email?: string;
  invited_by?: string;
  invited_at?: string;
  accepted_at?: string;
  is_crew_lead?: boolean;
  reports_to?: string;
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    job_title?: string;
    photo_url?: string;
  };
}

export interface ProjectInvitation {
  id: string;
  project_id: string;
  email: string;
  role: string;
  invited_by: string;
  invitation_token: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  created_at: string;
  expires_at: string;
}

export interface Crew {
  id: string;
  project_id: string;
  crew_lead_id: string;
  crew_name: string;
  crew_type?: 'electrical' | 'civil' | 'mechanical' | 'general' | 'specialized';
  description?: string;
  is_active: boolean;
  created_at: string;
  members?: CrewMember[];
  lead?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CrewMember {
  id: string;
  crew_id: string;
  user_id: string;
  role: 'lead' | 'member' | 'apprentice';
  start_date: string;
  end_date?: string;
  is_active: boolean;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    job_title?: string;
  };
}

class ProjectService {
  // Create a new project
  async createProject(project: Partial<Project>): Promise<Project | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...project,
          status: project.status || 'planning'
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as project owner
      if (data) {
        await this.addTeamMember(data.id, user.id, 'owner');
      }

      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  }

  // Get all projects for the current user
  async getUserProjects(includeArchived = false): Promise<Project[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('projects')
        .select(`
          *,
          project_team!inner(
            user_id,
            role,
            status
          )
        `)
        .eq('project_team.user_id', user.id)
        .eq('project_team.status', 'active');

      if (!includeArchived) {
        query = query.eq('is_archived', false);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  // Get a single project with team
  async getProject(projectId: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  }

  // Archive/unarchive a project
  async archiveProject(projectId: string, archive = true): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('projects')
        .update({
          is_archived: archive,
          archived_at: archive ? new Date().toISOString() : null,
          archived_by: archive ? user.id : null
        })
        .eq('id', projectId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error archiving project:', error);
      return false;
    }
  }

  // Get project team members
  async getProjectTeam(projectId: string): Promise<ProjectTeamMember[]> {
    try {
      const { data, error } = await supabase
        .from('project_team')
        .select(`
          *,
          user:user_profiles(
            id,
            email,
            first_name,
            last_name,
            job_title,
            photo_url
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching project team:', error);
      return [];
    }
  }

  // Add team member (existing user)
  async addTeamMember(projectId: string, userId: string, role: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('project_team')
        .insert({
          project_id: projectId,
          user_id: userId,
          role,
          status: 'active'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding team member:', error);
      return false;
    }
  }

  // Invite team member by email
  async inviteTeamMember(
    projectId: string,
    email: string,
    role: string,
    message?: string
  ): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .rpc('invite_to_project', {
          p_project_id: projectId,
          p_email: email,
          p_role: role,
          p_invited_by: user.id,
          p_message: message
        });

      if (error) throw error;
      
      // In a real app, send email here
      console.log('Invitation token:', data);
      
      return data;
    } catch (error) {
      console.error('Error inviting team member:', error);
      return null;
    }
  }

  // Accept invitation
  async acceptInvitation(invitationToken: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .rpc('accept_project_invitation', {
          p_invitation_token: invitationToken,
          p_user_id: user.id
        });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return false;
    }
  }

  // Update team member role
  async updateTeamMemberRole(projectId: string, userId: string, newRole: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('project_team')
        .update({ role: newRole })
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating team member role:', error);
      return false;
    }
  }

  // Remove team member
  async removeTeamMember(projectId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('project_team')
        .update({ status: 'inactive' })
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing team member:', error);
      return false;
    }
  }

  // Create a crew
  async createCrew(crew: Partial<Crew>): Promise<Crew | null> {
    try {
      const { data, error } = await supabase
        .from('crew_assignments')
        .insert(crew)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating crew:', error);
      return null;
    }
  }

  // Get project crews
  async getProjectCrews(projectId: string): Promise<Crew[]> {
    try {
      const { data, error } = await supabase
        .from('crew_assignments')
        .select(`
          *,
          lead:user_profiles!crew_assignments_crew_lead_id_fkey(
            id,
            first_name,
            last_name,
            email
          ),
          members:crew_members(
            *,
            user:user_profiles(
              id,
              first_name,
              last_name,
              email,
              job_title
            )
          )
        `)
        .eq('project_id', projectId)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching crews:', error);
      return [];
    }
  }

  // Add member to crew
  async addCrewMember(crewId: string, userId: string, role: 'lead' | 'member' | 'apprentice' = 'member'): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('crew_members')
        .insert({
          crew_id: crewId,
          user_id: userId,
          role,
          assigned_by: user.id
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding crew member:', error);
      return false;
    }
  }

  // Remove member from crew
  async removeCrewMember(crewId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('crew_members')
        .update({ 
          is_active: false,
          end_date: new Date().toISOString().split('T')[0]
        })
        .eq('crew_id', crewId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing crew member:', error);
      return false;
    }
  }

  // Get user's role in project
  async getUserProjectRole(projectId: string): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('project_team')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      return data?.role || null;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  }

  // Check if user can manage project
  async canManageProject(projectId: string): Promise<boolean> {
    const role = await this.getUserProjectRole(projectId);
    return role !== null && ['owner', 'project_manager', 'superintendent'].includes(role);
  }

  // Check if user can manage crews
  async canManageCrews(projectId: string): Promise<boolean> {
    const role = await this.getUserProjectRole(projectId);
    return role !== null && ['owner', 'project_manager', 'superintendent', 'foreman'].includes(role);
  }
}

export const projectService = new ProjectService();
