/**
 * Automation Service
 * Handles automatic wildcard selection and team formation
 */

import { supabaseAdmin } from '../lib/supabase';
import type { Participant } from '../types';
import {
  getRandomWildcardCategory,
  calculateWildcardWinner,
} from './wildcardSystem';
import { saveWildcardResult, getWildcardResults, awardWildcardPoint } from './supabaseStorage';

// ============================================
// AUTOMATED WILDCARD SELECTION
// ============================================

/**
 * Check for ALL missing wildcards and backfill them
 * This ensures we never miss a wildcard even if nobody visits for several days
 */
export const checkAndRunAutomatedWildcard = async (participants: Participant[]): Promise<void> => {
  try {
    // Get all existing wildcard results
    const existingResults = await getWildcardResults();
    const existingDates = new Set(existingResults.map(r => r.date));

    // Find all dates that should have a wildcard
    // Heat Week: Nov 10-16, Wildcard starts Nov 17
    const heatWeekEnd = new Date('2025-11-16T23:59:59');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Only process up to yesterday (not today)
    if (yesterday <= heatWeekEnd) {
      console.log('Wildcard not active yet (Heat Week not over)');
      return;
    }

    // Find all missing dates between Heat Week end and yesterday
    const missingDates: string[] = [];
    const currentDate = new Date(heatWeekEnd);
    currentDate.setDate(currentDate.getDate() + 1); // Start Nov 17 (first day after Heat Week)

    while (currentDate <= yesterday) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (!existingDates.has(dateStr)) {
        missingDates.push(dateStr);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (missingDates.length === 0) {
      console.log('All wildcards up to date!');
      return;
    }

    console.log(`Found ${missingDates.length} missing wildcard(s). Backfilling...`);

    // Process each missing date
    for (const dateStr of missingDates) {
      console.log(`Running automated wildcard for ${dateStr}`);

      // Select random category
      const category = getRandomWildcardCategory();
      console.log(`  Category: ${category}`);

      // Calculate winner
      const winner = calculateWildcardWinner(category, participants, dateStr);

      if (!winner) {
        console.log(`  No valid winner for ${dateStr}`);
        continue;
      }

      // Save the result
      await saveWildcardResult(winner);

      // Award the point
      await awardWildcardPoint(winner.winnerId);

      console.log(`  ✨ Winner: ${winner.winnerName}`);
    }

    console.log(`✅ Backfilled ${missingDates.length} wildcard(s)!`);
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
    // Check if we're after Heat Week ends (midnight Nov 16 -> Nov 17 00:00:00 Monday morning)
    const heatWeekEnd = new Date('2025-11-17T00:00:00');
    const now = new Date();

    if (now < heatWeekEnd) {
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
