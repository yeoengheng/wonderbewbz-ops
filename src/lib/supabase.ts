import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
export const supabaseAny = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client for server actions with Clerk JWT integration
export const createServerSupabaseClient = async () => {
  const { getToken } = await auth();

  // Try to get Supabase template token, fall back to default if not found
  let token;
  try {
    token = await getToken({ template: "supabase" });
  } catch {
    // If template doesn't exist yet, use default token
    console.warn(
      "Supabase JWT template not found in Clerk. Using default token. Please create a 'supabase' JWT template in Clerk Dashboard.",
    );
    token = await getToken();
  }

  // Create client with Clerk JWT for RLS
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};

// Legacy service role client - use sparingly, bypasses RLS
export const createServiceRoleClient = () => {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
};
