/**
 * AuthForm Click Fix - Ensures sign in button always works
 */

import { useEffect } from 'react';

export const AuthFormFix: React.FC = () => {
  useEffect(() => {
    // Fix auth form buttons
    const fixAuthButtons = () => {
      // Find all potential auth buttons
      const selectors = [
        'button[type="submit"]',
        'form button',
        'button:contains("Sign")',
        'button:contains("Login")',
        '.auth-form button',
        '[class*="AuthForm"] button'
      ];
      
      // Get all buttons
      const buttons = document.querySelectorAll(selectors.join(', '));
      
      buttons.forEach(button => {
        const btn = button as HTMLButtonElement;
        
        // Ensure button is clickable
        btn.style.pointerEvents = 'auto';
        btn.style.cursor = 'pointer';
        btn.style.position = 'relative';
        btn.style.zIndex = '1000';
        
        // Remove any transform that might interfere
        if (btn.style.transform && btn.style.transform.includes('scale(0)')) {
          btn.style.transform = 'none';
        }
        
        // Ensure it's visible
        btn.style.opacity = '1';
        btn.style.visibility = 'visible';
        
        // Add direct click handler if missing
        if (!btn.onclick && btn.type === 'submit') {
          btn.onclick = (e) => {
            // Let form handle submission
            const form = btn.closest('form');
            if (form) {
              // Check if form has submit handler
              const submitEvent = new Event('submit', {
                bubbles: true,
                cancelable: true
              });
              
              // Trigger form submission
              if (!form.dispatchEvent(submitEvent)) {
                e.preventDefault();
              }
            }
          };
        }
      });
      
      // Also fix form submission
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        const formEl = form as HTMLFormElement;
        
        // Ensure form is not blocked
        formEl.style.pointerEvents = 'auto';
        formEl.style.position = 'relative';
        formEl.style.zIndex = '100';
        
        // Log form submissions for debugging
        if (!formEl.dataset.fixApplied) {
          formEl.dataset.fixApplied = 'true';
          
          const originalSubmit = formEl.onsubmit;
          formEl.onsubmit = function(e) {
            if (originalSubmit) {
              return originalSubmit.call(this, e);
            }
            return true;
          };
        }
      });
    };
    
    // Apply fixes on initialization
    fixAuthButtons();
    
    // Reapply on DOM changes
    const observer = new MutationObserver(() => {
      requestAnimationFrame(fixAuthButtons);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Also fix on click to ensure it works
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if it's a submit button
      if (target.tagName === 'BUTTON' && (target as HTMLButtonElement).type === 'submit') {
        // Ensure the click goes through
        e.stopPropagation = () => {};
        
        // Find the form
        const form = target.closest('form');
        if (form && e.defaultPrevented) {
          e.preventDefault();
          form.requestSubmit(target as HTMLButtonElement);
        }
      }
    };
    
    document.addEventListener('click', handleClick, true);
    
    return () => {
      observer.disconnect();
      document.removeEventListener('click', handleClick, true);
    };
  }, []);
  
  return null;
};

export default AuthFormFix;
