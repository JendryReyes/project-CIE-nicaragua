import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Play,
  Plus,
  CheckCircle2,
  XCircle,
  Circle,
  ChevronDown,
  Calendar,
  ListChecks,
  TrendingUp,
  Hand,
} from "lucide-react";
import { ninoById, iniciales } from "@/lib/demo-data";
import {
  getObjetivos,
  getAgenda,
  getProgresoAcumulado,
  AREAS_ORDEN,
  type AreaTratamiento,
  type ObjetivoPrograma,
} from "@/lib/sesion-aba-data";

export const Route = createFileRoute("/_app/sesion/$ninoId")({
  head: () => ({ meta: [{ title: "Sesión ABA · CIE" }] }),
  component: SesionLive,
  notFoundComponent: () => (
    <div className="p-12 text-center">
      <p>Niño no encontrado.</p>
      <Link to="/ninos" className="text-primary">Volver</Link>
    </div>
  ),
});

type TabKey = "sesion" | "progreso";

function SesionLive() {
  const { ninoId } = Route.useParams();
  const nino = ninoById(ninoId);
  if (!nino) throw notFound();

  const objetivos = getObjetivos(ninoId);
  const agenda = getAgenda(ninoId);
  const progreso = getProgresoAcumulado(ninoId);
  const [tab, setTab] = useState<TabKey>("sesion");
  const [sesionIniciadaId, setSesionIniciadaId] = useState<string | null>(null);
  const [enSesion, setEnSesion] = useState<string[]>([]); // ids de objetivos
  const [ensayos, setEnsayos] = useState<Record<string, ("+" | "-" | "p")[]>>({});

  const agrupados = useMemo(() => {
    const map: Record<string, ObjetivoPrograma[]> = {};
    for (const o of objetivos) {
      (map[o.area] ??= []).push(o);
    }
    return AREAS_ORDEN.filter((a) => map[a]?.length).map((a) => ({ area: a, items: map[a] }));
  }, [objetivos]);

  const toggleSesion = (id: string) =>
    setEnSesion((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const registrarEnsayo = (id: string, valor: "+" | "-" | "p") =>
    setEnsayos((prev) => ({ ...prev, [id]: [...(prev[id] ?? []), valor] }));

  return (
    <div className="space-y-5 max-w-[1400px]">
      <Link
        to="/ninos/$id"
        params={{ id: ninoId }}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Expediente de {nino.nombre.split(" ")[0]}
      </Link>

      {/* Header del cliente */}
      <header className="rounded-2xl border border-border/70 bg-card p-5 flex items-center gap-4 flex-wrap">
        <div className="h-14 w-14 rounded-2xl bg-primary/15 text-primary grid place-items-center font-display text-xl">
          {iniciales(nino.nombre)}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl leading-tight truncate">{nino.nombre}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-muted-foreground">
            <span>{nino.edad} años</span>
            <span>·</span>
            <span>{nino.sede}</span>
            <span>·</span>
            <span className="rounded-full bg-muted px-2 py-0.5">{nino.diagnostico}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border/70 bg-muted/30 p-0.5">
          <TabBtn active={tab === "sesion"} onClick={() => setTab("sesion")} icon={<ListChecks className="h-3.5 w-3.5" />}>
            Sesión
          </TabBtn>
          <TabBtn active={tab === "progreso"} onClick={() => setTab("progreso")} icon={<TrendingUp className="h-3.5 w-3.5" />}>
            Progreso
          </TabBtn>
        </div>
      </header>

      {tab === "sesion" && (
        <div className="grid lg:grid-cols-[280px_1fr] gap-5">
          {/* Agenda semanal */}
          <aside className="space-y-2">
            <h2 className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium px-1 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Semana del cliente
            </h2>
            {agenda.map((s) => {
              const iniciada = sesionIniciadaId === s.id;
              return (
                <div
                  key={s.id}
                  className={`rounded-xl border bg-card p-3 transition-colors ${
                    iniciada ? "border-primary/60 ring-1 ring-primary/30" : "border-border/70"
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                      {s.dia}
                    </span>
                    <span className="text-[10px] text-muted-foreground tabular">{s.diaCorto}</span>
                  </div>
                  <div className="mt-1 text-sm font-medium tabular">
                    {s.inicio} a {s.fin}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{s.terapeuta}</div>
                  <div className="mt-1.5">
                    <span
                      className={`inline-block text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 ${
                        s.tipo === "Sesión"
                          ? "bg-[oklch(0.94_0.044_160)] text-[oklch(0.35_0.106_160)]"
                          : s.tipo === "Supervisión"
                          ? "bg-[oklch(0.94_0.053_258)] text-[oklch(0.4_0.114_258)]"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s.tipo}
                    </span>
                  </div>
                  <button
                    onClick={() => setSesionIniciadaId(iniciada ? null : s.id)}
                    className={`mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
                      iniciada
                        ? "bg-primary/15 text-primary"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    <Play className="h-3 w-3" />
                    {iniciada ? "Sesión en curso" : "Iniciar sesión"}
                  </button>
                </div>
              );
            })}
          </aside>

          {/* Programas agrupados por área */}
          <section className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-display text-lg">Programas del cliente</h2>
              <button
                onClick={() => setEnSesion(objetivos.map((o) => o.id))}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted"
              >
                <Plus className="h-3.5 w-3.5" /> Agregar todo a la sesión
              </button>
            </div>

            {agrupados.map(({ area, items }) => (
              <div key={area} className="space-y-2">
                <h3 className="text-[10px] uppercase tracking-[0.14em] font-semibold text-muted-foreground px-1">
                  {area}
                </h3>
                <div className="space-y-2">
                  {items.map((o) => {
                    const activo = enSesion.includes(o.id);
                    const trials = ensayos[o.id] ?? [];
                    const correct = trials.filter((t) => t === "+").length;
                    return (
                      <article
                        key={o.id}
                        className={`rounded-xl border bg-card p-4 transition-colors ${
                          activo ? "border-primary/50 bg-primary/[0.02]" : "border-border/70"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium">{o.nombre}</div>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {o.descripcion}
                            </p>
                            <div className="mt-2 flex items-center gap-2 flex-wrap text-[10px]">
                              <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-muted-foreground">
                                <Hand className="h-3 w-3" /> Prompt: {o.prompt}
                              </span>
                              <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground tabular">
                                Dominados: {o.dominados}
                              </span>
                              <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground tabular">
                                Objetivo: {o.ensayosObjetivo} ensayos
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleSesion(o.id)}
                            className={`shrink-0 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
                              activo
                                ? "bg-primary/15 text-primary"
                                : "border border-border hover:bg-muted"
                            }`}
                          >
                            <Plus className="h-3 w-3" />
                            {activo ? "En sesión" : "Agregar a la sesión"}
                          </button>
                        </div>

                        {activo && (
                          <div className="mt-3 pt-3 border-t border-border/40">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-1">
                                <TrialBtn
                                  onClick={() => registrarEnsayo(o.id, "+")}
                                  tone="ok"
                                  icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                                />
                                <TrialBtn
                                  onClick={() => registrarEnsayo(o.id, "-")}
                                  tone="err"
                                  icon={<XCircle className="h-3.5 w-3.5" />}
                                />
                                <TrialBtn
                                  onClick={() => registrarEnsayo(o.id, "p")}
                                  tone="neutral"
                                  icon={<Circle className="h-3.5 w-3.5" />}
                                />
                                <div className="flex items-center gap-1 ml-3 flex-wrap">
                                  {trials.map((t, i) => (
                                    <span
                                      key={i}
                                      className={`inline-grid place-items-center h-5 w-5 rounded-full text-[10px] font-medium ${
                                        t === "+"
                                          ? "bg-[oklch(0.94_0.044_160)] text-[oklch(0.35_0.106_160)]"
                                          : t === "-"
                                          ? "bg-[oklch(0.94_0.035_45)] text-[oklch(0.45_0.114_45)]"
                                          : "bg-muted text-muted-foreground"
                                      }`}
                                    >
                                      {t === "p" ? "·" : t}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="text-[11px] text-muted-foreground tabular">
                                {correct}/{trials.length || o.ensayosObjetivo} ensayos correctos
                              </div>
                            </div>
                            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    ((trials.length || 0) / o.ensayosObjetivo) * 100,
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        </div>
      )}

      {tab === "progreso" && <PanelProgreso progreso={progreso} objetivos={objetivos} />}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function TrialBtn({
  onClick,
  tone,
  icon,
}: {
  onClick: () => void;
  tone: "ok" | "err" | "neutral";
  icon: React.ReactNode;
}) {
  const cls =
    tone === "ok"
      ? "border-[oklch(0.7_0.106_160/0.4)] text-[oklch(0.35_0.106_160)] hover:bg-[oklch(0.94_0.044_160)]"
      : tone === "err"
      ? "border-[oklch(0.7_0.114_45/0.4)] text-[oklch(0.45_0.114_45)] hover:bg-[oklch(0.94_0.035_45)]"
      : "border-border text-muted-foreground hover:bg-muted";
  return (
    <button
      onClick={onClick}
      className={`grid place-items-center h-7 w-7 rounded-md border bg-card ${cls}`}
    >
      {icon}
    </button>
  );
}

function PanelProgreso({
  progreso,
  objetivos,
}: {
  progreso: ReturnType<typeof getProgresoAcumulado>;
  objetivos: ObjetivoPrograma[];
}) {
  const maxY = Math.max(250, Math.ceil((progreso.at(-1)?.acumulado ?? 0) / 50) * 50);
  const w = 720;
  const h = 220;
  const padL = 36;
  const padB = 28;
  const padT = 10;
  const padR = 12;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const stepX = innerW / (progreso.length - 1 || 1);
  const points = progreso.map((p, i) => ({
    x: padL + i * stepX,
    y: padT + innerH - (p.acumulado / maxY) * innerH,
    ...p,
  }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${path} L ${points.at(-1)!.x} ${padT + innerH} L ${points[0].x} ${padT + innerH} Z`;
  const ticks = 5;

  // Agrupar objetivos por área para la tabla
  const grupos = AREAS_ORDEN.map((a) => ({
    area: a,
    items: objetivos.filter((o) => o.area === a),
  })).filter((g) => g.items.length);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border/70 bg-card p-5">
        <header className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div>
            <h2 className="font-display text-lg">Número acumulado de objetivos dominados</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Curva clínica del caso · 24 meses
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-full bg-primary" />
              Acumulado
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2 w-4 rounded-full bg-primary/30" />
              Recientemente dominados
            </span>
          </div>
        </header>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto min-w-[560px]">
            {/* grid */}
            {Array.from({ length: ticks + 1 }).map((_, i) => {
              const y = padT + (innerH / ticks) * i;
              const val = Math.round(maxY - (maxY / ticks) * i);
              return (
                <g key={i}>
                  <line
                    x1={padL}
                    x2={w - padR}
                    y1={y}
                    y2={y}
                    stroke="currentColor"
                    className="text-border/60"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padL - 6}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-muted-foreground text-[10px] tabular"
                  >
                    {val}
                  </text>
                </g>
              );
            })}
            {/* bars: recientes */}
            {points.map((p, i) => {
              const bw = Math.max(8, stepX * 0.35);
              const barH = (p.recientes / maxY) * innerH;
              return (
                <rect
                  key={i}
                  x={p.x - bw / 2}
                  y={padT + innerH - barH}
                  width={bw}
                  height={barH}
                  className="fill-primary/25"
                  rx={2}
                />
              );
            })}
            {/* area + line */}
            <path d={area} className="fill-primary/10" />
            <path d={path} fill="none" className="stroke-primary" strokeWidth={2} />
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={3.2} className="fill-primary" />
                <text
                  x={p.x}
                  y={h - 8}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {p.mes}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <header className="flex items-center justify-between px-5 py-3 border-b border-border/60">
          <h3 className="font-display text-base">Programas por área de tratamiento</h3>
          <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            Agrupar por: Área de tratamiento <ChevronDown className="h-3 w-3" />
          </button>
        </header>
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-left">Programa</th>
              <th className="text-center">Línea base</th>
              <th className="text-center">Adquisición</th>
              <th className="text-center">Mantenimiento</th>
              <th className="text-center">Dominados</th>
              <th className="text-center">Prom. pruebas para dominar</th>
              <th className="text-center pr-4">Prom. sesiones para dominar</th>
            </tr>
          </thead>
          <tbody>
            {grupos.map((g) => (
              <FragmentGrupo key={g.area} area={g.area} items={g.items} />
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function FragmentGrupo({ area, items }: { area: AreaTratamiento; items: ObjetivoPrograma[] }) {
  return (
    <>
      <tr className="bg-muted/20">
        <td colSpan={7} className="px-4 py-2 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          {area}
        </td>
      </tr>
      {items.map((o) => (
        <tr key={o.id} className="border-t border-border/40">
          <td className="px-4 py-2">{o.nombre}</td>
          <td className="text-center tabular">{o.enLineaBase || ""}</td>
          <td className="text-center tabular">{o.enAdquisicion || ""}</td>
          <td className="text-center tabular">{o.enMantenimiento || ""}</td>
          <td className="text-center tabular font-medium">{o.dominados || ""}</td>
          <td className="text-center tabular text-muted-foreground">{o.promedioPruebas ?? ""}</td>
          <td className="text-center tabular text-muted-foreground pr-4">{o.promedioSesiones ?? ""}</td>
        </tr>
      ))}
    </>
  );
}
