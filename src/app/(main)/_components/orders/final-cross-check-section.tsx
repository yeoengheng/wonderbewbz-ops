"use client";

import { Plus, X, CheckCircle2, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CrossCheck {
  id: string;
  powderWeight: string;
  quantity: string;
}

interface WizardData {
  crossChecks: CrossCheck[];
  powderWeight: string;
}

interface FinalCrossCheckSectionProps {
  data: WizardData;
  addCrossCheck: () => void;
  updateCrossCheck: (id: string, field: keyof Omit<CrossCheck, "id">, value: string) => void;
  removeCrossCheck: (id: string) => void;
  onNavigateToStep?: (step: number) => void;
}

export function FinalCrossCheckSection({
  data,
  addCrossCheck,
  updateCrossCheck,
  removeCrossCheck,
  onNavigateToStep,
}: FinalCrossCheckSectionProps) {
  // Calculate per-row totals
  const calculateRowTotal = (check: CrossCheck): number => {
    const weight = parseFloat(check.powderWeight) || 0;
    const qty = parseFloat(check.quantity) || 0;
    return weight * qty;
  };

  // Calculate combined total
  const calculateCombinedTotal = (): number => {
    return data.crossChecks.reduce((sum, check) => sum + calculateRowTotal(check), 0);
  };

  // Tolerance validation (±5%)
  const validateTolerance = (): { isValid: boolean; variance: number } => {
    const expectedWeight = parseFloat(data.powderWeight) || 0;
    const combinedTotal = calculateCombinedTotal();

    if (expectedWeight === 0) {
      return { isValid: true, variance: 0 };
    }

    const variance = ((combinedTotal - expectedWeight) / expectedWeight) * 100;
    const isValid = Math.abs(variance) <= 5;

    return { isValid, variance };
  };

  const { isValid, variance } = validateTolerance();
  const combinedTotal = calculateCombinedTotal();
  const expectedWeight = parseFloat(data.powderWeight) || 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="mb-2 text-lg font-semibold">Final Cross Check</h3>
        <p className="text-muted-foreground text-sm">Verify powder weight distribution across packages</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Side */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Input</h4>
            <Button type="button" size="sm" onClick={addCrossCheck}>
              <Plus className="mr-2 h-4 w-4" />
              Add Row
            </Button>
          </div>

          <div className="space-y-3">
            {data.crossChecks.length === 0 ? (
              <div className="text-muted-foreground rounded-lg border-2 border-dashed p-8 text-center text-sm">
                No entries yet. Click &quot;Add Row&quot; to start.
              </div>
            ) : (
              data.crossChecks.map((check, index) => (
                <div key={check.id} className="flex items-end gap-2 rounded-lg border p-3">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`powder-${check.id}`} className="text-xs">
                      Row {index + 1}: Powder Weight (g)
                    </Label>
                    <Input
                      id={`powder-${check.id}`}
                      type="number"
                      placeholder="0"
                      value={check.powderWeight}
                      onChange={(e) => updateCrossCheck(check.id, "powderWeight", e.target.value)}
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`quantity-${check.id}`} className="text-xs">
                      Quantity
                    </Label>
                    <Input
                      id={`quantity-${check.id}`}
                      type="number"
                      placeholder="0"
                      value={check.quantity}
                      onChange={(e) => updateCrossCheck(check.id, "quantity", e.target.value)}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCrossCheck(check.id)}
                    className="mb-0.5"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Output Side */}
        <div className="space-y-4">
          <h4 className="font-medium">Output</h4>

          {data.crossChecks.length > 0 ? (
            <Card>
              <CardContent className="space-y-3 pt-6 text-sm">
                {/* Per-row totals */}
                {data.crossChecks.map((check, index) => (
                  <div key={check.id} className="flex items-center justify-between">
                    <span className="text-muted-foreground">Row {index + 1} Total</span>
                    <span className="font-mono font-medium">{calculateRowTotal(check).toFixed(2)} g</span>
                  </div>
                ))}

                {/* Combined Total */}
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Combined Total</span>
                    <span className="font-mono">{combinedTotal.toFixed(2)} g</span>
                  </div>
                </div>

                {/* Expected vs Actual Comparison */}
                <div className="space-y-2 border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Expected</span>
                    <span className="font-mono">{expectedWeight.toFixed(2)} g</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Actual</span>
                    <span className="font-mono">{combinedTotal.toFixed(2)} g</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Difference</span>
                    <span className="font-mono">
                      {(combinedTotal - expectedWeight).toFixed(2)} g ({variance.toFixed(2)}%)
                    </span>
                  </div>

                  {/* Validation Result */}
                  {expectedWeight > 0 && (
                    <div className="mt-3 border-t pt-3">
                      {isValid ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="h-5 w-5" />
                          <div>
                            <div className="font-medium">Match</div>
                            <div className="text-xs">Within ±5% tolerance</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-600">
                          <AlertTriangle className="h-5 w-5" />
                          <div>
                            <div className="font-medium">Warning: Outside Tolerance</div>
                            <div className="text-xs">Exceeds ±5% tolerance</div>
                            <div className="mt-1 text-xs">
                              Consider adding{" "}
                              <button
                                type="button"
                                onClick={() => onNavigateToStep?.(1)}
                                className="text-amber-700 underline hover:text-amber-800"
                              >
                                remarks
                              </button>{" "}
                              to document this discrepancy.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-muted-foreground text-center text-sm">
                  Add cross check entries to see calculations
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
