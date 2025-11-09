import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  CheckCircle, 
  Users, 
  FileText,
  Plus,
  Trash2,
  Save,
  Send
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { locationService } from '../../lib/services/locationService';

interface JobStep {
  sequence: number;
  task: string;
  hazards: string[];
  controls: string[];
}

interface JSAFormData {
  projectId: string;
  jsaNumber: string;
  title: string;
  workLocation: string;
  jobSteps: JobStep[];
  requiredPpe: string[];
  requiredTraining: string[];
  requiredPermits: string[];
}

export const JSAForm: React.FC = () => {
  const [formData, setFormData] = useState<JSAFormData>({
    projectId: '',
    jsaNumber: `JSA-${new Date().getTime()}`,
    title: '',
    workLocation: '',
    jobSteps: [{ sequence: 1, task: '', hazards: [], controls: [] }],
    requiredPpe: [],
    requiredTraining: [],
    requiredPermits: []
  });

  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signatures, setSignatures] = useState<any[]>([]);

  useEffect(() => {
    // Get current location
    locationService.getCurrentLocation().then(location => {
      locationService.reverseGeocode(location).then(address => {
        setCurrentLocation(address);
      });
    });
  }, []);

  const addJobStep = () => {
    setFormData(prev => ({
      ...prev,
      jobSteps: [
        ...prev.jobSteps,
        { 
          sequence: prev.jobSteps.length + 1, 
          task: '', 
          hazards: [], 
          controls: [] 
        }
      ]
    }));
  };

  const removeJobStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      jobSteps: prev.jobSteps.filter((_, i) => i !== index)
    }));
  };

  const updateJobStep = (index: number, field: keyof JobStep, value: any) => {
    setFormData(prev => ({
      ...prev,
      jobSteps: prev.jobSteps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const addHazard = (stepIndex: number, hazard: string) => {
    if (hazard.trim()) {
      updateJobStep(stepIndex, 'hazards', [
        ...formData.jobSteps[stepIndex].hazards,
        hazard.trim()
      ]);
    }
  };

  const addControl = (stepIndex: number, control: string) => {
    if (control.trim()) {
      updateJobStep(stepIndex, 'controls', [
        ...formData.jobSteps[stepIndex].controls,
        control.trim()
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('job_safety_analyses')
        .insert({
          ...formData,
          date_prepared: new Date().toISOString(),
          prepared_by: (await supabase.auth.getUser()).data.user?.id,
          job_steps: formData.jobSteps,
          is_active: true
        });

      if (error) throw error;

      alert('JSA submitted successfully!');
      // Reset form or redirect
    } catch (error) {
      console.error('Error submitting JSA:', error);
      alert('Error submitting JSA. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonHazards = [
    'Electrical shock',
    'Arc flash',
    'Falls from height',
    'Struck by object',
    'Caught between',
    'Heat stress',
    'Cold stress',
    'Cuts/lacerations',
    'Vehicle traffic',
    'Excavation hazards'
  ];

  const commonPPE = [
    'Hard hat',
    'Safety glasses',
    'Arc-rated clothing',
    'Rubber gloves',
    'Steel-toe boots',
    'Fall protection',
    'Face shield',
    'Hearing protection',
    'Hi-vis vest',
    'Rubber sleeves'
  ];

  return (
    <div className="bg-gray-900 rounded-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Shield className="w-6 h-6 text-yellow-500" />
          Job Safety Analysis (JSA)
        </h2>
        <p className="text-gray-400">
          Identify hazards and implement controls for safe work execution
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              JSA Number
            </label>
            <input
              type="text"
              value={formData.jsaNumber}
              readOnly
              className="w-full px-3 py-2 bg-gray-800 text-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Work Location
            </label>
            <input
              type="text"
              value={formData.workLocation || currentLocation}
              onChange={(e) => setFormData(prev => ({ ...prev, workLocation: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-md"
              placeholder="Enter work location"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Job Title/Description
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-800 text-white rounded-md"
            placeholder="e.g., Install 138kV Circuit Breaker"
            required
          />
        </div>

        {/* Job Steps */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Job Steps</h3>
            <button
              type="button"
              onClick={addJobStep}
              className="flex items-center gap-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-black rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Step
            </button>
          </div>

          {formData.jobSteps.map((step, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="text-white font-medium">Step {step.sequence}</h4>
                {formData.jobSteps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeJobStep(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Task Description</label>
                <textarea
                  value={step.task}
                  onChange={(e) => updateJobStep(index, 'task', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                  rows={2}
                  placeholder="Describe the work task"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    <AlertTriangle className="inline w-3 h-3 mr-1" />
                    Hazards
                  </label>
                  <div className="space-y-2">
                    {step.hazards.map((hazard, hIndex) => (
                      <div key={hIndex} className="flex items-center gap-2">
                        <span className="text-sm text-gray-300">{hazard}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newHazards = [...step.hazards];
                            newHazards.splice(hIndex, 1);
                            updateJobStep(index, 'hazards', newHazards);
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addHazard(index, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="w-full px-2 py-1 bg-gray-700 text-white rounded-md text-sm"
                    >
                      <option value="">Select hazard...</option>
                      {commonHazards.map(hazard => (
                        <option key={hazard} value={hazard}>{hazard}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    <Shield className="inline w-3 h-3 mr-1" />
                    Controls
                  </label>
                  <div className="space-y-2">
                    {step.controls.map((control, cIndex) => (
                      <div key={cIndex} className="flex items-center gap-2">
                        <span className="text-sm text-gray-300">{control}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newControls = [...step.controls];
                            newControls.splice(cIndex, 1);
                            updateJobStep(index, 'controls', newControls);
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <input
                      type="text"
                      placeholder="Add control measure"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addControl(index, (e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                      className="w-full px-2 py-1 bg-gray-700 text-white rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Required PPE */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Required PPE
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {commonPPE.map(ppe => (
              <label key={ppe} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.requiredPpe.includes(ppe)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({
                        ...prev,
                        requiredPpe: [...prev.requiredPpe, ppe]
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        requiredPpe: prev.requiredPpe.filter(p => p !== ppe)
                      }));
                    }
                  }}
                  className="rounded text-yellow-600"
                />
                <span className="text-sm text-gray-300">{ppe}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-md transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Submit for Approval
          </button>
        </div>
      </form>
    </div>
  );
};
