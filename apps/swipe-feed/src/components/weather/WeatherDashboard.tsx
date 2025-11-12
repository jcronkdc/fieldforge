import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, Wind, Thermometer, AlertTriangle, TrendingUp, TrendingDown, Droplets, Eye, Loader2, MapPin, Calendar, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface WeatherData {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    wind_direction: number;
    visibility: number;
    pressure: number;
    conditions: string;
    icon: string;
    uv_index: number;
  };
  hourly: Array<{
    time: string;
    temp: number;
    conditions: string;
    precipitation: number;
    wind_speed: number;
    icon: string;
  }>;
  daily: Array<{
    date: string;
    temp_max: number;
    temp_min: number;
    conditions: string;
    precipitation: number;
    wind_speed: number;
    icon: string;
  }>;
  alerts: Array<{
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    start: string;
    end: string;
  }>;
}

interface WorkRestriction {
  condition: string;
  restriction: string;
  active: boolean;
  severity: 'low' | 'medium' | 'high';
}

export const WeatherDashboard: React.FC = () => {
  const { session } = useAuth();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({ lat: 40.7128, lng: -74.0060, name: 'Project Site' }); // Default NYC
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Construction-specific weather thresholds
  const workRestrictions: WorkRestriction[] = [
    { 
      condition: 'High Winds', 
      restriction: 'Crane operations suspended > 25 mph', 
      active: (weatherData?.current.wind_speed || 0) > 25,
      severity: 'high'
    },
    { 
      condition: 'Lightning', 
      restriction: 'All outdoor work suspended', 
      active: weatherData?.alerts?.some(a => a.title.includes('Thunder')) || false,
      severity: 'high'
    },
    { 
      condition: 'Heavy Rain', 
      restriction: 'Electrical work suspended', 
      active: (weatherData?.current.conditions || '').includes('Heavy Rain'),
      severity: 'medium'
    },
    { 
      condition: 'Extreme Heat', 
      restriction: 'Extra breaks, hydration required > 90°F', 
      active: (weatherData?.current.temp || 0) > 90,
      severity: 'medium'
    },
    { 
      condition: 'Low Visibility', 
      restriction: 'Equipment operation restricted < 1/4 mile', 
      active: (weatherData?.current.visibility || 10) < 0.25,
      severity: 'medium'
    },
    { 
      condition: 'Ice/Snow', 
      restriction: 'Surface work suspended', 
      active: (weatherData?.current.conditions || '').includes('Snow') || (weatherData?.current.temp || 32) < 32,
      severity: 'high'
    }
  ];

  useEffect(() => {
    fetchWeather();
    
    // Auto-refresh every 15 minutes
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchWeather, 15 * 60 * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [location, autoRefresh]);

  const fetchWeather = async () => {
    try {
      // In production, this would call a real weather API
      // For now, using mock data that changes based on time
      const hour = new Date().getHours();
      const isNight = hour < 6 || hour > 20;
      const temp = 65 + Math.sin(hour / 24 * Math.PI * 2) * 20;
      
      const mockWeather: WeatherData = {
        current: {
          temp: Math.round(temp),
          feels_like: Math.round(temp - 2),
          humidity: 45 + Math.random() * 30,
          wind_speed: 5 + Math.random() * 20,
          wind_direction: Math.random() * 360,
          visibility: 5 + Math.random() * 5,
          pressure: 29.92 + (Math.random() - 0.5) * 0.5,
          conditions: isNight ? 'Clear' : (Math.random() > 0.7 ? 'Partly Cloudy' : 'Sunny'),
          icon: isNight ? '🌙' : '☀️',
          uv_index: isNight ? 0 : Math.round(3 + Math.random() * 8)
        },
        hourly: Array.from({ length: 24 }, (_, i) => ({
          time: new Date(Date.now() + i * 3600 * 1000).toISOString(),
          temp: Math.round(temp + Math.sin((hour + i) / 24 * Math.PI * 2) * 15),
          conditions: Math.random() > 0.8 ? 'Rain' : 'Clear',
          precipitation: Math.random() > 0.8 ? Math.random() * 0.5 : 0,
          wind_speed: 5 + Math.random() * 15,
          icon: Math.random() > 0.8 ? '🌧️' : '☀️'
        })),
        daily: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 3600 * 1000).toISOString(),
          temp_max: Math.round(75 + Math.random() * 15),
          temp_min: Math.round(55 + Math.random() * 10),
          conditions: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rain'][Math.floor(Math.random() * 4)],
          precipitation: Math.random() * 2,
          wind_speed: 5 + Math.random() * 15,
          icon: ['☀️', '⛅', '☁️', '🌧️'][Math.floor(Math.random() * 4)]
        })),
        alerts: Math.random() > 0.7 ? [{
          title: 'Wind Advisory',
          severity: 'medium' as const,
          description: 'Gusty winds expected this afternoon. Winds 20-30 mph with gusts up to 40 mph.',
          start: new Date().toISOString(),
          end: new Date(Date.now() + 8 * 3600 * 1000).toISOString()
        }] : []
      };

      setWeatherData(mockWeather);
      setLastUpdated(new Date());
      
      // Check for severe conditions
      const activeRestrictions = workRestrictions.filter(r => {
        if (r.condition === 'High Winds') return mockWeather.current.wind_speed > 25;
        if (r.condition === 'Extreme Heat') return mockWeather.current.temp > 90;
        return false;
      });

      if (activeRestrictions.length > 0) {
        toast.error(`Weather Alert: ${activeRestrictions.map(r => r.condition).join(', ')}`);
      }
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      toast.error('Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  const getWeatherIcon = (condition: string) => {
    if (condition.includes('Rain')) return <CloudRain className="w-6 h-6 text-blue-500" />;
    if (condition.includes('Snow')) return <CloudSnow className="w-6 h-6 text-blue-300" />;
    if (condition.includes('Cloud')) return <Cloud className="w-6 h-6 text-gray-500" />;
    return <Sun className="w-6 h-6 text-yellow-500" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 border-red-500 text-red-700';
      case 'medium': return 'bg-orange-100 border-orange-500 text-orange-700';
      case 'low': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      default: return 'bg-gray-100 border-gray-500 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Weather Dashboard</h1>
          <p className="text-gray-600 mt-1 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {location.name} • Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-amber-600"
            />
            <span className="text-sm text-gray-700">Auto-refresh</span>
          </label>
          <button
            onClick={fetchWeather}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Weather Alerts */}
      {weatherData?.alerts && weatherData.alerts.length > 0 && (
        <div className="space-y-3">
          {weatherData.alerts.map((alert, idx) => (
            <div key={idx} className={`p-4 border-l-4 rounded-lg ${getSeverityColor(alert.severity)}`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold">{alert.title}</h3>
                  <p className="text-sm mt-1">{alert.description}</p>
                  <p className="text-xs mt-2 opacity-75">
                    {new Date(alert.start).toLocaleTimeString()} - {new Date(alert.end).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Conditions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Conditions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Temperature */}
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900">{weatherData?.current.temp}°F</div>
            <p className="text-sm text-gray-600 mt-1">Feels like {weatherData?.current.feels_like}°F</p>
            <p className="text-lg mt-2">{weatherData?.current.conditions}</p>
          </div>

          {/* Wind */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-600">Wind</span>
              </div>
              <span className="font-semibold">
                {weatherData?.current.wind_speed} mph {getWindDirection(weatherData?.current.wind_direction || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-600">Humidity</span>
              </div>
              <span className="font-semibold">{Math.round(weatherData?.current.humidity || 0)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-600">Visibility</span>
              </div>
              <span className="font-semibold">{weatherData?.current.visibility} mi</span>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-gray-600">Pressure</span>
              </div>
              <span className="font-semibold">{weatherData?.current.pressure?.toFixed(2)} in</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-600">UV Index</span>
              </div>
              <span className="font-semibold">{weatherData?.current.uv_index}</span>
            </div>
          </div>

          {/* Work Restrictions */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Active Restrictions</h3>
            <div className="space-y-2">
              {workRestrictions.filter(r => r.active).length === 0 ? (
                <p className="text-sm text-green-600">No weather restrictions</p>
              ) : (
                workRestrictions.filter(r => r.active).map((restriction, idx) => (
                  <div key={idx} className={`p-2 rounded text-xs ${
                    restriction.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {restriction.restriction}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Forecast */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">24-Hour Forecast</h2>
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-2">
            {weatherData?.hourly.slice(0, 24).map((hour, idx) => (
              <div key={idx} className="text-center min-w-[80px]">
                <p className="text-xs text-gray-600">
                  {new Date(hour.time).toLocaleTimeString([], { hour: 'numeric' })}
                </p>
                <div className="my-2">{getWeatherIcon(hour.conditions)}</div>
                <p className="font-semibold">{hour.temp}°</p>
                {hour.precipitation > 0 && (
                  <p className="text-xs text-blue-600 mt-1">{(hour.precipitation * 100).toFixed(0)}%</p>
                )}
                <p className="text-xs text-gray-500 mt-1">{hour.wind_speed} mph</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">7-Day Forecast</h2>
        <div className="space-y-3">
          {weatherData?.daily.map((day, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4 flex-1">
                <div className="text-sm font-medium w-20">
                  {idx === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                {getWeatherIcon(day.conditions)}
                <p className="text-sm text-gray-600">{day.conditions}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{day.wind_speed} mph</span>
                </div>
                {day.precipitation > 0 && (
                  <div className="flex items-center gap-1">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">{day.precipitation.toFixed(1)}"</span>
                  </div>
                )}
                <div className="text-right">
                  <span className="font-semibold">{day.temp_max}°</span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span className="text-gray-500">{day.temp_min}°</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Construction Guidelines */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Weather Work Guidelines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workRestrictions.map((restriction, idx) => (
            <div key={idx} className={`p-4 border rounded-lg ${
              restriction.active ? getSeverityColor(restriction.severity) : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${
                  restriction.active ? 'bg-current' : 'bg-gray-300'
                }`} />
                <div>
                  <h3 className="font-medium">{restriction.condition}</h3>
                  <p className="text-sm mt-1">{restriction.restriction}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
