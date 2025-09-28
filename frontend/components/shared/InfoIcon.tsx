import React from 'react';

export const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="20"
    height="20"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path stroke="currentColor" strokeWidth="2" d="M12 16v-4m0-4h.01" />
  </svg>
);