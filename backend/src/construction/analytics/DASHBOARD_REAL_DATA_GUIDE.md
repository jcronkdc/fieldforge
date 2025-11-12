# 🎯 DASHBOARD REAL DATA CONNECTION GUIDE - KILL MATH.RANDOM()

## Current Problem: Dashboard.tsx Shows FAKE Data

```typescript
// Dashboard.tsx Line 40-116 - ALL FAKE!
setMetrics([
  { title: 'Project Progress', value: 67 }, // HARDCODED
  { title: 'Safety Score', value: 98.5 },   // FAKE
  { title: 'Active Crews', value: 8 },      // MADE UP
  // etc...
]);
```

## REPLACE WITH REAL DATA CONNECTION:

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { session } = useAuth();
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.access_token) {
      fetchRealDashboardData();
    }
  }, [session]);

  const fetchRealDashboardData = async () => {
    try {
      setLoading(true);
      
      // FETCH REAL METRICS FROM NEW ANALYTICS API
      const response = await fetch('/api/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      
      // SET REAL METRICS (NOT FAKE!)
      setMetrics(data.metrics);
      
      // Also fetch real activities (TODO: implement activities endpoint)
      await fetchRecentActivities();
      
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard metrics');
      
      // Fallback to empty state, NOT fake data
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      // Fetch from multiple sources for real activity feed
      const [incidents, timeEntries, permits] = await Promise.all([
        fetch('/api/safety/incidents?limit=5', {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        }).then(r => r.json()),
        
        fetch('/api/field-ops/time/entries?limit=5', {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        }).then(r => r.json()),
        
        fetch('/api/safety/permits?limit=5', {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        }).then(r => r.json())
      ]);

      // Transform into activity items
      const activities: ActivityItem[] = [
        ...incidents.incidents.map(i => ({
          id: `incident-${i.id}`,
          type: 'safety',
          title: `${i.severity} severity incident reported`,
          project: i.project_name,
          timestamp: i.created_at,
          priority: i.severity === 'critical' ? 'critical' : 'medium',
          user: i.reporter_name
        })),
        // Add time entries and permits...
      ];

      setActivities(activities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
      
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && session) {
        fetchRealDashboardData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading, session]);

  // ... rest of component
};
```

## Update RealTimeViz.tsx - KILL RANDOM NUMBERS:

```typescript
// CURRENT PROBLEM: RealTimeViz.tsx uses Math.random()
useEffect(() => {
  const interval = setInterval(() => {
    // THIS IS FAKE!
    const newPoint = {
      timestamp: new Date(),
      value: 50 + Math.random() * 50
    };
  }, 3000);
}, []);
```

### REPLACE WITH REAL-TIME DATA:

```typescript
export const RealTimeViz: React.FC = () => {
  const { session } = useAuth();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [liveData, setLiveData] = useState<LiveDataPoint[]>([]);

  // Fetch real productivity data
  const fetchRealTimeData = async () => {
    try {
      const response = await fetch('/api/analytics/productivity?limit=20', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      
      const data = await response.json();
      
      // Convert to chart data
      const points = data.productivity.map(p => ({
        timestamp: new Date(p.work_date),
        value: parseFloat(p.avg_hours_per_worker)
      }));
      
      setLiveData(points);
      
      // Update metrics with REAL values
      const metricsResponse = await fetch('/api/analytics/dashboard');
      const metricsData = await metricsResponse.json();
      
      setMetrics(metricsData.metrics.slice(0, 6).map(m => ({
        label: m.title,
        value: m.value,
        unit: m.unit,
        change: m.change,
        trend: m.trend,
        color: getGradientColor(m.color),
        icon: getIcon(m.icon)
      })));
      
    } catch (error) {
      console.error('Failed to fetch real-time data:', error);
    }
  };

  useEffect(() => {
    fetchRealTimeData();
    
    // Update every 10 seconds with REAL data
    const interval = setInterval(fetchRealTimeData, 10000);
    
    return () => clearInterval(interval);
  }, [session]);

  // ... rest of component
};
```

## Mobile Responsive Requirements:

```typescript
const DashboardMetric = ({ metric }) => {
  const isMobile = window.innerWidth < 768;
  
  return (
    <div className={cn(
      "metric-card",
      isMobile ? "p-3 min-h-[100px]" : "p-6",
      "bg-slate-800 rounded-xl border border-slate-700"
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className={cn(
            "text-slate-400",
            isMobile ? "text-sm" : "text-base"
          )}>
            {metric.title}
          </p>
          <p className={cn(
            "font-bold",
            isMobile ? "text-2xl" : "text-3xl",
            metric.color
          )}>
            {metric.value}{metric.unit}
          </p>
        </div>
        <metric.icon className={cn(
          metric.color,
          isMobile ? "w-6 h-6" : "w-8 h-8"
        )} />
      </div>
    </div>
  );
};
```

## Testing Checklist:
- [ ] Dashboard shows real project progress %
- [ ] Safety score calculated from actual incidents
- [ ] Active crews from today's time entries
- [ ] Equipment utilization from inventory status
- [ ] Budget numbers from actual costs
- [ ] Schedule variance from real deadlines
- [ ] Activities show real incidents/entries
- [ ] Auto-refresh works (30 seconds)
- [ ] Mobile layout responsive
- [ ] Loading states handled
- [ ] Error states graceful
- [ ] NO MORE MATH.RANDOM() ANYWHERE!
