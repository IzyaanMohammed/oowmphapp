"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_BOOKERS, type Booker } from "@/lib/mock-data";
import { saveBooker, deleteBooker } from "@/app/actions";
import { Trash2, Plus, ShieldCheck, Users, Lock } from "lucide-react";

interface AdminClientProps {
  initialBookers: Booker[];
}

export function AdminClient({ initialBookers }: AdminClientProps) {
  const { toast } = useToast();
  const [bookers, setBookers] = useState<Booker[]>(initialBookers);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      toast({ variant: "destructive", title: "Both name and email are required." });
      return;
    }

    const already = [
      ...DEFAULT_BOOKERS,
      ...bookers,
    ].some((b) => b.name.toLowerCase() === trimmedName.toLowerCase());

    if (already) {
      toast({ variant: "destructive", title: "A booker with that name already exists." });
      return;
    }

    startTransition(async () => {
      const saved = await saveBooker({ name: trimmedName, email: trimmedEmail });
      setBookers((prev) => [...prev, saved as Booker]);
      setName("");
      setEmail("");
      toast({ title: "Booker Added", description: `${trimmedName} has been added.` });
    });
  };

  const handleDelete = (booker: Booker) => {
    if (!window.confirm(`Remove ${booker.name} from the bookers list?`)) return;
    startTransition(async () => {
      await deleteBooker((booker as any).id);
      setBookers((prev) => prev.filter((b) => (b as any).id !== (booker as any).id));
      toast({ title: "Booker Removed", description: `${booker.name} has been removed.` });
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-6 py-4 flex items-center gap-3">
        <div className="h-9 w-9 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">Admin Panel</h1>
          <p className="text-xs text-zinc-500 font-medium">Manage MPH bookers and their contact emails</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Add booker form */}
        <section className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="border-b border-zinc-200 dark:border-zinc-800 px-5 py-3 bg-zinc-50 dark:bg-zinc-900 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="text-sm font-bold uppercase tracking-wider">Add Custom Booker</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Full Name</label>
                <Input
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 px-3 text-xs rounded-none bg-white dark:bg-black border-zinc-300 focus:border-black"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Email Address</label>
                <Input
                  placeholder="e.g. john.d_oow@gemsedu.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 px-3 text-xs rounded-none bg-white dark:bg-black border-zinc-300 focus:border-black"
                  type="email"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleAdd}
                disabled={isPending}
                className="h-9 px-5 text-xs font-bold rounded-none bg-black hover:bg-zinc-800 text-white border border-black"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Booker
              </Button>
            </div>
          </div>
        </section>

        {/* Custom bookers from DB */}
        {bookers.length > 0 && (
          <section className="border border-zinc-200 dark:border-zinc-800">
            <div className="border-b border-zinc-200 dark:border-zinc-800 px-5 py-3 bg-zinc-50 dark:bg-zinc-900 flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-bold uppercase tracking-wider">Custom Bookers ({bookers.length})</span>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {bookers.map((b) => (
                <div key={(b as any).id || b.name} className="flex items-center justify-between px-5 py-3 gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{b.name}</p>
                    <p className="text-xs font-mono text-zinc-500 truncate">{b.email}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(b)}
                    disabled={isPending}
                    className="h-8 w-8 p-0 rounded-none border-zinc-300 hover:border-red-400 hover:bg-red-50 hover:text-red-600 shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Predefined (read-only) bookers */}
        <section className="border border-zinc-200 dark:border-zinc-800">
          <div className="border-b border-zinc-200 dark:border-zinc-800 px-5 py-3 bg-zinc-50 dark:bg-zinc-900 flex items-center gap-2">
            <Lock className="h-4 w-4 text-zinc-400" />
            <span className="text-sm font-bold uppercase tracking-wider">Predefined Bookers</span>
            <span className="ml-auto text-xs text-zinc-400 font-medium">Read-only · {DEFAULT_BOOKERS.length} entries</span>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {[...DEFAULT_BOOKERS].sort((a, b) => a.name.localeCompare(b.name)).map((b) => (
              <div key={b.name} className="flex items-center justify-between px-5 py-2.5 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{b.name}</p>
                  <p className="text-xs font-mono text-zinc-400 truncate">{b.email}</p>
                </div>
                <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider shrink-0">Built-in</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
