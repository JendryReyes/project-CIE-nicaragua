export type ModeloClinico = "aba" | "esdm" | "hanley";

export const modeloLabels: Record<ModeloClinico, string> = {
  aba: "ABA",
  esdm: "ESDM-Denver",
  hanley: "Hanley / PFA-SBT",
};

export const modeloDescripciones: Record<ModeloClinico, string> = {
  aba: "Análisis conductual aplicado. Adquisición de operantes, discriminación de estímulos y medidas continuas.",
  esdm: "Early Start Denver Model. Aprendizaje natural en rutinas conjuntas para 12–48 meses.",
  hanley: "Práctica funcional + tratamiento basado en habilidades. Indicado en conducta severa con plan de crisis.",
};

export type FaseSesion = {
  sesion: number;
  fecha: string;
  valor: number;
  fase: string;
};

export type Programa = {
  id: string;
  modelo: ModeloClinico;
  dominio: string;
  programa: string;
  target: string;
  sd: string;
  medida: "frecuencia" | "tasa" | "duración" | "latencia" | "% acierto";
  ayuda: string;
  criterio: { umbral: number; consistencia: number; generalizacion: number };
  faseActual: string;
  riesgo: "bajo" | "medio" | "alto";
  serie: FaseSesion[];
  cambiosFase: { sesion: number; nota: string }[];
};

export const programasDemo: Programa[] = [
  {
    id: "p-aba-1",
    modelo: "aba",
    dominio: "Comunicación expresiva",
    programa: "Tactos de objetos preferidos",
    target: "Tactar 10 objetos preferidos con SD verbal",
    sd: "¿Qué es?",
    medida: "% acierto",
    ayuda: "FP → modelado verbal → independiente",
    criterio: { umbral: 80, consistencia: 3, generalizacion: 2 },
    faseActual: "Mantenimiento",
    riesgo: "bajo",
    serie: [
      { sesion: 1, fecha: "05/05", valor: 20, fase: "Línea base" },
      { sesion: 2, fecha: "08/05", valor: 25, fase: "Línea base" },
      { sesion: 3, fecha: "12/05", valor: 22, fase: "Línea base" },
      { sesion: 4, fecha: "15/05", valor: 45, fase: "Enseñanza" },
      { sesion: 5, fecha: "18/05", valor: 58, fase: "Enseñanza" },
      { sesion: 6, fecha: "22/05", valor: 70, fase: "Enseñanza" },
      { sesion: 7, fecha: "25/05", valor: 82, fase: "Enseñanza" },
      { sesion: 8, fecha: "29/05", valor: 88, fase: "Mantenimiento" },
      { sesion: 9, fecha: "01/06", valor: 90, fase: "Mantenimiento" },
    ],
    cambiosFase: [
      { sesion: 4, nota: "Inicio enseñanza con FP" },
      { sesion: 8, nota: "Criterio de masterización alcanzado" },
    ],
  },
  {
    id: "p-esdm-1",
    modelo: "esdm",
    dominio: "Imitación social",
    programa: "Imitación motora en rutina conjunta",
    target: "Imitar 5 movimientos en juego de canciones",
    sd: "Rutina natural · 'Mirá, hacé esto'",
    medida: "frecuencia",
    ayuda: "Modelado físico → modelado visual → espontáneo",
    criterio: { umbral: 4, consistencia: 3, generalizacion: 2 },
    faseActual: "Enseñanza",
    riesgo: "bajo",
    serie: [
      { sesion: 1, fecha: "06/05", valor: 1, fase: "Línea base" },
      { sesion: 2, fecha: "09/05", valor: 1, fase: "Línea base" },
      { sesion: 3, fecha: "13/05", valor: 2, fase: "Enseñanza" },
      { sesion: 4, fecha: "16/05", valor: 2, fase: "Enseñanza" },
      { sesion: 5, fecha: "20/05", valor: 3, fase: "Enseñanza" },
      { sesion: 6, fecha: "23/05", valor: 3, fase: "Enseñanza" },
      { sesion: 7, fecha: "27/05", valor: 4, fase: "Enseñanza" },
      { sesion: 8, fecha: "30/05", valor: 4, fase: "Enseñanza" },
    ],
    cambiosFase: [{ sesion: 3, nota: "Inicio enseñanza con modelado físico" }],
  },
  {
    id: "p-hanley-1",
    modelo: "hanley",
    dominio: "Tolerancia y comunicación funcional",
    programa: "Respuesta de comunicación funcional (FCR)",
    target: "Decir 'mi turno, por favor' ante interrupción",
    sd: "Interrupción de actividad preferida",
    medida: "% acierto",
    ayuda: "Modelado verbal completo → parcial → espontáneo",
    criterio: { umbral: 85, consistencia: 4, generalizacion: 3 },
    faseActual: "Tolerancia",
    riesgo: "alto",
    serie: [
      { sesion: 1, fecha: "07/05", valor: 0, fase: "Línea base" },
      { sesion: 2, fecha: "10/05", valor: 0, fase: "Línea base" },
      { sesion: 3, fecha: "14/05", valor: 60, fase: "FCR" },
      { sesion: 4, fecha: "17/05", valor: 75, fase: "FCR" },
      { sesion: 5, fecha: "21/05", valor: 90, fase: "FCR" },
      { sesion: 6, fecha: "24/05", valor: 70, fase: "Tolerancia" },
      { sesion: 7, fecha: "28/05", valor: 78, fase: "Tolerancia" },
      { sesion: 8, fecha: "31/05", valor: 82, fase: "Tolerancia" },
    ],
    cambiosFase: [
      { sesion: 3, nota: "Inicio FCR — entorno seguro" },
      { sesion: 6, nota: "Inicio tolerancia gradual a demora" },
    ],
  },
];

export type PlanCrisis = {
  precursores: string[];
  pasos: { orden: number; accion: string }[];
  reforzadores: string[];
  contactoFamilia: string;
};

export const planCrisisDemo: PlanCrisis = {
  precursores: [
    "Verbalizaciones repetitivas ('no, no, no')",
    "Apartar la mirada y tensar hombros",
    "Empujar materiales fuera de la mesa",
  ],
  pasos: [
    { orden: 1, accion: "Detener demanda inmediatamente. Validar: 'Está bien, paramos'." },
    { orden: 2, accion: "Reinstaurar acceso al reforzador preferido (tablet con video calmante)." },
    { orden: 3, accion: "Mantener entorno seguro. No bloquear paso. Retirar materiales duros." },
    { orden: 4, accion: "Esperar 60 segundos de calma antes de reiniciar interacción." },
    { orden: 5, accion: "Registrar precursor observado y duración del episodio en bitácora." },
  ],
  reforzadores: ["Tablet con videos musicales", "Cojín sensorial azul", "Galletas integrales"],
  contactoFamilia: "Mamá: +505 8765 4321 · Avisar si el episodio supera 5 min.",
};
