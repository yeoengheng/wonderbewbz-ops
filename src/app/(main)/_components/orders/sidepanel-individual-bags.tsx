import { useEffect, useState } from "react";

import { Calendar, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabase } from "@/hooks/use-supabase";
import type { Database } from "@/types/database";

type MachineRun = Database["public"]["Tables"]["machine_runs"]["Row"];
type IndividualBag = Database["public"]["Tables"]["individual_bags"]["Row"];

interface SidepanelIndividualBagsProps {
  machineRun: MachineRun;
}

export function SidepanelIndividualBags({ machineRun }: SidepanelIndividualBagsProps) {
  const [individualBags, setIndividualBags] = useState<IndividualBag[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchIndividualBags = async () => {
      if (!machineRun.machine_run_id) return;

      try {
        const { data, error } = await supabase
          .from("individual_bags")
          .select("*")
          .eq("machine_run_id", machineRun.machine_run_id)
          .order("bag_number", { ascending: true });

        if (error) {
          console.error("Error fetching individual bags:", error);
          return;
        }

        setIndividualBags(data || []);
      } catch (error) {
        console.error("Error fetching individual bags:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIndividualBags();
  }, [machineRun.machine_run_id, supabase]);

  // Group bags by date
  const bagsByDate = individualBags.reduce(
    (acc, bag) => {
      const date = bag.date_expressed ?? "Unknown Date";
      if (!acc[date]) acc[date] = [];
      acc[date].push(bag);
      return acc;
    },
    {} as Record<string, IndividualBag[]>,
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-card rounded-lg border">
          <div className="bg-muted/50 border-b p-4">
            <h3 className="text-sm font-medium">📦 Individual Bags</h3>
          </div>
          <div className="p-8 text-center">
            <p className="text-muted-foreground text-sm">Loading individual bags...</p>
          </div>
        </div>
      </div>
    );
  }

  if (individualBags.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-card rounded-lg border">
          <div className="bg-muted/50 border-b p-4">
            <h3 className="text-sm font-medium">📦 Individual Bags</h3>
          </div>
          <div className="p-8 text-center">
            <div className="space-y-3">
              <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                <Package className="text-muted-foreground h-8 w-8" />
              </div>
              <h4 className="font-medium">No Individual Bags</h4>
              <p className="text-muted-foreground mx-auto max-w-sm text-sm">
                No individual bags have been recorded for this machine run yet.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg border">
        <div className="bg-muted/50 border-b p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">📦 Individual Bags</h3>
            <Badge variant="outline" className="text-xs">
              {individualBags.length} {individualBags.length === 1 ? "bag" : "bags"}
            </Badge>
          </div>
        </div>
        <div className="space-y-6 p-6">
          {Object.entries(bagsByDate).map(([date, bags]) => (
            <Card key={date} className="p-0">
              <CardHeader className="pt-6 pb-4">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  {date !== "Unknown Date" ? new Date(date).toLocaleDateString() : "Unknown Date"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-6">
                <div className="grid grid-cols-2 gap-2">
                  {bags.map((bag) => (
                    <div key={bag.bag_id} className="flex items-center justify-between rounded-md border p-2">
                      <span className="text-muted-foreground text-xs">Bag {bag.bag_number}</span>
                      <span className="font-mono text-xs">{bag.weight_g}g</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Date Total:</span>
                    <span className="font-mono font-medium">
                      {bags.reduce((sum, bag) => sum + (bag.weight_g ?? 0), 0)}g
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Overall Total */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Weight:</span>
              <span className="font-mono text-sm font-bold">
                {individualBags.reduce((sum, bag) => sum + (bag.weight_g ?? 0), 0)}g
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
