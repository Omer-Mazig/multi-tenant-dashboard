import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../lib/auth";
import { isTenantDomain, getLoginUrl, getCurrentTenantId } from "../lib/domain";
import { tenantApi } from "../lib/api";
import type { User } from "../schemas/user";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User | void>;
  logout: () => Promise<void>;
  loginToTenant: (tenantId: string) => Promise<void>;
  validateSession: () => Promise<boolean>;
}

// Define a type for API errors
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenProcessed, setTokenProcessed] = useState(false);

  // First priority: Check and process token if present
  useEffect(() => {
    const processToken = async () => {
      try {
        // Check if there's a token in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (!token) {
          setTokenProcessed(true);
          return; // No token to process
        }

        console.log(`Found token in URL: ${token.substring(0, 10)}...`);

        // Skip token verification on login domain (not meant for tokens)
        if (!isTenantDomain()) {
          console.log("Not on tenant domain - skipping token verification");
          // Remove token from URL by replacing current URL without the token
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
          setTokenProcessed(true);
          return;
        }

        // Verify the token with the API
        console.log("Verifying token with API...");
        const result = await tenantApi.verifyToken(token);
        console.log("Token verified successfully!", result);

        // Remove token from URL by replacing current URL without the token
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);

        // Load user data immediately
        try {
          const userData = await authService.getMe();
          console.log("User data loaded:", userData);
          setUser(userData);
        } catch (err) {
          console.error(
            "Could not load user data after token verification:",
            err
          );
        }

        setTokenProcessed(true);
      } catch (err) {
        console.error("Token processing error:", err);
        setTokenProcessed(true);
      }
    };

    processToken();
  }, []);

  // Second priority: Initialize auth state after token processing
  useEffect(() => {
    // Wait for token processing to complete before checking session
    if (!tokenProcessed) return;

    const initAuth = async () => {
      try {
        // Skip additional session validation if we already have a user (from token)
        if (user) {
          console.log(
            "User already loaded from token - skipping session validation"
          );
          setIsLoading(false);
          return;
        }

        console.log("Validating session...");
        try {
          const isValid = await authService.validateSession();
          if (isValid) {
            console.log("Session is valid, loading user data");
            const userData = await authService.getMe();
            setUser(userData);
          } else {
            console.log("No valid session found");
            setUser(null);
          }
        } catch (validationError) {
          console.error("Session validation failed:", validationError);
          setUser(null);
        }
      } catch (err: unknown) {
        console.error("Auth initialization error:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [tokenProcessed, user]);

  // Set up session validation interval
  useEffect(() => {
    if (isTenantDomain()) {
      console.log("Setting up session validation interval for tenant domain");
      const interval = setInterval(async () => {
        console.log("Validating session (periodic check)...");
        try {
          const isValid = await authService.validateSession();
          if (!isValid && user) {
            console.log("Session no longer valid - logging out");
            setUser(null);
            window.location.href = `/login?tenant=${getCurrentTenantId()}`;
          }
        } catch (err) {
          console.error("Periodic session validation failed:", err);
        }
      }, 5 * 60 * 1000); // Check every 5 minutes

      return () => clearInterval(interval);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authService.login(email, password);
      setUser(response.user);
      return response.user;
    } catch (err: unknown) {
      console.error("Failed to login", err);
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await authService.logout();
      setUser(null);

      // If we're on a tenant domain, redirect to the login page on the same domain
      if (isTenantDomain()) {
        const tenant = getCurrentTenantId();
        window.location.href = `/login?tenant=${tenant}`;
      } else {
        // On login domain, just redirect to login
        window.location.href = getLoginUrl("/login");
      }
    } catch (err: unknown) {
      console.error("Failed to logout", err);
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || "Logout failed");
      throw err;
    }
  };

  const loginToTenant = async (tenantId: string) => {
    try {
      setError(null);
      console.log(`Initiating tenant login to: ${tenantId}`);
      await authService.loginToTenant(tenantId);
    } catch (err: unknown) {
      console.error("Failed to login to tenant", err);
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || "Tenant login failed");
      throw err;
    }
  };

  const validateSession = async () => {
    try {
      return await authService.validateSession();
    } catch (err: unknown) {
      console.error("Failed to validate session", err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        loginToTenant,
        validateSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
