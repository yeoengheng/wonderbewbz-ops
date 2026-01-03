"use client";

import * as React from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  RowSelectionState,
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
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  toolbar?: (table: any) => React.ReactNode;
}

// eslint-disable-next-line complexity
export function DataTableWrapper<TData, TValue>({
  columns,
  data,
  loading = false,
  searchKey,
  searchPlaceholder = "Search...",
  dndEnabled = false,
  onReorder,
  enableRowSelection = false,
  rowSelection: externalRowSelection,
  onRowSelectionChange: externalOnRowSelectionChange,
  toolbar,
}: DataTableWrapperProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [internalRowSelection, setInternalRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Use external rowSelection if provided, otherwise use internal state
  const rowSelection = externalRowSelection ?? internalRowSelection;
  const setRowSelection = externalOnRowSelectionChange ?? setInternalRowSelection;

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
    localStorage.setItem(storageKey, JSON.stringify(columnVisibility));
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
    enableRowSelection: enableRowSelection,
    autoResetPageIndex: false, // Don't reset to page 1 when data changes
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
