import React from 'react';

export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  color?: string;
}> = ({
  size = 'md',
  text,
  className = '',
  color = 'border-current',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-4',
  }[size];

  // Inline render when sm without text to prevent button layout deformation
  if (size === 'sm' && !text) {
    return (
      <span
        className={`inline-block ${sizeClasses} rounded-full ${color} border-t-transparent animate-spin shrink-0 ${className}`}
        role="status"
        aria-label="Loading"
      />
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${text ? 'p-6 space-y-3' : 'p-2'} ${className}`}>
      <div
        className={`${sizeClasses} rounded-full border-[#0071E3] border-t-transparent animate-spin shrink-0`}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{text}</p>}
    </div>
  );
};
