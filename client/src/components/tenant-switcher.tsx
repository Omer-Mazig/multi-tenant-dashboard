// import { useAuth } from "../lib/auth-context";
// import { Button } from "./ui/button";

// export function TenantSwitcher() {
//   const { tenantId } = useAuth();
//   const availableTenants = ["acme", "globex"];

//   const switchTenant = (newTenant: string) => {
//     if (newTenant === tenantId) return;

//     const port = window.location.port ? `:${window.location.port}` : "";
//     const path = window.location.pathname;
//     const search = window.location.search;
//     const hash = window.location.hash;

//     // Create the new URL with the selected tenant
//     const newUrl = `http://${newTenant}.lvh.me${port}${path}${search}${hash}`;
//     console.log(`Switching tenant from ${tenantId} to ${newTenant}`);
//     console.log(`Redirecting to ${newUrl}`);

//     // Redirect to the new tenant subdomain
//     window.location.href = newUrl;
//   };

//   return (
//     <div className="flex items-center space-x-2 mb-4">
//       <span className="text-sm text-gray-500">Switch tenant:</span>
//       {availableTenants.map((tenant) => (
//         <Button
//           key={tenant}
//           size="sm"
//           variant={tenant === tenantId ? "default" : "outline"}
//           onClick={() => switchTenant(tenant)}
//           className="text-xs"
//         >
//           {tenant}
//         </Button>
//       ))}
//     </div>
//   );
// }
