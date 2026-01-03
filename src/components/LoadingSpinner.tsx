import React from 'react';
import { TmimiLogo } from './TmimiLogo';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  fullScreen = false, 
  message = 'Loading...' 
}) => {
  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-white flex flex-col items-center justify-center z-50'
    : 'flex flex-col items-center justify-center py-12';

  return (
    <div className={containerClasses}>
      <div className="animate-pulse">
        <TmimiLogo size="xl" />
      </div>
      <p className="mt-4 text-text-muted text-lg">{message}</p>
    </div>
  );
};
