"use client";

import { useState, useEffect } from "react";

import { createClient } from "@supabase/supabase-js";
import { Plus } from "lucide-react";

import { DataTableWrapper } from "@/components/data-table/data-table-wrapper";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";

import { createOrderColumns } from "./order-columns";
import { OrderEditDialog } from "./order-edit-dialog";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"];
type OrderWithCustomer = Order & { customer: Customer };

export function OrderTable() {
  const [data, setData] = useState<OrderWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Create simple Supabase client
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const columns = createOrderColumns({
    onEdit: (order) => {
      setSelectedOrder(order);
      setIsEditDialogOpen(true);
    },
  });

  const loadOrders = async () => {
    console.log("Loading orders from Supabase...");
    setLoading(true);
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select(`
          *,
          customer:customers(*)
        `)
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
  }, [loadOrders]);

  const handleCreateOrder = () => {
    setSelectedOrder(null);
    setIsEditDialogOpen(true);
  };

  const handleOrderSaved = (savedOrder: OrderWithCustomer) => {
    if (selectedOrder) {
      // Update existing order
      setData((prev) =>
        prev.map((order) =>
          order.order_id === savedOrder.order_id ? savedOrder : order
        )
      );
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
          <p className="text-muted-foreground">
            Manage your order processing and fulfillment.
          </p>
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
    </div>
  );
}