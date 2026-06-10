// Reporte de puntualidad por sede para el módulo de Ejecución/Asistencia

export type PuntualidadSede = {
  sede: string;
  atendidos: number;
  aTiempo: number;
  tardeLeve: number;   // 1-14 min
  tarde: number;       // ≥ 15 min
  ausentes: number;
  desviacionPromMin: number;
};

export const puntualidadHoy: PuntualidadSede[] = [
  { sede: "Santo Domingo", atendidos: 80, aTiempo: 62, tardeLeve: 11, tarde: 3, ausentes: 4, desviacionPromMin: 9  },
  { sede: "Las Colinas",   atendidos: 42, aTiempo: 35, tardeLeve:  4, tarde: 2, ausentes: 1, desviacionPromMin: 7  },
  { sede: "Estelí",        atendidos: 28, aTiempo: 18, tardeLeve:  5, tarde: 4, ausentes: 1, desviacionPromMin: 14 },
  { sede: "Masaya",        atendidos: 18, aTiempo: 14, tardeLeve:  2, tarde: 1, ausentes: 1, desviacionPromMin: 8  },
];

export function clasificarDesviacion(minutos: number): "a_tiempo" | "tarde_leve" | "tarde" | "ausente" {
  if (minutos <= 0) return "a_tiempo";
  if (minutos < 15) return "tarde_leve";
  return "tarde";
}

export function totalesPuntualidad() {
  const t = puntualidadHoy.reduce(
    (a, s) => ({
      atendidos: a.atendidos + s.atendidos,
      aTiempo:   a.aTiempo   + s.aTiempo,
      tardeLeve: a.tardeLeve + s.tardeLeve,
      tarde:     a.tarde     + s.tarde,
      ausentes:  a.ausentes  + s.ausentes,
    }),
    { atendidos: 0, aTiempo: 0, tardeLeve: 0, tarde: 0, ausentes: 0 },
  );
  const desviacion = Math.round(
    puntualidadHoy.reduce((a, s) => a + s.desviacionPromMin * s.atendidos, 0) / Math.max(1, t.atendidos),
  );
  const pctATiempo = Math.round((t.aTiempo / Math.max(1, t.atendidos)) * 100);
  return { ...t, desviacion, pctATiempo };
}
