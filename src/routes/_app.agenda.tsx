import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarRange, Sparkles, History, UserCheck, Bell } from "lucide-react";
import {
  dias,
  disponibilidad,
  modificaciones,
  recomendarTerapeutas,
  resumenAgenda,
  semanaModelo,
  type BloqueModelo,
} from "@/lib/agenda-modelo";

export const Route = createFileRoute("/_app/agenda")({
  head: () => ({
    meta: [
      { title: "Semana modelo y agenda operativa · CIE" },
      {
        name: "description",
        content:
          "Planificación recurrente, agenda operativa, disponibilidad del personal y asignación inteligente de terapeutas.",
      },
      { property: "og:title", content: "Semana modelo y agenda operativa · CIE" },
      { property: "og:description", content: "Semana modelo, modificaciones de ejecución y recomendación IA de terapeutas." },
    ],
  }),
  component: Agenda,
});

const estadoTono = {
  disponible: "bg-[oklch(0.94_0.044_160)] text-[oklch(0.36_0.097_160)]",
  parcial: "bg-[oklch(0.95_0.062_80)] text-[oklch(0.44_0.114_80)]",
  ausente: "bg-[oklch(0.95_0.053_30)] text-[oklch(0.45_0.132_30)]",
} as const;

function Agenda() {
  const r = resumenAgenda();
  const [tab, setTab] = useState<"modelo" | "modificaciones" | "personal">("modelo");
  const [sel, setSel] = useState<BloqueModelo | null>(null);

  return (
    <div className="max-w-[1400px] space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarRange className="h-4 w-4" /> Planificación operativa
        </div>
        <h1 className="mt-1 font-display text-3xl">Semana modelo y agenda operativa</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          La Semana Modelo es la plantilla recurrente que genera la agenda real. Las modificaciones de ejecución afectan
          solo la semana en curso, salvo que se marquen como cambio permanente.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { l: "Bloques en la plantilla", v: r.bloques, s: `${r.horas} h semanales` },
          { l: "Pacientes programados", v: r.pacientes, s: "con semana modelo activa" },
          { l: "Terapeutas asignados", v: r.terapeutas, s: "en la plantilla" },
          { l: "Modificaciones de la semana", v: r.modificaciones, s: "con motivo y responsable" },
          { l: "Cambios permanentes", v: r.permanentes, s: "actualizan la plantilla" },
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
            ["modelo", "Semana modelo"],
            ["modificaciones", "Modificaciones en ejecución"],
            ["personal", "Disponibilidad del personal"],
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

      {tab === "modelo" && (
        <div className="grid gap-3 lg:grid-cols-5">
          {dias.map((d) => (
            <div key={d} className="rounded-xl border border-border/60 p-3">
              <div className="text-sm font-medium">{d}</div>
              <div className="mt-2 space-y-2">
                {semanaModelo
                  .filter((b) => b.dia === d)
                  .map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSel(b)}
                      className="w-full rounded-lg border border-border/60 p-2 text-left text-xs hover:border-primary/60 hover:bg-primary/5"
                    >
                      <div className="font-medium">
                        {b.hora} · {b.duracion}′
                      </div>
                      <div>{b.nino}</div>
                      <div className="text-muted-foreground">
                        {b.disciplina} · {b.terapeuta.replace("Lic. ", "").replace("Dra. ", "")}
                      </div>
                      <div className="text-muted-foreground">{b.sede}</div>
                    </button>
                  ))}
                {!semanaModelo.some((b) => b.dia === d) && (
                  <p className="text-xs text-muted-foreground">Sin bloques programados</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "modificaciones" && (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Tipo de cambio</th>
                  <th className="px-3 py-2 text-left">Paciente</th>
                  <th className="px-3 py-2 text-left">Detalle</th>
                  <th className="px-3 py-2 text-left">Motivo</th>
                  <th className="px-3 py-2 text-left">Responsable / fecha</th>
                  <th className="px-3 py-2 text-left">Alcance</th>
                </tr>
              </thead>
              <tbody>
                {modificaciones.map((m) => (
                  <tr key={m.id} className="border-t border-border/50">
                    <td className="px-3 py-2">{m.tipo}</td>
                    <td className="px-3 py-2">{m.nino}</td>
                    <td className="px-3 py-2 text-xs">{m.detalle}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{m.motivo}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {m.usuario}
                      <br />
                      {m.fecha}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <span
                        className={`rounded-full px-2 py-0.5 ${
                          m.soloEstaSemana
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {m.soloEstaSemana ? "Solo esta semana" : "Actualiza plantilla"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-start gap-2 rounded-xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
            <History className="mt-0.5 h-4 w-4" />
            Cada modificación queda registrada en la bitácora de auditoría con usuario responsable, fecha, hora,
            información modificada y motivo del cambio (11.8). Las notificaciones se envían automáticamente a los
            usuarios involucrados (11.7).
          </div>
        </div>
      )}

      {tab === "personal" && (
        <div className="overflow-hidden rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Terapeuta</th>
                <th className="px-3 py-2 text-left">Disciplinas</th>
                <th className="px-3 py-2 text-left">Sede</th>
                <th className="px-3 py-2 text-left">Jornada</th>
                <th className="px-3 py-2 text-left">Carga</th>
                <th className="px-3 py-2 text-left">Estado / restricción</th>
              </tr>
            </thead>
            <tbody>
              {disponibilidad.map((d) => (
                <tr key={d.terapeuta} className="border-t border-border/50">
                  <td className="px-3 py-2 font-medium">{d.terapeuta}</td>
                  <td className="px-3 py-2 text-xs">{d.disciplinas.join(", ")}</td>
                  <td className="px-3 py-2 text-xs">{d.sede}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{d.jornada}</td>
                  <td className="px-3 py-2 text-xs">
                    {d.horasAsignadas}/{d.horasSemana} h
                    <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(100, (d.horasAsignadas / d.horasSemana) * 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <span className={`rounded-full px-2 py-0.5 ${estadoTono[d.estado]}`}>{d.estado}</span>
                    {d.restriccion && <div className="mt-1 text-muted-foreground">{d.restriccion}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                <div className="text-xs text-muted-foreground">
                  {sel.dia} {sel.hora} · {sel.duracion} min
                </div>
                <h2 className="font-display text-2xl">{sel.nino}</h2>
                <div className="text-sm text-muted-foreground">
                  {sel.disciplina} · {sel.sede}
                </div>
              </div>
              <button onClick={() => setSel(null)} className="text-sm text-muted-foreground hover:text-foreground">
                Cerrar
              </button>
            </div>

            <div className="mt-4 rounded-lg border border-border/60 p-3 text-sm">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <UserCheck className="h-3.5 w-3.5" /> Terapeuta asignado en la plantilla
              </div>
              <div className="mt-1 font-medium">{sel.terapeuta}</div>
            </div>

            <h3 className="mt-6 flex items-center gap-1.5 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" /> 11.6 Asignación inteligente — alternativas sugeridas
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Recomendación asistencial: puede aceptarse, modificarse o descartarse por el responsable de la
              programación.
            </p>
            <div className="mt-3 space-y-3">
              {recomendarTerapeutas(sel).map((rec) => (
                <div key={rec.terapeuta} className="rounded-lg border border-border/60 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{rec.terapeuta}</div>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {rec.score}% de idoneidad
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1 text-xs">
                    {rec.factores.map((f) => (
                      <li key={f.factor} className={f.positivo ? "" : "text-muted-foreground"}>
                        {f.positivo ? "✓" : "•"} {f.factor}: {f.valor}
                      </li>
                    ))}
                  </ul>
                  <button className="mt-3 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                    Aceptar sugerencia (requiere motivo)
                  </button>
                </div>
              ))}
              {recomendarTerapeutas(sel).length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No hay alternativas con la competencia requerida para {sel.disciplina}.
                </p>
              )}
            </div>

            <div className="mt-6 flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              <Bell className="mt-0.5 h-3.5 w-3.5" />
              Al confirmar el cambio se notifica al terapeuta entrante, al saliente y a la familia, y se registra el
              motivo en la bitácora de auditoría.
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
