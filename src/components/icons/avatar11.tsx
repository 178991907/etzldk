import React from 'react';

const Avatar11: React.FC = () => (
  <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bear-grad" cx=".5" cy=".5" r=".5">
        <stop offset="0%" stopColor="#D4A373" />
        <stop offset="100%" stopColor="#A97C50" />
      </radialGradient>
      <radialGradient id="bear-ear" cx=".5" cy=".5" r=".5">
        <stop offset="0%" stopColor="#EFE2D3" />
        <stop offset="100%" stopColor="#D4A373" />
      </radialGradient>
    </defs>
    <circle fill="url(#bear-grad)" cx="64" cy="64" r="54" />
    <circle fill="url(#bear-ear)" cx="32" cy="32" r="20" />
    <circle fill="url(#bear-ear)" cx="96" cy="32" r="20" />
    <circle fill="#FFF" cx="50" cy="60" r="8" />
    <circle fill="#FFF" cx="78" cy="60" r="8" />
    <circle fill="#000" cx="50" cy="60" r="4" />
    <circle fill="#000" cx="78" cy="60" r="4" />
    <path d="M54,80 a10,8 0 0,0 20,0" fill="#333" />
    <path d="M64,82 a6,6 0 0,1 0,12 a6,6 0 0,1 0,-12" fill="#000" />
  </svg>
);

export default Avatar11;
