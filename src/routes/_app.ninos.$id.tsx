import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ninoById, sesionesHoy, areaLabels } from "@/lib/demo-data";
import { AreaBadge } from "@/components/area-badge";
import { Avatar } from "@/components/avatar";
import { ArrowLeft, FileText, MessageSquare, Phone, Mail, MapPin, Download, Plus, Lock, CheckCircle2, Circle as CircleIcon } from "lucide-react";
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

const tabs = ["Resumen", "Programas clínicos", "Áreas terapéuticas", "Sesiones", "Familia y documentos"] as const;

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
              <li key={s.id} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">Hoy · {s.hora}</div>
                  <div className="text-xs text-muted-foreground">{s.sala}</div>
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
