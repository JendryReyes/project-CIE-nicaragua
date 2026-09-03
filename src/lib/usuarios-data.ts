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
};

export const usuariosDemo: Usuario[] = [
  { id: "u1", nombre: "Lic. Patricia Solórzano", iniciales: "PS", email: "directora@cie.edu.ni", rol: "Director Clínico", sedes: ["Todas"], estado: "Activo", mfa: true, ultimoAcceso: "Hoy · 08:14", ninosAsignados: 0, licencia: "Psicología Clínica · MINSA 2291", creado: "2024-02-11" },
  { id: "u2", nombre: "Lic. Jorge Bermúdez", iniciales: "JB", email: "admin@cie.edu.ni", rol: "Administrador de Organización", sedes: ["Santo Domingo"], estado: "Activo", mfa: true, ultimoAcceso: "Hoy · 09:02", ninosAsignados: 0, licencia: "—", creado: "2024-02-11" },
  { id: "u3", nombre: "Lic. Karla Espinoza", iniciales: "KE", email: "coordinadora@cie.edu.ni", rol: "Coordinador Clínico", sedes: ["Estelí"], estado: "Activo", mfa: true, ultimoAcceso: "Hoy · 07:48", ninosAsignados: 18, licencia: "Educación Especial · 1187", creado: "2024-05-03" },
  { id: "u4", nombre: "Lic. Ana Cristina Ruiz", iniciales: "AR", email: "supervisora.aba@cie.edu.ni", rol: "Supervisor (Analista ABA)", sedes: ["Santo Domingo", "Estelí"], estado: "Activo", mfa: true, ultimoAcceso: "Ayer · 18:20", ninosAsignados: 26, licencia: "BCBA · 1-24-58912", creado: "2024-06-17" },
  { id: "u5", nombre: "Lic. María Castellón", iniciales: "MC", email: "terapeuta@cie.edu.ni", rol: "Terapeuta", sedes: ["Santo Domingo"], estado: "Activo", mfa: false, ultimoAcceso: "Hoy · 06:55", ninosAsignados: 7, licencia: "RBT · 220145", creado: "2025-01-20" },
  { id: "u6", nombre: "Lic. Edwin Castro", iniciales: "EC", email: "edwin.castro@cie.edu.ni", rol: "Terapeuta", sedes: ["León"], estado: "Invitado", mfa: false, ultimoAcceso: "Sin ingresar", ninosAsignados: 0, licencia: "RBT · en trámite", creado: "2026-08-28" },
  { id: "u7", nombre: "Lic. Daniel Morales", iniciales: "DM", email: "daniel.morales@cie.edu.ni", rol: "Terapeuta", sedes: ["Santo Domingo"], estado: "Suspendido", mfa: false, ultimoAcceso: "Hace 14 días", ninosAsignados: 0, licencia: "RBT · 220388", creado: "2025-03-09" },
  { id: "u8", nombre: "Ing. Lorena Pavón", iniciales: "LP", email: "lorena.pavon@cie.edu.ni", rol: "Personal Administrativo", sedes: ["Santo Domingo"], estado: "Activo", mfa: true, ultimoAcceso: "Hoy · 08:40", ninosAsignados: 0, licencia: "—", creado: "2024-09-01" },
  { id: "u9", nombre: "Lic. Roberto Núñez", iniciales: "RN", email: "roberto.nunez@cie.edu.ni", rol: "Subdirector Clínico", sedes: ["Todas"], estado: "Activo", mfa: true, ultimoAcceso: "Ayer · 16:05", ninosAsignados: 12, licencia: "Psicopedagogía · 0932", creado: "2024-04-22" },
  { id: "u10", nombre: "Lic. María José Soto", iniciales: "MS", email: "mj.soto@cie.edu.ni", rol: "Terapeuta", sedes: ["Estelí"], estado: "Inactivo", mfa: false, ultimoAcceso: "Hace 3 meses", ninosAsignados: 0, licencia: "Logopedia · 4410", creado: "2024-08-14" },
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
  { titulo: "Alta e invitación", detalle: "Invitar por correo, reenviar o revocar invitación, alta masiva por plantilla." },
  { titulo: "Roles y permisos", detalle: "Un rol principal por usuario; permisos derivados de la matriz de gobernanza." },
  { titulo: "Ámbito por sede", detalle: "Usuario limitado a una o varias sedes; sólo dirección ve el consolidado." },
  { titulo: "Cartera asignada", detalle: "Terapeutas y supervisores solo acceden a los niños que tienen asignados." },
  { titulo: "Seguridad de cuenta", detalle: "MFA obligatorio por rol, reinicio de contraseña, cierre remoto de sesiones." },
  { titulo: "Credenciales profesionales", detalle: "Registro de licencia/certificación con fecha de vencimiento y alerta." },
  { titulo: "Suspensión y baja", detalle: "Suspender sin borrar, reasignar cartera y conservar firmas históricas." },
  { titulo: "Trazabilidad", detalle: "Cada cambio de rol, sede o estado se registra en la bitácora de auditoría." },
];
