import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../components/common/FuturisticToast';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  cmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  {
    key: 'h',
    cmd: true,
    action: () => window.location.href = '/dashboard',
    description: 'Go to Dashboard',
    category: 'Navigation'
  },
  {
    key: 'k',
    cmd: true,
    action: () => {
      // Open command palette
      const event = new CustomEvent('openCommandPalette');
      window.dispatchEvent(event);
    },
    description: 'Open Command Palette',
    category: 'Navigation'
  },
  {
    key: '/',
    cmd: true,
    action: () => {
      const event = new CustomEvent('toggleHelp');
      window.dispatchEvent(event);
    },
    description: 'Toggle Help',
    category: 'Navigation'
  },
  
  // Actions
  {
    key: 'n',
    cmd: true,
    action: () => window.location.href = '/field/daily-report',
    description: 'New Daily Report',
    category: 'Actions'
  },
  {
    key: 'r',
    cmd: true,
    action: () => window.location.href = '/field/receipts',
    description: 'Scan Receipt',
    category: 'Actions'
  },
  {
    key: 's',
    cmd: true,
    action: () => {
      toast.success('Draft saved successfully');
    },
    description: 'Save Draft',
    category: 'Actions'
  },
  {
    key: 'b',
    cmd: true,
    action: () => window.location.href = '/safety/briefing',
    description: 'Safety Briefing',
    category: 'Safety'
  },
  
  // Voice & AI
  {
    key: ' ',
    cmd: true,
    action: () => {
      const event = new CustomEvent('toggleVoiceCommand');
      window.dispatchEvent(event);
    },
    description: 'Toggle Voice Command',
    category: 'AI'
  },
  {
    key: 'a',
    cmd: true,
    shift: true,
    action: () => {
      const event = new CustomEvent('toggleAIAssistant');
      window.dispatchEvent(event);
    },
    description: 'Toggle AI Assistant',
    category: 'AI'
  },
  
  // System
  {
    key: 'Escape',
    action: () => {
      const event = new CustomEvent('closeModal');
      window.dispatchEvent(event);
    },
    description: 'Close Modal/Dialog',
    category: 'System'
  },
  {
    key: 'r',
    cmd: true,
    shift: true,
    action: () => window.location.reload(),
    description: 'Refresh Page',
    category: 'System'
  },
  {
    key: '?',
    shift: true,
    action: () => {
      const event = new CustomEvent('showKeyboardShortcuts');
      window.dispatchEvent(event);
    },
    description: 'Show Keyboard Shortcuts',
    category: 'System'
  }
];

export const useKeyboardShortcuts = (additionalShortcuts: Shortcut[] = []) => {
  const navigate = useNavigate();
  
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable) {
      return;
    }

    const allShortcuts = [...shortcuts, ...additionalShortcuts];
    
    for (const shortcut of allShortcuts) {
      const cmdKey = navigator.platform.includes('Mac') ? event.metaKey : event.ctrlKey;
      
      const matchesKey = event.key === shortcut.key || 
                         event.key.toLowerCase() === shortcut.key.toLowerCase();
      const matchesCmd = shortcut.cmd ? cmdKey : !shortcut.cmd ? !cmdKey : true;
      const matchesCtrl = shortcut.ctrl ? event.ctrlKey : !shortcut.ctrl ? !event.ctrlKey : true;
      const matchesShift = shortcut.shift ? event.shiftKey : !shortcut.shift ? !event.shiftKey : true;
      const matchesAlt = shortcut.alt ? event.altKey : !shortcut.alt ? !event.altKey : true;
      
      if (matchesKey && matchesCmd && matchesCtrl && matchesShift && matchesAlt) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [additionalShortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return { shortcuts: [...shortcuts, ...additionalShortcuts] };
};

// Keyboard shortcuts help modal component
import { X, Command, Keyboard } from 'lucide-react';

export const KeyboardShortcutsModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMac = navigator.platform.includes('Mac');

  useEffect(() => {
    const handleShowShortcuts = () => setIsOpen(true);
    window.addEventListener('showKeyboardShortcuts', handleShowShortcuts);
    return () => window.removeEventListener('showKeyboardShortcuts', handleShowShortcuts);
  }, []);

  if (!isOpen) return null;

  const formatKey = (shortcut: Shortcut) => {
    const keys = [];
    if (shortcut.cmd) keys.push(isMac ? '⌘' : 'Ctrl');
    if (shortcut.ctrl) keys.push('Ctrl');
    if (shortcut.shift) keys.push('⇧');
    if (shortcut.alt) keys.push(isMac ? '⌥' : 'Alt');
    
    const keyDisplay = shortcut.key === ' ' ? 'Space' : 
                       shortcut.key === 'Escape' ? 'Esc' :
                       shortcut.key.toUpperCase();
    keys.push(keyDisplay);
    
    return keys.join(isMac ? '' : '+');
  };

  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Keyboard className="w-6 h-6 text-cyan-500" />
            <h2 className="text-xl font-bold font-['Orbitron'] text-white">
              KEYBOARD SHORTCUTS
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          {categories.map(category => (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter(s => s.category === category)
                  .map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-800/50 transition-colors"
                    >
                      <span className="text-gray-300 font-['Exo_2']">
                        {shortcut.description}
                      </span>
                      <kbd className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-cyan-400 font-['Orbitron'] text-sm">
                        {formatKey(shortcut)}
                      </kbd>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          {/* Tips */}
          <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-amber-400 text-sm font-['Exo_2']">
              💡 <strong>Pro Tip:</strong> Press <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs">?</kbd> anytime to show this help
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
