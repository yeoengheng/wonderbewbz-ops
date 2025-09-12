"use client";

import { useState } from "react";

import { createClient } from "@supabase/supabase-js";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Database } from "@/types/database";

export function OrderDebug() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const checkOrdersTable = async (): Promise<string[]> => {
    const results: string[] = [];

    // Check orders table access
    const { error: ordersError } = await supabase
      .from("orders")
      .select("count", { count: "exact", head: true });

    if (ordersError) {
      results.push(`❌ Orders table error: ${ordersError.message}`);
    } else {
      results.push("✅ Orders table accessible");
    }

    return results;
  };

  const checkOrdersWithCustomers = async (): Promise<string[]> => {
    const results: string[] = [];

    // Check orders with customer data
    const { data: ordersWithCustomers, error: joinError } = await supabase
      .from("orders")
      .select(`
        *,
        customer:customers(*)
      `)
      .limit(5);

    if (joinError) {
      results.push(`❌ Orders-Customer join error: ${joinError.message}`);
    } else {
      results.push(`✅ Orders with customers: ${ordersWithCustomers?.length ?? 0} found`);

      if (ordersWithCustomers && ordersWithCustomers.length > 0) {
        results.push("Sample orders:");
        ordersWithCustomers.slice(0, 3).forEach((order) => {
          results.push(`  • Order ${order.shopify_order_id} - Customer: ${order.customer?.name ?? 'Unknown'} - Status: ${order.status}`);
        });
      }
    }

    return results;
  };

  const checkCustomersCount = async (): Promise<string[]> => {
    const results: string[] = [];

    // Check customers count
    const { data: customers, error: customersError } = await supabase
      .from("customers")
      .select("count", { count: "exact", head: true });

    if (!customersError) {
      results.push(`📊 Available customers: ${customers?.length ?? 0}`);
    }

    return results;
  };

  const checkOrders = async () => {
    setLoading(true);

    try {
      const ordersResults = await checkOrdersTable();
      const customersResults = await checkOrdersWithCustomers();
      const countResults = await checkCustomersCount();

      const allResults = [...ordersResults, ...customersResults, ...countResults];
      setStatus(allResults.join("\n"));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setStatus(`❌ Unexpected error: ${errorMessage}`);
    }

    setLoading(false);
  };

  const createTestOrders = async () => {
    setLoading(true);
    try {
      // First get available customers
      const { data: customers, error: customersError } = await supabase
        .from("customers")
        .select("*")
        .limit(3);

      if (customersError || !customers?.length) {
        setStatus("❌ No customers found. Create customers first!");
        setLoading(false);
        return;
      }

      // Create test orders
      const testOrders = customers.map((customer, index) => ({
        shopify_order_id: `test_order_${Date.now()}_${index}`,
        customer_id: customer.customer_id,
        status: (['pending', 'processing', 'completed'][index % 3]) as Database['public']['Enums']['order_status'],
        shipping_addr_1: customer.shipping_addr_1,
        postal_code: customer.postal_code,
        phone: customer.phone,
      }));

      const { data: newOrders, error: insertError } = await supabase
        .from("orders")
        .insert(testOrders)
        .select(`
          *,
          customer:customers(*)
        `);

      if (insertError) {
        setStatus(`❌ Error creating test orders: ${insertError.message}`);
      } else {
        setStatus(`✅ Created ${newOrders?.length ?? 0} test orders!`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setStatus(`❌ Error: ${errorMessage}`);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders Debug</CardTitle>
        <CardDescription>
          Debug and test the orders table
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={checkOrders} disabled={loading}>
            {loading ? "Checking..." : "Check Orders"}
          </Button>
          <Button onClick={createTestOrders} variant="outline" disabled={loading}>
            Create Test Orders
          </Button>
        </div>

        {status && (
          <Alert>
            <AlertDescription>
              <pre className="whitespace-pre-wrap text-sm">{status}</pre>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}