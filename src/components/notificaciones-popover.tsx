import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, AlertTriangle, FileText, CheckCircle2, QrCode, Stethoscope, DollarSign, Clock } from "lucide-react";

type Notif = {
  id: string;
  icon: React.ReactNode;
  tono: "warning" | "success" | "info" | "danger";
  titulo: string;
  detalle: string;
  hace: string;
  to: string;
};

const NOTIFS_INICIALES: Notif[] = [
  {
    id: "n1",
    icon: <AlertTriangle className="h-4 w-4" />,
    tono: "danger",
    titulo: "3 cartas INSS vencidas",
    detalle: "Sebastián M., Lucía R., Diego P. — requieren renovación",
    hace: "hace 12 min",
    to: "/facturacion/cartas",
  },
  {
    id: "n2",
    icon: <QrCode className="h-4 w-4" />,
    tono: "success",
    titulo: "Check-in completado",
    detalle: "Mariana López ingresó al Aula Verde a las 9:02",
    hace: "hace 18 min",
    to: "/asistencia",
  },
  {
    id: "n3",
    icon: <DollarSign className="h-4 w-4" />,
    tono: "warning",
    titulo: "Lote INSS por aprobar",
    detalle: "Mayo 2026 · $48,720 esperando firma de Dirección",
    hace: "hace 1 h",
    to: "/facturacion",
  },
  {
    id: "n4",
    icon: <Stethoscope className="h-4 w-4" />,
    tono: "info",
    titulo: "Sesión sin nota clínica",
    detalle: "Lic. María Castellón · ABA · 10:00 a.m.",
    hace: "hace 2 h",
    to: "/asistencia",
  },
  {
    id: "n5",
    icon: <FileText className="h-4 w-4" />,
    tono: "info",
    titulo: "Nuevo expediente listo",
    detalle: "Andrés Vargas — diagnóstico cargado por Coordinación",
    hace: "hace 3 h",
    to: "/ninos",
  },
  {
    id: "n6",
    icon: <CheckCircle2 className="h-4 w-4" />,
    tono: "success",
    titulo: "Cierre de quincena enviado",
    detalle: "Q1 mayo · aprobado por DAF",
    hace: "ayer",
    to: "/facturacion/cierre",
  },
];

const toneCls: Record<Notif["tono"], string> = {
  warning: "bg-[oklch(0.94_0.053_80)] text-[oklch(0.45_0.114_80)]",
  success: "bg-[oklch(0.94_0.044_160)] text-[oklch(0.4_0.088_160)]",
  info: "bg-[oklch(0.94_0.044_258)] text-[oklch(0.4_0.088_258)]",
  danger: "bg-[oklch(0.94_0.053_30)] text-[oklch(0.45_0.132_30)]",
};

export function NotificacionesPopover() {
  const [leidas, setLeidas] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const sinLeer = NOTIFS_INICIALES.filter((n) => !leidas.has(n.id)).length;

  const marcarTodas = () => setLeidas(new Set(NOTIFS_INICIALES.map((n) => n.id)));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notificaciones"
          className="relative hidden rounded-full p-2 hover:bg-muted sm:inline-flex"
        >
          <Bell className="h-4 w-4" />
          {sinLeer > 0 && (
            <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground tabular">
              {sinLeer}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between border-b border-border/60 p-3">
          <div>
            <div className="font-display text-base leading-none">Notificaciones</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {sinLeer > 0 ? `${sinLeer} sin leer` : "Todo al día"}
            </div>
          </div>
          {sinLeer > 0 && (
            <button
              onClick={marcarTodas}
              className="text-xs text-primary hover:underline"
            >
              Marcar todas
            </button>
          )}
        </div>
        <ul className="max-h-[26rem] divide-y divide-border/60 overflow-y-auto">
          {NOTIFS_INICIALES.map((n) => {
            const leida = leidas.has(n.id);
            return (
              <li key={n.id}>
                <Link
                  to={n.to}
                  onClick={() => {
                    setLeidas((s) => new Set(s).add(n.id));
                    setOpen(false);
                  }}
                  className={`flex items-start gap-3 p-3 transition-colors hover:bg-muted/50 ${leida ? "opacity-60" : ""}`}
                >
                  <span className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${toneCls[n.tono]}`}>
                    {n.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium truncate">{n.titulo}</div>
                      {!leida && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.detalle}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {n.hace}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-border/60 p-2 text-center">
          <Link
            to="/dashboard"
            onClick={() => setOpen(false)}
            className="text-xs text-primary hover:underline"
          >
            Ver centro de actividad
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
