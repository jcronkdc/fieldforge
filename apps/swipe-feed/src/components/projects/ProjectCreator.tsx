import React, { useState } from 'react';
import {
  ArrowLeft, Save, Building2, Calendar, Zap, MapPin,
  FileText, DollarSign, Users, AlertCircle
} from 'lucide-react';
import { projectService, Project } from '../../lib/services/projectService';
import { toast } from '../common/FuturisticToast';

interface ProjectCreatorProps {
  onBack: () => void;
  onProjectCreated: (project: Project) => void;
}

export const ProjectCreator: React.FC<ProjectCreatorProps> = ({ onBack, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    project_number: '',
    name: '',
    description: '',
    project_type: 'mixed' as 'transmission' | 'distribution' | 'substation' | 'mixed',
    voltage_class: '',
    contract_type: 'lump_sum',
    start_date: '',
    end_date: '',
    location: {
      address: '',
      city: '',
      state: '',
      zip: '',
      coordinates: { lat: 0, lng: 0 }
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { location, ...projectDetails } = formData;

      const project = await projectService.createProject({
        ...projectDetails,
        status: 'planning'
      });

      if (project) {
        toast.success('Project created.');
        onProjectCreated(project);
      } else {
        const message = 'Project creation failed. Check console for details.';
        console.error('[ProjectCreator] Project creation returned null - check authentication and database tables');
        setError(message);
        toast.error(message);
      }
    } catch (err: any) {
      const message = err?.message ? String(err.message) : 'Project creation failed. Try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const voltageOptions = [
    '69kV', '115kV', '138kV', '161kV', '230kV', '345kV', '500kV', '765kV'
  ];

  const contractTypes = [
    { value: 'lump_sum', label: 'Lump Sum' },
    { value: 'unit_price', label: 'Unit Price' },
    { value: 'time_materials', label: 'Time & Materials' },
    { value: 'cost_plus', label: 'Cost Plus' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Create new project</h1>
                  <p className="text-gray-400 text-sm">Define project details and specifications.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center space-x-2" id="project-error" role="alert">
              <AlertCircle className="w-5 h-5 text-red-400" aria-hidden="true" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-amber-500" />
              Basic information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="project-number">
                  Project number <span className="text-red-400">*</span>
                </label>
                <input
                  id="project-number"
                  type="text"
                  required
                  value={formData.project_number}
                  onChange={(e) => setFormData({ ...formData, project_number: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="PRJ-2024-001"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'project-error' : undefined}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="project-name">
                  Project name <span className="text-red-400">*</span>
                </label>
                <input
                  id="project-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="138kV Substation Upgrade"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'project-error' : undefined}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="project-description">
                  Description
                </label>
                <textarea
                  id="project-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="Project scope and objectives"
                />
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-amber-500" />
              Technical specifications
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="project-type">
                  Project type <span className="text-red-400">*</span>
                </label>
                <select
                  id="project-type"
                  value={formData.project_type}
                  onChange={(e) => setFormData({ ...formData, project_type: e.target.value as any })}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="transmission">Transmission</option>
                  <option value="distribution">Distribution</option>
                  <option value="substation">Substation</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="voltage-class">
                  Voltage class
                </label>
                <select
                  id="voltage-class"
                  value={formData.voltage_class}
                  onChange={(e) => setFormData({ ...formData, voltage_class: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">Select voltage</option>
                  {voltageOptions.map((voltage) => (
                    <option key={voltage} value={voltage}>{voltage}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Schedule & Contract */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-amber-500" />
              Schedule and contract
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="start-date">
                  Start date
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="end-date">
                  End date
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="contract-type">
                  Contract type
                </label>
                <select
                  id="contract-type"
                  value={formData.contract_type}
                  onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  {contractTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-amber-500" />
              Location
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="project-address">
                  Address
                </label>
                <input
                  id="project-address"
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    location: { ...formData.location, address: e.target.value }
                  })}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="1234 Main St"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="project-city">
                  City
                </label>
                <input
                  id="project-city"
                  type="text"
                  value={formData.location.city}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    location: { ...formData.location, city: e.target.value }
                  })}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="City"
                />
              </div>
              
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="project-state">
                    State
                  </label>
                  <input
                    id="project-state"
                    type="text"
                    value={formData.location.state}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      location: { ...formData.location, state: e.target.value }
                    })}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    placeholder="State"
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="project-zip">
                    Zip code
                  </label>
                  <input
                    id="project-zip"
                    type="text"
                    value={formData.location.zip}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      location: { ...formData.location, zip: e.target.value }
                    })}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    placeholder="12345"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating project</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Create project</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
