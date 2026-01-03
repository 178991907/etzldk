'use client';
import React from 'react';

const Pet2: React.FC = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="grad-pet2-body" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--accent) / 0.7)', stopOpacity: 1 }} />
      </radialGradient>
      <filter id="glow-pet2" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#glow-pet2)">
      <path d="M50 10 Q 20 40, 50 90 Q 80 40, 50 10 Z" fill="url(#grad-pet2-body)" />
      {/* Spikes */}
      <path d="M40 15 L50 5 L60 15" fill="hsl(var(--accent) / 0.8)" />
      <path d="M25 40 L20 50 L35 50" fill="hsl(var(--accent) / 0.8)" />
      <path d="M75 40 L80 50 L65 50" fill="hsl(var(--accent) / 0.8)" />
      {/* Eyes */}
      <circle cx="45" cy="55" r="4" fill="white" />
      <circle cx="55" cy="55" r="4" fill="white" />
      <circle cx="46" cy="56" r="2" fill="black" />
      <circle cx="56" cy="56" r="2" fill="black" />
      {/* Mouth */}
      <path d="M 48 65 Q 50 70 52 65" stroke="black" strokeWidth="1" fill="none" />
    </g>
  </svg>
);

export default Pet2;
