export interface DailySteps {
  date: string; // YYYY-MM-DD
  steps: number;
  timestamp: number;
}

export interface Participant {
  id: string;
  name: string;
  totalSteps: number;
  points: number; // Wildcard points (starts after Heat Week)
  team: string | null;
  notes: string;
  createdAt: number;
  lastUpdated: number;
  dailyHistory?: DailySteps[]; // Track steps each day
}

export interface TeamCustomization {
  id: string;
  teamName: string;
  displayName: string;
  color: string;
  icon: string;
  imageUrl?: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Team {
  name: string;
  members: Participant[];
  totalSteps: number;
  averageSteps: number;
  rank: number;
  color?: string;
  icon?: string;
  imageUrl?: string;
  description?: string;
  customization?: TeamCustomization;
}

export interface ParticipantWithRank extends Participant {
  rank: number;
  milestones: MilestoneStatus;
  raffleTickets: number;
  progressPercent: number;
  prize?: number;
  dailyAverage?: number;
  trend?: 'up' | 'down' | 'stable';
  pointsRank?: number; // Rank by points
  weekly70kCount?: number; // Total number of weeks achieved 70k
}

export interface MilestoneStatus {
  reached150k: boolean;
  reached225k: boolean;
  reached300k: boolean;
}

export interface ChallengeConfig {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  goalSteps: number;
  milestones: number[];
  prizes: {
    first: number;
    second: number;
    third: number;
    teamBonusPerMember: number; // Changed from teamBonus to teamBonusPerMember
  };
  teamSize: number;
  heatWeekEnabled: boolean;
  teamCompetitionEnabled: boolean;
  teamsFormed?: boolean; // Automated team formation flag
}

export interface PacerEntry {
  name: string;
  steps: number;
  rank: number;
}

export interface ParseResult {
  success: boolean;
  entries: PacerEntry[];
  errors: string[];
}

export interface UpdatePreview {
  name: string;
  oldSteps: number;
  newSteps: number;
  change: number;
  status: 'update' | 'new' | 'unchanged';
  participant?: Participant;
}

export interface CSVEntry {
  name: string;
  steps: number;
}

export interface CSVParseResult {
  success: boolean;
  entries: CSVEntry[];
  errors: string[];
}

export interface HistoricalImport {
  date: string;
  entries: CSVEntry[];
}

export const DEFAULT_CONFIG: ChallengeConfig = {
  startDate: '2025-11-10',
  endDate: '2025-12-10',
  goalSteps: 300000,
  milestones: [150000, 225000, 300000],
  prizes: {
    first: 25,
    second: 15,
    third: 10,
    teamBonusPerMember: 15, // $15 per team member
  },
  teamSize: 3,
  heatWeekEnabled: true,
  teamCompetitionEnabled: true,
};

export type SortField = 'rank' | 'name' | 'team' | 'points';
export type SortDirection = 'asc' | 'desc';

export interface LeaderboardFilters {
  searchTerm: string;
  teamFilter: string | null;
  milestoneFilter: 'all' | '150k' | '225k' | '300k';
  sortField: SortField;
  sortDirection: SortDirection;
}

export interface ComparisonParticipant {
  id: string;
  name: string;
  color: string;
}

export type WildcardCategory =
  | 'best-improved'      // Highest % increase from previous day
  | 'most-steps-day'     // Highest single day step count
  | 'greatest-increase'  // Biggest absolute increase from previous day
  | 'consistency-king'   // Lowest standard deviation over last 7 days
  | 'weekend-warrior'    // Most steps on a weekend day
  | 'comeback-kid'       // Biggest recovery after a low day
  | 'streak-master'      // Most consecutive days hitting 10k steps
  | 'average-excellence' // Highest average over last 3 days
  | 'over-achiever'      // Most above personal average
  | 'daily-dominator';   // Highest steps for specific day of week

export interface WildcardResult {
  id: string;
  date: string; // YYYY-MM-DD
  category: WildcardCategory;
  winnerId: string;
  winnerName: string;
  value: number; // The winning value (steps, %, etc.)
  description: string; // Human-readable description
  timestamp: number;
}

export interface WildcardCategories {
  [key: string]: {
    name: string;
    description: string;
    emoji: string;
  };
}
