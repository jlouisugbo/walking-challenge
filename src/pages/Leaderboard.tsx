import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, X, Trophy, TrendingUp, Sparkles } from 'lucide-react';
import { useChallenge } from '../contexts/ChallengeContext';
import { ParticipantCard } from '../components/ui/ParticipantCard';
import { PersonalChartModal } from '../components/ui/PersonalChartModal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { MilestoneIndicator } from '../components/ui/MilestoneIndicator';
import { formatNumber, stepsToMiles } from '../utils/calculations';
import type { SortField, SortDirection } from '../types';

export const Leaderboard: React.FC = () => {
  const { rankedParticipants, getTeamDisplayName, getTeamCustomization } = useChallenge();
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [milestoneFilter, setMilestoneFilter] = useState<string>('all');
  const [pointsFilter, setPointsFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showChartModal, setShowChartModal] = useState(false);

  // Get unique teams
  const teams = useMemo(() => {
    const teamSet = new Set(
      rankedParticipants.map((p) => p.team).filter((t): t is string => t !== null)
    );
    return Array.from(teamSet);
  }, [rankedParticipants]);

  // Filter and sort participants
  const filteredParticipants = useMemo(() => {
    let filtered = [...rankedParticipants];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Team filter
    if (teamFilter !== 'all') {
      filtered = filtered.filter((p) => p.team === teamFilter);
    }

    // Milestone filter
    if (milestoneFilter !== 'all') {
      filtered = filtered.filter((p) => {
        switch (milestoneFilter) {
          case '150k':
            return p.milestones.reached150k;
          case '225k':
            return p.milestones.reached225k;
          case '300k':
            return p.milestones.reached300k;
          default:
            return true;
        }
      });
    }

    // Points filter
    if (pointsFilter !== 'all') {
      filtered = filtered.filter((p) => {
        switch (pointsFilter) {
          case 'has-points':
            return p.points > 0;
          case 'no-points':
            return p.points === 0;
          default:
            return true;
        }
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'team':
          compareValue = (a.team || '').localeCompare(b.team || '');
          break;
        case 'points':
          compareValue = a.points - b.points;
          break;
        case 'rank':
        default:
          compareValue = a.rank - b.rank;
          break;
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [rankedParticipants, searchTerm, teamFilter, milestoneFilter, pointsFilter, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTeamFilter('all');
    setMilestoneFilter('all');
    setPointsFilter('all');
    setSortField('rank');
    setSortDirection('asc');
  };

  const hasActiveFilters = searchTerm !== '' || teamFilter !== 'all' || milestoneFilter !== 'all' || pointsFilter !== 'all' || sortField !== 'rank';

  return (
    <div className="space-y-3 md:space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 md:w-8 md:h-8 text-accent" />
          Full Leaderboard
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowChartModal(true)}
            className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-colors text-sm md:text-base font-semibold"
          >
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">View My Chart</span>
            <span className="sm:hidden">Chart</span>
          </button>
          <div className="text-gray-400 text-sm md:text-base">
            {filteredParticipants.length} participants
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-3 md:p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-accent font-semibold text-sm md:text-base">
            <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" />
            <span>Filters & Search</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2 md:px-3 py-1 text-xs md:text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              <X className="w-3 h-3 md:w-4 md:h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 text-sm md:text-base bg-primary-light rounded-lg border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
          {/* Team Filter */}
          <div>
            <label className="block text-xs md:text-sm text-gray-400 mb-1">Team</label>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base bg-primary-light rounded-lg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Teams</option>
              {teams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

          {/* Milestone Filter */}
          <div>
            <label className="block text-xs md:text-sm text-gray-400 mb-1">Milestone</label>
            <select
              value={milestoneFilter}
              onChange={(e) => setMilestoneFilter(e.target.value)}
              className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base bg-primary-light rounded-lg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All</option>
              <option value="150k">150k+</option>
              <option value="225k">225k+</option>
              <option value="300k">300k</option>
            </select>
          </div>

          {/* Wildcard Points Filter */}
          <div>
            <label className="block text-xs md:text-sm text-gray-400 mb-1">Wildcard</label>
            <select
              value={pointsFilter}
              onChange={(e) => setPointsFilter(e.target.value)}
              className="w-full px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base bg-primary-light rounded-lg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All</option>
              <option value="has-points">With Points</option>
              <option value="no-points">No Points</option>
            </select>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          <SortButton
            label="Name"
            active={sortField === 'name'}
            direction={sortDirection}
            onClick={() => toggleSort('name')}
          />
          {teams.length > 0 && (
            <SortButton
              label="Team"
              active={sortField === 'team'}
              direction={sortDirection}
              onClick={() => toggleSort('team')}
            />
          )}
          <SortButton
            label="Points"
            active={sortField === 'points'}
            direction={sortDirection}
            onClick={() => toggleSort('points')}
          />
        </div>
        <div className="text-xs text-gray-400">
          💡 Default sort: rank by total steps
        </div>
      </div>

      {/* Participants List - Hierarchical Layout (restored) */}
      {filteredParticipants.length > 0 ? (
        <div className="space-y-3 md:space-y-4">
          {/* Rank #1 - Featured Card (reduced padding) */}
          {filteredParticipants[0] && (
            <div className="glass-card p-3 md:p-4 border-2 border-yellow-400/50 bg-gradient-to-br from-yellow-500/10 to-amber-600/10 hover:border-yellow-400/70 transition-all">
              <div className="grid grid-cols-12 items-center gap-2 md:gap-3">
                {/* Col 1: Rank + Name + Team */}
                <div className="col-span-7 flex items-center gap-2 min-w-0">
                  {(() => {
                    const team = filteredParticipants[0].team;
                    const cust = team ? getTeamCustomization(team) : undefined;
                    if (cust?.imageUrl) {
                      return (
                        <img
                          src={cust.imageUrl}
                          alt={getTeamDisplayName(team)}
                          className="w-7 h-7 md:w-9 md:h-9 rounded-lg object-cover border border-white/20"
                          loading="lazy"
                        />
                      );
                    }
                    return (
                      <span className="text-2xl md:text-3xl select-none">👑</span>
                    );
                  })()}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="text-lg md:text-xl font-bold text-yellow-400 whitespace-nowrap">🥇 #1</div>
                    <div className="flex items-center gap-1 min-w-0">
                      <h3 className="text-sm md:text-base font-bold text-white truncate flex-1 min-w-0">{filteredParticipants[0].name}</h3>
                      {filteredParticipants[0].team && (() => {
                        const cust = getTeamCustomization(filteredParticipants[0].team);
                        const color = cust?.color || '#fbbf24';
                        return (
                          <span
                            className="shrink-0 text-[10px] md:text-xs px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap"
                            style={{
                              backgroundColor: `${color}40`,
                              color: color,
                              border: `1px solid ${color}60`
                            }}
                          >
                            {getTeamDisplayName(filteredParticipants[0].team)}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Col 2: Steps */}
                <div className="col-span-2 -ml-2 md:-ml-2 text-center md:text-left">
                  <div className="text-lg md:text-xl font-bold text-yellow-400 stat-number">
                    {formatNumber(filteredParticipants[0].totalSteps)}
                  </div>
                  <div className="text-[10px] md:text-xs text-gray-400">
                    {stepsToMiles(filteredParticipants[0].totalSteps).toFixed(1)} mi
                  </div>
                </div>

                {/* Col 3: Progress + Achievements */}
                <div className="col-span-3 md:pl-2">
                  <ProgressBar percent={filteredParticipants[0].progressPercent} className="mb-1" />
                  <div className="flex items-center gap-2 text-[10px] md:text-xs overflow-hidden">
                    <MilestoneIndicator milestones={filteredParticipants[0].milestones} size="sm" />
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[10px] md:text-xs text-purple-400">
                    <Sparkles className="w-3 h-3" />
                    <span className="font-medium text-purple-300">WC:</span>
                    <span className="font-semibold">{filteredParticipants[0].points}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rank #2 and #3 - Side by Side (reduced padding) */}
          {filteredParticipants.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {filteredParticipants[1] && (
                <div className="glass-card p-2.5 md:p-3 border-2 border-gray-400/50 bg-gradient-to-br from-gray-400/10 to-gray-500/10 hover:border-gray-400/70 transition-all">
                  <div className="grid grid-cols-12 items-center gap-2 md:gap-3">
                    {/* Col 1: Rank + Name + Team */}
                    <div className="col-span-7 flex items-center gap-2 min-w-0">
                      {(() => {
                        const team = filteredParticipants[1].team;
                        const cust = team ? getTeamCustomization(team) : undefined;
                        if (cust?.imageUrl) {
                          return (
                            <img
                              src={cust.imageUrl}
                              alt={getTeamDisplayName(team)}
                              className="w-6 h-6 md:w-8 md:h-8 rounded-lg object-cover border border-white/20"
                              loading="lazy"
                            />
                          );
                        }
                        return null;
                      })()}
                      <div className="text-lg md:text-xl font-bold text-gray-300 whitespace-nowrap">🥈 #2</div>
                      <div className="flex items-center gap-1 min-w-0">
                        <h3 className="text-sm md:text-base font-bold text-white truncate flex-1 min-w-0">{filteredParticipants[1].name}</h3>
                        {filteredParticipants[1].team && (() => {
                          const cust = getTeamCustomization(filteredParticipants[1].team);
                          const color = cust?.color || '#d1d5db';
                          return (
                            <span
                              className="shrink-0 text-[10px] md:text-xs px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap"
                              style={{
                                backgroundColor: `${color}40`,
                                color: color,
                                border: `1px solid ${color}60`
                              }}
                            >
                              {getTeamDisplayName(filteredParticipants[1].team)}
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Col 2: Steps */}
                    <div className="col-span-2 -ml-2 md:-ml-2 text-center md:text-left">
                      <div className="text-lg md:text-xl font-bold text-gray-300 stat-number">
                        {formatNumber(filteredParticipants[1].totalSteps)}
                      </div>
                      <div className="text-[10px] md:text-xs text-gray-500">
                        {stepsToMiles(filteredParticipants[1].totalSteps).toFixed(1)} mi
                      </div>
                    </div>

                    {/* Col 3: Progress + Achievements */}
                    <div className="col-span-3 md:pl-2">
                      <ProgressBar percent={filteredParticipants[1].progressPercent} className="mb-1" />
                      <div className="flex items-center gap-2 text-[10px] md:text-xs overflow-hidden">
                        <MilestoneIndicator milestones={filteredParticipants[1].milestones} size="sm" />
                      </div>
                      <div className="flex items-center justify-end gap-1 text-[10px] md:text-xs text-purple-400">
                        <Sparkles className="w-3 h-3" />
                        <span className="font-medium text-purple-300">WC:</span>
                        <span className="font-semibold">{filteredParticipants[1].points}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {filteredParticipants[2] && (
                <div className="glass-card p-2.5 md:p-3 border-2 border-orange-400/50 bg-gradient-to-br from-orange-500/10 to-amber-600/10 hover:border-orange-400/70 transition-all">
                  <div className="grid grid-cols-12 items-center gap-2 md:gap-3">
                    {/* Col 1: Rank + Name + Team */}
                    <div className="col-span-7 flex items-center gap-2 min-w-0">
                      <div className="text-lg md:text-xl font-bold text-orange-400 whitespace-nowrap">🥉 #3</div>
                      <div className="flex items-center gap-1 min-w-0">
                        <h3 className="text-sm md:text-base font-bold text-white truncate flex-1 min-w-0">{filteredParticipants[2].name}</h3>
                        {filteredParticipants[2].team && (() => {
                          const cust = getTeamCustomization(filteredParticipants[2].team);
                          const color = cust?.color || '#fb923c';
                          return (
                            <span
                              className="shrink-0 text-[10px] md:text-xs px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap"
                              style={{
                                backgroundColor: `${color}40`,
                                color: color,
                                border: `1px solid ${color}60`
                              }}
                            >
                              {getTeamDisplayName(filteredParticipants[2].team)}
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Col 2: Steps */}
                    <div className="col-span-2 -ml-2 md:-ml-2 text-center md:text-left">
                      <div className="text-lg md:text-xl font-bold text-orange-400 stat-number">
                        {formatNumber(filteredParticipants[2].totalSteps)}
                      </div>
                      <div className="text-[10px] md:text-xs text-gray-500">
                        {stepsToMiles(filteredParticipants[2].totalSteps).toFixed(1)} mi
                      </div>
                    </div>

                    {/* Col 3: Progress + Achievements */}
                    <div className="col-span-3 md:pl-2">
                      <ProgressBar percent={filteredParticipants[2].progressPercent} className="mb-1" />
                      <div className="flex items-center gap-2 text-[10px] md:text-xs overflow-hidden">
                        <MilestoneIndicator milestones={filteredParticipants[2].milestones} size="sm" />
                      </div>
                      <div className="flex items-center justify-end gap-1 text-[10px] md:text-xs text-purple-400">
                        <Sparkles className="w-3 h-3" />
                        <span className="font-medium text-purple-300">WC:</span>
                        <span className="font-semibold">{filteredParticipants[2].points}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rank #4+ */}
          {filteredParticipants.length > 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5 md:gap-2">
              {filteredParticipants.slice(3).map((participant) => (
                <ParticipantCard key={participant.id} participant={participant} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card p-6 md:p-8 text-center">
          <div className="text-4xl md:text-5xl mb-2">🔍</div>
          <p className="text-base md:text-lg text-gray-400">No participants found</p>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}

      {/* Personal Chart Modal */}
      {showChartModal && (
        <PersonalChartModal
          participants={rankedParticipants}
          onClose={() => setShowChartModal(false)}
        />
      )}
    </div>
  );
};

const SortButton: React.FC<{
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
}> = ({ label, active, direction, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm rounded-lg transition-all ${
        active
          ? 'bg-accent text-white font-semibold'
          : 'bg-primary-light text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <span>{label}</span>
      {active && (
        <ArrowUpDown
          className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${direction === 'desc' ? 'rotate-180' : ''}`}
        />
      )}
    </button>
  );
};
