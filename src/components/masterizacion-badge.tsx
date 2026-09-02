import type { Programa } from "@/lib/modelos-clinicos";
import { CheckCircle2, Circle } from "lucide-react";

export function MasterizacionBadge({ programa }: { programa: Programa }) {
  const ultimas = programa.serie.slice(-programa.criterio.consistencia);
  const cumplenUmbral = ultimas.filter((s) => s.valor >= programa.criterio.umbral).length;
  const ok = cumplenUmbral >= programa.criterio.consistencia;
  return (
    <div className={`inline-flex items-center gap-3 rounded-xl border px-3 py-2 text-xs ${ok ? "border-[oklch(0.62_0.097_160)]/40 bg-[oklch(0.94_0.044_160)]/40" : "border-border bg-muted/40"}`}>
      {ok ? (
        <CheckCircle2 className="h-4 w-4 text-[oklch(0.5_0.097_160)]" />
      ) : (
        <Circle className="h-4 w-4 text-muted-foreground" />
      )}
      <div className="space-y-0.5">
        <div className="font-medium">
          {ok ? "Criterio cumplido" : "En progreso"}
        </div>
        <div className="text-muted-foreground tabular text-[0.65rem]">
          Umbral {programa.criterio.umbral}{programa.medida === "% acierto" ? "%" : ""} · {cumplenUmbral}/{programa.criterio.consistencia} sesiones · Gen. {programa.criterio.generalizacion} contextos
        </div>
      </div>
    </div>
  );
}
