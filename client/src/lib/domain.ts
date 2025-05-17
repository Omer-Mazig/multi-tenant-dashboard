// Centralized domain utility functions

/**
 * Determine if the current hostname is a login domain
 */
export function isLoginDomain(): boolean {
  return window.location.hostname === "login.lvh.me";
}

/**
 * Determine if the current hostname is a tenant domain
 */
export function isTenantDomain(): boolean {
  const hostname = window.location.hostname;

  // Check if we're on the login domain first
  if (hostname === "login.lvh.me") {
    return false;
  }

  // Check if we're on a valid tenant subdomain
  if (hostname.endsWith(".lvh.me")) {
    const subdomain = hostname.split(".")[0];
    return subdomain !== "login";
  }

  return false;
}

/**
 * Extract the tenant ID from the current hostname
 */
export function getCurrentTenantId(): string | null {
  if (!isTenantDomain()) {
    return null;
  }

  const hostname = window.location.hostname;
  return hostname.split(".")[0];
}

/**
 * Generate URL for a tenant domain
 */
export function getTenantUrl(tenantId: string, path: string = "/"): string {
  const port = window.location.port ? `:${window.location.port}` : "";
  return `http://${tenantId}.lvh.me${port}${path}`;
}

/**
 * Generate URL for the login domain
 */
export function getLoginUrl(path: string = "/"): string {
  const port = window.location.port ? `:${window.location.port}` : "";
  return `http://login.lvh.me${port}${path}`;
}
