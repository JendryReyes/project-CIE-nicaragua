import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Minus,
  Printer,
  Stethoscope,
  ClipboardList,
  Ban,
  UserMinus,
  Receipt,
  Mail,
} from "lucide-react";
import { sedesFact, tarifa, areaColor, type AreaFact, type NinoFact } from "@/lib/modulos-data";

/**
 * Administración – Comparativo de Quincenas
 *
 * Refleja el proceso descrito por CIE Administración (Proceso de Facturación):
 *  - Comparar Q1 vs Q2 por niño / por área (horas, monto, cumplimiento vs aprobado INSS)
 *  - Alerta de excedente con validación de Constancia Médica
 *  - Reporte de horas no facturadas (Q2)
 *  - Reportes de servicios adicionales: Evaluaciones ADOS-2, Logopedia, Visitas escolares,
 *    Neuropediatría, Reevaluaciones BCBA.
 *  - Generación de Carta de cobro INSS, formato de facturación y recibo oficial de caja.
 *  - Reportes de suspensión horaria y baja de matrícula.
 */

type FilaComparativo = {
  nino: NinoFact;
  sede: string;
  area: AreaFact;
  aprobadas: number;
  q1Horas: number;
  q2Horas: number;
  q1Monto: number;
  q2Monto: number;
  deltaHoras: number;
  deltaMonto: number;
  excede: number;
  noFacturadas: number;
  constancia: boolean;
};

const SERVICIOS_OTROS = [
  {
    key: "ados",
    titulo: "Evaluaciones ADOS-2",
    icon: ClipboardList,
    costo: 150,
    items: [
      { nino: "Amaya Vanessa Ruiz Andino", inss: "41911389", fecha: "20/04/2026", area: "Diagnóstico SD CIE" },
      { nino: "Edward Alejandro Centeno Rivera", inss: "39109457", fecha: "23/04/2026", area: "Diagnóstico SD CIE" },
      { nino: "Matías Jared Ortiz Baldelomar", inss: "39002925", fecha: "16/04/2026", area: "IT Las Colinas" },
    ],
  },
  {
    key: "logo",
    titulo: "Evaluaciones de Logopedia",
    icon: ClipboardList,
    costo: 150,
    items: [
      { nino: "Marcelo Felipe Calero Olivas", inss: "38018626", fecha: "05/02/2026", area: "IT" },
      { nino: "Sophia Valentina Gómez Hernández", inss: "39458359", fecha: "05/02/2026", area: "IT Las Colinas" },
      { nino: "Santiago Andrés Munguía Dávila", inss: "44056380", fecha: "17/02/2026", area: "Transición Social" },
    ],
  },
  {
    key: "visitas",
    titulo: "Visitas Escolares",
    icon: Stethoscope,
    costo: 34,
    items: [
      { nino: "Maykel de Jesús Manzanarez Sirias", inss: "38024511", fecha: "04/05/2026", area: "IT León · 3h" },
      { nino: "Adhara Celeste Aranda Blandón", inss: "35834582", fecha: "05/05/2026", area: "Transición Académica · 3h" },
      { nino: "Alejandro Benjamín Narváez Pereira", inss: "32629440", fecha: "08/05/2026", area: "Transición Académica · 4h" },
    ],
  },
  {
    key: "reeval",
    titulo: "Reevaluaciones BCBA (EFL / ABLLS-R / VB-MAPP)",
    icon: ClipboardList,
    costo: 450,
    items: [
      { nino: "Juan Ramón López Peralta", inss: "37645126", fecha: "04/05/2026", area: "IT Estelí · Essential For Living" },
      { nino: "Valeria Sarahí Ramírez Castellón", inss: "37031631", fecha: "27/04/2026", area: "IT Estelí · ABLLS-R" },
      { nino: "César Nathanael Rivera Paut", inss: "37656964", fecha: "27/05/2026", area: "IT Estelí · VB-MAPP" },
    ],
  },
] as const;

const SUSPENSIONES = [
  { nino: "Gabriel Hernández", expediente: "IT · SD", desde: "12/05/2026", motivo: "Reposo médico", dias: 14 },
  { nino: "Sofía Ramírez", expediente: "TS · LC", desde: "20/05/2026", motivo: "Viaje familiar", dias: 8 },
];

const BAJAS = [
  { nino: "Andrés Mora", expediente: "PFA · Masaya", fecha: "01/05/2026", motivo: "Cambio de domicilio" },
  { nino: "Lucía Bermúdez", expediente: "IT · SD", fecha: "10/05/2026", motivo: "Alta clínica" },
];

export function ComparativoQuincenasPanel() {
  const [mes, setMes] = useState("Mayo");
  const [anio, setAnio] = useState("2026");
  const [sedeId, setSedeId] = useState("todas");
  const [soloExcedentes, setSoloExcedentes] = useState(false);

  const filas = useMemo<FilaComparativo[]>(() => {
    const sedes = sedeId === "todas" ? sedesFact : sedesFact.filter((s) => s.id === sedeId);
    const out: FilaComparativo[] = [];
    const areas: AreaFact[] = ["ABA", "Logo", "Fisio"];
    for (const s of sedes) {
      for (const n of s.ninos) {
        for (const a of areas) {
          const aprobadas = n.aprobadasMes[a] ?? 0;
          const q1 = n.q1[a] ?? 0;
          // Simulamos Q2 a partir de ejecQ (lo que está “por facturar” en la 2da quincena)
          const ejec = n.ejecQ[a] ?? 0;
          if (!aprobadas && !q1 && !ejec) continue;
          const restante = Math.max(0, aprobadas - q1);
          const q2Facturable = Math.min(ejec, restante);
          const excede = Math.max(0, ejec - restante);
          const noFact = excede; // si no hay constancia, queda como no facturada
          out.push({
            nino: n,
            sede: s.nombre,
            area: a,
            aprobadas,
            q1Horas: q1,
            q2Horas: q2Facturable,
            q1Monto: q1 * tarifa[a],
            q2Monto: q2Facturable * tarifa[a],
            deltaHoras: q2Facturable - q1,
            deltaMonto: (q2Facturable - q1) * tarifa[a],
            excede,
            noFacturadas: !n.constancia ? noFact : 0,
            constancia: !!n.constancia,
          });
        }
      }
    }
    return soloExcedentes ? out.filter((f) => f.excede > 0) : out;
  }, [sedeId, soloExcedentes]);

  const totales = useMemo(() => {
    const t = filas.reduce(
      (acc, f) => {
        acc.q1Horas += f.q1Horas;
        acc.q2Horas += f.q2Horas;
        acc.q1Monto += f.q1Monto;
        acc.q2Monto += f.q2Monto;
        acc.excedentes += f.excede;
        acc.noFact += f.noFacturadas;
        return acc;
      },
      { q1Horas: 0, q2Horas: 0, q1Monto: 0, q2Monto: 0, excedentes: 0, noFact: 0 }
    );
    return {
      ...t,
      deltaHoras: t.q2Horas - t.q1Horas,
      deltaMonto: t.q2Monto - t.q1Monto,
      pctMonto: t.q1Monto > 0 ? ((t.q2Monto - t.q1Monto) / t.q1Monto) * 100 : 0,
    };
  }, [filas]);

  return (
    <div className="space-y-6">
      {/* Acciones documentales */}
      <div className="flex flex-wrap items-center gap-2">
        <ActionBtn icon={FileText} label="Carta de cobro INSS" primary />
        <ActionBtn icon={FileSpreadsheet} label="Formato facturación" />
        <ActionBtn icon={Receipt} label="Recibo oficial de caja" />
        <ActionBtn icon={Mail} label="Adjuntos para INSS" />
        <ActionBtn icon={Printer} label="Imprimir comparativo" />
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-border/70 bg-card p-3 flex flex-wrap items-center gap-3 text-sm">
        <Field label="Mes">
          <select value={mes} onChange={(e) => setMes(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1 text-sm">
            {["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Field>
        <Field label="Año">
          <select value={anio} onChange={(e) => setAnio(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1 text-sm">
            <option>2025</option>
            <option>2026</option>
          </select>
        </Field>
        <Field label="Sede">
          <select value={sedeId} onChange={(e) => setSedeId(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1 text-sm">
            <option value="todas">Todas</option>
            {sedesFact.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre} · {s.ciudad}</option>
            ))}
          </select>
        </Field>
        <label className="ml-auto flex items-center gap-2 text-xs">
          <input type="checkbox" checked={soloExcedentes} onChange={(e) => setSoloExcedentes(e.target.checked)} />
          Mostrar solo excedentes
        </label>
      </div>

      {/* KPIs comparativos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI
          label="Horas Q1 vs Q2"
          q1={`${totales.q1Horas}h`}
          q2={`${totales.q2Horas}h`}
          delta={totales.deltaHoras}
          unidad="h"
        />
        <KPI
          label="Monto Q1 vs Q2"
          q1={`$${totales.q1Monto.toFixed(2)}`}
          q2={`$${totales.q2Monto.toFixed(2)}`}
          delta={totales.deltaMonto}
          unidad="$"
          pct={totales.pctMonto}
        />
        <Card>
          <Label>Excedentes detectados</Label>
          <Value warn={totales.excedentes > 0}>{totales.excedentes}h</Value>
          <Hint>Requieren constancia médica del mes anterior</Hint>
        </Card>
        <Card>
          <Label>Horas no facturadas (Q2)</Label>
          <Value warn={totales.noFact > 0}>{totales.noFact}h</Value>
          <Hint>Pasan a reporte separado para INSS</Hint>
        </Card>
      </div>

      {/* Tabla comparativo */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
          <h3 className="font-display text-base">
            Comparativo 1ra y 2da quincena · {mes} {anio}
          </h3>
          <span className="text-xs text-muted-foreground">
            {filas.length} filas · {new Set(filas.map((f) => f.nino.id)).size} niños
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <Th>Niño</Th>
                <Th>Sede</Th>
                <Th>Área</Th>
                <Th right>Aprob. INSS</Th>
                <Th right>Q1 h</Th>
                <Th right>Q2 h</Th>
                <Th right>Δ h</Th>
                <Th right>Q1 $</Th>
                <Th right>Q2 $</Th>
                <Th right>Δ $</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filas.map((f, i) => (
                <tr key={`${f.nino.id}-${f.area}-${i}`} className={f.excede > 0 && !f.constancia ? "bg-[oklch(0.98_0.03_25)]" : ""}>
                  <td className="px-3 py-2">
                    <div className="font-medium">{f.nino.nombre}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {f.nino.codigoINSS ?? "—"} · {f.nino.expediente}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{f.sede}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span className="h-2 w-2 rounded-full" style={{ background: areaColor[f.area] }} />
                      {f.area}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right tabular">{f.aprobadas}</td>
                  <td className="px-3 py-2 text-right tabular">{f.q1Horas}</td>
                  <td className="px-3 py-2 text-right tabular font-medium">{f.q2Horas}</td>
                  <td className="px-3 py-2 text-right tabular">
                    <Delta value={f.deltaHoras} />
                  </td>
                  <td className="px-3 py-2 text-right tabular text-muted-foreground">${f.q1Monto.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right tabular font-medium">${f.q2Monto.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right tabular">
                    <Delta value={f.deltaMonto} prefix="$" />
                  </td>
                  <td className="px-3 py-2">
                    {f.excede > 0 ? (
                      f.constancia ? (
                        <Badge tone="ok">Constancia OK</Badge>
                      ) : (
                        <Badge tone="warn">
                          <AlertTriangle className="h-3 w-3" /> Excede {f.excede}h
                        </Badge>
                      )
                    ) : (
                      <Badge tone="muted">Dentro de aprobado</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/40">
              <tr>
                <td className="px-3 py-2 font-medium" colSpan={3}>Totales</td>
                <td className="px-3 py-2 text-right tabular">—</td>
                <td className="px-3 py-2 text-right tabular">{totales.q1Horas}</td>
                <td className="px-3 py-2 text-right tabular font-semibold">{totales.q2Horas}</td>
                <td className="px-3 py-2 text-right tabular"><Delta value={totales.deltaHoras} /></td>
                <td className="px-3 py-2 text-right tabular text-muted-foreground">${totales.q1Monto.toFixed(2)}</td>
                <td className="px-3 py-2 text-right tabular font-semibold">${totales.q2Monto.toFixed(2)}</td>
                <td className="px-3 py-2 text-right tabular"><Delta value={totales.deltaMonto} prefix="$" /></td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {totales.pctMonto >= 0 ? "+" : ""}
                  {totales.pctMonto.toFixed(1)}% vs Q1
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Otros servicios facturables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {SERVICIOS_OTROS.map((svc) => {
          const total = svc.items.length * svc.costo;
          return (
            <section key={svc.key} className="rounded-2xl border border-border/70 bg-card overflow-hidden">
              <header className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
                <h4 className="font-display text-sm inline-flex items-center gap-2">
                  <svc.icon className="h-4 w-4 text-primary" /> {svc.titulo}
                </h4>
                <span className="text-xs text-muted-foreground">
                  {svc.items.length} × ${svc.costo} = <strong className="text-foreground">${total.toFixed(2)}</strong>
                </span>
              </header>
              <ul className="divide-y divide-border/50 text-sm">
                {svc.items.map((it) => (
                  <li key={it.nino} className="px-4 py-2 flex items-center gap-3">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.6_0.16_155)] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{it.nino}</div>
                      <div className="text-[10px] text-muted-foreground">
                        INSS {it.inss} · {it.fecha} · {it.area}
                      </div>
                    </div>
                    <span className="text-xs tabular">${svc.costo.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {/* Reportes administrativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReporteCard
          icon={Ban}
          title="Suspensión horaria"
          subtitle="No genera planificación durante la suspensión"
          rows={SUSPENSIONES.map((s) => ({
            primary: s.nino,
            secondary: `${s.expediente} · desde ${s.desde} · ${s.motivo}`,
            badge: `${s.dias} días`,
          }))}
        />
        <ReporteCard
          icon={UserMinus}
          title="Baja de matrícula"
          subtitle="Status cambia para que no genere planificación horaria"
          rows={BAJAS.map((b) => ({
            primary: b.nino,
            secondary: `${b.expediente} · ${b.fecha}`,
            badge: b.motivo,
          }))}
        />
      </div>

      {/* Soportes para INSS */}
      <div className="rounded-2xl border border-border/70 bg-card p-4">
        <h3 className="font-display text-base mb-3">Adjuntos para envío al INSS</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {[
            "Carta de cobro al INSS firmada por BCBA Beatriz Urcuyo",
            "Excel detallado de los servicios",
            "Solvencia fiscal del período",
            "Certificación de Proveedores del Estado actualizada",
            "Cartas de aprobación INSS de cada niño facturado",
            "Asistencia física (ABA, Fisio, Logo, Visitas escolares)",
            "Recibos de conformidad (Otros servicios)",
            "Constancias médicas que justifican excedentes",
          ].map((it) => (
            <li key={it} className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-[oklch(0.6_0.16_155)] shrink-0" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* -------- subcomponentes -------- */

function ActionBtn({ icon: Icon, label, primary }: { icon: any; label: string; primary?: boolean }) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
        primary
          ? "bg-[oklch(0.55_0.16_155)] text-white hover:opacity-90"
          : "border border-border/70 hover:bg-muted"
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
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

function KPI({
  label, q1, q2, delta, unidad, pct,
}: { label: string; q1: string; q2: string; delta: number; unidad: string; pct?: number }) {
  const up = delta > 0;
  const down = delta < 0;
  return (
    <Card>
      <Label>{label}</Label>
      <div className="flex items-end justify-between gap-2 mt-1">
        <div>
          <div className="text-[10px] uppercase text-muted-foreground">Q1</div>
          <div className="font-display text-lg tabular text-muted-foreground">{q1}</div>
        </div>
        <div className="text-muted-foreground">→</div>
        <div className="text-right">
          <div className="text-[10px] uppercase text-muted-foreground">Q2</div>
          <div className="font-display text-2xl tabular">{q2}</div>
        </div>
      </div>
      <div className={`mt-2 inline-flex items-center gap-1 text-xs ${up ? "text-[oklch(0.5_0.15_155)]" : down ? "text-[oklch(0.55_0.18_25)]" : "text-muted-foreground"}`}>
        {up ? <ArrowUpRight className="h-3 w-3" /> : down ? <ArrowDownRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
        {delta >= 0 ? "+" : ""}
        {unidad === "$" ? `$${delta.toFixed(2)}` : `${delta}${unidad}`}
        {typeof pct === "number" && <span className="text-muted-foreground">({pct >= 0 ? "+" : ""}{pct.toFixed(1)}%)</span>}
      </div>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border/70 bg-card p-4">{children}</div>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{children}</div>;
}
function Value({ children, warn }: { children: React.ReactNode; warn?: boolean }) {
  return <div className={`font-display text-2xl mt-1 tabular ${warn ? "text-[oklch(0.55_0.18_25)]" : ""}`}>{children}</div>;
}
function Hint({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] text-muted-foreground mt-0.5">{children}</div>;
}
function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th className={`px-3 py-2 font-medium ${right ? "text-right" : "text-left"}`}>{children}</th>;
}
function Delta({ value, prefix = "" }: { value: number; prefix?: string }) {
  if (value === 0) return <span className="text-muted-foreground">—</span>;
  const up = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 ${up ? "text-[oklch(0.5_0.15_155)]" : "text-[oklch(0.55_0.18_25)]"}`}>
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {value > 0 ? "+" : ""}
      {prefix}
      {prefix === "$" ? Math.abs(value).toFixed(2) : value}
    </span>
  );
}
function Badge({ tone, children }: { tone: "ok" | "warn" | "muted"; children: React.ReactNode }) {
  const cls =
    tone === "ok"
      ? "bg-[oklch(0.94_0.06_155)] text-[oklch(0.35_0.13_155)]"
      : tone === "warn"
      ? "bg-[oklch(0.95_0.06_25)] text-[oklch(0.45_0.15_25)]"
      : "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cls}`}>
      {children}
    </span>
  );
}
function ReporteCard({
  icon: Icon, title, subtitle, rows,
}: {
  icon: any;
  title: string;
  subtitle: string;
  rows: { primary: string; secondary: string; badge: string }[];
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card overflow-hidden">
      <header className="px-4 py-3 border-b border-border/60">
        <h4 className="font-display text-sm inline-flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" /> {title}
        </h4>
        <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
      </header>
      <ul className="divide-y divide-border/50 text-sm">
        {rows.map((r) => (
          <li key={r.primary} className="px-4 py-2 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="truncate">{r.primary}</div>
              <div className="text-[10px] text-muted-foreground">{r.secondary}</div>
            </div>
            <span className="text-[10px] uppercase tracking-wider rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
              {r.badge}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
