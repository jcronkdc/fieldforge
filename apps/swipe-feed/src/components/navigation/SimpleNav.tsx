import React from "react";
import { PLATFORM_NAMES } from "../../config/naming";

interface SimpleNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isAuthenticated: boolean;
}

export function SimpleNav({ currentView, onNavigate, isAuthenticated }: SimpleNavProps) {
  const navItems = [
    { id: 'prologue', label: '🏠 Home', icon: '🏠', description: 'Your dashboard' },
    { id: 'feed', label: '🌟 Discovery', icon: '🌟', description: 'Explore stories' },
    { id: 'messages', label: '💬 Messages', icon: '💬', description: 'Chat with friends' },
    { id: 'das-voting', label: '🗳️ Vote on Ads', icon: '🗳️', description: 'Control advertising' },
  ];

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-white text-xl font-bold">
              MythaTron™
            </span>
            <span className="ml-2 text-purple-200 text-sm hidden sm:inline">
              Where Stories Come Alive
            </span>
          </div>

          {/* Navigation Items - Simplified for all ages */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${currentView === item.id 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }
                `}
                title={item.description}
              >
                <span className="text-lg sm:hidden">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Sparks Balance - Always visible */}
          <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
            <span className="text-yellow-300 text-lg mr-1">✨</span>
            <span className="text-white font-medium text-sm">
              {PLATFORM_NAMES.currencySymbol} 0
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Helper component for mobile-friendly navigation
export function MobileNavButton({ onClick, label, icon, isActive }: {
  onClick: () => void;
  label: string;
  icon: string;
  isActive: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center p-2 rounded-lg
        ${isActive 
          ? 'bg-purple-600 text-white' 
          : 'text-gray-600 hover:bg-gray-100'
        }
      `}
    >
      <span className="text-2xl mb-1">{icon}</span>
      <span className="text-xs">{label}</span>
    </button>
  );
}
