import React from 'react';
import { Star } from 'lucide-react';
import type { MilestoneStatus } from '../../types';

interface MilestoneIndicatorProps {
  milestones: MilestoneStatus;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export const MilestoneIndicator: React.FC<MilestoneIndicatorProps> = ({
  milestones,
  size = 'md',
  showTooltip = true,
  className = '',
}) => {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }[size];

  const milestoneData = [
    { reached: milestones.reached150k, label: '150k' },
    { reached: milestones.reached225k, label: '225k' },
    { reached: milestones.reached300k, label: '300k' },
  ];

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {milestoneData.map((milestone, index) => (
        <div
          key={index}
          className="relative group"
          title={showTooltip ? `${milestone.label} milestone` : undefined}
        >
          <Star
            className={`${sizeClass} transition-all duration-300 ${
              milestone.reached
                ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg animate-pulse'
                : 'fill-none text-gray-600'
            }`}
          />
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {milestone.label} steps
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
