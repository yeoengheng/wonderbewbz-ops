"use client";

import { useState } from "react";

import { createClient } from "@supabase/supabase-js";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Database } from "@/types/database";

export function CustomerQuickFix() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const checkAndFix = async () => {
    setLoading(true);
    const fixes: string[] = [];

    try {
      // 1. Check if table exists and is accessible
      const { data: tableCheck, error: tableError } = await supabase
        .from("customers")
        .select("count", { count: "exact", head: true });

      if (tableError) {
        fixes.push(`❌ Table error: ${tableError.message}`);

        if (tableError.message.includes("relation") && tableError.message.includes("does not exist")) {
          fixes.push("🔧 FIX: Run migration 001_create_tables.sql in Supabase");
        }

        if (tableError.message.includes("RLS")) {
          fixes.push("🔧 FIX: Run migration 004_clerk_integration.sql to setup RLS properly");
        }

        setStatus(fixes.join("\n"));
        setLoading(false);
        return;
      }

      // 2. Check if RLS is blocking everything
      const { data: selectTest, error: selectError } = await supabase
        .from("customers")
        .select("*")
        .limit(1);

      if (selectError) {
        fixes.push(`❌ Query blocked: ${selectError.message}`);

        if (selectError.code === "42501" || selectError.message.includes("policy")) {
          fixes.push("🔧 FIX: RLS is blocking access - you need to either:");
          fixes.push("   • Run migration 004 for Clerk integration");
          fixes.push("   • OR disable RLS temporarily in Supabase dashboard");
        }
      } else {
        fixes.push("✅ Query access works");
        fixes.push(`📊 Current record count: ${selectTest?.length || 0}`);
      }

      // 3. Try creating test data if table is empty
      if (selectTest?.length === 0) {
        fixes.push("⚠️ No data found - creating test records...");

        const { data: insertTest, error: insertError } = await supabase
          .from("customers")
          .insert([
            {
              name: "Quick Fix Test Customer",
              phone: "+1 555 TEST",
              shipping_addr_1: "123 Test Street",
              postal_code: "TEST123",
            } as any
          ])
          .select();

        if (insertError) {
          fixes.push(`❌ Insert failed: ${insertError.message}`);
          if (insertError.message.includes("user_id")) {
            fixes.push("🔧 FIX: Missing user_id column - run migration 004");
          }
        } else {
          fixes.push("✅ Created test customer successfully!");
        }
      }

    } catch (error: any) {
      fixes.push(`❌ Unexpected error: ${error.message}`);
    }

    setStatus(fixes.join("\n"));
    setLoading(false);
  };

  const disableRLS = async () => {
    setLoading(true);
    try {
      // Note: This is a dangerous operation and requires proper permissions
      setStatus("⚠️ To disable RLS, go to Supabase Dashboard > Authentication > RLS and disable it for the customers table");
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Fix</CardTitle>
        <CardDescription>
          Diagnose and fix common customer table issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={checkAndFix} disabled={loading}>
            {loading ? "Checking..." : "Check & Fix Issues"}
          </Button>
          <Button onClick={disableRLS} variant="outline" disabled={loading}>
            Disable RLS Help
          </Button>
        </div>

        {status && (
          <Alert>
            <AlertDescription>
              <pre className="whitespace-pre-wrap text-sm">{status}</pre>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Common Issues:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Migration 001 not run → Table doesn't exist</li>
            <li>Migration 004 not run → RLS blocks access</li>
            <li>Missing environment variables</li>
            <li>No test data in database</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}