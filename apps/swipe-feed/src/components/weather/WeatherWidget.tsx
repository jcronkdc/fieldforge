import React, { useState, useEffect } from 'react';
import { Cloud, Wind, Droplets, AlertTriangle, Thermometer } from 'lucide-react';

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState({
    temp: 72,
    condition: 'Partly Cloudy',
    wind: 12,
    humidity: 65,
    alert: false
  });

  return (
    <div className="flex items-center space-x-3 px-3 py-1.5 bg-slate-700/50 rounded-lg">
      <Cloud className="w-4 h-4 text-slate-400" />
      <span className="text-sm text-white font-medium">{weather.temp}°F</span>
      <span className="text-xs text-slate-400">{weather.condition}</span>
      {weather.alert && <AlertTriangle className="w-4 h-4 text-orange-500" />}
    </div>
  );
};
