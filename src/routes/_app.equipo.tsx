import { createFileRoute } from "@tanstack/react-router";
import { RbacMatriz } from "@/components/rbac-matriz";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/_app/equipo")({
  head: () => ({ meta: [{ title: "Equipo y permisos · CIE" }] }),
  component: Equipo,
});

function Equipo() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Gobernanza clínica</span>
        </div>
        <h1 className="font-display text-4xl mt-1">Equipo y permisos</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Matriz de control de acceso basada en el organigrama del CIE.
          Cada rol tiene acceso granular por área, alineado a la Ley 1115 y normativas INSS.
        </p>
      </div>
      <RbacMatriz />
    </div>
  );
}
