import { useAuth } from "@/context/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  
  return (
    <Sidebar variant="sidebar" className="border-r border-zinc-200 shadow-none bg-white">
      <SidebarHeader className="h-16 flex items-center px-6 border-b border-zinc-200">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Logo className="h-7 w-7 text-black" />
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-black">
              MPH@OOW
            </span>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={pathname === "/dashboard" || pathname === "/"} 
              className="h-10 px-3 rounded-none data-[active=true]:bg-black data-[active=true]:text-white font-semibold"
            >
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                <span>Overview</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-zinc-200">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-none bg-black text-white flex items-center justify-center font-bold text-xs">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold truncate leading-none text-black">{user?.name || 'User'}</span>
              <span className="text-[11px] text-zinc-500 truncate mt-1">{user?.email || 'staff@mph.com'}</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={logout} 
            className="w-full justify-start h-9 text-xs font-bold rounded-none border-zinc-300 hover:bg-black hover:text-white transition-all"
          >
            <LogOut className="mr-2 h-3.5 w-3.5" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
