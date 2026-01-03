import React from 'react';

const Avatar8: React.FC = () => (
  <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="monster-grad" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#80E2FF" />
        <stop offset="100%" stopColor="#55C0E0" />
      </radialGradient>
    </defs>
    <circle cx="64" cy="64" r="54" fill="url(#monster-grad)" />
    <circle cx="64" cy="54" r="24" fill="#fff" />
    <circle cx="64" cy="54" r="12" fill="#333" />
    <path d="M44,84 C54,100 74,100 84,84" fill="none" stroke="#333" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

export default Avatar8;
