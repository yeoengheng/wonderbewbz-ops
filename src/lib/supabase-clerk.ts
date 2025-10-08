import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side: Create Supabase client with Clerk session token
export function createClerkSupabaseClient(session: Record<string, unknown>) {
  return createClient<Database>(supabaseUrl, supabaseKey, {
    global: {
      headers: async () => {
        if (!session) {
          console.warn("No session available for Supabase client");
          return {};
        }

        // Try to get Supabase template token, fall back to default
        let token;
        try {
          token = await (session as any).getToken({ template: "supabase" });
          console.log("Got Supabase template token");
        } catch (error) {
          console.warn("Supabase JWT template not found, using default token", error);
          try {
            token = await (session as any).getToken();
            console.log("Got default token");
          } catch (err) {
            console.error("Failed to get any token", err);
          }
        }

        if (!token) {
          console.error("No token available");
          return {};
        }

        // Decode and log JWT for debugging (only first few chars for security)
        console.log("Token prefix:", token.substring(0, 20) + "...");

        return { Authorization: `Bearer ${token}` };
      },
    },
  });
}

// Alternative approach using the global headers method
export function createClerkSupabaseClientAlt(session: Record<string, unknown>) {
  return createClient<Database>(supabaseUrl, supabaseKey, {
    global: {
      headers: (async () => {
        if (!session) return {};

        // Try to get Supabase template token, fall back to default
        let token;
        try {
          token = await (session as any).getToken({ template: "supabase" });
        } catch {
          console.warn("Supabase JWT template not found, using default token");
          token = await (session as any).getToken();
        }

        return token ? { Authorization: `Bearer ${token}` } : {};
      }) as any,
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
