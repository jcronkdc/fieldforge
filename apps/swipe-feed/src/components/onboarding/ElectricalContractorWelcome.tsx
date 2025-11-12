import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Building, 
  Users, 
  Shield, 
  FileText, 
  Calendar, 
  ArrowRight,
  CheckCircle,
  Settings,
  BarChart3,
  HardHat,
  Wrench
} from 'lucide-react';

interface ProjectType {
  id: string;
  name: string;
  description: string;
  voltageRange: string;
  icon: React.ComponentType<any>;
  examples: string[];
}

const projectTypes: ProjectType[] = [
  {
    id: 'substations',
    name: 'Substations & Switchyards',
    description: 'High-voltage substations and switching facilities',
    voltageRange: '12.5kV - 500kV',
    icon: Building,
    examples: ['Distribution substations', 'Transmission substations', 'Mobile substations', 'Wind farm collector systems']
  },
  {
    id: 'isolated_phase_bus',
    name: 'Isolated Phase Bus Duct',
    description: 'Turnkey bus duct installation and maintenance',
    voltageRange: 'Generator voltage',
    icon: Zap,
    examples: ['Generator bus duct', 'Transformer connections', 'Switchgear connections', 'Custom bus systems']
  },
  {
    id: 'bus_wire',
    name: 'Bus & Wire Systems',
    description: 'High-voltage bus and wire welding services',
    voltageRange: '69kV - 500kV',
    icon: Settings,
    examples: ['Bus welding', 'Wire pulling', 'Terminations', 'Testing & commissioning']
  },
  {
    id: 'maintenance',
    name: 'Maintenance & Inspection',
    description: 'Preventive maintenance and inspection services',
    voltageRange: 'All voltage classes',
    icon: Wrench,
    examples: ['Borescope inspections', 'Electro-silver plating', 'Cryogenic cleaning', 'Predictive maintenance']
  },
  {
    id: 'renewable',
    name: 'Renewable Energy',
    description: 'Wind and solar electrical infrastructure',
    voltageRange: '12.5kV - 345kV',
    icon: BarChart3,
    examples: ['Wind farm substations', 'Solar collection systems', 'BESS connections', 'Grid interconnections']
  }
];

const capabilities = [
  {
    title: 'Project Management',
    description: 'Track multiple substation and transmission projects from planning to energization',
    icon: Calendar
  },
  {
    title: 'Crew Management',
    description: 'Coordinate IBEW crews, specialized welders, and inspection teams across job sites',
    icon: Users
  },
  {
    title: 'Safety Compliance',
    description: 'Digital JSAs, switching orders, and safety briefings for high-voltage work',
    icon: Shield
  },
  {
    title: 'Quality Documentation',
    description: 'Automated documentation for welding certs, inspection reports, and commissioning',
    icon: FileText
  }
];

export const ElectricalContractorWelcome: React.FC = () => {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const toggleProject = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      // Save selections and continue to dashboard
      localStorage.setItem('fieldforge_project_types', JSON.stringify(selectedProjects));
      navigate('/dashboard');
    }
  };

  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 rounded-2xl px-6 py-3 mb-6">
              <Zap className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold text-white">Welcome to FieldForge</span>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Perfect for Electrical Contractors
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              FieldForge is designed specifically for companies like <strong>National Conductor</strong> who specialize in 
              high-voltage electrical construction. Select your primary project types to customize your experience:
            </p>
          </div>

          {/* Project Type Selection */}
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3 mb-12">
            {projectTypes.map((project) => (
              <div
                key={project.id}
                onClick={() => toggleProject(project.id)}
                className={`group cursor-pointer relative rounded-3xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
                  selectedProjects.includes(project.id)
                    ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500 shadow-xl shadow-blue-500/20'
                    : 'bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-blue-500/50'
                }`}
              >
                {/* Selection Indicator */}
                <div className="absolute top-4 right-4">
                  {selectedProjects.includes(project.id) ? (
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  ) : (
                    <div className="w-6 h-6 border-2 border-slate-500 rounded-full group-hover:border-blue-400 transition-colors"></div>
                  )}
                </div>

                {/* Icon */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg ${
                    selectedProjects.includes(project.id)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                      : 'bg-slate-700 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-600'
                  } transition-all`}>
                    <project.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white leading-tight">{project.name}</h3>
                    <div className="text-sm text-blue-300 font-mono">{project.voltageRange}</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-300 mb-4 leading-relaxed">{project.description}</p>

                {/* Examples */}
                <div className="space-y-2">
                  <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Examples:</div>
                  <div className="flex flex-wrap gap-2">
                    {project.examples.map((example, idx) => (
                      <span 
                        key={idx}
                        className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded-md border border-slate-600"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <button
              onClick={handleNext}
              disabled={selectedProjects.length === 0}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 mx-auto"
            >
              Continue Setup
              <ArrowRight className="h-5 w-5" />
            </button>
            <p className="mt-4 text-sm text-slate-400">
              {selectedProjects.length === 0 ? 'Select at least one project type to continue' : `${selectedProjects.length} project type${selectedProjects.length === 1 ? '' : 's'} selected`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Your FieldForge Dashboard is Ready
          </h1>
          <p className="text-xl text-slate-300">
            Here's how FieldForge will help streamline your electrical construction operations:
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 mb-12">
          {capabilities.map((capability, index) => (
            <div key={capability.title} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                  <capability.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">{capability.title}</h3>
              </div>
              <p className="text-slate-300 leading-relaxed">{capability.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleNext}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
          >
            Access Your Dashboard
            <ArrowRight className="h-5 w-5" />
          </button>
          <p className="mt-4 text-sm text-slate-400">
            Your workspace has been customized for {selectedProjects.length} project type{selectedProjects.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>
    </div>
  );
};
