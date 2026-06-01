import { createFileRoute } from "@tanstack/react-router";
import { sesionesHoy, ninoById, terapeutas, areaLabels } from "@/lib/demo-data";
import { AreaBadge } from "@/components/area-badge";

export const Route = createFileRoute("/_app/horario")({
  head: () => ({ meta: [{ title: "Horario · CIE" }] }),
  component: Horario,
});

const horas = ["08:00", "08:45", "09:30", "10:15", "11:00", "13:30", "14:15", "15:00", "15:45"];
const dias = ["Lun 01", "Mar 02", "Mié 03", "Jue 04", "Vie 05"];

function Horario() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Horario semanal</h1>
          <p className="text-sm text-muted-foreground mt-1">Semana del 1 al 5 de junio 2026 · Sede Managua</p>
        </div>
        <div className="flex gap-2 text-sm">
          <button className="rounded-full border border-border px-4 py-2 hover:bg-muted">← Semana anterior</button>
          <button className="rounded-full border border-border px-4 py-2 hover:bg-muted">Hoy</button>
          <button className="rounded-full border border-border px-4 py-2 hover:bg-muted">Semana siguiente →</button>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex gap-3 flex-wrap text-xs">
        {(["diagnostico", "fisio", "logopedia", "conducta"] as const).map((a) => (
          <div key={a} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: `var(--color-area-${a})` }} />
            <span className="text-muted-foreground">{areaLabels[a]}</span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-border/60">
          <div className="p-3 text-xs text-muted-foreground"></div>
          {dias.map((d, i) => (
            <div key={d} className={`p-3 text-sm font-medium text-center border-l border-border/60 ${i === 0 ? "bg-primary/5 text-primary" : ""}`}>
              {d}
              {i === 0 && <div className="text-[0.65rem] uppercase tracking-wider font-normal mt-0.5">Hoy</div>}
            </div>
          ))}
        </div>

        {horas.map((h) => (
          <div key={h} className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-border/40 last:border-0 min-h-[88px]">
            <div className="p-3 text-xs text-muted-foreground tabular border-r border-border/40">{h}</div>
            {dias.map((_, di) => {
              const slot = sesionesHoy.filter((s) => s.hora === h);
              const cells = di === 0 ? slot : (di < 3 ? slot.slice(0, Math.max(0, slot.length - di)) : []);
              return (
                <div key={di} className="border-l border-border/40 p-1.5 space-y-1">
                  {cells.map((s) => {
                    const n = ninoById(s.ninoId);
                    return (
                      <div
                        key={s.id + di}
                        className="rounded-lg p-2 text-xs cursor-pointer hover:shadow-sm transition-shadow"
                        style={{ background: `color-mix(in oklab, var(--color-area-${s.area}) 25%, var(--color-card))`, borderLeft: `3px solid var(--color-area-${s.area})` }}
                      >
                        <div className="font-medium truncate">{n?.nombre}</div>
                        <div className="text-muted-foreground truncate text-[0.65rem] mt-0.5">{s.terapeuta.replace("Lic. ", "").replace("Dra. ", "")}</div>
                        <div className="text-[0.65rem] text-muted-foreground">{s.sala}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Terapeutas */}
      <div className="rounded-2xl border border-border/70 bg-card p-5">
        <h3 className="font-display text-lg mb-4">Carga horaria por terapeuta</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {terapeutas.map((t, i) => {
            const horas = [22, 28, 31, 24, 26, 19][i] ?? 20;
            const pct = Math.round((horas / 32) * 100);
            return (
              <div key={t} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate flex-1">{t}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${pct > 90 ? "bg-[oklch(0.6_0.15_25)]" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="tabular text-xs text-muted-foreground w-12 text-right">{horas}h</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
