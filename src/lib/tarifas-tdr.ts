// Unidades facturables y tarifario configurable — TDR Parte II
export type UnidadFacturable =
  | "Sesión de terapia (hora)"
  | "Evaluación diagnóstica"
  | "Visita escolar"
  | "Acompañamiento familiar"
  | "Informe clínico"
  | "Supervisión de caso";

export type TarifaItem = {
  id: string;
  unidad: UnidadFacturable;
  disciplina: string;
  pagador: "INSS" | "Privado" | "Pro-bono";
  medida: "Hora" | "Sesión" | "Evento" | "Documento";
  tarifa: number; // USD
  codigoERP: string;
  activo: boolean;
};

export const tarifario: TarifaItem[] = [
  { id: "t-01", unidad: "Sesión de terapia (hora)", disciplina: "Conducta / ABA", pagador: "INSS", medida: "Hora", tarifa: 12, codigoERP: "SRV-ABA-INSS", activo: true },
  { id: "t-02", unidad: "Sesión de terapia (hora)", disciplina: "Logopedia", pagador: "INSS", medida: "Hora", tarifa: 14, codigoERP: "SRV-LOG-INSS", activo: true },
  { id: "t-03", unidad: "Sesión de terapia (hora)", disciplina: "Fisioterapia", pagador: "INSS", medida: "Hora", tarifa: 14, codigoERP: "SRV-FIS-INSS", activo: true },
  { id: "t-04", unidad: "Sesión de terapia (hora)", disciplina: "Conducta / ABA", pagador: "Privado", medida: "Hora", tarifa: 18, codigoERP: "SRV-ABA-PRV", activo: true },
  { id: "t-05", unidad: "Evaluación diagnóstica", disciplina: "Diagnóstico (ADOS-2)", pagador: "INSS", medida: "Evento", tarifa: 180, codigoERP: "SRV-ADOS-INSS", activo: true },
  { id: "t-06", unidad: "Evaluación diagnóstica", disciplina: "Diagnóstico (ADOS-2)", pagador: "Privado", medida: "Evento", tarifa: 240, codigoERP: "SRV-ADOS-PRV", activo: true },
  { id: "t-07", unidad: "Visita escolar", disciplina: "Inclusión educativa", pagador: "Privado", medida: "Evento", tarifa: 45, codigoERP: "SRV-VESC-PRV", activo: true },
  { id: "t-08", unidad: "Acompañamiento familiar", disciplina: "Familia", pagador: "INSS", medida: "Sesión", tarifa: 15, codigoERP: "SRV-FAM-INSS", activo: true },
  { id: "t-09", unidad: "Informe clínico", disciplina: "Documentación", pagador: "Privado", medida: "Documento", tarifa: 35, codigoERP: "SRV-INF-PRV", activo: true },
  { id: "t-10", unidad: "Supervisión de caso", disciplina: "Supervisión ABA", pagador: "Privado", medida: "Hora", tarifa: 25, codigoERP: "SRV-SUP-PRV", activo: false },
  { id: "t-11", unidad: "Sesión de terapia (hora)", disciplina: "Conducta / ABA", pagador: "Pro-bono", medida: "Hora", tarifa: 0, codigoERP: "SRV-ABA-PRO", activo: true },
];

export const reglasFacturacion = {
  corte: "Quincenal (día 15) y mensual (último día del mes)",
  redondeo: "Fracciones de hora se redondean al múltiplo de 0.25 h",
  noFacturable: [
    "Inasistencia sin justificación válida",
    "Horas ejecutadas por encima de la carta de autorización sin constancia médica",
    "Sesiones excluidas en depuración con motivo registrado",
    "Servicios eventuales sin documentación completa",
  ],
  prorrateo: "Ingresos y egresos a mitad de mes se prorratean por días calendario facturables",
};

const KEY = "cie_tarifario_override";

export function leerOverrides(): Record<string, number> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function guardarOverride(id: string, tarifa: number) {
  const o = leerOverrides();
  o[id] = tarifa;
  try {
    localStorage.setItem(KEY, JSON.stringify(o));
  } catch {}
}

export function tarifaEfectiva(item: TarifaItem, overrides: Record<string, number>) {
  return overrides[item.id] ?? item.tarifa;
}
