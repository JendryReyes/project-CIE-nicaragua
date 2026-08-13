// Panel de plataforma multitenant — TDR Parte I / IV
export type EstadoOrg = "Activa" | "Suspendida" | "En onboarding" | "Cancelada";

export type Organizacion = {
  id: string;
  nombre: string;
  pais: string;
  plan: "Sede única" | "Multi-sede" | "Enterprise";
  estado: EstadoOrg;
  sedes: number;
  usuarios: number;
  ninosActivos: number;
  horasMes: number;
  serviciosEventuales: number;
  contacto: string;
  correo: string;
  altaEl: string;
  ultimoCorte: string;
  historial: { fecha: string; cambio: string; motivo: string; actor: string }[];
};

export const organizaciones: Organizacion[] = [
  {
    id: "org-cie-ni", nombre: "CIE Nicaragua", pais: "Nicaragua", plan: "Multi-sede", estado: "Activa",
    sedes: 5, usuarios: 42, ninosActivos: 27, horasMes: 690, serviciosEventuales: 9,
    contacto: "Ing. Rodolfo Aguirre", correo: "direccion@cie.com.ni", altaEl: "2025-02-01", ultimoCorte: "2026-05-31",
    historial: [
      { fecha: "2026-05-31", cambio: "Plan Sede única → Multi-sede", motivo: "Apertura de Masaya y León", actor: "Super Admin" },
      { fecha: "2025-02-01", cambio: "Alta de organización", motivo: "Contrato inicial", actor: "Super Admin" },
    ],
  },
  {
    id: "org-tea-cr", nombre: "Centro TEA Costa Rica", pais: "Costa Rica", plan: "Sede única", estado: "Activa",
    sedes: 1, usuarios: 11, ninosActivos: 14, horasMes: 208, serviciosEventuales: 3,
    contacto: "Dra. Patricia Solano", correo: "admin@centrotea.cr", altaEl: "2025-09-15", ultimoCorte: "2026-05-31",
    historial: [{ fecha: "2025-09-15", cambio: "Alta de organización", motivo: "Contrato inicial", actor: "Super Admin" }],
  },
  {
    id: "org-neuro-hn", nombre: "NeuroKids Honduras", pais: "Honduras", plan: "Sede única", estado: "En onboarding",
    sedes: 1, usuarios: 5, ninosActivos: 0, horasMes: 0, serviciosEventuales: 0,
    contacto: "Lic. Erick Mejía", correo: "erick@neurokids.hn", altaEl: "2026-05-20", ultimoCorte: "—",
    historial: [{ fecha: "2026-05-20", cambio: "Alta de organización", motivo: "Piloto de 60 días", actor: "Super Admin" }],
  },
  {
    id: "org-aba-sv", nombre: "ABA Center El Salvador", pais: "El Salvador", plan: "Multi-sede", estado: "Suspendida",
    sedes: 2, usuarios: 18, ninosActivos: 21, horasMes: 0, serviciosEventuales: 0,
    contacto: "Lic. Mónica Rivas", correo: "monica@abacenter.sv", altaEl: "2025-04-10", ultimoCorte: "2026-04-30",
    historial: [
      { fecha: "2026-05-10", cambio: "Activa → Suspendida", motivo: "Mora de 60 días en facturación de plataforma", actor: "Billing Admin" },
      { fecha: "2025-04-10", cambio: "Alta de organización", motivo: "Contrato inicial", actor: "Super Admin" },
    ],
  },
];

export const tarifaPlataforma = {
  base: { "Sede única": 120, "Multi-sede": 250, Enterprise: 480 } as Record<Organizacion["plan"], number>,
  porNinoActivo: 3.5,
  porServicioEventual: 1.5,
};

export function facturablePlataforma(o: Organizacion) {
  const base = tarifaPlataforma.base[o.plan];
  const ninos = o.ninosActivos * tarifaPlataforma.porNinoActivo;
  const eventuales = o.serviciosEventuales * tarifaPlataforma.porServicioEventual;
  const total = o.estado === "Activa" ? base + ninos + eventuales : 0;
  return { base, ninos, eventuales, total: Number(total.toFixed(2)) };
}

export function resumenPlataforma() {
  const activas = organizaciones.filter((o) => o.estado === "Activa");
  return {
    organizaciones: organizaciones.length,
    activas: activas.length,
    sedes: organizaciones.reduce((s, o) => s + o.sedes, 0),
    ninos: organizaciones.reduce((s, o) => s + o.ninosActivos, 0),
    usuarios: organizaciones.reduce((s, o) => s + o.usuarios, 0),
    facturable: Number(organizaciones.reduce((s, o) => s + facturablePlataforma(o).total, 0).toFixed(2)),
  };
}
