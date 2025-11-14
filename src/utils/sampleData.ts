import type { Participant } from '../types';
import { generateId } from './calculations';

/**
 * Sample participants based on the real challenge data
 */
export const SAMPLE_PARTICIPANTS: Omit<Participant, 'id' | 'createdAt' | 'lastUpdated'>[] = [
  { name: 'Nadia', totalSteps: 57449, team: 'Team Alpha', notes: '' },
  { name: 'Joel', totalSteps: 55709, team: 'Team Bravo', notes: '' },
  { name: 'Shreya', totalSteps: 50499, team: 'Team Charlie', notes: '' },
  { name: 'Anjali', totalSteps: 42883, team: 'Team Alpha', notes: '' },
  { name: 'Grace', totalSteps: 42716, team: 'Team Bravo', notes: '' },
  { name: 'Ataallah', totalSteps: 41484, team: 'Team Charlie', notes: '' },
  { name: 'Cynné', totalSteps: 40276, team: 'Team Alpha', notes: '' },
  { name: 'Anelé', totalSteps: 37561, team: 'Team Bravo', notes: '' },
  { name: 'Kemet', totalSteps: 36295, team: 'Team Charlie', notes: '' },
  { name: 'Gbemi', totalSteps: 35064, team: 'Team Delta', notes: '' },
  { name: 'Participant 11', totalSteps: 28500, team: 'Team Delta', notes: '' },
  { name: 'Participant 12', totalSteps: 25000, team: 'Team Delta', notes: '' },
  { name: 'Participant 13', totalSteps: 15000, team: 'Team Echo', notes: '' },
  { name: 'Participant 14', totalSteps: 8000, team: 'Team Echo', notes: '' },
];

/**
 * Generate full participant objects with IDs and timestamps
 */
export const generateSampleParticipants = (): Participant[] => {
  const now = Date.now();
  return SAMPLE_PARTICIPANTS.map((p) => ({
    ...p,
    id: generateId(),
    createdAt: now,
    lastUpdated: now,
  }));
};

/**
 * Sample Pacer leaderboard text for testing paste functionality
 */
export const SAMPLE_PACER_TEXT = `Nadia
57,449
1
Joel
55,709
2
Shreya
50,499
3
Anjali
42,883
4
Grace
42,716
5
Ataallah
41,484
6
Cynné
40,276
7
Anelé
37,561
8
Kemet
36,295
9
Gbemi
35,064
10`;
