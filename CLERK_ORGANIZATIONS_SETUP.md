# Clerk Organizations Setup Guide

This guide walks you through setting up Clerk Organizations for the Wonderbewbz operations management system.

## Prerequisites

- Clerk account with access to your application dashboard
- Database migrations ready to run
- Existing data backed up (if applicable)

## Step 1: Enable Organizations in Clerk Dashboard

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Organizations** in the left sidebar
4. Click **Enable Organizations**
5. Configure organization settings:
   - Enable "Allow users to create organizations"
   - Set "Maximum organizations per user" (recommended: 1-5)
   - Configure organization roles if needed

## Step 2: Enable Native Clerk Integration in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Scroll to **Third Party Auth** section
5. Find **Clerk** and click to expand
6. Toggle **Enabled** to ON
7. Copy your Clerk domain from the Clerk Dashboard:
   - Format: `https://your-app-name.clerk.accounts.dev`
   - Or your custom domain if configured
8. Paste the domain into the Supabase Clerk integration field
9. Click **Save**

**Important**: The native integration automatically handles JWT verification and includes the `org_id` claim from Clerk Organizations.

## Step 3: Configure JWT Template for Organization Claims (Optional)

While the native integration handles basic authentication, you may want to explicitly define organization claims:

1. In Clerk Dashboard, go to **JWT Templates**
2. Click **New Template** → **Supabase**
3. Name the template: `supabase`
4. Add the following custom claims:

```json
{
  "org_id": "{{org.id}}",
  "org_role": "{{org.role}}",
  "org_slug": "{{org.slug}}"
}
```

5. Set the **Lifetime** to 3600 seconds (1 hour)
6. Click **Save**

**Note**: With native integration enabled, these claims will be automatically included when users are in an organization context.

## Step 4: Verify Clerk Domain in Supabase

After enabling the Clerk integration, verify it's working:

1. In Supabase, the Clerk provider should show as "Enabled" with your domain
2. The domain should match exactly: `https://relieved-mouse-87.clerk.accounts.dev` (based on your screenshot)
3. No additional JWT configuration is needed - Supabase will automatically validate Clerk tokens

## Step 5: Run Database Migrations

Run the migrations in order:

```bash
# 1. Add org_id columns to tables
psql $DATABASE_URL -f supabase/migrations/009_add_organization_support.sql

# 2. Enable RLS policies
psql $DATABASE_URL -f supabase/migrations/010_enable_org_rls_policies.sql

# 3. Migrate existing data (update DEFAULT_ORG_ID first!)
# Edit 011_migrate_existing_data_to_org.sql and set your org ID
psql $DATABASE_URL -f supabase/migrations/011_migrate_existing_data_to_org.sql
```

**IMPORTANT**: Before running migration 011:

1. Create your first organization in Clerk
2. Copy the organization ID (format: `org_xxxxxxxxxxxxxxxxxxxxx`)
3. Update the `DEFAULT_ORG_ID` variable in `011_migrate_existing_data_to_org.sql`

## Step 6: Create Your First Organization

1. Sign in to your application
2. You'll be redirected to `/select-organization`
3. Click **Create Organization**
4. Enter organization name and click **Create**
5. Copy the organization ID from the URL or Clerk Dashboard

## Step 7: Verify Setup

1. **Test Data Isolation**:
   - Create a test record (customer, order, etc.)
   - Verify it has an `org_id` in the database
   - Try accessing it from a different organization (should fail)

2. **Test Organization Switching**:
   - Click the Organization Switcher in the header
   - Switch to a different organization
   - Verify data changes accordingly

3. **Test RLS Policies**:
   ```sql
   -- This should only return records from the current user's org
   SELECT * FROM customers;
   SELECT * FROM orders;
   SELECT * FROM machine_runs;
   ```

## Step 8: Update Environment Variables

Add these to your `.env.local` if not already present:

```bash
# Clerk Organizations
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Organization settings (optional)
NEXT_PUBLIC_CLERK_HIDE_PERSONAL=true
```

## Troubleshooting

### Issue: "User not associated with any organization"

**Solution**:

- Make sure the user is a member of at least one organization
- Check if the user was redirected to `/select-organization`
- Verify JWT template includes `org_id` claim

### Issue: "RLS policies blocking queries"

**Solution**:

- Verify Clerk integration is enabled in Supabase (should show as "Enabled")
- Check domain matches exactly in Supabase settings
- Ensure user is part of an organization (check `auth.jwt()->>'org_id'`)
- Test with: `SELECT auth.jwt()->>'org_id'` in Supabase SQL editor
- Verify JWT template includes `org_id` claim if using custom template

### Issue: "Cannot see any data after migration"

**Solution**:

- Check if existing records have `org_id` populated
- Run: `SELECT COUNT(*) FROM customers WHERE org_id IS NULL;`
- Re-run migration script with correct organization ID

### Issue: "Organization switcher not showing"

**Solution**:

- Verify `OrganizationSwitcher` component is imported from `@clerk/nextjs`
- Check user is part of multiple organizations
- Clear browser cache and cookies

## Production Checklist

Before deploying to production:

- [ ] Organizations enabled in Clerk Dashboard
- [ ] Native Clerk integration enabled in Supabase
- [ ] Clerk domain configured correctly in Supabase
- [ ] JWT template configured with `org_id` claim (if using custom template)
- [ ] All database migrations run successfully
- [ ] Existing data migrated to default organization
- [ ] `org_id` columns set to NOT NULL (uncomment in migration 011)
- [ ] RLS policies tested and working
- [ ] Organization switcher visible and functional
- [ ] Data isolation verified between organizations
- [ ] User invitation flow tested
- [ ] Organization creation flow tested

## Additional Resources

- [Clerk Organizations Documentation](https://clerk.com/docs/organizations/overview)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Clerk + Supabase Integration Guide](https://clerk.com/docs/integrations/databases/supabase)

## Support

If you encounter issues:

1. Check Clerk Dashboard logs
2. Check Supabase logs
3. Verify JWT claims using [jwt.io](https://jwt.io)
4. Review RLS policies in Supabase SQL editor
