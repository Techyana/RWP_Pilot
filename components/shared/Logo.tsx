import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 160 50"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Ricoh Workshop Portal Logo"
  >
    <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className="text-brand-primary" style={{stopColor: 'currentColor' }} />
            <stop offset="100%" className="text-brand-secondary" style={{stopColor: 'currentColor' }} />
        </linearGradient>
    </defs>
    <text
      x="0"
      y="40"
      fontFamily="Arial, sans-serif"
      fontSize="48"
      fontWeight="bold"
      fill="url(#logoGradient)"
    >
      R<tspan fill="currentColor" className="text-gray-600 dark:text-gray-300">W</tspan>P
    </text>
  </svg>
);
