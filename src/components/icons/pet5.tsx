'use client';
import React from 'react';

const Pet5: React.FC = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="grad-pet5-body" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="white" />
        <stop offset="100%" stopColor="#E3F2FD" />
      </radialGradient>
      <filter id="soft-glow-pet5">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
      </filter>
    </defs>
    <g>
      {/* Soft glow background */}
      <circle cx="50" cy="60" r="35" fill="#E3F2FD" filter="url(#soft-glow-pet5)" />
      {/* Main cloud body */}
      <path d="M 25 70 A 20 20 0 0 1 50 50 A 20 20 0 0 1 75 70 Z" fill="url(#grad-pet5-body)" />
      <circle cx="35" cy="70" r="20" fill="url(#grad-pet5-body)" />
      <circle cx="65" cy="70" r="20" fill="url(#grad-pet5-body)" />
      <circle cx="50" cy="70" r="25" fill="url(#grad-pet5-body)" />
      {/* Eyes */}
      <circle cx="42" cy="65" r="3" fill="black" />
      <circle cx="58" cy="65" r="3" fill="black" />
      {/* Mouth */}
      <path d="M 48 75 A 5 5 0 0 0 52 75" stroke="black" strokeWidth="1.5" fill="none" />
      {/* Blush */}
      <ellipse cx="35" cy="72" rx="5" ry="3" fill="hsl(var(--primary) / 0.3)" />
      <ellipse cx="65" cy="72" rx="5" ry="3" fill="hsl(var(--primary) / 0.3)" />
    </g>
  </svg>
);

export default Pet5;
