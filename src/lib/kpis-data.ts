// TDR v1.3 · Parte X — Indicadores de gestión y desempeño (KPIs)
import type { RolOrg } from "./roles-tdr";

export type Grupo = "operativos" | "clinicos" | "administrativos";

export const grupoLabel: Record<Grupo, string> = {
  operativos: "10.1 Indicadores operativos",
  clinicos: "10.2 Indicadores clínicos",
  administrativos: "10.3 Indicadores administrativos",
};

export type Kpi = {
  id: string;
  nombre: string;
  grupo: Grupo;
  valor: string;
  detalle: string;
  tendencia: number; // % vs período anterior
  meta?: string;
  estado: "ok" | "atencion" | "critico";
};

export const kpis: Kpi[] = [
  { id: "horas_programadas", nombre: "Horas programadas", grupo: "operativos", valor: "1,248 h", detalle: "Agenda del período 01–15 ago", tendencia: 4.2, estado: "ok" },
  { id: "horas_ejecutadas", nombre: "Horas ejecutadas", grupo: "operativos", valor: "1,116 h", detalle: "Sesiones efectivamente realizadas", tendencia: 3.1, estado: "ok" },
  { id: "horas_canceladas", nombre: "Horas canceladas", grupo: "operativos", valor: "132 h", detalle: "Todos los motivos de cancelación", tendencia: -6.8, estado: "atencion" },
  { id: "horas_no_facturables", nombre: "Horas no facturables", grupo: "operativos", valor: "58 h", detalle: "Excluidas en depuración contable", tendencia: -11.4, meta: "< 60 h", estado: "ok" },
  { id: "tasa_asistencia", nombre: "Tasa de asistencia", grupo: "operativos", valor: "89.4%", detalle: "Ejecutadas / programadas", tendencia: 1.8, meta: "≥ 90%", estado: "atencion" },
  { id: "ausentismo", nombre: "Ausentismo de pacientes", grupo: "operativos", valor: "7.2%", detalle: "Ausencias sin reprogramar", tendencia: -0.9, meta: "≤ 8%", estado: "ok" },
  { id: "reprogramadas", nombre: "Sesiones reprogramadas", grupo: "operativos", valor: "46", detalle: "Reubicadas dentro del período", tendencia: 12.5, estado: "atencion" },

  { id: "objetivos_alcanzados", nombre: "Objetivos alcanzados", grupo: "clinicos", valor: "37", detalle: "Masterizaciones validadas en el período", tendencia: 9.4, estado: "ok" },
  { id: "programas_activos", nombre: "Programas activos", grupo: "clinicos", valor: "214", detalle: "En ejecución en las 4 sedes", tendencia: 2.4, estado: "ok" },
  { id: "programas_pendientes", nombre: "Programas pendientes de actualización", grupo: "clinicos", valor: "18", detalle: "Sin revisión > 30 días", tendencia: 5.6, meta: "≤ 10", estado: "critico" },
  { id: "supervisiones_realizadas", nombre: "Supervisiones realizadas", grupo: "clinicos", valor: "26", detalle: "Observaciones con fidelidad registrada", tendencia: 6.1, estado: "ok" },
  { id: "supervisiones_pendientes", nombre: "Supervisiones pendientes", grupo: "clinicos", valor: "9", detalle: "Vencen dentro del mes", tendencia: -3.2, estado: "atencion" },
  { id: "evaluaciones_pendientes", nombre: "Evaluaciones pendientes de finalizar", grupo: "clinicos", valor: "11", detalle: "Procesos diagnósticos abiertos", tendencia: 1.1, estado: "atencion" },
  { id: "seguimientos_vencidos", nombre: "Acciones clínicas vencidas", grupo: "clinicos", valor: "4", detalle: "Seguimientos fuera de plazo", tendencia: -20, meta: "0", estado: "critico" },

  { id: "pacientes_activos", nombre: "Pacientes activos", grupo: "administrativos", valor: "96", detalle: "Con matrícula vigente", tendencia: 3.2, estado: "ok" },
  { id: "pacientes_admision", nombre: "Pacientes en admisión", grupo: "administrativos", valor: "14", detalle: "Pipeline CRM en curso", tendencia: 16.7, estado: "ok" },
  { id: "pacientes_egresados", nombre: "Pacientes egresados", grupo: "administrativos", valor: "6", detalle: "Egresos del mes en curso", tendencia: 20, estado: "atencion" },
  { id: "uso_cupos", nombre: "Utilización de cupos", grupo: "administrativos", valor: "87%", detalle: "Promedio por disciplina y sede", tendencia: 2.1, meta: "≤ 90%", estado: "atencion" },
  { id: "distribucion_pagador", nombre: "Horas por entidad pagadora", grupo: "administrativos", valor: "78% INSS", detalle: "18% privado · 4% pro-bono", tendencia: 1.4, estado: "ok" },
  { id: "productividad", nombre: "Productividad del personal", grupo: "administrativos", valor: "31.4 h", detalle: "Horas ejecutadas promedio por terapeuta", tendencia: 2.8, estado: "ok" },
];

// 10.4 Reglas de visualización por rol
export const alcancePorRol: Record<RolOrg, { grupos: Grupo[]; alcance: string }> = {
  "Administrador de Organización": { grupos: ["operativos", "clinicos", "administrativos"], alcance: "Totalidad de indicadores de la organización." },
  "Director Clínico": { grupos: ["operativos", "clinicos", "administrativos"], alcance: "Totalidad de indicadores clínicos y operativos de la organización." },
  "Subdirector Clínico": { grupos: ["operativos", "clinicos"], alcance: "Indicadores clínicos y operativos de toda la estructura clínica." },
  "Supervisor (Analista ABA)": { grupos: ["operativos", "clinicos"], alcance: "Solo su estructura clínica y los profesionales bajo su supervisión." },
  "Coordinador Clínico": { grupos: ["operativos", "clinicos"], alcance: "Sedes, programas y carteras asignadas a su coordinación." },
  Terapeuta: { grupos: ["operativos"], alcance: "Únicamente sus propios indicadores y métricas de desempeño." },
  "Personal Administrativo": { grupos: ["operativos", "administrativos"], alcance: "Indicadores operativos y administrativos, sin datos clínicos." },
};

export function kpisVisibles(rol: RolOrg) {
  const grupos = alcancePorRol[rol].grupos;
  return kpis.filter((k) => grupos.includes(k.grupo));
}

// 10.5 Requerimientos no funcionales de rendimiento (P95)
export const slaRendimiento = [
  { proceso: "Evaluación del motor de masterización al cierre de sesión", objetivo: "≤ 5 s", medido: "2.4 s", ok: true },
  { proceso: "Renderizado de gráficas clínicas", objetivo: "≤ 5 s", medido: "1.9 s", ok: true },
  { proceso: "Generación de exportación de facturación quincenal", objetivo: "≤ 30 s", medido: "12.6 s", ok: true },
];
