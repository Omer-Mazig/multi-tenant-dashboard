import { useIdleTimeout } from "@/hooks/use-idle-timeout";
import { useSessionSync } from "@/hooks/use-session-sync";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

const IDLE_TIMEOUT = 5 * 1000; // 5 seconds for demo, would be longer in production

export default function TenantDashboard() {
  const { user, logout } = useAuth();
  const tenantId = window.location.hostname.split(".")[0]; // Extract tenant ID from hostname

  // Set up session synchronization across tabs
  useSessionSync({
    onInvalidSession: logout,
    tenantId,
  });

  // Set up idle timeout with tenant context
  useIdleTimeout({
    onIdle: () => {
      console.log(
        `User has been idle for ${IDLE_TIMEOUT}ms, logging out ALL tenant tabs for security`
      );
      logout({ isIdle: true, notifyOtherTabs: true });
    },
    idleTime: IDLE_TIMEOUT,
    tenantId: tenantId,
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="space-y-1 bg-primary/5">
          <CardTitle className="text-2xl font-bold text-center text-primary">
            Welcome to Your Dashboard
          </CardTitle>
          <p className="text-muted-foreground text-center">
            Tenant Portal: {tenantId}
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-center gap-4 p-4 bg-white rounded-lg border">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-medium mb-1">Last Login</h3>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-medium mb-1">Session Status</h3>
              <p className="text-sm text-green-600">Active</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline">View Profile</Button>
          <Button
            variant="destructive"
            onClick={() => logout()}
            className="px-6"
          >
            Logout
          </Button>

          <p className="text-sm text-gray-500">
            You will be automatically logged out after 20 minutes of inactivity
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
