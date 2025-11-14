import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Trophy, ArrowUpDown } from 'lucide-react';
import { useChallenge } from '../contexts/ChallengeContext';
import { ParticipantCard } from '../components/ui/ParticipantCard';
import type { SortField, SortDirection } from '../types';

export const Leaderboard: React.FC = () => {
  const { rankedParticipants } = useChallenge();
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [milestoneFilter, setMilestoneFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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
        case 'steps':
          compareValue = a.totalSteps - b.totalSteps;
          break;
        case 'progress':
          compareValue = a.progressPercent - b.progressPercent;
          break;
        case 'rank':
        default:
          compareValue = a.rank - b.rank;
          break;
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [rankedParticipants, searchTerm, teamFilter, milestoneFilter, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Trophy className="w-8 h-8 text-accent" />
          Full Leaderboard
        </h1>
        <div className="text-gray-400 text-lg">
          {filteredParticipants.length} participants
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 space-y-4">
        <div className="flex items-center gap-2 text-accent font-semibold">
          <SlidersHorizontal className="w-5 h-5" />
          <span>Filters & Search</span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-primary-light rounded-lg border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Team Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Filter by Team</label>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full px-4 py-2 bg-primary-light rounded-lg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent"
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
            <label className="block text-sm text-gray-400 mb-2">Milestone Achievement</label>
            <select
              value={milestoneFilter}
              onChange={(e) => setMilestoneFilter(e.target.value)}
              className="w-full px-4 py-2 bg-primary-light rounded-lg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Participants</option>
              <option value="150k">Reached 150k+</option>
              <option value="225k">Reached 225k+</option>
              <option value="300k">Reached 300k (Goal)</option>
            </select>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap gap-2">
          <SortButton
            label="Rank"
            active={sortField === 'rank'}
            direction={sortDirection}
            onClick={() => toggleSort('rank')}
          />
          <SortButton
            label="Name"
            active={sortField === 'name'}
            direction={sortDirection}
            onClick={() => toggleSort('name')}
          />
          <SortButton
            label="Steps"
            active={sortField === 'steps'}
            direction={sortDirection}
            onClick={() => toggleSort('steps')}
          />
          <SortButton
            label="Progress"
            active={sortField === 'progress'}
            direction={sortDirection}
            onClick={() => toggleSort('progress')}
          />
          {teams.length > 0 && (
            <SortButton
              label="Team"
              active={sortField === 'team'}
              direction={sortDirection}
              onClick={() => toggleSort('team')}
            />
          )}
        </div>
      </div>

      {/* Participants List */}
      <div className="space-y-3">
        {filteredParticipants.length > 0 ? (
          filteredParticipants.map((participant) => (
            <ParticipantCard key={participant.id} participant={participant} />
          ))
        ) : (
          <div className="glass-card p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-400">No participants found</p>
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </div>
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
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        active
          ? 'bg-accent text-white font-semibold'
          : 'bg-primary-light text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <span>{label}</span>
      {active && (
        <ArrowUpDown
          className={`w-4 h-4 transition-transform ${direction === 'desc' ? 'rotate-180' : ''}`}
        />
      )}
    </button>
  );
};
