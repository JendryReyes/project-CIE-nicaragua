import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Stethoscope, ClipboardList, ListOrdered, FileText } from "lucide-react";
import {
  estadosDx,
  instrumentos,
  prioridadTono,
  procesosDx,
  resumenDx,
  secciones,
  type ProcesoDx,
} from "@/lib/diagnostico-data";

export const Route = createFileRoute("/_app/diagnostico")({
  head: () => ({
    meta: [
      { title: "Proceso diagnóstico · CIE" },
      {
        name: "description",
        content:
          "Gestión integral del proceso diagnóstico: flujo de estados, lista de espera priorizada, primera entrevista e instrumentos.",
      },
      { property: "og:title", content: "Proceso diagnóstico · CIE" },
      { property: "og:description", content: "Ciclo completo de evaluación diagnóstica con trazabilidad e instrumentos estandarizados." },
    ],
  }),
  component: Diagnostico,
});

function Diagnostico() {
  const r = resumenDx();
  const [tab, setTab] = useState<"casos" | "espera" | "instrumentos" | "entrevista">("casos");
  const [sel, setSel] = useState<ProcesoDx | null>(null);

  const espera = [...procesosDx]
    .filter((p) => ["En lista de espera", "Pendiente de evaluación"].includes(p.estado))
    .concat(procesosDx.filter((p) => p.estado === "Pendiente de documentación"))
    .sort((a, b) => {
      const orden = { Alta: 0, Media: 1, Baja: 2 } as const;
      return orden[a.prioridad] - orden[b.prioridad] || b.diasEspera - a.diasEspera;
    });

  return (
    <div className="max-w-[1400px] space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Stethoscope className="h-4 w-4" /> Clínico
        </div>
        <h1 className="mt-1 font-display text-3xl">Gestión del proceso diagnóstico</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Cada proceso es una entidad independiente con flujo configurable, vinculada al expediente clínico, a la agenda
          operativa y al portal para padres.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { l: "Procesos registrados", v: r.total, s: "año en curso" },
          { l: "Abiertos", v: r.abiertos, s: "en ejecución o espera" },
          { l: "En lista de espera", v: r.espera, s: "pendientes de programar" },
          { l: "Prioridad alta", v: r.prioridadAlta, s: "atención prioritaria" },
          { l: "Espera promedio", v: `${r.esperaPromedio} d`, s: "desde la remisión" },
        ].map((k) => (
          <div key={k.l} className="rounded-xl border border-border/60 p-4">
            <div className="text-xs text-muted-foreground">{k.l}</div>
            <div className="mt-1 font-display text-2xl">{k.v}</div>
            <div className="text-xs text-muted-foreground">{k.s}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 text-sm">
        {(
          [
            ["casos", "Procesos diagnósticos"],
            ["espera", "Lista de espera y priorización"],
            ["instrumentos", "Biblioteca de instrumentos"],
            ["entrevista", "Primera entrevista (formulario)"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-full border px-3 py-1 ${
              tab === id ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "casos" && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Folio</th>
                  <th className="px-3 py-2 text-left">Paciente</th>
                  <th className="px-3 py-2 text-left">Motivo / origen</th>
                  <th className="px-3 py-2 text-left">Responsable</th>
                  <th className="px-3 py-2 text-left">Prioridad</th>
                  <th className="px-3 py-2 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {procesosDx.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSel(p)}
                    className="cursor-pointer border-t border-border/50 hover:bg-muted/30"
                  >
                    <td className="px-3 py-2 font-mono text-xs">{p.id}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{p.paciente}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.edad} años · {p.sede}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs">{p.motivo}</div>
                      <div className="text-xs text-muted-foreground">{p.origen}</div>
                    </td>
                    <td className="px-3 py-2 text-xs">{p.responsable}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${prioridadTono[p.prioridad]}`}>
                        {p.prioridad}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">{p.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-border/60 p-4">
            <h2 className="font-display text-lg">12.2 Flujo y estados configurables</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {estadosDx.map((e) => (
                <div key={e.estado} className="rounded-lg border border-border/60 p-3">
                  <div className="flex items-center justify-between gap-2 text-sm font-medium">
                    {e.estado}
                    <span className="text-xs text-muted-foreground">
                      {procesosDx.filter((p) => p.estado === e.estado).length}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{e.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "espera" && (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">
                    <ListOrdered className="inline h-3.5 w-3.5" /> Orden
                  </th>
                  <th className="px-3 py-2 text-left">Paciente</th>
                  <th className="px-3 py-2 text-left">Especialidad requerida</th>
                  <th className="px-3 py-2 text-left">Prioridad</th>
                  <th className="px-3 py-2 text-left">Días de espera</th>
                  <th className="px-3 py-2 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {espera.map((p, i) => (
                  <tr
                    key={p.id}
                    onClick={() => setSel(p)}
                    className="cursor-pointer border-t border-border/50 hover:bg-muted/30"
                  >
                    <td className="px-3 py-2 font-display text-lg">{i + 1}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{p.paciente}</div>
                      <div className="text-xs text-muted-foreground">{p.sede}</div>
                    </td>
                    <td className="px-3 py-2 text-xs">{p.especialidad}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${prioridadTono[p.prioridad]}`}>
                        {p.prioridad}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">{p.diasEspera} d</td>
                    <td className="px-3 py-2 text-xs">{p.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            Todo cambio de prioridad exige justificación y queda registrado en el historial del caso. La plataforma
            permite consolidar pacientes para remisiones grupales hacia especialidades externas.
          </p>
        </div>
      )}

      {tab === "instrumentos" && (
        <div className="overflow-hidden rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Instrumento</th>
                <th className="px-3 py-2 text-left">Área evaluada</th>
                <th className="px-3 py-2 text-left">Rango de edad</th>
                <th className="px-3 py-2 text-left">Escala / puntaje</th>
                <th className="px-3 py-2 text-left">Versiones</th>
                <th className="px-3 py-2 text-left">Aplicaciones activas</th>
              </tr>
            </thead>
            <tbody>
              {instrumentos.map((i) => (
                <tr key={i.nombre} className="border-t border-border/50">
                  <td className="px-3 py-2 font-medium">{i.nombre}</td>
                  <td className="px-3 py-2 text-xs">{i.area}</td>
                  <td className="px-3 py-2 text-xs">{i.rango}</td>
                  <td className="px-3 py-2 text-xs">{i.escala}</td>
                  <td className="px-3 py-2 text-xs">{i.versiones}</td>
                  <td className="px-3 py-2 text-xs">
                    {procesosDx.reduce(
                      (a, p) => a + p.instrumentos.filter((x) => x.nombre.startsWith(i.nombre)).length,
                      0,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "entrevista" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border/60 p-4">
            <h2 className="flex items-center gap-2 font-display text-lg">
              <ClipboardList className="h-4 w-4" /> Administrador de formularios configurable
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              La primera entrevista se digitaliza y puede completarse parcialmente por la familia desde el portal para
              padres antes de la cita. El sistema guarda avances y registra fecha, usuario y versión del formulario.
            </p>
            <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
              {secciones.map((s) => (
                <div key={s.nombre} className="rounded-lg border border-border/60 p-3">
                  <div className="text-sm font-medium">{s.nombre}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {s.campos} campos · {s.obligatorios} obligatorios
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Paciente</th>
                  <th className="px-3 py-2 text-left">Estado de la entrevista</th>
                  <th className="px-3 py-2 text-left">Origen del proceso</th>
                </tr>
              </thead>
              <tbody>
                {procesosDx.map((p) => (
                  <tr key={p.id} className="border-t border-border/50">
                    <td className="px-3 py-2">{p.paciente}</td>
                    <td className="px-3 py-2 text-xs">{p.entrevistaInicial}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{p.origen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sel && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={() => setSel(null)}>
          <aside
            onClick={(e) => e.stopPropagation()}
            className="h-full w-full max-w-lg overflow-y-auto border-l border-border/60 bg-background p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-xs text-muted-foreground">{sel.id}</div>
                <h2 className="font-display text-2xl">{sel.paciente}</h2>
                <div className="text-sm text-muted-foreground">
                  {sel.edad} años · {sel.sede}
                </div>
              </div>
              <button onClick={() => setSel(null)} className="text-sm text-muted-foreground hover:text-foreground">
                Cerrar
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
              <span className={`rounded-full px-2 py-0.5 ${prioridadTono[sel.prioridad]}`}>
                Prioridad {sel.prioridad}
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">{sel.estado}</span>
              <span className="rounded-full bg-muted px-2 py-0.5">{sel.origen}</span>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-muted-foreground">Motivo de evaluación</dt>
                <dd>{sel.motivo}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Especialidad</dt>
                <dd>{sel.especialidad}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Responsable</dt>
                <dd>{sel.responsable}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Ingreso / espera</dt>
                <dd>
                  {sel.ingreso} · {sel.diasEspera} d
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Primera entrevista</dt>
                <dd>{sel.entrevistaInicial}</dd>
              </div>
            </dl>

            <section className="mt-6">
              <h3 className="text-sm font-medium">Instrumentos del proceso</h3>
              <ul className="mt-2 space-y-1 text-xs">
                {sel.instrumentos.map((i) => (
                  <li key={i.nombre} className="flex items-center justify-between rounded border border-border/60 px-2 py-1">
                    <span>{i.nombre}</span>
                    <span className="text-muted-foreground">{i.estado}</span>
                  </li>
                ))}
              </ul>
            </section>

            {sel.historialPrioridad?.length ? (
              <section className="mt-6">
                <h3 className="text-sm font-medium">Historial de priorización</h3>
                <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
                  {sel.historialPrioridad.map((h, i) => (
                    <li key={i} className="rounded border border-border/60 p-2">
                      {h.de} → {h.a} · {h.fecha}
                      <div>Motivo: {h.motivo}</div>
                      <div>Registrado por: {h.usuario}</div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div className="mt-6 flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              <FileText className="mt-0.5 h-3.5 w-3.5" />
              El informe diagnóstico se genera con las tablas y gráficas de puntajes del proceso, requiere aprobación
              del profesional responsable y se comparte a la familia por el portal para padres.
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
