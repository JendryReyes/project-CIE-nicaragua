import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Calculator, CheckCircle2, AlertTriangle, XCircle, Upload, FileCheck2, Clock, ExternalLink } from "lucide-react";
import { sedesFact } from "@/lib/modulos-data";
import { calcularResumenSede, type ResumenFacturacionNino } from "@/lib/facturacion-motor";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/facturacion/cierre")({
  head: () => ({ meta: [{ title: "Cierre de quincena · CIE" }] }),
  component: CierreQuincena,
});

function CierreQuincena() {
  const [periodo, setPeriodo] = useState({ quincena: 2 as 1 | 2, mes: 5, anio: 2026 });
  const [sedeId, setSedeId] = useState<string>("todas");
  const [calculado, setCalculado] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [constancias, setConstancias] = useState<Record<string, boolean>>({});
  const [sel, setSel] = useState<ResumenFacturacionNino | null>(null);

  const resumenes = useMemo(
    () => (calculado ? calcularResumenSede(sedeId, periodo).map((r) => ({
      ...r,
      tieneConstancia: constancias[r.ninoId] ?? r.tieneConstancia,
      estado: (constancias[r.ninoId] && r.tieneExcedente)
        ? "revisar" as const
        : r.estado,
    })) : []),
    [calculado, sedeId, periodo, constancias]
  );

  const totales = useMemo(() => {
    const ok = resumenes.filter((r) => r.estado === "ok").length;
    const revisar = resumenes.filter((r) => r.estado === "revisar").length;
    const bloq = resumenes.filter((r) => r.estado === "bloqueado").length;
    const monto = resumenes.reduce((s, r) => s + r.totalFacturable, 0);
    return { ok, revisar, bloq, monto, total: resumenes.length };
  }, [resumenes]);

  const calcular = async () => {
    setProcesando(true);
    await new Promise((r) => setTimeout(r, 800));
    setCalculado(true);
    setProcesando(false);
    toast.success("Quincena calculada correctamente");
  };

  const confirmar = () => {
    if (totales.bloq > 0) {
      toast.error("Resuelve los excedentes sin constancia antes de confirmar");
      return;
    }
    toast.success(`Período Q${periodo.quincena} cerrado · ${totales.total} niños · $${totales.monto.toFixed(2)}`);
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <Link to="/facturacion" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-3 w-3" /> Volver a Facturación
          </Link>
          <h1 className="font-display text-3xl">Cierre de quincena</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Calcula automáticamente las horas facturables a partir de las asistencias registradas
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={calcular}
            disabled={procesando}
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            <Calculator className="h-4 w-4" />
            {procesando ? "Procesando..." : "Calcular quincena"}
          </button>
          <button
            onClick={confirmar}
            disabled={!calculado || totales.bloq > 0}
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            <FileCheck2 className="h-4 w-4" /> Confirmar y generar documentos
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-3 flex flex-wrap gap-3 items-center text-sm">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Período</span>
        <select value={periodo.quincena} onChange={(e) => { setPeriodo({ ...periodo, quincena: Number(e.target.value) as 1 | 2 }); setCalculado(false); }}
          className="rounded-md border border-border bg-background px-2 py-1 text-sm">
          <option value={1}>Q1 · 1-15</option>
          <option value={2}>Q2 · 16-30</option>
        </select>
        <select value={periodo.mes} onChange={(e) => { setPeriodo({ ...periodo, mes: Number(e.target.value) }); setCalculado(false); }}
          className="rounded-md border border-border bg-background px-2 py-1 text-sm">
          {["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Sept","Oct","Nov","Dic"].map((m, i) => (
            <option key={i} value={i + 1}>{m} {periodo.anio}</option>
          ))}
        </select>
        <select value={sedeId} onChange={(e) => { setSedeId(e.target.value); setCalculado(false); }}
          className="rounded-md border border-border bg-background px-2 py-1 text-sm">
          <option value="todas">Todas las sedes</option>
          {sedesFact.map((s) => <option key={s.id} value={s.id}>{s.nombre} · {s.ciudad}</option>)}
        </select>
      </div>

      {!calculado && !procesando && (
        <div className="rounded-2xl border-2 border-dashed border-border/70 bg-card p-12 text-center">
          <Calculator className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Pulsa <b>Calcular quincena</b> para procesar las asistencias del período</p>
        </div>
      )}

      {procesando && (
        <div className="rounded-2xl border border-border/70 bg-card p-12 text-center">
          <div className="inline-block h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">Procesando {sedesFact.flatMap((s) => s.ninos).length} niños...</p>
        </div>
      )}

      {calculado && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPI label="Niños procesados" value={String(totales.total)} />
            <KPI label="OK para facturar" value={String(totales.ok)} tone="ok" />
            <KPI label="Requieren revisión" value={String(totales.revisar)} tone="warn" />
            <KPI label="Bloqueados" value={String(totales.bloq)} tone="bad" />
          </div>

          <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
            <div className="grid grid-cols-[1fr_120px_100px_100px_100px_120px_130px] gap-3 px-4 py-2.5 border-b border-border/60 text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/30">
              <span>Niño</span>
              <span>Sede</span>
              <span className="text-right">Ejecutadas</span>
              <span className="text-right">Disp Q2</span>
              <span className="text-right">Facturables</span>
              <span className="text-right">Monto</span>
              <span className="text-center">Estado</span>
            </div>
            {resumenes.map((r) => (
              <button
                key={r.ninoId}
                onClick={() => setSel(r)}
                className={`w-full text-left grid grid-cols-[1fr_120px_100px_100px_100px_120px_130px] gap-3 px-4 py-3 border-b border-border/40 text-sm hover:bg-muted/30 transition-colors ${
                  r.estado === "bloqueado" ? "bg-[oklch(0.97_0.04_25)]"
                  : r.estado === "revisar" ? "bg-[oklch(0.97_0.05_75)]"
                  : ""
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="h-7 w-7 rounded-full bg-muted grid place-items-center text-[10px] font-medium">{r.iniciales}</span>
                  <span className="min-w-0">
                    <span className="block font-medium truncate">{r.nombre}</span>
                    <span className="block text-[10px] text-muted-foreground truncate">{r.expediente}</span>
                  </span>
                </span>
                <span className="text-xs text-muted-foreground self-center">{r.sedeId}</span>
                <span className="tabular text-right self-center">{r.porArea.reduce((s, a) => s + a.horasEjecutadas, 0)}h</span>
                <span className="tabular text-right self-center">{r.porArea.reduce((s, a) => s + (a.horasAprobadasINSS - (a.horasEjecutadas - a.horasExcedentes)), 0)}h</span>
                <span className="tabular text-right self-center font-medium">{r.totalHoras}h</span>
                <span className="tabular text-right self-center font-display">${r.totalFacturable.toFixed(2)}</span>
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

function KPI({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" | "bad" }) {
  const cls =
    tone === "ok" ? "border-[oklch(0.7_0.12_155/0.4)] bg-[oklch(0.97_0.04_155)]" :
    tone === "warn" ? "border-[oklch(0.7_0.13_75/0.4)] bg-[oklch(0.97_0.05_75)]" :
    tone === "bad" ? "border-[oklch(0.7_0.13_25/0.4)] bg-[oklch(0.97_0.04_25)]" :
    "border-border/70 bg-card";
  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-2xl mt-1 tabular">{value}</div>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: "ok" | "revisar" | "bloqueado" }) {
  if (estado === "ok") return <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 bg-[oklch(0.94_0.06_155)] text-[oklch(0.4_0.12_155)]"><CheckCircle2 className="h-3 w-3" /> OK</span>;
  if (estado === "revisar") return <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 bg-[oklch(0.94_0.08_75)] text-[oklch(0.4_0.13_75)]"><AlertTriangle className="h-3 w-3" /> Revisar</span>;
  return <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 bg-[oklch(0.94_0.06_25)] text-[oklch(0.45_0.15_25)]"><XCircle className="h-3 w-3" /> Excede</span>;
}

function ConciliacionDrawer({ resumen, onClose, onConstancia }: { resumen: ResumenFacturacionNino; onClose: () => void; onConstancia: (id: string) => void; }) {
  return (
    <>
      <div className="fixed inset-0 bg-foreground/30 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 w-full max-w-[520px] bg-card border-l border-border/70 z-50 overflow-y-auto">
        <header className="sticky top-0 bg-card border-b border-border/70 p-5 flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Conciliación quincenal</div>
            <h2 className="font-display text-xl mt-1">{resumen.nombre}</h2>
            <p className="text-xs text-muted-foreground">{resumen.expediente}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </header>
        <div className="p-5 space-y-5">
          <div className="rounded-xl border border-border/70 p-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Cálculo detallado por área</div>
            {resumen.porArea.map((a) => (
              <div key={a.area} className="py-2 border-t border-border/50 first:border-t-0">
                <div className="flex justify-between text-sm font-medium">
                  <span>{a.area}</span>
                  <span className="tabular">${a.montoFacturable.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-1 text-[11px] text-muted-foreground">
                  <div>Aprobadas <div className="text-foreground tabular">{a.horasAprobadasINSS}h</div></div>
                  <div>Ejecutadas <div className="text-foreground tabular">{a.horasEjecutadas}h</div></div>
                  <div>Facturables <div className="text-foreground tabular font-medium">{a.horasFacturables}h</div></div>
                  <div>Excedentes <div className={`tabular font-medium ${a.horasExcedentes > 0 ? "text-[oklch(0.55_0.15_25)]" : "text-foreground"}`}>{a.horasExcedentes}h</div></div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border/70 p-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1"><Clock className="h-3 w-3" /> Timeline de sesiones</div>
            <ul className="space-y-1.5 text-xs">
              {[1, 3, 5, 8, 10, 12, 14].map((d) => (
                <li key={d} className="flex items-center gap-2">
                  <span className="tabular w-16 text-muted-foreground">May {16 + d}</span>
                  <span className="h-2 w-2 rounded-full bg-[oklch(0.62_0.11_155)]" />
                  <span className="flex-1">Sesión ABA · 1.5h · Lic. Castellón</span>
                  <span className="text-muted-foreground">✓</span>
                </li>
              ))}
            </ul>
          </div>

          {resumen.tieneExcedente && !resumen.tieneConstancia && (
            <div className="rounded-xl bg-[oklch(0.97_0.04_25)] border border-[oklch(0.7_0.13_25/0.4)] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[oklch(0.45_0.15_25)]">
                <AlertTriangle className="h-4 w-4" /> Excedente sin constancia
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Carga la constancia médica del mes anterior para justificar las horas excedentes.
              </p>
              <button
                onClick={() => onConstancia(resumen.ninoId)}
                className="mt-3 inline-flex items-center gap-2 rounded-md bg-[oklch(0.55_0.16_25)] text-white px-3 py-1.5 text-xs font-medium"
              >
                <Upload className="h-3.5 w-3.5" /> Cargar constancia médica
              </button>
            </div>
          )}

          {resumen.tieneConstancia && resumen.tieneExcedente && (
            <div className="rounded-xl bg-[oklch(0.97_0.04_155)] border border-[oklch(0.7_0.12_155/0.4)] p-3 text-xs flex items-center gap-2 text-[oklch(0.4_0.12_155)]">
              <CheckCircle2 className="h-4 w-4" /> Constancia médica registrada · horas justificadas
            </div>
          )}

          <Link
            to="/ninos/$id"
            params={{ id: resumen.ninoId.replace(/[^0-9]/g, "").padStart(3, "0") || "001" }}
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            Abrir expediente clínico <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </aside>
    </>
  );
}
