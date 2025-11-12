import React, { useState } from 'react';
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Thermometer,
  Eye,
  Droplets,
  AlertTriangle,
  Clock,
  MapPin,
  Activity,
  Zap,
  Shield,
  Calendar,
  RefreshCw
} from 'lucide-react';

interface WeatherData {
  current: {
    temperature: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    wind_direction: number;
    visibility: number;
    uv_index: number;
    conditions: string;
    icon: string;
  };
  alerts: WeatherAlert[];
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  start: string;
  end: string;
  areas: string[];
}

interface HourlyForecast {
  time: string;
  temperature: number;
  conditions: string;
  wind_speed: number;
  precipitation: number;
}

interface DailyForecast {
  date: string;
  high: number;
  low: number;
  conditions: string;
  precipitation: number;
  wind_speed: number;
}

const mockWeatherData: WeatherData = {
  current: {
    temperature: 28,
    feels_like: 24,
    humidity: 65,
    wind_speed: 12,
    wind_direction: 240,
    visibility: 10,
    uv_index: 3,
    conditions: 'Partly Cloudy',
    icon: 'partly-cloudy'
  },
  alerts: [
    {
      id: '1',
      title: 'High Wind Warning',
      description: 'Sustained winds 25-35 mph with gusts up to 50 mph. Exercise caution with crane operations.',
      severity: 'moderate',
      start: '2025-01-27T14:00:00Z',
      end: '2025-01-27T22:00:00Z',
      areas: ['Brainerd, MN', 'Pine County, MN']
    }
  ],
  hourly: [
    { time: '14:00', temperature: 30, conditions: 'Cloudy', wind_speed: 15, precipitation: 0 },
    { time: '15:00', temperature: 28, conditions: 'Partly Cloudy', wind_speed: 12, precipitation: 0 },
    { time: '16:00', temperature: 26, conditions: 'Clear', wind_speed: 8, precipitation: 0 }
  ],
  daily: [
    { date: '2025-01-28', high: 32, low: 18, conditions: 'Sunny', precipitation: 0, wind_speed: 8 },
    { date: '2025-01-29', high: 35, low: 22, conditions: 'Partly Cloudy', precipitation: 10, wind_speed: 12 },
    { date: '2025-01-30', high: 30, low: 20, conditions: 'Snow', precipitation: 85, wind_speed: 18 }
  ]
};

export const WeatherCenter: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState('Brainerd, MN');
  const [weatherData] = useState<WeatherData>(mockWeatherData);
  const [lastUpdated] = useState(new Date());

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'extreme': return 'bg-red-500/20 border-red-500/50 text-red-200';
      case 'severe': return 'bg-orange-500/20 border-orange-500/50 text-orange-200';
      case 'moderate': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200';
      default: return 'bg-blue-500/20 border-blue-500/50 text-blue-200';
    }
  };

  const getWorkImpact = (windSpeed: number, precipitation: number, temperature: number) => {
    if (windSpeed > 25 || precipitation > 80 || temperature < 0) {
      return { level: 'high', text: 'High Impact - Consider work stoppage', color: 'text-red-400' };
    } else if (windSpeed > 15 || precipitation > 40 || temperature < 20) {
      return { level: 'moderate', text: 'Moderate Impact - Exercise caution', color: 'text-yellow-400' };
    } else {
      return { level: 'low', text: 'Good Conditions - Normal operations', color: 'text-green-400' };
    }
  };

  const formatTime = (timeStr: string) => {
    const time = new Date(`2000-01-01T${timeStr}:00`);
    return time.toLocaleTimeString([], { hour: 'numeric', hour12: true });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Cloud className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Weather Center</h1>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-slate-300">Weather monitoring for electrical construction sites</p>
          <div className="flex items-center gap-4">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Brainerd, MN">Brainerd, MN - Alpha-7 Substation</option>
              <option value="Pine County, MN">Pine County, MN - Wind Farm</option>
            </select>
            <button className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors">
              <RefreshCw className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Weather Alerts */}
      {weatherData.alerts.length > 0 && (
        <div className="mb-6 space-y-3">
          {weatherData.alerts.map((alert) => (
            <div key={alert.id} className={`border rounded-2xl p-4 ${getAlertColor(alert.severity)}`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{alert.title}</h3>
                  <p className="mb-2">{alert.description}</p>
                  <div className="flex items-center gap-4 text-sm opacity-80">
                    <span>Active: {new Date(alert.start).toLocaleTimeString()} - {new Date(alert.end).toLocaleTimeString()}</span>
                    <span>Areas: {alert.areas.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Conditions */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Main Weather Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Current Conditions</h3>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>{selectedLocation}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white">{weatherData.current.temperature}°F</div>
              <div className="text-sm text-slate-400">Feels like {weatherData.current.feels_like}°F</div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <Cloud className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-lg font-semibold text-white">{weatherData.current.conditions}</div>
              <div className="text-sm text-slate-400">
                Updated: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-sm text-slate-400">Wind Speed</div>
                <div className="text-white font-semibold">{weatherData.current.wind_speed} mph</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-sm text-slate-400">Humidity</div>
                <div className="text-white font-semibold">{weatherData.current.humidity}%</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-sm text-slate-400">Visibility</div>
                <div className="text-white font-semibold">{weatherData.current.visibility} mi</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-yellow-400" />
              <div>
                <div className="text-sm text-slate-400">UV Index</div>
                <div className="text-white font-semibold">{weatherData.current.uv_index}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Work Impact Assessment */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-400" />
            Work Impact Assessment
          </h3>

          {(() => {
            const impact = getWorkImpact(
              weatherData.current.wind_speed,
              0, // Current precipitation
              weatherData.current.temperature
            );
            return (
              <>
                <div className={`text-lg font-semibold mb-4 ${impact.color}`}>
                  {impact.text}
                </div>

                <div className="space-y-4">
                  {/* Crane Operations */}
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300 font-semibold">Crane Operations</span>
                      {weatherData.current.wind_speed > 20 ? (
                        <span className="text-red-400 text-sm">⛔ Restricted</span>
                      ) : weatherData.current.wind_speed > 15 ? (
                        <span className="text-yellow-400 text-sm">⚠️ Caution</span>
                      ) : (
                        <span className="text-green-400 text-sm">✅ Safe</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      Wind speed: {weatherData.current.wind_speed} mph (Max: 20 mph)
                    </p>
                  </div>

                  {/* Electrical Work */}
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300 font-semibold">High Voltage Work</span>
                      {weatherData.current.conditions.includes('Rain') || weatherData.current.conditions.includes('Storm') ? (
                        <span className="text-red-400 text-sm">⛔ Prohibited</span>
                      ) : (
                        <span className="text-green-400 text-sm">✅ Safe</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      Conditions: {weatherData.current.conditions}
                    </p>
                  </div>

                  {/* General Field Work */}
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300 font-semibold">General Field Work</span>
                      {weatherData.current.temperature < 10 || weatherData.current.temperature > 95 ? (
                        <span className="text-yellow-400 text-sm">⚠️ Monitor</span>
                      ) : (
                        <span className="text-green-400 text-sm">✅ Normal</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      Temperature: {weatherData.current.temperature}°F (Feels like {weatherData.current.feels_like}°F)
                    </p>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Hourly Forecast */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          Hourly Forecast
        </h3>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {weatherData.hourly.map((hour, index) => (
            <div key={index} className="bg-slate-700/30 rounded-lg p-3 text-center">
              <div className="text-sm text-slate-400 mb-2">{formatTime(hour.time)}</div>
              <div className="text-2xl font-bold text-white mb-2">{hour.temperature}°</div>
              <div className="text-xs text-slate-400 mb-2">{hour.conditions}</div>
              <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
                <Wind className="w-3 h-3" />
                <span>{hour.wind_speed} mph</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          7-Day Forecast
        </h3>
        <div className="space-y-3">
          {weatherData.daily.map((day, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-white font-semibold w-16">{formatDate(day.date)}</div>
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-blue-400" />
                  <span className="text-slate-300">{day.conditions}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="text-white font-semibold">{day.high}°</div>
                  <div className="text-slate-400">{day.low}°</div>
                </div>
                
                <div className="flex items-center gap-1 text-slate-400">
                  <Droplets className="w-3 h-3" />
                  <span>{day.precipitation}%</span>
                </div>
                
                <div className="flex items-center gap-1 text-slate-400">
                  <Wind className="w-3 h-3" />
                  <span>{day.wind_speed} mph</span>
                </div>

                {/* Work Impact Indicator */}
                <div className="w-3 h-3 rounded-full">
                  {(() => {
                    const impact = getWorkImpact(day.wind_speed, day.precipitation, day.low);
                    return (
                      <div className={`w-full h-full rounded-full ${
                        impact.level === 'high' ? 'bg-red-400' :
                        impact.level === 'moderate' ? 'bg-yellow-400' :
                        'bg-green-400'
                      }`}></div>
                    );
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
