/**
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * Modern UI Components - Advanced yet intuitive design
 */

import React, { ReactNode } from 'react';
import './ModernUI.css';

// Glassmorphism Card Component
export const GlassCard: React.FC<{
  children: ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  hoverable?: boolean;
}> = ({ children, className = '', blur = 'md', onClick, hoverable = false }) => {
  return (
    <div 
      className={`glass-card glass-blur-${blur} ${hoverable ? 'glass-hoverable' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Neon Button Component
export const NeonButton: React.FC<{
  children: ReactNode;
  color?: 'purple' | 'blue' | 'green' | 'pink' | 'orange';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  disabled?: boolean;
  pulse?: boolean;
  icon?: ReactNode;
}> = ({ 
  children, 
  color = 'purple', 
  size = 'md', 
  onClick, 
  disabled = false,
  pulse = false,
  icon
}) => {
  return (
    <button 
      className={`neon-button neon-${color} size-${size} ${pulse ? 'neon-pulse' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="button-icon">{icon}</span>}
      <span className="button-text">{children}</span>
      <span className="neon-glow"></span>
    </button>
  );
};

// Holographic Badge Component
export const HoloBadge: React.FC<{
  text: string;
  type?: 'new' | 'hot' | 'pro' | 'beta' | 'coming-soon';
  animated?: boolean;
}> = ({ text, type = 'new', animated = true }) => {
  return (
    <span className={`holo-badge badge-${type} ${animated ? 'badge-animated' : ''}`}>
      {text}
    </span>
  );
};

// Floating Action Button
export const FloatingActionButton: React.FC<{
  icon: ReactNode;
  onClick: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  color?: string;
  badge?: number;
}> = ({ icon, onClick, position = 'bottom-right', color = '#8B5CF6', badge }) => {
  return (
    <button 
      className={`fab fab-${position}`}
      style={{ backgroundColor: color }}
      onClick={onClick}
    >
      {icon}
      {badge && badge > 0 && (
        <span className="fab-badge">{badge > 99 ? '99+' : badge}</span>
      )}
    </button>
  );
};

// Animated Progress Bar
export const ProgressBar: React.FC<{
  progress: number;
  label?: string;
  color?: 'gradient' | 'purple' | 'green' | 'gold';
  showPercentage?: boolean;
  animated?: boolean;
}> = ({ progress, label, color = 'gradient', showPercentage = true, animated = true }) => {
  return (
    <div className="progress-container">
      {label && <span className="progress-label">{label}</span>}
      <div className="progress-bar">
        <div 
          className={`progress-fill progress-${color} ${animated ? 'progress-animated' : ''}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        >
          {showPercentage && (
            <span className="progress-text">{Math.round(progress)}%</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Sparkle Effect Component
export const SparkleText: React.FC<{
  children: ReactNode;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ children, color = '#FFD700', size = 'md' }) => {
  return (
    <span className={`sparkle-text sparkle-${size}`} style={{ color }}>
      {children}
      <span className="sparkles">
        <span className="sparkle"></span>
        <span className="sparkle"></span>
        <span className="sparkle"></span>
      </span>
    </span>
  );
};

// Morphing Card Component
export const MorphCard: React.FC<{
  children: ReactNode;
  gradient?: string;
  morphSpeed?: 'slow' | 'medium' | 'fast';
}> = ({ children, gradient = 'purple-pink', morphSpeed = 'medium' }) => {
  return (
    <div className={`morph-card gradient-${gradient} morph-${morphSpeed}`}>
      <div className="morph-content">
        {children}
      </div>
      <div className="morph-glow"></div>
    </div>
  );
};

// Interactive Tooltip
export const Tooltip: React.FC<{
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}> = ({ content, children, position = 'top' }) => {
  return (
    <div className="tooltip-wrapper">
      {children}
      <div className={`tooltip tooltip-${position}`}>
        {content}
      </div>
    </div>
  );
};

// Animated Loading Spinner
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}> = ({ size = 'md', color = '#8B5CF6', text }) => {
  return (
    <div className="loading-container">
      <div className={`loading-spinner spinner-${size}`} style={{ borderTopColor: color }}>
        <div className="spinner-inner"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

// Notification Toast
export const Toast: React.FC<{
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}> = ({ message, type = 'info', duration = 3000, onClose }) => {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">
        {type === 'success' && '✓'}
        {type === 'error' && '✗'}
        {type === 'warning' && '⚠'}
        {type === 'info' && 'ℹ'}
      </span>
      <span className="toast-message">{message}</span>
      {onClose && (
        <button className="toast-close" onClick={onClose}>×</button>
      )}
    </div>
  );
};

// Animated Counter
export const AnimatedCounter: React.FC<{
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}> = ({ value, duration = 1000, prefix = '', suffix = '', decimals = 0 }) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setDisplayValue(Math.floor(value * progress));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <span className="animated-counter">
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
};

// Coming Soon Overlay
export const ComingSoon: React.FC<{
  feature: string;
  estimatedDate?: string;
  description?: string;
}> = ({ feature, estimatedDate, description }) => {
  return (
    <div className="coming-soon-overlay">
      <GlassCard blur="lg" className="coming-soon-card">
        <HoloBadge text="COMING SOON" type="coming-soon" />
        <h2 className="coming-soon-title">{feature}</h2>
        {description && (
          <p className="coming-soon-description">{description}</p>
        )}
        {estimatedDate && (
          <p className="coming-soon-date">Expected: {estimatedDate}</p>
        )}
        <div className="coming-soon-animation">
          <div className="pulse-ring"></div>
          <div className="pulse-ring"></div>
          <div className="pulse-ring"></div>
        </div>
      </GlassCard>
    </div>
  );
};

// Sparks Display Component
export const SparksDisplay: React.FC<{
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
  onClick?: () => void;
}> = ({ amount, size = 'md', showAnimation = true, onClick }) => {
  return (
    <div 
      className={`sparks-display sparks-${size} ${onClick ? 'sparks-clickable' : ''}`}
      onClick={onClick}
    >
      <span className="sparks-icon">✨</span>
      <AnimatedCounter 
        value={amount} 
        duration={showAnimation ? 1500 : 0}
      />
      {onClick && <span className="sparks-plus">+</span>}
    </div>
  );
};

// Feature Card with Status
export const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: ReactNode;
  status: 'available' | 'beta' | 'coming-soon' | 'pro';
  onClick?: () => void;
  sparks?: number;
}> = ({ title, description, icon, status, onClick, sparks }) => {
  return (
    <MorphCard gradient={status === 'pro' ? 'gold' : 'purple-pink'}>
      <div className="feature-card" onClick={onClick}>
        <div className="feature-header">
          <div className="feature-icon">{icon}</div>
          <HoloBadge 
            text={status.toUpperCase().replace('-', ' ')} 
            type={status === 'available' ? 'hot' : status as any}
          />
        </div>
        <h3 className="feature-title">{title}</h3>
        <p className="feature-description">{description}</p>
        {sparks && (
          <div className="feature-cost">
            <SparksDisplay amount={sparks} size="sm" />
          </div>
        )}
      </div>
    </MorphCard>
  );
};
