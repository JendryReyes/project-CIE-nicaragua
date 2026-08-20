// TDR v1.3 · 5.11 Módulo transversal de Gestión de Incidentes Clínicos y Seguridad
export type CategoriaIncidente = "conductual" | "medico" | "etico";

export const categoriaLabel: Record<CategoriaIncidente, string> = {
  conductual: "Incidente conductual severo",
  medico: "Evento médico o físico",
  etico: "Riesgo ético / cumplimiento",
};

export const tipologia: Record<CategoriaIncidente, string[]> = {
  conductual: [
    "Autolesión de alta intensidad",
    "Agresión de alta intensidad",
    "Intento de fuga",
    "Crisis que supera el protocolo de contención",
  ],
  medico: [
    "Lesión accidental en sala",
    "Emergencia médica (ej. convulsión)",
    "Error de medicación reportado por la familia",
  ],
  etico: [
    "Uso de procedimiento restrictivo de emergencia",
    "Sospecha de abuso o negligencia",
    "Situación de notificación obligatoria a autoridades",
  ],
};

// 5.11.2 Fases del ciclo de vida
export type FaseIncidente = "registro" | "revision" | "correctivo" | "cerrado";

export const fases: { id: FaseIncidente; nombre: string; detalle: string }[] = [
  { id: "registro", nombre: "1. Respuesta inmediata", detalle: "Formulario rápido del staff presente + notificación crítica automática." },
  { id: "revision", nombre: "2. Revisión clínica administrativa", detalle: "Supervisor o Coordinador documenta el análisis y valida protocolos." },
  { id: "correctivo", nombre: "3. Plan correctivo", detalle: "Acciones preventivas registradas: plan de conducta, re-entrenamiento, derivación." },
  { id: "cerrado", nombre: "4. Cierre y trazabilidad", detalle: "Solo Dirección Clínica valida el cierre. Registro inmutable en auditoría." },
];

export type Incidente = {
  id: string;
  fecha: string;
  hora: string;
  nino: string;
  sede: string;
  categoria: CategoriaIncidente;
  tipo: string;
  severidad: "alta" | "media" | "baja";
  reportadoPor: string;
  involucrados: string;
  testigos: string;
  descripcion: string;
  fase: FaseIncidente;
  notificados: string[];
  analisis?: string;
  protocoloSeguido?: boolean;
  correctivas?: string[];
  responsable?: string;
  cierre?: { por: string; fecha: string };
  notificacionExterna?: boolean;
};

export const incidentes: Incidente[] = [
  {
    id: "INC-2026-018",
    fecha: "2026-08-19",
    hora: "10:24",
    nino: "Marco Delgado",
    sede: "Las Colinas",
    categoria: "conductual",
    tipo: "Crisis que supera el protocolo de contención",
    severidad: "alta",
    reportadoPor: "Lic. Jeyling Ortega (Terapeuta)",
    involucrados: "Paciente, terapeuta de sala",
    testigos: "Lic. Carlos Bermúdez",
    descripcion:
      "Durante la transición de actividad el paciente presentó conducta de golpeo dirigido a sí mismo por 6 minutos, superando el tiempo previsto en el protocolo de desescalada.",
    fase: "correctivo",
    notificados: ["Supervisor Clínico del caso", "Coordinador Clínico", "Administrador de Organización"],
    analisis:
      "Se verificó que el terapeuta aplicó desescalada verbal y retiro de demanda. El protocolo vigente no contempla la duración observada.",
    protocoloSeguido: true,
    correctivas: ["Actualizar plan de conducta con protocolo de crisis extendida", "Re-entrenamiento de sala en desescalada"],
    responsable: "Dra. Ana Lucía Pérez (Supervisora)",
  },
  {
    id: "INC-2026-017",
    fecha: "2026-08-18",
    hora: "14:05",
    nino: "Diego Morales",
    sede: "Estelí",
    categoria: "medico",
    tipo: "Emergencia médica (ej. convulsión)",
    severidad: "alta",
    reportadoPor: "Lic. María Castellón (Terapeuta)",
    involucrados: "Paciente, terapeuta, enfermería de sede",
    testigos: "Recepción de sede",
    descripcion:
      "Episodio convulsivo de aprox. 45 segundos en sala sensorial. Se activó protocolo médico y se contactó a la familia.",
    fase: "cerrado",
    notificados: ["Supervisor Clínico del caso", "Coordinador Clínico", "Dirección Clínica"],
    analisis: "Protocolo médico aplicado correctamente; familia notificada en menos de 10 minutos.",
    protocoloSeguido: true,
    correctivas: ["Derivación a neurología", "Actualizar ficha médica con medicación vigente"],
    responsable: "Dr. Coordinación Clínica Estelí",
    cierre: { por: "Director Clínico", fecha: "2026-08-19" },
  },
  {
    id: "INC-2026-016",
    fecha: "2026-08-17",
    hora: "09:40",
    nino: "Pedro Alvarado",
    sede: "Santo Domingo",
    categoria: "etico",
    tipo: "Uso de procedimiento restrictivo de emergencia",
    severidad: "media",
    reportadoPor: "Lic. Roberto Mendoza (Terapeuta)",
    involucrados: "Paciente, dos terapeutas",
    testigos: "Coordinadora de sala",
    descripcion:
      "Contención física breve (18 segundos) para evitar salida a la vía pública durante intento de fuga.",
    fase: "revision",
    notificados: ["Supervisor Clínico del caso", "Coordinador Clínico", "Administrador de Organización"],
    notificacionExterna: false,
  },
  {
    id: "INC-2026-015",
    fecha: "2026-08-15",
    hora: "11:12",
    nino: "Lucía Castro",
    sede: "Masaya",
    categoria: "medico",
    tipo: "Lesión accidental en sala",
    severidad: "baja",
    reportadoPor: "Lic. Sofía Hernández (Terapeuta)",
    involucrados: "Paciente",
    testigos: "—",
    descripcion: "Raspón en rodilla al tropezar con colchoneta. Se aplicó primeros auxilios y se informó a la familia.",
    fase: "registro",
    notificados: ["Supervisor Clínico del caso", "Coordinador Clínico"],
  },
];

export function resumenIncidentes() {
  const abiertos = incidentes.filter((i) => i.fase !== "cerrado");
  return {
    total: incidentes.length,
    abiertos: abiertos.length,
    altaSeveridad: incidentes.filter((i) => i.severidad === "alta").length,
    sinCorrectivas: incidentes.filter((i) => i.fase !== "cerrado" && !i.correctivas?.length).length,
    cerrados: incidentes.filter((i) => i.fase === "cerrado").length,
    porCategoria: (["conductual", "medico", "etico"] as CategoriaIncidente[]).map((c) => ({
      categoria: c,
      total: incidentes.filter((i) => i.categoria === c).length,
    })),
  };
}
