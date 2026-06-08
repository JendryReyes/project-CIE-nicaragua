// Mock de facturación INSS quincenal — refleja la lógica del spec CIETrack
// Q1 = semanas 1+2 (corte día 15) · Q2 = semanas 3+4 (corte día 30)

export type AreaINSS = "ABA" | "Fisioterapia" | "Logopedia";

export type LineaFacturacion = {
  ninoId: string;
  nino: string;
  edad: number;
  area: AreaINSS;
  horasAprobadas: number;       // del período mensual según carta INSS
  horasQ1: number;              // ya facturadas en 1ra quincena
  horasEjecutadas: number;      // en esta quincena (sem 3+4 si es Q2)
  constanciaMedica?: {
    id: string;
    fecha: string;
    tipo: string;
    horasJustificadas: number;
  };
  cartaVigente: boolean;
  tipo: "INSS" | "Privada" | "Pro-bono";
};

export type LoteDetalle = {
  id: string;
  periodo: string;
  quincena: "Q1" | "Q2";
  fechaCorte: string;
  sede: string;
  estado: "borrador" | "validado" | "enviado" | "aprobado" | "pagado" | "rechazado";
  lineas: LineaFacturacion[];
  soportes: SoporteDoc[];
};

export type SoporteDoc = {
  id: string;
  nombre: string;
  requerido: boolean;
  cargado: boolean;
  firmado?: boolean;
};

// Demo: lote actual en borrador, Q2 de mayo 2026 — con excedentes reales
export const loteDemo: LoteDetalle = {
  id: "L-2026-05-Q2",
  periodo: "Mayo 2026",
  quincena: "Q2",
  fechaCorte: "2026-05-30",
  sede: "Santo Domingo",
  estado: "borrador",
  lineas: [
    // Niño dentro del límite
    { ninoId: "001", nino: "Mateo Gutiérrez López", edad: 5, area: "ABA",
      horasAprobadas: 32, horasQ1: 16, horasEjecutadas: 15, cartaVigente: true, tipo: "INSS" },
    { ninoId: "001", nino: "Mateo Gutiérrez López", edad: 5, area: "Logopedia",
      horasAprobadas: 8, horasQ1: 4, horasEjecutadas: 4, cartaVigente: true, tipo: "INSS" },

    // Excedente CON constancia médica → se factura
    { ninoId: "005", nino: "Noah Centeno Ríos", edad: 7, area: "ABA",
      horasAprobadas: 32, horasQ1: 16, horasEjecutadas: 20, cartaVigente: true, tipo: "INSS",
      constanciaMedica: { id: "CM-114", fecha: "2026-04-22", tipo: "Refuerzo conductual post-crisis", horasJustificadas: 4 } },
    { ninoId: "005", nino: "Noah Centeno Ríos", edad: 7, area: "Fisioterapia",
      horasAprobadas: 12, horasQ1: 6, horasEjecutadas: 6, cartaVigente: true, tipo: "INSS" },

    // Excedente SIN constancia → se EXCLUYE
    { ninoId: "012", nino: "Renata Cárcamo", edad: 7, area: "ABA",
      horasAprobadas: 32, horasQ1: 16, horasEjecutadas: 19, cartaVigente: true, tipo: "INSS" },

    // Carta INSS vencida → NO se factura a INSS
    { ninoId: "006", nino: "Sofía Aguilar Mora", edad: 5, area: "Logopedia",
      horasAprobadas: 8, horasQ1: 4, horasEjecutadas: 4, cartaVigente: false, tipo: "Privada" },

    // Pro-bono
    { ninoId: "010", nino: "Camila Zeledón", edad: 3, area: "Fisioterapia",
      horasAprobadas: 0, horasQ1: 0, horasEjecutadas: 6, cartaVigente: false, tipo: "Pro-bono" },

    { ninoId: "002", nino: "Valentina Rocha Mejía", edad: 4, area: "Logopedia",
      horasAprobadas: 8, horasQ1: 4, horasEjecutadas: 4, cartaVigente: true, tipo: "INSS" },
    { ninoId: "008", nino: "Isabella Briones", edad: 4, area: "Fisioterapia",
      horasAprobadas: 12, horasQ1: 6, horasEjecutadas: 5, cartaVigente: true, tipo: "INSS" },
    { ninoId: "009", nino: "Samuel Membreño Pavón", edad: 6, area: "ABA",
      horasAprobadas: 32, horasQ1: 16, horasEjecutadas: 16, cartaVigente: true, tipo: "INSS" },
  ],
  soportes: [
    { id: "carta", nombre: "Carta de cobro al INSS", requerido: true, cargado: true, firmado: false },
    { id: "excel", nombre: "Excel detallado de servicios (ABA+PFA / Fisio+Logo)", requerido: true, cargado: true },
    { id: "solvencia", nombre: "Solvencia fiscal del período", requerido: true, cargado: true },
    { id: "cert-prov", nombre: "Certificación Proveedores del Estado vigente", requerido: true, cargado: false },
    { id: "cartas-aprob", nombre: "Cartas de aprobación INSS por niño facturado", requerido: true, cargado: true },
    { id: "asist-firmadas", nombre: "Asistencias físicas escaneadas con firma del padre", requerido: true, cargado: true },
    { id: "constancias", nombre: "Constancias médicas de excedentes", requerido: false, cargado: true },
    { id: "recibo-caja", nombre: "Recibo oficial de caja", requerido: true, cargado: false },
  ],
};

// Calcula horas a facturar aplicando la regla:
// horasFacturables = min(ejecutadas, aprobadas - Q1 + horasConstancia)
export function calcularLinea(l: LineaFacturacion) {
  const constancia = l.constanciaMedica?.horasJustificadas ?? 0;
  const limiteRestante = Math.max(0, l.horasAprobadas - l.horasQ1) + constancia;
  const facturablesINSS = l.tipo === "INSS" && l.cartaVigente
    ? Math.min(l.horasEjecutadas, limiteRestante)
    : 0;
  const excedente = l.tipo === "INSS" ? Math.max(0, l.horasEjecutadas - limiteRestante) : 0;
  const excluidoSinCarta = l.tipo === "INSS" && !l.cartaVigente ? l.horasEjecutadas : 0;
  return { facturablesINSS, excedente, excluidoSinCarta, limiteRestante };
}

export const TARIFA_HORA_USD = 24; // mock unificado

export function resumenLote(lote: LoteDetalle) {
  let horasINSS = 0, horasExcedente = 0, horasSinCarta = 0, horasPrivada = 0, horasProBono = 0;
  let conConstancia = 0, sinConstancia = 0;
  for (const l of lote.lineas) {
    const c = calcularLinea(l);
    horasINSS += c.facturablesINSS;
    horasExcedente += c.excedente;
    horasSinCarta += c.excluidoSinCarta;
    if (l.tipo === "Privada") horasPrivada += l.horasEjecutadas;
    if (l.tipo === "Pro-bono") horasProBono += l.horasEjecutadas;
    if (c.excedente > 0) {
      if (l.constanciaMedica) conConstancia++; else sinConstancia++;
    }
  }
  return {
    horasINSS,
    horasExcedente,
    horasSinCarta,
    horasPrivada,
    horasProBono,
    montoINSS: horasINSS * TARIFA_HORA_USD,
    montoPrivada: horasPrivada * TARIFA_HORA_USD,
    ninos: new Set(lote.lineas.map(l => l.ninoId)).size,
    alertasExcedente: sinConstancia,
    excedenteJustificado: conConstancia,
  };
}
