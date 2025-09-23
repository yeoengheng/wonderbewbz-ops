"use client";

import { Beaker } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { IndividualBagsSection } from "./individual-bags-section";
import { MachineRunOutputs } from "./machine-run-outputs";

interface IndividualBag {
  id: string;
  date: string;
  weight: string;
}

interface WizardData {
  // Step 1: Info
  mamaName: string;
  mamaNric: string;
  dateExpressed: string;
  machineRun: string;
  dateProcessed: string;
  datePacked: string;

  // Step 2: Individual Bags
  bags: IndividualBag[];

  // Step 3: Calculation Inputs
  bagsWeight: string;
  powderWeight: string;
  packingRequirements: string;
  waterToAdd: string;
  waterActivityLevel: string;
  gramRatioStaffInput: string;
}

export function Step1({ data, updateData }: { data: WizardData; updateData: (updates: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="mb-2 text-lg font-semibold">Info</h3>
        <p className="text-muted-foreground text-sm">Enter basic information for this machine run</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="mx-auto w-full max-w-md space-y-4">
          <div className="space-y-2">
            <Label htmlFor="machine-run">Machine Run</Label>
            <Input
              id="machine-run"
              placeholder="Enter machine run"
              value={data.machineRun}
              onChange={(e) => updateData({ machineRun: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mama-name">Mama&apos;s Name</Label>
            <Input
              id="mama-name"
              placeholder="Enter mama's name"
              value={data.mamaName}
              onChange={(e) => updateData({ mamaName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mama-nric">Mama&apos;s NRIC</Label>
            <Input
              id="mama-nric"
              placeholder="Enter NRIC"
              value={data.mamaNric}
              onChange={(e) => updateData({ mamaNric: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date-expressed">Date Received</Label>
            <Input
              id="date-expressed"
              type="date"
              value={data.dateExpressed}
              onChange={(e) => updateData({ dateExpressed: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date-processed">Date Processed</Label>
            <Input
              id="date-processed"
              type="date"
              value={data.dateProcessed}
              onChange={(e) => updateData({ dateProcessed: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date-packed">Date Packed</Label>
            <Input
              id="date-packed"
              type="date"
              value={data.datePacked}
              onChange={(e) => updateData({ datePacked: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Step2({
  data,
  addBagToDate,
  updateBag,
  removeBag,
  addDateGroup,
  updateDateGroupDate,
}: {
  data: WizardData;
  addBagToDate: (date: string) => void;
  updateBag: (id: string, field: keyof Omit<IndividualBag, "id">, value: string) => void;
  removeBag: (id: string) => void;
  addDateGroup: () => void;
  updateDateGroupDate: (oldDate: string, newDate: string) => void;
}) {
  return (
    <IndividualBagsSection
      data={data}
      addBagToDate={addBagToDate}
      updateBag={updateBag}
      removeBag={removeBag}
      addDateGroup={addDateGroup}
      updateDateGroupDate={updateDateGroupDate}
    />
  );
}

export function Step3({ data, updateData }: { data: WizardData; updateData: (updates: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="mb-2 text-lg font-semibold">Calculation Inputs</h3>
        <p className="text-muted-foreground text-sm">Enter processing calculations and measurements</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Calculation Inputs */}
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 font-medium">
            <Beaker className="h-4 w-4" />
            Calculation Inputs
          </h4>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bags-weight">Bags Weight (g)</Label>
              <Input
                id="bags-weight"
                type="number"
                placeholder="0"
                value={data.bagsWeight}
                onChange={(e) => updateData({ bagsWeight: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="powder-weight">Powder Weight (g)</Label>
              <Input
                id="powder-weight"
                type="number"
                placeholder="0"
                value={data.powderWeight}
                onChange={(e) => updateData({ powderWeight: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="packing-requirements">Packing Requirements (ml)</Label>
              <Input
                id="packing-requirements"
                type="number"
                placeholder="0"
                value={data.packingRequirements}
                onChange={(e) => updateData({ packingRequirements: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="water-to-add">Label: Water to Add (ml)</Label>
              <Input
                id="water-to-add"
                type="number"
                placeholder="0"
                value={data.waterToAdd}
                onChange={(e) => updateData({ waterToAdd: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="water-activity">Water Activity Level</Label>
              <Input
                id="water-activity"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={data.waterActivityLevel}
                onChange={(e) => updateData({ waterActivityLevel: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gram-ratio">Gram Ratio Staff Input (ml)</Label>
              <Input
                id="gram-ratio"
                type="number"
                placeholder="0"
                value={data.gramRatioStaffInput}
                onChange={(e) => updateData({ gramRatioStaffInput: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Outputs */}
        <MachineRunOutputs data={data} />
      </div>
    </div>
  );
}
