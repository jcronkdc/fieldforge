import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Globe, Bell, Camera,
  Shield, Award, Calendar, Save, Edit2, X, Check,
  AlertTriangle, Clock, Languages, Moon, Sun, Download,
  UserPlus, Key, Briefcase, Building, HardHat
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthContext } from '../auth/AuthProvider';
import { supabase } from '../../lib/supabase';

interface UserProfileData {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  job_title: string;
  employee_id?: string;
  department?: string;
  location?: string;
  timezone: string;
  language: string;
  avatar_url?: string;
  bio?: string;
  
  // Emergency Contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  
  // Professional Info
  hire_date?: string;
  supervisor_id?: string;
  supervisor_name?: string;
  
  // Preferences
  theme: 'light' | 'dark' | 'auto';
  notifications_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  
  // Metadata
  created_at: string;
  updated_at: string;
  last_login?: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string;
  certificate_number?: string;
  status: 'active' | 'expiring_soon' | 'expired';
  document_url?: string;
}

interface Training {
  id: string;
  course_name: string;
  provider: string;
  completion_date: string;
  hours?: number;
  certificate_url?: string;
  next_renewal?: string;
}

export const UserProfile: React.FC = () => {
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'certifications' | 'emergency' | 'preferences'>('profile');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<UserProfileData>>({});
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    issue_date: '',
    expiry_date: '',
    certificate_number: ''
  });
  const [showCertForm, setShowCertForm] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchCertifications();
    fetchTrainings();
  }, [user]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      // Fetch user profile
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (profileData) {
        setProfile(profileData);
        setFormData(profileData);
      } else {
        // Create default profile if none exists
        const defaultProfile: Partial<UserProfileData> = {
          id: user?.id || '',
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || '',
          phone: '',
          job_title: '',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: 'en',
          theme: 'dark',
          notifications_enabled: true,
          email_notifications: true,
          sms_notifications: false
        };
        
        setProfile(defaultProfile as UserProfileData);
        setFormData(defaultProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchCertifications = async () => {
    try {
      const response = await fetch('/api/users/certifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCertifications(data.certifications || []);
      }
    } catch (error) {
      console.error('Error fetching certifications:', error);
    }
  };

  const fetchTrainings = async () => {
    try {
      const response = await fetch('/api/users/trainings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTrainings(data.trainings || []);
      }
    } catch (error) {
      console.error('Error fetching trainings:', error);
    }
  };

  const updateProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      setEditMode(false);
      toast.success('Profile updated successfully');
      
      // Update theme if changed
      if (formData.theme && formData.theme !== profile?.theme) {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(formData.theme);
        localStorage.setItem('fieldforge_theme', formData.theme);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        const response = await fetch('/api/users/avatar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ avatar: base64 })
        });

        if (!response.ok) {
          throw new Error('Failed to upload avatar');
        }

        const data = await response.json();
        setFormData({ ...formData, avatar_url: data.avatar_url });
        if (profile) {
          setProfile({ ...profile, avatar_url: data.avatar_url });
        }
        toast.success('Avatar updated successfully');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const addCertification = async () => {
    try {
      const response = await fetch('/api/users/certifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newCertification)
      });

      if (!response.ok) {
        throw new Error('Failed to add certification');
      }

      toast.success('Certification added successfully');
      setShowCertForm(false);
      setNewCertification({
        name: '',
        issuer: '',
        issue_date: '',
        expiry_date: '',
        certificate_number: ''
      });
      fetchCertifications();
    } catch (error) {
      console.error('Error adding certification:', error);
      toast.error('Failed to add certification');
    }
  };

  const exportUserData = async () => {
    try {
      const response = await fetch('/api/users/export', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fieldforge-profile-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-blue-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[21px] p-[34px]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-[21px]">
          <div className="flex items-center gap-[21px]">
            <div className="relative">
              <div className="w-[89px] h-[89px] rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()
                )}
              </div>
              {editMode && (
                <label className="absolute bottom-0 right-0 p-[8px] bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 transition-all">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </label>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {editMode ? (
                  <input
                    type="text"
                    value={formData.full_name || ''}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="bg-slate-700 text-white px-[13px] py-[5px] rounded-[8px]"
                  />
                ) : (
                  profile?.full_name || 'User Profile'
                )}
              </h1>
              <p className="text-slate-400">
                {editMode ? (
                  <input
                    type="text"
                    value={formData.job_title || ''}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    className="bg-slate-700 text-white px-[13px] py-[5px] rounded-[8px] text-sm"
                    placeholder="Job Title"
                  />
                ) : (
                  profile?.job_title || 'Construction Professional'
                )}
              </p>
              <p className="text-sm text-slate-500 mt-[5px]">{profile?.email}</p>
            </div>
          </div>
          
          <div className="flex gap-[13px]">
            {editMode ? (
              <>
                <button
                  onClick={updateProfile}
                  className="px-[21px] py-[8px] bg-blue-500 hover:bg-blue-600 text-white rounded-[8px] font-semibold transition-all flex items-center gap-[8px]"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setFormData(profile || {});
                  }}
                  className="px-[21px] py-[8px] bg-slate-700 hover:bg-slate-600 text-white rounded-[8px] font-semibold transition-all"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="px-[21px] py-[8px] bg-blue-500 hover:bg-blue-600 text-white rounded-[8px] font-semibold transition-all flex items-center gap-[8px]"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-[13px] border-b border-slate-700">
        {(['profile', 'certifications', 'emergency', 'preferences'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-[21px] py-[13px] font-medium capitalize transition-all border-b-2 ${
              activeTab === tab
                ? 'text-blue-400 border-gray-700'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-2 gap-[21px]"
          >
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[21px]">
              <h2 className="text-lg font-semibold text-white mb-[21px]">Personal Information</h2>
              <div className="space-y-[13px]">
                <div className="flex items-center gap-[13px] text-slate-300">
                  <Mail className="w-5 h-5 text-slate-500" />
                  <span>{profile?.email}</span>
                </div>
                
                <div className="flex items-center gap-[13px] text-slate-300">
                  <Phone className="w-5 h-5 text-slate-500" />
                  {editMode ? (
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-slate-700 text-white px-[8px] py-[3px] rounded text-sm flex-1"
                      placeholder="Phone number"
                    />
                  ) : (
                    <span>{profile?.phone || 'Not provided'}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-[13px] text-slate-300">
                  <MapPin className="w-5 h-5 text-slate-500" />
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="bg-slate-700 text-white px-[8px] py-[3px] rounded text-sm flex-1"
                      placeholder="Location"
                    />
                  ) : (
                    <span>{profile?.location || 'Not provided'}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-[13px] text-slate-300">
                  <Building className="w-5 h-5 text-slate-500" />
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.department || ''}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="bg-slate-700 text-white px-[8px] py-[3px] rounded text-sm flex-1"
                      placeholder="Department"
                    />
                  ) : (
                    <span>{profile?.department || 'Not assigned'}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-[13px] text-slate-300">
                  <Briefcase className="w-5 h-5 text-slate-500" />
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.employee_id || ''}
                      onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                      className="bg-slate-700 text-white px-[8px] py-[3px] rounded text-sm flex-1"
                      placeholder="Employee ID"
                    />
                  ) : (
                    <span>ID: {profile?.employee_id || 'Not assigned'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[21px]">
              <h2 className="text-lg font-semibold text-white mb-[21px]">Professional Details</h2>
              <div className="space-y-[13px]">
                <div className="flex items-center gap-[13px] text-slate-300">
                  <Calendar className="w-5 h-5 text-slate-500" />
                  <span>Joined: {profile?.hire_date ? new Date(profile.hire_date).toLocaleDateString() : 'Not specified'}</span>
                </div>
                
                <div className="flex items-center gap-[13px] text-slate-300">
                  <UserPlus className="w-5 h-5 text-slate-500" />
                  <span>Supervisor: {profile?.supervisor_name || 'Not assigned'}</span>
                </div>
                
                <div className="flex items-center gap-[13px] text-slate-300">
                  <Clock className="w-5 h-5 text-slate-500" />
                  <span>Last Login: {profile?.last_login ? new Date(profile.last_login).toLocaleString() : 'Never'}</span>
                </div>
              </div>

              {editMode && (
                <div className="mt-[21px] pt-[21px] border-t border-slate-700">
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">Bio</label>
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-slate-700 text-white px-[13px] py-[8px] rounded-[8px] min-h-[89px]"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              )}

              {!editMode && profile?.bio && (
                <div className="mt-[21px] pt-[21px] border-t border-slate-700">
                  <p className="text-sm text-slate-300">{profile.bio}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Certifications Tab */}
        {activeTab === 'certifications' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-[21px]"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Certifications & Training</h2>
              <button
                onClick={() => setShowCertForm(true)}
                className="px-[21px] py-[8px] bg-blue-500 hover:bg-blue-600 text-white rounded-[8px] font-semibold transition-all flex items-center gap-[8px]"
              >
                <Award className="w-4 h-4" />
                Add Certification
              </button>
            </div>

            <div className="grid gap-[13px]">
              {certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[21px]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-[13px]">
                      <div className={`p-[8px] rounded-full ${
                        cert.status === 'active' ? 'bg-green-500/20' :
                        cert.status === 'expiring_soon' ? 'bg-blue-500/20' :
                        'bg-red-500/20'
                      }`}>
                        <Shield className={`w-5 h-5 ${
                          cert.status === 'active' ? 'text-green-400' :
                          cert.status === 'expiring_soon' ? 'text-blue-400' :
                          'text-red-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{cert.name}</h3>
                        <p className="text-sm text-slate-400">Issued by {cert.issuer}</p>
                        <p className="text-xs text-slate-500 mt-[5px]">
                          Certificate #{cert.certificate_number || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">
                        Issued: {new Date(cert.issue_date).toLocaleDateString()}
                      </p>
                      {cert.expiry_date && (
                        <p className={`text-sm ${
                          cert.status === 'expired' ? 'text-red-400' :
                          cert.status === 'expiring_soon' ? 'text-blue-400' :
                          'text-green-400'
                        }`}>
                          {cert.status === 'expired' ? 'Expired' : 'Expires'}: {new Date(cert.expiry_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {trainings.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-white mt-[34px]">Training History</h3>
                <div className="grid gap-[13px]">
                  {trainings.map((training) => (
                    <div
                      key={training.id}
                      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[21px]"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-white">{training.course_name}</h4>
                          <p className="text-sm text-slate-400">by {training.provider}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-400">
                            Completed: {new Date(training.completion_date).toLocaleDateString()}
                          </p>
                          {training.hours && (
                            <p className="text-sm text-slate-500">{training.hours} hours</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Emergency Contact Tab */}
        {activeTab === 'emergency' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[34px]"
          >
            <div className="flex items-center gap-[13px] mb-[21px]">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h2 className="text-lg font-semibold text-white">Emergency Contact Information</h2>
            </div>
            
            <div className="space-y-[21px]">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                  Contact Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.emergency_contact_name || ''}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    className="w-full bg-slate-700 text-white px-[13px] py-[8px] rounded-[8px]"
                    placeholder="Emergency contact name"
                  />
                ) : (
                  <p className="text-white">{profile?.emergency_contact_name || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                  Phone Number
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    value={formData.emergency_contact_phone || ''}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    className="w-full bg-slate-700 text-white px-[13px] py-[8px] rounded-[8px]"
                    placeholder="Emergency contact phone"
                  />
                ) : (
                  <p className="text-white">{profile?.emergency_contact_phone || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                  Relationship
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.emergency_contact_relationship || ''}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_relationship: e.target.value })}
                    className="w-full bg-slate-700 text-white px-[13px] py-[8px] rounded-[8px]"
                    placeholder="e.g., Spouse, Parent, Friend"
                  />
                ) : (
                  <p className="text-white">{profile?.emergency_contact_relationship || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="mt-[34px] p-[21px] bg-red-500/10 border border-red-500/30 rounded-[13px]">
              <p className="text-sm text-red-400">
                This information is critical for your safety. Please ensure it is up to date and accurate.
              </p>
            </div>
          </motion.div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-2 gap-[21px]"
          >
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[21px]">
              <h2 className="text-lg font-semibold text-white mb-[21px]">Display Preferences</h2>
              <div className="space-y-[21px]">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-[8px]">
                    {(['light', 'dark', 'auto'] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setFormData({ ...formData, theme })}
                        disabled={!editMode}
                        className={`px-[13px] py-[8px] rounded-[8px] capitalize font-medium transition-all flex items-center justify-center gap-[8px] ${
                          formData.theme === theme
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-700 text-slate-400 hover:text-white'
                        } ${!editMode && 'opacity-50 cursor-not-allowed'}`}
                      >
                        {theme === 'light' && <Sun className="w-4 h-4" />}
                        {theme === 'dark' && <Moon className="w-4 h-4" />}
                        {theme === 'auto' && <Clock className="w-4 h-4" />}
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Language
                  </label>
                  {editMode ? (
                    <select
                      value={formData.language || 'en'}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full bg-slate-700 text-white px-[13px] py-[8px] rounded-[8px]"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                    </select>
                  ) : (
                    <p className="text-white">
                      {formData.language === 'es' ? 'Español' :
                       formData.language === 'fr' ? 'Français' : 'English'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Timezone
                  </label>
                  {editMode ? (
                    <select
                      value={formData.timezone || ''}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="w-full bg-slate-700 text-white px-[13px] py-[8px] rounded-[8px]"
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  ) : (
                    <p className="text-white">{profile?.timezone}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[21px]">
              <h2 className="text-lg font-semibold text-white mb-[21px]">Notification Settings</h2>
              <div className="space-y-[13px]">
                <label className="flex items-center gap-[13px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notifications_enabled}
                    onChange={(e) => setFormData({ ...formData, notifications_enabled: e.target.checked })}
                    disabled={!editMode}
                    className="w-5 h-5 text-blue-500"
                  />
                  <div>
                    <span className="text-white">Enable Notifications</span>
                    <p className="text-xs text-slate-400">Receive alerts and updates</p>
                  </div>
                </label>

                <label className="flex items-center gap-[13px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.email_notifications}
                    onChange={(e) => setFormData({ ...formData, email_notifications: e.target.checked })}
                    disabled={!editMode || !formData.notifications_enabled}
                    className="w-5 h-5 text-blue-500"
                  />
                  <div>
                    <span className="text-white">Email Notifications</span>
                    <p className="text-xs text-slate-400">Important updates via email</p>
                  </div>
                </label>

                <label className="flex items-center gap-[13px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sms_notifications}
                    onChange={(e) => setFormData({ ...formData, sms_notifications: e.target.checked })}
                    disabled={!editMode || !formData.notifications_enabled}
                    className="w-5 h-5 text-blue-500"
                  />
                  <div>
                    <span className="text-white">SMS Notifications</span>
                    <p className="text-xs text-slate-400">Urgent alerts via text</p>
                  </div>
                </label>
              </div>

              <div className="mt-[34px] pt-[21px] border-t border-slate-700">
                <button
                  onClick={exportUserData}
                  className="w-full px-[21px] py-[13px] bg-slate-700 hover:bg-slate-600 text-white rounded-[8px] font-semibold transition-all flex items-center justify-center gap-[8px]"
                >
                  <Download className="w-4 h-4" />
                  Export My Data
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Certification Form Modal */}
      <AnimatePresence>
        {showCertForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-[21px] p-[34px] max-w-lg w-full"
            >
              <h3 className="text-xl font-bold text-white mb-[21px]">Add Certification</h3>
              
              <div className="space-y-[21px]">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Certification Name
                  </label>
                  <input
                    type="text"
                    value={newCertification.name}
                    onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                    className="w-full bg-slate-800 text-white px-[13px] py-[8px] rounded-[8px]"
                    placeholder="e.g., OSHA 30-Hour"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Issuing Organization
                  </label>
                  <input
                    type="text"
                    value={newCertification.issuer}
                    onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                    className="w-full bg-slate-800 text-white px-[13px] py-[8px] rounded-[8px]"
                    placeholder="e.g., OSHA"
                  />
                </div>

                <div className="grid grid-cols-2 gap-[21px]">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      value={newCertification.issue_date}
                      onChange={(e) => setNewCertification({ ...newCertification, issue_date: e.target.value })}
                      className="w-full bg-slate-800 text-white px-[13px] py-[8px] rounded-[8px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={newCertification.expiry_date}
                      onChange={(e) => setNewCertification({ ...newCertification, expiry_date: e.target.value })}
                      className="w-full bg-slate-800 text-white px-[13px] py-[8px] rounded-[8px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Certificate Number
                  </label>
                  <input
                    type="text"
                    value={newCertification.certificate_number}
                    onChange={(e) => setNewCertification({ ...newCertification, certificate_number: e.target.value })}
                    className="w-full bg-slate-800 text-white px-[13px] py-[8px] rounded-[8px]"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="flex gap-[13px] mt-[34px]">
                <button
                  onClick={addCertification}
                  className="flex-1 px-[21px] py-[13px] bg-blue-500 hover:bg-blue-600 text-white rounded-[8px] font-semibold transition-all"
                >
                  Add Certification
                </button>
                <button
                  onClick={() => {
                    setShowCertForm(false);
                    setNewCertification({
                      name: '',
                      issuer: '',
                      issue_date: '',
                      expiry_date: '',
                      certificate_number: ''
                    });
                  }}
                  className="flex-1 px-[21px] py-[13px] bg-slate-700 hover:bg-slate-600 text-white rounded-[8px] font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
