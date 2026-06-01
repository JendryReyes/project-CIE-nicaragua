import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { getUser } from "@/lib/auth";
import { Bell, Search } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { SedeProvider } from "@/lib/sedes";
import { SedeSelector } from "@/components/sede-selector";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ nombre: string; rol: string } | null>(null);
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
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border/60 bg-background/85 px-6 backdrop-blur">
              <SidebarTrigger />
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Search className="h-4 w-4" />
                <input
                  placeholder="Buscar niño, terapeuta, expediente…"
                  className="bg-transparent outline-none placeholder:text-muted-foreground/70 w-64"
                />
              </div>
              <div className="ml-auto flex items-center gap-3">
                <SedeSelector />
                <button className="rounded-full p-2 hover:bg-muted relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                </button>
                <div className="flex items-center gap-2.5">
                  <div className="text-right leading-tight hidden sm:block">
                    <div className="text-sm font-medium">{user?.nombre}</div>
                    <div className="text-xs text-muted-foreground">{user?.rol}</div>
                  </div>
                  <Avatar nombre={user?.nombre ?? "C"} size={36} />
                </div>
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
