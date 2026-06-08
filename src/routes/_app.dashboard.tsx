import { createFileRoute, Link } from "@tanstack/react-router";
import { sesionesHoy, ninoById, lotesINSS, ninos, areaLabels } from "@/lib/demo-data";
import { AreaBadge } from "@/components/area-badge";
import { Avatar } from "@/components/avatar";
import { TrendingUp, Clock, AlertTriangle, CheckCircle2, ArrowUpRight, FileText, XCircle } from "lucide-react";
import { useSede, matchesSede, sedeLabel } from "@/lib/sedes";
import { AlertaEstancamiento } from "@/components/alerta-estancamiento";
import { IoaBadge } from "@/components/ioa-badge";
import { cartasPorVencer } from "@/lib/cartas-inss";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · CIE" }] }),
  component: Dashboard,
});

function Dashboard() {
  const hoy = new Date();
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
    <div className="w-full max-w-[1400px] space-y-6 overflow-hidden lg:space-y-8">
      {/* Greeting */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground capitalize">{fechaTxt}</p>
          <h1 className="font-display mt-1 text-3xl leading-tight sm:text-4xl">Buenos días, María.</h1>
          <p className="text-muted-foreground mt-2">
            Hoy tenemos <span className="text-foreground font-medium">{total} sesiones</span> programadas en <span className="text-foreground font-medium">{sedeLabel(sede)}</span>.
          </p>
        </div>
        <Link
          to="/asistencia"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Tomar asistencia
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* KPIs — cada uno enlaza a la sección correspondiente */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
        <Kpi to="/asistencia" icon={<CheckCircle2 className="h-4 w-4" />} label="Sesiones completadas" value={`${asistio}/${total}`} hint="hoy" tone="success" />
        <Kpi to="/asistencia" icon={<Clock className="h-4 w-4" />} label="En curso ahora" value={String(enCurso)} hint={`${pend} pendientes`} />
        <Kpi to="/ninos" icon={<TrendingUp className="h-4 w-4" />} label="Niños activos" value={String(activos)} hint="+2 este mes" tone="primary" />
        <Kpi to="/facturacion" icon={<AlertTriangle className="h-4 w-4" />} label="INSS por aprobar" value={`$${inssMes?.monto.toLocaleString()}`} hint={inssMes?.periodo} tone="warning" />
      </div>

      <div className="grid gap-5 xl:grid-cols-3 xl:gap-6">
        {/* Agenda */}
        <div className="min-w-0 rounded-2xl border border-border/70 bg-card xl:col-span-2">
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
                <li key={s.id}>
                  <Link
                    to="/ninos/$id"
                    params={{ id: n.id }}
                    className="grid grid-cols-[3rem_2.25rem_minmax(0,1fr)] items-center gap-3 p-4 transition-colors hover:bg-muted/40 sm:grid-cols-[3.5rem_2.5rem_minmax(0,1fr)_auto_auto] xl:flex xl:gap-4"
                  >
                    <div className="w-12 text-center sm:w-14">
                      <div className="font-display text-lg tabular leading-none">{s.hora}</div>
                      <div className="text-[0.65rem] text-muted-foreground mt-1">{s.duracion}min</div>
                    </div>
                    <Avatar nombre={n.nombre} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{n.nombre}</div>
                      <div className="text-xs text-muted-foreground truncate">{s.terapeuta} · {s.sala}</div>
                    </div>
                    <div className="col-span-3 flex flex-wrap items-center gap-2 sm:col-span-2 sm:justify-end xl:col-span-1 xl:contents">
                      {idx === 0 && <IoaBadge pct={94} />}
                      {idx === 3 && <IoaBadge pct={82} />}
                      <AreaBadge area={s.area} />
                      <EstadoChip estado={s.estado} />
                    </div>
                  </Link>
                </li>
              );
            })}
            {sesionesVis.length === 0 && (
              <li className="p-8 text-center text-sm text-muted-foreground">Sin sesiones en esta sede hoy.</li>
            )}
          </ul>
        </div>

        {/* Right column */}
        <div className="min-w-0 space-y-5 xl:space-y-6">
          {/* INSS card */}
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg">Cobro INSS</h3>
              <Link to="/facturacion" className="text-xs text-primary hover:underline">Detalle</Link>
            </div>
            <div className="space-y-1">
              {lotesINSS.slice(0, 4).map((l) => (
                <Link
                  key={l.id}
                  to="/facturacion/$loteId"
                  params={{ loteId: l.id }}
                  className="flex items-center justify-between text-sm rounded-lg px-2 py-1.5 -mx-2 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <div className="font-medium">{l.periodo}</div>
                    <div className="text-xs text-muted-foreground tabular">{l.horas} horas · {l.ninos} niños</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display tabular">${l.monto.toLocaleString()}</div>
                    <INSSChip estado={l.estado} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Cartas INSS por vencer */}
          <CartasPorVencerCard />

          {/* Areas summary — cada barra enlaza al listado filtrado */}
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <h3 className="font-display text-lg mb-4">Distribución por área</h3>
            <div className="space-y-1">
              {(["conducta", "logopedia", "fisio", "diagnostico"] as const).map((a) => {
                const c = ninosVis.filter((n) => n.areas.includes(a)).length;
                const pct = ninosVis.length ? Math.round((c / ninosVis.length) * 100) : 0;
                return (
                  <Link
                    key={a}
                    to="/ninos"
                    className="block rounded-lg px-2 py-2 -mx-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between text-xs mb-1.5">
                      <span>{areaLabels[a]}</span>
                      <span className="text-muted-foreground tabular">{c} · {pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `var(--color-area-${a})` }} />
                    </div>
                  </Link>
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

function CartasPorVencerCard() {
  const cartas = cartasPorVencer().slice(0, 5);
  const vencidas = cartas.filter((c) => c.estado === "vencida").length;
  const porVencer = cartas.filter((c) => c.estado === "por_vencer").length;
  if (cartas.length === 0) return null;
  return (
    <div className="rounded-2xl border border-[oklch(0.7_0.13_75/0.4)] bg-[oklch(0.98_0.04_75)] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[oklch(0.5_0.13_75)]" />
          <h3 className="font-display text-lg">Cartas INSS por vencer</h3>
        </div>
        <Link to="/facturacion/cartas" className="text-xs text-primary hover:underline">Gestionar</Link>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        {vencidas > 0 && <span className="text-[oklch(0.5_0.15_25)] font-medium">{vencidas} vencidas</span>}
        {vencidas > 0 && porVencer > 0 && " · "}
        {porVencer > 0 && <span>{porVencer} por vencer en 30 días</span>}
      </p>
      <ul className="space-y-0.5">
        {cartas.map((c) => (
          <li key={c.id} className="border-t border-border/40 first:border-t-0">
            <Link
              to="/facturacion/cartas"
              className="flex items-center justify-between text-xs gap-2 py-1.5 px-2 -mx-2 rounded-md hover:bg-card transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{c.ninoNombre}</div>
                <div className="text-[10px] text-muted-foreground truncate">{c.area} · {c.numero}</div>
              </div>
              <div className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-medium ${c.diasRestantes < 0 ? "text-[oklch(0.5_0.15_25)]" : "text-[oklch(0.5_0.13_75)]"}`}>
                {c.diasRestantes < 0 ? <XCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {c.diasRestantes < 0 ? `Hace ${-c.diasRestantes}d` : `${c.diasRestantes}d`}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Kpi({ to, icon, label, value, hint, tone }: { to: string; icon: React.ReactNode; label: string; value: string; hint?: string; tone?: "primary" | "success" | "warning" }) {
  const toneCls = tone === "primary" ? "text-primary" : tone === "success" ? "text-[oklch(0.55_0.1_155)]" : tone === "warning" ? "text-[oklch(0.55_0.13_60)]" : "text-muted-foreground";
  return (
    <Link to={to} className="block rounded-2xl border border-border/70 bg-card p-5 transition-colors hover:border-primary/40 hover:bg-muted/40">
      <div className={`flex items-center gap-2 text-xs uppercase tracking-wider ${toneCls}`}>
        {icon}
        <span>{label}</span>
      </div>
      <div className="font-display text-3xl mt-2 tabular">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </Link>
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
