import type { Participant, ParticipantWithRank, Team, MilestoneStatus, ChallengeConfig, Badge, RankChange } from '../types';

/**
 * Calculate milestone status based on total steps
 */
export const calculateMilestones = (steps: number): MilestoneStatus => {
  return {
    reached150k: steps >= 150000,
    reached225k: steps >= 225000,
    reached300k: steps >= 300000,
  };
};

/**
 * Calculate number of raffle tickets earned
 */
export const calculateRaffleTickets = (steps: number, weekly70kCount: number = 0): number => {
  let tickets = 0;
  // Milestone-based tickets (cumulative total steps)
  if (steps >= 150000) tickets++;
  if (steps >= 225000) tickets++;
  if (steps >= 300000) tickets++;
  // Weekly 70k raffle tickets (1 ticket per 4 weeks of hitting 70k)
  tickets += Math.floor(weekly70kCount / 4);
  return tickets;
};

/**
 * Calculate current streak of consecutive days with 10k+ steps
 * @param dailyHistory Array of {date: string, steps: number} sorted by date descending
 * @returns Number of consecutive days with 10k+ steps (starting from most recent day)
 */
export const calculateStreak = (dailyHistory: Array<{ date: string; steps: number }>): number => {
  if (!dailyHistory || dailyHistory.length === 0) return 0;

  // Sort by date descending (most recent first)
  const sorted = [...dailyHistory].sort((a, b) => b.date.localeCompare(a.date));

  let streak = 0;
  const today = getCurrentEST();
  let checkDate = new Date(today);
  checkDate.setHours(0, 0, 0, 0);

  // Count consecutive days with 10k+ steps, going backwards from today
  for (const entry of sorted) {
    const entryDate = new Date(entry.date + 'T00:00:00');
    const expectedDate = new Date(checkDate);

    // Check if this entry matches our expected date
    if (entryDate.toDateString() === expectedDate.toDateString()) {
      if (entry.steps >= 10000) {
        streak++;
        // Move to previous day
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Streak broken
        break;
      }
    } else if (entryDate < expectedDate) {
      // Missing day(s), streak broken
      break;
    }
    // If entryDate > expectedDate, skip this entry (future date)
  }

  return streak;
};

/**
 * Calculate badges/achievements for a participant
 * @param participant Participant with rank data
 * @returns Array of earned badges
 */
export const calculateBadges = (participant: {
  totalSteps: number;
  rank: number;
  points: number;
  weekly70kCount?: number;
  streak?: number;
  milestones: { reached150k: boolean; reached225k: boolean; reached300k: boolean };
}): Badge[] => {
  const badges: Badge[] = [];

  // Goal Crusher - Reached 300k steps
  if (participant.milestones.reached300k) {
    badges.push({
      id: 'goal-crusher',
      name: 'Goal Crusher',
      icon: '🏆',
      color: 'text-yellow-400',
      description: 'Reached the 300k step goal!',
    });
  }

  // Top Performer - Rank 1-3
  if (participant.rank <= 3) {
    badges.push({
      id: 'top-performer',
      name: 'Top Performer',
      icon: '⭐',
      color: 'text-yellow-500',
      description: 'Ranked in top 3!',
    });
  }

  // Week Warrior - Multiple 70k weeks
  if (participant.weekly70kCount && participant.weekly70kCount >= 3) {
    badges.push({
      id: 'week-warrior',
      name: 'Week Warrior',
      icon: '💪',
      color: 'text-green-400',
      description: `Achieved 70k steps in ${participant.weekly70kCount} weeks!`,
    });
  }

  // Streak Master - Long streak
  if (participant.streak && participant.streak >= 7) {
    badges.push({
      id: 'streak-master',
      name: 'Streak Master',
      icon: '🔥',
      color: 'text-orange-400',
      description: `${participant.streak} day streak of 10k+ steps!`,
    });
  }

  // Wildcard Winner - Has wildcard points
  if (participant.points > 0) {
    badges.push({
      id: 'wildcard-winner',
      name: 'Wildcard Winner',
      icon: '✨',
      color: 'text-purple-400',
      description: `Won ${participant.points} wildcard challenge${participant.points > 1 ? 's' : ''}!`,
    });
  }

  // Milestone Achiever - Reached at least 150k
  if (participant.milestones.reached150k && !participant.milestones.reached300k) {
    badges.push({
      id: 'milestone-achiever',
      name: 'Milestone Achiever',
      icon: '🎯',
      color: 'text-blue-400',
      description: 'Reached significant milestone!',
    });
  }

  return badges;
};

/**
 * Calculate rank change from yesterday to today
 * @param participants All participants with their daily history
 * @param currentParticipant The participant to calculate change for
 * @returns Rank change information
 */
export const calculateRankChange = (
  participants: Array<{ id: string; totalSteps: number; dailyHistory?: Array<{ date: string; steps: number }> }>,
  currentParticipant: { id: string; totalSteps: number; dailyHistory?: Array<{ date: string; steps: number }> }
): RankChange => {
  // Get yesterday's date
  const yesterday = new Date(getCurrentEST());
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Calculate yesterday's total steps for all participants
  const yesterdaySteps = participants.map(p => {
    // Sum all steps up to yesterday (not including today)
    const historyUpToYesterday = p.dailyHistory?.filter(h => h.date <= yesterdayStr) || [];
    const totalSteps = historyUpToYesterday.reduce((sum, h) => sum + h.steps, 0);
    return { id: p.id, totalSteps };
  });

  // Rank participants by yesterday's steps
  const yesterdayRanked = yesterdaySteps
    .sort((a, b) => b.totalSteps - a.totalSteps)
    .map((p, index) => ({ id: p.id, rank: index + 1 }));

  // Find participant's rank yesterday
  const yesterdayRank = yesterdayRanked.find(p => p.id === currentParticipant.id)?.rank || 0;

  // Current rank is passed separately, we need to get it from the sorted list
  const currentRanked = [...participants]
    .sort((a, b) => b.totalSteps - a.totalSteps)
    .map((p, index) => ({ id: p.id, rank: index + 1 }));

  const currentRank = currentRanked.find(p => p.id === currentParticipant.id)?.rank || 0;

  // Calculate change (negative because lower rank number is better)
  const change = yesterdayRank - currentRank;

  return {
    change: Math.abs(change),
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same',
  };
};

/**
 * Calculate progress percentage towards goal
 */
export const calculateProgress = (steps: number, goal: number = 300000): number => {
  return Math.min((steps / goal) * 100, 100);
};

/**
 * Convert steps to miles (average: 2,000 steps ≈ 1 mile)
 */
export const stepsToMiles = (steps: number): number => {
  return steps / 2000;
};

/**
 * Get progress color class based on percentage
 */
export const getProgressColor = (percent: number): string => {
  if (percent < 50) return 'progress-low';
  if (percent < 75) return 'progress-medium';
  return 'progress-high';
};

/**
 * Sort and rank participants by steps
 */
export const rankParticipants = (
  participants: Participant[],
  config: ChallengeConfig
): ParticipantWithRank[] => {
  // Sort by steps descending
  const sorted = [...participants].sort((a, b) => b.totalSteps - a.totalSteps);

  // Assign ranks (handle ties)
  let currentRank = 1;
  let previousSteps = -1;
  let participantsAtSameRank = 0;

  const ranked = sorted.map((participant, index) => {
    if (participant.totalSteps !== previousSteps) {
      currentRank = index + 1;
      participantsAtSameRank = 1;
    } else {
      participantsAtSameRank++;
    }
    previousSteps = participant.totalSteps;

    const milestones = calculateMilestones(participant.totalSteps);
    const raffleTickets = calculateRaffleTickets(participant.totalSteps);
    const progressPercent = calculateProgress(participant.totalSteps, config.goalSteps);

    // Assign prize for top 3
    let prize: number | undefined;
    if (currentRank === 1) prize = config.prizes.first;
    else if (currentRank === 2) prize = config.prizes.second;
    else if (currentRank === 3) prize = config.prizes.third;

    return {
      ...participant,
      rank: currentRank,
      milestones,
      raffleTickets,
      progressPercent,
      prize,
    };
  });

  return ranked;
};

/**
 * Calculate team statistics
 */
export const calculateTeams = (participants: ParticipantWithRank[]): Team[] => {
  const teamMap = new Map<string, ParticipantWithRank[]>();

  // Group participants by team
  participants.forEach((participant) => {
    if (participant.team) {
      if (!teamMap.has(participant.team)) {
        teamMap.set(participant.team, []);
      }
      teamMap.get(participant.team)!.push(participant);
    }
  });

  // Calculate team stats
  const teams: Team[] = Array.from(teamMap.entries()).map(([name, members]) => {
    const totalSteps = members.reduce((sum, m) => sum + m.totalSteps, 0);
    const averageSteps = members.length > 0 ? Math.round(totalSteps / members.length) : 0;

    return {
      name,
      members,
      totalSteps,
      averageSteps,
      rank: 0, // Will be set after sorting
    };
  });

  // Sort teams by total steps and assign ranks
  const sortedTeams = teams.sort((a, b) => b.totalSteps - a.totalSteps);
  sortedTeams.forEach((team, index) => {
    team.rank = index + 1;
  });

  return sortedTeams;
};

/**
 * Calculate days remaining in challenge
 */
export const calculateDaysRemaining = (endDate: string): number => {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Get current time in EST timezone
 */
export const getCurrentEST = (): Date => {
  // Get current time and convert to EST
  const now = new Date();
  const estString = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
  return new Date(estString);
};

/**
 * Calculate days elapsed since start (using EST timezone)
 */
export const calculateDaysElapsed = (startDate: string): number => {
  const start = new Date(startDate + 'T00:00:00');  // Assume start date is EST midnight
  const nowEST = getCurrentEST();
  const diff = nowEST.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

/**
 * Check if currently in Heat Week (first 7 days: Nov 10-16, 2025)
 * Heat Week ends Nov 17, 2025 12:00 AM EST
 */
export const isHeatWeek = (): boolean => {
  // Heat Week is specifically Nov 10-16, 2025
  // Teams start Nov 17, 2025 12:00 AM EST
  const nowEST = getCurrentEST();
  const teamStartDate = new Date('2025-11-17T00:00:00'); // Nov 17, 2025 12:00 AM EST
  return nowEST < teamStartDate;
};

/**
 * Format number with commas
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

/**
 * Calculate milestone statistics across all participants
 */
export const calculateMilestoneStats = (participants: ParticipantWithRank[]) => {
  return {
    reached150k: participants.filter((p) => p.milestones.reached150k).length,
    reached225k: participants.filter((p) => p.milestones.reached225k).length,
    reached300k: participants.filter((p) => p.milestones.reached300k).length,
    totalTickets: participants.reduce((sum, p) => sum + p.raffleTickets, 0),
  };
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Calculate total steps across all participants
 */
export const calculateTotalSteps = (participants: Participant[]): number => {
  return participants.reduce((sum, p) => sum + p.totalSteps, 0);
};

/**
 * Calculate average steps per participant
 */
export const calculateAverageSteps = (participants: Participant[]): number => {
  if (participants.length === 0) return 0;
  return Math.round(calculateTotalSteps(participants) / participants.length);
};

/**
 * Find most improved participant (highest step increase)
 * Note: This requires historical data which we'll track later
 */
export const findMostImproved = (participants: ParticipantWithRank[]): ParticipantWithRank | null => {
  // For now, return the participant with highest steps
  // This can be enhanced with historical tracking
  if (participants.length === 0) return null;
  return participants[0];
};

/**
 * Get rank medal emoji
 */
export const getRankMedal = (rank: number): string => {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return '';
  }
};

/**
 * Get rank color class
 */
export const getRankColor = (rank: number): string => {
  switch (rank) {
    case 1:
      return 'gradient-gold';
    case 2:
      return 'gradient-silver';
    case 3:
      return 'gradient-bronze';
    default:
      return '';
  }
};
