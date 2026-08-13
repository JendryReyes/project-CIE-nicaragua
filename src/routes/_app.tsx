import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { getUser, type UserSesion } from "@/lib/auth";
import { Search } from "lucide-react";
import { SedeProvider } from "@/lib/sedes";
import { SedeSelector } from "@/components/sede-selector";
import { TourGuiado } from "@/components/tour-guiado";
import { NotificacionesPopover } from "@/components/notificaciones-popover";
import { PerfilPopover } from "@/components/perfil-popover";
import { RolProvider } from "@/lib/roles-tdr";
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
                <SedeSelector />
                <NotificacionesPopover />
                {user && <PerfilPopover user={user} />}
              </div>
            </header>
            <main className="flex-1 p-6 lg:p-8">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </SedeProvider>
  );
}
