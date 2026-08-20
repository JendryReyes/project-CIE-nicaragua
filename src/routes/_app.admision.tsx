import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  UserPlus,
  X,
  CheckCircle2,
  Circle as CircleIcon,
  Clock,
  Phone,
  AlertTriangle,
  ArrowRight,
  FileText,
} from "lucide-react";
import {
  documentosPendientes,
  estadoColor,
  etapaResumen,
  etapasAdmision,
  listoParaAdmitir,
  motivosEgreso,
  motivosSuspension,
  prospectos,
  type EtapaAdmision,
  type Prospecto,
} from "@/lib/admision-data";
import { registrarEvento } from "@/lib/auditoria";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admision")({
  head: () => ({
    meta: [
      { title: "Pipeline de admisión · CIE" },
      { name: "description", content: "Embudo de admisión tipo CRM: prospectos, evaluación, propuesta de plan, documentación y matrícula." },
      { property: "og:title", content: "Pipeline de admisión · CIE" },
      { property: "og:description", content: "Seguimiento del ciclo de vida del paciente desde prospecto hasta matrícula activa." },
    ],
  }),
  component: Admision,
});

const fmt = (f: string) => new Date(f).toLocaleDateString("es-NI", { day: "numeric", month: "short" });

const etapaTono: Record<EtapaAdmision, string> = {
  Prospecto: "oklch(0.6 0.12 250)",
  "Contacto inicial": "oklch(0.6 0.13 220)",
  "Evaluación agendada": "oklch(0.62 0.14 190)",
  "En evaluación": "oklch(0.62 0.14 160)",
  "Propuesta de plan": "oklch(0.65 0.15 90)",
  Documentación: "oklch(0.65 0.15 55)",
  Admitido: "oklch(0.55 0.16 155)",
};

function Admision() {
  const [sel, setSel] = useState<Prospecto | null>(null);
  const columnas = useMemo(() => etapaResumen(), []);
  const enAdmision = prospectos.filter((p) => p.etapa !== "Admitido").length;
  const bloqueados = prospectos.filter((p) => documentosPendientes(p).length > 0).length;
  const espera = prospectos.filter((p) => p.estado === "Lista de espera").length;

  return (
    <div className="space-y-6 max-w-[1500px]">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserPlus className="h-4 w-4" /> Matrícula
        </div>
        <h1 className="font-display text-3xl mt-1">Pipeline de admisión</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Embudo tipo CRM del ciclo de vida del paciente: prospecto → admisión → matrícula activa. Cada etapa
          exige responsable, próximo paso y expediente documental completo antes de admitir.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "En proceso de admisión", v: enAdmision, s: "casos abiertos" },
          { l: "Con documentos pendientes", v: bloqueados, s: "no pueden matricularse" },
          { l: "Lista de espera", v: espera, s: "por falta de cupo" },
          { l: "Admitidos este mes", v: prospectos.filter((p) => p.etapa === "Admitido").length, s: "matriculados" },
        ].map((k) => (
          <div key={k.l} className="rounded-xl border border-border/60 p-4">
            <div className="text-xs text-muted-foreground">{k.l}</div>
            <div className="font-display text-2xl mt-1">{k.v}</div>
            <div className="text-xs text-muted-foreground">{k.s}</div>
          </div>
        ))}
      </div>

      {/* Kanban */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3 min-w-max">
          {columnas.map((col) => (
            <div key={col.etapa} className="w-64 shrink-0 rounded-xl border border-border/60 bg-muted/20">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: etapaTono[col.etapa] }} />
                  <span className="text-xs font-medium">{col.etapa}</span>
                </div>
                <span className="text-xs text-muted-foreground">{col.total}</span>
              </div>
              <div className="p-2 space-y-2">
                {col.casos.map((p) => {
                  const pend = documentosPendientes(p);
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSel(p)}
                      className="w-full text-left rounded-lg border border-border/60 bg-background p-2.5 hover:border-primary/50 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-[0.65rem] font-semibold">
                          {p.iniciales}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm truncate">{p.nino}</div>
                          <div className="text-[0.7rem] text-muted-foreground">
                            {p.edad} años · {p.sede}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        <span className={`rounded-full px-1.5 py-0.5 text-[0.62rem] ${estadoColor[p.estado]}`}>
                          {p.estado}
                        </span>
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[0.62rem] text-muted-foreground">
                          {p.pagadorPrevisto}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-[0.68rem] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {p.diasEnEtapa} d en etapa · {fmt(p.fechaProximoPaso)}
                      </div>
                      {pend.length > 0 && (
                        <div className="mt-1.5 flex items-center gap-1 text-[0.68rem] text-[oklch(0.5_0.15_30)]">
                          <AlertTriangle className="h-3 w-3" /> {pend.length} doc. obligatorios
                        </div>
                      )}
                    </button>
                  );
                })}
                {col.casos.length === 0 && (
                  <div className="px-2 py-6 text-center text-[0.7rem] text-muted-foreground">Sin casos</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ciclo de vida */}
      <div className="rounded-xl border border-border/60 p-4">
        <h2 className="font-display text-lg">Ciclo de vida y motivos tipificados</h2>
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          <div>
            <div className="text-xs font-medium text-muted-foreground">Estados de matrícula</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(Object.keys(estadoColor) as (keyof typeof estadoColor)[]).map((e) => (
                <span key={e} className={`rounded-full px-2 py-0.5 text-[0.68rem] ${estadoColor[e]}`}>
                  {e}
                </span>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1 text-[0.7rem] text-muted-foreground">
              {etapasAdmision.map((e, i) => (
                <span key={e} className="inline-flex items-center gap-1">
                  {e}
                  {i < etapasAdmision.length - 1 && <ArrowRight className="h-3 w-3" />}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Motivos de suspensión</div>
            <ul className="mt-2 space-y-1 text-sm">
              {motivosSuspension.map((m) => (
                <li key={m} className="text-muted-foreground">· {m}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Motivos de egreso</div>
            <ul className="mt-2 space-y-1 text-sm">
              {motivosEgreso.map((m) => (
                <li key={m} className="text-muted-foreground">· {m}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {sel && <DetalleProspecto p={sel} onClose={() => setSel(null)} />}
    </div>
  );
}

function DetalleProspecto({ p, onClose }: { p: Prospecto; onClose: () => void }) {
  const [estado, setEstado] = useState(p.estado);
  const pendientes = documentosPendientes(p);
  const puede = listoParaAdmitir(p);

  const admitir = () => {
    if (!puede) {
      toast.error("Expediente incompleto", { description: `Faltan ${pendientes.length} documentos obligatorios.` });
      return;
    }
    setEstado("Activo");
    registrarEvento({
      actor: "Karla Duarte",
      rol: "Personal Administrativo",
      categoria: "matricula",
      accion: "Matricular paciente",
      entidad: `${p.nino} · ${p.sede}`,
      detalle: "En admisión → Activo",
      justificacion: "Expediente documental completo verificado.",
    });
    toast.success("Paciente matriculado", { description: `${p.nino} pasó a estado Activo.` });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-xl overflow-y-auto bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              {p.iniciales}
            </span>
            <div>
              <h2 className="font-display text-xl">{p.nino}</h2>
              <p className="text-xs text-muted-foreground">
                {p.edad} años · {p.sede} · Origen: {p.origen}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-xs ${estadoColor[estado]}`}>{estado}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Etapa: {p.etapa}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Pagador previsto: {p.pagadorPrevisto}
          </span>
          {p.codigoERP && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">ERP: {p.codigoERP}</span>
          )}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/60 p-3">
            <div className="text-xs text-muted-foreground">Tutor</div>
            <div className="text-sm mt-0.5">{p.tutor}</div>
            <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" /> {p.telefono}
            </div>
          </div>
          <div className="rounded-lg border border-border/60 p-3">
            <div className="text-xs text-muted-foreground">Responsable</div>
            <div className="text-sm mt-0.5">{p.responsable}</div>
            <div className="text-xs text-muted-foreground mt-1">Última actividad: {fmt(p.ultimaActividad)}</div>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-border/60 p-3">
          <div className="text-xs text-muted-foreground">Próximo paso</div>
          <div className="text-sm mt-0.5">{p.proximoPaso}</div>
          <div className="text-xs text-muted-foreground mt-1">Programado: {fmt(p.fechaProximoPaso)}</div>
        </div>

        <div className="mt-3 rounded-lg border border-border/60 p-3">
          <div className="text-xs text-muted-foreground">Disciplinas solicitadas</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {p.disciplinas.map((d) => (
              <span key={d} className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">
                {d}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4 text-muted-foreground" /> Expediente documental
          </div>
          <div className="mt-2 space-y-1.5">
            {p.documentos.map((d) => (
              <div key={d.nombre} className="flex items-center gap-2 text-sm">
                {d.ok ? (
                  <CheckCircle2 className="h-4 w-4 text-[oklch(0.55_0.14_155)]" />
                ) : (
                  <CircleIcon className="h-4 w-4 text-muted-foreground/60" />
                )}
                <span className={d.ok ? "" : "text-muted-foreground"}>{d.nombre}</span>
                {d.obligatorio && !d.ok && (
                  <span className="ml-auto rounded-full bg-[oklch(0.95_0.06_30)] px-2 py-0.5 text-[0.65rem] text-[oklch(0.45_0.15_30)]">
                    Obligatorio
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
          <div className="text-xs text-muted-foreground mb-1">Notas de admisión</div>
          {p.notas}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={admitir}
            disabled={estado === "Activo"}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[oklch(0.55_0.16_155)] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" /> Matricular paciente
          </button>
          <button
            onClick={() => {
              setEstado("Lista de espera");
              registrarEvento({
                actor: "Karla Duarte",
                rol: "Personal Administrativo",
                categoria: "matricula",
                accion: "Enviar a lista de espera",
                entidad: p.nino,
                detalle: "En admisión → Lista de espera",
                justificacion: "Sin cupo disponible en la disciplina solicitada.",
              });
              toast.info("Caso enviado a lista de espera");
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-sm hover:bg-muted/60"
          >
            <Clock className="h-4 w-4" /> Lista de espera
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Todo cambio de estado se registra en la bitácora de auditoría con actor, fecha y motivo.
        </p>
      </div>
    </div>
  );
}
