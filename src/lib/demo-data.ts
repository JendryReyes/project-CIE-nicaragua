export type Area = "diagnostico" | "fisio" | "logopedia" | "conducta";

export const areaLabels: Record<Area, string> = {
  diagnostico: "Diagnóstico",
  fisio: "Fisioterapia sensorial",
  logopedia: "Logopedia",
  conducta: "Conducta / ABA",
};

export type Nino = {
  id: string;
  nombre: string;
  edad: number;
  diagnostico: string;
  areas: Area[];
  terapeuta: string;
  ingreso: string;
  estado: "activo" | "evaluacion" | "pausa";
  tutor: string;
  inss: boolean;
  progreso: number; // 0-100
  sede: string;
};

export const terapeutas = [
  "Lic. María Castellón",
  "Lic. Roberto Mendoza",
  "Dra. Ana Lucía Pérez",
  "Lic. Jeyling Ortega",
  "Lic. Carlos Bermúdez",
  "Lic. Sofía Hernández",
];

export const ninos: Nino[] = [
  { id: "001", nombre: "Mateo Gutiérrez López", edad: 5, diagnostico: "TEA nivel 1", areas: ["conducta", "logopedia"], terapeuta: terapeutas[0], ingreso: "2025-08-12", estado: "activo", tutor: "Laura López", inss: true, progreso: 68, sede: "Managua" },
  { id: "002", nombre: "Valentina Rocha Mejía", edad: 4, diagnostico: "Retraso del lenguaje", areas: ["logopedia"], terapeuta: terapeutas[5], ingreso: "2025-09-03", estado: "activo", tutor: "Pedro Rocha", inss: true, progreso: 54, sede: "Managua" },
  { id: "003", nombre: "Liam Sandoval", edad: 6, diagnostico: "TDAH + dificultades sensoriales", areas: ["fisio", "conducta"], terapeuta: terapeutas[1], ingreso: "2025-05-21", estado: "activo", tutor: "Mariela Sandoval", inss: true, progreso: 72, sede: "Managua" },
  { id: "004", nombre: "Emma Padilla Vargas", edad: 3, diagnostico: "En evaluación", areas: ["diagnostico"], terapeuta: terapeutas[2], ingreso: "2026-05-18", estado: "evaluacion", tutor: "Andrea Vargas", inss: false, progreso: 12, sede: "Managua" },
  { id: "005", nombre: "Noah Centeno Ríos", edad: 7, diagnostico: "TEA nivel 2", areas: ["conducta", "logopedia", "fisio"], terapeuta: terapeutas[3], ingreso: "2024-11-04", estado: "activo", tutor: "Julio Centeno", inss: true, progreso: 81, sede: "Managua" },
  { id: "006", nombre: "Sofía Aguilar Mora", edad: 5, diagnostico: "Dispraxia verbal", areas: ["logopedia", "fisio"], terapeuta: terapeutas[5], ingreso: "2025-07-09", estado: "activo", tutor: "Carolina Mora", inss: false, progreso: 47, sede: "León" },
  { id: "007", nombre: "Diego Espinoza Talavera", edad: 8, diagnostico: "TDAH", areas: ["conducta"], terapeuta: terapeutas[1], ingreso: "2025-02-15", estado: "pausa", tutor: "Roxana Talavera", inss: true, progreso: 38, sede: "Managua" },
  { id: "008", nombre: "Isabella Briones", edad: 4, diagnostico: "Hipotonía leve", areas: ["fisio"], terapeuta: terapeutas[4], ingreso: "2025-10-02", estado: "activo", tutor: "Javier Briones", inss: true, progreso: 60, sede: "Managua" },
  { id: "009", nombre: "Samuel Membreño Pavón", edad: 6, diagnostico: "TEA nivel 1", areas: ["conducta", "logopedia"], terapeuta: terapeutas[0], ingreso: "2025-06-30", estado: "activo", tutor: "Daniela Pavón", inss: true, progreso: 65, sede: "Managua" },
  { id: "010", nombre: "Camila Zeledón", edad: 3, diagnostico: "Retraso global del desarrollo", areas: ["fisio", "logopedia", "conducta"], terapeuta: terapeutas[3], ingreso: "2025-12-11", estado: "activo", tutor: "Mónica Zeledón", inss: false, progreso: 29, sede: "León" },
  { id: "011", nombre: "Lucas Obregón Cruz", edad: 5, diagnostico: "Conducta adaptativa", areas: ["conducta"], terapeuta: terapeutas[2], ingreso: "2026-01-20", estado: "activo", tutor: "Walter Obregón", inss: true, progreso: 41, sede: "Managua" },
  { id: "012", nombre: "Renata Cárcamo", edad: 7, diagnostico: "TEA nivel 2 + epilepsia", areas: ["conducta", "logopedia", "fisio"], terapeuta: terapeutas[4], ingreso: "2024-09-18", estado: "activo", tutor: "Elena Cárcamo", inss: true, progreso: 76, sede: "Managua" },
];

export type Sesion = {
  id: string;
  hora: string;
  duracion: number; // min
  ninoId: string;
  area: Area;
  terapeuta: string;
  sala: string;
  estado: "programada" | "en_curso" | "asistio" | "ausente";
};

export const hoyISO = "2026-06-01";

export const sesionesHoy: Sesion[] = [
  { id: "s1", hora: "08:00", duracion: 45, ninoId: "001", area: "conducta", terapeuta: terapeutas[0], sala: "Sala 2", estado: "asistio" },
  { id: "s2", hora: "08:00", duracion: 45, ninoId: "003", area: "fisio", terapeuta: terapeutas[4], sala: "Gimnasio", estado: "asistio" },
  { id: "s3", hora: "08:45", duracion: 45, ninoId: "002", area: "logopedia", terapeuta: terapeutas[5], sala: "Sala 4", estado: "asistio" },
  { id: "s4", hora: "09:30", duracion: 45, ninoId: "005", area: "logopedia", terapeuta: terapeutas[5], sala: "Sala 4", estado: "en_curso" },
  { id: "s5", hora: "09:30", duracion: 45, ninoId: "008", area: "fisio", terapeuta: terapeutas[4], sala: "Gimnasio", estado: "en_curso" },
  { id: "s6", hora: "10:15", duracion: 45, ninoId: "009", area: "conducta", terapeuta: terapeutas[0], sala: "Sala 2", estado: "programada" },
  { id: "s7", hora: "10:15", duracion: 60, ninoId: "004", area: "diagnostico", terapeuta: terapeutas[2], sala: "Consultorio", estado: "programada" },
  { id: "s8", hora: "11:00", duracion: 45, ninoId: "011", area: "conducta", terapeuta: terapeutas[2], sala: "Sala 1", estado: "programada" },
  { id: "s9", hora: "11:00", duracion: 45, ninoId: "012", area: "logopedia", terapeuta: terapeutas[5], sala: "Sala 4", estado: "programada" },
  { id: "s10", hora: "13:30", duracion: 45, ninoId: "010", area: "fisio", terapeuta: terapeutas[4], sala: "Gimnasio", estado: "programada" },
  { id: "s11", hora: "13:30", duracion: 45, ninoId: "006", area: "logopedia", terapeuta: terapeutas[5], sala: "Sala 4", estado: "programada" },
  { id: "s12", hora: "14:15", duracion: 45, ninoId: "005", area: "conducta", terapeuta: terapeutas[3], sala: "Sala 3", estado: "programada" },
  { id: "s13", hora: "15:00", duracion: 45, ninoId: "001", area: "logopedia", terapeuta: terapeutas[5], sala: "Sala 4", estado: "programada" },
];

export type LoteINSS = {
  id: string;
  periodo: string;
  ninos: number;
  horas: number;
  monto: number; // USD
  estado: "borrador" | "enviado" | "aprobado" | "pagado" | "rechazado";
  fecha: string;
};

export const lotesINSS: LoteINSS[] = [
  { id: "L-2026-05", periodo: "Mayo 2026", ninos: 38, horas: 612, monto: 14688, estado: "enviado", fecha: "2026-05-30" },
  { id: "L-2026-04", periodo: "Abril 2026", ninos: 36, horas: 588, monto: 14112, estado: "pagado", fecha: "2026-04-29" },
  { id: "L-2026-03", periodo: "Marzo 2026", ninos: 35, horas: 575, monto: 13800, estado: "pagado", fecha: "2026-03-31" },
  { id: "L-2026-02", periodo: "Febrero 2026", ninos: 34, horas: 540, monto: 12960, estado: "pagado", fecha: "2026-02-28" },
  { id: "L-2026-06A", periodo: "Junio 2026 (parcial)", ninos: 12, horas: 96, monto: 2304, estado: "borrador", fecha: "2026-06-01" },
];

export const areaColor: Record<Area, string> = {
  diagnostico: "var(--color-area-diagnostico)",
  fisio: "var(--color-area-fisio)",
  logopedia: "var(--color-area-logopedia)",
  conducta: "var(--color-area-conducta)",
};

export function ninoById(id: string) {
  return ninos.find((n) => n.id === id);
}

export function iniciales(nombre: string) {
  return nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}
