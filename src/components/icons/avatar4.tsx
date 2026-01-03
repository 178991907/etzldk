import React from 'react';

const Avatar4: React.FC = () => (
  <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="planet-grad" cx="0.3" cy="0.3" r="0.7">
        <stop offset="0%" stopColor="#FFD166" />
        <stop offset="100%" stopColor="#F9A825" />
      </radialGradient>
    </defs>
    <circle fill="url(#planet-grad)" cx="64" cy="64" r="54" />
    <ellipse transform="rotate(-30 64 64)" cx="64" cy="64" rx="70" ry="20" stroke="#FF6B6B" strokeWidth="8" fill="none" />
  </svg>
);

export default Avatar4;
