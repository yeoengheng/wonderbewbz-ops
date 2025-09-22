"use client";

import { Edit } from "lucide-react";

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
import type { Database } from "@/types/database";

type MachineRun = Database["public"]["Tables"]["machine_runs"]["Row"];

interface MachineRunSidepanelProps {
  machineRun: MachineRun | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  pending: { label: "Pending", variant: "secondary" as const },
  processing: { label: "In progress", variant: "default" as const },
  completed: { label: "Completed", variant: "outline" as const },
  qa_failed: { label: "QA Failed", variant: "destructive" as const },
  cancelled: { label: "Cancelled", variant: "secondary" as const },
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
            <span className="text-muted-foreground text-sm">Date Expressed</span>
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

function CalculationsSection({ machineRun }: { machineRun: MachineRun }) {
  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg border">
        <div className="bg-muted/50 border-b p-4">
          <h3 className="text-sm font-medium">🧮 Calculations</h3>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Bags Weight</span>
            <span className="text-sm font-medium">
              {machineRun.bags_weight_g ? `${machineRun.bags_weight_g}g` : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Powder Weight</span>
            <span className="text-sm font-medium">
              {machineRun.powder_weight_g ? `${machineRun.powder_weight_g}g` : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Packing Requirements</span>
            <span className="text-sm font-medium">
              {machineRun.packing_requirements_ml ? `${machineRun.packing_requirements_ml}ml` : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Water to Add</span>
            <span className="text-sm font-medium">
              {machineRun.label_water_to_add_ml ? `${machineRun.label_water_to_add_ml}ml` : "-"}
            </span>
          </div>
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

function IndividualBagsSection() {
  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg border">
        <div className="bg-muted/50 border-b p-4">
          <h3 className="text-sm font-medium">📦 Individual Bags</h3>
        </div>
        <div className="p-8 text-center">
          <div className="space-y-3">
            <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
              <svg className="text-muted-foreground h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h4 className="font-medium">Individual Bags</h4>
            <p className="text-muted-foreground mx-auto max-w-sm text-sm">
              Individual bag details and tracking information will be displayed here when available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MachineRunSidepanel({ machineRun, open, onOpenChange }: MachineRunSidepanelProps) {
  const isMobile = useIsMobile();

  if (!machineRun) return null;

  const status = statusConfig[machineRun.status as keyof typeof statusConfig];

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={isMobile ? "bottom" : "right"}>
      <DrawerContent className={isMobile ? "max-h-[85vh] rounded-t-lg" : "h-full w-[700px] rounded-l-lg"}>
        <DrawerHeader className="gap-1">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <DrawerTitle className="text-2xl font-bold tracking-tight">{machineRun.run_number}-A</DrawerTitle>
                <Badge variant={status.variant} className="px-3 py-1 text-sm">
                  {status.label}
                </Badge>
              </div>
              <DrawerDescription className="text-muted-foreground">
                Machine Run Details • Last updated {new Date(machineRun.updated_at).toLocaleDateString()}
              </DrawerDescription>
            </div>
            {!isMobile && (
              <Button
                size="sm"
                variant="default"
                onClick={() => {}}
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
            </TabsContent>

            <TabsContent value="individual-bags" className="space-y-8 px-1">
              <IndividualBagsSection />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer with action buttons */}
        <DrawerFooter>
          {isMobile && (
            <Button onClick={() => {}} className="bg-blue-600 text-white hover:bg-blue-700">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
