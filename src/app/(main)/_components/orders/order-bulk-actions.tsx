"use client";

import { CheckCircle2, Clock, Package2, Truck, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OrderStatus } from "@/types/database";

interface OrderBulkActionsProps {
  selectedCount: number;
  isUpdatingStatus: boolean;
  onClearSelection: () => void;
  onStatusChange: (status: OrderStatus) => void;
}

export function OrderBulkActions({
  selectedCount,
  isUpdatingStatus,
  onClearSelection,
  onStatusChange,
}: OrderBulkActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-muted flex items-center gap-2 rounded-md border px-3 py-2">
        <span className="text-sm font-medium">{selectedCount} selected</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={onClearSelection}
          disabled={isUpdatingStatus}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Select onValueChange={(value) => onStatusChange(value as OrderStatus)} disabled={isUpdatingStatus}>
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue placeholder="Change status..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Pending</span>
            </div>
          </SelectItem>
          <SelectItem value="processing">
            <div className="flex items-center gap-2">
              <Package2 className="h-4 w-4" />
              <span>Processing</span>
            </div>
          </SelectItem>
          <SelectItem value="completed">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Completed</span>
            </div>
          </SelectItem>
          <SelectItem value="delivered">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span>Delivered</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
