"use client";

import { useState } from "react";

import { createClient } from "@supabase/supabase-js";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CustomerRLSFix() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Create Supabase client with service role key (has full access)
  const createServiceClient = () => {
    const serviceKey = prompt("Enter your Supabase SERVICE_ROLE_KEY (from dashboard settings):");
    if (!serviceKey) return null;

    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      {
        auth: { persistSession: false }
      }
    );
  };

  const disableRLS = async () => {
    setLoading(true);
    try {
      const supabase = createServiceClient();
      if (!supabase) {
        setStatus("❌ Service key required to disable RLS");
        setLoading(false);
        return;
      }

      // Disable RLS temporarily
      const { error } = await supabase
        .rpc('sql', {
          query: 'ALTER TABLE customers DISABLE ROW LEVEL SECURITY;'
        });

      if (error) {
        setStatus(`❌ Error disabling RLS: ${error.message}`);
      } else {
        setStatus("✅ RLS disabled! You can now create customers. Re-enable it later for security.");
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    }
    setLoading(false);
  };

  const createTestDataWithServiceKey = async () => {
    setLoading(true);
    try {
      const supabase = createServiceClient();
      if (!supabase) {
        setStatus("❌ Service key required");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("customers")
        .insert([
          {
            name: "Test Customer 1",
            phone: "+1 555 0123",
            shipping_addr_1: "123 Main St",
            postal_code: "12345",
            shopify_customer_id: "test_123",
            user_id: "test_user_1"
          },
          {
            name: "Test Customer 2",
            phone: "+1 555 0124",
            shipping_addr_1: "456 Oak Ave",
            postal_code: "67890",
            shopify_customer_id: "test_456",
            user_id: "test_user_2"
          }
        ])
        .select();

      if (error) {
        setStatus(`❌ Error creating test data: ${error.message}`);
      } else {
        setStatus(`✅ Created ${data?.length || 0} test customers with service key!`);
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>RLS Quick Fix</CardTitle>
        <CardDescription>
          Temporarily fix RLS issues to get customers working
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <strong>RLS is blocking INSERT operations.</strong> Choose one solution:
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h4 className="font-semibold">Option 1: Run Migration (Recommended)</h4>
          <p className="text-sm text-muted-foreground">
            Run migration <code>005_fix_rls_policies.sql</code> in Supabase SQL editor
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Option 2: Disable RLS Temporarily</h4>
          <Button onClick={disableRLS} disabled={loading} variant="outline">
            {loading ? "Processing..." : "Disable RLS (Requires Service Key)"}
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Option 3: Create Test Data with Service Key</h4>
          <Button onClick={createTestDataWithServiceKey} disabled={loading} variant="outline">
            {loading ? "Creating..." : "Create Test Data (Service Key)"}
          </Button>
        </div>

        {status && (
          <Alert>
            <AlertDescription>
              <pre className="whitespace-pre-wrap text-sm">{status}</pre>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground">
          <p><strong>Service Role Key Location:</strong></p>
          <p>Supabase Dashboard → Settings → API → Service Role Key</p>
        </div>
      </CardContent>
    </Card>
  );
}