"use client";

import { Search, LayoutDashboard, Bell, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationIcon } from "@/components/notification-icon";
import { UserNav } from "@/components/user-nav";
import { Logo } from "@/components/icons";
import { Badge } from "@/components/ui/badge";

interface AppHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function AppHeader({ searchQuery, setSearchQuery }: AppHeaderProps) {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-white px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="p-2 hover:bg-muted rounded-lg transition-colors" />
        <div className="h-6 w-[1px] bg-border hidden md:block" />
        <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-foreground/80">
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </div>
      </div>
      
      <div className="flex flex-1 items-center justify-end gap-4 md:gap-8">
        <form className="max-w-md w-full hidden sm:block" onSubmit={(e) => e.preventDefault()}>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="search"
              placeholder="Quick search..."
            className="h-9 pl-10 bg-muted/50 border-border focus:ring-primary/20 transition-all rounded-lg w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
        
        <div className="flex items-center gap-2">
          <NotificationIcon />
          <div className="h-8 w-[1px] bg-border mx-2" />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
