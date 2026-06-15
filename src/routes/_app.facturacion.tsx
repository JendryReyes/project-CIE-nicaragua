import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, FileText, Printer, FileSpreadsheet, Plus, ArrowRight, X } from "lucide-react";
import { sedesFact, calcularNino, tarifa, areaColor, type AreaFact, type NinoFact } from "@/lib/modulos-data";
import { loteDemo } from "@/lib/facturacion-inss";
import { lotesINSS } from "@/lib/demo-data";
import { CierreQuincenaPanel } from "@/components/facturacion/cierre-quincena";
import { CartasINSSPanel } from "@/components/facturacion/cartas-inss-panel";
import { BillingSummary } from "@/components/facturacion/billing-summary";
import { ComparativoQuincenasPanel } from "@/components/facturacion/comparativo-quincenas";

export const Route = createFileRoute("/_app/facturacion")({
  head: () => ({ meta: [{ title: "Módulo de Facturación · CIE" }] }),
  component: Facturacion,
});

const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const anios = ["2025","2026"];

function Facturacion() {
  const [tab, setTab] = useState<"general" | "admin" | "cierre" | "cartas" | "resumen">("admin");
  const [mes, setMes] = useState("Mayo");
  const [anio, setAnio] = useState("2026");
  const [quincena, setQuincena] = useState<"Q1" | "Q2">("Q2");
  const [sedeId, setSedeId] = useState<string>("todas");

  const sedesVisibles = useMemo(
    () => (sedeId === "todas" ? sedesFact : sedesFact.filter((s) => s.id === sedeId)),
    [sedeId]
  );

  const totales = useMemo(() => {
    let monto = 0, alertas = 0, niños = 0;
    for (const s of sedesVisibles) {
      for (const n of s.ninos) {
        niños++;
        const r = calcularNino(n);
        monto += r.total;
        if (r.tieneExcede && !n.constancia) alertas++;
      }
    }
    return { monto, alertas, niños };
  }, [sedesVisibles]);

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header + tabs */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Módulo de Facturación</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tab === "general" && `Vista general · Quincena ${quincena === "Q1" ? "1 (1-15)" : "2 (16-30)"} · ${mes} ${anio}`}
            {tab === "admin" && "Administración CIE · Comparativo Q1 vs Q2, excedentes y soportes INSS"}
            {tab === "cierre" && `Cierre de quincena · ${mes} ${anio}`}
            {tab === "cartas" && "Cartas INSS · Vigencia de aprobaciones semestrales"}
            {tab === "resumen" && "Resumen formal · Visitas, Reclamos, Remesas y Facturas"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-border/60">
        {([
          ["admin", "Administración (Comparativo Q1↔Q2)"],
          ["general", "Vista general"],
          ["cierre", "Cierre de quincena"],
          ["cartas", "Cartas INSS"],
          ["resumen", "Resumen formal (Billing)"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <GeneralTab
          mes={mes}
          setMes={setMes}
          anio={anio}
          setAnio={setAnio}
          quincena={quincena}
          setQuincena={setQuincena}
          sedeId={sedeId}
          setSedeId={setSedeId}
        />
      )}
      {tab === "admin" && <ComparativoQuincenasPanel />}
      {tab === "cierre" && <CierreQuincenaPanel />}
      {tab === "cartas" && <CartasINSSPanel />}
      {tab === "resumen" && <BillingSummary />}
    </div>
  );
}

function GeneralTab({
  mes,
  setMes,
  anio,
  setAnio,
  quincena,
  setQuincena,
  sedeId,
  setSedeId,
}: {
  mes: string;
  setMes: (v: string) => void;
  anio: string;
  setAnio: (v: string) => void;
  quincena: "Q1" | "Q2";
  setQuincena: (v: "Q1" | "Q2") => void;
  sedeId: string;
  setSedeId: (v: string) => void;
}) {
  const sedesVisibles = useMemo(
    () => (sedeId === "todas" ? sedesFact : sedesFact.filter((s) => s.id === sedeId)),
    [sedeId]
  );

  const totales = useMemo(() => {
    let monto = 0, alertas = 0, niños = 0;
    for (const s of sedesVisibles) {
      for (const n of s.ninos) {
        niños++;
        const r = calcularNino(n);
        monto += r.total;
        if (r.tieneExcede && !n.constancia) alertas++;
      }
    }
    return { monto, alertas, niños };
  }, [sedesVisibles]);

  const [detalle, setDetalle] = useState<NinoFact | null>(null);

  return (
    <div className="space-y-6">
      {/* Acciones */}
      <div className="flex items-center gap-2">
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 px-3 py-1.5 text-xs hover:bg-muted">
          <Printer className="h-3.5 w-3.5" /> Imprimir
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 px-3 py-1.5 text-xs hover:bg-muted">
          <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
        </button>
        <Link
          to="/facturacion/$loteId"
          params={{ loteId: loteDemo.id }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[oklch(0.55_0.16_155)] text-white px-3 py-1.5 text-xs font-medium hover:opacity-90"
        >
          <FileText className="h-3.5 w-3.5" /> Carta de cobro
        </Link>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-border/70 bg-card p-3 flex flex-wrap items-center gap-3 text-sm">
        <Field label="Mes">
          <select value={mes} onChange={(e)=>setMes(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1 text-sm">
            {meses.map((m)=> <option key={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="Año">
          <select value={anio} onChange={(e)=>setAnio(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1 text-sm">
            {anios.map((m)=> <option key={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="Quincena">
          <div className="inline-flex rounded-md border border-border overflow-hidden">
            <button onClick={()=>setQuincena("Q1")} className={`px-3 py-1 text-xs ${quincena==="Q1"?"bg-primary text-primary-foreground":"hover:bg-muted"}`}>1ra · 1-15</button>
            <button onClick={()=>setQuincena("Q2")} className={`px-3 py-1 text-xs ${quincena==="Q2"?"bg-primary text-primary-foreground":"hover:bg-muted"}`}>2da · 16-30</button>
          </div>
        </Field>
        <Field label="Sede">
          <select value={sedeId} onChange={(e)=>setSedeId(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1 text-sm">
            <option value="todas">Todas</option>
            {sedesFact.map((s)=> <option key={s.id} value={s.id}>{s.nombre} · {s.ciudad}</option>)}
          </select>
        </Field>
        <div className="ml-auto flex items-center gap-4 text-xs">
          <Legend color={areaColor.ABA} label={`ABA $${tarifa.ABA.toFixed(2)}`} />
          <Legend color={areaColor.Logo} label={`Logo $${tarifa.Logo.toFixed(2)}`} />
          <Legend color={areaColor.Fisio} label={`Fisio $${tarifa.Fisio.toFixed(2)}`} />
        </div>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Niños facturados" value={String(totales.niños)} />
        <Stat label="Total quincena" value={`$${totales.monto.toFixed(2)}`} accent />
        <Stat label="Excedentes sin constancia" value={String(totales.alertas)} warn={totales.alertas>0} />
        <Stat label="Sedes incluidas" value={String(sedesVisibles.length)} />
      </div>

      {/* Sedes agrupadas */}
      <div className="space-y-6">
        {sedesVisibles.map((s) => (
          <SedeBlock key={s.id} sede={s} onSelect={setDetalle} />
        ))}
      </div>

      {detalle && <DetalleNino nino={detalle} quincena={quincena} onClose={() => setDetalle(null)} />}

      {/* Lotes recientes (link rápido) */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/60">
          <h3 className="font-display text-base">Lotes recientes</h3>
          <Link to="/facturacion/$loteId" params={{ loteId: loteDemo.id }} className="text-xs text-primary hover:underline inline-flex items-center gap-1">
            Abrir lote en curso <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="divide-y divide-border/50 text-sm">
          {lotesINSS.slice(0, 4).map((l) => (
            <div key={l.id} className="flex items-center gap-4 px-4 py-2.5">
              <span className="font-medium tabular text-xs">{l.id}</span>
              <span className="text-muted-foreground text-xs flex-1">{l.periodo}</span>
              <span className="tabular text-xs text-muted-foreground">{l.horas}h · {l.ninos} niños</span>
              <span className="tabular font-display">${l.monto.toLocaleString()}</span>
              <span className="text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 bg-muted text-muted-foreground">{l.estado}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SedeBlock({ sede, onSelect }: { sede: typeof sedesFact[number]; onSelect: (n: NinoFact) => void }) {
  return (
    <section>
      <div className="flex items-baseline gap-2 mb-3 border-l-4 border-primary/70 pl-3">
        <h3 className="font-display text-lg">{sede.nombre}</h3>
        <span className="text-xs text-muted-foreground">{sede.ciudad} · {sede.ninos.length} {sede.ninos.length===1?"niño":"niños"}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {sede.ninos.map((n) => <NinoCard key={n.id} nino={n} onSelect={onSelect} />)}
      </div>
    </section>
  );
}

function NinoCard({ nino, onSelect }: { nino: NinoFact; onSelect: (n: NinoFact) => void }) {
  const r = calcularNino(nino);
  const alerta = r.tieneExcede && !nino.constancia;
  return (
    <article
      onClick={() => onSelect(nino)}
      className={`rounded-2xl border bg-card p-4 cursor-pointer transition hover:shadow-md hover:border-primary/40 ${alerta ? "border-[oklch(0.85_0.12_25)]" : "border-border/70"}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-10 w-10 shrink-0 rounded-full bg-muted grid place-items-center text-xs font-medium">{nino.iniciales}</div>
          <div className="min-w-0">
            <div className="font-medium truncate">{nino.nombre}</div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap mt-0.5">
              <span>{nino.expediente}</span>
              {nino.inss && <span className="rounded bg-[oklch(0.94_0.05_200)] text-[oklch(0.4_0.1_200)] px-1.5 py-0.5 text-[10px] font-medium">INSS</span>}
              {nino.privado && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">Privado</span>}
              {nino.codigoINSS && <span className="tabular">INSS: {nino.codigoINSS}</span>}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">total quincena</div>
          <div className="font-display text-xl tabular">${r.total.toFixed(2)}</div>
        </div>
      </header>

      <div className="mt-3 space-y-1.5">
        {r.detalles.map((d) => {
          const pct = d.aprobadas > 0 ? Math.min(100, ((d.q1 + d.facturables) / d.aprobadas) * 100) : 0;
          const pctQ1 = d.aprobadas > 0 ? (d.q1 / d.aprobadas) * 100 : 0;
          const exc = d.excede > 0;
          return (
            <div key={d.area} className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 w-14">
                <span className="h-2 w-2 rounded-full" style={{ background: areaColor[d.area as AreaFact] }} />
                {d.area}
              </span>
              <div className="relative flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-muted-foreground/30" style={{ width: `${pctQ1}%` }} />
                <div
                  className="absolute inset-y-0"
                  style={{
                    left: `${pctQ1}%`,
                    width: `${Math.max(0, pct - pctQ1)}%`,
                    background: exc ? "oklch(0.6 0.18 25)" : areaColor[d.area as AreaFact],
                  }}
                />
              </div>
              <span className="tabular w-10 text-right text-muted-foreground">{d.facturables}h</span>
              <span className="tabular w-14 text-right font-medium">${d.subtotal.toFixed(2)}</span>
            </div>
          );
        })}
      </div>

      {alerta && (
        <div className="mt-3 rounded-lg bg-[oklch(0.96_0.05_25)] border border-[oklch(0.85_0.12_25)] p-2.5 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[oklch(0.45_0.15_25)] font-medium">
            <AlertTriangle className="h-3.5 w-3.5" /> Excede – verificar constancia
          </span>
          <button className="inline-flex items-center gap-1 rounded-md bg-[oklch(0.6_0.18_25)] text-white px-2 py-1 text-[10px] font-medium hover:opacity-90">
            <Plus className="h-3 w-3" /> Registrar constancia
          </button>
        </div>
      )}
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
function Stat({ label, value, hint, accent, warn }: { label: string; value: string; hint?: string; accent?: boolean; warn?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${warn ? "border-[oklch(0.85_0.12_25)] bg-[oklch(0.98_0.03_25)]" : "border-border/70 bg-card"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-display text-2xl mt-1 tabular ${accent ? "text-primary" : ""} ${warn ? "text-[oklch(0.45_0.15_25)]" : ""}`}>{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}
