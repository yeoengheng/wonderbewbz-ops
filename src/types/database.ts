export type OrderStatus = "pending" | "processing" | "completed";
export type MachineRunStatus = "pending" | "documented" | "processing" | "completed" | "qa_failed" | "cancelled";

export interface Customer {
  customer_id: string;
  shopify_customer_id?: string;
  name: string;
  phone?: string;
  shipping_addr_1?: string;
  shipping_addr_2?: string;
  postal_code?: string;
  user_id: string; // Clerk user ID
  created_at: string;
  updated_at: string;
}

export interface Order {
  order_id: string;
  shopify_order_id: string;
  customer_id: string;
  status: OrderStatus;
  shipping_addr_1?: string;
  shipping_addr_2?: string;
  postal_code?: string;
  phone?: string;
  arrival_temp?: number;
  arrival_weight?: number;
  visual_check?: "passed" | "flagged";
  visual_check_remarks?: string;
  user_id: string; // Clerk user ID
  created_at: string;
  updated_at: string;
}

export interface MachineRun {
  machine_run_id: string;
  order_id: string;
  run_number: number;
  status: MachineRunStatus;
  // Order Info inputs
  machine_run?: string;
  mama_name?: string;
  mama_nric?: string;
  date_received?: string;
  date_processed?: string;
  date_packed?: string;
  // Run Calculations inputs
  bags_weight_g?: number;
  powder_weight_g?: number;
  packing_requirements_ml?: number;
  label_water_to_add_ml?: number;
  water_activity_level?: number;
  // Gram Ratio inputs
  gram_ratio_staff_input_ml?: number;
  // Other inputs
  remarks?: string;
  user_id: string; // Clerk user ID
  created_at: string;
  updated_at: string;
}

export interface IndividualBag {
  bag_id: string;
  machine_run_id: string;
  bag_number: number;
  date_expressed?: string;
  time_expressed?: string;
  weight_g?: number;
  created_at: string;
  updated_at: string;
}

// Joined types for common queries
export interface OrderWithCustomer extends Order {
  customer: Customer;
}

export interface MachineRunWithOrder extends MachineRun {
  order: OrderWithCustomer;
}

export interface MachineRunWithBags extends MachineRun {
  individual_bags: IndividualBag[];
}

export interface CompleteOrderView extends OrderWithCustomer {
  machine_runs: MachineRunWithBags[];
}

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      customers: {
        Row: Customer;
        Insert: Omit<Customer, "customer_id" | "created_at" | "updated_at" | "user_id">;
        Update: Partial<Omit<Customer, "customer_id" | "created_at" | "updated_at" | "user_id">>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "order_id" | "created_at" | "updated_at" | "user_id">;
        Update: Partial<Omit<Order, "order_id" | "created_at" | "updated_at" | "user_id">>;
      };
      machine_runs: {
        Row: MachineRun;
        Insert: Omit<MachineRun, "machine_run_id" | "created_at" | "updated_at" | "user_id">;
        Update: Partial<Omit<MachineRun, "machine_run_id" | "created_at" | "updated_at" | "user_id">>;
      };
      individual_bags: {
        Row: IndividualBag;
        Insert: Omit<IndividualBag, "bag_id" | "created_at" | "updated_at">;
        Update: Partial<Omit<IndividualBag, "bag_id" | "created_at" | "updated_at">>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      order_status: OrderStatus;
      machine_run_status: MachineRunStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
