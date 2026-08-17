import { Eye } from "lucide-react";
import { rolesOrg, rolSigla, useRol } from "@/lib/roles-tdr";
import type { RolOrg } from "@/lib/roles-tdr";
import { registrarEvento } from "@/lib/auditoria";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function RolActivoSelector() {
  const { rol, setRol } = useRol();

  const cambiar = (r: RolOrg) => {
    setRol(r);
    registrarEvento({
      actor: "Usuario demo",
      rol: r,
      categoria: "gobernanza",
      accion: "Cambio de rol de visualización",
      entidad: "Sesión demo",
      detalle: `Vista simulada como ${r}`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-2 py-1.5 text-xs hover:bg-muted/60">
        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="hidden sm:inline text-muted-foreground">Ver como</span>
        <span className="font-medium">{rolSigla[rol]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="text-xs">Ver como rol (TDR v1.2)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {rolesOrg.map((r) => (
          <DropdownMenuItem key={r} onClick={() => cambiar(r)} className="items-start gap-2 text-xs">
            <span className="mt-0.5 rounded bg-muted px-1 py-0.5 text-[0.6rem] font-semibold">{rolSigla[r]}</span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1 font-medium">
                {r}
                {r === rol && <span className="ml-auto text-primary">●</span>}
              </span>
              <span className="mt-0.5 block whitespace-normal text-[0.65rem] leading-snug text-muted-foreground">
                {rolDescripcion[r]}
              </span>
              <span className="mt-0.5 block text-[0.6rem] text-muted-foreground/80">
                {modulosPorRol[r].length} módulos visibles
              </span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>

    </DropdownMenu>
  );
}
