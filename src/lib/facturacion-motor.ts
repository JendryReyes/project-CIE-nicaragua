// Motor de cálculo Asistencia → Facturación (Prioridad 1)
// Convierte sesiones registradas en resúmenes de facturación quincenal.

import { sedesFact, calcularNino, tarifa, type NinoFact, type AreaFact } from "./modulos-data";
import { suspensionDelPeriodo, type Suspension } from "./suspensiones";


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
  horasSuspendidas: number;
  montoSuspendido: number;
  suspension?: Suspension;
  porcentajeUsado: number;
  tieneExcedente: boolean;
  tieneConstancia: boolean;
  requiereRevision: boolean;
  estado: "ok" | "revisar" | "bloqueado" | "suspendido";
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
  const suspension = suspensionDelPeriodo(nino.id, periodo);
  const horasSuspendidas = suspension?.horasDescontadas ?? 0;

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

  // Descontar proporcionalmente las horas suspendidas
  let horasRestantes = horasSuspendidas;
  let montoSuspendido = 0;
  if (horasRestantes > 0) {
    const totalFact = porArea.reduce((s, a) => s + a.horasFacturables, 0);
    if (totalFact > 0) {
      for (const a of porArea) {
        if (horasRestantes <= 0) break;
        const cuota = Math.min(a.horasFacturables, Math.round((a.horasFacturables / totalFact) * horasSuspendidas));
        const descuento = Math.min(cuota, horasRestantes);
        a.horasFacturables -= descuento;
        const dineroDesc = descuento * tarifa[a.area];
        a.montoFacturable -= dineroDesc;
        montoSuspendido += dineroDesc;
        horasRestantes -= descuento;
      }
    }
  }

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
  const estado: "ok" | "revisar" | "bloqueado" | "suspendido" =
    suspension ? "suspendido" : noOk ? "bloqueado" : tieneExcedente ? "revisar" : "ok";
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
    horasSuspendidas,
    montoSuspendido,
    suspension,
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
  if (p >= 100) return "coral";
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
