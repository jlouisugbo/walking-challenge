import React, { useState } from 'react';
import { TrendingUp, Users, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { useChallenge } from '../contexts/ChallengeContext';
import { formatNumber, stepsToMiles } from '../utils/calculations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const Statistics: React.FC = () => {
  const { rankedParticipants } = useChallenge();
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const toggleParticipant = (id: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const comparisonData = selectedParticipants
    .map((id) => rankedParticipants.find((p) => p.id === id))
    .filter((p): p is typeof rankedParticipants[0] => p !== undefined);

  // Generate daily trend data if available
  const generateTrendData = () => {
    if (comparisonData.length === 0) return [];

    const allDates = new Set<string>();
    comparisonData.forEach((p) => {
      p.dailyHistory?.forEach((d) => allDates.add(d.date));
    });

    const dates = Array.from(allDates).sort();

    return dates.map((date) => {
      const dataPoint: any = { date };
      comparisonData.forEach((p) => {
        const dayData = p.dailyHistory?.find((d) => d.date === date);
        dataPoint[p.name] = dayData?.steps || 0;
      });
      return dataPoint;
    });
  };

  const trendData = generateTrendData();

  // Calculate advanced statistics
  const calculateStdDev = (values: number[]): number => {
    if (values.length === 0) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map((value) => Math.pow(value - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  };

  const mostConsistent = [...rankedParticipants]
    .filter((p) => p.dailyHistory && p.dailyHistory.length >= 3)
    .map((p) => {
      const steps = p.dailyHistory!.map((d) => d.steps);
      const stdDev = calculateStdDev(steps);
      return { ...p, stdDev };
    })
    .sort((a, b) => a.stdDev - b.stdDev)
    .slice(0, 10);

  const wildcardLeaders = [...rankedParticipants]
    .filter((p) => p.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);

  const topByDistance = [...rankedParticipants]
    .map((p) => ({
      ...p,
      miles: (p.totalSteps * 0.0004734848).toFixed(1), // Average step to miles conversion
    }))
    .slice(0, 10);

  const weekendWarriors = [...rankedParticipants]
    .filter((p) => p.dailyHistory && p.dailyHistory.length > 0)
    .map((p) => {
      const weekendSteps = p.dailyHistory!
        .filter((d) => {
          const day = new Date(d.date).getDay();
          return day === 0 || day === 6; // Sunday or Saturday
        })
        .reduce((sum, d) => sum + d.steps, 0);
      return { ...p, weekendSteps };
    })
    .filter((p) => p.weekendSteps > 0)
    .sort((a, b) => b.weekendSteps - a.weekendSteps)
    .slice(0, 10);

  const bestStreaks = [...rankedParticipants]
    .filter((p) => p.dailyHistory && p.dailyHistory.length > 0)
    .map((p) => {
      const sorted = [...p.dailyHistory!].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      let maxStreak = 0;
      let currentStreak = 0;
      for (const day of sorted) {
        if (day.steps >= 10000) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }
      return { ...p, streak: maxStreak };
    })
    .filter((p) => p.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 10);

  const COLORS = ['#00d4ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-3 md:space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-accent" />
          Statistics
        </h1>
      </div>

      {/* Participant Selection */}
      <div className="glass-card p-2 md:p-3">
        <h2 className="text-sm md:text-base font-bold text-white mb-1.5 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-accent" />
          Compare Participants ({selectedParticipants.length}/5)
        </h2>

        <p className="text-[10px] md:text-xs text-gray-400 mb-1.5">
          Select up to 5 participants to compare
        </p>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
          {rankedParticipants.map((participant) => {
            const isSelected = selectedParticipants.includes(participant.id);
            const canSelect = selectedParticipants.length < 5 || isSelected;

            return (
              <button
                key={participant.id}
                onClick={() => canSelect && toggleParticipant(participant.id)}
                disabled={!canSelect}
                className={`p-1.5 rounded text-left transition-all ${
                  isSelected
                    ? 'bg-accent text-white font-semibold'
                    : canSelect
                    ? 'bg-primary-light hover:bg-white/10 text-gray-300'
                    : 'bg-primary-light/30 text-gray-600 cursor-not-allowed'
                }`}
              >
                <div className="text-[10px] md:text-xs truncate">{participant.name}</div>
                <div className="text-[10px] opacity-75 stat-number">{formatNumber(participant.totalSteps)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison */}
      {comparisonData.length > 0 && (
        <>
          {/* Stats Comparison */}
          <div className="glass-card p-3 md:p-4">
            <h2 className="text-base md:text-lg font-bold text-white mb-2 md:mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-accent" />
              Stats Comparison
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              {comparisonData.map((participant, index) => (
                <div
                  key={participant.id}
                  className="bg-primary-light/50 rounded p-2 md:p-3"
                  style={{ borderLeft: `4px solid ${COLORS[index % COLORS.length]}` }}
                >
                  <div className="font-semibold text-white mb-2 text-sm md:text-base">{participant.name}</div>

                  <div className="space-y-1 text-xs md:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rank</span>
                      <span className="text-white font-semibold">#{participant.rank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Steps</span>
                      <span className="text-accent font-semibold stat-number">
                        {formatNumber(participant.totalSteps)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Miles Walked</span>
                      <span className="text-blue-400 font-semibold">
                        {stepsToMiles(participant.totalSteps).toFixed(1)} mi
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-green-400 font-semibold">
                        {participant.progressPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Raffle Tickets</span>
                      <span className="text-yellow-400 font-semibold">
                        {participant.raffleTickets}
                      </span>
                    </div>
                    {participant.points > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Wildcard Points</span>
                        <span className="text-purple-400 font-semibold">
                          {participant.points}
                        </span>
                      </div>
                    )}
                    {participant.weekly70kCount && participant.weekly70kCount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">70k Weeks</span>
                        <span className="text-green-400 font-semibold">
                          {participant.weekly70kCount}
                        </span>
                      </div>
                    )}
                    {participant.dailyHistory && participant.dailyHistory.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Daily Avg</span>
                        <span className="text-white font-semibold stat-number">
                          {formatNumber(Math.round(participant.totalSteps / participant.dailyHistory.length))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart Comparison */}
          {trendData.length > 0 ? (
            <div className="glass-card p-3 md:p-4">
              <h2 className="text-base md:text-lg font-bold text-white mb-2 md:mb-3 flex items-center gap-2">
                <LineChartIcon className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                Step History
              </h2>

              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1f2e',
                        border: '1px solid #00d4ff',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    {comparisonData.map((p, index) => (
                      <Line
                        key={p.id}
                        type="monotone"
                        dataKey={p.name}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 md:p-8 text-center">
              <div className="text-3xl md:text-4xl mb-2">📊</div>
              <p className="text-sm md:text-base text-gray-400">
                No historical data available yet. Import daily data in the Admin panel to see trend charts.
              </p>
            </div>
          )}
        </>
      )}

      {comparisonData.length === 0 && (
        <div className="glass-card p-6 md:p-8 text-center">
          <div className="text-4xl md:text-5xl mb-2">👆</div>
          <p className="text-base md:text-lg text-gray-400">Select participants above to compare stats</p>
        </div>
      )}

      {/* Advanced Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3">
        {/* Most Consistent */}
        {mostConsistent.length > 0 && (
          <div className="glass-card p-3 md:p-4">
            <h2 className="text-base md:text-lg font-bold text-white mb-2">👑 Most Consistent Performers</h2>
            <p className="text-xs text-gray-400 mb-2">Lowest variance in daily steps</p>
            <div className="space-y-1">
              {mostConsistent.map((p, index) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-primary-light/50 rounded p-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-bold text-xs">#{index + 1}</span>
                    <span className="text-white text-sm">{p.name}</span>
                  </div>
                  <span className="text-purple-400 font-semibold text-sm">±{formatNumber(Math.round(p.stdDev))}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wildcard Leaders */}
        {wildcardLeaders.length > 0 && (
          <div className="glass-card p-3 md:p-4">
            <h2 className="text-base md:text-lg font-bold text-white mb-2">✨ Wildcard Points Leaders</h2>
            <p className="text-xs text-gray-400 mb-2">Most daily challenge wins</p>
            <div className="space-y-1">
              {wildcardLeaders.map((p, index) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-primary-light/50 rounded p-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-bold text-xs">#{index + 1}</span>
                    <span className="text-white text-sm">{p.name}</span>
                  </div>
                  <span className="text-yellow-400 font-semibold text-sm">{p.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total Distance */}
        <div className="glass-card p-3 md:p-4">
          <h2 className="text-base md:text-lg font-bold text-white mb-2">🗺️ Distance Walked (Miles)</h2>
          <p className="text-xs text-gray-400 mb-2">Estimated total distance covered</p>
          <div className="space-y-1">
            {topByDistance.map((p, index) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-primary-light/50 rounded p-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-bold text-xs">#{index + 1}</span>
                  <span className="text-white text-sm">{p.name}</span>
                </div>
                <span className="text-blue-400 font-semibold text-sm">{p.miles} mi</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekend Warriors */}
        {weekendWarriors.length > 0 && (
          <div className="glass-card p-3 md:p-4">
            <h2 className="text-base md:text-lg font-bold text-white mb-2">🎉 Weekend Warriors</h2>
            <p className="text-xs text-gray-400 mb-2">Most steps on weekends</p>
            <div className="space-y-1">
              {weekendWarriors.map((p, index) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-primary-light/50 rounded p-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-bold text-xs">#{index + 1}</span>
                    <span className="text-white text-sm">{p.name}</span>
                  </div>
                  <span className="text-pink-400 font-semibold text-sm stat-number">{formatNumber(p.weekendSteps)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best Streaks */}
        {bestStreaks.length > 0 && (
          <div className="glass-card p-3 md:p-4">
            <h2 className="text-base md:text-lg font-bold text-white mb-2">🔥 Best Streaks</h2>
            <p className="text-xs text-gray-400 mb-2">Consecutive days with 10k+ steps</p>
            <div className="space-y-1">
              {bestStreaks.map((p, index) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-primary-light/50 rounded p-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-bold text-xs">#{index + 1}</span>
                    <span className="text-white text-sm">{p.name}</span>
                  </div>
                  <span className="text-orange-400 font-semibold text-sm">{p.streak} days</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Average Daily Steps */}
        <div className="glass-card p-3 md:p-4">
          <h2 className="text-base md:text-lg font-bold text-white mb-2">📊 Highest Daily Average</h2>
          <p className="text-xs text-gray-400 mb-2">Average steps per day</p>
          <div className="space-y-1">
            {rankedParticipants
              .filter((p) => p.dailyAverage && p.dailyAverage > 0)
              .sort((a, b) => (b.dailyAverage || 0) - (a.dailyAverage || 0))
              .slice(0, 10)
              .map((p, index) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-primary-light/50 rounded p-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-bold text-xs">#{index + 1}</span>
                    <span className="text-white text-sm">{p.name}</span>
                  </div>
                  <span className="text-green-400 font-semibold text-sm stat-number">
                    {formatNumber(Math.round(p.dailyAverage || 0))}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
