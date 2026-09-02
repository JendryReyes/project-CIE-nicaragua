import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Mail, MessageSquare, Send, UserCheck, Clock, ExternalLink } from "lucide-react";
import { ninos } from "@/lib/demo-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/familias")({
  head: () => ({ meta: [{ title: "Familias · CIE" }] }),
  component: Familias,
});

type EstadoPortal = "activo" | "invitado" | "sin_acceso";

const familiasDemo = ninos.slice(0, 10).map((n, i) => ({
  ninoId: n.id,
  nombre: n.tutor,
  ninoNombre: n.nombre,
  email: `${n.tutor.toLowerCase().replace(/\s/g, ".")}@correo.com`,
  estado: (["activo", "activo", "invitado", "activo", "sin_acceso", "activo", "invitado", "activo", "activo", "sin_acceso"][i] as EstadoPortal),
  firmasPendientes: [1, 0, 2, 0, 0, 1, 0, 0, 1, 0][i],
  ultimoAcceso: ["Hace 1 día", "Hace 3 horas", "Pendiente", "Ayer", "—", "Hoy", "Pendiente", "Hace 2 días", "Hoy", "—"][i],
}));

function Familias() {
  const [filtro, setFiltro] = useState<string>("todos");
  const lista = familiasDemo.filter((f) => filtro === "todos" || f.estado === filtro);

  return (
    <div className="space-y-6 max-w-[1300px]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Familias</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestión del portal de familias y firmas digitales</p>
        </div>
        <Link to="/mi-hijo" target="_blank" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">
          <ExternalLink className="h-4 w-4" /> Vista de familia (demo)
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Total familias" value={String(familiasDemo.length)} icon={<Heart className="h-4 w-4 text-primary" />} />
        <KPI label="Portal activo" value={String(familiasDemo.filter((f) => f.estado === "activo").length)} />
        <KPI label="Invitaciones enviadas" value={String(familiasDemo.filter((f) => f.estado === "invitado").length)} />
        <KPI label="Firmas pendientes" value={String(familiasDemo.reduce((s, f) => s + f.firmasPendientes, 0))} highlight />
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-3 flex gap-2 flex-wrap text-sm">
        {["todos", "activo", "invitado", "sin_acceso"].map((f) => (
          <button key={f} onClick={() => setFiltro(f)} className={`text-xs rounded-full px-3 py-1 border ${filtro === f ? "bg-primary text-primary-foreground border-primary" : "border-border/70 hover:bg-muted"}`}>
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left">Familia</th>
              <th className="text-left">Niño</th>
              <th className="text-left">Email</th>
              <th className="text-center">Portal</th>
              <th className="text-center">Firmas pendientes</th>
              <th className="text-left pl-3">Último acceso</th>
              <th className="text-right pr-4">Acción</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((f) => (
              <tr key={f.ninoId} className="border-t border-border/40 hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{f.nombre}</td>
                <td className="text-muted-foreground">{f.ninoNombre}</td>
                <td className="text-xs text-muted-foreground">{f.email}</td>
                <td className="text-center"><EstadoBadge e={f.estado} /></td>
                <td className="text-center">
                  {f.firmasPendientes > 0
                    ? <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.94_0.053_80)] text-[oklch(0.4_0.114_80)] px-2 py-0.5 text-[10px] font-medium tabular">{f.firmasPendientes} pendiente{f.firmasPendientes > 1 ? "s" : ""}</span>
                    : <span className="text-xs text-muted-foreground">—</span>}
                </td>
                <td className="pl-3 text-xs text-muted-foreground flex items-center gap-1 pt-3"><Clock className="h-3 w-3" /> {f.ultimoAcceso}</td>
                <td className="pr-4 text-right">
                  {f.estado === "activo"
                    ? <button onClick={() => toast.success(`Mensaje enviado a ${f.nombre}`)} className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><MessageSquare className="h-3 w-3" /> Mensaje</button>
                    : <button onClick={() => toast.success(`Invitación enviada a ${f.email}`)} className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><Send className="h-3 w-3" /> Invitar</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPI({ label, value, icon, highlight }: { label: string; value: string; icon?: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? "border-[oklch(0.7_0.114_80/0.4)] bg-[oklch(0.97_0.044_80)]" : "border-border/70 bg-card"}`}>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>{label}</span>{icon}
      </div>
      <div className="font-display text-2xl mt-1 tabular">{value}</div>
    </div>
  );
}

function EstadoBadge({ e }: { e: EstadoPortal }) {
  const map = {
    activo: ["bg-[oklch(0.94_0.044_160)] text-[oklch(0.35_0.106_160)]", "Activo"],
    invitado: ["bg-[oklch(0.94_0.053_80)] text-[oklch(0.4_0.114_80)]", "Invitado"],
    sin_acceso: ["bg-muted text-muted-foreground", "Sin acceso"],
  } as const;
  const [cls, lbl] = map[e];
  return <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${cls}`}>{lbl}</span>;
}
