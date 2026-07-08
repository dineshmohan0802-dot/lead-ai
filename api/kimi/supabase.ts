import { createClient } from "@supabase/supabase-js";
import { env } from "../lib/env";

// Backend Supabase client (uses service role key for admin operations)
export const supabase = createClient(env.supabaseUrl, env.supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
};
