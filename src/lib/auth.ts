const KEY = "cie_auth";

export type Rol =
  | "Dirección Ejecutiva"
  | "Administración / DAF"
  | "Coordinadora"
  | "Terapeuta"
  | "Familia";

export type UserSesion = {
  nombre: string;
  rol: Rol;
  email: string;
  sede: string | null; // null = todas las sedes
};

export const ACCESOS_DEMO: Array<UserSesion & { ruta: string }> = [
  { nombre: "Lic. Patricia Solórzano", rol: "Dirección Ejecutiva", email: "directora@cie.edu.ni", sede: null, ruta: "/dashboard" },
  { nombre: "Lic. Jorge Bermúdez", rol: "Administración / DAF", email: "admin@cie.edu.ni", sede: "Santo Domingo", ruta: "/facturacion" },
  { nombre: "Lic. Karla Espinoza", rol: "Coordinadora", email: "coordinadora@cie.edu.ni", sede: "Estelí", ruta: "/asistencia" },
  { nombre: "Lic. María Castellón", rol: "Terapeuta", email: "terapeuta@cie.edu.ni", sede: "Santo Domingo", ruta: "/asistencia" },
  { nombre: "Familia Rodríguez", rol: "Familia", email: "padre@correo.com", sede: "Santo Domingo", ruta: "/familias" },
];

export function login(user: UserSesion) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify({ ...user, ts: Date.now() }));
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export function getUser(): UserSesion | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
