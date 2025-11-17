import React, { useState } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ParticipantWithRank } from '../../types';
import { formatNumber, stepsToMiles } from '../../utils/calculations';

interface PersonalChartModalProps {
  participants: ParticipantWithRank[];
  onClose: () => void;
}

export const PersonalChartModal: React.FC<PersonalChartModalProps> = ({ participants, onClose }) => {
  const [searchName, setSearchName] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantWithRank | null>(null);

  const handleSearch = () => {
    const found = participants.find(
      (p) => p.name.toLowerCase() === searchName.toLowerCase().trim()
    );
    if (found) {
      setSelectedParticipant(found);
    } else {
      alert('Participant not found. Please check the name and try again.');
    }
  };

  // Prepare chart data from daily history
  const chartData = selectedParticipant?.dailyHistory
    ? [...selectedParticipant.dailyHistory]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((day) => ({
          date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          steps: day.steps,
          miles: Number((day.steps * 0.0004734848).toFixed(1)),
        }))
    : [];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-primary rounded-xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-accent" />
            <h2 className="text-xl md:text-2xl font-bold text-white">Personal Progress Chart</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Search Section */}
        {!selectedParticipant && (
          <div className="p-4 md:p-6">
            <p className="text-gray-300 mb-4">
              Enter your name to view your personal progress chart:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter your name..."
                className="flex-1 px-4 py-2 bg-primary-light border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-accent hover:bg-accent/80 text-white font-semibold rounded-lg transition-colors"
              >
                View Chart
              </button>
            </div>
          </div>
        )}

        {/* Chart Section */}
        {selectedParticipant && (
          <div className="p-4 md:p-6">
            {/* Participant Stats */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    {selectedParticipant.name}
                  </h3>
                  <p className="text-gray-400">Rank #{selectedParticipant.rank}</p>
                </div>
                <button
                  onClick={() => setSelectedParticipant(null)}
                  className="text-sm text-accent hover:text-accent/80"
                >
                  Search Again
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-primary-light/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400">Total Steps</div>
                  <div className="text-lg md:text-xl font-bold text-white stat-number">
                    {formatNumber(selectedParticipant.totalSteps)}
                  </div>
                </div>
                <div className="bg-primary-light/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400">Total Miles</div>
                  <div className="text-lg md:text-xl font-bold text-accent stat-number">
                    {stepsToMiles(selectedParticipant.totalSteps).toFixed(1)}
                  </div>
                </div>
                <div className="bg-primary-light/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400">Progress</div>
                  <div className="text-lg md:text-xl font-bold text-purple-400">
                    {selectedParticipant.progressPercent.toFixed(0)}%
                  </div>
                </div>
                <div className="bg-primary-light/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400">Streak</div>
                  <div className="text-lg md:text-xl font-bold text-orange-400">
                    {selectedParticipant.streak || 0} 🔥
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            {chartData.length > 0 ? (
              <div className="bg-primary-light/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Daily Steps Over Time</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="date"
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1f2e',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'steps') return [formatNumber(value), 'Steps'];
                        if (name === 'miles') return [value, 'Miles'];
                        return [value, name];
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="steps"
                      stroke="#00d4ff"
                      strokeWidth={2}
                      dot={{ fill: '#00d4ff', r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-primary-light/30 rounded-lg p-8 text-center">
                <p className="text-gray-400">No daily history data available yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
