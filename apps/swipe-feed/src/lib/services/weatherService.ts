/**
 * Weather Service for FieldForge
 * Monitors weather conditions and enforces work restrictions for T&D construction
 */

import { supabase } from '../supabase';

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGust: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  cloudCover: number;
  precipitation: number;
  snowDepth: number;
  conditions: string;
  icon: string;
  uvIndex: number;
  lightningRisk: boolean;
  lightningDistance?: number;
}

interface WeatherForecast {
  datetime: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  windSpeed: number;
  conditions: string;
  icon: string;
}

interface WorkRestrictions {
  craneOperations: boolean;
  aerialLifts: boolean;
  concretePouring: boolean;
  welding: boolean;
  energizedWork: boolean;
  helicopterOperations: boolean;
  restrictions: string[];
  severity: 'none' | 'advisory' | 'warning' | 'critical';
}

interface WeatherAlert {
  id: string;
  type: string;
  severity: string;
  headline: string;
  description: string;
  startTime: string;
  endTime: string;
  affectedAreas: string[];
}

class WeatherService {
  private apiKey: string | undefined;
  private apiUrl: string | undefined;
  private updateInterval: number = 15 * 60 * 1000; // 15 minutes
  private updateTimer: ReturnType<typeof setTimeout> | null = null;
  private lightningDetectionEnabled: boolean = true;

  constructor() {
    this.apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    this.apiUrl = import.meta.env.VITE_WEATHER_API_URL;
  }

  /**
   * Get current weather conditions
   */
  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData | null> {
    if (!this.apiKey) {
      console.error('Weather API key not configured');
      return this.getMockWeatherData();
    }

    try {
      // This would be your actual weather API call
      // Using OpenWeatherMap as an example
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial`
      );
      
      if (!response.ok) {
        throw new Error('Weather API request failed');
      }

      const data = await response.json();
      
      return {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        windGust: Math.round(data.wind.gust || data.wind.speed),
        windDirection: data.wind.deg,
        pressure: data.main.pressure,
        visibility: data.visibility / 1609.34, // Convert to miles
        cloudCover: data.clouds.all,
        precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0,
        snowDepth: data.snow?.['1h'] || 0,
        conditions: data.weather[0].main,
        icon: data.weather[0].icon,
        uvIndex: 5, // Would need separate API call for UV index
        lightningRisk: this.checkLightningRisk(data),
        lightningDistance: undefined
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      return this.getMockWeatherData();
    }
  }

  /**
   * Get weather forecast
   */
  async getWeatherForecast(lat: number, lon: number, days: number = 5): Promise<WeatherForecast[]> {
    if (!this.apiKey) {
      return this.getMockForecast();
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=${days}&appid=${this.apiKey}&units=imperial`
      );
      
      if (!response.ok) {
        throw new Error('Weather forecast API request failed');
      }

      const data = await response.json();
      
      return data.list.map((day: any) => ({
        datetime: new Date(day.dt * 1000).toISOString(),
        tempMax: Math.round(day.temp.max),
        tempMin: Math.round(day.temp.min),
        precipitation: day.rain || day.snow || 0,
        windSpeed: Math.round(day.speed),
        conditions: day.weather[0].main,
        icon: day.weather[0].icon
      }));
    } catch (error) {
      console.error('Error fetching forecast:', error);
      return this.getMockForecast();
    }
  }

  /**
   * Calculate work restrictions based on weather conditions
   */
  calculateWorkRestrictions(weather: WeatherData): WorkRestrictions {
    const restrictions: string[] = [];
    let severity: WorkRestrictions['severity'] = 'none';

    const escalateSeverity = (
      current: WorkRestrictions['severity'],
      next: WorkRestrictions['severity']
    ): WorkRestrictions['severity'] => {
      const order: WorkRestrictions['severity'][] = ['none', 'advisory', 'warning', 'critical'];
      return order[Math.max(order.indexOf(current), order.indexOf(next))] as WorkRestrictions['severity'];
    };

    // Wind restrictions
    if (weather.windSpeed >= 35 || weather.windGust >= 40) {
      restrictions.push('All crane operations suspended - Wind exceeds 35 mph');
      restrictions.push('Aerial lift operations suspended');
      severity = escalateSeverity(severity, 'critical');
    } else if (weather.windSpeed >= 25 || weather.windGust >= 30) {
      restrictions.push('Crane operations restricted - Reduce loads by 25%');
      restrictions.push('No helicopter operations');
      severity = escalateSeverity(severity, 'warning');
    } else if (weather.windSpeed >= 20) {
      restrictions.push('Monitor crane operations closely');
      severity = escalateSeverity(severity, 'advisory');
    }

    // Lightning restrictions
    if (weather.lightningRisk) {
      restrictions.push('ALL OUTDOOR WORK SUSPENDED - Lightning detected');
      restrictions.push('Seek shelter immediately');
      restrictions.push('No work on energized equipment');
      severity = escalateSeverity(severity, 'critical');
    }

    // Temperature restrictions
    if (weather.temperature <= 10) {
      restrictions.push('Cold weather procedures in effect');
      restrictions.push('No concrete pouring below 32°F without heating');
      restrictions.push('Increased break frequency required');
      severity = escalateSeverity(severity, 'advisory');
    } else if (weather.temperature >= 95) {
      restrictions.push('Heat illness prevention plan activated');
      restrictions.push('Mandatory shade and water breaks every hour');
      restrictions.push('Monitor workers for heat stress');
      severity = escalateSeverity(severity, 'warning');
    }

    // Visibility restrictions
    if (weather.visibility < 0.25) {
      restrictions.push('Heavy equipment operations suspended - Low visibility');
      restrictions.push('No crane operations');
      severity = escalateSeverity(severity, 'warning');
    } else if (weather.visibility < 0.5) {
      restrictions.push('Reduced speed for all equipment');
      restrictions.push('Spotters required for equipment movement');
      severity = escalateSeverity(severity, 'advisory');
    }

    // Ice/Snow restrictions
    if (weather.snowDepth > 0 || (weather.precipitation > 0 && weather.temperature <= 32)) {
      restrictions.push('Ice/snow conditions - Fall protection required');
      restrictions.push('De-icing required before climbing');
      restrictions.push('No work on energized equipment');
      severity = escalateSeverity(severity, 'advisory');
    }

    // Rain restrictions
    if (weather.precipitation > 0.5) {
      restrictions.push('No energized work during heavy rain');
      restrictions.push('Excavation work suspended - Monitor for cave-ins');
      severity = escalateSeverity(severity, 'advisory');
    }

    return {
      craneOperations: weather.windSpeed < 35 && !weather.lightningRisk && weather.visibility >= 0.25,
      aerialLifts: weather.windSpeed < 35 && !weather.lightningRisk,
      concretePouring: weather.temperature > 32 && weather.temperature < 90,
      welding: !weather.lightningRisk && weather.precipitation < 0.5,
      energizedWork: !weather.lightningRisk && weather.precipitation < 0.1 && weather.windSpeed < 25,
      helicopterOperations: weather.windSpeed < 25 && weather.visibility >= 1 && !weather.lightningRisk,
      restrictions,
      severity
    };
  }

  /**
   * Check for lightning risk based on weather conditions
   */
  private checkLightningRisk(weatherData: any): boolean {
    // Check for thunderstorm conditions
    const thunderstormCodes = [200, 201, 202, 210, 211, 212, 221, 230, 231, 232];
    return thunderstormCodes.includes(weatherData.weather[0].id);
  }

  /**
   * Get lightning detection data
   */
  async getLightningData(lat: number, lon: number): Promise<{ detected: boolean; distance?: number }> {
    // This would integrate with a lightning detection service like Earth Networks
    // For now, returning mock data
    return {
      detected: false,
      distance: undefined
    };
  }

  /**
   * Get weather alerts for the area
   */
  async getWeatherAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
    // This would call a weather alerts API
    // Using mock data for demonstration
    return [];
  }

  /**
   * Start automatic weather updates
   */
  startWeatherMonitoring(lat: number, lon: number, callback: (data: WeatherData, restrictions: WorkRestrictions) => void): void {
    // Initial fetch
    this.getCurrentWeather(lat, lon).then(weather => {
      if (weather) {
        const restrictions = this.calculateWorkRestrictions(weather);
        callback(weather, restrictions);
      }
    });

    // Set up interval updates
    this.updateTimer = setInterval(async () => {
      const weather = await this.getCurrentWeather(lat, lon);
      if (weather) {
        const restrictions = this.calculateWorkRestrictions(weather);
        callback(weather, restrictions);
        
        // Check for critical conditions and send alerts
        if (restrictions.severity === 'critical') {
          await this.sendWeatherAlert(weather, restrictions);
        }
      }
    }, this.updateInterval);
  }

  /**
   * Stop weather monitoring
   */
  stopWeatherMonitoring(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  /**
   * Send weather alert to crew
   */
  private async sendWeatherAlert(weather: WeatherData, restrictions: WorkRestrictions): Promise<void> {
    try {
      const alertMessage = {
        type: 'weather_alert',
        severity: restrictions.severity,
        conditions: weather.conditions,
        windSpeed: weather.windSpeed,
        lightningDetected: weather.lightningRisk,
        restrictions: restrictions.restrictions,
        timestamp: new Date().toISOString()
      };

      // Save to database
      const { error } = await supabase
        .from('broadcast_messages')
        .insert({
          title: 'WEATHER ALERT',
          message: restrictions.restrictions.join('\n'),
          broadcast_type: 'weather',
          severity: restrictions.severity === 'critical' ? 'critical' : 'warning',
          target_all: true,
          send_immediately: true,
          expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4 hours
        });

      if (error) {
        console.error('Error sending weather alert:', error);
      }
    } catch (error) {
      console.error('Error in sendWeatherAlert:', error);
    }
  }

  /**
   * Get heat index
   */
  calculateHeatIndex(temp: number, humidity: number): number {
    if (temp < 80) return temp;
    
    const hi = -42.379 + 2.04901523 * temp + 10.14333127 * humidity 
      - 0.22475541 * temp * humidity - 0.00683783 * temp * temp 
      - 0.05481717 * humidity * humidity + 0.00122874 * temp * temp * humidity 
      + 0.00085282 * temp * humidity * humidity - 0.00000199 * temp * temp * humidity * humidity;
    
    return Math.round(hi);
  }

  /**
   * Get wind chill
   */
  calculateWindChill(temp: number, windSpeed: number): number {
    if (temp > 50 || windSpeed < 3) return temp;
    
    const wc = 35.74 + 0.6215 * temp - 35.75 * Math.pow(windSpeed, 0.16) 
      + 0.4275 * temp * Math.pow(windSpeed, 0.16);
    
    return Math.round(wc);
  }

  /**
   * Get mock weather data for development
   */
  private getMockWeatherData(): WeatherData {
    return {
      temperature: 75,
      feelsLike: 78,
      humidity: 65,
      windSpeed: 12,
      windGust: 18,
      windDirection: 180,
      pressure: 1013,
      visibility: 10,
      cloudCover: 40,
      precipitation: 0,
      snowDepth: 0,
      conditions: 'Partly Cloudy',
      icon: '02d',
      uvIndex: 6,
      lightningRisk: false,
      lightningDistance: undefined
    };
  }

  /**
   * Get mock forecast for development
   */
  private getMockForecast(): WeatherForecast[] {
    const today = new Date();
    return Array.from({ length: 5 }, (_, i) => ({
      datetime: new Date(today.getTime() + i * 24 * 60 * 60 * 1000).toISOString(),
      tempMax: 75 + Math.random() * 10,
      tempMin: 60 + Math.random() * 10,
      precipitation: Math.random() > 0.7 ? Math.random() * 2 : 0,
      windSpeed: 10 + Math.random() * 15,
      conditions: ['Clear', 'Partly Cloudy', 'Cloudy', 'Rain'][Math.floor(Math.random() * 4)],
      icon: '02d'
    }));
  }
}

// Export singleton instance
export const weatherService = new WeatherService();

// Export types
export type { WeatherData, WeatherForecast, WorkRestrictions, WeatherAlert };
