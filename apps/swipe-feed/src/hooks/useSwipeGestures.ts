import { useCallback, useEffect, useRef, useState } from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null;

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onRotate?: (angle: number) => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
}

interface GestureState {
  isSwipping: boolean;
  direction: SwipeDirection;
  distance: number;
  velocity: number;
  isPinching: boolean;
  pinchScale: number;
  isRotating: boolean;
  rotationAngle: number;
}

const INITIAL_GESTURE_STATE: GestureState = {
  isSwipping: false,
  direction: null,
  distance: 0,
  velocity: 0,
  isPinching: false,
  pinchScale: 1,
  isRotating: false,
  rotationAngle: 0,
};

const MIN_SWIPE_DISTANCE_PX = 50;
const MAX_SWIPE_TIME_MS = 500;
const DOUBLE_TAP_DELAY_MS = 300;
const LONG_PRESS_DELAY_MS = 500;

/**
 * Handle mobile touch gestures (swipe, pinch, rotate, long-press) via declarative handlers.
 * @param handlers Gesture callbacks to invoke during touch interactions.
 * @returns Current gesture state snapshot.
 */
export const useSwipeGestures = (handlers: SwipeHandlers): GestureState => {
  const [gestureState, setGestureState] = useState<GestureState>(INITIAL_GESTURE_STATE);
  const gestureStateRef = useRef<GestureState>(INITIAL_GESTURE_STATE);
  const handlersRef = useRef<SwipeHandlers>(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const setGestureStateSafe = useCallback(
    (updater: GestureState | ((prev: GestureState) => GestureState)) => {
      setGestureState((prev) => {
        const next = typeof updater === 'function' ? (updater as (prev: GestureState) => GestureState)(prev) : updater;
        gestureStateRef.current = next;
        return next;
      });
    },
    []
  );

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pinchStartDistanceRef = useRef<number>(0);
  const rotationStartAngleRef = useRef<number>(0);

  useEffect(() => {
    const getDistance = (touch1: Touch, touch2: Touch) => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getAngle = (touch1: Touch, touch2: Touch) => {
      return Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * 180 / Math.PI;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        };

        // Check for double tap
        const now = Date.now();
        if (now - lastTapRef.current < DOUBLE_TAP_DELAY_MS) {
          handlersRef.current.onDoubleTap?.();
          lastTapRef.current = 0;
        } else {
          lastTapRef.current = now;
        }

        // Start long press timer
        longPressTimerRef.current = setTimeout(() => {
          handlersRef.current.onLongPress?.();
          // Add haptic feedback if available
          if ('vibrate' in navigator) {
            navigator.vibrate(50);
          }
        }, LONG_PRESS_DELAY_MS);

        setGestureStateSafe(prev => ({ ...prev, isSwipping: true }));
      } else if (e.touches.length === 2) {
        // Initialize pinch/rotate
        const distance = getDistance(e.touches[0], e.touches[1]);
        const angle = getAngle(e.touches[0], e.touches[1]);
        
        pinchStartDistanceRef.current = distance;
        rotationStartAngleRef.current = angle;
        
        setGestureStateSafe(prev => ({
          ...prev,
          isPinching: true,
          isRotating: true,
          pinchScale: 1,
          rotationAngle: 0
        }));
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Clear long press timer on move
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (e.touches.length === 1 && touchStartRef.current) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = touch.clientY - touchStartRef.current.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        let direction: SwipeDirection = null;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }

        setGestureStateSafe(prev => ({
          ...prev,
          direction,
          distance,
          velocity: distance / (Date.now() - touchStartRef.current!.time)
        }));
      } else if (e.touches.length === 2) {
        // Handle pinch
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / pinchStartDistanceRef.current;
        
        // Handle rotation
        const currentAngle = getAngle(e.touches[0], e.touches[1]);
        const rotation = currentAngle - rotationStartAngleRef.current;

        setGestureStateSafe(prev => ({
          ...prev,
          pinchScale: scale,
          rotationAngle: rotation
        }));

        handlersRef.current.onPinch?.(scale);
        handlersRef.current.onRotate?.(rotation);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Clear long press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (touchStartRef.current && gestureStateRef.current.isSwipping) {
        const deltaTime = Date.now() - touchStartRef.current.time;
        
        if (deltaTime < MAX_SWIPE_TIME_MS && gestureStateRef.current.distance > MIN_SWIPE_DISTANCE_PX) {
          // Valid swipe detected
          switch (gestureStateRef.current.direction) {
            case 'left':
              handlersRef.current.onSwipeLeft?.();
              break;
            case 'right':
              handlersRef.current.onSwipeRight?.();
              break;
            case 'up':
              handlersRef.current.onSwipeUp?.();
              break;
            case 'down':
              handlersRef.current.onSwipeDown?.();
              break;
          }
        }
      }

      // Reset state
      touchStartRef.current = null;
      setGestureStateSafe(INITIAL_GESTURE_STATE);
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [setGestureStateSafe]);

  return gestureState;
};
