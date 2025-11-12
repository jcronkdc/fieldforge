/**
 * FUTURISTIC MODAL - Reusable Cyber Modal Component
 */

import React, { useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export const FuturisticModal: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Modal Container with animation */}
      <div className={`relative ${sizeClasses[size]} w-full animate-modal-enter`}>
        {/* Holographic border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
        
        {/* Modal Content */}
        <div className="relative bg-black/95 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden">
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="border-b border-cyan-500/20 px-6 py-4">
              <div className="flex items-center justify-between">
                {title && (
                  <h2 className="text-xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent tracking-tight uppercase">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="ml-auto p-2 hover:bg-white/5 rounded-lg transition-all text-gray-500 hover:text-cyan-400"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Body */}
          <div className="p-6 text-white">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const FuturisticConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'CONFIRM',
  cancelText = 'CANCEL',
  variant = 'info'
}) => {
  const variantColors = {
    danger: 'from-red-500 to-orange-500',
    warning: 'from-yellow-500 to-orange-500',
    info: 'from-cyan-500 to-blue-500'
  };

  const variantBorders = {
    danger: 'border-red-500/30',
    warning: 'border-yellow-500/30',
    info: 'border-cyan-500/30'
  };

  return (
    <FuturisticModal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center">
        {/* Icon */}
        <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${variantColors[variant]} p-0.5`}>
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
            {variant === 'danger' && (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            )}
            {variant === 'warning' && (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            )}
            {variant === 'info' && (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            )}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">{title}</h3>
        <p className="text-gray-400 mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-black border border-gray-700 rounded-lg text-gray-400 font-bold uppercase tracking-wider text-sm hover:border-gray-600 hover:text-white transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-3 bg-gradient-to-r ${variantColors[variant]} rounded-lg text-black font-black uppercase tracking-wider text-sm hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </FuturisticModal>
  );
};

// Loading Modal
export const FuturisticLoadingModal: React.FC<{ isOpen: boolean; message?: string }> = ({ 
  isOpen, 
  message = 'PROCESSING' 
}) => {
  return (
    <FuturisticModal isOpen={isOpen} onClose={() => {}} size="sm" showCloseButton={false}>
      <div className="text-center py-8">
        {/* Animated Loading Spinner */}
        <div className="w-20 h-20 mx-auto mb-6 relative">
          <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-transparent border-b-blue-400 rounded-full animate-spin-reverse"></div>
        </div>
        
        <p className="text-cyan-400 font-black uppercase tracking-wider animate-pulse">
          {message}
        </p>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-4">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </FuturisticModal>
  );
};

export default FuturisticModal;
