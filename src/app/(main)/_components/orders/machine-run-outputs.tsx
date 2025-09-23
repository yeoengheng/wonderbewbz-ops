import { Calculator, Beaker } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  getTotalBagsWeight,
  getTotalWetWeight,
  getWaterRemoved,
  getPackingTotal,
  getPackedPowderWeight,
  getWaterContentPercentage,
  getPowerToPackPerMl,
  getPowderPerUnit,
  getWaterToAddPerUnit,
  getGramRatioPackingTotal,
  getGramRatioPackedPowderWeight,
  getGramRatioWaterToAdd,
} from "./machine-run-calculations";

interface WizardData {
  bags: Array<{ weight: string }>;
  bagsWeight: string;
  powderWeight: string;
  waterToAdd: string;
  gramRatioStaffInput: string;
}

interface MachineRunOutputsProps {
  data: WizardData;
}

export function MachineRunOutputs({ data }: MachineRunOutputsProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Outputs</h4>

      {/* Run Calculations Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="h-4 w-4" />
            Run Calculations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total weight of all bags:</span>
            <span className="font-mono">{getTotalBagsWeight(data)} g</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total wet weight:</span>
            <span className="font-mono">{getTotalWetWeight(data)} g</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Water removed:</span>
            <span className="font-mono">{getWaterRemoved(data)} g</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Packing total:</span>
            <span className="font-mono">{getPackingTotal(data)} ml</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Packed powder weight:</span>
            <span className="font-mono">{getPackedPowderWeight(data)} g</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Breastmilk water content:</span>
            <span className="font-mono">{getWaterContentPercentage(data)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Power to pack per ml:</span>
            <span className="font-mono">{getPowerToPackPerMl(data)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Powder per unit:</span>
            <span className="font-mono">{getPowderPerUnit(data)} g</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Water to add per unit:</span>
            <span className="font-mono">{getWaterToAddPerUnit(data)} g</span>
          </div>
        </CardContent>
      </Card>

      {/* Gram Ratio Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Beaker className="h-4 w-4" />
            Gram Ratio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Packing total:</span>
            <span className="font-mono">{getGramRatioPackingTotal(data)} ml</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Packed powder weight:</span>
            <span className="font-mono">{getGramRatioPackedPowderWeight(data)} g</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Water to add (ml) label:</span>
            <span className="font-mono">{getGramRatioWaterToAdd(data)} ml</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
