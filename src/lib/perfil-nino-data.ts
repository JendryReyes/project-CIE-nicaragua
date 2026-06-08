// Datos demo extendidos para el perfil clínico del niño (Prioridad 2)

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
