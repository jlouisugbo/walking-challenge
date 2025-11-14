import React from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import { formatNumber } from '../../utils/calculations';

interface Weekly70kBadgeProps {
  weekSteps: number;
  achieved: boolean;
  compact?: boolean;
}

export const Weekly70kBadge: React.FC<Weekly70kBadgeProps> = ({ weekSteps, achieved, compact = false }) => {
  const progress = Math.min((weekSteps / 70000) * 100, 100);
  const remaining = Math.max(70000 - weekSteps, 0);

  if (compact) {
    // Compact version for participant cards
    if (achieved) {
      return (
        <div className="inline-flex items-center gap-1 bg-green-500/20 border border-green-500/50 text-green-400 px-2 py-1 rounded-full text-xs font-semibold">
          <Trophy className="w-3 h-3" />
          <span>70K Week</span>
        </div>
      );
    }
    return null;
  }

  // Full version for dashboard
  return (
    <div className={`rounded-lg p-4 ${
      achieved
        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50'
        : 'bg-primary-light border border-white/10'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {achieved ? (
            <Trophy className="w-6 h-6 text-green-400 animate-bounce" />
          ) : (
            <TrendingUp className="w-6 h-6 text-accent" />
          )}
          <div>
            <h3 className="font-bold text-white text-lg">
              {achieved ? '🎉 Week Goal Achieved!' : 'This Week\'s Progress'}
            </h3>
            <p className="text-xs text-gray-400">
              {achieved ? 'You hit 70,000 steps this week!' : 'Target: 70,000 steps'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${achieved ? 'text-green-400' : 'text-accent'}`}>
            {formatNumber(weekSteps)}
          </div>
          <div className="text-xs text-gray-400">steps this week</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-3 bg-black/30 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
            achieved
              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
              : 'bg-gradient-to-r from-accent to-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Status */}
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="text-gray-400">
          {achieved ? (
            <span className="text-green-400 font-semibold">✓ Weekly raffle entry earned!</span>
          ) : (
            <span>{formatNumber(remaining)} steps to go</span>
          )}
        </span>
        <span className={achieved ? 'text-green-400' : 'text-accent'}>
          {progress.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

// Calculate current week's steps for a participant
export const calculateWeekSteps = (dailyHistory?: Array<{ date: string; steps: number }>): number => {
  if (!dailyHistory || dailyHistory.length === 0) return 0;

  // Get start of current week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday start
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);

  const weekStartStr = weekStart.toISOString().split('T')[0];

  // Sum steps from this week
  return dailyHistory
    .filter(d => d.date >= weekStartStr)
    .reduce((sum, d) => sum + d.steps, 0);
};
