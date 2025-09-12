"use client";

import { useState } from "react";

import { useSession, useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Database } from "@/types/database";

export function CustomerDebug() {
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { session } = useSession();

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const checkEnvironment = () => ({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing",
  });

  const checkClerk = () => ({
    userLoaded: !!user,
    sessionLoaded: !!session,
    userId: user?.id ?? "No user",
    userEmail: user?.emailAddresses?.[0]?.emailAddress ?? "No email",
  });

  const checkSupabaseConnection = async () => {
    try {
      const { error: healthError } = await supabase
        .from("customers")
        .select("count", { count: "exact", head: true });

      return {
        connection: healthError ? `❌ Error: ${healthError.message}` : "✅ Connected",
        tableExists: !healthError,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      return {
        connection: `❌ Connection failed: ${errorMessage}`,
        tableExists: false,
      };
    }
  };

  const checkTableData = async () => {
    try {
      const { data: customers, error } = await supabase
        .from("customers")
        .select("*")
        .limit(5);

      if (error) {
        return {
          dataAccess: `❌ Error: ${error.message}`,
          recordCount: 0,
        };
      }

      return {
        dataAccess: "✅ Data accessible",
        recordCount: customers?.length ?? 0,
        sampleData: customers?.slice(0, 2) ?? [],
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      return {
        dataAccess: `❌ Error: ${errorMessage}`,
        recordCount: 0,
      };
    }
  };

  const runDiagnostics = async () => {
    setLoading(true);

    try {
      const [supabaseResult, dataResult] = await Promise.all([
        checkSupabaseConnection(),
        checkTableData(),
      ]);

      const diagnostics = {
        timestamp: new Date().toISOString(),
        environment: checkEnvironment(),
        clerk: checkClerk(),
        supabase: supabaseResult,
        database: dataResult,
      };

      setResults(diagnostics);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setResults({ error: errorMessage });
    }

    setLoading(false);
  };

  const createTestData = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .insert([
          {
            name: "Test Customer 1",
            phone: "+1 555 0123",
            shipping_addr_1: "123 Main St",
            postal_code: "12345",
            shopify_customer_id: "test_123",
          },
          {
            name: "Test Customer 2",
            phone: "+1 555 0124",
            shipping_addr_1: "456 Oak Ave",
            postal_code: "67890",
            shopify_customer_id: "test_456",
          },
        ] as Database['public']['Tables']['customers']['Insert'][])
        .select();

      if (error) {
        alert(`Error creating test data: ${error.message}`);
      } else {
        alert(`Created ${data?.length ?? 0} test customers!`);
        await runDiagnostics();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Customer Table Diagnostics</CardTitle>
          <CardDescription>
            Debug why customer data isn&apos;t loading
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runDiagnostics} disabled={loading}>
              {loading ? "Running..." : "Run Diagnostics"}
            </Button>
            <Button onClick={createTestData} variant="outline">
              Create Test Data
            </Button>
          </div>

          {Object.keys(results).length > 0 && (
            <div className="mt-4">
              <pre className="whitespace-pre-wrap rounded bg-slate-100 p-4 text-sm">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}