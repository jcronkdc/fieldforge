import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Bell, Moon, Sun, Zap, Globe,
  Download, Upload, Shield, Keyboard, Eye, EyeOff, 
  Wifi, WifiOff, RefreshCw, Trash2, Save, Volume2,
  Clock, Database, HardDrive, ToggleLeft, ToggleRight,
  Smartphone, Monitor, Palette, Languages, ChevronRight,
  AlertCircle, CheckCircle, Info, X, Activity, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { BillingSettings } from './BillingSettings';

interface SettingsData {
  // Display
  theme: 'light' | 'dark' | 'auto';
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  firstDayOfWeek: number; // 0 = Sunday, 1 = Monday
  
  // Notifications
  notificationsEnabled: boolean;
  notificationCategories: {
    safety: { app: boolean; email: boolean; sms: boolean; push: boolean };
    projects: { app: boolean; email: boolean; sms: boolean; push: boolean };
    equipment: { app: boolean; email: boolean; sms: boolean; push: boolean };
    weather: { app: boolean; email: boolean; sms: boolean; push: boolean };
    system: { app: boolean; email: boolean; sms: boolean; push: boolean };
  };
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  
  // Performance
  autoSync: boolean;
  syncInterval: number; // minutes
  offlineMode: boolean;
  cacheSize: number; // MB
  dataCompression: boolean;
  reducedMotion: boolean;
  lowDataMode: boolean;
  
  // Privacy & Security
  biometricAuth: boolean;
  sessionTimeout: number; // minutes
  showProfilePhoto: boolean;
  shareLocation: boolean;
  analyticsEnabled: boolean;
  
  // Accessibility
  highContrast: boolean;
  largeText: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
  screenReaderOptimized: boolean;
  
  // Developer
  debugMode: boolean;
  showPerformanceStats: boolean;
  enableBetaFeatures: boolean;
  
  // Data Management
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  lastBackupDate?: string;
  storageUsed: number; // bytes
}

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ElementType;
  items: SettingItem[];
}

interface SettingItem {
  key: string;
  label: string;
  description?: string;
  type: 'toggle' | 'select' | 'number' | 'time' | 'action';
  options?: { value: any; label: string }[];
  action?: () => void;
  min?: number;
  max?: number;
  unit?: string;
}

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('display');
  const [cacheStats, setCacheStats] = useState({ size: 0, items: 0 });
  const [showImportDialog, setShowImportDialog] = useState(false);

  const sections: SettingsSection[] = [
    {
      id: 'display',
      title: 'Display & Language',
      icon: Palette,
      items: [
        {
          key: 'theme',
          label: 'Theme',
          type: 'select',
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'auto', label: 'Auto (System)' }
          ]
        },
        {
          key: 'language',
          label: 'Language',
          type: 'select',
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Español' },
            { value: 'fr', label: 'Français' }
          ]
        },
        {
          key: 'dateFormat',
          label: 'Date Format',
          type: 'select',
          options: [
            { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
            { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
          ]
        },
        {
          key: 'timeFormat',
          label: 'Time Format',
          type: 'select',
          options: [
            { value: '12h', label: '12-hour' },
            { value: '24h', label: '24-hour' }
          ]
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          key: 'notificationsEnabled',
          label: 'Enable Notifications',
          description: 'Receive alerts and updates',
          type: 'toggle'
        },
        {
          key: 'quietHoursEnabled',
          label: 'Quiet Hours',
          description: 'Pause non-critical notifications',
          type: 'toggle'
        }
      ]
    },
    {
      id: 'performance',
      title: 'Performance & Sync',
      icon: Zap,
      items: [
        {
          key: 'autoSync',
          label: 'Auto Sync',
          description: 'Automatically sync data',
          type: 'toggle'
        },
        {
          key: 'syncInterval',
          label: 'Sync Interval',
          type: 'number',
          min: 5,
          max: 60,
          unit: 'minutes'
        },
        {
          key: 'offlineMode',
          label: 'Offline Mode',
          description: 'Work without internet connection',
          type: 'toggle'
        },
        {
          key: 'dataCompression',
          label: 'Data Compression',
          description: 'Reduce bandwidth usage',
          type: 'toggle'
        },
        {
          key: 'reducedMotion',
          label: 'Reduced Motion',
          description: 'Minimize animations',
          type: 'toggle'
        }
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: Shield,
      items: [
        {
          key: 'biometricAuth',
          label: 'Biometric Authentication',
          description: 'Use Face ID or Touch ID',
          type: 'toggle'
        },
        {
          key: 'sessionTimeout',
          label: 'Session Timeout',
          type: 'number',
          min: 5,
          max: 120,
          unit: 'minutes'
        },
        {
          key: 'shareLocation',
          label: 'Share Location',
          description: 'Allow location tracking',
          type: 'toggle'
        },
        {
          key: 'analyticsEnabled',
          label: 'Usage Analytics',
          description: 'Help improve FieldForge',
          type: 'toggle'
        }
      ]
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      icon: Eye,
      items: [
        {
          key: 'highContrast',
          label: 'High Contrast',
          description: 'Increase visual contrast',
          type: 'toggle'
        },
        {
          key: 'largeText',
          label: 'Large Text',
          description: 'Increase font sizes',
          type: 'toggle'
        },
        {
          key: 'soundEffects',
          label: 'Sound Effects',
          description: 'Audio feedback for actions',
          type: 'toggle'
        },
        {
          key: 'screenReaderOptimized',
          label: 'Screen Reader Support',
          description: 'Optimize for assistive technology',
          type: 'toggle'
        }
      ]
    },
    {
      id: 'data',
      title: 'Data Management',
      icon: Database,
      items: [
        {
          key: 'autoBackup',
          label: 'Auto Backup',
          description: 'Automatically backup your data',
          type: 'toggle'
        },
        {
          key: 'backupFrequency',
          label: 'Backup Frequency',
          type: 'select',
          options: [
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' }
          ]
        },
        {
          key: 'clearCache',
          label: 'Clear Cache',
          description: 'Free up storage space',
          type: 'action',
          action: () => clearCache()
        },
        {
          key: 'exportData',
          label: 'Export Settings',
          description: 'Download your settings',
          type: 'action',
          action: () => exportSettings()
        },
        {
          key: 'importData',
          label: 'Import Settings',
          description: 'Restore from backup',
          type: 'action',
          action: () => setShowImportDialog(true)
        }
      ]
    },
    {
      id: 'billing',
      title: 'Billing & Subscription',
      icon: CreditCard,
      items: [] // This section uses a custom component
    },
    {
      id: 'developer',
      title: 'Developer Options',
      icon: Activity,
      items: [
        {
          key: 'debugMode',
          label: 'Debug Mode',
          description: 'Show additional logging',
          type: 'toggle'
        },
        {
          key: 'showPerformanceStats',
          label: 'Performance Stats',
          description: 'Display FPS and metrics',
          type: 'toggle'
        },
        {
          key: 'enableBetaFeatures',
          label: 'Beta Features',
          description: 'Try experimental features',
          type: 'toggle'
        }
      ]
    }
  ];

  useEffect(() => {
      fetchSettings();
    fetchCacheStats();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      } else {
        // Load default settings if none exist
        const defaultSettings: SettingsData = {
          theme: 'dark',
          language: 'en',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          firstDayOfWeek: 0,
          notificationsEnabled: true,
          notificationCategories: {
            safety: { app: true, email: true, sms: true, push: true },
            projects: { app: true, email: true, sms: false, push: true },
            equipment: { app: true, email: false, sms: false, push: true },
            weather: { app: true, email: false, sms: false, push: true },
            system: { app: true, email: true, sms: false, push: false }
          },
          quietHoursEnabled: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '07:00',
          autoSync: true,
          syncInterval: 15,
          offlineMode: false,
          cacheSize: 100,
          dataCompression: false,
          reducedMotion: false,
          lowDataMode: false,
          biometricAuth: false,
          sessionTimeout: 30,
          showProfilePhoto: true,
          shareLocation: true,
          analyticsEnabled: true,
          highContrast: false,
          largeText: false,
          soundEffects: true,
          hapticFeedback: true,
          screenReaderOptimized: false,
          debugMode: false,
          showPerformanceStats: false,
          enableBetaFeatures: false,
          autoBackup: true,
          backupFrequency: 'weekly',
          storageUsed: 0
        };
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchCacheStats = async () => {
    try {
      const response = await fetch('/api/users/cache-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCacheStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching cache stats:', error);
    }
  };

  const saveSettings = async (updates: Partial<SettingsData>) => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const newSettings = { ...settings, ...updates } as SettingsData;
      
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newSettings)
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setSettings(newSettings);
      
      // Apply theme change immediately
      if (updates.theme) {
        applyTheme(updates.theme);
      }
      
      // Show save confirmation
      toast.success('Settings saved');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const applyTheme = (theme: 'light' | 'dark' | 'auto') => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }
    
    localStorage.setItem('fieldforge_theme', theme);
  };

  const handleSettingChange = (key: string, value: any) => {
    if (!settings) return;
    
    const updates: any = {};
    
    // Handle nested properties
    if (key.includes('.')) {
      const parts = key.split('.');
      let current = updates;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!(parts[i] in current)) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
    } else {
      updates[key] = value;
    }
    
    saveSettings(updates);
  };

  const clearCache = async () => {
    try {
      const response = await fetch('/api/users/cache', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to clear cache');
      }

      // Clear local storage cache
      const keysToKeep = ['fieldforge_theme', 'token'];
      Object.keys(localStorage).forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      toast.success('Cache cleared successfully');
      setCacheStats({ size: 0, items: 0 });
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache');
    }
  };

  const exportSettings = async () => {
    try {
      const exportData = {
        settings,
        version: '1.0',
        exportedAt: new Date().toISOString(),
        user: user?.email
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fieldforge-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Settings exported successfully');
    } catch (error) {
      console.error('Error exporting settings:', error);
      toast.error('Failed to export settings');
    }
  };

  const importSettings = async (file: File) => {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (!importData.settings || importData.version !== '1.0') {
        throw new Error('Invalid settings file');
      }
      
      await saveSettings(importData.settings);
      setShowImportDialog(false);
      toast.success('Settings imported successfully');
    } catch (error) {
      console.error('Error importing settings:', error);
      toast.error('Failed to import settings');
    }
  };

  const renderSettingControl = (item: SettingItem) => {
    if (!settings) return null;
    
    const value = item.key.includes('.') 
      ? item.key.split('.').reduce((obj, key) => obj?.[key], settings as any)
      : settings[item.key as keyof SettingsData];

    switch (item.type) {
      case 'toggle':
        return (
          <button
            onClick={() => handleSettingChange(item.key, !value)}
            className={`relative w-[55px] h-[29px] rounded-full transition-all ${
              value ? 'bg-amber-500' : 'bg-slate-700'
            }`}
          >
            <div className={`absolute top-[3px] w-[23px] h-[23px] bg-white rounded-full transition-all ${
              value ? 'left-[29px]' : 'left-[3px]'
            }`} />
          </button>
        );
        
      case 'select':
        return (
          <select
            value={value as string}
            onChange={(e) => handleSettingChange(item.key, e.target.value)}
            className="px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px] text-sm"
          >
            {item.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
        
      case 'number':
        return (
          <div className="flex items-center gap-[8px]">
            <input
              type="number"
              value={value as number}
              onChange={(e) => handleSettingChange(item.key, parseInt(e.target.value))}
              min={item.min}
              max={item.max}
              className="w-[89px] px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px] text-sm text-center"
            />
            {item.unit && <span className="text-sm text-slate-400">{item.unit}</span>}
          </div>
        );
        
      case 'action':
        return (
          <button
            onClick={item.action}
            className="px-[21px] py-[8px] bg-slate-700 hover:bg-slate-600 text-white rounded-[8px] text-sm font-medium transition-all"
          >
            {item.label}
          </button>
        );
        
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-amber-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-slate-700" />
            Settings
          </h1>
          <p className="text-slate-600 mt-2">Configure your FieldForge experience</p>
        </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {sections.map(section => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-[13px] px-[21px] py-[13px] rounded-[13px] transition-all ${
                    activeSection === section.id
                      ? 'bg-amber-500/20 text-amber-400'
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

          {/* Storage Info */}
          <div className="mt-6 p-4 bg-slate-100 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Storage Used</span>
              <span className="text-sm text-slate-600">
                {(settings?.storageUsed || 0) / 1024 / 1024} MB
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Cache Size</span>
              <span className="text-sm text-slate-600">
                {cacheStats.size / 1024 / 1024} MB
              </span>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {sections
              .filter(section => section.id === activeSection)
              .map(section => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-[21px]"
                >
                  <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
                      <section.icon className="w-6 h-6 text-slate-700" />
                      {section.title}
                    </h2>
                    
                    <div className="space-y-[21px]">
                      {section.items.map(item => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between py-[13px] border-b border-slate-700/50 last:border-0"
                        >
                          <div className="flex-1 pr-[21px]">
                            <h3 className="text-white font-medium">{item.label}</h3>
                            {item.description && (
                              <p className="text-sm text-slate-400 mt-[3px]">{item.description}</p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {renderSettingControl(item)}
          </div>
                        </div>
                      ))}
        </div>
      </div>

                  {/* Special sections for detailed settings */}
                  {activeSection === 'notifications' && settings?.notificationsEnabled && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[34px]"
                    >
                      <h3 className="text-lg font-semibold text-white mb-[21px]">
                        Notification Categories
                      </h3>
                      <div className="space-y-[21px]">
                        {Object.entries(settings.notificationCategories).map(([category, channels]) => (
                          <div key={category} className="space-y-[13px]">
                            <h4 className="text-white font-medium capitalize">{category}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-[13px]">
                              {Object.entries(channels).map(([channel, enabled]) => (
                                <label
                                  key={channel}
                                  className="flex items-center gap-[8px] cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={enabled}
                                    onChange={(e) => {
                                      const newCategories = { ...settings.notificationCategories };
                                      newCategories[category as keyof typeof settings.notificationCategories][
                                        channel as keyof typeof channels
                                      ] = e.target.checked;
                                      handleSettingChange('notificationCategories', newCategories);
                                    }}
                                    className="w-4 h-4 text-amber-500"
                                  />
                                  <span className="text-sm text-slate-300 capitalize">{channel}</span>
            </label>
          ))}
          </div>
        </div>
                        ))}
      </div>

                      {settings.quietHoursEnabled && (
                        <div className="mt-[34px] pt-[21px] border-t border-slate-700">
                          <h4 className="text-white font-medium mb-[13px]">Quiet Hours</h4>
                          <div className="grid grid-cols-2 gap-[21px]">
                            <div>
                              <label className="block text-sm text-slate-400 mb-[8px]">Start</label>
                              <input
                                type="time"
                                value={settings.quietHoursStart}
                                onChange={(e) => handleSettingChange('quietHoursStart', e.target.value)}
                                className="w-full px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
                              />
                            </div>
          <div>
                              <label className="block text-sm text-slate-400 mb-[8px]">End</label>
                              <input
                                type="time"
                                value={settings.quietHoursEnd}
                                onChange={(e) => handleSettingChange('quietHoursEnd', e.target.value)}
                                className="w-full px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
                              />
          </div>
        </div>
      </div>
                      )}
                    </motion.div>
                  )}

                  {activeSection === 'billing' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <BillingSettings />
                    </motion.div>
                  )}

                  {activeSection === 'developer' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-amber-500/10 border border-amber-500/30 rounded-[13px] p-[21px]"
                    >
                      <div className="flex items-start gap-[13px]">
                        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-[3px]" />
                        <div className="text-sm text-amber-400">
                          <p className="font-medium mb-[5px]">Warning: Developer Options</p>
                          <p className="text-amber-400/80">
                            These settings can affect app stability and performance. 
                            Only enable if you know what you're doing.
                          </p>
            </div>
          </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Import Settings Dialog */}
      <AnimatePresence>
        {showImportDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-[21px] p-[34px] max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-white mb-[21px]">Import Settings</h3>
              
              <div className="mb-[34px]">
                <label className="block w-full">
                  <div className="px-[34px] py-[55px] bg-slate-800 border-2 border-dashed border-slate-600 rounded-[13px] text-center cursor-pointer hover:bg-slate-700 transition-all">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-[13px]" />
                    <p className="text-slate-300 font-medium">Click to select file</p>
                    <p className="text-sm text-slate-500 mt-[5px]">JSON files only</p>
                  </div>
            <input
              type="file"
              accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) importSettings(file);
                    }}
              className="hidden"
            />
          </label>
              </div>

          <button
                onClick={() => setShowImportDialog(false)}
                className="w-full px-[21px] py-[13px] bg-slate-700 hover:bg-slate-600 text-white rounded-[8px] font-semibold transition-all"
          >
                Cancel
          </button>
            </motion.div>
        </div>
        )}
      </AnimatePresence>

      {/* Saving Indicator */}
      <AnimatePresence>
        {saving && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-[34px] right-[34px] bg-slate-800 border border-slate-700 rounded-[13px] p-[21px] flex items-center gap-[13px] shadow-lg"
          >
            <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
            <span className="text-white font-medium">Saving settings...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

