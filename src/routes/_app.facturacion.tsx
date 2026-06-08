import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, FileText, Printer, FileSpreadsheet, Plus, ArrowRight } from "lucide-react";
import { sedesFact, calcularNino, tarifa, areaColor, type AreaFact, type NinoFact } from "@/lib/modulos-data";
import { loteDemo } from "@/lib/facturacion-inss";
import { lotesINSS } from "@/lib/demo-data";
import { CierreQuincenaPanel } from "@/components/facturacion/cierre-quincena";

export const Route = createFileRoute("/_app/facturacion")({
  head: () => ({ meta: [{ title: "Módulo de Facturación · CIE" }] }),
  component: Facturacion,
});

const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const anios = ["2025","2026"];

function Facturacion() {
  const [tab, setTab] = useState<"general" | "cierre">("general");
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
            General · Quincena {quincena === "Q1" ? "1 (1-15)" : "2 (16-30)"} · {mes} {anio}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-border/60">
        <button
          onClick={() => setTab("general")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "general"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Vista general
        </button>
        <button
          onClick={() => setTab("cierre")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "cierre"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Cierre de quincena
        </button>
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
      {tab === "cierre" && <CierreQuincenaPanel />}
    </div>
  );
}

function SedeBlock({ sede }: { sede: typeof sedesFact[number] }) {
  return (
    <section>
      <div className="flex items-baseline gap-2 mb-3 border-l-4 border-primary/70 pl-3">
        <h3 className="font-display text-lg">{sede.nombre}</h3>
        <span className="text-xs text-muted-foreground">{sede.ciudad} · {sede.ninos.length} {sede.ninos.length===1?"niño":"niños"}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {sede.ninos.map((n) => <NinoCard key={n.id} nino={n} />)}
      </div>
    </section>
  );
}

function NinoCard({ nino }: { nino: NinoFact }) {
  const r = calcularNino(nino);
  const alerta = r.tieneExcede && !nino.constancia;
  return (
    <article className={`rounded-2xl border bg-card p-4 ${alerta ? "border-[oklch(0.85_0.12_25)]" : "border-border/70"}`}>
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
