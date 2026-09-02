// Datos demo para los módulos Matrícula, Ejecución y Facturación-por-sede
// Refleja la lógica vista en el spec presentado por María Martha (CIE)

export type AreaFact = "ABA" | "Logo" | "Fisio";

export const tarifa: Record<AreaFact, number> = {
  ABA: 1.0,    // USD por hora (mock simplificado para la demo visual)
  Logo: 1.5,
  Fisio: 1.5,
};

export const areaColor: Record<AreaFact, string> = {
  ABA: "oklch(0.55 0.158 258)",          // morado-azul
  Logo: "oklch(0.6 0.141 45)",           // naranja-rojo
  Fisio: "oklch(0.55 0.123 258)",        // teal
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
    id: "sd", nombre: "Santo Domingo", ciudad: "Managua",
    ninos: [
      { id: "n-mr", nombre: "Mateo Rodríguez", iniciales: "MR", codigoINSS: "221-001", expediente: "IT · SD", inss: true, sedeId: "sd",
        aprobadasMes: { ABA: 32, Logo: 8 }, q1: { ABA: 14, Logo: 4 }, ejecQ: { ABA: 18, Logo: 4 } },
      { id: "n-et", nombre: "Emilio Torres", iniciales: "ET", codigoINSS: "221-005", expediente: "ET · SD", inss: true, sedeId: "sd",
        aprobadasMes: { ABA: 32, Logo: 8 }, q1: { ABA: 11, Logo: 5 }, ejecQ: { ABA: 21, Logo: 3 } },
      { id: "n-cr", nombre: "Camila Ríos", iniciales: "CR", codigoINSS: "221-008", expediente: "IT · SD", inss: true, sedeId: "sd",
        aprobadasMes: { ABA: 32 }, q1: { ABA: 16 }, ejecQ: { ABA: 16 } },
      { id: "n-ds", nombre: "Diego Solís", iniciales: "DS", codigoINSS: "221-011", expediente: "PFA · SD", inss: true, sedeId: "sd",
        aprobadasMes: { ABA: 40 }, q1: { ABA: 20 }, ejecQ: { ABA: 20 } },
      { id: "n-iv", nombre: "Isabella Vega", iniciales: "IV", expediente: "TA · SD", inss: false, privado: true, sedeId: "sd",
        aprobadasMes: { ABA: 24 }, q1: { ABA: 13 }, ejecQ: { ABA: 11 } },
      { id: "n-pa", nombre: "Pedro Alvarado", iniciales: "PA", codigoINSS: "221-012", expediente: "TA · SD", inss: true, sedeId: "sd",
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
export type MatriculaArea = "conducta" | "logopedia" | "fisio" | "ocupacional";
export type MovimientoNino = {
  nino: string; iniciales: string; expediente: string;
  tipo: "ingreso" | "egreso" | "suspension";
  fecha: string; motivo: string;
  edad: number; fechaNacimiento: string; sede: "Managua" | "León" | "Granada";
  tutor: string; parentesco: string; telefono: string; correo: string; direccion: string;
  cobertura: "INSS" | "Privado";
  areas: MatriculaArea[];
  terapeutaAsignado: string;
  documentosOk: string[]; documentosFaltantes: string[];
  // Suspensión
  motivoSuspension?: string; fechaReinicio?: string; responsable?: string;
  // Egreso
  destino?: string; informeEgreso?: string;
  ninoIdRef?: string; // expediente real si existe en /ninos
};

export const movimientosNinos: MovimientoNino[] = [
  { nino: "Daniel Mora", iniciales: "DM", expediente: "EXP-2026-014", tipo: "ingreso", fecha: "2026-05-06", motivo: "Diagnóstico TEA nivel 1 – alta clínica",
    edad: 4, fechaNacimiento: "2021-09-14", sede: "Managua",
    tutor: "Patricia Mora", parentesco: "Madre", telefono: "+505 8712 4456", correo: "patricia.mora@correo.com", direccion: "Managua, Bolonia",
    cobertura: "INSS", areas: ["conducta", "logopedia"], terapeutaAsignado: "Lic. Andrea Rivas",
    documentosOk: ["Acta de nacimiento", "Colilla INSS", "Diagnóstico médico"], documentosFaltantes: ["Contrato firmado"] },
  { nino: "Camila Fuentes", iniciales: "CF", expediente: "EXP-2026-015", tipo: "ingreso", fecha: "2026-05-12", motivo: "Traslado desde Clínica San Jerónimo",
    edad: 6, fechaNacimiento: "2019-11-03", sede: "León",
    tutor: "Marcos Fuentes", parentesco: "Padre", telefono: "+505 8823 1199", correo: "m.fuentes@correo.com", direccion: "León, Sutiava",
    cobertura: "Privado", areas: ["logopedia", "ocupacional"], terapeutaAsignado: "Lic. Sofía Hernández",
    documentosOk: ["Acta de nacimiento", "Diagnóstico médico", "Contrato firmado"], documentosFaltantes: [] },
  { nino: "Valeria Ortiz", iniciales: "VO", expediente: "EXP-2026-016", tipo: "ingreso", fecha: "2026-05-22", motivo: "Diagnóstico TEA nivel 2 – alta clínica",
    edad: 3, fechaNacimiento: "2022-08-19", sede: "Managua",
    tutor: "Lucía Ortiz", parentesco: "Madre", telefono: "+505 8745 9988", correo: "lucia.ortiz@correo.com", direccion: "Managua, Las Colinas",
    cobertura: "INSS", areas: ["conducta", "logopedia", "fisio"], terapeutaAsignado: "Lic. Andrea Rivas",
    documentosOk: ["Acta de nacimiento", "Colilla INSS"], documentosFaltantes: ["Diagnóstico médico", "Contrato firmado"] },
  { nino: "Martín López", iniciales: "ML", expediente: "EXP-2025-008", tipo: "egreso", fecha: "2026-05-18", motivo: "Mudanza familiar",
    edad: 7, fechaNacimiento: "2018-04-22", sede: "Managua",
    tutor: "Roberto López", parentesco: "Padre", telefono: "+505 8801 4422", correo: "r.lopez@correo.com", direccion: "Managua → Costa Rica",
    cobertura: "Privado", areas: ["conducta"], terapeutaAsignado: "Lic. Carlos Bermúdez",
    documentosOk: ["Acta de nacimiento", "Contrato firmado", "Informe de cierre"], documentosFaltantes: [],
    destino: "Centro hermano · San José, CR", informeEgreso: "Informe-egreso-ML.pdf" },
  { nino: "Andrés Pérez", iniciales: "AP", expediente: "EXP-2025-011", tipo: "egreso", fecha: "2026-05-09", motivo: "Alta terapéutica por objetivos cumplidos",
    edad: 8, fechaNacimiento: "2017-06-30", sede: "Granada",
    tutor: "Karla Pérez", parentesco: "Madre", telefono: "+505 8866 7711", correo: "karla.p@correo.com", direccion: "Granada, Centro",
    cobertura: "INSS", areas: ["logopedia"], terapeutaAsignado: "Lic. Sofía Hernández",
    documentosOk: ["Acta de nacimiento", "Colilla INSS", "Informe de cierre"], documentosFaltantes: [],
    destino: "Seguimiento ambulatorio externo", informeEgreso: "Informe-alta-AP.pdf" },
  { nino: "Mateo Gutiérrez", iniciales: "MG", expediente: "001", tipo: "suspension", fecha: "2026-05-14", motivo: "Crisis conductual recurrente – revisar plan",
    edad: 5, fechaNacimiento: "2020-12-01", sede: "Managua",
    tutor: "Laura López", parentesco: "Madre", telefono: "+505 8765 4321", correo: "laura@correo.com", direccion: "Managua, Distrito V",
    cobertura: "INSS", areas: ["conducta", "logopedia"], terapeutaAsignado: "Lic. Andrea Rivas",
    documentosOk: ["Acta de nacimiento", "Colilla INSS"], documentosFaltantes: ["Diagnóstico médico", "Contrato firmado"],
    motivoSuspension: "Necesita reevaluación conductual antes de reingresar al plan regular.", fechaReinicio: "2026-06-15", responsable: "Dra. María Castro",
    ninoIdRef: "001" },
  { nino: "Sofía Ramírez", iniciales: "SR", expediente: "EXP-2025-019", tipo: "suspension", fecha: "2026-05-20", motivo: "Falta reiterada – revisar adherencia familiar",
    edad: 6, fechaNacimiento: "2019-03-11", sede: "León",
    tutor: "Jorge Ramírez", parentesco: "Padre", telefono: "+505 8709 3322", correo: "j.ramirez@correo.com", direccion: "León, Subtiava",
    cobertura: "Privado", areas: ["ocupacional"], terapeutaAsignado: "Lic. Carlos Bermúdez",
    documentosOk: ["Acta de nacimiento", "Contrato firmado"], documentosFaltantes: [],
    motivoSuspension: "Inasistencia >40% en el mes. Pendiente reunión con tutor.", fechaReinicio: "2026-06-03", responsable: "Coord. Andrea Rivas" },
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
  { sede: "Santo Domingo", ciudad: "Managua", prog: 257, ejec: 227, cumple: 88 },
  { sede: "LC",   ciudad: "Las Colinas",   prog: 130, ejec: 124, cumple: 95 },
  { sede: "Estelí", ciudad: "Estelí",      prog: 84, ejec: 71, cumple: 85 },
  { sede: "Masaya", ciudad: "Masaya",      prog: 48, ejec: 43, cumple: 90 },
];
