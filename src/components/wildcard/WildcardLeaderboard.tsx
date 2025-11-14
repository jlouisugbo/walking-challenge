import React from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import type { Participant } from '../../types';

interface WildcardLeaderboardProps {
  participants: Participant[];
}

export const WildcardLeaderboard: React.FC<WildcardLeaderboardProps> = ({ participants }) => {
  // Sort by points (highest first)
  const sortedByPoints = [...participants]
    .filter((p) => p.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);

  if (sortedByPoints.length === 0) {
    return (
      <div className="card p-6 text-center">
        <div className="text-gray-400 mb-2">
          <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
        </div>
        <p className="text-gray-400">No wildcard points awarded yet!</p>
        <p className="text-sm text-gray-500 mt-2">
          Wildcard challenges begin after Heat Week (Nov 18)
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Wildcard Points Leaderboard
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          Earn points by winning daily wildcard challenges
        </p>
      </div>

      <div className="divide-y divide-white/10">
        {sortedByPoints.map((participant, index) => (
          <div
            key={participant.id}
            className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0
                    ? 'bg-yellow-500 text-black'
                    : index === 1
                    ? 'bg-gray-300 text-black'
                    : index === 2
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {index + 1}
              </div>
              <div>
                <div className="font-semibold text-white">{participant.name}</div>
                {participant.team && (
                  <div className="text-xs text-gray-400">Team {participant.team}</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-400">{participant.points}</div>
                <div className="text-xs text-gray-400">
                  {participant.points === 1 ? 'point' : 'points'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
