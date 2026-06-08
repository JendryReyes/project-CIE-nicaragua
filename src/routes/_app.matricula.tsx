import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UserPlus, UserMinus, AlertCircle, Search, Plus, Clock } from "lucide-react";
import { movimientosNinos, resumenMatricula } from "@/lib/modulos-data";

export const Route = createFileRoute("/_app/matricula")({
  head: () => ({ meta: [{ title: "Módulo de Matrícula · CIE" }] }),
  component: Matricula,
});

const tabs = ["Resumen general", "Ingresos", "Egresos", "Suspensiones"] as const;
type Tab = typeof tabs[number];

function Matricula() {
  const [tab, setTab] = useState<Tab>("Resumen general");
  const r = resumenMatricula;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Módulo de Matrícula</h1>
          <p className="text-sm text-muted-foreground mt-1">Ingresos · Egresos · Suspensiones · Mayo 2026</p>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-[oklch(0.55_0.16_155)] text-white px-3 py-1.5 text-sm font-medium hover:opacity-90">
          <Plus className="h-4 w-4" /> Nuevo ingreso
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border/60 -mb-2">
        {tabs.map((t) => (
          <button key={t} onClick={()=>setTab(t)} className={`px-3 py-2 text-sm border-b-2 -mb-px ${tab===t ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t}
            {t === "Suspensiones" && r.suspendidos > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[oklch(0.6_0.18_25)] text-white text-[10px] px-1">{r.suspendidos}</span>
            )}
          </button>
        ))}
      </div>

      {/* KPI block (Resumen) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI icon={<UserPlus className="h-4 w-4 text-[oklch(0.55_0.16_155)]" />} label="Activos" value={r.activos} hint={`+${r.ingresosMes} este mes`} />
        <KPI icon={<UserPlus className="h-4 w-4" />} label="Ingresos · mes" value={r.ingresosMes} hint="alta clínica" />
        <KPI icon={<UserMinus className="h-4 w-4" />} label="Egresos · mes" value={r.egresosMes} hint="mudanza familiar" />
        <KPI icon={<AlertCircle className="h-4 w-4 text-[oklch(0.6_0.18_25)]" />} label="Suspensiones" value={r.suspendidos} hint="revisar conducta" warn />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border/70 bg-card p-5 lg:col-span-2">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="font-display text-base">Movimiento de niños</h3>
            <span className="text-xs text-muted-foreground">últimas 7 semanas · todas las sedes</span>
          </div>
          <MiniBars />
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-5">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="font-display text-base inline-flex items-center gap-2"><Clock className="h-4 w-4" /> Horas programadas</h3>
            <span className="text-xs text-muted-foreground">mes</span>
          </div>
          <div className="font-display text-4xl tabular">{r.horasProgramadas}h</div>
          <div className="text-xs text-muted-foreground mt-1">de las cuales {r.horasSubrogadas}h subrogadas</div>
          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${r.cobertura}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
            <span>Cobertura</span><span className="tabular">{r.cobertura}%</span>
          </div>
        </div>
      </div>

      {/* Lista movimientos */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <div className="p-4 border-b border-border/60 flex items-center justify-between gap-3">
          <h3 className="font-display text-base">Movimientos recientes</h3>
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input placeholder="Buscar niño…" className="w-full rounded-md border border-border bg-background pl-7 pr-2 py-1 text-xs" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-4">
          {movimientosNinos.map((m, i) => (
            <article key={i} className="rounded-xl border border-border/70 p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-muted grid place-items-center text-xs font-medium">{m.iniciales}</div>
                  <div>
                    <div className="font-medium text-sm">{m.nino}</div>
                    <div className="text-[11px] text-muted-foreground">{m.expediente}</div>
                  </div>
                </div>
                <Pill tipo={m.tipo} />
              </div>
              <div className="text-[11px] text-muted-foreground mt-2 tabular">{m.fecha}</div>
              <p className="text-xs mt-1">{m.motivo}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPI({ icon, label, value, hint, warn }: { icon: React.ReactNode; label: string; value: string|number; hint?: string; warn?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${warn ? "border-[oklch(0.88_0.1_25)] bg-[oklch(0.98_0.03_25)]" : "border-border/70 bg-card"}`}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">{icon}<span>{label}</span></div>
      <div className="font-display text-3xl mt-1 tabular">{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}

function Pill({ tipo }: { tipo: "ingreso" | "egreso" | "suspension" }) {
  const map = {
    ingreso: "bg-[oklch(0.94_0.06_155)] text-[oklch(0.35_0.13_155)]",
    egreso: "bg-muted text-muted-foreground",
    suspension: "bg-[oklch(0.95_0.08_25)] text-[oklch(0.45_0.15_25)]",
  } as const;
  const label = { ingreso: "Ingreso", egreso: "Egreso", suspension: "Suspensión" }[tipo];
  return <span className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 font-medium ${map[tipo]}`}>{label}</span>;
}

function MiniBars() {
  const data = [4, 6, 3, 7, 5, 8, 6];
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t bg-primary/70" style={{ height: `${(v/max)*100}%` }} />
          <span className="text-[10px] text-muted-foreground tabular">S{i+1}</span>
        </div>
      ))}
    </div>
  );
}
