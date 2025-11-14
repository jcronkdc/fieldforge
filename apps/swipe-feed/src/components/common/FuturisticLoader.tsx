import React from 'react';

interface FuturisticLoaderProps {
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

const spinnerSizes: Record<'small' | 'medium' | 'large' | 'fullscreen', string> = {
  small: 'h-6 w-6 border-2',
  medium: 'h-10 w-10 border-2',
  large: 'h-14 w-14 border-3',
  fullscreen: 'h-16 w-16 border-3'
};

const Spinner: React.FC<{ size: FuturisticLoaderProps['size'] }> = ({ size = 'medium' }) => (
  <span
    className={`inline-flex animate-spin rounded-full border-slate-700/60 border-t-amber-400/80 ${spinnerSizes[size]}`}
    role="status"
    aria-label="Loading"
  />
);

export const FuturisticLoader: React.FC<FuturisticLoaderProps> = ({
  size = 'medium',
  message = 'Processing…',
  showProgress = false,
  progress = 0
}) => {
  if (size === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center gap-4 text-center text-slate-100">
          <Spinner size="fullscreen" />
          {message && <p className="text-sm text-slate-300">{message}</p>}

          {showProgress && (
            <div className="w-56">
              <div className="h-1 rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-blue-400 transition-all"
                  style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">{Math.min(Math.max(progress, 0), 100).toFixed(0)}% complete</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-slate-200">
      <Spinner size={size} />
      {message && <span className="text-sm text-slate-400">{message}</span>}
    </div>
  );
};
