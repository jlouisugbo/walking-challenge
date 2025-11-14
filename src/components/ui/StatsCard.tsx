import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  iconColor?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  className = '',
  iconColor = 'text-accent',
}) => {
  const trendIcon = {
    up: '↑',
    down: '↓',
    neutral: '→',
  }[trend || 'neutral'];

  const trendColor = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400',
  }[trend || 'neutral'];

  return (
    <div className={`glass-card p-6 hover:scale-105 transition-transform duration-200 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold mt-2 stat-number animate-counter">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
              {trend && <span className={trendColor}>{trendIcon}</span>}
              {subtitle}
            </p>
          )}
        </div>
        <div className={`${iconColor} bg-white/5 p-3 rounded-lg`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
};
