import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { Trophy, Users, Target, TrendingUp, Ticket, Footprints, Sparkles } from 'lucide-react';
import { useChallenge } from '../contexts/ChallengeContext';
import { CountdownTimer } from '../components/ui/CountdownTimer';
import { StatsCard } from '../components/ui/StatsCard';
import { ParticipantCard } from '../components/ui/ParticipantCard';
import { formatNumber, calculateDaysElapsed, isHeatWeek } from '../utils/calculations';
import { isAfterHeatWeek, getWildcardResults, WILDCARD_CATEGORIES } from '../utils/wildcardSystem';

export const Dashboard: React.FC = () => {
  const {
    config,
    rankedParticipants,
    teams,
    totalSteps,
    averageSteps,
    milestoneStats,
    participants,
  } = useChallenge();

  const topThree = rankedParticipants.slice(0, 3);
  const daysElapsed = calculateDaysElapsed(config.startDate);
  const inHeatWeek = isHeatWeek(config.startDate);

  // Wildcard system
  const wildcardActive = isAfterHeatWeek();
  const wildcardResults = getWildcardResults();
  const latestWildcard = wildcardResults.length > 0
    ? wildcardResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;
  const topWildcardLeaders = [...rankedParticipants]
    .filter((p) => p.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 3);

  // Show toast for yesterday's wildcard winner on mount
  useEffect(() => {
    if (!wildcardActive || !latestWildcard) return;

    // Check if this wildcard is from yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (latestWildcard.date === yesterdayStr) {
      // Check if we've already shown this toast
      const shownKey = `wildcard_shown_${latestWildcard.date}`;
      if (!localStorage.getItem(shownKey)) {
        const categoryInfo = (WILDCARD_CATEGORIES as any)[latestWildcard.category];
        toast.success(
          `🎉 Yesterday's Wildcard Winner: ${latestWildcard.winnerName} won "${categoryInfo.emoji} ${categoryInfo.name}"!`,
          { duration: 8000 }
        );
        localStorage.setItem(shownKey, 'true');
      }
    }
  }, [wildcardActive, latestWildcard]);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-accent via-blue-400 to-purple-500 bg-clip-text text-transparent">
          End the Semester Well!
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-white">Step Challenge 2025</h2>
        <div className="flex items-center justify-center gap-4 text-gray-400">
          <span className="text-lg">🗓️ Nov 10 - Dec 10, 2025</span>
          <span className="text-lg">•</span>
          <span className="text-lg">👥 {participants.length} Participants</span>
        </div>

        {/* Challenge Status */}
        <div className="inline-block">
          {inHeatWeek ? (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-bold text-lg animate-pulse">
              🔥 HEAT WEEK - Individual Competition
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full font-bold text-lg">
              👥 Team Competition Active
            </div>
          )}
        </div>
      </section>

      {/* Countdown Timer */}
      <CountdownTimer endDate={config.endDate} />

      {/* Prize Pool Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-7 h-7 text-yellow-400" />
          Prize Pool
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-6 text-center gradient-gold">
            <div className="text-4xl mb-2">🥇</div>
            <div className="text-2xl font-bold text-white">${config.prizes.first}</div>
            <div className="text-sm text-white/80 mt-1">1st Place</div>
          </div>
          <div className="glass-card p-6 text-center gradient-silver">
            <div className="text-4xl mb-2">🥈</div>
            <div className="text-2xl font-bold text-white">${config.prizes.second}</div>
            <div className="text-sm text-gray-700 mt-1">2nd Place</div>
          </div>
          <div className="glass-card p-6 text-center gradient-bronze">
            <div className="text-4xl mb-2">🥉</div>
            <div className="text-2xl font-bold text-white">${config.prizes.third}</div>
            <div className="text-sm text-white/80 mt-1">3rd Place</div>
          </div>
          <div className="glass-card p-6 text-center bg-gradient-to-br from-purple-500 to-indigo-600">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-white">${config.prizes.teamBonusPerMember * config.teamSize}</div>
            <div className="text-sm text-white/80 mt-1">Team Bonus (${config.prizes.teamBonusPerMember}/member)</div>
          </div>
        </div>
      </section>

      {/* Wildcard System */}
      {wildcardActive && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-purple-400" />
            Wildcard Challenge
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Latest Winner */}
            {latestWildcard && (
              <div className="glass-card p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{(WILDCARD_CATEGORIES as any)[latestWildcard.category].emoji}</span>
                  <h3 className="text-lg font-bold text-white">Latest Winner</h3>
                </div>
                <div className="space-y-2">
                  <div className="text-xl font-bold text-purple-300">
                    🏆 {latestWildcard.winnerName}
                  </div>
                  <div className="text-sm text-gray-300">
                    {(WILDCARD_CATEGORIES as any)[latestWildcard.category].name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {latestWildcard.description}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(latestWildcard.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}

            {/* Top Points Leaders */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-bold text-white">Top Wildcard Leaders</h3>
              </div>
              {topWildcardLeaders.length > 0 ? (
                <div className="space-y-2">
                  {topWildcardLeaders.map((participant, index) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between bg-primary-light/50 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                        <span className="text-white">{participant.name}</span>
                      </div>
                      <div className="text-yellow-400 font-semibold">
                        {participant.points} pts
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-4">
                  <p className="text-sm">No wildcard points awarded yet!</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-4 bg-purple-500/10 border border-purple-500/30">
            <p className="text-sm text-gray-300 text-center">
              💡 <strong>Wildcard Challenge:</strong> Earn bonus points by winning daily challenges!
              The participant with the most wildcard points at the end wins a special prize.
              Check the Admin panel after each nightly leaderboard update to see who won today's challenge.
            </p>
          </div>
        </section>
      )}

      {/* Top 3 Leaders */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-7 h-7 text-accent" />
          Top 3 Leaders
        </h2>
        <div className="space-y-4">
          {topThree.length > 0 ? (
            topThree.map((participant) => (
              <ParticipantCard key={participant.id} participant={participant} />
            ))
          ) : (
            <div className="glass-card p-8 text-center text-gray-400">
              <p>No participants yet. Add participants in the Admin page!</p>
            </div>
          )}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-accent" />
          Challenge Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Total Steps"
            value={formatNumber(totalSteps)}
            icon={Footprints}
            subtitle="Combined across all participants"
            iconColor="text-accent"
          />
          <StatsCard
            title="Average Steps"
            value={formatNumber(averageSteps)}
            icon={Target}
            subtitle="Per participant"
            iconColor="text-green-400"
          />
          <StatsCard
            title="Participants"
            value={participants.length}
            icon={Users}
            subtitle={`${milestoneStats.reached300k} reached goal`}
            iconColor="text-purple-400"
          />
          <StatsCard
            title="Raffle Tickets"
            value={milestoneStats.totalTickets}
            icon={Ticket}
            subtitle="Total tickets earned"
            iconColor="text-yellow-400"
          />
          <StatsCard
            title="Days Elapsed"
            value={Math.max(0, daysElapsed)}
            icon={Trophy}
            subtitle="Since challenge started"
            iconColor="text-blue-400"
          />
          <StatsCard
            title="300k Achieved"
            value={milestoneStats.reached300k}
            icon={Target}
            subtitle={`${((milestoneStats.reached300k / (participants.length || 1)) * 100).toFixed(0)}% of participants`}
            iconColor="text-green-400"
          />
        </div>
      </section>

      {/* Milestone Tracker */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Target className="w-7 h-7 text-accent" />
          Milestone Progress
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">⭐</span>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {milestoneStats.reached150k}
                </div>
                <div className="text-sm text-gray-400">Reached 150k</div>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-2">+1 raffle ticket</div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">⭐⭐</span>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {milestoneStats.reached225k}
                </div>
                <div className="text-sm text-gray-400">Reached 225k</div>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-2">+2 raffle tickets total</div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">⭐⭐⭐</span>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {milestoneStats.reached300k}
                </div>
                <div className="text-sm text-gray-400">Reached 300k (Goal!)</div>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-2">+3 raffle tickets total</div>
          </div>
        </div>
      </section>

      {/* Team Standings */}
      {!inHeatWeek && teams.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-accent" />
            Team Standings
          </h2>
          <div className="space-y-3">
            {teams.slice(0, 5).map((team) => (
              <div key={team.name} className="glass-card p-5 hover:scale-[1.02] transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-gray-400">#{team.rank}</div>
                    {team.rank === 1 && <span className="text-3xl">🏆</span>}
                    <div>
                      <div className="text-lg font-bold text-white">{team.name}</div>
                      <div className="text-sm text-gray-400">
                        {team.members.length} members • Avg: {formatNumber(team.averageSteps)} steps
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-accent stat-number">
                      {formatNumber(team.totalSteps)}
                    </div>
                    <div className="text-xs text-gray-400">total steps</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
