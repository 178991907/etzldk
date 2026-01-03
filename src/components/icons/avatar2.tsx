import React from 'react';

const Avatar2: React.FC = () => (
  <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="car-grad" x1="0.5" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stopColor="#4ECDC4" />
        <stop offset="100%" stopColor="#58D6C9" />
      </linearGradient>
    </defs>
    <path fill="#333" d="M110.5 108a12 12 0 1 1-24 0 12 12 0 0 1 24 0zM41.5 108a12 12 0 1 1-24 0 12 12 0 0 1 24 0z" />
    <path fill="url(#car-grad)" d="M118 70v20H10v-20c0-11 9-20 20-20h68c11 0 20 9 20 20z" />
    <path fill="#FFF" d="M88 50H40c-2.2 0-4 1.8-4 4v16h56V54c0-2.2-1.8-4-4-4z" opacity="0.8" />
    <ellipse fill="#FFD166" cx="22" cy="70" rx="6" ry="6" />
    <ellipse fill="#FFD166" cx="106" cy="70" rx="6" ry="6" />
  </svg>
);

export default Avatar2;
