/**
 * WEATHER API INTEGRATION FOR CONSTRUCTION AI
 * Real-time weather and forecasts using OpenWeatherMap API
 * Provides construction-specific weather analysis and impact assessment
 */

import axios from 'axios';
import { query } from '../database.js';
import Anthropic from '@anthropic-ai/sdk';

// Weather API configuration
const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';
const GEOCODING_API_BASE = 'https://api.openweathermap.org/geo/1.0';

// Get Anthropic client if available
let anthropicClient: Anthropic | null = null;
try {
  if (process.env.ANTHROPIC_API_KEY) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
} catch (error) {
  console.warn('[Weather] Anthropic not available for weather analysis');
}

/**
 * Get current weather by zip code
 */
export async function getCurrentWeather(zipCode: string, country: string = 'US'): Promise<any> {
  if (!WEATHER_API_KEY) {
    console.warn('[Weather] OPENWEATHER_API_KEY not configured');
    return generateFallbackWeather(zipCode, 'current');
  }
  
  try {
    // Get coordinates from zip code
    const geoResponse = await axios.get(`${GEOCODING_API_BASE}/zip`, {
      params: {
        zip: `${zipCode},${country}`,
        appid: WEATHER_API_KEY
      },
      timeout: 10000
    });
    
    const { lat, lon, name } = geoResponse.data;
    
    // Get current weather
    const weatherResponse = await axios.get(`${WEATHER_API_BASE}/weather`, {
      params: {
        lat,
        lon,
        appid: WEATHER_API_KEY,
        units: 'imperial' // Fahrenheit for US construction
      },
      timeout: 10000
    });
    
    const data = weatherResponse.data;
    
    return {
      location: {
        name,
        zipCode,
        coordinates: { lat, lon }
      },
      current: {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: Math.round(data.wind.speed),
        windDirection: data.wind.deg,
        visibility: Math.round(data.visibility / 1609.34), // Convert meters to miles
        conditions: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        cloudCover: data.clouds.all,
        sunrise: new Date(data.sys.sunrise * 1000).toISOString(),
        sunset: new Date(data.sys.sunset * 1000).toISOString()
      },
      constructionImpact: assessConstructionImpact(data),
      timestamp: new Date().toISOString(),
      source: 'OpenWeatherMap'
    };
  } catch (error: any) {
    console.error('[Weather] API error:', error.response?.data || error.message);
    return generateFallbackWeather(zipCode, 'current');
  }
}

/**
 * Get weather forecast by zip code
 */
export async function getWeatherForecast(zipCode: string, country: string = 'US', days: number = 5): Promise<any> {
  if (!WEATHER_API_KEY) {
    console.warn('[Weather] OPENWEATHER_API_KEY not configured');
    return generateFallbackWeather(zipCode, 'forecast', days);
  }
  
  try {
    // Get coordinates from zip code
    const geoResponse = await axios.get(`${GEOCODING_API_BASE}/zip`, {
      params: {
        zip: `${zipCode},${country}`,
        appid: WEATHER_API_KEY
      },
      timeout: 10000
    });
    
    const { lat, lon, name } = geoResponse.data;
    
    // Get 5-day forecast (3-hour intervals)
    const forecastResponse = await axios.get(`${WEATHER_API_BASE}/forecast`, {
      params: {
        lat,
        lon,
        appid: WEATHER_API_KEY,
        units: 'imperial'
      },
      timeout: 10000
    });
    
    const data = forecastResponse.data;
    
    // Process forecast data
    const dailyForecasts = processForecastData(data.list, days);
    
    return {
      location: {
        name,
        zipCode,
        coordinates: { lat, lon }
      },
      forecast: dailyForecasts,
      workabilityScore: calculateWorkabilityScore(dailyForecasts),
      alerts: generateWeatherAlerts(dailyForecasts),
      recommendations: generateConstructionRecommendations(dailyForecasts),
      timestamp: new Date().toISOString(),
      source: 'OpenWeatherMap'
    };
  } catch (error: any) {
    console.error('[Weather] Forecast API error:', error.response?.data || error.message);
    return generateFallbackWeather(zipCode, 'forecast', days);
  }
}

/**
 * Get weather for project location
 */
export async function getProjectWeather(projectId: string, includeForecast: boolean = false): Promise<any> {
  try {
    // Get project location
    const projectResult = await query(`
      SELECT project_number, name, location, city, state, zip_code
      FROM projects
      WHERE id = $1
      LIMIT 1
    `, [projectId]);
    
    if (projectResult.rows.length === 0) {
      throw new Error('Project not found');
    }
    
    const project = projectResult.rows[0];
    const zipCode = project.zip_code || extractZipFromLocation(project.location);
    
    if (!zipCode) {
      return {
        error: 'No zip code found for project',
        project: {
          id: projectId,
          name: project.name,
          location: project.location
        },
        note: 'Please add zip_code to project or include it in location field'
      };
    }
    
    // Get current weather
    const currentWeather = await getCurrentWeather(zipCode);
    
    if (includeForecast) {
      const forecast = await getWeatherForecast(zipCode);
      return {
        project: {
          id: projectId,
          number: project.project_number,
          name: project.name,
          location: project.location,
          zipCode
        },
        current: currentWeather,
        forecast: forecast.forecast,
        workabilityScore: forecast.workabilityScore,
        alerts: forecast.alerts,
        recommendations: forecast.recommendations,
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      project: {
        id: projectId,
        number: project.project_number,
        name: project.name,
        location: project.location,
        zipCode
      },
      ...currentWeather
    };
  } catch (error) {
    console.error('[Weather] Project weather error:', error);
    throw error;
  }
}

/**
 * AI-powered weather impact analysis for construction
 */
export async function analyzeWeatherImpact(zipCode: string | null, projectId: string | null, activities: string[] = []): Promise<any> {
  try {
    // Get weather data
    let forecast: any;
    if (projectId) {
      const projectWeather = await getProjectWeather(projectId, true);
      forecast = projectWeather.forecast || projectWeather;
    } else if (zipCode) {
      forecast = await getWeatherForecast(zipCode);
    } else {
      throw new Error('zipCode or projectId required');
    }
    
    // Build AI prompt
    const weatherData = JSON.stringify(forecast, null, 2);
    const activitiesText = activities.length > 0 
      ? `\n\nPlanned Activities:\n${activities.map((a, i) => `${i + 1}. ${a}`).join('\n')}`
      : '';
    
    if (anthropicClient) {
      const prompt = `You are a construction weather analyst. Analyze this weather forecast and provide actionable insights for construction work:

${weatherData}${activitiesText}

Provide:
1. **Weather Window Analysis**: Best days for work, days to avoid
2. **Activity-Specific Impact**: How weather affects different construction activities
3. **Safety Concerns**: Weather-related hazards (lightning, wind, heat, cold)
4. **Equipment Considerations**: Weather effects on equipment operation
5. **Material Protection**: Needs for material storage/protection
6. **Scheduling Recommendations**: Optimal work scheduling based on forecast
7. **Contingency Planning**: Backup plans for weather delays

Be specific with dates, temperatures, and construction activities. Focus on practical, actionable guidance for field teams.`;

      const response = await anthropicClient.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });
      
      const analysis = response.content[0].type === 'text' ? response.content[0].text : '';
      
      return {
        summary: analysis.substring(0, 500) + (analysis.length > 500 ? '...' : ''),
        fullAnalysis: analysis,
        forecast: forecast.forecast || forecast,
        workabilityScore: forecast.workabilityScore,
        alerts: forecast.alerts,
        recommendations: extractRecommendations(analysis),
        timestamp: new Date().toISOString(),
        aiModel: 'claude-sonnet-4'
      };
    }
    
    // Fallback analysis
    return generateFallbackWeatherAnalysis(forecast, activities);
    
  } catch (error) {
    console.error('[Weather] Analysis error:', error);
    throw error;
  }
}

/**
 * Process forecast data into daily summaries
 */
function processForecastData(forecastList: any[], days: number = 5): any[] {
  const dailyData: { [key: string]: any[] } = {};
  
  // Group by date
  forecastList.forEach((item: any) => {
    const date = new Date(item.dt * 1000).toISOString().split('T')[0];
    if (!dailyData[date]) {
      dailyData[date] = [];
    }
    dailyData[date].push(item);
  });
  
  // Create daily summaries
  const dailyForecasts = Object.keys(dailyData).slice(0, days).map(date => {
    const dayData = dailyData[date];
    
    // Calculate daily stats
    const temps = dayData.map(d => d.main.temp);
    const high = Math.round(Math.max(...temps));
    const low = Math.round(Math.min(...temps));
    
    // Find dominant conditions
    const conditions = dayData.map(d => d.weather[0].main);
    const dominantCondition = conditions.sort((a, b) =>
      conditions.filter(v => v === a).length - conditions.filter(v => v === b).length
    ).pop();
    
    // Calculate precipitation probability
    const precipProb = Math.max(...dayData.map(d => d.pop || 0)) * 100;
    
    // Average wind speed
    const avgWind = Math.round(dayData.reduce((sum, d) => sum + d.wind.speed, 0) / dayData.length);
    const maxWind = Math.round(Math.max(...dayData.map(d => d.wind.speed)));
    
    // Average humidity
    const avgHumidity = Math.round(dayData.reduce((sum, d) => sum + d.main.humidity, 0) / dayData.length);
    
    return {
      date,
      dayOfWeek: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
      high,
      low,
      conditions: dominantCondition,
      description: dayData[0].weather[0].description,
      icon: dayData[0].weather[0].icon,
      precipProbability: Math.round(precipProb),
      windSpeed: avgWind,
      maxWindSpeed: maxWind,
      humidity: avgHumidity,
      workability: assessWorkability(high, low, dominantCondition, avgWind, precipProb),
      constructionConcerns: identifyConstructionConcerns(high, low, dominantCondition, avgWind, precipProb)
    };
  });
  
  return dailyForecasts;
}

/**
 * Assess construction impact from current weather
 */
function assessConstructionImpact(weatherData: any): any {
  const temp = weatherData.main.temp;
  const windSpeed = weatherData.wind.speed;
  const conditions = weatherData.weather[0].main;
  
  const impact = {
    workable: true,
    score: 100,
    concerns: [] as string[],
    restrictions: [] as string[]
  };
  
  // Temperature impacts
  if (temp < 32) {
    impact.score -= 30;
    impact.concerns.push('Freezing temperatures - concrete work not recommended');
    impact.restrictions.push('No concrete pours below 40°F without protection');
  } else if (temp < 40) {
    impact.score -= 15;
    impact.concerns.push('Cold weather - concrete requires protection');
  } else if (temp > 95) {
    impact.score -= 20;
    impact.concerns.push('Extreme heat - increased heat stress risk');
    impact.restrictions.push('Implement heat illness prevention program');
  }
  
  // Wind impacts
  if (windSpeed > 30) {
    impact.workable = false;
    impact.score = 0;
    impact.concerns.push('HIGH WIND WARNING - Cease crane operations');
    impact.restrictions.push('No crane lifts above 30 mph wind');
  } else if (windSpeed > 20) {
    impact.score -= 25;
    impact.concerns.push('High winds - crane operations restricted');
    impact.restrictions.push('Extra rigging precautions required');
  }
  
  // Precipitation impacts
  if (conditions === 'Rain' || conditions === 'Snow') {
    impact.score -= 20;
    impact.concerns.push(`Active ${conditions.toLowerCase()} - outdoor work limited`);
    impact.restrictions.push('No concrete pours during precipitation');
  } else if (conditions === 'Thunderstorm') {
    impact.workable = false;
    impact.score = 0;
    impact.concerns.push('THUNDERSTORM - Cease outdoor work immediately');
    impact.restrictions.push('Lightning protocol: 6-mile rule, 30-minute wait');
  }
  
  return impact;
}

/**
 * Assess daily workability
 */
function assessWorkability(high: number, low: number, conditions: string, windSpeed: number, precipProb: number): string {
  let score = 100;
  
  if (conditions === 'Thunderstorm') return 'UNSAFE';
  if (precipProb > 70) score -= 30;
  if (windSpeed > 20) score -= 25;
  if (high > 95 || low < 32) score -= 20;
  if (conditions === 'Rain' || conditions === 'Snow') score -= 15;
  
  if (score >= 80) return 'EXCELLENT';
  if (score >= 60) return 'GOOD';
  if (score >= 40) return 'FAIR';
  if (score >= 20) return 'POOR';
  return 'UNSAFE';
}

/**
 * Identify construction concerns
 */
function identifyConstructionConcerns(high: number, low: number, conditions: string, windSpeed: number, precipProb: number): string[] {
  const concerns: string[] = [];
  
  if (conditions === 'Thunderstorm') concerns.push('⚠️ Lightning hazard - outdoor work prohibited');
  if (precipProb > 50) concerns.push('☔ High precipitation chance - plan indoor work');
  if (windSpeed > 15) concerns.push('💨 Elevated winds - crane operations may be restricted');
  if (high > 90) concerns.push('🌡️ Heat stress risk - increase water breaks');
  if (low < 40) concerns.push('❄️ Cold temperatures - protect concrete work');
  if (conditions === 'Rain') concerns.push('🌧️ Wet conditions - slip/fall hazards');
  if (conditions === 'Snow') concerns.push('🌨️ Snow - equipment operation challenges');
  
  return concerns;
}

/**
 * Calculate overall workability score
 */
function calculateWorkabilityScore(dailyForecasts: any[]): any {
  const scores = dailyForecasts.map(day => {
    switch (day.workability) {
      case 'EXCELLENT': return 100;
      case 'GOOD': return 75;
      case 'FAIR': return 50;
      case 'POOR': return 25;
      case 'UNSAFE': return 0;
      default: return 50;
    }
  });
  
  const avgScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
  const workableDays = dailyForecasts.filter(d => d.workability !== 'UNSAFE' && d.workability !== 'POOR').length;
  
  return {
    score: avgScore,
    workableDays,
    totalDays: dailyForecasts.length,
    rating: avgScore >= 80 ? 'EXCELLENT' : avgScore >= 60 ? 'GOOD' : avgScore >= 40 ? 'FAIR' : 'POOR'
  };
}

/**
 * Generate weather alerts
 */
function generateWeatherAlerts(dailyForecasts: any[]): string[] {
  const alerts: string[] = [];
  
  dailyForecasts.forEach(day => {
    if (day.workability === 'UNSAFE') {
      alerts.push(`⚠️ ${day.dayOfWeek} (${day.date}): ${day.conditions} - UNSAFE for outdoor work`);
    } else if (day.precipProbability > 70) {
      alerts.push(`🌧️ ${day.dayOfWeek} (${day.date}): ${day.precipProbability}% chance of precipitation`);
    } else if (day.maxWindSpeed > 20) {
      alerts.push(`💨 ${day.dayOfWeek} (${day.date}): Winds up to ${day.maxWindSpeed} mph - crane restrictions`);
    } else if (day.high > 95) {
      alerts.push(`🌡️ ${day.dayOfWeek} (${day.date}): High of ${day.high}°F - heat stress precautions`);
    } else if (day.low < 32) {
      alerts.push(`❄️ ${day.dayOfWeek} (${day.date}): Low of ${day.low}°F - freezing conditions`);
    }
  });
  
  return alerts;
}

/**
 * Generate construction recommendations
 */
function generateConstructionRecommendations(dailyForecasts: any[]): string[] {
  const recommendations: string[] = [];
  
  const excellentDays = dailyForecasts.filter(d => d.workability === 'EXCELLENT');
  const poorDays = dailyForecasts.filter(d => d.workability === 'POOR' || d.workability === 'UNSAFE');
  
  if (excellentDays.length > 0) {
    const dates = excellentDays.map(d => d.dayOfWeek).join(', ');
    recommendations.push(`✅ Optimal work days: ${dates} - schedule critical outdoor activities`);
  }
  
  if (poorDays.length > 0) {
    const dates = poorDays.map(d => d.dayOfWeek).join(', ');
    recommendations.push(`⚠️ Challenging days: ${dates} - plan indoor work or contingency activities`);
  }
  
  const highPrecipDays = dailyForecasts.filter(d => d.precipProbability > 50);
  if (highPrecipDays.length > 0) {
    recommendations.push('☔ Prepare weather protection for materials and equipment');
  }
  
  const coldDays = dailyForecasts.filter(d => d.low < 40);
  if (coldDays.length > 0) {
    recommendations.push('❄️ Cold weather concrete protection required (blankets, heaters)');
  }
  
  const hotDays = dailyForecasts.filter(d => d.high > 90);
  if (hotDays.length > 0) {
    recommendations.push('🌡️ Implement heat illness prevention: water, shade, frequent breaks');
  }
  
  const windyDays = dailyForecasts.filter(d => d.maxWindSpeed > 15);
  if (windyDays.length > 0) {
    recommendations.push('💨 Coordinate crane operations - monitor real-time wind speeds');
  }
  
  return recommendations;
}

/**
 * Extract recommendations from AI analysis
 */
function extractRecommendations(analysis: string): string[] {
  const recommendations: string[] = [];
  
  // Look for numbered lists
  const numberedPattern = /\d+\.\s+\*?\*?([^\n]+)\*?\*?/g;
  let match;
  while ((match = numberedPattern.exec(analysis)) !== null) {
    if (match[1].length > 10) {
      recommendations.push(match[1].trim());
    }
  }
  
  // Look for bullet points
  const bulletPattern = /[-•*]\s+\*?\*?([^\n]+)\*?\*?/g;
  while ((match = bulletPattern.exec(analysis)) !== null) {
    if (match[1].length > 10 && recommendations.length < 10) {
      recommendations.push(match[1].trim());
    }
  }
  
  return recommendations.slice(0, 8);
}

/**
 * Extract zip code from location string
 */
function extractZipFromLocation(location: string): string | null {
  if (!location) return null;
  
  // Look for 5-digit zip code
  const zipMatch = location.match(/\b\d{5}\b/);
  return zipMatch ? zipMatch[0] : null;
}

/**
 * Fallback weather when API unavailable
 */
function generateFallbackWeather(zipCode: string, type: string, days: number = 5): any {
  const baseResponse = {
    location: {
      name: 'Location',
      zipCode
    },
    note: 'Real-time weather available with OPENWEATHER_API_KEY configuration. Get free key at https://openweathermap.org/api',
    source: 'fallback'
  };
  
  if (type === 'current') {
    return {
      ...baseResponse,
      current: {
        temperature: 72,
        feelsLike: 70,
        humidity: 55,
        windSpeed: 8,
        conditions: 'Clear',
        description: 'Sample weather data - configure OPENWEATHER_API_KEY for real-time data'
      },
      constructionImpact: {
        workable: true,
        score: 85,
        concerns: ['Configure OPENWEATHER_API_KEY for real-time weather monitoring'],
        restrictions: []
      }
    };
  }
  
  if (type === 'forecast') {
    const forecast = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      forecast.push({
        date: date.toISOString().split('T')[0],
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
        high: 75 + Math.floor(Math.random() * 10),
        low: 55 + Math.floor(Math.random() * 10),
        conditions: 'Clear',
        workability: 'GOOD',
        constructionConcerns: []
      });
    }
    
    return {
      ...baseResponse,
      forecast,
      workabilityScore: { score: 80, rating: 'GOOD', workableDays: days, totalDays: days },
      alerts: [],
      recommendations: [
        'Configure OPENWEATHER_API_KEY for real-time weather forecasts',
        'Get free API key at https://openweathermap.org/api',
        'Add key to Vercel environment variables'
      ]
    };
  }
  
  return baseResponse;
}

/**
 * Fallback weather analysis
 */
function generateFallbackWeatherAnalysis(forecast: any, activities: string[]): any {
  return {
    summary: 'Weather analysis completed. Configure ANTHROPIC_API_KEY for AI-powered construction weather insights.',
    fullAnalysis: `**Weather Forecast Analysis**

${forecast.forecast ? forecast.forecast.length : 0} days of weather data available.

**Basic Analysis:**
- Configure ANTHROPIC_API_KEY for advanced AI weather analysis
- Configure OPENWEATHER_API_KEY for real-time weather data
- AI will provide activity-specific recommendations
- Safety alerts based on weather conditions
- Optimal work scheduling suggestions

**Current Data:**
${JSON.stringify(forecast.workabilityScore || {}, null, 2)}

Get API keys:
- OpenWeatherMap: https://openweathermap.org/api (FREE tier available)
- Anthropic Claude: https://console.anthropic.com/settings/keys

Add to Vercel environment variables for full functionality.`,
    forecast: forecast.forecast || forecast,
    workabilityScore: forecast.workabilityScore,
    alerts: forecast.alerts || [],
    recommendations: forecast.recommendations || [],
    timestamp: new Date().toISOString(),
    aiModel: 'fallback',
    note: 'Configure ANTHROPIC_API_KEY and OPENWEATHER_API_KEY for advanced weather analysis'
  };
}

