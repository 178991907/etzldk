'use client';
import React from 'react';

const Pet4: React.FC = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad-pet4-body" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#D4A373" />
        <stop offset="100%" stopColor="#FDEBD0" />
      </linearGradient>
      <filter id="shadow-pet4" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.2" />
      </filter>
    </defs>
    <g filter="url(#shadow-pet4)">
      {/* Main Body */}
      <rect x="25" y="30" width="50" height="50" rx="10" ry="10" fill="url(#grad-pet4-body)" />
      {/* Screen */}
      <rect x="35" y="40" width="30" height="20" rx="5" ry="5" fill="#2C3E50" />
      {/* Screen reflection */}
      <path d="M 37 42 L 45 42 L 37 50 Z" fill="white" opacity="0.1" />
      {/* Buttons */}
      <circle cx="72" cy="45" r="3" fill="#E74C3C" />
      <circle cx="72" cy="55" r="3" fill="#2ECC71" />
      {/* Legs */}
      <rect x="35" y="80" width="10" height="5" rx="2" fill="#A97C50" />
      <rect x="55" y="80" width="10" height="5" rx="2" fill="#A97C50" />
    </g>
  </svg>
);

export default Pet4;
