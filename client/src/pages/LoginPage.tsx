import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { isTenantDomain, getCurrentTenantId } from "../lib/domain";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";

// Default credentials from user.service.ts
const DEFAULT_EMAIL = "john@example.com";
const DEFAULT_PASSWORD = "password123";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError, isLoading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get("tenantId") || searchParams.get("tenant");
  const token = searchParams.get("token");
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect if we're on a tenant domain
  const onTenantDomain = isTenantDomain();
  const currentTenantId = getCurrentTenantId();

  // Check if we came from a protected route
  const from = location.state?.from || "/";

  useEffect(() => {
    // If user navigated directly to /login on a tenant domain, show tenant-specific UI
    if (onTenantDomain && currentTenantId) {
      console.log(`On login page for tenant: ${currentTenantId}`);
    }

    // If we have a token in the URL, we should process it immediately
    if (token) {
      console.log("Found token in URL - will be processed by AuthProvider");
    }

    // If there's a tenant parameter, it may indicate we were redirected here
    if (tenantId && !onTenantDomain) {
      console.log(
        `Login with tenant parameter: ${tenantId} (on non-tenant domain)`
      );
    } else if (tenantId && onTenantDomain) {
      console.log(
        `Login with tenant parameter: ${tenantId} (matches current domain: ${currentTenantId})`
      );
    }
  }, [onTenantDomain, currentTenantId, token, tenantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Logging in with email ${email}`);

      // Login differently based on domain context
      if (onTenantDomain && currentTenantId) {
        console.log(
          `Attempting login directly on tenant domain: ${currentTenantId}`
        );
        // Login and then navigate to root of tenant domain or back where user came from
        await login(email, password);

        // Navigate back to the original route or to root
        navigate(from === "/login" ? "/" : from, { replace: true });
      } else {
        // On login domain
        const userData = await login(email, password);

        console.log("Login successful, user data:", userData);

        // If there's a tenantId in the URL, redirect to that tenant
        if (tenantId) {
          console.log(`Redirecting to tenant: ${tenantId}`);
          // Use window.location for proper redirect with domain change
          window.location.href = `http://${tenantId}.lvh.me:5173`;
          return;
        }

        // Otherwise navigate to select-tenant page using window.location for full page reload
        // This ensures a clean context when loading the page
        console.log("Redirecting to select-tenant page");
        window.location.href = `${window.location.origin}/select-tenant`;
      }
    } catch (error) {
      console.error("Login error:", error);
      // Error is handled by the auth context, but we'll also set it here
      setError(authError || "Login failed. Please check your credentials.");
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Determine the display tenant ID (prioritize what's in the URL)
  const displayTenantId = tenantId || (onTenantDomain ? currentTenantId : null);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            {displayTenantId
              ? `Login to ${displayTenantId.toUpperCase()}`
              : "Login to Application"}
          </CardTitle>
          <CardDescription>
            Enter your credentials to access your account
            {from !== "/login" && from !== "/" && (
              <div className="mt-1 text-xs text-amber-600">
                You'll be redirected to {from} after login
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || authError) && (
              <Alert variant="destructive">
                <AlertDescription>{error || authError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || authLoading}
            >
              {isLoading || authLoading
                ? "Logging in..."
                : displayTenantId
                ? `Login to ${displayTenantId.toUpperCase()}`
                : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-sm text-gray-500">
            This is a secure multi-tenant application
          </p>
          <div className="text-xs text-gray-400">
            <p>Demo accounts:</p>
            <p>
              {DEFAULT_EMAIL} / {DEFAULT_PASSWORD}
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
