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
import { Home, LogOut, LayoutDashboard, Megaphone, Wrench, PenTool, Users } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  
  return (
    <Sidebar variant="sidebar" className="border-r shadow-none bg-white">
      <SidebarHeader className="h-16 flex items-center px-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Logo className="h-7 w-7 text-primary" />
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-foreground">
              MPH Central
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
              className="h-10 px-3 rounded-md data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
            >
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                <span className="font-semibold">Overview</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-md bg-primary text-white flex items-center justify-center font-bold text-sm">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold truncate leading-none">{user?.name || 'User'}</span>
              <span className="text-[11px] text-muted-foreground truncate mt-1">{user?.email || 'staff@mph.com'}</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={logout} 
            className="w-full justify-start h-9 text-xs font-bold hover:bg-destructive hover:text-white transition-all rounded-md"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
