import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "../schemas/user";
import { useAuth } from "../lib/auth-context";
import type { LoginFormData } from "../schemas/user";

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

export default function LoginPage() {
  const { login, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get("tenantId");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "john@example.com",
      password: "password123",
    },
  });

  // Update the form values when the tenant changes
  useEffect(() => {
    if (tenantId) {
      console.log(`Tenant redirect detected: ${tenantId}`);
    }

    reset({
      email: "john@example.com",
      password: "password123",
    });
  }, [reset, tenantId]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Logging in with email ${data.email}`);
      await login(data.email, data.password);

      // If there's a tenantId in the URL, redirect to that tenant
      if (tenantId) {
        console.log(`Redirecting to tenant: ${tenantId}`);
        window.location.href = `http://login.lvh.me:3000/api/auth/login/${tenantId}`;
        return;
      }

      // Otherwise navigate to dashboard
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            {tenantId
              ? `Login to access ${tenantId.toUpperCase()}`
              : "Login to Application"}
          </CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading
                ? "Logging in..."
                : tenantId
                ? `Login to ${tenantId.toUpperCase()}`
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
            <p>john@example.com / password123</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
