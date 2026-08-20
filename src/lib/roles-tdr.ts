// Jerarquía de roles y segregación de datos según TDR v1.2 (Parte I)
import { createContext, useContext, useEffect, useState, createElement, type ReactNode } from "react";

// --- Roles de plataforma (nivel global) ---
export type RolPlataforma = "Super Admin" | "Billing Admin";
export const rolesPlataforma: RolPlataforma[] = ["Super Admin", "Billing Admin"];

// --- Roles de organización (nivel tenant) — TDR 1.3.1 ---
export type RolOrg =
  | "Administrador de Organización"
  | "Director Clínico"
  | "Subdirector Clínico"
  | "Supervisor (Analista ABA)"
  | "Coordinador Clínico"
  | "Terapeuta"
  | "Personal Administrativo";

export const rolesOrg: RolOrg[] = [
  "Administrador de Organización",
  "Director Clínico",
  "Subdirector Clínico",
  "Supervisor (Analista ABA)",
  "Coordinador Clínico",
  "Terapeuta",
  "Personal Administrativo",
];

export const rolSigla: Record<RolOrg, string> = {
  "Administrador de Organización": "ADM",
  "Director Clínico": "DIR",
  "Subdirector Clínico": "SUB",
  "Supervisor (Analista ABA)": "SUP",
  "Coordinador Clínico": "COO",
  Terapeuta: "TER",
  "Personal Administrativo": "PAD",
};

export const rolDescripcion: Record<RolOrg, string> = {
  "Administrador de Organización":
    "Gobierna el tenant: usuarios, roles, configuración y facturación. No ejecuta acciones clínicas sensibles.",
  "Director Clínico": "Máxima autoridad clínica. Aprueba biblioteca global y acciones metodológicas críticas.",
  "Subdirector Clínico": "Respalda a la dirección clínica con las mismas facultades metodológicas.",
  "Supervisor (Analista ABA)": "Analista responsable de programas, masterización y supervisión de terapeutas.",
  "Coordinador Clínico": "Coordina agenda, asignaciones y seguimiento operativo-clínico de su cartera.",
  Terapeuta: "Ejecuta sesiones y toma de datos únicamente de los niños asignados.",
  "Personal Administrativo":
    "Gestiona matrícula, horas ejecutadas, documentos firmados y facturación. Sin acceso a notas clínicas.",
};

// --- 1.4.1 Datos de acceso restringido ---
export type DatoSensible =
  | "nota_progreso"
  | "nota_cualitativa"
  | "registro_abc"
  | "horas_documentos"
  | "justificaciones_salud"
  | "facturacion_horas_autorizadas"
  | "montos_monetarios";

export const datoLabel: Record<DatoSensible, string> = {
  nota_progreso: "Nota de progreso clínica",
  nota_cualitativa: "Nota cualitativa del terapeuta",
  registro_abc: "Registro ABC completo",
  horas_documentos: "Horas ejecutadas y documentos firmados",
  justificaciones_salud: "Justificaciones de inasistencia por salud",
  facturacion_horas_autorizadas: "Datos de facturación y horas autorizadas",
  montos_monetarios: "Montos monetarios (solo módulo de Facturación)",
};

const acceso: Record<DatoSensible, RolOrg[]> = {
  nota_progreso: [
    "Terapeuta",
    "Supervisor (Analista ABA)",
    "Coordinador Clínico",
    "Director Clínico",
    "Subdirector Clínico",
    "Administrador de Organización",
  ],
  nota_cualitativa: ["Terapeuta", "Supervisor (Analista ABA)", "Director Clínico", "Subdirector Clínico"],
  registro_abc: [
    "Terapeuta",
    "Supervisor (Analista ABA)",
    "Coordinador Clínico",
    "Director Clínico",
    "Subdirector Clínico",
  ],
  horas_documentos: rolesOrg,
  justificaciones_salud: [
    "Personal Administrativo",
    "Supervisor (Analista ABA)",
    "Coordinador Clínico",
    "Director Clínico",
    "Subdirector Clínico",
    "Administrador de Organización",
  ],
  facturacion_horas_autorizadas: [
    "Personal Administrativo",
    "Coordinador Clínico",
    "Administrador de Organización",
    "Director Clínico",
    "Subdirector Clínico",
  ],
  montos_monetarios: ["Personal Administrativo", "Administrador de Organización", "Director Clínico"],
};

export function puedeVer(rol: RolOrg, dato: DatoSensible) {
  return acceso[dato].includes(rol);
}

export function rolesConAcceso(dato: DatoSensible) {
  return acceso[dato];
}

// --- 1.4.3 Matriz de acciones clínicas sensibles ---
export type NivelAccion = "si" | "no" | "condicional" | "propios";

export type AccionSensible = {
  id: string;
  nombre: string;
  nota?: string;
  permisos: Record<RolOrg, NivelAccion>;
};

const P = (
  adm: NivelAccion,
  dir: NivelAccion,
  sub: NivelAccion,
  sup: NivelAccion,
  coo: NivelAccion,
  ter: NivelAccion,
  pad: NivelAccion,
): Record<RolOrg, NivelAccion> => ({
  "Administrador de Organización": adm,
  "Director Clínico": dir,
  "Subdirector Clínico": sub,
  "Supervisor (Analista ABA)": sup,
  "Coordinador Clínico": coo,
  Terapeuta: ter,
  "Personal Administrativo": pad,
});

export const accionesSensibles: AccionSensible[] = [
  {
    id: "biblioteca.global",
    nombre: "Crear, editar o archivar plantillas en la Biblioteca Global",
    permisos: P("no", "si", "si", "si", "si", "no", "no"),
  },
  {
    id: "objetivo.forzar",
    nombre: "Forzar cambio manual de estado de un objetivo",
    nota: "Ej. pasar de En espera a Adquisición.",
    permisos: P("no", "si", "si", "si", "si", "no", "no"),
  },
  {
    id: "masterizacion.revertir",
    nombre: "Revertir una masterización automática",
    permisos: P("no", "si", "si", "si", "si", "no", "no"),
  },
  {
    id: "conducta.reversion",
    nombre: "Activar fase de Reversión experimental en conducta",
    nota: "Supervisor requiere justificación obligatoria.",
    permisos: P("no", "si", "si", "condicional", "si", "no", "no"),
  },
  {
    id: "nota.cualitativa.leer",
    nombre: "Leer la Nota Cualitativa de sesión de otros terapeutas",
    nota: "Coordinador Clínico: configurable por la organización.",
    permisos: P("no", "si", "si", "si", "condicional", "no", "no"),
  },
  {
    id: "sesion.datos",
    nombre: "Ejecutar toma de datos en sesión y registros pos-sesión (ensayos, frecuencia, duración, latencia, ABC)",
    nota: "Terapeuta: solo de niños asignados.",
    permisos: P("no", "si", "si", "si", "si", "propios", "no"),
  },
  {
    id: "intervalos.modificar",
    nombre: "Modificar la duración de intervalos en sesión activa",
    permisos: P("no", "si", "si", "si", "si", "no", "no"),
  },
  {
    id: "grafica.eventos",
    nombre: "Insertar eventos contextuales y líneas de fase en la gráfica de progreso",
    permisos: P("no", "si", "si", "si", "si", "no", "no"),
  },
];

// --- Contexto de sesión demo: rol activo ("ver como rol") ---
const KEY = "cie_rol_activo";

const RolCtx = createContext<{ rol: RolOrg; setRol: (r: RolOrg) => void }>({
  rol: "Administrador de Organización",
  setRol: () => {},
});

export function RolProvider({ children }: { children: ReactNode }) {
  const [rol, setRolState] = useState<RolOrg>("Administrador de Organización");
  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY) as RolOrg | null;
      if (v && rolesOrg.includes(v)) setRolState(v);
    } catch {}
  }, []);
  const setRol = (r: RolOrg) => {
    setRolState(r);
    try {
      localStorage.setItem(KEY, r);
    } catch {}
  };
  return createElement(RolCtx.Provider, { value: { rol, setRol } }, children);
}

export function useRol() {
  const { rol, setRol } = useContext(RolCtx);
  return {
    rol,
    setRol,
    puede: (dato: DatoSensible) => puedeVer(rol, dato),
    verMontos: puedeVer(rol, "montos_monetarios"),
    esAdmin: rol === "Administrador de Organización",
  };
}

// --- Módulos visibles por rol (TDR 1.3.1 + 1.4.1) ---
const todos = [
  "/dashboard",
  "/matricula",
  "/admision",
  "/cupos",
  "/planificacion",
  "/asistencia",
  "/ejecucion",
  "/ninos",
  "/horario",
  "/biblioteca",
  "/clinico/graficas",
  "/agenda",
  "/diagnostico",
  "/incidentes",
  "/kpis",
  "/sedes",
  "/facturacion",
  "/pagadores",
  "/tarifas",
  "/reportes",
  "/familias",
  "/equipo",
  "/auditoria",
  "/plataforma",
];

export const modulosPorRol: Record<RolOrg, string[]> = {
  "Administrador de Organización": todos,
  "Director Clínico": todos.filter((m) => m !== "/plataforma"),
  "Subdirector Clínico": todos.filter((m) => !["/plataforma", "/tarifas", "/facturacion"].includes(m)),
  "Supervisor (Analista ABA)": [
    "/dashboard",
    "/cupos",
    "/planificacion",
    "/asistencia",
    "/ejecucion",
    "/ninos",
    "/horario",
    "/biblioteca",
    "/clinico/graficas",
    "/agenda",
    "/diagnostico",
    "/incidentes",
    "/kpis",
    "/reportes",
  ],
  "Coordinador Clínico": [
    "/dashboard",
    "/matricula",
    "/admision",
    "/cupos",
    "/planificacion",
    "/asistencia",
    "/ejecucion",
    "/ninos",
    "/horario",
    "/biblioteca",
    "/clinico/graficas",
    "/agenda",
    "/diagnostico",
    "/incidentes",
    "/kpis",
    "/reportes",
    "/familias",
  ],
  Terapeuta: [
    "/dashboard",
    "/asistencia",
    "/ejecucion",
    "/ninos",
    "/horario",
    "/biblioteca",
    "/clinico/graficas",
    "/agenda",
    "/incidentes",
    "/kpis",
  ],
  "Personal Administrativo": [
    "/dashboard",
    "/matricula",
    "/admision",
    "/cupos",
    "/asistencia",
    "/agenda",
    "/diagnostico",
    "/kpis",
    "/sedes",
    "/facturacion",
    "/pagadores",
    "/tarifas",
    "/reportes",
    "/familias",
  ],
};

export function puedeModulo(rol: RolOrg, url: string) {
  return modulosPorRol[rol].includes(url);
}

// --- Política de seguridad (TDR 1.5) ---

export const politicaSeguridad = {
  mfaObligatorio: ["Super Admin", "Billing Admin", "Administrador de Organización"],
  mfaRecomendado: ["Coordinador Clínico", "Supervisor (Analista ABA)"],
  password: {
    minimo: 12,
    requiere: "Mayúsculas, minúsculas, número y carácter especial",
    caducidad: "90 días",
    reutilizacion: "No permite las últimas 5 contraseñas",
    bloqueo: "5 intentos fallidos · bloqueo temporal 15 min",
  },
  red: "Acceso solo por HTTPS; restricción opcional por dominio de correo corporativo y rango de IP por organización.",
};
