import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import type { ReactNode } from "react";
import {
  isTenantDomain,
  isLoginDomain,
  getCurrentTenantId,
} from "../lib/domain";

export interface ProtectedRouteProps {
  requireLogin?: boolean;
  requireTenant?: boolean;
  children: ReactNode;
}

export function ProtectedRoute({
  requireLogin = true,
  requireTenant = false,
  children,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Only validate domain context if user is already authenticated
    if (!isLoading && user) {
      const onTenantDomain = isTenantDomain();
      const onLoginDomain = isLoginDomain();
      const currentTenantId = getCurrentTenantId();

      console.log("ProtectedRoute checks:", {
        requireTenant,
        onTenantDomain,
        onLoginDomain,
        hasUser: !!user,
        pathname: location.pathname,
        userTenants: user.tenants,
        currentTenantId,
      });

      // Domain context validations for authenticated users
      if (requireTenant && !onTenantDomain) {
        // User is on a non-tenant domain but route requires tenant context
        console.log(
          "Tenant route on non-tenant domain - no action taken, will render login select"
        );
        // No redirect - let the routing handle this case
      } else if (
        !requireTenant &&
        onTenantDomain &&
        user.tenants?.length &&
        currentTenantId !== null
      ) {
        // This is a route that doesn't require tenant context but we're on a tenant domain
        // and we have tenants available - let's render the content here without redirecting
        console.log("Non-tenant route on tenant domain - rendering content");
        // Continue with rendering the children
      }
    }
  }, [isLoading, user, requireTenant, location.pathname]);

  // Show loading state only briefly to prevent flash
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg font-medium">Loading...</div>
          <div className="mt-2 text-sm text-gray-500">
            Please wait while we verify your session
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated and login required, redirect to login page
  if (requireLogin && !user) {
    // Always navigate to local /login path regardless of domain
    // On tenant domains, add the tenant parameter
    const tenant = getCurrentTenantId();
    const loginPath = tenant ? `/login?tenant=${tenant}` : "/login";

    console.log(`Unauthenticated - navigating to ${loginPath}`);
    return (
      <Navigate to={loginPath} replace state={{ from: location.pathname }} />
    );
  }

  // If tenant is required but user has no tenants, redirect to select-tenant
  if (requireTenant && user && !user.tenants?.length) {
    return (
      <Navigate
        to="/select-tenant"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // If we're on login domain but need tenant context and have tenants,
  // we don't automatically redirect - the TenantSelectPage will handle this

  return <>{children}</>;
}
