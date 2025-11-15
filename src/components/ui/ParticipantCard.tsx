import React from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import type { ParticipantWithRank } from '../../types';
import { formatNumber, getRankMedal, getRankColor } from '../../utils/calculations';
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
      className={`glass-card p-4 hover:scale-[1.02] transition-all duration-200 cursor-pointer ${
        isTopThree ? rankColorClass : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {medal && <span className="text-3xl">{medal}</span>}
            <div className={`text-2xl font-bold ${isTopThree ? 'text-white' : 'text-gray-400'}`}>
              #{participant.rank}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{participant.name}</h3>
            {showTeam && participant.team && (
              <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
                {participant.team}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-accent stat-number">
            {formatNumber(participant.totalSteps)}
          </div>
          <div className="text-xs text-gray-400">steps</div>
        </div>
      </div>

      {!compact && (
        <>
          <ProgressBar percent={participant.progressPercent} className="mb-3" />

          <div className="flex items-center justify-between">
            <MilestoneIndicator milestones={participant.milestones} size="sm" />

            <div className="flex items-center gap-4 text-sm">
              {participant.points > 0 && (
                <div className="flex items-center gap-1 text-purple-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-semibold">{participant.points} pts</span>
                </div>
              )}

              {participant.weekly70kCount && participant.weekly70kCount > 0 && (
                <div className="flex items-center gap-1 text-green-400">
                  <Trophy className="w-4 h-4" />
                  <span className="font-semibold">{participant.weekly70kCount}x 70k Week{participant.weekly70kCount > 1 ? 's' : ''}</span>
                </div>
              )}

              {participant.raffleTickets > 0 && (
                <div className="flex items-center gap-1 text-yellow-400">
                  <span>🎟️</span>
                  <span className="font-semibold">{participant.raffleTickets}</span>
                </div>
              )}

              {participant.prize && (
                <div className="flex items-center gap-1 text-green-400">
                  <Trophy className="w-4 h-4" />
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
