import { supabase, supabaseAdmin, type DbParticipant, type DbDailyHistory, type DbWildcardResult, type DbWeeklyMilestone, type DbTeam } from '../lib/supabase';
import type { Participant, DailySteps, ChallengeConfig, WildcardResult, TeamCustomization } from '../types';
import { DEFAULT_CONFIG } from '../types';

// ============================================
// PARTICIPANT OPERATIONS
// ============================================

export const loadParticipants = async (): Promise<Participant[]> => {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .order('total_steps', { ascending: false });

    if (error) throw error;

    // Convert DB format to app format
    const participants = await Promise.all(
      (data || []).map(async (dbP: DbParticipant) => {
        // Load daily history for this participant
        const { data: history } = await supabase
          .from('daily_history')
          .select('*')
          .eq('participant_id', dbP.id)
          .order('date', { ascending: false });

        const dailyHistory: DailySteps[] = (history || []).map((h: DbDailyHistory) => ({
          date: h.date,
          steps: h.steps,
          timestamp: new Date(h.created_at).getTime(),
        }));

        return {
          id: dbP.id,
          name: dbP.name,
          totalSteps: dbP.total_steps,
          points: dbP.points,
          team: dbP.team,
          notes: dbP.notes,
          createdAt: new Date(dbP.created_at).getTime(),
          lastUpdated: new Date(dbP.updated_at).getTime(),
          dailyHistory: dailyHistory.length > 0 ? dailyHistory : undefined,
        };
      })
    );

    return participants;
  } catch (error) {
    console.error('Error loading participants:', error);
    return [];
  }
};

export const saveParticipants = async (_participants: Participant[]): Promise<void> => {
  // This function is kept for compatibility but does nothing
  // Individual updates are handled by specific functions
  console.log('saveParticipants called - using individual update functions instead');
};

export const addParticipant = async (name: string, steps: number = 0, team: string | null = null): Promise<Participant | null> => {
  try {
    console.log('💾 Adding participant to Supabase:', { name, steps, team });
    const { data, error } = await supabaseAdmin
      .from('participants')
      .insert({
        name: name.trim(),
        total_steps: steps,
        points: 0,
        team,
        notes: '',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error adding participant:', error);
      throw error;
    }

    console.log('✅ Participant added successfully:', data);
    return {
      id: data.id,
      name: data.name,
      totalSteps: data.total_steps,
      points: data.points,
      team: data.team,
      notes: data.notes,
      createdAt: new Date(data.created_at).getTime(),
      lastUpdated: new Date(data.updated_at).getTime(),
    };
  } catch (error) {
    console.error('❌ Fatal error adding participant:', error);
    alert(`Failed to add participant: ${error instanceof Error ? error.message : 'Unknown error'}\n\nMake sure you've run the SQL setup script in Supabase!`);
    return null;
  }
};

export const updateParticipant = async (id: string, updates: Partial<Participant>): Promise<void> => {
  try {
    console.log('💾 Updating participant in Supabase:', { id, updates });
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.totalSteps !== undefined) dbUpdates.total_steps = updates.totalSteps;
    if (updates.points !== undefined) dbUpdates.points = updates.points;
    if (updates.team !== undefined) dbUpdates.team = updates.team;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    const { error } = await supabaseAdmin
      .from('participants')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('❌ Supabase error updating participant:', error);
      throw error;
    }

    console.log('✅ Participant updated successfully');
  } catch (error) {
    console.error('❌ Fatal error updating participant:', error);
    alert(`Failed to update participant: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const deleteParticipant = async (id: string): Promise<void> => {
  try {
    const { error } = await supabaseAdmin
      .from('participants')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting participant:', error);
  }
};

export const awardWildcardPoint = async (participantId: string): Promise<void> => {
  try {
    // Get current points
    const { data: participant } = await supabase
      .from('participants')
      .select('points')
      .eq('id', participantId)
      .single();

    if (!participant) return;

    // Increment points
    const { error } = await supabaseAdmin
      .from('participants')
      .update({ points: participant.points + 1 })
      .eq('id', participantId);

    if (error) throw error;
  } catch (error) {
    console.error('Error awarding wildcard point:', error);
  }
};

// ============================================
// DAILY HISTORY OPERATIONS
// ============================================

export const saveDailyHistory = async (participantId: string, date: string, steps: number): Promise<void> => {
  try {
    const { error } = await supabaseAdmin
      .from('daily_history')
      .upsert({
        participant_id: participantId,
        date,
        steps,
      }, {
        onConflict: 'participant_id,date'
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving daily history:', error);
  }
};

// ============================================
// WILDCARD OPERATIONS
// ============================================

export const saveWildcardResult = async (result: WildcardResult): Promise<void> => {
  try {
    const { error } = await supabaseAdmin
      .from('wildcard_results')
      .upsert({
        date: result.date,
        category: result.category,
        winner_id: result.winnerId,
        winner_name: result.winnerName,
        value: result.value,
        description: result.description,
      }, {
        onConflict: 'date'
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving wildcard result:', error);
  }
};

export const getWildcardResults = async (): Promise<WildcardResult[]> => {
  try {
    const { data, error } = await supabase
      .from('wildcard_results')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map((r: DbWildcardResult) => ({
      id: `${r.date}-${r.category}`,
      date: r.date,
      category: r.category as any,
      winnerId: r.winner_id,
      winnerName: r.winner_name,
      value: r.value,
      description: r.description,
      timestamp: new Date(r.created_at).getTime(),
    }));
  } catch (error) {
    console.error('Error loading wildcard results:', error);
    return [];
  }
};

export const getTodaysWildcard = async (): Promise<WildcardResult | null> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('wildcard_results')
      .select('*')
      .eq('date', today)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }

    if (!data) return null;

    return {
      id: `${data.date}-${data.category}`,
      date: data.date,
      category: data.category as any,
      winnerId: data.winner_id,
      winnerName: data.winner_name,
      value: data.value,
      description: data.description,
      timestamp: new Date(data.created_at).getTime(),
    };
  } catch (error) {
    console.error('Error loading today\'s wildcard:', error);
    return null;
  }
};

// ============================================
// WEEKLY MILESTONE OPERATIONS
// ============================================

export const getCurrentWeekProgress = async (): Promise<Map<string, { weekSteps: number; achieved70k: boolean }>> => {
  try {
    const { data, error } = await supabase
      .from('current_week_progress')
      .select('*');

    if (error) throw error;

    const progressMap = new Map();
    (data || []).forEach((row: any) => {
      progressMap.set(row.id, {
        weekSteps: row.week_steps,
        achieved70k: row.achieved_70k,
      });
    });

    return progressMap;
  } catch (error) {
    console.error('Error loading weekly progress:', error);
    return new Map();
  }
};

export const saveWeeklyMilestone = async (
  participantId: string,
  weekStart: string,
  weekEnd: string,
  totalSteps: number,
  achieved70k: boolean
): Promise<void> => {
  try {
    const { error } = await supabaseAdmin
      .from('weekly_milestones')
      .upsert({
        participant_id: participantId,
        week_start: weekStart,
        week_end: weekEnd,
        total_steps: totalSteps,
        achieved_70k: achieved70k,
      }, {
        onConflict: 'participant_id,week_start'
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving weekly milestone:', error);
  }
};

export const getWeeklyMilestones = async (weekStart: string): Promise<DbWeeklyMilestone[]> => {
  try {
    const { data, error } = await supabase
      .from('weekly_milestones')
      .select('*')
      .eq('week_start', weekStart);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error loading weekly milestones:', error);
    return [];
  }
};

export const getWeekly70kCounts = async (): Promise<Map<string, number>> => {
  try {
    const { data, error } = await supabase
      .from('weekly_milestones')
      .select('participant_id, achieved_70k');

    if (error) throw error;

    // Count how many weeks each participant achieved 70k
    const counts = new Map<string, number>();
    data?.forEach((milestone) => {
      if (milestone.achieved_70k) {
        const currentCount = counts.get(milestone.participant_id) || 0;
        counts.set(milestone.participant_id, currentCount + 1);
      }
    });

    return counts;
  } catch (error) {
    console.error('Error loading weekly 70k counts:', error);
    return new Map();
  }
};

// ============================================
// CONFIG OPERATIONS
// ============================================

export const loadConfig = async (): Promise<ChallengeConfig> => {
  try {
    // Load main config
    const { data: configData, error: configError } = await supabase
      .from('challenge_config')
      .select('value')
      .eq('key', 'main_config')
      .single();

    if (configError) throw configError;

    const config = configData?.value || DEFAULT_CONFIG;

    // Check if teams have been formed
    const { data: teamsFormedData } = await supabase
      .from('challenge_config')
      .select('value')
      .eq('key', 'teamsFormed')
      .single();

    // Add teamsFormed flag to config
    return {
      ...config,
      teamsFormed: teamsFormedData?.value === 'true' || false,
    };
  } catch (error) {
    console.error('Error loading config:', error);
    return DEFAULT_CONFIG;
  }
};

export const saveConfig = async (config: ChallengeConfig): Promise<void> => {
  try {
    const { error } = await supabaseAdmin
      .from('challenge_config')
      .upsert({
        key: 'main_config',
        value: config,
      }, {
        onConflict: 'key'
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving config:', error);
  }
};

// ============================================
// TEAM CUSTOMIZATION OPERATIONS
// ============================================

export const loadTeamCustomizations = async (): Promise<TeamCustomization[]> => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('team_name', { ascending: true });

    if (error) throw error;

    return (data || []).map((dbTeam: DbTeam) => ({
      id: dbTeam.id,
      teamName: dbTeam.team_name,
      displayName: dbTeam.display_name,
      color: dbTeam.color,
      icon: dbTeam.icon,
      imageUrl: dbTeam.image_url || undefined,
      description: dbTeam.description || undefined,
      createdAt: new Date(dbTeam.created_at).getTime(),
      updatedAt: new Date(dbTeam.updated_at).getTime(),
    }));
  } catch (error) {
    console.error('Error loading team customizations:', error);
    return [];
  }
};

export const getTeamCustomization = async (teamName: string): Promise<TeamCustomization | null> => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('team_name', teamName)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      teamName: data.team_name,
      displayName: data.display_name,
      color: data.color,
      icon: data.icon,
      imageUrl: data.image_url || undefined,
      description: data.description || undefined,
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
    };
  } catch (error) {
    console.error('Error loading team customization:', error);
    return null;
  }
};

export const saveTeamCustomization = async (customization: Partial<TeamCustomization> & { teamName: string }): Promise<void> => {
  try {
    const dbData: any = {
      team_name: customization.teamName,
    };

    if (customization.displayName !== undefined) dbData.display_name = customization.displayName;
    if (customization.color !== undefined) dbData.color = customization.color;
    if (customization.icon !== undefined) dbData.icon = customization.icon;
    if (customization.imageUrl !== undefined) dbData.image_url = customization.imageUrl;
    if (customization.description !== undefined) dbData.description = customization.description;

    const { error } = await supabaseAdmin
      .from('teams')
      .upsert(dbData, {
        onConflict: 'team_name'
      });

    if (error) throw error;

    console.log('✅ Team customization saved successfully');
  } catch (error) {
    console.error('Error saving team customization:', error);
    alert(`Failed to save team customization: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const deleteTeamCustomization = async (teamName: string): Promise<void> => {
  try {
    const { error } = await supabaseAdmin
      .from('teams')
      .delete()
      .eq('team_name', teamName);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting team customization:', error);
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const getLastSaved = (): Date | null => {
  // Always return current time since data is always fresh from Supabase
  return new Date();
};

export const exportDataFromSupabase = async (): Promise<string> => {
  try {
    const participants = await loadParticipants();
    const config = await loadConfig();
    const wildcardResults = await getWildcardResults();

    const backup = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      participants,
      config,
      wildcardResults,
    };

    return JSON.stringify(backup, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

export const downloadBackup = async (): Promise<void> => {
  try {
    const data = await exportDataFromSupabase();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `step-challenge-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading backup:', error);
  }
};

export const importDataToSupabase = async (jsonString: string): Promise<boolean> => {
  try {
    const data = JSON.parse(jsonString);

    // Import participants
    if (data.participants && Array.isArray(data.participants)) {
      for (const participant of data.participants) {
        // Insert or update each participant
        const { error } = await supabaseAdmin
          .from('participants')
          .upsert({
            id: participant.id,
            name: participant.name,
            total_steps: participant.totalSteps,
            team: participant.team,
            wildcard_points: participant.wildcardPoints || 0,
            created_at: participant.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Error importing participant:', error);
          continue;
        }

        // Import daily history if present
        if (participant.dailyHistory && Array.isArray(participant.dailyHistory)) {
          for (const day of participant.dailyHistory) {
            await supabaseAdmin
              .from('daily_history')
              .upsert({
                participant_id: participant.id,
                date: day.date,
                steps: day.steps,
              }, {
                onConflict: 'participant_id,date'
              });
          }
        }
      }
    }

    // Import config
    if (data.config) {
      await saveConfig(data.config);
    }

    // Import wildcard results
    if (data.wildcardResults && Array.isArray(data.wildcardResults)) {
      for (const result of data.wildcardResults) {
        await supabaseAdmin
          .from('wildcard_results')
          .upsert({
            id: result.id,
            date: result.date,
            category: result.category,
            winner_id: result.winnerId,
            winner_name: result.winnerName,
            value: result.value,
            description: result.description,
          }, {
            onConflict: 'id'
          });
      }
    }

    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};
