"use client";

import { useState, useEffect } from "react";

import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
}

interface EditableOrderInfo {
  name: string;
  phone: string;
}

export function MachineRunManagementDialog({
  order,
  open,
  onOpenChange,
  onMachineRunClick,
}: MachineRunManagementDialogProps) {
  const [machineRuns, setMachineRuns] = useState<MachineRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(false);
  const [orderInfo, setOrderInfo] = useState<EditableOrderInfo>({ name: "", phone: "" });
  const { supabase, isLoaded } = useSupabase();

  const loadMachineRuns = async () => {
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

      setMachineRuns(data || []);
    } catch (error) {
      console.error("Error loading machine runs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (order) {
      setOrderInfo({
        name: order.customer.name,
        phone: order.customer.phone ?? "",
      });
      loadMachineRuns();
    }
  }, [order, isLoaded, loadMachineRuns]);

  const handleSaveOrderInfo = async () => {
    if (!order || !isLoaded) return;

    try {
      // For now, just update the local state
      // TODO: Implement customer update with proper typing
      setEditingOrder(false);
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };

  const handleCancelEdit = () => {
    setOrderInfo({
      name: order?.customer.name ?? "",
      phone: order?.customer.phone ?? "",
    });
    setEditingOrder(false);
  };

  const handleAddMachineRun = () => {
    setIsWizardOpen(true);
  };

  const handleWizardComplete = () => {
    setIsWizardOpen(false);
    loadMachineRuns();
  };

  if (!order) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold">Order: {order.shopify_order_id.slice(-8)}</DialogTitle>
                <DialogDescription>Manage machine runs and order information</DialogDescription>
              </div>
              <Button onClick={handleAddMachineRun} className="bg-blue-600 text-white hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Runs
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Order Info Section */}
            <div className="bg-card rounded-lg border">
              <div className="bg-muted/50 flex items-center justify-between border-b p-4">
                <h3 className="text-sm font-medium">Order Information</h3>
                {!editingOrder ? (
                  <Button variant="outline" size="sm" onClick={() => setEditingOrder(true)}>
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveOrderInfo}>
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-4 p-4">
                {editingOrder ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer-name">Name</Label>
                      <Input
                        id="customer-name"
                        value={orderInfo.name}
                        onChange={(e) => setOrderInfo({ ...orderInfo, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer-phone">Phone</Label>
                      <Input
                        id="customer-phone"
                        value={orderInfo.phone}
                        onChange={(e) => setOrderInfo({ ...orderInfo, phone: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Name</span>
                      <span className="text-sm font-medium">{orderInfo.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Phone</span>
                      <span className="text-sm font-medium">{orderInfo.phone ?? "Not provided"}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Machine Runs Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Machine Runs</h3>

              {loading ? (
                <div className="py-8 text-center">Loading machine runs...</div>
              ) : machineRuns.length === 0 ? (
                <div className="space-y-4 py-12 text-center">
                  <div className="text-muted-foreground">No runs yet</div>
                  <Button onClick={handleAddMachineRun} className="bg-blue-600 text-white hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Runs
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {machineRuns.map((run, index) => (
                    <MachineRunCard
                      key={run.machine_run_id}
                      machineRun={run}
                      runLabel={`${run.run_number}-${String.fromCharCode(65 + index)}`}
                      onClick={() => onMachineRunClick?.(run)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <MachineRunWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        order={order}
        onComplete={handleWizardComplete}
      />
    </>
  );
}

interface MachineRunCardProps {
  machineRun: MachineRun;
  runLabel: string;
  onClick: () => void;
}

function MachineRunCard({ machineRun, runLabel, onClick }: MachineRunCardProps) {
  const statusConfig = {
    pending: { label: "Pending", variant: "secondary" as const },
    processing: { label: "In progress", variant: "default" as const },
    completed: { label: "Completed", variant: "outline" as const },
    qa_failed: { label: "QA Failed", variant: "destructive" as const },
    cancelled: { label: "Cancelled", variant: "secondary" as const },
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
          <Badge variant={status.variant}>{status.label}</Badge>
          <Button variant="outline" size="sm">
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
