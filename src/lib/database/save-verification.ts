/**
 * Save verification utilities to confirm data was persisted to the database
 */

import { SupabaseClient } from "@supabase/supabase-js";

export interface VerificationOptions {
  supabase: SupabaseClient;
  table: string;
  idField: string;
  idValue: string;
  selectQuery?: string;
}

export interface VerificationResult<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

/**
 * Verifies a record exists in the database after a mutation
 * Re-queries to confirm the data was persisted
 */
export async function verifySave<T>(options: VerificationOptions): Promise<VerificationResult<T>> {
  const { supabase, table, idField, idValue, selectQuery = "*" } = options;

  try {
    const { data, error } = await supabase.from(table).select(selectQuery).eq(idField, idValue).single();

    if (error) {
      return {
        success: false,
        data: null,
        error: `Verification failed: ${error.message}`,
      };
    }

    if (!data) {
      return {
        success: false,
        data: null,
        error: "Record not found after save. The operation may have failed silently.",
      };
    }

    return {
      success: true,
      data: data as T,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: `Verification error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export interface MultiTableCheck {
  table: string;
  idField: string;
  idValue: string;
  expectedCount?: number;
}

/**
 * Verifies multiple related records exist (for machine run with bags and cross checks)
 */
export async function verifyMultiTableSave(
  supabase: SupabaseClient,
  checks: MultiTableCheck[],
): Promise<VerificationResult<boolean>> {
  for (const check of checks) {
    const { data, error, count } = await supabase
      .from(check.table)
      .select("*", { count: "exact" })
      .eq(check.idField, check.idValue);

    if (error) {
      return {
        success: false,
        data: false,
        error: `Verification failed for ${check.table}: ${error.message}`,
      };
    }

    if (check.expectedCount !== undefined && count !== check.expectedCount) {
      return {
        success: false,
        data: false,
        error: `Expected ${check.expectedCount} records in ${check.table}, found ${count}`,
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        data: false,
        error: `No records found in ${check.table} after save`,
      };
    }
  }

  return { success: true, data: true, error: null };
}
