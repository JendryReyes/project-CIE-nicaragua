import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarClock, TrendingUp, AlertTriangle, Users, ArrowUpRight } from "lucide-react";
import {
  sedesPlan,
  supervisoresPlan,
  ninosPlan,
  motivosResumen,
  motivosColor,
  totales,
} from "@/lib/planificacion-data";

export const Route = createFileRoute("/_app/planificacion")({
  head: () => ({ meta: [{ title: "Planificación · CIE" }] }),
  component: Planificacion,
});

const tabs = ["Vista general", "Por supervisor", "Por niño"] as const;
type Tab = (typeof tabs)[number];

function Planificacion() {
  const [tab, setTab] = useState<Tab>("Vista general");
  const t = totales();

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Planificación de horas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Potencialidad de horas programables · de lo general a lo particular · supervisión por Coordinación, Supervisión, Subdirección y Dirección clínica
          </p>
        </div>
        <Link to="/horario" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90">
          Abrir horario semanal <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi icon={<CalendarClock className="h-4 w-4" />} label="Programables / mes" value={`${t.programables}h`} hint="capacidad teórica" />
        <Kpi icon={<TrendingUp className="h-4 w-4 text-[oklch(0.55_0.1_155)]" />} label="Programadas" value={`${t.programadas}h`} hint={`${t.cobertura}% cobertura`} />
        <Kpi icon={<AlertTriangle className="h-4 w-4 text-[oklch(0.55_0.13_60)]" />} label="Gap no programado" value={`${t.programables - t.programadas}h`} hint="ver causas abajo" />
        <Kpi icon={<Users className="h-4 w-4" />} label="Niños en plan" value={String(t.ninos)} hint="todas las sedes" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border/60 flex-wrap">
        {tabs.map((x) => (
          <button
            key={x}
            onClick={() => setTab(x)}
            className={`px-3 py-2 text-sm border-b-2 -mb-px ${tab === x ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {x}
          </button>
        ))}
      </div>

      {tab === "Vista general" && <VistaGeneral />}
      {tab === "Por supervisor" && <PorSupervisor />}
      {tab === "Por niño" && <PorNino />}
    </div>
  );
}

function VistaGeneral() {
  const motivos = motivosResumen();
  const totalGap = motivos.reduce((a, m) => a + m.horas, 0);
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <div className="rounded-2xl border border-border/70 bg-card p-5 xl:col-span-2">
        <h2 className="font-display text-lg mb-4">Horas programables vs. programadas — por sede</h2>
        <div className="space-y-4">
          {sedesPlan.map((s) => {
            const pct = Math.round((s.programadas / s.programables) * 100);
            return (
              <div key={s.sede}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{s.sede}</span>
                  <span className="text-muted-foreground tabular">
                    {s.programadas} / {s.programables}h · {pct}%
                  </span>
                </div>
                <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-primary/80" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">{s.ninos} niños · gap {s.programables - s.programadas}h</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-5">
        <h2 className="font-display text-lg">Causas de horas no programadas</h2>
        <p className="text-xs text-muted-foreground mt-0.5 mb-4">Total gap: {totalGap}h este mes</p>
        <ul className="space-y-2">
          {motivos.map((m) => {
            const pct = Math.round((m.horas / Math.max(1, totalGap)) * 100);
            return (
              <li key={m.motivo}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`px-2 py-0.5 rounded-full ${motivosColor[m.motivo]}`}>{m.motivo}</span>
                  <span className="tabular text-muted-foreground">{m.horas}h · {pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-foreground/40" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function PorSupervisor() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
      <div className="p-4 border-b border-border/60">
        <h2 className="font-display text-lg">Resumen por supervisión</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Cuánto programó cada coordinador / supervisor / subdirector / dirección clínica.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Responsable</th>
              <th className="text-left px-4 py-2 font-medium">Rol</th>
              <th className="text-right px-4 py-2 font-medium">Niños</th>
              <th className="text-right px-4 py-2 font-medium">Programables</th>
              <th className="text-right px-4 py-2 font-medium">Programadas</th>
              <th className="text-right px-4 py-2 font-medium">Cumplimiento</th>
              <th className="text-right px-4 py-2 font-medium">Asistencia</th>
            </tr>
          </thead>
          <tbody>
            {supervisoresPlan.map((s) => {
              const pct = Math.round((s.programadas / s.programables) * 100);
              const tone = pct >= 90 ? "text-[oklch(0.45_0.13_155)]" : pct >= 80 ? "text-[oklch(0.5_0.13_60)]" : "text-[oklch(0.5_0.15_25)]";
              return (
                <tr key={s.supervisor} className="border-t border-border/40">
                  <td className="px-4 py-3 font-medium">{s.supervisor}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{s.rol}</td>
                  <td className="px-4 py-3 tabular text-right">{s.ninos}</td>
                  <td className="px-4 py-3 tabular text-right">{s.programables}h</td>
                  <td className="px-4 py-3 tabular text-right">{s.programadas}h</td>
                  <td className={`px-4 py-3 tabular text-right font-medium ${tone}`}>{pct}%</td>
                  <td className="px-4 py-3 tabular text-right">{s.asistencia}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PorNino() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
      <div className="p-4 border-b border-border/60">
        <h2 className="font-display text-lg">Detalle por niño</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Bajo el nombre del niño aparece su <b>asistencia</b> y la <b>supervisión</b> a cargo. Horas aprobadas por INSS vs. programadas; el motivo del gap explica por qué no se pudieron programar.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Niño · Asistencia · Supervisión</th>
              <th className="text-left px-4 py-2 font-medium">Sede</th>
              <th className="text-left px-4 py-2 font-medium">Área</th>
              <th className="text-right px-4 py-2 font-medium">INSS aprob.</th>
              <th className="text-right px-4 py-2 font-medium">Programadas</th>
              <th className="text-left px-4 py-2 font-medium">Motivo del gap</th>
            </tr>
          </thead>
          <tbody>
            {ninosPlan.map((n) => {
              const gap = n.inssAprobadas - n.programadas;
              const asistTone =
                n.asistencia >= 85 ? "bg-[oklch(0.93_0.06_155)] text-[oklch(0.35_0.11_155)]"
                : n.asistencia >= 70 ? "bg-[oklch(0.95_0.07_60)] text-[oklch(0.45_0.13_60)]"
                : "bg-[oklch(0.94_0.06_25)] text-[oklch(0.45_0.15_25)]";
              return (
                <tr key={n.nino} className="border-t border-border/40 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2.5">
                      <div className="h-9 w-9 shrink-0 rounded-full bg-muted grid place-items-center text-[11px] font-medium">{n.iniciales}</div>
                      <div className="min-w-0">
                        <div className="font-medium">{n.nino}</div>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded ${asistTone} tabular font-medium`}>
                            Asistencia {n.asistencia}%
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1 truncate">
                          Supervisión: {n.supervisor}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">{n.sede}</td>
                  <td className="px-4 py-3 text-xs">{n.area}</td>
                  <td className="px-4 py-3 tabular text-right">{n.inssAprobadas}h</td>
                  <td className="px-4 py-3 tabular text-right">{n.programadas}h <span className="text-[11px] text-muted-foreground">({gap > 0 ? `-${gap}h` : "OK"})</span></td>
                  <td className="px-4 py-3 text-xs">
                    {n.motivoGap ? (
                      <span className={`px-2 py-0.5 rounded-full ${motivosColor[n.motivoGap]}`}>{n.motivoGap}</span>
                    ) : (
                      <span className="text-[oklch(0.45_0.13_155)]">Sin gap</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {icon}<span>{label}</span>
      </div>
      <div className="font-display text-3xl mt-2 tabular">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}
