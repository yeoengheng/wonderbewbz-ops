import { useSession } from '@clerk/nextjs';
import { createClerkSupabaseClient } from '@/lib/supabase-clerk';
import { useMemo } from 'react';

// Hook to get authenticated Supabase client with Clerk session
export function useSupabase() {
  const { session } = useSession();
  
  const supabase = useMemo(() => {
    return createClerkSupabaseClient(session);
  }, [session]);

  return { supabase, session, isLoaded: !!session };
}