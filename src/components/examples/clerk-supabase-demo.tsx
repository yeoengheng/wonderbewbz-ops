"use client";

import { useEffect, useState } from "react";

import { useSession, useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

// Simple demo component to test Clerk-Supabase integration
export function ClerkSupabaseDemo() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const { session } = useSession();

  // Create Supabase client with Clerk authentication
  function createSupabaseClient() {
    return createClient(
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
  }

  async function testConnection() {
    if (!session || !user) {
      setError("Please sign in first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseClient();

      // Test 1: Create a customer
      console.log("Creating test customer...");
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert({
          name: `Test User ${Date.now()}`,
          phone: "+65 1234 5678",
          shipping_addr_1: "123 Test Street",
          postal_code: "123456",
        } as any)
        .select()
        .single();

      if (customerError) {
        throw new Error(`Customer creation failed: ${customerError.message}`);
      }

      console.log("Customer created:", customer);

      // Test 2: Create an order
      console.log("Creating test order...");
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          shopify_order_id: `test_order_${Date.now()}`,
          customer_id: customer.customer_id,
          status: "pending",
          shipping_addr_1: customer.shipping_addr_1,
          postal_code: customer.postal_code,
          phone: customer.phone,
        } as any)
        .select()
        .single();

      if (orderError) {
        throw new Error(`Order creation failed: ${orderError.message}`);
      }

      console.log("Order created:", order);

      // Test 3: Fetch user's data
      console.log("Fetching user's orders...");
      const { data: orders, error: fetchError } = await supabase
        .from("orders")
        .select("*, customer:customers(*)")
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw new Error(`Fetch failed: ${fetchError.message}`);
      }

      console.log("Orders fetched:", orders);
      setData(orders || []);
    } catch (err: any) {
      console.error("Test failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadExistingData() {
    if (!session || !user) return;

    setLoading(true);
    try {
      const supabase = createSupabaseClient();
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*, customer:customers(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setData(orders || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExistingData();
  }, [session, user]);

  if (!user) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <h2 className="mb-2 text-lg font-semibold">Clerk-Supabase Integration Demo</h2>
        <p className="text-gray-600">Please sign in to test the integration</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-bold">Clerk-Supabase Integration Demo</h2>
        
        <div className="mb-4 space-y-2 text-sm">
          <p><strong>Clerk User:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Session Active:</strong> {session ? "✅ Yes" : "❌ No"}</p>
          <p><strong>Database:</strong> Connected via JWT token</p>
        </div>

        <div className="space-x-2">
          <button
            onClick={testConnection}
            disabled={loading}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test Integration"}
          </button>
          
          <button
            onClick={loadExistingData}
            disabled={loading}
            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
          >
            Reload Data
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded bg-red-50 p-3 text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      <div className="rounded-lg border p-6">
        <h3 className="mb-4 text-lg font-semibold">Your Orders ({data.length})</h3>
        
        {loading && <p className="text-gray-600">Loading...</p>}
        
        {!loading && data.length === 0 && (
          <p className="text-gray-600">No orders found. Click "Test Integration" to create some test data.</p>
        )}

        {data.length > 0 && (
          <div className="space-y-3">
            {data.map((order: any, index: number) => (
              <div key={order.order_id || index} className="rounded border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-medium">Order #{order.shopify_order_id}</h4>
                  <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                    {order.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Customer:</strong> {order.customer?.name}</p>
                  <p><strong>Address:</strong> {order.shipping_addr_1}</p>
                  <p><strong>Created:</strong> {new Date(order.created_at).toLocaleString()}</p>
                  <p className="text-xs text-blue-600"><strong>User ID:</strong> {order.user_id}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg bg-gray-50 p-4 text-sm">
        <h4 className="mb-2 font-semibold">Integration Features:</h4>
        <ul className="space-y-1">
          <li>✅ Automatic user isolation via RLS</li>
          <li>✅ JWT token automatically passed to Supabase</li>
          <li>✅ Each user only sees their own data</li>
          <li>✅ user_id automatically set from Clerk JWT</li>
        </ul>
      </div>
    </div>
  );
}