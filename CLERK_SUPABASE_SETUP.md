# Official Clerk-Supabase Integration Setup

This guide implements the **official Clerk-Supabase integration** with proper JWT-based RLS policies.

## Prerequisites

You need both Clerk and Supabase accounts set up.

## Step 1: Configure Clerk as Supabase Auth Provider

### In Clerk Dashboard:
1. Navigate to **Integrations** → **Supabase**
2. Click **Activate Supabase integration**
3. Copy the **Clerk domain** (e.g., `https://your-app.clerk.accounts.dev`)

### In Supabase Dashboard:
1. Go to **Authentication** → **Sign In / Up**
2. Click **Add provider** → Select **Clerk**
3. Paste your Clerk domain
4. Save the configuration

## Step 2: Run Database Migrations

Execute these migrations in your Supabase SQL editor **in order**:

1. **001_create_tables.sql** - Creates base tables
2. **002_setup_rls.sql** - Basic permissions (can skip if using step 4)
3. **004_clerk_integration.sql** - Official Clerk integration with RLS

## Step 3: Environment Variables

Add to your `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## Step 4: Usage in Your App

### Client-Side Components

```tsx
'use client';
import { useUser } from '@clerk/nextjs';
import { useSupabase } from '@/hooks/use-supabase';

export function MyComponent() {
  const { user } = useUser();
  const { supabase, isLoaded } = useSupabase();

  async function loadUserData() {
    if (!user || !isLoaded) return;
    
    // This automatically filters to current user's data due to RLS
    const { data } = await supabase
      .from('orders')
      .select('*, customer:customers(*)')
      .order('created_at', { ascending: false });
    
    return data;
  }

  async function createOrder(orderData) {
    // user_id is automatically set from JWT token
    const { data } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    
    return data;
  }
}
```

### Server-Side Components

```tsx
import { auth } from '@clerk/nextjs/server';
import { createServerClerkSupabaseClient } from '@/lib/supabase-clerk';

export default async function ServerComponent() {
  const { getToken } = auth();
  const supabase = await createServerClerkSupabaseClient(getToken);

  // Automatically filtered to current user's data
  const { data: orders } = await supabase
    .from('orders')
    .select('*, customer:customers(*)')
    .order('created_at', { ascending: false });

  return (
    <div>
      {orders?.map(order => (
        <div key={order.order_id}>{order.shopify_order_id}</div>
      ))}
    </div>
  );
}
```

## Key Features

### 🔐 Automatic User Isolation
- Each user only sees their own data
- `user_id` automatically populated from Clerk JWT
- RLS policies enforce data access restrictions

### 🛡️ Secure by Default
- JWT tokens validated by Supabase
- No manual user ID management required
- Policies prevent data leakage between users

### 📊 Multi-User Support
- Each authenticated user gets their own data silo
- Perfect for multi-tenant applications
- Shopify data can be user-specific

## Testing the Integration

1. Sign in with different Clerk users
2. Create orders/customers with each user
3. Verify data isolation (users only see their own data)
4. Check the Supabase dashboard - you'll see all data but with different `user_id` values

## Migration Path

If you have existing data without `user_id` columns:

1. **Backup your data first**
2. Run migration `004_clerk_integration.sql`
3. Existing records will get `user_id` set to the JWT token of the first authenticated request
4. Consider migrating existing data to appropriate users if needed

## Example Component

Check `src/components/examples/orders-example.tsx` for a complete working example.

## Security Notes

- ✅ RLS is **enabled** and required for this integration
- ✅ Users can only access their own data
- ✅ JWT tokens are validated by Supabase
- ✅ No risk of data leakage between users
- ❗ Make sure Clerk integration is properly configured in both dashboards

This is the **official, recommended approach** for Clerk-Supabase integration!