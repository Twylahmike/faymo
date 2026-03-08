import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Briefcase, UserCheck, CreditCard,
  Megaphone, BarChart3, Settings, CalendarDays, ShieldCheck, Sparkles,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, color: "text-primary" },
  { title: "Clients", url: "/dashboard/clients", icon: Users, color: "text-blue-400" },
  { title: "Services", url: "/dashboard/services", icon: Briefcase, color: "text-emerald-400" },
  { title: "Projects", url: "/dashboard/projects", icon: CalendarDays, color: "text-purple-400" },
  { title: "Creators", url: "/dashboard/creators", icon: UserCheck, color: "text-amber-400" },
  { title: "Payments", url: "/dashboard/payments", icon: CreditCard, color: "text-green-400" },
  { title: "Marketing", url: "/dashboard/marketing", icon: Megaphone, color: "text-pink-400" },
  { title: "Reports", url: "/dashboard/reports", icon: BarChart3, color: "text-orange-400" },
];

const adminNav = [
  { title: "Team", url: "/dashboard/team", icon: ShieldCheck, color: "text-red-400" },
  { title: "Settings", url: "/dashboard/settings", icon: Settings, color: "text-muted-foreground" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary shrink-0" />
          {!collapsed && (
            <span className="font-display text-lg font-bold tracking-tight">
              F<span className="text-primary">🩵</span>ymo
            </span>
          )}
        </button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-accent/50"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className={`h-4 w-4 shrink-0 ${item.color}`} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <NavLink
                        to={item.url}
                        className="hover:bg-accent/50"
                        activeClassName="bg-accent text-accent-foreground font-medium"
                      >
                        <item.icon className={`h-4 w-4 shrink-0 ${item.color}`} />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <p className={`text-xs text-muted-foreground text-center ${collapsed ? "hidden" : ""}`}>
          © 2026 Flymo
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
