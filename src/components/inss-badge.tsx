import { AlertTriangle, CheckCircle2 } from "lucide-react";

/**
 * INSSBadge — barra de progreso horas usadas vs aprobadas.
 * Verde <70% · ámbar 70-99% · rojo ≥100% (excedente).
 */
export function INSSBadge({
  horasUsadas,
  horasAprobadas,
  label,
  compact = false,
}: {
  horasUsadas: number;
  horasAprobadas: number;
  label?: string;
  compact?: boolean;
}) {
  const pct = horasAprobadas > 0 ? (horasUsadas / horasAprobadas) * 100 : 0;
  const excedente = Math.max(0, horasUsadas - horasAprobadas);

  const tone =
    pct >= 100
      ? { bar: "bg-[oklch(0.55_0.158_30)]", text: "text-[oklch(0.4_0.141_30)]", track: "bg-[oklch(0.94_0.044_30)]" }
      : pct >= 70
      ? { bar: "bg-[oklch(0.65_0.123_80)]", text: "text-[oklch(0.4_0.114_80)]", track: "bg-[oklch(0.95_0.035_80)]" }
      : { bar: "bg-[oklch(0.6_0.097_160)]", text: "text-[oklch(0.4_0.088_160)]", track: "bg-[oklch(0.95_0.035_160)]" };

  const icon =
    pct >= 100 ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />;

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 min-w-[90px]">
        <div className={`h-1.5 flex-1 rounded-full overflow-hidden ${tone.track}`}>
          <div className={`h-full ${tone.bar} transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <span className={`text-[11px] tabular font-medium ${tone.text}`}>
          {horasUsadas}/{horasAprobadas}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          {label && <span className="font-medium">{label}</span>}
          <span className={`inline-flex items-center gap-1 ${tone.text}`}>
            {icon}
            <span className="tabular">
              {horasUsadas}h / {horasAprobadas}h
            </span>
          </span>
        </div>
        <span className={`tabular ${tone.text}`}>{Math.round(pct)}%</span>
      </div>
      <div className={`h-2 rounded-full overflow-hidden ${tone.track}`}>
        <div
          className={`h-full ${tone.bar} transition-all`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
        {pct > 100 && (
          <div className="-mt-2 h-2 w-full border-r-2 border-[oklch(0.4_0.141_30)]" style={{ width: "100%" }} />
        )}
      </div>
      {excedente > 0 && (
        <div className="text-[11px] text-[oklch(0.5_0.141_30)]">
          Excedente: +{excedente}h sobre el límite aprobado
        </div>
      )}
    </div>
  );
}
