import { createFileRoute, Link } from "@tanstack/react-router";
import { sesionesHoy, ninoById, lotesINSS, ninos, areaLabels } from "@/lib/demo-data";
import { AreaBadge } from "@/components/area-badge";
import { Avatar } from "@/components/avatar";
import {
  TrendingUp, Clock, AlertTriangle, CheckCircle2, ArrowUpRight, FileText, XCircle,
  UserPlus, CalendarClock, Activity, BookOpen, LineChart as LineChartIcon, Timer,
} from "lucide-react";
import { useSede, matchesSede, sedeLabel } from "@/lib/sedes";
import { AlertaEstancamiento } from "@/components/alerta-estancamiento";
import { IoaBadge } from "@/components/ioa-badge";
import { cartasPorVencer } from "@/lib/cartas-inss";
import { resumenMatricula, movimientosNinos } from "@/lib/modulos-data";
import { totales as totalesPlan, motivosResumen, motivosColor } from "@/lib/planificacion-data";
import { puntualidadHoy, totalesPuntualidad } from "@/lib/puntualidad-data";
import { AgenteCIE } from "@/components/agente-cie";


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

  const enCurso = sesionesVis.filter((s) => s.estado === "en_curso").length;
  const total = sesionesVis.length;
  const inssMes = lotesINSS.find((l) => l.estado === "enviado");

  const r = resumenMatricula;
  const plan = totalesPlan();
  const punt = totalesPuntualidad();
  const motivos = motivosResumen().slice(0, 3);
  const ingresosRecientes = movimientosNinos.filter((m) => m.tipo === "ingreso").slice(0, 4);

  // niños con documentos faltantes (checklist del Manual)
  const docsFaltantes = movimientosNinos
    .filter((m) => m.documentosFaltantes.length > 0)
    .slice(0, 4);

  return (
    <div className="w-full max-w-[1400px] space-y-8 overflow-hidden">
      {/* Greeting */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground capitalize">{fechaTxt}</p>
          <h1 className="font-display mt-1 text-3xl leading-tight sm:text-4xl">Buenos días, María.</h1>
          <p className="text-muted-foreground mt-2">
            Hoy hay <span className="text-foreground font-medium">{total} sesiones</span> · <span className="text-foreground font-medium">{enCurso} en curso</span> · {sedeLabel(sede)}
          </p>
        </div>
        <Link
          to="/asistencia"
          className="bg-gradient-suave inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-suave transition-opacity hover:opacity-90"
        >
          Tomar asistencia <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* ───────────── 1. MATRÍCULA ───────────── */}
      <Seccion
        numero="1"
        titulo="Matrícula"
        sub="Punto de partida del flujo · niños, documentos y horas INSS"
        verMas="/matricula"
        icon={<UserPlus className="h-4 w-4" />}
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi to="/matricula" icon={<UserPlus className="h-4 w-4" />} label="Activos" value={String(r.activos)} hint={`+${r.ingresosMes} este mes`} tone="primary" />
          <Kpi to="/matricula" icon={<Clock className="h-4 w-4" />} label="Horas planificadas" value={`${r.horasProgramadas}h`} hint={`${r.horasSubrogadas}h subrogadas`} />
          <Kpi to="/facturacion" icon={<FileText className="h-4 w-4" />} label="Horas acreditadas INSS" value={`${Math.round(r.horasProgramadas * (r.cobertura / 100))}h`} hint={`${r.cobertura}% cobertura`} tone="success" />
          <Kpi to="/matricula" icon={<AlertTriangle className="h-4 w-4" />} label="Docs. pendientes" value={String(docsFaltantes.length)} hint="del checklist Manual" tone="warning" />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-base">Ingresos recientes</h3>
              <Link to="/matricula" className="text-xs text-primary hover:underline">Ver todos</Link>
            </div>
            <ul className="divide-y divide-border/40">
              {ingresosRecientes.map((m) => (
                <li key={m.expediente} className="flex items-center gap-3 py-2.5">
                  <div className="h-9 w-9 rounded-full bg-muted grid place-items-center text-xs font-medium">{m.iniciales}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{m.nino}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{m.expediente} · {m.sede} · {m.cobertura}</div>
                  </div>
                  <span className="text-[10px] tabular text-muted-foreground">{m.fecha.slice(5)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[oklch(0.88_0.088_80/0.5)] bg-[oklch(0.98_0.014_265)]/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[oklch(0.55_0.114_80)]" /> Checklist del Manual — pendientes
              </h3>
              <Link to="/matricula" className="text-xs text-primary hover:underline">Resolver</Link>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              1ª evaluación · entrevista a padres · consentimiento · colilla INSS · diagnóstico · contrato
            </p>
            <ul className="space-y-1.5">
              {docsFaltantes.map((m) => (
                <li key={m.expediente} className="flex items-center justify-between text-xs gap-2 rounded-md px-2 py-1.5 -mx-2 hover:bg-card transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{m.nino}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{m.documentosFaltantes.join(" · ")}</div>
                  </div>
                  <span className="text-[10px] text-[oklch(0.5_0.114_80)] font-medium shrink-0">Falta {m.documentosFaltantes.length}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Seccion>

      {/* ───────────── 2. PLANIFICACIÓN ───────────── */}
      <Seccion
        numero="2"
        titulo="Planificación"
        sub="Potencialidad de horas · supervisión por Coordinación, Supervisión, Subdirección, Dirección clínica"
        verMas="/planificacion"
        icon={<CalendarClock className="h-4 w-4" />}
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi to="/planificacion" icon={<CalendarClock className="h-4 w-4" />} label="Programables" value={`${plan.programables}h`} />
          <Kpi to="/planificacion" icon={<TrendingUp className="h-4 w-4 text-[oklch(0.55_0.088_160)]" />} label="Programadas" value={`${plan.programadas}h`} hint={`${plan.cobertura}% cobertura`} tone="success" />
          <Kpi to="/planificacion" icon={<AlertTriangle className="h-4 w-4 text-[oklch(0.55_0.114_80)]" />} label="Gap" value={`${plan.programables - plan.programadas}h`} tone="warning" />
          <Kpi to="/planificacion" icon={<TrendingUp className="h-4 w-4" />} label="Niños en plan" value={String(plan.ninos)} />
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-base">Causas de horas no programadas</h3>
            <Link to="/planificacion" className="text-xs text-primary hover:underline">Detalle por niño</Link>
          </div>
          <ul className="space-y-2">
            {motivos.map((m) => (
              <li key={m.motivo} className="flex items-center justify-between text-sm">
                <span className={`text-xs px-2 py-0.5 rounded-full ${motivosColor[m.motivo]}`}>{m.motivo}</span>
                <span className="tabular text-muted-foreground text-xs">{m.horas}h</span>
              </li>
            ))}
          </ul>
        </div>
      </Seccion>

      {/* ───────────── 3. ABA / CLÍNICO ───────────── */}
      <Seccion
        numero="3"
        titulo="ABA / Clínico"
        sub="Sesiones, biblioteca y gráficas de progreso"
        verMas="/biblioteca"
        icon={<BookOpen className="h-4 w-4" />}
      >
        <div className="grid gap-5 xl:grid-cols-3">
          <div className="min-w-0 rounded-2xl border border-border/70 bg-card xl:col-span-2">
            <div className="flex items-center justify-between p-5 border-b border-border/60">
              <div>
                <h2 className="font-display text-lg">Agenda de hoy</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Sesiones programadas y en curso</p>
              </div>
              <Link to="/horario" className="text-sm text-primary hover:underline">Ver semana →</Link>
            </div>
            <ul className="divide-y divide-border/60">
              {sesionesVis.slice(0, 6).map((s, idx) => {
                const n = ninoById(s.ninoId)!;
                return (
                  <li key={s.id}>
                    <Link
                      to="/ninos/$id"
                      params={{ id: n.id }}
                      className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/40"
                    >
                      <div className="w-12 text-center shrink-0">
                        <div className="font-display text-lg tabular leading-none">{s.hora}</div>
                        <div className="text-[0.65rem] text-muted-foreground mt-1">{s.duracion}min</div>
                      </div>
                      <Avatar nombre={n.nombre} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{n.nombre}</div>
                        <div className="text-xs text-muted-foreground truncate">{s.terapeuta} · {s.sala}</div>
                      </div>
                      {idx === 0 && <IoaBadge pct={94} />}
                      <AreaBadge area={s.area} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <h3 className="font-display text-lg mb-4">Accesos clínicos</h3>
              <div className="grid grid-cols-1 gap-2">
                <AccesoLink to="/biblioteca" icon={<BookOpen className="h-4 w-4" />} label="Biblioteca ABA" hint="programas y materiales" />
                <AccesoLink to="/clinico/graficas" icon={<LineChartIcon className="h-4 w-4" />} label="Gráficas de progreso" hint="masterización y fases" />
                <AccesoLink to="/ninos" icon={<TrendingUp className="h-4 w-4" />} label="Expedientes clínicos" hint="todos los niños" />
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <h3 className="font-display text-lg mb-4">Distribución por área</h3>
              <div className="space-y-1">
                {(["conducta", "logopedia", "fisio", "diagnostico"] as const).map((a) => {
                  const c = ninosVis.filter((n) => n.areas.includes(a)).length;
                  const pct = ninosVis.length ? Math.round((c / ninosVis.length) * 100) : 0;
                  return (
                    <Link key={a} to="/ninos" className="block rounded-lg px-2 py-2 -mx-2 hover:bg-muted/50 transition-colors">
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
      </Seccion>

      {/* ───────────── 4. EJECUCIÓN Y PUNTUALIDAD ───────────── */}
      <Seccion
        numero="4"
        titulo="Ejecución y puntualidad"
        sub="Control de hora de ingreso del niño · reporte por sede"
        verMas="/asistencia"
        icon={<Activity className="h-4 w-4" />}
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi to="/asistencia" icon={<CheckCircle2 className="h-4 w-4" />} label="A tiempo" value={String(punt.aTiempo)} hint={`${punt.pctATiempo}% del total`} tone="success" />
          <Kpi to="/asistencia" icon={<Timer className="h-4 w-4 text-[oklch(0.55_0.114_80)]" />} label="Tarde (≥15 min)" value={String(punt.tarde)} hint={`${punt.tardeLeve} leves`} tone="warning" />
          <Kpi to="/asistencia" icon={<XCircle className="h-4 w-4 text-[oklch(0.55_0.132_30)]" />} label="Ausentes" value={String(punt.ausentes)} />
          <Kpi to="/asistencia" icon={<Clock className="h-4 w-4" />} label="Desviación promedio" value={`${punt.desviacion} min`} hint="atrasos > 0 min" />
        </div>

        <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
          <div className="p-4 border-b border-border/60 flex items-center justify-between">
            <h3 className="font-display text-base">Puntualidad por sede — hoy</h3>
            <Link to="/asistencia" className="text-xs text-primary hover:underline">Ver reporte completo →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Sede</th>
                  <th className="text-right px-4 py-2 font-medium">Atendidos</th>
                  <th className="text-right px-4 py-2 font-medium">A tiempo</th>
                  <th className="text-right px-4 py-2 font-medium">Tarde leve</th>
                  <th className="text-right px-4 py-2 font-medium">Tarde ≥15min</th>
                  <th className="text-right px-4 py-2 font-medium">Ausentes</th>
                  <th className="text-right px-4 py-2 font-medium">Desv. prom.</th>
                </tr>
              </thead>
              <tbody>
                {puntualidadHoy.map((s) => {
                  const pct = Math.round((s.aTiempo / s.atendidos) * 100);
                  return (
                    <tr key={s.sede} className="border-t border-border/40">
                      <td className="px-4 py-3 font-medium">{s.sede}</td>
                      <td className="px-4 py-3 tabular text-right">{s.atendidos}</td>
                      <td className="px-4 py-3 tabular text-right text-[oklch(0.45_0.114_160)] font-medium">{s.aTiempo} <span className="text-[10px] text-muted-foreground">({pct}%)</span></td>
                      <td className="px-4 py-3 tabular text-right text-[oklch(0.5_0.114_80)]">{s.tardeLeve}</td>
                      <td className="px-4 py-3 tabular text-right text-[oklch(0.5_0.132_30)] font-medium">{s.tarde}</td>
                      <td className="px-4 py-3 tabular text-right">{s.ausentes}</td>
                      <td className="px-4 py-3 tabular text-right">{s.desviacionPromMin} min</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Seccion>

      {/* ───────────── 5. FACTURACIÓN INSS ───────────── */}
      <Seccion
        numero="5"
        titulo="Facturación INSS"
        sub="Lotes mensuales y cartas por vencer"
        verMas="/facturacion"
        icon={<FileText className="h-4 w-4" />}
      >
        <div className="grid gap-5 lg:grid-cols-2">
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
            {inssMes && (
              <div className="mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground">
                Lote enviado pendiente de aprobar: <b className="text-foreground">${inssMes.monto.toLocaleString()}</b> · {inssMes.periodo}
              </div>
            )}
          </div>
          <CartasPorVencerCard />
        </div>
      </Seccion>

      <AgenteCIE />
    </div>
  );
}

function Seccion({
  numero, titulo, sub, verMas, icon, children,
}: {
  numero: string; titulo: string; sub: string; verMas: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3 border-b border-border/60 pb-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold tabular">
            {numero}
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-xl flex items-center gap-2">{icon} {titulo}</h2>
            <p className="text-xs text-muted-foreground truncate">{sub}</p>
          </div>
        </div>
        <Link to={verMas} className="text-xs text-primary hover:underline whitespace-nowrap">Abrir módulo →</Link>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function AccesoLink({ to, icon, label, hint }: { to: string; icon: React.ReactNode; label: string; hint: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5 hover:border-primary/40 hover:bg-muted/40 transition-colors">
      <span className="text-primary">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] text-muted-foreground">{hint}</div>
      </div>
      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
    </Link>
  );
}

function CartasPorVencerCard() {
  const cartas = cartasPorVencer().slice(0, 5);
  const vencidas = cartas.filter((c) => c.estado === "vencida").length;
  const porVencer = cartas.filter((c) => c.estado === "por_vencer").length;
  if (cartas.length === 0) return null;
  return (
    <div className="rounded-2xl border border-[oklch(0.7_0.114_80/0.4)] bg-[oklch(0.98_0.035_80)] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[oklch(0.5_0.114_80)]" />
          <h3 className="font-display text-lg">Cartas INSS por vencer</h3>
        </div>
        <Link to="/facturacion/cartas" className="text-xs text-primary hover:underline">Gestionar</Link>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        {vencidas > 0 && <span className="text-[oklch(0.5_0.132_30)] font-medium">{vencidas} vencidas</span>}
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
              <div className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-medium ${c.diasRestantes < 0 ? "text-[oklch(0.5_0.132_30)]" : "text-[oklch(0.5_0.114_80)]"}`}>
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
  const toneCls = tone === "primary" ? "text-primary" : tone === "success" ? "text-success" : tone === "warning" ? "text-[oklch(0.55_0.114_80)]" : "text-muted-foreground";
  return (
    <Link
      to={to}
      className="border-gradient-top block overflow-hidden rounded-2xl border border-border/70 bg-gradient-kpi p-5 transition-shadow hover:shadow-suave"
    >
      <div className={`flex items-center gap-2 text-xs uppercase tracking-wider ${toneCls}`}>
        {icon}
        <span>{label}</span>
      </div>
      <div className="font-display text-3xl mt-2 tabular">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </Link>
  );
}

function INSSChip({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    pagado: "text-[oklch(0.5_0.088_160)]",
    enviado: "text-[oklch(0.5_0.114_80)]",
    borrador: "text-muted-foreground",
    aprobado: "text-[oklch(0.5_0.088_258)]",
    rechazado: "text-[oklch(0.5_0.132_30)]",
  };
  return <div className={`text-[0.65rem] uppercase tracking-wider mt-0.5 ${map[estado]}`}>{estado}</div>;
}
