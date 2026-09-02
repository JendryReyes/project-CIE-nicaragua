import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldAlert, AlertTriangle, CheckCircle2, Bell, FileClock } from "lucide-react";
import {
  categoriaLabel,
  fases,
  incidentes,
  resumenIncidentes,
  tipologia,
  type CategoriaIncidente,
  type Incidente,
} from "@/lib/incidentes-data";

export const Route = createFileRoute("/_app/incidentes")({
  head: () => ({
    meta: [
      { title: "Incidentes clínicos y seguridad · CIE" },
      {
        name: "description",
        content:
          "Registro, escalamiento y cierre trazable de incidentes clínicos, médicos y de cumplimiento.",
      },
      { property: "og:title", content: "Incidentes clínicos y seguridad · CIE" },
      { property: "og:description", content: "Módulo transversal de gestión de incidentes con notificación crítica automática." },
    ],
  }),
  component: Incidentes,
});

const sevTono = {
  alta: "bg-[oklch(0.95_0.053_30)] text-[oklch(0.45_0.132_30)]",
  media: "bg-[oklch(0.95_0.062_80)] text-[oklch(0.44_0.114_80)]",
  baja: "bg-[oklch(0.94_0.044_160)] text-[oklch(0.36_0.097_160)]",
} as const;

const faseIdx = { registro: 0, revision: 1, correctivo: 2, cerrado: 3 } as const;

function Incidentes() {
  const r = resumenIncidentes();
  const [cat, setCat] = useState<"todas" | CategoriaIncidente>("todas");
  const [sel, setSel] = useState<Incidente | null>(null);
  const lista = incidentes.filter((i) => cat === "todas" || i.categoria === cat);

  return (
    <div className="max-w-[1400px] space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldAlert className="h-4 w-4" /> Seguridad del paciente
        </div>
        <h1 className="mt-1 font-display text-3xl">Incidentes clínicos y de seguridad</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Módulo transversal que opera en paralelo al registro ABC: escala eventos críticos a un protocolo formal con
          notificación automática, plan correctivo obligatorio y cierre validado por Dirección Clínica.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { l: "Incidentes registrados", v: r.total, s: "período en curso" },
          { l: "Abiertos", v: r.abiertos, s: "en gestión activa" },
          { l: "Severidad alta", v: r.altaSeveridad, s: "escalados a dirección" },
          { l: "Sin plan correctivo", v: r.sinCorrectivas, s: "requieren acción" },
          { l: "Cerrados", v: r.cerrados, s: "validados y trazables" },
        ].map((k) => (
          <div key={k.l} className="rounded-xl border border-border/60 p-4">
            <div className="text-xs text-muted-foreground">{k.l}</div>
            <div className="mt-1 font-display text-2xl">{k.v}</div>
            <div className="text-xs text-muted-foreground">{k.s}</div>
          </div>
        ))}
      </div>

      {r.sinCorrectivas > 0 && (
        <div className="rounded-xl border border-[oklch(0.85_0.07_30)] bg-[oklch(0.98_0.014_265)] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-[oklch(0.45_0.132_30)]">
            <AlertTriangle className="h-4 w-4" /> Alerta automática · {r.sinCorrectivas} incidentes abiertos sin plan
            correctivo registrado
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            El sistema no permite cerrar un incidente sin acciones correctivas validadas por Dirección Clínica.
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-4">
        {fases.map((f, i) => (
          <div key={f.id} className="rounded-xl border border-border/60 p-4">
            <div className="text-xs font-medium text-primary">{f.nombre}</div>
            <p className="mt-1 text-xs text-muted-foreground">{f.detalle}</p>
            <div className="mt-3 text-xs text-muted-foreground">
              {incidentes.filter((x) => faseIdx[x.fase] === i).length} incidentes en esta fase
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 text-xs">
        {(["todas", "conductual", "medico", "etico"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full border px-3 py-1 ${
              cat === c ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"
            }`}
          >
            {c === "todas" ? "Todas las categorías" : categoriaLabel[c]}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Folio</th>
              <th className="px-3 py-2 text-left">Paciente / sede</th>
              <th className="px-3 py-2 text-left">Tipo</th>
              <th className="px-3 py-2 text-left">Severidad</th>
              <th className="px-3 py-2 text-left">Fase</th>
              <th className="px-3 py-2 text-left">Reportado por</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((i) => (
              <tr
                key={i.id}
                onClick={() => setSel(i)}
                className="cursor-pointer border-t border-border/50 hover:bg-muted/30"
              >
                <td className="px-3 py-2 font-mono text-xs">{i.id}</td>
                <td className="px-3 py-2">
                  <div className="font-medium">{i.nino}</div>
                  <div className="text-xs text-muted-foreground">
                    {i.sede} · {i.fecha} {i.hora}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div>{i.tipo}</div>
                  <div className="text-xs text-muted-foreground">{categoriaLabel[i.categoria]}</div>
                </td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${sevTono[i.severidad]}`}>{i.severidad}</span>
                </td>
                <td className="px-3 py-2 text-xs">{fases[faseIdx[i.fase]].nombre}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{i.reportadoPor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-border/60 p-4">
        <h2 className="font-display text-lg">5.11.1 Tipología de incidentes notificables</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          {(Object.keys(tipologia) as CategoriaIncidente[]).map((c) => (
            <div key={c}>
              <div className="text-sm font-medium">{categoriaLabel[c]}</div>
              <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                {tipologia[c].map((t) => (
                  <li key={t}>· {t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {sel && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={() => setSel(null)}>
          <aside
            onClick={(e) => e.stopPropagation()}
            className="h-full w-full max-w-xl overflow-y-auto border-l border-border/60 bg-background p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-xs text-muted-foreground">{sel.id}</div>
                <h2 className="font-display text-2xl">{sel.nino}</h2>
                <div className="text-sm text-muted-foreground">
                  {sel.sede} · {sel.fecha} {sel.hora}
                </div>
              </div>
              <button onClick={() => setSel(null)} className="text-sm text-muted-foreground hover:text-foreground">
                Cerrar
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
              <span className={`rounded-full px-2 py-0.5 ${sevTono[sel.severidad]}`}>Severidad {sel.severidad}</span>
              <span className="rounded-full bg-muted px-2 py-0.5">{categoriaLabel[sel.categoria]}</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">{fases[faseIdx[sel.fase]].nombre}</span>
            </div>

            <section className="mt-5 space-y-1">
              <h3 className="text-sm font-medium">Registro inicial</h3>
              <p className="text-sm text-muted-foreground">{sel.descripcion}</p>
              <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">Tipo de evento</dt>
                  <dd>{sel.tipo}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Reportado por</dt>
                  <dd>{sel.reportadoPor}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Involucrados</dt>
                  <dd>{sel.involucrados}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Testigos</dt>
                  <dd>{sel.testigos}</dd>
                </div>
              </dl>
            </section>

            <section className="mt-5">
              <h3 className="flex items-center gap-1.5 text-sm font-medium">
                <Bell className="h-3.5 w-3.5" /> Notificación crítica automática
              </h3>
              <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                {sel.notificados.map((n) => (
                  <li key={n}>· {n} — in-app + correo electrónico</li>
                ))}
              </ul>
            </section>

            <section className="mt-5">
              <h3 className="text-sm font-medium">Revisión clínica administrativa</h3>
              {sel.analisis ? (
                <>
                  <p className="mt-1 text-sm text-muted-foreground">{sel.analisis}</p>
                  <p className="mt-1 text-xs">
                    Protocolos de seguridad: {sel.protocoloSeguido ? "validados como seguidos" : "con desviaciones"}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">Pendiente de documentar por Supervisor o Coordinador.</p>
              )}
            </section>

            <section className="mt-5">
              <h3 className="text-sm font-medium">Plan correctivo y prevención</h3>
              {sel.correctivas?.length ? (
                <ul className="mt-1 space-y-1 text-sm">
                  {sel.correctivas.map((c) => (
                    <li key={c} className="flex items-start gap-1.5">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-primary" /> {c}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  Requerido antes del cierre. Responsable aún sin acciones registradas.
                </p>
              )}
              {sel.responsable && <p className="mt-2 text-xs text-muted-foreground">Responsable: {sel.responsable}</p>}
            </section>

            <section className="mt-5 rounded-lg border border-border/60 bg-muted/30 p-3">
              <h3 className="flex items-center gap-1.5 text-sm font-medium">
                <FileClock className="h-3.5 w-3.5" /> Cierre y trazabilidad
              </h3>
              {sel.cierre ? (
                <p className="mt-1 text-xs">
                  Cerrado por {sel.cierre.por} el {sel.cierre.fecha}. Vinculado de forma permanente al expediente del
                  paciente y a la bitácora central de auditoría.
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  El estado «Cerrado» solo se habilita tras la validación de las acciones correctivas por Dirección
                  Clínica. El registro es inmutable.
                </p>
              )}
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
