"use client";

import { useEffect, useState } from "react";

import { AlertTriangle, Edit } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSupabase } from "@/hooks/use-supabase";
import type { Database } from "@/types/database";

import { SidepanelCrossChecks } from "./sidepanel-cross-checks";
import { SidepanelIndividualBags } from "./sidepanel-individual-bags";

type MachineRun = Database["public"]["Tables"]["machine_runs"]["Row"];
type IndividualBag = Database["public"]["Tables"]["individual_bags"]["Row"];

interface MachineRunSidepanelProps {
  machineRun: MachineRun | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditClick?: (machineRun: MachineRun) => void;
  allMachineRuns?: MachineRun[];
}

const statusConfig = {
  milk_arrived: { label: "Milk Arrived", className: "bg-purple-100 text-purple-700 hover:bg-purple-100" },
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" },
  documented: { label: "Documented", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  processing: { label: "Processing", className: "bg-orange-100 text-orange-700 hover:bg-orange-100" },
  completed: { label: "Completed", className: "bg-green-100 text-green-700 hover:bg-green-100" },
  qa_failed: { label: "QA Failed", className: "bg-red-100 text-red-700 hover:bg-red-100" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-700 hover:bg-gray-100" },
};

function OrderInfoSection({ machineRun }: { machineRun: MachineRun }) {
  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg border">
        <div className="bg-muted/50 border-b p-4">
          <h3 className="text-sm font-medium">📋 Order Info</h3>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Mama&apos;s Name</span>
            <span className="text-sm font-medium">{machineRun.mama_name ?? "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Mama&apos;s NRIC</span>
            <span className="text-sm font-medium">{machineRun.mama_nric ?? "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Date Received</span>
            <span className="text-sm font-medium">{machineRun.date_received ?? "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Date Processed</span>
            <span className="text-sm font-medium">{machineRun.date_processed ?? "-"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function useIndividualBags(machineRunId: string | undefined) {
  const [individualBags, setIndividualBags] = useState<IndividualBag[]>([]);
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchIndividualBags = async () => {
      if (!machineRunId) return;

      const { data } = await supabase.from("individual_bags").select("*").eq("machine_run_id", machineRunId);

      setIndividualBags(data ?? []);
    };

    fetchIndividualBags();
  }, [machineRunId, supabase]);

  return individualBags;
}

function calculateWaterContentPercentage(totalWetWeight: number, powderWeight: number): string | null {
  if (totalWetWeight <= 0 || powderWeight <= 0) return null;
  return (100 - (powderWeight / totalWetWeight) * 100).toFixed(1);
}

function isWaterContentOutOfRange(waterContent: string | null): boolean {
  if (!waterContent) return false;
  const value = parseFloat(waterContent);
  return value < 85 || value > 89.5;
}

function DisplayRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function WaterContentRow({ waterContent }: { waterContent: string | null }) {
  const isOutOfRange = isWaterContentOutOfRange(waterContent);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">Breastmilk Water Content</span>
        <span className={`text-sm font-medium ${isOutOfRange ? "font-semibold text-yellow-600" : ""}`}>
          {waterContent ? `${waterContent}%` : "-"}
        </span>
      </div>
      {isOutOfRange && (
        <div className="flex items-center justify-end gap-1 text-xs text-yellow-600">
          <AlertTriangle className="h-3 w-3" />
          <span>Expected: 85-89.5%</span>
        </div>
      )}
    </div>
  );
}

function CalculationsSection({ machineRun }: { machineRun: MachineRun }) {
  const individualBags = useIndividualBags(machineRun.machine_run_id);

  const totalBagsWeight = individualBags.reduce((sum, bag) => sum + (bag.weight_g ?? 0), 0);
  const totalWetWeight = totalBagsWeight - (machineRun.bags_weight_g ?? 0);
  const waterContent = calculateWaterContentPercentage(totalWetWeight, machineRun.powder_weight_g ?? 0);

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg border">
        <div className="bg-muted/50 border-b p-4">
          <h3 className="text-sm font-medium">🧮 Calculations</h3>
        </div>
        <div className="space-y-3 p-4">
          <DisplayRow label="Total Wet Weight" value={totalWetWeight > 0 ? `${totalWetWeight.toFixed(1)}g` : "-"} />
          <DisplayRow label="Bags Weight" value={machineRun.bags_weight_g ? `${machineRun.bags_weight_g}g` : "-"} />
          <DisplayRow
            label="Powder Weight"
            value={machineRun.powder_weight_g ? `${machineRun.powder_weight_g}g` : "-"}
          />
          <DisplayRow
            label="Packing Requirements"
            value={machineRun.packing_requirements_ml ? `${machineRun.packing_requirements_ml}ml` : "-"}
          />
          <DisplayRow
            label="Water to Add"
            value={machineRun.label_water_to_add_ml ? `${machineRun.label_water_to_add_ml}ml` : "-"}
          />
          <WaterContentRow waterContent={waterContent} />
        </div>
      </div>
    </div>
  );
}

function RemarksSection({ machineRun }: { machineRun: MachineRun }) {
  return (
    <div className="space-y-4 pb-8">
      <div className="bg-card rounded-lg border">
        <div className="bg-muted/50 border-b p-4">
          <h3 className="text-sm font-medium">📝 Remarks</h3>
        </div>
        <div className="p-4">
          <p className="text-muted-foreground text-sm whitespace-pre-wrap">
            {machineRun.remarks ?? "No remarks provided"}
          </p>
        </div>
      </div>
    </div>
  );
}

function AdditionalInputsSection({ machineRun }: { machineRun: MachineRun }) {
  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg border">
        <div className="bg-muted/50 border-b p-4">
          <h3 className="text-sm font-medium">⚙️ Additional Inputs</h3>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Water Activity Level</span>
            <span className="text-sm font-medium">{machineRun.water_activity_level ?? "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Gram Ratio Staff Input</span>
            <span className="text-sm font-medium">
              {machineRun.gram_ratio_staff_input_ml ? `${machineRun.gram_ratio_staff_input_ml}ml` : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Date Packed</span>
            <span className="text-sm font-medium">{machineRun.date_packed ?? "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Machine Run Identifier</span>
            <span className="text-sm font-medium">{machineRun.machine_run ?? "-"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MachineRunSidepanel({
  machineRun,
  open,
  onOpenChange,
  onEditClick,
}: Omit<MachineRunSidepanelProps, "allMachineRuns">) {
  const isMobile = useIsMobile();

  if (!machineRun) return null;

  const status = statusConfig[machineRun.status as keyof typeof statusConfig];

  const runLabel = `${machineRun.run_number}`;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={isMobile ? "bottom" : "right"}>
      <DrawerContent className={isMobile ? "max-h-[85vh] rounded-t-lg" : "h-full w-[700px] rounded-l-lg"}>
        <DrawerHeader className="gap-1">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <DrawerTitle className="text-2xl font-bold tracking-tight">{runLabel}</DrawerTitle>
                <Badge className={`px-3 py-1 text-sm ${status.className}`}>{status.label}</Badge>
              </div>
              <DrawerDescription className="text-muted-foreground">
                Machine Run Details • Last updated {new Date(machineRun.updated_at).toLocaleDateString()}
              </DrawerDescription>
            </div>
            {!isMobile && (
              <Button
                size="sm"
                variant="default"
                onClick={() => onEditClick?.(machineRun)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </DrawerHeader>

        {/* Content Area */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          <Tabs defaultValue="main" className="flex h-full w-full flex-col">
            <TabsList className={`mb-6 grid w-full grid-cols-3 ${isMobile ? "h-10" : "h-12"}`}>
              <TabsTrigger value="main" className="text-sm font-medium">
                Main
              </TabsTrigger>
              <TabsTrigger value="inputs" className="text-sm font-medium">
                Inputs
              </TabsTrigger>
              <TabsTrigger value="individual-bags" className="text-sm font-medium">
                Individual Bags
              </TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="space-y-8 px-1">
              <OrderInfoSection machineRun={machineRun} />
              <CalculationsSection machineRun={machineRun} />
              <RemarksSection machineRun={machineRun} />
            </TabsContent>

            <TabsContent value="inputs" className="space-y-8 px-1">
              <AdditionalInputsSection machineRun={machineRun} />
              <SidepanelCrossChecks machineRun={machineRun} />
            </TabsContent>

            <TabsContent value="individual-bags" className="space-y-8 px-1">
              <SidepanelIndividualBags machineRun={machineRun} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer with action buttons */}
        <DrawerFooter>
          {isMobile && (
            <Button onClick={() => onEditClick?.(machineRun)} className="bg-blue-600 text-white hover:bg-blue-700">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
