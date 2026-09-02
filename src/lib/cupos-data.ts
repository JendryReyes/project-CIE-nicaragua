// Control de cupos por sede y disciplina — TDR Parte III
export type Disciplina = "Conducta / ABA" | "Logopedia" | "Fisioterapia" | "T. Ocupacional" | "Diagnóstico";

export const disciplinas: Disciplina[] = [
  "Conducta / ABA",
  "Logopedia",
  "Fisioterapia",
  "T. Ocupacional",
  "Diagnóstico",
];

export type Cupo = {
  sede: string;
  disciplina: Disciplina;
  capacidad: number; // cupos totales
  ocupados: number;
  reservados: number; // en admisión
  listaEspera: number;
  horasSemanaCapacidad: number;
  horasSemanaProgramadas: number;
};

export const cupos: Cupo[] = [
  { sede: "Santo Domingo", disciplina: "Conducta / ABA", capacidad: 24, ocupados: 21, reservados: 2, listaEspera: 0, horasSemanaCapacidad: 240, horasSemanaProgramadas: 214 },
  { sede: "Santo Domingo", disciplina: "Logopedia", capacidad: 14, ocupados: 11, reservados: 1, listaEspera: 0, horasSemanaCapacidad: 84, horasSemanaProgramadas: 68 },
  { sede: "Santo Domingo", disciplina: "Fisioterapia", capacidad: 12, ocupados: 9, reservados: 1, listaEspera: 0, horasSemanaCapacidad: 72, horasSemanaProgramadas: 55 },
  { sede: "Santo Domingo", disciplina: "Diagnóstico", capacidad: 8, ocupados: 6, reservados: 2, listaEspera: 1, horasSemanaCapacidad: 32, horasSemanaProgramadas: 28 },
  { sede: "Las Colinas", disciplina: "Conducta / ABA", capacidad: 16, ocupados: 16, reservados: 1, listaEspera: 2, horasSemanaCapacidad: 160, horasSemanaProgramadas: 158 },
  { sede: "Las Colinas", disciplina: "Logopedia", capacidad: 10, ocupados: 7, reservados: 1, listaEspera: 0, horasSemanaCapacidad: 60, horasSemanaProgramadas: 44 },
  { sede: "Las Colinas", disciplina: "T. Ocupacional", capacidad: 8, ocupados: 5, reservados: 0, listaEspera: 0, horasSemanaCapacidad: 48, horasSemanaProgramadas: 31 },
  { sede: "Estelí", disciplina: "Conducta / ABA", capacidad: 12, ocupados: 9, reservados: 1, listaEspera: 0, horasSemanaCapacidad: 120, horasSemanaProgramadas: 92 },
  { sede: "Estelí", disciplina: "Logopedia", capacidad: 8, ocupados: 6, reservados: 1, listaEspera: 0, horasSemanaCapacidad: 48, horasSemanaProgramadas: 37 },
  { sede: "Masaya", disciplina: "Fisioterapia", capacidad: 10, ocupados: 6, reservados: 1, listaEspera: 0, horasSemanaCapacidad: 60, horasSemanaProgramadas: 38 },
  { sede: "Masaya", disciplina: "Logopedia", capacidad: 6, ocupados: 4, reservados: 0, listaEspera: 0, horasSemanaCapacidad: 36, horasSemanaProgramadas: 22 },
  { sede: "León", disciplina: "Conducta / ABA", capacidad: 10, ocupados: 6, reservados: 2, listaEspera: 0, horasSemanaCapacidad: 100, horasSemanaProgramadas: 61 },
  { sede: "León", disciplina: "Logopedia", capacidad: 6, ocupados: 5, reservados: 0, listaEspera: 1, horasSemanaCapacidad: 36, horasSemanaProgramadas: 33 },
];

export function ocupacion(c: Cupo) {
  return Math.round(((c.ocupados + c.reservados) / c.capacidad) * 100);
}

export function estadoCupo(c: Cupo): { label: string; tone: "ok" | "ambar" | "coral" } {
  const o = ocupacion(c);
  if (o >= 100) return { label: "Sin cupo", tone: "coral" };
  if (o >= 90) return { label: "Cupo crítico", tone: "ambar" };
  return { label: "Cupo disponible", tone: "ok" };
}

export function sedesCupos() {
  return [...new Set(cupos.map((c) => c.sede))];
}

export function resumenCupos() {
  const capacidad = cupos.reduce((s, c) => s + c.capacidad, 0);
  const ocupados = cupos.reduce((s, c) => s + c.ocupados, 0);
  const reservados = cupos.reduce((s, c) => s + c.reservados, 0);
  const espera = cupos.reduce((s, c) => s + c.listaEspera, 0);
  const horasCap = cupos.reduce((s, c) => s + c.horasSemanaCapacidad, 0);
  const horasProg = cupos.reduce((s, c) => s + c.horasSemanaProgramadas, 0);
  return {
    capacidad,
    ocupados,
    reservados,
    espera,
    disponibles: capacidad - ocupados - reservados,
    ocupacion: Math.round(((ocupados + reservados) / capacidad) * 100),
    horasCap,
    horasProg,
    usoHoras: Math.round((horasProg / horasCap) * 100),
    bloqueados: cupos.filter((c) => ocupacion(c) >= 100).length,
  };
}
