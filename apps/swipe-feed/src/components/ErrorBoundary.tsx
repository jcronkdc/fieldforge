import React, { Component, ErrorInfo, ReactNode } from 'react';

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
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-800 rounded-lg p-8 border border-red-500">
            <h1 className="text-3xl font-bold text-red-500 mb-4">
              ⚠️ Something went wrong
            </h1>
            <p className="text-slate-300 mb-4">
              An error occurred while loading this page. You can go back to the previous page or reload to try again.
            </p>
            
            {import.meta.env.DEV && (
              <details className="mt-4">
                <summary className="cursor-pointer text-blue-500 hover:text-blue-400">
                  Show error details (development only)
                </summary>
                <pre className="mt-2 p-4 bg-slate-900 rounded text-xs text-slate-400 overflow-auto">
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => window.history.back()}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
              >
                ← Go Back
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
              >
                🏠 Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              >
                🔄 Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}