/* eslint-disable max-lines, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-condition */
"use client";

import { useState, useEffect, useCallback } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSupabase } from "@/hooks/use-supabase";
import type { Database } from "@/types/database";

import { Step1, Step2, Step3 } from "./machine-run-wizard-steps";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"];
type MachineRun = Database["public"]["Tables"]["machine_runs"]["Row"];
type OrderWithCustomer = Order & { customer: Customer; machine_runs?: MachineRun[] };

interface MachineRunWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderWithCustomer;
  onComplete: () => void;
  editingMachineRun?: MachineRun | null;
}

interface IndividualBag {
  id: string;
  date: string;
  weight: string;
}

const individualBagSchema = z.object({
  id: z.string(),
  date: z.string().min(1, "Date is required"),
  weight: z
    .string()
    .min(1, "Weight is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Weight must be a positive number"),
});

const machineRunSchema = z.object({
  // Step 1: Info
  mamaName: z.string().min(1, "Mama's name is required"),
  mamaNric: z.string().min(1, "Mama's NRIC is required"),
  dateExpressed: z.string().min(1, "Date expressed is required"),
  runNumber: z.string(),
  machineRun: z.string(),
  status: z.string(),
  dateProcessed: z.string(),
  datePacked: z.string(),

  // Step 2: Individual Bags
  bags: z.array(individualBagSchema).min(1, "At least one bag is required"),

  // Step 3: Calculation Inputs (all optional)
  bagsWeight: z.string(),
  powderWeight: z.string(),
  packingRequirements: z.string(),
  waterToAdd: z.string(),
  waterActivityLevel: z.string(),
  gramRatioStaffInput: z.string(),
});

type WizardData = z.infer<typeof machineRunSchema>;

const initialData: WizardData = {
  mamaName: "",
  mamaNric: "",
  dateExpressed: "",
  runNumber: "",
  machineRun: "",
  status: "pending",
  dateProcessed: "",
  datePacked: "",
  bags: [],
  bagsWeight: "",
  powderWeight: "",
  packingRequirements: "",
  waterToAdd: "",
  waterActivityLevel: "",
  gramRatioStaffInput: "",
};

export function MachineRunWizard({ open, onOpenChange, order, onComplete, editingMachineRun }: MachineRunWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bagCounter, setBagCounter] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const { supabase, isLoaded } = useSupabase();

  const form = useForm<WizardData>({
    resolver: zodResolver(machineRunSchema),
    defaultValues: initialData,
  });

  const steps = [
    { number: 1, title: "Info" },
    { number: 2, title: "Individual Bags" },
    { number: 3, title: "Calculation Inputs" },
  ];

  const data = form.watch();

  const getBasicInfo = (mr: MachineRun) => ({
    mamaName: mr.mama_name ?? "",
    mamaNric: mr.mama_nric ?? "",
    dateExpressed: mr.date_received ?? "",
    runNumber: mr.run_number?.toString() ?? "",
    machineRun: "", // This will be used for the new Machine field
    status: mr.status ?? "pending",
    dateProcessed: mr.date_processed ?? "",
    datePacked: mr.date_packed ?? "",
  });

  const getWeightData = (mr: MachineRun) => ({
    bagsWeight: mr.bags_weight_g?.toString() ?? "",
    powderWeight: mr.powder_weight_g?.toString() ?? "",
    packingRequirements: mr.packing_requirements_ml?.toString() ?? "",
  });

  const getWaterData = (mr: MachineRun) => ({
    waterToAdd: mr.label_water_to_add_ml?.toString() ?? "",
    waterActivityLevel: mr.water_activity_level?.toString() ?? "",
    gramRatioStaffInput: mr.gram_ratio_staff_input_ml?.toString() ?? "",
  });

  const mapMachineRunToFormData = useCallback(
    (machineRun: MachineRun): Partial<WizardData> => ({
      ...getBasicInfo(machineRun),
      ...getWeightData(machineRun),
      ...getWaterData(machineRun),
    }),
    [],
  );

  const setFormFields = useCallback(
    (data: Partial<WizardData>) => {
      Object.entries(data).forEach(([key, value]) => {
        form.setValue(key as keyof WizardData, value);
      });
    },
    [form],
  );

  const loadIndividualBags = useCallback(
    async (machineRunId: string) => {
      try {
        const { data: bags, error } = await supabase
          .from("individual_bags")
          .select("*")
          .eq("machine_run_id", machineRunId);

        if (error) {
          console.error("Error loading individual bags:", error);
          return;
        }

        const formattedBags: IndividualBag[] =
          (bags as any)?.map((bag: any, index: number) => ({
            id: `bag-${index + 1}`,
            date: bag.date_expressed ?? "",
            weight: bag.weight_g?.toString() ?? "",
          })) ?? [];

        form.setValue("bags", formattedBags);
        setBagCounter(formattedBags.length);
      } catch (error) {
        console.error("Error loading individual bags:", error);
      }
    },
    [supabase, form],
  );

  const populateFormFields = useCallback(
    (machineRun: MachineRun) => {
      const editData = mapMachineRunToFormData(machineRun);
      setFormFields(editData);
    },
    [mapMachineRunToFormData, setFormFields],
  );

  // Pre-populate form when editing
  useEffect(() => {
    const handleDialogOpen = async () => {
      if (open && isLoaded && !initialized) {
        setCurrentStep(1);
        setInitialized(true);

        if (editingMachineRun) {
          populateFormFields(editingMachineRun);
          await loadIndividualBags(editingMachineRun.machine_run_id);
        } else {
          form.reset(initialData);
          setBagCounter(0);
        }
      } else if (!open && initialized) {
        // Reset initialized state when dialog closes
        setInitialized(false);
      }
    };

    handleDialogOpen();
  }, [open, isLoaded, initialized, editingMachineRun?.machine_run_id]); // Only depend on stable values

  const updateData = (updates: Partial<WizardData>) => {
    Object.entries(updates).forEach(([key, value]) => {
      form.setValue(key as keyof WizardData, value);
    });
  };

  const addBagToDate = (date: string) => {
    const nextCounter = bagCounter + 1;
    setBagCounter(nextCounter);
    const newBag: IndividualBag = {
      id: `bag-${nextCounter}`,
      date: date,
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

  const updateDateGroupDate = (oldDate: string, newDate: string) => {
    const updatedBags = data.bags.map((bag) => (bag.date === oldDate ? { ...bag, date: newDate } : bag));
    updateData({ bags: updatedBags });
  };

  const addDateGroup = () => {
    const today = new Date().toISOString().split("T")[0];
    // Find a unique date that doesn't already exist
    let newDate = today;
    let counter = 1;
    while (data.bags.some((bag) => bag.date === newDate)) {
      const date = new Date(today);
      date.setDate(date.getDate() + counter);
      newDate = date.toISOString().split("T")[0];
      counter++;
    }
    // Add first bag to the new date group (a date group needs at least one bag)
    addBagToDate(newDate);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.mamaName.trim() && data.mamaNric.trim();
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
    return existingRuns && existingRuns.length > 0 ? (existingRuns[0] as { run_number: number }).run_number + 1 : 1;
  };

  const createMachineRun = async (runNumber: number) => {
    const insertData = {
      order_id: order.order_id,
      run_number: runNumber,
      status: data.status as "pending" | "processing" | "completed" | "qa_failed" | "cancelled",
      mama_name: data.mamaName,
      mama_nric: data.mamaNric,
      date_received: data.dateExpressed,
      date_processed: data.dateProcessed || undefined,
      date_packed: data.datePacked || undefined,
      bags_weight_g: data.bagsWeight ? parseFloat(data.bagsWeight) : undefined,
      powder_weight_g: data.powderWeight ? parseFloat(data.powderWeight) : undefined,
      packing_requirements_ml: data.packingRequirements ? parseFloat(data.packingRequirements) : undefined,
      label_water_to_add_ml: data.waterToAdd ? parseFloat(data.waterToAdd) : undefined,
      water_activity_level: data.waterActivityLevel ? parseFloat(data.waterActivityLevel) : undefined,
      gram_ratio_staff_input_ml: data.gramRatioStaffInput ? parseFloat(data.gramRatioStaffInput) : undefined,
      user_id: order.user_id,
    };

    const { data: machineRun, error } = await supabase
      .from("machine_runs")
      // @ts-expect-error: Supabase RLS policy causing type inference issue
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return machineRun as MachineRun;
  };

  const updateMachineRun = async (machineRunId: string) => {
    const updateData = {
      status: data.status as "pending" | "processing" | "completed" | "qa_failed" | "cancelled",
      mama_name: data.mamaName,
      mama_nric: data.mamaNric,
      date_received: data.dateExpressed,
      date_processed: data.dateProcessed || undefined,
      date_packed: data.datePacked || undefined,
      bags_weight_g: data.bagsWeight ? parseFloat(data.bagsWeight) : undefined,
      powder_weight_g: data.powderWeight ? parseFloat(data.powderWeight) : undefined,
      packing_requirements_ml: data.packingRequirements ? parseFloat(data.packingRequirements) : undefined,
      label_water_to_add_ml: data.waterToAdd ? parseFloat(data.waterToAdd) : undefined,
      water_activity_level: data.waterActivityLevel ? parseFloat(data.waterActivityLevel) : undefined,
      gram_ratio_staff_input_ml: data.gramRatioStaffInput ? parseFloat(data.gramRatioStaffInput) : undefined,
      updated_at: new Date().toISOString(),
    };

    const { data: machineRun, error } = await supabase
      .from("machine_runs")
      // @ts-expect-error: Supabase RLS policy causing type inference issue
      .update(updateData)
      .eq("machine_run_id", machineRunId)
      .select()
      .single();

    if (error) throw error;
    return machineRun as MachineRun;
  };

  const createIndividualBags = async (machineRunId: string) => {
    if (data.bags.length === 0) return;

    const bagInserts = data.bags.map((bag, index) => ({
      machine_run_id: machineRunId,
      bag_number: index + 1,
      date_expressed: bag.date,
      weight_g: parseFloat(bag.weight),
      user_id: order.user_id,
    }));

    // @ts-expect-error: Supabase RLS policy causing type inference issue
    const { error } = await supabase.from("individual_bags").insert(bagInserts);
    if (error) throw error;
  };

  const updateIndividualBags = async (machineRunId: string) => {
    // Delete existing bags
    await supabase.from("individual_bags").delete().eq("machine_run_id", machineRunId);

    // Insert new bags
    if (data.bags.length > 0) {
      await createIndividualBags(machineRunId);
    }
  };

  const handleSave = async () => {
    if (!isLoaded || !order) return;

    setLoading(true);
    try {
      if (editingMachineRun) {
        await updateMachineRun(editingMachineRun.machine_run_id);
        await updateIndividualBags(editingMachineRun.machine_run_id);
      } else {
        const runNumber = await getNextRunNumber();
        const machineRun = await createMachineRun(runNumber);
        await createIndividualBags(machineRun.machine_run_id);
      }

      form.reset(initialData);
      setCurrentStep(1);
      setBagCounter(0);
      setInitialized(false);
      onComplete();
    } catch (error) {
      console.error("Error saving machine run:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset(initialData);
    setCurrentStep(1);
    setBagCounter(0);
    setInitialized(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-2xl md:max-w-4xl lg:max-w-6xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {editingMachineRun ? "Edit Machine Run" : "Create Machine Run"}
            </DialogTitle>
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
                className={`flex h-8 w-8 items-center justify-center rounded-full text-center text-sm font-medium ${
                  step.number === currentStep
                    ? "bg-secondary text-secondary-foreground"
                    : step.number < currentStep
                      ? "bg-secondary/20 text-secondary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step.number}
              </div>
              <span
                className={`mt-1 text-sm ${
                  step.number === currentStep ? "text-muted-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="py-6">
          <div className="mx-auto w-full max-w-4xl">
            {currentStep === 1 && <Step1 data={data} updateData={updateData} />}
            {currentStep === 2 && (
              <Step2
                data={data}
                addBagToDate={addBagToDate}
                updateBag={updateBag}
                removeBag={removeBag}
                addDateGroup={addDateGroup}
                updateDateGroupDate={updateDateGroupDate}
              />
            )}
            {currentStep === 3 && <Step3 data={data} updateData={updateData} />}
          </div>
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
