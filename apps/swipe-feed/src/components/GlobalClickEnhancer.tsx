/**
 * Global Click Enhancer - Ensures EVERYTHING is clickable site-wide
 * Runs at the root level to catch all elements
 */

import { useEffect } from 'react';

export const GlobalClickEnhancer: React.FC = () => {
  useEffect(() => {
    // Create global ripple container
    const rippleContainer = document.createElement('div');
    rippleContainer.id = 'global-ripple-container';
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

    // Global click enhancer
    const enhanceClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      
      // Get click coordinates
      let x: number, y: number;
      if (e instanceof MouseEvent) {
        x = e.clientX;
        y = e.clientY;
      } else {
        const touch = e.touches[0] || e.changedTouches[0];
        x = touch.clientX;
        y = touch.clientY;
      }
      
      // Check if element is interactive
      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.role === 'button' ||
        target.role === 'link' ||
        target.role === 'checkbox' ||
        target.role === 'radio' ||
        target.onclick !== null ||
        target.getAttribute('onclick') !== null ||
        target.classList.contains('clickable') ||
        target.closest('button, a, [role="button"], [onclick]') !== null;
      
      if (isInteractive) {
        // Create ripple effect
        createRipple(x, y, rippleContainer);
        
        // Add visual feedback to element
        addElementFeedback(target);
        
        // Ensure cursor is correct
        (target as HTMLElement).style.cursor = 'pointer';
      }
    };
    
    // Create ripple animation
    const createRipple = (x: number, y: number, container: HTMLElement) => {
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(147, 51, 234, 0.6) 0%, transparent 70%);
        transform: translate(-50%, -50%) scale(0);
        animation: globalRipple 0.8s ease-out;
        pointer-events: none;
      `;
      
      // Add animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes globalRipple {
          to {
            transform: translate(-50%, -50%) scale(6);
            opacity: 0;
          }
        }
      `;
      if (!document.head.querySelector('#global-ripple-style')) {
        style.id = 'global-ripple-style';
        document.head.appendChild(style);
      }
      
      container.appendChild(ripple);
      
      // Remove ripple after animation
      setTimeout(() => {
        ripple.remove();
      }, 800);
    };
    
    // Add element feedback
    const addElementFeedback = (element: HTMLElement) => {
      const clickable = element.closest('button, a, [role="button"], [onclick]') as HTMLElement || element;
      
      // Store original values
      const originalTransform = clickable.style.transform;
      const originalFilter = clickable.style.filter;
      const originalTransition = clickable.style.transition;
      
      // Apply feedback
      clickable.style.transition = 'all 0.1s ease';
      clickable.style.transform = 'scale(0.97)';
      clickable.style.filter = 'brightness(1.1)';
      
      // Add glow class
      clickable.classList.add('global-clicked');
      
      // Restore after animation
      setTimeout(() => {
        clickable.style.transform = originalTransform || '';
        clickable.style.filter = originalFilter || '';
        clickable.classList.remove('global-clicked');
        
        setTimeout(() => {
          clickable.style.transition = originalTransition || '';
        }, 100);
      }, 150);
    };
    
    // Enhance all existing clickable elements
    const enhanceAllElements = () => {
      const selectors = [
        'button',
        'a',
        'input[type="submit"]',
        'input[type="button"]',
        'input[type="checkbox"]',
        'input[type="radio"]',
        '[role="button"]',
        '[role="link"]',
        '[role="menuitem"]',
        '[role="tab"]',
        '[onclick]',
        '[onClick]',
        '.clickable',
        '.btn',
        '.button'
      ];
      
      const elements = document.querySelectorAll(selectors.join(', '));
      
      elements.forEach((el) => {
        const element = el as HTMLElement;
        
        // Ensure proper cursor
        if (!element.style.cursor || element.style.cursor === 'auto') {
          element.style.cursor = 'pointer';
        }
        
        // Add hover class for CSS
        if (!element.classList.contains('global-interactive')) {
          element.classList.add('global-interactive');
        }
        
        // Ensure it's not disabled
        if (!(element as any).disabled && element.getAttribute('aria-disabled') !== 'true') {
          // Make sure it has proper tabindex for keyboard
          if (!element.hasAttribute('tabindex') && element.tagName !== 'BUTTON' && element.tagName !== 'A') {
            element.setAttribute('tabindex', '0');
          }
        }
      });
    };
    
    // Run enhancement immediately
    enhanceAllElements();
    
    // Re-run on DOM changes
    const observer = new MutationObserver(() => {
      requestAnimationFrame(enhanceAllElements);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['onclick', 'disabled', 'aria-disabled', 'role']
    });
    
    // Add event listeners
    document.addEventListener('click', enhanceClick, true);
    document.addEventListener('touchstart', enhanceClick, { passive: true, capture: true });
    
    // Add global styles
    const globalStyles = document.createElement('style');
    globalStyles.id = 'global-click-enhancer-styles';
    globalStyles.textContent = `
      /* Global interactive class */
      .global-interactive {
        transition: all 0.2s ease !important;
        cursor: pointer !important;
      }
      
      .global-interactive:hover:not(:disabled) {
        filter: brightness(1.08) !important;
        transform: translateY(-1px) !important;
      }
      
      .global-clicked {
        box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.4) !important;
        animation: globalClickPulse 0.3s ease-out !important;
      }
      
      @keyframes globalClickPulse {
        0% {
          box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.6);
        }
        100% {
          box-shadow: 0 0 0 10px rgba(147, 51, 234, 0);
        }
      }
      
      /* Ensure all buttons are visible */
      button, a, [role="button"] {
        opacity: 1 !important;
        visibility: visible !important;
      }
      
      /* Force pointer on hover */
      *:hover {
        cursor: default;
      }
      
      button:hover,
      a:hover,
      [role="button"]:hover,
      [onclick]:hover,
      input[type="submit"]:hover,
      input[type="button"]:hover,
      .clickable:hover {
        cursor: pointer !important;
      }
    `;
    document.head.appendChild(globalStyles);
    
    // Log enhancement
    console.log('[GLOBAL CLICK ENHANCER] Active - All elements enhanced');
    
    // Cleanup
    return () => {
      document.removeEventListener('click', enhanceClick, true);
      document.removeEventListener('touchstart', enhanceClick);
      observer.disconnect();
      rippleContainer.remove();
      globalStyles.remove();
      const rippleStyle = document.querySelector('#global-ripple-style');
      if (rippleStyle) rippleStyle.remove();
    };
  }, []);
  
  return null;
};

export default GlobalClickEnhancer;
