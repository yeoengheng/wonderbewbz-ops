import type { Customer, Order, MachineRun, IndividualBag, OrderWithCustomer } from "@/types/database";

import { getAuthenticatedSupabaseClient, getCurrentUserProfile } from "./clerk-integration";

// Authenticated versions of your queries that automatically include user context
export const authenticatedQueries = {
  // Customer operations with user context
  customers: {
    async getAll() {
      const { supabaseClient, userId } = await getAuthenticatedSupabaseClient();

      const { data, error } = await supabaseClient
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },

    async create(customer: Omit<Customer, "customer_id" | "created_at" | "updated_at">) {
      const { supabaseClient, userId } = await getAuthenticatedSupabaseClient();

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

  // Order operations with user context
  orders: {
    async getAll() {
      const { supabaseClient } = await getAuthenticatedSupabaseClient();

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

    async create(order: Omit<Order, "order_id" | "created_at" | "updated_at">) {
      const { supabaseClient, userId } = await getAuthenticatedSupabaseClient();

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

  // Machine run operations with user context
  machineRuns: {
    async create(machineRun: Omit<MachineRun, "machine_run_id" | "created_at" | "updated_at">) {
      const { supabaseClient, userId } = await getAuthenticatedSupabaseClient();

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
      updates: Partial<Omit<MachineRun, "machine_run_id" | "created_at" | "updated_at">>,
    ) {
      const { supabaseClient, userId } = await getAuthenticatedSupabaseClient();

      const updateData = {
        ...updates,
        updated_by: userId,
      };

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

  // Get current user's activity
  async getUserActivity() {
    const { supabaseClient, userId } = await getAuthenticatedSupabaseClient();
    const userProfile = await getCurrentUserProfile();

    // Get user's recent activities
    const [ordersResult, machineRunsResult] = await Promise.all([
      supabaseClient
        .from("orders")
        .select("*, customer:customers(*)")
        .eq("created_by", userId)
        .order("created_at", { ascending: false })
        .limit(10),

      supabaseClient
        .from("machine_runs")
        .select("*, order:orders(*, customer:customers(*))")
        .eq("created_by", userId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    return {
      user: userProfile,
      recentOrders: ordersResult.data ?? [],
      recentMachineRuns: machineRunsResult.data ?? [],
    };
  },
};
