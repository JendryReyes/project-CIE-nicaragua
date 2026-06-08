import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Building2, ArrowUpRight, AlertTriangle, PauseCircle, CheckCircle2 } from "lucide-react";
import { sedesFact } from "@/lib/modulos-data";
import { calcularResumenSede } from "@/lib/facturacion-motor";
import { cartasINSS, diasParaVencer } from "@/lib/cartas-inss";

export const Route = createFileRoute("/_app/sedes")({
  head: () => ({ meta: [{ title: "Panel de sedes · CIE" }] }),
  component: PanelSedes,
});

type Ventana = "hoy" | "semana" | "quincena";

function PanelSedes() {
  const [ventana, setVentana] = useState<Ventana>("quincena");
  const periodo = { quincena: 2 as 1 | 2, mes: 5, anio: 2026 };

  const data = useMemo(() => {
    return sedesFact.map((s) => {
      const resumenes = calcularResumenSede(s.id, periodo);
      const monto = resumenes.reduce((acc, r) => acc + r.totalFacturable, 0);
      const horas = resumenes.reduce((acc, r) => acc + r.totalHoras, 0);
      const ninos = resumenes.length;
      const excedentes = resumenes.filter((r) => r.tieneExcedente && !r.tieneConstancia).length;
      const suspensiones = resumenes.filter((r) => r.estado === "suspendido").length;
      const ninoIds = new Set(s.ninos.map((n) => n.id));
      const cartas = cartasINSS.filter((c) => ninoIds.has(c.ninoId));
      const cartasPorVencer = cartas.filter((c) => {
        const d = diasParaVencer(c);
        return d >= 0 && d <= 30;
      }).length;
      const cartasVencidas = cartas.filter((c) => diasParaVencer(c) < 0).length;
      const spark = Array.from({ length: 7 }, (_, i) => Math.round(monto * (0.6 + Math.sin(i + s.id.length) * 0.15 + i * 0.05)));
      return { sede: s, monto, horas, ninos, excedentes, suspensiones, cartas: cartas.length, cartasPorVencer, cartasVencidas, spark };
    });
  }, []);


  const totales = useMemo(() => ({
    monto: data.reduce((s, d) => s + d.monto, 0),
    horas: data.reduce((s, d) => s + d.horas, 0),
    ninos: data.reduce((s, d) => s + d.ninos, 0),
    excedentes: data.reduce((s, d) => s + d.excedentes, 0),
    suspensiones: data.reduce((s, d) => s + d.suspensiones, 0),
    cartasPorVencer: data.reduce((s, d) => s + d.cartasPorVencer, 0),
  }), [data]);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Panel de sedes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vista consolidada en tiempo real de las {sedesFact.length} sedes de CIE
          </p>
        </div>
        <div className="flex gap-1 rounded-full border border-border/70 bg-card p-1 text-xs">
          {(["hoy", "semana", "quincena"] as Ventana[]).map((v) => (
            <button key={v} onClick={() => setVentana(v)}
              className={`px-3 py-1.5 rounded-full uppercase tracking-wider ${ventana === v ? "bg-foreground text-background" : "text-muted-foreground"}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Totales red CIE */}
      <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-[oklch(0.96_0.02_240)] to-card p-5">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Red CIE consolidada · Q{periodo.quincena} mayo 2026</div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Tot label="Facturable" value={`$${totales.monto.toFixed(0)}`} accent />
          <Tot label="Horas" value={`${totales.horas}h`} />
          <Tot label="Niños activos" value={String(totales.ninos)} />
          <Tot label="Excedentes" value={String(totales.excedentes)} warn={totales.excedentes > 0} />
          <Tot label="Suspensiones" value={String(totales.suspensiones)} />
          <Tot label="Cartas x vencer" value={String(totales.cartasPorVencer)} warn={totales.cartasPorVencer > 0} />
        </div>
      </div>

      {/* Comparativa por sede */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.map((d) => {
          const maxSpark = Math.max(...d.spark, 1);
          return (
            <Link
              key={d.sede.id}
              to="/facturacion/cierre"
              className="group rounded-2xl border border-border/70 bg-card p-5 hover:border-foreground/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-muted grid place-items-center">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-display text-base leading-tight">{d.sede.nombre}</div>
                    <div className="text-[11px] text-muted-foreground">{d.sede.ciudad} · {d.ninos} niños</div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              </div>

              <div className="flex items-baseline justify-between">
                <span className="font-display text-2xl tabular">${d.monto.toFixed(0)}</span>
                <span className="text-xs text-muted-foreground tabular">{d.horas}h</span>
              </div>

              {/* Sparkline */}
              <svg viewBox="0 0 140 30" className="mt-3 w-full h-8">
                <polyline
                  fill="none"
                  stroke="oklch(0.55 0.13 155)"
                  strokeWidth="1.5"
                  points={d.spark.map((v, i) => `${(i / 6) * 140},${30 - (v / maxSpark) * 26}`).join(" ")}
                />
                {d.spark.map((v, i) => (
                  <circle key={i} cx={(i / 6) * 140} cy={30 - (v / maxSpark) * 26} r="1.5" fill="oklch(0.55 0.13 155)" />
                ))}
              </svg>

              <div className="flex gap-2 mt-3 flex-wrap text-[10px]">
                {d.excedentes > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-[oklch(0.94_0.08_75)] text-[oklch(0.4_0.13_75)]">
                    <AlertTriangle className="h-3 w-3" /> {d.excedentes} excedentes
                  </span>
                )}
                {d.suspensiones > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-[oklch(0.94_0.07_55)] text-[oklch(0.45_0.13_55)]">
                    <PauseCircle className="h-3 w-3" /> {d.suspensiones} pausas
                  </span>
                )}
                {d.cartasPorVencer > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-[oklch(0.94_0.06_25)] text-[oklch(0.45_0.15_25)]">
                    {d.cartasPorVencer} cartas x vencer
                  </span>
                )}
                {d.excedentes === 0 && d.suspensiones === 0 && d.cartasPorVencer === 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-[oklch(0.94_0.06_155)] text-[oklch(0.4_0.12_155)]">
                    <CheckCircle2 className="h-3 w-3" /> Sin alertas
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Tabla comparativa */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border/60">
          <h2 className="font-display text-lg">Comparativa por sede</h2>
        </div>
        <div className="grid grid-cols-[1fr_90px_80px_80px_80px_90px_110px] gap-3 px-5 py-2.5 border-b border-border/60 text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/30">
          <span>Sede</span>
          <span className="text-right">Niños</span>
          <span className="text-right">Horas</span>
          <span className="text-right">Excede</span>
          <span className="text-right">Pausas</span>
          <span className="text-right">Cartas</span>
          <span className="text-right">Facturable</span>
        </div>
        {data.map((d) => (
          <div key={d.sede.id} className="grid grid-cols-[1fr_90px_80px_80px_80px_90px_110px] gap-3 px-5 py-3 border-b border-border/40 text-sm hover:bg-muted/30">
            <span className="font-medium">{d.sede.nombre}</span>
            <span className="tabular text-right">{d.ninos}</span>
            <span className="tabular text-right">{d.horas}h</span>
            <span className={`tabular text-right ${d.excedentes > 0 ? "text-[oklch(0.45_0.13_75)] font-medium" : "text-muted-foreground"}`}>{d.excedentes || "—"}</span>
            <span className={`tabular text-right ${d.suspensiones > 0 ? "text-[oklch(0.45_0.13_55)]" : "text-muted-foreground"}`}>{d.suspensiones || "—"}</span>
            <span className="tabular text-right text-muted-foreground">
              {d.cartas}{d.cartasPorVencer > 0 && <span className="text-[oklch(0.45_0.15_25)]"> ({d.cartasPorVencer}!)</span>}
            </span>
            <span className="tabular text-right font-display">${d.monto.toFixed(2)}</span>
          </div>
        ))}
        <div className="grid grid-cols-[1fr_90px_80px_80px_80px_90px_110px] gap-3 px-5 py-3 text-sm bg-muted/40 font-medium">
          <span>Red CIE total</span>
          <span className="tabular text-right">{totales.ninos}</span>
          <span className="tabular text-right">{totales.horas}h</span>
          <span className="tabular text-right">{totales.excedentes}</span>
          <span className="tabular text-right">{totales.suspensiones}</span>
          <span className="tabular text-right">{totales.cartasPorVencer} x vencer</span>
          <span className="tabular text-right font-display">${totales.monto.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

function Tot({ label, value, accent, warn }: { label: string; value: string; accent?: boolean; warn?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-display tabular mt-1 ${accent ? "text-3xl" : "text-2xl"} ${warn ? "text-[oklch(0.5_0.18_25)]" : ""}`}>{value}</div>
    </div>
  );
}
