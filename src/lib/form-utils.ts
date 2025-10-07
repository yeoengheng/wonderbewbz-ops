/**
 * Utility functions for form data processing and cleanup
 */

/**
 * Converts empty strings to null for database storage
 * Useful for optional fields that should be null instead of empty strings
 */
export function emptyStringToNull<T extends Record<string, unknown>>(values: T): T {
  const cleaned = {} as T;
  for (const [key, value] of Object.entries(values)) {
    cleaned[key as keyof T] = (value === "" ? null : value) as T[keyof T];
  }
  return cleaned;
}

/**
 * Converts empty strings to undefined for form processing
 * Useful when working with optional fields in TypeScript
 */
export function emptyStringToUndefined<T extends Record<string, unknown>>(values: T): T {
  const cleaned = {} as T;
  for (const [key, value] of Object.entries(values)) {
    cleaned[key as keyof T] = (value === "" ? undefined : value) as T[keyof T];
  }
  return cleaned;
}

/**
 * Removes undefined values from an object
 * Useful for cleaning up data before sending to APIs
 */
export function removeUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const cleaned: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key as keyof T] = value as T[keyof T];
    }
  }
  return cleaned;
}

/**
 * Converts string values to appropriate types for database storage
 * Handles common form field conversions
 */
export function convertFormValues(values: Record<string, string | undefined>) {
  const converted: Record<string, string | number | null | undefined> = {};

  for (const [key, value] of Object.entries(values)) {
    if (value === "" || value === undefined) {
      converted[key] = undefined;
    } else if (!isNaN(Number(value)) && value.trim() !== "") {
      // Only convert to number if it's a valid number and not empty
      converted[key] = parseFloat(value);
    } else {
      converted[key] = value;
    }
  }

  return converted;
}

/**
 * Standard cleanup for order form values
 */
// eslint-disable-next-line complexity
export function cleanupOrderValues(values: {
  shopify_order_id: string;
  customer_id: string;
  status: string;
  shipping_addr_1?: string;
  shipping_addr_2?: string;
  postal_code?: string;
  phone?: string;
  arrival_temp?: string;
  arrival_weight?: string;
  visual_check?: string | null;
  visual_check_remarks?: string;
}): {
  shopify_order_id: string;
  customer_id: string;
  status: string;
  shipping_addr_1: string | null;
  shipping_addr_2: string | null;
  postal_code: string | null;
  phone: string | null;
  arrival_temp: number | null;
  arrival_weight: number | null;
  visual_check: string | null;
  visual_check_remarks: string | null;
} {
  return {
    shopify_order_id: values.shopify_order_id,
    customer_id: values.customer_id,
    status: values.status,
    shipping_addr_1: values.shipping_addr_1 ?? null,
    shipping_addr_2: values.shipping_addr_2 ?? null,
    postal_code: values.postal_code ?? null,
    phone: values.phone ?? null,
    arrival_temp: values.arrival_temp && values.arrival_temp !== "" ? parseFloat(values.arrival_temp) : null,
    arrival_weight: values.arrival_weight && values.arrival_weight !== "" ? parseFloat(values.arrival_weight) : null,
    visual_check: values.visual_check && values.visual_check !== "none" ? values.visual_check : null,
    visual_check_remarks: values.visual_check_remarks ?? null,
  };
}

/**
 * Standard cleanup for customer form values
 */
export function cleanupCustomerValues(values: {
  name: string;
  phone?: string;
  shipping_addr_1?: string;
  shipping_addr_2?: string;
  postal_code?: string;
  shopify_customer_id?: string;
}): {
  name: string;
  phone: string | null;
  shipping_addr_1: string | null;
  shipping_addr_2: string | null;
  postal_code: string | null;
  shopify_customer_id: string | null;
} {
  return {
    name: values.name,
    phone: values.phone ?? null,
    shipping_addr_1: values.shipping_addr_1 ?? null,
    shipping_addr_2: values.shipping_addr_2 ?? null,
    postal_code: values.postal_code ?? null,
    shopify_customer_id: values.shopify_customer_id ?? null,
  };
}
