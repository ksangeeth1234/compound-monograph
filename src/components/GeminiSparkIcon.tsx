import React from 'react';

interface GeminiSparkIconProps {
  className?: string;
  size?: number;
  filled?: boolean;
  strokeColor?: string;
}

/**
 * High-fidelity Google Gemini 4-pointed Spark Icon:
 * - 4-pointed diamond star with smooth concave curves
 * - Translucent center fill
 * - High-contrast outer stroke using currentColor or customizable strokeColor
 */
export const GeminiSparkIcon: React.FC<GeminiSparkIconProps> = ({
  className = 'w-4 h-4',
  size,
  filled = true,
  strokeColor = 'currentColor',
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      aria-hidden="true"
    >
      {/* Center translucent fill */}
      {filled && (
        <path
          d="M50 8C52 30 70 48 92 50C70 52 52 70 50 92C48 70 30 52 8 50C30 48 48 30 50 8Z"
          fill={strokeColor}
          fillOpacity="0.22"
        />
      )}

      {/* Top quadrant curve with rounded line caps */}
      <path
        d="M50 10C51.5 28 68 45 88 50"
        stroke={strokeColor}
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Right-to-bottom quadrant curve */}
      <path
        d="M88 50C68 55 51.5 72 50 90"
        stroke={strokeColor}
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Bottom-to-left quadrant curve */}
      <path
        d="M50 90C48.5 72 32 55 12 50"
        stroke={strokeColor}
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Left-to-top quadrant curve */}
      <path
        d="M12 50C32 45 48.5 28 50 10"
        stroke={strokeColor}
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
};
