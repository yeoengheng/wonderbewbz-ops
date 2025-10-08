import { auth, currentUser } from "@clerk/nextjs/server";

import { createServerSupabaseClient } from "@/lib/supabase";

// Get authenticated Supabase client with Clerk user and organization context
export async function getAuthenticatedSupabaseClient() {
  const { userId, orgId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  if (!orgId) {
    throw new Error("User not associated with any organization");
  }

  const supabaseClient = await createServerSupabaseClient();
  return { supabaseClient, userId, orgId };
}

// Get current organization context from Clerk
export async function getCurrentOrganization() {
  const { orgId, orgRole, orgSlug } = await auth();

  if (!orgId) {
    return null;
  }

  return {
    orgId,
    orgRole,
    orgSlug,
  };
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
    name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    createdAt: user.createdAt,
  };
}

// Helper to create records with Clerk user and organization association
export async function createUserRecord<T extends Record<string, any>>(
  table: string,
  data: T & { created_by?: string },
) {
  const { supabaseClient, userId, orgId } = await getAuthenticatedSupabaseClient();

  const recordData = {
    ...data,
    created_by: userId, // Add Clerk user ID to the record
    org_id: orgId, // Add Clerk org ID to the record
  };

  const { data: result, error } = await (supabaseClient as any).from(table).insert(recordData).select().single();

  if (error) throw error;
  return result;
}

// Helper to get organization's records (RLS will automatically filter by org_id from JWT)
export async function getOrganizationRecords<T>(table: string, select: string = "*") {
  const { supabaseClient } = await getAuthenticatedSupabaseClient();

  // No need to explicitly filter by org_id - RLS policies handle this automatically
  const { data, error } = await supabaseClient.from(table).select(select);

  if (error) throw error;
  return data as T[];
}

// Legacy helper maintained for backward compatibility - now returns org records
export async function getUserRecords<T>(table: string, select: string = "*") {
  return getOrganizationRecords<T>(table, select);
}
