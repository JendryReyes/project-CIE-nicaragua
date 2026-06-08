// Carta de cobro personalizada al INSS (Prioridad 3)

import jsPDF from "jspdf";
import { tarifa, sedesFact } from "./modulos-data";
import type { ResumenFacturacionNino } from "./facturacion-motor";

const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function nombreSede(sedeId: string) {
  return sedesFact.find((s) => s.id === sedeId)?.nombre ?? sedeId;
}

export function generarCartaCobro(resumen: ResumenFacturacionNino, opts: { folio?: string } = {}): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const M = 18;
  let y = 20;

  // Encabezado CIE
  doc.setFillColor(15, 76, 117);
  doc.rect(0, 0, W, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CIE · Centro Integral Especializado", M, 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Convenio INSS · Servicios de rehabilitación pediátrica", W - M, 8, { align: "right" });

  doc.setTextColor(0, 0, 0);
  y = 22;
  doc.setFontSize(9);
  doc.text(`Folio: ${opts.folio ?? `CIE-${resumen.periodo.anio}-${resumen.ninoId.toUpperCase()}-Q${resumen.periodo.quincena}`}`, W - M, y, { align: "right" });
  doc.text(`Managua, ${new Date().toLocaleDateString("es-NI", { day: "numeric", month: "long", year: "numeric" })}`, W - M, y + 4, { align: "right" });

  y = 36;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Lic. Dirección de Convenios y Prestaciones Médicas", M, y);
  doc.setFont("helvetica", "normal");
  doc.text("Instituto Nicaragüense de Seguridad Social", M, y + 5);
  doc.text("Su despacho.—", M, y + 10);

  y = 56;
  doc.setFont("helvetica", "bold");
  doc.text("Asunto:", M, y);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Cobro de servicios terapéuticos brindados al beneficiario ${resumen.nombre}, ` +
    `período Q${resumen.periodo.quincena} de ${meses[resumen.periodo.mes - 1]} ${resumen.periodo.anio}.`,
    M + 18, y, { maxWidth: W - M * 2 - 18 }
  );

  y = 76;
  const cuerpo =
    `Por medio de la presente, el Centro Integral Especializado (CIE) – Sede ${nombreSede(resumen.sedeId)}, ` +
    `presenta el detalle de horas terapéuticas brindadas al beneficiario ${resumen.nombre} ` +
    `(expediente ${resumen.expediente}), correspondientes al período señalado, conforme al plan de atención ` +
    `aprobado por el INSS. El detalle por área se presenta a continuación:`;
  doc.text(cuerpo, M, y, { maxWidth: W - M * 2, align: "justify" });

  // Tabla
  y = 110;
  doc.setFillColor(240, 240, 240);
  doc.rect(M, y, W - M * 2, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Área", M + 3, y + 5);
  doc.text("Aprob.", M + 60, y + 5);
  doc.text("Ejec.", M + 80, y + 5);
  doc.text("Fact.", M + 100, y + 5);
  doc.text("Tarifa", M + 120, y + 5);
  doc.text("Subtotal", W - M - 3, y + 5, { align: "right" });

  y += 7;
  doc.setFont("helvetica", "normal");
  for (const a of resumen.porArea) {
    doc.text(a.area, M + 3, y + 5);
    doc.text(`${a.horasAprobadasINSS}h`, M + 60, y + 5);
    doc.text(`${a.horasEjecutadas}h`, M + 80, y + 5);
    doc.text(`${a.horasFacturables}h`, M + 100, y + 5);
    doc.text(`$${tarifa[a.area].toFixed(2)}`, M + 120, y + 5);
    doc.text(`$${a.montoFacturable.toFixed(2)}`, W - M - 3, y + 5, { align: "right" });
    y += 6;
    doc.setDrawColor(220);
    doc.line(M, y, W - M, y);
  }

  if (resumen.horasSuspendidas > 0) {
    doc.setTextColor(180, 80, 0);
    doc.text(`Descuento por suspensión (${resumen.horasSuspendidas}h)`, M + 3, y + 5);
    doc.text(`-$${resumen.montoSuspendido.toFixed(2)}`, W - M - 3, y + 5, { align: "right" });
    doc.setTextColor(0);
    y += 6;
    doc.line(M, y, W - M, y);
  }

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Total a pagar:", M + 100, y + 5);
  doc.text(`US$ ${resumen.totalFacturable.toFixed(2)}`, W - M - 3, y + 5, { align: "right" });

  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (resumen.tieneConstancia && resumen.tieneExcedente) {
    doc.text(
      "Se adjunta constancia médica que justifica las horas excedentes al plan aprobado, conforme al artículo 27 del convenio vigente.",
      M, y, { maxWidth: W - M * 2 }
    );
    y += 10;
  }
  if (resumen.suspension) {
    doc.text(
      `Se aplica descuento por pausa terapéutica: ${resumen.suspension.motivo}.`,
      M, y, { maxWidth: W - M * 2 }
    );
    y += 8;
  }

  y = Math.max(y + 12, 200);
  doc.text("Sin otro particular, agradecemos su atención.", M, y);

  y += 22;
  doc.line(M, y, M + 70, y);
  doc.setFont("helvetica", "bold");
  doc.text("Dra. Ana Patricia Cuadra", M, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Directora Médica · CIE", M, y + 10);
  doc.text("convenio.inss@cie.ni · +505 2278 0000", M, y + 14);

  // Pie
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text(
    `Documento generado automáticamente por CIETrack · ${new Date().toISOString()}`,
    W / 2, 270, { align: "center" }
  );

  return doc;
}

export function descargarCarta(resumen: ResumenFacturacionNino) {
  const doc = generarCartaCobro(resumen);
  doc.save(`Carta_Cobro_${resumen.nombre.replace(/\s+/g, "_")}_Q${resumen.periodo.quincena}_${resumen.periodo.mes}.pdf`);
}
