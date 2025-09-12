import { supabase, createServerSupabaseClient } from "@/lib/supabase";
import type { 
  Customer, 
  Order, 
  MachineRun, 
  IndividualBag,
  OrderWithCustomer,
  MachineRunWithOrder,
  CompleteOrderView 
} from "@/types/database";

// Customer operations
export const customerQueries = {
  async getAll() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(customerId: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('customer_id', customerId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByShopifyId(shopifyCustomerId: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('shopify_customer_id', shopifyCustomerId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(customer: Omit<Customer, 'customer_id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(customerId: string, updates: Partial<Omit<Customer, 'customer_id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('customer_id', customerId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Order operations
export const orderQueries = {
  async getAll() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as OrderWithCustomer[];
  },

  async getById(orderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*)
      `)
      .eq('order_id', orderId)
      .single();
    
    if (error) throw error;
    return data as OrderWithCustomer;
  },

  async getByShopifyId(shopifyOrderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*)
      `)
      .eq('shopify_order_id', shopifyOrderId)
      .single();
    
    if (error) throw error;
    return data as OrderWithCustomer;
  },

  async create(order: Omit<Order, 'order_id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select(`
        *,
        customer:customers(*)
      `)
      .single();
    
    if (error) throw error;
    return data as OrderWithCustomer;
  },

  async updateStatus(orderId: string, status: Order['status']) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('order_id', orderId)
      .select(`
        *,
        customer:customers(*)
      `)
      .single();
    
    if (error) throw error;
    return data as OrderWithCustomer;
  }
};

// Machine Run operations
export const machineRunQueries = {
  async getAll() {
    const { data, error } = await supabase
      .from('machine_runs')
      .select(`
        *,
        order:orders(
          *,
          customer:customers(*)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as MachineRunWithOrder[];
  },

  async getById(machineRunId: string) {
    const { data, error } = await supabase
      .from('machine_runs')
      .select(`
        *,
        order:orders(
          *,
          customer:customers(*)
        ),
        individual_bags(*)
      `)
      .eq('machine_run_id', machineRunId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByOrderId(orderId: string) {
    const { data, error } = await supabase
      .from('machine_runs')
      .select(`
        *,
        individual_bags(*)
      `)
      .eq('order_id', orderId)
      .order('run_number', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async create(machineRun: Omit<MachineRun, 'machine_run_id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('machine_runs')
      .insert(machineRun)
      .select(`
        *,
        order:orders(
          *,
          customer:customers(*)
        )
      `)
      .single();
    
    if (error) throw error;
    return data as MachineRunWithOrder;
  },

  async update(machineRunId: string, updates: Partial<Omit<MachineRun, 'machine_run_id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('machine_runs')
      .update(updates)
      .eq('machine_run_id', machineRunId)
      .select(`
        *,
        order:orders(
          *,
          customer:customers(*)
        )
      `)
      .single();
    
    if (error) throw error;
    return data as MachineRunWithOrder;
  }
};

// Individual Bag operations
export const bagQueries = {
  async getByMachineRunId(machineRunId: string) {
    const { data, error } = await supabase
      .from('individual_bags')
      .select('*')
      .eq('machine_run_id', machineRunId)
      .order('bag_number', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async create(bag: Omit<IndividualBag, 'bag_id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('individual_bags')
      .insert(bag)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async createBatch(bags: Omit<IndividualBag, 'bag_id' | 'created_at' | 'updated_at'>[]) {
    const { data, error } = await supabase
      .from('individual_bags')
      .insert(bags)
      .select();
    
    if (error) throw error;
    return data;
  },

  async update(bagId: string, updates: Partial<Omit<IndividualBag, 'bag_id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('individual_bags')
      .update(updates)
      .eq('bag_id', bagId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Complex queries
export const complexQueries = {
  // Get complete order view with all machine runs and bags
  async getCompleteOrder(orderId: string): Promise<CompleteOrderView> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        machine_runs(
          *,
          individual_bags(*)
        )
      `)
      .eq('order_id', orderId)
      .single();
    
    if (error) throw error;
    return data as CompleteOrderView;
  },

  // Get dashboard summary stats
  async getDashboardStats() {
    const [ordersResult, machineRunsResult, bagsResult] = await Promise.all([
      supabase.from('orders').select('status', { count: 'exact' }),
      supabase.from('machine_runs').select('status', { count: 'exact' }),
      supabase.from('individual_bags').select('bag_id', { count: 'exact' })
    ]);

    return {
      totalOrders: ordersResult.count || 0,
      totalMachineRuns: machineRunsResult.count || 0,
      totalBags: bagsResult.count || 0,
      ordersByStatus: ordersResult.data?.reduce((acc, row) => {
        acc[row.status] = (acc[row.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      machineRunsByStatus: machineRunsResult.data?.reduce((acc, row) => {
        acc[row.status] = (acc[row.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {}
    };
  }
};