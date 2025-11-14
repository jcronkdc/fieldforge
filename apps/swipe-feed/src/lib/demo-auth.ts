/**
 * Demo Authentication System
 * 
 * Provides full authentication functionality without Supabase
 * for immediate deployment and testing. All data stored in localStorage.
 */

interface DemoUser {
  id: string;
  email: string;
  password: string; // In real app, this would be hashed
  profile: {
    first_name: string;
    last_name: string;
    company: string;
    job_title: string;
    role: 'admin' | 'manager' | 'field_worker';
  };
  created_at: string;
}

// Default demo users
const DEMO_USERS: DemoUser[] = [
  {
    id: 'demo-admin-001',
    email: 'admin@fieldforge.com',
    password: 'FieldForge2025!',
    profile: {
      first_name: 'Admin',
      last_name: 'User',
      company: 'FieldForge Construction',
      job_title: 'System Administrator',
      role: 'admin'
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-manager-001',
    email: 'manager@fieldforge.com',
    password: 'FieldForge2025!',
    profile: {
      first_name: 'Project',
      last_name: 'Manager',
      company: 'FieldForge Construction',
      job_title: 'Project Manager',
      role: 'manager'
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-field-001',
    email: 'field@fieldforge.com',
    password: 'FieldForge2025!',
    profile: {
      first_name: 'Field',
      last_name: 'Worker',
      company: 'FieldForge Construction',
      job_title: 'Field Technician',
      role: 'field_worker'
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-001',
    email: 'demo@fieldforge.com',
    password: 'FieldForge2025!Demo',
    profile: {
      first_name: 'Demo',
      last_name: 'User',
      company: 'Demo Construction Co.',
      job_title: 'Construction Manager',
      role: 'manager'
    },
    created_at: new Date().toISOString()
  }
];

// Storage keys
const STORAGE_KEYS = {
  USERS: 'fieldforge_demo_users',
  CURRENT_USER: 'fieldforge_current_user',
  SESSION: 'fieldforge_session'
};

class DemoAuthService {
  private users: DemoUser[] = [];

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage() {
    // Load users from localStorage or use defaults
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
    } else {
      this.users = [...DEMO_USERS];
      this.saveUsers();
    }
  }

  private saveUsers() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
  }

  private generateId(): string {
    return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private createSession(user: DemoUser) {
    const session = {
      user: {
        id: user.id,
        email: user.email,
        ...user.profile
      },
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
    
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    
    // Dispatch auth state change event
    window.dispatchEvent(new CustomEvent('auth-state-change', { detail: { user } }));
    
    return session;
  }

  async signUp(email: string, password: string, userData: any) {
    // Check if user already exists
    const existingUser = this.users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create new user
    const newUser: DemoUser = {
      id: this.generateId(),
      email,
      password, // In production, this would be hashed
      profile: {
        first_name: userData.firstName || '',
        last_name: userData.lastName || '',
        company: userData.company || '',
        job_title: userData.jobTitle || '',
        role: 'field_worker' // Default role
      },
      created_at: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveUsers();
    
    return {
      user: this.createSession(newUser),
      error: null
    };
  }

  async signIn(email: string, password: string) {
    const user = this.users.find(u => u.email === email);
    
    if (!user || user.password !== password) {
      throw new Error('Invalid login credentials');
    }

    return {
      data: {
        user: this.createSession(user),
        session: this.createSession(user)
      },
      error: null
    };
  }

  async signOut() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    
    // Dispatch auth state change event
    window.dispatchEvent(new CustomEvent('auth-state-change', { detail: { user: null } }));
    
    return { error: null };
  }

  async getUser() {
    const sessionStr = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!sessionStr) {
      return { data: { user: null }, error: null };
    }

    try {
      const session = JSON.parse(sessionStr);
      
      // Check if session is expired
      if (new Date(session.expires_at) < new Date()) {
        await this.signOut();
        return { data: { user: null }, error: null };
      }

      return { 
        data: { 
          user: session.user 
        }, 
        error: null 
      };
    } catch (error) {
      return { data: { user: null }, error: null };
    }
  }

  async getCurrentUser() {
    const { data } = await this.getUser();
    return data.user;
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    // Listen for custom auth state changes
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      callback(customEvent.detail.user ? 'SIGNED_IN' : 'SIGNED_OUT', customEvent.detail);
    };
    
    window.addEventListener('auth-state-change', handler);
    
    // Check initial state
    this.getUser().then(({ data }) => {
      if (data.user) {
        callback('SIGNED_IN', { user: data.user });
      }
    });

    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => window.removeEventListener('auth-state-change', handler)
        }
      }
    };
  }
}

// Export a singleton instance
export const demoAuth = new DemoAuthService();

// Demo credentials for quick access
export const DEMO_CREDENTIALS = {
  email: 'demo@fieldforge.com',
  password: 'FieldForge2025!Demo'
};
