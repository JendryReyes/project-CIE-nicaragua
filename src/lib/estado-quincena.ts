// Estado de cierre de quincena con persistencia local (Prioridad 5)

export type EstadoQuincena = "abierta" | "lista" | "cerrada" | "enviada";

export type QuincenaKey = string; // `${anio}-${mes}-Q${quincena}-${sedeId}`

export type RegistroQuincena = {
  key: QuincenaKey;
  estado: EstadoQuincena;
  cerradaEn?: string;
  enviadaEn?: string;
  totalFacturable: number;
  totalNinos: number;
  usuario?: string;
};

const STORE = "cie:quincenas";

function read(): Record<QuincenaKey, RegistroQuincena> {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORE) || "{}");
  } catch {
    return {};
  }
}

function write(data: Record<QuincenaKey, RegistroQuincena>) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORE, JSON.stringify(data));
}

export function keyDe(p: { quincena: 1 | 2; mes: number; anio: number }, sedeId: string): QuincenaKey {
  return `${p.anio}-${String(p.mes).padStart(2, "0")}-Q${p.quincena}-${sedeId}`;
}

export function leerQuincena(key: QuincenaKey): RegistroQuincena | undefined {
  return read()[key];
}

export function guardarQuincena(reg: RegistroQuincena) {
  const all = read();
  all[reg.key] = reg;
  write(all);
}

export function cambiarEstado(key: QuincenaKey, estado: EstadoQuincena) {
  const all = read();
  if (!all[key]) return;
  all[key].estado = estado;
  if (estado === "cerrada") all[key].cerradaEn = new Date().toISOString();
  if (estado === "enviada") all[key].enviadaEn = new Date().toISOString();
  write(all);
}

export const pasosCierre: { id: EstadoQuincena; label: string; desc: string }[] = [
  { id: "abierta", label: "Calcular", desc: "Procesar asistencias" },
  { id: "lista", label: "Revisar", desc: "Resolver excedentes" },
  { id: "cerrada", label: "Cerrar", desc: "Bloquear edición" },
  { id: "enviada", label: "Enviar al INSS", desc: "Generar paquete" },
];
