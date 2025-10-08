import type { Customer, Order, MachineRun, IndividualBag, OrderWithCustomer } from "@/types/database";

import { getAuthenticatedSupabaseClient, getCurrentUserProfile } from "./clerk-integration";

// Authenticated versions of your queries that automatically include user context
export const authenticatedQueries = {
  // Customer operations with organization context (RLS enforces org_id automatically)
  customers: {
    async getAll() {
      const { supabaseClient } = await getAuthenticatedSupabaseClient();

      // RLS automatically filters by org_id from JWT
      const { data, error } = await supabaseClient
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },

    async create(customer: Omit<Customer, "customer_id" | "created_at" | "updated_at" | "user_id" | "org_id">) {
      const { supabaseClient, userId } = await getAuthenticatedSupabaseClient();

      // org_id will be set automatically by database default from JWT
      const customerData = {
        ...customer,
        created_by: userId,
      };

      const { data, error } = await supabaseClient
        .from("customers")
        .insert(customerData as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  },

  // Order operations with organization context (RLS enforces org_id automatically)
  orders: {
    async getAll() {
      const { supabaseClient } = await getAuthenticatedSupabaseClient();

      // RLS automatically filters by org_id from JWT
      const { data, error } = await supabaseClient
        .from("orders")
        .select(
          `
          *,
          customer:customers(*)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as OrderWithCustomer[];
    },

    async create(order: Omit<Order, "order_id" | "created_at" | "updated_at" | "user_id" | "org_id">) {
      const { supabaseClient, userId } = await getAuthenticatedSupabaseClient();

      // org_id will be set automatically by database default from JWT
      const orderData = {
        ...order,
        created_by: userId,
      };

      const { data, error } = await supabaseClient
        .from("orders")
        .insert(orderData as any)
        .select(
          `
          *,
          customer:customers(*)
        `,
        )
        .single();

      if (error) throw error;
      return data as OrderWithCustomer;
    },
  },

  // Machine run operations with organization context (RLS enforces org_id automatically)
  machineRuns: {
    async create(machineRun: Omit<MachineRun, "machine_run_id" | "created_at" | "updated_at" | "user_id" | "org_id">) {
      const { supabaseClient, userId } = await getAuthenticatedSupabaseClient();

      // org_id will be set automatically by database default from JWT
      const machineRunData = {
        ...machineRun,
        created_by: userId,
      };

      const { data, error } = await supabaseClient
        .from("machine_runs")
        .insert(machineRunData as any)
        .select(
          `
          *,
          order:orders(
            *,
            customer:customers(*)
          )
        `,
        )
        .single();

      if (error) throw error;
      return data;
    },

    async updateWithUser(
      machineRunId: string,
      updates: Partial<Omit<MachineRun, "machine_run_id" | "created_at" | "updated_at" | "user_id" | "org_id">>,
    ) {
      const { supabaseClient, userId } = await getAuthenticatedSupabaseClient();

      const updateData = {
        ...updates,
        updated_by: userId,
      };

      // RLS automatically ensures this update only affects records in the user's org
      const { data, error } = await (supabaseClient as any)
        .from("machine_runs")
        .update(updateData)
        .eq("machine_run_id", machineRunId)
        .select(
          `
          *,
          order:orders(
            *,
            customer:customers(*)
          )
        `,
        )
        .single();

      if (error) throw error;
      return data;
    },
  },

  // Get organization activity (RLS filters automatically by org_id)
  async getOrganizationActivity() {
    const { supabaseClient } = await getAuthenticatedSupabaseClient();
    const userProfile = await getCurrentUserProfile();

    // Get organization's recent activities (RLS automatically filters by org)
    const [ordersResult, machineRunsResult] = await Promise.all([
      supabaseClient
        .from("orders")
        .select("*, customer:customers(*)")
        .order("created_at", { ascending: false })
        .limit(10),

      supabaseClient
        .from("machine_runs")
        .select("*, order:orders(*, customer:customers(*))")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    return {
      user: userProfile,
      recentOrders: ordersResult.data ?? [],
      recentMachineRuns: machineRunsResult.data ?? [],
    };
  },

  // Legacy method - now returns org activity instead of user activity
  async getUserActivity() {
    return this.getOrganizationActivity();
  },
};
