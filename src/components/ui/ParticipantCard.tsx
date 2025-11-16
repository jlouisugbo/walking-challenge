import React from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import type { ParticipantWithRank } from '../../types';
import { formatNumber, getRankMedal, getRankColor, stepsToMiles } from '../../utils/calculations';
import { ProgressBar } from './ProgressBar';
import { MilestoneIndicator } from './MilestoneIndicator';

interface ParticipantCardProps {
  participant: ParticipantWithRank;
  onClick?: () => void;
  showTeam?: boolean;
  compact?: boolean;
  className?: string;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  onClick,
  showTeam = true,
  compact = false,
  className = '',
}) => {
  const medal = getRankMedal(participant.rank);
  const rankColorClass = getRankColor(participant.rank);
  const isTopThree = participant.rank <= 3;

  return (
    <div
      className={`glass-card px-3 md:px-4 py-2 md:py-2.5 hover:scale-[1.01] transition-all duration-200 cursor-pointer ${
        isTopThree ? rankColorClass : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-1.5 md:mb-2">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-1 md:gap-2">
            {medal && <span className="text-xl md:text-2xl">{medal}</span>}
            <div className={`text-lg md:text-xl font-bold ${isTopThree ? 'text-white' : 'text-gray-400'}`}>
              #{participant.rank}
            </div>
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-white">{participant.name}</h3>
            {showTeam && participant.team && (
              <span className="text-xs bg-accent/20 text-accent px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
                {participant.team}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg md:text-xl font-bold text-accent stat-number">
            {formatNumber(participant.totalSteps)}
          </div>
          <div className="text-xs text-gray-400">
            {stepsToMiles(participant.totalSteps).toFixed(1)} mi
          </div>
        </div>
      </div>

      {!compact && (
        <>
          <ProgressBar percent={participant.progressPercent} className="mb-1.5" />

          <div className="flex items-center justify-between">
            <MilestoneIndicator milestones={participant.milestones} size="sm" />

            <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
              {participant.points > 0 && (
                <div className="flex items-center gap-0.5 md:gap-1 text-purple-400">
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="font-semibold">{participant.points}</span>
                </div>
              )}

              {participant.weekly70kCount && participant.weekly70kCount > 0 && (
                <div className="flex items-center gap-0.5 md:gap-1 text-green-400">
                  <Trophy className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="font-semibold">{participant.weekly70kCount}x</span>
                </div>
              )}

              {participant.raffleTickets > 0 && (
                <div className="flex items-center gap-0.5 md:gap-1 text-yellow-400">
                  <span className="text-xs md:text-sm">🎟️</span>
                  <span className="font-semibold">{participant.raffleTickets}</span>
                </div>
              )}

              {participant.prize && (
                <div className="flex items-center gap-0.5 md:gap-1 text-green-400">
                  <Trophy className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="font-semibold">${participant.prize}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
