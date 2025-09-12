"use client";

import { useEffect, useState } from "react";

import { useSession, useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

// Simple component that demonstrates the Clerk-Supabase integration
export function SimpleOrdersExample() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const { session } = useSession();

  // Create Supabase client with Clerk token
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: async () => {
          const token = session ? await session.getToken() : null;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      },
    }
  );

  useEffect(() => {
    if (!user || !session) return;

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
        setOrders(data);
      } else {
        console.error("Error loading orders:", error);
      }
      setLoading(false);
    }

    loadOrders();
  }, [user, session]);

  async function createTestOrder() {
    if (!user || !session) return;

    try {
      // First create a customer (user_id will be automatically set from JWT)
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

      if (customerError) {
        console.error("Customer error:", customerError);
        return;
      }

      // Then create an order (user_id will be automatically set from JWT)
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          shopify_order_id: `order_${Date.now()}`,
          customer_id: customer.customer_id,
          status: "pending" as const,
          shipping_addr_1: customer.shipping_addr_1,
          postal_code: customer.postal_code,
          phone: customer.phone,
        })
        .select(`
          *,
          customer:customers(*)
        `)
        .single();

      if (orderError) {
        console.error("Order error:", orderError);
        return;
      }

      // Add to local state
      setOrders((prev) => [order, ...prev]);
    } catch (error) {
      console.error("Error creating test order:", error);
    }
  }

  if (!user) {
    return <div className="p-6">Please sign in to view orders</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Orders (Clerk Integration Demo)</h1>
        <button
          onClick={createTestOrder}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          Create Test Order
        </button>
      </div>

      {loading && <p>Loading orders...</p>}

      {!loading && orders.length === 0 && (
        <div className="rounded-lg border p-6 text-center">
          <p className="text-gray-600">No orders found. Create a test order to get started!</p>
          <p className="mt-2 text-sm text-gray-400">
            This will test the Clerk-Supabase RLS integration. Each user only sees their own data.
          </p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="grid gap-4">
          {orders.map((order: any) => (
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
                  <strong>Customer:</strong> {order.customer?.name}
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
                <p className="text-xs text-blue-600">
                  <strong>User ID:</strong> {order.user_id}
                </p>
                <p className="text-xs text-green-600">
                  <strong>Clerk User:</strong> {user.id}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <h4 className="font-semibold">Integration Status:</h4>
        <ul className="mt-2 space-y-1">
          <li>✅ Clerk User: {user.firstName} {user.lastName}</li>
          <li>✅ Session Active: {session ? "Yes" : "No"}</li>
          <li>✅ RLS Enabled: Data is user-isolated</li>
          <li>✅ JWT Token: Automatically passed to Supabase</li>
        </ul>
      </div>
    </div>
  );
}