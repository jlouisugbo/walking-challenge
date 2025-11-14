import React from 'react';
import { getProgressColor } from '../../utils/calculations';

interface ProgressBarProps {
  percent: number;
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  showLabel = true,
  height = 'md',
  animated = true,
  className = '',
}) => {
  const clampedPercent = Math.min(Math.max(percent, 0), 100);
  const colorClass = getProgressColor(clampedPercent);

  const heightClass = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  }[height];

  return (
    <div className={`relative ${className}`}>
      <div className={`w-full bg-primary-light rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${colorClass} h-full rounded-full transition-all duration-500 ease-out ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow-lg">
            {clampedPercent.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
};
