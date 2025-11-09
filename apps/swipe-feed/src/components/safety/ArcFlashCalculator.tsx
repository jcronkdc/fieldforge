import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  Shield, 
  Calculator,
  Info,
  Download,
  Save
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ArcFlashResult {
  incidentEnergy: number; // cal/cm²
  arcFlashBoundary: number; // inches
  ppeCategory: number; // 1-4
  workingDistance: number; // inches
  limitedApproach: number; // feet
  restrictedApproach: number; // feet
  prohibitedApproach: number; // feet
}

interface PPERequirement {
  category: number;
  minCalRating: number;
  description: string;
  equipment: string[];
}

export const ArcFlashCalculator: React.FC = () => {
  const [formData, setFormData] = useState({
    equipmentId: '',
    equipmentName: '',
    voltageLevel: 13800, // Volts
    faultCurrent: 20000, // Amps
    clearingTime: 0.5, // Seconds
    workingDistance: 36, // Inches
    enclosureType: 'open', // open, box
    electrodeMaterial: 'copper',
    gapBetweenConductors: 32 // mm
  });

  const [result, setResult] = useState<ArcFlashResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const ppeRequirements: PPERequirement[] = [
    {
      category: 1,
      minCalRating: 4,
      description: 'Arc-Rated PPE Category 1',
      equipment: [
        'Arc-rated long-sleeve shirt and pants (minimum 4 cal/cm²)',
        'Arc-rated face shield or arc flash suit hood',
        'Safety glasses',
        'Hearing protection',
        'Leather gloves',
        'Leather work boots'
      ]
    },
    {
      category: 2,
      minCalRating: 8,
      description: 'Arc-Rated PPE Category 2',
      equipment: [
        'Arc-rated long-sleeve shirt and pants (minimum 8 cal/cm²)',
        'Arc-rated face shield and arc-rated balaclava or arc flash suit hood',
        'Safety glasses',
        'Hearing protection',
        'Leather gloves',
        'Leather work boots'
      ]
    },
    {
      category: 3,
      minCalRating: 25,
      description: 'Arc-Rated PPE Category 3',
      equipment: [
        'Arc-rated shirt and pants and arc-rated coveralls (minimum 25 cal/cm²)',
        'Arc-rated arc flash suit hood',
        'Arc-rated gloves',
        'Safety glasses',
        'Hearing protection',
        'Leather work boots'
      ]
    },
    {
      category: 4,
      minCalRating: 40,
      description: 'Arc-Rated PPE Category 4',
      equipment: [
        'Arc-rated shirt and pants and arc-rated coveralls (minimum 40 cal/cm²)',
        'Arc-rated arc flash suit hood',
        'Arc-rated gloves',
        'Safety glasses',
        'Hearing protection',
        'Leather work boots'
      ]
    }
  ];

  const calculateArcFlash = () => {
    // IEEE 1584-2018 simplified calculation
    // This is a simplified version - actual calculations should use full IEEE 1584 methods
    
    const V = formData.voltageLevel / 1000; // Convert to kV
    const Ibf = formData.faultCurrent / 1000; // Convert to kA
    const T = formData.clearingTime;
    const D = formData.workingDistance * 25.4; // Convert to mm
    
    // Simplified arc current calculation
    const k = formData.enclosureType === 'open' ? -0.153 : -0.097;
    const Iarc = Math.pow(10, (k + 0.662 * Math.log10(Ibf) + 0.0966 * V + 0.000526 * formData.gapBetweenConductors));
    
    // Calculate incident energy (simplified)
    const Cf = formData.enclosureType === 'open' ? 1.0 : 1.5;
    const En = 4.184 * Cf * (Iarc * Iarc * T) / (D * D) * (610 / 600);
    
    // Arc flash boundary calculation (where incident energy = 1.2 cal/cm²)
    const Db = Math.sqrt((4.184 * Cf * Iarc * Iarc * T) / 1.2) * 39.37; // Convert to inches
    
    // Determine PPE category
    let ppeCategory = 0;
    if (En <= 1.2) ppeCategory = 0;
    else if (En <= 4) ppeCategory = 1;
    else if (En <= 8) ppeCategory = 2;
    else if (En <= 25) ppeCategory = 3;
    else if (En <= 40) ppeCategory = 4;
    else ppeCategory = 5; // Greater than 40 cal/cm² - no PPE available
    
    // Shock protection boundaries (NFPA 70E)
    let limitedApproach = 0;
    let restrictedApproach = 0;
    let prohibitedApproach = 0;
    
    if (V <= 0.75) {
      limitedApproach = 3.5;
      restrictedApproach = 1;
      prohibitedApproach = 0.08;
    } else if (V <= 5) {
      limitedApproach = 5;
      restrictedApproach = 2;
      prohibitedApproach = 0.33;
    } else if (V <= 15) {
      limitedApproach = 5;
      restrictedApproach = 2.17;
      prohibitedApproach = 0.58;
    } else if (V <= 36) {
      limitedApproach = 6;
      restrictedApproach = 2.67;
      prohibitedApproach = 0.92;
    } else if (V <= 46) {
      limitedApproach = 8;
      restrictedApproach = 2.75;
      prohibitedApproach = 1.25;
    } else if (V <= 72.5) {
      limitedApproach = 8;
      restrictedApproach = 3.25;
      prohibitedApproach = 1.67;
    } else if (V <= 121) {
      limitedApproach = 10;
      restrictedApproach = 3.75;
      prohibitedApproach = 2.08;
    } else if (V <= 145) {
      limitedApproach = 10;
      restrictedApproach = 4.5;
      prohibitedApproach = 2.75;
    } else if (V <= 169) {
      limitedApproach = 11;
      restrictedApproach = 5.25;
      prohibitedApproach = 3.58;
    } else if (V <= 242) {
      limitedApproach = 13;
      restrictedApproach = 8.5;
      prohibitedApproach = 5.25;
    } else if (V <= 362) {
      limitedApproach = 15;
      restrictedApproach = 12;
      prohibitedApproach = 8.58;
    } else if (V <= 550) {
      limitedApproach = 19;
      restrictedApproach = 14;
      prohibitedApproach = 10.67;
    } else if (V <= 800) {
      limitedApproach = 23;
      restrictedApproach = 18;
      prohibitedApproach = 14.42;
    }
    
    setResult({
      incidentEnergy: parseFloat(En.toFixed(2)),
      arcFlashBoundary: parseFloat(Db.toFixed(2)),
      ppeCategory: ppeCategory,
      workingDistance: formData.workingDistance,
      limitedApproach,
      restrictedApproach,
      prohibitedApproach
    });
  };

  const saveToDatabase = async () => {
    if (!result) return;
    
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('arc_flash_boundaries')
        .insert({
          equipment_id: formData.equipmentId,
          equipment_name: formData.equipmentName,
          voltage_level: `${formData.voltageLevel / 1000}kV`,
          available_fault_current: formData.faultCurrent,
          clearing_time: formData.clearingTime,
          incident_energy: result.incidentEnergy,
          arc_flash_boundary: result.arcFlashBoundary,
          working_distance: result.workingDistance,
          limited_approach: result.limitedApproach,
          restricted_approach: result.restrictedApproach,
          prohibited_approach: result.prohibitedApproach,
          required_ppe_category: result.ppeCategory,
          last_study_date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;
      
      alert('Arc flash data saved successfully!');
    } catch (error) {
      console.error('Error saving arc flash data:', error);
      alert('Error saving data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getPPERequirement = (category: number): PPERequirement | undefined => {
    return ppeRequirements.find(ppe => ppe.category === category);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          Arc Flash Calculator
        </h2>
        <p className="text-gray-400">
          Calculate arc flash incident energy and PPE requirements per IEEE 1584
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Parameters */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Equipment Parameters</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Equipment ID
            </label>
            <input
              type="text"
              value={formData.equipmentId}
              onChange={(e) => setFormData(prev => ({ ...prev, equipmentId: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-md"
              placeholder="e.g., CB-138-01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Equipment Name
            </label>
            <input
              type="text"
              value={formData.equipmentName}
              onChange={(e) => setFormData(prev => ({ ...prev, equipmentName: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-md"
              placeholder="e.g., Main 138kV Breaker"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              System Voltage (V)
            </label>
            <select
              value={formData.voltageLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, voltageLevel: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-md"
            >
              <option value="480">480V</option>
              <option value="4160">4.16kV</option>
              <option value="13800">13.8kV</option>
              <option value="34500">34.5kV</option>
              <option value="69000">69kV</option>
              <option value="138000">138kV</option>
              <option value="230000">230kV</option>
              <option value="345000">345kV</option>
              <option value="500000">500kV</option>
              <option value="765000">765kV</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Available Fault Current (A)
            </label>
            <input
              type="number"
              value={formData.faultCurrent}
              onChange={(e) => setFormData(prev => ({ ...prev, faultCurrent: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-md"
              placeholder="e.g., 20000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Clearing Time (seconds)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.clearingTime}
              onChange={(e) => setFormData(prev => ({ ...prev, clearingTime: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-md"
              placeholder="e.g., 0.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Working Distance (inches)
            </label>
            <input
              type="number"
              value={formData.workingDistance}
              onChange={(e) => setFormData(prev => ({ ...prev, workingDistance: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-md"
              placeholder="e.g., 36"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enclosure Type
            </label>
            <select
              value={formData.enclosureType}
              onChange={(e) => setFormData(prev => ({ ...prev, enclosureType: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-md"
            >
              <option value="open">Open Air</option>
              <option value="box">Enclosed/Box</option>
            </select>
          </div>

          <button
            onClick={calculateArcFlash}
            className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <Calculator className="w-4 h-4" />
            Calculate Arc Flash
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            <>
              <h3 className="text-lg font-semibold text-white">Calculation Results</h3>
              
              <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Incident Energy</p>
                    <p className={`text-2xl font-bold ${
                      result.incidentEnergy > 40 ? 'text-red-500' :
                      result.incidentEnergy > 8 ? 'text-orange-500' :
                      'text-yellow-500'
                    }`}>
                      {result.incidentEnergy} cal/cm²
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Arc Flash Boundary</p>
                    <p className="text-2xl font-bold text-white">
                      {result.arcFlashBoundary}" 
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-2">PPE Category</p>
                  <div className={`text-center py-2 px-3 rounded-md font-bold ${
                    result.ppeCategory > 4 ? 'bg-red-600 text-white' :
                    result.ppeCategory === 4 ? 'bg-orange-600 text-white' :
                    result.ppeCategory === 3 ? 'bg-yellow-600 text-black' :
                    result.ppeCategory === 2 ? 'bg-yellow-500 text-black' :
                    result.ppeCategory === 1 ? 'bg-green-600 text-white' :
                    'bg-green-500 text-white'
                  }`}>
                    {result.ppeCategory > 4 ? 'DANGER - No PPE Available' :
                     result.ppeCategory === 0 ? 'PPE Not Required' :
                     `Category ${result.ppeCategory}`}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-2">Shock Protection Boundaries</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Limited Approach:</span>
                      <span className="text-white">{result.limitedApproach} ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Restricted Approach:</span>
                      <span className="text-white">{result.restrictedApproach} ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Prohibited Approach:</span>
                      <span className="text-white">{result.prohibitedApproach} ft</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PPE Requirements */}
              {result.ppeCategory > 0 && result.ppeCategory <= 4 && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-yellow-500" />
                    Required PPE
                  </h4>
                  <div className="space-y-2">
                    {getPPERequirement(result.ppeCategory)?.equipment.map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-1">•</span>
                        <span className="text-sm text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warning Messages */}
              {result.incidentEnergy > 40 && (
                <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-300 font-medium">EXTREME DANGER</p>
                      <p className="text-gray-400 text-sm mt-1">
                        Incident energy exceeds 40 cal/cm². No PPE rated for this level.
                        Engineering controls must be implemented to reduce incident energy.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={saveToDatabase}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save to Database'}
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Generate Label
                </button>
              </div>
            </>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center h-full">
              <Info className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-gray-400 text-center">
                Enter equipment parameters and click "Calculate Arc Flash" to see results
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Information Panel */}
      <div className="mt-6 bg-blue-900/20 border border-blue-600/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-300 font-medium">Calculation Method</p>
            <p className="text-gray-400 text-sm mt-1">
              This calculator uses simplified IEEE 1584-2018 equations. For official arc flash studies,
              use certified software and have calculations verified by a qualified electrical engineer.
              Results should be field-verified and updated whenever system changes occur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
