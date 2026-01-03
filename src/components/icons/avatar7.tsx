import React from 'react';

const Avatar7: React.FC = () => (
  <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="helmet-grad" x1="0.5" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stopColor="#E0E0E0" />
        <stop offset="100%" stopColor="#BDBDBD" />
      </linearGradient>
    </defs>
    <circle fill="url(#helmet-grad)" cx="64" cy="64" r="50" />
    <rect x="24" y="94" width="80" height="20" rx="10" fill="#42A5F5" />
    <circle fill="#1E88E5" cx="64" cy="64" r="38" />
    <path fill="#0D47A1" d="M88 50c0 13.3-10.7 24-24 24s-24-10.7-24-24 10.7-24 24-24 24 10.7 24 24z" />
    <circle fill="#B3E5FC" cx="64" cy="46" r="8" />
  </svg>
);

export default Avatar7;
