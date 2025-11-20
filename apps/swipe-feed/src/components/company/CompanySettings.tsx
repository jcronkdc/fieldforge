import React, { useState, useEffect } from 'react';
import {
  Building2, Users, Workflow, Palette, Key, Link2,
  CreditCard, Shield, Database, Download, Upload,
  Save, RefreshCw, AlertCircle, CheckCircle, Info,
  ChevronRight, Plus, Trash2, Edit2, Eye, EyeOff,
  Settings, FileText, Globe, Mail, Phone, MapPin,
  Calendar, Clock, DollarSign, Percent, Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthContext } from '../auth/AuthProvider';

interface CompanyData {
  // Company Information
  name: string;
  legalName: string;
  taxId: string;
  registrationNumber: string;
  industry: string;
  founded: string;
  website: string;
  description: string;
  
  // Contact Information
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Branding
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    faviconUrl?: string;
    emailHeader?: string;
  };
  
  // Settings
  settings: {
    timezone: string;
    currency: string;
    dateFormat: string;
    fiscalYearStart: string;
    defaultProjectDuration: number;
    autoNumberProjects: boolean;
    projectPrefix: string;
    requireApprovals: boolean;
    approvalThreshold: number;
  };
  
  // Subscription
  subscription: {
    plan: 'starter' | 'professional' | 'enterprise';
    status: 'active' | 'trialing' | 'canceled' | 'past_due';
    currentPeriodEnd: string;
    seats: number;
    usedSeats: number;
  };
  
  // Features
  features: {
    advancedAnalytics: boolean;
    apiAccess: boolean;
    customWorkflows: boolean;
    unlimitedProjects: boolean;
    prioritySupport: boolean;
    whiteLabel: boolean;
    ssoEnabled: boolean;
  };
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  memberCount: number;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  isDefault: boolean;
}

interface WorkflowStep {
  id: string;
  name: string;
  assignee: string;
  duration: number;
  dependencies: string[];
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  permissions: string[];
  isActive: boolean;
}

interface CompanySection {
  id: string;
  title: string;
  icon: React.ElementType;
}

export const CompanySettings: React.FC = () => {
  const { user } = useAuthContext();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('company');
  
  // Modals
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowTemplate | null>(null);

  const sections: CompanySection[] = [
    { id: 'company', title: 'Company Information', icon: Building2 },
    { id: 'branding', title: 'Branding & Appearance', icon: Palette },
    { id: 'settings', title: 'Default Settings', icon: Settings },
    { id: 'roles', title: 'Roles & Permissions', icon: Users },
    { id: 'workflows', title: 'Workflow Templates', icon: Workflow },
    { id: 'integrations', title: 'API & Integrations', icon: Link2 },
    { id: 'billing', title: 'Billing & Subscription', icon: CreditCard },
    { id: 'compliance', title: 'Compliance & Security', icon: Shield },
    { id: 'data', title: 'Data Management', icon: Database }
  ];

  // Permission definitions
  const allPermissions = [
    { category: 'Projects', permissions: ['view_projects', 'create_projects', 'edit_projects', 'delete_projects', 'manage_project_members'] },
    { category: 'Equipment', permissions: ['view_equipment', 'manage_equipment', 'request_equipment', 'approve_equipment'] },
    { category: 'Documents', permissions: ['view_documents', 'upload_documents', 'edit_documents', 'delete_documents', 'share_documents'] },
    { category: 'Safety', permissions: ['view_safety', 'create_incidents', 'manage_safety', 'approve_permits'] },
    { category: 'Analytics', permissions: ['view_analytics', 'export_reports', 'create_dashboards'] },
    { category: 'Administration', permissions: ['manage_users', 'manage_roles', 'manage_company', 'view_audit_logs', 'manage_integrations'] }
  ];

  useEffect(() => {
    fetchCompanyData();
    fetchRoles();
    fetchWorkflows();
    fetchApiKeys();
  }, []);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/company', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCompanyData(data.company);
      } else {
        // Load default data if none exists
        const defaultData: CompanyData = {
          name: 'My Construction Company',
          legalName: 'My Construction Company LLC',
          taxId: '',
          registrationNumber: '',
          industry: 'Construction',
          founded: new Date().getFullYear().toString(),
          website: '',
          description: '',
          email: user?.email || '',
          phone: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'USA'
          },
          branding: {
            primaryColor: '#f59e0b',
            secondaryColor: '#1e293b',
            logoUrl: '',
            faviconUrl: '',
            emailHeader: ''
          },
          settings: {
            timezone: 'America/New_York',
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            fiscalYearStart: '01-01',
            defaultProjectDuration: 90,
            autoNumberProjects: true,
            projectPrefix: 'PROJ-',
            requireApprovals: true,
            approvalThreshold: 10000
          },
          subscription: {
            plan: 'professional',
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            seats: 25,
            usedSeats: 12
          },
          features: {
            advancedAnalytics: true,
            apiAccess: true,
            customWorkflows: true,
            unlimitedProjects: true,
            prioritySupport: true,
            whiteLabel: false,
            ssoEnabled: false
          }
        };
        setCompanyData(defaultData);
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      toast.error('Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/company/roles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles);
      } else {
        // Default roles
        setRoles([
          {
            id: '1',
            name: 'Administrator',
            description: 'Full system access',
            permissions: allPermissions.flatMap(p => p.permissions),
            isSystem: true,
            memberCount: 2
          },
          {
            id: '2',
            name: 'Project Manager',
            description: 'Manage projects and teams',
            permissions: ['view_projects', 'create_projects', 'edit_projects', 'manage_project_members', 'view_analytics'],
            isSystem: true,
            memberCount: 5
          },
          {
            id: '3',
            name: 'Field Worker',
            description: 'View and update field data',
            permissions: ['view_projects', 'view_documents', 'create_incidents', 'view_equipment'],
            isSystem: true,
            memberCount: 15
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/company/workflows', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows);
      } else {
        // Default workflows
        setWorkflows([
          {
            id: '1',
            name: 'Standard Project Workflow',
            description: 'Default workflow for construction projects',
            category: 'project',
            isDefault: true,
            steps: [
              { id: '1', name: 'Planning', assignee: 'Project Manager', duration: 7, dependencies: [] },
              { id: '2', name: 'Permits', assignee: 'Compliance Officer', duration: 14, dependencies: ['1'] },
              { id: '3', name: 'Mobilization', assignee: 'Site Manager', duration: 3, dependencies: ['2'] },
              { id: '4', name: 'Construction', assignee: 'Site Manager', duration: 60, dependencies: ['3'] },
              { id: '5', name: 'Inspection', assignee: 'QA Manager', duration: 2, dependencies: ['4'] },
              { id: '6', name: 'Closeout', assignee: 'Project Manager', duration: 7, dependencies: ['5'] }
            ]
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/company/api-keys', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.keys);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const saveCompanyData = async () => {
    if (!companyData) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/company', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(companyData)
      });

      if (!response.ok) {
        throw new Error('Failed to save company data');
      }

      toast.success('Company settings saved');
      
      // Apply branding changes immediately
      if (companyData.branding.primaryColor) {
        document.documentElement.style.setProperty('--primary-color', companyData.branding.primaryColor);
      }
    } catch (error) {
      console.error('Error saving company data:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCompanyChange = (field: string, value: any) => {
    if (!companyData) return;
    
    const keys = field.split('.');
    const newData = { ...companyData };
    let current: any = newData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setCompanyData(newData);
  };

  const createApiKey = async (name: string, permissions: string[]) => {
    try {
      const response = await fetch('/api/company/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name, permissions })
      });

      if (!response.ok) {
        throw new Error('Failed to create API key');
      }

      const data = await response.json();
      setApiKeys([...apiKeys, data.key]);
      toast.success('API key created');
      setShowApiKeyModal(false);
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    }
  };

  const revokeApiKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/company/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to revoke API key');
      }

      setApiKeys(apiKeys.filter(k => k.id !== keyId));
      toast.success('API key revoked');
    } catch (error) {
      console.error('Error revoking API key:', error);
      toast.error('Failed to revoke API key');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-blue-500">Loading company settings...</div>
      </div>
    );
  }

  if (!companyData) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-[34px]">
        <h1 className="text-3xl font-bold text-white flex items-center gap-[13px]">
          <Building2 className="w-8 h-8 text-blue-400" />
          Company Settings
        </h1>
        <p className="text-slate-400 mt-2">Manage your organization's configuration</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-[34px]">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-[8px]">
            {sections.map(section => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-[13px] px-[21px] py-[13px] rounded-[13px] transition-all ${
                    activeSection === section.id
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.title}</span>
                  <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${
                    activeSection === section.id ? 'rotate-90' : ''
                  }`} />
                </button>
              );
            })}
          </nav>

          {/* Usage Info */}
          <div className="mt-[34px] p-[21px] bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px]">
            <div className="flex items-center justify-between mb-[13px]">
              <span className="text-sm font-medium text-slate-300">Plan</span>
              <span className="text-sm text-blue-400 capitalize">{companyData.subscription.plan}</span>
            </div>
            <div className="flex items-center justify-between mb-[13px]">
              <span className="text-sm font-medium text-slate-300">Status</span>
              <span className={`text-sm capitalize ${
                companyData.subscription.status === 'active' ? 'text-green-400' : 'text-red-400'
              }`}>
                {companyData.subscription.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Seats</span>
              <span className="text-sm text-slate-400">
                {companyData.subscription.usedSeats} / {companyData.subscription.seats}
              </span>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {/* Company Information */}
            {activeSection === 'company' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[34px]"
              >
                <h2 className="text-xl font-semibold text-white mb-[34px] flex items-center gap-[13px]">
                  <Building2 className="w-6 h-6 text-blue-400" />
                  Company Information
                </h2>
                
                <div className="grid gap-[21px]">
                  <div className="grid md:grid-cols-2 gap-[21px]">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={companyData.name}
                        onChange={(e) => handleCompanyChange('name', e.target.value)}
                        className="w-full px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                        Legal Name
                      </label>
                      <input
                        type="text"
                        value={companyData.legalName}
                        onChange={(e) => handleCompanyChange('legalName', e.target.value)}
                        className="w-full px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-[21px]">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                        Tax ID / EIN
                      </label>
                      <input
                        type="text"
                        value={companyData.taxId}
                        onChange={(e) => handleCompanyChange('taxId', e.target.value)}
                        className="w-full px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
                        placeholder="XX-XXXXXXX"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        value={companyData.registrationNumber}
                        onChange={(e) => handleCompanyChange('registrationNumber', e.target.value)}
                        className="w-full px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                      Description
                    </label>
                    <textarea
                      value={companyData.description}
                      onChange={(e) => handleCompanyChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px] resize-none"
                      placeholder="Brief description of your company..."
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-[21px]">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                        Industry
                      </label>
                      <select
                        value={companyData.industry}
                        onChange={(e) => handleCompanyChange('industry', e.target.value)}
                        className="w-full px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
                      >
                        <option value="Construction">Construction</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="HVAC">HVAC</option>
                        <option value="General Contractor">General Contractor</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                        Founded Year
                      </label>
                      <input
                        type="text"
                        value={companyData.founded}
                        onChange={(e) => handleCompanyChange('founded', e.target.value)}
                        className="w-full px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
                        placeholder="YYYY"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                        Website
                      </label>
                      <input
                        type="url"
                        value={companyData.website}
                        onChange={(e) => handleCompanyChange('website', e.target.value)}
                        className="w-full px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="pt-[21px] border-t border-slate-700">
                    <h3 className="text-lg font-medium text-white mb-[21px]">Contact Information</h3>
                    
                    <div className="grid md:grid-cols-2 gap-[21px]">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                          Email
                        </label>
                        <input
                          type="email"
                          value={companyData.email}
                          onChange={(e) => handleCompanyChange('email', e.target.value)}
                          className="w-full px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={companyData.phone}
                          onChange={(e) => handleCompanyChange('phone', e.target.value)}
                          className="w-full px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
                          placeholder="(555) 555-5555"
                        />
                      </div>
                    </div>

                    <div className="grid gap-[21px] mt-[21px]">
                      <input
                        type="text"
                        value={companyData.address.street}
                        onChange={(e) => handleCompanyChange('address.street', e.target.value)}
                        className="w-full px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
                        placeholder="Street Address"
                      />
                      
                      <div className="grid md:grid-cols-3 gap-[21px]">
                        <input
                          type="text"
                          value={companyData.address.city}
                          onChange={(e) => handleCompanyChange('address.city', e.target.value)}
                          className="w-full px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
                          placeholder="City"
                        />
                        
                        <input
                          type="text"
                          value={companyData.address.state}
                          onChange={(e) => handleCompanyChange('address.state', e.target.value)}
                          className="w-full px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
                          placeholder="State"
                        />
                        
                        <input
                          type="text"
                          value={companyData.address.zipCode}
                          onChange={(e) => handleCompanyChange('address.zipCode', e.target.value)}
                          className="w-full px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
                          placeholder="ZIP Code"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-[34px] flex justify-end">
                  <button
                    onClick={saveCompanyData}
                    disabled={saving}
                    className="px-[34px] py-[13px] bg-blue-500 hover:bg-blue-600 text-slate-900 rounded-[8px] font-semibold transition-all disabled:opacity-50 flex items-center gap-[8px]"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Branding & Appearance */}
            {activeSection === 'branding' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[34px]"
              >
                <h2 className="text-xl font-semibold text-white mb-[34px] flex items-center gap-[13px]">
                  <Palette className="w-6 h-6 text-blue-400" />
                  Branding & Appearance
                </h2>
                
                <div className="grid gap-[34px]">
                  {/* Colors */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-[21px]">Brand Colors</h3>
                    
                    <div className="grid md:grid-cols-2 gap-[21px]">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                          Primary Color
                        </label>
                        <div className="flex gap-[13px]">
                          <input
                            type="color"
                            value={companyData.branding.primaryColor}
                            onChange={(e) => handleCompanyChange('branding.primaryColor', e.target.value)}
                            className="w-[55px] h-[39px] bg-slate-700 border border-slate-600 rounded-[8px] cursor-pointer"
                          />
                          <input
                            type="text"
                            value={companyData.branding.primaryColor}
                            onChange={(e) => handleCompanyChange('branding.primaryColor', e.target.value)}
                            className="flex-1 px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
                            placeholder="#f59e0b"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                          Secondary Color
                        </label>
                        <div className="flex gap-[13px]">
                          <input
                            type="color"
                            value={companyData.branding.secondaryColor}
                            onChange={(e) => handleCompanyChange('branding.secondaryColor', e.target.value)}
                            className="w-[55px] h-[39px] bg-slate-700 border border-slate-600 rounded-[8px] cursor-pointer"
                          />
                          <input
                            type="text"
                            value={companyData.branding.secondaryColor}
                            onChange={(e) => handleCompanyChange('branding.secondaryColor', e.target.value)}
                            className="flex-1 px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
                            placeholder="#1e293b"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-[21px]">Company Logo</h3>
                    
                    <div className="grid md:grid-cols-2 gap-[34px]">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-[13px]">
                          Main Logo
                        </label>
                        <div className="border-2 border-dashed border-slate-600 rounded-[13px] p-[34px] text-center">
                          {companyData.branding.logoUrl ? (
                            <div className="space-y-[13px]">
                              <img
                                src={companyData.branding.logoUrl}
                                alt="Company Logo"
                                className="max-h-[89px] mx-auto"
                              />
                              <button
                                onClick={() => handleCompanyChange('branding.logoUrl', '')}
                                className="text-sm text-red-400 hover:text-red-300"
                              >
                                Remove Logo
                              </button>
                            </div>
                          ) : (
                            <div>
                              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-[13px]" />
                              <p className="text-sm text-slate-400">
                                Click to upload logo
                              </p>
                              <p className="text-xs text-slate-500 mt-[5px]">
                                PNG, JPG up to 2MB
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-[13px]">
                          Favicon
                        </label>
                        <div className="border-2 border-dashed border-slate-600 rounded-[13px] p-[34px] text-center">
                          {companyData.branding.faviconUrl ? (
                            <div className="space-y-[13px]">
                              <img
                                src={companyData.branding.faviconUrl}
                                alt="Favicon"
                                className="w-[34px] h-[34px] mx-auto"
                              />
                              <button
                                onClick={() => handleCompanyChange('branding.faviconUrl', '')}
                                className="text-sm text-red-400 hover:text-red-300"
                              >
                                Remove Favicon
                              </button>
                            </div>
                          ) : (
                            <div>
                              <Globe className="w-12 h-12 text-slate-400 mx-auto mb-[13px]" />
                              <p className="text-sm text-slate-400">
                                Click to upload favicon
                              </p>
                              <p className="text-xs text-slate-500 mt-[5px]">
                                32x32 ICO or PNG
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-[21px]">Preview</h3>
                    
                    <div className="bg-slate-900 rounded-[13px] p-[34px] border border-slate-700">
                      <div className="flex items-center gap-[13px] mb-[21px]">
                        {companyData.branding.logoUrl ? (
                          <img
                            src={companyData.branding.logoUrl}
                            alt="Logo"
                            className="h-[34px]"
                          />
                        ) : (
                          <Building2
                            className="w-[34px] h-[34px]"
                            style={{ color: companyData.branding.primaryColor }}
                          />
                        )}
                        <h4 className="text-xl font-bold text-white">{companyData.name}</h4>
                      </div>
                      
                      <div className="flex gap-[13px]">
                        <button
                          style={{ backgroundColor: companyData.branding.primaryColor }}
                          className="px-[21px] py-[8px] text-slate-900 rounded-[8px] font-medium"
                        >
                          Primary Button
                        </button>
                        <button
                          style={{ borderColor: companyData.branding.primaryColor, color: companyData.branding.primaryColor }}
                          className="px-[21px] py-[8px] border-2 rounded-[8px] font-medium"
                        >
                          Secondary Button
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-[34px] flex justify-end">
                  <button
                    onClick={saveCompanyData}
                    disabled={saving}
                    className="px-[34px] py-[13px] bg-blue-500 hover:bg-blue-600 text-slate-900 rounded-[8px] font-semibold transition-all disabled:opacity-50 flex items-center gap-[8px]"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Branding
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Default Settings */}
            {activeSection === 'settings' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[34px]"
              >
                <h2 className="text-xl font-semibold text-white mb-[34px] flex items-center gap-[13px]">
                  <Settings className="w-6 h-6 text-blue-400" />
                  Default Settings
                </h2>
                
                <div className="grid gap-[34px]">
                  {/* Regional Settings */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-[21px]">Regional Settings</h3>
                    
                    <div className="grid md:grid-cols-3 gap-[21px]">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                          Time Zone
                        </label>
                        <select
                          value={companyData.settings.timezone}
                          onChange={(e) => handleCompanyChange('settings.timezone', e.target.value)}
                          className="w-full px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
                        >
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                          Currency
                        </label>
                        <select
                          value={companyData.settings.currency}
                          onChange={(e) => handleCompanyChange('settings.currency', e.target.value)}
                          className="w-full px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="CAD">CAD ($)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                          Date Format
                        </label>
                        <select
                          value={companyData.settings.dateFormat}
                          onChange={(e) => handleCompanyChange('settings.dateFormat', e.target.value)}
                          className="w-full px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Project Settings */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-[21px]">Project Defaults</h3>
                    
                    <div className="grid gap-[21px]">
                      <div className="grid md:grid-cols-2 gap-[21px]">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                            Default Project Duration
                          </label>
                          <div className="flex items-center gap-[13px]">
                            <input
                              type="number"
                              value={companyData.settings.defaultProjectDuration}
                              onChange={(e) => handleCompanyChange('settings.defaultProjectDuration', parseInt(e.target.value))}
                              className="flex-1 px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
                              min="1"
                            />
                            <span className="text-sm text-slate-400">days</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                            Project Prefix
                          </label>
                          <input
                            type="text"
                            value={companyData.settings.projectPrefix}
                            onChange={(e) => handleCompanyChange('settings.projectPrefix', e.target.value)}
                            className="w-full px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
                            placeholder="PROJ-"
                          />
                          <p className="text-xs text-slate-500 mt-[5px]">
                            Example: {companyData.settings.projectPrefix}2024001
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between py-[13px]">
                        <div>
                          <h4 className="text-white font-medium">Auto-Number Projects</h4>
                          <p className="text-sm text-slate-400 mt-[3px]">
                            Automatically generate project numbers
                          </p>
                        </div>
                        <button
                          onClick={() => handleCompanyChange('settings.autoNumberProjects', !companyData.settings.autoNumberProjects)}
                          className={`relative w-[55px] h-[29px] rounded-full transition-all ${
                            companyData.settings.autoNumberProjects ? 'bg-blue-500' : 'bg-slate-700'
                          }`}
                        >
                          <div className={`absolute top-[3px] w-[23px] h-[23px] bg-white rounded-full transition-all ${
                            companyData.settings.autoNumberProjects ? 'left-[29px]' : 'left-[3px]'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Approval Settings */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-[21px]">Approval Settings</h3>
                    
                    <div className="space-y-[21px]">
                      <div className="flex items-center justify-between py-[13px]">
                        <div>
                          <h4 className="text-white font-medium">Require Approvals</h4>
                          <p className="text-sm text-slate-400 mt-[3px]">
                            Require manager approval for purchases
                          </p>
                        </div>
                        <button
                          onClick={() => handleCompanyChange('settings.requireApprovals', !companyData.settings.requireApprovals)}
                          className={`relative w-[55px] h-[29px] rounded-full transition-all ${
                            companyData.settings.requireApprovals ? 'bg-blue-500' : 'bg-slate-700'
                          }`}
                        >
                          <div className={`absolute top-[3px] w-[23px] h-[23px] bg-white rounded-full transition-all ${
                            companyData.settings.requireApprovals ? 'left-[29px]' : 'left-[3px]'
                          }`} />
                        </button>
                      </div>
                      
                      {companyData.settings.requireApprovals && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="pl-[21px]"
                        >
                          <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                            Approval Threshold
                          </label>
                          <div className="flex items-center gap-[13px]">
                            <span className="text-slate-400">$</span>
                            <input
                              type="number"
                              value={companyData.settings.approvalThreshold}
                              onChange={(e) => handleCompanyChange('settings.approvalThreshold', parseFloat(e.target.value))}
                              className="w-[144px] px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
                              min="0"
                              step="100"
                            />
                            <span className="text-sm text-slate-500">
                              Purchases above this amount require approval
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-[34px] flex justify-end">
                  <button
                    onClick={saveCompanyData}
                    disabled={saving}
                    className="px-[34px] py-[13px] bg-blue-500 hover:bg-blue-600 text-slate-900 rounded-[8px] font-semibold transition-all disabled:opacity-50 flex items-center gap-[8px]"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Settings
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Roles & Permissions */}
            {activeSection === 'roles' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-[21px]"
              >
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[34px]">
                  <div className="flex items-center justify-between mb-[34px]">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-[13px]">
                      <Users className="w-6 h-6 text-blue-400" />
                      Roles & Permissions
                    </h2>
                    <button
                      onClick={() => {
                        setEditingRole(null);
                        setShowRoleModal(true);
                      }}
                      className="px-[21px] py-[8px] bg-blue-500 hover:bg-blue-600 text-slate-900 rounded-[8px] font-medium transition-all flex items-center gap-[8px]"
                    >
                      <Plus className="w-4 h-4" />
                      Create Role
                    </button>
                  </div>
                  
                  <div className="space-y-[13px]">
                    {roles.map(role => (
                      <div
                        key={role.id}
                        className="p-[21px] bg-slate-700/50 rounded-[13px] border border-slate-600 hover:border-slate-500 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-white flex items-center gap-[8px]">
                              {role.name}
                              {role.isSystem && (
                                <span className="text-xs px-[8px] py-[3px] bg-slate-600 text-slate-300 rounded-full">
                                  System
                                </span>
                              )}
                            </h4>
                            <p className="text-sm text-slate-400 mt-[5px]">{role.description}</p>
                            <div className="flex items-center gap-[21px] mt-[13px] text-sm text-slate-500">
                              <span>{role.memberCount} members</span>
                              <span>{role.permissions.length} permissions</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-[8px]">
                            <button
                              onClick={() => {
                                setEditingRole(role);
                                setShowRoleModal(true);
                              }}
                              className="p-[8px] text-slate-400 hover:text-white transition-all"
                              disabled={role.isSystem}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {/* Delete role */}}
                              className="p-[8px] text-slate-400 hover:text-red-400 transition-all"
                              disabled={role.isSystem}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-gray-700 rounded-[13px] p-[21px]">
                  <div className="flex items-start gap-[13px]">
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-[3px]" />
                    <div className="text-sm text-blue-400">
                      <p className="font-medium mb-[5px]">About Roles</p>
                      <p className="text-blue-400/80">
                        System roles cannot be deleted but can be customized. 
                        Create custom roles to match your organization's structure.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* API & Integrations */}
            {activeSection === 'integrations' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-[21px]"
              >
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[34px]">
                  <div className="flex items-center justify-between mb-[34px]">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-[13px]">
                      <Key className="w-6 h-6 text-blue-400" />
                      API Keys
                    </h2>
                    <button
                      onClick={() => setShowApiKeyModal(true)}
                      className="px-[21px] py-[8px] bg-blue-500 hover:bg-blue-600 text-slate-900 rounded-[8px] font-medium transition-all flex items-center gap-[8px]"
                    >
                      <Plus className="w-4 h-4" />
                      Generate Key
                    </button>
                  </div>
                  
                  {apiKeys.length > 0 ? (
                    <div className="space-y-[13px]">
                      {apiKeys.map(apiKey => (
                        <div
                          key={apiKey.id}
                          className="p-[21px] bg-slate-700/50 rounded-[13px] border border-slate-600"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-white flex items-center gap-[8px]">
                                {apiKey.name}
                                <span className={`text-xs px-[8px] py-[3px] rounded-full ${
                                  apiKey.isActive
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {apiKey.isActive ? 'Active' : 'Revoked'}
                                </span>
                              </h4>
                              <code className="text-sm font-mono text-slate-400 mt-[8px] block">
                                {apiKey.key.substring(0, 20)}...{apiKey.key.substring(apiKey.key.length - 10)}
                              </code>
                              <div className="flex items-center gap-[21px] mt-[13px] text-xs text-slate-500">
                                <span>Created {new Date(apiKey.created).toLocaleDateString()}</span>
                                <span>Last used {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : 'Never'}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => revokeApiKey(apiKey.id)}
                              className="px-[13px] py-[5px] text-sm text-red-400 hover:bg-red-400/10 rounded-[8px] transition-all"
                              disabled={!apiKey.isActive}
                            >
                              Revoke
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-[55px]">
                      <Key className="w-12 h-12 text-slate-600 mx-auto mb-[13px]" />
                      <p className="text-slate-400">No API keys generated yet</p>
                      <p className="text-sm text-slate-500 mt-[5px]">
                        Generate API keys to integrate with external systems
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[34px]">
                  <h3 className="text-xl font-semibold text-white mb-[21px] flex items-center gap-[13px]">
                    <Link2 className="w-6 h-6 text-blue-400" />
                    Available Integrations
                  </h3>
                  
                  <div className="grid gap-[13px]">
                    {[
                      { name: 'Slack', description: 'Send notifications to Slack channels', connected: false },
                      { name: 'Microsoft Teams', description: 'Integrate with Teams for collaboration', connected: false },
                      { name: 'QuickBooks', description: 'Sync financial data', connected: true },
                      { name: 'Google Calendar', description: 'Sync project schedules', connected: false },
                      { name: 'Zapier', description: 'Connect to 3000+ apps', connected: false }
                    ].map((integration, index) => (
                      <div
                        key={index}
                        className="p-[21px] bg-slate-700/50 rounded-[13px] border border-slate-600 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="text-white font-medium">{integration.name}</h4>
                          <p className="text-sm text-slate-400 mt-[3px]">{integration.description}</p>
                        </div>
                        <button
                          className={`px-[21px] py-[8px] rounded-[8px] text-sm font-medium transition-all ${
                            integration.connected
                              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                              : 'bg-blue-500 text-slate-900 hover:bg-blue-600'
                          }`}
                        >
                          {integration.connected ? 'Configure' : 'Connect'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Billing & Subscription */}
            {activeSection === 'billing' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-[21px]"
              >
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[34px]">
                  <h2 className="text-xl font-semibold text-white mb-[34px] flex items-center gap-[13px]">
                    <CreditCard className="w-6 h-6 text-blue-400" />
                    Billing & Subscription
                  </h2>
                  
                  <div className="grid gap-[34px]">
                    {/* Current Plan */}
                    <div className="p-[21px] bg-blue-500/10 border border-gray-700 rounded-[13px]">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-white capitalize">
                            {companyData.subscription.plan} Plan
                          </h3>
                          <p className="text-sm text-slate-400 mt-[5px]">
                            {companyData.subscription.seats} seats • 
                            {companyData.subscription.status === 'active' ? ' Renews ' : ' Expires '}
                            {new Date(companyData.subscription.currentPeriodEnd).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-[13px] py-[5px] text-sm rounded-full ${
                          companyData.subscription.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        } capitalize`}>
                          {companyData.subscription.status}
                        </span>
                      </div>
                    </div>

                    {/* Usage */}
                    <div>
                      <h3 className="text-lg font-medium text-white mb-[21px]">Usage This Period</h3>
                      
                      <div className="grid md:grid-cols-2 gap-[21px]">
                        <div className="p-[21px] bg-slate-700/50 rounded-[13px]">
                          <div className="flex items-center justify-between mb-[13px]">
                            <span className="text-sm text-slate-400">Active Users</span>
                            <span className="text-sm text-slate-400">
                              {companyData.subscription.usedSeats} / {companyData.subscription.seats}
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-[8px] overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${(companyData.subscription.usedSeats / companyData.subscription.seats) * 100}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="p-[21px] bg-slate-700/50 rounded-[13px]">
                          <div className="flex items-center justify-between mb-[13px]">
                            <span className="text-sm text-slate-400">Storage Used</span>
                            <span className="text-sm text-slate-400">42.3 GB / 100 GB</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-[8px] overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: '42.3%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Upgrade Options */}
                    <div>
                      <h3 className="text-lg font-medium text-white mb-[21px]">Upgrade Your Plan</h3>
                      
                      <div className="grid gap-[13px]">
                        {companyData.subscription.plan !== 'enterprise' && (
                          <div className="p-[21px] bg-slate-700/50 rounded-[13px] border border-slate-600 flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-medium">Enterprise Plan</h4>
                              <p className="text-sm text-slate-400 mt-[3px]">
                                Unlimited users • Priority support • Custom integrations
                              </p>
                            </div>
                            <button className="px-[21px] py-[8px] bg-blue-500 hover:bg-blue-600 text-slate-900 rounded-[8px] font-medium transition-all">
                              Contact Sales
                            </button>
                          </div>
                        )}
                        
                        <div className="p-[21px] bg-slate-700/50 rounded-[13px] border border-slate-600 flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">Additional Seats</h4>
                            <p className="text-sm text-slate-400 mt-[3px]">
                              Add more users to your current plan
                            </p>
                          </div>
                          <button className="px-[21px] py-[8px] bg-slate-700 hover:bg-slate-600 text-white rounded-[8px] font-medium transition-all">
                            Add Seats
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Compliance & Security */}
            {activeSection === 'compliance' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[34px]"
              >
                <h2 className="text-xl font-semibold text-white mb-[34px] flex items-center gap-[13px]">
                  <Shield className="w-6 h-6 text-blue-400" />
                  Compliance & Security
                </h2>
                
                <div className="grid gap-[34px]">
                  {/* Security Settings */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-[21px]">Security Requirements</h3>
                    
                    <div className="space-y-[21px]">
                      {[
                        { name: 'Two-Factor Authentication', description: 'Require 2FA for all users', key: 'require2FA' },
                        { name: 'Strong Passwords', description: 'Enforce minimum password complexity', key: 'strongPasswords' },
                        { name: 'Session Timeout', description: 'Automatically log out inactive users', key: 'sessionTimeout' },
                        { name: 'IP Whitelisting', description: 'Restrict access to specific IP addresses', key: 'ipWhitelist' }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between py-[13px] border-b border-slate-700 last:border-0">
                          <div>
                            <h4 className="text-white font-medium">{setting.name}</h4>
                            <p className="text-sm text-slate-400 mt-[3px]">{setting.description}</p>
                          </div>
                          <button className="relative w-[55px] h-[29px] rounded-full transition-all bg-slate-700">
                            <div className="absolute top-[3px] left-[3px] w-[23px] h-[23px] bg-white rounded-full transition-all" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Compliance */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-[21px]">Compliance Standards</h3>
                    
                    <div className="grid gap-[13px]">
                      {[
                        { standard: 'SOC 2 Type II', status: 'Compliant', date: '2024-06-15' },
                        { standard: 'ISO 27001', status: 'In Progress', date: '2024-12-01' },
                        { standard: 'GDPR', status: 'Compliant', date: '2024-05-20' }
                      ].map((item, index) => (
                        <div key={index} className="p-[21px] bg-slate-700/50 rounded-[13px] flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">{item.standard}</h4>
                            <p className="text-sm text-slate-400 mt-[3px]">
                              {item.status === 'Compliant' ? 'Last audit: ' : 'Expected: '}
                              {new Date(item.date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-[13px] py-[5px] text-sm rounded-full ${
                            item.status === 'Compliant'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audit Logs */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-[21px]">Audit Logs</h3>
                    
                    <div className="p-[21px] bg-slate-700/50 rounded-[13px] flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">Activity Logging</h4>
                        <p className="text-sm text-slate-400 mt-[3px]">
                          Track all user actions and system changes
                        </p>
                      </div>
                      <button className="px-[21px] py-[8px] bg-slate-700 hover:bg-slate-600 text-white rounded-[8px] font-medium transition-all">
                        View Logs
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Data Management */}
            {activeSection === 'data' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[34px]"
              >
                <h2 className="text-xl font-semibold text-white mb-[34px] flex items-center gap-[13px]">
                  <Database className="w-6 h-6 text-blue-400" />
                  Data Management
                </h2>
                
                <div className="grid gap-[34px]">
                  {/* Data Retention */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-[21px]">Data Retention Policy</h3>
                    
                    <div className="grid gap-[21px]">
                      {[
                        { type: 'Project Data', retention: '7 years', size: '124.3 GB' },
                        { type: 'Financial Records', retention: '10 years', size: '45.2 GB' },
                        { type: 'Safety Reports', retention: '5 years', size: '23.8 GB' },
                        { type: 'Equipment Logs', retention: '3 years', size: '67.9 GB' }
                      ].map((policy, index) => (
                        <div key={index} className="grid md:grid-cols-3 gap-[21px] items-center py-[13px] border-b border-slate-700 last:border-0">
                          <span className="text-white font-medium">{policy.type}</span>
                          <div className="flex items-center gap-[13px]">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <select className="px-[13px] py-[5px] bg-slate-700 text-white rounded-[8px] text-sm">
                              <option>1 year</option>
                              <option>3 years</option>
                              <option>5 years</option>
                              <option selected>7 years</option>
                              <option>10 years</option>
                              <option>Forever</option>
                            </select>
                          </div>
                          <span className="text-sm text-slate-400 text-right">{policy.size}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Export/Import */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-[21px]">Export & Backup</h3>
                    
                    <div className="grid gap-[13px]">
                      <div className="p-[21px] bg-slate-700/50 rounded-[13px] flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Export Company Data</h4>
                          <p className="text-sm text-slate-400 mt-[3px]">
                            Download all company data in standard formats
                          </p>
                        </div>
                        <button className="px-[21px] py-[8px] bg-slate-700 hover:bg-slate-600 text-white rounded-[8px] font-medium transition-all flex items-center gap-[8px]">
                          <Download className="w-4 h-4" />
                          Export
                        </button>
                      </div>
                      
                      <div className="p-[21px] bg-slate-700/50 rounded-[13px] flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Scheduled Backups</h4>
                          <p className="text-sm text-slate-400 mt-[3px]">
                            Automatic daily backups at 2:00 AM EST
                          </p>
                        </div>
                        <button className="px-[21px] py-[8px] bg-blue-500 hover:bg-blue-600 text-slate-900 rounded-[8px] font-medium transition-all">
                          Configure
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Saving Indicator */}
      <AnimatePresence>
        {saving && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-[34px] right-[34px] bg-slate-800 border border-slate-700 rounded-[13px] p-[21px] flex items-center gap-[13px] shadow-lg"
          >
            <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
            <span className="text-white font-medium">Saving changes...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
