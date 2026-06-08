// Suspensiones activas por niño (Prioridad 2)
// Una suspensión bloquea las horas dentro del rango [desde, hasta] del cálculo
// de facturación. El motor las resta automáticamente.

export type Suspension = {
  ninoId: string;          // referencia a NinoFact.id
  desde: string;           // ISO date
  hasta?: string;          // ISO date — undefined = indefinida (hoy)
  motivo: string;
  horasDescontadas: number;  // calculado a priori para el período de demo
};

export const suspensiones: Suspension[] = [
  // Marco Delgado — suspendido a mitad de Q2 mayo por crisis conductual
  {
    ninoId: "n-md",
    desde: "2026-05-18",
    hasta: "2026-05-28",
    motivo: "Crisis conductual recurrente — pausa terapéutica",
    horasDescontadas: 6,
  },
  // Camila Ríos — baja temporal por enfermedad familiar
  {
    ninoId: "n-cr",
    desde: "2026-05-20",
    hasta: "2026-05-30",
    motivo: "Enfermedad familiar prolongada",
    horasDescontadas: 4,
  },
];

export function suspensionDelPeriodo(
  ninoId: string,
  periodo: { quincena: 1 | 2; mes: number; anio: number }
): Suspension | undefined {
  // Q1 = 1-15, Q2 = 16-fin de mes
  const dDesde = periodo.quincena === 1 ? 1 : 16;
  const dHasta = periodo.quincena === 1 ? 15 : 31;
  const inicioPeriodo = new Date(periodo.anio, periodo.mes - 1, dDesde);
  const finPeriodo = new Date(periodo.anio, periodo.mes - 1, dHasta);
  return suspensiones.find((s) => {
    if (s.ninoId !== ninoId) return false;
    const sDesde = new Date(s.desde);
    const sHasta = s.hasta ? new Date(s.hasta) : new Date();
    return sDesde <= finPeriodo && sHasta >= inicioPeriodo;
  });
}

export function rangoSuspensionLegible(s: Suspension): string {
  const fmt = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-NI", { day: "numeric", month: "short" });
  };
  return s.hasta ? `${fmt(s.desde)} – ${fmt(s.hasta)}` : `desde ${fmt(s.desde)}`;
}
