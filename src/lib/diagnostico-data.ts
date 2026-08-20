// TDR v1.3 · Parte XII — Gestión del proceso diagnóstico
export type EstadoDx =
  | "Pendiente de evaluación"
  | "En lista de espera"
  | "Programado"
  | "En evaluación"
  | "Pendiente de documentación"
  | "Pendiente de especialista"
  | "Pendiente de revisión"
  | "Diagnóstico aprobado"
  | "Diagnóstico entregado"
  | "Remitido a intervención"
  | "Cancelado";

export const estadosDx: { estado: EstadoDx; descripcion: string }[] = [
  { estado: "Pendiente de evaluación", descripcion: "El caso fue registrado y se espera iniciar el proceso diagnóstico." },
  { estado: "En lista de espera", descripcion: "Pendiente de programación según disponibilidad institucional." },
  { estado: "Programado", descripcion: "Las evaluaciones diagnósticas han sido calendarizadas." },
  { estado: "En evaluación", descripcion: "El proceso diagnóstico se encuentra en ejecución." },
  { estado: "Pendiente de documentación", descripcion: "Documentos o formularios pendientes de la familia o del personal clínico." },
  { estado: "Pendiente de especialista", descripcion: "A la espera de evaluación o informe de un especialista externo." },
  { estado: "Pendiente de revisión", descripcion: "Informe diagnóstico en elaboración o revisión profesional." },
  { estado: "Diagnóstico aprobado", descripcion: "Validado por el profesional responsable." },
  { estado: "Diagnóstico entregado", descripcion: "Informe entregado a la familia." },
  { estado: "Remitido a intervención", descripcion: "El paciente continúa hacia el proceso terapéutico." },
  { estado: "Cancelado", descripcion: "Proceso suspendido o cerrado antes de finalizar." },
];

export type Prioridad = "Alta" | "Media" | "Baja";

export type ProcesoDx = {
  id: string;
  paciente: string;
  edad: number;
  sede: string;
  origen: "Solicitud interna" | "Remisión médica" | "Actualización diagnóstica";
  motivo: string;
  especialidad: string;
  responsable: string;
  prioridad: Prioridad;
  estado: EstadoDx;
  ingreso: string;
  diasEspera: number;
  entrevistaInicial: "No iniciada" | "Parcial (portal padres)" | "Completa";
  instrumentos: { nombre: string; estado: "pendiente" | "aplicado" | "puntuado" }[];
  historialPrioridad?: { de: Prioridad; a: Prioridad; motivo: string; fecha: string; usuario: string }[];
};

export const procesosDx: ProcesoDx[] = [
  {
    id: "DX-2026-041",
    paciente: "Emma Padilla Vargas",
    edad: 3,
    sede: "Santo Domingo",
    origen: "Remisión médica",
    motivo: "Sospecha de TEA · retraso del lenguaje",
    especialidad: "Psicología clínica infantil",
    responsable: "Dra. Ana Lucía Pérez",
    prioridad: "Alta",
    estado: "En evaluación",
    ingreso: "2026-07-28",
    diasEspera: 23,
    entrevistaInicial: "Completa",
    instrumentos: [
      { nombre: "ADOS-2 (Módulo 1)", estado: "aplicado" },
      { nombre: "Vineland-3", estado: "puntuado" },
      { nombre: "M-CHAT-R/F", estado: "puntuado" },
    ],
    historialPrioridad: [
      { de: "Media", a: "Alta", motivo: "Regresión de habilidades reportada por la familia", fecha: "2026-08-04", usuario: "Dra. Ana Lucía Pérez" },
    ],
  },
  {
    id: "DX-2026-040",
    paciente: "Camila Zeledón",
    edad: 3,
    sede: "Masaya",
    origen: "Solicitud interna",
    motivo: "Retraso global del desarrollo",
    especialidad: "Neurodesarrollo",
    responsable: "Coordinación Clínica Masaya",
    prioridad: "Media",
    estado: "Pendiente de especialista",
    ingreso: "2026-07-14",
    diasEspera: 37,
    entrevistaInicial: "Completa",
    instrumentos: [
      { nombre: "Battelle (Inventario de Desarrollo)", estado: "puntuado" },
      { nombre: "Informe de neuropediatría externa", estado: "pendiente" },
    ],
  },
  {
    id: "DX-2026-039",
    paciente: "Lucas Obregón Cruz",
    edad: 5,
    sede: "Santo Domingo",
    origen: "Actualización diagnóstica",
    motivo: "Reevaluación anual de conducta adaptativa",
    especialidad: "Análisis conductual aplicado",
    responsable: "Lic. Jeyling Ortega",
    prioridad: "Baja",
    estado: "Pendiente de revisión",
    ingreso: "2026-06-30",
    diasEspera: 51,
    entrevistaInicial: "Completa",
    instrumentos: [
      { nombre: "ABAS-3", estado: "puntuado" },
      { nombre: "VB-MAPP", estado: "aplicado" },
    ],
  },
  {
    id: "DX-2026-038",
    paciente: "Renata Cárcamo",
    edad: 7,
    sede: "Estelí",
    origen: "Remisión médica",
    motivo: "Reevaluación por epilepsia y ajuste de metas",
    especialidad: "Psicología clínica infantil",
    responsable: "Dra. Ana Lucía Pérez",
    prioridad: "Alta",
    estado: "Programado",
    ingreso: "2026-08-10",
    diasEspera: 10,
    entrevistaInicial: "Parcial (portal padres)",
    instrumentos: [
      { nombre: "WISC-V", estado: "pendiente" },
      { nombre: "Vineland-3", estado: "pendiente" },
    ],
  },
  {
    id: "DX-2026-037",
    paciente: "Isabella Briones",
    edad: 4,
    sede: "Santo Domingo",
    origen: "Solicitud interna",
    motivo: "Evaluación motora y sensorial",
    especialidad: "Fisioterapia / integración sensorial",
    responsable: "Lic. Carlos Bermúdez",
    prioridad: "Media",
    estado: "En lista de espera",
    ingreso: "2026-08-06",
    diasEspera: 14,
    entrevistaInicial: "Parcial (portal padres)",
    instrumentos: [{ nombre: "Perfil Sensorial 2", estado: "pendiente" }],
  },
  {
    id: "DX-2026-036",
    paciente: "Samuel Membreño Pavón",
    edad: 6,
    sede: "Las Colinas",
    origen: "Remisión médica",
    motivo: "Confirmación de TEA nivel 1",
    especialidad: "Psicología clínica infantil",
    responsable: "Dra. Ana Lucía Pérez",
    prioridad: "Media",
    estado: "Diagnóstico entregado",
    ingreso: "2026-05-19",
    diasEspera: 0,
    entrevistaInicial: "Completa",
    instrumentos: [
      { nombre: "ADOS-2 (Módulo 2)", estado: "puntuado" },
      { nombre: "ABAS-3", estado: "puntuado" },
    ],
  },
  {
    id: "DX-2026-035",
    paciente: "Noah Centeno Ríos",
    edad: 7,
    sede: "Santo Domingo",
    origen: "Actualización diagnóstica",
    motivo: "Actualización de perfil para autorización INSS",
    especialidad: "Análisis conductual aplicado",
    responsable: "Lic. María Castellón",
    prioridad: "Baja",
    estado: "Remitido a intervención",
    ingreso: "2026-04-22",
    diasEspera: 0,
    entrevistaInicial: "Completa",
    instrumentos: [{ nombre: "VB-MAPP", estado: "puntuado" }],
  },
  {
    id: "DX-2026-034",
    paciente: "Diego Espinoza Talavera",
    edad: 8,
    sede: "Santo Domingo",
    origen: "Solicitud interna",
    motivo: "Sospecha de TDAH",
    especialidad: "Psicología clínica infantil",
    responsable: "Dra. Ana Lucía Pérez",
    prioridad: "Media",
    estado: "Pendiente de documentación",
    ingreso: "2026-07-31",
    diasEspera: 20,
    entrevistaInicial: "No iniciada",
    instrumentos: [
      { nombre: "Conners-3", estado: "pendiente" },
      { nombre: "Escala de observación escolar", estado: "pendiente" },
    ],
  },
];

// 12.5 Biblioteca de instrumentos diagnósticos
export const instrumentos = [
  { nombre: "ADOS-2", area: "TEA — observación estructurada", rango: "12 m – adultos", escala: "Puntaje de comparación (1–10)", versiones: 2 },
  { nombre: "Vineland-3", area: "Conducta adaptativa", rango: "0 – 90 años", escala: "Estándar (M=100, DE=15)", versiones: 1 },
  { nombre: "VB-MAPP", area: "Hitos verbales y barreras", rango: "0 – 48 m", escala: "Hitos por nivel (1–3)", versiones: 3 },
  { nombre: "ABAS-3", area: "Conducta adaptativa", rango: "0 – 89 años", escala: "Compuesto general", versiones: 1 },
  { nombre: "WISC-V", area: "Capacidad intelectual", rango: "6 – 16 años", escala: "CI total y índices", versiones: 1 },
  { nombre: "Battelle", area: "Desarrollo global", rango: "0 – 8 años", escala: "Cociente de desarrollo", versiones: 2 },
  { nombre: "Perfil Sensorial 2", area: "Procesamiento sensorial", rango: "0 – 14 años", escala: "Cuadrantes sensoriales", versiones: 1 },
  { nombre: "M-CHAT-R/F", area: "Cribado TEA", rango: "16 – 30 m", escala: "Riesgo bajo/medio/alto", versiones: 1 },
  { nombre: "Conners-3", area: "TDAH y conducta", rango: "6 – 18 años", escala: "T-score por escala", versiones: 1 },
];

// 12.4 Formulario configurable de primera entrevista
export const secciones = [
  { nombre: "Datos del paciente y familia", campos: 12, obligatorios: 8 },
  { nombre: "Historia prenatal y perinatal", campos: 14, obligatorios: 6 },
  { nombre: "Hitos del desarrollo", campos: 18, obligatorios: 10 },
  { nombre: "Historial médico y medicación", campos: 11, obligatorios: 5 },
  { nombre: "Conducta y regulación", campos: 16, obligatorios: 7 },
  { nombre: "Comunicación y lenguaje", campos: 13, obligatorios: 6 },
  { nombre: "Escolaridad y entorno social", campos: 9, obligatorios: 4 },
  { nombre: "Motivo de consulta y expectativas", campos: 6, obligatorios: 3 },
];

export const prioridadTono: Record<Prioridad, string> = {
  Alta: "bg-[oklch(0.95_0.06_28)] text-[oklch(0.45_0.15_28)]",
  Media: "bg-[oklch(0.95_0.07_70)] text-[oklch(0.44_0.13_70)]",
  Baja: "bg-[oklch(0.94_0.05_155)] text-[oklch(0.36_0.11_155)]",
};

export function resumenDx() {
  const abiertos = procesosDx.filter(
    (p) => !["Diagnóstico entregado", "Remitido a intervención", "Cancelado"].includes(p.estado),
  );
  return {
    total: procesosDx.length,
    abiertos: abiertos.length,
    espera: procesosDx.filter((p) => p.estado === "En lista de espera").length,
    prioridadAlta: abiertos.filter((p) => p.prioridad === "Alta").length,
    esperaPromedio: Math.round(abiertos.reduce((a, p) => a + p.diasEspera, 0) / Math.max(1, abiertos.length)),
    entregados: procesosDx.filter((p) => p.estado === "Diagnóstico entregado" || p.estado === "Remitido a intervención").length,
  };
}
