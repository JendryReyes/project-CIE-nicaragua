// Documentos consolidados del Comparativo (todas las filas / sede / período)
import jsPDF from "jspdf";
import type { FilaCobro } from "./carta-cobro-institucional";

const M = 14;

function headerPdf(doc: jsPDF, titulo: string, subtitulo: string) {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(15, 76, 117);
  doc.rect(0, 0, W, 12, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CIE · Centro Integral Especializado", M, 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(subtitulo, W - M, 8, { align: "right" });
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(titulo, M, 22);
}

function pie(doc: jsPDF) {
  const W = doc.internal.pageSize.getWidth();
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(140);
    doc.text(`CIETrack · ${new Date().toISOString()} · Página ${i} de ${pages}`, W / 2, 270, { align: "center" });
  }
}

export type DocsCtx = {
  mes: string;
  anio: string;
  sede: string;
  filas: FilaCobro[];
  totales: { totalHoras: number; totalMonto: number; aprobadas: number; cobertura: number; excedentes: number };
};

// ─────────────────── Formato de facturación (planilla por niño) ───────────────────
export function descargarFormatoFacturacion(ctx: DocsCtx) {
  const doc = new jsPDF({ unit: "mm", format: "letter", orientation: "landscape" });
  const W = doc.internal.pageSize.getWidth();
  headerPdf(doc, "Formato de facturación INSS", `${ctx.mes} ${ctx.anio} · ${ctx.sede}`);

  let y = 32;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Folio: CIE-FF-${ctx.anio}-${ctx.mes.substring(0,3).toUpperCase()}`, W - M, y, { align: "right" });

  y = 40;
  doc.setFillColor(235, 235, 235);
  doc.rect(M, y, W - M * 2, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const cols = [
    { x: M + 2, w: 8, l: "#" },
    { x: M + 12, w: 60, l: "Beneficiario" },
    { x: M + 72, w: 26, l: "INSS" },
    { x: M + 100, w: 18, l: "Área" },
    { x: M + 120, w: 18, l: "Aprob" },
    { x: M + 140, w: 14, l: "Q1" },
    { x: M + 156, w: 14, l: "Q2" },
    { x: M + 172, w: 16, l: "Total h" },
    { x: M + 190, w: 22, l: "Excede" },
    { x: M + 214, w: 30, l: "Subtotal" },
  ];
  for (const c of cols) doc.text(c.l, c.x, y + 5);
  y += 7;

  doc.setFont("helvetica", "normal");
  ctx.filas.forEach((f, idx) => {
    if (y > 180) { doc.addPage(); y = 20; }
    doc.text(String(idx + 1), M + 2, y + 5);
    doc.text(f.nino, M + 12, y + 5, { maxWidth: 58 });
    doc.text(f.codigoINSS ?? "—", M + 72, y + 5);
    doc.text(f.area, M + 100, y + 5);
    doc.text(`${f.aprobadas}h`, M + 120, y + 5);
    doc.text(`${f.q1Horas}h`, M + 140, y + 5);
    doc.text(`${f.q2Horas}h`, M + 156, y + 5);
    doc.text(`${f.totalHoras}h`, M + 172, y + 5);
    if (f.excede > 0) {
      doc.setTextColor(180, 60, 0);
      doc.text(`+${f.excede}h ${f.constancia ? "✓" : "✗"}`, M + 190, y + 5);
      doc.setTextColor(0);
    } else doc.text("—", M + 190, y + 5);
    doc.text(`$${f.totalMonto.toFixed(2)}`, M + 214, y + 5);
    y += 7;
    doc.setDrawColor(225);
    doc.line(M, y, W - M, y);
  });

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`Total horas: ${ctx.totales.totalHoras}h · Cobertura ${ctx.totales.cobertura.toFixed(1)}%`, M, y);
  doc.text(`TOTAL: US$ ${ctx.totales.totalMonto.toFixed(2)}`, W - M, y, { align: "right" });

  pie(doc);
  doc.save(`Formato_Facturacion_${ctx.mes}_${ctx.anio}.pdf`);
}

// ─────────────────── Recibo oficial de caja (consolidado) ───────────────────
export function descargarReciboOficialConsolidado(ctx: DocsCtx) {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  headerPdf(doc, "Recibo oficial de caja", "Comprobante consolidado · CIE");

  let y = 36;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Folio: CIE-RC-${ctx.anio}-${ctx.mes.substring(0,3).toUpperCase()}`, W - M, y, { align: "right" });
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-NI", { day: "numeric", month: "long", year: "numeric" })}`, W - M, y + 4, { align: "right" });

  y = 56;
  doc.setFontSize(10);
  doc.text(`Recibido de: INSS — Convenio CIE`, M, y);
  doc.text(`En concepto de: Servicios terapéuticos (ABA, Logopedia, Fisioterapia)`, M, y + 6, { maxWidth: W - M * 2 });
  doc.text(`Período: ${ctx.mes} ${ctx.anio} · ${ctx.sede}`, M, y + 12);
  doc.text(`Beneficiarios atendidos: ${ctx.filas.length}`, M, y + 18);

  y = 92;
  doc.setDrawColor(120);
  doc.roundedRect(M, y, W - M * 2, 28, 3, 3, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Total recibido", M + 4, y + 9);
  doc.setFontSize(22);
  doc.text(`US$ ${ctx.totales.totalMonto.toFixed(2)}`, W - M - 4, y + 18, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    `${ctx.totales.totalHoras} horas terapéuticas · Cobertura ${ctx.totales.cobertura.toFixed(1)}% sobre ${ctx.totales.aprobadas}h aprobadas`,
    M + 4,
    y + 23
  );

  y = 132;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Desglose por beneficiario", M, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  for (const f of ctx.filas.slice(0, 18)) {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.text(`${f.nino} (${f.area})`, M, y + 5);
    doc.text(`${f.totalHoras}h`, M + 110, y + 5);
    doc.text(`$${f.totalMonto.toFixed(2)}`, W - M - 2, y + 5, { align: "right" });
    y += 6;
    doc.setDrawColor(235);
    doc.line(M, y, W - M, y);
  }
  if (ctx.filas.length > 18) {
    doc.setTextColor(120);
    doc.text(`+ ${ctx.filas.length - 18} beneficiarios más en anexo`, M, y + 5);
    doc.setTextColor(0);
  }

  // Firmas
  let yf = 230;
  doc.setDrawColor(0);
  doc.line(M, yf, M + 70, yf);
  doc.line(W - M - 70, yf, W - M, yf);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Caja · CIE", M, yf + 5);
  doc.text("Recibido conforme · INSS", W - M, yf + 5, { align: "right" });

  pie(doc);
  doc.save(`Recibo_Caja_${ctx.mes}_${ctx.anio}.pdf`);
}

// ─────────────────── Carátula de adjuntos para INSS ───────────────────
export function descargarCaratulaAdjuntos(ctx: DocsCtx) {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  headerPdf(doc, "Carátula de adjuntos · Envío INSS", `${ctx.mes} ${ctx.anio} · ${ctx.sede}`);

  let y = 32;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Destinatario: Dirección de Convenios y Prestaciones Médicas — INSS", M, y);
  doc.text("Remitente: CIE · BCBA Beatriz Urcuyo (Directora Clínica)", M, y + 5);
  doc.text("Canal: convenios@inss.gob.ni · ventanilla física Plaza España, Managua", M, y + 10);

  y = 58;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Documentos incluidos en este envío:", M, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const items = [
    "Carta de cobro consolidada INSS (Q1+Q2)",
    "Formato de facturación con detalle por beneficiario",
    "Recibo oficial de caja (comprobante)",
    "Anexo: Cumplimiento de colillas INSS de cotizantes",
    `Constancias médicas de excedentes (${ctx.totales.excedentes > 0 ? `${ctx.totales.excedentes}h` : "no aplica"})`,
    "Copia de carta de aprobación INSS vigente por niño",
  ];
  for (const it of items) {
    doc.text(`☐  ${it}`, M, y);
    y += 7;
  }

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Resumen del envío", M, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(`Beneficiarios: ${ctx.filas.length}`, M, y);
  doc.text(`Horas: ${ctx.totales.totalHoras}h`, M + 70, y);
  doc.text(`Monto: US$ ${ctx.totales.totalMonto.toFixed(2)}`, W - M, y, { align: "right" });

  y = 220;
  doc.setDrawColor(0);
  doc.line(M, y, M + 70, y);
  doc.line(W - M - 70, y, W - M, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Entregado por · CIE", M, y + 5);
  doc.text("Recibido · INSS (sello y firma)", W - M, y + 5, { align: "right" });

  pie(doc);
  doc.save(`Caratula_Adjuntos_INSS_${ctx.mes}_${ctx.anio}.pdf`);
}
