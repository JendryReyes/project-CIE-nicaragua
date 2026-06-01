import type { Programa } from "@/lib/modelos-clinicos";
import { FaseChart } from "./fase-chart";
import { MasterizacionBadge } from "./masterizacion-badge";
import { Layers } from "lucide-react";

export function ProgramaClinicoCard({ programa }: { programa: Programa }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Layers className="h-3 w-3" />
            <span>{programa.dominio}</span>
            <span>›</span>
            <span>{programa.programa}</span>
          </div>
          <h4 className="font-display text-lg">{programa.target}</h4>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Chip k="SD" v={programa.sd} />
            <Chip k="Medida" v={programa.medida} />
            <Chip k="Fase" v={programa.faseActual} accent />
          </div>
        </div>
        <MasterizacionBadge programa={programa} />
      </div>
      <FaseChart programa={programa} />
      <div className="mt-4 grid md:grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-muted/40 p-3">
          <div className="text-[0.65rem] uppercase tracking-wider text-muted-foreground mb-1">Jerarquía de ayuda</div>
          <div>{programa.ayuda}</div>
        </div>
        <div className="rounded-lg bg-muted/40 p-3">
          <div className="text-[0.65rem] uppercase tracking-wider text-muted-foreground mb-1">Cambios de fase</div>
          <ul className="space-y-0.5">
            {programa.cambiosFase.map((c) => (
              <li key={c.sesion}>
                <span className="tabular text-muted-foreground">S{c.sesion}</span> · {c.nota}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Chip({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.65rem] ${accent ? "border-primary/30 bg-primary/5 text-primary" : "border-border bg-card text-muted-foreground"}`}>
      <span className="uppercase tracking-wider opacity-70">{k}</span>
      <span className="text-foreground/80">{v}</span>
    </span>
  );
}
