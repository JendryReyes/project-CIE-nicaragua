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
  X,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
} from "lucide-react";
import { sedesFact, tarifa, areaColor, type AreaFact, type NinoFact } from "@/lib/modulos-data";
import { descargarCartaInstitucional, type FilaCobro } from "@/lib/carta-cobro-institucional";
import { descargarCartaCobroCaso, descargarReciboCaja, type CasoDoc } from "@/lib/carta-cobro-caso";
import {
  descargarFormatoFacturacion,
  descargarReciboOficialConsolidado,
  descargarCaratulaAdjuntos,
  type DocsCtx,
} from "@/lib/docs-comparativo";
import { cumplimientoColillas, colillasResumen } from "@/lib/colillas-inss";
import { Send, Download } from "lucide-react";

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
  totalHoras: number;
  totalMonto: number;
  brecha: number;          // aprobadas - (q1+q2)
  cobertura: number;       // (q1+q2)/aprobadas * 100
  deltaHoras: number;
  deltaMonto: number;
  excede: number;
  noFacturadas: number;
  constancia: boolean;
  estado: "completa" | "parcial" | "excedente" | "pendienteQ2";
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
  const [detalle, setDetalle] = useState<FilaComparativo | null>(null);
  const [brechaOverrides, setBrechaOverrides] = useState<Record<string, number>>({});
  const brechaKey = (f: FilaComparativo) => `${f.nino.id}-${f.area}`;
  const getBrecha = (f: FilaComparativo) => brechaOverrides[brechaKey(f)] ?? f.brecha;

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
          const totalHoras = q1 + q2Facturable;
          const totalMonto = totalHoras * tarifa[a];
          const brecha = aprobadas - totalHoras;
          const cobertura = aprobadas > 0 ? (totalHoras / aprobadas) * 100 : 0;
          let estado: FilaComparativo["estado"] = "completa";
          if (excede > 0) estado = "excedente";
          else if (q1 === 0 || q2Facturable === 0) estado = "pendienteQ2";
          else if (brecha > 0) estado = "parcial";
          out.push({
            nino: n,
            sede: s.nombre,
            area: a,
            aprobadas,
            q1Horas: q1,
            q2Horas: q2Facturable,
            q1Monto: q1 * tarifa[a],
            q2Monto: q2Facturable * tarifa[a],
            totalHoras,
            totalMonto,
            brecha,
            cobertura,
            deltaHoras: q2Facturable - q1,
            deltaMonto: (q2Facturable - q1) * tarifa[a],
            excede,
            noFacturadas: !n.constancia ? noFact : 0,
            constancia: !!n.constancia,
            estado,
          });
        }
      }
    }
    return soloExcedentes ? out.filter((f) => f.excede > 0) : out;
  }, [sedeId, soloExcedentes]);

  const totales = useMemo(() => {
    const t = filas.reduce(
      (acc, f) => {
        acc.aprobadas += f.aprobadas;
        acc.q1Horas += f.q1Horas;
        acc.q2Horas += f.q2Horas;
        acc.q1Monto += f.q1Monto;
        acc.q2Monto += f.q2Monto;
        acc.excedentes += f.excede;
        acc.noFact += f.noFacturadas;
        return acc;
      },
      { aprobadas: 0, q1Horas: 0, q2Horas: 0, q1Monto: 0, q2Monto: 0, excedentes: 0, noFact: 0 }
    );
    const totalHoras = t.q1Horas + t.q2Horas;
    const totalMonto = t.q1Monto + t.q2Monto;
    const brecha = t.aprobadas - totalHoras;
    return {
      ...t,
      totalHoras,
      totalMonto,
      brecha,
      cobertura: t.aprobadas > 0 ? (totalHoras / t.aprobadas) * 100 : 0,
      deltaHoras: t.q2Horas - t.q1Horas,
      deltaMonto: t.q2Monto - t.q1Monto,
      pctMonto: t.q1Monto > 0 ? ((t.q2Monto - t.q1Monto) / t.q1Monto) * 100 : 0,
    };
  }, [filas]);

  const excedentesSinConstancia = filas.filter((f) => f.excede > 0 && !f.constancia);
  const colillasKpi = colillasResumen();

  const filasCobro: FilaCobro[] = filas.map((f) => ({
    nino: f.nino.nombre,
    codigoINSS: f.nino.codigoINSS,
    sede: f.sede,
    area: f.area,
    aprobadas: f.aprobadas,
    q1Horas: f.q1Horas,
    q2Horas: f.q2Horas,
    totalHoras: f.totalHoras,
    brecha: f.brecha,
    totalMonto: f.totalMonto,
    excede: f.excede,
    constancia: f.constancia,
  }));

  const sedeNombre = sedeId === "todas" ? "Todas las sedes" : (sedesFact.find((s) => s.id === sedeId)?.nombre ?? sedeId);

  const ctxDocs: DocsCtx = {
    mes, anio, sede: sedeNombre, filas: filasCobro,
    totales: {
      totalHoras: totales.totalHoras,
      totalMonto: totales.totalMonto,
      aprobadas: totales.aprobadas,
      cobertura: totales.cobertura,
      excedentes: totales.excedentes,
    },
  };

  const handleCartaCobro = () => {
    descargarCartaInstitucional({
      mes, anio, sede: sedeNombre, filas: filasCobro,
      totales: {
        aprobadas: totales.aprobadas,
        q1Horas: totales.q1Horas,
        q2Horas: totales.q2Horas,
        totalHoras: totales.totalHoras,
        totalMonto: totales.totalMonto,
        excedentes: totales.excedentes,
        cobertura: totales.cobertura,
      },
    });
  };

  const [envioGlobal, setEnvioGlobal] = useState<null | { estado: "confirm" | "enviando" | "enviado"; folio?: string }>(null);
  const iniciarEnvioGlobal = () => setEnvioGlobal({ estado: "confirm" });
  const confirmarEnvioGlobal = () => {
    setEnvioGlobal({ estado: "enviando" });
    setTimeout(() => {
      const folio = `INSS-CIE-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      setEnvioGlobal({ estado: "enviado", folio });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Alerta automática de excedentes */}
      {excedentesSinConstancia.length > 0 && (
        <div className="rounded-2xl border border-[oklch(0.7_0.15_25/0.4)] bg-[oklch(0.97_0.04_25)] p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-[oklch(0.55_0.18_25)] mt-0.5 shrink-0" />
          <div className="flex-1 text-sm">
            <div className="font-medium text-[oklch(0.4_0.15_25)]">
              Alerta automática · {excedentesSinConstancia.length} caso{excedentesSinConstancia.length === 1 ? "" : "s"} excede{excedentesSinConstancia.length === 1 ? "" : "n"} las horas aprobadas
            </div>
            <div className="text-[oklch(0.4_0.12_25)] mt-0.5 flex flex-wrap gap-x-2 gap-y-1">
              {excedentesSinConstancia.slice(0, 5).map((f, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setDetalle(f)}
                  className="underline underline-offset-2 hover:text-[oklch(0.3_0.18_25)] transition-colors text-left"
                  title="Ver detalle del caso"
                >
                  {f.nino.nombre} ({f.area}: +{f.excede}h)
                </button>
              ))}
              {excedentesSinConstancia.length > 5 && (
                <span className="text-[oklch(0.45_0.1_25)]">+{excedentesSinConstancia.length - 5} más</span>
              )}
            </div>
            <div className="text-[11px] text-[oklch(0.45_0.1_25)] mt-1">
              Estas horas no se facturan al INSS hasta que la familia presente constancia médica que las justifique.
            </div>
          </div>
        </div>
      )}

      {/* Acciones documentales */}
      <div className="flex flex-wrap items-center gap-2">
        <ActionBtn icon={Send} label="Enviar al INSS" primary onClick={iniciarEnvioGlobal} />
        <ActionBtn icon={FileText} label="Carta de cobro INSS (PDF)" onClick={handleCartaCobro} />
        <ActionBtn icon={FileSpreadsheet} label="Formato facturación (PDF)" onClick={() => descargarFormatoFacturacion(ctxDocs)} />
        <ActionBtn icon={Receipt} label="Recibo oficial de caja (PDF)" onClick={() => descargarReciboOficialConsolidado(ctxDocs)} />
        <ActionBtn icon={Mail} label="Carátula adjuntos (PDF)" onClick={() => descargarCaratulaAdjuntos(ctxDocs)} />
        <ActionBtn icon={Printer} label="Imprimir comparativo" onClick={() => window.print()} />
      </div>

      {envioGlobal && (
        <EnvioINSSGlobalModal
          estado={envioGlobal.estado}
          folio={envioGlobal.folio}
          ctx={ctxDocs}
          onConfirm={confirmarEnvioGlobal}
          onClose={() => setEnvioGlobal(null)}
        />
      )}


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
          <Label>Total mes · Q1 + Q2 (complemento)</Label>
          <div className="mt-1 flex items-end justify-between gap-2">
            <div>
              <div className="text-[10px] uppercase text-muted-foreground">Aprobado INSS</div>
              <div className="font-display text-lg tabular text-muted-foreground">{totales.aprobadas}h</div>
            </div>
            <div className="text-muted-foreground">→</div>
            <div className="text-right">
              <div className="text-[10px] uppercase text-muted-foreground">Ejecutado</div>
              <div className="font-display text-2xl tabular">{totales.totalHoras}h</div>
            </div>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full"
              style={{
                width: `${Math.min(100, totales.cobertura)}%`,
                background:
                  totales.cobertura >= 95
                    ? "oklch(0.6 0.16 155)"
                    : totales.cobertura >= 70
                    ? "oklch(0.7 0.14 80)"
                    : "oklch(0.65 0.18 25)",
              }}
            />
          </div>
          <Hint>
            Cobertura {totales.cobertura.toFixed(1)}% · Brecha {totales.brecha >= 0 ? "" : "+"}
            {Math.abs(totales.brecha)}h · Monto ${totales.totalMonto.toFixed(2)}
          </Hint>
        </Card>
        <Card>
          <Label>Excedentes / no facturadas</Label>
          <div className="flex items-baseline gap-3 mt-1">
            <Value warn={totales.excedentes > 0}>{totales.excedentes}h</Value>
            <span className="text-xs text-muted-foreground">excedente</span>
          </div>
          <Hint>
            {totales.noFact}h sin facturar · pasan a reporte INSS si no hay constancia
          </Hint>
        </Card>
      </div>

      {/* Tabla comparativo */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
          <h3 className="font-display text-base">
            Comparativo Periodo 1 y Periodo 2 · {mes} {anio}
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
                <Th>Área</Th>
                <Th right>Aprob.</Th>
                <Th right>P1 h</Th>
                <Th right>P2 h</Th>
                <Th right>Δ P1↔P2</Th>
                <Th right>Total mes</Th>
                <Th right>Brecha</Th>
                <Th>Cobertura</Th>
                <Th right>Total $</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filas.map((f, i) => (
                <tr
                  key={`${f.nino.id}-${f.area}-${i}`}
                  onClick={() => setDetalle(f)}
                  className={`cursor-pointer transition-colors hover:bg-muted/40 ${f.excede > 0 && !f.constancia ? "bg-[oklch(0.98_0.03_25)]" : ""}`}
                  title="Ver detalle"
                >
                  <td className="px-3 py-2">
                    <div className="font-medium underline-offset-2 hover:underline">{f.nino.nombre}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {f.nino.codigoINSS ?? "—"} · {f.sede}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span className="h-2 w-2 rounded-full" style={{ background: areaColor[f.area] }} />
                      {f.area}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right tabular">{f.aprobadas}</td>
                  <td className="px-3 py-2 text-right tabular text-muted-foreground">{f.q1Horas}</td>
                  <td className="px-3 py-2 text-right tabular text-muted-foreground">{f.q2Horas}</td>
                  <td className="px-3 py-2 text-right tabular">
                    <Delta value={f.deltaHoras} />
                  </td>
                  <td className="px-3 py-2 text-right tabular font-semibold">{f.totalHoras}</td>
                  <td className="px-3 py-2 text-right tabular" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        value={getBrecha(f)}
                        onChange={(e) =>
                          setBrechaOverrides((p) => ({ ...p, [brechaKey(f)]: Number(e.target.value) }))
                        }
                        className="w-14 h-7 rounded-md border border-border/70 bg-background px-1.5 text-right tabular text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        title="Editar horas restantes"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setBrechaOverrides((p) => ({ ...p, [brechaKey(f)]: 0 }))
                        }
                        className="text-muted-foreground hover:text-foreground p-0.5 rounded hover:bg-muted"
                        title="Eliminar restante"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2 w-[120px]">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            width: `${Math.min(100, f.cobertura)}%`,
                            background:
                              f.cobertura >= 95
                                ? "oklch(0.6 0.16 155)"
                                : f.cobertura >= 70
                                ? "oklch(0.7 0.14 80)"
                                : "oklch(0.65 0.18 25)",
                          }}
                        />
                      </div>
                      <span className="text-[10px] tabular text-muted-foreground w-10 text-right">
                        {f.cobertura.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right tabular font-medium">${f.totalMonto.toFixed(2)}</td>
                  <td className="px-3 py-2">
                    {f.estado === "excedente" ? (
                      f.constancia ? (
                        <Badge tone="ok">Constancia OK · +{f.excede}h</Badge>
                      ) : (
                        <Badge tone="warn">
                          <AlertTriangle className="h-3 w-3" /> Excede {f.excede}h
                        </Badge>
                      )
                    ) : f.estado === "completa" ? (
                      <Badge tone="ok">Q1+Q2 = Aprobado</Badge>
                    ) : f.estado === "pendienteQ2" ? (
                      <Badge tone="muted">Pendiente {f.q1Horas === 0 ? "Q1" : "Q2"}</Badge>
                    ) : (
                      <Badge tone="muted">Parcial · faltan {f.brecha}h</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/40">
              <tr>
                <td className="px-3 py-2 font-medium" colSpan={2}>Totales</td>
                <td className="px-3 py-2 text-right tabular">{totales.aprobadas}</td>
                <td className="px-3 py-2 text-right tabular text-muted-foreground">{totales.q1Horas}</td>
                <td className="px-3 py-2 text-right tabular text-muted-foreground">{totales.q2Horas}</td>
                <td className="px-3 py-2 text-right tabular"><Delta value={totales.deltaHoras} /></td>
                <td className="px-3 py-2 text-right tabular font-semibold">{totales.totalHoras}</td>
                <td className="px-3 py-2 text-right tabular">
                  {(() => {
                    const b = filas.reduce((a, f) => a + getBrecha(f), 0);
                    if (b === 0) return <span className="text-muted-foreground">—</span>;
                    if (b > 0) return <span className="text-[oklch(0.55_0.14_80)]">−{b}h</span>;
                    return <span className="text-[oklch(0.55_0.18_25)]">+{Math.abs(b)}h</span>;
                  })()}
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{totales.cobertura.toFixed(1)}%</td>
                <td className="px-3 py-2 text-right tabular font-semibold">${totales.totalMonto.toFixed(2)}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {totales.pctMonto >= 0 ? "+" : ""}
                  {totales.pctMonto.toFixed(1)}% P2 vs P1
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

      {/* Reporte de cumplimiento de Colillas INSS */}
      <section className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <header className="px-4 py-3 border-b border-border/60 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-display text-base inline-flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              Reporte de cumplimiento · Colillas INSS
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Aportes vigentes de los cotizantes responsables (últimos 6 meses)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span><strong className="text-foreground tabular">{colillasKpi.alDia}</strong> / {colillasKpi.total} al día</span>
            {colillasKpi.pendientes > 0 && (
              <span className="text-[oklch(0.55_0.15_25)]">
                <AlertTriangle className="inline h-3 w-3 mr-0.5" />
                {colillasKpi.pendientes} colillas pendientes
              </span>
            )}
            {colillasKpi.proximaVencer > 0 && (
              <span className="text-[oklch(0.55_0.14_80)]">
                {colillasKpi.proximaVencer} aprobación{colillasKpi.proximaVencer === 1 ? "" : "es"} por vencer
              </span>
            )}
          </div>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <Th>Beneficiario</Th>
                <Th>Cotizante / Empresa</Th>
                <Th>Nº Afiliado</Th>
                <Th>Últimos 6 meses</Th>
                <Th>Vigencia aprobación</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {cumplimientoColillas.map((c) => {
                const faltantes = c.colillas.filter((m) => !m.recibida).length;
                const ok = faltantes === 0;
                return (
                  <tr key={c.ninoId}>
                    <td className="px-3 py-2">
                      <div className="font-medium">{c.ninoNombre}</div>
                      <div className="text-[10px] text-muted-foreground">INSS {c.codigoINSS}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div>{c.cotizante}</div>
                      <div className="text-[10px] text-muted-foreground">{c.empresa}</div>
                    </td>
                    <td className="px-3 py-2 tabular text-xs">{c.numeroAfiliado}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        {c.colillas.map((m, i) => (
                          <span
                            key={i}
                            title={`${m.mes} ${m.anio}${m.recibida ? ` · ${m.fechaCarga}` : ` · ${m.observacion ?? "pendiente"}`}`}
                            className={`h-5 w-7 rounded text-[9px] grid place-items-center font-medium ${
                              m.recibida
                                ? "bg-[oklch(0.92_0.08_155)] text-[oklch(0.35_0.13_155)]"
                                : "bg-[oklch(0.94_0.06_25)] text-[oklch(0.45_0.15_25)]"
                            }`}
                          >
                            {m.mes.substring(0, 3)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs tabular">{c.vigenciaAprobacion}</td>
                    <td className="px-3 py-2">
                      {ok ? (
                        <Badge tone="ok">
                          <CheckCircle2 className="h-3 w-3" /> Al día 6/6
                        </Badge>
                      ) : (
                        <Badge tone="warn">
                          <AlertTriangle className="h-3 w-3" /> Faltan {faltantes}
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>


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

      {detalle && <DetalleFila fila={detalle} mes={mes} anio={anio} onClose={() => setDetalle(null)} />}
    </div>
  );
}

function DetalleFila({ fila, mes, anio, onClose }: { fila: FilaComparativo; mes: string; anio: string; onClose: () => void }) {
  const f = fila;
  const sesionesQ1 = Math.max(1, Math.round(f.q1Horas / 2));
  const sesionesQ2 = Math.max(0, Math.round(f.q2Horas / 2));
  const tarifaHora = tarifa[f.area];
  const horasSesion = f.area === "ABA" ? "2h" : "1h";
  const dias = f.area === "ABA" ? "L–V" : f.area === "Logo" ? "M y J" : "L y X";

  const caso: CasoDoc = {
    nino: f.nino.nombre,
    codigoINSS: f.nino.codigoINSS,
    sede: f.sede,
    area: f.area,
    mes,
    anio,
    aprobadas: f.aprobadas,
    q1Horas: f.q1Horas,
    q2Horas: f.q2Horas,
    totalHoras: f.totalHoras,
    q1Monto: f.q1Monto,
    q2Monto: f.q2Monto,
    totalMonto: f.totalMonto,
    tarifaHora,
    excede: f.excede,
    constancia: f.constancia,
    cobertura: f.cobertura,
    sesionesQ1,
    sesionesQ2,
  };

  const [envio, setEnvio] = useState<null | { estado: "confirm" | "enviando" | "enviado"; folio?: string }>(null);
  const [excedeEdit, setExcedeEdit] = useState<number>(f.excede);

  const iniciarEnvio = () => setEnvio({ estado: "confirm" });
  const confirmarEnvio = () => {
    setEnvio({ estado: "enviando" });
    setTimeout(() => {
      const folio = `INSS-CIE-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      setEnvio({ estado: "enviado", folio });
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <aside
        className="h-full w-full max-w-xl overflow-y-auto bg-background border-l border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border/70 bg-background/95 backdrop-blur p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: areaColor[f.area] }} />
              <h3 className="font-display text-lg truncate">{f.nino.nombre}</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              INSS {f.nino.codigoINSS ?? "—"} · {f.sede} · {f.area} · {mes} {anio}
            </p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-muted text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="p-4 space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3">
            <MiniCard icon={Activity} label="Aprobadas INSS" value={`${f.aprobadas}h`} hint={`${(f.aprobadas / 2).toFixed(0)} sesiones plan`} />
            <MiniCard icon={TrendingUp} label="Ejecutadas Q1+Q2" value={`${f.totalHoras}h`} hint={`Cobertura ${f.cobertura.toFixed(1)}%`} />
            <MiniCard icon={DollarSign} label="Total facturable" value={`$${f.totalMonto.toFixed(2)}`} hint={`Tarifa $${tarifaHora}/h`} />
            {f.excede > 0 ? (
              <div className={`rounded-2xl border p-3 ${excedeEdit > 0 && !f.constancia ? "border-[oklch(0.7_0.15_25/0.4)] bg-[oklch(0.98_0.03_25)]" : "border-border/70 bg-card"}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {excedeEdit > 0 ? "Excedente" : "Sin excedente"}
                  </div>
                  {excedeEdit > 0 && (
                    <button
                      type="button"
                      onClick={() => setExcedeEdit(0)}
                      className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      title="Eliminar excedente"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className={`font-display text-2xl tabular ${excedeEdit > 0 && !f.constancia ? "text-[oklch(0.55_0.18_25)]" : ""}`}>+</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={excedeEdit}
                    onChange={(e) => setExcedeEdit(Math.max(0, Number(e.target.value) || 0))}
                    className={`w-16 bg-transparent font-display text-2xl tabular outline-none border-b border-dashed border-border focus:border-foreground ${excedeEdit > 0 && !f.constancia ? "text-[oklch(0.55_0.18_25)]" : ""}`}
                  />
                  <span className="text-sm text-muted-foreground">h</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  {excedeEdit === 0 ? "Excedente descartado" : f.constancia ? "Justificado por constancia médica" : "Sin constancia médica"}
                </div>
              </div>
            ) : (
              <MiniCard
                icon={AlertTriangle}
                label="Brecha"
                value={f.brecha > 0 ? `−${f.brecha}h` : "0h"}
                hint={f.brecha > 0 ? "Pendiente por completar" : "Ejecución completa"}
                tone={f.brecha > 0 ? "muted" : "ok"}
              />
            )}
          </div>

          {/* Comparativo Q1 vs Q2 */}
          <section className="rounded-2xl border border-border/70 p-4">
            <h4 className="font-display text-sm mb-3 inline-flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Detalle por periodo
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <QuincenaCol titulo="Periodo 1" sub={`01–15 ${mes}`} horas={f.q1Horas} sesiones={sesionesQ1} monto={f.q1Monto} tarifaHora={tarifaHora} />
              <QuincenaCol titulo="Periodo 2" sub={`16–${["Febrero"].includes(mes) ? 28 : 30} ${mes}`} horas={f.q2Horas} sesiones={sesionesQ2} monto={f.q2Monto} tarifaHora={tarifaHora} excede={f.excede} />
            </div>
            <div className="mt-3 border-t border-border/60 pt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Δ Periodo 2 vs Periodo 1</span>
              <Delta value={f.deltaHoras} />
            </div>
          </section>

          {/* Cobertura */}
          <section className="rounded-2xl border border-border/70 p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium">Cobertura mensual</span>
              <span className="tabular text-muted-foreground">
                {f.totalHoras} / {f.aprobadas}h · {f.cobertura.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full"
                style={{
                  width: `${Math.min(100, f.cobertura)}%`,
                  background:
                    f.cobertura >= 95
                      ? "oklch(0.6 0.16 155)"
                      : f.cobertura >= 70
                      ? "oklch(0.7 0.14 80)"
                      : "oklch(0.65 0.18 25)",
                }}
              />
            </div>
            {f.excede > 0 && (
              <div className={`mt-3 rounded-lg p-3 text-xs flex items-start gap-2 ${f.constancia ? "bg-[oklch(0.95_0.05_155)] text-[oklch(0.35_0.13_155)]" : "bg-[oklch(0.95_0.06_25)] text-[oklch(0.45_0.15_25)]"}`}>
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium">
                    {f.constancia ? "Excedente respaldado" : "Excedente sin respaldo"} · +{f.excede}h
                  </div>
                  <div className="opacity-90 mt-0.5">
                    {f.constancia
                      ? "Constancia médica adjunta — se incluyen en la factura del INSS."
                      : "No se facturan al INSS hasta que la familia aporte constancia médica."}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Plan & sesiones */}
          <section className="rounded-2xl border border-border/70 p-4">
            <h4 className="font-display text-sm mb-3">Plan terapéutico</h4>
            <dl className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
              <Dt>Área</Dt><Dd>{f.area === "ABA" ? "Análisis Conductual Aplicado" : f.area === "Logo" ? "Logopedia" : "Fisioterapia"}</Dd>
              <Dt>Sesiones/sem</Dt><Dd>{dias} · {horasSesion}</Dd>
              <Dt>Tarifa INSS</Dt><Dd>${tarifaHora.toFixed(2)} / hora</Dd>
              <Dt>Sesiones Periodo 1</Dt><Dd>{sesionesQ1} sesiones</Dd>
              <Dt>Sesiones Periodo 2</Dt><Dd>{sesionesQ2} sesiones</Dd>
              <Dt>Constancia</Dt><Dd>{f.constancia ? "Sí, adjunta" : "No registrada"}</Dd>
            </dl>
          </section>

          {/* Acciones */}
          <div className="flex flex-wrap gap-2 pt-2">
            <ActionBtn icon={Send} label="Enviar al INSS" primary onClick={iniciarEnvio} />
            <ActionBtn icon={Download} label="Carta de cobro (PDF)" onClick={() => descargarCartaCobroCaso(caso)} />
            <ActionBtn icon={Receipt} label="Recibo de caja (PDF)" onClick={() => descargarReciboCaja(caso)} />
            <ActionBtn icon={Printer} label="Imprimir" onClick={() => window.print()} />
          </div>
        </div>

        {envio && (
          <EnvioINSSModal
            estado={envio.estado}
            folio={envio.folio}
            caso={caso}
            onConfirm={confirmarEnvio}
            onClose={() => setEnvio(null)}
          />
        )}
      </aside>
    </div>
  );
}

function EnvioINSSGlobalModal({
  estado,
  folio,
  ctx,
  onConfirm,
  onClose,
}: {
  estado: "confirm" | "enviando" | "enviado";
  folio?: string;
  ctx: DocsCtx;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-background border border-border shadow-2xl p-5" onClick={(e) => e.stopPropagation()}>
        {estado === "confirm" && (
          <>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-[oklch(0.95_0.05_240)] grid place-items-center">
                <Send className="h-5 w-5 text-[oklch(0.45_0.15_240)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg">Enviar lote completo al INSS</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Se transmitirán todos los documentos del período al portal de Convenios INSS.
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-muted/40 p-3 grid grid-cols-2 gap-y-1.5 text-xs">
              <Dt>Período</Dt><Dd>{ctx.mes} {ctx.anio}</Dd>
              <Dt>Sede</Dt><Dd>{ctx.sede}</Dd>
              <Dt>Beneficiarios</Dt><Dd className="tabular">{ctx.filas.length}</Dd>
              <Dt>Horas</Dt><Dd className="tabular">{ctx.totales.totalHoras}h</Dd>
              <Dt>Monto total</Dt><Dd className="tabular font-medium">US$ {ctx.totales.totalMonto.toFixed(2)}</Dd>
              <Dt>Destinatario</Dt><Dd>convenios@inss.gob.ni</Dd>
            </div>
            <div className="mt-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Documentos a transmitir</div>
              <ul className="space-y-1 text-xs">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.55_0.15_155)]" /> Carta de cobro consolidada (Q1+Q2)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.55_0.15_155)]" /> Formato de facturación</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.55_0.15_155)]" /> Recibo oficial de caja</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.55_0.15_155)]" /> Anexo de colillas INSS</li>
              </ul>
            </div>
            {ctx.totales.excedentes > 0 && (
              <div className="mt-3 rounded-lg bg-[oklch(0.95_0.06_25)] text-[oklch(0.45_0.15_25)] p-2.5 text-[11px] flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>Se detectaron {ctx.totales.excedentes}h de excedente. Los casos sin constancia médica se excluyen automáticamente del cobro.</span>
              </div>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={onClose} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted">Cancelar</button>
              <button onClick={onConfirm} className="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium inline-flex items-center gap-1.5 hover:opacity-90">
                <Send className="h-3.5 w-3.5" /> Confirmar envío
              </button>
            </div>
          </>
        )}

        {estado === "enviando" && (
          <div className="py-8 text-center">
            <div className="mx-auto h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <div className="mt-3 font-medium text-sm">Transmitiendo lote al portal INSS…</div>
            <div className="text-xs text-muted-foreground mt-1">Empaquetando {ctx.filas.length} casos · firmando documentos.</div>
          </div>
        )}

        {estado === "enviado" && (
          <>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-[oklch(0.94_0.06_155)] grid place-items-center">
                <CheckCircle2 className="h-5 w-5 text-[oklch(0.45_0.15_155)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg">Lote enviado al INSS</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Acuse generado por el portal de Convenios.
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-muted/40 p-3 text-xs">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Folio de seguimiento</div>
              <div className="font-display text-base tabular mt-0.5">{folio}</div>
              <div className="text-muted-foreground mt-1">
                {ctx.filas.length} beneficiarios · US$ {ctx.totales.totalMonto.toFixed(2)} · {new Date().toLocaleDateString("es-NI", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => descargarCaratulaAdjuntos(ctx)} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted inline-flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" /> Descargar acuse
              </button>
              <button onClick={onClose} className="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:opacity-90">Listo</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}



function EnvioINSSModal({
  estado,
  folio,
  caso,
  onConfirm,
  onClose,
}: {
  estado: "confirm" | "enviando" | "enviado";
  folio?: string;
  caso: CasoDoc;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-background border border-border shadow-2xl p-5" onClick={(e) => e.stopPropagation()}>
        {estado === "confirm" && (
          <>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-[oklch(0.95_0.05_240)] grid place-items-center">
                <Send className="h-5 w-5 text-[oklch(0.45_0.15_240)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg">Enviar carta al INSS</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Se transmitirá el cobro consolidado de este caso al portal de Convenios INSS.
                </p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-y-1.5 text-xs">
              <Dt>Beneficiario</Dt><Dd>{caso.nino}</Dd>
              <Dt>INSS</Dt><Dd className="tabular">{caso.codigoINSS ?? "—"}</Dd>
              <Dt>Período</Dt><Dd>{caso.mes} {caso.anio}</Dd>
              <Dt>Horas Q1+Q2</Dt><Dd className="tabular">{caso.totalHoras}h</Dd>
              <Dt>Monto</Dt><Dd className="tabular font-medium">${caso.totalMonto.toFixed(2)}</Dd>
              <Dt>Destinatario</Dt><Dd>convenios@inss.gob.ni</Dd>
            </dl>
            {caso.excede > 0 && !caso.constancia && (
              <div className="mt-3 rounded-lg bg-[oklch(0.95_0.06_25)] text-[oklch(0.45_0.15_25)] p-2.5 text-[11px] flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>Hay {caso.excede}h de excedente sin constancia médica — no se incluirán en el cobro.</span>
              </div>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={onClose} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted">
                Cancelar
              </button>
              <button onClick={onConfirm} className="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium inline-flex items-center gap-1.5 hover:opacity-90">
                <Send className="h-3.5 w-3.5" /> Confirmar envío
              </button>
            </div>
          </>
        )}

        {estado === "enviando" && (
          <div className="py-6 text-center">
            <div className="mx-auto h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <div className="mt-3 font-medium text-sm">Transmitiendo al portal INSS…</div>
            <div className="text-xs text-muted-foreground mt-1">Firmando documento y adjuntando anexos.</div>
          </div>
        )}

        {estado === "enviado" && (
          <>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-[oklch(0.94_0.06_155)] grid place-items-center">
                <CheckCircle2 className="h-5 w-5 text-[oklch(0.45_0.15_155)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg">Enviado al INSS</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  La carta de cobro fue registrada en el portal de Convenios.
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-muted/40 p-3 text-xs">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Folio de seguimiento</div>
              <div className="font-display text-base tabular mt-0.5">{folio}</div>
              <div className="text-muted-foreground mt-1">
                Acuse generado el {new Date().toLocaleDateString("es-NI", { day: "numeric", month: "long", year: "numeric" })}.
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => descargarCartaCobroCaso(caso)} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted inline-flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" /> Descargar copia
              </button>
              <button onClick={onClose} className="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:opacity-90">
                Listo
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


function MiniCard({ icon: Icon, label, value, hint, tone }: { icon: any; label: string; value: string; hint?: string; tone?: "ok" | "warn" | "muted" }) {
  const color =
    tone === "warn" ? "text-[oklch(0.55_0.18_25)]" : tone === "ok" ? "text-[oklch(0.45_0.15_155)]" : "";
  return (
    <div className="rounded-xl border border-border/70 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className={`font-display text-xl tabular mt-1 ${color}`}>{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}

function QuincenaCol({ titulo, sub, horas, sesiones, monto, tarifaHora, excede }: { titulo: string; sub: string; horas: number; sesiones: number; monto: number; tarifaHora: number; excede?: number }) {
  return (
    <div className="rounded-xl bg-muted/30 p-3">
      <div className="text-xs font-medium">{titulo}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
      <div className="mt-2 space-y-1 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Horas</span><span className="tabular font-medium">{horas}h</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Sesiones</span><span className="tabular">{sesiones}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Tarifa</span><span className="tabular">${tarifaHora}/h</span></div>
        <div className="flex justify-between border-t border-border/60 pt-1 mt-1"><span className="font-medium">Subtotal</span><span className="tabular font-semibold">${monto.toFixed(2)}</span></div>
        {typeof excede === "number" && excede > 0 && (
          <div className="text-[10px] text-[oklch(0.55_0.18_25)] mt-1">+{excede}h excedente del mes</div>
        )}
      </div>
    </div>
  );
}

function Dt({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <dt className={`text-xs text-muted-foreground ${className}`}>{children}</dt>;
}
function Dd({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <dd className={`text-sm ${className}`}>{children}</dd>;
}

/* -------- subcomponentes -------- */

function ActionBtn({ icon: Icon, label, primary, onClick }: { icon: any; label: string; primary?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
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
