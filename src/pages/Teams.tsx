import React from 'react';
import { Users, Trophy, TrendingUp, Award } from 'lucide-react';
import { useChallenge } from '../contexts/ChallengeContext';
import { formatNumber } from '../utils/calculations';
import { TeamBadge } from '../components/ui/TeamBadge';

export const Teams: React.FC = () => {
  const { teams, config } = useChallenge();

  if (teams.length === 0) {
    return (
      <div className="space-y-6 animate-slide-up">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-accent" />
          Team Rankings
        </h1>
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-xl text-gray-400 mb-2">No teams assigned yet</p>
          <p className="text-sm text-gray-500">
            Teams will be assigned after Heat Week. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-accent" />
          Team Rankings
        </h1>
        <div className="text-gray-400 text-lg">{teams.length} teams</div>
      </div>

      {/* Top Team Highlight */}
      {teams[0] && (
        <div className="glass-card p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-yellow-400" />
            <div>
              <div className="text-sm text-yellow-400 font-semibold">🏆 LEADING TEAM</div>
              <div className="text-2xl font-bold text-white">{teams[0].name}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-400">Total Steps</div>
              <div className="text-2xl font-bold text-accent stat-number">
                {formatNumber(teams[0].totalSteps)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Average Per Member</div>
              <div className="text-2xl font-bold text-green-400 stat-number">
                {formatNumber(teams[0].averageSteps)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Members</div>
              <div className="text-2xl font-bold text-purple-400">{teams[0].members.length}</div>
            </div>
          </div>
          <div className="text-sm text-yellow-400 font-semibold">
            💰 Prize: ${config.prizes.teamBonus} Team Bonus
          </div>
        </div>
      )}

      {/* Team Comparison Chart */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-accent" />
          Team Comparison
        </h2>
        <div className="space-y-3">
          {teams.map((team) => {
            const maxSteps = teams[0]?.totalSteps || 1;
            const percent = (team.totalSteps / maxSteps) * 100;

            return (
              <div key={team.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-bold">#{team.rank}</span>
                    <TeamBadge teamName={team.name} size="sm" />
                  </div>
                  <span className="text-sm font-semibold text-accent stat-number">
                    {formatNumber(team.totalSteps)}
                  </span>
                </div>
                <div className="h-3 bg-primary-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-blue-400 transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map((team) => (
          <div key={team.name} className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-gray-400">#{team.rank}</div>
                {team.rank === 1 && <Trophy className="w-6 h-6 text-yellow-400" />}
                <TeamBadge teamName={team.name} memberCount={team.members.length} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400">Total Steps</div>
                <div className="text-xl font-bold text-white stat-number">
                  {formatNumber(team.totalSteps)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Avg Per Member</div>
                <div className="text-xl font-bold text-accent stat-number">
                  {formatNumber(team.averageSteps)}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Team Members
              </div>
              <div className="space-y-2">
                {team.members
                  .sort((a, b) => b.totalSteps - a.totalSteps)
                  .map((member, index) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between bg-primary-light/50 rounded-lg p-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">#{index + 1}</span>
                        <span className="text-sm text-white">{member.name}</span>
                      </div>
                      <div className="text-sm font-semibold text-accent stat-number">
                        {formatNumber(member.totalSteps)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Member contribution bars */}
            <div>
              <div className="text-sm text-gray-400 mb-2">Member Contributions</div>
              {team.members.map((member) => {
                const percent = (member.totalSteps / team.totalSteps) * 100;
                return (
                  <div key={member.id} className="mb-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">{member.name}</span>
                      <span className="text-accent font-semibold">{percent.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-primary-light rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
