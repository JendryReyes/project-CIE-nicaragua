import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutGrid, AlertTriangle, Users } from "lucide-react";
import { cupos, estadoCupo, ocupacion, resumenCupos, sedesCupos, disciplinas } from "@/lib/cupos-data";

export const Route = createFileRoute("/_app/cupos")({
  head: () => ({
    meta: [
      { title: "Control de cupos · CIE" },
      { name: "description", content: "Capacidad, ocupación y lista de espera por sede y disciplina terapéutica." },
      { property: "og:title", content: "Control de cupos · CIE" },
      { property: "og:description", content: "Panel de capacidad clínica por sede y disciplina con alertas de cupo crítico." },
    ],
  }),
  component: Cupos,
});

const tono = {
  ok: "bg-[oklch(0.94_0.05_155)] text-[oklch(0.36_0.11_155)]",
  ambar: "bg-[oklch(0.95_0.07_70)] text-[oklch(0.44_0.13_70)]",
  rojo: "bg-[oklch(0.95_0.06_28)] text-[oklch(0.45_0.15_28)]",
} as const;

const barra = { ok: "oklch(0.6 0.14 155)", ambar: "oklch(0.72 0.15 75)", rojo: "oklch(0.6 0.18 28)" } as const;

function Cupos() {
  const [sede, setSede] = useState<string>("todas");
  const r = resumenCupos();
  const filtrados = cupos.filter((c) => sede === "todas" || c.sede === sede);
  const criticos = cupos.filter((c) => ocupacion(c) >= 90);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LayoutGrid className="h-4 w-4" /> Matrícula · Control de cupos
        </div>
        <h1 className="font-display text-3xl mt-1">Cupos por sede y disciplina</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          La admisión valida capacidad antes de matricular. Al llegar al 100% la disciplina se bloquea y los casos
          nuevos pasan automáticamente a lista de espera.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { l: "Capacidad total", v: r.capacidad, s: "cupos clínicos" },
          { l: "Ocupados", v: r.ocupados, s: `${r.ocupacion}% con reservas` },
          { l: "Disponibles", v: r.disponibles, s: "cupos libres" },
          { l: "Lista de espera", v: r.espera, s: "casos" },
          { l: "Uso de horas/semana", v: `${r.usoHoras}%`, s: `${r.horasProg}/${r.horasCap} h` },
        ].map((k) => (
          <div key={k.l} className="rounded-xl border border-border/60 p-4">
            <div className="text-xs text-muted-foreground">{k.l}</div>
            <div className="font-display text-2xl mt-1">{k.v}</div>
            <div className="text-xs text-muted-foreground">{k.s}</div>
          </div>
        ))}
      </div>

      {criticos.length > 0 && (
        <div className="rounded-xl border border-[oklch(0.85_0.08_60)] bg-[oklch(0.98_0.03_70)] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-[oklch(0.42_0.14_60)]">
            <AlertTriangle className="h-4 w-4" /> Alerta automática · {criticos.length} disciplinas al límite de cupo
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
            {criticos.map((c) => (
              <span
                key={c.sede + c.disciplina}
                className={`rounded-full px-2 py-0.5 ${tono[estadoCupo(c).tone]}`}
              >
                {c.sede} · {c.disciplina} ({ocupacion(c)}%)
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {["todas", ...sedesCupos()].map((s) => (
          <button
            key={s}
            onClick={() => setSede(s)}
            className={`rounded-full px-3 py-1 text-xs border ${
              sede === s ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:bg-muted/60"
            }`}
          >
            {s === "todas" ? "Todas las sedes" : s}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Sede</th>
              <th className="text-left px-4 py-3 font-medium">Disciplina</th>
              <th className="text-right px-4 py-3 font-medium">Capacidad</th>
              <th className="text-right px-4 py-3 font-medium">Activos</th>
              <th className="text-right px-4 py-3 font-medium">Reservados</th>
              <th className="text-right px-4 py-3 font-medium">Espera</th>
              <th className="px-4 py-3 font-medium min-w-[180px]">Ocupación</th>
              <th className="text-right px-4 py-3 font-medium">Horas/semana</th>
              <th className="text-left px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((c) => {
              const o = ocupacion(c);
              const e = estadoCupo(c);
              return (
                <tr key={c.sede + c.disciplina} className="border-t border-border/50">
                  <td className="px-4 py-3">{c.sede}</td>
                  <td className="px-4 py-3">{c.disciplina}</td>
                  <td className="px-4 py-3 text-right">{c.capacidad}</td>
                  <td className="px-4 py-3 text-right">{c.ocupados}</td>
                  <td className="px-4 py-3 text-right">{c.reservados}</td>
                  <td className="px-4 py-3 text-right">{c.listaEspera || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(100, o)}%`, background: barra[e.tone] }}
                      />
                    </div>
                    <div className="text-[0.7rem] text-muted-foreground mt-1">{o}%</div>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {c.horasSemanaProgramadas}/{c.horasSemanaCapacidad}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[0.7rem] ${tono[e.tone]}`}>{e.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-border/60 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Users className="h-4 w-4 text-muted-foreground" /> Capacidad consolidada por disciplina
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {disciplinas.map((d) => {
            const list = cupos.filter((c) => c.disciplina === d);
            const cap = list.reduce((s, c) => s + c.capacidad, 0);
            const occ = list.reduce((s, c) => s + c.ocupados + c.reservados, 0);
            const pct = cap ? Math.round((occ / cap) * 100) : 0;
            return (
              <div key={d} className="rounded-lg border border-border/60 p-3">
                <div className="text-xs text-muted-foreground">{d}</div>
                <div className="font-display text-xl mt-1">{pct}%</div>
                <div className="text-xs text-muted-foreground">
                  {occ}/{cap} cupos · {list.length} sedes
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
