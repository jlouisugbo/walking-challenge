import type { Participant, ChallengeConfig } from '../types';
import { DEFAULT_CONFIG } from '../types';

const STORAGE_KEYS = {
  PARTICIPANTS: 'stepChallenge_participants',
  CONFIG: 'stepChallenge_config',
  LAST_SAVED: 'stepChallenge_lastSaved',
} as const;

/**
 * Save participants to localStorage
 */
export const saveParticipants = (participants: Participant[]): boolean => {
  try {
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
    localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
    return true;
  } catch (error) {
    console.error('Failed to save participants:', error);
    return false;
  }
};

/**
 * Load participants from localStorage
 */
export const loadParticipants = (): Participant[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
    if (!data) return [];

    const participants = JSON.parse(data);
    return Array.isArray(participants) ? participants : [];
  } catch (error) {
    console.error('Failed to load participants:', error);
    return [];
  }
};

/**
 * Save challenge config to localStorage
 */
export const saveConfig = (config: ChallengeConfig): boolean => {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('Failed to save config:', error);
    return false;
  }
};

/**
 * Load challenge config from localStorage
 */
export const loadConfig = (): ChallengeConfig => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!data) return DEFAULT_CONFIG;

    const config = JSON.parse(data);
    return { ...DEFAULT_CONFIG, ...config };
  } catch (error) {
    console.error('Failed to load config:', error);
    return DEFAULT_CONFIG;
  }
};

/**
 * Get last saved timestamp
 */
export const getLastSaved = (): Date | null => {
  try {
    const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_SAVED);
    return timestamp ? new Date(timestamp) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Export all data as JSON
 */
export const exportData = (): string => {
  const participants = loadParticipants();
  const config = loadConfig();
  const lastSaved = getLastSaved();

  return JSON.stringify(
    {
      participants,
      config,
      lastSaved,
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
};

/**
 * Import data from JSON
 */
export const importData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);

    if (data.participants && Array.isArray(data.participants)) {
      saveParticipants(data.participants);
    }

    if (data.config) {
      saveConfig(data.config);
    }

    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
};

/**
 * Clear all data from localStorage
 */
export const clearAllData = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PARTICIPANTS);
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.removeItem(STORAGE_KEYS.LAST_SAVED);
    return true;
  } catch (error) {
    console.error('Failed to clear data:', error);
    return false;
  }
};

/**
 * Download data as JSON file
 */
export const downloadBackup = (): void => {
  const data = exportData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `step-challenge-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Check if localStorage is available
 */
export const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
};
