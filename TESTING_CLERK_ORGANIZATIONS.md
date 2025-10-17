# Testing Clerk Organizations Implementation

This guide helps you verify that Clerk Organizations with RLS is working correctly.

## Step 1: Verify Database Migration Status

Run these SQL queries in your Supabase SQL Editor:

```sql
-- Check if org_id columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name IN ('customers', 'orders', 'machine_runs', 'individual_bags', 'cross_checks')
  AND column_name = 'org_id';

-- Check if get_current_org_id function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_current_org_id';

-- Check RLS is enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('customers', 'orders', 'machine_runs', 'individual_bags', 'cross_checks');

-- Check RLS policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected Results:**

- ✅ All tables should have `org_id TEXT` column with `get_current_org_id()` default
- ✅ Function `get_current_org_id` should exist
- ✅ All tables should have `rowsecurity = true`
- ✅ You should see policies for each table (view, insert, update, delete)

## Step 2: Verify Data Migration

```sql
-- Check if existing data has org_id populated
SELECT
  (SELECT COUNT(*) FROM customers WHERE org_id IS NULL) as customers_null,
  (SELECT COUNT(*) FROM orders WHERE org_id IS NULL) as orders_null,
  (SELECT COUNT(*) FROM machine_runs WHERE org_id IS NULL) as machine_runs_null,
  (SELECT COUNT(*) FROM individual_bags WHERE org_id IS NULL) as individual_bags_null,
  (SELECT COUNT(*) FROM cross_checks WHERE org_id IS NULL) as cross_checks_null;

-- Check what org_id values exist
SELECT DISTINCT org_id, COUNT(*) as count
FROM customers
GROUP BY org_id;

-- Verify it matches your organization ID
SELECT
  'org_33m8qoYBwwR9Hg46aQPM2roD9nt' as expected_org_id,
  org_id as actual_org_id,
  COUNT(*) as record_count
FROM customers
GROUP BY org_id;
```

**Expected Results:**

- ✅ All `*_null` counts should be 0
- ✅ You should see your org ID `org_33m8qoYBwwR9Hg46aQPM2roD9nt` with record counts

## Step 3: Test JWT Token Configuration

### In Clerk Dashboard:

1. Go to **JWT Templates** → **Supabase** template
2. Click **Test** or **Preview**
3. Verify the JWT includes:
   ```json
   {
     "sub": "user_xxxxx",
     "org_id": "org_33m8qoYBwwR9Hg46aQPM2roD9nt",
     "org_role": "org:member",
     "org_slug": "your-org-slug"
   }
   ```

### In Supabase SQL Editor:

```sql
-- Test if JWT function can extract org_id (run while authenticated in your app)
SELECT public.get_current_org_id() as current_org_id;

-- Check current JWT claims
SELECT current_setting('request.jwt.claims', true)::json as jwt_claims;
```

**Expected Results:**

- ✅ `current_org_id` should return your org ID when logged in
- ✅ `jwt_claims` should show the full JWT with org_id

## Step 4: Test Application Authentication Flow

### Test 1: Login Without Organization

1. Create a new test user in Clerk (don't add to any org)
2. Try to login to your app
3. **Expected**: User should be redirected to `/select-organization`

### Test 2: Create Organization

1. From `/select-organization`, click **Create Organization**
2. Enter a name and create it
3. **Expected**: Redirected to `/` (dashboard)
4. **Expected**: Organization switcher in header shows the new org

### Test 3: Organization Switcher

1. Create a second organization in Clerk
2. In your app header, click the organization switcher
3. Switch between organizations
4. **Expected**: Page refreshes, data changes to show org-specific data

## Step 5: Test Data Isolation (Most Important!)

### Test 5.1: Create Test Data in Org 1

1. Login as user in Organization 1
2. Create a test customer:
   - Name: "Test Customer Org 1"
3. Note the customer appears in the list

### Test 5.2: Verify Data Isolation

1. Switch to Organization 2 (or create a second org)
2. Go to customers page
3. **Expected**: "Test Customer Org 1" should NOT be visible
4. Create a new customer: "Test Customer Org 2"
5. **Expected**: Only "Test Customer Org 2" is visible

### Test 5.3: Verify Database Records

Run in Supabase SQL Editor:

```sql
-- Check org_id is being set correctly on new records
SELECT customer_id, name, org_id, created_at
FROM customers
ORDER BY created_at DESC
LIMIT 10;
```

**Expected Results:**

- ✅ Each customer should have the correct `org_id`
- ✅ Data created in Org 1 has Org 1's ID
- ✅ Data created in Org 2 has Org 2's ID

## Step 6: Test RLS Enforcement

### Test 6.1: Direct Database Query (Should Fail)

Try to query data directly without org context:

```sql
-- This should return NO ROWS when run as authenticated user (RLS blocks it)
SELECT * FROM customers WHERE org_id != public.get_current_org_id();
```

### Test 6.2: Service Role Bypass (Should Work)

Using the service role key:

```sql
-- This should return ALL rows (service role bypasses RLS)
SELECT customer_id, name, org_id FROM customers;
```

**Expected Results:**

- ✅ Regular authenticated queries only see their org's data
- ✅ Service role queries see all data

## Step 7: Test CRUD Operations

For each entity (Customers, Orders, Machine Runs):

### Create Test

1. Login to Org 1
2. Create a new record
3. Verify it appears in the list
4. Check database: `SELECT * FROM customers ORDER BY created_at DESC LIMIT 1;`
5. **Expected**: Record has correct `org_id`

### Read Test

1. Switch to Org 2
2. Try to view the record created in Org 1
3. **Expected**: Record is NOT visible (404 or not in list)

### Update Test

1. In Org 1, edit the record
2. Verify changes are saved
3. **Expected**: No errors

### Delete Test (Optional)

1. Delete the test record
2. **Expected**: Record is deleted from Org 1 only

## Step 8: Test Error Cases

### Test 8.1: No Organization

1. Logout
2. Create new user in Clerk
3. Don't add to any organization
4. Login
5. **Expected**: Redirected to `/select-organization`
6. **Expected**: Cannot access `/` or other routes

### Test 8.2: Invalid Organization

In your application code, temporarily log the org context:

```typescript
// In any server component
import { auth } from "@clerk/nextjs/server";

export default async function TestPage() {
  const { userId, orgId } = await auth();
  console.log({ userId, orgId });

  return <div>Check console for org context</div>;
}
```

**Expected**: `orgId` should always be present when user is in an org

## Step 9: Performance Check

```sql
-- Check if indexes are being used (should show Index Scan, not Seq Scan)
EXPLAIN ANALYZE
SELECT * FROM customers WHERE org_id = 'org_33m8qoYBwwR9Hg46aQPM2roD9nt';

-- Check query performance
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE '%org_id%';
```

**Expected Results:**

- ✅ Queries should use `idx_customers_org_id` index
- ✅ EXPLAIN should show "Index Scan" not "Seq Scan"

## Step 10: Integration Test Checklist

Run through a complete workflow:

- [ ] User logs in → Has org → Can access app
- [ ] User logs in → No org → Redirected to `/select-organization`
- [ ] Create organization → Redirected to dashboard
- [ ] Switch organizations → Data changes
- [ ] Create customer in Org 1 → Only visible in Org 1
- [ ] Create order in Org 1 → Only visible in Org 1
- [ ] Create machine run → Inherits org from order
- [ ] Individual bags → Inherit org from machine run
- [ ] Organization switcher shows correct org name
- [ ] Logout → Login to different org → See different data

## Common Issues & Solutions

### Issue: "User not associated with any organization"

**Solution:**

- Verify user is member of an organization in Clerk Dashboard
- Check JWT template includes `org_id` claim
- Verify Clerk integration is enabled in Supabase

### Issue: Can see data from other organizations

**Solution:**

- Check RLS is enabled: `SELECT * FROM pg_tables WHERE tablename = 'customers';`
- Verify policies exist: `SELECT * FROM pg_policies WHERE tablename = 'customers';`
- Test JWT function: `SELECT public.get_current_org_id();`
- Check Supabase receives JWT: Look at headers in network tab

### Issue: Cannot create/update records

**Solution:**

- Check `org_id` default is set: `SELECT column_default FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'org_id';`
- Verify INSERT policy exists with WITH CHECK clause
- Test function: `SELECT public.get_current_org_id();` should return your org ID

### Issue: Organization switcher not appearing

**Solution:**

- Check user is member of multiple organizations
- Verify `OrganizationSwitcher` component is imported from `@clerk/nextjs`
- Clear browser cache and cookies

## Success Criteria

Your implementation is working correctly when:

✅ All database migrations completed without errors
✅ RLS is enabled on all tables with organization policies
✅ JWT contains `org_id` claim
✅ Users without org are redirected to org selection
✅ Data is isolated between organizations (verified with 2+ orgs)
✅ CRUD operations work correctly within org context
✅ Organization switcher is visible and functional
✅ Database queries use org_id indexes for performance
✅ Service role can see all data, regular users only see their org
✅ No errors in browser console or server logs

## Reporting Results

After testing, document:

1. Which tests passed ✅
2. Which tests failed ❌
3. Any unexpected behavior
4. Performance observations
5. User experience feedback
