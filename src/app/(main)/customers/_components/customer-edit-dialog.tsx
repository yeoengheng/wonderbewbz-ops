"use client";

import { useState, useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { useSupabase } from "@/hooks/use-supabase";
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

  const cleanupValues = (values: CustomerFormValues) => ({
    ...values,
    phone: values.phone ?? null,
    shipping_addr_1: values.shipping_addr_1 ?? null,
    shipping_addr_2: values.shipping_addr_2 ?? null,
    postal_code: values.postal_code ?? null,
    shopify_customer_id: values.shopify_customer_id ?? null,
  });

  const updateCustomer = async (cleanedValues: ReturnType<typeof cleanupValues>) => {
    const { data, error } = await (supabase as any)
      .from("customers")
      .update(cleanedValues)
      .eq("customer_id", customer!.customer_id)
      .select()
      .single();
    if (error || !data) throw error ?? new Error("Failed to update customer");
    return data as unknown as Customer;
  };

  const createCustomer = async (cleanedValues: ReturnType<typeof cleanupValues>) => {
    const { data, error } = await (supabase as any).from("customers").insert(cleanedValues).select().single();
    if (error || !data) throw error ?? new Error("Failed to create customer");
    return data as unknown as Customer;
  };

  const onSubmit = async (values: CustomerFormValues) => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      const cleanedValues = cleanupValues(values);
      const result = customer ? await updateCustomer(cleanedValues) : await createCustomer(cleanedValues);
      onSaved(result);
    } catch (error) {
      console.error("Error saving customer:", error);
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
