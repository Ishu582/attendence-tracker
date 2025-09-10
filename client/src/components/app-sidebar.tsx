import { 
  ChartPie, 
  Presentation, 
  History, 
  BarChart3, 
  RotateCcw, 
  Settings,
  UserCheck
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: ChartPie,
  },
  {
    title: "My Classes",
    url: "/my-classes",
    icon: Presentation,
  },
  {
    title: "Attendance History",
    url: "/attendance-history",
    icon: History,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
  },
  {
    title: "Sync Data",
    url: "/sync-data",
    icon: RotateCcw,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-success rounded-lg flex items-center justify-center">
            <UserCheck className="h-4 w-4 text-success-foreground" />
          </div>
          <span className="text-xl font-semibold text-sidebar-foreground">
            Smart Attendance
          </span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      className={`${
                        isActive 
                          ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                          : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      } transition-colors`}
                      data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 text-sm text-sidebar-foreground/80">
          <div className="w-2 h-2 bg-success rounded-full"></div>
          <span data-testid="status-online">Online</span>
        </div>
        <div className="text-xs text-sidebar-foreground/60 mt-1">
          Last sync: <span data-testid="text-last-sync">2 min ago</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
