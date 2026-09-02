import { useNavigate } from "@tanstack/react-router";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar } from "@/components/avatar";
import { LogOut, Mail, MapPin, Shield, Circle, Settings } from "lucide-react";
import { logout, type UserSesion } from "@/lib/auth";

export function PerfilPopover({ user }: { user: UserSesion }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Perfil"
          className="flex min-w-0 items-center gap-2.5 rounded-full p-0.5 pr-2 transition-colors hover:bg-muted"
        >
          <div className="hidden max-w-36 text-right leading-tight xl:block">
            <div className="text-sm font-medium truncate">{user.nombre}</div>
            <div className="text-xs text-muted-foreground truncate">{user.rol}</div>
          </div>
          <div className="relative">
            <Avatar nombre={user.nombre} size={36} />
            {/* indicador online */}
            <span className="absolute -bottom-0.5 -right-0.5 inline-block h-3 w-3 rounded-full border-2 border-background bg-[oklch(0.7_0.158_160)]" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border/60 p-4">
          <div className="relative">
            <Avatar nombre={user.nombre} size={48} />
            <span className="absolute -bottom-0.5 -right-0.5 inline-block h-3.5 w-3.5 rounded-full border-2 border-background bg-[oklch(0.7_0.158_160)]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{user.nombre}</div>
            <div className="text-xs text-muted-foreground truncate">{user.rol}</div>
            <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-[oklch(0.45_0.114_160)]">
              <Circle className="h-2 w-2 fill-current" />
              En línea
            </div>
          </div>
        </div>

        {/* Datos */}
        <div className="space-y-2 p-4 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            <span className="truncate text-foreground">{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-foreground">{user.sede ?? "Todas las sedes"}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            <span className="text-foreground">Sesión iniciada hoy</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="border-t border-border/60 p-1.5">
          <button
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            Preferencias
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[oklch(0.5_0.132_45)] hover:bg-[oklch(0.96_0.035_45)]"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
