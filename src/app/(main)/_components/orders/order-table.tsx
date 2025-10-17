"use client";

import { useState, useEffect, useCallback } from "react";

import { Plus, CheckCircle2, Clock, Package2, Truck } from "lucide-react";

import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableWrapper } from "@/components/data-table/data-table-wrapper";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/hooks/use-supabase";
import type { Database } from "@/types/database";

import { MachineRunManagementDialog } from "./machine-run-management-dialog";
import { MachineRunSidepanel } from "./machine-run-sidepanel";
import { MachineRunWizard } from "./machine-run-wizard";
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
  const [editingMachineRun, setEditingMachineRun] = useState<MachineRun | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
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
    onDelete: async (order) => {
      if (!confirm(`Are you sure you want to delete order ${order.shopify_order_id}? This action cannot be undone.`)) {
        return;
      }

      try {
        const { error } = await supabase.from("orders").delete().eq("order_id", order.order_id);

        if (error) {
          console.error("Error deleting order:", error);
          alert("Failed to delete order. Please try again.");
          return;
        }

        // Remove from local state
        setData((prev) => prev.filter((o) => o.order_id !== order.order_id));
      } catch (error) {
        console.error("Error deleting order:", error);
        alert("Failed to delete order. Please try again.");
      }
    },
  });

  const loadOrders = useCallback(async () => {
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
  }, [isLoaded, supabase]);

  useEffect(() => {
    if (isLoaded) {
      loadOrders();
    }
  }, [isLoaded]); // Only depend on isLoaded, not the entire loadOrders callback

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

  const handleMachineRunsUpdated = () => {
    // Refresh the orders data when machine runs are updated
    loadOrders();
  };

  const handleSidepanelEdit = (machineRun: MachineRun) => {
    // Find the order that contains this machine run
    const orderWithMachineRun = data.find((order) =>
      order.machine_runs?.some((mr) => mr.machine_run_id === machineRun.machine_run_id),
    );

    if (orderWithMachineRun) {
      setSelectedOrderForMachineRuns(orderWithMachineRun);
      setEditingMachineRun(machineRun);
      setIsWizardOpen(true);
      setIsSidepanelOpen(false); // Close the side panel
    }
  };

  const handleWizardComplete = () => {
    setIsWizardOpen(false);
    setEditingMachineRun(null);
    setSelectedOrderForMachineRuns(null);
    loadOrders(); // Refresh data
  };

  const statusOptions = [
    {
      label: "Pending",
      value: "pending",
      icon: Clock,
    },
    {
      label: "Processing",
      value: "processing",
      icon: Package2,
    },
    {
      label: "Completed",
      value: "completed",
      icon: CheckCircle2,
    },
    {
      label: "Delivered",
      value: "delivered",
      icon: Truck,
    },
  ];

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
        toolbar={(table) => (
          <DataTableFacetedFilter column={table.getColumn("status")} title="Status" options={statusOptions} />
        )}
      />

      <OrderEditDialog
        order={selectedOrder}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSaved={handleOrderSaved}
      />

      <MachineRunSidepanel
        machineRun={selectedMachineRun}
        open={isSidepanelOpen}
        onOpenChange={setIsSidepanelOpen}
        onEditClick={handleSidepanelEdit}
      />

      <MachineRunManagementDialog
        order={selectedOrderForMachineRuns}
        open={isMachineRunDialogOpen}
        onOpenChange={setIsMachineRunDialogOpen}
        onMachineRunClick={(machineRun) => {
          setSelectedMachineRun(machineRun);
          setIsSidepanelOpen(true);
        }}
        onMachineRunsUpdated={handleMachineRunsUpdated}
      />

      <MachineRunWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        order={selectedOrderForMachineRuns!}
        onComplete={handleWizardComplete}
        editingMachineRun={editingMachineRun}
      />
    </div>
  );
}
