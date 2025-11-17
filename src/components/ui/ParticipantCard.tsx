import React from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import type { ParticipantWithRank } from '../../types';
import { formatNumber, getRankMedal, getRankColor, stepsToMiles } from '../../utils/calculations';
import { ProgressBar } from './ProgressBar';
import { MilestoneIndicator } from './MilestoneIndicator';
import { useChallenge } from '../../contexts/ChallengeContext';

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
  const { getTeamDisplayName } = useChallenge();
  const medal = getRankMedal(participant.rank);
  const rankColorClass = getRankColor(participant.rank);
  const isTopThree = participant.rank <= 3;
  const teamDisplayName = getTeamDisplayName(participant.team);

  return (
    <div
      className={`glass-card px-1.5 md:px-2 py-1 md:py-1.5 hover:scale-[1.01] transition-all duration-200 cursor-pointer ${
        isTopThree ? rankColorClass : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-0.5">
        <div className="flex items-center gap-1 md:gap-1.5 flex-1 min-w-0">
          {/* Medal & Rank */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {medal && <span className="text-base md:text-lg">{medal}</span>}
            <div className="flex items-center gap-0.5">
              <div className={`text-xs md:text-sm font-bold ${isTopThree ? 'text-white' : 'text-gray-400'}`}>
                #{participant.rank}
              </div>
              {participant.rankChange && participant.rankChange.direction !== 'same' && participant.rankChange.change > 0 && (
                <div
                  className={`flex items-center text-[10px] md:text-xs font-semibold ${
                    participant.rankChange.direction === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}
                  title={`${participant.rankChange.direction === 'up' ? 'Moved up' : 'Moved down'} ${participant.rankChange.change} spot${participant.rankChange.change > 1 ? 's' : ''} since yesterday`}
                >
                  {participant.rankChange.direction === 'up' ? '↑' : '↓'}
                  {participant.rankChange.change}
                </div>
              )}
            </div>
          </div>

          {/* Name & Team (inline) */}
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <h3 className="text-xs md:text-sm font-bold text-white truncate">{participant.name}</h3>
            {showTeam && participant.team && (
              <span className="text-[10px] md:text-xs bg-accent/20 text-accent px-1 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                {teamDisplayName}
              </span>
            )}
          </div>
        </div>

        {/* Steps */}
        <div className="text-right flex-shrink-0 ml-1">
          <div className="text-sm md:text-base font-bold text-accent stat-number">
            {formatNumber(participant.totalSteps)}
          </div>
          <div className="text-[10px] md:text-xs text-gray-400">
            {stepsToMiles(participant.totalSteps).toFixed(1)} mi
          </div>
        </div>
      </div>

      {!compact && (
        <>
          <ProgressBar percent={participant.progressPercent} className="mb-0.5" />

          <div className="flex items-center justify-between">
            {/* Left side: Milestones & Badges */}
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <MilestoneIndicator milestones={participant.milestones} size="sm" />
              {participant.badges && participant.badges.length > 0 && (
                <div className="flex gap-0.5">
                  {participant.badges.slice(0, 3).map((badge) => (
                    <span
                      key={badge.id}
                      className="text-[10px] md:text-xs"
                      title={badge.description}
                    >
                      {badge.icon}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right side: Stats */}
            <div className="flex items-center gap-1 text-[10px] md:text-xs flex-shrink-0">
              {participant.streak && participant.streak > 0 && (
                <div className="flex items-center gap-0.5 text-orange-400">
                  <span className="text-[10px] md:text-xs">🔥</span>
                  <span className="font-semibold">{participant.streak}</span>
                </div>
              )}

              {participant.points > 0 && (
                <div className="flex items-center gap-0.5 text-purple-400">
                  <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  <span className="font-semibold">{participant.points}</span>
                </div>
              )}

              {participant.weekly70kCount && participant.weekly70kCount > 0 && (
                <div className="flex items-center gap-0.5 text-green-400">
                  <Trophy className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  <span className="font-semibold">{participant.weekly70kCount}x</span>
                </div>
              )}

              {participant.raffleTickets > 0 && (
                <div className="flex items-center gap-0.5 text-yellow-400">
                  <span className="text-[10px] md:text-xs">🎟️</span>
                  <span className="font-semibold">{participant.raffleTickets}</span>
                </div>
              )}

              {participant.prize && (
                <div className="flex items-center gap-0.5 text-green-400">
                  <Trophy className="w-2.5 h-2.5 md:w-3 md:h-3" />
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
