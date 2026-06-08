import { useState } from "react";
import { createPortal } from "react-dom";
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
  const panel = abierto ? (
    <div className="fixed right-4 top-20 z-[100] max-h-[calc(100dvh-6rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl sm:right-6 lg:top-24">
      <div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-[oklch(0.95_0.05_300)] to-[oklch(0.95_0.04_200)] px-4 py-2.5">
        <div className="flex items-center gap-2 text-[oklch(0.35_0.15_300)]">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="text-xs font-medium uppercase tracking-wider">
            Tour · {paso + 1}/{PASOS.length}
          </span>
        </div>
        <button onClick={() => setAbierto(false)} className="rounded-full p-1 text-muted-foreground hover:bg-white/60">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-3 p-5">
        <h3 className="font-display text-lg leading-tight">{actual.titulo}</h3>
        <p className="text-sm leading-relaxed text-foreground/80">{actual.descripcion}</p>
        {actual.ruta && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <code className="tabular">{actual.ruta}</code>
          </div>
        )}
        {actual.tip && (
          <div className="rounded-lg border border-[oklch(0.88_0.05_75)] bg-[oklch(0.97_0.03_75)] px-3 py-2 text-[11px] text-[oklch(0.4_0.1_60)]">
            💡 {actual.tip}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 flex items-center justify-between gap-2 border-t border-border/60 bg-muted/95 px-4 py-3 backdrop-blur">
        <div className="flex gap-1">
          {PASOS.map((_, i) => (
            <button
              key={i}
              onClick={() => ir(i)}
              className={`h-1.5 rounded-full transition-all ${i === paso ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <button disabled={paso === 0} onClick={() => ir(paso - 1)} className="rounded-full p-1.5 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          {paso < PASOS.length - 1 ? (
            <button onClick={() => ir(paso + 1)} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
              Siguiente <ArrowRight className="h-3 w-3" />
            </button>
          ) : (
            <button onClick={() => setAbierto(false)} className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
              Terminar
            </button>
          )}
        </div>
      </div>
    </div>
  ) : null;

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

      {typeof document !== "undefined" && panel ? createPortal(panel, document.body) : null}
    </>
  );
}
