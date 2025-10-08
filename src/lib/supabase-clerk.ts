import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side: Create Supabase client with Clerk session token
export function createClerkSupabaseClient(session: Record<string, unknown>) {
  return createClient<Database>(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        apikey: supabaseKey,
      },
    },
    accessToken: async () => {
      if (!session) {
        console.warn("No session available for Supabase client");
        return null;
      }

      // Try to get Supabase template token, fall back to default
      let token;
      try {
        token = await (session as any).getToken({ template: "supabase" });
        console.log("Got Supabase template token");
      } catch (error) {
        console.warn("Supabase JWT template not found, using default token");
        try {
          token = await (session as any).getToken();
          console.log("Got default token");
        } catch (err) {
          console.error("Failed to get any token", err);
          return null;
        }
      }

      if (!token) {
        console.error("No token available");
        return null;
      }

      return token;
    },
  });
}

// Alternative approach using the accessToken method
export function createClerkSupabaseClientAlt(session: Record<string, unknown>) {
  return createClient<Database>(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        apikey: supabaseKey,
      },
    },
    accessToken: async () => {
      if (!session) return null;

      // Try to get Supabase template token, fall back to default
      let token;
      try {
        token = await (session as any).getToken({ template: "supabase" });
      } catch {
        console.warn("Supabase JWT template not found, using default token");
        token = await (session as any).getToken();
      }

      return token ?? null;
    },
  });
}

// Server-side: Create Supabase client with Clerk token (for server components)
export async function createServerClerkSupabaseClient(getToken: () => Promise<string | null>) {
  const token = await getToken();

  return createClient<Database>(supabaseUrl, supabaseKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });
}
