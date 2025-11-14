export interface DailySteps {
  date: string; // YYYY-MM-DD
  steps: number;
  timestamp: number;
}

export interface Participant {
  id: string;
  name: string;
  totalSteps: number;
  team: string | null;
  notes: string;
  createdAt: number;
  lastUpdated: number;
  dailyHistory?: DailySteps[]; // Track steps each day
}

export interface Team {
  name: string;
  members: Participant[];
  totalSteps: number;
  averageSteps: number;
  rank: number;
  color?: string;
}

export interface ParticipantWithRank extends Participant {
  rank: number;
  milestones: MilestoneStatus;
  raffleTickets: number;
  progressPercent: number;
  prize?: number;
  dailyAverage?: number;
  trend?: 'up' | 'down' | 'stable';
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
    first: 40,
    second: 25,
    third: 15,
    teamBonusPerMember: 10, // $10 per team member
  },
  teamSize: 3,
  heatWeekEnabled: true,
  teamCompetitionEnabled: true,
};

export type SortField = 'rank' | 'name' | 'team' | 'steps' | 'progress';
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
