// Información administrativa de cada sede clínica.
// La capacidad por disciplina vive en cupos-data.ts y se anida en acordeón.
export type EstadoSede = "activa" | "pausada";

export type SedeInfo = {
  nombre: string;
  codigo: string;
  sigla: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  correo: string;
  matriz: boolean;
  estado: EstadoSede;
  horaApertura?: string;
  horaCierre?: string;
  umbralAlerta?: number;
};

export const sedesInfo: SedeInfo[] = [
  {
    nombre: "Santo Domingo",
    codigo: "SD-001",
    sigla: "SD",
    ciudad: "Managua",
    direccion: "Km 8 Carretera a Masaya, Plaza Santo Domingo",
    telefono: "+505 2276 4100",
    correo: "santodomingo@evolua.app",
    matriz: true,
    estado: "activa",
  },
  {
    nombre: "Las Colinas",
    codigo: "LC-002",
    sigla: "LC",
    ciudad: "Managua",
    direccion: "Carretera Sur, contiguo a Hospital Alemán",
    telefono: "+505 2252 8840",
    correo: "lascolinas@evolua.app",
    matriz: false,
    estado: "activa",
  },
  {
    nombre: "Estelí",
    codigo: "ES-003",
    sigla: "ES",
    ciudad: "Estelí",
    direccion: "De la Rotonda El Periodista 200 m al norte",
    telefono: "+505 2713 2260",
    correo: "esteli@evolua.app",
    matriz: false,
    estado: "activa",
  },
  {
    nombre: "Masaya",
    codigo: "MA-004",
    sigla: "MA",
    ciudad: "Masaya",
    direccion: "Costado oeste del Mercado de Artesanías",
    telefono: "+505 2522 4315",
    correo: "masaya@evolua.app",
    matriz: false,
    estado: "pausada",
  },
  {
    nombre: "León",
    codigo: "LE-005",
    sigla: "LE",
    ciudad: "León",
    direccion: "De la Catedral 3 cuadras al lago",
    telefono: "+505 2311 0980",
    correo: "leon@evolua.app",
    matriz: false,
    estado: "activa",
  },
];
