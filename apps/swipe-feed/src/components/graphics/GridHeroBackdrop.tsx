import React from 'react';

export const GridHeroBackdrop: React.FC = () => {
  return (
    <img
      src="/hero-backdrop.svg"
      alt=""
      role="presentation"
      aria-hidden="true"
      width={1440}
      height={720}
      loading="eager"
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
};
