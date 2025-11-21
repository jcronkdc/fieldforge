import React, { useState, useEffect } from 'react';
import { 
  Building, Users, Palette, Key, CreditCard, Globe, 
  Shield, Archive, Upload, Save, AlertTriangle, 
  Check, Compass, Settings, Zap
} from 'lucide-react';
import { useAuthContext } from '../auth/AuthProvider';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface CompanyData {
  id: string;
  name: string;
  legal_name: string;
  tax_id: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  branding: {
    logo_url: string;
    primary_color: string;
    secondary_color: string;
  };
  settings: {
    default_language: string;
    timezone: string;
    currency: string;
    fiscal_year_start: number;
  };
  subscription: {
    plan: string;
    status: string;
    seats: number;
    billing_email: string;
    next_billing_date: string;
  };
  integrations: {
    accounting: { enabled: boolean; provider: string };
    crm: { enabled: boolean; provider: string };
    payroll: { enabled: boolean; provider: string };
  };
  data_retention: {
    projects: number; // months
    documents: number;
    analytics: number;
  };
}

export const CompanySettings: React.FC = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'branding' | 'integrations' | 'billing' | 'data'>('profile');
  
  const [companyData, setCompanyData] = useState<CompanyData>({
    id: '',
    name: '',
    legal_name: '',
    tax_id: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'US'
    },
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    branding: {
      logo_url: '',
      primary_color: '#F59E0B',
      secondary_color: '#1F2937'
    },
    settings: {
      default_language: 'en',
      timezone: 'America/New_York',
      currency: 'USD',
      fiscal_year_start: 1
    },
    subscription: {
      plan: 'Professional',
      status: 'active',
      seats: 25,
      billing_email: '',
      next_billing_date: ''
    },
    integrations: {
      accounting: { enabled: false, provider: '' },
      crm: { enabled: false, provider: '' },
      payroll: { enabled: false, provider: '' }
    },
    data_retention: {
      projects: 24,
      documents: 36,
      analytics: 12
    }
  });

  useEffect(() => {
    checkAdminAccess();
    fetchCompanyData();
  }, [user?.id]);

  const checkAdminAccess = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('role, is_admin')
        .eq('id', user?.id)
        .single();

      setIsAdmin(data?.is_admin || data?.role === 'admin');
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
    }
  };

  const fetchCompanyData = async () => {
    try {
      const response = await fetch('/api/company/settings', {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCompanyData(data.company || companyData);
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCompanyData = async () => {
    if (!isAdmin) {
      toast.error('Only administrators can modify company settings');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/company/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify(companyData)
      });

      if (response.ok) {
        toast.success('Company settings saved successfully');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving company data:', error);
      toast.error('Failed to save company settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${companyData.id}-logo.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('company-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('company-assets')
        .getPublicUrl(fileName);

      setCompanyData({
        ...companyData,
        branding: { ...companyData.branding, logo_url: urlData.publicUrl }
      });

      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950   flex items-center justify-center">
        <div className="text-center">
          <Building className="w-[89px] h-[89px] text-blue-400 mx-auto mb-[21px] animate-pulse" />
          <p className="text-blue-400/60">Loading company settings...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950   flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-[89px] h-[89px] text-red-400 mx-auto mb-[21px]" />
          <h1 className="text-xl font-bold text-white mb-[8px]">Access Denied</h1>
          <p className="text-blue-400/60">Only administrators can access company settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-[34px] max-w-6xl mx-auto space-y-[34px]">
      {/* Header */}
      <div className="relative">
        <div className="absolute -right-8 -top-8 opacity-5">
          <Compass className="w-[144px] h-[144px] text-blue-400" style={{ animation: ' 35s linear infinite reverse' }} />
        </div>
        <div className="relative">
          <div className="absolute -left-[55px] top-1/2 transform -translate-y-1/2 hidden lg:block opacity-10">
            <Building className="w-[34px] h-[34px] text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-[8px] ">Company Settings</h1>
          <p className="text-blue-400/60 " >Manage organization-wide configuration</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-[8px] border-b border-gray-700 pb-[8px]">
        {[
          { id: 'profile', label: 'Company Profile', icon: Building },
          { id: 'branding', label: 'Branding', icon: Palette },
          { id: 'integrations', label: 'Integrations', icon: Zap },
          { id: 'billing', label: 'Billing', icon: CreditCard },
          { id: 'data', label: 'Data & Security', icon: Shield }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-[21px] py-[13px] rounded-t-[8px] font-medium transition-all flex items-center gap-[8px] ${
              activeTab === tab.id
                ? 'bg-blue-500/20 text-blue-400 border-b-2 border-gray-700'
                : 'text-blue-400/60 hover:text-blue-400 hover:bg-blue-500/10'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-gray-700 rounded-[21px] p-[34px] bg-gray-800/50 border border-gray-700 rounded-lg">
        {/* Company Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-[34px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[21px]">
              <div>
                <label className="block text-sm font-medium text-blue-400/60 mb-[8px] " >Company Name</label>
                <input
                  type="text"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px] border border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-400/60 mb-[8px] " >Legal Name</label>
                <input
                  type="text"
                  value={companyData.legal_name}
                  onChange={(e) => setCompanyData({ ...companyData, legal_name: e.target.value })}
                  className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px] border border-gray-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[21px]">
              <div>
                <label className="block text-sm font-medium text-blue-400/60 mb-[8px]">Tax ID / EIN</label>
                <input
                  type="text"
                  value={companyData.tax_id}
                  onChange={(e) => setCompanyData({ ...companyData, tax_id: e.target.value })}
                  className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-400/60 mb-[8px]">Phone</label>
                <input
                  type="tel"
                  value={companyData.contact.phone}
                  onChange={(e) => setCompanyData({
                    ...companyData,
                    contact: { ...companyData.contact, phone: e.target.value }
                  })}
                  className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-400/60 mb-[8px]">Address</label>
              <div className="space-y-[13px]">
                <input
                  type="text"
                  value={companyData.address.street}
                  onChange={(e) => setCompanyData({
                    ...companyData,
                    address: { ...companyData.address, street: e.target.value }
                  })}
                  placeholder="Street Address"
                  className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-[13px]">
                  <input
                    type="text"
                    value={companyData.address.city}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      address: { ...companyData.address, city: e.target.value }
                    })}
                    placeholder="City"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                  />
                  <input
                    type="text"
                    value={companyData.address.state}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      address: { ...companyData.address, state: e.target.value }
                    })}
                    placeholder="State"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                  />
                  <input
                    type="text"
                    value={companyData.address.zip}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      address: { ...companyData.address, zip: e.target.value }
                    })}
                    placeholder="ZIP"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                  />
                  <select
                    value={companyData.address.country}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      address: { ...companyData.address, country: e.target.value }
                    })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                  >
                    <option value="US">USA</option>
                    <option value="CA">Canada</option>
                    <option value="MX">Mexico</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[21px]">
              <div>
                <label className="block text-sm font-medium text-blue-400/60 mb-[8px]">Default Language</label>
                <select
                  value={companyData.settings.default_language}
                  onChange={(e) => setCompanyData({
                    ...companyData,
                    settings: { ...companyData.settings, default_language: e.target.value }
                  })}
                  className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-400/60 mb-[8px]">Timezone</label>
                <select
                  value={companyData.settings.timezone}
                  onChange={(e) => setCompanyData({
                    ...companyData,
                    settings: { ...companyData.settings, timezone: e.target.value }
                  })}
                  className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="space-y-[34px]">
            <div>
              <label className="block text-sm font-medium text-blue-400/60 mb-[8px] " >Company Logo</label>
              <div className="flex items-center gap-[21px]">
                {companyData.branding.logo_url ? (
                  <img 
                    src={companyData.branding.logo_url} 
                    alt="Company Logo" 
                    className="w-[89px] h-[89px] rounded-[13px] border border-gray-700 object-cover"
                  />
                ) : (
                  <div className="w-[89px] h-[89px] rounded-[13px] border-2 border-dashed border-gray-700 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-blue-400/60" />
                  </div>
                )}
                <label className="px-[34px] py-[13px] bg-blue-500 hover:bg-blue-600 text-white rounded-[8px] font-medium cursor-pointer transition-all bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
                  Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[21px]">
              <div>
                <label className="block text-sm font-medium text-blue-400/60 mb-[8px]">Primary Color</label>
                <div className="flex gap-[13px]">
                  <input
                    type="color"
                    value={companyData.branding.primary_color}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      branding: { ...companyData.branding, primary_color: e.target.value }
                    })}
                    className="w-[55px] h-[55px] rounded-[8px] border border-gray-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={companyData.branding.primary_color}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      branding: { ...companyData.branding, primary_color: e.target.value }
                    })}
                    className="flex-1 w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-400/60 mb-[8px]">Secondary Color</label>
                <div className="flex gap-[13px]">
                  <input
                    type="color"
                    value={companyData.branding.secondary_color}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      branding: { ...companyData.branding, secondary_color: e.target.value }
                    })}
                    className="w-[55px] h-[55px] rounded-[8px] border border-gray-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={companyData.branding.secondary_color}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      branding: { ...companyData.branding, secondary_color: e.target.value }
                    })}
                    className="flex-1 w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="space-y-[34px]">
            {Object.entries(companyData.integrations).map(([key, integration]) => (
              <div key={key} className="p-[21px] bg-slate-800/30 rounded-[13px] space-y-[13px]">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-white capitalize">{key} Integration</h3>
                  <button
                    onClick={() => setCompanyData({
                      ...companyData,
                      integrations: {
                        ...companyData.integrations,
                        [key]: { ...integration, enabled: !integration.enabled }
                      }
                    })}
                    className={`w-[55px] h-[34px] rounded-full transition-all relative ${
                      integration.enabled ? 'bg-blue-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`absolute top-[3px] w-[28px] h-[28px] bg-white rounded-full transition-all ${
                      integration.enabled ? 'left-[24px]' : 'left-[3px]'
                    }`} />
                  </button>
                </div>
                {integration.enabled && (
                  <select
                    value={integration.provider}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      integrations: {
                        ...companyData.integrations,
                        [key]: { ...integration, provider: e.target.value }
                      }
                    })}
                    className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                  >
                    <option value="">Select Provider</option>
                    {key === 'accounting' && (
                      <>
                        <option value="quickbooks">QuickBooks</option>
                        <option value="xero">Xero</option>
                        <option value="sage">Sage</option>
                      </>
                    )}
                    {key === 'crm' && (
                      <>
                        <option value="salesforce">Salesforce</option>
                        <option value="hubspot">HubSpot</option>
                        <option value="pipedrive">Pipedrive</option>
                      </>
                    )}
                    {key === 'payroll' && (
                      <>
                        <option value="adp">ADP</option>
                        <option value="paychex">Paychex</option>
                        <option value="gusto">Gusto</option>
                      </>
                    )}
                  </select>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-[34px]">
            <div className="p-[21px] bg-slate-800/30 rounded-[13px] flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-400/60">Current Plan</p>
                <p className="text-base font-bold text-white">{companyData.subscription.plan}</p>
              </div>
              <div className={`px-[13px] py-[5px] rounded-full text-sm font-medium ${
                companyData.subscription.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {companyData.subscription.status.toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[21px]">
              <div>
                <label className="block text-sm font-medium text-blue-400/60 mb-[8px]">Licensed Seats</label>
                <input
                  type="number"
                  value={companyData.subscription.seats}
                  readOnly
                  className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px] opacity-60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-400/60 mb-[8px]">Billing Email</label>
                <input
                  type="email"
                  value={companyData.subscription.billing_email}
                  onChange={(e) => setCompanyData({
                    ...companyData,
                    subscription: { ...companyData.subscription, billing_email: e.target.value }
                  })}
                  className="w-full w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
                />
              </div>
            </div>

            <div className="p-[21px] bg-blue-500/10 border border-gray-700 rounded-[13px]">
              <div className="flex items-start gap-[13px]">
                <AlertTriangle className="w-5 h-5 text-blue-400 mt-[2px]" />
                <div>
                  <p className="text-blue-400 font-medium">Next Billing Date</p>
                  <p className="text-blue-400/80 text-sm mt-[5px]">
                    Your subscription will renew on {new Date(companyData.subscription.next_billing_date || Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data & Security Tab */}
        {activeTab === 'data' && (
          <div className="space-y-[34px]">
            <div>
              <h3 className="text-base font-medium text-white mb-[21px]">Data Retention Policy</h3>
              <div className="space-y-[13px]">
                {Object.entries(companyData.data_retention).map(([key, months]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-white capitalize">{key} Data</span>
                    <select
                      value={months}
                      onChange={(e) => setCompanyData({
                        ...companyData,
                        data_retention: { ...companyData.data_retention, [key]: parseInt(e.target.value) }
                      })}
                      className="w-[144px] w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-slate-800/50 text-white px-[21px] py-[8px] rounded-[8px]"
                    >
                      <option value="6">6 months</option>
                      <option value="12">1 year</option>
                      <option value="24">2 years</option>
                      <option value="36">3 years</option>
                      <option value="60">5 years</option>
                      <option value="-1">Forever</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-[21px] bg-slate-800/30 rounded-[13px] space-y-[13px]">
              <h4 className="text-white font-medium flex items-center gap-[8px]">
                <Shield className="w-5 h-5 text-green-400" />
                Security Settings
              </h4>
              <div className="space-y-[8px] text-sm">
                <div className="flex items-center gap-[8px]">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">SSL/TLS encryption enabled</span>
                </div>
                <div className="flex items-center gap-[8px]">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Two-factor authentication available</span>
                </div>
                <div className="flex items-center gap-[8px]">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Regular security audits</span>
                </div>
                <div className="flex items-center gap-[8px]">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">GDPR compliant</span>
                </div>
              </div>
            </div>

            <button className="w-full px-[34px] py-[13px] bg-slate-800/50 hover:bg-slate-700/50 border border-gray-700 rounded-[8px] font-medium text-white transition-all flex items-center justify-center gap-[8px] border border-gray-700">
              <Archive className="w-5 h-5" />
              Export All Company Data
            </button>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveCompanyData}
          disabled={saving}
          className="px-[55px] py-[21px] bg-blue-500 hover:bg-blue-600 disabled:bg-blue-700 text-white rounded-[13px] font-bold transition-all flex items-center gap-[13px] bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all   "
        >
          {saving ? (
            <>
              <Settings className="w-5 h-5 animate-spin" />
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

    </div>
  );
};

export default CompanySettings;
