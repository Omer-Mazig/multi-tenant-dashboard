import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";

export default function TenantSelectPage() {
  const { user, error, loginToTenant, logout, isLoading } = useAuth();
  const [isLoadingTenant, setIsLoadingTenant] = useState<
    Record<string, boolean>
  >({});
  const [localError, setLocalError] = useState<string | null>(null);

  // Debug auth state
  useEffect(() => {
    console.log("TenantSelectPage - Auth state:", {
      hasUser: !!user,
      userTenants: user?.tenants,
      isLoading,
    });
  }, [user, isLoading]);

  const handleTenantSelect = async (tenant: string) => {
    try {
      setLocalError(null);
      setIsLoadingTenant((prev) => ({ ...prev, [tenant]: true }));

      await loginToTenant(tenant);

      // Reset loading state
      setIsLoadingTenant((prev) => ({ ...prev, [tenant]: false }));
    } catch (err) {
      console.error("Failed to login to tenant:", err);
      setLocalError("Failed to connect to tenant. Please try again.");
      setIsLoadingTenant((prev) => ({ ...prev, [tenant]: false }));
    }
  };

  const handleLogout = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
      // Force a reload as fallback
      window.location.href = "/login";
    }
  };

  // Show loading state if auth is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="text-lg font-medium">Loading...</div>
          <div className="mt-2 text-sm text-gray-500">
            Please wait while we load your tenant information
          </div>
        </div>
      </div>
    );
  }

  // Show message if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Not Authenticated
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please login first to access your tenants
            </p>
          </div>
          <div className="mt-5">
            <a
              href="/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no tenants available
  if (!user.tenants?.length) {
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
            <a
              href="#"
              onClick={handleLogout}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign Out
            </a>
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

        {(error || localError) && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error || localError}</div>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {user.tenants.map((tenant) => (
            <button
              key={tenant}
              onClick={() => handleTenantSelect(tenant)}
              disabled={isLoadingTenant[tenant]}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoadingTenant[tenant] ? "Loading..." : tenant}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <a
            href="#"
            onClick={handleLogout}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign Out
          </a>
        </div>
      </div>
    </div>
  );
}
