"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Package } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Database } from "@/types/database";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"];
type OrderWithCustomer = Order & { customer: Customer };

interface OrderColumnsProps {
  onEdit: (order: OrderWithCustomer) => void;
}

export const createOrderColumns = ({ onEdit }: OrderColumnsProps): ColumnDef<OrderWithCustomer>[] => [
  {
    accessorKey: "shopify_order_id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Order ID" />,
    cell: ({ row }) => {
      const orderId = row.getValue("shopify_order_id");
      return (
        <div className="flex items-center space-x-2">
          <Package className="text-muted-foreground h-4 w-4" />
          <span className="font-mono text-sm font-medium">#{String(orderId).slice(-8)}</span>
        </div>
      );
    },
  },
  {
    id: "customer",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div>
          <div className="font-medium">{order.customer.name}</div>
          <div className="text-muted-foreground text-sm">{order.customer.phone ?? "No phone"}</div>
        </div>
      );
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

      const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

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
        <div className="max-w-[300px]">
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
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
