import { matriz, permisos, roles } from "@/lib/rbac";
import { Check, Eye, Minus } from "lucide-react";

export function RbacMatriz() {
  const agrupados = permisos.reduce<Record<string, typeof permisos>>((acc, p) => {
    (acc[p.area] ||= []).push(p);
    return acc;
  }, {});

  return (
    <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/40">
              <th className="text-left p-3 font-medium text-xs uppercase tracking-wider text-muted-foreground sticky left-0 bg-muted/40 min-w-[240px]">Permiso</th>
              {roles.map((r) => (
                <th key={r} className="p-3 text-center font-medium text-xs uppercase tracking-wider text-muted-foreground min-w-[110px]">
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(agrupados).map(([area, items]) => (
              <>
                <tr key={`g-${area}`} className="bg-cream/60 border-b border-border/40">
                  <td colSpan={roles.length + 1} className="px-3 py-1.5 text-[0.65rem] uppercase tracking-wider text-muted-foreground sticky left-0">
                    {area}
                  </td>
                </tr>
                {items.map((p) => (
                  <tr key={p.id} className="border-b border-border/40 hover:bg-muted/30">
                    <td className="p-3 sticky left-0 bg-card">{p.nombre}</td>
                    {roles.map((r) => {
                      const v = matriz[r][p.id] ?? "none";
                      return (
                        <td key={r} className="p-3 text-center">
                          {v === "full" && <Check className="h-4 w-4 text-[oklch(0.5_0.11_155)] mx-auto" />}
                          {v === "read" && <Eye className="h-4 w-4 text-muted-foreground mx-auto" />}
                          {v === "none" && <Minus className="h-3 w-3 text-muted-foreground/40 mx-auto" />}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border/60 bg-muted/30 p-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[oklch(0.5_0.11_155)]" /> Acceso completo</span>
        <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> Solo lectura</span>
        <span className="flex items-center gap-1.5"><Minus className="h-3 w-3 opacity-50" /> Sin acceso</span>
      </div>
    </div>
  );
}
