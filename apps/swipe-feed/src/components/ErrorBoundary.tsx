import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft, RotateCcw, Settings } from 'lucide-react';
import { SafeStorage } from '../utils/storageUtils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    this.setState({ errorInfo });
    
    // Log to analytics or error reporting service
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // Send error to monitoring service in production
      console.log('Would send error to monitoring service:', {
        error: error.toString(),
        stack: errorInfo.componentStack,
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
    }
  }

  private handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Reset clicked - reloading page...');
    // Use a timeout to ensure the click registers
    setTimeout(() => {
      window.location.reload();
    }, 0);
  };

  private handleGoHome = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Go Home clicked - navigating to homepage...');
    // Use a timeout to ensure the click registers
    setTimeout(() => {
      // Clear everything and go home
      window.location.replace('/');
    }, 0);
  };
  
  private handleGoBack = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Go Back clicked - navigating back...');
    setTimeout(() => {
      if (window.history.length > 2) {
        window.history.back();
        setTimeout(() => {
          if (window.location.pathname === 'about:blank' || window.location.pathname === '/error' || window.location.pathname === '/' || window.location.hash === '#error') {
            window.location.hash = '#prologue';
          }
        }, 500);
      } else {
        window.location.hash = '#prologue';
      }
    }, 0);
  };
  
  private handleHardRefresh = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Hard Refresh clicked - forcing reload...');
    setTimeout(() => {
      window.location.reload();
      setTimeout(() => {
        // If still in error after reload, forcibly redirect to dashboard after 1 second
        if (
          (window.location.pathname === '/error' || window.location.hash === '#error' || document.title.includes('Oops'))
        ) {
          window.location.hash = '#prologue';
        }
      }, 1000);
    }, 0);
  };
  
  private handleClearStorage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Clear Storage clicked - clearing app data...');
    // Clear all app data and reload
    setTimeout(() => {
      try {
        SafeStorage.clearAppData();
        window.location.href = '/';
      } catch (error) {
        console.error('Error clearing storage:', error);
        // Fallback to manual clear
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
      }
    }, 0);
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-black/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              Oops! Something went wrong
            </h2>
            
            <p className="text-gray-300 text-center mb-6">
              We encountered an unexpected error. Don't worry, your work has been saved.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 p-4 bg-red-950/30 rounded-lg border border-red-500/20">
                <summary className="text-red-400 cursor-pointer font-semibold">
                  Error Details (Dev Only)
                </summary>
                <pre className="mt-2 text-xs text-red-300 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="space-y-3">
              {/* Primary actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Go Back clicked');
                    // Direct navigation without state changes
                    if (window.history.length > 2) {
                      window.history.go(-1);
                    } else {
                      window.location.href = '/';
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </button>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Home clicked');
                    // Direct navigation to home
                    window.location.href = '/';
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
              </div>
              
              {/* Secondary actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Refresh clicked');
                    // Direct page reload
                    window.location.reload();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh Page
                </button>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Hard Refresh clicked');
                    // Force reload bypassing cache
                    window.location.reload();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  <RotateCcw className="w-3 h-3" />
                  Hard Refresh
                </button>
              </div>
              
              {/* Clear Storage Option */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Clear Storage clicked');
                  if (confirm('This will clear all app data and sign you out. Continue?')) {
                    SafeStorage.clearAppData();
                    window.location.href = '/';
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 text-orange-300 rounded-lg transition-colors cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                <Settings className="w-4 h-4" />
                Clear App Data & Sign Out
              </button>
              
              {/* Emergency escape hatch - plain HTML link */}
              <div className="text-center pt-2 border-t border-gray-700">
                <a 
                  href="/" 
                  className="text-sm text-gray-400 hover:text-gray-200 underline"
                  style={{ pointerEvents: 'auto' }}
                >
                  If buttons don't work, click here to go home
                </a>
                <p className="text-xs text-gray-500 mt-1">
                  Press Ctrl+Shift+R for recovery options
                </p>
              </div>
              <div className="text-red-200 text-xs text-center mt-2">If refresh failed, please use <b>Clear App Data and Sign Out</b> below.</div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
