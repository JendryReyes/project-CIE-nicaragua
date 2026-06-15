// Reporte de cumplimiento de Colillas INSS del cotizante (padre/madre/tutor)
// Demuestra que el cotizante está al día con sus aportes para mantener el beneficio.

export type ColillaINSS = {
  mes: string;
  anio: number;
  recibida: boolean;
  fechaCarga?: string;
  observacion?: string;
};

export type CumplimientoColillas = {
  ninoId: string;
  ninoNombre: string;
  codigoINSS: string;
  cotizante: string;          // Padre/Madre que cotiza
  numeroAfiliado: string;
  empresa: string;
  colillas: ColillaINSS[];
  vigenciaAprobacion: string; // hasta cuándo está vigente la carta INSS
};

// Demo: últimos 6 meses por niño
function ultimos6(faltantes: string[] = []) {
  const meses = ["Diciembre", "Enero", "Febrero", "Marzo", "Abril", "Mayo"];
  const anios = [2025, 2026, 2026, 2026, 2026, 2026];
  return meses.map((m, i) => ({
    mes: m,
    anio: anios[i],
    recibida: !faltantes.includes(m),
    fechaCarga: !faltantes.includes(m) ? `${String(i + 1).padStart(2, "0")}/${String(i + 2).padStart(2, "0")}/${anios[i]}` : undefined,
    observacion: faltantes.includes(m) ? "Pendiente de entrega por la familia" : undefined,
  }));
}

export const cumplimientoColillas: CumplimientoColillas[] = [
  {
    ninoId: "n-001",
    ninoNombre: "Mateo Gutiérrez López",
    codigoINSS: "41911389",
    cotizante: "Carlos Gutiérrez Rivas",
    numeroAfiliado: "210-0245-8801",
    empresa: "BAC Credomatic Nicaragua",
    colillas: ultimos6(),
    vigenciaAprobacion: "31/12/2026",
  },
  {
    ninoId: "n-002",
    ninoNombre: "Amaya Vanessa Ruiz Andino",
    codigoINSS: "41911389",
    cotizante: "Vanessa Andino Castro",
    numeroAfiliado: "210-1180-6620",
    empresa: "Movistar Nicaragua",
    colillas: ultimos6(["Mayo"]),
    vigenciaAprobacion: "30/06/2026",
  },
  {
    ninoId: "n-003",
    ninoNombre: "Edward Alejandro Centeno Rivera",
    codigoINSS: "39109457",
    cotizante: "Alejandro Centeno Mora",
    numeroAfiliado: "210-0901-3344",
    empresa: "Cargill de Nicaragua",
    colillas: ultimos6(),
    vigenciaAprobacion: "31/12/2026",
  },
  {
    ninoId: "n-004",
    ninoNombre: "Sophia Valentina Gómez Hernández",
    codigoINSS: "39458359",
    cotizante: "Karla Hernández Salazar",
    numeroAfiliado: "210-1455-7712",
    empresa: "Holcim Nicaragua",
    colillas: ultimos6(["Abril", "Mayo"]),
    vigenciaAprobacion: "31/07/2026",
  },
  {
    ninoId: "n-005",
    ninoNombre: "Santiago Andrés Munguía Dávila",
    codigoINSS: "44056380",
    cotizante: "Andrés Munguía Pérez",
    numeroAfiliado: "210-0666-9911",
    empresa: "Banco LAFISE BANCENTRO",
    colillas: ultimos6(),
    vigenciaAprobacion: "31/12/2026",
  },
];

export function colillasResumen() {
  const total = cumplimientoColillas.length;
  const alDia = cumplimientoColillas.filter((c) => c.colillas.every((m) => m.recibida)).length;
  const pendientes = cumplimientoColillas.reduce(
    (acc, c) => acc + c.colillas.filter((m) => !m.recibida).length,
    0
  );
  const proximaVencer = cumplimientoColillas.filter((c) => {
    const [d, m, y] = c.vigenciaAprobacion.split("/").map(Number);
    const fecha = new Date(y, m - 1, d);
    const diff = (fecha.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff < 60;
  }).length;
  return { total, alDia, pendientes, proximaVencer };
}
