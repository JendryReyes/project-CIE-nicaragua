import { useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import { X, Sparkles, TrendingUp, Target, Download, FileText } from "lucide-react";

type Punto = { sesion: number; fecha: string; pct: number; terapeuta: string; prompt: string };

const DATOS_DEMO: Punto[] = [
  { sesion: 1, fecha: "01/04", pct: 20, terapeuta: "Ana", prompt: "Física completa" },
  { sesion: 2, fecha: "03/04", pct: 25, terapeuta: "Ana", prompt: "Física completa" },
  { sesion: 3, fecha: "07/04", pct: 30, terapeuta: "Carlos", prompt: "Física parcial" },
  { sesion: 4, fecha: "09/04", pct: 35, terapeuta: "Ana", prompt: "Física parcial" },
  { sesion: 5, fecha: "14/04", pct: 40, terapeuta: "Ana", prompt: "Física parcial" },
  { sesion: 6, fecha: "28/04", pct: 45, terapeuta: "Ana", prompt: "Gestual" },
  { sesion: 7, fecha: "30/04", pct: 50, terapeuta: "Carlos", prompt: "Gestual" },
  { sesion: 8, fecha: "05/05", pct: 55, terapeuta: "Ana", prompt: "Gestual" },
  { sesion: 9, fecha: "07/05", pct: 60, terapeuta: "Ana", prompt: "Gestual" },
  { sesion: 10, fecha: "12/05", pct: 58, terapeuta: "Carlos", prompt: "Gestual" },
  { sesion: 11, fecha: "14/05", pct: 65, terapeuta: "Ana", prompt: "Gestual" },
  { sesion: 12, fecha: "19/05", pct: 68, terapeuta: "Ana", prompt: "Gestual" },
  { sesion: 13, fecha: "21/05", pct: 70, terapeuta: "Carlos", prompt: "Gestual" },
  { sesion: 14, fecha: "26/05", pct: 73, terapeuta: "Ana", prompt: "Gestual" },
  { sesion: 15, fecha: "02/06", pct: 75, terapeuta: "Ana", prompt: "Gestual" },
];

export function GraficaProgramaModal({
  open, onClose, ninoNombre, programaNombre, area,
}: {
  open: boolean;
  onClose: () => void;
  ninoNombre: string;
  programaNombre: string;
  area?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const ult8 = DATOS_DEMO.slice(-8);
  const pendiente = (ult8[ult8.length - 1].pct - ult8[0].pct) / (ult8.length - 1);
  const promedio7d = Math.round(DATOS_DEMO.slice(-3).reduce((a, p) => a + p.pct, 0) / 3);
  const eta = Math.max(1, Math.ceil((90 - 75) / pendiente));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card rounded-2xl border border-border/70 shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 bg-card/95 backdrop-blur border-b border-border/60 px-6 py-4 flex items-start justify-between gap-4 z-10">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.94_0.07_292)] text-[oklch(0.35_0.132_292)] px-2.5 py-0.5 text-[10px] font-medium mb-1.5">
              <Sparkles className="h-3 w-3" /> Gráfica de progreso
            </div>
            <h2 className="font-display text-xl leading-tight truncate">{programaNombre}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {ninoNombre}{area ? ` · ${area}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-muted">
              <Download className="h-3.5 w-3.5" /> Exportar
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-2.5 py-1.5 text-xs font-medium">
              <FileText className="h-3.5 w-3.5" /> Informe IA
            </button>
            <button onClick={onClose} className="rounded-md p-1.5 hover:bg-muted" aria-label="Cerrar">
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <Mini icon={<TrendingUp className="h-3.5 w-3.5 text-[oklch(0.55_0.088_160)]" />} label="Pendiente" value={`+${pendiente.toFixed(1)}%`} />
            <Mini icon={<Target className="h-3.5 w-3.5 text-primary" />} label="Promedio 7d" value={`${promedio7d}%`} />
            <Mini icon={<Sparkles className="h-3.5 w-3.5 text-[oklch(0.55_0.114_292)]" />} label="ETA criterio" value={`~${eta} ses.`} />
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-sm">Serie por sesión</h3>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-[oklch(0.55_0.141_292)]" /> % correcto</span>
                <span className="flex items-center gap-1"><span className="h-0.5 w-3 bg-[oklch(0.55_0.158_30)]" /> Criterio 90%</span>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={DATOS_DEMO} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 265)" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "oklch(0.5 0.014 265)" }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: "oklch(0.5 0.014 265)" }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.[0]) return null;
                      const p = payload[0].payload as Punto;
                      return (
                        <div className="rounded-xl border border-border/70 bg-card px-3 py-2 text-xs shadow-md">
                          <div className="font-medium">Sesión {p.sesion} · {p.fecha}</div>
                          <div className="tabular text-base font-display mt-0.5">{p.pct}%</div>
                          <div className="text-muted-foreground mt-1">Terapeuta: {p.terapeuta}</div>
                          <div className="text-muted-foreground">Prompt: {p.prompt}</div>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine y={90} stroke="oklch(0.55 0.158 30)" strokeDasharray="4 4"
                    label={{ value: "Criterio 90%", position: "right", fontSize: 10, fill: "oklch(0.45 0.141 30)" }} />
                  <Line type="monotone" dataKey="pct" stroke="oklch(0.55 0.141 292)" strokeWidth={2.5}
                    dot={{ r: 4, fill: "oklch(0.55 0.141 292)" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-[oklch(0.85_0.07_292)] bg-gradient-to-br from-[oklch(0.98_0.014_265)] to-[oklch(0.97_0.014_265)] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[oklch(0.92_0.07_292)] shrink-0">
                <Sparkles className="h-3.5 w-3.5 text-[oklch(0.4_0.132_292)]" />
              </div>
              <div>
                <h3 className="font-display text-sm text-[oklch(0.3_0.106_292)]">Análisis IA</h3>
                <p className="text-xs text-foreground/85 mt-1.5 leading-relaxed">
                  Tendencia ascendente consistente (pendiente <strong>+{pendiente.toFixed(1)}% por sesión</strong>).
                  Promedio reciente <strong>{promedio7d}%</strong>. A este ritmo, criterio en{" "}
                  <strong>~{eta} sesiones</strong>. Recomendación: continuar procedimiento y reducir prompts
                  gradualmente cuando se mantenga ≥ 80% en 2 sesiones consecutivas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Mini({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 px-2.5 py-2">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <div className="font-display text-base tabular mt-0.5">{value}</div>
    </div>
  );
}
