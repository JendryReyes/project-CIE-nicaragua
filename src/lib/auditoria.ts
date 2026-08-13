// Bitácora de auditoría inmutable (demo) — TDR 1.6
import type { RolOrg } from "./roles-tdr";

export type CategoriaEvento =
  | "acceso"
  | "clinico"
  | "matricula"
  | "facturacion"
  | "gobernanza"
  | "plataforma";

export type EventoAuditoria = {
  id: string;
  fecha: string; // ISO
  actor: string;
  rol: RolOrg | "Super Admin" | "Billing Admin";
  categoria: CategoriaEvento;
  accion: string;
  entidad: string;
  detalle: string;
  ip: string;
  organizacion: string;
  justificacion?: string;
};

export const categoriaLabel: Record<CategoriaEvento, string> = {
  acceso: "Acceso",
  clinico: "Clínico sensible",
  matricula: "Matrícula",
  facturacion: "Facturación",
  gobernanza: "Gobernanza",
  plataforma: "Plataforma",
};

export const eventosBase: EventoAuditoria[] = [
  {
    id: "ev-1042",
    fecha: "2026-06-01T14:22:00",
    actor: "Dra. María Castro",
    rol: "Director Clínico",
    categoria: "clinico",
    accion: "Revertir masterización",
    entidad: "Programa: Imitación motora gruesa · Mateo Gutiérrez",
    detalle: "Objetivo pasó de Masterizado a Adquisición",
    justificacion: "Pérdida de criterio en 2 sesiones consecutivas de mantenimiento.",
    ip: "190.53.14.22",
    organizacion: "CIE Nicaragua",
  },
  {
    id: "ev-1041",
    fecha: "2026-06-01T13:05:00",
    actor: "Lic. Andrea Rivas",
    rol: "Supervisor (Analista ABA)",
    categoria: "clinico",
    accion: "Activar fase de reversión",
    entidad: "Conducta: Autolesión leve · Noah Centeno",
    detalle: "Fase B → A' por 3 sesiones",
    justificacion: "Verificar control experimental del reforzador diferencial.",
    ip: "190.53.14.31",
    organizacion: "CIE Nicaragua",
  },
  {
    id: "ev-1040",
    fecha: "2026-06-01T11:48:00",
    actor: "Karla Duarte",
    rol: "Personal Administrativo",
    categoria: "facturacion",
    accion: "Excluir sesión de facturación",
    entidad: "Sesión S-4471 · Marco Delgado",
    detalle: "1h ABA excluida del lote L-2026-06A",
    justificacion: "Excede horas aprobadas sin constancia médica.",
    ip: "190.53.14.10",
    organizacion: "CIE Nicaragua",
  },
  {
    id: "ev-1039",
    fecha: "2026-06-01T10:12:00",
    actor: "Karla Duarte",
    rol: "Personal Administrativo",
    categoria: "matricula",
    accion: "Cambio de estado de matrícula",
    entidad: "Sofía Ramírez · EXP-2025-019",
    detalle: "Activo → Suspensión temporal",
    justificacion: "Inasistencia mayor al 40% del mes.",
    ip: "190.53.14.10",
    organizacion: "CIE Nicaragua",
  },
  {
    id: "ev-1038",
    fecha: "2026-05-31T17:30:00",
    actor: "Ing. Rodolfo Aguirre",
    rol: "Administrador de Organización",
    categoria: "gobernanza",
    accion: "Asignar rol",
    entidad: "Usuario: Lic. Sofía Hernández",
    detalle: "Terapeuta → Coordinador Clínico (sede Las Colinas)",
    ip: "190.53.14.2",
    organizacion: "CIE Nicaragua",
  },
  {
    id: "ev-1037",
    fecha: "2026-05-31T09:02:00",
    actor: "soporte@cietrack.app",
    rol: "Super Admin",
    categoria: "plataforma",
    accion: "Actualizar plan de organización",
    entidad: "Organización: CIE Nicaragua",
    detalle: "Plan Multi-sede · 5 sedes activas",
    ip: "34.201.9.7",
    organizacion: "Plataforma",
  },
  {
    id: "ev-1036",
    fecha: "2026-05-30T08:15:00",
    actor: "Lic. Carlos Bermúdez",
    rol: "Terapeuta",
    categoria: "acceso",
    accion: "Inicio de sesión",
    entidad: "Sesión web",
    detalle: "MFA no requerido para el rol",
    ip: "186.77.3.55",
    organizacion: "CIE Nicaragua",
  },
];

const KEY = "cie_auditoria";

function leerLocal(): EventoAuditoria[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as EventoAuditoria[]) : [];
  } catch {
    return [];
  }
}

export function registrarEvento(e: Omit<EventoAuditoria, "id" | "fecha" | "ip" | "organizacion">) {
  const nuevo: EventoAuditoria = {
    ...e,
    id: `ev-${Date.now().toString().slice(-6)}`,
    fecha: new Date().toISOString().slice(0, 19),
    ip: "190.53.14.99",
    organizacion: "CIE Nicaragua",
  };
  try {
    sessionStorage.setItem(KEY, JSON.stringify([nuevo, ...leerLocal()]));
  } catch {}
  return nuevo;
}

export function listarEventos(): EventoAuditoria[] {
  return [...leerLocal(), ...eventosBase].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export function eventosCSV(lista: EventoAuditoria[]) {
  const head = ["Fecha", "Actor", "Rol", "Categoría", "Acción", "Entidad", "Detalle", "Justificación", "IP"];
  const rows = lista.map((e) => [
    e.fecha,
    e.actor,
    e.rol,
    categoriaLabel[e.categoria],
    e.accion,
    e.entidad,
    e.detalle,
    e.justificacion ?? "",
    e.ip,
  ]);
  return [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
}

export function descargarCSV(nombre: string, contenido: string) {
  const blob = new Blob(["\uFEFF" + contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}
