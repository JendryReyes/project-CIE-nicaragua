import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { sesionesHoy, ninoById, terapeutas, areaLabels, type Sesion, type Nino, iniciales } from "@/lib/demo-data";
import { X, MapPin, Clock, User, Phone, ExternalLink, CalendarDays } from "lucide-react";
import { AreaBadge } from "@/components/area-badge";

export const Route = createFileRoute("/_app/horario")({
  head: () => ({ meta: [{ title: "Horario · CIE" }] }),
  component: Horario,
});

const horas = ["08:00", "08:45", "09:30", "10:15", "11:00", "13:30", "14:15", "15:00", "15:45"];
const dias = ["Lun 01", "Mar 02", "Mié 03", "Jue 04", "Vie 05"];

function Horario() {
  const [sel, setSel] = useState<{ nino: Nino; sesion: Sesion } | null>(null);

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
                    if (!n) return null;
                    return (
                      <button
                        key={s.id + di}
                        onClick={() => setSel({ nino: n, sesion: s })}
                        className="w-full text-left rounded-lg p-2 text-xs cursor-pointer hover:shadow-md hover:-translate-y-px transition-all"
                        style={{ background: `color-mix(in oklab, var(--color-area-${s.area}) 25%, var(--color-card))`, borderLeft: `3px solid var(--color-area-${s.area})` }}
                      >
                        <div className="font-medium truncate">{n.nombre}</div>
                        <div className="text-muted-foreground truncate text-[0.65rem] mt-0.5">{s.terapeuta.replace("Lic. ", "").replace("Dra. ", "")}</div>
                        <div className="text-[0.65rem] text-muted-foreground">{s.sala}</div>
                      </button>
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

      {sel && <PerfilDrawer nino={sel.nino} sesion={sel.sesion} onClose={() => setSel(null)} />}
    </div>
  );
}

function PerfilDrawer({ nino, sesion, onClose }: { nino: Nino; sesion: Sesion; onClose: () => void }) {
  const sesionesDelNino = sesionesHoy.filter((s) => s.ninoId === nino.id);

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/40" />
      <aside className="w-full max-w-[460px] h-full bg-card border-l border-border overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-card border-b border-border p-5 flex items-start justify-between gap-3 z-10">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full grid place-items-center text-sm font-medium" style={{ background: `color-mix(in oklab, var(--color-area-${sesion.area}) 30%, var(--color-card))` }}>
              {iniciales(nino.nombre)}
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">Expediente #{nino.id}</div>
              <h2 className="font-display text-xl leading-tight">{nino.nombre}</h2>
              <div className="text-xs text-muted-foreground">{nino.edad} años · {nino.diagnostico}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Sesión actual */}
          <div className="rounded-xl p-4" style={{ background: `color-mix(in oklab, var(--color-area-${sesion.area}) 18%, var(--color-card))`, borderLeft: `3px solid var(--color-area-${sesion.area})` }}>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Sesión seleccionada</span>
              <AreaBadge area={sesion.area} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-muted-foreground" /><span className="tabular">{sesion.hora} · {sesion.duracion} min</span></div>
              <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /><span>{sesion.sala}</span></div>
              <div className="flex items-center gap-1.5 col-span-2"><User className="h-3.5 w-3.5 text-muted-foreground" /><span>{sesion.terapeuta}</span></div>
            </div>
          </div>

          <Section title="Áreas terapéuticas activas">
            <div className="flex flex-wrap gap-1.5">
              {nino.areas.map((a) => <AreaBadge key={a} area={a} />)}
            </div>
          </Section>

          <Section title="Datos del expediente">
            <Row k="Sede" v={nino.sede} />
            <Row k="Terapeuta principal" v={nino.terapeuta} />
            <Row k="Cobertura" v={nino.inss ? "INSS" : "Privado"} />
            <Row k="Estado" v={nino.estado === "activo" ? "Activo" : nino.estado === "evaluacion" ? "En evaluación" : "Pausa"} />
            <Row k="Progreso global" v={`${nino.progreso}%`} />
          </Section>

          <Section title="Tutor / familia">
            <Row k="Tutor legal" v={nino.tutor} />
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
              <Phone className="h-3.5 w-3.5" /><span className="text-foreground tabular">+505 8700 0000</span>
            </div>
          </Section>

          <Section title="Otras sesiones de hoy">
            {sesionesDelNino.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin más sesiones programadas.</p>
            ) : (
              <ul className="space-y-2">
                {sesionesDelNino.map((s) => (
                  <li key={s.id} className={`flex items-center gap-3 text-sm rounded-lg px-2 py-1.5 ${s.id === sesion.id ? "bg-muted/60" : ""}`}>
                    <span className="tabular font-medium w-14">{s.hora}</span>
                    <AreaBadge area={s.area} />
                    <span className="text-xs text-muted-foreground flex-1 truncate">{s.sala} · {s.terapeuta.replace("Lic. ", "").replace("Dra. ", "")}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border p-4 flex gap-2">
          <Link to="/ninos/$id" params={{ id: nino.id }} className="flex-1 rounded-lg bg-primary text-primary-foreground py-2 text-sm font-medium hover:opacity-90 inline-flex items-center justify-center gap-2">
            <ExternalLink className="h-4 w-4" /> Abrir expediente
          </Link>
          <button className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" /> Ver semana
          </button>
        </div>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">{title}</h3>
      <div className="rounded-xl border border-border/60 bg-background/50 p-3 space-y-1.5">
        {children}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}
