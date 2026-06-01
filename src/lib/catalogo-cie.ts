export type ServicioCIE = {
  id: string;
  nombre: string;
  area: string;
  edadMin: number;
  edadMax: number;
  modalidad: "Individual" | "Grupal" | "Familiar" | "Mixto";
  cupoINSS: number;
  cupoOcupado: number;
  modelos: string[];
  descripcion: string;
};

export const catalogoCIE: ServicioCIE[] = [
  {
    id: "it",
    nombre: "Intervención Temprana",
    area: "Desarrollo",
    edadMin: 0, edadMax: 4,
    modalidad: "Individual",
    cupoINSS: 20, cupoOcupado: 17,
    modelos: ["ESDM", "ABA"],
    descripcion: "Estimulación temprana basada en rutinas conjuntas y aprendizaje natural.",
  },
  {
    id: "pfa",
    nombre: "Práctica Funcional (PFA)",
    area: "Conducta",
    edadMin: 3, edadMax: 18,
    modalidad: "Individual",
    cupoINSS: 12, cupoOcupado: 11,
    modelos: ["Hanley / SBT"],
    descripcion: "Tratamiento basado en habilidades con plan de crisis individualizado.",
  },
  {
    id: "hab-soc",
    nombre: "Habilidades Sociales",
    area: "Social",
    edadMin: 5, edadMax: 14,
    modalidad: "Grupal",
    cupoINSS: 24, cupoOcupado: 18,
    modelos: ["ABA grupal"],
    descripcion: "Grupos de 4–6 niños trabajando teoría de la mente y juego cooperativo.",
  },
  {
    id: "fisio",
    nombre: "Fisioterapia sensorial",
    area: "Sensorial",
    edadMin: 0, edadMax: 18,
    modalidad: "Individual",
    cupoINSS: 30, cupoOcupado: 25,
    modelos: ["Integración sensorial"],
    descripcion: "Regulación, planificación motora y modulación sensorial.",
  },
  {
    id: "logo",
    nombre: "Logopedia",
    area: "Lenguaje",
    edadMin: 2, edadMax: 18,
    modalidad: "Individual",
    cupoINSS: 28, cupoOcupado: 26,
    modelos: ["PROMPT", "Hanen"],
    descripcion: "Habla, lenguaje expresivo/comprensivo y alimentación.",
  },
  {
    id: "eval",
    nombre: "Evaluaciones diagnósticas",
    area: "Diagnóstico",
    edadMin: 1, edadMax: 18,
    modalidad: "Mixto",
    cupoINSS: 8, cupoOcupado: 6,
    modelos: ["ADOS-2", "Vineland-3", "MCHAT-R/F"],
    descripcion: "Diagnóstico TEA, perfil sensorial y evaluación adaptativa.",
  },
  {
    id: "familia",
    nombre: "Acompañamiento familiar",
    area: "Familia",
    edadMin: 0, edadMax: 18,
    modalidad: "Familiar",
    cupoINSS: 15, cupoOcupado: 12,
    modelos: ["Coaching parental"],
    descripcion: "Sesiones con tutores: psicoeducación, generalización en casa, contención.",
  },
];
