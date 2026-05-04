"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { ShieldCheck, ArrowRight, Lock } from "lucide-react";

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b]">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      
      <div className="relative z-10 w-full max-w-[400px] px-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl transition-transform hover:scale-105 duration-500">
            <Logo className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white mb-1.5">MPH Central</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em]">Operational Intelligence</p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-2xl shadow-2xl ring-1 ring-white/5">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="access-code" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">
                Security Access Key
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                <Input
                  id="access-code"
                  type="password"
                  placeholder="••••••••••••"
                  className="h-12 pl-12 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-700 focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all rounded-xl"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button 
              className="w-full h-12 bg-white hover:bg-zinc-200 text-black font-bold transition-all rounded-xl shadow-xl active:scale-[0.98] group" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Enter Workspace"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>
        </div>

        <div className="mt-16 flex items-center justify-center gap-4 text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-bold">
          <span className="h-[1px] w-6 bg-zinc-800" />
          Secure Multimodal Access v4.2
          <span className="h-[1px] w-6 bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
