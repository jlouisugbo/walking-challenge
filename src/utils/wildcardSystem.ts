import type { Participant, WildcardCategory, WildcardResult, WildcardCategories } from '../types';

export const WILDCARD_CATEGORIES: WildcardCategories = {
  'best-improved': {
    name: 'Best Improved',
    description: 'Highest percentage increase from previous day',
    emoji: '📈',
  },
  'most-steps-day': {
    name: 'Most Steps in One Day',
    description: 'Highest single day step count',
    emoji: '🏆',
  },
  'greatest-increase': {
    name: 'Greatest Increase',
    description: 'Biggest absolute step increase from previous day',
    emoji: '🚀',
  },
  'consistency-king': {
    name: 'Consistency Champion',
    description: 'Most consistent daily steps (lowest variance)',
    emoji: '👑',
  },
  'weekend-warrior': {
    name: 'Weekend Warrior',
    description: 'Most steps on a weekend day',
    emoji: '🎉',
  },
  'comeback-kid': {
    name: 'Comeback Kid',
    description: 'Biggest recovery after a low day',
    emoji: '💪',
  },
  'streak-master': {
    name: 'Streak Master',
    description: 'Most consecutive days hitting 10,000+ steps',
    emoji: '🔥',
  },
  'average-excellence': {
    name: 'Average Excellence',
    description: 'Highest average over last 3 days',
    emoji: '⭐',
  },
  'over-achiever': {
    name: 'Over-Achiever',
    description: 'Most steps above personal average',
    emoji: '🎯',
  },
  'daily-dominator': {
    name: 'Daily Dominator',
    description: 'Highest steps for this day of the week',
    emoji: '👊',
  },
};

// Get random wildcard category
export const getRandomWildcardCategory = (): WildcardCategory => {
  const categories = Object.keys(WILDCARD_CATEGORIES) as WildcardCategory[];
  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex];
};

// Calculate standard deviation
const calculateStdDev = (values: number[]): number => {
  if (values.length === 0) return 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map((value) => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
};

// Get last N days of steps for a participant
const getLastNDaysSteps = (participant: Participant, n: number): number[] => {
  if (!participant.dailyHistory || participant.dailyHistory.length === 0) {
    return [];
  }
  const sorted = [...participant.dailyHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return sorted.slice(0, n).map((d) => d.steps);
};

// Get steps for a specific date
const getStepsForDate = (participant: Participant, date: string): number => {
  if (!participant.dailyHistory) return 0;
  const record = participant.dailyHistory.find((d) => d.date === date);
  return record ? record.steps : 0;
};

// Calculate wildcard winner for a given category
export const calculateWildcardWinner = (
  category: WildcardCategory,
  participants: Participant[],
  date: string
): WildcardResult | null => {
  if (participants.length === 0) return null;

  const dateObj = new Date(date);
  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';

  let winner: Participant | null = null;
  let winnerValue: number = 0;
  let description: string = '';

  switch (category) {
    case 'best-improved': {
      // Highest % increase from previous day
      const yesterday = new Date(dateObj);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let bestPercent = 0;
      participants.forEach((p) => {
        const todaySteps = getStepsForDate(p, date);
        const yesterdaySteps = getStepsForDate(p, yesterdayStr);
        if (yesterdaySteps > 0 && todaySteps > yesterdaySteps) {
          const percent = ((todaySteps - yesterdaySteps) / yesterdaySteps) * 100;
          if (percent > bestPercent) {
            bestPercent = percent;
            winner = p;
            winnerValue = Math.round(percent);
          }
        }
      });
      description = winner ? `${(winner as Participant).name} improved by ${winnerValue}% from the previous day` : '';
      break;
    }

    case 'most-steps-day': {
      // Highest single day step count
      participants.forEach((p) => {
        const todaySteps = getStepsForDate(p, date);
        if (todaySteps > winnerValue) {
          winnerValue = todaySteps;
          winner = p;
        }
      });
      description = winner ? `${(winner as Participant).name} walked ${winnerValue.toLocaleString()} steps today` : '';
      break;
    }

    case 'greatest-increase': {
      // Biggest absolute increase from previous day
      const yesterday2 = new Date(dateObj);
      yesterday2.setDate(yesterday2.getDate() - 1);
      const yesterdayStr2 = yesterday2.toISOString().split('T')[0];

      let bestIncrease = 0;
      participants.forEach((p) => {
        const todaySteps = getStepsForDate(p, date);
        const yesterdaySteps = getStepsForDate(p, yesterdayStr2);
        const increase = todaySteps - yesterdaySteps;
        if (increase > bestIncrease) {
          bestIncrease = increase;
          winner = p;
          winnerValue = increase;
        }
      });
      description = winner ? `${(winner as Participant).name} increased by ${winnerValue.toLocaleString()} steps` : '';
      break;
    }

    case 'consistency-king': {
      // Lowest standard deviation over last 7 days
      let lowestStdDev = Infinity;
      participants.forEach((p) => {
        const last7Days = getLastNDaysSteps(p, 7);
        if (last7Days.length >= 3) {
          const stdDev = calculateStdDev(last7Days);
          if (stdDev < lowestStdDev) {
            lowestStdDev = stdDev;
            winner = p;
            winnerValue = Math.round(stdDev);
          }
        }
      });
      description = winner ? `${(winner as Participant).name} maintained the most consistent pace` : '';
      break;
    }

    case 'weekend-warrior': {
      // Most steps on a weekend day (only triggers on weekends)
      if (!isWeekend) {
        // Fallback to most-steps-day if not weekend
        return calculateWildcardWinner('most-steps-day', participants, date);
      }
      participants.forEach((p) => {
        const todaySteps = getStepsForDate(p, date);
        if (todaySteps > winnerValue) {
          winnerValue = todaySteps;
          winner = p;
        }
      });
      description = winner ? `${(winner as Participant).name} dominated the weekend with ${winnerValue.toLocaleString()} steps` : '';
      break;
    }

    case 'comeback-kid': {
      // Biggest recovery after a low day
      const yesterday3 = new Date(dateObj);
      yesterday3.setDate(yesterday3.getDate() - 1);
      const yesterdayStr3 = yesterday3.toISOString().split('T')[0];

      let bestComebackRatio = 0;
      participants.forEach((p) => {
        const todaySteps = getStepsForDate(p, date);
        const yesterdaySteps = getStepsForDate(p, yesterdayStr3);
        // Comeback is when yesterday was low (< 8000) and today is high
        if (yesterdaySteps > 0 && yesterdaySteps < 8000 && todaySteps > yesterdaySteps) {
          const ratio = todaySteps / yesterdaySteps;
          if (ratio > bestComebackRatio) {
            bestComebackRatio = ratio;
            winner = p;
            winnerValue = todaySteps;
          }
        }
      });
      description = winner ? `${(winner as Participant).name} bounced back with ${winnerValue.toLocaleString()} steps` : '';
      break;
    }

    case 'streak-master': {
      // Most consecutive days hitting 10k steps
      let longestStreak = 0;
      participants.forEach((p) => {
        if (!p.dailyHistory) return;
        const sorted = [...p.dailyHistory].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        let currentStreak = 0;
        for (const day of sorted) {
          if (day.steps >= 10000) {
            currentStreak++;
          } else {
            currentStreak = 0;
          }
        }

        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
          winner = p;
          winnerValue = currentStreak;
        }
      });
      description = winner ? `${(winner as Participant).name} hit 10k+ steps for ${winnerValue} days straight` : '';
      break;
    }

    case 'average-excellence': {
      // Highest average over last 3 days
      let bestAvg = 0;
      participants.forEach((p) => {
        const last3Days = getLastNDaysSteps(p, 3);
        if (last3Days.length === 3) {
          const avg = last3Days.reduce((a, b) => a + b, 0) / 3;
          if (avg > bestAvg) {
            bestAvg = avg;
            winner = p;
            winnerValue = Math.round(avg);
          }
        }
      });
      description = winner ? `${(winner as Participant).name} averaged ${winnerValue.toLocaleString()} steps over 3 days` : '';
      break;
    }

    case 'over-achiever': {
      // Most steps above personal average
      let bestAboveAvg = 0;
      participants.forEach((p) => {
        if (!p.dailyHistory || p.dailyHistory.length === 0) return;
        const allSteps = p.dailyHistory.map((d) => d.steps);
        const avg = allSteps.reduce((a, b) => a + b, 0) / allSteps.length;
        const todaySteps = getStepsForDate(p, date);
        const aboveAvg = todaySteps - avg;
        if (aboveAvg > bestAboveAvg) {
          bestAboveAvg = aboveAvg;
          winner = p;
          winnerValue = Math.round(aboveAvg);
        }
      });
      description = winner ? `${(winner as Participant).name} exceeded their average by ${winnerValue.toLocaleString()} steps` : '';
      break;
    }

    case 'daily-dominator': {
      // Highest steps for this specific day of week
      participants.forEach((p) => {
        const todaySteps = getStepsForDate(p, date);
        if (todaySteps > winnerValue) {
          winnerValue = todaySteps;
          winner = p;
        }
      });
      description = winner ? `${(winner as Participant).name} dominated ${dayOfWeek} with ${winnerValue.toLocaleString()} steps` : '';
      break;
    }
  }

  if (!winner) return null;

  const winnerParticipant = winner as Participant;

  return {
    id: `${date}-${category}`,
    date,
    category,
    winnerId: winnerParticipant.id,
    winnerName: winnerParticipant.name,
    value: winnerValue,
    description,
    timestamp: Date.now(),
  };
};

// Check if Heat Week has passed (Nov 10-16, 2025)
export const isAfterHeatWeek = (date: Date = new Date()): boolean => {
  const heatWeekEnd = new Date('2025-11-16T23:59:59');
  return date > heatWeekEnd;
};

// Re-export Supabase storage functions for wildcard results
export { getWildcardResults, saveWildcardResult, getTodaysWildcard } from './supabaseStorage';
