"use client";

import { useState, useEffect } from "react";

import { Plus } from "lucide-react";

import { DataTableWrapper } from "@/components/data-table/data-table-wrapper";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/hooks/use-supabase";
import type { Database } from "@/types/database";

import { MachineRunManagementDialog } from "./machine-run-management-dialog";
import { MachineRunSidepanel } from "./machine-run-sidepanel";
import { createOrderColumns } from "./order-columns";
import { OrderEditDialog } from "./order-edit-dialog";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"];
type MachineRun = Database["public"]["Tables"]["machine_runs"]["Row"];
type OrderWithCustomer = Order & { customer: Customer; machine_runs?: MachineRun[] };

interface OrderTableProps {
  initialData?: OrderWithCustomer[];
}

export function OrderTable({ initialData = [] }: OrderTableProps) {
  const [data, setData] = useState<OrderWithCustomer[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMachineRun, setSelectedMachineRun] = useState<MachineRun | null>(null);
  const [isSidepanelOpen, setIsSidepanelOpen] = useState(false);
  const [selectedOrderForMachineRuns, setSelectedOrderForMachineRuns] = useState<OrderWithCustomer | null>(null);
  const [isMachineRunDialogOpen, setIsMachineRunDialogOpen] = useState(false);
  const { supabase, isLoaded } = useSupabase();

  const columns = createOrderColumns({
    onEdit: (order) => {
      setSelectedOrder(order);
      setIsEditDialogOpen(true);
    },
    onMachineRunClick: (machineRun) => {
      setSelectedMachineRun(machineRun);
      setIsSidepanelOpen(true);
    },
    onManageMachineRuns: (order) => {
      setSelectedOrderForMachineRuns(order);
      setIsMachineRunDialogOpen(true);
    },
  });

  const loadOrders = async () => {
    if (!isLoaded) {
      console.log("Supabase client not loaded yet");
      return;
    }

    console.log("Loading orders from Supabase...");
    setLoading(true);
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          customer:customers(*),
          machine_runs(*)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading orders:", error);
        return;
      }

      console.log("Loaded orders:", orders?.length ?? 0);
      setData((orders as OrderWithCustomer[]) ?? []);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [isLoaded]);

  const handleCreateOrder = () => {
    setSelectedOrder(null);
    setIsEditDialogOpen(true);
  };

  const handleOrderSaved = (savedOrder: OrderWithCustomer) => {
    if (selectedOrder) {
      // Update existing order
      setData((prev) => prev.map((order) => (order.order_id === savedOrder.order_id ? savedOrder : order)));
    } else {
      // Add new order
      setData((prev) => [savedOrder, ...prev]);
    }
    setIsEditDialogOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">Manage your order processing and fulfillment.</p>
        </div>
        <Button onClick={handleCreateOrder}>
          <Plus className="mr-2 h-4 w-4" />
          Add Order
        </Button>
      </div>

      <DataTableWrapper
        columns={columns}
        data={data}
        loading={loading}
        searchKey="shopify_order_id"
        searchPlaceholder="Search orders..."
      />

      <OrderEditDialog
        order={selectedOrder}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSaved={handleOrderSaved}
      />

      <MachineRunSidepanel machineRun={selectedMachineRun} open={isSidepanelOpen} onOpenChange={setIsSidepanelOpen} />

      <MachineRunManagementDialog
        order={selectedOrderForMachineRuns}
        open={isMachineRunDialogOpen}
        onOpenChange={setIsMachineRunDialogOpen}
        onMachineRunClick={(machineRun) => {
          setSelectedMachineRun(machineRun);
          setIsSidepanelOpen(true);
        }}
      />
    </div>
  );
}
