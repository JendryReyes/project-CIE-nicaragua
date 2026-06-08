import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ninoById, sesionesHoy, areaLabels } from "@/lib/demo-data";
import { AreaBadge } from "@/components/area-badge";
import { Avatar } from "@/components/avatar";
import { ArrowLeft, FileText, MessageSquare, Phone, Mail, MapPin, Download, Plus, Lock, CheckCircle2, Circle as CircleIcon, Stethoscope, Upload, ClipboardList, History, FilePlus2 } from "lucide-react";
import { programasDemo, modeloLabels, modeloDescripciones, type ModeloClinico } from "@/lib/modelos-clinicos";
import { ProgramaClinicoCard } from "@/components/programa-clinico-card";
import { HanleyCrisisCard } from "@/components/hanley-crisis-card";
import { checklistPorNino, puedeActivar } from "@/lib/checklist-inss";
import { INSSBadge } from "@/components/inss-badge";

export const Route = createFileRoute("/_app/ninos/$id")({
  head: () => ({ meta: [{ title: `Expediente · CIE` }] }),
  component: NinoDetalle,
  notFoundComponent: () => <div className="p-12 text-center"><p>Expediente no encontrado.</p><Link to="/ninos" className="text-primary">Volver</Link></div>,
});

const tabs = ["Resumen", "Programas clínicos", "Áreas terapéuticas", "Diagnóstico", "Sesiones", "Familia y documentos"] as const;

function NinoDetalle() {
  const { id } = Route.useParams();
  const n = ninoById(id);
  if (!n) throw notFound();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Resumen");
  const sesionesNino = sesionesHoy.filter((s) => s.ninoId === id);
  const checklist = checklistPorNino(id);
  const activable = puedeActivar(checklist);
  const faltantes = checklist.filter((c) => c.obligatorio && !c.completo).map((c) => c.nombre);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <Link to="/ninos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Niños y niñas
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-border/70 bg-card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-5">
            <Avatar nombre={n.nombre} size={72} />
            <div>
              <div className="text-xs text-muted-foreground tabular">Expediente #{n.id}</div>
              <h1 className="font-display text-3xl mt-1">{n.nombre}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <span>{n.edad} años</span>
                <span>·</span>
                <span>{n.diagnostico}</span>
                <span>·</span>
                <span>Sede {n.sede}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {n.areas.map((a) => <AreaBadge key={a} area={a} />)}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted">
              <Download className="h-3.5 w-3.5 inline mr-1.5" /> Exportar
            </button>
            <button
              disabled={!activable}
              title={activable ? "Activar intervención" : `Faltan documentos: ${faltantes.join(", ")}`}
              className={`rounded-full px-4 py-2 text-sm inline-flex items-center gap-1.5 ${activable ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
            >
              {activable ? <Plus className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              {activable ? "Activar intervención" : "Bloqueado por INSS"}
            </button>
          </div>
        </div>

        {!activable && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-[oklch(0.78_0.13_75)]/50 bg-[oklch(0.97_0.04_75)]/60 p-3 text-xs">
            <Lock className="h-3.5 w-3.5 mt-0.5 text-[oklch(0.55_0.13_60)] shrink-0" />
            <div>
              <span className="font-medium">Expediente bloqueado por checklist INSS.</span>{" "}
              Faltan: {faltantes.join(" · ")}. Revísalo en la pestaña Familia y documentos.
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mt-6 border-b border-border/60 -mb-6 -mx-6 px-6">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm border-b-2 transition-colors ${tab === t ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "Resumen" && <Resumen n={n} />}
      {tab === "Programas clínicos" && <Programas />}
      {tab === "Áreas terapéuticas" && <Areas n={n} />}
      {tab === "Diagnóstico" && <Diagnostico n={n} onIrAFamilia={() => setTab("Familia y documentos")} />}
      {tab === "Sesiones" && <Sesiones sesiones={sesionesNino} />}
      {tab === "Familia y documentos" && <Familia n={n} checklist={checklist} />}
    </div>
  );
}

function Programas() {
  const [modelo, setModelo] = useState<ModeloClinico>("aba");
  const programas = programasDemo.filter((p) => p.modelo === modelo);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/70 bg-card p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h3 className="font-display text-lg">Modelo clínico activo</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Selecciona el marco terapéutico para ver sus programas.</p>
          </div>
          <div className="flex gap-1 rounded-full bg-muted p-1">
            {(Object.keys(modeloLabels) as ModeloClinico[]).map((m) => (
              <button
                key={m}
                onClick={() => setModelo(m)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${modelo === m ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {modeloLabels[m]}
              </button>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground border-t border-border/40 pt-3">{modeloDescripciones[modelo]}</p>
      </div>

      {modelo === "hanley" && <HanleyCrisisCard />}

      {programas.map((p) => (
        <ProgramaClinicoCard key={p.id} programa={p} />
      ))}
    </div>
  );
}

function Resumen({ n }: { n: ReturnType<typeof ninoById> }) {
  if (!n) return null;
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card title="Progreso integral">
          <div className="space-y-4">
            {n.areas.map((a) => (
              <div key={a}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span>{areaLabels[a]}</span>
                  <span className="tabular text-muted-foreground">{Math.max(20, n.progreso - 10 + a.length * 3)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.max(20, n.progreso - 10 + a.length * 3)}%`, background: `var(--color-area-${a})` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Últimas notas clínicas">
          <ul className="space-y-4">
            {[
              { fecha: "29 May", autor: n.terapeuta, area: "conducta" as const, txt: "Mantiene contacto visual durante 8 segundos en actividades de mesa. Aumentamos exigencia gradualmente." },
              { fecha: "27 May", autor: "Lic. Sofía Hernández", area: "logopedia" as const, txt: "Produce 'mamá' y 'agua' de forma espontánea. Iniciamos trabajo con campo semántico de alimentos." },
              { fecha: "24 May", autor: "Lic. Carlos Bermúdez", area: "fisio" as const, txt: "Mejor tolerancia a texturas en planta del pie. Sesión completa sin desregulación." },
            ].slice(0, n.areas.length + 1).map((nota, i) => (
              <li key={i} className="flex gap-4">
                <div className="text-xs text-muted-foreground tabular w-14 pt-1">{nota.fecha}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AreaBadge area={nota.area} />
                    <span className="text-xs text-muted-foreground">{nota.autor}</span>
                  </div>
                  <p className="text-sm">{nota.txt}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="space-y-6">
        {n.inss && (
          <Card title="Cobertura INSS · quincena en curso">
            <INSSBadge
              horasUsadas={Math.round((n.progreso / 100) * 32)}
              horasAprobadas={32}
              label="Horas autorizadas"
            />
            <div className="mt-3 pt-3 border-t border-border/40 grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-muted-foreground">Tarifa hora</div>
                <div className="tabular font-medium">$18.50</div>
              </div>
              <div>
                <div className="text-muted-foreground">Próximo corte</div>
                <div className="tabular font-medium">15/06/2026</div>
              </div>
            </div>
          </Card>
        )}
        <Card title="Datos">
          <dl className="space-y-2.5 text-sm">
            <Row k="Tutor legal" v={n.tutor} />
            <Row k="Ingreso" v={new Date(n.ingreso).toLocaleDateString("es-NI", { day: "numeric", month: "long", year: "numeric" })} />
            <Row k="Sede" v={n.sede} />
            <Row k="Cobertura" v={n.inss ? "INSS" : "Privado"} />
            <Row k="Terapeuta principal" v={n.terapeuta} />
          </dl>
        </Card>
        <Card title="Próximas sesiones">
          <ul className="space-y-3">
            {sesionesHoy.filter((s) => s.ninoId === n.id).slice(0, 3).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <div className="font-medium">Hoy · {s.hora}</div>
                  <div className="text-xs text-muted-foreground truncate">{s.terapeuta}</div>
                  <div className="text-xs text-muted-foreground">{s.sala} · {s.duracion} min</div>
                </div>
                <AreaBadge area={s.area} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Areas({ n }: { n: ReturnType<typeof ninoById> }) {
  if (!n) return null;
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {n.areas.map((a) => (
        <Card key={a} title={areaLabels[a]} accent={`var(--color-area-${a})`}>
          <p className="text-sm text-muted-foreground mb-4">
            Objetivos activos del plan terapéutico individualizado.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" /><span>Mantener atención sostenida por 5+ minutos en tarea estructurada.</span></li>
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" /><span>Responder a su nombre en el 80% de oportunidades.</span></li>
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" /><span>Solicitar objetos preferidos usando 2 modalidades.</span></li>
          </ul>
        </Card>
      ))}
    </div>
  );
}

function Sesiones({ sesiones }: { sesiones: typeof sesionesHoy }) {
  return (
    <Card title={`${sesiones.length || "Sin"} sesiones programadas para hoy`}>
      {sesiones.length === 0 && <p className="text-sm text-muted-foreground">Sin sesiones hoy.</p>}
      <ul className="divide-y divide-border/60 -mx-5">
        {sesiones.map((s) => (
          <li key={s.id} className="flex items-center gap-4 px-5 py-3">
            <div className="font-display text-lg tabular w-16">{s.hora}</div>
            <AreaBadge area={s.area} />
            <span className="text-sm text-muted-foreground flex-1">{s.terapeuta} · {s.sala}</span>
            <span className="text-xs text-muted-foreground">{s.duracion} min</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Familia({ n, checklist }: { n: ReturnType<typeof ninoById>; checklist: ReturnType<typeof checklistPorNino> }) {
  if (!n) return null;
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Tutor legal">
        <div className="flex items-center gap-4 mb-4">
          <Avatar nombre={n.tutor} size={56} />
          <div>
            <div className="font-medium text-lg">{n.tutor}</div>
            <div className="text-xs text-muted-foreground">Madre · Apoderada legal</div>
          </div>
        </div>
        <dl className="space-y-2 text-sm">
          <ContactRow icon={<Phone className="h-3.5 w-3.5" />} v="+505 8765 4321" />
          <ContactRow icon={<Mail className="h-3.5 w-3.5" />} v={`${n.tutor.split(" ")[0].toLowerCase()}@correo.com`} />
          <ContactRow icon={<MapPin className="h-3.5 w-3.5" />} v="Managua, Distrito V" />
        </dl>
        <button className="mt-4 w-full rounded-lg bg-accent/30 text-accent-foreground py-2 text-sm font-medium hover:bg-accent/50 inline-flex items-center justify-center gap-2">
          <MessageSquare className="h-4 w-4" /> Enviar mensaje
        </button>
      </Card>
      <Card title="Checklist INSS · documentos requeridos">
        <ul className="space-y-2">
          {checklist.map((c) => (
            <li key={c.id} className="flex items-center gap-2.5 text-sm py-2 border-b border-border/40 last:border-0">
              {c.completo ? (
                <CheckCircle2 className="h-4 w-4 text-[oklch(0.5_0.11_155)]" />
              ) : (
                <CircleIcon className="h-4 w-4 text-[oklch(0.55_0.13_60)]" />
              )}
              <div className="flex-1">
                <div className={c.completo ? "" : "text-foreground"}>{c.nombre}</div>
                {!c.completo && c.obligatorio && (
                  <div className="text-[0.65rem] uppercase tracking-wider text-[oklch(0.55_0.13_60)]">Obligatorio · bloquea intervención</div>
                )}
              </div>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

type DxEstado = "confirmado" | "pre-diagnostico" | "en-evaluacion";
type DiagnosticoItem = { id: string; cie10: string; nombre: string; severidad?: string; fecha: string; profesional: { nombre: string; especialidad: string; colegiatura: string }; centro: string; estado: DxEstado; esPrincipal: boolean };
type EvaluacionItem = { id: string; instrumento: string; fecha: string; resultado: string; profesional: string; estado: "completada" | "programada" | "pendiente" };
type InformeItem = { id: string; nombre: string; fecha: string; autor: string; tamano: string };
type CambioItem = { fecha: string; tipo: string; descripcion: string; autor: string };

function Diagnostico({ n, onIrAFamilia }: { n: ReturnType<typeof ninoById>; onIrAFamilia: () => void }) {
  if (!n) return null;

  const [principal, setPrincipal] = useState<DiagnosticoItem>({
    id: "dx-1",
    cie10: "F84.0",
    nombre: "Trastorno del espectro autista",
    severidad: n.diagnostico.includes("nivel") ? n.diagnostico : "TEA nivel 1",
    fecha: "2024-08-12",
    profesional: { nombre: "Dr. Roberto Mendoza", especialidad: "Neuropediatría", colegiatura: "MED-4521" },
    centro: "Hospital Vivian Pellas",
    estado: "confirmado",
    esPrincipal: true,
  });

  const [secundarios, setSecundarios] = useState<DiagnosticoItem[]>([
    { id: "dx-2", cie10: "F80.1", nombre: "Trastorno del lenguaje expresivo", fecha: "2024-09-03", profesional: { nombre: "Lic. Sofía Hernández", especialidad: "Fonoaudiología", colegiatura: "FON-1290" }, centro: "CIE", estado: "confirmado", esPrincipal: false },
    { id: "dx-3", cie10: "F90.0", nombre: "Déficit de atención", fecha: "2025-02-15", profesional: { nombre: "Dra. María Castro", especialidad: "Psiquiatría infantil", colegiatura: "MED-3387" }, centro: "Consulta privada", estado: "pre-diagnostico", esPrincipal: false },
  ]);

  const [evaluaciones, setEvaluaciones] = useState<EvaluacionItem[]>([
    { id: "ev-1", instrumento: "ADOS-2 (Módulo 2)", fecha: "2024-08-10", resultado: "Puntuación 14 · rango autismo", profesional: "Dr. Roberto Mendoza", estado: "completada" },
    { id: "ev-2", instrumento: "M-CHAT-R/F", fecha: "2024-07-22", resultado: "Riesgo alto (6/20)", profesional: "Pediatra de cabecera", estado: "completada" },
    { id: "ev-3", instrumento: "VB-MAPP", fecha: "2025-06-20", resultado: "Programada", profesional: "Lic. Andrea Rivas", estado: "programada" },
    { id: "ev-4", instrumento: "ADI-R", fecha: "—", resultado: "Pendiente de agendar", profesional: "—", estado: "pendiente" },
  ]);

  const [informes, setInformes] = useState<InformeItem[]>([
    { id: "inf-1", nombre: "Informe diagnóstico inicial.pdf", fecha: "2024-08-15", autor: "Dr. Roberto Mendoza", tamano: "1.2 MB" },
    { id: "inf-2", nombre: "Reporte ADOS-2.pdf", fecha: "2024-08-12", autor: "Dr. Roberto Mendoza", tamano: "640 KB" },
  ]);

  const [historial, setHistorial] = useState<CambioItem[]>([
    { fecha: "2025-02-15", tipo: "Diagnóstico secundario", descripcion: "Se agregó F90.0 (Déficit de atención) como pre-diagnóstico.", autor: "Dra. María Castro" },
    { fecha: "2024-09-03", tipo: "Diagnóstico secundario", descripcion: "Se confirmó F80.1 (Trastorno del lenguaje expresivo).", autor: "Lic. Sofía Hernández" },
    { fecha: "2024-08-15", tipo: "Informe adjunto", descripcion: "Se subió informe diagnóstico inicial.", autor: "Dr. Roberto Mendoza" },
    { fecha: "2024-08-12", tipo: "Diagnóstico principal", descripcion: "Confirmado TEA nivel 1 (F84.0) tras evaluación ADOS-2.", autor: "Dr. Roberto Mendoza" },
  ]);

  const [dlgAgregar, setDlgAgregar] = useState(false);
  const [dlgSubir, setDlgSubir] = useState(false);
  const [dlgEval, setDlgEval] = useState(false);
  const [nuevoDx, setNuevoDx] = useState({ cie10: "", nombre: "", profesional: "" });
  const [nuevoInforme, setNuevoInforme] = useState({ nombre: "", autor: "" });
  const [nuevaEval, setNuevaEval] = useState({ instrumento: "", fecha: "", profesional: "" });

  const estadoLabel: Record<DxEstado, { txt: string; cls: string }> = {
    "confirmado": { txt: "Confirmado", cls: "bg-[oklch(0.93_0.06_155)] text-[oklch(0.35_0.11_155)]" },
    "pre-diagnostico": { txt: "Pre-diagnóstico", cls: "bg-[oklch(0.95_0.07_75)] text-[oklch(0.45_0.13_60)]" },
    "en-evaluacion": { txt: "En evaluación", cls: "bg-muted text-muted-foreground" },
  };

  const fmtFecha = (f: string) => f === "—" ? "—" : new Date(f).toLocaleDateString("es-NI", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Diagnóstico principal */}
      <div className="rounded-2xl border border-border/70 bg-card p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 w-full bg-primary" />
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Diagnóstico principal</span>
                <span className={`text-[0.65rem] px-2 py-0.5 rounded-full uppercase tracking-wider font-medium ${estadoLabel[principal.estado].cls}`}>
                  {estadoLabel[principal.estado].txt}
                </span>
              </div>
              <h3 className="font-display text-2xl mt-1">{principal.nombre}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span className="tabular font-medium text-foreground">CIE-10 · {principal.cie10}</span>
                {principal.severidad && <><span>·</span><span>{principal.severidad}</span></>}
              </div>
            </div>
          </div>
          <button className="text-xs text-primary hover:underline">Editar</button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-5 border-t border-border/40 text-sm">
          <div><div className="text-xs text-muted-foreground">Fecha de diagnóstico</div><div className="tabular mt-0.5">{fmtFecha(principal.fecha)}</div></div>
          <div><div className="text-xs text-muted-foreground">Profesional</div><div className="mt-0.5">{principal.profesional.nombre}</div><div className="text-xs text-muted-foreground">{principal.profesional.especialidad} · {principal.profesional.colegiatura}</div></div>
          <div><div className="text-xs text-muted-foreground">Centro emisor</div><div className="mt-0.5">{principal.centro}</div></div>
          <div><div className="text-xs text-muted-foreground">Última revisión</div><div className="tabular mt-0.5">{fmtFecha(historial[0]?.fecha ?? principal.fecha)}</div></div>
        </div>
      </div>

      {/* Secundarios */}
      <Card title="Diagnósticos secundarios y comorbilidades">
        <div className="flex justify-end -mt-2 mb-3">
          <button onClick={() => setDlgAgregar(true)} className="text-xs inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 hover:bg-muted">
            <Plus className="h-3 w-3" /> Agregar diagnóstico
          </button>
        </div>
        {secundarios.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin diagnósticos secundarios registrados.</p>
        ) : (
          <ul className="divide-y divide-border/40 -mx-5">
            {secundarios.map((dx) => (
              <li key={dx.id} className="flex items-center gap-4 px-5 py-3 flex-wrap">
                <div className="tabular text-xs font-medium bg-muted px-2 py-1 rounded">{dx.cie10}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{dx.nombre}</div>
                  <div className="text-xs text-muted-foreground">{dx.profesional.nombre} · {dx.centro} · {fmtFecha(dx.fecha)}</div>
                </div>
                <span className={`text-[0.65rem] px-2 py-0.5 rounded-full uppercase tracking-wider font-medium ${estadoLabel[dx.estado].cls}`}>
                  {estadoLabel[dx.estado].txt}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Proceso de evaluación */}
      <Card title="Proceso de evaluación">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {(["completada", "programada", "pendiente"] as const).map((est) => {
            const n = evaluaciones.filter((e) => e.estado === est).length;
            const label = est === "completada" ? "Completadas" : est === "programada" ? "Programadas" : "Pendientes";
            return (
              <div key={est} className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center">
                <div className="font-display text-2xl tabular">{n}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end mb-2">
          <button onClick={() => setDlgEval(true)} className="text-xs inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 hover:bg-muted">
            <ClipboardList className="h-3 w-3" /> Registrar evaluación
          </button>
        </div>
        <ul className="divide-y divide-border/40 -mx-5">
          {evaluaciones.map((e) => (
            <li key={e.id} className="px-5 py-3 flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{e.instrumento}</div>
                <div className="text-xs text-muted-foreground">{e.resultado} · {e.profesional}</div>
              </div>
              <div className="text-xs text-muted-foreground tabular">{fmtFecha(e.fecha)}</div>
              <span className={`text-[0.65rem] px-2 py-0.5 rounded-full uppercase tracking-wider font-medium ${e.estado === "completada" ? "bg-[oklch(0.93_0.06_155)] text-[oklch(0.35_0.11_155)]" : e.estado === "programada" ? "bg-[oklch(0.93_0.05_240)] text-[oklch(0.4_0.12_240)]" : "bg-muted text-muted-foreground"}`}>
                {e.estado}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Informes */}
      <Card title="Informes diagnósticos adjuntos">
        <div className="flex items-center justify-between mb-3 -mt-2">
          <p className="text-xs text-muted-foreground">Al subir un informe válido se actualiza el checklist INSS.</p>
          <button onClick={() => setDlgSubir(true)} className="text-xs inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1.5 hover:opacity-90">
            <Upload className="h-3 w-3" /> Subir informe
          </button>
        </div>
        {informes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay informes adjuntos.</p>
        ) : (
          <ul className="divide-y divide-border/40 -mx-5">
            {informes.map((inf) => (
              <li key={inf.id} className="flex items-center gap-3 px-5 py-3">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{inf.nombre}</div>
                  <div className="text-xs text-muted-foreground">{inf.autor} · {fmtFecha(inf.fecha)} · {inf.tamano}</div>
                </div>
                <button className="text-xs text-primary hover:underline">Ver</button>
                <button className="text-xs text-muted-foreground hover:text-foreground"><Download className="h-3.5 w-3.5" /></button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Vinculado al ítem "Diagnóstico médico o pre-diagnóstico" del checklist INSS.</span>
          <button onClick={onIrAFamilia} className="text-primary hover:underline">Ver checklist →</button>
        </div>
      </Card>

      {/* Historial */}
      <Card title="Historial de actualizaciones">
        <ol className="relative border-l border-border/60 ml-2 space-y-4">
          {historial.map((h, i) => (
            <li key={i} className="ml-5">
              <span className="absolute -left-[5px] h-2.5 w-2.5 rounded-full bg-primary mt-1.5" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground tabular">
                <History className="h-3 w-3" />
                {fmtFecha(h.fecha)} · {h.tipo}
              </div>
              <div className="text-sm mt-0.5">{h.descripcion}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{h.autor}</div>
            </li>
          ))}
        </ol>
      </Card>

      {/* Diálogo agregar diagnóstico */}
      {dlgAgregar && (
        <Modal onClose={() => setDlgAgregar(false)} title="Agregar diagnóstico secundario">
          <div className="space-y-3">
            <Field label="Código CIE-10"><input value={nuevoDx.cie10} onChange={(e) => setNuevoDx({ ...nuevoDx, cie10: e.target.value })} placeholder="F90.0" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></Field>
            <Field label="Nombre del diagnóstico"><input value={nuevoDx.nombre} onChange={(e) => setNuevoDx({ ...nuevoDx, nombre: e.target.value })} placeholder="Déficit de atención" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></Field>
            <Field label="Profesional emisor"><input value={nuevoDx.profesional} onChange={(e) => setNuevoDx({ ...nuevoDx, profesional: e.target.value })} placeholder="Dr. Nombre Apellido" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></Field>
          </div>
          <ModalActions onCancel={() => setDlgAgregar(false)} onConfirm={() => {
            if (!nuevoDx.cie10 || !nuevoDx.nombre) return;
            const dx: DiagnosticoItem = { id: `dx-${Date.now()}`, cie10: nuevoDx.cie10, nombre: nuevoDx.nombre, fecha: new Date().toISOString().slice(0, 10), profesional: { nombre: nuevoDx.profesional || "—", especialidad: "—", colegiatura: "—" }, centro: "CIE", estado: "pre-diagnostico", esPrincipal: false };
            setSecundarios([dx, ...secundarios]);
            setHistorial([{ fecha: dx.fecha, tipo: "Diagnóstico secundario", descripcion: `Se agregó ${dx.cie10} (${dx.nombre}).`, autor: dx.profesional.nombre }, ...historial]);
            setNuevoDx({ cie10: "", nombre: "", profesional: "" });
            setDlgAgregar(false);
          }} />
        </Modal>
      )}

      {/* Diálogo subir informe */}
      {dlgSubir && (
        <Modal onClose={() => setDlgSubir(false)} title="Subir informe diagnóstico">
          <div className="space-y-3">
            <Field label="Nombre del archivo"><input value={nuevoInforme.nombre} onChange={(e) => setNuevoInforme({ ...nuevoInforme, nombre: e.target.value })} placeholder="Informe.pdf" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></Field>
            <Field label="Autor / profesional"><input value={nuevoInforme.autor} onChange={(e) => setNuevoInforme({ ...nuevoInforme, autor: e.target.value })} placeholder="Dr. Nombre Apellido" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></Field>
            <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 p-6 text-sm text-muted-foreground cursor-pointer hover:bg-muted/30">
              <FilePlus2 className="h-4 w-4" />
              <span>Arrastrar archivo o hacer clic (PDF, JPG, PNG)</span>
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
            </label>
            <p className="text-xs text-muted-foreground">Al confirmar se marcará el ítem "Diagnóstico médico o pre-diagnóstico" del checklist INSS como cumplido.</p>
          </div>
          <ModalActions onCancel={() => setDlgSubir(false)} onConfirm={() => {
            if (!nuevoInforme.nombre) return;
            const inf: InformeItem = { id: `inf-${Date.now()}`, nombre: nuevoInforme.nombre, fecha: new Date().toISOString().slice(0, 10), autor: nuevoInforme.autor || "—", tamano: "—" };
            setInformes([inf, ...informes]);
            setHistorial([{ fecha: inf.fecha, tipo: "Informe adjunto", descripcion: `Se subió ${inf.nombre}.`, autor: inf.autor }, ...historial]);
            setNuevoInforme({ nombre: "", autor: "" });
            setDlgSubir(false);
          }} />
        </Modal>
      )}

      {/* Diálogo registrar evaluación */}
      {dlgEval && (
        <Modal onClose={() => setDlgEval(false)} title="Registrar evaluación">
          <div className="space-y-3">
            <Field label="Instrumento"><input value={nuevaEval.instrumento} onChange={(e) => setNuevaEval({ ...nuevaEval, instrumento: e.target.value })} placeholder="ADOS-2, ADI-R, CARS, M-CHAT-R, VB-MAPP…" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></Field>
            <Field label="Fecha"><input type="date" value={nuevaEval.fecha} onChange={(e) => setNuevaEval({ ...nuevaEval, fecha: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></Field>
            <Field label="Profesional"><input value={nuevaEval.profesional} onChange={(e) => setNuevaEval({ ...nuevaEval, profesional: e.target.value })} placeholder="Nombre del evaluador" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></Field>
          </div>
          <ModalActions onCancel={() => setDlgEval(false)} onConfirm={() => {
            if (!nuevaEval.instrumento) return;
            const ev: EvaluacionItem = { id: `ev-${Date.now()}`, instrumento: nuevaEval.instrumento, fecha: nuevaEval.fecha || new Date().toISOString().slice(0, 10), resultado: "Programada", profesional: nuevaEval.profesional || "—", estado: "programada" };
            setEvaluaciones([ev, ...evaluaciones]);
            setNuevaEval({ instrumento: "", fecha: "", profesional: "" });
            setDlgEval(false);
          }} />
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="rounded-2xl bg-card border border-border w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-lg mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground block mb-1">{label}</label>
      {children}
    </div>
  );
}

function ModalActions({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="flex justify-end gap-2 mt-5">
      <button onClick={onCancel} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted">Cancelar</button>
      <button onClick={onConfirm} className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm hover:opacity-90">Confirmar</button>
    </div>
  );
}

function Card({ title, children, accent }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 relative overflow-hidden">
      {accent && <div className="absolute top-0 left-0 h-1 w-full" style={{ background: accent }} />}
      <h3 className="font-display text-lg mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}

function ContactRow({ icon, v }: { icon: React.ReactNode; v: string }) {
  return (
    <div className="flex items-center gap-2.5 text-muted-foreground">
      {icon}
      <span className="text-foreground">{v}</span>
    </div>
  );
}
