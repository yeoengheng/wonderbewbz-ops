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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabase } from "@/hooks/use-supabase";
import { cleanupOrderValues } from "@/lib/form-utils";
import type { Order, Customer, MachineRun } from "@/types/database";

type OrderWithCustomer = Order & { customer: Customer; machine_runs?: MachineRun[] };

const orderSchema = z.object({
  shopify_order_id: z.string().min(1, "Order ID is required"),
  customer_id: z.string().min(1, "Customer is required"),
  status: z.enum(["pending", "processing", "completed"]),
  shipping_addr_1: z.string().optional(),
  shipping_addr_2: z.string().optional(),
  postal_code: z.string().optional(),
  phone: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderEditDialogProps {
  order: OrderWithCustomer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (order: OrderWithCustomer) => void;
}

export function OrderEditDialog({ order, open, onOpenChange, onSaved }: OrderEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { supabase, isLoaded } = useSupabase();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      shopify_order_id: "",
      customer_id: "",
      status: "pending",
      shipping_addr_1: "",
      shipping_addr_2: "",
      postal_code: "",
      phone: "",
    },
  });

  // Load customers for dropdown
  useEffect(() => {
    const loadCustomers = async () => {
      if (!isLoaded) return;
      const { data } = await supabase.from("customers").select("*").order("name");
      setCustomers(data ?? []);
    };

    if (open && isLoaded) {
      loadCustomers();
    }
  }, [open, supabase, isLoaded]);

  // Reset form when order changes or dialog opens
  useEffect(() => {
    if (open) {
      if (order) {
        form.reset({
          shopify_order_id: order.shopify_order_id,
          customer_id: order.customer_id,
          status: order.status as "pending" | "processing" | "completed",
          shipping_addr_1: order.shipping_addr_1 ?? "",
          shipping_addr_2: order.shipping_addr_2 ?? "",
          postal_code: order.postal_code ?? "",
          phone: order.phone ?? "",
        });
      } else {
        form.reset({
          shopify_order_id: "",
          customer_id: "",
          status: "pending",
          shipping_addr_1: "",
          shipping_addr_2: "",
          postal_code: "",
          phone: "",
        });
      }
    }
  }, [order, open, form]);

  const onSubmit = async (values: OrderFormValues) => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      // Clean up empty strings to null for optional fields
      const cleanedValues = cleanupOrderValues(values);

      if (order) {
        // Update existing order
        const { data: updatedOrder, error } = await supabase
          .from("orders")
          // @ts-expect-error: Supabase RLS policy causing type inference issue
          .update(cleanedValues)
          .eq("order_id", order.order_id)
          .select(
            `
            *,
            customer:customers(*),
            machine_runs(*)
          `,
          )
          .single();

        if (error) {
          console.error("Error updating order:", error);
          throw error;
        }
        console.log("Order updated:", updatedOrder);
        onSaved(updatedOrder as OrderWithCustomer);
      } else {
        // Create new order
        const { data: newOrder, error } = await supabase
          .from("orders")
          // @ts-expect-error: Supabase RLS policy causing type inference issue
          .insert(cleanedValues)
          .select(
            `
            *,
            customer:customers(*),
            machine_runs(*)
          `,
          )
          .single();

        if (error) {
          console.error("Error creating order:", error);
          throw error;
        }
        console.log("Order created:", newOrder);
        onSaved(newOrder as OrderWithCustomer);
      }
    } catch (error) {
      console.error("Error saving order:", error);
      // You could add toast notifications here
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{order ? "Edit Order" : "Create New Order"}</DialogTitle>
          <DialogDescription>
            {order ? "Update the order information below." : "Fill in the order details to create a new order record."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shopify_order_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shopify Order ID *</FormLabel>
                    <FormControl>
                      <Input placeholder="order_12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Customer *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.customer_id} value={customer.customer_id}>
                            {customer.name} ({customer.phone ?? "No phone"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

              <FormField
                control={form.control}
                name="shipping_addr_1"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Shipping Address Line 1</FormLabel>
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
                  <FormItem className="col-span-2">
                    <FormLabel>Shipping Address Line 2</FormLabel>
                    <FormControl>
                      <Input placeholder="Apt 4B" {...field} />
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
                {loading ? "Saving..." : order ? "Update Order" : "Create Order"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
