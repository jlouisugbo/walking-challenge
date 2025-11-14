import React, { useState } from 'react';
import { TrendingUp, Users, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { useChallenge } from '../contexts/ChallengeContext';
import { formatNumber } from '../utils/calculations';
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

  // Top performers by different metrics
  const topBySteps = [...rankedParticipants].slice(0, 10);
  const topByProgress = [...rankedParticipants]
    .sort((a, b) => b.progressPercent - a.progressPercent)
    .slice(0, 10);

  const COLORS = ['#00d4ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-accent" />
          Statistics & Analytics
        </h1>
      </div>

      {/* Participant Selection */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-accent" />
          Compare Participants ({selectedParticipants.length} selected)
        </h2>

        <p className="text-sm text-gray-400 mb-4">
          Select up to 5 participants to compare their performance
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {rankedParticipants.map((participant) => {
            const isSelected = selectedParticipants.includes(participant.id);
            const canSelect = selectedParticipants.length < 5 || isSelected;

            return (
              <button
                key={participant.id}
                onClick={() => canSelect && toggleParticipant(participant.id)}
                disabled={!canSelect}
                className={`p-3 rounded-lg text-left transition-all ${
                  isSelected
                    ? 'bg-accent text-white font-semibold'
                    : canSelect
                    ? 'bg-primary-light hover:bg-white/10 text-gray-300'
                    : 'bg-primary-light/30 text-gray-600 cursor-not-allowed'
                }`}
              >
                <div className="text-sm truncate">{participant.name}</div>
                <div className="text-xs opacity-75 stat-number">{formatNumber(participant.totalSteps)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison */}
      {comparisonData.length > 0 && (
        <>
          {/* Stats Comparison */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-accent" />
              Stats Comparison
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comparisonData.map((participant, index) => (
                <div
                  key={participant.id}
                  className="bg-primary-light/50 rounded-lg p-4"
                  style={{ borderLeft: `4px solid ${COLORS[index % COLORS.length]}` }}
                >
                  <div className="font-semibold text-white mb-3">{participant.name}</div>

                  <div className="space-y-2 text-sm">
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
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <LineChartIcon className="w-6 h-6 text-accent" />
                Step History Comparison
              </h2>

              <div className="h-80">
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
            <div className="glass-card p-12 text-center">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-gray-400">
                No historical data available yet. Import daily data in the Admin panel to see trend charts.
              </p>
            </div>
          )}
        </>
      )}

      {comparisonData.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">👆</div>
          <p className="text-xl text-gray-400">Select participants above to compare stats</p>
        </div>
      )}

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top by Steps */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">🏆 Top 10 by Steps</h2>
          <div className="space-y-2">
            {topBySteps.map((p, index) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-primary-light/50 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-bold">#{index + 1}</span>
                  <span className="text-white">{p.name}</span>
                </div>
                <span className="text-accent font-semibold stat-number">{formatNumber(p.totalSteps)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top by Progress */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">📈 Top 10 by Progress</h2>
          <div className="space-y-2">
            {topByProgress.map((p, index) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-primary-light/50 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-bold">#{index + 1}</span>
                  <span className="text-white">{p.name}</span>
                </div>
                <span className="text-green-400 font-semibold">{p.progressPercent.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
