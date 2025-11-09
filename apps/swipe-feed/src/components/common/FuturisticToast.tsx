import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X, Zap } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

class ToastManager {
  private listeners: Set<(toasts: Toast[]) => void> = new Set();
  private toasts: Toast[] = [];

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  show(message: string, type: ToastType = 'info', duration = 4000) {
    const id = Date.now().toString();
    const toast: Toast = { id, message, type, duration };
    this.toasts.push(toast);
    this.notify();

    if (duration > 0 && type !== 'loading') {
      setTimeout(() => this.dismiss(id), duration);
    }

    return id;
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }

  success(message: string, duration = 4000) {
    return this.show(message, 'success', duration);
  }

  error(message: string, duration = 5000) {
    return this.show(message, 'error', duration);
  }

  warning(message: string, duration = 4000) {
    return this.show(message, 'warning', duration);
  }

  info(message: string, duration = 4000) {
    return this.show(message, 'info', duration);
  }

  loading(message: string) {
    return this.show(message, 'loading', 0);
  }
}

export const toast = new ToastManager();

const ToastIcon: React.FC<{ type: ToastType }> = ({ type }) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5" />;
    case 'error':
      return <XCircle className="w-5 h-5" />;
    case 'warning':
      return <AlertCircle className="w-5 h-5" />;
    case 'info':
      return <Info className="w-5 h-5" />;
    case 'loading':
      return <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />;
  }
};

const getToastStyles = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'border-green-500/50 shadow-green-500/20';
    case 'error':
      return 'border-red-500/50 shadow-red-500/20';
    case 'warning':
      return 'border-amber-500/50 shadow-amber-500/20';
    case 'info':
      return 'border-cyan-500/50 shadow-cyan-500/20';
    case 'loading':
      return 'border-purple-500/50 shadow-purple-500/20';
  }
};

const getIconColor = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'text-green-500';
    case 'error':
      return 'text-red-500';
    case 'warning':
      return 'text-amber-500';
    case 'info':
      return 'text-cyan-500';
    case 'loading':
      return 'text-purple-500';
  }
};

export const FuturisticToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return toast.subscribe(setToasts);
  }, []);

  return (
    <div className="fixed top-20 right-4 z-[9999] space-y-3 pointer-events-none">
      {toasts.map((t, index) => (
        <div
          key={t.id}
          className={`
            pointer-events-auto
            min-w-[320px] max-w-md
            px-6 py-4 rounded-lg
            bg-slate-900/95 backdrop-blur-xl
            border ${getToastStyles(t.type)}
            shadow-[0_0_30px] shadow-current
            transform transition-all duration-300
            animate-slideInRight
            hover:scale-105
            relative overflow-hidden
            group
          `}
          style={{
            animationDelay: `${index * 50}ms`
          }}
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          
          {/* Electric pulse effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-current to-transparent animate-pulse" />
          
          <div className="relative flex items-start space-x-3">
            <div className={`${getIconColor(t.type)} flex-shrink-0 mt-0.5`}>
              <ToastIcon type={t.type} />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-white font-['Exo_2'] text-sm leading-relaxed">
                {t.message}
              </p>
            </div>

            {t.type !== 'loading' && (
              <button
                onClick={() => toast.dismiss(t.id)}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Progress bar for auto-dismiss */}
          {t.duration && t.duration > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/20">
              <div 
                className={`h-full ${getIconColor(t.type)} bg-current`}
                style={{
                  animation: `shrink ${t.duration}ms linear forwards`
                }}
              />
            </div>
          )}

          {/* Corner accent */}
          <div className={`absolute top-0 right-0 w-8 h-8 ${getIconColor(t.type)}`}>
            <Zap className="w-4 h-4 opacity-20" />
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Export convenience functions
export const showSuccess = (message: string) => toast.success(message);
export const showError = (message: string) => toast.error(message);
export const showWarning = (message: string) => toast.warning(message);
export const showInfo = (message: string) => toast.info(message);
export const showLoading = (message: string) => toast.loading(message);
