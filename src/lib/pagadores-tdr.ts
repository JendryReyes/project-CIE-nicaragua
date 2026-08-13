// Gestión de pagadores, autorizaciones y prorrateo — TDR Parte II
export type TipoPagador = "INSS" | "Privado" | "Pro-bono" | "Otra aseguradora";

export type Autorizacion = {
  id: string;
  ninoId: string;
  nino: string;
  pagador: TipoPagador;
  entidad: string;
  numeroCarta: string;
  vigenciaDesde: string;
  vigenciaHasta: string;
  horasAutorizadasMes: number;
  limiteTDR: 25 | 45;
  programa: "IT / PFA (45h)" | "TA / TS (25h)";
  horasEjecutadasMes: number;
  activo: boolean;
  constanciaMedica?: boolean;
};

export type PagadorNino = {
  ninoId: string;
  nino: string;
  iniciales: string;
  sede: string;
  pagadorActivo: TipoPagador;
  desde: string;
  historial: { pagador: TipoPagador; desde: string; hasta: string; motivo: string }[];
  ingresoMes?: string; // fecha de ingreso si el mes es parcial
  egresoMes?: string;
};

export const autorizaciones: Autorizacion[] = [
  { id: "aut-01", ninoId: "n-mr", nino: "Mateo Rodríguez", pagador: "INSS", entidad: "INSS Nicaragua", numeroCarta: "INSS-2026-0451", vigenciaDesde: "2026-01-01", vigenciaHasta: "2026-12-31", horasAutorizadasMes: 40, limiteTDR: 45, programa: "IT / PFA (45h)", horasEjecutadasMes: 36, activo: true },
  { id: "aut-02", ninoId: "n-et", nino: "Emilio Torres", pagador: "INSS", entidad: "INSS Nicaragua", numeroCarta: "INSS-2026-0462", vigenciaDesde: "2026-02-01", vigenciaHasta: "2026-07-31", horasAutorizadasMes: 40, limiteTDR: 45, programa: "IT / PFA (45h)", horasEjecutadasMes: 40, activo: true },
  { id: "aut-03", ninoId: "n-ds", nino: "Diego Solís", pagador: "INSS", entidad: "INSS Nicaragua", numeroCarta: "INSS-2026-0470", vigenciaDesde: "2026-03-01", vigenciaHasta: "2026-08-31", horasAutorizadasMes: 40, limiteTDR: 45, programa: "IT / PFA (45h)", horasEjecutadasMes: 40, activo: true },
  { id: "aut-04", ninoId: "n-pa", nino: "Pedro Alvarado", pagador: "INSS", entidad: "INSS Nicaragua", numeroCarta: "INSS-2026-0488", vigenciaDesde: "2026-04-01", vigenciaHasta: "2026-06-30", horasAutorizadasMes: 12, limiteTDR: 25, programa: "TA / TS (25h)", horasEjecutadasMes: 12, activo: true },
  { id: "aut-05", ninoId: "n-md", nino: "Marco Delgado", pagador: "INSS", entidad: "INSS Nicaragua", numeroCarta: "INSS-2026-0491", vigenciaDesde: "2026-01-15", vigenciaHasta: "2026-06-14", horasAutorizadasMes: 40, limiteTDR: 25, programa: "TA / TS (25h)", horasEjecutadasMes: 41, activo: true, constanciaMedica: false },
  { id: "aut-06", ninoId: "n-dm", nino: "Diego Morales", pagador: "INSS", entidad: "INSS Nicaragua", numeroCarta: "INSS-2026-0495", vigenciaDesde: "2026-02-01", vigenciaHasta: "2026-12-31", horasAutorizadasMes: 50, limiteTDR: 45, programa: "IT / PFA (45h)", horasEjecutadasMes: 46, activo: true, constanciaMedica: true },
  { id: "aut-07", ninoId: "n-vg", nino: "Valentina Gutiérrez", pagador: "INSS", entidad: "INSS Nicaragua", numeroCarta: "INSS-2026-0501", vigenciaDesde: "2026-03-01", vigenciaHasta: "2026-06-30", horasAutorizadasMes: 44, limiteTDR: 45, programa: "IT / PFA (45h)", horasEjecutadasMes: 41, activo: true },
  { id: "aut-08", ninoId: "n-lc2", nino: "Lucía Castro", pagador: "INSS", entidad: "INSS Nicaragua", numeroCarta: "INSS-2026-0509", vigenciaDesde: "2026-05-01", vigenciaHasta: "2026-10-31", horasAutorizadasMes: 32, limiteTDR: 45, programa: "IT / PFA (45h)", horasEjecutadasMes: 30, activo: true },
];

export const pagadoresNinos: PagadorNino[] = [
  { ninoId: "n-mr", nino: "Mateo Rodríguez", iniciales: "MR", sede: "Santo Domingo", pagadorActivo: "INSS", desde: "2026-01-01", historial: [{ pagador: "Privado", desde: "2025-06-01", hasta: "2025-12-31", motivo: "Aprobación de carta INSS" }] },
  { ninoId: "n-et", nino: "Emilio Torres", iniciales: "ET", sede: "Santo Domingo", pagadorActivo: "INSS", desde: "2026-02-01", historial: [] },
  { ninoId: "n-cr", nino: "Camila Ríos", iniciales: "CR", sede: "Santo Domingo", pagadorActivo: "INSS", desde: "2025-11-01", historial: [] },
  { ninoId: "n-ds", nino: "Diego Solís", iniciales: "DS", sede: "Santo Domingo", pagadorActivo: "INSS", desde: "2026-03-01", historial: [{ pagador: "Privado", desde: "2025-09-01", hasta: "2026-02-28", motivo: "Trámite INSS en proceso" }] },
  { ninoId: "n-iv", nino: "Isabella Vega", iniciales: "IV", sede: "Santo Domingo", pagadorActivo: "Privado", desde: "2025-08-01", historial: [] },
  { ninoId: "n-pa", nino: "Pedro Alvarado", iniciales: "PA", sede: "Santo Domingo", pagadorActivo: "INSS", desde: "2026-04-01", historial: [], ingresoMes: "2026-06-10" },
  { ninoId: "n-md", nino: "Marco Delgado", iniciales: "MD", sede: "Las Colinas", pagadorActivo: "INSS", desde: "2026-01-15", historial: [] },
  { ninoId: "n-dm", nino: "Diego Morales", iniciales: "DM", sede: "Estelí", pagadorActivo: "INSS", desde: "2026-02-01", historial: [] },
  { ninoId: "n-vg", nino: "Valentina Gutiérrez", iniciales: "VG", sede: "Estelí", pagadorActivo: "INSS", desde: "2026-03-01", historial: [{ pagador: "Otra aseguradora", desde: "2025-05-01", hasta: "2026-02-28", motivo: "Cambio de póliza familiar" }] },
  { ninoId: "n-cz", nino: "Camila Zeledón", iniciales: "CZ", sede: "Masaya", pagadorActivo: "Pro-bono", desde: "2025-10-01", historial: [{ pagador: "Privado", desde: "2025-02-01", hasta: "2025-09-30", motivo: "Aprobación de beca institucional" }], egresoMes: "2026-06-20" },
  { ninoId: "n-lc2", nino: "Lucía Castro", iniciales: "LC", sede: "Masaya", pagadorActivo: "INSS", desde: "2026-05-01", historial: [] },
];

export function autorizacionDe(ninoId: string) {
  return autorizaciones.find((a) => a.ninoId === ninoId && a.activo);
}

export function estadoAutorizacion(a: Autorizacion) {
  const pct = Math.round((a.horasEjecutadasMes / a.horasAutorizadasMes) * 100);
  const excedeTDR = a.horasAutorizadasMes > a.limiteTDR;
  const excedeCarta = a.horasEjecutadasMes > a.horasAutorizadasMes;
  const porVencer = new Date(a.vigenciaHasta) <= new Date("2026-06-30");
  return { pct, excedeTDR, excedeCarta, porVencer };
}

// --- Prorrateo de mes parcial (TDR Parte II) ---
export function diasDelMes(mes: number, anio: number) {
  return new Date(anio, mes, 0).getDate();
}

export function prorratear(opts: {
  montoMensual: number;
  mes: number;
  anio: number;
  ingreso?: string;
  egreso?: string;
}) {
  const total = diasDelMes(opts.mes, opts.anio);
  const inicio = opts.ingreso ? new Date(opts.ingreso).getDate() : 1;
  const fin = opts.egreso ? new Date(opts.egreso).getDate() : total;
  const diasFacturables = Math.max(0, fin - inicio + 1);
  const factor = diasFacturables / total;
  return {
    diasMes: total,
    diasFacturables,
    factor,
    monto: Number((opts.montoMensual * factor).toFixed(2)),
    parcial: diasFacturables < total,
  };
}
