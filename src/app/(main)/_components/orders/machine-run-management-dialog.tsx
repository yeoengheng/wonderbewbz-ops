"use client";

import { useState, useEffect, useCallback } from "react";

import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSupabase } from "@/hooks/use-supabase";
import type { Database } from "@/types/database";

import { MachineRunWizard } from "./machine-run-wizard";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"];
type MachineRun = Database["public"]["Tables"]["machine_runs"]["Row"];
type OrderWithCustomer = Order & { customer: Customer; machine_runs?: MachineRun[] };

interface MachineRunManagementDialogProps {
  order: OrderWithCustomer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMachineRunClick?: (machineRun: MachineRun) => void;
  onMachineRunsUpdated?: () => void;
}

export function MachineRunManagementDialog({
  order,
  open,
  onOpenChange,
  onMachineRunClick,
  onMachineRunsUpdated,
}: MachineRunManagementDialogProps) {
  const [machineRuns, setMachineRuns] = useState<MachineRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingMachineRun, setEditingMachineRun] = useState<MachineRun | null>(null);
  const { supabase, isLoaded } = useSupabase();

  const loadMachineRuns = useCallback(async () => {
    if (!order || !isLoaded) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("machine_runs")
        .select("*")
        .eq("order_id", order.order_id)
        .order("run_number", { ascending: true });

      if (error) {
        console.error("Error loading machine runs:", error);
        return;
      }

      setMachineRuns(data ?? []);
    } catch (error) {
      console.error("Error loading machine runs:", error);
    } finally {
      setLoading(false);
    }
  }, [order, isLoaded, supabase]);

  useEffect(() => {
    if (order && isLoaded) {
      loadMachineRuns();
    }
  }, [order?.order_id, isLoaded]); // Only depend on order ID and isLoaded, not the entire loadMachineRuns callback

  const handleAddMachineRun = () => {
    setEditingMachineRun(null);
    setIsWizardOpen(true);
  };

  const handleEditMachineRun = (machineRun: MachineRun) => {
    setEditingMachineRun(machineRun);
    setIsWizardOpen(true);
  };

  const handleWizardComplete = () => {
    setIsWizardOpen(false);
    setEditingMachineRun(null);
    loadMachineRuns();
    onMachineRunsUpdated?.(); // Notify parent to refresh orders data
  };

  if (!order) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold">Order: {order.shopify_order_id.slice(-8)}</DialogTitle>
            <DialogDescription>Manage machine runs and order information</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Machine Runs</h3>
              <Button onClick={handleAddMachineRun}>
                <Plus className="mr-2 h-4 w-4" />
                Add Runs
              </Button>
            </div>

            {loading ? (
              <div className="py-8 text-center">Loading machine runs...</div>
            ) : machineRuns.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-muted-foreground">No runs yet</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {machineRuns.map((run) => (
                  <MachineRunCard
                    key={run.machine_run_id}
                    machineRun={run}
                    runLabel={`${run.run_number}`}
                    onClick={() => onMachineRunClick?.(run)}
                    onEdit={() => handleEditMachineRun(run)}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <MachineRunWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        order={order}
        onComplete={handleWizardComplete}
        editingMachineRun={editingMachineRun}
      />
    </>
  );
}

interface MachineRunCardProps {
  machineRun: MachineRun;
  runLabel: string;
  onClick: () => void;
  onEdit: () => void;
}

function MachineRunCard({ machineRun, runLabel, onClick, onEdit }: MachineRunCardProps) {
  const statusConfig = {
    pending: { label: "Milk arrived", className: "bg-purple-100 text-purple-700 hover:bg-purple-100" },
    documented: { label: "Documented", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
    processing: { label: "Processing", className: "bg-red-100 text-red-700 hover:bg-red-100" },
    completed: { label: "Completed", className: "bg-green-100 text-green-700 hover:bg-green-100" },
    qa_failed: { label: "QA Failed", className: "bg-gray-100 text-gray-700 hover:bg-gray-100" },
    cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-700 hover:bg-gray-100" },
  };

  const status = statusConfig[machineRun.status as keyof typeof statusConfig];

  return (
    <div
      className="bg-card cursor-pointer space-y-3 rounded-lg border p-4 transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">{runLabel}</h4>
        <div className="flex gap-2">
          <Badge className={status.className}>{status.label}</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            Edit
          </Button>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Name</span>
          <span>{machineRun.mama_name ?? "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">NRIC</span>
          <span>{machineRun.mama_nric ?? "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Date Expressed</span>
          <span>{machineRun.date_received ?? "-"}</span>
        </div>
      </div>
    </div>
  );
}
