// Motor de cálculo Asistencia → Facturación (Prioridad 1)
// Convierte sesiones registradas en resúmenes de facturación quincenal.

import { sedesFact, calcularNino, tarifa, type NinoFact, type AreaFact } from "./modulos-data";

export type SesionRegistrada = {
  id: string;
  ninoId: string;
  fecha: string;
  area: AreaFact;
  duracionHoras: number;
  estado: "asistio" | "ausente" | "justificado";
  terapeutaId: string;
  constanciaMedicaId?: string;
  quincena: 1 | 2;
  mes: number;
  anio: number;
  sedeId: string;
};

export type ResumenAreaNino = {
  area: AreaFact;
  horasEjecutadas: number;
  horasAprobadasINSS: number;
  horasFacturables: number;
  horasExcedentes: number;
  horasJustificadas: number;
  horasNoFacturables: number;
  montoFacturable: number;
  tieneConstancia: boolean;
};

export type ResumenFacturacionNino = {
  ninoId: string;
  nombre: string;
  iniciales: string;
  expediente: string;
  sedeId: string;
  inss: boolean;
  periodo: { quincena: 1 | 2; mes: number; anio: number };
  porArea: ResumenAreaNino[];
  totalFacturable: number;
  totalNoFacturable: number;
  totalHoras: number;
  porcentajeUsado: number;
  tieneExcedente: boolean;
  tieneConstancia: boolean;
  requiereRevision: boolean;
  estado: "ok" | "revisar" | "bloqueado";
};

export const limites = {
  IT_PFA_total: 45,
  IT_PFA_fisioLogo: 4,
  TA_TS: 25,
  FisioLogo_individual: 15,
};

export function calcularResumenNino(
  nino: NinoFact,
  periodo: { quincena: 1 | 2; mes: number; anio: number }
): ResumenFacturacionNino {
  const r = calcularNino(nino);
  const porArea: ResumenAreaNino[] = r.detalles.map((d) => {
    const tieneConstancia = !!nino.constancia;
    const justificadas = tieneConstancia ? d.excede : 0;
    const noFacturables = d.excede - justificadas;
    return {
      area: d.area as AreaFact,
      horasEjecutadas: d.ejec,
      horasAprobadasINSS: d.aprobadas,
      horasFacturables: d.facturables,
      horasExcedentes: d.excede,
      horasJustificadas: justificadas,
      horasNoFacturables: noFacturables,
      montoFacturable: d.subtotal,
      tieneConstancia,
    };
  });
  const totalFacturable = porArea.reduce((s, a) => s + a.montoFacturable, 0);
  const totalNoFacturable = porArea.reduce(
    (s, a) => s + a.horasNoFacturables * tarifa[a.area],
    0
  );
  const totalHoras = porArea.reduce((s, a) => s + a.horasFacturables, 0);
  const aprobTotal = porArea.reduce((s, a) => s + a.horasAprobadasINSS, 0);
  const ejecTotal = porArea.reduce((s, a) => s + a.horasEjecutadas, 0);
  const porcentajeUsado = aprobTotal ? Math.round((ejecTotal / aprobTotal) * 100) : 0;
  const tieneExcedente = porArea.some((a) => a.horasExcedentes > 0);
  const tieneConstancia = !!nino.constancia;
  const noOk = porArea.some((a) => a.horasNoFacturables > 0);
  const estado: "ok" | "revisar" | "bloqueado" =
    noOk ? "bloqueado" : tieneExcedente ? "revisar" : "ok";
  return {
    ninoId: nino.id,
    nombre: nino.nombre,
    iniciales: nino.iniciales,
    expediente: nino.expediente,
    sedeId: nino.sedeId,
    inss: nino.inss,
    periodo,
    porArea,
    totalFacturable,
    totalNoFacturable,
    totalHoras,
    porcentajeUsado,
    tieneExcedente,
    tieneConstancia,
    requiereRevision: noOk || tieneExcedente,
    estado,
  };
}

export function calcularResumenSede(
  sedeId: string | "todas",
  periodo: { quincena: 1 | 2; mes: number; anio: number }
) {
  const ninos = sedesFact
    .filter((s) => sedeId === "todas" || s.id === sedeId)
    .flatMap((s) => s.ninos);
  return ninos.map((n) => calcularResumenNino(n, periodo));
}

export function porcentajeColor(p: number) {
  if (p >= 100) return "rojo";
  if (p >= 85) return "ambar";
  return "verde";
}

// Devuelve horas aprobadas y ejecutadas totales de un niño en el período.
export function horasNinoArea(ninoId: string, area: AreaFact) {
  const n = sedesFact.flatMap((s) => s.ninos).find((x) => x.id === ninoId);
  if (!n) return { aprobadas: 0, ejecutadas: 0, porcentaje: 0 };
  const aprobadas = n.aprobadasMes[area] ?? 0;
  const q1 = n.q1[area] ?? 0;
  const ejec = n.ejecQ[area] ?? 0;
  const ejecutadas = q1 + ejec;
  return {
    aprobadas,
    ejecutadas,
    porcentaje: aprobadas ? Math.round((ejecutadas / aprobadas) * 100) : 0,
  };
}
