import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, HardHat, Shield, FileText, MessageSquare, LayoutDashboard 
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard', color: 'text-amber-500' },
    { icon: MessageSquare, label: 'Feed', path: '/feed', color: 'text-cyan-500' },
    { icon: LayoutDashboard, label: 'Analytics', path: '/analytics', color: 'text-purple-500' },
    { icon: HardHat, label: 'Field', path: '/field', color: 'text-green-500' },
    { icon: Shield, label: 'Safety', path: '/safety', color: 'text-red-500' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700 lg:hidden z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-all ${
              isActive(item.path) 
                ? 'bg-slate-800 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <item.icon className={`w-5 h-5 mb-1 ${isActive(item.path) ? item.color : ''}`} />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
