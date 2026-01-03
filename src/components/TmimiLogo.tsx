import React from 'react';

interface TmimiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const TmimiLogo: React.FC<TmimiLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer circle with gradient */}
        <circle cx="50" cy="50" r="48" fill="url(#gradient)" />
        
        {/* Dollar sign */}
        <path
          d="M50 20 L50 80 M35 30 Q35 25 40 25 L60 25 Q65 25 65 30 Q65 35 60 35 L40 35 M35 50 L65 50 M40 65 Q35 65 35 70 Q35 75 40 75 L60 75 Q65 75 65 70 Q65 65 60 65 L40 65"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
