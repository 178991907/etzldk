import React from 'react';

const Avatar10: React.FC = () => (
  <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="uni-mane" x1=".5" y1="0" x2=".5" y2="1">
        <stop offset="0%" stopColor="#ffafcc" />
        <stop offset="50%" stopColor="#bde0fe" />
        <stop offset="100%" stopColor="#a2d2ff" />
      </linearGradient>
      <linearGradient id="uni-horn" x1=".5" y1="0" x2=".5" y2="1">
        <stop offset="0%" stopColor="#FFD166" />
        <stop offset="100%" stopColor="#F9A825" />
      </linearGradient>
    </defs>
    <path fill="url(#uni-mane)" d="M84,18c-6-6-14-9-22-9-10,0-20,6-26,16-4,7-5,16-2,24,10,24,32,42,60,44,8,0,14-8,12-16-2-8-10-14-18-18C80,50,88,30,84,18z" />
    <path fill="#F5F5F5" d="M88,112c-4,0-8-1-11-3-16-12-22-32-20-50,1-10,10-18,20-18,12,0,20,12,20,26,0,18-6,34-18,44-3,2-6,3-9,3z" />
    <path fill="url(#uni-horn)" d="M92,36 L84,12 L76,36z" />
    <circle fill="#000" cx="100" cy="70" r="6" />
  </svg>
);

export default Avatar10;
