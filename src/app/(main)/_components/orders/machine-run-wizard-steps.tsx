"use client";

import { Calendar, Plus, Trash2, Beaker } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  // Step 2: Individual Bags
  bags: IndividualBag[];

  // Step 3: Calculation Inputs
  bagsWeight: string;
  powderWeight: string;
  packingRequirements: string;
  waterToAdd: string;
  waterActivityLevel: string;
  gramRatioStaffInput: string;
  dateProcessed: string;
  datePacked: string;
}

export function Step1({ data, updateData }: { data: WizardData; updateData: (updates: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="mb-2 text-lg font-semibold">Info</h3>
        <p className="text-muted-foreground text-sm">Enter basic information for this machine run</p>
      </div>

      <div className="mx-auto max-w-md space-y-4">
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
          <Label htmlFor="date-expressed">Date Expressed</Label>
          <Input
            id="date-expressed"
            type="date"
            value={data.dateExpressed}
            onChange={(e) => updateData({ dateExpressed: e.target.value })}
          />
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
  // Group bags by date
  const bagsByDate = data.bags.reduce(
    (acc, bag) => {
      const date = bag.date || "unassigned";
      if (!acc[date]) acc[date] = [];
      acc[date].push(bag);
      return acc;
    },
    {} as Record<string, IndividualBag[]>,
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="mb-2 text-lg font-semibold">Individual Bags</h3>
        <p className="text-muted-foreground text-sm">Group bags by date and add weights for each bag</p>
      </div>

      <div className="space-y-6">
        {/* Date Groups */}
        {Object.entries(bagsByDate)
          .filter(([date]) => date !== "unassigned")
          .map(([date, bags]) => (
            <div key={date} className="space-y-3">
              {/* Date Header */}
              <div className="flex items-center gap-2">
                <Calendar className="text-muted-foreground h-4 w-4" />
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => updateDateGroupDate(date, e.target.value)}
                  className="w-auto"
                />
              </div>

              {/* Bags for this date */}
              <div className="grid grid-cols-2 gap-2">
                {bags.map((bag) => (
                  <div key={bag.id} className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="5g"
                      value={bag.weight}
                      onChange={(e) => updateBag(bag.id, "weight", e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeBag(bag.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add Bag button for this date */}
              <Button variant="outline" size="sm" onClick={() => addBagToDate(date)} className="w-full">
                <Plus className="mr-2 h-4 w-4" />+ Bag
              </Button>
            </div>
          ))}

        {/* Add Date Group button */}
        <Button variant="outline" onClick={addDateGroup} className="w-full">
          Add Date
        </Button>

        {/* Empty state */}
        {data.bags.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-4">No date groups added yet</p>
            <Button onClick={addDateGroup}>
              <Plus className="mr-2 h-4 w-4" />
              Add Date
            </Button>
          </div>
        )}
      </div>
    </div>
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
              <Label htmlFor="water-to-add">Water to Add (ml)</Label>
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

        {/* Outputs */}
        <div className="space-y-4">
          <h4 className="font-medium">Outputs</h4>
          <div className="bg-muted/50 min-h-[200px] rounded-lg p-4">
            <p className="text-muted-foreground mt-8 text-center text-sm">
              Calculated outputs will appear here based on your inputs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
