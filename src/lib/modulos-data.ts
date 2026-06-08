// Datos demo para los módulos Matrícula, Ejecución y Facturación-por-sede
// Refleja la lógica vista en el spec presentado por María Martha (CIE)

export type AreaFact = "ABA" | "Logo" | "Fisio";

export const tarifa: Record<AreaFact, number> = {
  ABA: 1.0,    // USD por hora (mock simplificado para la demo visual)
  Logo: 1.5,
  Fisio: 1.5,
};

export const areaColor: Record<AreaFact, string> = {
  ABA: "oklch(0.55 0.18 265)",          // morado-azul
  Logo: "oklch(0.6 0.16 30)",           // naranja-rojo
  Fisio: "oklch(0.55 0.14 200)",        // teal
};

export type NinoFact = {
  id: string;
  nombre: string;
  iniciales: string;
  codigoINSS?: string;       // ej 221-013
  expediente: string;        // ej IT · SD 1
  inss: boolean;
  privado?: boolean;
  sedeId: string;            // grupo sede
  // Asignación de horas mensuales aprobadas por carta INSS
  aprobadasMes: Partial<Record<AreaFact, number>>;
  // Horas ya facturadas en Q1 (sólo importa para mostrar en Q2)
  q1: Partial<Record<AreaFact, number>>;
  // Horas ejecutadas en la quincena actual
  ejecQ: Partial<Record<AreaFact, number>>;
  excede?: boolean;           // se calcula, pero permitimos forzar para demo
  constancia?: boolean;
};

export type SedeGrupo = {
  id: string;
  nombre: string;
  ciudad: string;
  ninos: NinoFact[];
};

// Mock alineado a las capturas (Marco Delgado, Diego Morales, Valentina, Mateo, Diego Solís, Isabella, Pedro, Camila, Emilio…)
export const sedesFact: SedeGrupo[] = [
  {
    id: "sd1", nombre: "SD 1", ciudad: "Santo Domingo",
    ninos: [
      { id: "n-mr", nombre: "Mateo Rodríguez", iniciales: "MR", codigoINSS: "221-001", expediente: "IT · SD 1", inss: true, sedeId: "sd1",
        aprobadasMes: { ABA: 32, Logo: 8 }, q1: { ABA: 14, Logo: 4 }, ejecQ: { ABA: 18, Logo: 4 } },
      { id: "n-et", nombre: "Emilio Torres", iniciales: "ET", codigoINSS: "221-005", expediente: "ET · SD 1", inss: true, sedeId: "sd1",
        aprobadasMes: { ABA: 32, Logo: 8 }, q1: { ABA: 11, Logo: 5 }, ejecQ: { ABA: 21, Logo: 3 } },
      { id: "n-cr", nombre: "Camila Ríos", iniciales: "CR", codigoINSS: "221-008", expediente: "IT · SD 1", inss: true, sedeId: "sd1",
        aprobadasMes: { ABA: 32 }, q1: { ABA: 16 }, ejecQ: { ABA: 16 } },
      { id: "n-ds", nombre: "Diego Solís", iniciales: "DS", codigoINSS: "221-011", expediente: "PFA · SD 1", inss: true, sedeId: "sd1",
        aprobadasMes: { ABA: 40 }, q1: { ABA: 20 }, ejecQ: { ABA: 20 } },
    ],
  },
  {
    id: "sd2", nombre: "SD 2", ciudad: "Santo Domingo",
    ninos: [
      { id: "n-iv", nombre: "Isabella Vega", iniciales: "IV", expediente: "TA · SD 2", inss: false, privado: true, sedeId: "sd2",
        aprobadasMes: { ABA: 24 }, q1: { ABA: 13 }, ejecQ: { ABA: 11 } },
      { id: "n-pa", nombre: "Pedro Alvarado", iniciales: "PA", codigoINSS: "221-012", expediente: "TA · SD 2", inss: true, sedeId: "sd2",
        aprobadasMes: { ABA: 12 }, q1: { ABA: 6 }, ejecQ: { ABA: 6 } },
    ],
  },
  {
    id: "lc", nombre: "Las Colinas", ciudad: "Managua",
    ninos: [
      { id: "n-md", nombre: "Marco Delgado", iniciales: "MD", codigoINSS: "221-013", expediente: "TS · LC", inss: true, sedeId: "lc",
        // Caso visto en captura: 12h ABA + 1h Logo, excede sin constancia
        aprobadasMes: { ABA: 32, Logo: 8 }, q1: { ABA: 21, Logo: 7 }, ejecQ: { ABA: 12, Logo: 1 }, excede: true, constancia: false },
    ],
  },
  {
    id: "esteli", nombre: "Estelí", ciudad: "Estelí",
    ninos: [
      { id: "n-dm", nombre: "Diego Morales", iniciales: "DM", codigoINSS: "221-014", expediente: "IT · Estelí", inss: true, sedeId: "esteli",
        aprobadasMes: { ABA: 42, Logo: 8 }, q1: { ABA: 21, Logo: 4 }, ejecQ: { ABA: 21, Logo: 4 } },
      { id: "n-vg", nombre: "Valentina Gutiérrez", iniciales: "VG", codigoINSS: "221-004", expediente: "PFA · Estelí", inss: true, sedeId: "esteli",
        aprobadasMes: { ABA: 32, Logo: 6, Fisio: 6 }, q1: { ABA: 16, Logo: 3, Fisio: 3 }, ejecQ: { ABA: 16, Logo: 3, Fisio: 3 } },
    ],
  },
  {
    id: "masaya", nombre: "Masaya", ciudad: "Masaya",
    ninos: [
      { id: "n-cz", nombre: "Camila Zeledón", iniciales: "CZ", expediente: "Pro-bono · Masaya", inss: false, sedeId: "masaya",
        aprobadasMes: { Fisio: 12, Logo: 8 }, q1: { Fisio: 6, Logo: 4 }, ejecQ: { Fisio: 6, Logo: 4 } },
      { id: "n-lc2", nombre: "Lucía Castro", iniciales: "LC", codigoINSS: "221-021", expediente: "IT · Masaya", inss: true, sedeId: "masaya",
        aprobadasMes: { ABA: 32 }, q1: { ABA: 16 }, ejecQ: { ABA: 14 } },
    ],
  },
];

export function calcularNino(n: NinoFact) {
  const areas: AreaFact[] = ["ABA", "Logo", "Fisio"];
  let total = 0;
  let totalHoras = 0;
  const detalles = areas
    .filter((a) => n.aprobadasMes[a] || n.ejecQ[a])
    .map((a) => {
      const aprobadas = n.aprobadasMes[a] ?? 0;
      const q1 = n.q1[a] ?? 0;
      const ejec = n.ejecQ[a] ?? 0;
      const restante = Math.max(0, aprobadas - q1);
      const facturables = Math.min(ejec, restante);
      const excede = Math.max(0, ejec - restante);
      const subtotal = facturables * tarifa[a];
      total += subtotal;
      totalHoras += facturables;
      return { area: a, aprobadas, q1, ejec, restante, facturables, excede, subtotal };
    });
  const tieneExcede = detalles.some((d) => d.excede > 0) || !!n.excede;
  return { detalles, total, totalHoras, tieneExcede };
}

// --- Matrícula ---
export type MovimientoNino = {
  nino: string; iniciales: string; expediente: string;
  tipo: "ingreso" | "egreso" | "suspension";
  fecha: string; motivo: string;
};

export const movimientosNinos: MovimientoNino[] = [
  { nino: "Daniel Mora", iniciales: "DM", expediente: "ID · SD 1", tipo: "ingreso", fecha: "2026-05-06", motivo: "Diagnóstico aleatorio – alta clínica" },
  { nino: "Camila Fuentes", iniciales: "CF", expediente: "ID · SD 2", tipo: "ingreso", fecha: "2026-05-12", motivo: "Traslado desde otra unidad" },
  { nino: "Martín López", iniciales: "ML", expediente: "ID · LC", tipo: "egreso", fecha: "2026-05-18", motivo: "Mudanza familiar" },
  { nino: "Valeria Ortiz", iniciales: "VO", expediente: "ID · SD 1", tipo: "ingreso", fecha: "2026-05-22", motivo: "Diagnóstico aleatorio – alta clínica" },
];

export const resumenMatricula = {
  activos: 27,
  ingresosMes: 3,
  egresosMes: 1,
  suspendidos: 2,
  horasProgramadas: 225,
  horasSubrogadas: 50,
  cobertura: 89,
};

// --- Ejecución ---
export const mesesCorto = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
// Cada celda 0..1 representa % cumplimiento del mes (verde si >85)
export const ejecucionAnual = [
  { fila: "Programadas", valores: [646,624,612,648,660,672,690,0,0,0,0,0] },
  { fila: "Ejecutadas",  valores: [525,544,580,565,602,609,624,0,0,0,0,0] },
  { fila: "Reprog",      valores: [29,20,15,18,21,17,12,0,0,0,0,0] },
  { fila: "Total ejec",  valores: [554,564,595,583,623,626,636,0,0,0,0,0] },
  { fila: "No ejec",     valores: [92,60,17,65,37,46,54,0,0,0,0,0] },
];

export const ejecucionSedes = [
  { sede: "SD 1", ciudad: "Santo Domingo", prog: 165, ejec: 146, cumple: 88 },
  { sede: "SD 2", ciudad: "Santo Domingo", prog: 92, ejec: 81, cumple: 88 },
  { sede: "LC",   ciudad: "Las Colinas",   prog: 130, ejec: 124, cumple: 95 },
  { sede: "Estelí", ciudad: "Estelí",      prog: 84, ejec: 71, cumple: 85 },
  { sede: "Masaya", ciudad: "Masaya",      prog: 48, ejec: 43, cumple: 90 },
];
