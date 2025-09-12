import { Suspense } from "react";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CustomerDebug } from "../_components/customer-debug";
import { CustomerQuickFix } from "../_components/customer-quick-fix";
import { CustomerRLSFix } from "../_components/customer-rls-fix";
import { CustomerTable } from "../_components/customer-table";
import { CustomerTableSimple } from "../_components/customer-table-simple";

export default function CustomersTestPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Customer Table Test</h1>
        <p className="text-muted-foreground">
          Test both Clerk-integrated and simple Supabase connections
        </p>
      </div>

      <Tabs defaultValue="debug" className="space-y-4">
        <TabsList>
          <TabsTrigger value="debug">Debug</TabsTrigger>
          <TabsTrigger value="clerk">Clerk Integration</TabsTrigger>
          <TabsTrigger value="simple">Direct Supabase</TabsTrigger>
        </TabsList>

        <TabsContent value="debug">
          <div className="space-y-6">
            <CustomerRLSFix />
            <div className="grid gap-6 lg:grid-cols-2">
              <CustomerQuickFix />
              <CustomerDebug />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="clerk">
          <Suspense fallback={<DataTableSkeleton />}>
            <CustomerTable />
          </Suspense>
        </TabsContent>

        <TabsContent value="simple">
          <Suspense fallback={<DataTableSkeleton />}>
            <CustomerTableSimple />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}