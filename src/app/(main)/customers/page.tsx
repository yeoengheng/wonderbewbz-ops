import { Suspense } from "react";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";

import { CustomerTable } from "./_components/customer-table";

export default function CustomersPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<DataTableSkeleton />}>
        <CustomerTable />
      </Suspense>
    </div>
  );
}