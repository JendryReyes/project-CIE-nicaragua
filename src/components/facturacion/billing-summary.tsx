import { useState } from "react";
import { FileText, FileSpreadsheet, Printer, Plus, Search } from "lucide-react";

type SubTab = "visits" | "claims" | "remits" | "invoices" | "nonbill";

interface Visit {
  id: string;
  fecha: string;
  cliente: string;
  expediente: string;
  servicio: string;
  cpt: string;
  mod: string;
  unidades: number;
  horas: number;
  subtotal: number;
  diagnostico: string;
  paNumber: string;
  estado: "Programada" | "Completada" | "Cancelada" | "No-show" | "Facturada";
}

const visitasDemo: Visit[] = [
  { id: "V-2026-0418", fecha: "2026-06-01", cliente: "Lucía M.", expediente: "EXP-0421", servicio: "ABA", cpt: "97153", mod: "HM", unidades: 8, horas: 2, subtotal: 60, diagnostico: "F84.0", paNumber: "PA-INSS-90041", estado: "Completada" },
  { id: "V-2026-0419", fecha: "2026-06-01", cliente: "Mateo G.", expediente: "EXP-0388", servicio: "Logo", cpt: "92507", mod: "—", unidades: 4, horas: 1, subtotal: 24, diagnostico: "F80.1", paNumber: "PA-INSS-90112", estado: "Completada" },
  { id: "V-2026-0420", fecha: "2026-06-02", cliente: "Sofía R.", expediente: "EXP-0402", servicio: "Fisio", cpt: "97110", mod: "GP", unidades: 4, horas: 1, subtotal: 26, diagnostico: "G80.9", paNumber: "PA-INSS-90203", estado: "Facturada" },
  { id: "V-2026-0421", fecha: "2026-06-02", cliente: "Lucía M.", expediente: "EXP-0421", servicio: "ABA", cpt: "97155", mod: "HM", unidades: 4, horas: 1, subtotal: 32, diagnostico: "F84.0", paNumber: "PA-INSS-90041", estado: "Completada" },
  { id: "V-2026-0422", fecha: "2026-06-03", cliente: "Diego P.", expediente: "EXP-0455", servicio: "ABA", cpt: "97153", mod: "HM", unidades: 6, horas: 1.5, subtotal: 45, diagnostico: "F84.0", paNumber: "PA-INSS-90288", estado: "No-show" },
];

interface Claim {
  id: string;
  enviado: string;
  pagador: string;
  visitas: number;
  monto: number;
  estado: "Borrador" | "Enviado" | "Aceptado" | "Rechazado" | "Pagado";
}

const claimsDemo: Claim[] = [
  { id: "CLM-2026-0042", enviado: "2026-05-31", pagador: "INSS", visitas: 124, monto: 8410, estado: "Aceptado" },
  { id: "CLM-2026-0043", enviado: "2026-06-01", pagador: "INSS", visitas: 96, monto: 6240, estado: "Enviado" },
  { id: "CLM-2026-0044", enviado: "2026-06-02", pagador: "Privado", visitas: 18, monto: 1175, estado: "Pagado" },
  { id: "CLM-2026-0045", enviado: "—", pagador: "INSS", visitas: 41, monto: 2890, estado: "Borrador" },
];

interface Remit {
  id: string;
  fecha: string;
  pagador: string;
  referencia: string;
  monto: number;
  estado: "Por aplicar" | "Aplicado" | "Parcial";
}
const remitsDemo: Remit[] = [
  { id: "REM-2026-0019", fecha: "2026-06-04", pagador: "INSS", referencia: "INSS-TR-77821", monto: 8410, estado: "Aplicado" },
  { id: "REM-2026-0020", fecha: "2026-06-05", pagador: "Privado", referencia: "BAC-440021", monto: 1175, estado: "Aplicado" },
  { id: "REM-2026-0021", fecha: "2026-06-06", pagador: "INSS", referencia: "INSS-TR-77930", monto: 4100, estado: "Parcial" },
];

interface Invoice {
  id: string;
  fecha: string;
  cliente: string;
  visitas: number;
  monto: number;
  saldo: number;
  estado: "Emitida" | "Pagada" | "Vencida" | "Anulada";
}
const invoicesDemo: Invoice[] = [
  { id: "FAC-2026-0211", fecha: "2026-05-31", cliente: "INSS - Lote Mayo Q2", visitas: 218, monto: 14650, saldo: 0, estado: "Pagada" },
  { id: "FAC-2026-0212", fecha: "2026-06-01", cliente: "Familia García (privado)", visitas: 8, monto: 480, saldo: 480, estado: "Emitida" },
  { id: "FAC-2026-0213", fecha: "2026-05-15", cliente: "Familia Rodríguez (privado)", visitas: 12, monto: 720, saldo: 720, estado: "Vencida" },
];

interface NonBill {
  id: string;
  fecha: string;
  cliente: string;
  motivo: string;
  horas: number;
  responsable: string;
}
const nonBillDemo: NonBill[] = [
  { id: "NB-2026-0034", fecha: "2026-06-02", cliente: "Diego P.", motivo: "No-show sin aviso", horas: 1.5, responsable: "Coord. ABA" },
  { id: "NB-2026-0035", fecha: "2026-06-03", cliente: "Mateo G.", motivo: "Sesión de supervisión interna", horas: 1, responsable: "BCBA Supervisora" },
  { id: "NB-2026-0036", fecha: "2026-06-04", cliente: "Equipo CIE", motivo: "Reunión clínica semanal", horas: 1.5, responsable: "Dir. Clínica" },
];

const subTabs: { key: SubTab; label: string; count: number }[] = [
  { key: "visits", label: "Visits", count: visitasDemo.length },
  { key: "claims", label: "Claims", count: claimsDemo.length },
  { key: "remits", label: "Remits", count: remitsDemo.length },
  { key: "invoices", label: "Invoices", count: invoicesDemo.length },
  { key: "nonbill", label: "Non-billables", count: nonBillDemo.length },
];

const estadoTone: Record<string, string> = {
  Completada: "bg-[oklch(0.94_0.053_160)] text-[oklch(0.4_0.106_160)]",
  Facturada: "bg-[oklch(0.94_0.044_258)] text-[oklch(0.4_0.106_258)]",
  Programada: "bg-muted text-muted-foreground",
  Cancelada: "bg-[oklch(0.96_0.044_45)] text-[oklch(0.45_0.132_45)]",
  "No-show": "bg-[oklch(0.96_0.044_45)] text-[oklch(0.45_0.132_45)]",
  Borrador: "bg-muted text-muted-foreground",
  Enviado: "bg-[oklch(0.94_0.044_258)] text-[oklch(0.4_0.106_258)]",
  Aceptado: "bg-[oklch(0.94_0.053_160)] text-[oklch(0.4_0.106_160)]",
  Rechazado: "bg-[oklch(0.96_0.044_45)] text-[oklch(0.45_0.132_45)]",
  Pagada: "bg-[oklch(0.94_0.053_160)] text-[oklch(0.4_0.106_160)]",
  Pagado: "bg-[oklch(0.94_0.053_160)] text-[oklch(0.4_0.106_160)]",
  Vencida: "bg-[oklch(0.96_0.044_45)] text-[oklch(0.45_0.132_45)]",
  Anulada: "bg-muted text-muted-foreground line-through",
  Emitida: "bg-[oklch(0.94_0.044_80)] text-[oklch(0.4_0.106_80)]",
  Aplicado: "bg-[oklch(0.94_0.053_160)] text-[oklch(0.4_0.106_160)]",
  Parcial: "bg-[oklch(0.94_0.044_80)] text-[oklch(0.4_0.106_80)]",
  "Por aplicar": "bg-muted text-muted-foreground",
};

export function BillingSummary() {
  const [tab, setTab] = useState<SubTab>("visits");
  const [query, setQuery] = useState("");

  const totales = {
    visits: visitasDemo.length,
    horas: visitasDemo.reduce((a, v) => a + v.horas, 0),
    unidades: visitasDemo.reduce((a, v) => a + v.unidades, 0),
    subtotal: visitasDemo.reduce((a, v) => a + v.subtotal, 0),
    claims: claimsDemo.reduce((a, c) => a + c.monto, 0),
    cobrado: remitsDemo.reduce((a, r) => a + r.monto, 0),
    pendiente: invoicesDemo.reduce((a, i) => a + i.saldo, 0),
  };

  return (
    <div className="space-y-5">
      {/* Header CR Essentials style */}
      <div className="rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Billing Summary</div>
            <h3 className="font-display text-xl mt-0.5">Resumen formal de facturación · ABA / Logo / Fisio</h3>
            <p className="text-xs text-muted-foreground mt-1">Inspirado en CR Essentials · Visitas → Reclamos → Remesas → Facturas</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 px-3 py-1.5 text-xs hover:bg-muted">
              <Printer className="h-3.5 w-3.5" /> Imprimir
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 px-3 py-1.5 text-xs hover:bg-muted">
              <FileSpreadsheet className="h-3.5 w-3.5" /> Exportar
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:opacity-90">
              <Plus className="h-3.5 w-3.5" /> Nueva visita
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
          <KPI label="Visitas" value={String(totales.visits)} />
          <KPI label="Horas facturables" value={totales.horas.toFixed(1)} />
          <KPI label="Unidades (15 min)" value={String(totales.unidades)} />
          <KPI label="Claims enviados" value={`$${totales.claims.toLocaleString()}`} accent />
          <KPI label="Saldo pendiente" value={`$${totales.pendiente.toLocaleString()}`} warn={totales.pendiente > 0} />
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 border-b border-border/60 overflow-x-auto">
        {subTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3.5 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap inline-flex items-center gap-2 ${
              tab === t.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            <span className="rounded-full bg-muted text-[10px] px-1.5 py-0.5 tabular">{t.count}</span>
          </button>
        ))}
        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrar..."
            className="rounded-md border border-border bg-background pl-7 pr-2 py-1.5 text-xs w-40"
          />
        </div>
      </div>

      {/* Tabla activa */}
      {tab === "visits" && <VisitsTable query={query} />}
      {tab === "claims" && <ClaimsTable query={query} />}
      {tab === "remits" && <RemitsTable query={query} />}
      {tab === "invoices" && <InvoicesTable query={query} />}
      {tab === "nonbill" && <NonBillTable query={query} />}
    </div>
  );
}

function KPI({ label, value, accent, warn }: { label: string; value: string; accent?: boolean; warn?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${warn ? "border-[oklch(0.85_0.106_45)] bg-[oklch(0.98_0.014_265)]" : "border-border/70 bg-background"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-display text-lg mt-0.5 tabular ${accent ? "text-primary" : ""} ${warn ? "text-[oklch(0.45_0.132_45)]" : ""}`}>{value}</div>
    </div>
  );
}

function TableWrap({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/40">
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              {headers.map((h) => (
                <th key={h} className="px-3 py-2.5 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function Estado({ value }: { value: string }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${estadoTone[value] ?? "bg-muted"}`}>
      {value}
    </span>
  );
}

function VisitsTable({ query }: { query: string }) {
  const rows = visitasDemo.filter((v) =>
    [v.id, v.cliente, v.expediente, v.cpt, v.diagnostico, v.paNumber].some((f) =>
      f.toLowerCase().includes(query.toLowerCase())
    )
  );
  return (
    <TableWrap headers={["Visita", "Fecha", "Cliente", "Servicio", "CPT", "Mod", "Unidades", "Horas", "Subtotal", "Diagnóstico", "PA Number", "Estado"]}>
      {rows.map((v) => (
        <tr key={v.id} className="hover:bg-muted/30">
          <td className="px-3 py-2 font-medium tabular">{v.id}</td>
          <td className="px-3 py-2 tabular text-muted-foreground">{v.fecha}</td>
          <td className="px-3 py-2">
            <div>{v.cliente}</div>
            <div className="text-[10px] text-muted-foreground">{v.expediente}</div>
          </td>
          <td className="px-3 py-2">{v.servicio}</td>
          <td className="px-3 py-2 tabular">{v.cpt}</td>
          <td className="px-3 py-2 tabular">{v.mod}</td>
          <td className="px-3 py-2 tabular">{v.unidades}</td>
          <td className="px-3 py-2 tabular">{v.horas}</td>
          <td className="px-3 py-2 tabular font-medium">${v.subtotal.toFixed(2)}</td>
          <td className="px-3 py-2 tabular text-muted-foreground">{v.diagnostico}</td>
          <td className="px-3 py-2 tabular text-muted-foreground">{v.paNumber}</td>
          <td className="px-3 py-2"><Estado value={v.estado} /></td>
        </tr>
      ))}
    </TableWrap>
  );
}

function ClaimsTable({ query }: { query: string }) {
  const rows = claimsDemo.filter((c) => [c.id, c.pagador].some((f) => f.toLowerCase().includes(query.toLowerCase())));
  return (
    <TableWrap headers={["Claim", "Enviado", "Pagador", "Visitas", "Monto", "Estado", ""]}>
      {rows.map((c) => (
        <tr key={c.id} className="hover:bg-muted/30">
          <td className="px-3 py-2 font-medium tabular">{c.id}</td>
          <td className="px-3 py-2 tabular text-muted-foreground">{c.enviado}</td>
          <td className="px-3 py-2">{c.pagador}</td>
          <td className="px-3 py-2 tabular">{c.visitas}</td>
          <td className="px-3 py-2 tabular font-medium">${c.monto.toLocaleString()}</td>
          <td className="px-3 py-2"><Estado value={c.estado} /></td>
          <td className="px-3 py-2 text-right">
            <button className="text-primary hover:underline text-[11px] inline-flex items-center gap-1">
              <FileText className="h-3 w-3" /> Ver 837P
            </button>
          </td>
        </tr>
      ))}
    </TableWrap>
  );
}

function RemitsTable({ query }: { query: string }) {
  const rows = remitsDemo.filter((r) => [r.id, r.pagador, r.referencia].some((f) => f.toLowerCase().includes(query.toLowerCase())));
  return (
    <TableWrap headers={["Remesa", "Fecha", "Pagador", "Referencia", "Monto", "Estado"]}>
      {rows.map((r) => (
        <tr key={r.id} className="hover:bg-muted/30">
          <td className="px-3 py-2 font-medium tabular">{r.id}</td>
          <td className="px-3 py-2 tabular text-muted-foreground">{r.fecha}</td>
          <td className="px-3 py-2">{r.pagador}</td>
          <td className="px-3 py-2 tabular text-muted-foreground">{r.referencia}</td>
          <td className="px-3 py-2 tabular font-medium">${r.monto.toLocaleString()}</td>
          <td className="px-3 py-2"><Estado value={r.estado} /></td>
        </tr>
      ))}
    </TableWrap>
  );
}

function InvoicesTable({ query }: { query: string }) {
  const rows = invoicesDemo.filter((i) => [i.id, i.cliente].some((f) => f.toLowerCase().includes(query.toLowerCase())));
  return (
    <TableWrap headers={["Factura", "Fecha", "Cliente", "Visitas", "Monto", "Saldo", "Estado"]}>
      {rows.map((i) => (
        <tr key={i.id} className="hover:bg-muted/30">
          <td className="px-3 py-2 font-medium tabular">{i.id}</td>
          <td className="px-3 py-2 tabular text-muted-foreground">{i.fecha}</td>
          <td className="px-3 py-2">{i.cliente}</td>
          <td className="px-3 py-2 tabular">{i.visitas}</td>
          <td className="px-3 py-2 tabular font-medium">${i.monto.toLocaleString()}</td>
          <td className={`px-3 py-2 tabular ${i.saldo > 0 ? "text-[oklch(0.45_0.132_45)] font-medium" : "text-muted-foreground"}`}>
            ${i.saldo.toLocaleString()}
          </td>
          <td className="px-3 py-2"><Estado value={i.estado} /></td>
        </tr>
      ))}
    </TableWrap>
  );
}

function NonBillTable({ query }: { query: string }) {
  const rows = nonBillDemo.filter((n) => [n.id, n.cliente, n.motivo, n.responsable].some((f) => f.toLowerCase().includes(query.toLowerCase())));
  return (
    <TableWrap headers={["Registro", "Fecha", "Cliente / Equipo", "Motivo", "Horas", "Responsable"]}>
      {rows.map((n) => (
        <tr key={n.id} className="hover:bg-muted/30">
          <td className="px-3 py-2 font-medium tabular">{n.id}</td>
          <td className="px-3 py-2 tabular text-muted-foreground">{n.fecha}</td>
          <td className="px-3 py-2">{n.cliente}</td>
          <td className="px-3 py-2">{n.motivo}</td>
          <td className="px-3 py-2 tabular">{n.horas}</td>
          <td className="px-3 py-2 text-muted-foreground">{n.responsable}</td>
        </tr>
      ))}
    </TableWrap>
  );
}
