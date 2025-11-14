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
  saveParticipants,
  loadConfig,
  saveConfig,
  getLastSaved,
} from '../utils/storage';
import {
  rankParticipants,
  calculateTeams,
  calculateMilestoneStats,
  calculateTotalSteps,
  calculateAverageSteps,
  generateId,
} from '../utils/calculations';

interface ChallengeContextType {
  // State
  participants: Participant[];
  config: ChallengeConfig;
  rankedParticipants: ParticipantWithRank[];
  teams: Team[];
  lastSaved: Date | null;

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
  addParticipant: (name: string, steps?: number, team?: string | null) => void;
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  deleteParticipant: (id: string) => void;
  updateParticipantSteps: (id: string, steps: number) => void;
  awardWildcardPoint: (participantId: string) => void;
  bulkUpdateFromPacer: (entries: PacerEntry[]) => UpdatePreview[];
  applyBulkUpdate: (previews: UpdatePreview[]) => void;
  updateConfig: (updates: Partial<ChallengeConfig>) => void;
  resetChallenge: () => void;
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

export const ChallengeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [config, setConfig] = useState<ChallengeConfig>(loadConfig());
  const [lastSaved, setLastSaved] = useState<Date | null>(getLastSaved());

  // Load data on mount and ensure points field exists
  useEffect(() => {
    const loaded = loadParticipants();
    // Ensure all participants have points field (default to 0)
    const withPoints = loaded.map((p) => ({
      ...p,
      points: p.points ?? 0,
    }));
    setParticipants(withPoints);
  }, []);

  // Save participants whenever they change
  useEffect(() => {
    if (participants.length > 0 || lastSaved) {
      saveParticipants(participants);
      setLastSaved(new Date());
    }
  }, [participants]);

  // Computed values
  const rankedParticipants = useMemo(() => {
    return rankParticipants(participants, config);
  }, [participants, config]);

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
    (name: string, steps: number = 0, team: string | null = null) => {
      const newParticipant: Participant = {
        id: generateId(),
        name: name.trim(),
        totalSteps: steps,
        points: 0,
        team,
        notes: '',
        createdAt: Date.now(),
        lastUpdated: Date.now(),
      };

      setParticipants((prev) => [...prev, newParticipant]);
    },
    []
  );

  const updateParticipant = useCallback((id: string, updates: Partial<Participant>) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...updates,
              lastUpdated: Date.now(),
            }
          : p
      )
    );
  }, []);

  const deleteParticipant = useCallback((id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateParticipantSteps = useCallback((id: string, steps: number) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              totalSteps: steps,
              lastUpdated: Date.now(),
            }
          : p
      )
    );
  }, []);

  const awardWildcardPoint = useCallback((participantId: string) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId
          ? {
              ...p,
              points: (p.points || 0) + 1,
              lastUpdated: Date.now(),
            }
          : p
      )
    );
  }, []);

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

  const applyBulkUpdate = useCallback((previews: UpdatePreview[]) => {
    setParticipants((prev) => {
      const updated = [...prev];
      const now = Date.now();

      previews.forEach((preview) => {
        if (preview.status === 'new') {
          // Add new participant
          updated.push({
            id: generateId(),
            name: preview.name,
            totalSteps: preview.newSteps,
            points: 0,
            team: null,
            notes: '',
            createdAt: now,
            lastUpdated: now,
          });
        } else if (preview.status === 'update' && preview.participant) {
          // Update existing participant
          const index = updated.findIndex((p) => p.id === preview.participant!.id);
          if (index !== -1) {
            updated[index] = {
              ...updated[index],
              totalSteps: preview.newSteps,
              lastUpdated: now,
            };
          }
        }
      });

      return updated;
    });
  }, []);

  const updateConfig = useCallback((updates: Partial<ChallengeConfig>) => {
    setConfig((prev) => {
      const newConfig = { ...prev, ...updates };
      saveConfig(newConfig);
      return newConfig;
    });
  }, []);

  const resetChallenge = useCallback(() => {
    setParticipants([]);
    setLastSaved(null);
  }, []);

  const value: ChallengeContextType = {
    participants,
    config,
    rankedParticipants,
    teams,
    lastSaved,
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
    resetChallenge,
  };

  return <ChallengeContext.Provider value={value}>{children}</ChallengeContext.Provider>;
};

export const useChallenge = () => {
  const context = useContext(ChallengeContext);
  if (context === undefined) {
    throw new Error('useChallenge must be used within a ChallengeProvider');
  }
  return context;
};
