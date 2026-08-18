import { z } from "zod";
import { sedesFact, calcularNino } from "./modulos-data";
import { puntualidadHoy, totalesPuntualidad } from "./puntualidad-data";
import { catalogoCIE } from "./catalogo-cie";
import { ninosPlan, sedesPlan, supervisoresPlan, totales, motivosResumen } from "./planificacion-data";

export const agentTools = {
  listarSedes: {
    description: "Lista las sedes del CIE con ciudad y cantidad de niños registrados.",
    parameters: z.object({}),
    execute: async () => {
      return sedesFact.map((s) => ({
        id: s.id,
        nombre: s.nombre,
        ciudad: s.ciudad,
        ninos: s.ninos.length,
        ninosINSS: s.ninos.filter((n) => n.inss).length,
      }));
    },
  },
  listarNinos: {
    description: "Lista los niños atendidos, opcionalmente filtrados por sede o pagador INSS.",
    parameters: z.object({
      sedeId: z.string().optional().describe("Filtra por id de sede, p. ej. 'sd', 'lc', 'esteli'."),
      soloINSS: z.boolean().optional().describe("Si es true, solo devuelve casos INSS."),
    }),
    execute: async ({ sedeId, soloINSS }: { sedeId?: string; soloINSS?: boolean }) => {
      return sedesFact
        .filter((s) => !sedeId || s.id === sedeId)
        .flatMap((s) =>
          s.ninos
            .filter((n) => (soloINSS ? n.inss : true))
            .map((n) => ({
              id: n.id,
              nombre: n.nombre,
              sede: s.nombre,
              expediente: n.expediente,
              codigoINSS: n.codigoINSS ?? null,
              pagador: n.inss ? "INSS" : n.privado ? "Privado" : "Otro",
              aprobadasMes: n.aprobadasMes,
            })),
        );
    },
  },
  resumenFacturacion: {
    description:
      "Calcula el resumen de facturación de la quincena (horas aprobadas, ejecutadas, facturables, excedentes y monto) por sede o para un niño específico.",
    parameters: z.object({
      sedeId: z.string().optional().describe("Id de sede para limitar el resumen."),
      ninoId: z.string().optional().describe("Id del niño para un detalle individual."),
    }),
    execute: async ({ sedeId, ninoId }: { sedeId?: string; ninoId?: string }) => {
      const filas = sedesFact
        .filter((s) => !sedeId || s.id === sedeId)
        .flatMap((s) =>
          s.ninos
            .filter((n) => !ninoId || n.id === ninoId)
            .map((n) => {
              const c = calcularNino(n);
              return {
                ninoId: n.id,
                nombre: n.nombre,
                sede: s.nombre,
                pagador: n.inss ? "INSS" : "Privado",
                horasFacturables: c.totalHoras,
                montoUSD: Number(c.total.toFixed(2)),
                excedeAprobado: c.tieneExcede,
                constanciaMedica: !!n.constancia,
                detallePorArea: c.detalles,
              };
            }),
        );

      const resumen = {
        casos: filas.length,
        horasFacturables: filas.reduce((a, f) => a + f.horasFacturables, 0),
        montoUSD: Number(filas.reduce((a, f) => a + f.montoUSD, 0).toFixed(2)),
        casosConExcedente: filas.filter((f) => f.excedeAprobado).length,
        casosConExcedenteSinConstancia: filas.filter((f) => f.excedeAprobado && !f.constanciaMedica).length,
      };

      return { resumen, filas };
    },
  },
  reportePuntualidad: {
    description:
      "Devuelve el reporte de puntualidad y asistencia del día por sede: atendidos, a tiempo, tarde leve, tarde, ausentes y desviación promedio.",
    parameters: z.object({}),
    execute: async () => {
      return { totales: totalesPuntualidad(), porSede: puntualidadHoy };
    },
  },
  resumenPlanificacion: {
    description:
      "Devuelve la planificación de horas: totales, desglose por sede y por supervisor, motivos de horas no programadas y el detalle por niño.",
    parameters: z.object({}),
    execute: async () => {
      return {
        totales: totales(),
        porSede: sedesPlan,
        porSupervisor: supervisoresPlan,
        motivos: motivosResumen(),
        porNino: ninosPlan,
      };
    },
  },
  catalogoServicios: {
    description:
      "Lista los servicios clínicos del CIE con área, rango de edad, modalidad, cupo INSS, cupo ocupado y modelos clínicos aplicados.",
    parameters: z.object({}),
    execute: async () => {
      return catalogoCIE.map((s) => ({
        ...s,
        disponibles: Math.max(0, s.cupoINSS - s.cupoOcupado),
      }));
    },
  },
};

export type AgentTools = typeof agentTools;
