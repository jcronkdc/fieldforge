import React, { useState, useRef, useEffect } from 'react';
import { useSwipeGestures } from '../../hooks/useSwipeGestures';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
  threshold?: number;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className = '',
  threshold = 100
}) => {
  const [transform, setTransform] = useState({ x: 0, y: 0, rotation: 0, scale: 1 });
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const gestureState = useSwipeGestures({
    onSwipeLeft: () => {
      animateSwipe('left');
      onSwipeLeft?.();
    },
    onSwipeRight: () => {
      animateSwipe('right');
      onSwipeRight?.();
    },
    onSwipeUp: () => {
      animateSwipe('up');
      onSwipeUp?.();
    },
    onSwipeDown: () => {
      animateSwipe('down');
      onSwipeDown?.();
    },
    onPinch: (scale) => {
      setTransform(prev => ({ ...prev, scale: Math.min(Math.max(scale, 0.8), 1.5) }));
    },
    onDoubleTap: () => {
      // Reset transformation on double tap
      setTransform({ x: 0, y: 0, rotation: 0, scale: 1 });
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
  });

  const animateSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    setIsAnimating(true);
    
    const animations = {
      left: { x: -window.innerWidth, y: 0, rotation: -30 },
      right: { x: window.innerWidth, y: 0, rotation: 30 },
      up: { x: 0, y: -window.innerHeight, rotation: 0 },
      down: { x: 0, y: window.innerHeight, rotation: 0 }
    };

    setTransform({ ...animations[direction], scale: 0.8 });
    
    setTimeout(() => {
      setTransform({ x: 0, y: 0, rotation: 0, scale: 1 });
      setIsAnimating(false);
    }, 500);
  };

  // Update transform based on gesture state
  useEffect(() => {
    if (gestureState.isSwipping && !isAnimating) {
      const { direction, distance } = gestureState;
      
      let x = 0, y = 0, rotation = 0;
      
      if (direction === 'left' || direction === 'right') {
        x = direction === 'right' ? distance : -distance;
        rotation = (x / window.innerWidth) * 20;
      } else if (direction === 'up' || direction === 'down') {
        y = direction === 'down' ? distance : -distance;
      }

      setTransform(prev => ({ 
        ...prev, 
        x: x * 0.5, // Dampen the movement
        y: y * 0.5,
        rotation: rotation * 0.5
      }));
    } else if (!gestureState.isSwipping && !isAnimating) {
      // Snap back when not swiping
      setTransform(prev => ({ ...prev, x: 0, y: 0, rotation: 0 }));
    }
  }, [gestureState, isAnimating]);

  return (
    <div
      ref={cardRef}
      className={`
        relative touch-none select-none
        ${isAnimating ? 'transition-all duration-300 ease-out' : ''}
        ${className}
      `}
      style={{
        transform: `
          translateX(${transform.x}px) 
          translateY(${transform.y}px) 
          rotate(${transform.rotation}deg)
          scale(${transform.scale})
        `,
        willChange: 'transform'
      }}
    >
      {/* Swipe indicators */}
      {gestureState.isSwipping && (
        <>
          {gestureState.direction === 'right' && gestureState.distance > threshold / 2 && (
            <div className="absolute top-8 left-8 px-4 py-2 bg-green-500 text-white font-bold rounded-lg rotate-[-20deg] opacity-80">
              APPROVE
            </div>
          )}
          {gestureState.direction === 'left' && gestureState.distance > threshold / 2 && (
            <div className="absolute top-8 right-8 px-4 py-2 bg-red-500 text-white font-bold rounded-lg rotate-[20deg] opacity-80">
              REJECT
            </div>
          )}
          {gestureState.direction === 'up' && gestureState.distance > threshold / 2 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg opacity-80">
              SAVE
            </div>
          )}
        </>
      )}
      
      {children}
    </div>
  );
};
