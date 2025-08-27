import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Running in offline mode.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export type Database = {
  public: {
    Tables: {
      forge_programs: {
        Row: {
          id: string;
          user_id: string;
          started_at: string;
          current_day: number;
          failed_at: string | null;
          completed_at: string | null;
          reset_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          started_at?: string;
          current_day?: number;
          failed_at?: string | null;
          completed_at?: string | null;
          reset_count?: number;
        };
        Update: {
          current_day?: number;
          failed_at?: string | null;
          completed_at?: string | null;
          reset_count?: number;
        };
      };
      daily_logs: {
        Row: {
          id: string;
          user_id: string;
          program_id: string;
          date: string;
          day_number: number;
          checks: Record<string, boolean>;
          custom_tasks: Record<string, string>;
          steps_actual: number | null;
          notes: string;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          program_id: string;
          date: string;
          day_number: number;
          checks?: Record<string, boolean>;
          custom_tasks?: Record<string, string>;
          steps_actual?: number | null;
          notes?: string;
          completed?: boolean;
          completed_at?: string | null;
        };
        Update: {
          checks?: Record<string, boolean>;
          custom_tasks?: Record<string, string>;
          steps_actual?: number | null;
          notes?: string;
          completed?: boolean;
          completed_at?: string | null;
        };
      };
    };
  };
};