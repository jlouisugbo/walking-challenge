import React, { useState } from 'react';
import { Users, Trophy, ChevronDown, ChevronUp, Award, Crown } from 'lucide-react';
import { useChallenge } from '../contexts/ChallengeContext';
import { formatNumber, stepsToMiles } from '../utils/calculations';

export const Teams: React.FC = () => {
  const { teams, config } = useChallenge();
  const [expandedTeam, setExpandedTeam] = useState<string | null>(teams[0]?.name || null);

  const toggleTeam = (teamName: string) => {
    setExpandedTeam(expandedTeam === teamName ? null : teamName);
  };

  if (teams.length === 0) {
    return (
      <div className="space-y-4 md:space-y-6 animate-slide-up">
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2 md:gap-3">
          <Users className="w-6 h-6 md:w-8 md:h-8 text-accent" />
          Team Rankings
        </h1>
        <div className="glass-card p-8 md:p-12 text-center">
          <div className="text-5xl md:text-6xl mb-3 md:mb-4">👥</div>
          <p className="text-lg md:text-xl text-gray-400 mb-2">No teams assigned yet</p>
          <p className="text-sm text-gray-500">
            Teams will be assigned after Heat Week on Nov 17, 2025. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2 md:gap-3">
          <Users className="w-6 h-6 md:w-8 md:h-8 text-accent" />
          Team Rankings
        </h1>
        <div className="text-gray-400 text-sm md:text-base">{teams.length} teams</div>
      </div>

      {/* Team Accordion Bars */}
      <div className="space-y-2 md:space-y-3">
        {teams.map((team) => {
          const isExpanded = expandedTeam === team.name;
          const leader = team.members.sort((a, b) => b.totalSteps - a.totalSteps)[0];
          const isTopTeam = team.rank === 1;

          return (
            <div
              key={team.name}
              className="glass-card overflow-hidden transition-all duration-300"
              style={{
                borderLeft: `4px solid ${team.color || '#8b5cf6'}`,
              }}
            >
              {/* Team Bar - Clickable Header */}
              <button
                onClick={() => toggleTeam(team.name)}
                className="w-full px-3 md:px-4 py-2 md:py-3 hover:bg-white/5 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                  {/* Rank & Icon */}
                  <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                    <span className="text-2xl md:text-3xl">{team.icon || '👥'}</span>
                    <div className="flex items-center gap-1">
                      {isTopTeam && <Crown className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />}
                      <span className="text-lg md:text-xl font-bold text-gray-400">#{team.rank}</span>
                    </div>
                  </div>

                  {/* Team Name */}
                  <div className="text-base md:text-lg font-bold text-white truncate">
                    {team.name}
                  </div>

                  {/* Leader Name (hidden on mobile if too narrow) */}
                  <div className="hidden sm:flex items-center gap-1 text-xs md:text-sm text-gray-400">
                    <Trophy className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="truncate">{leader?.name || 'No leader'}</span>
                  </div>

                  {/* Total Steps */}
                  <div className="flex-shrink-0 ml-auto mr-2 md:mr-4">
                    <div className="text-sm md:text-base font-bold text-accent stat-number">
                      {formatNumber(team.totalSteps)}
                    </div>
                    <div className="text-xs text-gray-400 text-right">
                      {stepsToMiles(team.totalSteps).toFixed(0)} mi
                    </div>
                  </div>
                </div>

                {/* Expand Icon */}
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                  ) : (
                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-white/10 p-3 md:p-4 bg-primary-light/30 space-y-3 md:space-y-4">
                  {/* Team Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    <div className="bg-primary-light/50 rounded-lg p-2 md:p-3">
                      <div className="text-xs text-gray-400">Total Steps</div>
                      <div className="text-base md:text-lg font-bold text-white stat-number">
                        {formatNumber(team.totalSteps)}
                      </div>
                    </div>
                    <div className="bg-primary-light/50 rounded-lg p-2 md:p-3">
                      <div className="text-xs text-gray-400">Avg/Member</div>
                      <div className="text-base md:text-lg font-bold text-accent stat-number">
                        {formatNumber(team.averageSteps)}
                      </div>
                    </div>
                    <div className="bg-primary-light/50 rounded-lg p-2 md:p-3">
                      <div className="text-xs text-gray-400">Members</div>
                      <div className="text-base md:text-lg font-bold text-purple-400">
                        {team.members.length}
                      </div>
                    </div>
                  </div>

                  {/* Team Description */}
                  {team.description && (
                    <div className="text-xs md:text-sm text-gray-300 italic p-2 md:p-3 bg-primary-light/30 rounded-lg">
                      "{team.description}"
                    </div>
                  )}

                  {/* Prize Info */}
                  {isTopTeam && (
                    <div className="text-xs md:text-sm text-yellow-400 font-semibold p-2 md:p-3 bg-yellow-400/10 rounded-lg">
                      💰 Prize: ${config.prizes.teamBonusPerMember * team.members.length} Team Bonus
                      (${config.prizes.teamBonusPerMember}/member)
                    </div>
                  )}

                  {/* Team Members List */}
                  <div>
                    <div className="text-xs md:text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <Award className="w-3 h-3 md:w-4 md:h-4" />
                      Team Members
                    </div>
                    <div className="space-y-1 md:space-y-2">
                      {team.members
                        .sort((a, b) => b.totalSteps - a.totalSteps)
                        .map((member, index) => {
                          const contribution = (member.totalSteps / team.totalSteps) * 100;
                          return (
                            <div
                              key={member.id}
                              className="flex items-center justify-between bg-primary-light/50 rounded-lg p-2"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-xs text-gray-500 flex-shrink-0">#{index + 1}</span>
                                <span className="text-xs md:text-sm text-white truncate">{member.name}</span>
                                <span className="text-xs text-gray-400 flex-shrink-0">
                                  ({contribution.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="flex-shrink-0 ml-2">
                                <div className="text-xs md:text-sm font-semibold text-accent stat-number">
                                  {formatNumber(member.totalSteps)}
                                </div>
                                <div className="text-xs text-gray-400 text-right">
                                  {stepsToMiles(member.totalSteps).toFixed(0)} mi
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
