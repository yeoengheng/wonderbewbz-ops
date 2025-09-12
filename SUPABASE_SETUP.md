# Supabase Implementation Guide

This guide covers the complete Supabase setup for the Wonderbewbz operations system based on the PRD database schema.

## Database Schema Overview

The system consists of 4 main tables with the following relationship:

```
Customer (1) ──< Orders (∞) ──< Machine Runs (∞) ──< Individual Bags (∞)
```

## Setup Instructions

### 1. Run Database Migrations

Execute the following SQL files in your Supabase SQL editor in order:

1. **Create Tables** (`supabase/migrations/001_create_tables.sql`)
   - Creates all 4 tables with proper relationships
   - Sets up indexes for performance
   - Creates auto-update triggers for `updated_at` fields

2. **Setup RLS** (`supabase/migrations/002_setup_rls.sql`)
   - Enables Row Level Security
   - Creates basic authentication policies
   - Grants necessary permissions

### 2. Environment Variables

Add these to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. TypeScript Integration

- **Types**: `src/types/database.ts` contains all TypeScript interfaces
- **Client**: `src/lib/supabase.ts` now includes typed Supabase client
- **Queries**: `src/lib/database/queries.ts` provides ready-to-use query functions

## Key Features

### Table Structure

1. **customers** - Client information from Shopify
2. **orders** - Orders created via Shopify webhook
3. **machine_runs** - Central operations table with all processing data
4. **individual_bags** - Granular bag tracking per machine run

### Query Functions Available

#### Customer Operations

- `customerQueries.getAll()`
- `customerQueries.getById(customerId)`
- `customerQueries.getByShopifyId(shopifyCustomerId)`
- `customerQueries.create(customerData)`
- `customerQueries.update(customerId, updates)`

#### Order Operations

- `orderQueries.getAll()` - Returns orders with customer data
- `orderQueries.getById(orderId)`
- `orderQueries.getByShopifyId(shopifyOrderId)`
- `orderQueries.create(orderData)`
- `orderQueries.updateStatus(orderId, status)`

#### Machine Run Operations

- `machineRunQueries.getAll()` - Returns runs with order and customer data
- `machineRunQueries.getById(machineRunId)` - Includes individual bags
- `machineRunQueries.getByOrderId(orderId)`
- `machineRunQueries.create(machineRunData)`
- `machineRunQueries.update(machineRunId, updates)`

#### Individual Bag Operations

- `bagQueries.getByMachineRunId(machineRunId)`
- `bagQueries.create(bagData)`
- `bagQueries.createBatch(bagsArray)` - For bulk bag creation
- `bagQueries.update(bagId, updates)`

#### Complex Queries

- `complexQueries.getCompleteOrder(orderId)` - Full order with all runs and bags
- `complexQueries.getDashboardStats()` - Summary statistics

## Usage Examples

### Creating a new order with customer

```typescript
import { customerQueries, orderQueries } from "@/lib/database/queries";

// Create or get customer
const customer = await customerQueries.create({
  shopify_customer_id: "12345",
  name: "John Doe",
  phone: "+65 1234 5678",
  shipping_addr_1: "123 Main St",
  postal_code: "123456",
});

// Create order
const order = await orderQueries.create({
  shopify_order_id: "order_67890",
  customer_id: customer.customer_id,
  status: "pending",
  shipping_addr_1: customer.shipping_addr_1,
  postal_code: customer.postal_code,
  phone: customer.phone,
});
```

### Creating a machine run with bags

```typescript
import { machineRunQueries, bagQueries } from "@/lib/database/queries";

// Create machine run
const machineRun = await machineRunQueries.create({
  order_id: "order-uuid",
  run_number: 1,
  status: "processing",
  mama_name: "Jane Smith",
  mama_nric: "S1234567A",
  date_received: "2024-01-15",
  bags_weight_g: 500.5,
  powder_weight_g: 450.2,
});

// Create individual bags
const bags = await bagQueries.createBatch([
  {
    machine_run_id: machineRun.machine_run_id,
    bag_number: 1,
    date_expressed: "2024-01-14",
    time_expressed: "09:30:00",
    weight_g: 125.5,
  },
  {
    machine_run_id: machineRun.machine_run_id,
    bag_number: 2,
    date_expressed: "2024-01-14",
    time_expressed: "11:15:00",
    weight_g: 130.2,
  },
]);
```

### Getting complete order data

```typescript
import { complexQueries } from "@/lib/database/queries";

const completeOrder = await complexQueries.getCompleteOrder("order-uuid");
// Returns order with customer, all machine runs, and all individual bags
```

## Security Notes

- RLS is enabled on all tables
- Current policies allow full access to authenticated users
- Customize RLS policies in `002_setup_rls.sql` based on your auth requirements
- Consider implementing role-based access control for different user types

## Clerk Integration

Since you're using Clerk for authentication, here are the integration options:

### Option 1: Basic Integration (No User Tracking)

Your current setup works as-is. Clerk handles authentication, Supabase handles data. Use the regular query functions from `src/lib/database/queries.ts`.

### Option 2: User Tracking (Recommended)

Track which Clerk user creates/modifies records:

1. **Run Migration**: `supabase/migrations/003_add_user_tracking.sql` (optional)
2. **Use Authenticated Queries**: Import from `src/lib/database/authenticated-queries.ts`
3. **Benefits**: Audit trail, user-specific data filtering, activity tracking

#### Usage with Clerk Integration:

```typescript
import { authenticatedQueries } from "@/lib/database/authenticated-queries";

// Automatically includes Clerk user ID
const order = await authenticatedQueries.orders.create({
  shopify_order_id: "order_123",
  customer_id: "customer-uuid",
  status: "pending",
});

// Get current user's activity
const activity = await authenticatedQueries.getUserActivity();
```

#### Available Integration Utilities:

- `getAuthenticatedSupabaseClient()` - Get Supabase client with Clerk context
- `getCurrentUserProfile()` - Get Clerk user profile data
- `createUserRecord()` - Helper for user-associated records

### Environment Variables

Add these to your `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk (you should already have these)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## Next Steps

1. Run the migration files in Supabase (001, 002, and optionally 003)
2. Set up environment variables
3. Choose integration approach (basic or with user tracking)
4. Test the query functions
5. Build your UI components using the provided TypeScript types
