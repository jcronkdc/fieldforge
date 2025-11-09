import React, { useRef, useState, useEffect } from 'react';

interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  interactive?: boolean;
}

export const HolographicCard: React.FC<HolographicCardProps> = ({
  children,
  className = '',
  intensity = 'medium',
  interactive = true
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);

  const intensityMap = {
    low: { tilt: 5, glow: 0.3, depth: 5 },
    medium: { tilt: 15, glow: 0.5, depth: 10 },
    high: { tilt: 25, glow: 0.7, depth: 20 }
  };

  const settings = intensityMap[intensity];

  useEffect(() => {
    if (!interactive || !cardRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      setMousePosition({ x, y });
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
      setIsHovered(false);
      setMousePosition({ x: 0.5, y: 0.5 });
    };

    const card = cardRef.current;
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [interactive]);

  const rotateX = interactive ? (mousePosition.y - 0.5) * -settings.tilt : 0;
  const rotateY = interactive ? (mousePosition.x - 0.5) * settings.tilt : 0;

  return (
    <div
      ref={cardRef}
      className={`holographic-card ${className}`}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
    >
      <div
        className="holographic-inner"
        style={{
          transform: `
            rotateX(${rotateX}deg) 
            rotateY(${rotateY}deg)
            ${isHovered ? `translateZ(${settings.depth}px)` : ''}
          `,
          transition: isHovered ? 'transform 0.1s ease' : 'transform 0.3s ease',
          transformStyle: 'preserve-3d',
          position: 'relative',
          width: '100%',
          height: '100%'
        }}
      >
        {/* Holographic layers */}
        <div
          className="holographic-layer-1"
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              linear-gradient(
                ${45 + rotateY * 2}deg,
                transparent 30%,
                rgba(0, 255, 255, ${settings.glow * 0.3}) 45%,
                rgba(255, 0, 255, ${settings.glow * 0.2}) 55%,
                transparent 70%
              )
            `,
            transform: 'translateZ(2px)',
            pointerEvents: 'none',
            mixBlendMode: 'screen',
            opacity: isHovered ? 1 : 0.7
          }}
        />
        
        <div
          className="holographic-layer-2"
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(
                circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                rgba(251, 191, 36, ${settings.glow * 0.4}),
                transparent 50%
              )
            `,
            transform: 'translateZ(4px)',
            pointerEvents: 'none',
            mixBlendMode: 'overlay'
          }}
        />

        {/* Main content */}
        <div
          className="holographic-content"
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderImage: `
              linear-gradient(
                ${90 + rotateY}deg,
                rgba(251, 191, 36, 0.8),
                rgba(0, 255, 255, 0.5),
                rgba(255, 0, 255, 0.5),
                rgba(251, 191, 36, 0.8)
              ) 1
            `,
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: `
              0 10px 40px rgba(0, 0, 0, 0.5),
              inset 0 0 30px rgba(251, 191, 36, ${settings.glow * 0.1}),
              0 0 ${isHovered ? 40 : 20}px rgba(251, 191, 36, ${settings.glow * 0.3})
            `
          }}
        >
          {children}

          {/* Scan line effect */}
          <div
            className="holographic-scanline"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.8), transparent)',
              animation: 'aiScanLine 3s linear infinite',
              pointerEvents: 'none'
            }}
          />
        </div>

        {/* Holographic dots grid */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            transform: 'translateZ(6px)',
            opacity: 0.3
          }}
        >
          <defs>
            <pattern id="holoDots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="rgba(251, 191, 36, 0.5)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#holoDots)" />
        </svg>
      </div>
    </div>
  );
};
