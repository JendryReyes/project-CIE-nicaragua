import { planCrisisDemo } from "@/lib/modelos-clinicos";
import { AlertTriangle, Phone } from "lucide-react";

export function HanleyCrisisCard() {
  const p = planCrisisDemo;
  return (
    <div className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h3 className="font-display text-lg text-destructive">Plan de crisis Hanley</h3>
        <span className="ml-auto text-[0.65rem] uppercase tracking-wider text-destructive bg-destructive/10 rounded-full px-2 py-0.5">
          Riesgo alto
        </span>
      </div>
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Precursores observables</div>
          <ul className="space-y-1.5">
            {p.precursores.map((x) => (
              <li key={x} className="flex gap-2"><span className="mt-1.5 h-1 w-1 rounded-full bg-destructive shrink-0" /><span>{x}</span></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Pasos en orden</div>
          <ol className="space-y-1.5">
            {p.pasos.map((s) => (
              <li key={s.orden} className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-[0.65rem] font-semibold text-destructive">{s.orden}</span>
                <span>{s.accion}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-destructive/20 pt-3 text-xs">
        <div>
          <span className="text-muted-foreground">Reforzadores seguros: </span>
          {p.reforzadores.join(" · ")}
        </div>
        <div className="ml-auto inline-flex items-center gap-1.5 text-destructive font-medium">
          <Phone className="h-3 w-3" /> {p.contactoFamilia}
        </div>
      </div>
    </div>
  );
}
