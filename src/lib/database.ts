import { supabase } from './supabase';
import type { DayData } from './types';
import * as storage from './storage';

interface ForgeProgram {
  id: string;
  user_id: string;
  started_at: string;
  current_day: number;
  failed_at: string | null;
  completed_at: string | null;
  reset_count: number;
}

// Commented out until needed for type safety
// interface DailyLog {
//   id: string;
//   user_id: string;
//   program_id: string;
//   date: string;
//   day_number: number;
//   checks: Record<string, boolean>;
//   custom_tasks: Record<string, string>;
//   steps_actual: number | null;
//   notes: string;
//   completed: boolean;
//   completed_at: string | null;
// }

export class ForgeDatabase {
  private static instance: ForgeDatabase;
  private offlineMode: boolean;

  constructor() {
    this.offlineMode = !supabase;
  }

  static getInstance(): ForgeDatabase {
    if (!ForgeDatabase.instance) {
      ForgeDatabase.instance = new ForgeDatabase();
    }
    return ForgeDatabase.instance;
  }

  // Get or create active program for user
  async getActiveProgram(userId: string): Promise<ForgeProgram | null> {
    if (this.offlineMode) return null;
    
    try {
      // First check for active program
      const { data: existingProgram } = await supabase!
        .from('forge_programs')
        .select('*')
        .eq('user_id', userId)
        .is('failed_at', null)
        .is('completed_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (existingProgram) {
        // Check if we need to reset due to incomplete day
        await this.checkForReset(existingProgram.id);
        return existingProgram;
      }

      // Create new program
      const { data: newProgram, error } = await supabase!
        .from('forge_programs')
        .insert({
          user_id: userId,
          current_day: 1,
          reset_count: 0
        })
        .select()
        .single();

      if (error) throw error;
      return newProgram;
    } catch (error) {
      console.error('Error getting active program:', error);
      return null;
    }
  }

  // Check if program needs to be reset due to incomplete day
  async checkForReset(programId: string): Promise<boolean> {
    if (this.offlineMode) return false;

    try {
      // Get yesterday's log
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(3, 0, 0, 0); // 3AM cutoff
      
      const { data: yesterdayLog } = await supabase!
        .from('daily_logs')
        .select('*')
        .eq('program_id', programId)
        .eq('date', yesterday.toISOString().split('T')[0])
        .single();

      if (yesterdayLog && !yesterdayLog.completed) {
        // Reset program - mark as failed
        await supabase!
          .from('forge_programs')
          .update({ 
            failed_at: new Date().toISOString() 
          })
          .eq('id', programId);
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking for reset:', error);
      return false;
    }
  }

  // Get today's log
  async getTodayLog(userId: string, programId: string): Promise<DayData | null> {
    if (this.offlineMode) {
      return storage.getTodayData();
    }

    try {
      const today = storage.getTodayKey();
      
      const { data } = await supabase!
        .from('daily_logs')
        .select('*')
        .eq('program_id', programId)
        .eq('date', today)
        .single();

      if (data) {
        return {
          strictFasting: true,
          waterOz: 0,
          steps: 0,
          stepsActual: data.steps_actual,
          checks: data.checks || {},
          customTasks: data.custom_tasks || {},
          notes: data.notes || '',
          completedAt: data.completed_at
        };
      }

      // Create new log for today
      const program = await this.getActiveProgram(userId);
      if (!program) return storage.getTodayData();

      const { data: newLog, error } = await supabase!
        .from('daily_logs')
        .insert({
          user_id: userId,
          program_id: programId,
          date: today,
          day_number: program.current_day,
          checks: {},
          custom_tasks: {},
          notes: '',
          completed: false
        })
        .select()
        .single();

      if (error) throw error;

      return {
        strictFasting: true,
        waterOz: 0,
        steps: 0,
        stepsActual: newLog.steps_actual,
        checks: newLog.checks || {},
        customTasks: newLog.custom_tasks || {},
        notes: newLog.notes || '',
        completedAt: newLog.completed_at
      };
    } catch (error) {
      console.error('Error getting today log:', error);
      return storage.getTodayData();
    }
  }

  // Save today's log
  async saveTodayLog(userId: string, programId: string, dayData: DayData): Promise<void> {
    if (this.offlineMode) {
      storage.saveTodayData(dayData);
      return;
    }

    try {
      const today = storage.getTodayKey();
      const isComplete = storage.isDayComplete(dayData, storage.loadForgeData());

      // First check if the log exists
      const { data: existingLog } = await supabase!
        .from('daily_logs')
        .select('id')
        .eq('program_id', programId)
        .eq('date', today)
        .single();

      if (existingLog) {
        // Update existing log
        const { error } = await supabase!
          .from('daily_logs')
          .update({
            checks: dayData.checks,
            custom_tasks: dayData.customTasks,
            steps_actual: dayData.stepsActual,
            notes: dayData.notes,
            completed: isComplete,
            completed_at: isComplete ? new Date().toISOString() : null
          })
          .eq('id', existingLog.id);
        
        if (error) throw error;
      } else {
        // Insert new log
        const { data: program } = await supabase!
          .from('forge_programs')
          .select('current_day')
          .eq('id', programId)
          .single();
        
        const { error } = await supabase!
          .from('daily_logs')
          .insert({
            user_id: userId,
            program_id: programId,
            date: today,
            day_number: program?.current_day || 1,
            checks: dayData.checks,
            custom_tasks: dayData.customTasks,
            steps_actual: dayData.stepsActual,
            notes: dayData.notes,
            completed: isComplete,
            completed_at: isComplete ? new Date().toISOString() : null
          });
        
        if (error) throw error;
      }

      // Update program day count if completed
      if (isComplete) {
        const program = await this.getActiveProgram(userId);
        if (program && program.current_day < 90) {
          await supabase!
            .from('forge_programs')
            .update({ 
              current_day: program.current_day + 1,
              completed_at: program.current_day === 89 ? new Date().toISOString() : null
            })
            .eq('id', programId);
        }
      }

      // Also save to localStorage as backup
      storage.saveTodayData(dayData);
    } catch (error) {
      console.error('Error saving today log:', error);
      // Fall back to localStorage
      storage.saveTodayData(dayData);
    }
  }

  // Toggle task completion
  async toggleTask(userId: string, programId: string, taskId: string): Promise<void> {
    const dayData = await this.getTodayLog(userId, programId);
    if (!dayData) return;

    dayData.checks[taskId] = !dayData.checks[taskId];
    await this.saveTodayLog(userId, programId, dayData);
  }

  // Set custom task
  async setCustomTask(userId: string, programId: string, taskId: string, description: string): Promise<void> {
    const dayData = await this.getTodayLog(userId, programId);
    if (!dayData) return;

    if (description) {
      dayData.customTasks[taskId] = description;
    } else {
      delete dayData.customTasks[taskId];
    }
    await this.saveTodayLog(userId, programId, dayData);
  }

  // Set actual steps
  async setStepsActual(userId: string, programId: string, steps: number): Promise<void> {
    const dayData = await this.getTodayLog(userId, programId);
    if (!dayData) return;

    dayData.stepsActual = steps;
    await this.saveTodayLog(userId, programId, dayData);
  }

  // Complete the day - check all required tasks
  async completeDay(userId: string, programId: string): Promise<void> {
    const dayData = await this.getTodayLog(userId, programId);
    if (!dayData) return;

    // Check all required tasks
    const { REQUIRED_TASKS } = await import('./types');
    REQUIRED_TASKS.forEach(taskId => {
      dayData.checks[taskId] = true;
    });

    await this.saveTodayLog(userId, programId, dayData);
  }

  // Start over - reset to Day 1
  async startOver(userId: string): Promise<void> {
    if (this.offlineMode) {
      storage.resetToday();
      return;
    }

    try {
      // Mark current program as failed
      const currentProgram = await this.getActiveProgram(userId);
      if (currentProgram) {
        await supabase!
          .from('forge_programs')
          .update({ 
            failed_at: new Date().toISOString()
          })
          .eq('id', currentProgram.id);
      }

      // Create a new program
      const { error } = await supabase!
        .from('forge_programs')
        .insert({
          user_id: userId,
          current_day: 1,
          reset_count: (currentProgram?.reset_count || 0) + 1
        })
        .select()
        .single();

      if (error) throw error;
    } catch (error) {
      console.error('Error starting over:', error);
      storage.resetToday();
    }
  }

  // Get program stats
  async getProgramStats(userId: string): Promise<{
    currentDay: number;
    totalResets: number;
    longestStreak: number;
  }> {
    if (this.offlineMode) {
      const forgeData = storage.loadForgeData();
      return {
        currentDay: 1,
        totalResets: 0,
        longestStreak: forgeData.streak
      };
    }

    try {
      const { data: programs } = await supabase!
        .from('forge_programs')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false });

      const activeProgram = programs?.find(p => !p.failed_at && !p.completed_at);
      const totalResets = programs?.filter(p => p.failed_at).length || 0;
      
      // Calculate longest streak from all programs
      let longestStreak = 0;
      for (const program of programs || []) {
        const streak = program.completed_at ? 90 : program.current_day;
        longestStreak = Math.max(longestStreak, streak);
      }

      return {
        currentDay: activeProgram?.current_day || 1,
        totalResets,
        longestStreak
      };
    } catch (error) {
      console.error('Error getting program stats:', error);
      return {
        currentDay: 1,
        totalResets: 0,
        longestStreak: 0
      };
    }
  }
}

export const forgeDB = ForgeDatabase.getInstance();