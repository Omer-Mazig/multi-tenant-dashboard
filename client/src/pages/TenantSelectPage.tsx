import { useAuth } from "../hooks/useAuth";

export default function TenantSelectPage() {
  const { user, loginToTenant, logout, error, isLoading } = useAuth();

  const handleTenantSelect = async (tenantId: string) => {
    try {
      await loginToTenant(tenantId);
    } catch (err: unknown) {
      console.error("Failed to login to tenant", err);
      // Error is handled by the auth context
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: unknown) {
      console.error("Failed to logout", err);

      // Error is handled by the auth context
    }
  };

  if (!user?.tenants?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              No Available Tenants
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              You don't have access to any tenants.
            </p>
          </div>
          <div className="mt-5">
            <button
              onClick={handleLogout}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Select a Tenant
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose a tenant to access
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {user.tenants.map((tenant) => (
            <button
              key={tenant}
              onClick={() => handleTenantSelect(tenant)}
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {tenant}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <button
            onClick={handleLogout}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
