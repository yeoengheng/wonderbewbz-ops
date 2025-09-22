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
  addBag,
  updateBag,
  removeBag,
  addDateGroup,
}: {
  data: WizardData;
  addBag: () => void;
  updateBag: (id: string, field: keyof Omit<IndividualBag, "id">, value: string) => void;
  removeBag: (id: string) => void;
  addDateGroup: () => void;
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
        <p className="text-muted-foreground text-sm">Track individual bags with dates and weights</p>
      </div>

      <div className="space-y-6">
        {Object.entries(bagsByDate).map(([date, bags]) => (
          <div key={date} className="space-y-3">
            {date !== "unassigned" && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                {date}
              </div>
            )}

            <div className="space-y-2">
              {bags.map((bag) => (
                <div key={bag.id} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`date-${bag.id}`}>Date</Label>
                    <Input
                      id={`date-${bag.id}`}
                      type="date"
                      value={bag.date}
                      onChange={(e) => updateBag(bag.id, "date", e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`weight-${bag.id}`}>Weight (g)</Label>
                    <Input
                      id={`weight-${bag.id}`}
                      type="number"
                      placeholder="5g"
                      value={bag.weight}
                      onChange={(e) => updateBag(bag.id, "weight", e.target.value)}
                    />
                  </div>
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

            {date !== "unassigned" && (
              <Button variant="outline" size="sm" onClick={addBag} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Bag
              </Button>
            )}
          </div>
        ))}

        {data.bags.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-4">No bags added yet</p>
            <Button onClick={addBag}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Bag
            </Button>
          </div>
        )}

        {data.bags.length > 0 && (
          <div className="border-t pt-4">
            <Button variant="outline" onClick={addDateGroup} className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Add Date Group
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
