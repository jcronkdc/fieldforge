import React from 'react';

export const GridHeroBackdrop: React.FC = () => {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1440 720"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="tower-stroke" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(15,76,129,0.55)" />
          <stop offset="100%" stopColor="rgba(15,76,129,0.15)" />
        </linearGradient>
        <linearGradient id="wire" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(17,118,161,0.32)" />
          <stop offset="100%" stopColor="rgba(17,118,161,0.12)" />
        </linearGradient>
        <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(720 360) rotate(90) scale(420 880)">
          <stop stopColor="rgba(15,76,129,0.18)" />
          <stop offset="1" stopColor="rgba(15,76,129,0)" />
        </radialGradient>
      </defs>

      <rect width="1440" height="720" fill="url(#glow)" />

      <g opacity="0.4" stroke="url(#tower-stroke)" strokeWidth="1.2">
        <path d="M160 560 L220 160 L280 560" />
        <path d="M220 160 L340 160" strokeDasharray="6 6" />
        <path d="M340 560 L400 200 L460 560" />
        <path d="M400 200 L530 200" strokeDasharray="6 6" />
        <path d="M540 560 L610 240 L680 560" />
        <path d="M610 240 L760 240" strokeDasharray="6 6" />
        <path d="M780 560 L850 220 L920 560" />
        <path d="M850 220 L980 220" strokeDasharray="6 6" />
        <path d="M990 560 L1050 170 L1110 560" />
        <path d="M1050 170 L1190 170" strokeDasharray="6 6" />
        <path d="M1200 560 L1260 210 L1320 560" />
      </g>

      <g opacity="0.35" stroke="url(#wire)" strokeWidth="1.1">
        <path d="M160 340 C250 300 350 300 440 340" />
        <path d="M440 340 C530 380 630 380 720 340" />
        <path d="M720 340 C810 300 910 300 1000 340" />
        <path d="M1000 340 C1090 380 1190 380 1280 340" />
      </g>

      <g opacity="0.3">
        <ellipse cx="240" cy="420" rx="28" ry="160" fill="rgba(17,118,161,0.08)" />
        <ellipse cx="600" cy="400" rx="34" ry="190" fill="rgba(17,118,161,0.08)" />
        <ellipse cx="960" cy="410" rx="30" ry="170" fill="rgba(17,118,161,0.07)" />
        <ellipse cx="1220" cy="420" rx="26" ry="150" fill="rgba(17,118,161,0.06)" />
      </g>
    </svg>
  );
};
