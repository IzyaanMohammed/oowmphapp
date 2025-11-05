'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Home,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons";
import { useAuth } from "../auth-provider";

export function AppSidebar() {
  const { logout } = useAuth();
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-lg font-semibold font-headline">
            MPH Central
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive
              tooltip={{ children: "Dashboard" }}
            >
              <Link href="/dashboard">
                <Home />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip={{ children: "Log Out" }}>
                <LogOut />
                <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
