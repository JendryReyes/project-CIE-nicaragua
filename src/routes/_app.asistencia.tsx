import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { sesionesHoy, ninoById } from "@/lib/demo-data";
import { AreaBadge } from "@/components/area-badge";
import { Avatar } from "@/components/avatar";
import { Check, X, FileCheck2, AlertCircle, Upload, Paperclip, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_app/asistencia")({
  head: () => ({ meta: [{ title: "Asistencia · CIE" }] }),
  component: Asistencia,
});

type Estado = "pendiente" | "asistio" | "ausente" | "justificado";
type Constancia = { nombre: string; tamanoKb: number; subidoEn: string };

function Asistencia() {
  const [estados, setEstados] = useState<Record<string, Estado>>(() => {
    const init: Record<string, Estado> = {};
    sesionesHoy.forEach((s) => {
      init[s.id] = s.estado === "asistio" ? "asistio" : "pendiente";
    });
    return init;
  });
  const [constancias, setConstancias] = useState<Record<string, Constancia>>({});

  const set = (id: string, e: Estado) => setEstados((s) => ({ ...s, [id]: e }));

  const adjuntar = (id: string, file: File) => {
    setConstancias((c) => ({
      ...c,
      [id]: {
        nombre: file.name,
        tamanoKb: Math.max(1, Math.round(file.size / 1024)),
        subidoEn: new Date().toLocaleTimeString("es-NI", { hour: "2-digit", minute: "2-digit" }),
      },
    }));
    // Al adjuntar constancia, la ausencia pasa automáticamente a justificada
    set(id, "justificado");
  };

  const quitarConstancia = (id: string) => {
    setConstancias((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });
  };

  const total = sesionesHoy.length;
  const asistio = Object.values(estados).filter((e) => e === "asistio").length;
  const ausente = Object.values(estados).filter((e) => e === "ausente").length;
  const justificadas = Object.values(estados).filter((e) => e === "justificado").length;
  const pend = Object.values(estados).filter((e) => e === "pendiente").length;
  const constanciasSubidas = Object.keys(constancias).length;

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
          <span className="tabular font-medium">{asistio + ausente + justificadas} / {total} niños</span>
        </div>
        <div className="flex h-2.5 rounded-full overflow-hidden bg-muted">
          <div className="bg-[oklch(0.62_0.11_155)]" style={{ width: `${(asistio / total) * 100}%` }} />
          <div className="bg-[oklch(0.7_0.13_75)]" style={{ width: `${(justificadas / total) * 100}%` }} />
          <div className="bg-[oklch(0.6_0.15_25)]" style={{ width: `${(ausente / total) * 100}%` }} />
        </div>
        <div className="flex gap-5 mt-3 text-xs flex-wrap">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[oklch(0.62_0.11_155)]" /> Asistió: <b className="tabular">{asistio}</b></span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[oklch(0.7_0.13_75)]" /> Justificado: <b className="tabular">{justificadas}</b></span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[oklch(0.6_0.15_25)]" /> Ausente: <b className="tabular">{ausente}</b></span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-full bg-muted-foreground/40" /> Pendiente: <b className="tabular">{pend}</b></span>
          <span className="inline-flex items-center gap-1.5 ml-auto text-muted-foreground"><Paperclip className="h-3 w-3" /> Constancias adjuntas: <b className="tabular text-foreground">{constanciasSubidas}</b></span>
        </div>
      </div>

      {/* Banner */}
      <div className="flex items-start gap-3 rounded-xl bg-accent/20 border border-accent/40 p-4 text-sm">
        <AlertCircle className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
        <div>
          <div className="font-medium">Respaldo de asistencia</div>
          <div className="text-muted-foreground text-xs mt-1">
            Las ausencias deben justificarse con <b>constancia médica</b> o aviso formal de la familia. Adjuntá el documento (PDF, JPG o PNG) para que la hora no afecte la facturación de horas aprobadas del niño.
          </div>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <ul className="divide-y divide-border/60">
          {sesionesHoy.map((s) => {
            const n = ninoById(s.ninoId)!;
            const e = estados[s.id];
            const constancia = constancias[s.id];
            const mostrarSubida = e === "ausente" || e === "justificado";

            return (
              <li key={s.id} className="p-4 space-y-3">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="font-display text-lg tabular w-14">{s.hora}</div>
                  <Avatar nombre={n.nombre} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{n.nombre}</div>
                    <div className="text-xs text-muted-foreground">{s.terapeuta} · {s.sala}</div>
                  </div>
                  <AreaBadge area={s.area} />
                  <div className="flex gap-1.5 flex-wrap">
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
                </div>

                {mostrarSubida && (
                  <ConstanciaRow
                    sesionId={s.id}
                    constancia={constancia}
                    onUpload={(file) => adjuntar(s.id, file)}
                    onRemove={() => quitarConstancia(s.id)}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function ConstanciaRow({
  sesionId,
  constancia,
  onUpload,
  onRemove,
}: {
  sesionId: string;
  constancia?: Constancia;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = `constancia-${sesionId}`;

  if (constancia) {
    return (
      <div className="ml-[72px] flex items-center gap-3 rounded-lg border border-[oklch(0.7_0.13_75/0.4)] bg-[oklch(0.97_0.04_75)] px-3 py-2 text-xs">
        <FileCheck2 className="h-4 w-4 text-[oklch(0.5_0.13_75)] shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate text-foreground">{constancia.nombre}</div>
          <div className="text-muted-foreground">
            {constancia.tamanoKb} KB · adjuntada {constancia.subidoEn} · proceso completo
          </div>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="rounded-md px-2 py-1 text-muted-foreground hover:bg-background hover:text-foreground"
        >
          Reemplazar
        </button>
        <button
          onClick={onRemove}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-[oklch(0.6_0.15_25)]"
          title="Quitar constancia"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(ev) => {
            const f = ev.target.files?.[0];
            if (f) onUpload(f);
            ev.target.value = "";
          }}
        />
      </div>
    );
  }

  return (
    <div className="ml-[72px] flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-xs">
      <AlertCircle className="h-4 w-4 text-[oklch(0.6_0.15_25)] shrink-0" />
      <div className="flex-1 text-muted-foreground">
        Falta respaldo. Adjuntá la constancia médica para continuar el proceso de justificación.
      </div>
      <label
        htmlFor={inputId}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1.5 font-medium hover:opacity-90"
      >
        <Upload className="h-3.5 w-3.5" /> Subir constancia médica
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(ev) => {
          const f = ev.target.files?.[0];
          if (f) onUpload(f);
          ev.target.value = "";
        }}
      />
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
