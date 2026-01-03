import React from 'react';

const Avatar9: React.FC = () => (
  <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dino-grad" x1=".5" y1="0" x2=".5" y2="1">
        <stop offset="0%" stopColor="#9AEEA2" />
        <stop offset="100%" stopColor="#65D46E" />
      </linearGradient>
    </defs>
    <path fill="url(#dino-grad)" d="M102,52c-4,0-6,4-12,6-10,3-18-3-24-10-6-7-10-15-18-16-8-1-14,5-20,10-10,8-22,8-30,0-2-2-2-5-1-7,4-8,14-12,22-10,10,2,18,12,28,14,10,2,20-4,28-12,8-8,14-19,26-20,12-1,22,8,22,20,0,12-10,22-22,23-11,1-19-6-27-12-3-2-6-4-8-4z" transform="translate(0, 10)" />
    <path fill="#43A047" d="M30 98c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-7.5 5.2-13.8 12-15.5V40h8v42.5c6.8 1.7 12 8 12 15.5z" />
    <path fill="#43A047" d="M114 98c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-7.5 5.2-13.8 12-15.5V60h8v22.5c6.8 1.7 12 8 12 15.5z" />
    <circle fill="#FFF" cx="88" cy="50" r="10" />
    <circle fill="#000" cx="88" cy="50" r="5" />
  </svg>
);

export default Avatar9;
