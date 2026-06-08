import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { sesionesHoy, ninoById, ninos, iniciales, type Nino, type Sesion } from "@/lib/demo-data";
import { AreaBadge } from "@/components/area-badge";
import { Avatar } from "@/components/avatar";
import {
  Check,
  X,
  FileCheck2,
  AlertCircle,
  Upload,
  Paperclip,
  Trash2,
  QrCode,
  ScanLine,
  Smartphone,
  Zap,
  Printer,
  Clock,
  MapPin,
  User,
  Phone,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_app/asistencia")({
  head: () => ({ meta: [{ title: "Asistencia · CIE" }] }),
  component: Asistencia,
});

type Estado = "pendiente" | "asistio" | "ausente" | "justificado";
type Constancia = { nombre: string; tamanoKb: number; subidoEn: string };
type CheckIn = { hora: string; via: "qr" | "manual" };

function nowHHMM() {
  return new Date().toLocaleTimeString("es-NI", { hour: "2-digit", minute: "2-digit" });
}

function Asistencia() {
  const [estados, setEstados] = useState<Record<string, Estado>>(() => {
    const init: Record<string, Estado> = {};
    sesionesHoy.forEach((s) => {
      init[s.id] = s.estado === "asistio" ? "asistio" : "pendiente";
    });
    return init;
  });
  const [constancias, setConstancias] = useState<Record<string, Constancia>>({});
  const [checkins, setCheckins] = useState<Record<string, CheckIn>>(() => {
    const init: Record<string, CheckIn> = {};
    sesionesHoy.forEach((s) => {
      if (s.estado === "asistio") init[s.id] = { hora: s.hora, via: "manual" };
    });
    return init;
  });
  const [kioskoAbierto, setKioskoAbierto] = useState(false);

  const set = (id: string, e: Estado, via?: "qr" | "manual") => {
    setEstados((s) => ({ ...s, [id]: e }));
    if (e === "asistio") {
      setCheckins((c) => ({ ...c, [id]: { hora: nowHHMM(), via: via ?? "manual" } }));
    }
  };

  const adjuntar = (id: string, file: File) => {
    setConstancias((c) => ({
      ...c,
      [id]: {
        nombre: file.name,
        tamanoKb: Math.max(1, Math.round(file.size / 1024)),
        subidoEn: nowHHMM(),
      },
    }));
    setEstados((s) => ({ ...s, [id]: "justificado" }));
  };

  const quitarConstancia = (id: string) => {
    setConstancias((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });
  };

  // Registra al niño en su próxima sesión pendiente del día
  const registrarPorQR = (ninoId: string): { ok: boolean; mensaje: string; nombre?: string } => {
    const n = ninoById(ninoId);
    if (!n) return { ok: false, mensaje: `Código no reconocido: ${ninoId}` };
    const proxima = sesionesHoy.find(
      (s) => s.ninoId === ninoId && estados[s.id] === "pendiente",
    );
    if (!proxima) {
      const yaRegistrado = sesionesHoy.find(
        (s) => s.ninoId === ninoId && estados[s.id] === "asistio",
      );
      if (yaRegistrado) return { ok: false, mensaje: `${n.nombre} ya tiene check-in hoy`, nombre: n.nombre };
      return { ok: false, mensaje: `${n.nombre} no tiene sesiones programadas hoy`, nombre: n.nombre };
    }
    set(proxima.id, "asistio", "qr");
    return { ok: true, mensaje: `${n.nombre} registrado · ${proxima.hora} · ${proxima.sala}`, nombre: n.nombre };
  };

  const total = sesionesHoy.length;
  const asistio = Object.values(estados).filter((e) => e === "asistio").length;
  const ausente = Object.values(estados).filter((e) => e === "ausente").length;
  const justificadas = Object.values(estados).filter((e) => e === "justificado").length;
  const pend = Object.values(estados).filter((e) => e === "pendiente").length;
  const constanciasSubidas = Object.keys(constancias).length;
  const viaQR = Object.values(checkins).filter((c) => c.via === "qr").length;

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Asistencia de niños</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registro de asistencia de los niños a sus sesiones · Lunes 1 de junio · Sede Managua
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setKioskoAbierto(true)}
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            <ScanLine className="h-4 w-4" /> Abrir kiosko QR
          </button>
          <button className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90">
            <FileCheck2 className="h-4 w-4" /> Exportar asistencia
          </button>
        </div>
      </div>

      {/* QR estrategia banner */}
      <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-foreground/[0.03] to-primary/[0.06] p-5">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="rounded-xl bg-foreground text-background p-3">
            <QrCode className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-[240px]">
            <div className="font-medium flex items-center gap-2">
              Check-in con código QR <span className="text-[10px] uppercase tracking-wide bg-primary/15 text-primary px-2 py-0.5 rounded-full">Activo</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Cada niño tiene un QR único en su carnet. La familia lo escanea en la tablet de recepción al llegar y el sistema marca automáticamente <b>Asistió</b> en su próxima sesión del día.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setKioskoAbierto(true)}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
            >
              <Smartphone className="h-4 w-4" /> Modo recepción
            </button>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mt-4 text-xs">
          <MiniStat icon={<ScanLine className="h-3.5 w-3.5" />} label="Check-ins por QR hoy" value={`${viaQR}`} />
          <MiniStat icon={<Zap className="h-3.5 w-3.5" />} label="Tiempo promedio de registro" value="< 3 seg" />
          <MiniStat icon={<Printer className="h-3.5 w-3.5" />} label="Carnets emitidos" value={`${ninos.length} / ${ninos.length}`} />
        </div>
      </div>

      {/* Bar */}
      <div className="rounded-2xl border border-border/70 bg-card p-5">
        <div className="flex justify-between text-sm mb-3">
          <span className="text-muted-foreground">Niños registrados hoy</span>
          <span className="tabular font-medium">
            {asistio + ausente + justificadas} / {total} niños
          </span>
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
            const checkin = checkins[s.id];
            const mostrarSubida = e === "ausente" || e === "justificado";

            return (
              <li key={s.id} className="p-4 space-y-3">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="font-display text-lg tabular w-14">{s.hora}</div>
                  <Avatar nombre={n.nombre} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate flex items-center gap-2">
                      {n.nombre}
                      {checkin?.via === "qr" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-foreground/90 text-background text-[10px] px-2 py-0.5 font-medium">
                          <QrCode className="h-3 w-3" /> QR · {checkin.hora}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{s.terapeuta} · {s.sala}</div>
                  </div>
                  <AreaBadge area={s.area} />
                  <div className="flex gap-1.5 flex-wrap">
                    <ActionBtn active={e === "asistio"} variant="success" onClick={() => set(s.id, "asistio", "manual")}>
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

      <KioskoQR
        open={kioskoAbierto}
        onClose={() => setKioskoAbierto(false)}
        onScan={registrarPorQR}
      />
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2">
      <span className="text-muted-foreground">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">{label}</div>
        <div className="font-display text-base tabular">{value}</div>
      </div>
    </div>
  );
}

type Evento = { id: string; hora: string; mensaje: string; ok: boolean; nombre?: string };

function KioskoQR({
  open,
  onClose,
  onScan,
}: {
  open: boolean;
  onClose: () => void;
  onScan: (ninoId: string) => { ok: boolean; mensaje: string; nombre?: string };
}) {
  const [codigo, setCodigo] = useState("");
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [ultimo, setUltimo] = useState<Evento | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const procesar = (raw: string) => {
    const id = raw.trim().replace(/^CIE-?/i, "").padStart(3, "0");
    const r = onScan(id);
    const ev: Evento = {
      id: `${Date.now()}`,
      hora: nowHHMM(),
      mensaje: r.mensaje,
      ok: r.ok,
      nombre: r.nombre,
    };
    setUltimo(ev);
    setEventos((prev) => [ev, ...prev].slice(0, 6));
    setCodigo("");
  };

  const sugerencias = useMemo(() => ninos.slice(0, 6), []);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5" /> Modo recepción · Check-in QR
          </DialogTitle>
          <DialogDescription>
            La familia escanea el QR del carnet del niño. El sistema marca automáticamente su próxima sesión del día como <b>Asistió</b>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-[1fr_1fr] gap-4">
          {/* Scanner viewport */}
          <div className="rounded-xl border border-border/70 bg-foreground/[0.04] p-4">
            <div className="relative aspect-square rounded-lg bg-foreground/90 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-6 border-2 border-primary/80 rounded-lg" />
              <div className="absolute inset-x-6 h-0.5 bg-primary shadow-[0_0_12px_oklch(0.7_0.18_240)] animate-[scan_2s_ease-in-out_infinite]" style={{ top: "20%" }} />
              <QrCode className="h-20 w-20 text-background/30" />
              <div className="absolute bottom-3 left-0 right-0 text-center text-xs text-background/70">
                Apuntá el QR del carnet a la cámara
              </div>
            </div>
            <style>{`@keyframes scan { 0%, 100% { top: 15%; } 50% { top: 80%; } }`}</style>

            <div className="mt-3">
              <label className="text-xs text-muted-foreground">O ingresá el código manualmente</label>
              <form
                onSubmit={(ev) => {
                  ev.preventDefault();
                  if (codigo.trim()) procesar(codigo);
                }}
                className="flex gap-2 mt-1"
              >
                <input
                  ref={inputRef}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="CIE-001"
                  className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm font-mono"
                />
                <button
                  type="submit"
                  className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
                >
                  Registrar
                </button>
              </form>
              <div className="flex gap-1 flex-wrap mt-2">
                {sugerencias.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => procesar(n.id)}
                    className="text-[10px] rounded-full border border-border bg-background px-2 py-1 hover:bg-muted text-muted-foreground"
                    title={n.nombre}
                  >
                    {iniciales(n.nombre)} · {n.id}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Simulación · clic en un código para probar el escaneo</p>
            </div>
          </div>

          {/* Feed */}
          <div className="rounded-xl border border-border/70 bg-card p-4 flex flex-col">
            {ultimo ? (
              <div
                className={`rounded-lg p-3 mb-3 border ${
                  ultimo.ok
                    ? "bg-[oklch(0.96_0.05_155)] border-[oklch(0.7_0.12_155/0.4)]"
                    : "bg-[oklch(0.97_0.04_25)] border-[oklch(0.7_0.13_25/0.4)]"
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-medium">
                  {ultimo.ok ? (
                    <Check className="h-4 w-4 text-[oklch(0.5_0.12_155)]" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-[oklch(0.55_0.15_25)]" />
                  )}
                  {ultimo.ok ? "Check-in exitoso" : "No se pudo registrar"}
                </div>
                <div className="text-sm mt-1 font-medium">{ultimo.mensaje}</div>
              </div>
            ) : (
              <div className="rounded-lg p-3 mb-3 border border-dashed border-border bg-muted/30 text-xs text-muted-foreground text-center">
                Esperando primer escaneo…
              </div>
            )}

            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Últimos check-ins</div>
            <ul className="space-y-1.5 flex-1 overflow-auto">
              {eventos.length === 0 && (
                <li className="text-xs text-muted-foreground italic">Sin actividad todavía</li>
              )}
              {eventos.map((ev) => (
                <li
                  key={ev.id}
                  className="flex items-center gap-2 text-xs rounded-md bg-muted/40 px-2 py-1.5"
                >
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${ev.ok ? "bg-[oklch(0.62_0.11_155)]" : "bg-[oklch(0.6_0.15_25)]"}`} />
                  <span className="tabular text-muted-foreground w-12">{ev.hora}</span>
                  <span className="truncate flex-1">{ev.mensaje}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
