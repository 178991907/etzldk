import React from 'react';

const Avatar5: React.FC = () => (
  <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mush-top" x1=".5" y1="0" x2=".5" y2="1">
        <stop offset="0%" stopColor="#ff4d4d" />
        <stop offset="100%" stopColor="#ff1a1a" />
      </linearGradient>
      <linearGradient id="mush-stem" x1=".5" y1="0" x2=".5" y2="1">
        <stop offset="0%" stopColor="#fff0e6" />
        <stop offset="100%" stopColor="#ffe0cc" />
      </linearGradient>
    </defs>
    <path fill="url(#mush-top)" d="M112 64c0-26.5-21.5-48-48-48S16 37.5 16 64h96z" />
    <circle fill="#FFF" cx="40" cy="48" r="10" />
    <circle fill="#FFF" cx="88" cy="48" r="10" />
    <circle fill="#FFF" cx="64" cy="28" r="8" />
    <path fill="url(#mush-stem)" d="M88 64H40v48h48V64z" />
    <circle fill="#000" cx="52" cy="80" r="6" />
    <circle fill="#000" cx="76" cy="80" r="6" />
  </svg>
);

export default Avatar5;
