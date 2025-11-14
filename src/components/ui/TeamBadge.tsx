import React from 'react';
import { Users } from 'lucide-react';

interface TeamBadgeProps {
  teamName: string;
  memberCount?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TEAM_COLORS: Record<string, string> = {
  'Team Alpha': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Team Bravo': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Team Charlie': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Team Delta': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Team Echo': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'Team Foxtrot': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Team Golf': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Team Hotel': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
};

export const TeamBadge: React.FC<TeamBadgeProps> = ({
  teamName,
  memberCount,
  size = 'md',
  className = '',
}) => {
  const colorClass = TEAM_COLORS[teamName] || 'bg-accent/20 text-accent border-accent/30';

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  }[size];

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${colorClass} ${sizeClasses} ${className}`}
    >
      <Users className={iconSize} />
      <span>{teamName}</span>
      {memberCount !== undefined && (
        <span className="opacity-75">({memberCount})</span>
      )}
    </div>
  );
};
