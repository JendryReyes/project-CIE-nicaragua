import { createFileRoute, Outlet, useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { getUser, type UserSesion } from "@/lib/auth";
import { Search, Lock } from "lucide-react";
import { SedeProvider } from "@/lib/sedes";
import { SedeSelector } from "@/components/sede-selector";
import { TourGuiado } from "@/components/tour-guiado";
import { NotificacionesPopover } from "@/components/notificaciones-popover";
import { PerfilPopover } from "@/components/perfil-popover";
import { RolProvider, useRol, rolDescripcion, modulosPorRol, puedeModulo } from "@/lib/roles-tdr";
import { RolActivoSelector } from "@/components/rol-activo-selector";



export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserSesion | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      navigate({ to: "/" });
    } else {
      setUser(u);
      setReady(true);
    }
  }, [navigate]);

  if (!ready) return null;

  return (
    <RolProvider>
      <SedeProvider>
        <SidebarProvider>


        <div className="flex min-h-screen w-full overflow-x-hidden bg-background">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-20 flex min-h-16 items-center gap-2 border-b border-border/60 bg-background/85 px-3 backdrop-blur sm:gap-3 sm:px-5 lg:gap-4 lg:px-6">
              <SidebarTrigger />
              <div className="hidden min-w-0 flex-1 items-center gap-2 text-sm text-muted-foreground lg:flex">
                <Search className="h-4 w-4" />
                <input
                  placeholder="Buscar niño, terapeuta, expediente…"
                  className="w-full max-w-md bg-transparent outline-none placeholder:text-muted-foreground/70"
                />
              </div>
              <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2 lg:gap-3">
                <TourGuiado />
                <RolActivoSelector />
                <SedeSelector />
                <NotificacionesPopover />
                {user && <PerfilPopover user={user} />}
              </div>
            </header>
            <BarraRol />
            <main className="flex-1 p-6 lg:p-8">
              <GuardiaModulo>
                <Outlet />
              </GuardiaModulo>
            </main>

          </div>
        </div>
        </SidebarProvider>
      </SedeProvider>
    </RolProvider>

  );
}

function BarraRol() {
  const { rol } = useRol();
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border/60 bg-muted/40 px-4 py-2 text-xs lg:px-6">
      <span className="rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">Vista simulada</span>
      <span className="font-medium">{rol}</span>
      <span className="hidden text-muted-foreground sm:inline">· {rolDescripcion[rol]}</span>
      <span className="ml-auto text-muted-foreground">
        {modulosPorRol[rol].length} de {modulosPorRol["Administrador de Organización"].length} módulos visibles
      </span>
    </div>
  );
}

function GuardiaModulo({ children }: { children: React.ReactNode }) {
  const { rol } = useRol();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const todos = modulosPorRol["Administrador de Organización"];
  const base = todos
    .filter((m) => pathname === m || pathname.startsWith(m + "/"))
    .sort((a, b) => b.length - a.length)[0];

  if (base && !puedeModulo(rol, base)) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border/60 bg-card p-8 text-center">
        <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
        <h2 className="mt-3 font-display text-lg font-semibold">Módulo restringido</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          El rol <strong>{rol}</strong> no tiene acceso a <code>{base}</code> según la matriz de permisos.
        </p>
        <Link to="/dashboard" className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Ir al Dashboard
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}
