import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  AlertCircle, 
  Lock, 
  Unlock,
  MapPin,
  Clock,
  User,
  CheckSquare
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface IsolationPoint {
  id: string;
  switchId: string;
  switchName: string;
  normalPosition: 'open' | 'closed';
  requiredPosition: 'open' | 'closed';
  tagNumber: string;
  verified: boolean;
}

interface GroundLocation {
  id: string;
  location: string;
  equipmentType: string;
  clusterNumber: string;
  installed: boolean;
}

export const SwitchingOrderForm: React.FC = () => {
  const [formData, setFormData] = useState({
    orderNumber: `SO-${new Date().getTime()}`,
    requestDate: new Date().toISOString().split('T')[0],
    affectedCircuits: [] as string[],
    isolationPoints: [] as IsolationPoint[],
    groundsRequired: [] as GroundLocation[],
    clearanceBoundaries: '',
    specialConditions: '',
    outageStart: '',
    outageEnd: '',
    testBeforeTouch: true,
    status: 'requested'
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    'Basic Information',
    'Isolation Points',
    'Grounding Requirements',
    'Clearance Boundaries',
    'Review & Submit'
  ];

  const addIsolationPoint = () => {
    const newPoint: IsolationPoint = {
      id: Date.now().toString(),
      switchId: '',
      switchName: '',
      normalPosition: 'closed',
      requiredPosition: 'open',
      tagNumber: '',
      verified: false
    };

    setFormData(prev => ({
      ...prev,
      isolationPoints: [...prev.isolationPoints, newPoint]
    }));
  };

  const updateIsolationPoint = (id: string, field: keyof IsolationPoint, value: any) => {
    setFormData(prev => ({
      ...prev,
      isolationPoints: prev.isolationPoints.map(point =>
        point.id === id ? { ...point, [field]: value } : point
      )
    }));
  };

  const removeIsolationPoint = (id: string) => {
    setFormData(prev => ({
      ...prev,
      isolationPoints: prev.isolationPoints.filter(point => point.id !== id)
    }));
  };

  const addGroundLocation = () => {
    const newGround: GroundLocation = {
      id: Date.now().toString(),
      location: '',
      equipmentType: '',
      clusterNumber: `GC-${Date.now().toString().slice(-4)}`,
      installed: false
    };

    setFormData(prev => ({
      ...prev,
      groundsRequired: [...prev.groundsRequired, newGround]
    }));
  };

  const updateGroundLocation = (id: string, field: keyof GroundLocation, value: any) => {
    setFormData(prev => ({
      ...prev,
      groundsRequired: prev.groundsRequired.map(ground =>
        ground.id === id ? { ...ground, [field]: value } : ground
      )
    }));
  };

  const removeGroundLocation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      groundsRequired: prev.groundsRequired.filter(ground => ground.id !== id)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('switching_orders')
        .insert({
          order_number: formData.orderNumber,
          request_date: formData.requestDate,
          requested_by: (await supabase.auth.getUser()).data.user?.id,
          affected_circuits: formData.affectedCircuits,
          isolation_points: formData.isolationPoints,
          grounds_required: formData.groundsRequired,
          clearance_boundaries: formData.clearanceBoundaries,
          special_conditions: formData.specialConditions,
          outage_start: formData.outageStart,
          outage_end: formData.outageEnd,
          test_before_touch: formData.testBeforeTouch,
          status: formData.status
        });

      if (error) throw error;
      
      alert('Switching order submitted successfully!');
      // Reset or redirect
    } catch (error) {
      console.error('Error submitting switching order:', error);
      alert('Error submitting switching order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Order Number
                </label>
                <input
                  type="text"
                  value={formData.orderNumber}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-800 text-gray-400 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Request Date
                </label>
                <input
                  type="date"
                  value={formData.requestDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, requestDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Affected Circuits
              </label>
              <textarea
                value={formData.affectedCircuits.join(', ')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  affectedCircuits: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                }))}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-md"
                rows={2}
                placeholder="Enter circuit names separated by commas"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Outage Start
                </label>
                <input
                  type="datetime-local"
                  value={formData.outageStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, outageStart: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Outage End
                </label>
                <input
                  type="datetime-local"
                  value={formData.outageEnd}
                  onChange={(e) => setFormData(prev => ({ ...prev, outageEnd: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-md"
                />
              </div>
            </div>
          </div>
        );

      case 1: // Isolation Points
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Isolation Points</h3>
              <button
                type="button"
                onClick={addIsolationPoint}
                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-black rounded-md transition-colors"
              >
                Add Point
              </button>
            </div>

            {formData.isolationPoints.map((point) => (
              <div key={point.id} className="bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Switch ID</label>
                    <input
                      type="text"
                      value={point.switchId}
                      onChange={(e) => updateIsolationPoint(point.id, 'switchId', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 text-white rounded-md"
                      placeholder="e.g., CB-123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Switch Name</label>
                    <input
                      type="text"
                      value={point.switchName}
                      onChange={(e) => updateIsolationPoint(point.id, 'switchName', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 text-white rounded-md"
                      placeholder="e.g., Main Breaker"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Tag Number</label>
                    <input
                      type="text"
                      value={point.tagNumber}
                      onChange={(e) => updateIsolationPoint(point.id, 'tagNumber', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 text-white rounded-md"
                      placeholder="e.g., DO-001"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-400">Normal:</label>
                      <select
                        value={point.normalPosition}
                        onChange={(e) => updateIsolationPoint(point.id, 'normalPosition', e.target.value)}
                        className="px-2 py-1 bg-gray-700 text-white rounded-md text-sm"
                      >
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-400">Required:</label>
                      <select
                        value={point.requiredPosition}
                        onChange={(e) => updateIsolationPoint(point.id, 'requiredPosition', e.target.value)}
                        className="px-2 py-1 bg-gray-700 text-white rounded-md text-sm"
                      >
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeIsolationPoint(point.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case 2: // Grounding Requirements
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Grounding Requirements</h3>
              <button
                type="button"
                onClick={addGroundLocation}
                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-black rounded-md transition-colors"
              >
                Add Ground
              </button>
            </div>

            {formData.groundsRequired.map((ground) => (
              <div key={ground.id} className="bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Location</label>
                    <input
                      type="text"
                      value={ground.location}
                      onChange={(e) => updateGroundLocation(ground.id, 'location', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 text-white rounded-md"
                      placeholder="e.g., Structure 123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Equipment Type</label>
                    <select
                      value={ground.equipmentType}
                      onChange={(e) => updateGroundLocation(ground.id, 'equipmentType', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 text-white rounded-md"
                    >
                      <option value="">Select...</option>
                      <option value="cluster_ground">Cluster Ground</option>
                      <option value="portable_ground">Portable Ground</option>
                      <option value="truck_ground">Truck Ground</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Cluster Number</label>
                    <input
                      type="text"
                      value={ground.clusterNumber}
                      onChange={(e) => updateGroundLocation(ground.id, 'clusterNumber', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 text-white rounded-md"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={ground.installed}
                      onChange={(e) => updateGroundLocation(ground.id, 'installed', e.target.checked)}
                      className="rounded text-yellow-600"
                    />
                    <span className="text-sm text-gray-300">Installed</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeGroundLocation(ground.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="bg-amber-900/20 border border-amber-600/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-300 font-medium">Grounding Requirements</p>
                  <p className="text-gray-400 text-sm mt-1">
                    All grounds must be installed in accordance with company safety procedures.
                    Verify proper cluster size for system voltage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Clearance Boundaries
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Clearance Boundaries Description
              </label>
              <textarea
                value={formData.clearanceBoundaries}
                onChange={(e) => setFormData(prev => ({ ...prev, clearanceBoundaries: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-md"
                rows={4}
                placeholder="Describe the clearance boundaries in detail..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Special Conditions / Notes
              </label>
              <textarea
                value={formData.specialConditions}
                onChange={(e) => setFormData(prev => ({ ...prev, specialConditions: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-md"
                rows={4}
                placeholder="Any special conditions or safety considerations..."
              />
            </div>

            <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.testBeforeTouch}
                  onChange={(e) => setFormData(prev => ({ ...prev, testBeforeTouch: e.target.checked }))}
                  className="rounded text-red-600"
                />
                <div>
                  <p className="text-red-300 font-medium">Test Before Touch Required</p>
                  <p className="text-gray-400 text-sm">
                    All equipment must be tested with approved voltage detector before work begins
                  </p>
                </div>
              </label>
            </div>
          </div>
        );

      case 4: // Review & Submit
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Review Switching Order</h3>
            
            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Order Number:</span>
                  <span className="text-white ml-2">{formData.orderNumber}</span>
                </div>
                <div>
                  <span className="text-gray-400">Request Date:</span>
                  <span className="text-white ml-2">{formData.requestDate}</span>
                </div>
                <div>
                  <span className="text-gray-400">Affected Circuits:</span>
                  <span className="text-white ml-2">{formData.affectedCircuits.join(', ')}</span>
                </div>
                <div>
                  <span className="text-gray-400">Isolation Points:</span>
                  <span className="text-white ml-2">{formData.isolationPoints.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">Grounds Required:</span>
                  <span className="text-white ml-2">{formData.groundsRequired.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">Test Before Touch:</span>
                  <span className="text-white ml-2">{formData.testBeforeTouch ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-900/20 border border-amber-600/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-300 font-medium">Submission Confirmation</p>
                  <p className="text-gray-400 text-sm mt-1">
                    By submitting this switching order, you confirm that all information is accurate
                    and that proper safety procedures will be followed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          Switching Order Request
        </h2>
        <p className="text-gray-400">
          Create and manage electrical switching orders for safe isolation
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  index <= currentStep
                    ? 'bg-yellow-600 border-yellow-600 text-black'
                    : 'border-gray-600 text-gray-600'
                }`}
              >
                {index < currentStep ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-yellow-600' : 'bg-gray-600'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`text-xs ${
                index <= currentStep ? 'text-yellow-500' : 'text-gray-500'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4">
        <button
          type="button"
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-md transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Switching Order'}
          </button>
        )}
      </div>
    </div>
  );
};
