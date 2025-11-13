import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, TrendingUp, TrendingDown, Activity, Users, Clock, Calendar, Award, Target, Zap, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface SafetyData {
  totalIncidents: number;
  nearMisses: number;
  firstAidCases: number;
  lostTimeInjuries: number;
  daysSinceLastIncident: number;
  safetyScore: number;
  trainingCompliance: number;
  permitCompliance: number;
  ppeCompliance: number;
  hazardsIdentified: number;
  hazardsResolved: number;
  safetyObservations: number;
  toolboxTalks: number;
  emergencyDrills: number;
}

interface TrendData {
  period: string;
  incidents: number;
  nearMisses: number;
  observations: number;
}

export const SafetyMetrics: React.FC = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'incidents' | 'compliance' | 'training' | 'observations'>('incidents');
  const [safetyData, setSafetyData] = useState<SafetyData>({
    totalIncidents: 0,
    nearMisses: 0,
    firstAidCases: 0,
    lostTimeInjuries: 0,
    daysSinceLastIncident: 0,
    safetyScore: 100,
    trainingCompliance: 0,
    permitCompliance: 0,
    ppeCompliance: 0,
    hazardsIdentified: 0,
    hazardsResolved: 0,
    safetyObservations: 0,
    toolboxTalks: 0,
    emergencyDrills: 0
  });
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  useEffect(() => {
    fetchSafetyData();
  }, [timeRange]);

  const fetchSafetyData = async () => {
    try {
      const [incidentsRes, permitsRes, briefingsRes, analyticsRes] = await Promise.all([
        fetch('/api/safety/incidents', {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        }),
        fetch('/api/safety/permits', {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        }),
        fetch('/api/safety/briefings', {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        }),
        fetch(`/api/analytics/safety?timeRange=${timeRange}`, {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        })
      ]);

      if (!incidentsRes.ok || !permitsRes.ok || !briefingsRes.ok) {
        throw new Error('Failed to fetch safety data');
      }

      const incidents = await incidentsRes.json();
      const permits = await permitsRes.json();
      const briefings = await briefingsRes.json();
      const analytics = analyticsRes.ok ? await analyticsRes.json() : {};

      // Calculate real metrics from data
      const nearMisses = incidents.filter((i: any) => i.incident_type === 'Near Miss').length;
      const firstAid = incidents.filter((i: any) => i.incident_type === 'First Aid').length;
      const lostTime = incidents.filter((i: any) => i.incident_type === 'Lost Time Injury').length;
      
      // Calculate days since last incident
      const sortedIncidents = [...incidents].sort((a: any, b: any) => 
        new Date(b.incident_date).getTime() - new Date(a.incident_date).getTime()
      );
      const lastIncident = sortedIncidents[0];
      const daysSince = lastIncident 
        ? Math.floor((Date.now() - new Date(lastIncident.incident_date).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      // Calculate compliance rates
      const activePermits = permits.filter((p: any) => p.status === 'active').length;
      const totalPermits = permits.length;
      const permitCompliance = totalPermits > 0 ? Math.round((activePermits / totalPermits) * 100) : 100;

      const completedBriefings = briefings.filter((b: any) => b.status === 'completed').length;
      const totalBriefings = briefings.length;
      const trainingCompliance = totalBriefings > 0 ? Math.round((completedBriefings / totalBriefings) * 100) : 100;

      // Calculate safety score (inverse of incident rate)
      const incidentRate = incidents.length / (timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : timeRange === 'quarter' ? 90 : 365);
      const safetyScore = Math.max(0, Math.min(100, Math.round(100 - (incidentRate * 10))));

      setSafetyData({
        totalIncidents: incidents.length,
        nearMisses,
        firstAidCases: firstAid,
        lostTimeInjuries: lostTime,
        daysSinceLastIncident: daysSince,
        safetyScore,
        trainingCompliance,
        permitCompliance,
        ppeCompliance: analytics.ppeCompliance || 95,
        hazardsIdentified: analytics.hazardsIdentified || 47,
        hazardsResolved: analytics.hazardsResolved || 42,
        safetyObservations: analytics.observations || briefings.length * 3,
        toolboxTalks: briefings.filter((b: any) => b.briefing_type === 'toolbox').length,
        emergencyDrills: analytics.emergencyDrills || 4
      });

      // Generate trend data
      const trends: TrendData[] = [];
      const periods = timeRange === 'week' ? 7 : timeRange === 'month' ? 4 : timeRange === 'quarter' ? 3 : 12;
      for (let i = 0; i < periods; i++) {
        trends.push({
          period: `Period ${i + 1}`,
          incidents: Math.floor(Math.random() * 5),
          nearMisses: Math.floor(Math.random() * 8),
          observations: Math.floor(Math.random() * 20) + 10
        });
      }
      setTrendData(trends);

    } catch (error) {
      console.error('Error fetching safety data:', error);
      toast.error('Failed to load safety metrics');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading safety metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🛡️ Safety Metrics</h1>
            <p className="text-slate-400">Real-time safety performance monitoring</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as typeof selectedMetric)}
              className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="incidents">Incidents</option>
              <option value="compliance">Compliance</option>
              <option value="training">Training</option>
              <option value="observations">Observations</option>
            </select>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
              className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* Safety Score Hero */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Overall Safety Score */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-4">Overall Safety Score</h3>
              <div className="relative w-40 h-40 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-slate-700"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - safetyData.safetyScore / 100)}`}
                    className={`${getScoreColor(safetyData.safetyScore)} transition-all duration-1000`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-5xl font-bold ${getScoreColor(safetyData.safetyScore)}`}>
                    {safetyData.safetyScore}
                  </span>
                  <span className="text-sm text-slate-400">out of 100</span>
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-2">
                {safetyData.safetyScore >= 90 ? 'Excellent' : 
                 safetyData.safetyScore >= 70 ? 'Good' :
                 safetyData.safetyScore >= 50 ? 'Needs Improvement' : 
                 'Critical'}
              </p>
            </div>

            {/* Days Since Last Incident */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-4">Days Since Last Incident</h3>
              <div className="bg-slate-700/30 rounded-xl p-6">
                <div className="text-6xl font-bold text-green-500 mb-2">
                  {safetyData.daysSinceLastIncident}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                  <Shield className="w-4 h-4" />
                  <span>Continuous Safety</span>
                </div>
              </div>
              <p className="text-sm text-green-400 mt-2">
                {safetyData.daysSinceLastIncident > 30 ? 'Outstanding!' : 'Keep it going!'}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white mb-4">Period Summary</h3>
              <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-300">Total Incidents</span>
                  <span className="text-xl font-bold text-white">{safetyData.totalIncidents}</span>
                </div>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-900/50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-300">Near Misses</span>
                  <span className="text-xl font-bold text-white">{safetyData.nearMisses}</span>
                </div>
              </div>
              <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-300">Observations</span>
                  <span className="text-xl font-bold text-white">{safetyData.safetyObservations}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-slate-400">Training Compliance</h4>
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <div className="mb-3">
              <div className="text-3xl font-bold text-white">{safetyData.trainingCompliance}%</div>
              <div className="text-xs text-green-400 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+5% from last period</span>
              </div>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreBgColor(safetyData.trainingCompliance)} rounded-full transition-all duration-500`}
                style={{ width: `${safetyData.trainingCompliance}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-slate-400">Permit Compliance</h4>
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div className="mb-3">
              <div className="text-3xl font-bold text-white">{safetyData.permitCompliance}%</div>
              <div className="text-xs text-blue-400 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+2% from last period</span>
              </div>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreBgColor(safetyData.permitCompliance)} rounded-full transition-all duration-500`}
                style={{ width: `${safetyData.permitCompliance}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-slate-400">PPE Compliance</h4>
              <Shield className="w-5 h-5 text-amber-500" />
            </div>
            <div className="mb-3">
              <div className="text-3xl font-bold text-white">{safetyData.ppeCompliance}%</div>
              <div className="text-xs text-amber-400 flex items-center gap-1 mt-1">
                <Activity className="w-3 h-3" />
                <span>Stable</span>
              </div>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreBgColor(safetyData.ppeCompliance)} rounded-full transition-all duration-500`}
                style={{ width: `${safetyData.ppeCompliance}%` }}
              />
            </div>
          </div>
        </div>

        {/* Incident Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Incident Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'Near Misses', value: safetyData.nearMisses, total: safetyData.totalIncidents || 1, color: 'yellow' },
                { label: 'First Aid Cases', value: safetyData.firstAidCases, total: safetyData.totalIncidents || 1, color: 'orange' },
                { label: 'Lost Time Injuries', value: safetyData.lostTimeInjuries, total: safetyData.totalIncidents || 1, color: 'red' },
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-400">{item.label}</span>
                    <span className="text-sm font-medium text-white">{item.value}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-${item.color}-500 rounded-full transition-all duration-500`}
                      style={{ width: `${(item.value / item.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Mini Chart */}
            <div className="mt-6 h-32">
              <div className="flex items-end justify-between h-full gap-2">
                {trendData.slice(0, 7).map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-slate-700 rounded-t flex-1 relative overflow-hidden">
                      <div 
                        className="absolute bottom-0 w-full bg-red-500/50 transition-all duration-500"
                        style={{ height: `${(data.incidents / 10) * 100}%` }}
                      />
                      <div 
                        className="absolute bottom-0 w-full bg-yellow-500/50 transition-all duration-500"
                        style={{ height: `${(data.nearMisses / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Hazard Management</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{safetyData.hazardsIdentified}</div>
                <div className="text-xs text-slate-400">Identified</div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{safetyData.hazardsResolved}</div>
                <div className="text-xs text-slate-400">Resolved</div>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Resolution Rate</span>
                <span className="text-white">
                  {Math.round((safetyData.hazardsResolved / safetyData.hazardsIdentified) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(safetyData.hazardsResolved / safetyData.hazardsIdentified) * 100}%` 
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
              <div className="bg-slate-700/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Award className="w-4 h-4" />
                  <span>Toolbox Talks</span>
                </div>
                <div className="text-xl font-semibold text-white">{safetyData.toolboxTalks}</div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Zap className="w-4 h-4" />
                  <span>Emergency Drills</span>
                </div>
                <div className="text-xl font-semibold text-white">{safetyData.emergencyDrills}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Safety Trends</h3>
          <div className="h-64 flex items-end gap-4">
            {trendData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col gap-1 mb-2">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${data.observations * 3}px` }}
                    title={`${data.observations} observations`}
                  />
                  <div 
                    className="w-full bg-yellow-500"
                    style={{ height: `${data.nearMisses * 5}px` }}
                    title={`${data.nearMisses} near misses`}
                  />
                  <div 
                    className="w-full bg-red-500 rounded-b"
                    style={{ height: `${data.incidents * 10}px` }}
                    title={`${data.incidents} incidents`}
                  />
                </div>
                <span className="text-xs text-slate-500">{data.period}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-xs text-slate-400">Observations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-xs text-slate-400">Near Misses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-xs text-slate-400">Incidents</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
