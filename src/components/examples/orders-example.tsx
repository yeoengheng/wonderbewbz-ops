"use client";

import { useEffect, useState } from "react";

import { useUser } from "@clerk/nextjs";

import { useSupabase } from "@/hooks/use-supabase";
import type { Database } from "@/types/database";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"];
type OrderWithCustomer = Order & { customer: Customer };

export function OrdersExample() {
  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const { supabase, isLoaded } = useSupabase();

  useEffect(() => {
    if (!user || !isLoaded) return;

    async function loadOrders() {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          customer:customers(*)
        `)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data as OrderWithCustomer[]);
      } else {
        console.error("Error loading orders:", error);
      }
      setLoading(false);
    }

    loadOrders();
  }, [user, isLoaded, supabase]);

  async function createTestOrder() {
    if (!user || !isLoaded) return;

    try {
      // First create a customer
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert({
          name: "Test Customer",
          phone: "+65 1234 5678",
          shipping_addr_1: "123 Test Street",
          postal_code: "123456",
          shopify_customer_id: `test_${Date.now()}`,
        })
        .select()
        .single();

      if (customerError) throw customerError;

      // Then create an order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          shopify_order_id: `order_${Date.now()}`,
          customer_id: customer.customer_id,
          status: "pending",
          shipping_addr_1: customer.shipping_addr_1,
          postal_code: customer.postal_code,
          phone: customer.phone,
        })
        .select(`
          *,
          customer:customers(*)
        `)
        .single();

      if (orderError) throw orderError;

      // Add to local state
      setOrders((prev) => [order as OrderWithCustomer, ...prev]);
    } catch (error) {
      console.error("Error creating test order:", error);
    }
  }

  if (!user) {
    return <div>Please sign in to view orders</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <button
          onClick={createTestOrder}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          disabled={loading}
        >
          Create Test Order
        </button>
      </div>

      {loading && <p>Loading orders...</p>}

      {!loading && orders.length === 0 && (
        <p>No orders found. Create a test order to get started!</p>
      )}

      {!loading && orders.length > 0 && (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div key={order.order_id} className="rounded-lg border p-4">
              <div className="mb-2 flex items-start justify-between">
                <h3 className="font-semibold">Order #{order.shopify_order_id}</h3>
                <span
                  className={`rounded px-2 py-1 text-sm ${
                    order.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : order.status === "processing"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <strong>Customer:</strong> {order.customer.name}
                </p>
                <p>
                  <strong>Phone:</strong> {order.phone}
                </p>
                <p>
                  <strong>Address:</strong> {order.shipping_addr_1}
                </p>
                <p>
                  <strong>Postal Code:</strong> {order.postal_code}
                </p>
                <p>
                  <strong>Created:</strong> {new Date(order.created_at).toLocaleDateString()}
                </p>
                <p className="text-xs">
                  <strong>User ID:</strong> {order.user_id}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}