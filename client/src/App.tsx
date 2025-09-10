import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { createContext, useContext, useState } from "react";
import Dashboard from "@/pages/dashboard";
import MarkAttendance from "@/pages/mark-attendance";
import AttendanceHistory from "@/pages/attendance-history";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import MyClasses from "@/pages/my-classes";
import SyncData from "@/pages/sync-data";
import NotFound from "@/pages/not-found";
import { Button } from "@/components/ui/button";
import { Menu, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Role = "teacher" | "admin" | "government";

const RoleContext = createContext<{
  role: Role;
  setRole: (role: Role) => void;
}>({ role: "teacher", setRole: () => {} });

export const useRole = () => useContext(RoleContext);

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/mark-attendance" component={MarkAttendance} />
      <Route path="/attendance-history" component={AttendanceHistory} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route path="/my-classes" component={MyClasses} />
      <Route path="/sync-data" component={SyncData} />
      <Route component={NotFound} />
    </Switch>
  );
}

function TopHeader() {
  const { role, setRole } = useRole();
  
  const getRoleName = (r: Role) => {
    switch (r) {
      case "teacher": return "Teacher";
      case "admin": return "School Admin";
      case "government": return "Government Officer";
    }
  };
  
  const getUserName = () => {
    switch (role) {
      case "teacher": return "Anita Sharma";
      case "admin": return "Rajesh Kumar";
      case "government": return "Priya Patel";
    }
  };
  
  const getUserInitial = () => {
    switch (role) {
      case "teacher": return "A";
      case "admin": return "R";
      case "government": return "P";
    }
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-lg font-semibold text-foreground">Smart Attendance</div>
          <nav className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              className={role === "teacher" ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:text-foreground"}
              onClick={() => setRole("teacher")}
              data-testid="tab-teacher"
            >
              Teacher
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={role === "admin" ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:text-foreground"}
              onClick={() => setRole("admin")}
              data-testid="tab-admin"
            >
              School Admin
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={role === "government" ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:text-foreground"}
              onClick={() => setRole("government")}
              data-testid="tab-government"
            >
              Government Officer
            </Button>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            className="relative"
            data-testid="button-notifications"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              1
            </Badge>
          </Button>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                {getUserInitial()}
              </AvatarFallback>
            </Avatar>
            <div className="text-right">
              <div className="text-sm font-medium" data-testid="text-username">
                {getUserName()}
              </div>
              <div className="text-xs text-muted-foreground">
                {getRoleName(role)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [role, setRole] = useState<Role>("teacher");
  
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RoleContext.Provider value={{ role, setRole }}>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1">
                <TopHeader />
                <main className="flex-1 overflow-auto">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </RoleContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
