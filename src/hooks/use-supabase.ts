import { useMemo } from "react";

import { useSession } from "@clerk/nextjs";

import { createClerkSupabaseClient } from "@/lib/supabase-clerk";

// Hook to get authenticated Supabase client with Clerk session
export function useSupabase() {
  const { session } = useSession();

  const supabase = useMemo(() => {
    return createClerkSupabaseClient(session as unknown as Record<string, unknown>);
  }, [session]);

  return { supabase, session, isLoaded: !!session };
}
