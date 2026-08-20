// TDR v1.3 · Parte XI — Semana Modelo, Agenda Operativa y planificación
export const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"] as const;
export type Dia = (typeof dias)[number];

export type Disciplina = "ABA" | "Logopedia" | "Fisioterapia" | "Psicología";

export type BloqueModelo = {
  id: string;
  nino: string;
  dia: Dia;
  hora: string;
  duracion: number; // min
  disciplina: Disciplina;
  sede: string;
  terapeuta: string;
};

export const semanaModelo: BloqueModelo[] = [
  { id: "m1", nino: "Mateo Rodríguez", dia: "Lunes", hora: "08:00", duracion: 60, disciplina: "ABA", sede: "Santo Domingo", terapeuta: "Lic. María Castellón" },
  { id: "m2", nino: "Emilio Torres", dia: "Lunes", hora: "09:00", duracion: 45, disciplina: "Logopedia", sede: "Santo Domingo", terapeuta: "Lic. Sofía Hernández" },
  { id: "m3", nino: "Camila Ríos", dia: "Lunes", hora: "10:00", duracion: 60, disciplina: "ABA", sede: "Santo Domingo", terapeuta: "Lic. Jeyling Ortega" },
  { id: "m4", nino: "Diego Solís", dia: "Martes", hora: "08:00", duracion: 45, disciplina: "Fisioterapia", sede: "Santo Domingo", terapeuta: "Lic. Carlos Bermúdez" },
  { id: "m5", nino: "Marco Delgado", dia: "Martes", hora: "09:00", duracion: 60, disciplina: "ABA", sede: "Las Colinas", terapeuta: "Lic. Roberto Mendoza" },
  { id: "m6", nino: "Valentina Gutiérrez", dia: "Martes", hora: "11:00", duracion: 45, disciplina: "Logopedia", sede: "Estelí", terapeuta: "Lic. Sofía Hernández" },
  { id: "m7", nino: "Diego Morales", dia: "Miércoles", hora: "08:00", duracion: 60, disciplina: "ABA", sede: "Estelí", terapeuta: "Lic. María Castellón" },
  { id: "m8", nino: "Lucía Castro", dia: "Miércoles", hora: "10:00", duracion: 45, disciplina: "Psicología", sede: "Masaya", terapeuta: "Dra. Ana Lucía Pérez" },
  { id: "m9", nino: "Isabella Vega", dia: "Jueves", hora: "08:00", duracion: 60, disciplina: "ABA", sede: "Santo Domingo", terapeuta: "Lic. Jeyling Ortega" },
  { id: "m10", nino: "Pedro Alvarado", dia: "Jueves", hora: "09:00", duracion: 45, disciplina: "Fisioterapia", sede: "Santo Domingo", terapeuta: "Lic. Carlos Bermúdez" },
  { id: "m11", nino: "Mateo Rodríguez", dia: "Viernes", hora: "08:00", duracion: 60, disciplina: "ABA", sede: "Santo Domingo", terapeuta: "Lic. María Castellón" },
  { id: "m12", nino: "Camila Ríos", dia: "Viernes", hora: "10:00", duracion: 45, disciplina: "Logopedia", sede: "Santo Domingo", terapeuta: "Lic. Sofía Hernández" },
];

// 11.4 Modificaciones durante la ejecución (la Semana Modelo permanece como plantilla)
export type TipoCambio =
  | "Cambio de terapeuta"
  | "Reprogramación de horario"
  | "Cancelación"
  | "Sesión adicional"
  | "Sustitución temporal"
  | "Cambio de sede";

export type Modificacion = {
  id: string;
  bloqueId: string;
  nino: string;
  tipo: TipoCambio;
  detalle: string;
  motivo: string;
  usuario: string;
  fecha: string;
  soloEstaSemana: boolean;
};

export const modificaciones: Modificacion[] = [
  { id: "mod1", bloqueId: "m5", nino: "Marco Delgado", tipo: "Cambio de terapeuta", detalle: "Lic. Roberto Mendoza → Lic. Jeyling Ortega", motivo: "Incapacidad médica del terapeuta base", usuario: "Coordinador Clínico · Las Colinas", fecha: "2026-08-18 07:42", soloEstaSemana: true },
  { id: "mod2", bloqueId: "m8", nino: "Lucía Castro", tipo: "Reprogramación de horario", detalle: "Miércoles 10:00 → Jueves 11:00", motivo: "Solicitud de la familia por cita médica", usuario: "Personal Administrativo · Masaya", fecha: "2026-08-18 15:10", soloEstaSemana: true },
  { id: "mod3", bloqueId: "m10", nino: "Pedro Alvarado", tipo: "Cancelación", detalle: "Jueves 09:00 cancelada", motivo: "Ausencia del paciente por enfermedad", usuario: "Recepción · Santo Domingo", fecha: "2026-08-19 08:05", soloEstaSemana: true },
  { id: "mod4", bloqueId: "m6", nino: "Valentina Gutiérrez", tipo: "Cambio de sede", detalle: "Estelí → Santo Domingo", motivo: "Mantenimiento de sala sensorial", usuario: "Coordinador Clínico · Estelí", fecha: "2026-08-17 16:30", soloEstaSemana: false },
];

// 11.5 Disponibilidad del personal
export type Disponibilidad = {
  terapeuta: string;
  disciplinas: Disciplina[];
  sede: string;
  jornada: string;
  horasSemana: number;
  horasAsignadas: number;
  restriccion?: string;
  estado: "disponible" | "parcial" | "ausente";
};

export const disponibilidad: Disponibilidad[] = [
  { terapeuta: "Lic. María Castellón", disciplinas: ["ABA"], sede: "Santo Domingo", jornada: "L–V 07:30–15:30", horasSemana: 36, horasAsignadas: 31, estado: "disponible" },
  { terapeuta: "Lic. Jeyling Ortega", disciplinas: ["ABA", "Psicología"], sede: "Santo Domingo", jornada: "L–V 08:00–16:00", horasSemana: 38, horasAsignadas: 36, estado: "parcial", restriccion: "Sin disponibilidad los viernes por supervisión" },
  { terapeuta: "Lic. Roberto Mendoza", disciplinas: ["ABA"], sede: "Las Colinas", jornada: "L–V 08:00–16:00", horasSemana: 38, horasAsignadas: 12, estado: "ausente", restriccion: "Incapacidad médica 17–21 ago" },
  { terapeuta: "Lic. Sofía Hernández", disciplinas: ["Logopedia"], sede: "Multi-sede", jornada: "L–V 08:00–14:00", horasSemana: 30, horasAsignadas: 27, estado: "disponible" },
  { terapeuta: "Lic. Carlos Bermúdez", disciplinas: ["Fisioterapia"], sede: "Santo Domingo", jornada: "L–J 08:00–16:00", horasSemana: 32, horasAsignadas: 24, estado: "disponible", restriccion: "Viernes no laborable" },
  { terapeuta: "Dra. Ana Lucía Pérez", disciplinas: ["Psicología"], sede: "Masaya", jornada: "M–V 09:00–15:00", horasSemana: 24, horasAsignadas: 22, estado: "parcial", restriccion: "Vacaciones programadas 01–05 sep" },
];

// 11.6 Asignación inteligente de terapeutas (recomendación asistencial)
export type Recomendacion = {
  terapeuta: string;
  score: number;
  factores: { factor: string; valor: string; positivo: boolean }[];
};

export function recomendarTerapeutas(bloque: BloqueModelo): Recomendacion[] {
  const candidatos = disponibilidad.filter(
    (d) => d.disciplinas.includes(bloque.disciplina) && d.terapeuta !== bloque.terapeuta,
  );
  return candidatos
    .map((d) => {
      const libre = Math.max(0, d.horasSemana - d.horasAsignadas);
      const mismaSede = d.sede === bloque.sede || d.sede === "Multi-sede";
      const continuidad = semanaModelo.some((b) => b.nino === bloque.nino && b.terapeuta === d.terapeuta);
      let score = 40;
      if (d.estado === "disponible") score += 25;
      if (d.estado === "parcial") score += 10;
      if (d.estado === "ausente") score -= 35;
      score += Math.min(20, libre * 3);
      if (mismaSede) score += 10;
      if (continuidad) score += 15;
      return {
        terapeuta: d.terapeuta,
        score: Math.max(5, Math.min(99, score)),
        factores: [
          { factor: "Disponibilidad", valor: d.estado === "disponible" ? "Sin restricciones" : d.restriccion ?? d.estado, positivo: d.estado === "disponible" },
          { factor: "Carga de trabajo", valor: `${d.horasAsignadas}/${d.horasSemana} h · ${libre} h libres`, positivo: libre >= 3 },
          { factor: "Competencia / disciplina", valor: bloque.disciplina, positivo: true },
          { factor: "Sede de atención", valor: mismaSede ? bloque.sede : `${d.sede} (traslado)`, positivo: mismaSede },
          { factor: "Continuidad terapéutica", valor: continuidad ? "Ya atiende al paciente" : "Sin historial con el paciente", positivo: continuidad },
        ],
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function resumenAgenda() {
  const horas = semanaModelo.reduce((a, b) => a + b.duracion, 0) / 60;
  return {
    bloques: semanaModelo.length,
    horas,
    pacientes: new Set(semanaModelo.map((b) => b.nino)).size,
    terapeutas: new Set(semanaModelo.map((b) => b.terapeuta)).size,
    modificaciones: modificaciones.length,
    permanentes: modificaciones.filter((m) => !m.soloEstaSemana).length,
  };
}
