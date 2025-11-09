/**
 * Enhanced Selection Feedback Component
 * Makes button selections SUPER obvious with visual and audio feedback
 */

import React, { useEffect } from 'react';

export const EnhancedSelectionFeedback: React.FC = () => {
  useEffect(() => {
    // Add visual feedback to all button clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button');
      
      if (button && !button.disabled) {
        // Add a temporary flash effect
        button.style.transition = 'all 0.1s ease';
        button.style.transform = 'scale(0.95)';
        button.style.boxShadow = 'inset 0 0 30px rgba(6, 182, 212, 0.6)';
        
        setTimeout(() => {
          button.style.transform = '';
          button.style.boxShadow = '';
        }, 150);
        
        // Add ripple effect at click position
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.style.cssText = `
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.6) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 1000;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        // Animate ripple
        requestAnimationFrame(() => {
          ripple.style.transition = 'width 0.6s ease, height 0.6s ease, opacity 0.6s ease';
          ripple.style.width = '200px';
          ripple.style.height = '200px';
          ripple.style.opacity = '0';
        });
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      }
    };
    
    // Add hover enhancement
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const button = target.closest('button');
      
      if (button && !button.disabled) {
        button.style.transition = 'all 0.2s ease';
        button.style.transform = 'scale(1.05)';
      }
    };
    
    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const button = target.closest('button');
      
      if (button && !button.disabled) {
        button.style.transform = 'scale(1)';
      }
    };
    
    // Add keyboard feedback
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'BUTTON') {
          target.style.transform = 'scale(0.95)';
          target.style.boxShadow = 'inset 0 0 30px rgba(6, 182, 212, 0.6)';
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'BUTTON') {
          target.style.transform = '';
          target.style.boxShadow = '';
        }
      }
    };
    
    // Attach event listeners
    document.addEventListener('click', handleClick, true);
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
    };
  }, []);
  
  return null;
};

export default EnhancedSelectionFeedback;
