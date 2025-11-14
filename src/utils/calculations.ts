import type { Participant, ParticipantWithRank, Team, MilestoneStatus, ChallengeConfig } from '../types';

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
export const calculateRaffleTickets = (steps: number): number => {
  let tickets = 0;
  if (steps >= 150000) tickets++;
  if (steps >= 225000) tickets++;
  if (steps >= 300000) tickets++;
  return tickets;
};

/**
 * Calculate progress percentage towards goal
 */
export const calculateProgress = (steps: number, goal: number = 300000): number => {
  return Math.min((steps / goal) * 100, 100);
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
  const teamMap = new Map<string, Participant[]>();

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
 * Calculate days elapsed since start
 */
export const calculateDaysElapsed = (startDate: string): number => {
  const start = new Date(startDate);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

/**
 * Check if currently in Heat Week (first week)
 */
export const isHeatWeek = (startDate: string): boolean => {
  const daysElapsed = calculateDaysElapsed(startDate);
  return daysElapsed >= 0 && daysElapsed < 7;
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
