import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Download, FileSpreadsheet } from "lucide-react";
import { sedesFact, calcularNino, tarifa, type AreaFact } from "@/lib/modulos-data";
import {
  generarSesionesQuincena,
  serviciosEventualesDelCorte,
  inasistencias,
  estadosMatricula,
  pagadorActivo,
} from "@/lib/facturacion-modelo";
import { suspensiones } from "@/lib/suspensiones";

export const Route = createFileRoute("/_app/facturacion/reportes")({
  head: () => ({ meta: [{ title: "Reportes de facturación · CIE" }] }),
  component: ReportesPage,
});

type Tab =
  | "desglose"
  | "no-facturadas"
  | "servicios"
  | "inasistencias"
  | "suspensiones"
  | "bajas"
  | "recibo";

const tabs: { key: Tab; label: string }[] = [
  { key: "desglose", label: "Desglose por niño y disciplina" },
  { key: "no-facturadas", label: "Horas no facturadas (Q2)" },
  { key: "servicios", label: "Servicios brindados (corte)" },
  { key: "inasistencias", label: "Inasistencias" },
  { key: "suspensiones", label: "Suspensiones horarias" },
  { key: "bajas", label: "Bajas de matrícula" },
  { key: "recibo", label: "Recibo oficial de caja" },
];

function ReportesPage() {
  const [tab, setTab] = useState<Tab>("desglose");
  const [quincena, setQuincena] = useState<"Q1" | "Q2">("Q2");
  const [sedeId, setSedeId] = useState<string | "todas">("todas");
  const [disciplina, setDisciplina] = useState<AreaFact | "todas">("todas");

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center gap-3">
        <Link to="/facturacion" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Facturación
        </Link>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs">Reportes</span>
      </div>

      <div>
        <h1 className="font-display text-3xl">Reportes de facturación</h1>
        <p className="text-sm text-muted-foreground mt-1">Filtros comunes por corte, sede y disciplina. Cada reporte exporta a PDF/Excel.</p>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-3 flex flex-wrap items-center gap-3 text-sm">
        <Field label="Quincena">
          <div className="inline-flex rounded-md border border-border overflow-hidden">
            {(["Q1", "Q2"] as const).map((q) => (
              <button
                key={q}
                onClick={() => setQuincena(q)}
                className={`px-3 py-1 text-xs ${quincena === q ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                {q === "Q1" ? "1ra · 1-15" : "2da · 16-30"}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Sede">
          <select
            value={sedeId}
            onChange={(e) => setSedeId(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-sm"
          >
            <option value="todas">Todas</option>
            {sedesFact.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Disciplina">
          <select
            value={disciplina}
            onChange={(e) => setDisciplina(e.target.value as AreaFact | "todas")}
            className="rounded-md border border-border bg-background px-2 py-1 text-sm"
          >
            <option value="todas">Todas</option>
            <option value="ABA">ABA</option>
            <option value="Logo">Logopedia</option>
            <option value="Fisio">Fisioterapia</option>
          </select>
        </Field>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => exportarCSV(tab, { quincena, sedeId, disciplina })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 px-3 py-1.5 text-xs hover:bg-muted"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> Exportar CSV
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 px-3 py-1.5 text-xs hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" /> Imprimir / PDF
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-border/60 overflow-x-auto">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        {tab === "desglose" && <Desglose quincena={quincena} sedeId={sedeId} disciplina={disciplina} />}
        {tab === "no-facturadas" && <NoFacturadas quincena={quincena} sedeId={sedeId} />}
        {tab === "servicios" && <ServiciosBrindados quincena={quincena} sedeId={sedeId} />}
        {tab === "inasistencias" && <InasistenciasTab sedeId={sedeId} />}
        {tab === "suspensiones" && <SuspensionesTab />}
        {tab === "bajas" && <BajasTab />}
        {tab === "recibo" && <ReciboCaja quincena={quincena} sedeId={sedeId} />}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <span className="uppercase tracking-wider text-[10px]">{label}</span>
      {children}
    </label>
  );
}

function exportarCSV(_tab: Tab, _filtros: unknown) {
  // Simulación: en una iteración real generamos CSV/PDF reales.
  window.alert("Exportación generada (demo). Se descargará el archivo correspondiente al reporte activo.");
}

// ---------- Desglose por niño y disciplina ----------
function Desglose({ quincena, sedeId, disciplina }: { quincena: "Q1" | "Q2"; sedeId: string; disciplina: AreaFact | "todas" }) {
  const sesiones = useMemo(() => generarSesionesQuincena(quincena, 5, 2026), [quincena]);
  const filas = useMemo(() => {
    const map = new Map<string, { nombre: string; sede: string; INSS: number; Privada: number; "Pro-bono": number; "Fuera de Contrato": number; monto: number }>();
    for (const s of sesiones) {
      if (sedeId !== "todas" && s.sedeId !== sedeId) continue;
      if (disciplina !== "todas" && s.area !== disciplina) continue;
      let f = map.get(s.ninoId);
      if (!f) {
        f = { nombre: s.ninoNombre, sede: sedesFact.find((x) => x.id === s.sedeId)?.nombre ?? s.sedeId, INSS: 0, Privada: 0, "Pro-bono": 0, "Fuera de Contrato": 0, monto: 0 };
        map.set(s.ninoId, f);
      }
      f[s.clasificacion] += s.duracion;
      if (s.facturable && s.clasificacion !== "Fuera de Contrato") f.monto += s.duracion * tarifa[s.area];
    }
    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [sesiones, sedeId, disciplina]);

  return (
    <Tabla
      cols={["Niño", "Sede", "INSS", "Privada", "Pro-bono", "Fuera Contrato", "Monto INSS"]}
      rows={filas.map((f) => [
        f.nombre,
        f.sede,
        `${f.INSS}h`,
        `${f.Privada}h`,
        `${f["Pro-bono"]}h`,
        `${f["Fuera de Contrato"]}h`,
        `$${f.monto.toFixed(2)}`,
      ])}
    />
  );
}

// ---------- Horas no facturadas en Q2 ----------
function NoFacturadas({ sedeId }: { quincena: "Q1" | "Q2"; sedeId: string }) {
  const sesiones = useMemo(() => generarSesionesQuincena("Q2", 5, 2026), []);
  const filas = useMemo(() => {
    const map = new Map<string, { nombre: string; sede: string; horas: number; monto: number; motivo: string }>();
    for (const s of sesiones) {
      if (sedeId !== "todas" && s.sedeId !== sedeId) continue;
      if (s.clasificacion !== "Fuera de Contrato") continue;
      let f = map.get(s.ninoId);
      if (!f) {
        f = {
          nombre: s.ninoNombre,
          sede: sedesFact.find((x) => x.id === s.sedeId)?.nombre ?? s.sedeId,
          horas: 0,
          monto: 0,
          motivo: s.motivoNoFact ?? "Excede aprobación INSS sin constancia",
        };
        map.set(s.ninoId, f);
      }
      f.horas += s.duracion;
      f.monto += s.duracion * tarifa[s.area];
    }
    return Array.from(map.values());
  }, [sesiones, sedeId]);

  return (
    <Tabla
      cols={["Niño", "Sede", "Horas no facturadas", "Monto perdido", "Motivo"]}
      rows={filas.map((f) => [f.nombre, f.sede, `${f.horas}h`, `$${f.monto.toFixed(2)}`, f.motivo])}
      vacio="Todas las horas del Corte 2 están dentro del límite aprobado o cubiertas por constancia."
    />
  );
}

// ---------- Servicios brindados ----------
function ServiciosBrindados({ quincena, sedeId }: { quincena: "Q1" | "Q2"; sedeId: string }) {
  const sesiones = useMemo(() => generarSesionesQuincena(quincena, 5, 2026), [quincena]);
  const eventuales = useMemo(() => serviciosEventualesDelCorte(quincena, 5, 2026, sedeId), [quincena, sedeId]);

  const porArea = useMemo(() => {
    const m = { ABA: { h: 0, monto: 0 }, Logo: { h: 0, monto: 0 }, Fisio: { h: 0, monto: 0 } } as Record<AreaFact, { h: number; monto: number }>;
    for (const s of sesiones) {
      if (sedeId !== "todas" && s.sedeId !== sedeId) continue;
      if (!s.facturable) continue;
      m[s.area].h += s.duracion;
      m[s.area].monto += s.duracion * tarifa[s.area];
    }
    return m;
  }, [sesiones, sedeId]);

  return (
    <div className="space-y-4">
      <Tabla
        cols={["Disciplina", "Horas brindadas", "Monto"]}
        rows={(Object.keys(porArea) as AreaFact[]).map((k) => [k, `${porArea[k].h}h`, `$${porArea[k].monto.toFixed(2)}`])}
      />
      <h3 className="font-display text-sm mt-4">Servicios eventuales del corte</h3>
      <Tabla
        cols={["Tipo", "Niño", "Fecha", "Pagador", "Monto", "En lote"]}
        rows={eventuales.map((e) => [
          e.tipo,
          e.ninoNombre,
          new Date(e.fecha).toLocaleDateString("es-NI", { day: "2-digit", month: "short" }),
          e.pagador,
          `$${e.monto.toFixed(2)}`,
          e.incluirEnLote ? "Sí" : "—",
        ])}
        vacio="Sin servicios eventuales en este corte."
      />
    </div>
  );
}

// ---------- Inasistencias ----------
function InasistenciasTab({ sedeId }: { sedeId: string }) {
  const filas = inasistencias.filter((i) => sedeId === "todas" || i.sedeId === sedeId);
  return (
    <Tabla
      cols={["Fecha", "Niño", "Sede", "Área", "Horas", "Motivo", "Justificada"]}
      rows={filas.map((i) => [
        new Date(i.fecha).toLocaleDateString("es-NI", { day: "2-digit", month: "short" }),
        i.ninoNombre,
        sedesFact.find((x) => x.id === i.sedeId)?.nombre ?? i.sedeId,
        i.area,
        `${i.horas}h`,
        i.motivo,
        i.justificada ? "Sí" : "No",
      ])}
    />
  );
}

// ---------- Suspensiones ----------
function SuspensionesTab() {
  const ninos = sedesFact.flatMap((s) => s.ninos);
  return (
    <Tabla
      cols={["Niño", "Desde", "Hasta", "Motivo", "Horas descontadas"]}
      rows={suspensiones.map((s) => {
        const n = ninos.find((x) => x.id === s.ninoId);
        return [
          n?.nombre ?? s.ninoId,
          new Date(s.desde).toLocaleDateString("es-NI"),
          s.hasta ? new Date(s.hasta).toLocaleDateString("es-NI") : "—",
          s.motivo,
          `${s.horasDescontadas}h`,
        ];
      })}
      vacio="Sin suspensiones activas."
    />
  );
}

// ---------- Bajas ----------
function BajasTab() {
  const bajas = estadosMatricula.filter((e) => e.tipo === "baja");
  return (
    <Tabla
      cols={["Niño", "Fecha de baja", "Motivo", "Responsable"]}
      rows={bajas.map((b) => [b.ninoId, new Date(b.desde).toLocaleDateString("es-NI"), b.motivo ?? "—", b.responsable ?? "—"])}
      vacio="Sin bajas registradas en el período."
    />
  );
}

// ---------- Recibo oficial de caja ----------
function ReciboCaja({ quincena, sedeId }: { quincena: "Q1" | "Q2"; sedeId: string }) {
  const ninos = useMemo(
    () =>
      sedesFact
        .filter((s) => sedeId === "todas" || s.id === sedeId)
        .flatMap((s) => s.ninos)
        .filter((n) => pagadorActivo(n.id) === "INSS"),
    [sedeId]
  );

  const filas = ninos.map((n) => {
    const r = calcularNino(n);
    return { nombre: n.nombre, codigo: n.codigoINSS ?? "—", horas: r.totalHoras, monto: r.total };
  });
  const totalMonto = filas.reduce((a, b) => a + b.monto, 0);
  const totalHoras = filas.reduce((a, b) => a + b.horas, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/70 bg-card p-6 max-w-3xl mx-auto">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Centro de Intervención Especializada</div>
          <h2 className="font-display text-2xl mt-1">Recibo oficial de caja</h2>
          <div className="text-xs text-muted-foreground mt-1">
            Quincena {quincena === "Q1" ? "1ra (1-15)" : "2da (16-30)"} · Mayo 2026
          </div>
        </div>
        <div className="mt-6 border-t border-border/60 pt-4 text-sm space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Recibido de</span>
            <span className="font-medium">Instituto Nicaragüense de Seguridad Social (INSS)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Concepto</span>
            <span>Servicios terapéuticos del período</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Niños incluidos</span>
            <span className="tabular">{filas.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total de horas</span>
            <span className="tabular">{totalHoras}h</span>
          </div>
          <div className="flex justify-between border-t border-border/60 pt-2 mt-2">
            <span className="font-display text-base">Monto total</span>
            <span className="font-display text-2xl tabular">${totalMonto.toFixed(2)}</span>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-6 text-xs">
          <div className="border-t border-border pt-2 text-center text-muted-foreground">Firma autorizada CIE</div>
          <div className="border-t border-border pt-2 text-center text-muted-foreground">Recibido por INSS</div>
        </div>
      </div>
      <Tabla
        cols={["Niño", "Código INSS", "Horas", "Monto"]}
        rows={filas.map((f) => [f.nombre, f.codigo, `${f.horas}h`, `$${f.monto.toFixed(2)}`])}
      />
    </div>
  );
}

function Tabla({ cols, rows, vacio }: { cols: string[]; rows: (string | number)[][]; vacio?: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            {cols.map((c) => (
              <th key={c} className="px-3 py-2 text-left font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border/40">
              {r.map((cell, j) => (
                <td key={j} className="px-3 py-2 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={cols.length} className="px-3 py-8 text-center text-sm text-muted-foreground">
                {vacio ?? "Sin datos."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
