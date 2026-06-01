export type Rol =
  | "Dir. Clínica"
  | "Subdirección"
  | "Supervisor"
  | "Coordinador"
  | "Terapeuta"
  | "Esp. Familia"
  | "TI";

export type Permiso = {
  id: string;
  area: string;
  nombre: string;
};

export const permisos: Permiso[] = [
  { id: "expediente.ver", area: "Expediente", nombre: "Ver expediente clínico" },
  { id: "expediente.editar", area: "Expediente", nombre: "Editar datos del niño" },
  { id: "programa.crear", area: "Programa clínico", nombre: "Crear/aprobar programa" },
  { id: "programa.registrar", area: "Programa clínico", nombre: "Registrar trials de sesión" },
  { id: "sesion.firmar", area: "Sesión", nombre: "Firmar sesión completada" },
  { id: "inss.facturar", area: "INSS", nombre: "Generar lote INSS" },
  { id: "inss.aprobar", area: "INSS", nombre: "Aprobar y enviar lote" },
  { id: "familia.contactar", area: "Familia", nombre: "Comunicarse con familia" },
  { id: "equipo.gestionar", area: "Equipo", nombre: "Gestionar usuarios y roles" },
  { id: "sede.consolidar", area: "Multi-sede", nombre: "Ver consolidado nacional" },
];

export const matriz: Record<Rol, Record<string, "full" | "read" | "none">> = {
  "Dir. Clínica": {
    "expediente.ver": "full", "expediente.editar": "full", "programa.crear": "full",
    "programa.registrar": "full", "sesion.firmar": "full", "inss.facturar": "full",
    "inss.aprobar": "full", "familia.contactar": "full", "equipo.gestionar": "full",
    "sede.consolidar": "full",
  },
  "Subdirección": {
    "expediente.ver": "full", "expediente.editar": "full", "programa.crear": "full",
    "programa.registrar": "read", "sesion.firmar": "read", "inss.facturar": "full",
    "inss.aprobar": "full", "familia.contactar": "full", "equipo.gestionar": "full",
    "sede.consolidar": "full",
  },
  "Supervisor": {
    "expediente.ver": "full", "expediente.editar": "read", "programa.crear": "full",
    "programa.registrar": "full", "sesion.firmar": "full", "inss.facturar": "read",
    "inss.aprobar": "none", "familia.contactar": "full", "equipo.gestionar": "none",
    "sede.consolidar": "read",
  },
  "Coordinador": {
    "expediente.ver": "full", "expediente.editar": "full", "programa.crear": "read",
    "programa.registrar": "read", "sesion.firmar": "read", "inss.facturar": "full",
    "inss.aprobar": "none", "familia.contactar": "full", "equipo.gestionar": "none",
    "sede.consolidar": "none",
  },
  "Terapeuta": {
    "expediente.ver": "read", "expediente.editar": "none", "programa.crear": "none",
    "programa.registrar": "full", "sesion.firmar": "full", "inss.facturar": "none",
    "inss.aprobar": "none", "familia.contactar": "read", "equipo.gestionar": "none",
    "sede.consolidar": "none",
  },
  "Esp. Familia": {
    "expediente.ver": "read", "expediente.editar": "none", "programa.crear": "none",
    "programa.registrar": "none", "sesion.firmar": "none", "inss.facturar": "none",
    "inss.aprobar": "none", "familia.contactar": "full", "equipo.gestionar": "none",
    "sede.consolidar": "none",
  },
  "TI": {
    "expediente.ver": "none", "expediente.editar": "none", "programa.crear": "none",
    "programa.registrar": "none", "sesion.firmar": "none", "inss.facturar": "none",
    "inss.aprobar": "none", "familia.contactar": "none", "equipo.gestionar": "full",
    "sede.consolidar": "read",
  },
};

export const roles: Rol[] = ["Dir. Clínica", "Subdirección", "Supervisor", "Coordinador", "Terapeuta", "Esp. Familia", "TI"];
