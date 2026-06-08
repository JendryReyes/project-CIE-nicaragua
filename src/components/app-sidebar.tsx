import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardCheck,
  Receipt,
  Heart,
  BookOpen,
  Shield,
  LogOut,
  LineChart,
  UserPlus,
  Activity,
  FileBarChart,
  QrCode,
  CheckSquare,
  FileText,
  Building2,
} from "lucide-react";
import cieLogo from "@/assets/cie-logo.png.asset.json";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { logout } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";

const principal = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Matrícula", url: "/matricula", icon: UserPlus },
  { title: "Planificación", url: "/horario", icon: CalendarDays },
  { title: "Ejecución", url: "/ejecucion", icon: Activity },
  { title: "Gestión Clínica", url: "/ninos", icon: Users },
  { title: "Asistencia", url: "/asistencia", icon: ClipboardCheck },
  { title: "Biblioteca", url: "/biblioteca", icon: BookOpen },
  { title: "Gráficas ABA", url: "/clinico/graficas", icon: LineChart },
];

const administracion = [
  { title: "Panel de sedes", url: "/sedes", icon: Building2 },
  { title: "Facturación", url: "/facturacion", icon: Receipt },
  { title: "Cierre quincena", url: "/facturacion/cierre", icon: CheckSquare },
  { title: "Cartas INSS", url: "/facturacion/cartas", icon: FileText },
  { title: "Reportes", url: "/reportes", icon: FileBarChart },
  { title: "Familias", url: "/familias", icon: Heart },
  { title: "Equipo y permisos", url: "/equipo", icon: Shield },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  const renderSection = (label: string, items: typeof principal) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground/80">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium">
                <Link to={item.url} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/60 p-4">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-border/60">
            <img src={cieLogo.url} alt="CIE" className="h-full w-full object-contain" />
          </div>

          <div className="flex flex-col leading-tight">
            <span className="font-display text-lg font-semibold">CIE</span>
            <span className="text-[0.65rem] text-muted-foreground">Centro Edu-Terapéutico</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {renderSection("Principal", principal)}
        {renderSection("Administración", administracion)}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/60 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar sesión</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
