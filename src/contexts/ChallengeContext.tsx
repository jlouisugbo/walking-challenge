import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type {
  Participant,
  ParticipantWithRank,
  Team,
  ChallengeConfig,
  UpdatePreview,
  PacerEntry,
} from '../types';
import {
  loadParticipants,
  addParticipant as addParticipantDb,
  updateParticipant as updateParticipantDb,
  deleteParticipant as deleteParticipantDb,
  awardWildcardPoint as awardWildcardPointDb,
  loadConfig,
  saveConfig,
  getLastSaved,
  getWeekly70kCounts,
  saveDailyHistory,
} from '../utils/supabaseStorage';
import {
  rankParticipants,
  calculateTeams,
  calculateMilestoneStats,
  calculateTotalSteps,
  calculateAverageSteps,
  calculateRaffleTickets,
} from '../utils/calculations';
import { runAutomationChecks } from '../utils/automation';

interface ChallengeContextType {
  // State
  participants: Participant[];
  config: ChallengeConfig;
  rankedParticipants: ParticipantWithRank[];
  teams: Team[];
  lastSaved: Date | null;
  loading: boolean;

  // Computed values
  totalSteps: number;
  averageSteps: number;
  milestoneStats: {
    reached150k: number;
    reached225k: number;
    reached300k: number;
    totalTickets: number;
  };

  // Actions
  addParticipant: (name: string, steps?: number, team?: string | null) => Promise<void>;
  updateParticipant: (id: string, updates: Partial<Participant>) => Promise<void>;
  deleteParticipant: (id: string) => Promise<void>;
  updateParticipantSteps: (id: string, steps: number) => Promise<void>;
  awardWildcardPoint: (participantId: string) => Promise<void>;
  bulkUpdateFromPacer: (entries: PacerEntry[]) => UpdatePreview[];
  applyBulkUpdate: (previews: UpdatePreview[]) => Promise<void>;
  updateConfig: (updates: Partial<ChallengeConfig>) => Promise<void>;
  refreshData: () => Promise<void>;
  resetChallenge: () => void;
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

export const ChallengeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [config, setConfig] = useState<ChallengeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [weekly70kCounts, setWeekly70kCounts] = useState<Map<string, number>>(new Map());

  // Load initial data from Supabase
  const loadData = useCallback(async () => {
    console.log('📊 Loading challenge data from Supabase...');
    setLoading(true);
    try {
      const [participantsData, configData, weekly70kCountsData] = await Promise.all([
        loadParticipants(),
        loadConfig(),
        getWeekly70kCounts(),
      ]);
      console.log('✅ Data loaded:', {
        participants: participantsData.length,
        config: configData,
        weekly70kCounts: weekly70kCountsData.size
      });
      setParticipants(participantsData);
      setConfig(configData);
      setWeekly70kCounts(weekly70kCountsData);
      setLastSaved(getLastSaved());
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Run automation checks after data is loaded
  useEffect(() => {
    if (!config || loading) return;

    // Run automation checks (wildcard and team formation)
    // Don't wait for participants - automation handles empty arrays
    const runChecks = async () => {
      try {
        await runAutomationChecks(participants, config);
      } catch (error) {
        console.error('Automation check error (non-fatal):', error);
        // Don't crash the app if automation fails
      }
    };

    runChecks();
  }, [participants, config, loading]);

  // Refresh data from database
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Computed values
  const rankedParticipants = useMemo(() => {
    if (!config) return [];
    const ranked = rankParticipants(participants, config);
    // Add weekly70kCount and recalculate raffle tickets
    return ranked.map(p => {
      const weekly70kCount = weekly70kCounts.get(p.id) || 0;
      const raffleTickets = calculateRaffleTickets(p.totalSteps, weekly70kCount);
      return {
        ...p,
        weekly70kCount,
        raffleTickets
      };
    });
  }, [participants, config, weekly70kCounts]);

  const teams = useMemo(() => {
    return calculateTeams(rankedParticipants);
  }, [rankedParticipants]);

  const totalSteps = useMemo(() => {
    return calculateTotalSteps(participants);
  }, [participants]);

  const averageSteps = useMemo(() => {
    return calculateAverageSteps(participants);
  }, [participants]);

  const milestoneStats = useMemo(() => {
    return calculateMilestoneStats(rankedParticipants);
  }, [rankedParticipants]);

  // Actions
  const addParticipant = useCallback(
    async (name: string, steps: number = 0, team: string | null = null) => {
      const newParticipant = await addParticipantDb(name, steps, team);
      if (newParticipant) {
        await refreshData();
      }
    },
    [refreshData]
  );

  const updateParticipant = useCallback(
    async (id: string, updates: Partial<Participant>) => {
      await updateParticipantDb(id, updates);
      await refreshData();
    },
    [refreshData]
  );

  const deleteParticipant = useCallback(
    async (id: string) => {
      await deleteParticipantDb(id);
      await refreshData();
    },
    [refreshData]
  );

  const updateParticipantSteps = useCallback(
    async (id: string, steps: number) => {
      await updateParticipantDb(id, { totalSteps: steps });
      await refreshData();
    },
    [refreshData]
  );

  const awardWildcardPoint = useCallback(
    async (participantId: string) => {
      await awardWildcardPointDb(participantId);
      await refreshData();
    },
    [refreshData]
  );

  const bulkUpdateFromPacer = useCallback(
    (entries: PacerEntry[]): UpdatePreview[] => {
      const previews: UpdatePreview[] = [];
      const participantMap = new Map(participants.map((p) => [p.name.toLowerCase(), p]));

      entries.forEach((entry) => {
        const nameLower = entry.name.toLowerCase();
        const existing = participantMap.get(nameLower);

        if (existing) {
          const change = entry.steps - existing.totalSteps;
          previews.push({
            name: entry.name,
            oldSteps: existing.totalSteps,
            newSteps: entry.steps,
            change,
            status: change === 0 ? 'unchanged' : 'update',
            participant: existing,
          });
        } else {
          previews.push({
            name: entry.name,
            oldSteps: 0,
            newSteps: entry.steps,
            change: entry.steps,
            status: 'new',
          });
        }
      });

      return previews;
    },
    [participants]
  );

  const applyBulkUpdate = useCallback(
    async (previews: UpdatePreview[]) => {
      // Use standardized date/time for entire bulk import (EST timezone)
      const now = new Date();
      const estDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const dateStr = estDate.toISOString().split('T')[0]; // YYYY-MM-DD format

      console.log(`📅 Bulk import for date: ${dateStr}`);

      // Process all updates
      const updates = previews.map(async (preview) => {
        if (preview.status === 'new') {
          // Add new participant - historical tracking starts from next import
          const participantId = await addParticipantDb(preview.name, preview.newSteps, null);
          console.log(`➕ New participant: ${preview.name} with ${preview.newSteps} steps (historical tracking starts from next import)`);
          return participantId;
        } else if (preview.status === 'update' && preview.participant) {
          // Update existing participant
          await updateParticipantDb(preview.participant.id, {
            totalSteps: preview.newSteps,
          });
          // Save daily increment to history
          const dailySteps = preview.newSteps - preview.oldSteps;
          if (dailySteps !== 0) {
            await saveDailyHistory(preview.participant.id, dateStr, dailySteps);
            console.log(`📊 ${preview.name}: ${dailySteps > 0 ? '+' : ''}${dailySteps} steps for ${dateStr}`);
          }
        }
      });

      await Promise.all(updates);
      await refreshData();
    },
    [refreshData]
  );

  const updateConfig = useCallback(
    async (updates: Partial<ChallengeConfig>) => {
      if (!config) return;
      const newConfig = { ...config, ...updates };
      await saveConfig(newConfig);
      setConfig(newConfig);
    },
    [config]
  );

  const resetChallenge = useCallback(() => {
    setParticipants([]);
    setLastSaved(null);
    // Note: This doesn't delete from database, just clears local state
    // You would need to manually delete from Supabase dashboard
  }, []);

  const value: ChallengeContextType = {
    participants,
    config: config || ({} as ChallengeConfig), // Fallback for initial render
    rankedParticipants,
    teams,
    lastSaved,
    loading,
    totalSteps,
    averageSteps,
    milestoneStats,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    updateParticipantSteps,
    awardWildcardPoint,
    bulkUpdateFromPacer,
    applyBulkUpdate,
    updateConfig,
    refreshData,
    resetChallenge,
  };

  // Show loading screen while initial data loads
  if (loading && !config) {
    return (
      <ChallengeContext.Provider value={value}>
        <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-primary flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-white text-xl">Loading Step Challenge...</p>
          </div>
        </div>
      </ChallengeContext.Provider>
    );
  }

  return <ChallengeContext.Provider value={value}>{children}</ChallengeContext.Provider>;
};

export const useChallenge = () => {
  const context = useContext(ChallengeContext);
  if (context === undefined) {
    throw new Error('useChallenge must be used within a ChallengeProvider');
  }
  return context;
};
