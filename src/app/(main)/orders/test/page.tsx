import { Suspense } from "react";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { OrderDebug } from "../../_components/orders/order-debug";
import { OrderTable } from "../../_components/orders/order-table";

export default function OrdersTestPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Orders Test</h1>
        <p className="text-muted-foreground">
          Test the orders table and debug any issues
        </p>
      </div>

      <Tabs defaultValue="debug" className="space-y-4">
        <TabsList>
          <TabsTrigger value="debug">Debug</TabsTrigger>
          <TabsTrigger value="table">Orders Table</TabsTrigger>
        </TabsList>

        <TabsContent value="debug">
          <OrderDebug />
        </TabsContent>

        <TabsContent value="table">
          <Suspense fallback={<DataTableSkeleton />}>
            <OrderTable />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}