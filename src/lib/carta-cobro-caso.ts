// Documentos individuales por caso (un niño / un área) usados desde el
// panel de detalle del Comparativo de Quincenas.

import jsPDF from "jspdf";

export type CasoDoc = {
  nino: string;
  codigoINSS?: string;
  sede: string;
  area: string; // "ABA" | "Logo" | "Fisio"
  mes: string;
  anio: string;
  aprobadas: number;
  q1Horas: number;
  q2Horas: number;
  totalHoras: number;
  q1Monto: number;
  q2Monto: number;
  totalMonto: number;
  tarifaHora: number;
  excede: number;
  constancia: boolean;
  cobertura: number;
  sesionesQ1: number;
  sesionesQ2: number;
};

const M = 18;

function header(doc: jsPDF, titulo: string, subtitulo: string) {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(15, 76, 117);
  doc.rect(0, 0, W, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CIE · Centro Integral Especializado", M, 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(subtitulo, W - M, 9, { align: "right" });
  doc.setTextColor(0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(titulo, M, 24);
}

function piePagina(doc: jsPDF) {
  const W = doc.internal.pageSize.getWidth();
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(140);
    doc.text(
      `CIETrack · ${new Date().toISOString()} · Página ${i} de ${pages}`,
      W / 2,
      270,
      { align: "center" }
    );
  }
}

function folio(prefix: string, d: CasoDoc) {
  const slug = d.nino.split(" ").map((p) => p[0]).join("").slice(0, 4).toUpperCase();
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${prefix}-${slug}-${d.area}-${fecha}`;
}

// ─────────────────────────── Carta de cobro por caso ───────────────────────────
export function generarCartaCobroCaso(d: CasoDoc): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  header(doc, "Carta de cobro individual", "Convenio INSS · Documento por beneficiario");

  let y = 34;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Folio: ${folio("CIE-CC", d)}`, W - M, y, { align: "right" });
  doc.text(
    `Managua, ${new Date().toLocaleDateString("es-NI", { day: "numeric", month: "long", year: "numeric" })}`,
    W - M,
    y + 4,
    { align: "right" }
  );

  y = 46;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Lic. Dirección de Convenios y Prestaciones Médicas", M, y);
  doc.setFont("helvetica", "normal");
  doc.text("Instituto Nicaragüense de Seguridad Social", M, y + 5);
  doc.text("Su despacho.—", M, y + 10);

  y = 66;
  doc.setFont("helvetica", "bold");
  doc.text("Asunto:", M, y);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Cobro individual ${d.area} — ${d.nino} (INSS ${d.codigoINSS ?? "—"}) — ${d.mes} ${d.anio}, sede ${d.sede}.`,
    M + 18,
    y,
    { maxWidth: W - M * 2 - 18 }
  );

  y = 82;
  doc.text(
    `Por medio de la presente se detallan las horas terapéuticas brindadas al beneficiario durante el período señalado, comparando 1ra y 2da quincena conforme al plan aprobado.`,
    M,
    y,
    { maxWidth: W - M * 2 }
  );

  // Tabla
  y = 102;
  doc.setFillColor(240, 240, 240);
  doc.rect(M, y, W - M * 2, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Quincena", M + 3, y + 5);
  doc.text("Horas", M + 60, y + 5);
  doc.text("Tarifa", M + 90, y + 5);
  doc.text("Monto", W - M - 3, y + 5, { align: "right" });
  y += 7;

  doc.setFont("helvetica", "normal");
  const filas = [
    { lbl: `1ra Quincena (01–15 ${d.mes})`, h: d.q1Horas, m: d.q1Monto },
    { lbl: `2da Quincena (16–30 ${d.mes})`, h: d.q2Horas, m: d.q2Monto },
  ];
  for (const r of filas) {
    doc.text(r.lbl, M + 3, y + 5);
    doc.text(`${r.h} h`, M + 60, y + 5);
    doc.text(`$${d.tarifaHora.toFixed(2)}`, M + 90, y + 5);
    doc.text(`$${r.m.toFixed(2)}`, W - M - 3, y + 5, { align: "right" });
    y += 7;
    doc.setDrawColor(225);
    doc.line(M, y, W - M, y);
  }

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.text("Total ejecutado", M + 3, y + 5);
  doc.text(`${d.totalHoras} h`, M + 60, y + 5);
  doc.text(`$${d.totalMonto.toFixed(2)}`, W - M - 3, y + 5, { align: "right" });

  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Aprobado INSS: ${d.aprobadas}h`, M, y);
  doc.text(`Cobertura: ${d.cobertura.toFixed(1)}%`, M + 70, y);
  if (d.excede > 0) {
    y += 6;
    doc.setTextColor(180, 60, 0);
    doc.text(
      d.constancia
        ? `Excedente +${d.excede}h justificado por constancia médica (anexa).`
        : `⚠ Excedente +${d.excede}h SIN constancia — no se incluye en el cobro.`,
      M,
      y
    );
    doc.setTextColor(0);
  }

  y += 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total a pagar:", M + 80, y);
  doc.text(`US$ ${d.totalMonto.toFixed(2)}`, W - M - 2, y, { align: "right" });

  // Firma
  y += 30;
  doc.setDrawColor(0);
  doc.line(M, y, M + 70, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("BCBA Beatriz Urcuyo", M, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Directora Clínica · CIE", M, y + 10);
  doc.text("convenio.inss@cie.ni · +505 2278 0000", M, y + 14);

  piePagina(doc);
  return doc;
}

export function descargarCartaCobroCaso(d: CasoDoc) {
  const doc = generarCartaCobroCaso(d);
  doc.save(`Carta_Cobro_${d.nino.replace(/\s+/g, "_")}_${d.area}_${d.mes}_${d.anio}.pdf`);
}

// ─────────────────────────── Recibo oficial de caja ───────────────────────────
export function generarReciboCaja(d: CasoDoc): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  header(doc, "Recibo oficial de caja", "Comprobante interno · CIE");

  let y = 36;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Folio: ${folio("CIE-RC", d)}`, W - M, y, { align: "right" });
  doc.text(
    `Fecha: ${new Date().toLocaleDateString("es-NI", { day: "numeric", month: "long", year: "numeric" })}`,
    W - M,
    y + 4,
    { align: "right" }
  );

  y = 56;
  doc.setFontSize(10);
  doc.text(`Recibido de: INSS — Convenio CIE`, M, y);
  doc.text(`En concepto de: Servicios ${d.area} brindados a ${d.nino}`, M, y + 6, { maxWidth: W - M * 2 });
  doc.text(`Período: ${d.mes} ${d.anio} · Sede ${d.sede}`, M, y + 14);
  doc.text(`Código INSS beneficiario: ${d.codigoINSS ?? "—"}`, M, y + 20);

  // Caja monto
  y = 94;
  doc.setDrawColor(120);
  doc.roundedRect(M, y, W - M * 2, 28, 3, 3, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Total recibido", M + 4, y + 9);
  doc.setFontSize(20);
  doc.text(`US$ ${d.totalMonto.toFixed(2)}`, W - M - 4, y + 18, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    `${d.totalHoras} horas a $${d.tarifaHora.toFixed(2)} / hora · Q1 ${d.q1Horas}h + Q2 ${d.q2Horas}h`,
    M + 4,
    y + 23
  );

  // Desglose
  y = 132;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Desglose por quincena", M, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.text(`• 1ra Quincena: ${d.q1Horas}h · ${d.sesionesQ1} sesiones · $${d.q1Monto.toFixed(2)}`, M, y + 6);
  doc.text(`• 2da Quincena: ${d.q2Horas}h · ${d.sesionesQ2} sesiones · $${d.q2Monto.toFixed(2)}`, M, y + 12);

  if (d.excede > 0) {
    y += 22;
    doc.setTextColor(180, 60, 0);
    doc.setFontSize(8);
    doc.text(
      d.constancia
        ? `Incluye ${d.excede}h de excedente justificado por constancia médica.`
        : `Excluye ${d.excede}h de excedente sin constancia (no facturable).`,
      M,
      y
    );
    doc.setTextColor(0);
  }

  // Firma
  y = 210;
  doc.setDrawColor(0);
  doc.line(M, y, M + 70, y);
  doc.line(W - M - 70, y, W - M, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Caja · CIE", M, y + 5);
  doc.text("Recibido conforme", W - M, y + 5, { align: "right" });

  piePagina(doc);
  return doc;
}

export function descargarReciboCaja(d: CasoDoc) {
  const doc = generarReciboCaja(d);
  doc.save(`Recibo_Caja_${d.nino.replace(/\s+/g, "_")}_${d.area}_${d.mes}_${d.anio}.pdf`);
}
