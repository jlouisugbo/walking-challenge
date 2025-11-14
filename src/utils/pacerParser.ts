import type { PacerEntry, ParseResult, Participant, UpdatePreview } from '../types';

/**
 * Parse Pacer leaderboard text
 * Expected format:
 * Name
 * 57,449
 * 1
 * Name2
 * 55,709
 * 2
 * ...
 */
export const parsePacerLeaderboard = (text: string): ParseResult => {
  const errors: string[] = [];
  const entries: PacerEntry[] = [];

  try {
    // Clean up the text
    const lines = text
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      return {
        success: false,
        entries: [],
        errors: ['No data to parse. Please paste the Pacer leaderboard.'],
      };
    }

    // Parse in groups of 3: name, steps, rank
    for (let i = 0; i < lines.length; i += 3) {
      if (i + 2 >= lines.length) {
        // Not enough lines for a complete entry
        if (i < lines.length) {
          errors.push(`Incomplete entry at line ${i + 1}`);
        }
        break;
      }

      const name = lines[i];
      const stepsStr = lines[i + 1];
      const rankStr = lines[i + 2];

      // Validate name
      if (!name || name.length === 0) {
        errors.push(`Invalid name at line ${i + 1}`);
        continue;
      }

      // Parse steps (remove commas)
      const steps = parseInt(stepsStr.replace(/,/g, ''), 10);
      if (isNaN(steps) || steps < 0) {
        errors.push(`Invalid steps "${stepsStr}" for ${name}`);
        continue;
      }

      // Parse rank
      const rank = parseInt(rankStr, 10);
      if (isNaN(rank) || rank < 1) {
        errors.push(`Invalid rank "${rankStr}" for ${name}`);
        continue;
      }

      entries.push({
        name: name.trim(),
        steps,
        rank,
      });
    }

    // Check if we got any valid entries
    if (entries.length === 0 && errors.length > 0) {
      return {
        success: false,
        entries: [],
        errors,
      };
    }

    return {
      success: true,
      entries,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      entries: [],
      errors: [`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
};

/**
 * Alternative parser for different formats
 * Try to detect name and number patterns more flexibly
 */
export const parsePacerLeaderboardFlexible = (text: string): ParseResult => {
  const errors: string[] = [];
  const entries: PacerEntry[] = [];

  try {
    const lines = text
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let currentName = '';
    let currentSteps = -1;
    let currentRank = -1;
    let state = 'name'; // 'name' | 'steps' | 'rank'

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Try to detect if this is a number (steps or rank)
      const numberMatch = line.match(/^[\d,]+$/);

      if (state === 'name' && !numberMatch) {
        currentName = line;
        state = 'steps';
      } else if (state === 'steps' && numberMatch) {
        currentSteps = parseInt(line.replace(/,/g, ''), 10);
        state = 'rank';
      } else if (state === 'rank' && numberMatch) {
        currentRank = parseInt(line.replace(/,/g, ''), 10);

        // Save entry
        if (currentName && currentSteps >= 0 && currentRank >= 0) {
          entries.push({
            name: currentName,
            steps: currentSteps,
            rank: currentRank,
          });
        }

        // Reset for next entry
        currentName = '';
        currentSteps = -1;
        currentRank = -1;
        state = 'name';
      }
    }

    if (entries.length === 0) {
      return parsePacerLeaderboard(text); // Fallback to strict parser
    }

    return {
      success: true,
      entries,
      errors,
    };
  } catch (error) {
    return parsePacerLeaderboard(text); // Fallback to strict parser
  }
};

/**
 * Match parsed entries to existing participants
 * Returns preview of changes
 */
export const createUpdatePreview = (
  entries: PacerEntry[],
  existingParticipants: Participant[]
): UpdatePreview[] => {
  const previews: UpdatePreview[] = [];
  const participantMap = new Map(existingParticipants.map((p) => [p.name.toLowerCase(), p]));

  entries.forEach((entry) => {
    const nameLower = entry.name.toLowerCase();
    const existing = participantMap.get(nameLower);

    if (existing) {
      // Existing participant - update
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
      // New participant
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
};

/**
 * Fuzzy match name to existing participants
 * Returns best match or null
 */
export const fuzzyMatchParticipant = (
  name: string,
  participants: Participant[]
): Participant | null => {
  const nameLower = name.toLowerCase();

  // Exact match
  const exactMatch = participants.find((p) => p.name.toLowerCase() === nameLower);
  if (exactMatch) return exactMatch;

  // Partial match (contains)
  const partialMatch = participants.find((p) => {
    const pNameLower = p.name.toLowerCase();
    return pNameLower.includes(nameLower) || nameLower.includes(pNameLower);
  });
  if (partialMatch) return partialMatch;

  return null;
};

/**
 * Calculate similarity score between two strings
 * Uses Levenshtein distance
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  const costs: number[] = [];
  for (let i = 0; i <= s2.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s1.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(j - 1) !== s2.charAt(i - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s1.length] = lastValue;
  }

  const maxLength = Math.max(s1.length, s2.length);
  return maxLength === 0 ? 1 : 1 - costs[s1.length] / maxLength;
};
