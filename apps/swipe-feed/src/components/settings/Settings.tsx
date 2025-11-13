import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Palette, Bell, Database, Globe, 
  Zap, Shield, Download, Upload, RefreshCw, Monitor, 
  Moon, Sun, Smartphone, Compass, Ruler
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import '../../styles/davinci.css';

interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    safety: boolean;
    projects: boolean;
    equipment: boolean;
    crew: boolean;
    documents: boolean;
    email_digest: 'daily' | 'weekly' | 'never';
  };
  sync_preferences: {
    wifi_only: boolean;
    auto_sync: boolean;
    sync_interval: number;
  };
  performance: {
    animations: boolean;
    high_quality_images: boolean;
    cache_size: number;
  };
}

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'auto',
    language: 'en',
    notifications: {
      safety: true,
      projects: true,
      equipment: true,
      crew: true,
      documents: true,
      email_digest: 'daily'
    },
    sync_preferences: {
      wifi_only: false,
      auto_sync: true,
      sync_interval: 30
    },
    performance: {
      animations: true,
      high_quality_images: true,
      cache_size: 100
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchSettings();
    }
  }, [user?.id]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/user/settings', {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ settings })
      });

      if (response.ok) {
        toast.success('Settings saved successfully');
        
        // Apply theme immediately
        if (settings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (settings.theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          // Auto theme based on system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.classList.toggle('dark', prefersDark);
        }
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `fieldforge-settings-${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Settings exported successfully');
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setSettings(imported);
        toast.success('Settings imported successfully');
      } catch (error) {
        toast.error('Invalid settings file');
      }
    };
    reader.readAsText(file);
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings({
        theme: 'auto',
        language: 'en',
        notifications: {
          safety: true,
          projects: true,
          equipment: true,
          crew: true,
          documents: true,
          email_digest: 'daily'
        },
        sync_preferences: {
          wifi_only: false,
          auto_sync: true,
          sync_interval: 30
        },
        performance: {
          animations: true,
          high_quality_images: true,
          cache_size: 100
        }
      });
      toast.success('Settings reset to defaults');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 davinci-grid paper-texture flex items-center justify-center">
        <div className="text-center">
          <SettingsIcon className="w-[89px] h-[89px] text-amber-400 mx-auto mb-[21px] animate-spin" />
          <p className="text-amber-400/60">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-[34px] max-w-4xl mx-auto space-y-[34px]">
      {/* Header */}
      <div className="relative">
        <div className="absolute -right-8 -top-8 opacity-5">
          <Compass className="w-[144px] h-[144px] text-amber-400" style={{ animation: 'gear-rotate 40s linear infinite' }} />
        </div>
        <div className="relative">
          <div className="absolute -left-[55px] top-1/2 transform -translate-y-1/2 hidden lg:block opacity-10">
            <Ruler className="w-[34px] h-[34px] text-amber-400" />
          </div>
          <h1 className="text-golden-xl font-bold text-white mb-[8px] measurement-line">Settings</h1>
          <p className="text-amber-400/60 technical-annotation" data-note="PREFERENCES">Manage your application preferences</p>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-[21px] p-[34px] card-engineering">
        <h2 className="text-golden-base font-bold text-white mb-[21px] flex items-center measurement-line">
          <Palette className="w-5 h-5 text-amber-400 mr-[8px]" />
          Appearance
        </h2>
        <div className="space-y-[21px]">
          <div>
            <label className="block text-sm font-medium text-amber-400/60 mb-[8px] annotation" data-note="THEME">Theme</label>
            <div className="grid grid-cols-3 gap-[13px]">
              {[
                { value: 'light', icon: Sun, label: 'Light' },
                { value: 'dark', icon: Moon, label: 'Dark' },
                { value: 'auto', icon: Monitor, label: 'Auto' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSettings({ ...settings, theme: option.value as any })}
                  className={`p-[21px] rounded-[13px] border transition-all flex flex-col items-center gap-[8px] ${
                    settings.theme === option.value
                      ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                      : 'border-amber-500/20 bg-slate-800/50 text-amber-400/60 hover:border-amber-500/40'
                  } tech-border field-touch`}
                >
                  <option.icon className="w-8 h-8" />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-400/60 mb-[8px] annotation" data-note="LANGUAGE">Language</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full input-davinci bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px] tech-border"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-[21px] p-[34px] card-vitruvian">
        <h2 className="text-golden-base font-bold text-white mb-[21px] flex items-center measurement-line">
          <Bell className="w-5 h-5 text-amber-400 mr-[8px]" />
          Notifications
        </h2>
        <div className="space-y-[13px]">
          {Object.entries(settings.notifications).filter(([key]) => key !== 'email_digest').map(([key, value]) => (
            <label key={key} className="flex items-center justify-between py-[8px]">
              <span className="text-white capitalize field-readable">{key.replace('_', ' ')} Notifications</span>
              <button
                onClick={() => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, [key]: !value }
                })}
                className={`w-[55px] h-[34px] rounded-full transition-all relative ${
                  value ? 'bg-amber-500' : 'bg-slate-700'
                } tech-border`}
              >
                <div className={`absolute top-[3px] w-[28px] h-[28px] bg-white rounded-full transition-all ${
                  value ? 'left-[24px]' : 'left-[3px]'
                }`} />
              </button>
            </label>
          ))}

          <div className="pt-[13px] border-t border-amber-500/20">
            <label className="block text-sm font-medium text-amber-400/60 mb-[8px]">Email Digest</label>
            <select
              value={settings.notifications.email_digest}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, email_digest: e.target.value as any }
              })}
              className="w-full input-davinci bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sync Settings */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-[21px] p-[34px] card-vitruvian">
        <h2 className="text-golden-base font-bold text-white mb-[21px] flex items-center measurement-line">
          <Database className="w-5 h-5 text-amber-400 mr-[8px]" />
          Data & Sync
        </h2>
        <div className="space-y-[21px]">
          <label className="flex items-center justify-between">
            <span className="text-white field-readable">Wi-Fi Only</span>
            <button
              onClick={() => setSettings({
                ...settings,
                sync_preferences: { ...settings.sync_preferences, wifi_only: !settings.sync_preferences.wifi_only }
              })}
              className={`w-[55px] h-[34px] rounded-full transition-all relative ${
                settings.sync_preferences.wifi_only ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div className={`absolute top-[3px] w-[28px] h-[28px] bg-white rounded-full transition-all ${
                settings.sync_preferences.wifi_only ? 'left-[24px]' : 'left-[3px]'
              }`} />
            </button>
          </label>

          <label className="flex items-center justify-between">
            <span className="text-white field-readable">Auto-sync</span>
            <button
              onClick={() => setSettings({
                ...settings,
                sync_preferences: { ...settings.sync_preferences, auto_sync: !settings.sync_preferences.auto_sync }
              })}
              className={`w-[55px] h-[34px] rounded-full transition-all relative ${
                settings.sync_preferences.auto_sync ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div className={`absolute top-[3px] w-[28px] h-[28px] bg-white rounded-full transition-all ${
                settings.sync_preferences.auto_sync ? 'left-[24px]' : 'left-[3px]'
              }`} />
            </button>
          </label>

          <div>
            <label className="block text-sm font-medium text-amber-400/60 mb-[8px]">Sync Interval</label>
            <select
              value={settings.sync_preferences.sync_interval}
              onChange={(e) => setSettings({
                ...settings,
                sync_preferences: { ...settings.sync_preferences, sync_interval: parseInt(e.target.value) }
              })}
              className="w-full input-davinci bg-slate-800/50 text-white px-[21px] py-[13px] rounded-[8px]"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Performance Settings */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-[21px] p-[34px] card-engineering">
        <h2 className="text-golden-base font-bold text-white mb-[21px] flex items-center measurement-line">
          <Zap className="w-5 h-5 text-amber-400 mr-[8px]" />
          Performance
        </h2>
        <div className="space-y-[13px]">
          <label className="flex items-center justify-between py-[8px]">
            <span className="text-white field-readable">Animations</span>
            <button
              onClick={() => setSettings({
                ...settings,
                performance: { ...settings.performance, animations: !settings.performance.animations }
              })}
              className={`w-[55px] h-[34px] rounded-full transition-all relative ${
                settings.performance.animations ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div className={`absolute top-[3px] w-[28px] h-[28px] bg-white rounded-full transition-all ${
                settings.performance.animations ? 'left-[24px]' : 'left-[3px]'
              }`} />
            </button>
          </label>

          <label className="flex items-center justify-between py-[8px]">
            <span className="text-white field-readable">High Quality Images</span>
            <button
              onClick={() => setSettings({
                ...settings,
                performance: { ...settings.performance, high_quality_images: !settings.performance.high_quality_images }
              })}
              className={`w-[55px] h-[34px] rounded-full transition-all relative ${
                settings.performance.high_quality_images ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div className={`absolute top-[3px] w-[28px] h-[28px] bg-white rounded-full transition-all ${
                settings.performance.high_quality_images ? 'left-[24px]' : 'left-[3px]'
              }`} />
            </button>
          </label>

          <div>
            <div className="flex justify-between items-center mb-[8px]">
              <label className="text-sm font-medium text-amber-400/60">Cache Size</label>
              <span className="text-sm text-amber-400">{settings.performance.cache_size} MB</span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="50"
              value={settings.performance.cache_size}
              onChange={(e) => setSettings({
                ...settings,
                performance: { ...settings.performance, cache_size: parseInt(e.target.value) }
              })}
              className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer slider-amber"
            />
          </div>
        </div>
      </div>

      {/* Import/Export */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-[21px] p-[34px] card-vitruvian">
        <h2 className="text-golden-base font-bold text-white mb-[21px] flex items-center measurement-line">
          <Shield className="w-5 h-5 text-amber-400 mr-[8px]" />
          Data Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[21px]">
          <button
            onClick={exportSettings}
            className="p-[21px] bg-slate-800/50 hover:bg-slate-700/50 border border-amber-500/20 rounded-[13px] transition-all flex flex-col items-center gap-[8px] tech-border hover:scale-[1.02]"
          >
            <Download className="w-8 h-8 text-amber-400" />
            <span className="text-white font-medium">Export Settings</span>
          </button>

          <label className="p-[21px] bg-slate-800/50 hover:bg-slate-700/50 border border-amber-500/20 rounded-[13px] transition-all flex flex-col items-center gap-[8px] cursor-pointer tech-border hover:scale-[1.02]">
            <Upload className="w-8 h-8 text-amber-400" />
            <span className="text-white font-medium">Import Settings</span>
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              className="hidden"
            />
          </label>

          <button
            onClick={resetSettings}
            className="p-[21px] bg-slate-800/50 hover:bg-red-500/20 border border-amber-500/20 hover:border-red-500/40 rounded-[13px] transition-all flex flex-col items-center gap-[8px] tech-border hover:scale-[1.02]"
          >
            <RefreshCw className="w-8 h-8 text-amber-400" />
            <span className="text-white font-medium">Reset to Defaults</span>
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-[55px] py-[21px] bg-amber-500 hover:bg-amber-600 disabled:bg-amber-700 text-white rounded-[13px] font-bold transition-all flex items-center gap-[13px] btn-davinci glow-renaissance breathe field-touch"
        >
          {saving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <SettingsIcon className="w-5 h-5" />
              Save Settings
            </>
          )}
        </button>
      </div>

      {/* Leonardo Quote */}
      <div className="text-center opacity-30 mt-[89px]">
        <p className="text-golden-sm text-amber-400/60 font-light italic technical-annotation">
          "Small rooms or dwellings discipline the mind, large ones weaken it"
        </p>
        <p className="text-xs text-amber-400/40 mt-2">— Leonardo da Vinci</p>
      </div>
    </div>
  );
};

export default Settings;
