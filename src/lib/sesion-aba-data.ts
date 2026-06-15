// Datos demo para módulo de Sesión ABA en vivo (inspirado en Hi Rasmus)

export type AreaTratamiento =
  | "Comunicación receptiva"
  | "Comunicación expresiva"
  | "Imitación"
  | "Independencia"
  | "Habilidades sociales"
  | "Primeras habilidades";

export type ObjetivoPrograma = {
  id: string;
  nombre: string;
  descripcion: string;
  area: AreaTratamiento;
  // Conteo acumulado para gráfica de progreso
  enLineaBase: number;
  enAdquisicion: number;
  enMantenimiento: number;
  dominados: number;
  promedioPruebas?: number;
  promedioSesiones?: number;
  // Estado actual del objetivo activo
  prompt: "Independiente" | "Verbal" | "Gestual" | "Físico parcial" | "Físico total";
  ensayosObjetivo: number;
};

export type SesionAgenda = {
  id: string;
  fechaISO: string; // YYYY-MM-DD
  dia: string; // LUNES, MARTES…
  diaCorto: string; // jun 1
  inicio: string;
  fin: string;
  terapeuta: string;
  tipo: "Sesión" | "Fuera de la agenda" | "Supervisión";
  estado: "programada" | "iniciada" | "completada" | "cancelada";
};

export const objetivosPorNino: Record<string, ObjetivoPrograma[]> = {
  "001": [
    // Comunicación receptiva
    {
      id: "o-cr-1",
      nombre: "Seguimiento de instrucciones en rutinas diarias",
      descripcion:
        "Seguirá un aproximado de 30 instrucciones sencillas de más de 2 componentes con mamá, terapeuta, en el aula y en casa.",
      area: "Comunicación receptiva",
      enLineaBase: 8,
      enAdquisicion: 0,
      enMantenimiento: 0,
      dominados: 0,
      prompt: "Verbal",
      ensayosObjetivo: 10,
    },
    {
      id: "o-cr-2",
      nombre: "Seguir con la mirada",
      descripcion:
        "El niño seguirá con la mirada el gesto de señalar cuando se le indica un total de 20 objetos en su entorno.",
      area: "Comunicación receptiva",
      enLineaBase: 0,
      enAdquisicion: 0,
      enMantenimiento: 0,
      dominados: 28,
      promedioPruebas: 0,
      promedioSesiones: 0,
      prompt: "Independiente",
      ensayosObjetivo: 10,
    },
    {
      id: "o-cr-3",
      nombre: "Seguir instrucciones",
      descripcion: "Seguir instrucciones simples de un componente en contexto natural.",
      area: "Comunicación receptiva",
      enLineaBase: 0,
      enAdquisicion: 0,
      enMantenimiento: 0,
      dominados: 35,
      promedioPruebas: 1,
      promedioSesiones: 1,
      prompt: "Independiente",
      ensayosObjetivo: 10,
    },
    // Comunicación expresiva
    {
      id: "o-ce-1",
      nombre: "Señalar",
      descripcion:
        "El niño señalará 6 objetos preferidos en contexto natural para realizar un pedido funcional.",
      area: "Comunicación expresiva",
      enLineaBase: 1,
      enAdquisicion: 1,
      enMantenimiento: 6,
      dominados: 6,
      promedioPruebas: 29,
      promedioSesiones: 3,
      prompt: "Gestual",
      ensayosObjetivo: 10,
    },
    {
      id: "o-ce-2",
      nombre: "PECS",
      descripcion:
        "Intercambio funcional de imágenes para solicitar reforzadores primarios y secundarios.",
      area: "Comunicación expresiva",
      enLineaBase: 0,
      enAdquisicion: 0,
      enMantenimiento: 2,
      dominados: 21,
      promedioPruebas: 22,
      promedioSesiones: 5,
      prompt: "Físico parcial",
      ensayosObjetivo: 10,
    },
    // Imitación
    {
      id: "o-im-1",
      nombre: "Imitación",
      descripcion:
        "El niño imitará 30 o más acciones que involucren de uno a dos movimientos corporales y con objetos.",
      area: "Imitación",
      enLineaBase: 1,
      enAdquisicion: 1,
      enMantenimiento: 1,
      dominados: 4,
      promedioPruebas: 0,
      promedioSesiones: 0,
      prompt: "Físico parcial",
      ensayosObjetivo: 10,
    },
    // Independencia
    {
      id: "o-in-1",
      nombre: "Entrenamiento de baño",
      descripcion: "Reconocer la necesidad y solicitar ir al baño con apoyo gestual mínimo.",
      area: "Independencia",
      enLineaBase: 0,
      enAdquisicion: 5,
      enMantenimiento: 0,
      dominados: 0,
      prompt: "Físico parcial",
      ensayosObjetivo: 8,
    },
    {
      id: "o-in-2",
      nombre: "Permanencia",
      descripcion: "Permanecer sentado durante la actividad estructurada por 5 minutos.",
      area: "Independencia",
      enLineaBase: 0,
      enAdquisicion: 0,
      enMantenimiento: 0,
      dominados: 19,
      prompt: "Independiente",
      ensayosObjetivo: 10,
    },
    {
      id: "o-in-3",
      nombre: "Responder a su nombre",
      descripcion: "Orientar la mirada al adulto al escuchar su nombre en ≤3 segundos.",
      area: "Independencia",
      enLineaBase: 0,
      enAdquisicion: 0,
      enMantenimiento: 0,
      dominados: 18,
      prompt: "Independiente",
      ensayosObjetivo: 10,
    },
    {
      id: "o-in-4",
      nombre: "Tolerar ayuda física",
      descripcion: "Acepta guía física breve sin conducta disruptiva.",
      area: "Independencia",
      enLineaBase: 0,
      enAdquisicion: 0,
      enMantenimiento: 0,
      dominados: 11,
      promedioPruebas: 12,
      promedioSesiones: 2,
      prompt: "Físico total",
      ensayosObjetivo: 10,
    },
    // Habilidades sociales
    {
      id: "o-hs-1",
      nombre: "Aceptación e integración en rutinas sociales",
      descripcion:
        "Participar en saludo grupal y juego paralelo con un par durante 5 minutos.",
      area: "Habilidades sociales",
      enLineaBase: 0,
      enAdquisicion: 0,
      enMantenimiento: 0,
      dominados: 15,
      prompt: "Verbal",
      ensayosObjetivo: 10,
    },
  ],
};

export const agendaSemanal: Record<string, SesionAgenda[]> = {
  "001": [
    {
      id: "s-l",
      fechaISO: "2026-06-01",
      dia: "LUNES",
      diaCorto: "jun 1",
      inicio: "10:00 a.m.",
      fin: "12:00 p.m.",
      terapeuta: "Lic. Lucimar Calderón",
      tipo: "Fuera de la agenda",
      estado: "programada",
    },
    {
      id: "s-m",
      fechaISO: "2026-06-02",
      dia: "MARTES",
      diaCorto: "jun 2",
      inicio: "10:00 a.m.",
      fin: "12:00 p.m.",
      terapeuta: "Lic. Lucimar Calderón",
      tipo: "Sesión",
      estado: "programada",
    },
    {
      id: "s-x",
      fechaISO: "2026-06-03",
      dia: "MIÉRCOLES",
      diaCorto: "jun 3",
      inicio: "10:00 a.m.",
      fin: "12:00 p.m.",
      terapeuta: "Lic. María Castellón",
      tipo: "Sesión",
      estado: "programada",
    },
    {
      id: "s-j",
      fechaISO: "2026-06-04",
      dia: "JUEVES",
      diaCorto: "jun 4",
      inicio: "10:00 a.m.",
      fin: "12:00 p.m.",
      terapeuta: "Lic. Lucimar Calderón",
      tipo: "Supervisión",
      estado: "programada",
    },
    {
      id: "s-v",
      fechaISO: "2026-06-05",
      dia: "VIERNES",
      diaCorto: "jun 5",
      inicio: "10:00 a.m.",
      fin: "12:00 p.m.",
      terapeuta: "Lic. Lucimar Calderón",
      tipo: "Sesión",
      estado: "programada",
    },
  ],
};

// Serie acumulada de objetivos dominados — para gráfica de progreso
export const progresoAcumulado: Record<string, { mes: string; acumulado: number; recientes: number }[]> = {
  "001": [
    { mes: "Jul 2024", acumulado: 12, recientes: 12 },
    { mes: "Oct 2024", acumulado: 38, recientes: 26 },
    { mes: "Ene 2025", acumulado: 71, recientes: 33 },
    { mes: "Abr 2025", acumulado: 102, recientes: 31 },
    { mes: "Jul 2025", acumulado: 138, recientes: 36 },
    { mes: "Oct 2025", acumulado: 172, recientes: 34 },
    { mes: "Ene 2026", acumulado: 205, recientes: 33 },
    { mes: "Abr 2026", acumulado: 232, recientes: 27 },
    { mes: "Jun 2026", acumulado: 247, recientes: 15 },
  ],
};

export const AREAS_ORDEN: AreaTratamiento[] = [
  "Primeras habilidades",
  "Comunicación receptiva",
  "Comunicación expresiva",
  "Imitación",
  "Independencia",
  "Habilidades sociales",
];

export function getObjetivos(ninoId: string) {
  return objetivosPorNino[ninoId] ?? objetivosPorNino["001"];
}
export function getAgenda(ninoId: string) {
  return agendaSemanal[ninoId] ?? agendaSemanal["001"];
}
export function getProgresoAcumulado(ninoId: string) {
  return progresoAcumulado[ninoId] ?? progresoAcumulado["001"];
}
