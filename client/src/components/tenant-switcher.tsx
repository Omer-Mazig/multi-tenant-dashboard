import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";
import { getTenantUrl, getCurrentTenantId } from "../lib/domain";

export function TenantSwitcher() {
  const { user } = useAuth();
  const currentTenantId = getCurrentTenantId();

  // If no user or no tenants, don't render anything
  if (!user || !user.tenants?.length) {
    return null;
  }

  const switchTenant = (newTenant: string) => {
    if (newTenant === currentTenantId) return;

    // Use the domain utility to get the tenant URL
    const newUrl = getTenantUrl(newTenant);
    console.log(`Switching tenant from ${currentTenantId} to ${newTenant}`);
    console.log(`Redirecting to ${newUrl}`);

    // Redirect to the new tenant subdomain
    window.location.href = newUrl;
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      <span className="text-sm text-gray-500">Switch tenant:</span>
      {user.tenants.map((tenant) => (
        <Button
          key={tenant}
          size="sm"
          variant={tenant === currentTenantId ? "default" : "outline"}
          onClick={() => switchTenant(tenant)}
          className="text-xs"
        >
          {tenant}
        </Button>
      ))}
    </div>
  );
}
