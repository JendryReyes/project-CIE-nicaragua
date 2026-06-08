// Cartas de aprobación INSS por niño · alertas de vencimiento (Prioridad 1)
// Cada niño con cobertura INSS tiene una "carta de aprobación" que autoriza
// horas terapéuticas. Vencen y deben renovarse, o el CIE pierde un mes de cobro.

import type { AreaFact } from "./modulos-data";
import { sedesFact } from "./modulos-data";

export type EstadoCarta = "vigente" | "por_vencer" | "vencida" | "renovada";

export type CartaINSS = {
  id: string;
  ninoId: string;        // referencia a NinoFact.id
  numero: string;        // ej "INSS-2026-00134"
  area: AreaFact;
  emitida: string;       // ISO date
  vence: string;         // ISO date
  horasAprobadas: number;
  observacion?: string;
};

// Hoy fijo para que la demo sea reproducible
export const HOY = new Date("2026-06-08");

export function diasParaVencer(carta: CartaINSS, hoy: Date = HOY): number {
  const v = new Date(carta.vence);
  return Math.round((v.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

export function estadoCarta(carta: CartaINSS, hoy: Date = HOY): EstadoCarta {
  if ((carta as CartaINSS & { __renovada?: boolean }).__renovada) return "renovada";
  const d = diasParaVencer(carta, hoy);
  if (d < 0) return "vencida";
  if (d <= 30) return "por_vencer";
  return "vigente";
}

// Semilla — 1-3 cartas por niño INSS
export const cartasINSS: CartaINSS[] = [
  // SD1
  { id: "c001", ninoId: "n-mr", numero: "INSS-2026-00134", area: "ABA",
    emitida: "2025-12-15", vence: "2026-06-15", horasAprobadas: 32 * 6 },
  { id: "c002", ninoId: "n-mr", numero: "INSS-2026-00135", area: "Logo",
    emitida: "2025-12-15", vence: "2026-12-15", horasAprobadas: 8 * 6 },
  { id: "c003", ninoId: "n-et", numero: "INSS-2026-00141", area: "ABA",
    emitida: "2026-01-10", vence: "2026-07-10", horasAprobadas: 32 * 6 },
  { id: "c004", ninoId: "n-et", numero: "INSS-2026-00142", area: "Logo",
    emitida: "2026-01-10", vence: "2026-07-10", horasAprobadas: 8 * 6 },
  { id: "c005", ninoId: "n-cr", numero: "INSS-2025-00998", area: "ABA",
    emitida: "2025-11-04", vence: "2026-05-30", horasAprobadas: 32 * 6,
    observacion: "Vencida — bloqueo de cobro hasta renovar" },
  { id: "c006", ninoId: "n-ds", numero: "INSS-2026-00150", area: "ABA",
    emitida: "2026-02-01", vence: "2026-08-01", horasAprobadas: 40 * 6 },
  // SD2
  { id: "c007", ninoId: "n-pa", numero: "INSS-2026-00160", area: "ABA",
    emitida: "2026-02-15", vence: "2026-06-20", horasAprobadas: 12 * 6 },
  // LC — Marco Delgado
  { id: "c008", ninoId: "n-md", numero: "INSS-2025-00880", area: "ABA",
    emitida: "2025-12-01", vence: "2026-06-25", horasAprobadas: 32 * 6 },
  { id: "c009", ninoId: "n-md", numero: "INSS-2025-00881", area: "Logo",
    emitida: "2025-12-01", vence: "2026-06-25", horasAprobadas: 8 * 6 },
  // Estelí
  { id: "c010", ninoId: "n-dm", numero: "INSS-2026-00172", area: "ABA",
    emitida: "2026-01-20", vence: "2026-07-20", horasAprobadas: 42 * 6 },
  { id: "c011", ninoId: "n-dm", numero: "INSS-2026-00173", area: "Logo",
    emitida: "2026-01-20", vence: "2026-07-20", horasAprobadas: 8 * 6 },
  { id: "c012", ninoId: "n-vg", numero: "INSS-2026-00180", area: "ABA",
    emitida: "2026-03-05", vence: "2026-09-05", horasAprobadas: 32 * 6 },
  { id: "c013", ninoId: "n-vg", numero: "INSS-2026-00181", area: "Logo",
    emitida: "2026-03-05", vence: "2026-09-05", horasAprobadas: 6 * 6 },
  { id: "c014", ninoId: "n-vg", numero: "INSS-2026-00182", area: "Fisio",
    emitida: "2026-03-05", vence: "2026-09-05", horasAprobadas: 6 * 6 },
  // Masaya
  { id: "c015", ninoId: "n-lc2", numero: "INSS-2026-00190", area: "ABA",
    emitida: "2026-02-25", vence: "2026-06-28", horasAprobadas: 32 * 6 },
];

// Cartas para los niños del módulo clínico (/ninos, IDs 001..012)
// Permite mostrar la carta en el perfil clínico.
export const cartasClinicas: CartaINSS[] = [
  { id: "cc001", ninoId: "001", numero: "INSS-2026-00301", area: "ABA",
    emitida: "2025-12-20", vence: "2026-06-20", horasAprobadas: 192 },
  { id: "cc002", ninoId: "001", numero: "INSS-2026-00302", area: "Logo",
    emitida: "2025-12-20", vence: "2026-12-20", horasAprobadas: 48 },
  { id: "cc003", ninoId: "002", numero: "INSS-2026-00310", area: "Logo",
    emitida: "2025-11-15", vence: "2026-05-15", horasAprobadas: 48 },
  { id: "cc004", ninoId: "003", numero: "INSS-2026-00320", area: "Fisio",
    emitida: "2026-01-10", vence: "2026-07-10", horasAprobadas: 36 },
  { id: "cc005", ninoId: "005", numero: "INSS-2026-00330", area: "ABA",
    emitida: "2026-02-01", vence: "2026-08-01", horasAprobadas: 240 },
  { id: "cc006", ninoId: "008", numero: "INSS-2026-00340", area: "Fisio",
    emitida: "2026-03-12", vence: "2026-09-12", horasAprobadas: 36 },
  { id: "cc007", ninoId: "009", numero: "INSS-2026-00350", area: "ABA",
    emitida: "2025-12-01", vence: "2026-06-12", horasAprobadas: 192 },
  { id: "cc008", ninoId: "011", numero: "INSS-2026-00360", area: "ABA",
    emitida: "2026-01-20", vence: "2026-07-20", horasAprobadas: 144 },
  { id: "cc009", ninoId: "012", numero: "INSS-2026-00370", area: "ABA",
    emitida: "2025-11-30", vence: "2026-05-28", horasAprobadas: 192,
    observacion: "Vencida — Dirección debe renovar" },
];

// Persistencia ligera de renovaciones (localStorage en el browser)
const STORAGE_KEY = "cie:cartas-renovadas";

export function leerRenovadas(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}

export function marcarRenovada(cartaId: string) {
  if (typeof window === "undefined") return;
  const map = leerRenovadas();
  map[cartaId] = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export type CartaConEstado = CartaINSS & {
  diasRestantes: number;
  estado: EstadoCarta;
  ninoNombre: string;
  sedeId: string;
};

export function todasLasCartas(): CartaConEstado[] {
  const renovadas = leerRenovadas();
  const ninos = sedesFact.flatMap((s) => s.ninos);
  const ninoMap = new Map(ninos.map((n) => [n.id, n]));
  return [...cartasINSS, ...cartasClinicas].map((c) => {
    const n = ninoMap.get(c.ninoId);
    const renovada = !!renovadas[c.id];
    return {
      ...c,
      diasRestantes: diasParaVencer(c),
      estado: renovada ? "renovada" : estadoCarta(c),
      ninoNombre: n?.nombre ?? c.ninoId,
      sedeId: n?.sedeId ?? "—",
    };
  });
}

export function cartasPorNino(ninoId: string): CartaConEstado[] {
  return todasLasCartas().filter((c) => c.ninoId === ninoId);
}

export function cartasPorVencer(diasUmbral = 30): CartaConEstado[] {
  return todasLasCartas()
    .filter((c) => c.estado === "por_vencer" || c.estado === "vencida")
    .sort((a, b) => a.diasRestantes - b.diasRestantes);
}

export function estadoCartaColor(estado: EstadoCarta): {
  bg: string; text: string; label: string;
} {
  switch (estado) {
    case "vigente":
      return { bg: "bg-[oklch(0.94_0.05_155)]", text: "text-[oklch(0.4_0.12_155)]", label: "Vigente" };
    case "por_vencer":
      return { bg: "bg-[oklch(0.94_0.08_75)]", text: "text-[oklch(0.4_0.13_75)]", label: "Por vencer" };
    case "vencida":
      return { bg: "bg-[oklch(0.94_0.06_25)]", text: "text-[oklch(0.45_0.15_25)]", label: "Vencida" };
    case "renovada":
      return { bg: "bg-[oklch(0.94_0.05_200)]", text: "text-[oklch(0.4_0.13_200)]", label: "Renovada" };
  }
}
