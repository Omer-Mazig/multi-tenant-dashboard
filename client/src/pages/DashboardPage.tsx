import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { useEffect, useState } from "react";
import { authService } from "../lib/auth";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [currentTenant, setCurrentTenant] = useState<string | null>(null);

  useEffect(() => {
    const tenantId = authService.getCurrentTenantId();
    console.log("Dashboard loaded with tenant ID:", tenantId);
    setCurrentTenant(tenantId);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Error is handled by the auth context
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.name || "User"}</p>
          {currentTenant && (
            <p className="text-blue-600 font-medium">Tenant: {currentTenant}</p>
          )}
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Secure Dashboard</CardTitle>
          <CardDescription>
            {currentTenant
              ? `You are logged in to ${currentTenant} tenant`
              : "You are logged in"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-medium mb-2">Your Account</h3>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            {currentTenant && (
              <p className="mt-2">
                <strong>Current Tenant:</strong> {currentTenant}
              </p>
            )}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Your Tenants</h3>
            {user?.tenants && user.tenants.length > 0 ? (
              user.tenants.map((tenant) => (
                <div
                  key={tenant}
                  className={`flex items-center justify-between p-2 border rounded ${
                    currentTenant === tenant ? "bg-blue-50 border-blue-200" : ""
                  }`}
                >
                  <span>
                    <strong>{tenant}</strong>
                    {currentTenant === tenant && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Current
                      </span>
                    )}
                  </span>
                  {currentTenant !== tenant && (
                    <button
                      onClick={() => {
                        const redirectUrl = `http://login.lvh.me:5173/api/auth/init-session/${tenant}`;
                        console.log(`Switching to tenant: ${tenant}`);
                        window.open(redirectUrl, "_blank");
                      }}
                      className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Login to {tenant}
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No tenants available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
