// Datos de demostración para el diseño de Gestión de usuarios (solo visual).
import type { RolOrg } from "@/lib/roles-tdr";

export type EstadoUsuario = "Activo" | "Invitado" | "Suspendido" | "Inactivo";

export type Usuario = {
  id: string;
  nombre: string;
  iniciales: string;
  email: string;
  rol: RolOrg;
  sedes: string[];
  estado: EstadoUsuario;
  mfa: boolean;
  ultimoAcceso: string;
  ninosAsignados: number;
  licencia: string;
  creado: string;
  idioma: "Español" | "Inglés";
  diasRotacionPassword: number; // días restantes antes de rotación obligatoria (90 días)
  mfaRequerido: "Obligatorio" | "Recomendado" | "Configurable";
  redRestringida: boolean; // acceso administrativo limitado a red segura / VPN
};

export const usuariosDemo: Usuario[] = [
  { id: "u1", nombre: "Lic. Patricia Solórzano", iniciales: "PS", email: "directora@cie.edu.ni", rol: "Director Clínico", sedes: ["Todas"], estado: "Activo", mfa: true, ultimoAcceso: "Hoy · 08:14", ninosAsignados: 0, licencia: "Psicología Clínica · MINSA 2291", creado: "2024-02-11", idioma: "Español", diasRotacionPassword: 41, mfaRequerido: "Recomendado", redRestringida: false },
  { id: "u2", nombre: "Lic. Jorge Bermúdez", iniciales: "JB", email: "admin@cie.edu.ni", rol: "Administrador de Organización", sedes: ["Santo Domingo"], estado: "Activo", mfa: true, ultimoAcceso: "Hoy · 09:02", ninosAsignados: 0, licencia: "—", creado: "2024-02-11", idioma: "Español", diasRotacionPassword: 12, mfaRequerido: "Obligatorio", redRestringida: true },
  { id: "u3", nombre: "Lic. Karla Espinoza", iniciales: "KE", email: "coordinadora@cie.edu.ni", rol: "Coordinador Clínico", sedes: ["Estelí"], estado: "Activo", mfa: true, ultimoAcceso: "Hoy · 07:48", ninosAsignados: 18, licencia: "Educación Especial · 1187", creado: "2024-05-03", idioma: "Español", diasRotacionPassword: 63, mfaRequerido: "Recomendado", redRestringida: true },
  { id: "u4", nombre: "Lic. Ana Cristina Ruiz", iniciales: "AR", email: "supervisora.aba@cie.edu.ni", rol: "Supervisor (Analista ABA)", sedes: ["Santo Domingo", "Estelí"], estado: "Activo", mfa: true, ultimoAcceso: "Ayer · 18:20", ninosAsignados: 26, licencia: "BCBA · 1-24-58912", creado: "2024-06-17", idioma: "Inglés", diasRotacionPassword: 78, mfaRequerido: "Recomendado", redRestringida: false },
  { id: "u5", nombre: "Lic. María Castellón", iniciales: "MC", email: "terapeuta@cie.edu.ni", rol: "Terapeuta", sedes: ["Santo Domingo"], estado: "Activo", mfa: false, ultimoAcceso: "Hoy · 06:55", ninosAsignados: 7, licencia: "RBT · 220145", creado: "2025-01-20", idioma: "Español", diasRotacionPassword: 5, mfaRequerido: "Configurable", redRestringida: false },
  { id: "u6", nombre: "Lic. Edwin Castro", iniciales: "EC", email: "edwin.castro@cie.edu.ni", rol: "Terapeuta", sedes: ["León"], estado: "Invitado", mfa: false, ultimoAcceso: "Sin ingresar", ninosAsignados: 0, licencia: "RBT · en trámite", creado: "2026-08-28", idioma: "Español", diasRotacionPassword: 90, mfaRequerido: "Configurable", redRestringida: false },
  { id: "u7", nombre: "Lic. Daniel Morales", iniciales: "DM", email: "daniel.morales@cie.edu.ni", rol: "Terapeuta", sedes: ["Santo Domingo"], estado: "Suspendido", mfa: false, ultimoAcceso: "Hace 14 días", ninosAsignados: 0, licencia: "RBT · 220388", creado: "2025-03-09", idioma: "Español", diasRotacionPassword: 0, mfaRequerido: "Configurable", redRestringida: false },
  { id: "u8", nombre: "Ing. Lorena Pavón", iniciales: "LP", email: "lorena.pavon@cie.edu.ni", rol: "Personal Administrativo", sedes: ["Santo Domingo"], estado: "Activo", mfa: true, ultimoAcceso: "Hoy · 08:40", ninosAsignados: 0, licencia: "—", creado: "2024-09-01", idioma: "Español", diasRotacionPassword: 33, mfaRequerido: "Configurable", redRestringida: false },
  { id: "u9", nombre: "Lic. Roberto Núñez", iniciales: "RN", email: "roberto.nunez@cie.edu.ni", rol: "Subdirector Clínico", sedes: ["Todas"], estado: "Activo", mfa: true, ultimoAcceso: "Ayer · 16:05", ninosAsignados: 12, licencia: "Psicopedagogía · 0932", creado: "2024-04-22", idioma: "Español", diasRotacionPassword: 57, mfaRequerido: "Recomendado", redRestringida: false },
  { id: "u10", nombre: "Lic. María José Soto", iniciales: "MS", email: "mj.soto@cie.edu.ni", rol: "Terapeuta", sedes: ["Estelí"], estado: "Inactivo", mfa: false, ultimoAcceso: "Hace 3 meses", ninosAsignados: 0, licencia: "Logopedia · 4410", creado: "2024-08-14", idioma: "Español", diasRotacionPassword: 0, mfaRequerido: "Configurable", redRestringida: false },
];

export const sedesDemo = ["Santo Domingo", "Estelí", "León"];

export const estadoTono: Record<EstadoUsuario, string> = {
  Activo: "bg-[oklch(0.94_0.053_160)] text-[oklch(0.4_0.106_160)]",
  Invitado: "bg-[oklch(0.95_0.062_80)] text-[oklch(0.44_0.114_80)]",
  Suspendido: "bg-[oklch(0.95_0.053_45)] text-[oklch(0.45_0.132_45)]",
  Inactivo: "bg-muted text-muted-foreground",
};

// Ciclo de vida de una cuenta (para el diagrama del diseño)
export const cicloVida = [
  { paso: "Invitación", detalle: "Admin envía correo con enlace de un solo uso (72 h)" },
  { paso: "Alta de perfil", detalle: "Usuario define contraseña y registra MFA obligatorio" },
  { paso: "Asignación", detalle: "Rol, sede(s) y cartera de niños asignados" },
  { paso: "Operación", detalle: "Accesos filtrados por rol; toda acción queda en bitácora" },
  { paso: "Baja / suspensión", detalle: "Se revoca sesión, se conserva historial clínico firmado" },
];

export const funcionalidades = [
  { titulo: "Alta e invitación", detalle: "Invitar por correo, reenviar o revocar invitación; el correo se envía en el idioma del destinatario." },
  { titulo: "Roles y permisos", detalle: "Un rol principal por usuario bajo mínimo privilegio; permisos derivados de la matriz de la sección 1.4." },
  { titulo: "Ámbito por sede", detalle: "Aislamiento lógico por sede (RLS); sólo el Administrador de Organización ve el consolidado." },
  { titulo: "Cartera asignada", detalle: "Terapeutas y supervisores solo acceden a los niños que tienen asignados." },
  { titulo: "Seguridad de cuenta", detalle: "2FA obligatorio para Administración, rotación de contraseña a 90 días y cierre remoto de sesiones." },
  { titulo: "Credenciales profesionales", detalle: "Registro de licencia/certificación con fecha de vencimiento y alerta." },
  { titulo: "Suspensión y baja", detalle: "Suspender sin borrar, reasignar cartera y conservar firmas históricas." },
  { titulo: "Trazabilidad", detalle: "Creación, edición, desactivación, invitación y cambio de rol quedan en bitácora inmutable (10 años)." },
  { titulo: "Idioma del usuario", detalle: "Idioma predeterminado de la organización, sobrescribible por cada usuario (interfaz, correos y reportes)." },
  { titulo: "Sesión clínica continua", detalle: "La sesión móvil no expira mientras exista una sesión clínica activa; sin reautenticar a media terapia." },
];

// 1.5 Autenticación y control de acceso
export const politicaAcceso = {
  mecanismos: [
    "Correo electrónico y contraseña (base para todos los roles)",
    "Doble factor (2FA): obligatorio para Administrador de Organización; recomendado para Coordinadores y Supervisores; configurable para los demás roles",
    "Sesión móvil persistente: no expira mientras exista una sesión clínica en estado Activa",
  ],
  password: [
    "Longitud mínima de 10 caracteres",
    "Al menos una mayúscula, una minúscula y un carácter especial",
    "No se permite reutilizar las últimas 5 contraseñas",
    "Rotación cada 90 días (plazo configurable por el Administrador de Organización)",
  ],
  red: "Acceso por HTTPS. Opcionalmente, las peticiones administrativas de roles críticos (Administrador de Organización y Coordinador) pueden restringirse a un segmento de red seguro o VPN del centro.",
};

// 1.6 Aislamiento de datos entre sedes
export const aislamientoSedes = [
  "Cada registro queda vinculado a su sede; las consultas aplican filtro de sede obligatorio (Row-Level Security).",
  "Ningún endpoint devuelve datos de sedes no autorizadas, excepto para el Administrador de Organización.",
  "Las exportaciones (PDF/Excel/reportes) validan las sedes autorizadas del usuario antes de generarse.",
  "Los adjuntos se almacenan en rutas segmentadas por sede con control de acceso por recurso.",
];

// 1.6.3 Accesos de soporte técnico (autorización temporal)
export type AccesoSoporte = {
  id: string;
  tecnico: string;
  motivo: string;
  autorizadoPor: string;
  inicio: string;
  vence: string;
  estado: "Vigente" | "Vencido" | "Pendiente de autorización";
};
export const accesosSoporte: AccesoSoporte[] = [
  { id: "s1", tecnico: "Soporte · Ing. H. Delgado", motivo: "Diagnóstico de sincronización móvil en sede Estelí", autorizadoPor: "Lic. Jorge Bermúdez", inicio: "2026-09-01 09:00", vence: "2026-09-03 09:00", estado: "Vigente" },
  { id: "s2", tecnico: "Soporte · Ing. R. Ortega", motivo: "Revisión de reporte de facturación quincenal", autorizadoPor: "Lic. Jorge Bermúdez", inicio: "2026-08-20 14:00", vence: "2026-08-21 14:00", estado: "Vencido" },
  { id: "s3", tecnico: "Soporte · Ing. M. Fajardo", motivo: "Migración de catálogo clínico", autorizadoPor: "—", inicio: "—", vence: "—", estado: "Pendiente de autorización" },
];

// 1.7.1 Eventos auditados relacionados a cuentas y accesos
export const eventosAuditados = [
  { categoria: "Autenticación", eventos: "Ingreso exitoso, ingreso fallido (con IP), cierre de sesión, cambio de contraseña, activación de 2FA" },
  { categoria: "Gestión de usuarios", eventos: "Creación, edición, desactivación e invitación de usuarios; cambios de rol asignado" },
  { categoria: "Accesos de soporte", eventos: "Quién autorizó, quién accedió, fechas de inicio y vencimiento, motivo documentado" },
  { categoria: "Exportaciones", eventos: "Generación de reportes y exportaciones de datos clínicos o administrativos" },
];
