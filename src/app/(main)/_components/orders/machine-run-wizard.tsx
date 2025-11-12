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

interface CrossCheck {
  id: string;
  powderWeight: string;
  quantity: string;
}

const individualBagSchema = z.object({
  id: z.string(),
  date: z.string().min(1, "Date is required"),
  weight: z
    .string()
    .min(1, "Weight is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Weight must be a positive number"),
});

const crossCheckSchema = z.object({
  id: z.string(),
  powderWeight: z.string().min(1, "Powder weight is required"),
  quantity: z.string().min(1, "Quantity is required"),
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
  remarks: z.string(),
  handledBy: z.string(),
  verifiedBy: z.string(),

  // Step 2: Individual Bags
  bags: z.array(individualBagSchema).min(1, "At least one bag is required"),

  // Step 3: Calculation Inputs (all optional)
  bagsWeight: z.string(),
  powderWeight: z.string(),
  packingRequirements: z.string(),
  waterToAdd: z.string(),
  waterActivityLevel: z.string(),
  gramRatioStaffInput: z.string(),

  // Step 3: Cross Checks
  crossChecks: z.array(crossCheckSchema),
});

type WizardData = z.infer<typeof machineRunSchema>;

const initialData: WizardData = {
  mamaName: "",
  mamaNric: "",
  dateExpressed: "",
  runNumber: "",
  machineRun: "",
  status: "milk_arrived",
  dateProcessed: "",
  datePacked: "",
  remarks: "",
  handledBy: "",
  verifiedBy: "",
  bags: [],
  bagsWeight: "",
  powderWeight: "",
  packingRequirements: "",
  waterToAdd: "",
  waterActivityLevel: "",
  gramRatioStaffInput: "",
  crossChecks: [],
};

// eslint-disable-next-line complexity
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

  // eslint-disable-next-line complexity
  const getBasicInfo = (mr: MachineRun) => ({
    mamaName: mr.mama_name ?? "",
    mamaNric: mr.mama_nric ?? "",
    dateExpressed: mr.date_received ?? "",
    runNumber: mr.run_number?.toString() ?? "",
    machineRun: mr.machine_run ?? "",
    status: mr.status ?? "milk_arrived",
    dateProcessed: mr.date_processed ?? "",
    datePacked: mr.date_packed ?? "",
    remarks: mr.remarks ?? "",
    handledBy: mr.handled_by ?? "",
    verifiedBy: mr.verified_by ?? "",
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

  const loadCrossChecks = useCallback(
    async (machineRunId: string) => {
      try {
        const { data: checks, error } = await supabase
          .from("cross_checks")
          .select("*")
          .eq("machine_run_id", machineRunId);

        if (error) {
          console.error("Error loading cross checks:", error);
          return;
        }

        const formattedChecks: CrossCheck[] =
          (checks as any)?.map((check: any, index: number) => ({
            id: `check-${index + 1}`,
            powderWeight: check.powder_weight_g?.toString() ?? "",
            quantity: check.quantity?.toString() ?? "",
          })) ?? [];

        form.setValue("crossChecks", formattedChecks);
        setCrossCheckCounter(formattedChecks.length);
      } catch (error) {
        console.error("Error loading cross checks:", error);
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
          await loadCrossChecks(editingMachineRun.machine_run_id);
        } else {
          form.reset(initialData);
          setBagCounter(0);
          setCrossCheckCounter(0);
        }
      } else if (!open && initialized) {
        // Reset initialized state when dialog closes
        setInitialized(false);
      }
    };

    handleDialogOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    let newDate: string;

    if (data.bags.length === 0) {
      // If no bags exist, use today's date
      newDate = new Date().toISOString().split("T")[0];
    } else {
      // Find the latest date among all bags
      const allDates = data.bags.map((bag) => bag.date).filter((date) => date);
      const latestDate = allDates.reduce((latest, current) => {
        return new Date(current) > new Date(latest) ? current : latest;
      }, allDates[0]);

      // Add 1 day to the latest date
      const nextDate = new Date(latestDate);
      nextDate.setDate(nextDate.getDate() + 1);
      newDate = nextDate.toISOString().split("T")[0];
    }

    // Add first bag to the new date group (a date group needs at least one bag)
    addBagToDate(newDate);
  };

  // Cross Check handlers
  const [crossCheckCounter, setCrossCheckCounter] = useState(0);

  const addCrossCheck = () => {
    const nextCounter = crossCheckCounter + 1;
    setCrossCheckCounter(nextCounter);
    const newCheck: CrossCheck = {
      id: `check-${nextCounter}`,
      powderWeight: "",
      quantity: "",
    };
    updateData({ crossChecks: [...data.crossChecks, newCheck] });
  };

  const updateCrossCheck = (id: string, field: keyof Omit<CrossCheck, "id">, value: string) => {
    const updatedChecks = data.crossChecks.map((check) => (check.id === id ? { ...check, [field]: value } : check));
    updateData({ crossChecks: updatedChecks });
  };

  const removeCrossCheck = (id: string) => {
    updateData({ crossChecks: data.crossChecks.filter((check) => check.id !== id) });
  };

  const validateStep1 = () => {
    // Base validation: mama name and NRIC required
    if (!data.mamaName.trim() || !data.mamaNric.trim()) return false;

    // Status-based validation
    if (data.status === "milk_arrived" || data.status === "pending") {
      return data.dateExpressed.trim() !== "";
    } else if (data.status === "processing") {
      return data.dateExpressed.trim() !== "" && data.bagsWeight.trim() !== "" && data.dateProcessed.trim() !== "";
    } else if (data.status === "completed") {
      return data.dateExpressed.trim() !== "";
    }
    return true;
  };

  const validateStep2 = () => {
    return data.bags.length > 0 && data.bags.every((bag) => bag.date && bag.weight);
  };

  const validateStep3 = () => {
    // For completed status, validate all required fields
    if (data.status === "completed") {
      return (
        data.bagsWeight.trim() !== "" &&
        data.powderWeight.trim() !== "" &&
        data.packingRequirements.trim() !== "" &&
        data.waterToAdd.trim() !== "" &&
        data.waterActivityLevel.trim() !== "" &&
        data.gramRatioStaffInput.trim() !== "" &&
        data.dateProcessed.trim() !== "" &&
        data.datePacked.trim() !== ""
      );
    }
    return true; // For other statuses, fields are optional
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return validateStep1();
      case 2:
        return validateStep2();
      case 3:
        return validateStep3();
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

  // eslint-disable-next-line complexity
  const buildMachineRunData = () => ({
    status: data.status as
      | "milk_arrived"
      | "pending"
      | "documented"
      | "processing"
      | "completed"
      | "qa_failed"
      | "cancelled",
    mama_name: data.mamaName,
    mama_nric: data.mamaNric,
    date_received: data.dateExpressed,
    date_processed: data.dateProcessed || undefined,
    date_packed: data.datePacked || undefined,
    remarks: data.remarks || undefined,
    machine_run: data.machineRun || undefined,
    handled_by: data.handledBy || undefined,
    verified_by: data.verifiedBy || undefined,
    bags_weight_g: data.bagsWeight ? parseFloat(data.bagsWeight) : undefined,
    powder_weight_g: data.powderWeight ? parseFloat(data.powderWeight) : undefined,
    packing_requirements_ml: data.packingRequirements ? parseFloat(data.packingRequirements) : undefined,
    label_water_to_add_ml: data.waterToAdd ? parseFloat(data.waterToAdd) : undefined,
    water_activity_level: data.waterActivityLevel ? parseFloat(data.waterActivityLevel) : undefined,
    gram_ratio_staff_input_ml: data.gramRatioStaffInput ? parseFloat(data.gramRatioStaffInput) : undefined,
  });

  const createMachineRun = async (runNumber: number) => {
    const insertData = {
      order_id: order.order_id,
      run_number: runNumber,
      ...buildMachineRunData(),
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
      ...buildMachineRunData(),
      updated_at: new Date().toISOString(),
    };

    console.log("Updating machine run:", machineRunId, updateData);

    const { data: machineRun, error } = await supabase
      .from("machine_runs")
      // @ts-expect-error: Supabase RLS policy causing type inference issue
      .update(updateData)
      .eq("machine_run_id", machineRunId)
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      throw error;
    }
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

  const createCrossChecks = async (machineRunId: string) => {
    if (data.crossChecks.length === 0) return;

    const crossCheckInserts = data.crossChecks.map((check) => ({
      machine_run_id: machineRunId,
      powder_weight_g: parseFloat(check.powderWeight),
      quantity: parseInt(check.quantity),
      user_id: order.user_id,
    }));

    // @ts-expect-error: Supabase RLS policy causing type inference issue
    const { error } = await supabase.from("cross_checks").insert(crossCheckInserts);
    if (error) throw error;
  };

  const updateCrossChecks = async (machineRunId: string) => {
    // Delete existing cross checks
    await supabase.from("cross_checks").delete().eq("machine_run_id", machineRunId);

    // Insert new cross checks
    if (data.crossChecks.length > 0) {
      await createCrossChecks(machineRunId);
    }
  };

  const handleSave = async () => {
    if (!isLoaded || !order) return;

    setLoading(true);
    try {
      if (editingMachineRun) {
        await updateMachineRun(editingMachineRun.machine_run_id);
        await updateIndividualBags(editingMachineRun.machine_run_id);
        await updateCrossChecks(editingMachineRun.machine_run_id);
      } else {
        const runNumber = await getNextRunNumber();
        const machineRun = await createMachineRun(runNumber);
        await createIndividualBags(machineRun.machine_run_id);
        await createCrossChecks(machineRun.machine_run_id);
      }

      form.reset(initialData);
      setCurrentStep(1);
      setBagCounter(0);
      setCrossCheckCounter(0);
      setInitialized(false);
      onComplete();
    } catch (error) {
      console.error("Error saving machine run:", error);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line complexity
  const hasChanges = () => {
    // Check if any form fields have been filled
    return (
      data.mamaName.trim() !== "" ||
      data.mamaNric.trim() !== "" ||
      data.dateExpressed.trim() !== "" ||
      data.machineRun.trim() !== "" ||
      data.dateProcessed.trim() !== "" ||
      data.datePacked.trim() !== "" ||
      data.remarks.trim() !== "" ||
      data.handledBy.trim() !== "" ||
      data.verifiedBy.trim() !== "" ||
      data.bags.length > 0 ||
      data.bagsWeight.trim() !== "" ||
      data.powderWeight.trim() !== "" ||
      data.packingRequirements.trim() !== "" ||
      data.waterToAdd.trim() !== "" ||
      data.waterActivityLevel.trim() !== "" ||
      data.gramRatioStaffInput.trim() !== "" ||
      data.crossChecks.length > 0
    );
  };

  const handleCancel = () => {
    if (hasChanges()) {
      if (!confirm("Are you sure you want to exit? All changes will be lost.")) {
        return;
      }
    }

    form.reset(initialData);
    setCurrentStep(1);
    setBagCounter(0);
    setCrossCheckCounter(0);
    setInitialized(false);
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Dialog is trying to close
      if (hasChanges()) {
        if (!confirm("Are you sure you want to exit? All changes will be lost.")) {
          return;
        }
      }
      form.reset(initialData);
      setCurrentStep(1);
      setBagCounter(0);
      setCrossCheckCounter(0);
      setInitialized(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[90vh] max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-2xl md:max-w-4xl lg:max-w-6xl"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {editingMachineRun ? "Edit Machine Run" : "Create Machine Run"}
            </DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              {currentStep < 3 ? (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSave} disabled={loading || !canProceed()}>
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
                order={order}
                addBagToDate={addBagToDate}
                updateBag={updateBag}
                removeBag={removeBag}
                addDateGroup={addDateGroup}
                updateDateGroupDate={updateDateGroupDate}
              />
            )}
            {currentStep === 3 && (
              <Step3
                data={data}
                updateData={updateData}
                addCrossCheck={addCrossCheck}
                updateCrossCheck={updateCrossCheck}
                removeCrossCheck={removeCrossCheck}
                onNavigateToStep={setCurrentStep}
              />
            )}
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
              <Button onClick={handleSave} disabled={loading || !canProceed()}>
                {loading ? "Saving..." : "Save"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
