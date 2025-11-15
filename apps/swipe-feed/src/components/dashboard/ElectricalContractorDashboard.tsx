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
  Building2,
  Compass,
  Ruler
} from 'lucide-react';

// Based on National Conductor's actual capabilities from their website
const quickActions = [
  {
    title: 'Create Substation Project',
    description: 'Set up a new substation or switchyard project (12.5kV - 500kV)',
    icon: Building,
    color: 'text-blue-400',
    path: '/projects/create?type=substation'
  },
  {
    title: 'Schedule IBEW Crew',
    description: 'Coordinate Local Union crews and specialized welders',
    icon: Users,
    color: 'text-green-400', 
    path: '/crews/schedule'
  },
  {
    title: 'Safety Briefing',
    description: 'Digital JSA and safety briefing for high-voltage work',
    icon: Shield,
    color: 'text-blue-400',
    path: '/safety/briefing'
  },
  {
    title: 'Bus Duct Inspection',
    description: 'Log borescope inspection for isolated phase bus duct',
    icon: Wrench,
    color: 'text-purple-400',
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
    <div className=" p-[34px] space-y-[34px]">
      {/* Renaissance Decorations */}
      <div className="" />
      
      {/* Welcome Header for Electrical Contractors */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-[34px] rounded-[21px] border border-gray-700  relative overflow-hidden ">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <Compass className="w-full h-full text-blue-400 " />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-[13px] mb-[21px]">
            <div className="">
              <Zap className="w-[34px] h-[34px] text-blue-400" />
            </div>
            <span className="text-xl font-bold text-white ">Welcome to FieldForge</span>
          </div>
          <h1 className="text-2xl lg:text-golden-3xl font-bold mb-[21px] text-white">
            Built for Electrical Contractors Like You
          </h1>
          <p className="text-base text-blue-400/80 leading-relaxed max-w-3xl ">
            Manage substations, switchyards, bus duct installation, and renewable energy projects 
            with the same attention to detail that's made companies like <strong>National Conductor</strong> successful since 1977.
            FieldForge understands high-voltage electrical construction.
          </p>
          
          <div className="mt-[21px] flex items-center gap-[21px] text-sm">
            <div className="flex items-center gap-[8px] " >
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-blue-400/60">12.5kV - 500kV Support</span>
            </div>
            <div className="flex items-center gap-[8px] " >
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-blue-400/60">IBEW Union Integration</span>
            </div>
            <div className="flex items-center gap-[8px] " >
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-blue-400/60">Safety Compliance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions for Electrical Contractors */}
      <div>
        <h2 className="text-xl font-bold text-white mb-[21px] flex items-center gap-[13px] ">
          <HardHat className="w-[21px] h-[21px] text-blue-400" />
          Quick Actions for Electrical Contractors
        </h2>
        
        <div className="grid gap-[21px] lg:grid-cols-2 xl:grid-cols-4 ">
          {quickActions.map((action, index) => (
            <button
              key={action.title}
              onClick={() => navigate(action.path)}
              className="group text-left bg-gray-800/50 border border-gray-700 rounded-lg p-[21px] rounded-[13px] border border-gray-700  hover:scale-[1.02] transition-all "
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className=" mb-[21px] group-hover:rotate-[30deg] transition-transform">
                <action.icon className={`w-[34px] h-[34px] ${action.color}`} />
              </div>
              <h3 className="font-bold text-white mb-[8px] leading-tight text-base">{action.title}</h3>
              <p className="text-sm text-blue-400/60 leading-relaxed ">{action.description}</p>
              <ArrowRight className="w-4 h-4 text-blue-400 mt-[13px] group-hover:translate-x-1 transition-transform" />
            </button>
          ))}
        </div>
      </div>

      {/* Current Projects */}
      <div>
        <h2 className="text-xl font-bold text-white mb-[21px] flex items-center gap-[13px] ">
          <Building2 className="w-[21px] h-[21px] text-green-400" />
          Your Electrical Projects
        </h2>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-[21px] rounded-[13px] border border-gray-700  ">
          {recentProjects.map((project, index) => (
            <div key={index} className="flex items-center justify-between p-[21px] bg-slate-800/50 rounded-[13px] border border-gray-700">
              <div className="flex items-center gap-[21px]">
                <div className="">
                  <Building2 className="w-[34px] h-[34px] text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">{project.name}</h3>
                  <div className="text-sm text-blue-400/60">{project.type} • {project.voltage}</div>
                  <div className="text-xs text-blue-400/40 " >{project.location}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-[8px] mb-[8px]">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-orange-400 font-semibold">{project.status}</span>
                </div>
                <div className="text-xs text-blue-400/40">{project.progress}% Complete</div>
              </div>
            </div>
          ))}
          
          <button
            onClick={() => navigate('/projects/create')}
            className="w-full mt-[21px] py-[13px] border-2 border-dashed border-gray-700 rounded-[13px] text-blue-400/60 hover:border-gray-700 hover:text-blue-400 transition-all flex items-center justify-center gap-[8px] border border-gray-700 "
          >
            <Building2 className="w-5 h-5" />
            Create Your First Substation Project
          </button>
        </div>
      </div>

      {/* Getting Started Tasks */}
      <div>
        <h2 className="text-xl font-bold text-white mb-[21px] flex items-center gap-[13px] ">
          <CheckCircle className="w-[21px] h-[21px] text-purple-400" />
          Getting Started
        </h2>
        
        <div className="space-y-[13px]">
          {upcomingTasks.map((task, index) => (
            <div key={index} className="flex items-center gap-[21px] bg-gray-800/50 border border-gray-700 rounded-lg p-[21px] rounded-[13px] border border-gray-700 hover:border-gray-700 transition-colors " style={{ animationDelay: `${index * 0.1}s` }}>
              <div className={`w-[21px] h-[21px] rounded-full border-2 ${task.priority === 'high' ? 'border-orange-400 bg-orange-400/20' : 'border-gray-700 bg-blue-400/20'}`}>
                {task.priority === 'high' && <div className="w-[13px] h-[13px] bg-orange-400 rounded-full m-[3px] animate-pulse"></div>}
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-white text-base">{task.title}</h4>
                <p className="text-sm text-blue-400/60 ">{task.description}</p>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-[8px] text-xs text-blue-400/40 " >
                  <Clock className="h-3 w-3" />
                  {task.dueDate}
                </div>
              </div>
              
              <ArrowRight className="w-5 h-5 text-blue-400/60 hover:text-blue-400 transition-colors cursor-pointer" />
            </div>
          ))}
        </div>
        
        <div className="mt-[34px] text-center">
          <button
            onClick={completeOnboarding}
            className="px-[34px] py-[13px] bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all text-white font-semibold rounded-[13px]   transform hover:scale-105"
          >
            I'm Ready - Show Full Dashboard
          </button>
        </div>
      </div>

      {/* Industry-Specific Note */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-[34px] rounded-[21px] border border-gray-700  ">
        <div className="flex items-start gap-[21px]">
          <div className="">
            <Zap className="w-[34px] h-[34px] text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-white mb-[13px] text-lg ">Built for Your Industry</h3>
            <p className="text-sm text-blue-400/80 leading-relaxed ">
              FieldForge was designed specifically for electrical contractors working on transmission, 
              distribution, and substation projects. Every feature - from voltage class tracking to 
              IBEW crew coordination - reflects the realities of high-voltage electrical construction.
            </p>
            <p className="text-sm text-blue-400/80 leading-relaxed mt-[13px] ">
              Whether you're installing 500kV bus duct like <a href="https://www.nationalconductor.com" target="_blank" className="text-blue-400 hover:text-blue-300 underline " >National Conductor</a> 
              or managing renewable energy interconnections, FieldForge speaks your language.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};