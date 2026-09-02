import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Calculator,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Upload,
  Clock,
  ExternalLink,
  PauseCircle,
  Send,
  Lock,
  FileDown,
} from "lucide-react";
import { sedesFact } from "@/lib/modulos-data";
import { calcularResumenSede, type ResumenFacturacionNino } from "@/lib/facturacion-motor";
import { rangoSuspensionLegible } from "@/lib/suspensiones";
import { descargarCarta } from "@/lib/carta-cobro";
import {
  keyDe,
  leerQuincena,
  guardarQuincena,
  cambiarEstado,
  pasosCierre,
  type EstadoQuincena,
} from "@/lib/estado-quincena";
import { toast } from "sonner";

export function CierreQuincenaPanel() {
  const [periodo, setPeriodo] = useState({ quincena: 2 as 1 | 2, mes: 5, anio: 2026 });
  const [sedeId, setSedeId] = useState<string>("todas");
  const [calculado, setCalculado] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [constancias, setConstancias] = useState<Record<string, boolean>>({});
  const [sel, setSel] = useState<ResumenFacturacionNino | null>(null);
  const [estado, setEstado] = useState<EstadoQuincena>("abierta");

  const qkey = keyDe(periodo, sedeId);

  useEffect(() => {
    const reg = leerQuincena(qkey);
    if (reg) {
      setEstado(reg.estado);
      setCalculado(reg.estado !== "abierta");
    } else {
      setEstado("abierta");
      setCalculado(false);
    }
    setConstancias({});
  }, [qkey]);

  const readonly = estado === "cerrada" || estado === "enviada";

  const resumenes = useMemo(
    () =>
      calculado
        ? calcularResumenSede(sedeId, periodo).map((r) => ({
            ...r,
            tieneConstancia: constancias[r.ninoId] ?? r.tieneConstancia,
            estado:
              constancias[r.ninoId] && r.tieneExcedente
                ? ("revisar" as const)
                : r.estado,
          }))
        : [],
    [calculado, sedeId, periodo, constancias]
  );

  const totales = useMemo(() => {
    const ok = resumenes.filter((r) => r.estado === "ok").length;
    const revisar = resumenes.filter((r) => r.estado === "revisar").length;
    const bloq = resumenes.filter((r) => r.estado === "bloqueado").length;
    const susp = resumenes.filter((r) => r.estado === "suspendido").length;
    const monto = resumenes.reduce((s, r) => s + r.totalFacturable, 0);
    const montoDescontado = resumenes.reduce(
      (s, r) => s + r.montoSuspendido,
      0
    );
    return { ok, revisar, bloq, susp, monto, montoDescontado, total: resumenes.length };
  }, [resumenes]);

  const calcular = async () => {
    setProcesando(true);
    await new Promise((r) => setTimeout(r, 800));
    setCalculado(true);
    setProcesando(false);
    const nuevo: EstadoQuincena = totales.bloq === 0 ? "lista" : "abierta";
    setEstado(nuevo);
    guardarQuincena({
      key: qkey,
      estado: nuevo,
      totalFacturable: 0,
      totalNinos: 0,
    });
    toast.success("Quincena calculada correctamente");
  };

  const cerrar = () => {
    if (totales.bloq > 0) {
      toast.error("Resuelve los excedentes sin constancia antes de cerrar");
      return;
    }
    cambiarEstado(qkey, "cerrada");
    setEstado("cerrada");
    guardarQuincena({
      key: qkey,
      estado: "cerrada",
      cerradaEn: new Date().toISOString(),
      totalFacturable: totales.monto,
      totalNinos: totales.total,
    });
    toast.success(
      `Período Q${periodo.quincena} cerrado · ${totales.total} niños · $${totales.monto.toFixed(2)}`
    );
  };

  const enviar = () => {
    cambiarEstado(qkey, "enviada");
    setEstado("enviada");
    resumenes.forEach((r) => descargarCarta(r));
    toast.success(`${resumenes.length} cartas generadas y enviadas al INSS`);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Calcula automáticamente las horas facturables a partir de las asistencias registradas
      </p>

      {/* Stepper */}
      <div className="rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          {pasosCierre.map((p, i) => {
            const idx = pasosCierre.findIndex((x) => x.id === estado);
            const done = i < idx;
            const active = i === idx;
            return (
              <div key={p.id} className="flex-1 flex items-center">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-8 w-8 rounded-full grid place-items-center text-xs font-medium shrink-0 ${
                      done
                        ? "bg-[oklch(0.63_0.078_160)] text-primary-foreground"
                        : active
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`text-sm font-medium truncate ${
                        active ? "" : "text-muted-foreground"
                      }`}
                    >
                      {p.label}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">{p.desc}</div>
                  </div>
                </div>
                {i < pasosCierre.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-3 ${
                      done ? "bg-[oklch(0.63_0.078_160)]" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-3 flex flex-wrap gap-3 items-center text-sm">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Período</span>
        <select
          value={periodo.quincena}
          onChange={(e) => {
            setPeriodo({ ...periodo, quincena: Number(e.target.value) as 1 | 2 });
            setCalculado(false);
          }}
          className="rounded-md border border-border bg-background px-2 py-1 text-sm"
        >
          <option value={1}>Q1 · 1-15</option>
          <option value={2}>Q2 · 16-30</option>
        </select>
        <select
          value={periodo.mes}
          onChange={(e) => {
            setPeriodo({ ...periodo, mes: Number(e.target.value) });
            setCalculado(false);
          }}
          className="rounded-md border border-border bg-background px-2 py-1 text-sm"
        >
          {[
            "Enero",
            "Febrero",
            "Marzo",
            "Abril",
            "Mayo",
            "Junio",
            "Julio",
            "Agosto",
            "Sept",
            "Oct",
            "Nov",
            "Dic",
          ].map((m, i) => (
            <option key={i} value={i + 1}>
              {m} {periodo.anio}
            </option>
          ))}
        </select>
        <select
          value={sedeId}
          onChange={(e) => {
            setSedeId(e.target.value);
            setCalculado(false);
          }}
          className="rounded-md border border-border bg-background px-2 py-1 text-sm"
        >
          <option value="todas">Todas las sedes</option>
          {sedesFact.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre} · {s.ciudad}
            </option>
          ))}
        </select>

        <div className="ml-auto flex gap-2">
          {!calculado && (
            <button
              onClick={calcular}
              disabled={procesando}
              className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              <Calculator className="h-4 w-4" />
              {procesando ? "Procesando..." : "Calcular quincena"}
            </button>
          )}
          {calculado && estado === "lista" && (
            <button
              onClick={cerrar}
              disabled={totales.bloq > 0}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              <Lock className="h-4 w-4" /> Cerrar quincena
            </button>
          )}
          {calculado && estado === "cerrada" && (
            <button
              onClick={enviar}
              className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.63_0.078_160)] text-primary-foreground px-4 py-2 text-sm font-medium"
            >
              <Send className="h-4 w-4" /> Enviar al INSS
            </button>
          )}
          {estado === "enviada" && (
            <span className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.94_0.053_160)] text-[oklch(0.4_0.106_160)] px-4 py-2 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" /> Enviada al INSS
            </span>
          )}
        </div>
      </div>

      {readonly && (
        <div className="rounded-xl border border-[oklch(0.7_0.106_160/0.4)] bg-[oklch(0.97_0.035_160)] text-[oklch(0.4_0.106_160)] px-4 py-2.5 text-sm flex items-center gap-2">
          <Lock className="h-4 w-4" /> Período cerrado · solo lectura
        </div>
      )}

      {!calculado && !procesando && (
        <div className="rounded-2xl border-2 border-dashed border-border/70 bg-card p-12 text-center">
          <Calculator className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            Pulsa <b>Calcular quincena</b> para procesar las asistencias del período
          </p>
        </div>
      )}

      {procesando && (
        <div className="rounded-2xl border border-border/70 bg-card p-12 text-center">
          <div className="inline-block h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">
            Procesando {sedesFact.flatMap((s) => s.ninos).length} niños...
          </p>
        </div>
      )}

      {calculado && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <KPI label="Niños procesados" value={String(totales.total)} />
            <KPI label="OK para facturar" value={String(totales.ok)} tone="ok" />
            <KPI label="Requieren revisión" value={String(totales.revisar)} tone="warn" />
            <KPI label="Suspendidos" value={String(totales.susp)} tone="info" />
            <KPI label="Bloqueados" value={String(totales.bloq)} tone="bad" />
          </div>

          {totales.montoDescontado > 0 && (
            <div className="rounded-xl border border-border/70 bg-card px-4 py-2.5 text-sm text-muted-foreground flex items-center gap-2">
              <PauseCircle className="h-4 w-4 text-[oklch(0.55_0.132_80)]" />
              Se descontaron{" "}
              <b className="text-foreground">${totales.montoDescontado.toFixed(2)}</b>{" "}
              por suspensiones activas
            </div>
          )}

          <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
            <div className="grid grid-cols-[1fr_110px_85px_85px_85px_85px_115px_120px] gap-3 px-4 py-2.5 border-b border-border/60 text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/30">
              <span>Niño</span>
              <span>Sede</span>
              <span className="text-right">Ejecutadas</span>
              <span className="text-right">Disp</span>
              <span className="text-right">Suspens.</span>
              <span className="text-right">Fact.</span>
              <span className="text-right">Monto</span>
              <span className="text-center">Estado</span>
            </div>
            {resumenes.map((r) => (
              <button
                key={r.ninoId}
                onClick={() => setSel(r)}
                className={`w-full text-left grid grid-cols-[1fr_110px_85px_85px_85px_85px_115px_120px] gap-3 px-4 py-3 border-b border-border/40 text-sm hover:bg-muted/30 transition-colors ${
                  r.estado === "bloqueado"
                    ? "bg-[oklch(0.97_0.035_30)]"
                    : r.estado === "revisar"
                    ? "bg-[oklch(0.97_0.044_80)]"
                    : r.estado === "suspendido"
                    ? "bg-[oklch(0.97_0.035_80)]"
                    : ""
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="h-7 w-7 rounded-full bg-muted grid place-items-center text-[10px] font-medium">
                    {r.iniciales}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium truncate">{r.nombre}</span>
                    <span className="block text-[10px] text-muted-foreground truncate">
                      {r.expediente}
                    </span>
                  </span>
                </span>
                <span className="text-xs text-muted-foreground self-center">{r.sedeId}</span>
                <span className="tabular text-right self-center">
                  {r.porArea.reduce((s, a) => s + a.horasEjecutadas, 0)}h
                </span>
                <span className="tabular text-right self-center">
                  {r.porArea.reduce(
                    (s, a) => s + (a.horasAprobadasINSS - (a.horasEjecutadas - a.horasExcedentes)),
                    0
                  )}
                  h
                </span>
                <span
                  className={`tabular text-right self-center ${
                    r.horasSuspendidas > 0
                      ? "text-[oklch(0.55_0.132_80)] font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {r.horasSuspendidas > 0 ? `-${r.horasSuspendidas}h` : "—"}
                </span>
                <span className="tabular text-right self-center font-medium">{r.totalHoras}h</span>
                <span className="tabular text-right self-center font-display">
                  ${r.totalFacturable.toFixed(2)}
                </span>
                <span className="self-center text-center">
                  <EstadoBadge estado={r.estado} />
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {sel && (
        <ConciliacionDrawer
          resumen={sel}
          readonly={readonly}
          onClose={() => setSel(null)}
          onConstancia={(ninoId) => {
            setConstancias((c) => ({ ...c, [ninoId]: true }));
            toast.success("Constancia médica registrada · estado recalculado");
          }}
        />
      )}
    </div>
  );
}

function KPI({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "bad" | "info";
}) {
  const cls =
    tone === "ok"
      ? "border-[oklch(0.7_0.106_160/0.4)] bg-[oklch(0.97_0.035_160)]"
      : tone === "warn"
      ? "border-[oklch(0.7_0.114_80/0.4)] bg-[oklch(0.97_0.044_80)]"
      : tone === "bad"
      ? "border-[oklch(0.7_0.114_30/0.4)] bg-[oklch(0.97_0.035_30)]"
      : tone === "info"
      ? "border-[oklch(0.7_0.114_80/0.4)] bg-[oklch(0.97_0.035_80)]"
      : "border-border/70 bg-card";
  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-2xl mt-1 tabular">{value}</div>
    </div>
  );
}

function EstadoBadge({
  estado,
}: {
  estado: "ok" | "revisar" | "bloqueado" | "suspendido";
}) {
  if (estado === "ok")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 bg-[oklch(0.94_0.053_160)] text-[oklch(0.4_0.106_160)]">
        <CheckCircle2 className="h-3 w-3" /> OK
      </span>
    );
  if (estado === "revisar")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 bg-[oklch(0.94_0.07_80)] text-[oklch(0.4_0.114_80)]">
        <AlertTriangle className="h-3 w-3" /> Revisar
      </span>
    );
  if (estado === "suspendido")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 bg-[oklch(0.94_0.062_80)] text-[oklch(0.45_0.114_80)]">
        <PauseCircle className="h-3 w-3" /> Pausa
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 bg-[oklch(0.94_0.053_30)] text-[oklch(0.45_0.132_30)]">
      <XCircle className="h-3 w-3" /> Excede
    </span>
  );
}

function ConciliacionDrawer({
  resumen,
  onClose,
  onConstancia,
  readonly,
}: {
  resumen: ResumenFacturacionNino;
  onClose: () => void;
  onConstancia: (id: string) => void;
  readonly: boolean;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-foreground/30 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 w-full max-w-[520px] bg-card border-l border-border/70 z-50 overflow-y-auto">
        <header className="sticky top-0 bg-card border-b border-border/70 p-5 flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Conciliación quincenal
            </div>
            <h2 className="font-display text-xl mt-1">{resumen.nombre}</h2>
            <p className="text-xs text-muted-foreground">{resumen.expediente}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xl leading-none"
          >
            ×
          </button>
        </header>
        <div className="p-5 space-y-5">
          <button
            onClick={() => descargarCarta(resumen)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium"
          >
            <FileDown className="h-4 w-4" /> Descargar carta de cobro personalizada
          </button>

          {resumen.suspension && (
            <div className="rounded-xl bg-[oklch(0.97_0.035_80)] border border-[oklch(0.7_0.114_80/0.4)] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[oklch(0.45_0.114_80)]">
                <PauseCircle className="h-4 w-4" /> Suspensión activa
              </div>
              <p className="text-xs text-muted-foreground mt-1">{resumen.suspension.motivo}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {rangoSuspensionLegible(resumen.suspension)} · {resumen.horasSuspendidas}h descontadas
                (${resumen.montoSuspendido.toFixed(2)})
              </p>
            </div>
          )}

          <div className="rounded-xl border border-border/70 p-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Cálculo detallado por área
            </div>
            {resumen.porArea.map((a) => (
              <div key={a.area} className="py-2 border-t border-border/50 first:border-t-0">
                <div className="flex justify-between text-sm font-medium">
                  <span>{a.area}</span>
                  <span className="tabular">${a.montoFacturable.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-1 text-[11px] text-muted-foreground">
                  <div>
                    Aprobadas <div className="text-foreground tabular">{a.horasAprobadasINSS}h</div>
                  </div>
                  <div>
                    Ejecutadas <div className="text-foreground tabular">{a.horasEjecutadas}h</div>
                  </div>
                  <div>
                    Facturables{" "}
                    <div className="text-foreground tabular font-medium">{a.horasFacturables}h</div>
                  </div>
                  <div>
                    Excedentes{" "}
                    <div
                      className={`tabular font-medium ${
                        a.horasExcedentes > 0 ? "text-[oklch(0.55_0.132_30)]" : "text-foreground"
                      }`}
                    >
                      {a.horasExcedentes}h
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border/70 p-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Timeline de sesiones
            </div>
            <ul className="space-y-1.5 text-xs">
              {[1, 3, 5, 8, 10, 12, 14].map((d) => (
                <li key={d} className="flex items-center gap-2">
                  <span className="tabular w-16 text-muted-foreground">May {16 + d}</span>
                  <span className="h-2 w-2 rounded-full bg-[oklch(0.62_0.097_160)]" />
                  <span className="flex-1">Sesión ABA · 1.5h · Lic. Castellón</span>
                  <span className="text-muted-foreground">✓</span>
                </li>
              ))}
            </ul>
          </div>

          {resumen.tieneExcedente && !resumen.tieneConstancia && !readonly && (
            <div className="rounded-xl bg-[oklch(0.97_0.035_30)] border border-[oklch(0.7_0.114_30/0.4)] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[oklch(0.45_0.132_30)]">
                <AlertTriangle className="h-4 w-4" /> Excedente sin constancia
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Carga la constancia médica del mes anterior para justificar las horas excedentes.
              </p>
              <button
                onClick={() => onConstancia(resumen.ninoId)}
                className="mt-3 inline-flex items-center gap-2 rounded-md bg-[oklch(0.55_0.141_30)] text-primary-foreground px-3 py-1.5 text-xs font-medium"
              >
                <Upload className="h-3.5 w-3.5" /> Cargar constancia médica
              </button>
            </div>
          )}

          {resumen.tieneConstancia && resumen.tieneExcedente && (
            <div className="rounded-xl bg-[oklch(0.97_0.035_160)] border border-[oklch(0.7_0.106_160/0.4)] p-3 text-xs flex items-center gap-2 text-[oklch(0.4_0.106_160)]">
              <CheckCircle2 className="h-4 w-4" /> Constancia médica registrada · horas justificadas
            </div>
          )}

          <Link
            to="/ninos/$id"
            params={{
              id: resumen.ninoId.replace(/[^0-9]/g, "").padStart(3, "0") || "001",
            }}
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            Abrir expediente clínico <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </aside>
    </>
  );
}
