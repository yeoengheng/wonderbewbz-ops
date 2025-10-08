import { auth, currentUser } from "@clerk/nextjs/server";

import { createServerSupabaseClient } from "@/lib/supabase";

/* eslint-disable complexity */
export default async function TestOrgPage() {
  // Get Clerk auth context
  const { userId, orgId, orgRole, orgSlug } = await auth();
  const user = await currentUser();

  // Get Supabase client with JWT
  const supabase = await createServerSupabaseClient();

  // Test the get_current_org_id function
  const { data: orgIdTest, error: orgIdError } = await supabase.rpc("get_current_org_id");

  // Try to query customers to test RLS
  const { data: customers, error: customersError } = await supabase.from("customers").select("*").limit(5);

  // Get all org IDs in customers table (to see if RLS is filtering)
  const { data: allOrgIds } = await supabase.from("customers").select("org_id").limit(100);

  const uniqueOrgIds =
    allOrgIds && Array.isArray(allOrgIds) ? [...new Set(allOrgIds.map((c) => (c as { org_id: string }).org_id))] : [];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Organization & RLS Test Page</h1>

      {/* Clerk Auth Context */}
      <div className="bg-card rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Clerk Authentication Context</h2>
        <div className="space-y-2 font-mono text-sm">
          <div>
            <span className="font-semibold">User ID:</span> {userId ?? "Not authenticated"}
          </div>
          <div>
            <span className="font-semibold">Organization ID:</span>{" "}
            <span className={orgId ? "text-green-600" : "text-red-600"}>{orgId ?? "No organization"}</span>
          </div>
          <div>
            <span className="font-semibold">Organization Role:</span> {orgRole ?? "N/A"}
          </div>
          <div>
            <span className="font-semibold">Organization Slug:</span> {orgSlug ?? "N/A"}
          </div>
          <div>
            <span className="font-semibold">User Email:</span> {user?.emailAddresses[0]?.emailAddress ?? "N/A"}
          </div>
        </div>
      </div>

      {/* JWT Function Test */}
      <div className="bg-card rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">JWT Function Test</h2>
        <div className="space-y-2 font-mono text-sm">
          <div>
            <span className="font-semibold">get_current_org_id() result:</span>{" "}
            <span className={orgIdTest ? "text-green-600" : "text-red-600"}>
              {orgIdTest ?? (orgIdError ? `Error: ${orgIdError.message}` : "null (function returned empty)")}
            </span>
          </div>
          <div className="mt-2">
            <span className="font-semibold">Match Status:</span>{" "}
            {orgId === orgIdTest ? (
              <span className="text-green-600">✅ MATCHES (Correct!)</span>
            ) : (
              <span className="text-red-600">❌ MISMATCH (Issue detected)</span>
            )}
          </div>
        </div>
      </div>

      {/* RLS Test */}
      <div className="bg-card rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">RLS Policy Test</h2>
        {customersError ? (
          <div className="text-red-600">Error querying customers: {customersError.message}</div>
        ) : (
          <div className="space-y-4">
            <div className="font-mono text-sm">
              <span className="font-semibold">Customers visible to you:</span> {customers?.length ?? 0}
            </div>

            <div className="font-mono text-sm">
              <span className="font-semibold">Unique org_ids in results:</span>
              <div className="mt-2 space-y-1">
                {uniqueOrgIds.length === 0 && <div className="text-muted-foreground">No data yet</div>}
                {uniqueOrgIds.map((id) => (
                  <div key={id} className={id === orgId ? "text-green-600" : "text-red-600"}>
                    {id} {id === orgId ? "✅ (Your org)" : "❌ (SHOULD NOT SEE THIS!)"}
                  </div>
                ))}
              </div>
            </div>

            {uniqueOrgIds.length > 1 && (
              <div className="mt-4 rounded bg-red-100 p-4 text-red-800">
                <strong>⚠️ WARNING:</strong> You can see data from multiple organizations! RLS may not be working
                correctly.
              </div>
            )}

            {uniqueOrgIds.length === 1 && uniqueOrgIds[0] === orgId && (
              <div className="mt-4 rounded bg-green-100 p-4 text-green-800">
                <strong>✅ SUCCESS:</strong> RLS is working! You can only see data from your organization.
              </div>
            )}

            {customers?.length ? (
              <div className="mt-4">
                <h3 className="mb-2 font-semibold">Sample Data:</h3>
                <div className="max-h-64 overflow-auto rounded border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Org ID</th>
                        <th className="p-2 text-left">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.customer_id} className="border-t">
                          <td className="p-2">{customer.name}</td>
                          <td className="p-2 font-mono text-xs">{customer.org_id}</td>
                          <td className="p-2 text-xs">{new Date(customer.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Diagnostic Info */}
      <div className="bg-card rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Diagnostic Information</h2>
        <div className="space-y-4 font-mono text-xs">
          <div>
            <div className="mb-2 font-semibold">Expected Behavior:</div>
            <ul className="text-muted-foreground list-inside list-disc space-y-1">
              <li>Clerk org_id should match get_current_org_id() result</li>
              <li>You should only see customers from your organization</li>
              <li>All visible customers should have org_id = {orgId}</li>
            </ul>
          </div>

          <div>
            <div className="mb-2 font-semibold">If Issues Detected:</div>
            <ul className="text-muted-foreground list-inside list-disc space-y-1">
              <li>Check Clerk JWT template includes org_id claim</li>
              <li>Verify Supabase Clerk integration is enabled</li>
              <li>Ensure RLS policies are active (should show above)</li>
              <li>Check browser console for JWT token errors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
