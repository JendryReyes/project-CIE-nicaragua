import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ninoById, sesionesHoy, areaLabels, iniciales, type Area } from "@/lib/demo-data";
import {
  ArrowLeft, FileText, MessageSquare, Phone, Mail, Download, Plus, CheckCircle2,
  Stethoscope, Upload, ClipboardList, AlertTriangle, LineChart, Calendar, Users as UsersIcon,
  FolderOpen, Receipt, BookOpen, ExternalLink, Home, School, MapPin, Database, BarChart3,
  ListTree, FileCheck, CalendarClock, StickyNote, Star,
} from "lucide-react";
import {
  getPrograma, getEvaluaciones, getPlanesConducta, getDocumentos, getFacturacion,
  calcularProgresoClinico, documentosObligatorios,
  getCaregivers, getDirecciones, getEventosCaso,
} from "@/lib/perfil-nino-data";
import { cartasPorNino, estadoCartaColor } from "@/lib/cartas-inss";
import { GraficaProgramaModal } from "@/components/grafica-programa-modal";


export const Route = createFileRoute("/_app/ninos/$id")({
  head: () => ({ meta: [{ title: "Expediente · CIE" }] }),
  component: NinoDetalle,
  notFoundComponent: () => (
    <div className="p-12 text-center">
      <p>Expediente no encontrado.</p>
      <Link to="/ninos" className="text-primary">Volver</Link>
    </div>
  ),
});

const TABS = ["Resumen", "Programas", "Sesiones", "Eventos", "Evaluaciones", "Conducta", "Familia", "Expediente", "Facturación"] as const;
type Tab = (typeof TABS)[number];

function NinoDetalle() {
  const { id } = Route.useParams();
  const n = ninoById(id);
  if (!n) throw notFound();
  const [tab, setTab] = useState<Tab>("Resumen");
  const [grafica, setGrafica] = useState<{ nombre: string; area?: string } | null>(null);
  const programas = getPrograma(id);
  const evaluaciones = getEvaluaciones(id);
  const planes = getPlanesConducta(id);
  const documentos = getDocumentos(id);
  const facturacion = getFacturacion(id);
  const progreso = calcularProgresoClinico(id);
  const master = programas.filter((p) => p.estado === "masterizado" || p.estado === "mantenimiento").length;
  const sesionesNino = sesionesHoy.filter((s) => s.ninoId === id);

  return (
    <div className="space-y-5 max-w-[1400px]">
      <Link to="/ninos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Niños y niñas
      </Link>

      {/* Header */}
      <header className="rounded-2xl border border-border/70 bg-card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-5">
            <div className="h-20 w-20 rounded-2xl bg-primary/15 text-primary grid place-items-center font-display text-2xl">
              {iniciales(n.nombre)}
            </div>
            <div>
              <h1 className="font-display text-3xl leading-tight">{n.nombre}</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs">
                <span className="text-muted-foreground tabular">#{n.id}</span>
                <span className="text-muted-foreground">·</span>
                <span>{n.edad} años</span>
                <span className="text-muted-foreground">·</span>
                <span>{n.sede}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 ml-1">{n.diagnostico}</span>
                <EstadoBadge estado={n.estado} />
              </div>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 max-w-[260px]">
                  <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    <span>Progreso global</span>
                    <span className="tabular">{master}/{programas.length} objetivos</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${progreso}%` }} />
                  </div>
                </div>
                <span className="font-display text-xl tabular">{progreso}%</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link
              to="/sesion/$ninoId"
              params={{ ninoId: id }}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" /> Iniciar sesión ABA
            </Link>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted">
              <FileText className="h-3.5 w-3.5" /> Generar informe
            </button>
            <button
              onClick={() => setGrafica({ nombre: programas[0]?.nombre ?? "Programa", area: programas[0]?.area })}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted"
            >
              <LineChart className="h-3.5 w-3.5" /> Ver gráficas
            </button>
          </div>
        </div>
      </header>

      {/* Case rail (estilo Office Puzzle) */}
      <CaseRail ninoId={id} onTab={(t) => setTab(t)} />

      {/* Tabs */}
      <div className="border-b border-border/60 flex gap-1 overflow-x-auto">
        {TABS.map((t: Tab) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
              tab === t ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Resumen" && <TabResumen nino={n} sesiones={sesionesNino} ninoId={id} />}
      {tab === "Programas" && <TabProgramas programas={programas} onVerGrafica={(p) => setGrafica({ nombre: p.nombre, area: p.area })} />}
      {tab === "Sesiones" && <TabSesiones ninoId={id} />}
      {tab === "Eventos" && <TabEventos ninoId={id} />}
      {tab === "Evaluaciones" && <TabEvaluaciones evaluaciones={evaluaciones} />}
      {tab === "Conducta" && <TabConducta planes={planes} />}
      {tab === "Familia" && <TabFamilia nino={n} ninoId={id} />}
      {tab === "Expediente" && <TabExpediente documentos={documentos} />}
      {tab === "Facturación" && <TabFacturacion facturacion={facturacion} />}

      <GraficaProgramaModal
        open={!!grafica}
        onClose={() => setGrafica(null)}
        ninoNombre={n.nombre}
        programaNombre={grafica?.nombre ?? ""}
        area={grafica?.area}
      />
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const cls = estado === "activo" ? "bg-[oklch(0.94_0.05_155)] text-[oklch(0.35_0.12_155)]"
    : estado === "evaluacion" ? "bg-[oklch(0.94_0.06_75)] text-[oklch(0.4_0.13_75)]"
    : "bg-[oklch(0.94_0.04_25)] text-[oklch(0.45_0.13_25)]";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${cls}`}>{estado}</span>;
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5">
      <header className="flex items-center justify-between mb-3">
        <h3 className="font-display text-base">{title}</h3>
        {action}
      </header>
      {children}
    </section>
  );
}

// ===== TABS =====

function TabResumen({ nino, sesiones, ninoId }: { nino: any; sesiones: any[]; ninoId: string }) {
  const caregivers = getCaregivers(ninoId);
  const direcciones = getDirecciones(ninoId);
  const primario = caregivers.find((c) => c.primario) ?? caregivers[0];
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Section title="Personal">
        <Row label="Nombre" value={nino.nombre} />
        <Row label="Edad" value={`${nino.edad} años`} />
        <Row label="Sede" value={nino.sede} />
        <Row label="Idioma" value="Español" />
        <Row label="Género" value="Masculino" />
        <Row label="Ingreso" value={nino.ingreso} />
      </Section>
      <Section title="Clínico">
        <Row label="Diagnóstico" value={nino.diagnostico} />
        <Row label="Terapeuta líder" value={nino.terapeuta} icon={<Stethoscope className="h-3 w-3" />} />
        <Row label="Cobertura" value={nino.inss ? "INSS" : "Privado"} />
        <Row label="ABA aprobadas" value="32h / mes" />
        <Row label="Logopedia aprobadas" value="8h / mes" />
        <Row label="Carta vigente" value="31 / 12 / 2026" />
      </Section>
      <Section title="Caregivers" action={<button className="text-xs text-primary hover:underline">+ Agregar</button>}>
        <ul className="space-y-2">
          {caregivers.map((c) => (
            <li key={c.id} className="rounded-lg border border-border/60 p-2.5 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate flex-1">{c.nombre}</span>
                {c.primario && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] uppercase tracking-wider rounded-full bg-primary/15 text-primary px-1.5 py-0.5">
                    <Star className="h-2.5 w-2.5 fill-current" /> Primario
                  </span>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{c.relacion}</div>
              <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {c.telefono}</span>
                {c.correo !== "—" && (
                  <span className="inline-flex items-center gap-1 truncate"><Mail className="h-3 w-3" /> {c.correo}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Direcciones" action={<button className="text-xs text-primary hover:underline">+ Agregar</button>}>
        <ul className="space-y-2">
          {direcciones.map((d) => (
            <li key={d.id} className="flex items-start gap-2 text-sm rounded-lg border border-border/60 p-2.5">
              {d.tipo === "Casa" ? <Home className="h-3.5 w-3.5 text-primary mt-0.5" /> :
               d.tipo === "Escuela" ? <School className="h-3.5 w-3.5 text-primary mt-0.5" /> :
               <MapPin className="h-3.5 w-3.5 text-primary mt-0.5" />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider rounded-full bg-muted px-1.5 py-0.5">{d.tipo}</span>
                </div>
                <p className="text-[12px] mt-0.5 leading-tight">{d.linea}</p>
                <p className="text-[11px] text-muted-foreground">{d.ciudad}, {d.departamento} · {d.pais}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Próximas sesiones" action={<Link to="/horario" className="text-xs text-primary hover:underline">Ver agenda</Link>}>
        {sesiones.length ? sesiones.slice(0, 3).map((s) => (
          <div key={s.id} className="flex items-center gap-3 py-1.5 border-t border-border/40 first:border-t-0 text-sm">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="tabular w-12">{s.hora}</span>
            <span className="flex-1">{areaLabels[s.area as Area]}</span>
            <span className="text-xs text-muted-foreground">{s.sala}</span>
          </div>
        )) : <p className="text-xs text-muted-foreground">Sin sesiones programadas hoy.</p>}
      </Section>
      <Section title="Contacto primario" action={primario ? <a href={`tel:${primario.telefono}`} className="text-xs text-primary hover:underline">Llamar</a> : null}>
        {primario ? (
          <div className="text-sm space-y-1">
            <div className="font-medium">{primario.nombre}</div>
            <div className="text-[11px] text-muted-foreground">{primario.relacion}</div>
            <div className="text-[12px] mt-2 flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" /> {primario.telefono}</div>
            <div className="text-[12px] flex items-center gap-1"><Mail className="h-3 w-3 text-muted-foreground" /> {primario.correo}</div>
          </div>
        ) : <p className="text-xs text-muted-foreground">Sin caregiver registrado.</p>}
      </Section>
    </div>
  );
}

function TabProgramas({ programas, onVerGrafica }: { programas: ReturnType<typeof getPrograma>; onVerGrafica: (p: ReturnType<typeof getPrograma>[number]) => void }) {
  const [filtro, setFiltro] = useState<string>("todos");
  const lista = filtro === "todos" ? programas : programas.filter((p) => p.estado === filtro);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {["todos", "linea_base", "adquisicion", "mantenimiento", "masterizado"].map((f) => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`text-xs rounded-full px-3 py-1 border ${filtro === f ? "bg-primary text-primary-foreground border-primary" : "border-border/70 hover:bg-muted"}`}>
            {f.replace("_", " ")}
          </button>
        ))}
        <Link to="/biblioteca" className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium">
          <Plus className="h-3.5 w-3.5" /> Nuevo programa
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {lista.map((p) => (
          <article key={p.id} className="rounded-2xl border border-border/70 bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{p.nombre}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{p.area} · última {p.ultimaSesion}</div>
              </div>
              <EstadoProgramaBadge e={p.estado} />
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>Avance</span>
                <span className="tabular">{p.avance}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${p.avance}%` }} />
              </div>
            </div>
            <button onClick={() => onVerGrafica(p)} className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
              Ver gráfica <ExternalLink className="h-3 w-3" />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

function EstadoProgramaBadge({ e }: { e: string }) {
  const map: Record<string, string> = {
    linea_base: "bg-muted text-muted-foreground",
    adquisicion: "bg-[oklch(0.94_0.06_240)] text-[oklch(0.4_0.13_240)]",
    mantenimiento: "bg-[oklch(0.94_0.06_75)] text-[oklch(0.4_0.13_75)]",
    masterizado: "bg-[oklch(0.94_0.05_155)] text-[oklch(0.35_0.12_155)]",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${map[e]}`}>{e.replace("_", " ")}</span>;
}

function TabSesiones({ ninoId }: { ninoId: string }) {
  const filas = Array.from({ length: 12 }).map((_, i) => ({
    fecha: `2026-05-${30 - i}`,
    area: ["ABA", "Logopedia", "ABA", "Fisioterapia"][i % 4],
    duracion: 1.5,
    terapeuta: ["Lic. Castellón", "Lic. Hernández", "Lic. Castellón", "Lic. Bermúdez"][i % 4],
    estado: i % 5 === 0 ? "Ausente" : "Asistió",
  }));
  return (
    <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr><th className="px-4 py-2 text-left">Fecha</th><th className="text-left">Área</th><th className="text-right">Duración</th><th className="text-left pl-3">Terapeuta</th><th className="text-center">Estado</th></tr>
        </thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={i} className="border-t border-border/40">
              <td className="px-4 py-2 tabular">{f.fecha}</td>
              <td>{f.area}</td>
              <td className="text-right tabular">{f.duracion}h</td>
              <td className="pl-3 text-muted-foreground">{f.terapeuta}</td>
              <td className="text-center">
                <span className={`text-[10px] uppercase rounded-full px-2 py-0.5 ${f.estado === "Asistió" ? "bg-[oklch(0.94_0.05_155)] text-[oklch(0.35_0.12_155)]" : "bg-[oklch(0.94_0.04_25)] text-[oklch(0.45_0.13_25)]"}`}>{f.estado}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TabEvaluaciones({ evaluaciones }: { evaluaciones: ReturnType<typeof getEvaluaciones> }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium">
          <Plus className="h-3.5 w-3.5" /> Nueva evaluación
        </button>
      </div>
      {evaluaciones.map((e) => (
        <article key={e.id} className="rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <div className="font-medium flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary" /> {e.instrumento}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{e.fecha} · {e.evaluador}</div>
              <p className="text-sm mt-2">{e.resumen}</p>
            </div>
            <button className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
              <Download className="h-3 w-3" /> {e.archivo}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function TabConducta({ planes }: { planes: ReturnType<typeof getPlanesConducta> }) {
  return (
    <div className="space-y-3">
      {planes.map((p) => (
        <article key={p.id} className="rounded-2xl border border-border/70 bg-card p-5 space-y-3">
          {p.nivelRiesgo === "alto" && (
            <div className="rounded-lg bg-[oklch(0.96_0.05_25)] border border-[oklch(0.7_0.13_25/0.4)] p-3 text-xs text-[oklch(0.45_0.15_25)] flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4" /> Plan de alto riesgo · cambios bloqueados sin autorización clínica
            </div>
          )}
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Conducta problema</div>
              <p className="font-medium">{p.conductaProblema}</p>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Función</div>
              <p className="text-sm">{p.funcion}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div><div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Conducta alternativa</div>{p.conductaAlternativa}</div>
            <div><div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Conducta de reemplazo</div>{p.conductaReemplazo}</div>
            <div><div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Antecedentes</div><ul className="text-xs list-disc pl-4">{p.estrategiasAntecedentes.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
            <div><div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Consecuencias</div><ul className="text-xs list-disc pl-4">{p.estrategiasConsecuencia.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
          </div>
        </article>
      ))}
    </div>
  );
}

function TabFamilia({ nino, ninoId }: { nino: any; ninoId: string }) {
  // ninoId reservado para futuras integraciones (mensajería, portal familias)
  void ninoId;
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Section title="Contacto">
        <Row label="Tutor legal" value={nino.tutor} icon={<UsersIcon className="h-3 w-3" />} />
        <Row label="Teléfono" value="+505 8765 4321" icon={<Phone className="h-3 w-3" />} />
        <Row label="Correo" value="familia@correo.com" icon={<Mail className="h-3 w-3" />} />
      </Section>
      <Section title="Portal de familias" action={<Link to="/familias" className="text-xs text-primary hover:underline">Gestionar</Link>}>
        <div className="rounded-md bg-[oklch(0.96_0.04_155)] border border-[oklch(0.7_0.12_155/0.4)] p-3 text-xs">
          <span className="font-medium">Activo</span> · último acceso 30 / 05 / 2026
        </div>
      </Section>
      <Section title="Comunicaciones recientes">
        {["Confirmación de cambio de horario · 27 May", "Compartido informe mensual · 15 May", "Solicitud de constancia médica · 12 May"].map((m, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5 border-t border-border/40 first:border-t-0 text-sm">
            <MessageSquare className="h-3 w-3 text-muted-foreground" /> {m}
          </div>
        ))}
      </Section>
      <Section title="Constancias médicas">
        <div className="text-xs text-muted-foreground">Constancia Dr. Morales · 28 abr 2026 <button className="text-primary ml-2 hover:underline">Descargar</button></div>
      </Section>
    </div>
  );
}

function TabExpediente({ documentos }: { documentos: ReturnType<typeof getDocumentos> }) {
  const nombresPresentes = documentos.map((d) => d.nombre);
  const faltantes = documentosObligatorios.filter((d) => !nombresPresentes.includes(d));
  return (
    <div className="space-y-3">
      <Section title="Checklist de documentos obligatorios">
        <ul className="space-y-1.5">
          {documentosObligatorios.map((d) => {
            const ok = nombresPresentes.includes(d);
            return (
              <li key={d} className="flex items-center gap-2 text-sm">
                {ok
                  ? <CheckCircle2 className="h-4 w-4 text-[oklch(0.55_0.16_155)]" />
                  : <AlertTriangle className="h-4 w-4 text-[oklch(0.6_0.15_25)]" />}
                <span className={ok ? "" : "text-[oklch(0.45_0.15_25)]"}>{d}</span>
              </li>
            );
          })}
        </ul>
      </Section>
      <Section title="Todos los documentos" action={<button className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium"><Upload className="h-3.5 w-3.5" /> Cargar documento</button>}>
        <div className="grid sm:grid-cols-2 gap-2">
          {documentos.map((d) => (
            <div key={d.id} className="rounded-lg border border-border/60 p-3 text-sm flex items-start justify-between gap-2">
              <div>
                <div className="font-medium flex items-center gap-1.5"><FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />{d.nombre}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{d.tipo} · {d.fechaCarga} · {d.cargadoPor}</div>
              </div>
              <button className="text-muted-foreground hover:text-foreground"><Download className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function TabFacturacion({ facturacion }: { facturacion: ReturnType<typeof getFacturacion> }) {
  const { id } = Route.useParams();
  const totalAnio = facturacion.reduce((s, f) => s + f.monto, 0);
  const cartas = cartasPorNino(id);
  return (
    <div className="space-y-4">
      {cartas.length > 0 && (
        <Section title="Cartas INSS de aprobación">
          <ul className="space-y-2">
            {cartas.map((c) => {
              const col = estadoCartaColor(c.estado);
              return (
                <li key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/60">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{c.numero} · {c.area}</div>
                    <div className="text-[11px] text-muted-foreground tabular">
                      Vence {c.vence} · {c.horasAprobadas}h aprobadas
                    </div>
                  </div>
                  <span className={`inline-flex items-center text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 ${col.bg} ${col.text}`}>
                    {col.label}
                  </span>
                  <span className={`text-[11px] tabular w-16 text-right ${c.diasRestantes < 0 ? "text-[oklch(0.5_0.15_25)]" : c.diasRestantes <= 30 ? "text-[oklch(0.5_0.13_75)]" : "text-muted-foreground"}`}>
                    {c.diasRestantes < 0 ? `−${-c.diasRestantes}d` : `${c.diasRestantes}d`}
                  </span>
                </li>
              );
            })}
          </ul>
          <Link to="/facturacion/cartas" className="inline-block mt-3 text-xs text-primary hover:underline">
            Gestionar cartas →
          </Link>
        </Section>
      )}
      <Section title="Historial de facturación" action={<Link to="/facturacion/cierre" className="text-xs text-primary hover:underline">Ir a Cierre</Link>}>
        <div className="text-xs text-muted-foreground mb-3">Total acumulado año: <span className="font-display text-sm text-foreground tabular">${totalAnio.toFixed(2)}</span></div>
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr><th className="text-left pb-2">Período</th><th className="text-left">Horas</th><th className="text-right">Monto</th><th className="text-center">Estado</th></tr>
          </thead>
          <tbody>
            {facturacion.map((f, i) => (
              <tr key={i} className="border-t border-border/40">
                <td className="py-2">{f.mes} · Q{f.quincena}</td>
                <td className="text-xs text-muted-foreground">{Object.entries(f.horas).map(([k, v]) => `${v}h ${k}`).join(" · ")}</td>
                <td className="text-right tabular font-display">${f.monto.toFixed(2)}</td>
                <td className="text-center">
                  <span className={`text-[10px] uppercase rounded-full px-2 py-0.5 ${f.estado === "cobrado" ? "bg-[oklch(0.94_0.05_155)] text-[oklch(0.35_0.12_155)]" : "bg-muted text-muted-foreground"}`}>{f.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 py-1.5 border-t border-border/40 first:border-t-0 text-sm">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-24 shrink-0 flex items-center gap-1">{icon}{label}</span>
      <span className="flex-1 truncate">{value}</span>
    </div>
  );
}
