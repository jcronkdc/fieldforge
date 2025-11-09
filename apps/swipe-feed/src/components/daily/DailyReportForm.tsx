import React, { useState, useEffect } from 'react';
import {
  FileText,
  Users,
  Cloud,
  Truck,
  AlertTriangle,
  Clock,
  CheckSquare,
  Camera,
  MapPin,
  Thermometer,
  Wind,
  Droplets,
  Save,
  Send
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { locationService } from '../../lib/services/locationService';

interface ProductionItem {
  activityId: string;
  description: string;
  quantity: number;
  unit: string;
  location: string;
}

interface CrewMember {
  id: string;
  name: string;
  hours: number;
  overtime: number;
}

interface WeatherData {
  condition: string;
  tempHigh: number;
  tempLow: number;
  windSpeed: number;
  precipitation: number;
  weatherDelayHours: number;
}

export const DailyReportForm: React.FC = () => {
  const [reportDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<'day' | 'night'>('day');
  const [currentLocation, setCurrentLocation] = useState<string>('');
  
  const [formData, setFormData] = useState({
    // Weather
    weather: {
      condition: '',
      tempHigh: 0,
      tempLow: 0,
      windSpeed: 0,
      precipitation: 0,
      weatherDelayHours: 0
    } as WeatherData,
    
    // Production
    production: [] as ProductionItem[],
    structuresSet: 0,
    polesSet: 0,
    foundationsPoured: 0,
    conductorStrungFt: 0,
    cablePulledFt: 0,
    
    // Crew
    crewCount: 0,
    crewHours: 0,
    overtimeHours: 0,
    crewMembers: [] as CrewMember[],
    
    // Safety
    safetyBriefingHeld: true,
    safetyTopics: [] as string[],
    safetyObservations: 0,
    nearMisses: 0,
    firstAidCases: 0,
    recordableIncidents: 0,
    stopWorkEvents: 0,
    
    // Notes
    accomplishments: '',
    issuesConcerns: '',
    nextShiftPriorities: '',
    
    // Photos
    photos: [] as File[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  useEffect(() => {
    // Get current location
    locationService.getCurrentLocation().then(location => {
      locationService.reverseGeocode(location).then(address => {
        setCurrentLocation(address);
      });
    });
  }, []);

  const addProductionItem = () => {
    setFormData(prev => ({
      ...prev,
      production: [
        ...prev.production,
        {
          activityId: Date.now().toString(),
          description: '',
          quantity: 0,
          unit: '',
          location: currentLocation
        }
      ]
    }));
  };

  const updateProductionItem = (index: number, field: keyof ProductionItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      production: prev.production.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeProductionItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      production: prev.production.filter((_, i) => i !== index)
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...Array.from(files)]
      }));
    }
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (isDraft) {
      setIsSavingDraft(true);
    } else {
      setIsSubmitting(true);
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const reportData = {
        report_date: reportDate,
        shift: shift,
        foreman_id: userData.user?.id,
        
        // Weather
        weather_am: formData.weather.condition,
        temp_high_f: formData.weather.tempHigh,
        temp_low_f: formData.weather.tempLow,
        wind_speed_mph: formData.weather.windSpeed,
        precipitation_inches: formData.weather.precipitation,
        weather_delay_hours: formData.weather.weatherDelayHours,
        
        // Production
        work_completed: formData.production,
        structures_set: formData.structuresSet,
        poles_set: formData.polesSet,
        foundations_poured: formData.foundationsPoured,
        conductor_strung_ft: formData.conductorStrungFt,
        cable_pulled_ft: formData.cablePulledFt,
        
        // Crew
        crew_count: formData.crewCount,
        crew_hours: formData.crewHours,
        overtime_hours: formData.overtimeHours,
        crew_members: formData.crewMembers,
        
        // Safety
        safety_briefing_held: formData.safetyBriefingHeld,
        safety_topics_covered: formData.safetyTopics,
        safety_observations: formData.safetyObservations,
        near_misses: formData.nearMisses,
        first_aid_cases: formData.firstAidCases,
        recordable_incidents: formData.recordableIncidents,
        stop_work_events: formData.stopWorkEvents,
        
        // Notes
        accomplishments: formData.accomplishments,
        issues_concerns: formData.issuesConcerns,
        next_shift_priorities: formData.nextShiftPriorities,
        
        // Status
        submitted_by: userData.user?.id,
        submitted_at: isDraft ? null : new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('daily_reports')
        .insert(reportData);

      if (error) throw error;

      alert(isDraft ? 'Draft saved successfully!' : 'Daily report submitted successfully!');
      
      if (!isDraft) {
        // Reset form or redirect
      }
    } catch (error) {
      console.error('Error saving daily report:', error);
      alert('Error saving report. Please try again.');
    } finally {
      setIsSavingDraft(false);
      setIsSubmitting(false);
    }
  };

  const commonSafetyTopics = [
    'Arc Flash Hazards',
    'Fall Protection',
    'Excavation Safety',
    'Crane Operations',
    'Electrical Safety',
    'Lock Out Tag Out',
    'Heat Illness Prevention',
    'PPE Requirements',
    'Emergency Procedures',
    'Job Hazard Analysis'
  ];

  const weatherConditions = [
    'Clear', 'Partly Cloudy', 'Cloudy', 'Rain', 'Snow', 'Fog', 'Windy', 'Stormy'
  ];

  return (
    <div className="bg-gray-900 rounded-lg p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <FileText className="w-6 h-6 text-yellow-500" />
          Daily Report - {new Date(reportDate).toLocaleDateString()}
        </h2>
        <div className="flex items-center gap-4 text-gray-400">
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {currentLocation || 'Getting location...'}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {shift === 'day' ? 'Day Shift' : 'Night Shift'}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Weather Section */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-400" />
            Weather Conditions
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Conditions</label>
              <select
                value={formData.weather.condition}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  weather: { ...prev.weather, condition: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
              >
                <option value="">Select...</option>
                {weatherConditions.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                <Thermometer className="inline w-3 h-3 mr-1" />
                High Temp (°F)
              </label>
              <input
                type="number"
                value={formData.weather.tempHigh}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  weather: { ...prev.weather, tempHigh: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                <Thermometer className="inline w-3 h-3 mr-1" />
                Low Temp (°F)
              </label>
              <input
                type="number"
                value={formData.weather.tempLow}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  weather: { ...prev.weather, tempLow: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                <Wind className="inline w-3 h-3 mr-1" />
                Wind Speed (mph)
              </label>
              <input
                type="number"
                value={formData.weather.windSpeed}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  weather: { ...prev.weather, windSpeed: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                <Droplets className="inline w-3 h-3 mr-1" />
                Precipitation (in)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.weather.precipitation}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  weather: { ...prev.weather, precipitation: parseFloat(e.target.value) }
                }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Weather Delay (hrs)</label>
              <input
                type="number"
                step="0.5"
                value={formData.weather.weatherDelayHours}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  weather: { ...prev.weather, weatherDelayHours: parseFloat(e.target.value) }
                }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Production Section */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-green-400" />
              Production
            </h3>
            <button
              onClick={addProductionItem}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-black rounded-md text-sm"
            >
              Add Item
            </button>
          </div>

          {formData.production.map((item, index) => (
            <div key={item.activityId} className="bg-gray-700 rounded-lg p-3 mb-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateProductionItem(index, 'description', e.target.value)}
                    placeholder="Work description"
                    className="w-full px-2 py-1 bg-gray-600 text-white rounded-md"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateProductionItem(index, 'quantity', parseFloat(e.target.value))}
                    placeholder="Quantity"
                    className="w-full px-2 py-1 bg-gray-600 text-white rounded-md"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => updateProductionItem(index, 'unit', e.target.value)}
                    placeholder="Unit"
                    className="w-full px-2 py-1 bg-gray-600 text-white rounded-md"
                  />
                  <button
                    onClick={() => removeProductionItem(index)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Structures Set</label>
              <input
                type="number"
                value={formData.structuresSet}
                onChange={(e) => setFormData(prev => ({ ...prev, structuresSet: parseInt(e.target.value) }))}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Poles Set</label>
              <input
                type="number"
                value={formData.polesSet}
                onChange={(e) => setFormData(prev => ({ ...prev, polesSet: parseInt(e.target.value) }))}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Foundations Poured</label>
              <input
                type="number"
                value={formData.foundationsPoured}
                onChange={(e) => setFormData(prev => ({ ...prev, foundationsPoured: parseInt(e.target.value) }))}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Conductor (ft)</label>
              <input
                type="number"
                value={formData.conductorStrungFt}
                onChange={(e) => setFormData(prev => ({ ...prev, conductorStrungFt: parseFloat(e.target.value) }))}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Cable Pulled (ft)</label>
              <input
                type="number"
                value={formData.cablePulledFt}
                onChange={(e) => setFormData(prev => ({ ...prev, cablePulledFt: parseFloat(e.target.value) }))}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Crew Section */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Crew Information
          </h3>
          
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Crew Count</label>
              <input
                type="number"
                value={formData.crewCount}
                onChange={(e) => setFormData(prev => ({ ...prev, crewCount: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Total Hours</label>
              <input
                type="number"
                step="0.5"
                value={formData.crewHours}
                onChange={(e) => setFormData(prev => ({ ...prev, crewHours: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Overtime Hours</label>
              <input
                type="number"
                step="0.5"
                value={formData.overtimeHours}
                onChange={(e) => setFormData(prev => ({ ...prev, overtimeHours: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Safety Section */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Safety
          </h3>
          
          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.safetyBriefingHeld}
                onChange={(e) => setFormData(prev => ({ ...prev, safetyBriefingHeld: e.target.checked }))}
                className="rounded text-yellow-600"
              />
              <span className="text-gray-300">Safety Briefing Conducted</span>
            </label>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Topics Covered</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {commonSafetyTopics.map(topic => (
                <label key={topic} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.safetyTopics.includes(topic)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          safetyTopics: [...prev.safetyTopics, topic]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          safetyTopics: prev.safetyTopics.filter(t => t !== topic)
                        }));
                      }
                    }}
                    className="rounded text-yellow-600"
                  />
                  <span className="text-sm text-gray-300">{topic}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Observations</label>
              <input
                type="number"
                value={formData.safetyObservations}
                onChange={(e) => setFormData(prev => ({ ...prev, safetyObservations: parseInt(e.target.value) }))}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Near Misses</label>
              <input
                type="number"
                value={formData.nearMisses}
                onChange={(e) => setFormData(prev => ({ ...prev, nearMisses: parseInt(e.target.value) }))}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">First Aid</label>
              <input
                type="number"
                value={formData.firstAidCases}
                onChange={(e) => setFormData(prev => ({ ...prev, firstAidCases: parseInt(e.target.value) }))}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Recordables</label>
              <input
                type="number"
                value={formData.recordableIncidents}
                onChange={(e) => setFormData(prev => ({ ...prev, recordableIncidents: parseInt(e.target.value) }))}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Notes & Comments</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Today's Accomplishments</label>
              <textarea
                value={formData.accomplishments}
                onChange={(e) => setFormData(prev => ({ ...prev, accomplishments: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                rows={3}
                placeholder="Key accomplishments and milestones..."
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Issues & Concerns</label>
              <textarea
                value={formData.issuesConcerns}
                onChange={(e) => setFormData(prev => ({ ...prev, issuesConcerns: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                rows={3}
                placeholder="Any issues or concerns that need attention..."
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Next Shift Priorities</label>
              <textarea
                value={formData.nextShiftPriorities}
                onChange={(e) => setFormData(prev => ({ ...prev, nextShiftPriorities: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                rows={3}
                placeholder="Priority items for the next shift..."
              />
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-400" />
            Photo Documentation
          </h3>
          
          <div className="flex items-center gap-4">
            <label className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md cursor-pointer transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              Select Photos
            </label>
            <span className="text-gray-400">
              {formData.photos.length} photo(s) selected
            </span>
          </div>
          
          {formData.photos.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Photo ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <button
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        photos: prev.photos.filter((_, i) => i !== index)
                      }));
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isSavingDraft}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSavingDraft ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
};
