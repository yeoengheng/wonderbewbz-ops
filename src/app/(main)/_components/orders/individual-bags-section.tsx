import { Calendar, Plus, Trash2, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface IndividualBag {
  id: string;
  date: string;
  weight: string;
}

const isWeightOutOfRange = (weight: string): boolean => {
  const weightNum = parseFloat(weight);
  return !isNaN(weightNum) && weightNum > 0 && (weightNum < 30 || weightNum > 400);
};

interface WizardData {
  bags: IndividualBag[];
}

interface IndividualBagsSectionProps {
  data: WizardData;
  addBagToDate: (date: string) => void;
  updateBag: (id: string, field: keyof Omit<IndividualBag, "id">, value: string) => void;
  removeBag: (id: string) => void;
  addDateGroup: () => void;
  updateDateGroupDate: (oldDate: string, newDate: string) => void;
}

export function IndividualBagsSection({
  data,
  addBagToDate,
  updateBag,
  removeBag,
  addDateGroup,
  updateDateGroupDate,
}: IndividualBagsSectionProps) {
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6 lg:col-span-2">
          {/* Date Groups */}
          {Object.entries(bagsByDate)
            .filter(([date]) => date !== "unassigned")
            .map(([date, bags]) => (
              <Card key={date} className="p-0">
                <CardHeader className="pt-8 pb-1">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => updateDateGroupDate(date, e.target.value)}
                      className="w-auto border-0 p-0 text-base font-semibold focus-visible:ring-0"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 pb-8">
                  {/* Bags for this date */}
                  <div className="grid grid-cols-2 gap-3">
                    {bags.map((bag) => {
                      const outOfRange = isWeightOutOfRange(bag.weight);
                      return (
                        <div key={bag.id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <Input
                                type="number"
                                placeholder="0"
                                value={bag.weight}
                                onChange={(e) => updateBag(bag.id, "weight", e.target.value)}
                                className={`pr-6 ${outOfRange ? "border-yellow-500" : ""}`}
                              />
                              <span className="text-muted-foreground absolute top-1/2 right-2 -translate-y-1/2 text-sm">
                                g
                              </span>
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
                          {outOfRange && (
                            <div className="flex items-center gap-1 text-xs text-yellow-600">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Are you sure? (Expected: 30-400g)</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Bag button for this date */}
                  <div className="pt-2">
                    <Button variant="outline" size="sm" onClick={() => addBagToDate(date)} className="w-full">
                      <Plus className="mr-2 h-4 w-4" /> Bag
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
    </div>
  );
}
