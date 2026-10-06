"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { ArrowRight, Lock } from "lucide-react";

const STAFF_CODE = "MPH-2026";
const ADMIN_CODE = "ADMIN123";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (code === ADMIN_CODE) {
      login('admin');
      toast({ title: "Authorized", description: "Administrative session established." });
      router.push("/dashboard");
    } else if (code === STAFF_CODE) {
      login('staff');
      toast({ title: "Authorized", description: "Staff session established." });
      router.push("/dashboard");
    } else {
      toast({ variant: "destructive", title: "Invalid Key", description: "The provided security key is not recognized." });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
      <div className="relative z-10 w-full max-w-[380px] px-6">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center bg-white text-black border border-white">
            <Logo className="h-8 w-8 text-black fill-black" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">MPH@OOW</h1>
          <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest">Operations Portal</p>
        </div>

        <div className="border border-zinc-800 bg-zinc-950 p-8 shadow-none">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="access-code" className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Security Key
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  id="access-code"
                  type="password"
                  placeholder="••••••••••••"
                  className="h-11 pl-10 bg-black border-zinc-700 text-white placeholder:text-zinc-600 focus:border-white transition-all rounded-none text-sm font-mono"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button 
              className="w-full h-11 bg-white hover:bg-zinc-200 text-black font-bold transition-all rounded-none text-xs uppercase tracking-wider" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Enter Workspace"}
              {!isLoading && <ArrowRight className="ml-2 h-3.5 w-3.5" />}
            </Button>
          </form>
        </div>

        <div className="mt-12 text-center text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
          System Core v4.2
        </div>
      </div>
    </div>
  );
}
