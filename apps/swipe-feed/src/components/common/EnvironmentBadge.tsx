import React from 'react';

export const EnvironmentBadge: React.FC = () => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isDevelopment = import.meta.env.MODE === 'development';
  
  // Only show badge in development or on localhost
  if (!isLocal && !isDevelopment) return null;
  
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
        <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
        LOCAL DEV MODE
        <span className="opacity-75">({window.location.hostname})</span>
      </div>
    </div>
  );
};

export const LiveSiteBanner: React.FC = () => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isVercel = window.location.hostname.includes('vercel.app');
  
  // Only show on production Vercel deployments for the first visit
  if (isLocal || !isVercel) return null;
  
  // Check if banner was already shown
  const bannerShown = sessionStorage.getItem('liveSiteBannerShown');
  if (bannerShown) return null;
  
  // Mark as shown
  React.useEffect(() => {
    const timer = setTimeout(() => {
      sessionStorage.setItem('liveSiteBannerShown', 'true');
      const banner = document.getElementById('live-site-banner');
      if (banner) {
        banner.style.opacity = '0';
        setTimeout(() => banner.remove(), 500);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div 
      id="live-site-banner"
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 transition-opacity duration-500"
    >
      <div className="container mx-auto flex items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-sm font-semibold">🎉 You're on the LIVE production site!</span>
        </div>
        <span className="text-xs opacity-90">
          URL: {window.location.hostname}
        </span>
      </div>
    </div>
  );
};
