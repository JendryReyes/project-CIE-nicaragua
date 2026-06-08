import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { sesionesHoy, ninoById } from "@/lib/demo-data";
import { AreaBadge } from "@/components/area-badge";
import { Avatar } from "@/components/avatar";
import { Check, X, FileCheck2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_app/asistencia")({
  head: () => ({ meta: [{ title: "Asistencia · CIE" }] }),
  component: Asistencia,
});

type Estado = "pendiente" | "asistio" | "ausente" | "justificado";

function Asistencia() {
  const [estados, setEstados] = useState<Record<string, Estado>>(() => {
    const init: Record<string, Estado> = {};
    sesionesHoy.forEach((s) => {
      init[s.id] = s.estado === "asistio" ? "asistio" : "pendiente";
    });
    return init;
  });

  const set = (id: string, e: Estado) => setEstados((s) => ({ ...s, [id]: e }));

  const total = sesionesHoy.length;
  const asistio = Object.values(estados).filter((e) => e === "asistio").length;
  const ausente = Object.values(estados).filter((e) => e === "ausente").length;
  const pend = Object.values(estados).filter((e) => e === "pendiente").length;

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Asistencia de niños</h1>
          <p className="text-sm text-muted-foreground mt-1">Registro de asistencia de los niños a sus sesiones · Lunes 1 de junio · Sede Managua</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90">
          <FileCheck2 className="h-4 w-4" /> Exportar asistencia del día
        </button>
      </div>

      {/* Bar */}
      <div className="rounded-2xl border border-border/70 bg-card p-5">
        <div className="flex justify-between text-sm mb-3">
          <span className="text-muted-foreground">Niños registrados hoy</span>
          <span className="tabular font-medium">{asistio + ausente} / {total} niños</span>
        </div>
        <div className="flex h-2.5 rounded-full overflow-hidden bg-muted">
          <div className="bg-[oklch(0.62_0.11_155)]" style={{ width: `${(asistio / total) * 100}%` }} />
          <div className="bg-[oklch(0.6_0.15_25)]" style={{ width: `${(ausente / total) * 100}%` }} />
        </div>
        <div className="flex gap-5 mt-3 text-xs">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[oklch(0.62_0.11_155)]" /> Asistió: <b className="tabular">{asistio}</b></span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[oklch(0.6_0.15_25)]" /> Ausente: <b className="tabular">{ausente}</b></span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-full bg-muted-foreground/40" /> Pendiente: <b className="tabular">{pend}</b></span>
        </div>
      </div>

      {/* Banner */}
      <div className="flex items-start gap-3 rounded-xl bg-accent/20 border border-accent/40 p-4 text-sm">
        <AlertCircle className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
        <div>
          <div className="font-medium">Respaldo de asistencia</div>
          <div className="text-muted-foreground text-xs mt-1">
            Las ausencias deben justificarse con constancia médica o aviso de la familia para no afectar la facturación de horas aprobadas del niño.
          </div>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <ul className="divide-y divide-border/60">
          {sesionesHoy.map((s) => {
            const n = ninoById(s.ninoId)!;
            const e = estados[s.id];
            return (
              <li key={s.id} className="flex items-center gap-4 p-4">
                <div className="font-display text-lg tabular w-14">{s.hora}</div>
                <Avatar nombre={n.nombre} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{n.nombre}</div>
                  <div className="text-xs text-muted-foreground">{s.terapeuta} · {s.sala}</div>
                </div>
                <AreaBadge area={s.area} />
                <div className="flex gap-1.5">
                  <ActionBtn active={e === "asistio"} variant="success" onClick={() => set(s.id, "asistio")}>
                    <Check className="h-3.5 w-3.5" /> Asistió
                  </ActionBtn>
                  <ActionBtn active={e === "ausente"} variant="danger" onClick={() => set(s.id, "ausente")}>
                    <X className="h-3.5 w-3.5" /> Ausente
                  </ActionBtn>
                  <ActionBtn active={e === "justificado"} variant="neutral" onClick={() => set(s.id, "justificado")}>
                    Justificado
                  </ActionBtn>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function ActionBtn({ children, active, variant, onClick }: { children: React.ReactNode; active: boolean; variant: "success" | "danger" | "neutral"; onClick: () => void }) {
  const base = "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border";
  const styles = active
    ? variant === "success"
      ? "bg-[oklch(0.62_0.11_155)] text-white border-transparent"
      : variant === "danger"
      ? "bg-[oklch(0.6_0.15_25)] text-white border-transparent"
      : "bg-foreground text-background border-transparent"
    : "bg-background text-muted-foreground border-border hover:bg-muted";
  return <button onClick={onClick} className={`${base} ${styles}`}>{children}</button>;
}
