import { auth, currentUser } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase";

// Get authenticated Supabase client with Clerk user context
export async function getAuthenticatedSupabaseClient() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const supabaseClient = createServerSupabaseClient();
  return { supabaseClient, userId };
}

// Get current Clerk user with additional profile data
export async function getCurrentUserProfile() {
  const user = await currentUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  return {
    clerkId: user.id,
    email: user.emailAddresses[0]?.emailAddress,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    createdAt: user.createdAt
  };
}

// Helper to create records with Clerk user association
export async function createUserRecord<T extends Record<string, any>>(
  table: string,
  data: T & { created_by?: string }
) {
  const { supabaseClient, userId } = await getAuthenticatedSupabaseClient();
  
  const recordData = {
    ...data,
    created_by: userId, // Add Clerk user ID to the record
  };

  const { data: result, error } = await supabaseClient
    .from(table)
    .insert(recordData)
    .select()
    .single();

  if (error) throw error;
  return result;
}

// Helper to get user's records
export async function getUserRecords<T>(
  table: string,
  select: string = '*'
) {
  const { supabaseClient, userId } = await getAuthenticatedSupabaseClient();
  
  const { data, error } = await supabaseClient
    .from(table)
    .select(select)
    .eq('created_by', userId);

  if (error) throw error;
  return data as T[];
}