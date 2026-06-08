import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { FileSpreadsheet, FileText, Package, Download, Calendar, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { sedesFact } from "@/lib/modulos-data";
import { calcularResumenSede } from "@/lib/facturacion-motor";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/reportes")({
  head: () => ({ meta: [{ title: "Reportes · CIE" }] }),
  component: Reportes,
});

const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Sept","Oct","Nov","Dic"];

function descargar(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = nombre; a.click();
  URL.revokeObjectURL(url);
}

function Reportes() {
  const [periodo, setPeriodo] = useState({ mes: 5, anio: 2026, quincena: 2 as 1 | 2 });
  const [sedeId, setSedeId] = useState<string>("todas");
  const [generando, setGenerando] = useState<string | null>(null);

  const generarReporte1 = async () => {
    setGenerando("r1");
    const wb = new ExcelJS.Workbook();
    wb.creator = "CIE"; wb.created = new Date();
    const resumenes = calcularResumenSede(sedeId, periodo);

    (["ABA", "Logo", "Fisio"] as const).forEach((area) => {
      const ws = wb.addWorksheet(area === "ABA" ? "ABA+PFA" : area === "Logo" ? "Logopedia" : "Fisioterapia");
      ws.mergeCells("A1:G1");
      const title = ws.getCell("A1");
      title.value = `CIE · Facturación ${area} · ${meses[periodo.mes - 1]} ${periodo.anio} · Q${periodo.quincena}`;
      title.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
      title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2D7A4A" } };
      title.alignment = { horizontal: "center" };

      const hdr = ["Niño", "INSS", "Expediente", "Aprobadas", "Ejecutadas", "Facturables", "Monto"];
      ws.addRow([]); const r = ws.addRow(hdr);
      r.font = { bold: true, color: { argb: "FFFFFFFF" } };
      r.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E5C36" } };

      const ninosArea = resumenes.filter((n) => n.porArea.some((a) => a.area === area));
      ninosArea.forEach((n, i) => {
        const a = n.porArea.find((x) => x.area === area)!;
        const row = ws.addRow([n.nombre, n.inss ? "Sí" : "No", n.expediente, a.horasAprobadasINSS, a.horasEjecutadas, a.horasFacturables, a.montoFacturable]);
        if (i % 2 === 0) row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F0E8" } };
      });
      const sumRow = ws.addRow(["TOTAL", "", "", { formula: `SUM(D4:D${3 + ninosArea.length})` }, { formula: `SUM(E4:E${3 + ninosArea.length})` }, { formula: `SUM(F4:F${3 + ninosArea.length})` }, { formula: `SUM(G4:G${3 + ninosArea.length})` }]);
      sumRow.font = { bold: true };
      ws.columns.forEach((c, i) => c.width = [28, 8, 18, 12, 12, 12, 12][i]);
    });

    const buf = await wb.xlsx.writeBuffer();
    descargar(new Blob([buf]), `CIE_Facturacion_${sedeId === "todas" ? "TODAS" : sedeId}_Q${periodo.quincena}_${meses[periodo.mes - 1]}${periodo.anio}.xlsx`);
    toast.success("Reporte INSS generado");
    setGenerando(null);
  };

  const generarReporte2 = async () => {
    setGenerando("r2");
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text("Horas no facturadas por inasistencia", 14, 18);
    doc.setFontSize(10); doc.setTextColor(120);
    doc.text(`${meses[periodo.mes - 1]} ${periodo.anio} · Q${periodo.quincena}`, 14, 25);
    doc.setTextColor(20);
    const filas = [
      ["Mateo Gutiérrez", "2026-05-18", "ABA", "1.5h", "Enfermedad", "Sí"],
      ["Valentina Rocha", "2026-05-20", "Logopedia", "1.0h", "Sin aviso", "No"],
      ["Liam Sandoval", "2026-05-22", "Fisioterapia", "1.0h", "Viaje familiar", "Sí"],
    ];
    let y = 38;
    doc.setFontSize(9); doc.setFont("helvetica", "bold");
    ["Niño", "Fecha", "Área", "Horas", "Motivo", "Constancia"].forEach((h, i) => doc.text(h, 14 + i * 32, y));
    doc.setFont("helvetica", "normal");
    filas.forEach((f) => { y += 7; f.forEach((c, i) => doc.text(String(c), 14 + i * 32, y)); });
    y += 12; doc.setFont("helvetica", "bold"); doc.text("Total horas no facturadas: 3.5h · Equivalente: $4.50", 14, y);
    descargar(doc.output("blob"), `CIE_Inasistencias_${meses[periodo.mes - 1]}${periodo.anio}.pdf`);
    toast.success("Reporte de inasistencias generado");
    setGenerando(null);
  };

  const generarReporte3 = async () => {
    setGenerando("r3");
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text("Niños en suspensión", 14, 18);
    doc.setFontSize(10); doc.text(`${meses[periodo.mes - 1]} ${periodo.anio}`, 14, 25);
    let y = 40;
    [["Mateo Gutiérrez", "2026-05-14", "Crisis conductual", "2026-06-15", "12h"], ["Sofía Ramírez", "2026-05-20", "Inasistencia", "2026-06-03", "8h"]]
      .forEach((f) => { f.forEach((c, i) => doc.text(String(c), 14 + i * 36, y)); y += 8; });
    descargar(doc.output("blob"), `CIE_Suspensiones_${meses[periodo.mes - 1]}${periodo.anio}.pdf`);
    toast.success("Reporte de suspensiones generado");
    setGenerando(null);
  };

  const generarReporte4 = async () => {
    setGenerando("r4");
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text("Reporte financiero mensual", 14, 18);
    doc.setFontSize(10); doc.text(`${meses[periodo.mes - 1]} ${periodo.anio}`, 14, 25);
    const ingresos = [["INSS", "$14,688"], ["Privado", "$3,920"], ["Pro-bono", "$0"]];
    let y = 40;
    ingresos.forEach((f) => { doc.text(f[0], 14, y); doc.text(f[1], 80, y); y += 8; });
    y += 8; doc.setFont("helvetica", "bold"); doc.text("Total ingresos: $18,608", 14, y);
    y += 8; doc.setFont("helvetica", "normal"); doc.text("vs mes anterior: +6.4%", 14, y);
    descargar(doc.output("blob"), `CIE_Financiero_${meses[periodo.mes - 1]}${periodo.anio}.pdf`);
    toast.success("Reporte financiero generado");
    setGenerando(null);
  };

  const generarReporte5 = async () => {
    setGenerando("r5");
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Servicios");
    ws.addRow(["Servicio", "Cantidad", "Monto"]);
    ws.getRow(1).font = { bold: true };
    [["Terapia ABA", 612, "$612"], ["Logopedia", 124, "$186"], ["Fisioterapia", 88, "$132"], ["Evaluación VB-MAPP", 6, "$240"]]
      .forEach((r) => ws.addRow(r));
    const buf = await wb.xlsx.writeBuffer();
    descargar(new Blob([buf]), `CIE_Servicios_${meses[periodo.mes - 1]}${periodo.anio}.xlsx`);
    toast.success("Reporte de servicios generado");
    setGenerando(null);
  };

  const generarReporte6 = async () => {
    setGenerando("r6");
    // Checklist
    const checklist = [
      { documento: "Excel de horas por área", incluido: true },
      { documento: "Carta de cobro PDF", incluido: true },
      { documento: "Asistencias con firmas digitales", incluido: true },
      { documento: "Cartas aprobación INSS", incluido: true },
      { documento: "Recibo oficial de caja", incluido: true },
    ];
    const zip = new JSZip();
    // Excel
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Resumen");
    ws.addRow(["Niño", "Horas", "Monto"]);
    calcularResumenSede(sedeId, periodo).forEach((r) => ws.addRow([r.nombre, r.totalHoras, r.totalFacturable]));
    zip.file("01_Horas_por_area.xlsx", await wb.xlsx.writeBuffer());
    // PDFs
    const carta = new jsPDF();
    carta.setFontSize(14); carta.text("Carta de cobro INSS", 14, 20);
    carta.setFontSize(10); carta.text(`Período: ${meses[periodo.mes - 1]} ${periodo.anio} · Q${periodo.quincena}`, 14, 28);
    zip.file("02_Carta_de_cobro.pdf", carta.output("blob"));

    const asistencias = new jsPDF();
    asistencias.text("Asistencias con firmas digitales", 14, 20);
    zip.file("03_Asistencias_firmadas.pdf", asistencias.output("blob"));

    const cartasINSS = new jsPDF();
    cartasINSS.text("Cartas de aprobación INSS", 14, 20);
    zip.file("04_Cartas_INSS.pdf", cartasINSS.output("blob"));

    const recibo = new jsPDF();
    recibo.text("Recibo oficial #2026-0518", 14, 20);
    zip.file("05_Recibo_caja.pdf", recibo.output("blob"));

    // Checklist como txt
    zip.file("00_Checklist.txt", checklist.map((c) => `${c.incluido ? "✓" : "✗"} ${c.documento}`).join("\n"));

    const out = await zip.generateAsync({ type: "blob" });
    descargar(out, `CIE_Paquete_INSS_Q${periodo.quincena}_${meses[periodo.mes - 1]}${periodo.anio}.zip`);
    toast.success("Paquete INSS generado · 5 documentos incluidos");
    setGenerando(null);
  };

  const reportes = [
    { id: "r1", titulo: "1 · Horas por período (INSS)", desc: "Excel con hojas ABA+PFA, Logopedia, Fisioterapia", icon: <FileSpreadsheet />, fn: generarReporte1, color: "bg-[oklch(0.94_0.05_155)]" },
    { id: "r2", titulo: "2 · Horas no facturadas", desc: "Inasistencias y justificaciones del período", icon: <AlertTriangle />, fn: generarReporte2, color: "bg-[oklch(0.94_0.05_75)]" },
    { id: "r3", titulo: "3 · Niños en suspensión", desc: "Listado con motivo y fecha estimada de regreso", icon: <XCircle />, fn: generarReporte3, color: "bg-[oklch(0.94_0.04_25)]" },
    { id: "r4", titulo: "4 · Reporte financiero mensual", desc: "Ingresos INSS / Privado / Pro-bono con comparativa", icon: <FileText />, fn: generarReporte4, color: "bg-[oklch(0.94_0.06_265)]" },
    { id: "r5", titulo: "5 · Servicios brindados", desc: "Cantidad y monto por tipo de servicio", icon: <FileSpreadsheet />, fn: generarReporte5, color: "bg-[oklch(0.94_0.05_200)]" },
    { id: "r6", titulo: "6 · Paquete completo de cobro INSS", desc: "ZIP con Excel + cartas + asistencias firmadas + recibo", icon: <Package />, fn: generarReporte6, color: "bg-[oklch(0.94_0.06_155)]", destacado: true },
  ];

  return (
    <div className="space-y-6 max-w-[1300px]">
      <div>
        <h1 className="font-display text-3xl">Reportes</h1>
        <p className="text-sm text-muted-foreground mt-1">Documentos para el INSS, la dirección y la familia</p>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-3 flex flex-wrap items-center gap-3 text-sm">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <select value={periodo.mes} onChange={(e) => setPeriodo({ ...periodo, mes: +e.target.value })} className="rounded-md border border-border bg-background px-2 py-1 text-sm">
          {meses.map((m, i) => <option key={i} value={i + 1}>{m} {periodo.anio}</option>)}
        </select>
        <select value={periodo.quincena} onChange={(e) => setPeriodo({ ...periodo, quincena: +e.target.value as 1 | 2 })} className="rounded-md border border-border bg-background px-2 py-1 text-sm">
          <option value={1}>Q1</option><option value={2}>Q2</option>
        </select>
        <select value={sedeId} onChange={(e) => setSedeId(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1 text-sm">
          <option value="todas">Todas las sedes</option>
          {sedesFact.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportes.map((r) => (
          <article key={r.id} className={`rounded-2xl border ${r.destacado ? "border-primary/40 bg-primary/[0.04]" : "border-border/70 bg-card"} p-5`}>
            <div className={`h-10 w-10 rounded-xl ${r.color} grid place-items-center mb-3 [&>svg]:h-5 [&>svg]:w-5`}>{r.icon}</div>
            <h3 className="font-display text-base">{r.titulo}</h3>
            <p className="text-xs text-muted-foreground mt-1 min-h-[2.5rem]">{r.desc}</p>
            <button
              onClick={r.fn}
              disabled={generando === r.id}
              className={`mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-medium ${r.destacado ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"} disabled:opacity-60`}
            >
              {generando === r.id ? (
                <><span className="inline-block h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> Generando...</>
              ) : (
                <><Download className="h-3.5 w-3.5" /> Descargar</>
              )}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
