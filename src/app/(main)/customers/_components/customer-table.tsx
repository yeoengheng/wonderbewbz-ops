"use client";

import { useState, useEffect, useCallback } from "react";

import { Plus } from "lucide-react";

import { DataTableWrapper } from "@/components/data-table/data-table-wrapper";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/hooks/use-supabase";
import type { Customer } from "@/types/database";

import { createCustomerColumns } from "./customer-columns";
import { CustomerEditDialog } from "./customer-edit-dialog";

interface CustomerTableProps {
  initialData?: Customer[];
}

export function CustomerTable({ initialData = [] }: CustomerTableProps) {
  const [data, setData] = useState<Customer[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { supabase, isLoaded } = useSupabase();

  const columns = createCustomerColumns({
    onEdit: (customer) => {
      setSelectedCustomer(customer);
      setIsEditDialogOpen(true);
    },
  });

  const loadCustomers = useCallback(async () => {
    if (!isLoaded) {
      console.log("Supabase client not loaded yet");
      return;
    }

    console.log("Loading customers from Supabase...");
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
      setData((customers as unknown as Customer[]) || []);
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, supabase]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleCreateCustomer = () => {
    setSelectedCustomer(null);
    setIsEditDialogOpen(true);
  };

  const handleCustomerSaved = (savedCustomer: Customer) => {
    if (selectedCustomer) {
      // Update existing customer
      setData((prev) =>
        prev.map((customer) => (customer.customer_id === savedCustomer.customer_id ? savedCustomer : customer)),
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
          <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">Manage your customer database and information.</p>
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

      <CustomerEditDialog
        customer={selectedCustomer}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSaved={handleCustomerSaved}
      />
    </div>
  );
}
