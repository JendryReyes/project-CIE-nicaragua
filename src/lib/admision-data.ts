// Pipeline de admisión estilo CRM y ciclo de vida del paciente — TDR Parte III
export type EtapaAdmision =
  | "Prospecto"
  | "Contacto inicial"
  | "Evaluación agendada"
  | "En evaluación"
  | "Propuesta de plan"
  | "Documentación"
  | "Admitido";

export const etapasAdmision: EtapaAdmision[] = [
  "Prospecto",
  "Contacto inicial",
  "Evaluación agendada",
  "En evaluación",
  "Propuesta de plan",
  "Documentación",
  "Admitido",
];

export type EstadoMatriculaTDR =
  | "Prospecto"
  | "En admisión"
  | "Activo"
  | "Suspensión temporal"
  | "Egresado"
  | "Lista de espera";

export const estadosMatricula: EstadoMatriculaTDR[] = [
  "Prospecto",
  "En admisión",
  "Activo",
  "Suspensión temporal",
  "Lista de espera",
  "Egresado",
];

export const estadoColor: Record<EstadoMatriculaTDR, string> = {
  Prospecto: "bg-[oklch(0.94_0.04_250)] text-[oklch(0.42_0.13_250)]",
  "En admisión": "bg-[oklch(0.95_0.07_60)] text-[oklch(0.42_0.13_60)]",
  Activo: "bg-[oklch(0.93_0.06_155)] text-[oklch(0.35_0.11_155)]",
  "Suspensión temporal": "bg-[oklch(0.95_0.06_30)] text-[oklch(0.45_0.15_30)]",
  "Lista de espera": "bg-muted text-muted-foreground",
  Egresado: "bg-[oklch(0.93_0.02_260)] text-muted-foreground",
};

export const motivosEgreso = [
  "Alta terapéutica por objetivos cumplidos",
  "Traslado a otro centro",
  "Mudanza familiar",
  "Decisión de la familia",
  "Falta de cobertura del pagador",
  "Inasistencia sostenida",
  "Derivación a servicio especializado",
];

export const motivosSuspension = [
  "Motivo de salud del niño",
  "Inasistencia sostenida",
  "Trámite de autorización INSS en curso",
  "Reevaluación clínica",
  "Solicitud de la familia",
];

export type DocumentoAdmision = { nombre: string; obligatorio: boolean; ok: boolean };

export type Prospecto = {
  id: string;
  nino: string;
  iniciales: string;
  edad: number;
  sede: string;
  etapa: EtapaAdmision;
  estado: EstadoMatriculaTDR;
  origen: "Referencia médica" | "Redes sociales" | "Recomendación familiar" | "INSS" | "Colegio";
  pagadorPrevisto: "INSS" | "Privado" | "Pro-bono";
  disciplinas: string[];
  tutor: string;
  telefono: string;
  ultimaActividad: string;
  proximoPaso: string;
  fechaProximoPaso: string;
  responsable: string;
  diasEnEtapa: number;
  documentos: DocumentoAdmision[];
  codigoERP?: string;
  notas: string;
};

const docs = (faltan: string[] = []): DocumentoAdmision[] =>
  [
    { nombre: "Acta de nacimiento", obligatorio: true },
    { nombre: "Documento del tutor", obligatorio: true },
    { nombre: "Diagnóstico médico", obligatorio: true },
    { nombre: "Colilla / carta INSS", obligatorio: false },
    { nombre: "Contrato de servicios firmado", obligatorio: true },
    { nombre: "Consentimiento de datos clínicos", obligatorio: true },
  ].map((d) => ({ ...d, ok: !faltan.includes(d.nombre) }));

export const prospectos: Prospecto[] = [
  {
    id: "pr-01", nino: "Adrián Solórzano", iniciales: "AS", edad: 3, sede: "Santo Domingo",
    etapa: "Prospecto", estado: "Prospecto", origen: "Redes sociales", pagadorPrevisto: "Privado",
    disciplinas: ["Conducta / ABA"], tutor: "Verónica Solórzano", telefono: "+505 8712 0091",
    ultimaActividad: "2026-05-30", proximoPaso: "Llamada de tamizaje inicial", fechaProximoPaso: "2026-06-03",
    responsable: "Coord. Andrea Rivas", diasEnEtapa: 2,
    documentos: docs(["Diagnóstico médico", "Contrato de servicios firmado", "Consentimiento de datos clínicos", "Colilla / carta INSS"]),
    notas: "Madre reporta ausencia de lenguaje funcional a los 3 años.",
  },
  {
    id: "pr-02", nino: "Renata Guevara", iniciales: "RG", edad: 5, sede: "Las Colinas",
    etapa: "Contacto inicial", estado: "En admisión", origen: "Referencia médica", pagadorPrevisto: "INSS",
    disciplinas: ["Conducta / ABA", "Logopedia"], tutor: "Iván Guevara", telefono: "+505 8845 7712",
    ultimaActividad: "2026-05-29", proximoPaso: "Enviar requisitos y agendar ADOS-2", fechaProximoPaso: "2026-06-04",
    responsable: "Coord. Andrea Rivas", diasEnEtapa: 4,
    documentos: docs(["Contrato de servicios firmado", "Consentimiento de datos clínicos"]),
    notas: "Referida por neuropediatría del Hospital Militar.",
  },
  {
    id: "pr-03", nino: "Joaquín Bravo", iniciales: "JB", edad: 4, sede: "Santo Domingo",
    etapa: "Evaluación agendada", estado: "En admisión", origen: "INSS", pagadorPrevisto: "INSS",
    disciplinas: ["Conducta / ABA", "Fisioterapia"], tutor: "Marta Bravo", telefono: "+505 8877 3320",
    ultimaActividad: "2026-05-28", proximoPaso: "ADOS-2 el 05/06 · 9:00 a.m.", fechaProximoPaso: "2026-06-05",
    responsable: "Dra. Ana Lucía Pérez", diasEnEtapa: 6,
    documentos: docs(["Contrato de servicios firmado"]),
    codigoERP: "CIE-ERP-0341",
    notas: "Carta INSS en trámite, 25h mensuales solicitadas.",
  },
  {
    id: "pr-04", nino: "Ximena Rueda", iniciales: "XR", edad: 6, sede: "Estelí",
    etapa: "En evaluación", estado: "En admisión", origen: "Colegio", pagadorPrevisto: "Privado",
    disciplinas: ["Logopedia"], tutor: "Óscar Rueda", telefono: "+505 8790 1188",
    ultimaActividad: "2026-05-27", proximoPaso: "Cierre de informe de evaluación", fechaProximoPaso: "2026-06-06",
    responsable: "Lic. Sofía Hernández", diasEnEtapa: 8,
    documentos: docs(["Contrato de servicios firmado"]),
    notas: "Escuela reporta dificultades fonológicas persistentes.",
  },
  {
    id: "pr-05", nino: "Thiago Núñez", iniciales: "TN", edad: 3, sede: "Las Colinas",
    etapa: "Propuesta de plan", estado: "En admisión", origen: "Recomendación familiar", pagadorPrevisto: "INSS",
    disciplinas: ["Conducta / ABA", "Logopedia", "Fisioterapia"], tutor: "Daniela Núñez", telefono: "+505 8801 6644",
    ultimaActividad: "2026-05-31", proximoPaso: "Reunión de plan terapéutico con la familia", fechaProximoPaso: "2026-06-02",
    responsable: "Dra. María Castro", diasEnEtapa: 3,
    documentos: docs(["Contrato de servicios firmado"]),
    codigoERP: "CIE-ERP-0342",
    notas: "Plan propuesto: 32h ABA + 8h Logopedia mensuales.",
  },
  {
    id: "pr-06", nino: "Fabiana Cruz", iniciales: "FC", edad: 7, sede: "Masaya",
    etapa: "Documentación", estado: "En admisión", origen: "Referencia médica", pagadorPrevisto: "Pro-bono",
    disciplinas: ["Fisioterapia"], tutor: "Elena Cruz", telefono: "+505 8733 5599",
    ultimaActividad: "2026-06-01", proximoPaso: "Recibir consentimiento firmado", fechaProximoPaso: "2026-06-03",
    responsable: "Karla Duarte", diasEnEtapa: 1,
    documentos: docs(["Consentimiento de datos clínicos"]),
    notas: "Caso aprobado en comité de becas.",
  },
  {
    id: "pr-07", nino: "Bruno Zamora", iniciales: "BZ", edad: 5, sede: "Santo Domingo",
    etapa: "Admitido", estado: "Activo", origen: "INSS", pagadorPrevisto: "INSS",
    disciplinas: ["Conducta / ABA", "Logopedia"], tutor: "Rebeca Zamora", telefono: "+505 8712 9090",
    ultimaActividad: "2026-06-01", proximoPaso: "Inicio de sesiones 03/06", fechaProximoPaso: "2026-06-03",
    responsable: "Coord. Andrea Rivas", diasEnEtapa: 0,
    documentos: docs(),
    codigoERP: "CIE-ERP-0343",
    notas: "Matriculado con prorrateo desde el 03/06 (mes parcial).",
  },
  {
    id: "pr-08", nino: "Alonso Peña", iniciales: "AP", edad: 4, sede: "Las Colinas",
    etapa: "Propuesta de plan", estado: "Lista de espera", origen: "Redes sociales", pagadorPrevisto: "Privado",
    disciplinas: ["Conducta / ABA"], tutor: "Silvia Peña", telefono: "+505 8866 2277",
    ultimaActividad: "2026-05-25", proximoPaso: "Esperando cupo ABA en Las Colinas", fechaProximoPaso: "2026-06-15",
    responsable: "Coord. Andrea Rivas", diasEnEtapa: 10,
    documentos: docs(["Contrato de servicios firmado"]),
    notas: "Sin cupo de conducta disponible este mes.",
  },
];

export function etapaResumen() {
  return etapasAdmision.map((e) => ({
    etapa: e,
    total: prospectos.filter((p) => p.etapa === e).length,
    casos: prospectos.filter((p) => p.etapa === e),
  }));
}

export function documentosPendientes(p: Prospecto) {
  return p.documentos.filter((d) => d.obligatorio && !d.ok);
}

export function listoParaAdmitir(p: Prospecto) {
  return documentosPendientes(p).length === 0;
}
