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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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

function OrderInfoSection({ machineRun, isMobile }: { machineRun: MachineRun; isMobile: boolean }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold">Order Info</h3>
        <div className="bg-border h-px flex-1"></div>
      </div>
      <div className="bg-muted/50 space-y-5 rounded-lg p-6">
        <div className={`${!isMobile ? "md:grid-cols-2" : ""} grid grid-cols-1 gap-5`}>
          <div className="space-y-2">
            <Label htmlFor="mama-name">Mama&apos;s Name</Label>
            <Input id="mama-name" placeholder="Enter mama's name" defaultValue={machineRun.mama_name ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mama-nric">Mama&apos;s NRIC</Label>
            <Input id="mama-nric" placeholder="Enter NRIC" defaultValue={machineRun.mama_nric ?? ""} disabled />
          </div>
        </div>
        <div className={`${!isMobile ? "md:grid-cols-2" : ""} grid grid-cols-1 gap-5`}>
          <div className="space-y-2">
            <Label htmlFor="date-expressed">Date Expressed</Label>
            <Input id="date-expressed" type="date" defaultValue={machineRun.date_received ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date-processed">Date Processed</Label>
            <Input id="date-processed" type="date" defaultValue={machineRun.date_processed ?? ""} disabled />
          </div>
        </div>
      </div>
    </div>
  );
}

function CalculationsSection({ machineRun, isMobile }: { machineRun: MachineRun; isMobile: boolean }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold">Calculations</h3>
        <div className="bg-border h-px flex-1"></div>
      </div>
      <div className="bg-muted/50 space-y-5 rounded-lg p-6">
        <div className={`${!isMobile ? "md:grid-cols-2" : ""} grid grid-cols-1 gap-5`}>
          <div className="space-y-2">
            <Label htmlFor="bags-weight">Bags Weight (g)</Label>
            <Input
              id="bags-weight"
              type="number"
              placeholder="0"
              defaultValue={machineRun.bags_weight_g ?? ""}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="powder-weight">Powder Weight (g)</Label>
            <Input
              id="powder-weight"
              type="number"
              placeholder="0"
              defaultValue={machineRun.powder_weight_g ?? ""}
              disabled
            />
          </div>
        </div>
        <div className={`${!isMobile ? "md:grid-cols-2" : ""} grid grid-cols-1 gap-5`}>
          <div className="space-y-2">
            <Label htmlFor="packing-requirements">Packing Requirements (ml)</Label>
            <Input
              id="packing-requirements"
              type="number"
              placeholder="0"
              defaultValue={machineRun.packing_requirements_ml ?? ""}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="water-to-add">Label Water to Add (ml)</Label>
            <Input
              id="water-to-add"
              type="number"
              placeholder="0"
              defaultValue={machineRun.label_water_to_add_ml ?? ""}
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function RemarksSection({ machineRun }: { machineRun: MachineRun }) {
  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold">Remarks</h3>
        <div className="bg-border h-px flex-1"></div>
      </div>
      <div className="bg-muted/50 rounded-lg p-6">
        <Textarea
          placeholder="Enter any additional remarks or notes..."
          defaultValue={machineRun.remarks ?? ""}
          disabled
          className="min-h-[120px] resize-none"
        />
      </div>
    </div>
  );
}

function AdditionalInputsSection({ machineRun, isMobile }: { machineRun: MachineRun; isMobile: boolean }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold">Additional Inputs</h3>
        <div className="bg-border h-px flex-1"></div>
      </div>
      <div className="bg-muted/50 space-y-5 rounded-lg p-6">
        <div className={`${!isMobile ? "md:grid-cols-2" : ""} grid grid-cols-1 gap-5`}>
          <div className="space-y-2">
            <Label htmlFor="water-activity">Water Activity Level</Label>
            <Input
              id="water-activity"
              type="number"
              step="0.01"
              placeholder="0.00"
              defaultValue={machineRun.water_activity_level ?? ""}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gram-ratio">Gram Ratio Staff Input (ml)</Label>
            <Input
              id="gram-ratio"
              type="number"
              placeholder="0"
              defaultValue={machineRun.gram_ratio_staff_input_ml ?? ""}
              disabled
            />
          </div>
        </div>
        <div className={`${!isMobile ? "md:grid-cols-2" : ""} grid grid-cols-1 gap-5`}>
          <div className="space-y-2">
            <Label htmlFor="date-packed">Date Packed</Label>
            <Input id="date-packed" type="date" defaultValue={machineRun.date_packed ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="machine-run-field">Machine Run Identifier</Label>
            <Input
              id="machine-run-field"
              placeholder="Enter machine run ID"
              defaultValue={machineRun.machine_run ?? ""}
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function IndividualBagsSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold">Individual Bags</h3>
        <div className="bg-border h-px flex-1"></div>
      </div>
      <div className="bg-muted/50 rounded-lg p-8 text-center">
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
  );
}

export function MachineRunSidepanel({ machineRun, open, onOpenChange }: MachineRunSidepanelProps) {
  const isMobile = useIsMobile();

  if (!machineRun) return null;

  const status = statusConfig[machineRun.status as keyof typeof statusConfig];

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={isMobile ? "bottom" : "right"}>
      <DrawerContent className={isMobile ? "max-h-[85vh]" : "h-full w-[700px]"}>
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
              <Button size="sm" variant="default" onClick={() => {}} className="bg-blue-600 hover:bg-blue-700">
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
              <TabsTrigger
                value="main"
                className={`${isMobile ? "text-sm" : "text-base"} font-medium data-[state=active]:border-blue-600 data-[state=active]:text-blue-600`}
              >
                Main
              </TabsTrigger>
              <TabsTrigger value="inputs" className={`${isMobile ? "text-sm" : "text-base"} font-medium`}>
                Inputs
              </TabsTrigger>
              <TabsTrigger value="individual-bags" className={`${isMobile ? "text-sm" : "text-base"} font-medium`}>
                Individual Bags
              </TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="space-y-8 px-1">
              <OrderInfoSection machineRun={machineRun} isMobile={isMobile} />
              <CalculationsSection machineRun={machineRun} isMobile={isMobile} />
              <RemarksSection machineRun={machineRun} />
            </TabsContent>

            <TabsContent value="inputs" className="space-y-8 px-1">
              <AdditionalInputsSection machineRun={machineRun} isMobile={isMobile} />
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
