import { createClient } from "@supabase/supabase-js";

// Supabase Project URL provided by the user
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://hblipgztmxbmdcssglwd.supabase.co";

// Supabase Public Anon Key
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 20
);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
