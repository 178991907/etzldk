'use client';
import React from 'react';

const Pet3: React.FC = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad-pet3-body" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#84DCC6" />
        <stop offset="100%" stopColor="#A5FFD6" />
      </linearGradient>
      <filter id="glow-pet3">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur" />
        <feOffset dx="1" dy="1" result="offsetBlur" />
        <feFlood floodColor="#A5FFD6" floodOpacity="0.5" result="offsetColor" />
        <feComposite in="offsetColor" in2="offsetBlur" operator="in" result="offsetBlur" />
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#glow-pet3)">
      {/* Body */}
      <path d="M 50,95 C 40,95 35,80 35,70 L 35,40 C 35,25 40,20 50,20 C 60,20 65,25 65,40 L 65,70 C 65,80 60,95 50,95 Z" fill="url(#grad-pet3-body)" />
      {/* Arms */}
      <path d="M 35,50 C 25,50 20,55 20,60 L 20,65 C 20,70 25,70 35,65 Z" fill="url(#grad-pet3-body)" />
      <path d="M 65,50 C 75,50 80,55 80,60 L 80,65 C 80,70 75,70 65,65 Z" fill="url(#grad-pet3-body)" />
      {/* Flower */}
      <circle cx="50" cy="18" r="7" fill="#FFB7C5" />
      <circle cx="50" cy="18" r="3" fill="#FFF" />
      {/* Eyes */}
      <circle cx="45" cy="45" r="3" fill="black" />
      <circle cx="55" cy="45" r="3" fill="black" />
    </g>
  </svg>
);

export default Pet3;
