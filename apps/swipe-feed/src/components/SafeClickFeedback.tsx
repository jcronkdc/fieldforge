/**
 * Safe Click Feedback - Minimal, non-breaking visual feedback
 * Only adds ripples without modifying element styles
 */

import React, { useEffect } from 'react';

export const SafeClickFeedback: React.FC = () => {
  useEffect(() => {
    // Create ripple container
    const rippleContainer = document.createElement('div');
    rippleContainer.id = 'safe-ripple-container';
    rippleContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(rippleContainer);

    // Simple ripple on click - no element modification
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Only add ripple for interactive elements
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button, a')
      ) {
        // Create ripple at click position
        const ripple = document.createElement('div');
        ripple.style.cssText = `
          position: absolute;
          left: ${e.clientX}px;
          top: ${e.clientY}px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(147, 51, 234, 0.8) 0%, rgba(147, 51, 234, 0.4) 50%, transparent 70%);
          transform: translate(-50%, -50%) scale(0);
          pointer-events: none;
        `;
        
        rippleContainer.appendChild(ripple);
        
        // Animate ripple
        requestAnimationFrame(() => {
          ripple.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
          ripple.style.transform = 'translate(-50%, -50%) scale(4)';
          ripple.style.opacity = '0';
        });
        
        // Remove after animation
        setTimeout(() => {
          ripple.remove();
        }, 600);
      }
    };

    // Add click listener
    document.addEventListener('click', handleClick, true);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick, true);
      rippleContainer.remove();
    };
  }, []);

  return null;
};

export default SafeClickFeedback;
