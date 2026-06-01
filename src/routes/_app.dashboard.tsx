import { createFileRoute, Link } from "@tanstack/react-router";
import { sesionesHoy, ninoById, lotesINSS, ninos, areaLabels } from "@/lib/demo-data";
import { AreaBadge } from "@/components/area-badge";
import { Avatar } from "@/components/avatar";
import { TrendingUp, Clock, AlertTriangle, CheckCircle2, ArrowUpRight } from "lucide-react";
import { useSede, matchesSede, sedeLabel } from "@/lib/sedes";
import { AlertaEstancamiento } from "@/components/alerta-estancamiento";
import { IoaBadge } from "@/components/ioa-badge";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · CIE" }] }),
  component: Dashboard,
});

function Dashboard() {
  const hoy = new Date("2026-06-01");
  const fechaTxt = hoy.toLocaleDateString("es-NI", { weekday: "long", day: "numeric", month: "long" });
  const { sede } = useSede();

  const ninosVis = ninos.filter((n) => matchesSede(n.sede, sede));
  const ninosVisIds = new Set(ninosVis.map((n) => n.id));
  const sesionesVis = sesionesHoy.filter((s) => ninosVisIds.has(s.ninoId));

  const asistio = sesionesVis.filter((s) => s.estado === "asistio").length;
  const enCurso = sesionesVis.filter((s) => s.estado === "en_curso").length;
  const pend = sesionesVis.filter((s) => s.estado === "programada").length;
  const total = sesionesVis.length;
  const activos = ninosVis.filter((n) => n.estado === "activo").length;
  const inssMes = lotesINSS.find((l) => l.estado === "enviado");

  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* Greeting */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-muted-foreground capitalize">{fechaTxt}</p>
          <h1 className="font-display text-4xl mt-1">Buenos días, María.</h1>
          <p className="text-muted-foreground mt-2">
            Hoy tenemos <span className="text-foreground font-medium">{total} sesiones</span> programadas en <span className="text-foreground font-medium">{sedeLabel(sede)}</span>.
          </p>
        </div>
        <Link
          to="/asistencia"
          className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90"
        >
          Tomar asistencia
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={<CheckCircle2 className="h-4 w-4" />} label="Sesiones completadas" value={`${asistio}/${total}`} hint="hoy" tone="success" />
        <Kpi icon={<Clock className="h-4 w-4" />} label="En curso ahora" value={String(enCurso)} hint={`${pend} pendientes`} />
        <Kpi icon={<TrendingUp className="h-4 w-4" />} label="Niños activos" value={String(activos)} hint="+2 este mes" tone="primary" />
        <Kpi icon={<AlertTriangle className="h-4 w-4" />} label="INSS por aprobar" value={`$${inssMes?.monto.toLocaleString()}`} hint={inssMes?.periodo} tone="warning" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Agenda */}
        <div className="lg:col-span-2 rounded-2xl border border-border/70 bg-card">
          <div className="flex items-center justify-between p-5 border-b border-border/60">
            <div>
              <h2 className="font-display text-xl">Agenda de hoy</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Sala, terapeuta y estado en tiempo real</p>
            </div>
            <Link to="/horario" className="text-sm text-primary hover:underline">Ver semana →</Link>
          </div>
          <ul className="divide-y divide-border/60">
            {sesionesVis.slice(0, 8).map((s, idx) => {
              const n = ninoById(s.ninoId)!;
              return (
                <li key={s.id} className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors">
                  <div className="w-14 text-center">
                    <div className="font-display text-lg tabular leading-none">{s.hora}</div>
                    <div className="text-[0.65rem] text-muted-foreground mt-1">{s.duracion}min</div>
                  </div>
                  <Avatar nombre={n.nombre} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{n.nombre}</div>
                    <div className="text-xs text-muted-foreground truncate">{s.terapeuta} · {s.sala}</div>
                  </div>
                  {idx === 0 && <IoaBadge pct={94} />}
                  {idx === 3 && <IoaBadge pct={82} />}
                  <AreaBadge area={s.area} />
                  <EstadoChip estado={s.estado} />
                </li>
              );
            })}
            {sesionesVis.length === 0 && (
              <li className="p-8 text-center text-sm text-muted-foreground">Sin sesiones en esta sede hoy.</li>
            )}
          </ul>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* INSS card */}
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg">Cobro INSS</h3>
              <Link to="/facturacion" className="text-xs text-primary hover:underline">Detalle</Link>
            </div>
            <div className="space-y-3">
              {lotesINSS.slice(0, 4).map((l) => (
                <div key={l.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{l.periodo}</div>
                    <div className="text-xs text-muted-foreground tabular">{l.horas} horas · {l.ninos} niños</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display tabular">${l.monto.toLocaleString()}</div>
                    <INSSChip estado={l.estado} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Areas summary */}
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <h3 className="font-display text-lg mb-4">Distribución por área</h3>
            <div className="space-y-3">
              {(["conducta", "logopedia", "fisio", "diagnostico"] as const).map((a) => {
                const c = ninosVis.filter((n) => n.areas.includes(a)).length;
                const pct = ninosVis.length ? Math.round((c / ninosVis.length) * 100) : 0;
                return (
                  <div key={a}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span>{areaLabels[a]}</span>
                      <span className="text-muted-foreground tabular">{c} · {pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `var(--color-area-${a})` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <AlertaEstancamiento />
        </div>
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, hint, tone }: { icon: React.ReactNode; label: string; value: string; hint?: string; tone?: "primary" | "success" | "warning" }) {
  const toneCls = tone === "primary" ? "text-primary" : tone === "success" ? "text-[oklch(0.55_0.1_155)]" : tone === "warning" ? "text-[oklch(0.55_0.13_60)]" : "text-muted-foreground";
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5">
      <div className={`flex items-center gap-2 text-xs uppercase tracking-wider ${toneCls}`}>
        {icon}
        <span>{label}</span>
      </div>
      <div className="font-display text-3xl mt-2 tabular">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

function EstadoChip({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    asistio: "bg-[oklch(0.94_0.05_155)] text-[oklch(0.4_0.1_155)]",
    en_curso: "bg-[oklch(0.94_0.06_60)] text-[oklch(0.4_0.13_60)] animate-pulse",
    programada: "bg-muted text-muted-foreground",
    ausente: "bg-[oklch(0.94_0.06_25)] text-[oklch(0.45_0.15_25)]",
  };
  const label: Record<string, string> = { asistio: "Asistió", en_curso: "En curso", programada: "Pendiente", ausente: "Ausente" };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[estado]}`}>{label[estado]}</span>;
}

function INSSChip({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    pagado: "text-[oklch(0.5_0.1_155)]",
    enviado: "text-[oklch(0.5_0.13_60)]",
    borrador: "text-muted-foreground",
    aprobado: "text-[oklch(0.5_0.1_200)]",
    rechazado: "text-[oklch(0.5_0.15_25)]",
  };
  return <div className={`text-[0.65rem] uppercase tracking-wider mt-0.5 ${map[estado]}`}>{estado}</div>;
}
