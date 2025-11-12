import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building,
  Users,
  Shield,
  FileText,
  Calendar,
  BarChart3,
  Zap,
  Settings,
  ArrowRight,
  HardHat,
  Wrench,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  Building2
} from 'lucide-react';

// Based on National Conductor's actual capabilities from their website
const quickActions = [
  {
    title: 'Create Substation Project',
    description: 'Set up a new substation or switchyard project (12.5kV - 500kV)',
    icon: Building,
    color: 'from-blue-500 to-blue-600',
    path: '/projects/create?type=substation'
  },
  {
    title: 'Schedule IBEW Crew',
    description: 'Coordinate Local Union crews and specialized welders',
    icon: Users,
    color: 'from-green-500 to-green-600', 
    path: '/crews/schedule'
  },
  {
    title: 'Safety Briefing',
    description: 'Digital JSA and safety briefing for high-voltage work',
    icon: Shield,
    color: 'from-yellow-500 to-orange-500',
    path: '/safety/briefing'
  },
  {
    title: 'Bus Duct Inspection',
    description: 'Log borescope inspection for isolated phase bus duct',
    icon: Wrench,
    color: 'from-purple-500 to-purple-600',
    path: '/equipment/inspection'
  }
];

const recentProjects = [
  {
    name: 'Demo Substation Project',
    location: 'Your Location',
    voltage: '138kV',
    status: 'Setup Required',
    progress: 0,
    daysRemaining: '--',
    type: 'Transmission Substation'
  }
];

const upcomingTasks = [
  {
    title: 'Complete Company Setup',
    description: 'Add your company details and team members',
    priority: 'high',
    dueDate: 'Today'
  },
  {
    title: 'Create First Project',
    description: 'Set up your first substation or transmission project',
    priority: 'medium',
    dueDate: 'This week'
  },
  {
    title: 'Invite Team Members',
    description: 'Add your project managers and field supervisors',
    priority: 'medium', 
    dueDate: 'This week'
  }
];

export const ElectricalContractorDashboard: React.FC = () => {
  const navigate = useNavigate();

  const completeOnboarding = () => {
    localStorage.setItem('fieldforge_onboarding_complete', 'true');
    window.location.reload(); // Refresh to show normal dashboard
  };

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Header for Electrical Contractors */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M20 80 L50 20 L80 80 M50 20 L90 20" stroke="white" strokeWidth="2" fill="none"/>
            <circle cx="50" cy="20" r="3" fill="white"/>
            <circle cx="90" cy="20" r="3" fill="white"/>
          </svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-8 w-8" />
            <span className="text-2xl font-bold">Welcome to FieldForge</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            Built for Electrical Contractors Like You
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed max-w-3xl">
            Manage substations, switchyards, bus duct installation, and renewable energy projects 
            with the same attention to detail that's made companies like <strong>National Conductor</strong> successful since 1977.
            FieldForge understands high-voltage electrical construction.
          </p>
          
          <div className="mt-6 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span>12.5kV - 500kV Support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span>IBEW Union Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span>Safety Compliance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions for Electrical Contractors */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <HardHat className="h-6 w-6 text-blue-400" />
          Quick Actions for Electrical Contractors
        </h2>
        
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <button
              key={action.title}
              onClick={() => navigate(action.path)}
              className="group text-left bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:scale-105"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} shadow-lg mb-4 group-hover:shadow-xl transition-all`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-white mb-2 leading-tight">{action.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{action.description}</p>
              <ArrowRight className="h-4 w-4 text-blue-400 mt-4 group-hover:translate-x-1 transition-transform" />
            </button>
          ))}
        </div>
      </div>

      {/* Current Projects */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Building2 className="h-6 w-6 text-green-400" />
          Your Electrical Projects
        </h2>
        
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
          {recentProjects.map((project, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-600">
                  <Building2 className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{project.name}</h3>
                  <div className="text-sm text-slate-300">{project.type} • {project.voltage}</div>
                  <div className="text-xs text-slate-400">{project.location}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  <span className="text-sm text-orange-400 font-semibold">{project.status}</span>
                </div>
                <div className="text-xs text-slate-400">{project.progress}% Complete</div>
              </div>
            </div>
          ))}
          
          <button
            onClick={() => navigate('/projects/create')}
            className="w-full mt-4 py-3 border-2 border-dashed border-slate-600 rounded-xl text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-all flex items-center justify-center gap-2"
          >
            <Building2 className="h-5 w-5" />
            Create Your First Substation Project
          </button>
        </div>
      </div>

      {/* Getting Started Tasks */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-purple-400" />
          Getting Started
        </h2>
        
        <div className="space-y-4">
          {upcomingTasks.map((task, index) => (
            <div key={index} className="flex items-center gap-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-4 hover:border-blue-500/50 transition-colors">
              <div className={`w-4 h-4 rounded-full border-2 ${task.priority === 'high' ? 'border-orange-400 bg-orange-400/20' : 'border-blue-400 bg-blue-400/20'}`}>
                {task.priority === 'high' && <div className="w-2 h-2 bg-orange-400 rounded-full m-0.5 animate-pulse"></div>}
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-white">{task.title}</h4>
                <p className="text-sm text-slate-300">{task.description}</p>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  {task.dueDate}
                </div>
              </div>
              
              <ArrowRight className="h-5 w-5 text-slate-500 hover:text-blue-400 transition-colors cursor-pointer" />
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={completeOnboarding}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105"
          >
            I'm Ready - Show Full Dashboard
          </button>
        </div>
      </div>

      {/* Industry-Specific Note */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-500/30">
            <Zap className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-white mb-2">Built for Your Industry</h3>
            <p className="text-blue-200 leading-relaxed">
              FieldForge was designed specifically for electrical contractors working on transmission, 
              distribution, and substation projects. Every feature - from voltage class tracking to 
              IBEW crew coordination - reflects the realities of high-voltage electrical construction.
            </p>
            <p className="text-blue-200 leading-relaxed mt-2">
              Whether you're installing 500kV bus duct like <a href="https://www.nationalconductor.com" target="_blank" className="text-blue-300 hover:text-blue-200 underline">National Conductor</a> 
              or managing renewable energy interconnections, FieldForge speaks your language.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};