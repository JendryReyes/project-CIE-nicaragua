import { ninos } from "@/lib/demo-data";
import { Avatar } from "@/components/avatar";
import { AlertTriangle } from "lucide-react";
import { Link } from "@tanstack/react-router";

const estancados = [
  { ninoId: "007", dominio: "Conducta · Autorregulación", semanas: 5 },
  { ninoId: "010", dominio: "Logopedia · Tactos espontáneos", semanas: 4 },
  { ninoId: "004", dominio: "Diagnóstico · Pendiente cierre", semanas: 3 },
];

export function AlertaEstancamiento() {
  return (
    <div className="rounded-2xl border border-[oklch(0.78_0.114_80)]/50 bg-[oklch(0.97_0.035_80)]/60 p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-[oklch(0.55_0.114_80)]" />
        <h3 className="font-display text-lg">Alerta de estancamiento</h3>
        <span className="ml-auto text-xs text-muted-foreground">Sin progreso &gt; 3 semanas</span>
      </div>
      <ul className="space-y-2.5">
        {estancados.map((e) => {
          const n = ninos.find((x) => x.id === e.ninoId);
          if (!n) return null;
          return (
            <li key={e.ninoId}>
              <Link to="/ninos/$id" params={{ id: e.ninoId }} className="flex items-center gap-3 rounded-lg p-2 hover:bg-card transition-colors">
                <Avatar nombre={n.nombre} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{n.nombre}</div>
                  <div className="text-xs text-muted-foreground truncate">{e.dominio}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-display tabular text-[oklch(0.55_0.114_80)]">{e.semanas}</div>
                  <div className="text-[0.6rem] uppercase tracking-wider text-muted-foreground">semanas</div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
