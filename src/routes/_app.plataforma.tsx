import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building, Download, X, History, AlertTriangle } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";
import {
  facturablePlataforma,
  organizaciones,
  resumenPlataforma,
  tarifaPlataforma,
  type EstadoOrg,
  type Organizacion,
} from "@/lib/tenants-data";
import { registrarEvento, descargarCSV } from "@/lib/auditoria";

export const Route = createFileRoute("/_app/plataforma")({
  head: () => ({
    meta: [
      { title: "Panel de plataforma · CIE" },
      { name: "description", content: "Administración multitenant: organizaciones, planes, estados y reporte mensual facturable de la plataforma." },
      { property: "og:title", content: "Panel de plataforma · CIE" },
      { property: "og:description", content: "Gestión de organizaciones clientes y facturación de plataforma." },
    ],
  }),
  component: Plataforma,
});

const estadoTono: Record<EstadoOrg, string> = {
  Activa: "bg-[oklch(0.94_0.05_155)] text-[oklch(0.36_0.11_155)]",
  Suspendida: "bg-[oklch(0.95_0.06_28)] text-[oklch(0.45_0.15_28)]",
  "En onboarding": "bg-[oklch(0.95_0.07_70)] text-[oklch(0.44_0.13_70)]",
  Cancelada: "bg-muted text-muted-foreground",
};

const fmt = (f: string) =>
  f === "—" ? f : new Date(f).toLocaleDateString("es-NI", { day: "numeric", month: "short", year: "numeric" });

function Plataforma() {
  const [sel, setSel] = useState<Organizacion | null>(null);
  const r = resumenPlataforma();

  const reportePDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
    doc.setFontSize(16);
    doc.text("Reporte mensual facturable de plataforma", 40, 48);
    doc.setFontSize(10);
    doc.text("Período: mayo 2026 · Corte 31/05/2026 · Moneda US$", 40, 66);

    let y = 100;
    doc.setFontSize(9);
    const cols = ["Organización", "País", "Plan", "Estado", "Sedes", "Niños", "Eventuales", "Base", "Variable", "Total"];
    const x = [40, 190, 260, 350, 440, 490, 545, 620, 680, 745];
    cols.forEach((c, i) => doc.text(c, x[i], y));
    doc.line(40, y + 6, 780, y + 6);
    y += 22;

    organizaciones.forEach((o) => {
      const f = facturablePlataforma(o);
      const vals = [
        o.nombre,
        o.pais,
        o.plan,
        o.estado,
        String(o.sedes),
        String(o.ninosActivos),
        String(o.serviciosEventuales),
        f.base.toFixed(2),
        (f.ninos + f.eventuales).toFixed(2),
        f.total.toFixed(2),
      ];
      vals.forEach((v, i) => doc.text(v, x[i], y));
      y += 18;
    });

    doc.line(40, y, 780, y);
    y += 18;
    doc.setFontSize(10);
    doc.text(`Total facturable de plataforma: US$ ${r.facturable.toFixed(2)}`, 40, y);
    y += 16;
    doc.setFontSize(8);
    doc.text(
      `Modelo: base por plan + US$ ${tarifaPlataforma.porNinoActivo.toFixed(2)} por niño activo + US$ ${tarifaPlataforma.porServicioEventual.toFixed(2)} por servicio eventual.`,
      40,
      y,
    );
    doc.save("reporte-facturable-plataforma-2026-05.pdf");

    registrarEvento({
      actor: "soporte@cietrack.app",
      rol: "Billing Admin",
      categoria: "plataforma",
      accion: "Generar reporte facturable",
      entidad: "Plataforma · mayo 2026",
      detalle: `Total US$ ${r.facturable.toFixed(2)} en ${organizaciones.length} organizaciones`,
    });
    toast.success("Reporte PDF generado");
  };

  const exportarCSV = () => {
    const rows = [
      ["Organización", "País", "Plan", "Estado", "Sedes", "Usuarios", "Niños activos", "Horas mes", "Eventuales", "Facturable US$"],
      ...organizaciones.map((o) => [
        o.nombre, o.pais, o.plan, o.estado, o.sedes, o.usuarios, o.ninosActivos, o.horasMes, o.serviciosEventuales,
        facturablePlataforma(o).total.toFixed(2),
      ]),
    ];
    descargarCSV(
      "plataforma-facturable-2026-05.csv",
      rows.map((r2) => r2.map((c) => `"${c}"`).join(",")).join("\n"),
    );
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building className="h-4 w-4" /> Plataforma
          </div>
          <h1 className="font-display text-3xl mt-1">Panel de organizaciones</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Vista exclusiva de Super Admin y Billing Admin: alta, planes, estados y reporte mensual facturable por
            organización cliente. Sin acceso a datos clínicos de los tenants.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={reportePDF}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Download className="h-4 w-4" /> Reporte facturable (PDF)
          </button>
          <button
            onClick={exportarCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-sm hover:bg-muted/60"
          >
            <Download className="h-4 w-4" /> CSV para ERP
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { l: "Organizaciones", v: r.organizaciones, s: `${r.activas} activas` },
          { l: "Sedes", v: r.sedes, s: "en la plataforma" },
          { l: "Niños activos", v: r.ninos, s: "consolidado" },
          { l: "Usuarios", v: r.usuarios, s: "cuentas" },
          { l: "Facturable mes", v: `US$ ${r.facturable.toFixed(0)}`, s: "mayo 2026" },
        ].map((k) => (
          <div key={k.l} className="rounded-xl border border-border/60 p-4">
            <div className="text-xs text-muted-foreground">{k.l}</div>
            <div className="font-display text-2xl mt-1">{k.v}</div>
            <div className="text-xs text-muted-foreground">{k.s}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Organización</th>
              <th className="text-left px-4 py-3 font-medium">Plan</th>
              <th className="text-left px-4 py-3 font-medium">Estado</th>
              <th className="text-right px-4 py-3 font-medium">Sedes</th>
              <th className="text-right px-4 py-3 font-medium">Niños</th>
              <th className="text-right px-4 py-3 font-medium">Horas mes</th>
              <th className="text-right px-4 py-3 font-medium">Facturable</th>
              <th className="text-left px-4 py-3 font-medium">Último corte</th>
            </tr>
          </thead>
          <tbody>
            {organizaciones.map((o) => (
              <tr
                key={o.id}
                onClick={() => setSel(o)}
                className="border-t border-border/50 cursor-pointer hover:bg-muted/40"
              >
                <td className="px-4 py-3">
                  <div>{o.nombre}</div>
                  <div className="text-xs text-muted-foreground">{o.pais}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{o.plan}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[0.7rem] ${estadoTono[o.estado]}`}>{o.estado}</span>
                </td>
                <td className="px-4 py-3 text-right">{o.sedes}</td>
                <td className="px-4 py-3 text-right">{o.ninosActivos}</td>
                <td className="px-4 py-3 text-right">{o.horasMes}</td>
                <td className="px-4 py-3 text-right font-medium">
                  US$ {facturablePlataforma(o).total.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{fmt(o.ultimoCorte)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sel && <DetalleOrg o={sel} onClose={() => setSel(null)} />}
    </div>
  );
}

function DetalleOrg({ o, onClose }: { o: Organizacion; onClose: () => void }) {
  const [estado, setEstado] = useState<EstadoOrg>(o.estado);
  const [motivo, setMotivo] = useState("");
  const f = facturablePlataforma(o);

  const cambiar = (nuevo: EstadoOrg) => {
    if (!motivo.trim()) {
      toast.error("Motivo obligatorio", { description: "Todo cambio de estado requiere justificación auditable." });
      return;
    }
    setEstado(nuevo);
    registrarEvento({
      actor: "soporte@cietrack.app",
      rol: "Super Admin",
      categoria: "plataforma",
      accion: "Cambiar estado de organización",
      entidad: o.nombre,
      detalle: `${estado} → ${nuevo}`,
      justificacion: motivo,
    });
    toast.success(`Organización ${nuevo.toLowerCase()}`);
    setMotivo("");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg overflow-y-auto bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl">{o.nombre}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {o.pais} · {o.plan} · alta {fmt(o.altaEl)}
            </p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs ${estadoTono[estado]}`}>{estado}</span>
          <span className="text-xs text-muted-foreground">
            {o.contacto} · {o.correo}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {[
            { l: "Sedes", v: o.sedes },
            { l: "Usuarios", v: o.usuarios },
            { l: "Niños activos", v: o.ninosActivos },
            { l: "Horas del mes", v: o.horasMes },
          ].map((k) => (
            <div key={k.l} className="rounded-lg border border-border/60 p-3">
              <div className="text-xs text-muted-foreground">{k.l}</div>
              <div className="font-display text-lg">{k.v}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-xl border border-border/60 p-4">
          <div className="text-sm font-medium">Desglose facturable (mayo 2026)</div>
          <table className="mt-2 w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 text-muted-foreground">Base del plan {o.plan}</td>
                <td className="py-1 text-right">US$ {f.base.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-1 text-muted-foreground">{o.ninosActivos} niños activos</td>
                <td className="py-1 text-right">US$ {f.ninos.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-1 text-muted-foreground">{o.serviciosEventuales} servicios eventuales</td>
                <td className="py-1 text-right">US$ {f.eventuales.toFixed(2)}</td>
              </tr>
              <tr className="border-t border-border/60">
                <td className="py-1.5 font-medium">Total</td>
                <td className="py-1.5 text-right font-medium">US$ {f.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          {estado !== "Activa" && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[oklch(0.45_0.15_28)]">
              <AlertTriangle className="h-3.5 w-3.5" /> Organización no activa: no genera facturación este período.
            </div>
          )}
        </div>

        <div className="mt-3 rounded-xl border border-border/60 p-4">
          <div className="text-sm font-medium">Cambiar estado</div>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo del cambio (obligatorio para auditoría)…"
            className="mt-2 w-full rounded-lg border border-border/60 p-2 text-sm outline-none focus:border-primary"
            rows={2}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {(["Activa", "Suspendida", "En onboarding", "Cancelada"] as EstadoOrg[])
              .filter((e) => e !== estado)
              .map((e) => (
                <button
                  key={e}
                  onClick={() => cambiar(e)}
                  className="rounded-lg border border-border/60 px-3 py-1.5 text-xs hover:bg-muted/60"
                >
                  {e}
                </button>
              ))}
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-border/60 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <History className="h-4 w-4 text-muted-foreground" /> Historial de la organización
          </div>
          <ul className="mt-2 space-y-2 text-sm">
            {o.historial.map((h, i) => (
              <li key={i} className="rounded-lg bg-muted/50 p-2.5">
                <div className="flex items-center justify-between">
                  <span>{h.cambio}</span>
                  <span className="text-xs text-muted-foreground">{fmt(h.fecha)}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {h.motivo} · {h.actor}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
