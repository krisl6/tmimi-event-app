import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          date: string;
          image: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          date: string;
          image?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          date?: string;
          image?: string | null;
          created_by?: string;
          created_at?: string;
        };
      };
      participants: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          phone: string;
          role: string;
          avatar: string | null;
          tng_number: string | null;
          duitnow_id: string | null;
          qr_code: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          phone: string;
          role: string;
          avatar?: string | null;
          tng_number?: string | null;
          duitnow_id?: string | null;
          qr_code?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          phone?: string;
          role?: string;
          avatar?: string | null;
          tng_number?: string | null;
          duitnow_id?: string | null;
          qr_code?: string | null;
          created_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          event_id: string;
          description: string;
          amount: number;
          category: string;
          paid_by: string;
          split_type: string;
          shares: Record<string, number>;
          selected_participants: string[] | null;
          receipt: string | null;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          description: string;
          amount: number;
          category: string;
          paid_by: string;
          split_type: string;
          shares: Record<string, number>;
          selected_participants?: string[] | null;
          receipt?: string | null;
          date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          description?: string;
          amount?: number;
          category?: string;
          paid_by?: string;
          split_type?: string;
          shares?: Record<string, number>;
          selected_participants?: string[] | null;
          receipt?: string | null;
          date?: string;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          avatar: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          avatar?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          avatar?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
