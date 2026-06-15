// Carta de cobro institucional al INSS — consolida todo el período (Q1+Q2)
// generada desde el comparativo de quincenas.

import jsPDF from "jspdf";
import { cumplimientoColillas } from "./colillas-inss";

export type FilaCobro = {
  nino: string;
  codigoINSS?: string;
  sede: string;
  area: string;
  aprobadas: number;
  q1Horas: number;
  q2Horas: number;
  totalHoras: number;
  brecha: number;
  totalMonto: number;
  excede: number;
  constancia: boolean;
};

export type DatosCarta = {
  mes: string;
  anio: string;
  sede: string;
  filas: FilaCobro[];
  totales: {
    aprobadas: number;
    q1Horas: number;
    q2Horas: number;
    totalHoras: number;
    totalMonto: number;
    excedentes: number;
    cobertura: number;
  };
};

const M = 15;

export function generarCartaCobroInstitucional(data: DatosCarta): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header
  doc.setFillColor(15, 76, 117);
  doc.rect(0, 0, W, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CIE · Centro Integral Especializado", M, 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Convenio INSS · Carta de cobro consolidada", W - M, 8, { align: "right" });
  doc.setTextColor(0);

  y = 20;
  doc.setFontSize(9);
  doc.text(
    `Folio: CIE-${data.anio}-${data.mes.substring(0, 3).toUpperCase()}-CONS`,
    W - M,
    y,
    { align: "right" }
  );
  doc.text(
    `Managua, ${new Date().toLocaleDateString("es-NI", { day: "numeric", month: "long", year: "numeric" })}`,
    W - M,
    y + 4,
    { align: "right" }
  );

  y = 32;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Lic. Dirección de Convenios y Prestaciones Médicas", M, y);
  doc.setFont("helvetica", "normal");
  doc.text("Instituto Nicaragüense de Seguridad Social", M, y + 5);
  doc.text("Su despacho.—", M, y + 10);

  y = 52;
  doc.setFont("helvetica", "bold");
  doc.text("Asunto:", M, y);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Cobro consolidado de servicios terapéuticos (Q1 + Q2) — ${data.mes} ${data.anio}, sede ${data.sede}.`,
    M + 18,
    y,
    { maxWidth: W - M * 2 - 18 }
  );

  y = 66;
  doc.text(
    `Por medio de la presente, el Centro Integral Especializado presenta el detalle consolidado de horas terapéuticas brindadas a los beneficiarios del INSS durante ${data.mes} ${data.anio}, comparando la 1ra y 2da quincena del período, conforme a los planes de atención aprobados.`,
    M,
    y,
    { maxWidth: W - M * 2, align: "justify" }
  );

  // Tabla por niño
  y = 88;
  doc.setFillColor(240, 240, 240);
  doc.rect(M, y, W - M * 2, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Beneficiario / INSS", M + 2, y + 4);
  doc.text("Área", M + 78, y + 4);
  doc.text("Aprob", M + 100, y + 4);
  doc.text("Q1", M + 118, y + 4);
  doc.text("Q2", M + 132, y + 4);
  doc.text("Total", M + 146, y + 4);
  doc.text("Monto", W - M - 2, y + 4, { align: "right" });

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  for (const f of data.filas) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.text(`${f.nino}`, M + 2, y + 4);
    doc.setTextColor(120);
    doc.setFontSize(7);
    doc.text(`INSS ${f.codigoINSS ?? "—"} · ${f.sede}`, M + 2, y + 7.5);
    doc.setFontSize(8);
    doc.setTextColor(0);
    doc.text(f.area, M + 78, y + 4);
    doc.text(`${f.aprobadas}h`, M + 100, y + 4);
    doc.text(`${f.q1Horas}h`, M + 118, y + 4);
    doc.text(`${f.q2Horas}h`, M + 132, y + 4);
    doc.text(`${f.totalHoras}h`, M + 146, y + 4);
    doc.text(`$${f.totalMonto.toFixed(2)}`, W - M - 2, y + 4, { align: "right" });
    if (f.excede > 0) {
      doc.setTextColor(180, 60, 0);
      doc.setFontSize(7);
      doc.text(
        f.constancia
          ? `Excedente +${f.excede}h justificado por constancia médica`
          : `⚠ Excedente +${f.excede}h SIN constancia (no facturable)`,
        M + 2,
        y + 10.5
      );
      doc.setTextColor(0);
      doc.setFontSize(8);
      y += 4;
    }
    y += 9;
    doc.setDrawColor(225);
    doc.line(M, y - 1, W - M, y - 1);
  }

  // Totales
  y += 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Totales consolidados", M, y + 4);
  y += 8;
  doc.setFontSize(9);
  doc.text(`Aprobado INSS: ${data.totales.aprobadas}h`, M, y);
  doc.text(`Q1: ${data.totales.q1Horas}h`, M + 60, y);
  doc.text(`Q2: ${data.totales.q2Horas}h`, M + 90, y);
  doc.text(`Ejecutado: ${data.totales.totalHoras}h`, M + 120, y);
  y += 6;
  doc.text(`Cobertura: ${data.totales.cobertura.toFixed(1)}%`, M, y);
  if (data.totales.excedentes > 0) {
    doc.setTextColor(180, 60, 0);
    doc.text(`Excedentes detectados: ${data.totales.excedentes}h`, M + 60, y);
    doc.setTextColor(0);
  }
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Total a pagar:", M + 90, y);
  doc.text(`US$ ${data.totales.totalMonto.toFixed(2)}`, W - M - 2, y, { align: "right" });

  // Anexo: Cumplimiento de colillas
  doc.addPage();
  y = 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Anexo: Cumplimiento de Colillas INSS", M, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    "Constancia de aportes vigentes de los cotizantes responsables de cada beneficiario.",
    M,
    y
  );
  y += 8;

  doc.setFillColor(240, 240, 240);
  doc.rect(M, y, W - M * 2, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Beneficiario", M + 2, y + 4);
  doc.text("Cotizante / Empresa", M + 65, y + 4);
  doc.text("Nº Afiliado", M + 130, y + 4);
  doc.text("Estado", W - M - 2, y + 4, { align: "right" });
  y += 6;

  doc.setFont("helvetica", "normal");
  for (const c of cumplimientoColillas) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    const faltantes = c.colillas.filter((m) => !m.recibida).length;
    const ok = faltantes === 0;
    doc.text(c.ninoNombre, M + 2, y + 4);
    doc.setTextColor(120);
    doc.setFontSize(7);
    doc.text(`INSS ${c.codigoINSS}`, M + 2, y + 7.5);
    doc.setFontSize(8);
    doc.setTextColor(0);
    doc.text(c.cotizante, M + 65, y + 4);
    doc.setTextColor(120);
    doc.setFontSize(7);
    doc.text(c.empresa, M + 65, y + 7.5);
    doc.setFontSize(8);
    doc.setTextColor(0);
    doc.text(c.numeroAfiliado, M + 130, y + 4);
    if (ok) {
      doc.setTextColor(30, 120, 50);
      doc.text("Al día (6/6)", W - M - 2, y + 4, { align: "right" });
    } else {
      doc.setTextColor(180, 60, 0);
      doc.text(`${6 - faltantes}/6 · faltan ${faltantes}`, W - M - 2, y + 4, { align: "right" });
    }
    doc.setTextColor(0);
    y += 10;
    doc.setDrawColor(225);
    doc.line(M, y - 1, W - M, y - 1);
  }

  // Firma
  y += 14;
  if (y > 250) {
    doc.addPage();
    y = 30;
  }
  doc.line(M, y, M + 70, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("BCBA Beatriz Urcuyo", M, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Directora Clínica · CIE", M, y + 10);
  doc.text("convenio.inss@cie.ni · +505 2278 0000", M, y + 14);

  // Pie de página en todas las páginas
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

  return doc;
}

export function descargarCartaInstitucional(data: DatosCarta) {
  const doc = generarCartaCobroInstitucional(data);
  doc.save(`Carta_Cobro_INSS_${data.mes}_${data.anio}_${data.sede.replace(/\s+/g, "_")}.pdf`);
}
