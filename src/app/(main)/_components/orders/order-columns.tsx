"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Package, Settings, Trash2 } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Database } from "@/types/database";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"];
type MachineRun = Database["public"]["Tables"]["machine_runs"]["Row"];
type OrderWithCustomer = Order & { customer: Customer; machine_runs?: MachineRun[] };

interface OrderColumnsProps {
  onEdit: (order: OrderWithCustomer) => void;
  onMachineRunClick: (machineRun: MachineRun, order: OrderWithCustomer) => void;
  onManageMachineRuns: (order: OrderWithCustomer) => void;
  onDelete: (order: OrderWithCustomer) => void;
}

export const createOrderColumns = ({
  onEdit,
  onMachineRunClick,
  onManageMachineRuns,
  onDelete,
}: OrderColumnsProps): ColumnDef<OrderWithCustomer>[] => [
  {
    accessorKey: "shopify_order_id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Order ID" />,
    cell: ({ row }) => {
      const orderId = row.getValue("shopify_order_id");
      return (
        <div className="flex items-center space-x-2">
          <Package className="text-muted-foreground h-4 w-4" />
          <span className="font-mono text-sm font-medium">{String(orderId)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "customer.name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
    cell: ({ row }) => {
      const order = row.original;
      return <div className="font-medium">{order.customer.name}</div>;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue("status");

      const statusConfig = {
        pending: { label: "Pending", variant: "secondary" as const },
        processing: { label: "Processing", variant: "default" as const },
        completed: { label: "Completed", variant: "outline" as const },
      };

      const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.pending;

      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    id: "shipping_address",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Shipping Address" />,
    cell: ({ row }) => {
      const order = row.original;
      const address = [order.shipping_addr_1, order.shipping_addr_2, order.postal_code].filter(Boolean).join(", ");

      return (
        <div className="max-w-[300px] truncate" title={address || "No address"}>
          {address ? address : <span className="text-muted-foreground italic">No address</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
    cell: ({ row }) => {
      const phone = row.getValue("phone");
      return (
        <div className="font-mono text-sm">
          {phone ? String(phone) : <span className="text-muted-foreground italic">Not provided</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "arrival_temp",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Arrival Temp" />,
    cell: ({ row }) => {
      const temp = row.getValue("arrival_temp");
      return (
        <div className="text-sm">{temp ? `${temp}°C` : <span className="text-muted-foreground italic">-</span>}</div>
      );
    },
  },
  {
    accessorKey: "arrival_weight",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Arrival Weight" />,
    cell: ({ row }) => {
      const weight = row.getValue("arrival_weight");
      return (
        <div className="text-sm">{weight ? `${weight}g` : <span className="text-muted-foreground italic">-</span>}</div>
      );
    },
  },
  {
    accessorKey: "visual_check",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Visual Check" />,
    cell: ({ row }) => {
      const visualCheck = row.getValue("visual_check");

      if (!visualCheck) {
        return <span className="text-muted-foreground italic">-</span>;
      }

      const config = {
        passed: { label: "Passed", className: "bg-green-100 text-green-700 hover:bg-green-100" },
        flagged: { label: "Flagged", className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" },
      };

      const checkConfig = config[visualCheck as keyof typeof config];

      return <Badge className={checkConfig?.className}>{checkConfig?.label}</Badge>;
    },
  },
  {
    id: "machine_runs",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Machine Runs" />,
    cell: ({ row }) => {
      const order = row.original;
      const machineRuns = order.machine_runs ?? [];

      if (machineRuns.length === 0) {
        return <span className="text-muted-foreground italic">No runs</span>;
      }

      return (
        <div className="flex flex-wrap gap-1">
          {machineRuns.map((run, index) => (
            <span key={run.machine_run_id} className="inline-flex items-center">
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 font-medium text-blue-600 underline hover:text-blue-800"
                onClick={() => onMachineRunClick(run, order)}
              >
                {run.run_number}
              </Button>
              {index < machineRuns.length - 1 && <span className="text-muted-foreground ml-1">,</span>}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Order Date" />,
    cell: ({ row }) => {
      const date = row.getValue("created_at");
      return (
        <div className="text-sm">
          {new Date(String(date)).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Updated" />,
    cell: ({ row }) => {
      const date = row.getValue("updated_at");
      return (
        <div className="text-muted-foreground text-sm">
          {new Date(String(date)).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const order = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(order)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Order
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onManageMachineRuns(order)}>
              <Settings className="mr-2 h-4 w-4" />
              Add/Edit Machine Runs
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(order)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
