import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Sparkles, X, ArrowRight, ArrowLeft, MapPin } from "lucide-react";

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
  const [abierto, setAbierto] = useState(false);
  const [paso, setPaso] = useState(0);
  const navigate = useNavigate();
  const actual = PASOS[paso];

  const ir = (idx: number) => {
    setPaso(idx);
    const ruta = PASOS[idx].ruta;
    if (ruta) navigate({ to: ruta });
  };

  return (
    <>
      <button
        onClick={() => {
          setAbierto(true);
          setPaso(0);
        }}
        className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.85_0.08_300)] bg-[oklch(0.97_0.04_300)] text-[oklch(0.4_0.15_300)] px-3 py-1.5 text-xs font-medium hover:bg-[oklch(0.94_0.06_300)] transition-colors"
        title="Tour guiado del sistema"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Tour guiado</span>
      </button>

      {abierto && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px]"
            onClick={() => setAbierto(false)}
          />
          <div className="fixed bottom-6 right-6 z-50 w-[360px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between bg-gradient-to-r from-[oklch(0.95_0.05_300)] to-[oklch(0.95_0.04_200)] px-4 py-2.5 border-b border-border/60">
              <div className="flex items-center gap-2 text-[oklch(0.35_0.15_300)]">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Tour · {paso + 1}/{PASOS.length}
                </span>
              </div>
              <button
                onClick={() => setAbierto(false)}
                className="rounded-full p-1 hover:bg-white/60 text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <h3 className="font-display text-lg leading-tight">{actual.titulo}</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">{actual.descripcion}</p>
              {actual.ruta && (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <code className="tabular">{actual.ruta}</code>
                </div>
              )}
              {actual.tip && (
                <div className="rounded-lg bg-[oklch(0.97_0.03_75)] border border-[oklch(0.88_0.05_75)] px-3 py-2 text-[11px] text-[oklch(0.4_0.1_60)]">
                  💡 {actual.tip}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border/60 bg-muted/30">
              <div className="flex gap-1">
                {PASOS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => ir(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === paso ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={paso === 0}
                  onClick={() => ir(paso - 1)}
                  className="rounded-full p-1.5 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                {paso < PASOS.length - 1 ? (
                  <button
                    onClick={() => ir(paso + 1)}
                    className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:opacity-90"
                  >
                    Siguiente <ArrowRight className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => setAbierto(false)}
                    className="rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:opacity-90"
                  >
                    Terminar
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
