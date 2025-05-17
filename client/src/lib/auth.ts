import { AxiosError } from "axios";
import { authApi, userApi } from "./api";
import {
  isLoginDomain,
  isTenantDomain,
  getCurrentTenantId,
  getTenantUrl,
} from "./domain";
import type { LoginFormData } from "../schemas/user";
import type { User } from "@/schemas/user";

interface LoginResponse {
  user: User;
  tenants: string[];
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await authApi.login({ email, password } as LoginFormData);
    return data;
  }

  async logout(): Promise<void> {
    await authApi.logout();
  }

  async loginToTenant(tenantId: string): Promise<void> {
    // Use the correct endpoint based on our API structure
    try {
      // For login domain, send request to init-session and handle redirect in frontend
      console.log(`Requesting tenant session for: ${tenantId}`);
      const data = await authApi.initTenantSession(tenantId);

      console.log("Response data received:", data);

      // Check if the response has the expected data structure
      if (data && typeof data === "object" && data.success) {
        console.log(
          `Got token for tenant ${tenantId}: ${data.token.substring(0, 10)}...`
        );

        // Create the tenant URL with token as query parameter
        const redirectUrl = getTenantUrl(tenantId, `/?token=${data.token}`);
        console.log(`Redirecting to: ${redirectUrl}`);

        // Open a new tab with the modified redirect URL
        window.open(redirectUrl, "_blank");

        return;
      } else {
        console.error("Invalid response format:", data);
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Failed to login to tenant", error);
      throw error;
    }
  }

  async getMe(): Promise<User> {
    try {
      // Use the userApi function that selects the correct endpoint based on domain
      const userData = await userApi.getMe();
      return userData;
    } catch (error) {
      console.error("Failed to get user data:", error);
      throw error;
    }
  }

  async validateSession(): Promise<boolean> {
    try {
      const data = await authApi.validateSession();
      return data.valid;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return false;
      }
      throw error;
    }
  }

  getHostname(): string {
    return window.location.hostname;
  }

  isTenantDomain(): boolean {
    return isTenantDomain();
  }

  isLoginDomain(): boolean {
    return isLoginDomain();
  }

  getCurrentTenantId(): string | null {
    return getCurrentTenantId();
  }
}

export const authService = new AuthService();
