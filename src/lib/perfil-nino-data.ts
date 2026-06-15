// Datos demo extendidos para el perfil clínico del niño (Prioridad 2)

export type Caregiver = {
  id: string;
  nombre: string;
  relacion: "Madre" | "Padre" | "Tutor" | "Abuela" | "Abuelo" | "Hermano/a";
  telefono: string;
  correo: string;
  primario: boolean;
};

export type Direccion = {
  id: string;
  tipo: "Casa" | "Escuela" | "Trabajo" | "Otra";
  linea: string;
  ciudad: string;
  departamento: string;
  pais: string;
};

export type EventoCaso = {
  id: string;
  fecha: string;
  tipo: "Llamada" | "Reunión" | "Visita" | "Incidente" | "Cambio de plan";
  titulo: string;
  detalle: string;
  responsable: string;
};

export type SeguroNino = {
  tipo: "INSS" | "Privado" | "Mixto";
  numeroAfiliado: string;        // Nº del niño como beneficiario
  cotizante: string;             // Padre / madre / tutor cotizante
  numeroCotizante: string;       // Nº INSS del cotizante
  empresaCotizante: string;
  parentesco: "Madre" | "Padre" | "Tutor";
  fechaAfiliacion: string;
  vigenciaHasta: string;
  cartaAprobacion: { folio: string; emitida: string; vence: string };
  horasAprobadasMes: Record<"ABA" | "Logopedia" | "Fisioterapia", number>;
  aseguradoraPrivada?: { compania: string; poliza: string; cobertura: string };
  observaciones?: string;
};

export const seguroPorNino: Record<string, SeguroNino> = {
  "001": {
    tipo: "INSS",
    numeroAfiliado: "210-1180-6620-N",
    cotizante: "Carlos Gutiérrez Rivas",
    numeroCotizante: "210-0245-8801",
    empresaCotizante: "BAC Credomatic Nicaragua",
    parentesco: "Padre",
    fechaAfiliacion: "12/08/2024",
    vigenciaHasta: "31/12/2026",
    cartaAprobacion: { folio: "INSS-2026-Q2-0142", emitida: "01/05/2026", vence: "30/06/2026" },
    horasAprobadasMes: { ABA: 36, Logopedia: 8, Fisioterapia: 0 },
    observaciones: "Beneficiario en convenio INSS, evaluación cada 6 meses por BCBA.",
  },
};

export function getSeguro(ninoId: string) {
  return seguroPorNino[ninoId] ?? seguroPorNino["001"];
}



export const caregiversPorNino: Record<string, Caregiver[]> = {
  "001": [
    { id: "c1", nombre: "Laura López Martínez", relacion: "Madre", telefono: "+505 8765 4321", correo: "laura.lopez@correo.com", primario: true },
    { id: "c2", nombre: "Carlos Gutiérrez Rivas", relacion: "Padre", telefono: "+505 8123 4567", correo: "c.gutierrez@correo.com", primario: false },
    { id: "c3", nombre: "Doña Rosa Martínez", relacion: "Abuela", telefono: "+505 8901 2345", correo: "—", primario: false },
  ],
};

export const direccionesPorNino: Record<string, Direccion[]> = {
  "001": [
    { id: "a1", tipo: "Casa", linea: "Reparto San Juan, casa #142, de la UCA 2c al sur", ciudad: "Managua", departamento: "Managua", pais: "Nicaragua" },
    { id: "a2", tipo: "Escuela", linea: "Colegio Bautista, Carretera Masaya km 5", ciudad: "Managua", departamento: "Managua", pais: "Nicaragua" },
  ],
};

export const eventosCasoPorNino: Record<string, EventoCaso[]> = {
  "001": [
    { id: "ev1", fecha: "2026-05-30", tipo: "Reunión", titulo: "Reunión mensual con familia", detalle: "Se revisó progreso de mando funcional. Mamá acepta aumento a 12h ABA.", responsable: "Lic. María Castellón" },
    { id: "ev2", fecha: "2026-05-22", tipo: "Cambio de plan", titulo: "Aprobación nuevo programa", detalle: "Se incorpora 'Mando con frase de 3 palabras' por supervisión clínica.", responsable: "Dra. Ana Lucía Pérez" },
    { id: "ev3", fecha: "2026-05-12", tipo: "Incidente", titulo: "Episodio de gritos prolongados", detalle: "5 min, contexto académico. Plan de conducta aplicado correctamente.", responsable: "Lic. María Castellón" },
    { id: "ev4", fecha: "2026-05-03", tipo: "Llamada", titulo: "Confirmación de carta INSS Q2", detalle: "DAF confirma con familia la renovación de la carta de aprobación.", responsable: "Coord. administrativa" },
  ],
};

export function getCaregivers(ninoId: string) {
  return caregiversPorNino[ninoId] ?? caregiversPorNino["001"];
}
export function getDirecciones(ninoId: string) {
  return direccionesPorNino[ninoId] ?? direccionesPorNino["001"];
}
export function getEventosCaso(ninoId: string) {
  return eventosCasoPorNino[ninoId] ?? eventosCasoPorNino["001"];
}



export type ProgramaNino = {
  id: string;
  nombre: string;
  area: "ABA" | "Logopedia" | "Fisioterapia";
  estado: "linea_base" | "adquisicion" | "mantenimiento" | "masterizado";
  avance: number; // 0-100
  ultimaSesion: string;
};

export type EvaluacionNino = {
  id: string;
  instrumento: "VB-MAPP" | "ABLLS-R" | "AFLS";
  fecha: string;
  evaluador: string;
  resumen: string;
  archivo: string;
};

export type PlanConducta = {
  id: string;
  conductaProblema: string;
  funcion: "escape" | "atencion" | "tangible" | "automatico";
  conductaAlternativa: string;
  conductaReemplazo: string;
  estrategiasAntecedentes: string[];
  estrategiasConsecuencia: string[];
  nivelRiesgo: "bajo" | "medio" | "alto";
  estado: "activo" | "en_revision" | "logrado";
};

export type DocumentoExp = {
  id: string;
  nombre: string;
  tipo: "Administrativo" | "Clínico" | "INSS" | "Evaluación";
  fechaCarga: string;
  cargadoPor: string;
};

export type FacturacionMes = {
  mes: string;
  quincena: 1 | 2;
  horas: Record<string, number>;
  monto: number;
  estado: "pendiente" | "cobrado";
};

export const programasPorNino: Record<string, ProgramaNino[]> = {
  "001": [
    { id: "p1", nombre: "Tacto de objetos comunes", area: "ABA", estado: "masterizado", avance: 100, ultimaSesion: "2026-05-29" },
    { id: "p2", nombre: "Imitación motora gruesa", area: "ABA", estado: "mantenimiento", avance: 92, ultimaSesion: "2026-05-30" },
    { id: "p3", nombre: "Mando con frase de 3 palabras", area: "Logopedia", estado: "adquisicion", avance: 64, ultimaSesion: "2026-05-30" },
    { id: "p4", nombre: "Seguir instrucciones de 2 pasos", area: "ABA", estado: "adquisicion", avance: 55, ultimaSesion: "2026-05-28" },
    { id: "p5", nombre: "Coordinación bilateral", area: "Fisioterapia", estado: "linea_base", avance: 18, ultimaSesion: "2026-05-27" },
  ],
};

export const evaluacionesPorNino: Record<string, EvaluacionNino[]> = {
  "001": [
    { id: "e1", instrumento: "VB-MAPP", fecha: "2026-02-15", evaluador: "Lic. María Castellón", resumen: "Nivel 2 · 78/170 hitos · Fortalezas en mando y tacto, déficit en intraverbales", archivo: "VBMAPP-Mateo-Feb2026.pdf" },
    { id: "e2", instrumento: "ABLLS-R", fecha: "2025-09-10", evaluador: "Dra. Ana Lucía Pérez", resumen: "Áreas A-H con avance significativo, recomendado reforzar imitación", archivo: "ABLLS-Mateo-Sep2025.pdf" },
  ],
};

export const planesConductaPorNino: Record<string, PlanConducta[]> = {
  "001": [
    {
      id: "pc1",
      conductaProblema: "Gritos prolongados al presentar tareas académicas (>30s)",
      funcion: "escape",
      conductaAlternativa: "Solicitar pausa con tarjeta '🛑 descanso'",
      conductaReemplazo: "Tolerar 3 ensayos antes de pedir pausa, con reforzador diferencial (DRO)",
      estrategiasAntecedentes: ["Avisar con timer visual antes de cada bloque", "Ofrecer elección entre 2 tareas"],
      estrategiasConsecuencia: ["Reforzador inmediato al completar 3 ensayos", "Extinción activa de gritos (no liberar tarea)"],
      nivelRiesgo: "medio",
      estado: "activo",
    },
  ],
};

export const documentosPorNino: Record<string, DocumentoExp[]> = {
  "001": [
    { id: "d1", nombre: "Acta de nacimiento", tipo: "Administrativo", fechaCarga: "2025-08-12", cargadoPor: "Recepción" },
    { id: "d2", nombre: "Colilla INSS 2026", tipo: "INSS", fechaCarga: "2026-01-15", cargadoPor: "DAF" },
    { id: "d3", nombre: "Diagnóstico TEA Dr. Morales", tipo: "Clínico", fechaCarga: "2025-07-30", cargadoPor: "Familia" },
    { id: "d4", nombre: "Carta aprobación INSS Q2", tipo: "INSS", fechaCarga: "2026-05-01", cargadoPor: "DAF" },
    { id: "d5", nombre: "Consentimiento ABA", tipo: "Administrativo", fechaCarga: "2025-08-13", cargadoPor: "Coord. clínica" },
    { id: "d6", nombre: "VB-MAPP Feb 2026", tipo: "Evaluación", fechaCarga: "2026-02-15", cargadoPor: "Lic. María Castellón" },
  ],
};

export const documentosObligatorios = [
  "Acta de nacimiento",
  "Colilla INSS 2026",
  "Diagnóstico TEA Dr. Morales",
  "Consentimiento ABA",
  "Contrato firmado",
];

export const facturacionPorNino: Record<string, FacturacionMes[]> = {
  "001": [
    { mes: "Mayo 2026", quincena: 2, horas: { ABA: 18, Logo: 4 }, monto: 24, estado: "pendiente" },
    { mes: "Mayo 2026", quincena: 1, horas: { ABA: 14, Logo: 4 }, monto: 20, estado: "cobrado" },
    { mes: "Abril 2026", quincena: 2, horas: { ABA: 16, Logo: 4 }, monto: 22, estado: "cobrado" },
    { mes: "Abril 2026", quincena: 1, horas: { ABA: 15, Logo: 3 }, monto: 19.5, estado: "cobrado" },
    { mes: "Marzo 2026", quincena: 2, horas: { ABA: 17, Logo: 4 }, monto: 23, estado: "cobrado" },
  ],
};

export function getPrograma(ninoId: string) {
  return programasPorNino[ninoId] ?? programasPorNino["001"];
}
export function getEvaluaciones(ninoId: string) {
  return evaluacionesPorNino[ninoId] ?? evaluacionesPorNino["001"];
}
export function getPlanesConducta(ninoId: string) {
  return planesConductaPorNino[ninoId] ?? planesConductaPorNino["001"];
}
export function getDocumentos(ninoId: string) {
  return documentosPorNino[ninoId] ?? documentosPorNino["001"];
}
export function getFacturacion(ninoId: string) {
  return facturacionPorNino[ninoId] ?? facturacionPorNino["001"];
}

export function calcularProgresoClinico(ninoId: string): number {
  const programas = getPrograma(ninoId);
  if (!programas.length) return 0;
  const master = programas.filter((p) => p.estado === "masterizado" || p.estado === "mantenimiento").length;
  return Math.round((master / programas.length) * 100);
}
