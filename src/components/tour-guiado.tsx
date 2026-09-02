import { useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

type Paso = {
  titulo: string;
  descripcion: string;
  ruta?: string;
  tip?: string;
};

const PASOS: Paso[] = [
  {
    titulo: "Bienvenido a CIETrack",
    descripcion:
      "Tour rápido de 60 segundos por los módulos clave del sistema. Vas a ver cómo se conectan facturación INSS, expedientes y datos clínicos ABA.",
    tip: "Podés cerrar este tour en cualquier momento.",
  },
  {
    titulo: "Dashboard ejecutivo",
    descripcion:
      "Vista 360° de la operación: sesiones del día, ocupación de salas, horas INSS consumidas y alertas activas por sede.",
    ruta: "/dashboard",
  },
  {
    titulo: "Expediente del niño",
    descripcion:
      "Cada niño tiene su ficha con áreas terapéuticas, programas clínicos (ABA, DIR, Hanley) y el INSSBadge que muestra horas usadas vs aprobadas.",
    ruta: "/ninos/001",
    tip: "Mateo es un caso INSS con 5 áreas activas.",
  },
  {
    titulo: "Gráficas ABA con IA",
    descripcion:
      "Visualización de progreso por programa con líneas de criterio, marcadores de cambio de fase y análisis automático del trend.",
    ruta: "/clinico/graficas",
  },
  {
    titulo: "Facturación INSS quincenal",
    descripcion:
      "Lote quincenal con detección automática de excedentes, constancias requeridas y bloqueos. Coloreado por estado de línea.",
    ruta: "/facturacion/L-2026-05-Q2",
    tip: "Las líneas rojas requieren documento INSS antes de facturar.",
  },
  {
    titulo: "Listo para explorar",
    descripcion:
      "Probá ingresar con distintos roles desde el login para ver cómo cambia la interfaz (Dirección, Coordinadora, Terapeuta, Familia).",
  },
];

export function TourGuiado() {
  const navigate = useNavigate();
  const rutas = PASOS.map((p) => p.ruta).filter(Boolean) as string[];

  return (
    <>
      <button
        onClick={() => navigate({ to: rutas[0] })}
        className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.85_0.07_292)] bg-[oklch(0.97_0.035_292)] text-[oklch(0.4_0.132_292)] px-3 py-1.5 text-xs font-medium hover:bg-[oklch(0.94_0.053_292)] transition-colors"
        title="Tour guiado del sistema"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Tour guiado</span>
      </button>
    </>
  );
}
