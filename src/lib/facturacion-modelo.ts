// Modelo extendido de facturación INSS — pagadores, matrícula y servicios eventuales.
// Demo en frontend; sin persistencia. Helpers para los reportes y la pantalla de depuración.

import { sedesFact, type NinoFact, type AreaFact, tarifa } from "./modulos-data";

// ---------- Pagador ----------
export type TipoPagador = "INSS" | "Privado" | "Pro-bono";

export type Pagador = {
  ninoId: string;
  tipo: TipoPagador;
  desde: string; // ISO
  hasta?: string; // undefined = activo
  notas?: string;
};

// Histórico de pagadores (uno activo a la vez por niño)
export const pagadores: Pagador[] = [
  { ninoId: "n-iv", tipo: "Privado", desde: "2025-01-01", notas: "Convenio directo con familia" },
  { ninoId: "n-cz", tipo: "Pro-bono", desde: "2024-06-01", notas: "Patrocinio fundación Casa Azul" },
  // El resto se asume INSS por defecto si nino.inss === true
];

export function pagadorActivo(ninoId: string, fechaISO?: string): TipoPagador {
  const fecha = fechaISO ? new Date(fechaISO) : new Date();
  const explicito = pagadores.find((p) => {
    if (p.ninoId !== ninoId) return false;
    const desde = new Date(p.desde);
    const hasta = p.hasta ? new Date(p.hasta) : new Date(8640000000000000);
    return desde <= fecha && hasta >= fecha;
  });
  if (explicito) return explicito.tipo;
  const nino = sedesFact.flatMap((s) => s.ninos).find((n) => n.id === ninoId);
  if (nino?.privado) return "Privado";
  if (nino?.inss) return "INSS";
  return "Pro-bono";
}

// ---------- Estado de matrícula ----------
export type EstadoMatriculaTipo = "activo" | "baja" | "suspension";

export type EstadoMatricula = {
  ninoId: string;
  tipo: EstadoMatriculaTipo;
  desde: string;
  hasta?: string;
  motivo?: string;
  responsable?: string;
};

export const estadosMatricula: EstadoMatricula[] = [
  {
    ninoId: "n-md",
    tipo: "suspension",
    desde: "2026-05-18",
    hasta: "2026-05-28",
    motivo: "Crisis conductual — pausa terapéutica",
    responsable: "Dra. María Castro",
  },
  {
    ninoId: "n-cr",
    tipo: "suspension",
    desde: "2026-05-20",
    hasta: "2026-05-30",
    motivo: "Enfermedad familiar prolongada",
    responsable: "Coord. Andrea Rivas",
  },
  {
    ninoId: "n-007-old",
    tipo: "baja",
    desde: "2026-05-09",
    motivo: "Alta terapéutica por objetivos cumplidos",
    responsable: "Dra. María Castro",
  },
];

export function estadoMatricula(ninoId: string, fechaISO?: string): EstadoMatriculaTipo {
  const fecha = fechaISO ? new Date(fechaISO) : new Date();
  const m = estadosMatricula.find((e) => {
    if (e.ninoId !== ninoId) return false;
    const d = new Date(e.desde);
    const h = e.hasta ? new Date(e.hasta) : new Date(8640000000000000);
    return d <= fecha && h >= fecha;
  });
  return m?.tipo ?? "activo";
}

// ---------- Servicios eventuales ----------
export type TipoServicioEventual =
  | "ADOS-2"
  | "Eval Fisioterapia"
  | "Eval Logopedia"
  | "Visita escolar"
  | "Neuropediatría";

export const tarifaEventual: Record<TipoServicioEventual, number> = {
  "ADOS-2": 350,
  "Eval Fisioterapia": 80,
  "Eval Logopedia": 80,
  "Visita escolar": 95,
  "Neuropediatría": 120,
};

export type ServicioEventual = {
  id: string;
  ninoId: string;
  ninoNombre: string;
  sedeId: string;
  tipo: TipoServicioEventual;
  fecha: string; // ISO
  monto: number;
  pagador: TipoPagador;
  // adjuntos: simulados (true/false)
  informeAdjunto: boolean;
  reciboFirmado: boolean;
  cartaINSS: boolean;
  incluirEnLote: boolean;
  notas?: string;
};

export const serviciosEventuales: ServicioEventual[] = [
  {
    id: "SE-001",
    ninoId: "n-mr",
    ninoNombre: "Mateo Rodríguez",
    sedeId: "sd",
    tipo: "ADOS-2",
    fecha: "2026-05-19",
    monto: 350,
    pagador: "INSS",
    informeAdjunto: true,
    reciboFirmado: true,
    cartaINSS: true,
    incluirEnLote: true,
  },
  {
    id: "SE-002",
    ninoId: "n-et",
    ninoNombre: "Emilio Torres",
    sedeId: "sd",
    tipo: "Neuropediatría",
    fecha: "2026-05-22",
    monto: 120,
    pagador: "INSS",
    informeAdjunto: true,
    reciboFirmado: true,
    cartaINSS: true,
    incluirEnLote: true,
  },
  {
    id: "SE-003",
    ninoId: "n-ds",
    ninoNombre: "Diego Solís",
    sedeId: "sd",
    tipo: "Visita escolar",
    fecha: "2026-05-24",
    monto: 95,
    pagador: "INSS",
    informeAdjunto: true,
    reciboFirmado: false,
    cartaINSS: true,
    incluirEnLote: false,
    notas: "Falta firma del recibo de conformidad",
  },
  {
    id: "SE-004",
    ninoId: "n-vg",
    ninoNombre: "Valentina Gutiérrez",
    sedeId: "esteli",
    tipo: "Eval Fisioterapia",
    fecha: "2026-05-26",
    monto: 80,
    pagador: "INSS",
    informeAdjunto: true,
    reciboFirmado: true,
    cartaINSS: true,
    incluirEnLote: true,
  },
  {
    id: "SE-005",
    ninoId: "n-iv",
    ninoNombre: "Isabella Vega",
    sedeId: "sd",
    tipo: "Eval Logopedia",
    fecha: "2026-05-27",
    monto: 80,
    pagador: "Privado",
    informeAdjunto: true,
    reciboFirmado: true,
    cartaINSS: false,
    incluirEnLote: true,
  },
];

export function serviciosEventualesDelCorte(
  quincena: "Q1" | "Q2",
  mes: number,
  anio: number,
  sedeId: string | "todas" = "todas"
): ServicioEventual[] {
  const dMin = quincena === "Q1" ? 1 : 16;
  const dMax = quincena === "Q1" ? 15 : 31;
  return serviciosEventuales.filter((s) => {
    const d = new Date(s.fecha);
    if (d.getFullYear() !== anio || d.getMonth() + 1 !== mes) return false;
    const day = d.getDate();
    if (day < dMin || day > dMax) return false;
    if (sedeId !== "todas" && s.sedeId !== sedeId) return false;
    return true;
  });
}

// ---------- Sesiones simuladas (depuración) ----------
// Generamos N sesiones por niño a partir de ejecQ para poder togglearlas individualmente.
export type SesionDepuracion = {
  id: string;
  ninoId: string;
  ninoNombre: string;
  sedeId: string;
  area: AreaFact;
  fecha: string;
  duracion: number; // horas
  terapeuta: string;
  facturable: boolean; // bandera contable, no toca el registro clínico
  clasificacion: "INSS" | "Privada" | "Pro-bono" | "Fuera de Contrato";
  motivoNoFact?: string;
};

const terapeutasDemo = [
  "Lic. Andrea Rivas",
  "Lic. Sofía Hernández",
  "Lic. Carlos Bermúdez",
  "Lic. María Castellón",
];

export function generarSesionesQuincena(
  quincena: "Q1" | "Q2",
  mes: number,
  anio: number
): SesionDepuracion[] {
  const dBase = quincena === "Q1" ? 1 : 16;
  const out: SesionDepuracion[] = [];
  const ninos = sedesFact.flatMap((s) => s.ninos);
  for (const n of ninos) {
    const pagador = pagadorActivo(n.id, `${anio}-${String(mes).padStart(2, "0")}-${String(dBase).padStart(2, "0")}`);
    const estado = estadoMatricula(n.id);
    if (estado === "baja") continue;
    (Object.keys(n.ejecQ) as AreaFact[]).forEach((area) => {
      const horas = n.ejecQ[area] ?? 0;
      const aprob = n.aprobadasMes[area] ?? 0;
      const q1 = n.q1[area] ?? 0;
      const restante = Math.max(0, aprob - q1);
      // Una sesión por hora (simplificado)
      for (let i = 0; i < horas; i++) {
        const dia = dBase + (i % 12);
        const clas: SesionDepuracion["clasificacion"] =
          pagador === "Privado"
            ? "Privada"
            : pagador === "Pro-bono"
            ? "Pro-bono"
            : i < restante
            ? "INSS"
            : n.constancia
            ? "INSS"
            : "Fuera de Contrato";
        out.push({
          id: `${n.id}-${area}-${i}-${quincena}`,
          ninoId: n.id,
          ninoNombre: n.nombre,
          sedeId: n.sedeId,
          area,
          fecha: `${anio}-${String(mes).padStart(2, "0")}-${String(Math.min(dia, quincena === "Q1" ? 15 : 30)).padStart(2, "0")}`,
          duracion: 1,
          terapeuta: terapeutasDemo[(area.length + i) % terapeutasDemo.length],
          facturable: clas !== "Fuera de Contrato",
          clasificacion: clas,
          motivoNoFact: clas === "Fuera de Contrato" ? "Excede aprobación INSS sin constancia médica" : undefined,
        });
      }
    });
  }
  return out;
}

// ---------- Inasistencias mock (para reporte) ----------
export type Inasistencia = {
  ninoId: string;
  ninoNombre: string;
  sedeId: string;
  fecha: string;
  area: AreaFact;
  motivo: string;
  justificada: boolean;
  horas: number;
};

export const inasistencias: Inasistencia[] = [
  { ninoId: "n-mr", ninoNombre: "Mateo Rodríguez", sedeId: "sd", fecha: "2026-05-17", area: "ABA", motivo: "Enfermedad", justificada: true, horas: 1 },
  { ninoId: "n-et", ninoNombre: "Emilio Torres", sedeId: "sd", fecha: "2026-05-19", area: "Logo", motivo: "Compromiso familiar", justificada: false, horas: 1 },
  { ninoId: "n-cr", ninoNombre: "Camila Ríos", sedeId: "sd", fecha: "2026-05-21", area: "ABA", motivo: "Enfermedad familiar", justificada: true, horas: 2 },
  { ninoId: "n-vg", ninoNombre: "Valentina Gutiérrez", sedeId: "esteli", fecha: "2026-05-23", area: "Fisio", motivo: "Sin aviso", justificada: false, horas: 1 },
  { ninoId: "n-md", ninoNombre: "Marco Delgado", sedeId: "lc", fecha: "2026-05-26", area: "ABA", motivo: "Suspensión activa", justificada: true, horas: 2 },
];

export function tarifaHora(area: AreaFact) {
  return tarifa[area];
}

// Re-exports para consumo cómodo
export type { NinoFact, AreaFact };
