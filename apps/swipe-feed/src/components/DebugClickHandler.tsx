/**
 * Debug Click Handler - Ensures all buttons and links are clickable
 * Emergency fix for non-responsive UI
 */

import React, { useEffect } from 'react';

export const DebugClickHandler: React.FC = () => {
  useEffect(() => {
    // Add global click handler debugger
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Log all clicks for debugging
      console.log('[CLICK DEBUG]', {
        element: target.tagName,
        className: target.className,
        id: target.id,
        text: target.textContent?.substring(0, 50),
        hasOnClick: !!target.onclick,
        parentHasOnClick: !!(target.parentElement as any)?.onclick,
        isButton: target.tagName === 'BUTTON',
        isLink: target.tagName === 'A',
        isDisabled: (target as any).disabled,
        path: e.composedPath().map((el: any) => el.tagName).filter(Boolean).join(' > ')
      });
      
      // Check if click is being blocked
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.role === 'button') {
        // Force propagation
        e.stopPropagation = () => {};
        
        // If button has no handler, try to find one
        if (!target.onclick && target.tagName === 'BUTTON') {
          // Look for React event handlers
          const reactProps = Object.keys(target).find(key => key.startsWith('__reactProps'));
          if (reactProps) {
            const props = (target as any)[reactProps];
            if (props?.onClick) {
              console.log('[CLICK DEBUG] Found React onClick, calling it');
              props.onClick(e);
            }
          }
        }
      }
    };
    
    // Attach click handler with capture to catch all events
    document.addEventListener('click', handleGlobalClick, true);
    
    // Fix all buttons on page load
    const fixButtons = () => {
      const buttons = document.querySelectorAll('button, [role="button"], a[href]');
      let fixedCount = 0;
      
      buttons.forEach((btn) => {
        const element = btn as HTMLElement;
        
        // Ensure button is not disabled
        if (element.tagName === 'BUTTON' && !(element as HTMLButtonElement).disabled) {
          // Make sure button has proper styles
          if (!element.style.cursor) {
            element.style.cursor = 'pointer';
          }
          
          // Check for React handlers
          const reactProps = Object.keys(element).find(key => key.startsWith('__reactProps'));
          if (reactProps) {
            const props = (element as any)[reactProps];
            if (props?.onClick && !element.onclick) {
              // Attach a direct handler that calls the React handler
              element.onclick = (e) => {
                console.log('[CLICK FIX] Calling React handler for:', element.textContent);
                props.onClick(e);
              };
              fixedCount++;
            }
          }
        }
        
        // Fix links
        if (element.tagName === 'A' && element.getAttribute('href')) {
          element.style.cursor = 'pointer';
          if (!element.onclick) {
            element.onclick = (e) => {
              const href = element.getAttribute('href');
              if (href && !href.startsWith('http')) {
                e.preventDefault();
                console.log('[CLICK FIX] Navigating to:', href);
                window.location.pathname = href;
              }
            };
            fixedCount++;
          }
        }
      });
      
      if (fixedCount > 0) {
        console.log(`[CLICK FIX] Fixed ${fixedCount} buttons/links`);
      }
    };
    
    // Fix buttons immediately
    fixButtons();
    
    // Fix buttons after any DOM changes
    const observer = new MutationObserver(() => {
      requestAnimationFrame(fixButtons);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'onclick']
    });
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
      observer.disconnect();
    };
  }, []);
  
  // Visual indicator that debug mode is active
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 left-4 z-[9999] bg-red-500 text-white px-2 py-1 text-xs rounded animate-pulse">
        DEBUG MODE
      </div>
    );
  }
  
  return null;
};

export default DebugClickHandler;
