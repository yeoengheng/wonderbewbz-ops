"use client";

import { useState, useEffect } from "react";

import { createClient } from "@supabase/supabase-js";
import { Plus } from "lucide-react";

import { DataTableWrapper } from "@/components/data-table/data-table-wrapper";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";

import { createCustomerColumns } from "./customer-columns";
import { CustomerEditDialogSimple } from "./customer-edit-dialog-simple";

type Customer = Database["public"]["Tables"]["customers"]["Row"];

export function CustomerTableSimple() {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Create simple Supabase client
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const columns = createCustomerColumns({
    onEdit: (customer) => {
      setSelectedCustomer(customer);
      setIsEditDialogOpen(true);
    },
  });

  const loadCustomers = async () => {
    console.log("Loading customers from Supabase (simple version)...");
    setLoading(true);
    try {
      const { data: customers, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading customers:", error);
        return;
      }

      console.log("Loaded customers:", customers?.length || 0);
      setData(customers || []);
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleCreateCustomer = () => {
    setSelectedCustomer(null);
    setIsEditDialogOpen(true);
  };

  const handleCustomerSaved = (savedCustomer: Customer) => {
    if (selectedCustomer) {
      // Update existing customer
      setData((prev) =>
        prev.map((customer) =>
          customer.customer_id === savedCustomer.customer_id
            ? savedCustomer
            : customer
        )
      );
    } else {
      // Add new customer
      setData((prev) => [savedCustomer, ...prev]);
    }
    setIsEditDialogOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customers (Simple)</h2>
          <p className="text-muted-foreground">
            Manage your customer database and information. Direct Supabase connection.
          </p>
        </div>
        <Button onClick={handleCreateCustomer}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <DataTableWrapper
        columns={columns}
        data={data}
        loading={loading}
        searchKey="name"
        searchPlaceholder="Search customers..."
      />

      <CustomerEditDialogSimple
        customer={selectedCustomer}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSaved={handleCustomerSaved}
      />
    </div>
  );
}