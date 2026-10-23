import React from 'react';

interface Props {
  className?: string;
  size?: number;
}

export const BondBaseLogo: React.FC<Props> = ({ className = 'w-5 h-5', size }) => {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* Outer Benzene Ring */}
      <polygon
        points="18,3 29,9.5 29,22.5 18,29 7,22.5 7,9.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.9"
      />

      {/* Internal Delocalized Pi-Electron Resonance Ring */}
      <circle
        cx="18"
        cy="16"
        r="7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeDasharray="3 2"
        opacity="0.8"
      />

      {/* Central Chiral Stereocenter Nucleus */}
      <circle cx="18" cy="16" r="3" fill="currentColor" />

      {/* Hexagonal Vertex Atom Nodes */}
      <circle cx="18" cy="3" r="1.8" fill="currentColor" />
      <circle cx="29" cy="9.5" r="1.8" fill="currentColor" />
      <circle cx="29" cy="22.5" r="1.8" fill="currentColor" />
      <circle cx="18" cy="29" r="1.8" fill="currentColor" />
      <circle cx="7" cy="22.5" r="1.8" fill="currentColor" />
      <circle cx="7" cy="9.5" r="1.8" fill="currentColor" />

      {/* Dynamic Coordinate Bond Rays (Tetrahedral & Pi-Orbital Projection) */}
      <line
        x1="18"
        y1="16"
        x2="29"
        y2="9.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="18"
        y1="16"
        x2="7"
        y2="22.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="18"
        y1="16"
        x2="18"
        y2="33"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="2 2"
      />

      {/* Peripheral Orbital Satellite Node (Target Engagement) */}
      <circle cx="18" cy="33" r="2.2" fill="currentColor" />
      <circle cx="18" cy="33" r="1" fill="white" opacity="0.9" />
    </svg>
  );
};

