"use client";

import { useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSupabase } from "@/hooks/use-supabase";
import type { Database } from "@/types/database";

import { Step1, Step2, Step3 } from "./machine-run-wizard-steps";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"];
type OrderWithCustomer = Order & { customer: Customer; machine_runs?: any[] };

interface MachineRunWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderWithCustomer;
  onComplete: () => void;
}

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

const initialData: WizardData = {
  mamaName: "",
  mamaNric: "",
  dateExpressed: "",
  bags: [],
  bagsWeight: "",
  powderWeight: "",
  packingRequirements: "",
  waterToAdd: "",
  waterActivityLevel: "",
  gramRatioStaffInput: "",
  dateProcessed: "",
  datePacked: "",
};

export function MachineRunWizard({ open, onOpenChange, order, onComplete }: MachineRunWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<WizardData>(initialData);
  const [loading, setLoading] = useState(false);
  const [bagCounter, setBagCounter] = useState(0);
  const { supabase, isLoaded } = useSupabase();

  const steps = [
    { number: 1, title: "Info" },
    { number: 2, title: "Individual Bags" },
    { number: 3, title: "Calculation Inputs" },
  ];

  const updateData = (updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const addBag = () => {
    const nextCounter = bagCounter + 1;
    setBagCounter(nextCounter);
    const newBag: IndividualBag = {
      id: `bag-${nextCounter}`,
      date: "",
      weight: "",
    };
    updateData({ bags: [...data.bags, newBag] });
  };

  const updateBag = (id: string, field: keyof Omit<IndividualBag, "id">, value: string) => {
    const updatedBags = data.bags.map((bag) => (bag.id === id ? { ...bag, [field]: value } : bag));
    updateData({ bags: updatedBags });
  };

  const removeBag = (id: string) => {
    updateData({ bags: data.bags.filter((bag) => bag.id !== id) });
  };

  const addDateGroup = () => {
    addBag();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.mamaName.trim() && data.mamaNric.trim() && data.dateExpressed;
      case 2:
        return data.bags.length > 0 && data.bags.every((bag) => bag.date && bag.weight);
      case 3:
        return true; // All fields are optional in step 3
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getNextRunNumber = async () => {
    const { data: existingRuns, error } = await supabase
      .from("machine_runs")
      .select("run_number")
      .eq("order_id", order.order_id)
      .order("run_number", { ascending: false })
      .limit(1);

    if (error) throw error;
    return existingRuns && existingRuns.length > 0 ? (existingRuns[0] as any).run_number + 1 : 1;
  };

  const createMachineRun = async (runNumber: number) => {
    const { data: machineRun, error } = await supabase
      .from("machine_runs")
      .insert({
        order_id: order.order_id,
        run_number: runNumber,
        status: "pending",
        mama_name: data.mamaName,
        mama_nric: data.mamaNric,
        date_received: data.dateExpressed,
        date_processed: data.dateProcessed ?? null,
        date_packed: data.datePacked ?? null,
        bags_weight_g: data.bagsWeight ? parseFloat(data.bagsWeight) : null,
        powder_weight_g: data.powderWeight ? parseFloat(data.powderWeight) : null,
        packing_requirements_ml: data.packingRequirements ? parseFloat(data.packingRequirements) : null,
        label_water_to_add_ml: data.waterToAdd ? parseFloat(data.waterToAdd) : null,
        water_activity_level: data.waterActivityLevel ? parseFloat(data.waterActivityLevel) : null,
        gram_ratio_staff_input_ml: data.gramRatioStaffInput ? parseFloat(data.gramRatioStaffInput) : null,
        user_id: order.user_id,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return machineRun;
  };

  const createIndividualBags = async (machineRunId: string) => {
    if (data.bags.length === 0) return;

    const bagInserts = data.bags.map((bag) => ({
      machine_run_id: machineRunId,
      date_expressed: bag.date,
      weight_g: parseFloat(bag.weight),
      user_id: order.user_id,
    }));

    const { error } = await supabase.from("individual_bags").insert(bagInserts as any);
    if (error) throw error;
  };

  const handleSave = async () => {
    if (!isLoaded || !order) return;

    setLoading(true);
    try {
      const runNumber = await getNextRunNumber();
      const machineRun = await createMachineRun(runNumber);
      await createIndividualBags((machineRun as any).machine_run_id);

      setData(initialData);
      setCurrentStep(1);
      setBagCounter(0);
      onComplete();
    } catch (error) {
      console.error("Error saving machine run:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setData(initialData);
    setCurrentStep(1);
    setBagCounter(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Machine Run</DialogTitle>
            <div className="flex gap-2">
              {currentStep < 3 ? (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              )}
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-8 py-4">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step.number === currentStep
                    ? "bg-blue-600 text-white"
                    : step.number < currentStep
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-200 text-gray-400"
                }`}
              >
                {step.number}
              </div>
              <span
                className={`mt-1 text-sm ${
                  step.number === currentStep ? "font-medium text-blue-600" : "text-gray-500"
                }`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="py-6">
          {currentStep === 1 && <Step1 data={data} updateData={updateData} />}
          {currentStep === 2 && (
            <Step2
              data={data}
              addBag={addBag}
              updateBag={updateBag}
              removeBag={removeBag}
              addDateGroup={addDateGroup}
            />
          )}
          {currentStep === 3 && <Step3 data={data} updateData={updateData} />}
        </div>

        {/* Navigation */}
        <div className="flex justify-between border-t pt-4">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <div className="flex gap-2">
            {currentStep < 3 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
