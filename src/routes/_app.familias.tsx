import { createFileRoute } from "@tanstack/react-router";
import { ninos } from "@/lib/demo-data";
import { Avatar } from "@/components/avatar";
import { MessageSquare, FileCheck2, Send, Bell } from "lucide-react";

export const Route = createFileRoute("/_app/familias")({
  head: () => ({ meta: [{ title: "Familias · CIE" }] }),
  component: Familias,
});

const mensajes = [
  { tutor: "Laura López", hijo: "Mateo G.", msg: "Buenas tardes Lic., Mateo está con un poco de tos. ¿Podemos pasar la sesión del jueves?", hora: "hace 12 min", leido: false },
  { tutor: "Carolina Mora", hijo: "Sofía A.", msg: "Adjunto colilla de mayo. Gracias!", hora: "hace 1 h", leido: false },
  { tutor: "Mariela Sandoval", hijo: "Liam S.", msg: "¿Cuándo es la próxima reunión de seguimiento?", hora: "hace 3 h", leido: true },
  { tutor: "Andrea Vargas", hijo: "Emma P.", msg: "Recibí el informe de evaluación, muchas gracias por la claridad.", hora: "ayer", leido: true },
];

function Familias() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="font-display text-3xl">Portal de familias</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Comunicación directa con padres, madres y tutores legales.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Familias activas" value={String(ninos.length)} />
        <Stat label="Mensajes sin leer" value="6" tone="primary" />
        <Stat label="Consentimientos pendientes" value="3" tone="warn" />
        <Stat label="Colillas INSS recibidas (mes)" value="34 / 38" />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Mensajes */}
        <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border/60">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg">Mensajes recientes</h2>
            </div>
            <button className="text-xs text-primary hover:underline">Bandeja completa</button>
          </div>
          <ul className="divide-y divide-border/60">
            {mensajes.map((m, i) => (
              <li key={i} className={`flex gap-4 p-4 hover:bg-muted/40 cursor-pointer ${!m.leido ? "bg-primary/[0.02]" : ""}`}>
                <Avatar nombre={m.tutor} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{m.tutor}</span>
                    <span className="text-xs text-muted-foreground">· madre de {m.hijo}</span>
                    {!m.leido && <span className="ml-auto h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{m.msg}</p>
                  <div className="text-[0.65rem] uppercase tracking-wider text-muted-foreground mt-1.5">{m.hora}</div>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-border/60 p-3 flex items-center gap-2">
            <input placeholder="Responder rápido…" className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm outline-none" />
            <button className="rounded-full bg-primary p-2 text-primary-foreground hover:opacity-90"><Send className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileCheck2 className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg">Consentimientos digitales</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Los formularios del manual CIE — consentimiento informado, contrato de servicios, autorización de imagen — firmados desde el celular del tutor.
            </p>
            <div className="space-y-2.5">
              {[
                { d: "Consentimiento — Emma Padilla", est: "pendiente firma" },
                { d: "Contrato servicios — Lucas Obregón", est: "pendiente firma" },
                { d: "Reglamento tutores — Camila Z.", est: "pendiente firma" },
              ].map((c) => (
                <div key={c.d} className="flex items-center justify-between text-sm rounded-lg bg-muted/60 px-3 py-2.5">
                  <span className="truncate">{c.d}</span>
                  <span className="text-xs text-[oklch(0.5_0.13_60)]">{c.est}</span>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full rounded-full bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:opacity-90">
              Enviar recordatorios
            </button>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg">Notificaciones programadas</h3>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Recordatorio sesión mañana</span>
                <span className="text-xs text-muted-foreground">18:00</span>
              </li>
              <li className="flex justify-between">
                <span>Solicitud colilla INSS (junio)</span>
                <span className="text-xs text-muted-foreground">05 jun</span>
              </li>
              <li className="flex justify-between">
                <span>Reporte mensual a familias</span>
                <span className="text-xs text-muted-foreground">30 jun</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "primary" | "warn" }) {
  const c = tone === "primary" ? "text-primary" : tone === "warn" ? "text-[oklch(0.55_0.13_60)]" : "";
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-display text-3xl mt-2 tabular ${c}`}>{value}</div>
    </div>
  );
}
