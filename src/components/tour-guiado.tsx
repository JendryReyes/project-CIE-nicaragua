import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, X, ChevronLeft, ChevronRight } from "lucide-react";

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
    tip: "Las líneas en coral requieren documento INSS antes de facturar.",
  },
  {
    titulo: "Listo para explorar",
    descripcion:
      "Probá ingresar con distintos roles desde el login para ver cómo cambia la interfaz (Dirección, Coordinadora, Terapeuta, Familia).",
  },
];

export function TourGuiado() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState<number | null>(null);
  const ir = (n: number) => {
    setPaso(n);
    const r = PASOS[n].ruta;
    if (r) navigate({ to: r as never });
  };
  const actual = paso !== null ? PASOS[paso] : null;
  const ultimo = paso === PASOS.length - 1;

  return (
    <>
      <button
        onClick={() => ir(0)}
        className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary px-3 py-1.5 text-xs font-medium hover:bg-primary/15 transition-colors"
        title="Tour guiado del sistema"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Tour guiado</span>
      </button>

      {actual && paso !== null && (
        <div
          role="dialog"
          aria-label="Tour guiado"
          className="fixed bottom-4 right-4 left-4 sm:left-auto z-[60] sm:w-[380px] rounded-2xl border border-border bg-card text-card-foreground shadow-2xl p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-primary">
              Paso {paso + 1} de {PASOS.length}
            </div>
            <button onClick={() => setPaso(null)} aria-label="Cerrar tour" className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <h3 className="mt-1 text-base font-semibold">{actual.titulo}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{actual.descripcion}</p>
          {actual.tip && (
            <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">{actual.tip}</p>
          )}
          <div className="mt-4 h-1 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${((paso + 1) / PASOS.length) * 100}%` }} />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => ir(paso - 1)}
              disabled={paso === 0}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Anterior
            </button>
            <button
              onClick={() => (ultimo ? setPaso(null) : ir(paso + 1))}
              className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium hover:opacity-90"
            >
              {ultimo ? "Finalizar" : "Siguiente"} {!ultimo && <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
