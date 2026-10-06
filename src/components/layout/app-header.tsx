"use client";

import { Search, LayoutDashboard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationIcon } from "@/components/notification-icon";
import { UserNav } from "@/components/user-nav";

interface AppHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function AppHeader({ searchQuery, setSearchQuery }: AppHeaderProps) {
  return (
    <header className="flex h-16 items-center gap-4 border-b border-zinc-200 bg-white dark:bg-black px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-none transition-colors border border-transparent hover:border-zinc-300" />
        <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden md:block" />
        <div className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black dark:text-white">
          <LayoutDashboard className="h-4 w-4" />
          <span>MPH@OOW</span>
        </div>
      </div>
      
      <div className="flex flex-1 items-center justify-end gap-4 md:gap-8">
        <form className="max-w-md w-full hidden sm:block" onSubmit={(e) => e.preventDefault()}>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-focus-within:text-black transition-colors" />
            <Input
              type="search"
              placeholder="Search appointments, teachers..."
              className="h-9 pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-black transition-all rounded-none w-full text-xs font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
        
        <div className="flex items-center gap-2">
          <NotificationIcon />
          <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1" />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
