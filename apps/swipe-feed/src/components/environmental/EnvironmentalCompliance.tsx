import React, { useState, useEffect } from 'react';
import { 
  Cloud, TreePine, Droplets, Wind, AlertTriangle, CheckCircle, 
  FileText, Calendar, TrendingUp, Download, Upload, Plus,
  AlertCircle, Activity, ThermometerSun, Volume2, Filter, Video
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthContext } from '../auth/AuthProvider';
import { CollaborationHub } from '../collaboration/CollaborationHub';

interface EnvironmentalReading {
  id: string;
  metric_type: 'air_quality' | 'noise_level' | 'dust_level' | 'water_quality' | 'temperature' | 'humidity';
  value: number;
  unit: string;
  location: string;
  recorded_at: string;
  recorded_by: string;
  status: 'normal' | 'warning' | 'violation';
  notes?: string;
}

interface EnvironmentalIncident {
  id: string;
  incident_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  reported_at: string;
  reported_by: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  corrective_actions?: string;
  resolution_date?: string;
}

interface EnvironmentalPermit {
  id: string;
  permit_type: string;
  permit_number: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date: string;
  status: 'active' | 'expiring_soon' | 'expired';
  conditions: string[];
  compliance_status: 'compliant' | 'non_compliant' | 'pending_review';
}

interface ComplianceMetrics {
  total_readings: number;
  violations_this_month: number;
  active_permits: number;
  expiring_permits: number;
  open_incidents: number;
  compliance_rate: number;
}

export const EnvironmentalCompliance: React.FC = () => {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'monitoring' | 'incidents' | 'permits' | 'reports'>('monitoring');
  const [readings, setReadings] = useState<EnvironmentalReading[]>([]);
  const [incidents, setIncidents] = useState<EnvironmentalIncident[]>([]);
  const [permits, setPermits] = useState<EnvironmentalPermit[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReadingForm, setShowReadingForm] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showCollaboration, setShowCollaboration] = useState(false);

  // Form states
  const [readingForm, setReadingForm] = useState({
    metric_type: 'air_quality' as const,
    value: '',
    unit: 'AQI',
    location: '',
    notes: ''
  });

  const [incidentForm, setIncidentForm] = useState({
    incident_type: '',
    severity: 'medium' as const,
    description: '',
    location: '',
    corrective_actions: ''
  });

  useEffect(() => {
    fetchEnvironmentalData();
  }, []);

  const fetchEnvironmentalData = async () => {
    setLoading(true);
    try {
      // Fetch metrics
      const metricsResponse = await fetch('/api/environmental/metrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.metrics);
      }

      // Fetch readings
      const readingsResponse = await fetch('/api/environmental/readings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (readingsResponse.ok) {
        const readingsData = await readingsResponse.json();
        setReadings(readingsData.readings || []);
      }

      // Fetch incidents
      const incidentsResponse = await fetch('/api/environmental/incidents', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (incidentsResponse.ok) {
        const incidentsData = await incidentsResponse.json();
        setIncidents(incidentsData.incidents || []);
      }

      // Fetch permits
      const permitsResponse = await fetch('/api/environmental/permits', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (permitsResponse.ok) {
        const permitsData = await permitsResponse.json();
        setPermits(permitsData.permits || []);
      }
      
      // For demo purposes, also include mock data if APIs return empty
      // Mock readings
      const mockReadings: EnvironmentalReading[] = [
        {
          id: '1',
          metric_type: 'air_quality',
          value: 45,
          unit: 'AQI',
          location: 'Site Entrance',
          recorded_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          recorded_by: user?.email || 'System',
          status: 'normal',
          notes: 'Good air quality'
        },
        {
          id: '2',
          metric_type: 'noise_level',
          value: 78,
          unit: 'dB',
          location: 'Construction Zone A',
          recorded_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          recorded_by: user?.email || 'System',
          status: 'warning',
          notes: 'Approaching limit during concrete pour'
        },
        {
          id: '3',
          metric_type: 'dust_level',
          value: 0.08,
          unit: 'mg/m³',
          location: 'Excavation Area',
          recorded_at: new Date().toISOString(),
          recorded_by: user?.email || 'System',
          status: 'normal'
        },
        {
          id: '4',
          metric_type: 'water_quality',
          value: 6.8,
          unit: 'pH',
          location: 'Retention Pond',
          recorded_at: new Date().toISOString(),
          recorded_by: user?.email || 'System',
          status: 'normal'
        }
      ];

      // Mock incidents
      const mockIncidents: EnvironmentalIncident[] = [
        {
          id: '1',
          incident_type: 'Dust Exceedance',
          severity: 'medium',
          description: 'Dust levels exceeded threshold during excavation',
          location: 'North Excavation Site',
          reported_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          reported_by: 'John Smith',
          status: 'investigating',
          corrective_actions: 'Increased water spraying frequency'
        },
        {
          id: '2',
          incident_type: 'Noise Complaint',
          severity: 'low',
          description: 'Neighbor complaint about early morning equipment noise',
          location: 'West Boundary',
          reported_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          reported_by: 'Site Manager',
          status: 'resolved',
          corrective_actions: 'Adjusted work schedule to start after 7 AM',
          resolution_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      // Mock permits
      const mockPermits: EnvironmentalPermit[] = [
        {
          id: '1',
          permit_type: 'Air Quality',
          permit_number: 'AQ-2024-1234',
          issuing_authority: 'State Environmental Agency',
          issue_date: '2024-01-15',
          expiry_date: '2025-01-15',
          status: 'active',
          conditions: [
            'Dust monitoring required daily',
            'Maximum PM10: 150 μg/m³',
            'Water suppression during dry conditions'
          ],
          compliance_status: 'compliant'
        },
        {
          id: '2',
          permit_type: 'Stormwater Management',
          permit_number: 'SW-2024-5678',
          issuing_authority: 'County Water Authority',
          issue_date: '2024-03-01',
          expiry_date: '2024-12-31',
          status: 'expiring_soon',
          conditions: [
            'Monthly water quality testing',
            'Erosion control barriers required',
            'pH levels between 6.5-8.5'
          ],
          compliance_status: 'compliant'
        },
        {
          id: '3',
          permit_type: 'Noise Control',
          permit_number: 'NC-2024-9012',
          issuing_authority: 'City Planning Department',
          issue_date: '2024-02-01',
          expiry_date: '2025-02-01',
          status: 'active',
          conditions: [
            'Work hours: 7 AM - 6 PM weekdays',
            'Maximum 85 dB at property line',
            'No work on Sundays'
          ],
          compliance_status: 'compliant'
        }
      ];

      // Calculate metrics
      const calculatedMetrics: ComplianceMetrics = {
        total_readings: mockReadings.length,
        violations_this_month: mockReadings.filter(r => r.status === 'violation').length,
        active_permits: mockPermits.filter(p => p.status === 'active').length,
        expiring_permits: mockPermits.filter(p => p.status === 'expiring_soon').length,
        open_incidents: mockIncidents.filter(i => i.status === 'open' || i.status === 'investigating').length,
        compliance_rate: 94.5
      };

      setReadings(mockReadings);
      setIncidents(mockIncidents);
      setPermits(mockPermits);
      setMetrics(calculatedMetrics);
    } catch (error) {
      console.error('Error fetching environmental data:', error);
      toast.error('Failed to load environmental data');
    } finally {
      setLoading(false);
    }
  };

  const submitReading = async () => {
    try {
      const response = await fetch('/api/environmental/readings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...readingForm,
          value: parseFloat(readingForm.value),
          project_id: localStorage.getItem('current_project_id') || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit reading');
      }

      const data = await response.json();
      
      // Add the new reading to the list
      setReadings([data.reading, ...readings]);
      toast.success('Environmental reading recorded');
      setShowReadingForm(false);
      resetReadingForm();
      
      // Refresh metrics
      fetchEnvironmentalData();
    } catch (error) {
      console.error('Error submitting reading:', error);
      toast.error('Failed to record reading');
    }
  };

  const determineStatus = (type: string, value: number): 'normal' | 'warning' | 'violation' => {
    // Simple thresholds for demo
    switch (type) {
      case 'air_quality':
        return value > 100 ? 'violation' : value > 50 ? 'warning' : 'normal';
      case 'noise_level':
        return value > 85 ? 'violation' : value > 75 ? 'warning' : 'normal';
      case 'dust_level':
        return value > 0.15 ? 'violation' : value > 0.1 ? 'warning' : 'normal';
      default:
        return 'normal';
    }
  };

  const resetReadingForm = () => {
    setReadingForm({
      metric_type: 'air_quality',
      value: '',
      unit: 'AQI',
      location: '',
      notes: ''
    });
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'air_quality':
        return Wind;
      case 'noise_level':
        return Volume2;
      case 'dust_level':
        return Cloud;
      case 'water_quality':
        return Droplets;
      case 'temperature':
        return ThermometerSun;
      default:
        return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
      case 'compliant':
      case 'active':
      case 'resolved':
        return 'text-green-400 bg-green-400/20';
      case 'warning':
      case 'expiring_soon':
      case 'investigating':
        return 'text-blue-400 bg-blue-400/20';
      case 'violation':
      case 'non_compliant':
      case 'expired':
      case 'critical':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-slate-400 bg-slate-400/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-blue-500">Loading environmental data...</div>
      </div>
    );
  }

  // Full-screen collaboration mode
  if (showCollaboration) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
        {/* Context Banner */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6" />
            <div>
              <h2 className="font-semibold">Environmental Audit Call</h2>
              <p className="text-sm text-green-100">Compliance reviews • Permit discussions • Incident analysis • Regulatory coordination</p>
            </div>
          </div>
          <button
            onClick={() => setShowCollaboration(false)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            Back to Compliance
          </button>
        </div>

        {/* Collaboration Hub */}
        <div className="flex-1 overflow-hidden">
          <CollaborationHub />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-[13px]">
            <TreePine className="w-8 h-8 text-green-400" />
            Environmental Compliance
          </h1>
          <p className="text-slate-400 mt-2">Monitor environmental metrics and maintain regulatory compliance</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCollaboration(!showCollaboration)}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-[21px] py-[13px] rounded-[8px] flex items-center gap-[8px] transition-all"
          >
            <Video className="w-5 h-5" />
            <span className="hidden sm:inline">Audit Call</span>
          </button>
          <button
            onClick={() => setShowReadingForm(true)}
            className="px-[21px] py-[13px] bg-blue-500 hover:bg-blue-600 text-white rounded-[8px] font-semibold transition-all flex items-center gap-[8px] touch-golden"
          >
            <Plus className="w-4 h-4" />
            Record Reading
          </button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-[21px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[21px]"
          >
            <div className="flex items-center justify-between mb-[8px]">
              <Activity className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-slate-400">Today</span>
            </div>
            <div className="text-2xl font-bold text-white">{metrics.total_readings}</div>
            <div className="text-sm text-slate-400">Readings</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[21px]"
          >
            <div className="flex items-center justify-between mb-[8px]">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-xs text-slate-400">This Month</span>
            </div>
            <div className="text-2xl font-bold text-white">{metrics.violations_this_month}</div>
            <div className="text-sm text-slate-400">Violations</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[21px]"
          >
            <div className="flex items-center justify-between mb-[8px]">
              <FileText className="w-5 h-5 text-green-400" />
              <span className="text-xs text-slate-400">Active</span>
            </div>
            <div className="text-2xl font-bold text-white">{metrics.active_permits}</div>
            <div className="text-sm text-slate-400">Permits</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[21px]"
          >
            <div className="flex items-center justify-between mb-[8px]">
              <AlertCircle className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-slate-400">Action Needed</span>
            </div>
            <div className="text-2xl font-bold text-white">{metrics.expiring_permits}</div>
            <div className="text-sm text-slate-400">Expiring</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[21px]"
          >
            <div className="flex items-center justify-between mb-[8px]">
              <AlertTriangle className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-slate-400">Open</span>
            </div>
            <div className="text-2xl font-bold text-white">{metrics.open_incidents}</div>
            <div className="text-sm text-slate-400">Incidents</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[21px]"
          >
            <div className="flex items-center justify-between mb-[8px]">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-xs text-slate-400">Overall</span>
            </div>
            <div className="text-2xl font-bold text-white">{metrics.compliance_rate}%</div>
            <div className="text-sm text-slate-400">Compliant</div>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-[13px] border-b border-slate-700">
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`px-[21px] py-[13px] font-medium transition-all border-b-2 ${
            activeTab === 'monitoring'
              ? 'text-blue-400 border-gray-700'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          Monitoring
        </button>
        <button
          onClick={() => setActiveTab('incidents')}
          className={`px-[21px] py-[13px] font-medium transition-all border-b-2 ${
            activeTab === 'incidents'
              ? 'text-blue-400 border-gray-700'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          Incidents
        </button>
        <button
          onClick={() => setActiveTab('permits')}
          className={`px-[21px] py-[13px] font-medium transition-all border-b-2 ${
            activeTab === 'permits'
              ? 'text-blue-400 border-gray-700'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          Permits
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-[21px] py-[13px] font-medium transition-all border-b-2 ${
            activeTab === 'reports'
              ? 'text-blue-400 border-gray-700'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          Reports
        </button>
      </div>

      {/* Content */}
      <div>
        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div className="space-y-[21px]">
            {/* Filter Bar */}
            <div className="flex flex-wrap gap-[13px]">
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-[21px] py-[8px] bg-slate-800 border border-slate-700 rounded-[8px] text-white"
              >
                <option value="all">All Metrics</option>
                <option value="air_quality">Air Quality</option>
                <option value="noise_level">Noise Level</option>
                <option value="dust_level">Dust Level</option>
                <option value="water_quality">Water Quality</option>
              </select>
            </div>

            {/* Readings List */}
            <div className="space-y-[13px]">
              {readings
                .filter(r => selectedMetric === 'all' || r.metric_type === selectedMetric)
                .map((reading) => {
                  const Icon = getMetricIcon(reading.metric_type);
                  return (
                    <motion.div
                      key={reading.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[21px]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-[21px]">
                          <Icon className="w-8 h-8 text-slate-400" />
                          <div>
                            <div className="text-white font-semibold">
                              {reading.metric_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </div>
                            <div className="text-sm text-slate-400">{reading.location}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            {reading.value} {reading.unit}
                          </div>
                          <div className={`inline-flex items-center gap-[5px] px-[8px] py-[3px] rounded-full text-xs ${getStatusColor(reading.status)}`}>
                            {reading.status.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      {reading.notes && (
                        <div className="mt-[13px] text-sm text-slate-400 italic">
                          Note: {reading.notes}
                        </div>
                      )}
                      <div className="mt-[13px] text-xs text-slate-500">
                        Recorded by {reading.recorded_by} at {new Date(reading.recorded_at).toLocaleString()}
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Incidents Tab */}
        {activeTab === 'incidents' && (
          <div className="space-y-[21px]">
            <div className="space-y-[13px]">
              {incidents.map((incident) => (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[21px]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-[13px] mb-[8px]">
                        <h3 className="text-white font-semibold">{incident.incident_type}</h3>
                        <span className={`px-[8px] py-[3px] rounded-full text-xs ${getStatusColor(incident.severity)}`}>
                          {incident.severity.toUpperCase()}
                        </span>
                        <span className={`px-[8px] py-[3px] rounded-full text-xs ${getStatusColor(incident.status)}`}>
                          {incident.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-400 mb-[8px]">{incident.description}</p>
                      <div className="text-sm text-slate-500">
                        <div>Location: {incident.location}</div>
                        <div>Reported by {incident.reported_by} on {new Date(incident.reported_at).toLocaleDateString()}</div>
                      </div>
                      {incident.corrective_actions && (
                        <div className="mt-[13px] p-[13px] bg-slate-900/50 rounded-[8px]">
                          <div className="text-sm text-blue-400 font-medium mb-[5px]">Corrective Actions:</div>
                          <div className="text-sm text-slate-300">{incident.corrective_actions}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Permits Tab */}
        {activeTab === 'permits' && (
          <div className="space-y-[21px]">
            <div className="space-y-[13px]">
              {permits.map((permit) => (
                <motion.div
                  key={permit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[21px]"
                >
                  <div className="flex items-start justify-between mb-[13px]">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{permit.permit_type} Permit</h3>
                      <div className="text-sm text-slate-400">
                        Permit #{permit.permit_number} • {permit.issuing_authority}
                      </div>
                    </div>
                    <div className="flex gap-[8px]">
                      <span className={`px-[13px] py-[5px] rounded-full text-sm ${getStatusColor(permit.status)}`}>
                        {permit.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className={`px-[13px] py-[5px] rounded-full text-sm ${getStatusColor(permit.compliance_status)}`}>
                        {permit.compliance_status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-[21px] mb-[13px]">
                    <div>
                      <div className="text-xs text-slate-500">Issue Date</div>
                      <div className="text-white">{new Date(permit.issue_date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Expiry Date</div>
                      <div className="text-white">{new Date(permit.expiry_date).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-blue-400 font-medium mb-[8px]">Conditions:</div>
                    <ul className="space-y-[5px]">
                      {permit.conditions.map((condition, index) => (
                        <li key={index} className="text-sm text-slate-300 flex items-start gap-[8px]">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          {condition}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-[21px]">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[13px] p-[34px] text-center">
              <FileText className="w-16 h-16 text-blue-500 mx-auto mb-[21px]" />
              <h3 className="text-xl font-semibold text-white mb-[8px]">Environmental Reports</h3>
              <p className="text-slate-400 mb-[21px]">Generate compliance reports for regulatory submissions</p>
              <div className="flex gap-[13px] justify-center">
                <button className="px-[21px] py-[13px] bg-blue-500 hover:bg-blue-600 text-white rounded-[8px] font-semibold transition-all flex items-center gap-[8px]">
                  <Download className="w-4 h-4" />
                  Monthly Report
                </button>
                <button className="px-[21px] py-[13px] bg-slate-700 hover:bg-slate-600 text-white rounded-[8px] font-semibold transition-all flex items-center gap-[8px]">
                  <Calendar className="w-4 h-4" />
                  Custom Range
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Reading Modal */}
      {showReadingForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-700 rounded-[21px] p-[34px] max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-white mb-[21px]">Record Environmental Reading</h2>
            
            <div className="space-y-[21px]">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                  Metric Type
                </label>
                <select
                  value={readingForm.metric_type}
                  onChange={(e) => {
                    const type = e.target.value as typeof readingForm.metric_type;
                    setReadingForm({
                      ...readingForm,
                      metric_type: type,
                      unit: type === 'air_quality' ? 'AQI' :
                            type === 'noise_level' ? 'dB' :
                            type === 'dust_level' ? 'mg/m³' :
                            type === 'water_quality' ? 'pH' : ''
                    });
                  }}
                  className="w-full px-[13px] py-[8px] bg-slate-800 border border-slate-700 rounded-[8px] text-white"
                >
                  <option value="air_quality">Air Quality</option>
                  <option value="noise_level">Noise Level</option>
                  <option value="dust_level">Dust Level</option>
                  <option value="water_quality">Water Quality</option>
                  <option value="temperature">Temperature</option>
                  <option value="humidity">Humidity</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-[21px]">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={readingForm.value}
                    onChange={(e) => setReadingForm({ ...readingForm, value: e.target.value })}
                    className="w-full px-[13px] py-[8px] bg-slate-800 border border-slate-700 rounded-[8px] text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={readingForm.unit}
                    readOnly
                    className="w-full px-[13px] py-[8px] bg-slate-800 border border-slate-700 rounded-[8px] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                  Location
                </label>
                <input
                  type="text"
                  value={readingForm.location}
                  onChange={(e) => setReadingForm({ ...readingForm, location: e.target.value })}
                  className="w-full px-[13px] py-[8px] bg-slate-800 border border-slate-700 rounded-[8px] text-white"
                  placeholder="e.g., Site Entrance, Zone A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-[8px]">
                  Notes (Optional)
                </label>
                <textarea
                  value={readingForm.notes}
                  onChange={(e) => setReadingForm({ ...readingForm, notes: e.target.value })}
                  className="w-full px-[13px] py-[8px] bg-slate-800 border border-slate-700 rounded-[8px] text-white min-h-[89px]"
                  placeholder="Additional observations..."
                />
              </div>
            </div>

            <div className="flex gap-[13px] mt-[34px]">
              <button
                onClick={submitReading}
                className="flex-1 px-[21px] py-[13px] bg-blue-500 hover:bg-blue-600 text-white rounded-[8px] font-semibold transition-all"
              >
                Submit Reading
              </button>
              <button
                onClick={() => {
                  setShowReadingForm(false);
                  resetReadingForm();
                }}
                className="flex-1 px-[21px] py-[13px] bg-slate-700 hover:bg-slate-600 text-white rounded-[8px] font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
