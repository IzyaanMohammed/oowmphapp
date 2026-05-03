"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { Sparkles, ShieldCheck, ArrowRight, Lock } from "lucide-react";

const STAFF_CODE = "MPH-2024";
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
      toast({ title: "Admin Access Granted", description: "Full system privileges unlocked." });
      router.push("/dashboard");
    } else if (code === STAFF_CODE) {
      login('staff');
      toast({ title: "Access Granted", description: "Welcome to MPH Booking Central." });
      router.push("/dashboard");
    } else {
      toast({ variant: "destructive", title: "Access Denied", description: "The provided access code is incorrect." });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0b] selection:bg-primary/30">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-blue-500/10" />
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-[120px] animate-pulse" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px] animate-pulse duration-700" />
      
      <div className="relative w-full max-w-md px-6 animate-in fade-in zoom-in duration-700">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 rounded-2xl bg-white/5 p-4 shadow-2xl backdrop-blur-xl border border-white/10 ring-1 ring-white/20">
            <Logo className="h-12 w-12" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">MPH <span className="text-primary">Central</span></h1>
          <p className="text-muted-foreground font-medium text-sm tracking-widest uppercase">Multi-Tier Portal System</p>
        </div>

        <Card className="border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Authorization
            </CardTitle>
            <CardDescription className="text-gray-400">
              Enter Staff or Administrator access key.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="access-code" className="text-sm font-semibold text-gray-300">Access Key</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="access-code"
                    type="password"
                    placeholder="••••••••••••"
                    className="h-12 pl-10 bg-black/40 border-white/10 text-white placeholder:text-gray-600 focus:ring-primary/50 focus:border-primary transition-all rounded-xl"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button 
                className="group relative w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold transition-all overflow-hidden rounded-xl shadow-lg shadow-primary/20" 
                type="submit" 
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? "Verifying..." : "Enter Workspace"}
                  {!isLoading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center flex items-center justify-center gap-2 text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
          <Sparkles className="h-3 w-3" /> Secure Multimodal Access · v2.1
        </div>
      </div>
    </div>
  );
}
