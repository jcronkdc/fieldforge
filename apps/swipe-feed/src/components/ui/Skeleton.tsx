/**
 * Skeleton Loader Component
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function Skeleton({ 
  className = '', 
  variant = 'text', 
  width, 
  height,
  count = 1 
}: SkeletonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-lg';
      case 'card':
        return 'rounded-xl';
      default:
        return 'rounded';
    }
  };

  const getDefaultDimensions = () => {
    switch (variant) {
      case 'circular':
        return { width: width || '40px', height: height || '40px' };
      case 'card':
        return { width: width || '100%', height: height || '200px' };
      case 'rectangular':
        return { width: width || '100%', height: height || '100px' };
      default:
        return { width: width || '100%', height: height || '20px' };
    }
  };

  const dimensions = getDefaultDimensions();

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`
            ${getVariantStyles()} 
            ${className}
            animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5
            background-animate
          `}
          style={{
            width: dimensions.width,
            height: dimensions.height,
            marginBottom: count > 1 && index < count - 1 ? '8px' : undefined,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        
        .background-animate {
          background-size: 200% 100%;
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

export function PostSkeleton() {
  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      {/* Author header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={48} height={48} />
          <div>
            <Skeleton width={120} height={16} className="mb-2" />
            <Skeleton width={80} height={14} />
          </div>
        </div>
        <Skeleton width={60} height={14} />
      </div>

      {/* Content */}
      <div className="mb-4">
        <Skeleton count={3} className="mb-2" />
        <Skeleton width="80%" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 pt-4 border-t border-white/5">
        <Skeleton width={50} height={20} />
        <Skeleton width={50} height={20} />
        <Skeleton width={50} height={20} />
      </div>
    </div>
  );
}

export function StorySkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Skeleton variant="rectangular" width={40} height={40} />
          <div>
            <Skeleton width={150} height={18} className="mb-2" />
            <Skeleton width={100} height={14} />
          </div>
        </div>
        <Skeleton width={50} height={14} />
      </div>
      
      <Skeleton count={2} className="mb-2" />
      
      <div className="flex items-center gap-4 mt-4">
        <Skeleton width={60} height={16} />
        <Skeleton width={60} height={16} />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton variant="circular" width={64} height={64} />
      <div className="flex-1">
        <Skeleton width={150} height={20} className="mb-2" />
        <Skeleton width={100} height={16} className="mb-2" />
        <div className="flex gap-4">
          <Skeleton width={80} height={14} />
          <Skeleton width={80} height={14} />
          <Skeleton width={80} height={14} />
        </div>
      </div>
    </div>
  );
}
