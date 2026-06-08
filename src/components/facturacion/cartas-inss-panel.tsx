import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import { FileText, Download, CheckCircle2, AlertTriangle, XCircle, Search } from "lucide-react";
import { sedesFact, type AreaFact } from "@/lib/modulos-data";
import {
  todasLasCartas,
  marcarRenovada,
  estadoCartaColor,
  type CartaConEstado,
  type EstadoCarta,
} from "@/lib/cartas-inss";
import { toast } from "sonner";

export function CartasINSSPanel() {
  const [sedeId, setSedeId] = useState<string>("todas");
  const [area, setArea] = useState<AreaFact | "todas">("todas");
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoCarta | "todos">("todos");
  const [q, setQ] = useState("");
  const [tick, setTick] = useState(0);

  const cartas = useMemo(() => {
    void tick;
    return todasLasCartas()
      .filter((c) => sedeId === "todas" || c.sedeId === sedeId)
      .filter((c) => area === "todas" || c.area === area)
      .filter((c) => estadoFiltro === "todos" || c.estado === estadoFiltro)
      .filter((c) =>
        q.trim() === "" ||
        c.ninoNombre.toLowerCase().includes(q.toLowerCase()) ||
        c.numero.toLowerCase().includes(q.toLowerCase())
      )
      .sort((a, b) => a.diasRestantes - b.diasRestantes);
  }, [sedeId, area, estadoFiltro, q, tick]);

  const conteo = useMemo(() => {
    const todas = todasLasCartas();
    return {
      total: todas.length,
      vigentes: todas.filter((c) => c.estado === "vigente").length,
      porVencer: todas.filter((c) => c.estado === "por_vencer").length,
      vencidas: todas.filter((c) => c.estado === "vencida").length,
    };
  }, [tick]);

  const renovar = (carta: CartaConEstado) => {
    marcarRenovada(carta.id);
    setTick((t) => t + 1);
    toast.success(`Carta ${carta.numero} marcada como renovada`);
  };

  const descargar = (carta: CartaConEstado) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("INSS · Carta de aprobación de horas terapéuticas", 14, 20);
    doc.setFontSize(10); doc.setTextColor(110);
    doc.text(`Documento #${carta.numero}`, 14, 28);
    doc.setTextColor(20);
    let y = 44;
    [
      ["Beneficiario", carta.ninoNombre],
      ["Área", carta.area === "ABA" ? "Análisis Conductual Aplicado" : carta.area === "Logo" ? "Logopedia" : "Fisioterapia"],
      ["Horas aprobadas", `${carta.horasAprobadas} h (semestral)`],
      ["Emitida", carta.emitida],
      ["Vence", carta.vence],
      ["Estado", estadoCartaColor(carta.estado).label],
    ].forEach(([k, v]) => {
      doc.setFont("helvetica", "bold"); doc.text(k, 14, y);
      doc.setFont("helvetica", "normal"); doc.text(String(v), 70, y);
      y += 8;
    });
    if (carta.observacion) {
      y += 6;
      doc.setFont("helvetica", "italic");
      doc.text(`Observación: ${carta.observacion}`, 14, y);
    }
    doc.save(`Carta_${carta.numero}.pdf`);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Control de vigencia de las cartas de aprobación. Una carta vencida = un mes sin cobrar.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI label="Total cartas" value={String(conteo.total)} />
        <KPI label="Vigentes" value={String(conteo.vigentes)} tone="ok" />
        <KPI label="Por vencer (30 días)" value={String(conteo.porVencer)} tone="warn" />
        <KPI label="Vencidas" value={String(conteo.vencidas)} tone="bad" />
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-3 flex flex-wrap gap-2 items-center text-sm">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar niño o número de carta"
            className="w-full rounded-md border border-border bg-background pl-8 pr-3 py-1.5 text-sm"
          />
        </div>
        <select value={sedeId} onChange={(e) => setSedeId(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm">
          <option value="todas">Todas las sedes</option>
          {sedesFact.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
        <select value={area} onChange={(e) => setArea(e.target.value as AreaFact | "todas")} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm">
          <option value="todas">Todas las áreas</option>
          <option value="ABA">ABA</option>
          <option value="Logo">Logopedia</option>
          <option value="Fisio">Fisioterapia</option>
        </select>
        <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value as EstadoCarta | "todos")} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm">
          <option value="todos">Todos los estados</option>
          <option value="vigente">Vigentes</option>
          <option value="por_vencer">Por vencer</option>
          <option value="vencida">Vencidas</option>
          <option value="renovada">Renovadas</option>
        </select>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <div className="grid grid-cols-[1.4fr_140px_90px_110px_110px_120px_180px] gap-3 px-4 py-2.5 border-b border-border/60 text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/30">
          <span>Niño · Carta</span>
          <span>Sede</span>
          <span>Área</span>
          <span className="text-right">Horas</span>
          <span className="text-right">Vence</span>
          <span className="text-center">Estado</span>
          <span className="text-right">Acciones</span>
        </div>
        {cartas.length === 0 && (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No hay cartas que coincidan con los filtros.
          </div>
        )}
        {cartas.map((c) => {
          const col = estadoCartaColor(c.estado);
          const fila =
            c.estado === "vencida" ? "bg-[oklch(0.98_0.03_25)]" :
            c.estado === "por_vencer" ? "bg-[oklch(0.98_0.04_75)]" : "";
          return (
            <div
              key={c.id}
              className={`grid grid-cols-[1.4fr_140px_90px_110px_110px_120px_180px] gap-3 px-4 py-3 border-b border-border/40 text-sm items-center ${fila}`}
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{c.ninoNombre}</div>
                <div className="text-[11px] text-muted-foreground truncate tabular">{c.numero}</div>
              </div>
              <span className="text-xs text-muted-foreground">{c.sedeId}</span>
              <span className="text-xs">{c.area}</span>
              <span className="tabular text-right">{c.horasAprobadas}h</span>
              <span className="tabular text-right text-xs">
                <div>{c.vence}</div>
                <div className={`text-[10px] ${c.diasRestantes < 0 ? "text-[oklch(0.55_0.15_25)]" : c.diasRestantes <= 30 ? "text-[oklch(0.5_0.13_75)]" : "text-muted-foreground"}`}>
                  {c.diasRestantes < 0 ? `Hace ${-c.diasRestantes} días` : `En ${c.diasRestantes} días`}
                </div>
              </span>
              <span className={`justify-self-center inline-flex items-center gap-1 text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 ${col.bg} ${col.text}`}>
                {c.estado === "vigente" && <CheckCircle2 className="h-3 w-3" />}
                {c.estado === "por_vencer" && <AlertTriangle className="h-3 w-3" />}
                {c.estado === "vencida" && <XCircle className="h-3 w-3" />}
                {c.estado === "renovada" && <CheckCircle2 className="h-3 w-3" />}
                {col.label}
              </span>
              <div className="flex gap-1.5 justify-end">
                <button
                  onClick={() => descargar(c)}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-muted"
                >
                  <Download className="h-3 w-3" /> PDF
                </button>
                {(c.estado === "por_vencer" || c.estado === "vencida") && (
                  <button
                    onClick={() => renovar(c)}
                    className="inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-2 py-1 text-[11px]"
                  >
                    <FileText className="h-3 w-3" /> Renovar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
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
