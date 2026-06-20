
import { createClient } from '@supabase/supabase-js';

export function getSupabaseAdmin() {
  return createClient(
    // Server-side admin client: prefer the internal URL (http://kong:8000 in Docker).
    process.env.SUPABASE_INTERNAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Legacy alias — use getSupabaseAdmin() in server actions to avoid module-level eval
export const supabaseAdmin = getSupabaseAdmin;