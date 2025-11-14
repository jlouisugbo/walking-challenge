/**
 * Automation Service
 * Handles automatic wildcard selection and team formation
 */

import { supabaseAdmin } from '../lib/supabase';
import type { Participant } from '../types';
import {
  getRandomWildcardCategory,
  calculateWildcardWinner,
  isAfterHeatWeek,
} from './wildcardSystem';
import { saveWildcardResult, getWildcardResults, awardWildcardPoint } from './supabaseStorage';

// ============================================
// AUTOMATED WILDCARD SELECTION
// ============================================

/**
 * Check if wildcard needs to be run for yesterday
 * If yes, automatically select a random category and award the point
 */
export const checkAndRunAutomatedWildcard = async (participants: Participant[]): Promise<void> => {
  try {
    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if wildcard is active (after Heat Week)
    if (!isAfterHeatWeek(yesterday)) {
      console.log('Wildcard not active yet (before Heat Week)');
      return;
    }

    // Check if wildcard already exists for yesterday
    const existingResults = await getWildcardResults();
    const yesterdayResult = existingResults.find(r => r.date === yesterdayStr);

    if (yesterdayResult) {
      console.log(`Wildcard already exists for ${yesterdayStr}`);
      return;
    }

    // No wildcard for yesterday - run it now!
    console.log(`Running automated wildcard for ${yesterdayStr}`);

    // Select random category
    const category = getRandomWildcardCategory();
    console.log(`Selected category: ${category}`);

    // Calculate winner
    const winner = calculateWildcardWinner(category, participants, yesterdayStr);

    if (!winner) {
      console.log('No valid winner could be calculated');
      return;
    }

    // Save the result
    await saveWildcardResult(winner);

    // Award the point
    await awardWildcardPoint(winner.winnerId);

    console.log(`✨ Automated wildcard completed! Winner: ${winner.winnerName}`);
  } catch (error) {
    console.error('Error in automated wildcard:', error);
  }
};

// ============================================
// AUTOMATED TEAM FORMATION
// ============================================

/**
 * Check if teams need to be formed after Heat Week
 * If yes, automatically form teams with snake draft
 */
export const checkAndRunAutomatedTeamFormation = async (
  participants: Participant[],
  config: any
): Promise<boolean> => {
  try {
    // Check if we're after Heat Week (Nov 18, 2025)
    const heatWeekEnd = new Date('2025-11-18T00:00:00');
    const now = new Date();

    if (now <= heatWeekEnd) {
      console.log('Still in Heat Week - teams not formed yet');
      return false;
    }

    // Check if teams have already been formed
    if (config.teamsFormed === true) {
      console.log('Teams already formed');
      return false;
    }

    // Teams need to be formed!
    console.log('Running automated team formation...');

    // Sort participants by total steps (descending)
    const sorted = [...participants].sort((a, b) => b.totalSteps - a.totalSteps);

    // Top 5 are captains
    const captains = sorted.slice(0, 5);
    const remaining = sorted.slice(5);

    // Team names
    const teamNames = ['Team Alpha', 'Team Bravo', 'Team Charlie', 'Team Delta', 'Team Echo'];

    // Assign captains to teams
    const teamAssignments: { [participantId: string]: string } = {};
    captains.forEach((captain, index) => {
      teamAssignments[captain.id] = teamNames[index];
    });

    // Snake draft for remaining participants
    // Randomize the remaining participants first
    const shuffled = [...remaining].sort(() => Math.random() - 0.5);

    // Snake pattern: 0,1,2,3,4,4,3,2,1,0,0,1,2,3,4...
    let teamIndex = 0;
    let direction = 1; // 1 for forward, -1 for backward

    shuffled.forEach((participant) => {
      teamAssignments[participant.id] = teamNames[teamIndex];

      // Move to next team
      teamIndex += direction;

      // Reverse direction at boundaries
      if (teamIndex >= 5) {
        teamIndex = 4;
        direction = -1;
      } else if (teamIndex < 0) {
        teamIndex = 0;
        direction = 1;
      }
    });

    // Update all participants with team assignments
    for (const [participantId, teamName] of Object.entries(teamAssignments)) {
      await supabaseAdmin
        .from('participants')
        .update({ team: teamName })
        .eq('id', participantId);
    }

    // Mark teams as formed in config
    await supabaseAdmin
      .from('challenge_config')
      .upsert({
        key: 'teamsFormed',
        value: 'true'
      }, {
        onConflict: 'key'
      });

    console.log('✅ Automated team formation completed!');
    console.log(`Captains: ${captains.map(c => c.name).join(', ')}`);
    console.log(`Teams formed with ${participants.length} participants`);

    return true;
  } catch (error) {
    console.error('Error in automated team formation:', error);
    return false;
  }
};

// ============================================
// MAIN AUTOMATION CHECK
// ============================================

/**
 * Main automation check - run this on app load
 * Checks and runs all automated tasks
 */
export const runAutomationChecks = async (
  participants: Participant[],
  config: any
): Promise<void> => {
  try {
    // Check and run automated wildcard
    await checkAndRunAutomatedWildcard(participants);

    // Check and run automated team formation
    const teamsFormed = await checkAndRunAutomatedTeamFormation(participants, config);

    if (teamsFormed) {
      // Reload page to show updated teams
      window.location.reload();
    }
  } catch (error) {
    console.error('Error running automation checks:', error);
  }
};
