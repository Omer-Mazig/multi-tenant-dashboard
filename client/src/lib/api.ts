import axios from "axios";
import type { LoginFormData } from "../schemas/user";
import { isLoginDomain, isTenantDomain } from "./domain";

// Determine the API base URL based on current hostname
const getBaseUrl = () => {
  const hostname = window.location.hostname;
  const port = "5173"; // Backend port

  console.log("API: Getting base URL for hostname:", hostname);

  // Always use the current hostname for API requests to preserve tenant context
  const url = `http://${hostname}:${port}/api`;
  console.log("API: Using base URL:", url);
  return url;
};

// Create axios instance with default config
const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true, // Important for cookies
});

// Log all requests for debugging
api.interceptors.request.use(async (config) => {
  console.log(
    `API Request: ${config.method?.toUpperCase()} ${config.baseURL}${
      config.url
    }`,
    config.data || ""
  );
  return config;
});

// Log all responses for debugging
api.interceptors.response.use(
  (response) => {
    console.log(
      `API Response: ${response.status} ${response.config.url}`,
      response.data
    );
    return response;
  },
  (error) => {
    console.error(
      `API Error: ${error.response?.status || "Network Error"} ${
        error.config?.url || ""
      }`,
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  // Common endpoints
  login: async (data: LoginFormData) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
  validateSession: async () => {
    const response = await api.get("/auth/validate-session");
    return response.data;
  },
  // Login domain specific
  initTenantSession: async (tenantId: string) => {
    const response = await api.get(`/auth/init-session/${tenantId}`);
    return response.data;
  },
};

// Tenant API
export const tenantApi = {
  verifyToken: async (token: string) => {
    console.log("Verifying token:", token);
    const response = await api.get(`/tenant/verify-token/${token}`);
    console.log("Token verification response:", response.data);
    return response.data;
  },
  getDashboard: async () => {
    const response = await api.get("/tenant/dashboard");
    return response.data;
  },
  ping: async () => {
    const response = await api.get("/tenant/ping");
    return response.data;
  },
};

// User API
export const userApi = {
  getMe: async () => {
    // Dynamic endpoint based on domain
    const endpoint = isLoginDomain() ? "/users/login/me" : "/users/tenant/me";

    const response = await api.get(endpoint);
    return response.data;
  },
};

// Track if we're already on the login page to prevent redirect loops
const isLoginPage = () => {
  return window.location.pathname === "/login";
};

// Add request interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors, but only if we're not already on the login page
    if (error.response?.status === 401 && !isLoginPage()) {
      const onTenantDomain = isTenantDomain();
      if (onTenantDomain) {
        console.log(
          "Unauthorized on tenant domain - redirecting to local /login"
        );
        window.location.href = "/login";
      } else {
        console.log("Unauthorized on login domain - redirecting to /login");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export { isLoginDomain, isTenantDomain };
export default api;
