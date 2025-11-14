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
          label: 'Export Data',
          description: 'Download all your data',
          type: 'action',
          action: () => exportSettings()
        },
        {
          key: 'importData',
          label: 'Import Data',
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
          description: 'Display FPS and memory usage',
          type: 'toggle'
        },
        {
          key: 'enableBetaFeatures',
          label: 'Beta Features',
          description: 'Access experimental features',
          type: 'toggle'
        }
      ]
    }
  ];

  // Default settings
  const defaultSettings: SettingsData = {
    theme: 'auto',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 0,
    notificationsEnabled: true,
    notificationCategories: {
      safety: { app: true, email: true, sms: true, push: true },
      projects: { app: true, email: true, sms: false, push: true },
      equipment: { app: true, email: false, sms: false, push: true },
      weather: { app: true, email: false, sms: true, push: true },
      system: { app: true, email: true, sms: false, push: false }
    },
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    autoSync: true,
    syncInterval: 15,
    offlineMode: true,
    cacheSize: 100,
    dataCompression: true,
    reducedMotion: false,
    lowDataMode: false,
    biometricAuth: false,
    sessionTimeout: 30,
    showProfilePhoto: true,
    shareLocation: false,
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
    backupFrequency: 'daily',
    storageUsed: 0
  };

  useEffect(() => {
    loadSettings();
    calculateCacheSize();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = localStorage.getItem('userSettings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: SettingsData) => {
    setSaving(true);
    try {
      localStorage.setItem('userSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    if (!settings) return;
    
    const newSettings = { ...settings };
    
    if (key.includes('.')) {
      const [parent, child, subChild] = key.split('.');
      if (subChild) {
        (newSettings as any)[parent][child][subChild] = value;
      } else {
        (newSettings as any)[parent][child] = value;
      }
    } else {
      (newSettings as any)[key] = value;
    }
    
    saveSettings(newSettings);
  };

  const calculateCacheSize = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        setCacheStats({
          size: estimate.usage || 0,
          items: 0
        });
      }
    } catch (error) {
      console.error('Error calculating cache size:', error);
    }
  };

  const clearCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        localStorage.removeItem('offlineData');
        calculateCacheSize();
        toast.success('Cache cleared successfully');
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache');
    }
  };

  const exportSettings = () => {
    try {
      const data = {
        settings: settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fieldforge-settings-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Settings exported successfully');
    } catch (error) {
      console.error('Error exporting settings:', error);
      toast.error('Failed to export settings');
    }
  };

  const importSettings = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.settings || !data.version) {
        throw new Error('Invalid settings file');
      }
      
      await saveSettings(data.settings);
      setShowImportDialog(false);
      toast.success('Settings imported successfully');
    } catch (error) {
      console.error('Error importing settings:', error);
      toast.error('Failed to import settings. Please check the file format.');
    }
  };

  const renderSettingControl = (item: SettingItem) => {
    if (!settings) return null;
    const value = (settings as any)[item.key];

    switch (item.type) {
      case 'toggle':
        return (
          <button
            onClick={() => updateSetting(item.key, !value)}
            className={`relative w-[55px] h-[26px] rounded-full transition-all ${
              value ? 'bg-blue-500' : 'bg-slate-600'
            }`}
          >
            <span
              className={`absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full transition-transform ${
                value ? 'translate-x-[29px]' : ''
              }`}
            />
          </button>
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => updateSetting(item.key, e.target.value)}
            className="px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px] min-w-[144px]"
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
              value={value}
              min={item.min}
              max={item.max}
              onChange={(e) => updateSetting(item.key, parseInt(e.target.value))}
              className="w-[89px] px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px] text-center"
            />
            {item.unit && <span className="text-slate-400 text-sm">{item.unit}</span>}
          </div>
        );
      
      case 'time':
        return (
          <input
            type="time"
            value={value}
            onChange={(e) => updateSetting(item.key, e.target.value)}
            className="px-[13px] py-[8px] bg-slate-700 text-white rounded-[8px]"
          />
        );
      
      case 'action':
        return (
          <button
            onClick={item.action}
            className="px-[21px] py-[8px] bg-blue-500 hover:bg-blue-600 text-white rounded-[8px] font-semibold transition-all"
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
        <div className="text-blue-500">Loading settings...</div>
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeSection === section.id
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:bg-slate-50'
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
                  {Math.round(cacheStats.size / 1024 / 1024)} MB
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
                  >
                    {activeSection === 'billing' ? (
                      <BillingSettings />
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
                          <section.icon className="w-6 h-6 text-slate-700" />
                          {section.title}
                        </h2>
                        
                        <div className="space-y-4">
                          {section.items.map(item => (
                            <div
                              key={item.key}
                              className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                            >
                              <div className="flex-1 pr-4">
                                <h3 className="text-slate-900 font-medium">{item.label}</h3>
                                {item.description && (
                                  <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                                )}
                              </div>
                              <div className="flex-shrink-0">
                                {renderSettingControl(item)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Import Settings Dialog */}
      <AnimatePresence>
        {showImportDialog && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4">Import Settings</h3>
              
              <div className="mb-6">
                <label className="block w-full">
                  <div className="px-6 py-12 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg text-center cursor-pointer hover:bg-slate-100 transition-all">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">Click to select file</p>
                    <p className="text-sm text-slate-500 mt-1">JSON files only</p>
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
                className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-all"
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
            className="fixed bottom-6 right-6 bg-slate-800 text-white rounded-lg p-4 flex items-center gap-3 shadow-lg"
          >
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="font-medium">Saving settings...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;