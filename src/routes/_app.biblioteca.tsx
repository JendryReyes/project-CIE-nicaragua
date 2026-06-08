import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { catalogoCIE, type ServicioCIE } from "@/lib/catalogo-cie";
import { BookOpen, Users, Calendar, Layers, FileText, Stethoscope, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_app/biblioteca")({
  head: () => ({ meta: [{ title: "Biblioteca clínica · CIE" }] }),
  component: Biblioteca,
});

// Detalle adicional por servicio
const detalles: Record<string, {
  detalle: string;
  plantillas: string[];
  modelosDescr: { nombre: string; descr: string }[];
  sesionesSemana: string;
  duracionSesion: string;
  equipo: string[];
  resultadosEsperados: string[];
}> = {
  it: {
    detalle: "Programa intensivo de estimulación temprana en niños de 0 a 4 años con sospecha o diagnóstico de TEA. Se trabaja en sesiones diádicas con la familia presente, integrando rutinas de juego natural y aprendizaje incidental.",
    plantillas: ["Línea base ESDM", "Curriculum checklist ESDM", "Plan trimestral IT", "Coaching parental semanal"],
    modelosDescr: [
      { nombre: "ESDM", descr: "Early Start Denver Model · juego naturalista en díada terapeuta-niño-familia." },
      { nombre: "ABA", descr: "Análisis conductual aplicado · ensayos discretos cuando se requiere mastery de habilidad puntual." },
    ],
    sesionesSemana: "2–3 sesiones/sem",
    duracionSesion: "60 min",
    equipo: ["Lic. Daniela Pérez", "Lic. Andrea Rojas"],
    resultadosEsperados: ["Aumento de iniciativas comunicativas", "Mejora de atención conjunta", "Generalización en casa"],
  },
  pfa: {
    detalle: "Práctica Funcional aplicada en niños con conductas problemáticas severas. Combina evaluación funcional abierta (PFA), análisis sintetizado y enseñanza de habilidades de tolerancia, comunicación y cumplimiento.",
    plantillas: ["IISCA · análisis funcional", "Plan SBT por fases", "Registro de crisis", "Acuerdo de seguridad con familia"],
    modelosDescr: [
      { nombre: "Hanley / SBT", descr: "Skill-Based Treatment de Greg Hanley · enseñanza progresiva HRE-HRO-HCT con datos por sesión." },
    ],
    sesionesSemana: "3–4 sesiones/sem",
    duracionSesion: "90 min",
    equipo: ["Lic. Sara Mendoza", "Lic. Luis Romero"],
    resultadosEsperados: ["Reducción de conductas problemáticas ≥80%", "HCT estable con demandas reales", "Generalización a contextos del niño"],
  },
  "hab-soc": {
    detalle: "Grupos pequeños y homogéneos por edad y nivel de lenguaje. Se entrena teoría de la mente, juego cooperativo, resolución de conflictos y conversación recíproca con peer modeling.",
    plantillas: ["Línea base habilidades sociales", "Registro de IOA grupal", "Reporte trimestral"],
    modelosDescr: [
      { nombre: "ABA grupal", descr: "Reforzamiento positivo + modelado entre pares + ensayos estructurados en grupo." },
    ],
    sesionesSemana: "1 sesión/sem",
    duracionSesion: "75 min",
    equipo: ["Lic. Ana Castillo", "Lic. Pedro Núñez"],
    resultadosEsperados: ["Iniciar y mantener conversaciones", "Resolver conflictos sin escalada", "Disfrute del grupo"],
  },
  fisio: {
    detalle: "Atención individual a perfiles sensoriales con desregulación. Trabaja modulación, planificación motora, integración vestibular-propioceptiva y autorregulación en aula y casa.",
    plantillas: ["Perfil sensorial 2", "Plan de dieta sensorial", "Reporte motor grueso/fino"],
    modelosDescr: [
      { nombre: "Integración sensorial", descr: "Modelo Ayres · ambiente enriquecido con desafíos graduales adaptados al perfil." },
    ],
    sesionesSemana: "2 sesiones/sem",
    duracionSesion: "45 min",
    equipo: ["Lic. Mariana Solís", "Lic. Carlos Vega"],
    resultadosEsperados: ["Tolerancia sensorial ampliada", "Mejora de planificación motora", "Estrategias autoregulatorias propias"],
  },
  logo: {
    detalle: "Habla, lenguaje y alimentación. Aborda articulación, lenguaje expresivo/comprensivo, CAA cuando aplica, y selectividad alimentaria con enfoque conductual.",
    plantillas: ["Inventario fonético", "Evaluación de comprensión", "Plan CAA", "Registro de alimentación"],
    modelosDescr: [
      { nombre: "PROMPT", descr: "Estimulación táctil-cinestésica para producción del habla." },
      { nombre: "Hanen", descr: "Coaching a padres para enriquecer interacción comunicativa natural." },
    ],
    sesionesSemana: "2 sesiones/sem",
    duracionSesion: "45 min",
    equipo: ["Lic. Camila Torres", "Lic. José Ruiz"],
    resultadosEsperados: ["Inteligibilidad funcional", "Expansión de MLU", "Comunicación en contextos cotidianos"],
  },
  eval: {
    detalle: "Proceso diagnóstico interdisciplinario en 3–4 visitas: entrevista de desarrollo, observación ADOS-2, Vineland-3 y devolución con plan terapéutico recomendado.",
    plantillas: ["Protocolo ADOS-2", "Cuadernillo Vineland-3", "Informe diagnóstico INSS", "Carta de derivación"],
    modelosDescr: [
      { nombre: "ADOS-2", descr: "Estándar oro para observación clínica de TEA." },
      { nombre: "Vineland-3", descr: "Evaluación de conducta adaptativa." },
      { nombre: "MCHAT-R/F", descr: "Tamizaje en niños de 16–30 meses." },
    ],
    sesionesSemana: "1 evaluación/semana",
    duracionSesion: "120 min",
    equipo: ["Dra. Patricia Ortega", "Lic. Roberto Marín"],
    resultadosEsperados: ["Diagnóstico formal con CIE-11", "Perfil de fortalezas y necesidades", "Plan terapéutico individualizado"],
  },
  familia: {
    detalle: "Espacio semanal con tutores: psicoeducación sobre el diagnóstico, entrenamiento en estrategias específicas del plan del niño, generalización a casa y contención emocional familiar.",
    plantillas: ["Línea base familiar", "Acuerdos de generalización", "Bitácora de tutores"],
    modelosDescr: [
      { nombre: "Coaching parental", descr: "Modelado en vivo + práctica con feedback + revisión de video." },
    ],
    sesionesSemana: "1 sesión/sem",
    duracionSesion: "60 min",
    equipo: ["Lic. Verónica Sandoval"],
    resultadosEsperados: ["Implementación consistente del plan en casa", "Reducción del estrés parental", "Generalización de habilidades"],
  },
};

function Biblioteca() {
  const [sel, setSel] = useState<ServicioCIE | null>(null);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>Catálogo de servicios CIE</span>
        </div>
        <h1 className="font-display text-4xl mt-1">Biblioteca clínica</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Servicios nativos del CIE con cupos INSS, rango de edad, modalidad y modelos clínicos asociados.
          Cada servicio activa plantillas específicas en el expediente. Tocá una tarjeta para ver el detalle completo.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {catalogoCIE.map((s) => {
          const pct = Math.round((s.cupoOcupado / s.cupoINSS) * 100);
          const lleno = pct >= 90;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSel(s)}
              className="text-left rounded-2xl border border-border/70 bg-card p-5 flex flex-col hover:border-primary/50 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">{s.area}</div>
                  <h3 className="font-display text-lg mt-0.5 group-hover:text-primary transition-colors">{s.nombre}</h3>
                </div>
                <span className="rounded-full bg-primary/10 text-primary text-[0.65rem] px-2 py-0.5 font-medium">{s.modalidad}</span>
              </div>
              <p className="text-sm text-muted-foreground flex-1">{s.descripcion}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {s.modelos.map((m) => (
                  <span key={m} className="rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[0.65rem]">{m}</span>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-border/50 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground inline-flex items-center gap-1"><Users className="h-3 w-3" /> Cupo INSS</span>
                  <span className={`tabular font-medium ${lleno ? "text-[oklch(0.55_0.13_60)]" : ""}`}>{s.cupoOcupado}/{s.cupoINSS}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${lleno ? "bg-[oklch(0.65_0.13_60)]" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-[0.65rem] text-muted-foreground">Edad: {s.edadMin}–{s.edadMax} años</div>
                  <span className="text-[0.65rem] text-primary inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver detalle <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <DetalleServicio servicio={sel} onClose={() => setSel(null)} />
    </div>
  );
}

function DetalleServicio({ servicio, onClose }: { servicio: ServicioCIE | null; onClose: () => void }) {
  if (!servicio) return null;
  const det = detalles[servicio.id];
  const pct = Math.round((servicio.cupoOcupado / servicio.cupoINSS) * 100);
  const disponibles = servicio.cupoINSS - servicio.cupoOcupado;

  return (
    <Dialog open={!!servicio} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
            <BookOpen className="h-3 w-3" /> {servicio.area} · {servicio.modalidad}
          </div>
          <DialogTitle className="font-display text-2xl">{servicio.nombre}</DialogTitle>
          <DialogDescription>{det?.detalle ?? servicio.descripcion}</DialogDescription>
        </DialogHeader>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2">
          <StatBox icon={<Users className="h-3.5 w-3.5" />} label="Cupo INSS" value={`${servicio.cupoOcupado}/${servicio.cupoINSS}`} sub={`${disponibles} disp.`} />
          <StatBox icon={<Calendar className="h-3.5 w-3.5" />} label="Frecuencia" value={det?.sesionesSemana ?? "—"} />
          <StatBox icon={<Layers className="h-3.5 w-3.5" />} label="Duración" value={det?.duracionSesion ?? "—"} />
          <StatBox icon={<Stethoscope className="h-3.5 w-3.5" />} label="Edad" value={`${servicio.edadMin}–${servicio.edadMax} años`} />
        </div>

        {/* Cupo bar */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Ocupación de cupos INSS</span>
            <span className="tabular font-medium">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className={`h-full ${pct >= 90 ? "bg-[oklch(0.65_0.13_60)]" : "bg-primary"}`} style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Modelos */}
        {det?.modelosDescr && (
          <Section title="Modelos clínicos">
            <ul className="space-y-2">
              {det.modelosDescr.map((m) => (
                <li key={m.nombre} className="text-sm">
                  <span className="font-medium">{m.nombre}</span>{" "}
                  <span className="text-muted-foreground">— {m.descr}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Plantillas */}
        {det?.plantillas && (
          <Section title="Plantillas del expediente que activa" icon={<FileText className="h-3.5 w-3.5" />}>
            <div className="flex flex-wrap gap-1.5">
              {det.plantillas.map((p) => (
                <span key={p} className="rounded-md border border-border bg-muted/40 px-2 py-1 text-xs">{p}</span>
              ))}
            </div>
          </Section>
        )}

        {/* Resultados esperados */}
        {det?.resultadosEsperados && (
          <Section title="Resultados esperados">
            <ul className="space-y-1.5">
              {det.resultadosEsperados.map((r) => (
                <li key={r} className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Equipo */}
        {det?.equipo && (
          <Section title="Equipo asignado">
            <div className="flex flex-wrap gap-1.5">
              {det.equipo.map((e) => (
                <span key={e} className="rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1">{e}</span>
              ))}
            </div>
          </Section>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="pt-3 border-t border-border/50">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
        {icon}{title}
      </div>
      {children}
    </div>
  );
}

function StatBox({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
      <div className="text-[0.65rem] uppercase tracking-wide text-muted-foreground flex items-center gap-1">{icon}{label}</div>
      <div className="font-display text-base tabular mt-0.5">{value}</div>
      {sub && <div className="text-[0.65rem] text-muted-foreground">{sub}</div>}
    </div>
  );
}
