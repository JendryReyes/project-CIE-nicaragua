// Store en memoria de firmas digitales de familias (Prioridad 4)
export type FirmaDigital = {
  id: string;
  familiaId: string;
  ninoId: string;
  semana: number;
  mes: number;
  anio: number;
  timestamp: string;
  signatureDataUrl: string;
  hashVerificacion: string;
  contenidoFirmado: {
    semana: number;
    sesiones: { fecha: string; area: string; horas: number }[];
    totalHoras: number;
  };
};

const firmas: FirmaDigital[] = [];
const listeners: Array<() => void> = [];

export function getFirmas() {
  return [...firmas];
}

export function agregarFirma(f: Omit<FirmaDigital, "id" | "timestamp" | "hashVerificacion">) {
  const full: FirmaDigital = {
    ...f,
    id: `fir-${Date.now()}`,
    timestamp: new Date().toISOString(),
    hashVerificacion: btoa(JSON.stringify(f.contenidoFirmado)).slice(0, 16),
  };
  firmas.push(full);
  listeners.forEach((l) => l());
  return full;
}

export function suscribirFirmas(fn: () => void) {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i >= 0) listeners.splice(i, 1);
  };
}

export function firmasPendientesDemo() {
  return [
    {
      id: "pend-1",
      semana: 22,
      mes: 5,
      anio: 2026,
      titulo: "Conformidad semana 22 — Mayo 2026",
      sesiones: [
        { fecha: "2026-05-25", area: "ABA", horas: 1.5 },
        { fecha: "2026-05-26", area: "Logopedia", horas: 1.0 },
        { fecha: "2026-05-27", area: "ABA", horas: 1.5 },
        { fecha: "2026-05-28", area: "ABA", horas: 1.5 },
        { fecha: "2026-05-29", area: "Fisioterapia", horas: 1.0 },
      ],
    },
  ];
}
