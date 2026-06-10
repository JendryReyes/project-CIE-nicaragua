// Datos demo para el módulo de Planificación
// Lo general → lo particular: sede → supervisor → niño

export type MotivoNoProgramada =
  | "Sin terapeuta disponible"
  | "Sala ocupada"
  | "Familia sin transporte"
  | "Checklist incompleto"
  | "Sin carta INSS vigente"
  | "Suspensión activa";

export const motivosColor: Record<MotivoNoProgramada, string> = {
  "Sin terapeuta disponible": "bg-[oklch(0.94_0.06_25)] text-[oklch(0.45_0.15_25)]",
  "Sala ocupada":              "bg-[oklch(0.95_0.07_60)] text-[oklch(0.45_0.13_60)]",
  "Familia sin transporte":    "bg-[oklch(0.93_0.06_290)] text-[oklch(0.4_0.12_290)]",
  "Checklist incompleto":      "bg-[oklch(0.93_0.05_210)] text-[oklch(0.4_0.12_210)]",
  "Sin carta INSS vigente":    "bg-[oklch(0.94_0.06_25)] text-[oklch(0.45_0.15_25)]",
  "Suspensión activa":         "bg-muted text-muted-foreground",
};

export type SedePlan = {
  sede: string;
  programables: number;
  programadas: number;
  ninos: number;
};

export const sedesPlan: SedePlan[] = [
  { sede: "Santo Domingo", programables: 320, programadas: 287, ninos: 24 },
  { sede: "Las Colinas",   programables: 180, programadas: 168, ninos: 13 },
  { sede: "Estelí",        programables: 120, programadas:  96, ninos: 9  },
  { sede: "Masaya",        programables:  72, programadas:  58, ninos: 6  },
];

export type SupervisorPlan = {
  supervisor: string;
  rol: "Coordinación" | "Supervisión" | "Subdirección" | "Dirección clínica";
  ninos: number;
  programables: number;
  programadas: number;
  asistencia: number; // %
};

export const supervisoresPlan: SupervisorPlan[] = [
  { supervisor: "Lic. María Castellón",   rol: "Supervisión",       ninos: 12, programables: 168, programadas: 154, asistencia: 91 },
  { supervisor: "Lic. Roberto Mendoza",   rol: "Supervisión",       ninos: 10, programables: 140, programadas: 128, asistencia: 88 },
  { supervisor: "Dra. Ana Lucía Pérez",   rol: "Dirección clínica", ninos:  6, programables:  84, programadas:  72, asistencia: 86 },
  { supervisor: "Lic. Jeyling Ortega",    rol: "Coordinación",      ninos: 14, programables: 196, programadas: 175, asistencia: 89 },
  { supervisor: "Lic. Carlos Bermúdez",   rol: "Subdirección",      ninos:  5, programables:  70, programadas:  64, asistencia: 93 },
  { supervisor: "Lic. Sofía Hernández",   rol: "Supervisión",       ninos:  5, programables:  34, programadas:  16, asistencia: 78 },
];

export type NinoPlan = {
  nino: string;
  iniciales: string;
  sede: string;
  supervisor: string;
  area: "ABA" | "Logopedia" | "Fisio" | "T. Ocupacional";
  inssAprobadas: number;
  programadas: number;
  motivoGap?: MotivoNoProgramada;
};

export const ninosPlan: NinoPlan[] = [
  { nino: "Mateo Gutiérrez",   iniciales: "MG", sede: "Santo Domingo", supervisor: "Lic. María Castellón", area: "ABA",        inssAprobadas: 32, programadas: 32 },
  { nino: "Valentina Rocha",   iniciales: "VR", sede: "Santo Domingo", supervisor: "Lic. Sofía Hernández", area: "Logopedia",  inssAprobadas: 16, programadas:  8, motivoGap: "Sin terapeuta disponible" },
  { nino: "Liam Sandoval",     iniciales: "LS", sede: "Las Colinas",   supervisor: "Lic. Roberto Mendoza", area: "Fisio",      inssAprobadas: 24, programadas: 24 },
  { nino: "Emma Padilla",      iniciales: "EP", sede: "Santo Domingo", supervisor: "Dra. Ana Lucía Pérez", area: "ABA",        inssAprobadas: 12, programadas:  4, motivoGap: "Checklist incompleto" },
  { nino: "Noah Centeno",      iniciales: "NC", sede: "Santo Domingo", supervisor: "Lic. Jeyling Ortega",  area: "ABA",        inssAprobadas: 40, programadas: 40 },
  { nino: "Sofía Aguilar",     iniciales: "SA", sede: "Estelí",        supervisor: "Lic. Sofía Hernández", area: "Logopedia",  inssAprobadas: 16, programadas:  6, motivoGap: "Familia sin transporte" },
  { nino: "Diego Espinoza",    iniciales: "DE", sede: "Santo Domingo", supervisor: "Lic. Roberto Mendoza", area: "ABA",        inssAprobadas: 16, programadas:  0, motivoGap: "Suspensión activa" },
  { nino: "Isabella Briones",  iniciales: "IB", sede: "Las Colinas",   supervisor: "Lic. Carlos Bermúdez", area: "Fisio",      inssAprobadas: 24, programadas: 22 },
  { nino: "Samuel Membreño",   iniciales: "SM", sede: "Santo Domingo", supervisor: "Lic. María Castellón", area: "ABA",        inssAprobadas: 32, programadas: 28, motivoGap: "Sala ocupada" },
  { nino: "Camila Zeledón",    iniciales: "CZ", sede: "Masaya",        supervisor: "Lic. Jeyling Ortega",  area: "Fisio",      inssAprobadas: 12, programadas:  8, motivoGap: "Sin carta INSS vigente" },
  { nino: "Lucas Obregón",     iniciales: "LO", sede: "Santo Domingo", supervisor: "Dra. Ana Lucía Pérez", area: "ABA",        inssAprobadas: 16, programadas: 16 },
  { nino: "Renata Cárcamo",    iniciales: "RC", sede: "Santo Domingo", supervisor: "Lic. Jeyling Ortega",  area: "ABA",        inssAprobadas: 40, programadas: 36, motivoGap: "Sin terapeuta disponible" },
];

export function totales() {
  const programables = sedesPlan.reduce((a, s) => a + s.programables, 0);
  const programadas  = sedesPlan.reduce((a, s) => a + s.programadas,  0);
  const ninos        = sedesPlan.reduce((a, s) => a + s.ninos,         0);
  return { programables, programadas, ninos, cobertura: Math.round((programadas / programables) * 100) };
}

export function motivosResumen() {
  const m = new Map<MotivoNoProgramada, number>();
  for (const n of ninosPlan) {
    const gap = n.inssAprobadas - n.programadas;
    if (gap > 0 && n.motivoGap) m.set(n.motivoGap, (m.get(n.motivoGap) ?? 0) + gap);
  }
  return Array.from(m.entries())
    .map(([motivo, horas]) => ({ motivo, horas }))
    .sort((a, b) => b.horas - a.horas);
}
