import { useMemo } from "react";

import { useAuth, useSession } from "@clerk/nextjs";

import { createClerkSupabaseClientFromGetToken } from "@/lib/supabase-clerk";

// Hook to get authenticated Supabase client with Clerk session
export function useSupabase() {
  const { session } = useSession();
  const { getToken, orgId, isLoaded: authLoaded, isSignedIn } = useAuth();

  // useMemo with getToken (stable reference from Clerk) avoids recreating
  // the client on every render while always using the freshest token
  const supabase = useMemo(() => {
    return createClerkSupabaseClientFromGetToken(getToken);
  }, [getToken]);

  return { supabase, session, orgId, isLoaded: authLoaded && isSignedIn === true };
}
