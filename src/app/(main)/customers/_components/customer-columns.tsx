"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Customer } from "@/types/database";

interface CustomerColumnsProps {
  onEdit: (customer: Customer) => void;
}

export const createCustomerColumns = ({ onEdit }: CustomerColumnsProps): ColumnDef<Customer>[] => [
  {
    accessorKey: "shopify_customer_id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Shopify Customer ID" />,
    cell: ({ row }) => {
      const shopifyId = row.getValue("shopify_customer_id");
      return (
        <div className="font-mono text-sm">
          {shopifyId ? String(shopifyId) : <span className="text-muted-foreground italic">Not set</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const name = row.getValue("name");
      return <div className="font-medium">{String(name)}</div>;
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
    id: "address",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Address" />,
    cell: ({ row }) => {
      const customer = row.original;
      const address = [customer.shipping_addr_1, customer.shipping_addr_2, customer.postal_code]
        .filter(Boolean)
        .join(", ");

      return (
        <div className="max-w-[300px]">
          {address ? address : <span className="text-muted-foreground italic">No address</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
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
      const customer = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(customer)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Customer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
