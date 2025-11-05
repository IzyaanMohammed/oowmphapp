"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";

const ACCESS_CODE = "mphsessionusercode3579";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (code === ACCESS_CODE) {
      login();
      toast({
        title: "Access Granted",
        description: "Welcome to MPH Booking Central.",
      });
      router.push("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "The provided access code is incorrect.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center">
          <Logo className="mb-2 h-12 w-12" />
          <CardTitle className="text-2xl font-headline">
            MPH Booking Central
          </CardTitle>
          <CardDescription>
            Enter the access code to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="access-code">Access Code</Label>
                <Input
                  id="access-code"
                  type="password"
                  placeholder="••••••••••••"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Enter"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
