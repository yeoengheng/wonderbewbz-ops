"use client";

import * as React from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";

import { DataTable } from "./data-table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableSkeleton } from "./data-table-skeleton";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableWrapperProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  searchKey?: keyof TData;
  searchPlaceholder?: string;
  dndEnabled?: boolean;
  onReorder?: (newData: TData[]) => void;
  enableRowSelection?: boolean;
  toolbar?: (table: any) => React.ReactNode;
}

export function DataTableWrapper<TData, TValue>({
  columns,
  data,
  loading = false,
  searchKey,
  searchPlaceholder = "Search...",
  dndEnabled = false,
  onReorder,
  enableRowSelection = false,
  toolbar,
}: DataTableWrapperProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Generate a storage key based on the table's columns (to handle different tables)
  const storageKey = React.useMemo(() => {
    const columnIds = columns.map((col) => (col as any).accessorKey ?? (col as any).id).join("-");
    return `table-visibility-${columnIds.substring(0, 50)}`;
  }, [columns]);

  // Load column visibility from localStorage
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save column visibility to localStorage whenever it changes
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(columnVisibility));
    } catch (error) {
      console.warn("Failed to save column visibility:", error);
    }
  }, [columnVisibility, storageKey]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  if (loading) {
    return <DataTableSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          {searchKey && (
            <Input
              placeholder={searchPlaceholder}
              value={(table.getColumn(searchKey as string)?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn(searchKey as string)?.setFilterValue(event.target.value)}
              className="max-w-sm"
            />
          )}
          {toolbar?.(table)}
        </div>
        <DataTableViewOptions table={table} />
      </div>
      <div className="rounded-md border">
        <DataTable table={table} columns={columns} dndEnabled={dndEnabled} onReorder={onReorder} />
      </div>
      <DataTablePagination table={table} showRowSelection={enableRowSelection} />
    </div>
  );
}
