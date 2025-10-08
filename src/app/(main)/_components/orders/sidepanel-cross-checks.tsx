"use client";

import { useEffect, useState } from "react";

import { useSupabase } from "@/hooks/use-supabase";
import type { Database } from "@/types/database";

type MachineRun = Database["public"]["Tables"]["machine_runs"]["Row"];
type CrossCheck = Database["public"]["Tables"]["cross_checks"]["Row"];

interface SidepanelCrossChecksProps {
  machineRun: MachineRun;
}

export function SidepanelCrossChecks({ machineRun }: SidepanelCrossChecksProps) {
  const { supabase, isLoaded } = useSupabase();
  const [crossChecks, setCrossChecks] = useState<CrossCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCrossChecks = async () => {
      if (!isLoaded) return;

      try {
        const { data, error } = await supabase
          .from("cross_checks")
          .select("*")
          .eq("machine_run_id", machineRun.machine_run_id)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error loading cross checks:", error);
          return;
        }

        setCrossChecks(data || []);
      } catch (error) {
        console.error("Error loading cross checks:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCrossChecks();
  }, [machineRun.machine_run_id, supabase, isLoaded]);

  // Calculate totals
  const calculateRowTotal = (check: CrossCheck): number => {
    return check.powder_weight_g * check.quantity;
  };

  const calculateCombinedTotal = (): number => {
    return crossChecks.reduce((sum, check) => sum + calculateRowTotal(check), 0);
  };

  // Calculate variance
  const calculateVariance = (): number => {
    const expectedWeight = machineRun.powder_weight_g ?? 0;
    const combinedTotal = calculateCombinedTotal();

    if (expectedWeight === 0) {
      return 0;
    }

    return ((combinedTotal - expectedWeight) / expectedWeight) * 100;
  };

  const combinedTotal = calculateCombinedTotal();
  const expectedWeight = machineRun.powder_weight_g ?? 0;
  const variance = calculateVariance();

  if (loading) {
    return (
      <div className="bg-card rounded-lg border p-8">
        <p className="text-muted-foreground text-center text-sm">Loading cross checks...</p>
      </div>
    );
  }

  if (crossChecks.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-8">
        <p className="text-muted-foreground text-center text-sm">No cross check entries found</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border">
      <div className="bg-muted/50 border-b p-4">
        <h3 className="text-sm font-medium">✓ Cross Check</h3>
      </div>

      {/* Individual Entries */}
      <div className="divide-y">
        {crossChecks.map((check, index) => (
          <div key={check.cross_check_id} className="space-y-2 p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Entry {index + 1}</span>
              <span className="text-sm font-medium">{calculateRowTotal(check).toFixed(2)} g</span>
            </div>
            <div className="flex items-center justify-between pl-4 text-xs">
              <span className="text-muted-foreground">Powder Weight × Quantity</span>
              <span className="text-muted-foreground">
                {check.powder_weight_g}g × {check.quantity}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="space-y-3 border-t p-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Combined Total</span>
          <span className="text-sm font-bold">{combinedTotal.toFixed(2)} g</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Expected</span>
          <span className="text-sm font-medium">{expectedWeight.toFixed(2)} g</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Difference</span>
          <span className="text-sm font-medium">
            {(combinedTotal - expectedWeight).toFixed(2)} g ({variance.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
