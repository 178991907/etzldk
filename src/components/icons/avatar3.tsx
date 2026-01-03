import React from 'react';

const Avatar3: React.FC = () => (
  <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="plane-grad" x1="0.5" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stopColor="#A2D2FF" />
        <stop offset="100%" stopColor="#BDE0FE" />
      </linearGradient>
    </defs>
    <path fill="#FF6B6B" d="M118 64L32 12 10 32l88 52z" />
    <path fill="url(#plane-grad)" d="M108 54L22 2 2 22l86 52z" />
    <path fill="#F5F5F5" d="M98 74a60.1 60.1 0 0 1-34-10L2 22 22 2l42 42c15.2-3.1 31.1 2.6 42 14 13.6 14.1 14.7 35.6 2 50-12.2 13.9-32.3 17.5-48 8z" />
    <circle fill="#333" cx="64" cy="64" r="8" />
  </svg>
);

export default Avatar3;
