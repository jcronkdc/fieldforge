import React from 'react';
import { X, Bell, Shield, AlertTriangle, CheckCircle, Users } from 'lucide-react';

interface NotificationCenterProps {
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const notifications = [
    {
      id: '1',
      type: 'safety',
      title: 'Safety Alert',
      message: 'High winds expected - secure all materials',
      time: '5 min ago',
      icon: AlertTriangle,
      color: 'text-orange-500 bg-orange-500/10'
    },
    {
      id: '2',
      type: 'success',
      title: 'Inspection Passed',
      message: 'Foundation inspection completed successfully',
      time: '1 hour ago',
      icon: CheckCircle,
      color: 'text-green-500 bg-green-500/10'
    },
    {
      id: '3',
      type: 'team',
      title: 'Crew Update',
      message: 'Crew B has started work on Pad 3',
      time: '2 hours ago',
      icon: Users,
      color: 'text-blue-500 bg-blue-500/10'
    }
  ];

  return (
    <div className="fixed right-4 top-20 w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Bell className="w-5 h-5 mr-2 text-amber-500" />
          Notifications
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <div key={notification.id} className="p-4 border-b border-slate-700 hover:bg-slate-700/30 transition-colors cursor-pointer">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${notification.color}`}>
                <notification.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{notification.title}</p>
                <p className="text-slate-400 text-xs mt-1">{notification.message}</p>
                <p className="text-slate-500 text-xs mt-2">{notification.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-700">
        <button className="w-full text-center text-amber-500 hover:text-amber-400 text-sm font-medium">
          View All Notifications
        </button>
      </div>
    </div>
  );
};