import { createFileRoute, Link } from "@tanstack/react-router";
import { lotesINSS } from "@/lib/demo-data";
import { loteDemo, resumenLote } from "@/lib/facturacion-inss";
import { AlertTriangle, Download, FileText, Plus, Receipt, TrendingUp, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_app/facturacion")({
  head: () => ({ meta: [{ title: "Facturación INSS · CIE" }] }),
  component: Facturacion,
});

const estadoStyle: Record<string, string> = {
  borrador: "bg-muted text-muted-foreground",
  enviado: "bg-[oklch(0.94_0.06_60)] text-[oklch(0.4_0.13_60)]",
  aprobado: "bg-[oklch(0.94_0.05_200)] text-[oklch(0.4_0.1_200)]",
  pagado: "bg-[oklch(0.94_0.05_155)] text-[oklch(0.4_0.1_155)]",
  rechazado: "bg-[oklch(0.94_0.06_25)] text-[oklch(0.45_0.15_25)]",
};

function Facturacion() {
  const totalAnual = lotesINSS.reduce((a, l) => a + l.monto, 0);
  const pagado = lotesINSS.filter((l) => l.estado === "pagado").reduce((a, l) => a + l.monto, 0);
  const porCobrar = totalAnual - pagado;
  const resumenLoteActual = resumenLote(loteDemo);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Facturación INSS</h1>
          <p className="text-sm text-muted-foreground mt-1">Lotes de cobro al Instituto Nicaragüense de Seguridad Social</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90">
          <Plus className="h-4 w-4" /> Nuevo lote
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={<Receipt className="h-4 w-4" />} label="Total facturado YTD" value={`$${totalAnual.toLocaleString()}`} />
        <Stat icon={<TrendingUp className="h-4 w-4 text-[oklch(0.55_0.1_155)]" />} label="Cobrado" value={`$${pagado.toLocaleString()}`} hint={`${Math.round(pagado / totalAnual * 100)}% del total`} />
        <Stat icon={<FileText className="h-4 w-4 text-[oklch(0.55_0.13_60)]" />} label="Por cobrar" value={`$${porCobrar.toLocaleString()}`} hint="2 lotes" />
        <Stat icon={<TrendingUp className="h-4 w-4" />} label="Tasa de aprobación INSS" value="96.4%" hint="últimos 12 meses" />
      </div>

      {/* Lote en curso destacado */}
      <Link
        to="/facturacion/$loteId"
        params={{ loteId: loteDemo.id }}
        className="block rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-5 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-primary font-medium">Quincena en curso · borrador</div>
            <h3 className="font-display text-2xl mt-1">{loteDemo.id} · {loteDemo.periodo} Q2</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Corte {loteDemo.fechaCorte} · sede {loteDemo.sede} · {resumenLoteActual.ninos} niños
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">A facturar INSS</div>
              <div className="font-display text-xl tabular">${resumenLoteActual.montoINSS.toLocaleString()}</div>
            </div>
            {resumenLoteActual.alertasExcedente > 0 && (
              <div className="flex items-center gap-2 rounded-full bg-[oklch(0.95_0.06_25)] text-[oklch(0.45_0.15_25)] px-3 py-1.5">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">{resumenLoteActual.alertasExcedente} excedente(s) sin constancia</span>
              </div>
            )}
            <ArrowRight className="h-5 w-5 text-primary" />
          </div>
        </div>
      </Link>

      {/* Process flow */}
      <div className="rounded-2xl border border-border/70 bg-card p-5">
        <h3 className="font-display text-lg mb-4">Flujo del cobro</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {["Asistencias", "Colilla INSS", "Lote generado", "Soportes adjuntos", "Envío INSS", "Aprobación", "Pago recibido"].map((p, i, arr) => (
            <div key={p} className="flex items-center gap-2 shrink-0">
              <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs border ${i < 5 ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground"}`}>
                <span className="font-medium tabular">{i + 1}</span>
                <span>{p}</span>
              </div>
              {i < arr.length - 1 && <span className="text-muted-foreground/40">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border/60">
          <h3 className="font-display text-lg">Lotes recientes</h3>
          <button className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <Download className="h-3.5 w-3.5" /> Exportar
          </button>
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border/60">
              <th className="text-left font-medium px-5 py-3">Lote</th>
              <th className="text-left font-medium px-5 py-3">Periodo</th>
              <th className="text-right font-medium px-5 py-3">Niños</th>
              <th className="text-right font-medium px-5 py-3">Horas</th>
              <th className="text-right font-medium px-5 py-3">Monto</th>
              <th className="text-left font-medium px-5 py-3">Fecha</th>
              <th className="text-left font-medium px-5 py-3">Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {lotesINSS.map((l) => (
              <tr key={l.id} className="hover:bg-muted/40">
                <td className="px-5 py-3 font-medium tabular">{l.id}</td>
                <td className="px-5 py-3">{l.periodo}</td>
                <td className="px-5 py-3 text-right tabular text-muted-foreground">{l.ninos}</td>
                <td className="px-5 py-3 text-right tabular text-muted-foreground">{l.horas}</td>
                <td className="px-5 py-3 text-right tabular font-display text-base">${l.monto.toLocaleString()}</td>
                <td className="px-5 py-3 text-muted-foreground text-xs">{l.fecha}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoStyle[l.estado]}`}>{l.estado}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button className="text-primary text-xs hover:underline">Abrir →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="font-display text-3xl mt-2 tabular">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}
