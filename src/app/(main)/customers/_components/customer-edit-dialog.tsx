"use client";

import { useState, useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { BackupRecoveryBanner } from "@/components/ui/backup-recovery-banner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAbortOnUnmount } from "@/hooks/use-abort-on-unmount";
import { useFormBackup } from "@/hooks/use-form-backup";
import { useSupabase } from "@/hooks/use-supabase";
import { verifySave } from "@/lib/database/save-verification";
import { formatDatabaseError } from "@/lib/error-handling";
import { cleanupCustomerValues } from "@/lib/form-utils";
import { retryWithToast } from "@/lib/retry-operation";
import type { Customer } from "@/types/database";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  phone: z.string().optional(),
  shipping_addr_1: z.string().optional(),
  shipping_addr_2: z.string().optional(),
  postal_code: z.string().optional(),
  shopify_customer_id: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerEditDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (customer: Customer) => void;
}

export function CustomerEditDialog({ customer, open, onOpenChange, onSaved }: CustomerEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const { supabase, isLoaded } = useSupabase();
  const abortSignal = useAbortOnUnmount();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "",
      shipping_addr_1: "",
      shipping_addr_2: "",
      postal_code: "",
      shopify_customer_id: "",
    },
  });

  const backup = useFormBackup({
    formType: "customer",
    recordId: customer?.customer_id ?? null,
    form,
    enabled: open,
  });

  // Reset form when customer changes or dialog opens
  useEffect(() => {
    if (open) {
      if (customer) {
        form.reset({
          name: customer.name ?? "",
          phone: customer.phone ?? "",
          shipping_addr_1: customer.shipping_addr_1 ?? "",
          shipping_addr_2: customer.shipping_addr_2 ?? "",
          postal_code: customer.postal_code ?? "",
          shopify_customer_id: customer.shopify_customer_id ?? "",
        });
      } else {
        form.reset({
          name: "",
          phone: "",
          shipping_addr_1: "",
          shipping_addr_2: "",
          postal_code: "",
          shopify_customer_id: "",
        });
      }
    }
  }, [customer, open, form]);

  const cleanupValues = (values: CustomerFormValues) => cleanupCustomerValues(values);

  const updateCustomer = async (cleanedValues: ReturnType<typeof cleanupValues>) => {
    const { data, error } = await supabase
      .from("customers")
      // @ts-expect-error: Supabase RLS policy causing type inference issue
      .update(cleanedValues)
      .eq("customer_id", customer!.customer_id)
      .select()
      .single();
    if (error || !data) throw error ?? new Error("Failed to update customer");
    return data as Customer;
  };

  const createCustomer = async (cleanedValues: ReturnType<typeof cleanupValues>) => {
    // @ts-expect-error: Supabase RLS policy causing type inference issue
    const { data, error } = await supabase.from("customers").insert(cleanedValues).select().single();
    if (error || !data) throw error ?? new Error("Failed to create customer");
    return data as Customer;
  };

  const onSubmit = async (values: CustomerFormValues) => {
    if (!isLoaded) return;

    // Backup form data before attempting save
    backup.backupData();

    setLoading(true);
    try {
      const cleanedValues = cleanupValues(values);

      // Use retry with toast for network resilience
      const result = await retryWithToast<Customer>(
        async () => {
          if (customer) {
            return await updateCustomer(cleanedValues);
          } else {
            return await createCustomer(cleanedValues);
          }
        },
        "Saving customer",
        { abortSignal },
      );

      if (!result.success) {
        const appError = formatDatabaseError(result.error);
        toast.error("Failed to save customer", {
          description: appError.message,
        });
        return;
      }

      // Verify the save was successful by re-querying
      const verification = await verifySave<Customer>({
        supabase,
        table: "customers",
        idField: "customer_id",
        idValue: result.data!.customer_id,
      });

      if (!verification.success) {
        toast.error("Save verification failed", {
          description: verification.error ?? "The customer may not have been saved correctly.",
        });
        return;
      }

      // Clear backup on successful save
      backup.clearBackup();

      toast.success(customer ? "Customer updated successfully" : "Customer created successfully");
      onSaved(verification.data!);
    } catch (error) {
      // Handle abort
      if ((error as Error)?.message === "Operation aborted") {
        return;
      }
      console.error("Error saving customer:", error);
      const appError = formatDatabaseError(error);
      toast.error("Failed to save customer", {
        description: appError.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{customer ? "Edit Customer" : "Create New Customer"}</DialogTitle>
          <DialogDescription>
            {customer
              ? "Update the customer information below."
              : "Fill in the customer details to create a new customer record."}
          </DialogDescription>
        </DialogHeader>

        {backup.hasBackup && (
          <BackupRecoveryBanner
            backupTimestamp={backup.backupTimestamp}
            onRestore={backup.restoreBackup}
            onDismiss={backup.dismissBackup}
          />
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Customer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shopify_customer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shopify Customer ID</FormLabel>
                    <FormControl>
                      <Input placeholder="shopify_123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+65 1234 5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shipping_addr_1"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shipping_addr_2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2</FormLabel>
                    <FormControl>
                      <Input placeholder="Apt 4B" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : customer ? "Update Customer" : "Create Customer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
