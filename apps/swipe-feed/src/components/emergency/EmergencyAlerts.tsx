import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle, Bell, Radio, MapPin, Users, Phone,
  CheckCircle2, XCircle, Clock, Volume2, Zap, Shield,
  Navigation, Send, ChevronRight, Siren, AlertCircle,
  Info, X, Map, PhoneCall, MessageSquare, Megaphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface EmergencyAlert {
  id: string;
  alert_type: 'info' | 'warning' | 'danger' | 'evacuation';
  title: string;
  message: string;
  location?: string;
  affected_zones?: string[];
  assembly_point?: string;
  issued_by: string;
  issued_at: string;
  expires_at?: string;
  requires_acknowledgment: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  delivery_channels: ('app' | 'sms' | 'email' | 'siren')[];
  coordinates?: { lat: number; lng: number };
  affected_crews?: string[];
  instructions?: string[];
  contact_number?: string;
}

interface AlertAcknowledgment {
  alert_id: string;
  user_id: string;
  acknowledged_at: string;
  user_location?: { lat: number; lng: number };
  response?: 'safe' | 'need_help' | 'evacuating';
  notes?: string;
}

export const EmergencyAlerts: React.FC = () => {
  const { user } = useAuth();
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);
  const [alertHistory, setAlertHistory] = useState<EmergencyAlert[]>([]);
  const [acknowledgments, setAcknowledgments] = useState<Record<string, AlertAcknowledgment>>({});
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Broadcast form state
  const [broadcastForm, setBroadcastForm] = useState({
    alert_type: 'warning' as EmergencyAlert['alert_type'],
    title: '',
    message: '',
    location: '',
    affected_zones: [] as string[],
    assembly_point: '',
    expires_in_hours: 4,
    requires_acknowledgment: true,
    priority: 'high' as EmergencyAlert['priority'],
    delivery_channels: ['app', 'sms'] as EmergencyAlert['delivery_channels'],
    instructions: [''],
    contact_number: ''
  });

  useEffect(() => {
    fetchAlerts();
    setupRealtimeSubscription();
    requestUserLocation();

    return () => {
      // Clean up subscriptions
    };
  }, []);

  const requestUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const setupRealtimeSubscription = () => {
    // In a real app, this would be WebSocket or SSE
    const channel = supabase
      .channel('emergency-alerts')
      .on('broadcast', { event: 'new-alert' }, (payload) => {
        handleNewAlert(payload.payload as EmergencyAlert);
      })
      .subscribe();
  };

  const handleNewAlert = (alert: EmergencyAlert) => {
    setActiveAlerts(prev => [alert, ...prev]);
    
    // Play alert sound
    if (alert.priority === 'critical' || alert.alert_type === 'evacuation') {
      playAlertSound();
    }
    
    // Show toast notification
    const icon = getAlertIcon(alert.alert_type);
    toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${getAlertColor(alert.alert_type)} p-4 rounded-lg shadow-lg max-w-md`}
      >
        <div className="flex items-start gap-3">
          {React.createElement(icon, { className: "w-6 h-6 text-white flex-shrink-0" })}
          <div className="flex-1">
            <h3 className="font-bold text-white">{alert.title}</h3>
            <p className="text-white/90 text-sm mt-1">{alert.message}</p>
            <button
              onClick={() => {
                setSelectedAlert(alert);
                toast.dismiss(t.id);
              }}
              className="mt-2 text-xs font-semibold text-white underline"
            >
              View Details & Acknowledge
            </button>
          </div>
        </div>
      </motion.div>
    ), { duration: alert.alert_type === 'evacuation' ? Infinity : 10000 });
  };

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // Fetch active alerts
      const activeResponse = await fetch('/api/emergency/alerts/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (activeResponse.ok) {
        const activeData = await activeResponse.json();
        setActiveAlerts(activeData.alerts || []);
      }

      // Fetch acknowledgments
      const ackResponse = await fetch('/api/emergency/alerts/acknowledgments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (ackResponse.ok) {
        const ackData = await ackResponse.json();
        const ackMap: Record<string, AlertAcknowledgment> = {};
        ackData.acknowledgments?.forEach((ack: AlertAcknowledgment) => {
          ackMap[ack.alert_id] = ack;
        });
        setAcknowledgments(ackMap);
      }

      // Fetch history
      const historyResponse = await fetch('/api/emergency/alerts/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setAlertHistory(historyData.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load emergency alerts');
    } finally {
      setLoading(false);
    }
  };

  const broadcastAlert = async () => {
    try {
      const alert: Partial<EmergencyAlert> = {
        ...broadcastForm,
        issued_by: user?.email || 'System',
        issued_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + broadcastForm.expires_in_hours * 60 * 60 * 1000).toISOString(),
        coordinates: userLocation || undefined
      };

      const response = await fetch('/api/emergency/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(alert)
      });

      if (!response.ok) {
        throw new Error('Failed to broadcast alert');
      }

      toast.success('Emergency alert broadcast successfully');
      setShowBroadcastForm(false);
      resetBroadcastForm();
      fetchAlerts();
    } catch (error) {
      console.error('Error broadcasting alert:', error);
      toast.error('Failed to broadcast emergency alert');
    }
  };

  const acknowledgeAlert = async (alertId: string, response?: 'safe' | 'need_help' | 'evacuating', notes?: string) => {
    try {
      const acknowledgment: Partial<AlertAcknowledgment> = {
        alert_id: alertId,
        user_id: user?.id,
        acknowledged_at: new Date().toISOString(),
        user_location: userLocation || undefined,
        response,
        notes
      };

      const apiResponse = await fetch('/api/emergency/alerts/acknowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(acknowledgment)
      });

      if (!apiResponse.ok) {
        throw new Error('Failed to acknowledge alert');
      }

      setAcknowledgments(prev => ({
        ...prev,
        [alertId]: acknowledgment as AlertAcknowledgment
      }));
      
      toast.success('Alert acknowledged');
      setSelectedAlert(null);
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  const playAlertSound = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const getAlertIcon = (type: EmergencyAlert['alert_type']) => {
    switch (type) {
      case 'info':
        return Info;
      case 'warning':
        return AlertCircle;
      case 'danger':
        return AlertTriangle;
      case 'evacuation':
        return Siren;
    }
  };

  const getAlertColor = (type: EmergencyAlert['alert_type']) => {
    switch (type) {
      case 'info':
        return 'bg-blue-600';
      case 'warning':
        return 'bg-amber-600';
      case 'danger':
        return 'bg-red-600';
      case 'evacuation':
        return 'bg-red-800';
    }
  };

  const resetBroadcastForm = () => {
    setBroadcastForm({
      alert_type: 'warning',
      title: '',
      message: '',
      location: '',
      affected_zones: [],
      assembly_point: '',
      expires_in_hours: 4,
      requires_acknowledgment: true,
      priority: 'high',
      delivery_channels: ['app', 'sms'],
      instructions: [''],
      contact_number: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-amber-500">Loading emergency alerts...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Hidden audio element for alert sounds */}
      <audio ref={audioRef} src="/alert-sound.mp3" preload="auto" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-[13px]">
            <Radio className="w-8 h-8 text-red-400" />
            Emergency Alert System
          </h1>
          <p className="text-slate-400 mt-2">Real-time emergency broadcasts and site-wide alerts</p>
        </div>
        <button
          onClick={() => setShowBroadcastForm(true)}
          className="px-[21px] py-[13px] bg-red-600 hover:bg-red-700 text-white rounded-[8px] font-semibold transition-all flex items-center gap-[8px] touch-golden animate-pulse"
        >
          <Megaphone className="w-4 h-4" />
          Broadcast Alert
        </button>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Active Alerts</h2>
          <div className="space-y-3">
            {activeAlerts.map((alert) => {
              const Icon = getAlertIcon(alert.alert_type);
              const isAcknowledged = acknowledgments[alert.id];
              
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`${getAlertColor(alert.alert_type)} bg-opacity-20 border-2 border-current rounded-[13px] p-[21px]`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-[21px]">
                      <Icon className={`w-8 h-8 ${getAlertColor(alert.alert_type).replace('bg-', 'text-')} animate-pulse`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-[13px] mb-[8px]">
                          <h3 className="text-lg font-bold text-white">{alert.title}</h3>
                          {alert.priority === 'critical' && (
                            <span className="px-[8px] py-[3px] bg-red-600 text-white text-xs font-semibold rounded-full animate-pulse">
                              CRITICAL
                            </span>
                          )}
                        </div>
                        <p className="text-white/90 mb-[13px]">{alert.message}</p>
                        
                        {alert.location && (
                          <div className="flex items-center gap-[8px] text-sm text-white/80 mb-[8px]">
                            <MapPin className="w-4 h-4" />
                            <span>{alert.location}</span>
                          </div>
                        )}
                        
                        {alert.assembly_point && (
                          <div className="flex items-center gap-[8px] text-sm text-white/80 mb-[8px]">
                            <Navigation className="w-4 h-4" />
                            <span>Assembly Point: {alert.assembly_point}</span>
                          </div>
                        )}
                        
                        {alert.instructions && alert.instructions.length > 0 && (
                          <div className="mt-[13px]">
                            <h4 className="text-sm font-semibold text-white/90 mb-[5px]">Instructions:</h4>
                            <ol className="list-decimal list-inside space-y-[3px]">
                              {alert.instructions.map((instruction, i) => (
                                <li key={i} className="text-sm text-white/80">{instruction}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                        
                        {alert.contact_number && (
                          <div className="mt-[13px]">
                            <a
                              href={`tel:${alert.contact_number}`}
                              className="inline-flex items-center gap-[8px] text-sm font-semibold text-white hover:underline"
                            >
                              <PhoneCall className="w-4 h-4" />
                              Call {alert.contact_number}
                            </a>
                          </div>
                        )}
                        
                        <div className="mt-[13px] flex flex-wrap items-center gap-[13px]">
                          <div className="text-xs text-white/60">
                            Issued by {alert.issued_by} • {new Date(alert.issued_at).toLocaleString()}
                          </div>
                          {alert.expires_at && (
                            <div className="flex items-center gap-[5px] text-xs text-white/60">
                              <Clock className="w-3 h-3" />
                              Expires {new Date(alert.expires_at).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {alert.requires_acknowledgment && !isAcknowledged && (
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="px-[21px] py-[8px] bg-white/20 hover:bg-white/30 text-white rounded-[8px] font-semibold transition-all flex items-center gap-[8px]"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Acknowledge
                      </button>
                    )}
                    
                    {isAcknowledged && (
                      <div className="text-sm text-white/60 flex items-center gap-[8px]">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Acknowledged
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Active Alerts */}
      {activeAlerts.length === 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[55px] text-center">
          <Shield className="w-16 h-16 text-green-400 mx-auto mb-[21px]" />
          <h3 className="text-xl font-semibold text-white mb-[8px]">All Clear</h3>
          <p className="text-slate-400">No active emergency alerts at this time.</p>
        </div>
      )}

      {/* Alert History */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Alert History</h2>
        <div className="space-y-2">
          {alertHistory.slice(0, 5).map((alert) => (
            <div
              key={alert.id}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[8px] p-[13px] flex items-center justify-between"
            >
              <div className="flex items-center gap-[13px]">
                {React.createElement(getAlertIcon(alert.alert_type), {
                  className: `w-5 h-5 ${getAlertColor(alert.alert_type).replace('bg-', 'text-')}`
                })}
                <div>
                  <h4 className="text-sm font-semibold text-white">{alert.title}</h4>
                  <p className="text-xs text-slate-400">{new Date(alert.issued_at).toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlert(alert)}
                className="text-amber-400 hover:text-amber-300 text-sm"
              >
                View
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Broadcast Alert Modal */}
      <AnimatePresence>
        {showBroadcastForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-red-500/30 rounded-[21px] p-[34px] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-[21px]">
                <h2 className="text-2xl font-bold text-white flex items-center gap-[13px]">
                  <Megaphone className="w-6 h-6 text-red-400" />
                  Broadcast Emergency Alert
                </h2>
                <button
                  onClick={() => setShowBroadcastForm(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-[21px]">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Alert Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-[8px]">
                    {(['info', 'warning', 'danger', 'evacuation'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setBroadcastForm({ ...broadcastForm, alert_type: type })}
                        className={`px-[13px] py-[8px] rounded-[8px] font-medium capitalize transition-all ${
                          broadcastForm.alert_type === type
                            ? getAlertColor(type) + ' text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Alert Title
                  </label>
                  <input
                    type="text"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    className="w-full px-[13px] py-[8px] bg-slate-800 border border-slate-700 rounded-[8px] text-white"
                    placeholder="e.g., Severe Weather Warning"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Message
                  </label>
                  <textarea
                    value={broadcastForm.message}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                    className="w-full px-[13px] py-[8px] bg-slate-800 border border-slate-700 rounded-[8px] text-white min-h-[89px]"
                    placeholder="Describe the emergency situation..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-[21px]">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                      Location/Zone
                    </label>
                    <input
                      type="text"
                      value={broadcastForm.location}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, location: e.target.value })}
                      className="w-full px-[13px] py-[8px] bg-slate-800 border border-slate-700 rounded-[8px] text-white"
                      placeholder="e.g., North Substation"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                      Assembly Point
                    </label>
                    <input
                      type="text"
                      value={broadcastForm.assembly_point}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, assembly_point: e.target.value })}
                      className="w-full px-[13px] py-[8px] bg-slate-800 border border-slate-700 rounded-[8px] text-white"
                      placeholder="e.g., Main Gate Parking Lot"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Emergency Contact
                  </label>
                  <input
                    type="tel"
                    value={broadcastForm.contact_number}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, contact_number: e.target.value })}
                    className="w-full px-[13px] py-[8px] bg-slate-800 border border-slate-700 rounded-[8px] text-white"
                    placeholder="Emergency contact number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Priority Level
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-[8px]">
                    {(['low', 'medium', 'high', 'critical'] as const).map((priority) => (
                      <button
                        key={priority}
                        onClick={() => setBroadcastForm({ ...broadcastForm, priority })}
                        className={`px-[13px] py-[8px] rounded-[8px] font-medium capitalize transition-all ${
                          broadcastForm.priority === priority
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Delivery Channels
                  </label>
                  <div className="space-y-2">
                    {(['app', 'sms', 'email', 'siren'] as const).map((channel) => (
                      <label key={channel} className="flex items-center gap-[8px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={broadcastForm.delivery_channels.includes(channel)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBroadcastForm({
                                ...broadcastForm,
                                delivery_channels: [...broadcastForm.delivery_channels, channel]
                              });
                            } else {
                              setBroadcastForm({
                                ...broadcastForm,
                                delivery_channels: broadcastForm.delivery_channels.filter(c => c !== channel)
                              });
                            }
                          }}
                          className="w-4 h-4 text-amber-500"
                        />
                        <span className="text-sm text-slate-300 capitalize">{channel}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-[8px]">
                  <input
                    type="checkbox"
                    checked={broadcastForm.requires_acknowledgment}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, requires_acknowledgment: e.target.checked })}
                    className="w-4 h-4 text-amber-500"
                  />
                  <label className="text-sm text-slate-300">Require acknowledgment from all recipients</label>
                </div>
              </div>

              <div className="flex gap-[13px] mt-[34px]">
                <button
                  onClick={broadcastAlert}
                  className="flex-1 px-[21px] py-[13px] bg-red-600 hover:bg-red-700 text-white rounded-[8px] font-semibold transition-all flex items-center justify-center gap-[8px]"
                >
                  <Send className="w-4 h-4" />
                  Broadcast Alert
                </button>
                <button
                  onClick={() => {
                    setShowBroadcastForm(false);
                    resetBroadcastForm();
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

      {/* Alert Detail Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-[21px] p-[34px] max-w-lg w-full"
            >
              <div className="flex items-start justify-between mb-[21px]">
                <div className="flex items-start gap-[13px]">
                  {React.createElement(getAlertIcon(selectedAlert.alert_type), {
                    className: `w-8 h-8 ${getAlertColor(selectedAlert.alert_type).replace('bg-', 'text-')}`
                  })}
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedAlert.title}</h3>
                    <p className="text-sm text-slate-400">
                      {new Date(selectedAlert.issued_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-[21px]">
                <p className="text-white">{selectedAlert.message}</p>

                {selectedAlert.instructions && selectedAlert.instructions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-[8px]">Instructions:</h4>
                    <ol className="list-decimal list-inside space-y-[5px]">
                      {selectedAlert.instructions.map((instruction, i) => (
                        <li key={i} className="text-sm text-slate-400">{instruction}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {selectedAlert.requires_acknowledgment && !acknowledgments[selectedAlert.id] && (
                  <div className="space-y-[13px]">
                    <h4 className="text-sm font-semibold text-slate-300">Your Response:</h4>
                    <div className="grid grid-cols-3 gap-[8px]">
                      <button
                        onClick={() => acknowledgeAlert(selectedAlert.id, 'safe')}
                        className="px-[13px] py-[8px] bg-green-600 hover:bg-green-700 text-white rounded-[8px] font-medium transition-all"
                      >
                        I'm Safe
                      </button>
                      <button
                        onClick={() => acknowledgeAlert(selectedAlert.id, 'evacuating')}
                        className="px-[13px] py-[8px] bg-amber-600 hover:bg-amber-700 text-white rounded-[8px] font-medium transition-all"
                      >
                        Evacuating
                      </button>
                      <button
                        onClick={() => acknowledgeAlert(selectedAlert.id, 'need_help')}
                        className="px-[13px] py-[8px] bg-red-600 hover:bg-red-700 text-white rounded-[8px] font-medium transition-all"
                      >
                        Need Help
                      </button>
                    </div>
                  </div>
                )}

                {acknowledgments[selectedAlert.id] && (
                  <div className="bg-green-600/20 border border-green-600 rounded-[8px] p-[13px]">
                    <div className="flex items-center gap-[8px]">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="text-sm font-semibold text-green-400">
                        Acknowledged at {new Date(acknowledgments[selectedAlert.id].acknowledged_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
